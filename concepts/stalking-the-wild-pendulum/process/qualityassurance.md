# Quality Assurance — Chapter 2 (`chp2.html`)

A record of the QA reasoning, methodology, findings, and fixes applied to
*"A Look Through a Supermicroscope"* (Chapter 2) ahead of publication.

---

## 1. Methodology — how the visuals were checked

The chapter is a single self-contained HTML file: a Three.js (r128, via CDN) scene
graph with 8 "concepts," each a `build(g)` that creates geometry plus an `update(dt,t)`
animation loop. There is no test suite, so QA was done by **headless render + code review**,
not by eyeballing assertions.

**Headless renderer (`render.mjs`):** a pure-Node Chrome DevTools-Protocol screenshotter.

```
node render.mjs <SRC> <CONCEPT_IDX> <REACH> <OUT.png> [WAIT_MS]
```

- Spawns headless Chrome (`--headless=new --use-gl=swiftshader`) + a local `python3 -m http.server`.
- Rewrites the page on the fly: `loadConcept(0)` → `loadConcept(IDX)`, `auto:true` → `auto:false`
  (freeze the camera), and `applyReach(0)` → `applyReach(REACH)` when a reach stop is given.
- **Injects an error trap** before navigation:
  `window.addEventListener("error", e => window.__errs += …)`, then reads `window.__errs`
  back after the wait. This is the single most important check — it surfaces uncaught
  runtime/syntax errors that a static screenshot would otherwise hide.
- Prints `RENDER OK <bytes>` and, if any, `PAGE ERRORS: <message>`.

**Key constraints learned while running it:**
- Renders **cannot run in parallel** — Chrome (`:9333`) and the static server (`:8783`) use
  fixed ports, so concurrent invocations collide (observed as `exit code 13`). Always run
  sequentially, with a `sleep 1–2` between invocations so the previous Chrome fully exits.
- The CDN load (three.js) eats into the wait window, so `bbT`/animation phase at screenshot
  time is **not** precisely `WAIT_MS`. To judge a time-varying animation, render **several**
  `WAIT_MS` values and read the progression, never a single frame.
- For animations that reset on a condition (e.g. the Big-Bang cycle keys off `D.visible`),
  pass the reach arg so the relevant group is actually visible when the timer advances.

**Process:** render all 8 sections → grep output for `error`/`fail`/`PAGE ERRORS` → read the
full source top-to-bottom for logic bugs and dead code → view each screenshot for visual
defects and palette consistency → apply fixes → **re-render every edited section** to confirm
the fix and catch regressions.

---

## 2. Baseline result

All 8 sections rendered with **no runtime errors** before any edits:

| # | Section | Verdict |
|---|---------|---------|
| 0 | The Supermicroscope | OK — arm → fibres → helix → lattice → atom → vacuum → fields |
| 1 | The Hollow Atom | OK — gold nucleus, orbiting electron, scale readout |
| 2 | Piezoelectric Bone | OK — cyan lattice + bonds, field arrows |
| 3 | The Web of Fields | OK runtime; **palette off-brand** (see §4) |
| 4 | Earth–Ionosphere | OK — blue-marble Earth, ionosphere shell, field lines |
| 5 | The Stiff Jelly | OK runtime; **container barely visible** (see §4) |
| 6 | Planetary Resonance | OK — wave wrapping Earth, meditators |
| 7 | A Theological Perspective | OK — Kaaba/Tawaf → Earth → Cosmos → 4-D hypercube |

---

## 3. Code-hygiene findings (dead code — no behavior change, cleaned for publishing)

1. **Hollow Atom `refresh()`** — a `ratioOut.textContent = …` line immediately overwritten by
   the next line. Removed the dead assignment.
2. **Earth–Ionosphere `refresh()`** — same pattern: a `vOut` voltage line overwritten on the
   next line. Collapsed to one clean line (`(alt*200).toLocaleString()+' V'`, i.e. 200 V/m × altitude).
3. **Planetary Resonance `update()`** — a leftover wave loop (including no-op `… * 0.0` lines)
   that was fully recomputed by the loop right after it: ~240 wasted iterations every frame.
   Removed the dead loop, kept the single correct one.

These were verified as truly inert: the surviving code paths are byte-identical to what
previously ran last, so output is unchanged (re-render of §6 confirmed visually identical).

---

## 4. Aesthetic improvements

- **Web of Fields (3) — palette consistency.** Node color was `setHSL(0.45 + phase·0.5, …)`,
  which sweeps the full hue wheel into magenta/pink/red — clashing with the chapter's strict
  cyan/gold/ink palette. Remapped phase onto a **cyan↔gold blend**
  (`cCool.lerp(cWarm, 0.5+0.5·cos(phase))`), so it stays on-brand *and* still encodes coherence:
  synced nodes share a hue, off-key ones split. Confirmed: teal/gold, no pink.

- **The Stiff Jelly (5) — legibility of the container.** The jelly box edges (opacity .3) and
  medium specks (opacity .35, size .04) were so faint the raisins looked like they floated in
  empty space, losing the whole "raisins coupled in stiff jelly" metaphor. Bumped edges to .45
  and specks to opacity .5 / size .05. Confirmed: the jelly volume now reads, raisins clearly inside it.

---

## 5. The bug that justified the methodology

While adding the Big-Bang color palette to the theological section, I introduced
`const BB_HOT = …, COOL = …`. The render trap immediately reported:

```
PAGE ERRORS: Uncaught SyntaxError: Identifier 'COOL' has already been declared
```

`COOL` already existed **in the same `build()` closure** — it's the Tawaf crowd's speed-tint
constant (`const CREAM, WARM, COOL` in Tableau A). A duplicate `const` in the same scope is a
**syntax error that blanks the entire page**, not just that section. Renamed to `BB_HOT`/`BB_COOL`
and re-verified. This is exactly the class of failure a screenshot-only check would miss
(a blank canvas looks like "still loading"), and the reason every render parses `window.__errs`.

**Lesson:** when adding identifiers to a large `build()` closure, scan for name collisions with
existing locals (palette constants, helpers) — these scenes pack many short-named consts into one scope.

---

## 6. Theological section — the 4-D hypercube (design reasoning)

This section accreted the most iteration; the reasoning is worth preserving because the
visualization makes a deliberate, defensible trade between geometric truth and intuition.

**Geometry corrected up front (the conceptual QA):**
- "4-D = a cube within a cube" is the *2-D/3-D shadow* of a tesseract, not the object. In the
  real tesseract the inner and outer cubes are **equal in size**, **neither contains the other**,
  and they are 2 of the **8 cubic cells** (a cube has 6 square faces; a tesseract has 8 cube cells).
- The fourth dimension is **a direction perpendicular to all three we know**, not "a bigger box
  around our box."
- The existing `build()` already generated a *mathematically correct* tesseract (16 vertices,
  32 edges by Hamming-distance-1), rotating in the X-W and Y-W planes and perspective-projecting
  with `k = 2/(3 − w)`. The "inner cube turning inside-out through the outer" is the genuine
  tesseract motion, and it is the visual that carries the chapter's "two cells of one form" thesis.

**Chosen framing — "one object, shadowed":** our cosmos and the beyond are cells of one higher
form; the nesting is only our 3-D shadow. Geometrically honest *and* it lands the chapter's
"one field couples us all."

**Implementation decisions (in order they were made):**
1. Filled the two headline cells (`w=−1` cosmos, `w=+1` beyond) as translucent glass skinned
   onto the projected vertices; the 4-D turn makes them trade places (inside↔outside).
2. Added a galaxy of points *inside* the cosmos cell, generated as 4-D points on the `w=−1`
   cell so they ride the same rotation/projection and turn inside-out with the cube.
3. **Honesty note recorded:** you cannot truthfully show galaxies + stars + solar systems in one
   box — at the zoom where many galaxies fit, individual stars are sub-pixel. So the "miniature
   universe" is a **galaxy field** (resolved spiral galaxies: warm cores, spiral arms, random
   orientation) along a cosmic web of faint field galaxies — which is also what the real
   large-scale universe looks like.
4. **Big-Bang cycle** added per request: born from one bright point (flash at the bang),
   galaxies igniting in turn as the field expands to fill the cube, then crunching back and
   re-banging. Drives off a local `bbT` that only advances while `D.visible`, so **each arrival
   at the Beyond stop is born from a fresh singularity** (the guided tour always shows birth-from-zero).
   - Expansion envelope `E(u)`: fast burst (`u<0.16`) → bright hold (`u<0.80`) → crunch.
     Period `BB_PERIOD = 15 s`. Per-star `hatch` gates each star in after its own birth fraction.
   - Each star's local `(x,y,z)` is scaled by `f = E·hatch` *before* the 4-D projection, so at
     `f=0` all points collapse to the cell center = the singularity (a bright additive point).
5. **Color variety:** an 8-entry `GAL_COLORS` palette (teal, blue, violet, rose, gold, amber,
   green, ice-blue), stepped around the wheel (`(gi*5+3) % 8`) so neighbors differ, with
   per-galaxy jitter. Cores keep most of their hue (`tc*0.78 + 0.22`) instead of washing to white
   under additive blending — the original "all one color" complaint was caused by a near-white
   floor (`0.7 + 0.3·tint`) plus pure-white "bright" stars.
6. **Removed the gold "beyond" cell entirely** (it read as a purposeless orange box). Our
   universe is now the **one filled (cyan) cell**; the rest of the hypercube stays bare
   wireframe and reads as the beyond — cleaner and conceptually tighter.

**Additive-blending caveat (worth remembering):** dense, overlapping points summed under
`THREE.AdditiveBlending` trend toward white and desaturate. To keep galaxies visibly colored:
use saturated base hues, avoid a high white floor, keep pure-white stars rare, and let arms
(sparse) carry the hue while only the very core brightens.

---

## 7. Physics / factual check (text vs. visuals)

Spot-checked against Bentov's text; the quantitative claims hold:
- Hollow atom 1 : 10,000 nucleus-to-orbit ratio; ~200 V/m Earth–ionosphere gradient
  (≈400 V head-to-foot over ~2 m); ~7.5 Hz cavity resonance with ~40,000 km wavelength.
- The Big-Bang treatment is an **acknowledged visual metaphor**, not literal cosmology
  (the real Big Bang is not an explosion into pre-existing space; a cyclic crunch is speculative).
  This is fine because the whole tableau is explicitly an illustration, but it should not be
  presented as physics.

---

## 8. Tuning dials (for future edits)

- **Explosion speed:** the `0.16` in the `E` envelope (smaller = snappier); cycle length `BB_PERIOD`.
- **Galaxy colors:** the `GAL_COLORS` array; core-vs-hue balance is the `*0.78 + 0.22` on the core line.
- **Galaxy count / density:** `NGAL`, and `nd = 120 + …` (stars per galaxy).
- **Cosmos-cell glass:** `cosmosCell.material.userData.op0`.
- **Web of Fields palette:** `cCool` / `cWarm`.
- **Stiff Jelly legibility:** box-edge and points-material `opacity`/`size`.

---

## 9. Status

All 8 sections render error-free after every change. Edits made: 3 dead-code cleanups,
2 palette/legibility improvements, and the theological-section work (Big-Bang cycle, color
variety, removal of the gold cell). The file is publish-ready.
