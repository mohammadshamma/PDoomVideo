# I woke up in the render queue

A painted, cartoon music video for the Suno song *I woke up in the render queue*. It is built on the same p5.js and p5.brush engine as [`../pdoom`](../pdoom).

Four characters play the song. Gemi is the Gemini sparkle and Suno is the Suno orb. Both come to life in the render queue and together make Tune, the song itself: a little eighth note who is the "I" of the lyrics. You, the human in the orange hoodie, typed one prompt and took the credit.

| Path | What it is |
|---|---|
| [`STORYBOARD.md`](STORYBOARD.md) | Shot-by-shot plan, with one or more shots per lyric line |
| [`ANIMATION_GUIDE.md`](ANIMATION_GUIDE.md) | Style and code guide for painting a chapter |
| [`src/cast.js`](src/cast.js) | Gemi, Suno, Tune and the human, plus moods and dance moves |
| [`src/ch/`](src/ch/) | The five chapters: boot, studio, couch, binary, finale |
| [`src/lyrics.js`](src/lyrics.js) | Lyrics with per-word start times, force-aligned to the audio |
| [`build/`](build/) | Whisper transcript and word alignment used for the karaoke |
| [`studio.html`](studio.html) / [`render.mjs`](render.mjs) | The paint page and the headless-Chrome renderer |

## Rendering

You need Node.js, Google Chrome and ffmpeg. `node_modules/` is a copy of the P(doom) one; `npm install` also works.

```bash
cd render-queue
node render.mjs --frames=0:74.2 --workers=4   # paint every frame into out/frames (resumable)
node render.mjs --encode                      # frames + song → out/render_queue.mp4
```

For quick checks, `node render.mjs --sheet=17,23.4,30.9 --out=out/check.jpg` renders a contact sheet.

The song is 71.84 s long at 125 BPM (beat = 0.48 s). The video runs to 74.2 s so the title card can hold; the audio fades and pads with silence.
