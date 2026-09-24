# Animation guide (read this before painting a chapter)

This project renders a 71.84 s music video, "I woke up in the render queue" (a Suno song), as painted watercolour animation with p5.brush. Frames are rendered offline in headless Chrome. The shot list is in [STORYBOARD.md](STORYBOARD.md): read it all, including the chapters around yours so your transitions connect. The user's direction: **use the Gemini and Suno logo designs as characters emerging into life; give each lyric interesting visuals and transitions; cute, cartoony, fun colours, lively animation, something happening in every shot. Be brave and ambitious.**

## How a chapter works

Each chapter is one file in `src/ch/`, wrapped in an IIFE so its helpers stay private:

```js
// src/ch/c2_studio.js
(() => {
  const B = n => OFF + n * BEAT;                  // time of beat n
  const keycap = (x, y, s, label, down) => { ... };  // private helpers: any names, no collisions
  function copyPaste(t, lt, dur) { ... }             // a shot
  function synth(t, lt, dur) { ... }
  chapter('studio', 16.3, 31.56, [[16.3, copyPaste], [20.12, synth], ...]);
})();
```

- `chapter(name, start, end, shots)` registers the chapter. A shot fn is called as `fn(t, lt, dur)` (song time, time since shot start, shot length) and must paint the **entire frame**, background included. Cuts land on each shot's start time.
- **Frames render in parallel and out of order.** Every shot must be a pure function of `t`: no state carried between frames, no `Math.random()`. Use `hash(i)` for stable per-object randomness and `jit(a)` for hand-drawn jitter (reseeded 12×/s, so linework "boils" like hand-drawn animation; that's wanted).
- **Only edit your own chapter file.** If a shared helper is missing, write it privately inside your IIFE. If you find a real bug in a shared file, report it in your final message; don't edit it. Shared files: core.js, cast.js, props.js, timeline.js, lyrics.js, studio.html, render.mjs.
- Wipes: the timeline paints a brush wipe over the frame at 16.3 and 31.56 (covering ±0.3 s). Other chapter boundaries (47.78, 62.2) are plain cuts, so make them motivated (a splash, a flash, a snap to black).

## Canvas and layout

- 1920×1080, y points down, origin at the top-left. Everything is drawn in this space unless a camera is active.
- **The karaoke bar covers the bottom band (about y 975–1070) whenever a lyric is showing, which is nearly always.** Keep faces and key action above about y 950.
- Paper texture is under every frame, and a paper grain plus vignette is multiplied over the top.

## Painting API (core.js)

`paint(pts, o)` paints one shape from a point list `[[x, y], ...]`:

| option | meaning |
|---|---|
| `wash, washOp` | flat colour (0–255). Use it for character colours and anything that must read solidly. |
| `fill, fillOp, bleed, tex, border` | watercolour fill with bleeding edges and pigment texture. Use it for backgrounds, glows, shading and pools of light. `bleed` ~.05–.3, `tex` ~.3–.9, `border` ~.2–.8. |
| `hatch: { d, a, o, b, c, w }` | hatching lines (dist, angle, `{rand, gradient}`, brush e.g. `'charcoal'` or `'HB'`, colour, weight). Nice for dry-brush texture; use sparingly. |
| `ink, sw, br` | outline colour (default ink), weight (~.4–2), brush (`'ink'` default, `'inkfine'`). **`ink: null` means no outline.** |
| `curv` | smooth the outline through the points (0–1) instead of straight segments. |

Other helpers:
- **Geometry:** `rectPts(x, y, w, h, jitter)`, `ellPts(cx, cy, rx, ry, n, jitter, rot)`, `rrPts(x, y, w, h, r, jitter)` (rounded rectangle), `starPts(cx, cy, r, inner, n, rot)`, `heartPts(cx, cy, r)`, `sparklePts(cx, cy, r, pinch, rot)` (the Gemini sparkle shape, great for twinkles), `chaikin(pts, closed, iters)` (smooth a polyline), `thickPath(pts, w, closed)` (a polygon that traces a path at width w: solid-colour thick lines/letters), `clipHalf(pts, f, d)` (keep the part of a polygon where the linear function f(x,y) ≥ d: gradients by slicing).
- **Lines:** `inkLine(pts, sw, colour, brush = 'ink', curvature)` draws a stroke along a path. Brushes: `'ink'`, `'inkfine'`, `'dry'` (bristly), plus built-ins `'2B'`, `'HB'`, `'charcoal'`, `'marker'`, `'spray'`, `'rotring'`, `'cpencil'`, `'pen'`.
- **Transforms:** p5 `push()/pop()/translate()/rotate()/scale()` work with all brush calls.
- **Palette** `PAL`: `paper, ink, clay, clayDk, clayLt, night, indigo, rose, ochre, sap, teal, violet, cream, sky`, plus the candy set `gBlue, gViolet, gPink` (Gemi), `sunoA, sunoB, sunoC` (Suno's amber → red-orange → pink), `suno` (dark plum for UI/bezels), `lemon, mint, coral, magenta, cyan, grape, bubble`. `mixCol(a, b, k)` mixes two hex colours. Any hex colour is fine. This video is **candy-bright**: saturated and fun, but still watercolour-textured. Avoid pure black and pure white: use `PAL.ink` / `PAL.night` and `PAL.cream`.
- **Timing:** `bpOf(t)` gives the beat position (125 BPM, beat = 0.48 s, bar = 1.92 s). Also:
  - `beatN(t)` integer beat number.
  - `pulse(t, k)` is 1 on each beat and decays; `pulse2` does the same on eighths. Use them for hits.
  - `seg(t, a, b)` is 0..1 progress through [a, b].
  - `kf(t, [[t0, v0], [t1, v1], ...], easeFn)` interpolates keyframes; values may be arrays.
  - Easings: `ease` (smoothstep), `easeOut`, `easeIn`, `backOut` (overshoot), `elasticOut`. Also `lerp`, `clamp`, `frac`, `wob(t, freq, phase)`, `hash(i)`, `TAU`.
- **Camera:** `camBegin(cx, cy, zoom, rot)` puts world point (cx, cy) at screen centre; `camEnd()` restores. Use it for pushes, pans, tilts, whips and zoom-outs. `shakeXY(t, amount)` gives [dx, dy] shake to add to cx/cy on hits. One level only; always pair it with `camEnd()`.
- **Lettering** (Permanent Marker, with an ink drop-shadow). Letters are placed through the active camera automatically, but not through your own `push/translate`, so give letter coordinates in world space.
  - `letter(txt, x, y, size, colour, { pop, rot, alpha, ink:false, stroke, font, align, screen:true })`. `pop` is 0..1 appear progress with overshoot.
  - `sfx(txt, x, y, size, colour, age, { life, rot })` is a comic sound effect that pops in, wobbles and fades out.
  - Letters are composited onto the painting at `flushLetters()`. That runs automatically after your shot, so anything painted later (wipes) covers them. Call `flushLetters()` yourself mid-shot if you need paint over a letter.
- **Full-frame effects** (screen space, outside the camera):
  - `flash(k, colour)` paints a full-frame wash at strength k.
  - `iris(cx, cy, r, colour)` paints everything outside a circle.
  - `irisShape(pts, colour)` paints everything outside any star-shaped outline (mouth-shaped reveals, hearts, keyholes).

## Characters (src/cast.js; read the header comment there)

All four take `(x, y, unit, o)` where (x, y) is the **ground point between the feet**. Shared options: `dy` (units, negative = up), `sq` (squash; negative stretches), `rot`, `flip`, `sx`/`sy`, `spin` (0..1 turn, squashes x), `aL`/`aR` (arm angle: 0 = straight out, positive raised, negative lowered), `walk` (phase), `eyes`, `mouth`, `blush`, `lookX`/`lookY`, `hat`, `glow` (0..1 aura), `emote`/`emoteK`, `draw(u, sw)` (body-local hook), `armL`/`armR(u, sw)` (called at the hand/tip in arm space, +x outward: for holding props), `noShadow`, `noLegs`, `seed`.
- **Eyes:** normal, look, happy, closed, sleepy, wink, angry, scared, wide, cry, spark (stars), heart, x, swirl, dot, shades. The human adds `lazy` (their default, heavy lids) and `screen` (blue screen glints).
- **Mouths:** smile, grin, o, O, sing (animated open/close, use it whenever they sing), flat, wobble, cat, tongue, frown.
- **Hats:** party, crown, headphones, beret, halo, toque, tophat.
- **Moods:** never snap between faces. `mood(t, [[t0, 'normal'], [t1, 'scared', 'sweat'], [t2, 'happy', 'heart']])` returns `{ eyes, squint, take, emote, emoteK }`; spread it into any character. Emotes: sweat, spark, heart, anger, music, swirl, zzz, bulb, !, ?, !?, !!.
- **Dancing:** `move(style, t, seed)` returns beat-synced offsets (bounce, hop, roof, sway, spin, wave, walk, run, idle, stomp, shimmy, mix). Use `gemiDancer / sunoDancer / tuneDancer / humanDancer(x, y, unit, style, t, extra)`.

| Character | Call | Size notes |
|---|---|---|
| **Gemi**, the Gemini sparkle | `gemi(x, y, u, o)` | Body 10u tall (centre at local (0, −6.6u)), about 11.6u standing. Side tips are its arms (`aL/aR` rotate them). Extras: `lean`, `tall`, `reachL/R`, `pinch`, `colA/B/C`. |
| **Suno**, the Suno orb | `suno(x, y, u, o)` | Orb radius 5u centred at local (0, −6.4u), about 11.4u standing. `sing: 0..1` bounces the SUNO letters like a waveform. `noMark` hides the wordmark (only for tiny sizes). Extras: `colA/B/C`. |
| **Tune**, the song, "I" | `tune(x, y, u, o)` | An eighth note: head centre (0, −3.3u), head about 6.4u wide, stem top at −12u. `gold: 0..1` turns it gold (from 27.34 on it is gold unless the story says otherwise). `flagWave`. |
| **You**, the human | `human(x, y, s, o)` | About 13.2s tall (feet at 0, shoulders (±1.75s, −7.4s), head centre (0, −10.7s) r 2.35s). Extras: `phone` (glowing phone in the right hand), `sit` (legs forward, for beanbag/hammock), `hood`, `brows` (worried/angry/up), `hairUp`, `handL/handR` hooks, `back`. |

- **Size guide:** hero close-ups use u ≈ 40–70; normal two-shots use u ≈ 22–34. Keep **Tune about 0.65× its parents' unit** when they're together (Tune u ≈ 0.65 × Gemi u). The human's s ≈ 0.9 × Gemi's u makes them a bit taller than the robots.
- Gemi's body colours are fixed by the brand gradient; Suno is the orange orb. Put them on backgrounds they contrast with. Suno on orange/red backgrounds or Gemi on blue ones needs a lighter or darker backdrop behind them, or a `glow`.
- Unit cost: each character is roughly 30–50 painted shapes. Crowds of 32 full characters are too slow; for crowds, paint simplified mini versions privately (a sparkle with two dot eyes, an orange circle with dot eyes, a note with dot eyes).

## Props (src/props.js)
`sparkleBurst(x, y, r, age, o)`, `confetti(t, x0, x1, y0, o)`, `notes(x, y, t, o)`, `speedLines(cx, cy, k, col)`, `screenBox(x, y, w, h, o)`, `progressBar(x, y, w, h, p, o)`, `sunburst(cx, cy, a, b, rot, n, r, op)` (in timeline.js). Everything else (machines, pods, beanbags, guitars, waves) you paint privately in your chapter.

## Style rules

- **Look:** hand-painted watercolour and ink, like a bright picture book or a candy-coloured cartoon. Characters get flat `wash` colour plus ink outlines. Backgrounds are soft watercolour `fill` shapes with big simple forms; use washes for anything that must read solidly. Glows and light are low-opacity fills.
- **Colour:** follow your chapter's palette in STORYBOARD.md. Fun and saturated. Contrast between the characters and the background must be clear.
- **Motion:** everything moves. Cameras drift, push, whip or shake on hits. Characters bounce on the beat (`pulse`, `move`). Use squash and stretch, anticipation and overshoot (`backOut`, `elasticOut`). Put the important action on beat times (beats fall at `0.32 + n × 0.48` s), and put reactions and hits on the **word times** in `src/lyrics.js` (every word's start is there).
- **Readability:** one clear focal action per shot, with a big silhouette. Shots are 3–5 s, so split them into 2–3 mini-beats (setup → action → payoff) so something new happens every second or so.
- **Transitions:** every shot should hand off to the next: a whip-pan, a push through an object, a match cut, a pop, a flash or a splash. Check the next shot's opening (even if another painter owns it) in STORYBOARD.md.
- **Performance:** frames currently render in about 0.3–0.5 s, so there's room for richness. Stay **≤ 2.5 s per frame** (the sheet prints ms/frame). Cost comes from the number of `fill` shapes (watercolour fills are the expensive ones) and strokes: hundreds are fine, thousands are not.

## Checking your work

Run from `render-queue/` (the renderer uses the real GPU; several agents render at once, so keep sheets small):

```
node render.mjs --sheet=16.4,16.9,17.4,17.9,18.4,18.9 --cols=3 --w=640 --out=out/check/c2_a.jpg
node render.mjs --stills=17.5 --out=out/check/c2_full
```

Open the sheet with the Read tool and look carefully. Check:
- the first and last frames of every shot, plus a few in between;
- that motion reads across consecutive times (e.g. every 0.1 s around a hit);
- that nothing important sits under the karaoke band;
- that characters are on-model and big enough.

Iterate until every shot looks good: charming, readable, lively and on-model. Fix whatever looks off: scale, contrast, clutter, stiffness, empty space.
