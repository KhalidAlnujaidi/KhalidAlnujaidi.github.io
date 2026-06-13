"""
gen_narration.py — turn narration.txt into a synced voiceover for a chapter page.

What it does, end to end:
  1. Reads narration.txt (beats separated by a blank line) and sends the whole
     script to ElevenLabs text-to-speech *with character timestamps*.
  2. Writes narration.mp3 (the voiceover) and narration-cues.json (the start
     time, in seconds, of each beat — derived from the returned alignment).
  3. Bakes those cue times straight into chpN.html by replacing the
     `let TOUR_CUES=...;/*__CUES__*/` marker line, so the guided tour syncs the
     visuals to the real spoken timing.

Setup (the API key is NEVER committed):
    export ELEVENLABS_API_KEY=sk_...        # preferred
    # or drop the key on line 1 of a local, gitignored 11lab.txt next to this script
Then:
    python3 gen_narration.py            # defaults to chp2.html in the cwd
    python3 gen_narration.py chp3.html  # target a specific chapter

Rotate the key if it has ever been shared in plaintext.
"""
import json, base64, os, sys, urllib.request, urllib.error

# --- key: env var first, then a local gitignored 11lab.txt fallback ---
KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()
if not KEY and os.path.exists("11lab.txt"):
    KEY = open("11lab.txt").readline().strip()
if not KEY:
    sys.exit("No API key. Set ELEVENLABS_API_KEY or put the key on line 1 of 11lab.txt")

TARGET = sys.argv[1] if len(sys.argv) > 1 else "chp2.html"
VOICE = "JBFqnCBsd6RMkjVDRZzb"          # "George" — warm older British male
MODEL = "eleven_multilingual_v2"
SEP = "\n\n"

beats = open("narration.txt").read().split(SEP)
full_text = SEP.join(beats)

url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128"
body = json.dumps({
    "text": full_text,
    "model_id": MODEL,
    "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.0, "use_speaker_boost": True},
}).encode()

req = urllib.request.Request(url, data=body, method="POST",
    headers={"xi-api-key": KEY, "Content-Type": "application/json", "Accept": "application/json"})
try:
    resp = urllib.request.urlopen(req, timeout=120)
except urllib.error.HTTPError as e:
    print("HTTP ERROR", e.code, e.read().decode()[:500]); sys.exit(1)

data = json.loads(resp.read())
audio = base64.b64decode(data["audio_base64"])
open("narration.mp3", "wb").write(audio)

al = data.get("alignment") or data.get("normalized_alignment")
chars = al["characters"]
starts = al["character_start_times_seconds"]
full = "".join(chars)

# map each beat's first characters to its start time in the returned alignment
cues, cursor = [], 0
for b in beats:
    needle = b.strip()[:24]
    idx = full.find(needle, cursor)
    if idx < 0:
        idx = full.find(b.strip()[:8], cursor)
    cues.append(round(starts[idx], 3))
    cursor = idx + len(b)

json.dump(cues, open("narration-cues.json", "w"))

# bake the exact cue times straight into the target chapter (replace the TOUR_CUES marker line)
import re
html = open(TARGET).read()
html = re.sub(r"let TOUR_CUES=.*?;/\*__CUES__\*/",
              "let TOUR_CUES=" + json.dumps(cues) + ";/*__CUES__*/", html, count=1)
open(TARGET, "w").write(html)
print(f"baked TOUR_CUES into {TARGET}")

total = round(al["character_end_times_seconds"][-1], 2)
print("audio bytes:", len(audio))
print("total audio duration:", total, "s")
print("cues (beat start times):", cues)
# show per-beat spoken length, flag the auto-dive (beat idx 1) and auto-rise (beat idx 22)
gaps = [round((cues[i+1] if i+1 < len(cues) else total) - cues[i], 2) for i in range(len(cues))]
print("auto-dive beat window  (idx1):", gaps[1], "s   (needs >= ~16s for the dive)")
print("auto-rise beat window (idx22):", gaps[22], "s   (needs >= ~9s for the rise)")
