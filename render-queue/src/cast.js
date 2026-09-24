// cast.js: the four characters of "I woke up in the render queue".
//
//   gemi(x, y, u, o)   Gemi: the Gemini sparkle come to life. Four-point star body (blue → violet → pink), big face in
//                      the middle, the left/right tips are its arms, two stubby legs under the bottom tip.
//                      Body is 10u tall (centre at local (0, -6.6u)), ~11.6u tall standing. (x, y) = ground point.
//   suno(x, y, u, o)   Suno: the current Suno logo come to life. A round amber→red-orange→pink grainy orb with the cream
//                      SUNO wordmark across its middle (the letters bounce like a waveform when it sings), eyes above the
//                      wordmark, mouth below, noodle arms, cream sneakers. Orb radius 5u centred at local (0, −6.4u);
//                      ~11.4u tall standing.
//   tune(x, y, u, o)   Tune: the song itself, the "I" who sings. A little living eighth note, child of Gemi and Suno:
//                      the note-head body blends blue-violet into pink-amber, and the flag on its stem waves like a ponytail.
//                      ~12u tall to the stem top, head ~6.4u wide. `gold: 1` turns it to shining gold.
//   human(x, y, s, o)  "You": the human who prompted the song. Orange hoodie, messy hair, bored half-lidded eyes.
//                      About 13.2s tall (like the P(doom) researcher), so s ≈ .85u puts their head at a robot's eye line.
//
// Shared options (all three): dy (units, negative = up), sq (squash, negative stretches), rot, flip, sx/sy,
//   aL/aR (arm angle: 0 = straight out, positive raised, negative lowered), walk (phase), eyes, mouth, blush,
//   lookX/lookY (−1..1), squint/take (from mood()), emote/emoteK, draw (hook in body-local space),
//   armL/armR (hooks at the hand/tip, arm space: +x = outward along the arm), noShadow, seed (blink offset).
// Eyes: normal, look, happy, closed, wink, angry, scared, spark (stars), heart, x, swirl, dot, shades, sleepy, wide, cry
//   (human also: lazy, screen, dot). Mouths: smile, grin, o, O, flat, wobble, cat, sing (animated), tongue, frown.
// Hats (gemi/suno): party, crown, shades (use eyes:'shades'), headphones, beret, halo, toque, tophat.

// ======================================================================================================
// shared face bits
// ======================================================================================================
function toonEye(cx, cy, rx, ry, e, o, sw, side, onDark) {
  const blink = (e === 'normal' || e === 'look') && (((T * .9 + (o.seed || 0) * 1.7 + side * .02) % 3.3 + 3.3) % 3.3) < .12;
  const lx = (e === 'look' || e === 'normal') ? (o.lookX || 0) * rx * .45 : 0, ly = (e === 'look' || e === 'normal') ? (o.lookY || 0) * ry * .35 : 0;
  const lineC = onDark ? PAL.cream : PAL.ink;
  if (e === 'normal' || e === 'look' || e === 'wide' || e === 'scared' || e === 'cry') {
    if (blink) { inkLine([[cx - rx, cy + ry * .1], [cx, cy + ry * .35], [cx + rx, cy + ry * .1]], sw * 1.1, lineC, 'ink', .5); return; }
    const big = e === 'wide' || e === 'scared';
    paint(ellPts(cx, cy, rx * (big ? 1.12 : 1), ry * (big ? 1.12 : 1), 18), { wash: PAL.cream, ink: PAL.ink, sw: sw * .8 });
    const pr = e === 'scared' ? .32 : .58;
    paint(ellPts(cx + lx, cy + ly + ry * .08, rx * pr, ry * pr * 1.05, 14), { wash: PAL.ink, ink: null });
    paint(ellPts(cx + lx + rx * .2, cy + ly - ry * .22, rx * .2, ry * .18, 8), { wash: '#FFFFFF', ink: null });
    if (e === 'cry') paint([[cx - rx * .6, cy + ry * .9], [cx - rx * .2, cy + ry * .9], [cx - rx * .3, cy + ry * 2.4 + jit(ry * .1)], [cx - rx * .7, cy + ry * 2.2]], { wash: PAL.sky, ink: PAL.ink, sw: sw * .4, curv: .6 });
  } else if (e === 'happy') inkLine([[cx - rx, cy + ry * .35], [cx, cy - ry * .45], [cx + rx, cy + ry * .35]], sw * 1.4, lineC, 'ink', .5);
  else if (e === 'closed' || e === 'sleepy') inkLine([[cx - rx, cy], [cx, cy + ry * .45], [cx + rx, cy]], sw * 1.3, lineC, 'ink', .5);
  else if (e === 'wink') {
    if (side < 0) inkLine([[cx - rx, cy + ry * .35], [cx, cy - ry * .45], [cx + rx, cy + ry * .35]], sw * 1.4, lineC, 'ink', .5);
    else toonEye(cx, cy, rx, ry, 'normal', { ...o, seed: 99 }, sw, side, onDark);
  } else if (e === 'angry') {
    paint([[cx - rx, cy - ry * (side < 0 ? .6 : .1)], [cx + rx, cy - ry * (side < 0 ? .1 : .6)], [cx + rx * .8, cy + ry * .7], [cx - rx * .8, cy + ry * .7]], { wash: PAL.cream, ink: PAL.ink, sw: sw * .8, curv: .3 });
    paint(ellPts(cx, cy + ry * .25, rx * .38, ry * .38, 10), { wash: PAL.ink, ink: null });
  } else if (e === 'spark') {
    paint(ellPts(cx, cy, rx * 1.5, ry * 1.4, 16), { fill: PAL.lemon, fillOp: 110, bleed: .3, ink: null });
    paint(starPts(cx, cy, ry * 1.25 * (1 + .14 * Math.sin(T * 14 + side))), { wash: PAL.lemon, fill: PAL.cream, fillOp: 90, ink: PAL.ink, sw: sw * .6 });
  } else if (e === 'heart') paint(heartPts(cx, cy, ry * 1.1 * (1 + .1 * Math.sin(T * 12))), { wash: '#E2476E', fill: PAL.bubble, fillOp: 90, ink: PAL.ink, sw: sw * .6 });
  else if (e === 'x') {
    inkLine([[cx - rx * .8, cy - ry * .7], [cx + rx * .8, cy + ry * .7]], sw * 1.2, lineC, 'ink', 0);
    inkLine([[cx + rx * .8, cy - ry * .7], [cx - rx * .8, cy + ry * .7]], sw * 1.2, lineC, 'ink', 0);
  } else if (e === 'swirl') {
    paint(ellPts(cx, cy, rx, ry, 16), { wash: PAL.cream, ink: PAL.ink, sw: sw * .7 });
    const sp = []; for (let k = 0; k < 16; k++) { const a = k * .7 + T * 7 * side, r = k / 16 * rx * .9; sp.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * ry / rx]); }
    inkLine(sp, sw * .6, PAL.ink, 'inkfine', .6);
  } else if (e === 'dot') paint(ellPts(cx, cy, rx * .42, ry * .42, 10), { wash: onDark ? PAL.cream : PAL.ink, ink: null });
}
function toonMouth(cx, cy, w, m, sw, onDark) {
  if (!m) return;
  const lc = onDark ? PAL.cream : PAL.ink, IN = '#5A1F33';
  if (m === 'smile') inkLine([[cx - w, cy - w * .2], [cx, cy + w * .45], [cx + w, cy - w * .2]], sw, lc, 'ink', .6);
  else if (m === 'grin') { paint([[cx - w * 1.2, cy - w * .3], [cx + w * 1.2, cy - w * .3], [cx + w * .7, cy + w * .75], [cx - w * .7, cy + w * .75]], { wash: IN, ink: PAL.ink, sw: sw * .7, curv: .45 }); paint(ellPts(cx, cy + w * .45, w * .5, w * .22, 10), { wash: PAL.rose, ink: null }); }
  else if (m === 'o') paint(ellPts(cx, cy + w * .15, w * .38, w * .45, 12), { wash: IN, ink: PAL.ink, sw: sw * .6 });
  else if (m === 'O') { paint(ellPts(cx, cy + w * .3, w * .72, w * .9, 14), { wash: IN, ink: PAL.ink, sw: sw * .7 }); paint(ellPts(cx, cy + w * .75, w * .42, w * .25, 10), { wash: PAL.rose, ink: null }); }
  else if (m === 'sing') { const k = .35 + .65 * Math.abs(Math.sin(T * 9.3)); paint(ellPts(cx, cy + w * .25, w * (.55 + .2 * k), w * .85 * k, 14), { wash: IN, ink: PAL.ink, sw: sw * .7 }); }
  else if (m === 'flat') inkLine([[cx - w * .7, cy], [cx + w * .7, cy]], sw, lc, 'ink', 0);
  else if (m === 'wobble') inkLine([[cx - w, cy], [cx - w * .5, cy - w * .25], [cx, cy], [cx + w * .5, cy - w * .25], [cx + w, cy]], sw * .9, lc, 'ink', .3);
  else if (m === 'cat') inkLine([[cx - w, cy - w * .1], [cx - w * .5, cy + w * .3], [cx, cy - w * .1], [cx + w * .5, cy + w * .3], [cx + w, cy - w * .1]], sw * .9, lc, 'ink', .5);
  else if (m === 'tongue') { inkLine([[cx - w, cy - w * .2], [cx, cy + w * .4], [cx + w, cy - w * .2]], sw, lc, 'ink', .6); paint(ellPts(cx + w * .25, cy + w * .55, w * .3, w * .4, 10), { wash: PAL.rose, ink: PAL.ink, sw: sw * .5 }); }
  else if (m === 'frown') inkLine([[cx - w, cy + w * .3], [cx, cy - w * .25], [cx + w, cy + w * .3]], sw, lc, 'ink', .6);
}
function shadesAt(cx, cy, w, sw) {
  // chunky cartoon sunglasses centred at (cx, cy), total width 2w
  paint([[cx - w, cy - w * .28], [cx - w * .08, cy - w * .28], [cx - w * .16, cy + w * .2], [cx - w * .8, cy + w * .26]], { wash: PAL.ink, ink: null, curv: .3 });
  paint([[cx + w * .08, cy - w * .28], [cx + w, cy - w * .28], [cx + w * .8, cy + w * .26], [cx + w * .16, cy + w * .2]], { wash: PAL.ink, ink: null, curv: .3 });
  inkLine([[cx - w * 1.1, cy - w * .3], [cx + w * 1.1, cy - w * .3]], sw * 1.2, PAL.ink, 'ink', 0);
  inkLine([[cx - w * .75, cy - w * .15], [cx - w * .5, cy - w * .15]], sw * .6, PAL.cyan, 'inkfine', 0);
  inkLine([[cx + w * .3, cy - w * .15], [cx + w * .55, cy - w * .15]], sw * .6, PAL.cyan, 'inkfine', 0);
}
// Hats for the robots. (hx, hy) = top-centre of the head in local space, w = head half-width.
function toonHat(h, hx, hy, w, sw) {
  if (!h) return;
  if (h === 'party') {
    paint([[hx - w * .38, hy + w * .1], [hx + w * .05, hy - w * 1.1], [hx + w * .42, hy + w * .1]], { wash: PAL.magenta, fill: PAL.lemon, fillOp: 60, ink: PAL.ink, sw: sw * .8 });
    paint(ellPts(hx + w * .05, hy - w * 1.12, w * .15, w * .15, 10), { wash: PAL.lemon, ink: PAL.ink, sw: sw * .5 });
  } else if (h === 'crown') {
    paint([[hx - w * .55, hy + w * .1], [hx - w * .55, hy - w * .5], [hx - w * .27, hy - w * .2], [hx, hy - w * .62], [hx + w * .27, hy - w * .2], [hx + w * .55, hy - w * .5], [hx + w * .55, hy + w * .1]], { wash: PAL.lemon, fill: PAL.ochre, fillOp: 90, ink: PAL.ink, sw: sw * .8 });
    for (const gx of [-.27, 0, .27]) paint(ellPts(hx + gx * w, hy - w * .02, w * .07, w * .07, 8), { wash: gx ? PAL.cyan : PAL.magenta, ink: null });
  } else if (h === 'headphones') {
    inkLine([[hx - w * .95, hy + w * .75], [hx - w * .8, hy - w * .25], [hx, hy - w * .55], [hx + w * .8, hy - w * .25], [hx + w * .95, hy + w * .75]], sw * 2.2, PAL.ink, 'ink', .7);
    for (const s of [-1, 1]) paint(rrPts(hx + s * w * .95 - w * .22, hy + w * .5, w * .44, w * .7, w * .18), { wash: PAL.magenta, fill: PAL.grape, fillOp: 60, ink: PAL.ink, sw: sw * .8 });
  } else if (h === 'beret') {
    paint(ellPts(hx - w * .1, hy - w * .05, w * .75, w * .3, 16, 0, -.15), { wash: '#D8394E', fill: '#8E1F33', fillOp: 60, ink: PAL.ink, sw: sw * .8 });
    inkLine([[hx - w * .1, hy - w * .35], [hx - w * .05, hy - w * .5]], sw, PAL.ink, 'ink', 0);
  } else if (h === 'halo') {
    brush.noFill(); brush.noWash(); brush.noHatch(); brush.set('ink', PAL.lemon, sw * 1.6);
    brush.beginShape(0); for (const p of ellPts(hx, hy - w * .45, w * .6, w * .16, 20)) brush.vertex(p[0], p[1]); brush.endShape(true);
  } else if (h === 'toque') {
    paint([[hx - w * .45, hy + w * .05], [hx - w * .55, hy - w * .6], [hx - w * .2, hy - w * .85], [hx + w * .2, hy - w * .85], [hx + w * .55, hy - w * .6], [hx + w * .45, hy + w * .05]], { wash: PAL.cream, ink: PAL.ink, sw: sw * .8, curv: .5 });
  } else if (h === 'tophat') {
    paint(rectPts(hx - w * .38, hy - w * .85, w * .76, w * .85), { wash: PAL.ink, ink: null });
    paint(rectPts(hx - w * .38, hy - w * .28, w * .76, w * .14), { wash: PAL.magenta, ink: null });
    paint(ellPts(hx, hy, w * .62, w * .1, 16), { wash: PAL.ink, ink: null });
  }
}

// Chaikin corner-cutting (smooths a polyline), and a filled polygon that traces a path at width w (closed = ring).
function chaikin(P, closed = false, it = 2) {
  for (let k = 0; k < it; k++) {
    const Q = closed ? [] : [P[0]], n = P.length;
    for (let i = 0; i < (closed ? n : n - 1); i++) { const a = P[i], b = P[(i + 1) % n]; Q.push([lerp(a[0], b[0], .25), lerp(a[1], b[1], .25)], [lerp(a[0], b[0], .75), lerp(a[1], b[1], .75)]); }
    if (!closed) Q.push(P[n - 1]); P = Q;
  }
  return P;
}
function thickPath(P, w, closed = false) {
  const n = P.length, L = [], Rr = [];
  for (let i = 0; i < n; i++) {
    const a = P[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = P[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    L.push([P[i][0] - dy * w / 2, P[i][1] + dx * w / 2]); Rr.push([P[i][0] + dy * w / 2, P[i][1] - dx * w / 2]);
  }
  if (closed) { L.push(L[0]); Rr.push(Rr[0]); }
  return L.concat(Rr.reverse());
}
// Keep the part of a polygon where f(x, y) >= d (single half-plane clip; f must be linear).
function clipHalf(pts, f, d) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], fa = f(a[0], a[1]) - d, fb = f(b[0], b[1]) - d;
    if (fa >= 0) out.push(a);
    if ((fa >= 0) !== (fb >= 0)) { const k = fa / (fa - fb); out.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k)]); }
  }
  return out.length > 2 ? out : [[-9999, -9999], [-9998, -9999], [-9999, -9998]];
}

// ======================================================================================================
// GEMI — the Gemini sparkle
// ======================================================================================================
function gemi(x, y, u, o = {}) {
  const sq = (o.sq || 0) + (o.take || 0), dy = (o.dy || 0) * u, sw = clamp(u / 13, .45, 2.4) * (o.swMul || 1);
  const cA = o.colA || PAL.gBlue, cB = o.colB || PAL.gViolet, cC = o.colC || PAL.gPink;
  if (!o.noShadow) { const f = 1 - Math.min(.55, Math.abs(o.dy || 0) * .05); paint(ellPts(x, y + u * .12, u * 3.6 * f, u * .75 * f, 16), { fill: PAL.ink, fillOp: 80, bleed: .25, tex: .3, border: .1, ink: null }); }
  if (o.glow) paint(ellPts(x, y + dy - 6.6 * u, u * 8.5, u * 8.5, 22, u * .3), { fill: PAL.lemon, fillOp: 90 * o.glow, bleed: .35, tex: .3, ink: null });
  push();
  translate(x, y + dy);
  if (o.rot) rotate(o.rot);
  const spinX = o.spin != null ? Math.cos(o.spin * TAU) : 1;
  scale((o.flip ? -1 : 1) * (o.sx ?? 1) * spinX * (1 + sq * .6), (o.sy ?? 1) * (1 - sq));
  const cy = -6.6 * u, R = 5 * u;

  // legs
  if (!o.noLegs) [-1, 1].forEach((sd, i) => {
    let h = 2.9;
    if (o.walk != null) { const ph = Math.sin((o.walk + (i ? .5 : 0)) * TAU); if (ph > 0) h -= ph * 1.1; }
    const lx = sd * .85 * u;
    paint(rrPts(lx - .42 * u, -2.9 * u, .84 * u, h * u, .4 * u), { wash: PAL.grape, ink: PAL.ink, sw: sw * .7 });
    paint(ellPts(lx + sd * .25 * u, -2.9 * u + h * u - .1 * u, .78 * u, .42 * u, 12), { wash: o.shoe || PAL.magenta, ink: PAL.ink, sw: sw * .6 });
  });

  // body: tips. Side tips are the arms (aL/aR rotate them up/down around the centre).
  const aR = o.aR ?? .15, aL = o.aL ?? .15, lean = o.lean || 0;
  const tip = (ang, len) => [Math.cos(ang) * len, cy + Math.sin(ang) * len];
  const angR = clamp(aR, -1.6, 2) * .38, angL = clamp(aL, -1.6, 2) * .38;
  const tips = [tip(-Math.PI / 2 + lean, R * (o.tall || 1.02)), tip(-angR, R * (o.reachR || 1)), tip(Math.PI / 2, R * .98), tip(Math.PI + angL, R * (o.reachL || 1))];
  const body = sparkleFromTips(tips, [0, cy], o.pinch ?? .6, 11);
  // Gemini gradient, bottom-left blue → violet → pink top-right, as half-plane slices of the body itself
  const dg = (x, y) => (x - (y - cy)) / Math.SQRT2;
  paint(body, { wash: cA, washOp: 255, ink: null });
  const bands = [[-.42, .2], [-.26, .4], [-.1, .6], [.06, .8], [.22, 1], [.36, 1.25], [.5, 1.5], [.64, 1.75], [.78, 2]];
  for (const [th, k] of bands) paint(clipHalf(body, dg, R * th), { wash: k <= 1 ? mixCol(cA, cB, k) : mixCol(cB, cC, k - 1), washOp: 255, ink: null });
  paint(ellPts(R * .15, cy - R * .15, R * .55, R * .55, 14), { fill: cB, fillOp: 70, bleed: .1, tex: .7, border: .5, ink: null });
  paint(clipHalf(body, (x, y) => -dg(x, y), R * .45), { wash: '#3A6FD8', washOp: 130, ink: null });
  paint(ellPts(-R * .2, cy - R * .5, R * .07, R * .2, 8, 0, -.3), { wash: '#FFFFFF', washOp: 160, ink: null });   // shine
  paint(body, { ink: PAL.ink, sw });

  // face
  const fx = (o.faceX || 0) * u, fy = cy + (o.faceY || 0) * u;
  if (o.blush) for (const bx of [-1.75, 1.75]) paint(ellPts(fx + bx * u, fy + .55 * u, u * .55, u * .3, 12), { fill: PAL.bubble, fillOp: 200, bleed: .2, ink: null });
  const e = (o.squint || 0) > .6 ? 'closed' : (o.eyes || 'normal');
  if (e === 'shades') shadesAt(fx, fy - .45 * u, 2.2 * u, sw);
  else for (const s of [-1, 1]) toonEye(fx + s * .95 * u, fy - .45 * u, .6 * u, .85 * u * (1 - (o.squint || 0) * .8), e, o, sw, s, false);
  toonMouth(fx, fy + .85 * u, .55 * u, o.mouth ?? 'smile', sw, false);
  toonHat(o.hat, lean * R * .8, cy - R * 1.0 + u * .9, 2.4 * u, sw);

  // hooks at the side tips (arm space: +x outward)
  const hook = (fn, t, side) => { if (!fn) return; push(); translate(t[0], t[1]); rotate(side > 0 ? -angR : angL); if (side < 0) scale(-1, 1); fn(u, sw); pop(); };
  hook(o.armR, tips[1], 1); hook(o.armL, tips[3], -1);
  if (o.draw) o.draw(u, sw);
  pop();
  if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * 4.4 * u, y + dy - 11.2 * u, u * .9, o.emoteK ?? 1);
}

// ======================================================================================================
// SUNO — the Suno logo: an amber → red-orange → pink grainy orb with the cream SUNO wordmark across it
// Local: orb centre (0, −6.4u), radius 5u (bottom at −1.4u), legs to y 0. Eyes above the wordmark, mouth below.
// Extra options: sing (0..1: the wordmark letters bounce like a live waveform), waveLive (idle letter bob),
//   colA/colB/colC (gradient override), noMark (hide the wordmark).
// ======================================================================================================
function sunoMark(cx, cy, u, sw, o = {}) {
  // SUNO wordmark in thick cream strokes, ~7.6u wide, letters ~1.9u tall, centred on (cx, cy)
  const hh = .95 * u, hw = .66 * u, col = o.markCol || '#FFFCF4', wt = u * (o.markW || .34), sing = o.sing || 0, live = o.waveLive ?? .06;
  const bob = i => (Math.sin(T * 5.2 + i * 1.1) * live + Math.sin(T * 17 + i * 1.7) * sing * .35) * u;
  [-2.85, -.95, .95, 2.85].forEach((lx, i) => {
    const x = cx + lx * u, y = cy + bob(i);
    let P;
    if (i === 0) P = [[x + hw * .9, y - hh * .72], [x + hw * .15, y - hh], [x - hw * .85, y - hh * .68], [x - hw * .55, y - hh * .08], [x + hw * .55, y + hh * .08], [x + hw * .85, y + hh * .68], [x - hw * .15, y + hh], [x - hw * .9, y + hh * .72]];
    else if (i === 1) P = [[x - hw, y - hh], [x - hw, y + hh * .25], [x - hw * .55, y + hh * .9], [x, y + hh], [x + hw * .55, y + hh * .9], [x + hw, y + hh * .25], [x + hw, y - hh]];
    else if (i === 2) P = [[x - hw, y + hh], [x - hw, y - hh], [x - hw * .1, y - hh * .1], [x + hw * .1, y + hh * .1], [x + hw, y + hh], [x + hw, y - hh]];
    else P = ellPts(x, y, hw * 1.02, hh, 24);
    paint(thickPath(i === 2 ? P : chaikin(P, i === 3, 2), wt, i === 3), { wash: col, washOp: 255, ink: null });
  });
}
function suno(x, y, u, o = {}) {
  const sq = (o.sq || 0) + (o.take || 0), dy = (o.dy || 0) * u, sw = clamp(u / 13, .45, 2.4) * (o.swMul || 1);
  const cA = o.colA || PAL.sunoA, cB = o.colB || PAL.sunoB, cC = o.colC || PAL.sunoC;
  if (!o.noShadow) { const f = 1 - Math.min(.55, Math.abs(o.dy || 0) * .05); paint(ellPts(x, y + u * .12, u * 4.6 * f, u * .85 * f, 16), { fill: PAL.ink, fillOp: 80, bleed: .25, tex: .3, border: .1, ink: null }); }
  if (o.glow) paint(ellPts(x, y + dy - 6.4 * u, u * 8.5, u * 8.5, 22, u * .3), { fill: PAL.sunoA, fillOp: 90 * o.glow, bleed: .35, tex: .3, ink: null });
  push();
  translate(x, y + dy);
  if (o.rot) rotate(o.rot);
  const spinX = o.spin != null ? Math.cos(o.spin * TAU) : 1;
  scale((o.flip ? -1 : 1) * (o.sx ?? 1) * spinX * (1 + sq * .6), (o.sy ?? 1) * (1 - sq));
  const cy = -6.4 * u, R = 5 * u;

  if (!o.noLegs) [-1, 1].forEach((sd, i) => {
    let h = 2.3;
    if (o.walk != null) { const ph = Math.sin((o.walk + (i ? .5 : 0)) * TAU); if (ph > 0) h -= ph * .9; }
    const lx = sd * 1.9 * u;
    paint(rrPts(lx - .45 * u, -2.3 * u, .9 * u, h * u, .4 * u), { wash: '#C2381C', ink: PAL.ink, sw: sw * .7 });
    paint([[lx - 1 * u, -2.3 * u + h * u + .15 * u], [lx - .9 * u, -2.3 * u + h * u - .5 * u], [lx + .9 * u + sd * .2 * u, -2.3 * u + h * u - .45 * u], [lx + 1.2 * u + sd * .2 * u, -2.3 * u + h * u + .15 * u]], { wash: o.shoe || PAL.cream, fill: PAL.gPink, fillOp: 60, ink: PAL.ink, sw: sw * .6, curv: .4 });
  });

  // noodle arms with cream mittens
  const arm = (side, a, hook) => {
    push(); translate(side * 4.6 * u, -5.9 * u); rotate(side < 0 ? a : -a);
    const L = 3 * u;
    paint(rrPts(side < 0 ? -L : 0, -.45 * u, L, .9 * u, .45 * u), { wash: cB, ink: PAL.ink, sw: sw * .7 });
    translate(side * L, 0);
    paint(ellPts(0, 0, .72 * u, .68 * u, 12), { wash: PAL.cream, ink: PAL.ink, sw: sw * .6 });
    if (hook) { if (side < 0) scale(-1, 1); hook(u, sw); }
    pop();
  };
  arm(-1, o.aL ?? -.3, o.armL); arm(1, o.aR ?? -.3, o.armR);

  // orb: red-orange base, amber sweeping in from the top-left, hot pink pooling at the bottom-left
  const body = ellPts(0, cy, R, R, 40, u * .03);
  const f = (x, yy) => (-x - (yy - cy)) / Math.SQRT2;     // grows toward the top-left
  paint(body, { wash: cB, washOp: 255, ink: null });
  for (let j = 0; j < 9; j++) { const th = -.1 + j * .12, k = (j + 1) / 9; paint(clipHalf(body, f, R * th), { wash: mixCol(cB, cA, k), washOp: 255, ink: null }); }
  const g = (x, yy) => (-x + (yy - cy)) / Math.SQRT2;     // grows toward the bottom-left
  for (let j = 0; j < 6; j++) { const th = .5 + j * .07, k = (j + 1) / 6; paint(clipHalf(body, g, R * th), { wash: mixCol(cB, cC, k), washOp: 255, ink: null }); }
  paint(body, { fill: '#B8321A', fillOp: 45, bleed: .04, tex: .95, border: .5, ink: null });           // grain
  paint(ellPts(-2.2 * u, cy - 3 * u, 1.1 * u, .45 * u, 12, 0, -.6), { wash: '#FFFFFF', washOp: 120, ink: null });   // shine
  paint(body, { ink: PAL.ink, sw });

  // face: eyes above the wordmark, mouth below it
  if (o.blush) for (const bx of [-3.2, 3.2]) paint(ellPts(bx * u, cy - 1.6 * u, u * .6, u * .32, 12), { fill: PAL.bubble, fillOp: 220, bleed: .2, ink: null });
  const e = (o.squint || 0) > .6 ? 'closed' : (o.eyes || 'normal');
  if (e === 'shades') shadesAt(0, cy - 2.4 * u, 3 * u, sw);
  else for (const s of [-1, 1]) toonEye(s * 1.55 * u, cy - 2.45 * u, .66 * u, .85 * u * (1 - (o.squint || 0) * .8), e, o, sw, s, false);
  if (!o.noMark) sunoMark(0, cy + .15 * u, u, sw, o);
  toonMouth(0, cy + 2.35 * u, .55 * u, o.mouth ?? 'smile', sw, false);
  toonHat(o.hat, 0, cy - R + .6 * u, 3 * u, sw);
  if (o.draw) o.draw(u, sw);
  pop();
  if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * 5 * u, y + dy - 11.8 * u, u * .9, o.emoteK ?? 1);
}

// ======================================================================================================
// TUNE — the song itself (the "I" who sings). A little living eighth note, the child of Gemi and Suno:
// its note-head body blends Gemi's blue-violet into Suno's pink-amber, the stem rises from its right side and the
// flag on top waves like a ponytail. Local: head centre (0, −3.3u), head ~6.4u wide × 5u tall, stem top at y −12u,
// feet at y 0. Extra options: gold (0..1: turns it to shining gold), flagWave (default 1), noStem, glow.
// ======================================================================================================
function tune(x, y, u, o = {}) {
  const sq = (o.sq || 0) + (o.take || 0), dy = (o.dy || 0) * u, sw = clamp(u / 13, .45, 2.4) * (o.swMul || 1), gk = clamp(o.gold || 0);
  const G = c => mixCol(c, '#F7C948', gk * .85);
  if (!o.noShadow) { const f = 1 - Math.min(.55, Math.abs(o.dy || 0) * .05); paint(ellPts(x, y + u * .12, u * 3.4 * f, u * .7 * f, 16), { fill: PAL.ink, fillOp: 80, bleed: .25, tex: .3, border: .1, ink: null }); }
  if (o.glow) paint(ellPts(x, y + dy - 5 * u, u * 7.5, u * 7.5, 22, u * .3), { fill: gk > .5 ? PAL.lemon : PAL.bubble, fillOp: 100 * o.glow, bleed: .35, tex: .3, ink: null });
  push();
  translate(x, y + dy);
  if (o.rot) rotate(o.rot);
  const spinX = o.spin != null ? Math.cos(o.spin * TAU) : 1;
  scale((o.flip ? -1 : 1) * (o.sx ?? 1) * spinX * (1 + sq * .6), (o.sy ?? 1) * (1 - sq));
  const cy = -3.3 * u, hx = 3.2 * u, hy = 2.5 * u, tilt = -.32;

  // feet
  if (!o.noLegs) [-1, 1].forEach((sd, i) => {
    let lift = 0; if (o.walk != null) { const ph = Math.sin((o.walk + (i ? .5 : 0)) * TAU); if (ph > 0) lift = ph * .7 * u; }
    paint(ellPts(sd * 1.3 * u + sd * .2 * u, -.35 * u - lift, .85 * u, .45 * u, 12), { wash: G(PAL.grape), ink: PAL.ink, sw: sw * .6 });
  });
  // stem + waving flag
  const sx0 = 2.55 * u, stemTop = -12 * u;
  if (!o.noStem) {
    paint(rrPts(sx0 - .38 * u, stemTop, .76 * u, -stemTop + cy, .38 * u), { wash: G(PAL.suno), ink: PAL.ink, sw: sw * .6 });
    const wv = (o.flagWave ?? 1) * Math.sin(T * 6.5 + (o.seed || 0)), F = [];
    for (let i = 0; i <= 8; i++) { const k = i / 8; F.push([sx0 + k * 3.2 * u + Math.sin(k * 3) * .4 * u, stemTop + k * 4.4 * u + Math.sin(k * Math.PI) * wv * 1.1 * u - k * k * 1.2 * u]); }
    for (let i = 8; i >= 0; i--) { const k = i / 8; F.push([sx0 + k * 3.2 * u * .8 + .3 * u, stemTop + 1.6 * u + k * 3.6 * u + Math.sin(k * Math.PI) * wv * .9 * u - k * k * 1.2 * u]); }
    paint(F, { wash: G(PAL.lemon), fill: G(PAL.coral), fillOp: 80, bleed: .1, tex: .6, ink: PAL.ink, sw: sw * .7, curv: .4 });
  }
  // arms: tiny noodles off the sides of the head
  const arm = (side, a, hook) => {
    push(); translate(side * 2.9 * u, cy + .6 * u); rotate(side < 0 ? a : -a);
    paint(rrPts(side < 0 ? -2.1 * u : 0, -.32 * u, 2.1 * u, .64 * u, .32 * u), { wash: G(PAL.grape), ink: PAL.ink, sw: sw * .6 });
    translate(side * 2.1 * u, 0);
    paint(ellPts(0, 0, .5 * u, .48 * u, 10), { wash: PAL.cream, ink: PAL.ink, sw: sw * .5 });
    if (hook) { if (side < 0) scale(-1, 1); hook(u, sw); }
    pop();
  };
  arm(-1, o.aL ?? -.2, o.armL); arm(1, o.aR ?? -.2, o.armR);
  // head: Gemi's blue-violet at the top-left blending to Suno's pink and amber at the bottom-right
  const head = ellPts(0, cy, hx, hy, 34, u * .03, tilt), h = (px, py) => (px + (py - cy)) / Math.SQRT2;
  paint(head, { wash: G(PAL.gBlue), washOp: 255, ink: null });
  const stops = [PAL.gBlue, PAL.gViolet, PAL.gPink, PAL.sunoC, PAL.sunoB, PAL.sunoA];
  for (let j = 1; j < 12; j++) { const k = j / 11 * (stops.length - 1), c = mixCol(stops[Math.floor(k)], stops[Math.min(stops.length - 1, Math.floor(k) + 1)], frac(k)); paint(clipHalf(head, h, -hx * .95 + j * hx * .16), { wash: G(c), washOp: 255, ink: null }); }
  if (gk > .02) paint(head, { fill: PAL.ochre, fillOp: 90 * gk, bleed: .05, tex: .8, ink: null });
  paint(ellPts(-1.5 * u, cy - 1.3 * u, .9 * u, .35 * u, 10, 0, -.4), { wash: '#FFFFFF', washOp: 150, ink: null });
  paint(head, { ink: PAL.ink, sw });
  // face
  if (o.blush) for (const bx of [-1.9, 1.9]) paint(ellPts(bx * u, cy + .75 * u, u * .5, u * .28, 12), { fill: PAL.bubble, fillOp: 220, bleed: .2, ink: null });
  const e = (o.squint || 0) > .6 ? 'closed' : (o.eyes || 'normal');
  if (e === 'shades') shadesAt(0, cy - .35 * u, 2.3 * u, sw);
  else for (const s2 of [-1, 1]) toonEye(s2 * 1.05 * u, cy - .35 * u, .6 * u, .8 * u * (1 - (o.squint || 0) * .8), e, o, sw, s2, false);
  toonMouth(0, cy + 1.05 * u, .5 * u, o.mouth ?? 'smile', sw, false);
  toonHat(o.hat, -.6 * u, cy - hy + .3 * u, 2.4 * u, sw);
  if (gk > .3) for (let i = 0; i < 3; i++) { const a = T * 2 + i * 2.1; paint(starPts(Math.cos(a) * 3.8 * u, cy + Math.sin(a) * 3 * u, .55 * u * gk), { wash: PAL.cream, ink: null }); }
  if (o.draw) o.draw(u, sw);
  pop();
  if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * 3.6 * u, y + dy - 8 * u, u * .9, o.emoteK ?? 1);
}

// ======================================================================================================
// THE HUMAN ("you") — hoodie, messy hair, bored eyes
// Local: feet at y 0, hips −2.3s, shoulders (±1.75s, −7.6s), head centre (0, −10.7s) r 2.35s.
// Extra options: sit (on a beanbag/chair: legs forward), phone (glowing phone in right hand), hood (hood up),
//   hoodie/pants colours, hairUp, emote. Eyes add 'lazy' (half-lidded, default) and 'screen' (blue screen glints).
// ======================================================================================================
const SKIN = '#F2C4A0', HAIR = '#6B3E26', HOODIE = '#F29A38', HOODIE_DK = '#C46A1E', JEANS = '#4A5E9A';
function human(x, y, s, o = {}) {
  const sw = clamp(s / 13, .45, 2.2), J = s * .05, sq = (o.sq || 0) + (o.take || 0);
  const hood = o.hoodie || HOODIE, hoodDk = o.hoodieDk || HOODIE_DK, pants = o.pants || JEANS;
  if (!o.noShadow) paint(ellPts(x, y + s * .1, s * 3.2, s * .7, 18), { fill: PAL.ink, fillOp: 80, bleed: .2, tex: .3, border: .1, ink: null });
  push();
  translate(x, y + (o.dy || 0) * s);
  if (o.rot) rotate(o.rot);
  const sx = (o.flip ? -1 : 1) * (o.spin != null ? Math.cos(o.spin * TAU) : 1);
  scale(sx * (1 + sq * .5), 1 - sq);

  // legs
  if (o.sit) {
    for (const [side, i] of [[-1, 0], [1, 1]]) {
      const lx = side * .8 * s, kick = o.kick ? Math.sin(T * 8 + i * 2) * .15 : 0;
      push(); translate(lx, -2.3 * s); rotate(-1.35 + kick);
      paint(rrPts(-.5 * s, -.1 * s, 1 * s, 3.4 * s, .45 * s), { wash: pants, fill: PAL.indigo, fillOp: 40, tex: .5, ink: PAL.ink, sw: sw * .7 });
      paint(ellPts(0, 3.4 * s, .85 * s, .45 * s, 12, 0, 1.35), { wash: PAL.cream, fill: PAL.coral, fillOp: 60, ink: PAL.ink, sw: sw * .6 });
      pop();
    }
  } else {
    const leg = (side, i) => {
      let h = 2.4, a = 0;
      if (o.walk != null) { const ph = Math.sin((o.walk + (i ? .5 : 0)) * TAU); if (ph > 0) h -= ph * .8; }
      if (o.run != null) a = Math.sin((o.run + (i ? .5 : 0)) * TAU) * .55;
      push(); translate(side * .8 * s, -2.3 * s); rotate(a);
      paint(rectPts(-.5 * s, 0, 1 * s, h * s, J), { wash: pants, fill: PAL.indigo, fillOp: 40, tex: .5, ink: PAL.ink, sw: sw * .7 });
      paint(ellPts(side * .2 * s, h * s, .85 * s, .4 * s, 12), { wash: PAL.cream, fill: PAL.coral, fillOp: 60, ink: PAL.ink, sw: sw * .6 });
      pop();
    };
    leg(-1, 0); leg(1, 1);
  }

  // arms (hoodie sleeves)
  const arm = (side, a, hook) => {
    push(); translate(side * 1.75 * s, -7.4 * s); rotate(side < 0 ? a : -a);
    paint(rrPts(side < 0 ? -3.1 * s : 0, -.5 * s, 3.1 * s, 1 * s, .45 * s), { wash: hood, fill: hoodDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: sw * .7 });
    translate(side * 3.25 * s, 0);
    paint(ellPts(0, 0, .55 * s, .55 * s, 12), { wash: SKIN, ink: PAL.ink, sw: sw * .6 });
    if (hook) { if (side < 0) scale(-1, 1); hook(s, sw); }
    pop();
  };
  const phoneHook = o.phone ? (s2, sw2) => {
    paint(rrPts(-.1 * s2, -1.3 * s2, .9 * s2, 1.6 * s2, .15 * s2), { wash: PAL.ink, ink: null });
    paint(rrPts(0, -1.2 * s2, .7 * s2, 1.35 * s2, .1 * s2), { wash: PAL.cyan, fill: '#FFFFFF', fillOp: 60, ink: null });
  } : null;
  arm(-1, o.aL ?? -1.2, o.handL); arm(1, o.aR ?? -1.2, o.handR || phoneHook);

  // hoodie body
  const bodyPts = [[-2.0 * s, -8.3 * s], [2.0 * s, -8.3 * s], [2.35 * s, -2.1 * s], [-2.35 * s, -2.1 * s]];
  paint(bodyPts, { wash: hood, fill: hoodDk, fillOp: 60, bleed: .08, tex: .7, border: .6, ink: null });
  paint(rectPts(-2.3 * s, -2.9 * s, 4.6 * s, .8 * s, J), { wash: hoodDk, ink: null });                                   // waistband
  if (!o.back) {
    paint(rrPts(-1.3 * s, -5.3 * s, 2.6 * s, 1.5 * s, .4 * s, J * .5), { fill: hoodDk, fillOp: 120, ink: PAL.ink, sw: sw * .5 });  // kangaroo pocket
    for (const dx of [-.5, .5]) inkLine([[dx * s, -8.1 * s], [dx * s * 1.1, -6.6 * s]], sw * .6, PAL.cream, 'inkfine', 0);        // drawstrings
    if (o.logo) o.logo(s, sw);
  }
  paint(bodyPts, { ink: PAL.ink, sw: sw * .9 });

  // head
  const hy = -10.7 * s, R = 2.35 * s, up = clamp(o.hairUp || 0);
  if (!o.hood) paint(ellPts(0, -8.4 * s, 2.2 * s, .7 * s, 14), { wash: hoodDk, ink: PAL.ink, sw: sw * .6 });           // hood bunched at the neck
  paint(rectPts(-.45 * s, -8.9 * s, .9 * s, .9 * s), { wash: SKIN, ink: null });
  if (o.hood) paint(ellPts(0, hy - .2 * s, R * 1.3, R * 1.28, 22, J), { wash: hood, fill: hoodDk, fillOp: 70, tex: .6, ink: PAL.ink, sw: sw * .8 });
  paint(ellPts(0, hy, R, R * .97, 24, J * .6), { wash: SKIN, fill: '#E9A98A', fillOp: 45, tex: .6, border: .5, ink: PAL.ink, sw: sw * .85 });
  if (o.back) paint(ellPts(0, hy - .1 * s, R * 1.06, R * 1.02, 22, J), { wash: HAIR, fill: PAL.clayDk, fillOp: 40, tex: .6, ink: PAL.ink, sw: sw * .8 });
  else {
    if (!o.hood) {
      // messy mop: a cap with spiky bangs, plus a cowlick
      const hp = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * 1.02 + i / 12 * Math.PI * .96; hp.push([Math.cos(a) * R * 1.12, hy + Math.sin(a) * R * 1.1]); }
      hp.push([2.1 * s, -10.6 * s], [1.5 * s, -11.5 * s], [1.0 * s, -10.9 * s], [.3 * s, -11.7 * s], [-.4 * s, -11.0 * s], [-1.1 * s, -11.8 * s], [-1.7 * s, -10.9 * s], [-2.3 * s, -10.4 * s]);
      paint(hp, { wash: HAIR, fill: PAL.clayDk, fillOp: 50, tex: .6, ink: PAL.ink, sw: sw * .7 });
      for (let i = -2; i <= 2; i++) inkLine([[i * .8 * s, -12.9 * s], [i * 1.1 * s + .3 * s, (-13.8 - up * 1.8 - (i === 0 ? .6 : 0)) * s]], sw * 1.1, HAIR, 'ink', .4);
    }
    if (o.blush) for (const bx of [-1.55, 1.55]) paint(ellPts(bx * s, -9.9 * s, .55 * s, .3 * s, 12), { fill: PAL.rose, fillOp: 160, bleed: .2, ink: null });
    hFace(s, sw, o);
  }
  if (o.draw) o.draw(s, sw);
  pop();
  if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * 3.2 * s, y + (o.dy || 0) * s - 13.8 * s, s * 1.1, o.emoteK ?? 1);
}
function hFace(s, sw, o) {
  const e = (o.squint || 0) > .5 ? 'closed' : (o.eyes || 'lazy'), gy = -10.5 * s;
  for (const side of [-1, 1]) {
    const cx = side * .95 * s, cy = gy;
    if (e === 'lazy' || e === 'screen') {
      paint(ellPts(cx, cy, .55 * s, .5 * s, 14), { wash: PAL.cream, ink: PAL.ink, sw: sw * .5 });
      paint(ellPts(cx + (o.lookX || 0) * .2 * s, cy + .1 * s, .26 * s, .3 * s, 10), { wash: PAL.ink, ink: null });
      if (e === 'screen') paint(rectPts(cx - .05 * s, cy - .05 * s, .22 * s, .16 * s), { wash: PAL.cyan, ink: null });
      paint([[cx - .62 * s, cy - .05 * s], [cx + .62 * s, cy - .05 * s], [cx + .55 * s, cy - .5 * s], [cx - .55 * s, cy - .5 * s]], { wash: SKIN, ink: null });   // heavy lid
      inkLine([[cx - .6 * s, cy - .05 * s], [cx + .6 * s, cy - .05 * s]], sw * .8, PAL.ink, 'ink', 0);
    } else toonEye(cx, cy, .5 * s, .6 * s, e, o, sw, side, false);
  }
  const b = o.brows;
  if (b) for (const side of [-1, 1]) {
    const bx = side * .95 * s, by = -11.55 * s, tilt = b === 'worried' ? -side * .3 : b === 'angry' ? side * .35 : 0, lift = b === 'up' ? -.35 * s : 0;
    inkLine([[bx - .45 * s, by + lift + tilt * s * .6], [bx + .45 * s, by + lift - tilt * s * .6]], sw * .9, HAIR, 'ink', 0);
  }
  toonMouth(0, -9.0 * s, .5 * s, o.mouth ?? 'flat', sw * .85, false);
}

// ======================================================================================================
// emotes, moods, dance moves (shared by everyone)
// ======================================================================================================
function emote(kind, x, y, s, k = 1) {
  const p = backOut(k); if (p < .02) return;
  if (kind === 'zzz') { letter('z', x, y, s * 2, PAL.cream, { pop: k * 3 }); letter('z', x + s * 1.6, y - s * 1.8, s * 1.5, PAL.cream, { pop: k * 3 - .3 }); return; }
  if (kind === '!' || kind === '?' || kind === '!?' || kind === '!!') { letter(kind, x, y, s * 3.4, kind.includes('?') ? PAL.cyan : PAL.lemon, { pop: k * 1.5, rot: .12 }); return; }
  push(); translate(x, y); scale(p);
  const sw = clamp(s / 15, .4, 2);
  if (kind === 'sweat') {
    for (const [dx, dy, r] of [[0, 0, 1], [1.6, 1.4, .7]]) paint([[dx * s, (dy - 1.6 * r) * s], [(dx + .9 * r) * s, (dy + .2) * s], [dx * s, (dy + .9 * r) * s], [(dx - .9 * r) * s, (dy + .2) * s]], { wash: PAL.sky, fill: '#FFFFFF', fillOp: 60, ink: PAL.ink, sw: sw * .6, curv: .7 });
  } else if (kind === 'spark') {
    paint(starPts(0, 0, 1.6 * s), { wash: PAL.cream, fill: PAL.lemon, fillOp: 80, ink: PAL.ink, sw: sw * .5 });
    paint(starPts(1.9 * s, 1.2 * s, .8 * s), { wash: PAL.lemon, ink: PAL.ink, sw: sw * .4 });
  } else if (kind === 'heart') {
    paint(heartPts(0, 0, s * 1.8), { wash: '#E2476E', fill: PAL.bubble, fillOp: 90, ink: PAL.ink, sw: sw * .6 });
  } else if (kind === 'anger') {
    for (let i = 0; i < 4; i++) { push(); rotate(i * Math.PI / 2 + Math.PI / 4); inkLine([[.4 * s, -.5 * s], [1.3 * s, -.2 * s], [1.3 * s, .4 * s]], sw * .9, '#D8394E', 'ink', .5); pop(); }
  } else if (kind === 'music') {
    paint(ellPts(0, 1.2 * s, .7 * s, .5 * s, 12, 0, -.3), { wash: PAL.ink, ink: null });
    inkLine([[.6 * s, 1.1 * s], [.6 * s, -1.6 * s], [1.6 * s, -1 * s]], sw * .8, PAL.ink, 'ink', 0);
  } else if (kind === 'swirl') {
    const sp = []; for (let i = 0; i < 18; i++) { const a = i * .6 + T * 5, r = i * .09 * s; sp.push([Math.cos(a) * r, Math.sin(a) * r]); } inkLine(sp, sw * .7, PAL.violet, 'inkfine', .6);
  } else if (kind === 'bulb') {
    paint(ellPts(0, -.4 * s, 1.1 * s, 1.2 * s, 14), { wash: PAL.lemon, fill: PAL.cream, fillOp: 90, ink: PAL.ink, sw: sw * .6 });
    paint(rectPts(-.5 * s, .7 * s, 1 * s, .6 * s), { wash: '#9AA3B5', ink: PAL.ink, sw: sw * .5 });
  }
  pop();
}

// Mood timeline with animated changes: keys = [[t0, eyes, emote?], ...]. Spread the result into a character.
function mood(t, keys) {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const [t0, eyes, em] = keys[i], age = t - t0, nextIn = i + 1 < keys.length ? keys[i + 1][0] - t : 9;
  let squint = 0, take = 0;
  if (i > 0 && age < .16) { squint = 1 - age / .16; take = -.14 * Math.sin(age / .16 * Math.PI); }
  if (nextIn < .08) squint = Math.max(squint, 1 - nextIn / .08);
  if (i > 0 && age >= .16 && age < .4) take = .1 * Math.sin((age - .16) / .24 * Math.PI) * (1 - (age - .16) / .24);
  return { eyes, squint, take, emote: em, emoteK: em ? seg(age, .05, .3) * (1 - seg(age, 1.4, 1.7)) : 0 };
}

// Dance moves: pose offsets in body units, locked to the 125 BPM beat.
function move(style, t, seed = 0) {
  const bp = bpOf(t), bi = Math.floor(bp), bf = bp - bi, hit = Math.max(0, 1 - bf * 3.5), s1 = Math.sin(bp * Math.PI), ab = Math.abs(s1);
  const o = { dy: 0, sq: 0, aL: .2, aR: .2, rot: 0, walk: null, sx: 1, dx: 0 };
  if (style === 'mix') style = ['bounce', 'roof', 'sway', 'spin', 'hop', 'wave'][(Math.floor(bp / 8) + seed) % 6];
  switch (style) {
    case 'bounce': o.dy = -ab * 1.6; o.sq = hit * .12; o.aL = .4 + s1; o.aR = .4 - s1; break;
    case 'hop': o.dy = -ab * 3.5; o.sq = hit * .18; o.aL = o.aR = .3 + ab * 1.1; break;
    case 'roof': o.dy = -ab * 1.2; o.sq = hit * .1; o.aL = o.aR = 1.25 + .3 * Math.sin(bp * TAU); break;
    case 'sway': o.dx = s1 * 2.5; o.rot = s1 * .12; o.aL = .5 + .6 * s1; o.aR = .5 - .6 * s1; o.sq = hit * .08; break;
    case 'spin': { const ph = (((bi % 4) + 4) % 4 === 3) ? bf : 0; o.sx = Math.cos(ph * TAU); o.dy = -Math.sin(ph * Math.PI) * 3 - ab; o.aL = o.aR = .6 + ph; o.sq = hit * .1; break; }
    case 'wave': o.dy = -ab; o.aL = 1.1 + .5 * Math.sin(bp * TAU * 2); o.aR = -.2; o.sq = hit * .08; break;
    case 'walk': o.walk = bp / 2; o.dy = -ab * .6; o.aL = .3 * s1; o.aR = -o.aL; break;
    case 'run': o.walk = bp * 1.5; o.dy = -Math.abs(Math.sin(bp * TAU)); o.aL = .8 * Math.sin(bp * TAU * 1.5); o.aR = -o.aL; o.rot = -.08; break;
    case 'idle': o.dy = -ab * .4; o.sq = hit * .05; break;
    case 'stomp': o.dy = -Math.max(0, Math.sin(bp * TAU)) * 1.4; o.sq = hit * .2; o.rot = (bi % 2 ? 1 : -1) * .06 * hit; o.aL = o.aR = -.3 + hit * .9; break;
    case 'shimmy': o.dx = Math.sin(bp * TAU * 2) * .6; o.rot = Math.sin(bp * TAU * 2) * .05; o.aL = .9 + .4 * Math.sin(bp * TAU * 2); o.aR = .9 - .4 * Math.sin(bp * TAU * 2); o.dy = -ab * .5; break;
  }
  return o;
}
// Dancers: character + move(). extra overrides any pose key.
function gemiDancer(x, y, u, style, t, extra = {}) { const m = move(style, t, extra.seed || 0); gemi(x + m.dx * u, y, u, { ...m, ...extra }); }
function sunoDancer(x, y, u, style, t, extra = {}) { const m = move(style, t, extra.seed || 0); suno(x + m.dx * u, y, u, { ...m, aL: m.aL - .5, aR: m.aR - .5, ...extra }); }
function tuneDancer(x, y, u, style, t, extra = {}) { const m = move(style, t, extra.seed || 0); tune(x + m.dx * u, y, u, { ...m, aL: m.aL - .3, aR: m.aR - .3, ...extra }); }
function humanDancer(x, y, s, style, t, extra = {}) { const m = move(style, t, extra.seed || 0); human(x + m.dx * s, y, s, { ...m, walk: undefined, aL: m.aL - 1, aR: m.aR - 1, ...extra }); }
