// timeline.js: chapter registry, brush-wipe chapter breaks, word-synced karaoke.
//
// Each chapter file calls chapter(name, start, end, shots) where shots = [[t0, fn], ...] in time order.
// A shot function is called as fn(t, lt, dur): t = song time, lt = t - t0, dur = shot length. It paints the whole frame
// (backgrounds included) and must be a pure function of t: frames render in parallel and out of order.

const CH = [];
function chapter(name, start, end, shots) { CH.push({ name, start, end, shots }); CH.sort((a, b) => a.start - b.start); }

// Chapter breaks that get a brush wipe (cover by the boundary, reveal after it).
const WIPES = [16.3, 31.56];
const WIPE_TR = .3;
let METER_SHOWN = false;

function drawWorld(t) {
  const ch = CH.find(c => t >= c.start && t < c.end);
  if (!ch) placeholder(t);
  else {
    let i = 0; while (i + 1 < ch.shots.length && t >= ch.shots[i + 1][0]) i++;
    const t0 = ch.shots[i][0], end = i + 1 < ch.shots.length ? ch.shots[i + 1][0] : ch.end;
    ch.shots[i][1](t, t - t0, end - t0);
    CAM = null;
  }
  flushLetters();
  WIPES.forEach((b, j) => { if (Math.abs(t - b) < WIPE_TR) wipe((t - (b - WIPE_TR)) / (2 * WIPE_TR), j); });
  karaoke(t);
}

// Model sheet: shown wherever no chapter is registered yet.
function placeholder(t) {
  paint(rectPts(-40, -40, W + 80, H + 80), { wash: '#FBE9D0', ink: null });
  sunburst(960, 520, PAL.bubble, PAL.lemon, t * .2, 18, 1600, 70);
  gemiDancer(560, 860, 36, 'bounce', t, { blush: true, mouth: 'grin' });
  sunoDancer(1280, 860, 34, 'hop', t, { blush: true, mouth: 'sing', sing: 1 });
  humanDancer(1650, 880, 30, 'idle', t, { phone: true, eyes: 'screen' });
  tuneDancer(960, 880, 40, 'hop', t, { blush: true, mouth: 'sing', gold: t > 2 ? 1 : 0 });
  letter('(chapter not painted yet)', 960, 110, 50, PAL.ink, { ink: false });
}
function sunburst(cx, cy, a, b, rot = 0, n = 16, r = 2200, op = 120) {
  for (let i = 0; i < n; i++) {
    const a0 = rot + i * TAU / n, a1 = a0 + TAU / n * .62;
    paint([[cx, cy], [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r], [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r]], { fill: i % 2 ? a : b, fillOp: op, bleed: .2, tex: .5, border: .4, ink: null });
  }
}

// ---------- brush wipe ----------
const WIPE_COLS = [[PAL.gBlue, PAL.gViolet], [PAL.coral, PAL.magenta], [PAL.mint, PAL.cyan], [PAL.gPink, PAL.lemon]];
function wipe(p, idx) {
  const [c1, c2] = WIPE_COLS[idx % WIPE_COLS.length], n = 5, bh = (H + 420) / n + 40;
  push(); translate(W / 2, H / 2); rotate(-.1); translate(-W / 2, -H / 2);
  for (let i = 0; i < n; i++) {
    const y0 = -230 + i * (H + 420) / n, d = [0, .14, .06, .18, .1][i];
    const q = p < .5 ? easeOut(clamp((p * 2 - d) / (1 - d))) : ease(clamp(((p - .5) * 2 - d) / (1 - d)));
    const x0 = p < .5 ? -300 : lerp(-300, W + 400, q), x1 = p < .5 ? lerp(-300, W + 400, q) : W + 400;
    if (x1 - x0 < 30) continue;
    const pts = [], rag = (k, side) => side * (40 + 50 * hash(i * 31 + k)) + jit(12);
    for (let k = 0; k <= 8; k++) pts.push([lerp(x0, x1, k / 8), y0 + Math.sin(k * .9 + i) * 14 + jit(5)]);
    for (let k = 1; k < 9; k++) pts.push([x1 + rag(k, 1) - 40, y0 + bh * k / 9]);
    for (let k = 8; k >= 0; k--) pts.push([lerp(x0, x1, k / 8), y0 + bh + Math.sin(k * .8 + i * 2) * 14 + jit(5)]);
    if (p >= .5) for (let k = 8; k > 0; k--) pts.push([x0 - rag(k + 20, 1) + 40, y0 + bh * k / 9]);
    paint(pts, { wash: i % 2 ? c1 : c2, washOp: 255, fill: i % 2 ? c2 : c1, fillOp: 70, bleed: .05, tex: .8, border: .6, ink: null,
      hatch: { d: 44, a: 0, o: { rand: .6, gradient: .5 }, b: 'charcoal', c: i % 2 ? c2 : PAL.cream, w: .8 } });
  }
  pop();
}

// ---------- karaoke (word-synced from the forced alignment) ----------
function karaoke(t) {
  const L = LY.find(l => t >= l[0] - .12 && t < l[1]); if (!L) return;
  const [a, b, txt, ws] = L;
  outX.font = '800 50px "Shantell Sans", sans-serif';
  const tw = outX.measureText(txt).width, grow = easeOut((t - (a - .12)) / .18) * (1 - ease((t - (b - .12)) / .12));
  if (grow < .02) return;
  const w = (tw + 110) * grow, x0 = 960 - w / 2, y0 = 978;
  const pts = [[x0 + jit(8), y0 + jit(4)], [x0 + w / 2, y0 - 4 + jit(4)], [x0 + w + jit(8), y0 + jit(4)], [x0 + w + 14 + jit(8), y0 + 44], [x0 + w + jit(8), y0 + 88 + jit(4)], [x0 + w / 2, y0 + 92 + jit(4)], [x0 + jit(8), y0 + 88 + jit(4)], [x0 - 14 + jit(8), y0 + 44]];
  paint(pts, { wash: PAL.suno, washOp: 225, fill: PAL.gViolet, fillOp: 70, tex: .7, border: .4, ink: null });
  KARAOKE = { a, b, txt, ws, grow };
}
function drawKaraokeText(c) {
  if (!KARAOKE || KARAOKE.grow < .85) return;
  const { b, txt, ws: starts } = KARAOKE, t = T;
  c.font = '800 50px "Shantell Sans", sans-serif'; c.textBaseline = 'middle'; c.textAlign = 'left';
  const words = txt.split(' '), sp = c.measureText(' ').width, ws = words.map(w => c.measureText(w).width);
  const total = ws.reduce((p, q) => p + q, 0) + sp * (words.length - 1);
  let x = 960 - total / 2; const y = 1022;
  words.forEach((w, i) => {
    const s0 = starts[i], s1 = i + 1 < starts.length ? Math.min(starts[i + 1], s0 + .9) : Math.min(b - .3, s0 + .9);
    const f = clamp((t - s0) / Math.max(.12, s1 - s0));
    c.fillStyle = PAL.cream; c.fillText(w, x, y);
    if (f > 0) { c.save(); c.beginPath(); c.rect(x - 2, y - 40, ws[i] * f + 2, 80); c.clip(); c.fillStyle = PAL.lemon; c.fillText(w, x, y); c.restore(); }
    x += ws[i] + sp;
  });
}
