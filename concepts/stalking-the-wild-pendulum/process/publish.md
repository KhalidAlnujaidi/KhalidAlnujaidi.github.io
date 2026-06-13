# Recording & Publishing the Chapter 2 Tour

## How it works

When you add `?record` to the URL, the page records the **WebGL canvas itself** (not your screen) plus the narration audio into **one synced file**. Because it captures the canvas, your cursor, the tour button, and the panel are *physically not in the recording* — pure visualization, nothing to crop. Audio and video are recorded together into a single file, so **no merging step is needed.**

## How to record — step by step

1. **Start a local server** (so `narration.mp3` loads same-origin and audio capture isn't blocked). In Terminal:
   ```
   cd /Users/khalid/Desktop/stwp && python3 -m http.server 8000
   ```
2. **Open in Chrome** (Chrome/Edge — not Safari, its MediaRecorder is flakier):
   ```
   http://localhost:8000/chp2.html?record
   ```
   Make the window **large / fullscreen first** — the output resolution = the canvas size (retina gives you ~2× that), so a big window = a crisp video.
3. **Click "▶ Guided tour"** (top-right). That click is what unlocks audio + recording. Recording starts the instant the tour begins.
4. **Zoom whenever you want** — mouse **wheel** zooms, **drag** orbits. Your live movements are captured exactly; the cursor stays invisible.
5. When the narration finishes, the tour ends and the browser **auto-downloads `chapter2-tour.webm`** — already containing video + sound, exact length, no editing.

To stop early, click the tour button again ("● touring · stop") — it still finalizes and downloads what was captured.

## Publishing

The `.webm` is ready to publish as-is (YouTube, Vimeo, most web players accept it). If you specifically need an `.mp4` (e.g. for iPhone/Safari/social), one command converts it — no re-editing:
```
ffmpeg -i chapter2-tour.webm -c:v libx264 -pix_fmt yuv420p -c:a aac chapter2-tour.mp4
```

## Notes

- `?record` does **not** auto-start the tour — you must click, so the audio gesture is satisfied. Don't combine it with `?tour`.
- Deploy stays unchanged: visitors who open the page without `?record` see the normal interactive version.
