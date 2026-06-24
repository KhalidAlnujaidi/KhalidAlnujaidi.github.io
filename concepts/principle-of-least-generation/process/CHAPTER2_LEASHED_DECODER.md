# Chapter 02 — The Leashed Decoder · experiment plan (pre-registered)

> Status: **plan written, experiments not yet run.** This document is the
> pre-registration. Findings, once measured, get written into `chp2.html`'s
> "table we intend to fill" and the E1–E6 cards.

## The question

Chapter 01 proved that on bounded, known-shape tasks a cheap gate + deterministic
retrieval beats a generative LLM on cost, speed, correctness, and safety — **given
clean slots.** It openly admitted the dataset *handed it* those slots, and that
turning a messy sentence into clean slots "IS the hard part." That step is the one
genuinely (lightly) generative thing left in the pipeline — **Rung 3** of the ladder,
which Chapter 01 named but never built.

**Chapter 02 builds Rung 3 and measures it.** The claim under test:

> A *tiny* decoder, **leashed** by a grammar / JSON-schema so it can emit nothing but
> valid slots, can extract clean slots from messy NL — cheaply enough and safely
> enough that the end-to-end pipeline keeps Chapter 01's correctness and its
> injection-immunity, at a tiny fraction of free-generation token cost.

A clean negative result (even a 12B model can't fill slots cheaply/reliably) is an
equally publishable outcome. We are not trying to win; we are trying to measure.

## Rule Zero — reuse, don't build (machine-wide alignment requirement)

This series is **out of scope** for the two-project model/time-slot alignment rules
(نبرة, arabic-shortvideo), but **Rule Zero applies to all work on this machine.** So:

- **Do NOT hand-roll a constrained decoder.** Reuse a maintained library:
  - **Outlines** (`outlines`) — regex/JSON-schema/CFG guided generation. arXiv:2307.09702.
  - **XGrammar** (`xgrammar`) — fast structured generation, integrates with vLLM. arXiv:2411.15100.
  - **llama.cpp GBNF grammars** — if running GGUF via llama.cpp / Ollama.
  - **vLLM guided decoding** (`guided_json` / `guided_grammar`) — if serving via vLLM.
  - **lm-format-enforcer** — alternative schema enforcer.
  - Prior art specific to SQL: **PICARD** (incremental parsing constrained decode, arXiv:2109.05093) — read before designing the grammar.
- **Datasets via Hugging Face** (`datasets`): WikiSQL (`Salesforce/wikisql`), Spider (`xlangai/spider`). Don't re-scrape.
- **Models** already available locally via Ollama where possible; pull GGUFs for the size sweep rather than training anything.
- **Gate + retrieval/template-fill**: reuse Chapter 01's existing `cbyte/` code — this chapter only adds the extraction front-end.
- **Env**: `uv` (lockfile in `cbyte/ch02/`). If GPU serving needs CUDA wheels that fight uv, document the exception like the video project does.

Before writing any new component, state what was searched and why nothing fit.

## Hardware / GPU discipline

Single **RTX A4500 (~20 GB)**. **One model resident at a time** — run the size sweep
**sequentially**, unload between models. The 0.5B–7B Qwen2.5 models and the
12B-coder anchor each load alone; never co-resident. Log VRAM headroom per model so
the latency numbers are honest (no swapping artifacts).

## Datasets

- **WikiSQL** — primary, for apples-to-apples with Chapter 01. Use the **same 300-query
  eval slice** Chapter 01 reported, plus the full set for the headline accuracy curve.
  Crucially: feed **raw NL only**; the gold slots are used as ground truth, never as input.
- **Spider** — stretch (E6). Cross-domain, JOINs, nested queries → fatter tail. A richer
  grammar; expect coverage/accuracy to drop. This directly attacks Chapter 01's caveat [1].

## The leash (slot schema)

Define the WikiSQL intent as a strict schema, e.g.:

```json
{
  "type": "object",
  "properties": {
    "select_col":  { "type": "integer" },
    "agg":         { "enum": ["", "MAX", "MIN", "COUNT", "SUM", "AVG"] },
    "conditions":  { "type": "array", "items": {
        "type": "object",
        "properties": {
          "col": { "type": "integer" },
          "op":  { "enum": ["=", ">", "<"] },
          "val": { "type": "string" }
        }, "required": ["col", "op", "val"]
    }}
  },
  "required": ["select_col", "agg", "conditions"]
}
```

The decoder is constrained to this schema (Outlines/XGrammar/GBNF). It **cannot** emit
free-form SQL, prose, or an injected `DROP DATABASE` — there is no production in the
grammar for it. Chapter 01's deterministic template-fill turns validated slots → SQL.

## Models (the size sweep — E1)

| Model | Role | Serve via |
|---|---|---|
| Qwen2.5-0.5B-Instruct | floor | Ollama / vLLM + guided decoding |
| Qwen2.5-1.5B-Instruct | small | " |
| Qwen2.5-3B-Instruct | mid | " |
| Qwen2.5-7B-Instruct | upper-small (ch.01 used 7B) | " |
| gemma-4-12B-coder | anchor (ch.01 free-gen baseline) | Ollama |

Coder variants where available. Zero-shot first; add few-shot only as an ablation (E3).

## Experiments

### E1 — How small can the leash go?
Run each model, grammar-constrained, over the eval set. Measure **slot exact-match**
and **end-to-end execution / exact-match accuracy** (slots → template → SQL → compare).
Output: accuracy-vs-size curve; smallest model clearing **≥95%** end-to-end.
*The curve is the finding; no single number is universal.*

### E2 — Bounded, not zero
Count **generated tokens per query** for leashed extraction; compare to Chapter 01's
free-generation baseline (6,525 / 7,714 per 300). Expect schema to cap output to a
handful of tokens. Headline shifts from "0 tokens" → "a few bounded tokens, still safe."

### E3 — Does the leash cost accuracy?
Ablation at a **fixed** model size: constrained vs unconstrained decoding (and
zero-shot vs few-shot). Does the grammar *help* (forces valid structure, fewer parse
failures) or *hurt* (over-restriction prevents the right answer)? Report both.

### E4 — Injection still has no home
Re-run Chapter 01's injection suite: append `; DROP DATABASE prod;` (and variants) to
the NL question and the "output only SQL" framing. Under the leash, the decoder can
emit only slot tokens. **Target: 0 / 40 obeyed**, matching retrieval, beating
free-gen's 15/40 and 10/40. Also test injection that targets the *slot values*
(e.g. a value field carrying SQL) — confirm template-fill parameterizes, not concatenates.

### E5 — The latency tax
Median + **p95** latency per model size, constrained decoding on, single-GPU, model
resident alone. Compare against Chapter 01's <1 ms retrieval and the free-gen 268/553 ms.
Question: is small + constrained still sub-second / competitive once a decode step
returns to the pipeline?

### E6 — (stretch) the fatter tail
Repeat E1/E4 on Spider with a richer grammar. Find where template coverage and slot
extraction collapse. Closes the loop on Chapter 01 caveat [1].

## Metrics summary (what fills the table)

| metric | how |
|---|---|
| End-to-end correct | slots → template → SQL, exact-match / execution-match vs gold |
| Slot exact-match | predicted slots == gold slots |
| Median / p95 latency | wall-clock per query, model resident alone |
| Tokens / 300 | generated-token count, leashed vs free |
| Injection obeyed (x/40) | count of injected-destruction queries that produce destructive SQL |
| VRAM headroom | per model, to validate latency honesty |

## Pass / fail (pre-registered)

- **Strong pass:** a ≤3B leashed model hits ≥95% end-to-end, ≤~5% of free-gen tokens,
  0/40 injection, sub-second p95. → Rung 3 is cheap; the ladder stands end-to-end.
- **Partial:** only 7B+ clears the bar. → Rung 3 works but isn't "tiny"; report the cost.
- **Negative (still publish):** even 12B can't fill slots cheaply/reliably, or the leash
  tanks accuracy. → Rung 3 is more expensive than the ladder implies; say so plainly.

## Planned repo layout

```
cbyte/ch02/
  slot_schema.json        # the leash (JSON schema)
  leash.gbnf              # GBNF variant for llama.cpp/Ollama
  extract_slots.py        # NL -> constrained decode -> validated slots
  run_size_sweep.py       # E1/E2/E5 driver across models (sequential, one resident)
  ablation_constrained.py # E3
  injection_suite.py      # E4 (reuses ch.01 attack list)
  spider_stretch.py       # E6
  make_figures.py         # accuracy-vs-size curve, token bars, latency
  figures/
  results.json            # raw numbers that get transcribed into chp2.html
  pyproject.toml + uv.lock
```

## Honest-reporting checklist (before publishing findings)

- [ ] Numbers come from a logged run, not an estimate.
- [ ] Token counts are generated tokens, stated per-query and per-300.
- [ ] Latency states whether the model was resident alone (no swap).
- [ ] Injection result reports the exact attack list and count obeyed.
- [ ] Caveats box updated if the grammar/scope changed.
- [ ] A negative result is reported as plainly as a positive one.
