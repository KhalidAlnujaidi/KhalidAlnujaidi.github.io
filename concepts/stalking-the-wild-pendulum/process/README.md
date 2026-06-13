# Stalking the Wild Pendulum — Production Kit

This folder is the **durable memory** of how a chapter of Itzhak Bentov's
*Stalking the Wild Pendulum* becomes an interactive 3-D page **and** a finished,
narrated video. Read this first; it's the index and the step-by-step. The other
files are the deep references it points to.

> **The whole idea:** one reusable engine (palette, nav, control panel, guided
> tour, verification harness) lives inside every `chpN.html`. A new chapter is
> *content poured through that engine* — read the chapter, name 5–8 visual
> concepts, write their `build()` functions, add a personal ★ reflection, record
> a narrated tour, publish. Engineering is already done.

---

## The two pipelines

A chapter ships in two halves. Do them in order.

### A. Build the interactive page  → `chpN.html`
The engine, conventions, and the concept-authoring recipe.
**Authoritative reference: [`PROJECT_FRAMEWORK.md`](PROJECT_FRAMEWORK.md)** (the reusable
contract) — read §5 (engine), §9 (the new-chapter recipe + boilerplate), §7 (verify).
[`CHAPTER2_PROCESS_LOG.md`](CHAPTER2_PROCESS_LOG.md) is the per-iteration narrative
(every feedback→fix, so the same bugs never recur), and
[`qualityassurance.md`](qualityassurance.md) is the pre-publish QA pass for Chapter 2.

### B. Narrate & record  → a finished video
Turn the page into a synced, narrated tour and capture it flawlessly.
**Authoritative reference: [`publish.md`](publish.md)** (recording walkthrough).
The scripts and assets here (`gen_narration.py`, `narration.*`, `render.mjs`) are
the tools for this half.

---

## Make Chapter 3 — the checklist

**0. Scaffold.** Copy the latest chapter (`chp2.html`) → `chp3.html`. Update the
kicker / `<h1>` / "Ch. N" / title. Empty the `CONCEPTS.push(...)` blocks but keep
**all** engine code (palette, nav, control builders, crossfade helpers, tour, the
★ reflection support). You now have a working, empty chapter.

**1. Read the source.** Read the chapter text + Bentov's figures. List the **5–8
core ideas** that are inherently spatial/dynamic. Ground visuals in the real
diagrams, not invention.

**2. Spec each concept** in one line — `{title, dim, the interaction, the controls}` —
and decide which existing pattern it reuses (scale-dive, coupled oscillators,
procedural sphere, resonance rings, crossfaded tableaux…).

**3. Implement** each with the boilerplate in `PROJECT_FRAMEWORK.md` §9, using
**only** the control builders (`ctlSlider`/`ctlChips`/`ctlButton`) and the
crossfade discipline (`regOpacity`/`setOpacity`, animate `material.userData.op0`).
Reuse, don't reinvent.

**4. ★ reflection.** Add the chapter's personal coda (`star:true` + `reflection`)
in the author's own voice — see `PROJECT_FRAMEWORK.md` §5.4.

**5. Verify every concept** (this is non-negotiable — evidence before "done"):
```bash
node --check  # the inline IIFE
node render.mjs chp3.html <conceptIdx> "<reachOrEmpty>" /tmp/out.png [waitMs]
```
A non-trivial PNG byte size **and** a clean console (no `not defined`/WebGL errors)
are both required. Renders run **sequentially** (fixed ports), `sleep 1–2` between.
Why this harness and not `--screenshot`: see `publish.md`/`qualityassurance.md` §1.

**6. Write the narration.** Edit `narration.txt`: one **beat per paragraph**,
separated by a blank line, in tour order. Beat 0 is the intro; the beat that plays
during an auto-animation (the scale-dive, the ★ ascent) must be long enough to
cover it — `gen_narration.py` prints those windows so you can check.

**7. Generate the voiceover** (needs an ElevenLabs key — see below):
```bash
export ELEVENLABS_API_KEY=sk_...
python3 gen_narration.py chp3.html
```
This writes `narration.mp3` + `narration-cues.json` and **bakes the real beat
timings** into `chp3.html` (`TOUR_CUES`), so the tour syncs visuals to the voice.
Put `narration.mp3` in the **same folder as `chp3.html`** — the page loads it by
relative path.

**8. Record** the narrated tour to one synced file — follow `publish.md`:
start a local server, open `chp3.html?record`, fullscreen, click **▶ Guided tour**.
It records the **canvas + audio** into one file (no cursor, no UI chrome, no merge
step) and auto-downloads when the narration ends (+ a ~3 s visual tail).

**9. Publish.** Upload the video to YouTube (it's too large for the repo). Drop
`chp3.html` + `narration.mp3` into `concepts/stalking-the-wild-pendulum/`, add it to
the series landing `index.html`, and add a homepage link. Append this chapter's
feedback→fixes to a `CHAPTER3_PROCESS_LOG.md`.

---

## Identity (must match every chapter)

Palette: `--bg:#070a14` · `--ink:#ece6d6` · `--muted:#7d879c` · `--cyan:#4fe6cd` ·
`--cyan-dim:#2c8a7d` · `--gold:#e7b257`. In Three.js: `COL_CYAN=0x4fe6cd`,
`COL_GOLD=0xe7b257`, `COL_INK=0xece6d6`. Fonts: **Cormorant Garamond** (serif
titles) + **IBM Plex Mono** (everything else). Aesthetic: calm, dark, reverent —
"ink-and-gold observatory." Single self-contained `.html`, Three.js from CDN only,
procedural textures (no image files), motion eased and tuned for comprehension.

---

## The secret (never commit it)

`gen_narration.py` reads the ElevenLabs API key from the `ELEVENLABS_API_KEY`
environment variable (preferred) or a local, **gitignored** `11lab.txt`. The key is
**never** written into any HTML or committed file — only the resulting
`narration.mp3` is. If the key was ever shared in plaintext, **rotate it**.

---

## Files in this kit

| File | What it is |
|---|---|
| `README.md` | **This file** — index + the make-a-chapter checklist |
| `PROJECT_FRAMEWORK.md` | The reusable engine, standards, and new-chapter recipe |
| `CHAPTER2_PROCESS_LOG.md` | Chapter-2 build narrative (every feedback→fix) |
| `qualityassurance.md` | Chapter-2 pre-publish QA pass + the render harness in detail |
| `publish.md` | How to record the narrated tour into one synced video |
| `gen_narration.py` | Script → ElevenLabs voiceover + baked `TOUR_CUES` |
| `narration.txt` | Chapter-2 narration script (beats = paragraphs) |
| `narration.srt` | Chapter-2 subtitles |
| `narration-cues.json` | Chapter-2 beat start times (seconds) |
| `render.mjs` | Node CDP headless screenshotter — the verification harness |

*The engine is the asset. Each new chapter is content poured through it.*
