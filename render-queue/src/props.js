// props.js: small shared effects. Everything is in world coordinates of the 1920x1080 frame.
//   sparkleBurst(x, y, r, age, o)   radial burst of little Gemini sparkles (age in s since the hit; o.n, o.cols, o.life)
//   confetti(t, x0, x1, y0, o)      falling candy confetti across [x0, x1], starting at y0 (o.n, o.speed, o.seed)
//   notes(x, y, t, o)               music notes that float up and sway from (x, y) (o.n, o.col, o.spread)
//   speedLines(cx, cy, k, col)      comic radial speed lines around (cx, cy), k = 0..1 strength
//   screenBox(x, y, w, h, o)        a rounded chunky monitor/phone frame with a glowing screen (o.glow colour, o.bezel)
//   progressBar(x, y, w, h, p, o)   candy-striped progress bar, p = 0..1 (o.col)

function sparkleBurst(x, y, r, age, o = {}) {
  const life = o.life ?? .7; if (age < 0 || age > life) return;
  const n = o.n ?? 9, cols = o.cols || [PAL.lemon, PAL.gBlue, PAL.gPink, PAL.mint, PAL.gViolet], k = easeOut(age / life), fade = 1 - seg(age, life * .6, life);
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + hash(i + (o.seed || 0)) * .5, d = r * (.3 + k * (.8 + hash(i * 3 + 1) * .5)), s = r * .16 * fade * (.6 + hash(i * 7) * .6);
    if (s < 2) continue;
    paint(sparklePts(x + Math.cos(a) * d, y + Math.sin(a) * d, s, .6, k * 2), { wash: cols[i % cols.length], ink: PAL.ink, sw: .6 });
  }
}
function confetti(t, x0, x1, y0, o = {}) {
  const n = o.n ?? 40, sp = o.speed ?? 260, cols = o.cols || [PAL.lemon, PAL.magenta, PAL.cyan, PAL.mint, PAL.coral, PAL.gViolet];
  for (let i = 0; i < n; i++) {
    const hx = hash(i * 1.3 + (o.seed || 0)), hy = hash(i * 2.7 + 5 + (o.seed || 0)), x = lerp(x0, x1, hx) + Math.sin(t * 3 + i) * 30;
    const y = y0 + ((t * sp * (.7 + hy * .6) + hy * 1200) % 1300) - 100, a = t * 4 + i;
    paint(rectPts(x - 9, y - 5, 18 * Math.abs(Math.cos(a)) + 3, 10), { wash: cols[i % cols.length], ink: null });
  }
}
function notes(x, y, t, o = {}) {
  const n = o.n ?? 5, col = o.col || PAL.ink, spread = o.spread ?? 160;
  for (let i = 0; i < n; i++) {
    const ph = frac(t * .6 + i / n), nx = x + Math.sin(ph * TAU + i) * spread * .4 + (hash(i) - .5) * spread, ny = y - ph * 420, s = 22 * (1 - ph * .3);
    if (ph > .9) continue;
    paint(ellPts(nx, ny, s * .7, s * .52, 10, 0, -.4), { wash: col, ink: null });
    inkLine([[nx + s * .6, ny], [nx + s * .6, ny - s * 2.2], [nx + s * 1.4, ny - s * 1.6]], 1.4, col, 'ink', 0);
  }
}
function speedLines(cx, cy, k, col = PAL.ink, n = 26) {
  if (k < .02) return;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + hash(i + Math.floor(T * 12)) * .2, r0 = 520 + hash(i * 5) * 260, r1 = r0 + 500 * k;
    paint([[cx + Math.cos(a - .012) * r0, cy + Math.sin(a - .012) * r0], [cx + Math.cos(a) * r1 * 2, cy + Math.sin(a) * r1 * 2], [cx + Math.cos(a + .012) * r0, cy + Math.sin(a + .012) * r0]], { wash: col, washOp: 200 * k, ink: null });
  }
}
function screenBox(x, y, w, h, o = {}) {
  const bz = o.bezel ?? Math.min(w, h) * .07, glow = o.glow || PAL.cyan;
  paint(rrPts(x, y, w, h, bz * 1.6, 1.5), { wash: o.frame || PAL.suno, ink: PAL.ink, sw: 1.2 });
  paint(rrPts(x + bz, y + bz, w - 2 * bz, h - 2 * bz, bz * .8, 1), { wash: glow, fill: '#FFFFFF', fillOp: 50, tex: .4, ink: PAL.ink, sw: .7 });
}
function progressBar(x, y, w, h, p, o = {}) {
  paint(rrPts(x, y, w, h, h / 2, 1.5), { wash: o.bg || PAL.suno, ink: PAL.ink, sw: 1.2 });
  const iw = (w - 12) * clamp(p);
  if (iw > h * .4) {
    paint(rrPts(x + 6, y + 6, iw, h - 12, (h - 12) / 2, 1), { wash: o.col || PAL.mint, ink: null });
    for (let sx = x + 6 - (T * 80 % 60); sx < x + 6 + iw - 20; sx += 60) if (sx > x + 6) paint([[sx, y + h - 8], [sx + 22, y + h - 8], [sx + 40, y + 8], [sx + 18, y + 8]], { wash: '#FFFFFF', washOp: 70, ink: null });
  }
}
