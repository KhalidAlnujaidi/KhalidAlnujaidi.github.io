# Stalking the Wild Pendulum — Chapter 2 Interactive Build
### Process log, achievements & code standards

> An export of the work done to turn Chapter 2 ("A Look Through a Supermicroscope"
> from Itzhak Bentov's *Stalking the Wild Pendulum*) into an interactive,
> visual, conceptual experience — mirroring the format established for Chapter 1.

---

## 1. The goal

Reproduce, for Chapter 2, **exactly** the interactive format already built for
Chapter 1 (`chp1.html`): a single self-contained HTML page that visualizes and
makes the chapter's ideas *interactive* so the concepts can be comprehended more
deeply. `chp1.html` is the **reference standard** — every convention below was
read out of it and applied to `chp2.html`.

**Deliverable:** `chp2.html` — one file, no build step, opens in any browser.

---

## 2. What we did (chronological)

1. **Studied the reference.** Read `chp1.html` to extract its scaffold, palette,
   fonts, navigation, control-panel pattern, and guided tour. Confirmed the
   reference file is mirrored into the `stalking-the-wild-pendulum/` subfolder.
2. **Studied the source.** Read Chapter 2's text and Bentov's original figures so
   the visualizations are grounded in the actual diagrams, not invented.
3. **Built `chp2.html`** with **7 interactive concepts** drawn from the chapter:
   1. **The Supermicroscope** (×10⁹) — drag magnification to descend through
      tissue → muscle fibres → coiled molecule → crystal lattice → atom →
      vacuum → oscillating fields.
   2. **The Hollow Atom** (1 : 10,000) — inflate the nucleus to feel the void.
   3. **Piezoelectric Bone** (PIEZO) — an electric field flexes the crystal lattice.
   4. **The Web of Fields** (COUPLED) — coupled oscillators; perturb & re-tune.
   5. **Earth–Ionosphere** (200 V/m) — the planetary capacitor, altitude sensor.
   6. **The Stiff Jelly** (COUPLING) — poke one node, the whole field transmits.
   7. **Planetary Resonance** (7 Hz) — the tuned body/cavity system; entrainment.
4. **Verified rendering** headlessly (see §5).

### Iteration log (feedback → fix)

| # | Feedback | What changed |
|---|----------|--------------|
| 1 | Flying 3D labels rendered **black** / invisible | `makeLabel` passed a numeric hex (`0xe7b257`) straight to canvas `fillStyle`, which only accepts CSS **strings** — the invalid assignment silently fell back to `#000000`. Fixed by converting the number to `#rrggbb`. Now every label paints in its intended cyan/gold/blue. |
| 2 | Opening "tissue" didn't look like tissue; muscle-fibre stage looked clunky | Stage 0 became a **flexed arm/bicep** you fly *into*; stage 1 became a proper **striated fascicle** (hex-packed red fibres, travelling contraction wave, sarcomere bands, connective sheath). |
| 3 | Arm looked like a **stick-figure** (balloon-animal joints) | Rebuilt as **one continuous swept mesh**: a variable-radius tube along an anatomically-proportioned centerline (researched ratios — forearm ≈ 0.8× upper arm, wrist ≈ ½ forearm). Disconnected spheres removed. |
| 4 | Fist fingers looked like warts; dive too fast | Fist rebuilt as a palm mass with **four curled two-segment fingers + thumb** in a proper local frame; auto-dive slowed `dt*0.55 → dt*0.32` (~40%). |
| 5 | Curled-finger fist read as stacked mechanical tubes; a **wireframe was visible through the bicep** at some angles | Removed the cyan **wireframe halo** that was bleeding through the muscle. Fist simplified to a clean rounded mass with **flush knuckle/finger ridges + folded thumb** (capsules, feature-detected with `CylinderGeometry` fallback) — nothing protrudes as a tube. |
| 6 | Fingers still not worth it — just remove them; and make Earth (Concept 5) actually look like Earth | **Removed all fingers/thumb** — the hand is now a single clean rounded mass (generic arm). **Earth rebuilt as a procedural "blue marble":** a canvas-generated equirectangular texture (ocean gradient, recognizable continent polygons, Sahara wash, polar + Greenland ice), a drifting **cloud layer**, an **atmosphere rim-glow** (back-side sphere), ~23.5° **axial tilt**, and slow rotation — all self-contained (no external image, honoring the single-file rule). |
| 7 | Add a personal theological perspective as a **non-numbered ★ section** (same theme as the pages): the **Tawaf** — millions circling the Kaaba during Hajj — as Chapter 2's resonance physics enacted at cosmic scale | Added a **reusable ★ convention** (nav numbering counts only non-starred entries → seven concepts keep `01–07`, the reflection shows a gold **★**; header `pIdx` shows ★; a `reflection` field renders a serif/italic panel under a "✦ A personal reflection" heading). Built **"The Tawaf — Coherence at Cosmic Scale"**: a stylized **Kaaba** (black cube, gold edges + *hizam* band + door), a counterclockwise **crowd** of ~14k luminous points, a **Synchrony** control (scattered → as one), and a **Reach** ascent crossfading four tableaux — **Tawaf → Earth** (blue-marble + ionosphere, Mecca shells) **→ Cosmos** (Earth as a pale-blue mote, shells into space) **→ Beyond** (a rotating 4-D hypercube) — with seven flat resonance ripples and an **⤒ auto-rise**. Reach-dependent camera framing lifts the Kaaba clear of the panel, then centres for the ascent. Capability ported to `chp1.html` (no content added there). Verified via the Node CDP screenshotter at every stage; nav, header, panel, and all four tableaux confirmed. |
| 8 | Reflection text **barely readable**; panel should be **wider** / look better; auto-rise **clunky** | Root cause: the panel's permanent `class="blurb"` rule tied `#pBlurb.reflection` on specificity but won on source order, forcing muted `#c6c2b6`, 12 px, and `max-width:62ch` (text shrank to ~330 px). Fixed by scoping the reflection styles under **`#panel.reflect #pBlurb`** (out-ranks `.blurb`) and clearing `max-width`. Reflection now: **940 px** near-opaque panel, **two balanced columns**, **16.5 px / weight 500 / cream `--ink`** italic serif, gold "✦" heading spanning both columns, closing paragraph in gold. **Auto-rise eased** (sinusoidal velocity — slow at the ends, faster mid-ascent — replacing the linear `dt*0.18`). *(Lesson: an element with a base utility class can lose to it on equal specificity + later source order — scope overrides under a parent id/class.)* |

---

## 3. What we achieved

- A complete, self-contained `chp2.html` matching Chapter 1's look and feel
  pixel-for-pixel on the UI chrome.
- Seven hand-built, physically-motivated 3D interactions, each with live controls.
- A signature **"dive" interaction**: a continuous descent of scale from a human
  arm down to oscillating quantum fields, with crossfaded stages and a
  fly-into-the-bicep transition.
- All visual-correctness regressions (black labels, stick-figure arm, wart
  fingers) found and fixed, each verified by a fresh headless render.

---

## 4. Code standards we hold ourselves to

These are the conventions inherited from `chp1.html` (the reference) and upheld in
`chp2.html`. **Any future chapter must follow them.**

### Structure & dependencies
- **One self-contained `.html` file** per chapter. No build step, no bundler,
  no local asset dependencies. Opens directly in a browser.
- **Three.js from CDN** only. Everything else is inline `<style>` + inline
  `<script>` (a single IIFE).
- Mobile viewport locked (`maximum-scale=1.0, user-scalable=no`).

### Identity (must match across chapters)
- **Palette** via CSS custom properties on `:root`:
  - `--bg:#070a14` (near-black) · `--ink:#ece6d6` (cream text) ·
    `--cyan:#4fe6cd` · `--cyan-dim:#2c8a7d` · `--gold:#e7b257`.
  - In Three.js: `COL_CYAN=0x4fe6cd`, `COL_GOLD=0xe7b257`, `COL_INK=0xece6d6`.
- **Fonts:** *Cormorant Garamond* (serif, for titles) + *IBM Plex Mono*
  (everything else), loaded from Google Fonts.
- **Layout:** fixed left **brand/kicker + numbered nav**, a **control panel**,
  a **guided-tour** button, all over a full-bleed Three.js canvas.

### Engine conventions
- Lighting rig: a cool `AmbientLight`, a warm key `DirectionalLight`, a cyan rim
  `DirectionalLight`. A starfield backdrop (`__stars`).
- Concepts live in a single **`CONCEPTS[]` array**; each entry is
  `{ title, dim, blurb, cam, build(g) }` and returns an `{update(dt,t)}` driver.
  `loadConcept(i)` swaps scenes; the nav and tour are generated from the array.
- **Control-panel builders** are the only way to make UI:
  `ctlSlider`, `ctlChips`, `ctlButton` — never hand-roll DOM per concept.
- **Opacity crossfades** go through `regOpacity(group)` (records each material's
  base opacity once, forces `transparent:true`) and `setOpacity(group,k)` (scales
  every material by `k`). Per-frame opacity animation writes
  `material.userData.op0`, never `material.opacity` directly, so the crossfade
  stays authoritative.
- **3D text labels** are made with `makeLabel(text, color, w)`. Colors are passed
  as the numeric `COL_*` constants; the helper converts them to a CSS string
  (the bug in §2 #1 is now permanently guarded against).
- A **guided tour** exercises every concept and every control — it doubles as the
  smoke test.
- **Starred reflections** are `CONCEPTS[]` entries with `star:true` (renders **★**,
  not a number — nav numbering counts only non-starred entries) and an optional
  `reflection` string (rendered as a serif/italic panel under a "✦ A personal
  reflection" heading). They are the chapter's personal-perspective coda — one per
  chapter, content authored per chapter. The convention lives in the shared engine
  (`chp1.html` carries it latently with no content).

### Geometry / aesthetic bar
- Organic forms are **continuous swept meshes** (variable-radius tubes over a
  Catmull-Rom centerline + `computeVertexNormals()`), **not** chains of spheres
  and cylinders. No "stick-figure / balloon-animal" silhouettes.
- Proportions for anything representational are **grounded in reference**
  (e.g. arm built from researched anatomical ratios — see §2 #3), not eyeballed.
- Motion is subtle and physical (contraction waves, breathing scales, slow
  idle rotation). Auto-animation speeds are tuned for *comprehension*, not flash.

### Verification (non-negotiable — evidence before "done")
- `node --check` the inline script before claiming syntax is clean.
- Render **headless Chrome over HTTP** (so the CDN loads) with **software WebGL**
  (`--use-gl=swiftshader --enable-unsafe-swiftshader`) — `file://` cannot load the
  CDN and `--disable-gpu` blocks WebGL, so neither is a valid test.
- Each Chrome launch uses its **own fresh `--user-data-dir`** (shared profiles
  cause session collisions and blank renders).
- A non-trivial PNG byte size **and** a clean console (no `not defined` / WebGL
  errors) are required before reporting a change as working. Screenshot is
  inspected, not assumed.
- **Render harness:** on this machine, Chrome's `--screenshot --virtual-time-budget`
  *hangs* on these WebGL/`requestAnimationFrame` pages (it never exits, even though
  a static page screenshots fine). The reliable method is `render.mjs` — a pure-Node
  DevTools-Protocol screenshotter (Node 24's built-in `WebSocket`): it launches
  headless Chrome with `--remote-debugging-port`, navigates over the local HTTP
  server, waits a fixed wall-time for the CDN + a few WebGL frames, then
  `Page.captureScreenshot` and `Browser.close`. Usage:
  `node render.mjs <src.html> <conceptIdx> <reachOrEmpty> <out.png> [waitMs]`
  (it builds a scratch copy that boots straight into the concept with auto-orbit off).

---

## 5. Files

| File | Role |
|------|------|
| `chp1.html` | **Reference standard.** Chapter 1 interactive (Sound, Waves & Vibration). |
| `chp2.html` | The deliverable. Chapter 2 interactive (A Look Through a Supermicroscope). |
| `stalking-the-wild-pendulum/chp1.html` | Mirror copy of the reference. |
| `chapter2/` | Chapter 2 source text + Bentov's original figures (`images/`). |
| `book/…StalkingTheWildPendulum…pdf` | Full source book. |

---

*Generated as a process export of the Chapter 2 interactive build.*
