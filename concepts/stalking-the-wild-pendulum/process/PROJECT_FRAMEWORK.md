# Stalking the Wild Pendulum — Interactive Edition
## Project Framework & Chapter Pipeline

> **One line:** Turn each chapter of Itzhak Bentov's *Stalking the Wild Pendulum:
> On the Mechanics of Consciousness* into a single self-contained, interactive 3-D
> web page that lets a reader *feel* the chapter's ideas — built on one reusable
> engine so each new chapter is mostly "pump the content through the framework."

This document is the durable contract for the project: the vision, the stack, the
engine, the standards, the tooling, and a step-by-step recipe (with boilerplate)
for producing the next chapter fast and well. It supersedes nothing in
`CHAPTER2_PROCESS_LOG.md` — that file is the per-iteration narrative; this file is
the reusable framework distilled from it.

---

## 1. Vision & theory

Bentov's book argues that reality is **vibration, resonance, and coupled fields** —
matter is mostly empty space threaded with oscillating fields; bodies are coupled
oscillators in one planetary medium; coherence and entrainment are the mechanics of
everything from healing to consciousness. Text alone makes these claims abstract.

**The thesis of this project:** these ideas are inherently *spatial, dynamic, and
interactive*, so the right medium is a hands-on 3-D scene, not prose. Each chapter
becomes a small museum of **interactive concepts** — drag a slider and watch the
abstraction become a felt experience. A reader leaves having *manipulated* the idea,
not just read it.

**The aesthetic** is deliberately calm, dark, and reverent — an "ink-and-gold"
observatory: near-black space, cream serif titles, mono labels, cyan/gold accents,
slow physical motion tuned for comprehension over flash.

---

## 2. The goal

- Every chapter → **one `.html` file**, no build step, opens in any browser.
- Each file mirrors a single **reference standard** so the whole book feels like one
  artifact. `chp1.html` was the original reference; the conventions below are the
  reference now.
- A reader can **explore freely** (controls) or **sit back** (a guided tour that
  drives every concept and doubles as the smoke test).
- New chapters should cost mostly *content* effort, not *engineering* effort — the
  engine, palette, navigation, control panel, crossfades, verification harness, and
  the optional ★ reflection are all reusable.

---

## 3. What we've achieved

| Chapter | File | Title | Concepts | Status |
|---|---|---|---|---|
| 1 | `chp1.html` | Sound, Waves & Vibration | 6 — Standing Waves · Chladni Plate · Crystal in a Box · Interference · Beat Frequencies · Rhythm Entrainment | Reference standard |
| 2 | `chp2.html` | A Look Through a Supermicroscope | 7 — Supermicroscope · Hollow Atom · Piezoelectric Bone · Web of Fields · Earth–Ionosphere · Stiff Jelly · Planetary Resonance | Complete + verified |
| 2 | `chp2.html` | ★ **A Theological Perspective** | The Tawaf — coherence at cosmic scale (Kaaba → Earth → Cosmos → Beyond) | Complete + verified |

**Signature interactions built:** a scale **dive** (arm → muscle → molecule → atom →
vacuum → fields), a procedural **blue-marble Earth**, Kuramoto **synchronization**,
and the **★ reflection** convention (a non-numbered, gold-starred personal coda — the
Tawaf as the book's resonance physics enacted by millions, ascending to higher
dimensions). Every visual regression that appeared (black labels, stick-figure arm,
unreadable text) was caught and fixed by the verify loop in §7–8.

---

## 4. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Plain browser, single `.html` | Zero install, zero build, portable forever |
| 3-D | **Three.js** from CDN | Only external dependency; everything else inline |
| Code | One inline `<script>` IIFE | Self-contained; `node --check`-able |
| Style | Inline `<style>` + CSS custom properties | Single source of palette/layout |
| Fonts | **Cormorant Garamond** (serif titles) + **IBM Plex Mono** (everything else), Google Fonts | The identity |
| Verify | **Node 24** (`node --check` + `render.mjs` CDP screenshotter), headless Chrome (swiftshader), `sips` | No test framework — verification is *rendering* |

**Palette (identity — must match across chapters):**
`--bg:#070a14` · `--ink:#ece6d6` · `--muted:#7d879c` · `--cyan:#4fe6cd` ·
`--cyan-dim:#2c8a7d` · `--gold:#e7b257` · `--line:rgba(236,230,214,.10)` ·
`--panel:rgba(10,14,26,.62)`. In Three.js: `COL_CYAN=0x4fe6cd`, `COL_GOLD=0xe7b257`,
`COL_INK=0xece6d6`.

---

## 5. The framework (engine architecture)

Everything hangs off **one array of concept descriptors**. The chrome (nav, header,
panel, tour) is generated from it; you never hand-build per-concept DOM.

### 5.1 The concept descriptor

```js
CONCEPTS.push({
  title:"…",            // shows in nav + header
  dim:"×10⁹",           // small badge (optional)
  blurb:"…",            // the prose paragraph (~70–90 words, like the others)
  // reflection:"…",    // OR a starred reflection (see 5.4) — mutually exclusive with blurb
  // star:true,         // mark as a ★ reflection (renders ★ instead of a number)
  cam:{theta:0.7,phi:1.05,radius:9,auto:true,autoSpeed:0.05,rmin:3,rmax:30,target:[0,0,0]},
  build(g){             // g is a fresh THREE.Group cleared on every load
    // …assemble meshes into g…
    return {update(dt,t){ /* per-frame animation */ }};   // optional driver
  }
});
```

`loadConcept(i)` swaps scenes: clears the group, sets the header (`pIdx`, `pTitle`,
`pDim`, `pBlurb`/reflection panel), applies the camera, calls `build(g)`, and stores
the returned `update`. The nav and the guided tour are both generated from
`CONCEPTS`, so adding an entry wires it everywhere automatically.

### 5.2 Control-panel builders (the ONLY way to make UI)

- `ctlSlider({label,min,max,value,step,fmt,onInput})` → returns the `<input>`
- `ctlChips({label,options:[{label,value}],value,onPick})`
- `ctlButton(label,onClick)`
- `ctlMeter(label)` → `{set(0..1)}` · `ctlReadout(label)` → a big serif number node

Never hand-roll DOM per concept — these keep every panel consistent.

### 5.3 Crossfade discipline (for staged / dissolving scenes)

- `regOpacity(group)` once after building — records each material's base opacity and
  forces `transparent:true`.
- `setOpacity(group,k)` — scales every material by `k` (the authoritative crossfade).
- Per-frame opacity animation writes `material.userData.op0` — **never**
  `material.opacity` directly — so the crossfade stays in control.

### 5.4 The ★ reflection convention (reusable across all chapters)

A concept with `star:true` renders a gold **★** instead of a number (nav numbering
counts only non-starred entries, so the others keep `01…0N`), and a `reflection`
string renders a **wide, two-column, near-opaque serif panel** under a gold
"✦ A personal reflection" heading. It is the chapter's **personal-perspective coda**
— one per chapter, content authored per chapter. Engine support lives in three small,
identical edits present in every chapter (nav numbering, header `pIdx`, the
`#panel.reflect #pBlurb` styling); `chp1.html` carries the capability latently.

```js
CONCEPTS.push({
  star:true, title:"A Theological Perspective", dim:"∞",
  reflection:"Para one.\n\nPara two.\n\nClosing line (renders gold).",
  cam:{ /* … */ },
  build(g){ /* the scene; reuse engine pieces from earlier concepts */ return {update(dt,t){ /* … */}}; }
});
```

### 5.5 Other shared pieces

- **Lighting rig:** cool ambient + warm key + cyan rim directional lights; a rotating
  starfield backdrop (`scene.userData.stars`).
- **3-D labels:** `makeLabel(text, COL_*, w)` — pass the numeric color constant; the
  helper converts it to a CSS string (a past bug, now permanently guarded).
- **Guided tour:** scripted clicks/slider-drives over every concept; it is the
  end-to-end smoke test (`?tour` auto-runs it).

---

## 6. Development standards (the bar)

- **Self-contained:** one HTML file, CDN-only Three.js, no local assets. Procedural
  textures (e.g. the canvas blue-marble) instead of image files.
- **Identity locked:** the §4 palette and the two fonts, on every chapter.
- **Organic forms are continuous swept meshes** (variable-radius tube over a
  Catmull-Rom centerline + `computeVertexNormals()`) — never chains of spheres and
  cylinders. No "stick-figure / balloon-animal" silhouettes.
- **Representational proportions are reference-grounded**, not eyeballed (e.g. arm
  ratios were researched).
- **Motion is subtle and physical**, tuned for comprehension; auto-animations ease
  (slow at the ends), they don't lurch.
- **Readability beats cleverness:** text panels are opaque enough and large enough to
  read over a busy scene (see the specificity lesson in §8).
- **Verification is non-negotiable** (§7): evidence before "done," always.

---

## 7. Tooling & verification pipeline

There is **no unit-test framework** — correctness is confirmed by *rendering and
looking*. The loop, in order:

1. **`node --check`** the inline IIFE (extract the largest `<script>` and check it).
2. **Render headless** with `render.mjs` — a pure-Node DevTools-Protocol
   screenshotter (Node 24 has a built-in `WebSocket`). It builds a scratch copy that
   boots straight into a concept (auto-orbit off), serves it over local HTTP (so the
   CDN loads), waits a fixed wall-time for WebGL frames, captures, and exits cleanly:
   ```bash
   node render.mjs chp2.html <conceptIdx> "<reachOrEmpty>" /tmp/out.png [waitMs]
   ```
3. **Inspect the PNG** (and crop with `sips -c H W --cropOffset Y X`) plus the console
   — a non-trivial byte size **and** a clean console (no `not defined`/WebGL errors)
   are both required.
4. For CSS/DOM doubts, a tiny **CDP probe** (`Runtime.evaluate` of
   `getComputedStyle`) tells you the *computed* truth instead of guessing.

> **Hard-won gotcha:** Chrome's `--screenshot --virtual-time-budget` *hangs* on these
> WebGL/`requestAnimationFrame` pages on this machine (a static page screenshots
> fine; an animated WebGL page never exits). Use the `render.mjs` CDP path — it is the
> reliable harness. `file://` can't load the CDN and `--disable-gpu` blocks WebGL, so
> always serve over HTTP with `--use-gl=swiftshader --enable-unsafe-swiftshader` and a
> fresh `--user-data-dir`.

---

## 8. How we move fast (the ch1 → ch2 transfer)

The speed comes from **separating the stable engine from the per-chapter content**,
plus a **tight feedback loop**:

1. **`chp1.html` was mined, not re-invented.** Its scaffold, palette, fonts, nav,
   control-panel pattern, crossfade helpers, and tour were read out and reused — so
   `chp2.html` started from a working engine and only needed seven new `build(g)`
   bodies.
2. **Every fix was a render away.** Feedback ("the arm looks like a stick figure")
   became: edit → `node --check` → `render.mjs` → look → repeat — minutes, not hours.
   The same loop caught and fixed the black-label `fillStyle` bug, the swept-mesh arm,
   the Earth blue-marble, and the unreadable reflection panel.
3. **Root-cause, not symptom.** Each bug was traced to a real cause and the cause was
   documented so it can't recur — e.g. labels feeding a numeric color to canvas
   `fillStyle`; or a reflection panel losing a CSS **specificity tie** to a base
   `.blurb` class (fixed by scoping under `#panel.reflect #pBlurb`).
4. **The process log is the memory.** `CHAPTER2_PROCESS_LOG.md` records each
   feedback→fix so the next chapter inherits the lessons, not just the code.

---

## 9. The pipeline — producing a new chapter

> Goal: a new chapter should be mostly **pumping content through the framework**.
> Engineering is already done; the work is reading the chapter and writing `build()`s.

**Step 0 — Scaffold.** Copy the latest chapter file (`chp2.html`) to `chpN.html`.
Update the brand kicker / `<h1>` / "Ch. N" line and the chapter title. Empty the
`CONCEPTS` pushes (keep all engine code, helpers, palette, nav, tour, crossfade, the
★ support). You now have a working, empty chapter.

**Step 1 — Read the source.** Read the chapter text + Bentov's original figures (e.g.
`chapterN/` images, or the PDF in `book/`). List the **5–8 core ideas** that are
inherently visual/dynamic. Ground visuals in the actual diagrams, not invention.

**Step 2 — Spec each concept** as a one-liner: `{title, dim, the interaction, the
controls}`. Decide which existing pattern each reuses (dive/crossfade, coupled
oscillators, a procedural sphere, resonance rings, etc.).

**Step 3 — Implement** each concept with the §5.1 boilerplate, using **only** the
control builders (§5.2) and crossfade discipline (§5.3). Reuse, don't reinvent —
most scenes are recombinations of patterns already in `chp1`/`chp2`.

**Step 4 — (Optional) ★ reflection.** Add the chapter's personal coda with the §5.4
convention. Draft the text from the author's own words; the viewpoint stays theirs.

**Step 5 — Wire the tour.** Add one `seg(i,[…])` step per concept (and the ★) and one
duration per concept in each `PROFILES` array.

**Step 6 — Verify** every concept and the ★ with the §7 loop (`node --check` →
`render.mjs` → inspect PNG + console). Fix to root cause.

**Step 7 — Log it.** Append the iteration(s) to a `CHAPTERN_PROCESS_LOG.md` (or the
shared log), recording any feedback→fix and any new reusable lesson.

### Concept boilerplate (copy, fill the middle)

```js
/* ============================================================= CONCEPT */
CONCEPTS.push({
  title:"<Concept Name>",
  dim:"<badge>",                       // optional small tag, e.g. "7 Hz"
  blurb:"<one ~80-word paragraph grounding the idea in Bentov's text>",
  cam:{theta:0.7,phi:1.05,radius:9,auto:true,autoSpeed:0.05,rmin:3,rmax:30,target:[0,0,0]},
  build(g){
    // 1) build meshes into g (reuse swept-mesh / sphere / points / lattice patterns)
    //    use COL_CYAN / COL_GOLD / COL_INK; add makeLabel(...) for 3-D text
    // 2) if the scene crossfades stages: regOpacity(sub); animate via material.userData.op0
    // 3) controls — ONLY via builders:
    //    ctlSlider({label:'…',min:0,max:1,value:.5,step:.01,fmt:v=>…,onInput:v=>{…}});
    //    ctlChips({label:'…',options:[{label:'…',value:'…'}],value:'…',onPick:v=>{…}});
    //    ctlButton('…',()=>{…});
    return {update(dt,t){
      // per-frame motion — subtle, physical, eased
    }};
  }
});
```

---

## 10. File map

| Path | Role |
|---|---|
| `chp1.html` | Chapter 1 (Sound, Waves & Vibration) — original reference |
| `chp2.html` | Chapter 2 (A Look Through a Supermicroscope) + ★ A Theological Perspective |
| `chpN.html` | Future chapters (scaffold from the latest) |
| `render.mjs` | Node CDP headless screenshotter — the verification harness |
| `PROJECT_FRAMEWORK.md` | **This file** — the reusable pipeline & standards |
| `CHAPTER2_PROCESS_LOG.md` | Chapter-2 iteration narrative + standards detail |
| `docs/superpowers/specs/…`, `docs/superpowers/plans/…` | Design spec + implementation plan for the ★ reflection |
| `chapter2/` (text + `images/`), `book/…pdf` | Source material |

---

## 11. The shape of "done"

For any chapter: zero pending concepts, the inline script `node --check`-clean, every
concept and the ★ reflection rendered and visually confirmed with a clean console, the
guided tour reaching the last entry, and the process log updated. Identity (palette +
fonts) intact, organic forms continuous, motion eased, text readable. Then it ships as
a single file anyone can open.

---

*The engine is the asset. Each new chapter is content poured through it — read the
chapter, name the concepts, write the `build()`s, reflect, verify, log.*
