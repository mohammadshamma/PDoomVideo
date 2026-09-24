// c1_boot: the soft intro verse (0–16.3), the render queue at night.
//   wake     0.00  Darkness; a candy progress bar fills. The camera glides along a night conveyor of gift-wrapped render
//                  pods. The little pink pod snores, rattles, POP!, Tune springs out, yawns, stretches, blinks awake with
//                  sparkly eyes, and looks up at a prompt box floating down.
//   origin   3.62  Dream-bubble flashback. The prompt box types itself; the scribbles stream into two birth pods. POP!,
//                  Gemi bursts out of one; Suno rises out of the other like a sunrise. Both marvel at their own new hands,
//                  hop to the GENERATE machine, hold hands over it, DING!, Tune pops out like toast into their arms.
//                  The bubble pops.
//   noWords  7.70  The human's teal night bedroom: blank page, blinking cursor, pencil chewing, paper balls on the beat.
//                  Letter blocks spelling W-O-R-D-S flutter out of the dictionary and escape through the window; the
//                  butterfly-net swipe misses, and the second swipe whips the camera into the next shot.
//   soul    11.50  The human pulls a glowing heart-soul out of the laptop, boxes it, THUNK stamp, drops it in the pneumatic
//                  tube; the camera rides the box up through the roof and clouds to a cloud-server where it lands on Suno's
//                  head; the heart flies into Tune, who glows brighter and brighter. White flash at 16.0.
(() => {
  const B = n => OFF + n * BEAT;
  const BELT = 740, V = 38, HERO0 = 1130, POP_T = 1.4;   // shot 1: conveyor top, belt speed, hero pod, its POP
  const SY = -3600;                                     // shot 4: world y of the cloud-server scene
  const HX = 1060, HG = 880, HS = 36;                   // the human at the desk (ground point hidden behind it)

  // ---------- small helpers ----------
  const bump = (t, a, b) => (t <= a || t >= b) ? 0 : Math.sin(Math.PI * (t - a) / (b - a));
  const arcPt = (p0, p1, h, k) => [lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k) - h * 4 * k * (1 - k)];
  const boing = (age, amt = .3, f = 24, d = 7) => age < 0 ? 0 : amt * Math.exp(-age * d) * Math.cos(age * f);
  const inView = (x, y, r) => { if (!CAM) return true; const hw = W / 2 / CAM.zoom + r + 200, hh = H / 2 / CAM.zoom + r + 200; return Math.abs(x - CAM.cx) < hw && Math.abs(y - CAM.cy) < hh; };
  function glow(x, y, rx, ry, col, op, n = 20) { if (op > 1) paint(ellPts(x, y, rx, ry, n), { fill: col, fillOp: Math.min(255, op), bleed: .3, tex: .25, border: .1, ink: null }); }
  function halo(x, y, r, col, op, sy = 1) { if (op > 1) for (const k of [1, .72, .45]) paint(ellPts(x, y, r * k, r * k * sy, 24), { wash: col, washOp: Math.min(255, op * .45), ink: null }); }
  function screenBg(col, fcol, fop = 110) { paint(rectPts(-40, -40, W + 80, H + 80), { wash: col, fill: fcol, fillOp: fop, bleed: .08, tex: .75, border: .3, ink: null }); }
  function twinkles(t, n, seed, x0, y0, x1, y1, cols, r0 = 5, r1 = 13) {
    for (let i = 0; i < n; i++) {
      const h1 = hash(i * 3.1 + seed), h2 = hash(i * 7.7 + seed + 2), h3 = hash(i * 1.9 + seed + 5);
      const x = lerp(x0, x1, h1), y = lerp(y0, y1, h2); if (!inView(x, y, 20)) continue;
      const r = lerp(r0, r1, h3) * (.55 + .45 * Math.sin(t * (2 + h3 * 3) + i * 2.3));
      if (r < 1.5) continue;
      paint(sparklePts(x, y, r, .62, 0, 4), { wash: cols[i % cols.length], washOp: 235, ink: null });
    }
  }
  function partial(p, u) {                               // polyline cut at fraction u of its length
    const d = []; let L = 0;
    for (let i = 1; i < p.length; i++) { d.push(Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); L += d[i - 1]; }
    let s = clamp(u) * L; const out = [p[0]];
    for (let i = 1; i < p.length; i++) {
      if (s >= d[i - 1]) { out.push(p[i]); s -= d[i - 1]; }
      else { const f = s / d[i - 1]; out.push([lerp(p[i - 1][0], p[i][0], f), lerp(p[i - 1][1], p[i][1], f)]); break; }
    }
    return out;
  }
  function subPath(p, a, b) {                            // the piece of a polyline between fractions a and b of its length
    const c = [0]; for (let i = 1; i < p.length; i++) c.push(c[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
    const L = c[c.length - 1], at = s => { let i = 1; while (i < p.length - 1 && c[i] < s) i++; const f = clamp((s - c[i - 1]) / ((c[i] - c[i - 1]) || 1)); return [lerp(p[i - 1][0], p[i][0], f), lerp(p[i - 1][1], p[i][1], f)]; };
    const out = [at(a * L)]; for (let i = 1; i < p.length - 1; i++) if (c[i] > a * L && c[i] < b * L) out.push(p[i]); out.push(at(b * L)); return out;
  }
  const ptAt = (p, u) => { const q = partial(p, u); return q[q.length - 1]; };
  // where hands are (ignores squash), for holding hands and props
  const gemiTip = (x, y, u, o, s) => { const a = clamp(s > 0 ? (o.aR ?? .15) : (o.aL ?? .15), -1.6, 2) * .38, L = 5 * u * ((s > 0 ? o.reachR : o.reachL) || 1); return [x + s * Math.cos(a) * L, y + (o.dy || 0) * u - 6.6 * u - Math.sin(a) * L]; };
  const sunoHand = (x, y, u, o, s) => { const a = s > 0 ? (o.aR ?? -.3) : (o.aL ?? -.3); return [x + s * (4.6 * u + 3 * u * Math.cos(a)), y + (o.dy || 0) * u - 5.9 * u - 3 * u * Math.sin(a)]; };
  const humanHand = (x, y, s, o, sd) => { const a = sd > 0 ? (o.aR ?? -1.2) : (o.aL ?? -1.2); return [x + sd * (1.75 * s + 3.25 * s * Math.cos(a)), y + (o.dy || 0) * s - 7.4 * s - 3.25 * s * Math.sin(a)]; };

  // fluffy cartoon cloud: outlined blobs, then the same blobs again without ink to erase the inner lines
  const CLOUD = [[-.36, .06, .19], [-.16, -.1, .26], [.12, -.13, .25], [.34, .02, .2], [-.02, .1, .3]];
  function cloud(x, y, w, col, shade, sw = 1) {
    for (const [dx, dy, r] of CLOUD) paint(ellPts(x + dx * w, y + dy * w, r * w, r * w * .8, 18), { wash: col, ink: PAL.ink, sw });
    for (const [dx, dy, r] of CLOUD) paint(ellPts(x + dx * w, y + dy * w, r * w * .93, r * w * .74, 18), { wash: col, ink: null });
    paint(ellPts(x, y + w * .14, w * .42, w * .1, 16), { fill: shade, fillOp: 90, bleed: .2, tex: .4, ink: null });
    paint(ellPts(x - w * .18, y - w * .2, w * .08, w * .035, 10, 0, -.3), { wash: '#FFFFFF', washOp: 170, ink: null });
  }
  function cloudFloor(y, x0, x1, amp, per, ph, col, fcol, sw = 1.2, bottom = 1500) {
    const pts = []; for (let x = x0; x <= x1; x += per / 7) pts.push([x, y - Math.abs(Math.sin((x + ph) / per * Math.PI)) * amp]);
    for (let x = x1; x >= x0; x -= per / 5) pts.push([x, bottom + Math.abs(Math.sin((x + ph * .5) / (per * 1.4) * Math.PI)) * amp * 1.6]);
    paint(pts, { wash: col, fill: fcol, fillOp: 70, bleed: .05, tex: .6, border: .5, ink: PAL.ink, sw });
  }
  function archPts(x, y, w, h) { const r = w / 2, P = []; for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI; P.push([x + r + Math.cos(a) * r, y + r + Math.sin(a) * r]); } P.push([x + w, y + h], [x, y + h]); return P; }

  // ---------- props ----------
  // floating prompt window; (x, y) top-left, p = typing progress across 3 scribble lines
  function promptBox(x, y, w, h, p, t, o = {}) {
    glow(x + w / 2, y + h / 2, w * .72, h * 1.05, o.glowCol || PAL.cyan, o.glowOp ?? 80);
    paint(rrPts(x, y, w, h, 22, 1.5), { wash: PAL.cream, fill: PAL.bubble, fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.4 });
    paint(rrPts(x, y, w, h * .2, 14, 1), { wash: PAL.grape, ink: PAL.ink, sw: 1 });
    [PAL.coral, PAL.lemon, PAL.mint].forEach((c, i) => paint(ellPts(x + 26 + i * 28, y + h * .1, 8, 8, 10), { wash: c, ink: null }));
    const lx0 = x + 34, lx1 = x + w - 120, lines = 3, lh = (h * .75) / (lines + .2);
    let cur = [lx0, y + h * .2 + lh * .7];
    for (let i = 0; i < lines; i++) {
      const u = clamp(p * lines - i); if (u <= 0) break;
      const ly = y + h * .2 + lh * (i + .7), len = (lx1 - lx0) * (i === lines - 1 ? .6 : 1), P = [];
      for (let k = 0; k <= 34; k++) { const s = k / 34; P.push([lx0 + s * len + Math.cos(s * 44 + i) * 6, ly + Math.sin(s * 44 + i) * lh * .2 + Math.sin(s * 7 + i * 3) * lh * .06]); }
      const Q = partial(P, u); inkLine(Q, h > 180 ? 1.2 : .9, PAL.indigo, 'inkfine', .5); cur = Q[Q.length - 1];
    }
    if (frac(t * 2.2) < .6) paint(rectPts(cur[0] + 10, cur[1] - lh * .32, lh * .18, lh * .64), { wash: PAL.ink, ink: null });
    const bx = x + w - 58, by = y + h * .6, br = Math.min(34, h * .2);
    paint(ellPts(bx, by, br, br, 18), { wash: o.btn || PAL.magenta, ink: PAL.ink, sw: 1 });
    paint(sparklePts(bx, by, br * .6, .6), { wash: PAL.cream, ink: null });
  }
  // gift-wrapped render pod on the belt; (x, base) = bottom centre
  function podLid(x, y, w, lh, col, rib, sw = 1) {          // (x, y) = top centre of the lid
    paint(rrPts(x - w * .54, y, w * 1.08, lh, 8, 1), { wash: mixCol(col, PAL.cream, .3), ink: PAL.ink, sw });
    paint(rectPts(x - w * .08, y, w * .16, lh), { wash: rib, ink: PAL.ink, sw: .6 });
    for (const s of [-1, 1]) paint(ellPts(x + s * w * .13, y - lh * .3, w * .14, lh * .55, 12, 0, s * .45), { wash: rib, ink: PAL.ink, sw: .7 });
    paint(ellPts(x, y - lh * .05, w * .05, lh * .3, 10), { wash: mixCol(rib, PAL.ink, .25), ink: PAL.ink, sw: .6 });
  }
  function giftPod(x, base, w, h, col, rib, o = {}) {
    const lh = h * .22;
    glow(x, base - h * .45, w * .85, h * .8, col, 50 * (o.glowK ?? 1));
    push(); translate(x, base + (o.dy || 0)); rotate(o.rot || 0); if (o.sq) scale(1 + o.sq * .5, 1 - o.sq);
    paint(rrPts(-w / 2, -h + lh * .6, w, h - lh * .6, 12, 1), { wash: col, fill: PAL.ink, fillOp: 30, bleed: .05, tex: .6, border: .5, ink: PAL.ink, sw: 1 });
    for (const f of [.16, .78]) paint([[-w / 2 + w * f, -h + lh], [-w / 2 + w * (f + .07), -h + lh], [-w / 2 + w * (f + .03), -5], [-w / 2 + w * (f - .04), -5]], { wash: PAL.cream, washOp: 70, ink: null });
    paint(rectPts(-w * .08, -h + lh * .6, w * .16, h - lh * .6 - 2), { wash: rib, ink: PAL.ink, sw: .6 });
    if (o.open) {
      paint(ellPts(0, -h + lh * .6, w * .47, lh * .45, 18), { wash: '#2A1B3D', ink: PAL.ink, sw: .8 });
      glow(0, -h + lh * .6, w * .4, lh * .4, PAL.lemon, 150);
    }
    if (!o.noLid) {
      podLid(0, -h, w, lh, col, rib);
      if (o.leak > 0) inkLine([[-w * .52, -h + lh], [w * .52, -h + lh]], 1.6 * o.leak, PAL.lemon, 'ink', 0);
    }
    // ticket tag on a string, with a tiny progress bar
    push(); translate(w * .5 - 6, -h + lh + 4); rotate(.35 + Math.sin((o.t || 0) * 2.4 + (o.seed || 0)) * .12);
    inkLine([[0, 0], [0, 30]], .7, PAL.cream, 'inkfine', 0);
    paint(rrPts(-30, 30, 60, 38, 7), { wash: PAL.cream, ink: PAL.ink, sw: .7 });
    inkLine([[-20, 40], [12, 40]], .6, PAL.indigo, 'inkfine', 0);
    paint(rrPts(-22, 50, 44, 10, 4), { wash: PAL.suno, ink: null });
    const tp = clamp(o.tagP ?? .5);
    if (tp > .08) paint(rrPts(-22, 50, 44 * tp, 10, 4), { wash: tp > .99 ? PAL.lemon : PAL.mint, ink: null });
    pop();
    pop();
  }
  // GENERATE: a chrome toaster-box; (x, base) = bottom centre
  function genMachine(x, base, t, o = {}) {
    const w = 210, h = 140, lv = o.lever ?? 0;
    glow(x, base - h / 2, w * .9, h * .95, PAL.cyan, 60 * (o.glowK ?? .6));
    push(); translate(x + (o.shake || 0), base);
    for (const s of [-1, 1]) paint(rrPts(s * w * .34 - 20, -10, 40, 18, 7), { wash: PAL.suno, ink: PAL.ink, sw: .7 });
    for (const s of [-1, 1]) paint(rrPts(s * w * .2 - 46, -h - 8, 92, 20, 8), { wash: '#2A2340', ink: PAL.ink, sw: .8 });
    paint(rrPts(-w / 2, -h, w, h - 6, 36, 1), { wash: '#CBD0EE', fill: '#7C82B6', fillOp: 70, bleed: .05, tex: .6, border: .6, ink: PAL.ink, sw: 1.3 });
    paint(rrPts(-w * .43, -h + 18, 14, h - 44, 7), { wash: '#FFFFFF', washOp: 150, ink: null });
    paint(rrPts(-w * .36, -h + 16, 7, h - 60, 4), { wash: '#FFFFFF', washOp: 110, ink: null });
    // side lever
    inkLine([[w / 2 + 4, -h * .8], [w / 2 + 4, -h * .3]], 1.2, '#2A2340', 'ink', 0);
    paint(rrPts(w / 2 - 6, -h * .82 + lv * h * .46, 34, 18, 7), { wash: PAL.magenta, ink: PAL.ink, sw: .8 });
    // name plate
    paint(rrPts(-w * .36, -h * .72, w * .72, 38, 10), { wash: PAL.grape, ink: PAL.ink, sw: .8 });
    // lights + big sparkle button
    for (let i = 0; i < 5; i++) { const on = frac(t * 3 - i * .2) < .5 || (o.glowK || 0) > 1; paint(ellPts(-w * .3 + i * w * .15, -h * .32, 8, 8, 10), { wash: on ? [PAL.lemon, PAL.mint, PAL.magenta, PAL.cyan, PAL.coral][i] : '#5A5480', ink: PAL.ink, sw: .5 }); }
    paint(ellPts(0, -h * .14 + 4, 30, 12, 16), { wash: o.press ? PAL.lemon : PAL.magenta, ink: PAL.ink, sw: .8 });
    pop();
    letter('GENERATE', x + (o.shake || 0), base - h * .72 + 20, 21, PAL.lemon, { ink: false });
  }
  // the heart-soul: a glowing pink heart with a tiny face
  function soul(x, y, r, t, o = {}) {
    glow(x, y, r * 2.3, r * 2.3, PAL.bubble, 120 * (o.glowK ?? 1));
    paint(heartPts(x, y - r * .2, r * (1 + .06 * Math.sin(t * 9))), { wash: '#FF5C98', fill: PAL.bubble, fillOp: 80, tex: .4, ink: PAL.ink, sw: .9 });
    paint(ellPts(x - r * .48, y - r * .6, r * .18, r * .1, 8, 0, -.6), { wash: '#FFFFFF', washOp: 190, ink: null });
    for (const s of [-1, 1]) {
      if (o.closed) inkLine([[x + s * r * .32 - r * .12, y - r * .08], [x + s * r * .32, y + r * .02], [x + s * r * .32 + r * .12, y - r * .08]], .7, PAL.ink, 'inkfine', .5);
      else paint(ellPts(x + s * r * .32, y - r * .05, r * .09, r * .13, 8), { wash: PAL.ink, ink: null });
    }
    inkLine([[x - r * .15, y + r * .2], [x, y + r * .3], [x + r * .15, y + r * .2]], .7, PAL.ink, 'inkfine', .5);
    for (let i = 0; i < 2; i++) { const a = t * 4 + i * Math.PI; paint(sparklePts(x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * .8, r * .25, .6, 0, 4), { wash: PAL.lemon, ink: null }); }
  }
  // cardboard box in 3/4 view; (x, base) = bottom centre of the front face; open 0..1 raises the flaps
  function cbox(x, base, w, h, o = {}) {
    const d = [w * .3, -h * .26], op = clamp(o.open ?? 0), sw = o.sw ?? 1;
    const add = (p, q, k = 1) => [p[0] + q[0] * k, p[1] + q[1] * k];
    push(); translate(x, base); rotate(o.rot || 0); scale(o.sc || 1, (o.sc || 1) * (1 - (o.sq || 0))); translate(-x, -base);
    const FL = [x - w / 2, base - h], FR = [x + w / 2, base - h], BR = [x + w / 2, base], BL = [x - w / 2, base];
    paint([FR, add(FR, d), add(BR, d), BR], { wash: '#B37440', ink: PAL.ink, sw });
    paint([FL, FR, add(FR, d), add(FL, d)], { wash: op > .05 ? '#5A3826' : '#E8B87E', ink: PAL.ink, sw });
    if (op <= .05) paint([add(FL, [w * .43, 0]), add(FL, [w * .57, 0]), add(add(FL, d), [w * .57, 0]), add(add(FL, d), [w * .43, 0])], { wash: '#F4D9A4', ink: null });
    paint([FL, FR, BR, BL], { wash: '#D99A5B', fill: '#A8703E', fillOp: 55, tex: .6, ink: PAL.ink, sw });
    paint(rectPts(x - w * .07, base - h, w * .14, h * .38), { wash: '#F4D9A4', ink: null });
    if (o.stamp) {
      paint(rrPts(x - w * .2, base - h * .78, w * .3, h * .36, 3), { wash: PAL.lemon, ink: PAL.ink, sw: sw * .6 });
      paint(heartPts(x - w * .05, base - h * .62, w * .08), { wash: PAL.magenta, ink: null });
      inkLine([[x - w * .1, base - h * .3], [x + w * .38, base - h * .3]], sw * .6, PAL.ink, 'inkfine', 0);
      inkLine([[x - w * .1, base - h * .18], [x + w * .3, base - h * .18]], sw * .6, PAL.ink, 'inkfine', 0);
    }
    if (op > .05) {
      const f = op * h * .55;
      paint([FL, add(FL, d), add(add(FL, d), [-f * .55, -f]), add(FL, [-f * .55, -f])], { wash: '#E8B87E', ink: PAL.ink, sw });
      paint([FR, add(FR, d), add(add(FR, d), [f * .55, -f]), add(FR, [f * .55, -f])], { wash: '#D99A5B', ink: PAL.ink, sw });
    }
    pop();
  }

  // =====================================================================================================
  // 0.00 · wake: the night conveyor, the hero pod pops, Tune wakes up
  // =====================================================================================================
  const PODS = [[-520, 190, 160, PAL.cyan, PAL.magenta], [-210, 200, 180, PAL.coral, PAL.cyan], [100, 170, 212, PAL.magenta, PAL.lemon],
    [410, 230, 150, PAL.mint, PAL.grape], [760, 180, 196, PAL.gViolet, PAL.lemon], [1570, 210, 200, PAL.cyan, PAL.coral],
    [1880, 170, 160, PAL.lemon, PAL.magenta], [2170, 220, 190, PAL.coral, PAL.mint], [2470, 180, 180, PAL.magenta, PAL.cyan]];
  function queueFar(t, cx) {
    const par = (cx - 960) * .6;
    for (const [wx, moon] of [[150, true], [1350, false], [2550, true]]) {       // arched windows onto the night
      const x = wx + par, y0 = 90, w = 420, h = 470; if (!inView(x + w / 2, y0 + h / 2, w)) continue;
      paint(archPts(x, y0, w, h), { wash: '#2E3688', fill: PAL.indigo, fillOp: 120, bleed: .1, tex: .6, ink: PAL.ink, sw: 1.2 });
      if (moon) {
        paint(ellPts(x + w * .66, y0 + 150, 62, 62, 22, 1.5), { wash: PAL.cream, fill: PAL.lemon, fillOp: 60, ink: PAL.ink, sw: .8 });
        paint(ellPts(x + w * .66 + 28, y0 + 136, 54, 54, 22), { wash: '#2E3688', ink: null });
      }
      twinkles(t, 7, wx, x + 30, y0 + 40, x + w - 30, y0 + h - 40, [PAL.cream, PAL.lemon, PAL.cyan], 5, 12);
      inkLine([[x + w / 2, y0 + 4], [x + w / 2, y0 + h]], 1.5, '#4C3F8E', 'ink', 0);
      inkLine([[x, y0 + h * .56], [x + w, y0 + h * .56]], 1.5, '#4C3F8E', 'ink', 0);
    }
    [-420, -60, 780, 1140, 1980, 2340].forEach((tx, k) => {                    // blinking server towers
      const x = tx + par, y0 = 250 + (k % 2) * 70, w = 150; if (!inView(x, 500, w)) return;
      glow(x, y0 + 160, w * .9, 220, [PAL.cyan, PAL.magenta, PAL.lemon][k % 3], 45);
      paint(rrPts(x - w / 2, y0, w, BELT - y0 + 10, 16, 1), { wash: '#2A2566', fill: PAL.grape, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
      for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) {
        const on = hash(k * 31 + r * 7 + c * 3 + Math.floor(t * 5) * .37) > .42, col = [PAL.cyan, PAL.magenta, PAL.lemon, PAL.mint][(r + c + k) % 4];
        paint(rectPts(x - w / 2 + 22 + c * 40, y0 + 28 + r * 58, 26, 12), { wash: on ? col : '#3A356F', ink: null });
      }
    });
  }
  function queueRail(t, cx) {
    const x0 = cx - 1500, x1 = cx + 1500;
    paint(rectPts(x0, 150, x1 - x0, 44), { wash: '#3A2F6E', ink: PAL.ink, sw: 1 });
    glow(cx, 172, 1300, 46, PAL.magenta, 55);
    for (let k = Math.floor((x0 - t * 120) / 110); ; k++) {
      const x = k * 110 + t * 120; if (x > x1) break; if (x < x0) continue;
      paint(thickPath([[x - 14, 159], [x + 6, 172], [x - 14, 185]], 9), { wash: PAL.magenta, ink: null });
    }
    for (let k = Math.floor((cx - 1500) / 460); k * 460 < cx + 1500; k++) {          // hanging lamps with soft cones
      const x = k * 460 + 100;
      paint([[x - 44, 320], [x + 44, 320], [x + 200, BELT], [x - 200, BELT]], { wash: PAL.lemon, washOp: 26, ink: null });
      inkLine([[x, 194], [x, 282]], 1.2, PAL.ink, 'ink', 0);
      paint([[x - 50, 318], [x - 22, 280], [x + 22, 280], [x + 50, 318]], { wash: PAL.lemon, fill: PAL.ochre, fillOp: 50, ink: PAL.ink, sw: .9 });
    }
  }
  function belt(t, cx) {
    const x0 = cx - 1500, x1 = cx + 1500;
    paint(rectPts(x0, 830, x1 - x0, 600), { wash: '#1C1642', fill: PAL.grape, fillOp: 60, tex: .6, ink: null });
    glow(cx, 905, 1250, 60, PAL.cyan, 40);
    paint(rectPts(x0, 760, x1 - x0, 82), { wash: PAL.suno, ink: PAL.ink, sw: 1.2 });
    for (let x = Math.floor(x0 / 96) * 96; x < x1; x += 96) {
      paint(ellPts(x, 801, 26, 26, 14), { wash: PAL.sunoLt, ink: PAL.ink, sw: .8 });
      const a = t * V / 26 + x;
      inkLine([[x - Math.cos(a) * 20, 801 - Math.sin(a) * 20], [x + Math.cos(a) * 20, 801 + Math.sin(a) * 20]], .8, '#2A2340', 'inkfine', 0);
    }
    paint(rectPts(x0, 734, x1 - x0, 30), { wash: '#43385E', ink: PAL.ink, sw: 1 });
    const off = (t * V) % 60;
    for (let x = Math.floor(x0 / 60) * 60 + off; x < x1; x += 60) inkLine([[x, 738], [x - 8, 760]], .7, '#2A2340', 'inkfine', 0);
    inkLine([[x0, 764], [x1, 764]], 2, PAL.cyan, 'ink', 0);
  }

  function wake(t) {
    const hx = HERO0 + V * t, tx = hx + 190;
    const cam = kf(t, [[0, [340, 540, 1]], [1.3, [1215, 560, 1.22]], [2.15, [1320, 592, 1.5]], [2.9, [1345, 588, 1.52]], [3.5, [1365, 470, 1.2]]]);
    screenBg('#1A1745', PAL.grape, 120);
    camBegin(cam[0], cam[1], cam[2], 0);
    queueFar(t, cam[0]);
    queueRail(t, cam[0]);
    belt(t, cam[0]);
    PODS.forEach(([bx, w, h, col, rib], i) => { const x = bx + V * t; if (inView(x, BELT - h / 2, w)) giftPod(x, BELT, w, h, col, rib, { tagP: frac(.2 + hash(i) * .8 + t * .15), t, seed: i }); });

    // the prompt box floating down from above (Tune will look up at it)
    if (t > 2.9) {
      const py = kf(t, [[2.9, -360], [3.45, 70]], easeOut) + Math.sin(t * 3) * 6;
      glow(tx, py + 220, 120, 200, PAL.cyan, 50);
      promptBox(tx - 250, py, 500, 150, 0, t, { glowOp: 110 });
    }

    // Tune (drawn before the pod, so it starts hidden inside it)
    if (t >= POP_T) {
      const k = seg(t, POP_T, 1.95), air = t < 1.95;
      const p = air ? arcPt([hx, BELT - 20], [tx, BELT], 330, k) : [tx, BELT];
      const md = mood(t, [[0, 'closed'], [2.86, 'spark', 'spark'], [3.22, 'look', '!']]);
      const o = { ...md, blush: t > 2.86, noShadow: air, seed: 3 };
      if (air) Object.assign(o, { spin: easeOut(k), sq: -.24 * (1 - k), aL: 1.4, aR: 1.4, mouth: 'o', flagWave: 2 });
      else {
        const la = t - 1.95, stretch = ease(seg(t, 2.2, 2.5)) * (1 - ease(seg(t, 2.72, 2.9))), yawn = bump(t, 2.18, 2.86);
        o.sq = boing(la, .32) - .16 * stretch + .04 * (1 - seg(t, 1.95, 2.2));
        o.aL = o.aR = lerp(-.6, 1.25, stretch) + .9 * bump(t, 2.88, 3.25);
        o.mouth = yawn > .12 ? 'O' : t > 3.22 ? 'o' : t > 2.86 ? 'grin' : 'flat';
        o.rot = Math.sin(t * 6) * .06 * stretch;
        o.dy = -1.7 * bump(t, 2.88, 3.2);
        o.flagWave = t > 2.86 ? 2.4 : .35;
        if (t > 3.22) { o.lookY = -1; o.lookX = .1; }
        if (yawn > .3) o.emote = null;
      }
      tune(p[0], p[1], 24, o);
      sparkleBurst(tx, BELT - 130, 210, t - 2.88, { n: 11, life: .8, seed: 5 });
    }

    // the hero pod: snores, rattles, POPs
    const rat = t < POP_T ? seg(t, .45, POP_T) : 0;
    giftPod(hx, BELT, 150, 125, PAL.bubble, PAL.lemon, {
      rot: Math.sin(t * 47) * .09 * rat * rat, dy: -Math.abs(Math.sin(t * 21)) * 16 * rat * rat, sq: t >= POP_T ? boing(t - POP_T, .22) : 0,
      noLid: t >= POP_T, open: t >= POP_T, leak: rat, tagP: ease(seg(t, .05, POP_T - .05)), glowK: 1.6 + rat * 2, t, seed: 9 });
    if (t < POP_T - .1) for (let i = 0; i < 3; i++) {                              // it snores
      const ph = frac(t * .9 + i / 3);
      letter('z', hx + 30 + ph * 70 + Math.sin(ph * 7) * 10, BELT - 150 - ph * 170, 24 + ph * 30, PAL.cream, { alpha: 1 - ph * ph, rot: -.2, ink: false });
    }
    if (t >= POP_T) {
      const la = t - POP_T;
      if (la < .7) paint([[hx - 60, BELT - 120], [hx + 60, BELT - 120], [hx + 190, BELT - 640], [hx - 190, BELT - 640]], { wash: PAL.cream, washOp: 110 * (1 - la / .7), ink: null });
      if (la < 1.3) { push(); translate(hx - 420 * la, BELT - 150 - 1100 * la + 1500 * la * la); rotate(-la * 8); podLid(0, 0, 150, 27, PAL.bubble, PAL.lemon, 1); pop(); }
      sparkleBurst(hx, BELT - 150, 280, la, { n: 14, life: .9 });
      sparkleBurst(hx, BELT - 150, 170, la - .12, { n: 9, life: .7, seed: 4, cols: [PAL.cream, PAL.lemon, PAL.magenta] });
      sfx('POP!', hx - 150, BELT - 300, 120, PAL.lemon, la, { rot: -.15 });
    }
    camEnd();

    // darkness lifting, and the big candy progress bar filling in it
    const dark = 1 - ease(seg(t, .15, .95));
    if (dark > .01) paint(rectPts(-40, -40, W + 80, H + 80), { wash: '#100D26', washOp: 250 * dark, ink: null });
    if (t < 1.95) {
      const by = 64 - 240 * easeIn(seg(t, 1.5, 1.95)), p = ease(seg(t, .05, POP_T - .05));
      glow(960, by + 25, 430, 70, PAL.magenta, 70);
      progressBar(610, by, 700, 50, p, { col: PAL.magenta });
      sparkleBurst(1300, by + 25, 100, t - (POP_T - .05), { n: 7 });
    }
  }

  // =====================================================================================================
  // 3.62 · origin: the dream-bubble flashback. Gemi and Suno come alive and make Tune.
  // =====================================================================================================
  const GX = 560, SX0 = 1360, POD = 800, INPOD = 770, FLOOR = 842;
  const G_END = 740, CLASP = [972, 646];
  const S_AL = .75, S_END = CLASP[0] + 4.6 * 24 + 3 * 24 * Math.cos(S_AL) + 4;
  const G_POP = 4.72, S_RISE = 5.3, HOP = [5.95, 6.35], DING = 6.56, T_OUT = 6.62, T_LAND = 7.08, BPOP = 7.56;
  const L_STREAM = [[760, 322], [690, 372], [560, 390], [500, 450], [GX, 470]], R_STREAM = [[1160, 322], [1230, 372], [1360, 390], [1420, 450], [SX0, 470]];
  function dreamBack(t) {
    glow(380, 300, 520, 360, PAL.gViolet, 100);
    glow(1540, 330, 560, 380, PAL.magenta, 80);
    glow(960, 760, 900, 260, PAL.cyan, 55);
    twinkles(t, 26, 21, 40, 40, 1880, 760, [PAL.cream, PAL.lemon, PAL.cyan, PAL.bubble], 6, 15);
    for (let i = 0; i < 4; i++) {                                                // drifting dream puffs
      const x = ((hash(i * 4) * 2200 + t * (30 + i * 12)) % 2400) - 240, y = 120 + hash(i * 4 + 1) * 480;
      paint(ellPts(x, y, 110 + i * 20, 34 + i * 6, 16), { wash: PAL.cream, washOp: 40, ink: null });
    }
  }
  function podBack(x, col, t, k) {                                               // pedestal, neon ring and the back rim
    paint(ellPts(x, POD + 10, 160, 38, 26), { wash: '#B9BEE0', fill: '#6F74A8', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(x, POD + 6, 136, 28, 26), { ink: col, sw: 2.2 });
    halo(x, POD - 230, 230, col === PAL.cyan ? PAL.cyan : PAL.bubble, 30 + 80 * k, 1.2);
    paint(ellPts(x, POD - 70, 142, 24, 24), { wash: '#6A6096', ink: PAL.ink, sw: .9 });
  }
  function podCup(x, col) {
    const P = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI; P.push([x + Math.cos(a) * 142, POD - 70 + Math.sin(a) * 66]); }
    paint(P, { wash: '#CFD3F0', fill: '#7C82B6', fillOp: 80, bleed: .05, tex: .5, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(x - 70, POD - 40, 12, 22, 10, 0, .5), { wash: '#FFFFFF', washOp: 150, ink: null });
    for (let i = -1; i <= 1; i++) paint(ellPts(x + i * 38, POD - 26, 8, 8, 10), { wash: col, ink: PAL.ink, sw: .5 });
  }
  const eggPts = (x) => ellPts(x, POD - 245, 132, 185, 30);
  function glassOf(pts, col) {
    paint(pts, { wash: '#DDF1FF', washOp: 75, ink: PAL.ink, sw: 1 });
    paint(pts.map(([x, y]) => [x, y]), { ink: col, sw: 1.4 });
  }
  function sheen(x) { inkLine([[x - 95, POD - 300], [x - 88, POD - 360], [x - 60, POD - 400]], 2.2, '#FFFFFF', 'ink', .6); }
  function bubbleFrame(t, open, popK) {
    const rx = 900 * open, ry = 480 * open, cx = 960, cy = 480, pts = [];
    for (let i = 0; i < 56; i++) { const a = i / 56 * TAU, w = 1 + .013 * Math.sin(a * 3 + t * 2.2) + .01 * Math.sin(a * 5 - t * 3.1) + popK * .045 * Math.sin(a * 9 + t * 40); pts.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]); }
    irisShape(pts, '#171236');
    twinkles(t, 10, 55, 20, 20, 1900, 1060, [PAL.cream, PAL.cyan, PAL.bubble], 4, 9);
    paint(pts.map(([x, y]) => [cx + (x - cx) * 1.012, cy + (y - cy) * 1.012]), { ink: PAL.magenta, sw: 1.3 });
    paint(pts, { ink: PAL.cyan, sw: 2.3 });
    inkLine(pts.slice(29, 40).map(([x, y]) => [cx + (x - cx) * .965, cy + (y - cy) * .955]), 3.2, PAL.cream, 'ink', .6);
    for (let i = 0; i < 6; i++) {                                                // little bubbles rising round the rim
      const a = hash(i * 9) * TAU, ph = frac(t * .4 + hash(i * 9 + 1)), r = 10 + hash(i) * 16;
      const bx = cx + Math.cos(a) * rx * 1.03, by = cy + Math.sin(a) * ry * 1.03 - ph * 120;
      paint(ellPts(bx, by, r, r, 12), { wash: PAL.cyan, washOp: 50, ink: PAL.cyan, sw: .6 });
    }
  }

  function origin(t) {
    const cam = kf(t, [[3.62, [960, 240, 1.45]], [4.12, [960, 270, 1.36]], [4.55, [800, 470, 1.25]], [4.75, [700, 560, 1.5]], [5.18, [690, 560, 1.52]], [5.42, [1200, 565, 1.48]], [5.8, [1215, 570, 1.5]], [6.15, [960, 600, 1.2]], [6.45, [960, 610, 1.3]], [7.35, [965, 640, 1.62]]]);
    const shk = shakeXY(t, 7 * Math.exp(-Math.max(0, t - G_POP) * 8) * (t > G_POP ? 1 : 0));
    screenBg('#3A2479', PAL.magenta, 60);
    camBegin(cam[0] + shk[0], cam[1] + shk[1], cam[2], 0);
    dreamBack(t);

    // the prompt that types itself, then streams into the pods
    promptBox(600, 110, 720, 210, seg(t, 3.66, 4.42), t, { glowOp: 120 });
    const head = ease(seg(t, 4.22, 4.62)), tail = ease(seg(t, 4.58, 4.95));
    [[L_STREAM, PAL.cyan, PAL.gBlue], [R_STREAM, PAL.lemon, PAL.sunoB]].forEach(([S, c1, c2], j) => {
      if (head <= 0 || tail >= 1) return;
      const P = chaikin(S, false, 3), Q = subPath(P, tail, head); if (Q.length < 2) return;
      paint(thickPath(Q, 30), { wash: c1, washOp: 110, ink: null });
      const scr = []; for (let k = 0; k <= 40; k++) { const u = k / 40, q = ptAt(Q, u); scr.push([q[0] + Math.cos(u * 60 + t * 20) * 8, q[1] + Math.sin(u * 60 + t * 20) * 8]); }
      inkLine(scr, 1, c2, 'inkfine', .5);
      for (let k = 0; k < 5; k++) { const q = ptAt(Q, frac(t * 2 + k / 5 + j * .1)); paint(sparklePts(q[0], q[1], 13, .6, 0, 4), { wash: PAL.cream, ink: null }); }
    });

    cloudFloor(FLOOR - 30, -200, 2200, 36, 170, t * 25, '#B6A2EE', PAL.gViolet, 1.1);

    // ----- the birth pods (back halves) -----
    const gFill = seg(t, 4.36, G_POP), sFill = seg(t, 4.5, S_RISE);
    podBack(GX, PAL.cyan, t, gFill);
    podBack(SX0, PAL.sunoA, t, sFill);
    if (t < G_POP) {                                                               // Gemi's shape forming inside its pod
      const gp = sparklePts(GX, INPOD - 158, 120 * (.8 + .2 * gFill), .6, 0, 10);
      paint(gp, { fill: PAL.lemon, fillOp: 150 * gFill, bleed: .2, tex: .3, ink: null });
      if (gFill > 0) inkLine(partial([...gp, gp[0]], gFill), 1.8, PAL.cream, 'ink', .3);
      for (let i = 0; i < 6; i++) { const a = t * 5 + i * TAU / 6, r = 170 * (1 - gFill * .6); paint(sparklePts(GX + Math.cos(a) * r, INPOD - 158 + Math.sin(a) * r * 1.2, 10 * gFill + 3, .6, 0, 4), { wash: PAL.lemon, ink: null }); }
    }
    if (t < S_RISE + .25) {                                                        // Suno's sun glowing inside its pod
      const r = 120 * (.5 + .5 * sFill) * (1 + .04 * Math.sin(t * 12));
      halo(SX0, INPOD - 154, r * 1.5, PAL.lemon, 120 * sFill);
      if (t < S_RISE) paint(ellPts(SX0, INPOD - 154, r * .8, r * .8, 22), { wash: PAL.sunoA, washOp: 180 * sFill, ink: null });
    }
    if (t < G_POP) { glassOf(eggPts(GX), PAL.cyan); sheen(GX); }
    if (t < S_RISE) { glassOf(eggPts(SX0), PAL.sunoA); sheen(SX0); }
    else glassOf(clipHalf(eggPts(SX0), (x, y) => y, POD - 245), PAL.sunoA);

    // ----- GENERATE rises out of the cloud -----
    const rise = backOut(seg(t, 5.72, 6.12)), mBase = FLOOR + 5 + (1 - rise) * 280;
    const pumped = t > HOP[1] && t < DING ? Math.sin(t * 90) * 4 : 0;
    // Tune pops out of the slot like toast (drawn before the machine, so it rises out of it)
    const clasp = t > HOP[1] + .05;
    let tuneO = null, tuneP = null;
    if (t >= T_OUT) {
      const k = seg(t, T_OUT, T_LAND);
      tuneP = t < T_LAND ? arcPt([960, mBase - 110], [CLASP[0], CLASP[1] - 4], 360, k) : [CLASP[0], CLASP[1] - 4];
      const md = mood(t, [[T_OUT, 'closed'], [T_LAND + .08, 'wide', '!'], [7.32, 'happy', 'heart']]);
      tuneO = { ...md, noShadow: true, blush: t > 7.3, seed: 2, mouth: t < T_LAND ? 'o' : t < 7.32 ? 'O' : 'grin',
        spin: t < T_LAND ? 2 * easeOut(k) : 0, sq: t < T_LAND ? -.2 * (1 - k) : boing(t - T_LAND, .35), aL: t < T_LAND ? 1.5 : .9 + .5 * bump(t, 7.3, 7.6), aR: t < T_LAND ? 1.5 : .9 + .5 * bump(t, 7.3, 7.6), flagWave: 2.5 };
    }
    if (tuneO && t < T_OUT + .12) tune(tuneP[0], tuneP[1], 19, tuneO);
    if (rise > .01) genMachine(960, mBase, t, { lever: t < DING ? 1 : 1 - backOut(seg(t, DING, DING + .15)), shake: pumped, glowK: t > HOP[1] ? 1 + 1.6 * Math.exp(-Math.max(0, t - DING) * 3) : .6, press: t > DING && t < DING + .3 });

    // ----- Gemi: POP out of the pod, first blink, marvels at its own hands -----
    const gK = seg(t, HOP[0], HOP[1]), sK = seg(t, HOP[0] + .04, HOP[1] + .04);
    let gO = null, gx = GX, gy = INPOD;
    if (t >= G_POP) {
      const k = seg(t, G_POP, 4.98), md = mood(t, [[G_POP, 'closed'], [5.02, 'wide', '!'], [5.14, 'look'], [5.42, 'spark', 'spark'], [5.98, 'happy'], [6.42, 'normal'], [7.14, 'heart', 'heart']]);
      const grow = backOut(seg(t, G_POP, 4.9));
      gO = { ...md, noShadow: t < HOP[1], blush: t > 5.42, mouth: t < 5.02 ? 'o' : t < 5.42 ? 'O' : 'grin', seed: 1, 
        sx: .5 + .5 * grow, sy: .5 + .5 * grow, spin: t < 4.98 ? easeOut(k) : 0, dy: -3.6 * 4 * k * (1 - k), sq: t < 4.98 ? -.2 * (1 - k) : boing(t - 4.98, .3), aL: .2, aR: .2 };
      if (t > 5.1 && t < 5.7) { gO.aR = 1.15 + Math.sin(t * 22) * .28 * bump(t, 5.1, 5.7); gO.lookX = .9; gO.lookY = -.8; gO.aL = -.2; }
      if (t > 5.42 && t < 5.98) gO.aL = .3 + .9 * bump(t, 5.42, 5.98);
      if (t > 5.98 && t < HOP[1]) { gx = lerp(GX, G_END, ease(gK)); gy = lerp(INPOD, FLOOR, gK); gO.dy = -3 * 4 * gK * (1 - gK); gO.sq = -.15 * bump(t, HOP[0], HOP[1]); gO.aL = gO.aR = 1.2; }
      if (t >= HOP[1]) { gx = G_END; gy = FLOOR; gO.sq = boing(t - HOP[1], .28); gO.reachR = lerp(1, 1.9, ease(seg(t, HOP[1], HOP[1] + .15))); gO.aR = .5; gO.aL = .6 + .4 * bump(t, 7.1, 7.5); gO.lookX = .6; gO.lookY = t > T_OUT ? -.6 : 0; }
      if (t > HOP[0] && t < HOP[1]) { gx = lerp(GX, G_END, ease(gK)); gy = lerp(INPOD, FLOOR, gK); }
    }
    // ----- Suno: rises out of its pod like a sunrise -----
    let sO = null, sx = SX0, sy = INPOD;
    if (t >= S_RISE) {
      const k = seg(t, S_RISE, 5.62), md = mood(t, [[S_RISE, 'sleepy'], [5.6, 'wide', '!'], [5.7, 'look'], [5.92, 'spark', 'music'], [6.1, 'happy'], [6.42, 'normal'], [7.14, 'heart', 'heart']]);
      const g = backOut(k);
      sO = { ...md, noShadow: t < HOP[1], blush: t > 5.92, seed: 4, sx: .5 + .5 * g, sy: .5 + .5 * g, dy: lerp(6, 0, easeOut(k)),
        mouth: t < 5.6 ? 'smile' : t < 5.92 ? 'o' : 'grin', sing: bump(t, 5.5, 5.95), aL: -.3, aR: -.3 };
      if (t > 5.68 && t < 5.98) { const w = Math.sin(t * 20) * .25; sO.aL = .9 + w; sO.aR = .9 - w; sO.lookX = t < 5.82 ? -.8 : .8; sO.lookY = -.5; }
      if (t > HOP[0] + .04) { sx = lerp(SX0, S_END, ease(sK)); sy = lerp(INPOD, FLOOR, sK); sO.dy = -3 * 4 * sK * (1 - sK); sO.aL = sO.aR = 1.2; }
      if (t >= HOP[1] + .04) { sx = S_END; sy = FLOOR; sO.sq = boing(t - HOP[1] - .04, .26); sO.aL = S_AL; sO.aR = .4 + .4 * bump(t, 7.1, 7.5); sO.lookX = -.6; sO.lookY = t > T_OUT ? -.6 : 0; }
    }
    // sunrise rays behind Suno
    const ray = bump(t, S_RISE - .05, 6.2);
    if (ray > .02) for (let i = 0; i < 14; i++) { const a0 = t * .5 + i * TAU / 14, a1 = a0 + TAU / 14 * .5, r0 = 150, r1 = 200 + 420 * ray; paint([[SX0 + Math.cos(a0) * r0, INPOD - 154 + Math.sin(a0) * r0], [SX0 + Math.cos(a0) * r1, INPOD - 154 + Math.sin(a0) * r1], [SX0 + Math.cos(a1) * r1, INPOD - 154 + Math.sin(a1) * r1], [SX0 + Math.cos(a1) * r0, INPOD - 154 + Math.sin(a1) * r0]], { wash: i % 2 ? PAL.lemon : PAL.bubble, washOp: (i % 2 ? 190 : 110) * ray, ink: null }); }

    const before = t < 5.98;                                                       // still inside their pods?
    if (!before) { podCup(GX, PAL.cyan); podCup(SX0, PAL.sunoA); }
    if (gO) gemi(gx, gy, 24, gO);
    if (sO) suno(sx, sy, 24, sO);
    if (before) { podCup(GX, PAL.cyan); podCup(SX0, PAL.sunoA); }
    // the cap of Suno's egg lifts off; Gemi's shatters
    if (t >= S_RISE && t < S_RISE + 1) {
      const a = t - S_RISE; push(); translate(SX0 + 60 * a, -600 * a * a - 220 * a); rotate(a * .8);
      glassOf(clipHalf(eggPts(SX0), (x, y) => -y, -(POD - 245)), PAL.sunoA); pop();
    }
    if (t >= G_POP && t < G_POP + 1.2) {
      const a = t - G_POP, E = eggPts(GX);
      for (const s of [-1, 1]) {
        push(); translate(s * 950 * a, -300 * a + 1600 * a * a); translate(GX, POD - 245); rotate(s * a * 3); translate(-GX, -(POD - 245));
        glassOf(clipHalf(E, (x, y) => s * x, s * GX + 8), PAL.cyan); pop();
      }
      for (let i = 0; i < 10; i++) {
        const an = -Math.PI / 2 + (hash(i + 40) - .5) * 3, v = 500 + hash(i + 41) * 600, px = GX + Math.cos(an) * v * a, py = POD - 250 + Math.sin(an) * v * a + 1500 * a * a;
        paint(starPts(px, py, 14, .35, 3, a * 8 + i), { wash: '#DDF1FF', washOp: 180, ink: PAL.cyan, sw: .6 });
      }
    }
    // little first-magic sparkles from their new hands
    if (gO) { const tp = gemiTip(gx, gy, 24, gO, 1); sparkleBurst(tp[0], tp[1], 90, t - 5.44, { n: 7, life: .6, seed: 8 }); }
    if (sO) for (const s of [-1, 1]) {
      const hp = sunoHand(sx, sy, 24, sO, s), a = t - 5.92;
      if (a > 0 && a < .9) for (let i = 0; i < 2; i++) {
        const nx = hp[0] + s * (20 + a * 80) + i * 30, ny = hp[1] - 30 - a * 200 - i * 40, sz = 18 * (1 - a / .9);
        paint(ellPts(nx, ny, sz * .7, sz * .52, 10, 0, -.4), { wash: i ? PAL.lemon : PAL.cream, ink: PAL.ink, sw: .5 });
        inkLine([[nx + sz * .6, ny], [nx + sz * .6, ny - sz * 2.2], [nx + sz * 1.4, ny - sz * 1.6]], 1.1, PAL.cream, 'ink', 0);
      }
    }
    // hand-in-hand glow, a heart, the toast landing in their arms
    if (clasp) {
      const g = ease(seg(t, HOP[1], HOP[1] + .2));
      halo(CLASP[0], CLASP[1], 90 + 50 * pulse(t, 4), PAL.cream, 150 * g, .85);
      if (t < DING + .1) paint(heartPts(CLASP[0], CLASP[1] - 50 - 60 * seg(t, HOP[1], DING), 24 * g), { wash: '#FF5C98', ink: PAL.ink, sw: .6 });
      paint(ellPts(CLASP[0], CLASP[1], 16, 16, 10), { wash: PAL.cream, ink: PAL.ink, sw: .6 });
    }
    if (tuneO && t >= T_OUT + .12) tune(tuneP[0], tuneP[1], 19, tuneO);
    const da = t - DING;
    if (da > 0) {
      sparkleBurst(960, mBase - 160, 220, da, { n: 12, life: .8, seed: 2 });
      sfx('DING!', 1250, 470, 110, PAL.lemon, da, { rot: .1, life: .88 });
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = 80 + da * 500; if (da < .35) inkLine([[960 + Math.cos(a) * r * .6, mBase - 160 + Math.sin(a) * r * .6], [960 + Math.cos(a) * r, mBase - 160 + Math.sin(a) * r]], 1.4, PAL.cream, 'ink', 0); }
    }
    sparkleBurst(GX, INPOD - 170, 260, t - G_POP, { n: 14, life: .8, seed: 11 });
    sparkleBurst(GX, INPOD - 170, 190, t - G_POP - .1, { n: 12, life: .8, seed: 12, cols: [PAL.cream, PAL.lemon, PAL.cyan] });
    sparkleBurst(GX, INPOD - 170, 150, t - G_POP - .25, { n: 9, life: .7, seed: 13, cols: [PAL.bubble, PAL.cream] });
    sfx('POP!', GX + 40, 330, 110, PAL.cyan, t - G_POP, { rot: -.12 });
    if (t > S_RISE) for (let i = 0; i < 6; i++) { const ph = frac(t * .7 + i / 6), a = i * 1.1; paint(sparklePts(SX0 + Math.cos(a) * (150 + ph * 60), INPOD - 160 - ph * 240, 12 * (1 - ph), .6, 0, 4), { wash: PAL.lemon, ink: null }); }

    cloudFloor(FLOOR + 50, -200, 2200, 26, 120, -t * 30, '#D9CBFA', '#A38BE8', 1.1);
    camEnd();
    flushLetters();

    // the dream bubble: opens on the prompt, pops at the end
    if (t < BPOP) bubbleFrame(t, .1 + .9 * easeOut(seg(t, 3.62, 3.98)), seg(t, 7.42, BPOP));
    else {
      const a = t - BPOP;
      for (let i = 0; i < 28; i++) {
        const an = i / 28 * TAU, r0 = 1, v = 1 + a * (2 + hash(i) * 2);
        const x = 960 + Math.cos(an) * 900 * v, y = 480 + Math.sin(an) * 480 * v, s = 16 * (1 - a / .2) + 6;
        paint(ellPts(x, y, s, s, 10), { wash: i % 2 ? PAL.cyan : PAL.cream, washOp: 200, ink: PAL.ink, sw: .5 });
      }
      sfx('POP!', 960, 250, 150, PAL.cream, a + .05, { rot: .08 });
      flash(.55 * (1 - a / .15));
    }
  }

  // =====================================================================================================
  // 7.70 · noWords: the human's night bedroom
  // =====================================================================================================
  const WIN = [1080, 90, 380, 380], LAP = 690, DICT = 335, PILE = [[1340, 676], [1398, 680], [1370, 640], [1310, 690], [1425, 650], [1352, 606]];
  function bedroom(t, o = {}) {
    paint(rectPts(-500, -40, 3500, 1200), { wash: '#1B4450', fill: '#0F2A33', fillOp: 110, bleed: .06, tex: .75, border: .3, ink: null });
    paint(rectPts(-500, -70, 3500, 34), { wash: '#132F38', ink: PAL.ink, sw: 1 });
    glow(LAP, 520, 560, 430, PAL.cyan, 80);
    // fairy lights
    const FL = []; for (let i = 0; i <= 20; i++) { const x = lerp(-80, 1020, i / 20); FL.push([x, 50 + Math.sin(i / 20 * Math.PI * 3) * -28 + 40]); }
    inkLine(FL, .8, PAL.ink, 'inkfine', .5);
    FL.forEach(([x, y], i) => { if (i % 2) return; const col = [PAL.lemon, PAL.magenta, PAL.mint, PAL.coral, PAL.cyan][i / 2 % 5], on = .6 + .4 * Math.sin(t * 3 + i); glow(x, y + 12, 26, 26, col, 90 * on, 12); paint(ellPts(x, y + 12, 8, 11, 10), { wash: col, ink: PAL.ink, sw: .4 }); });
    // shelf, books and a plant
    paint(rectPts(90, 330, 380, 16, 1), { wash: '#6B4A5E', ink: PAL.ink, sw: .9 });
    [[110, 60, 90, PAL.coral], [150, 36, 110, PAL.mint], [190, 44, 96, PAL.gViolet], [236, 30, 80, PAL.lemon]].forEach(([x, w, h, c]) => paint(rrPts(x, 330 - h, w, h, 5, 1), { wash: c, washOp: 220, fill: PAL.ink, fillOp: 30, tex: .4, ink: PAL.ink, sw: .7 }));
    paint([[340, 330], [420, 330], [410, 270], [350, 270]], { wash: PAL.coral, ink: PAL.ink, sw: .8 });
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .45 + Math.sin(t * 1.5 + i) * .05; paint(ellPts(380 + Math.cos(a) * 45, 270 + Math.sin(a) * 45, 30, 12, 10, 0, a), { wash: PAL.sap, ink: PAL.ink, sw: .6 }); }
    // the window, flung open onto the night
    const [wx, wy, ww, wh] = WIN;
    paint(rectPts(wx, wy, ww, wh, 2), { wash: '#252C6E', fill: PAL.indigo, fillOp: 110, tex: .6, ink: null });
    paint(ellPts(wx + ww * .72, wy + 90, 46, 46, 20, 1), { wash: PAL.cream, fill: PAL.lemon, fillOp: 60, ink: PAL.ink, sw: .8 });
    twinkles(t, 8, 71, wx + 20, wy + 20, wx + ww - 20, wy + wh - 30, [PAL.cream, PAL.lemon], 4, 10);
    paint(rectPts(wx - 12, wy - 12, ww + 24, wh + 24), { ink: '#D9C6B0', sw: 2.6 });
    const sw1 = Math.sin(t * 1.3) * 10;
    paint([[wx, wy], [wx - 90, wy + 30 + sw1], [wx - 90, wy + wh - 30 - sw1], [wx, wy + wh]], { wash: '#7FB6C8', washOp: 70, ink: '#D9C6B0', sw: 1.6 });
    paint([[wx + ww, wy], [wx + ww + 90, wy + 30 - sw1], [wx + ww + 90, wy + wh - 30 + sw1], [wx + ww, wy + wh]], { wash: '#7FB6C8', washOp: 70, ink: '#D9C6B0', sw: 1.6 });
    for (const s of [-1, 1]) {                                                   // curtains breathing in the breeze
      const cx0 = s < 0 ? wx - 130 : wx + ww + 130, P = [[cx0 - 50, wy - 30], [cx0 + 50, wy - 30]];
      for (let k = 0; k <= 6; k++) P.push([cx0 + 50 + Math.sin(t * 2 + k * .9 + s) * 12 * k / 6 - s * k * 8, wy - 30 + k * (wh + 90) / 6]);
      for (let k = 6; k >= 0; k--) P.push([cx0 - 50 + Math.sin(t * 2 + k * .9 + s + .5) * 12 * k / 6 - s * k * 8, wy - 30 + k * (wh + 90) / 6]);
      paint(P, { wash: PAL.magenta, fill: PAL.grape, fillOp: 60, tex: .5, ink: PAL.ink, sw: .9 });
    }
    inkLine([[wx - 220, wy - 36], [wx + ww + 220, wy - 36]], 2, '#D9C6B0', 'ink', 0);
    paint(rectPts(wx - 30, wy + wh + 8, ww + 60, 20, 1), { wash: '#D9C6B0', ink: PAL.ink, sw: .9 });
    // pneumatic tube + receiver on the right
    tubeSeg(-900, 560);
    paint(rrPts(1575, 555, 130, 138, 18, 1), { wash: '#5E8C9A', fill: '#2C5260', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1.1 });
    const hk = clamp(o.hatch || 0);
    paint(ellPts(1640, 625, 48, 48, 22), { wash: hk > .05 ? '#10222A' : '#8FC1CC', ink: PAL.ink, sw: 1 });
    if (hk > .05) paint(ellPts(1640 + 48 + 20 * hk, 625, 48 * (1 - hk * .8) + 6, 48, 22), { wash: '#8FC1CC', ink: PAL.ink, sw: .9 });
    paint(ellPts(1690, 575, 7, 7, 10), { wash: o.hatch ? PAL.lemon : PAL.mint, ink: null });
    // the human's chair back
    paint(rrPts(HX - 150, 520, 300, 240, 40, 1), { wash: '#6A3F7A', fill: PAL.grape, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
  }
  function tubeSeg(y0, y1) {                                                      // glass tube at x 1640, from y0 (top) to y1
    if (CAM) { const hh = H / 2 / CAM.zoom + 120; y0 = Math.max(y0, CAM.cy - hh); y1 = Math.min(y1, CAM.cy + hh); }
    if (y1 - y0 < 4) return;
    paint(rectPts(1590, y0, 100, y1 - y0), { wash: '#BFEFFF', washOp: 60, ink: null });
    inkLine([[1590, y0], [1590, y1]], 1.4, PAL.cyan, 'ink', 0);
    inkLine([[1690, y0], [1690, y1]], 1.4, PAL.cyan, 'ink', 0);
    inkLine([[1606, y0], [1606, y1]], 2.4, '#FFFFFF', 'ink', 0);
    for (let y = Math.ceil(y0 / 300) * 300; y < y1; y += 300) paint(rrPts(1582, y - 10, 116, 20, 6), { wash: '#5E8C9A', ink: PAL.ink, sw: .8 });
  }
  function desk(t, o = {}) {
    paint(rectPts(-500, 690, 3500, 34, 1), { wash: '#8A6280', fill: '#5E3F58', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1 });
    paint(rectPts(-500, 724, 3500, 500), { wash: '#4A3350', fill: PAL.grape, fillOp: 60, bleed: .05, tex: .7, border: .5, ink: PAL.ink, sw: 1.1 });
    for (const dx of [420, 1500]) { paint(rrPts(dx - 150, 770, 300, 110, 12, 1), { ink: '#2E1F32', sw: 1 }); paint(ellPts(dx, 825, 14, 10, 10), { wash: PAL.lemon, ink: PAL.ink, sw: .6 }); }
    glow(LAP, 720, 420, 60, PAL.cyan, 70);
    // the dictionary
    const dg = o.dictGlow || 0;
    if (dg > .02) for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .28 + Math.sin(t * 3 + i) * .04, L = 260 * dg; paint([[DICT + Math.cos(a - .06) * 30, 650 + Math.sin(a - .06) * 30], [DICT + Math.cos(a) * L, 650 + Math.sin(a) * L], [DICT + Math.cos(a + .06) * 30, 650 + Math.sin(a + .06) * 30]], { wash: PAL.cream, washOp: 130 * dg, ink: null }); }
    paint([[DICT - 150, 700], [DICT + 150, 700], [DICT + 140, 676], [DICT - 140, 676]], { wash: '#B23A4E', ink: PAL.ink, sw: .9 });
    const flap = Math.sin(t * 30) * 10 * dg;
    for (const s of [-1, 1]) {
      paint([[DICT, 688], [DICT + s * 135, 678], [DICT + s * 128, 626 + (s > 0 ? flap : -flap) * .5], [DICT, 640]], { wash: PAL.cream, fill: '#E9D9B8', fillOp: 60, ink: PAL.ink, sw: .8, curv: .2 });
      for (let k = 0; k < 4; k++) inkLine([[DICT + s * 18, 652 + k * 9], [DICT + s * 112, 644 + k * 9]], .5, '#8C7A6A', 'inkfine', .3);
    }
    // laptop: blank page and blinking cursor
    paint(rrPts(LAP - 185, 378, 370, 306, 18, 1), { wash: PAL.suno, ink: PAL.ink, sw: 1.2 });
    paint(rrPts(LAP - 165, 396, 330, 270, 10, 1), { wash: '#57C9D8', fill: '#FFFFFF', fillOp: 40, tex: .4, ink: PAL.ink, sw: .8 });
    paint(rectPts(LAP - 110, 410, 220, 250, 1), { wash: '#F4FBFF', ink: null });
    if (!o.noCursor && frac(t * 1.8) < .55) paint(rectPts(LAP - 92, 426, 6, 30), { wash: PAL.ink, ink: null });
    paint([[LAP - 205, 684], [LAP + 205, 684], [LAP + 230, 712], [LAP - 230, 712]], { wash: '#B9B4D6', ink: PAL.ink, sw: 1 });
    glow(LAP, 530, 150, 110, '#FFFFFF', 40);
  }
  const paperBall = (x, y, r, rot) => {
    paint(ellPts(x, y, r, r * .92, 12, r * .12, rot), { wash: PAL.cream, fill: '#D8CDB8', fillOp: 70, tex: .5, ink: PAL.ink, sw: .7 });
    inkLine([[x - r * .5, y - r * .2], [x - r * .1, y + r * .1], [x + r * .4, y - r * .3]], .5, '#8C7A6A', 'inkfine', .2);
    inkLine([[x - r * .2, y + r * .5], [x + r * .2, y + r * .2]], .5, '#8C7A6A', 'inkfine', .2);
  };
  const pencilHook = (s) => { push(); translate(.1 * s, -9.05 * s); rotate(-.28 + Math.sin(T * 13) * .12);
    paint(rrPts(-.4 * s, -.15 * s, 2.7 * s, .3 * s, .1 * s), { wash: PAL.lemon, ink: PAL.ink, sw: .6 });
    paint(rrPts(-.6 * s, -.15 * s, .3 * s, .3 * s, .08 * s), { wash: PAL.bubble, ink: PAL.ink, sw: .5 });
    paint([[2.3 * s, -.15 * s], [2.9 * s, 0], [2.3 * s, .15 * s]], { wash: '#F2D2A9', ink: PAL.ink, sw: .5 }); pop(); };
  const netHook = (s, sw) => {
    paint(rrPts(-.3 * s, -.13 * s, 5 * s, .26 * s, .12 * s), { wash: '#A9764F', ink: PAL.ink, sw: sw * .6 });
    paint([[5.2 * s, -1 * s], [8.8 * s, .6 * s], [5.2 * s, 1 * s]], { wash: PAL.cream, washOp: 90, ink: PAL.ink, sw: sw * .4, curv: .6 });
    for (const k of [-.5, 0, .5]) inkLine([[5.2 * s, k * 2 * s], [8.6 * s, .6 * s]], sw * .3, '#9A8C80', 'inkfine', .3);
    paint(ellPts(5.2 * s, 0, .35 * s, 1.1 * s, 16), { ink: PAL.magenta, sw: sw * 1.4 });
  };
  const WORD = ['W', 'O', 'R', 'D', 'S'], BCOL = [PAL.magenta, PAL.gBlue, PAL.coral, PAL.grape, PAL.teal];
  function blockPos(t, i) {
    const st = 8.72 + i * .16, k = seg(t, st, st + 2.35); if (t < st) return null;
    const P = chaikin([[DICT + (i - 2) * 22, 650], [320 + i * 40, 470 - i * 12], [560 + i * 60, 330 + (i % 2) * 60], [860 + i * 40, 250 + (i % 3) * 40], [1130 + i * 26, 320 - (i % 2) * 40], [1250 + i * 12, 250 + i * 18], [1330 + i * 30, 150 + i * 12]], false, 2);
    const p = ptAt(P, ease(k));
    const dodge = 130 * bump(t, 9.8, 10.3) * clamp(1 - Math.abs(p[0] - 1100) / 500);
    return { x: p[0] + Math.cos(t * 5 + i) * 8, y: p[1] + Math.sin(t * 8 + i * 1.7) * 14 - dodge, s: 70 * (.35 + .65 * easeOut(seg(k, 0, .12))) * (1 - .7 * seg(k, .78, 1)), k };
  }
  function letterBlock(b, i, t) {
    const { x, y, s } = b, fl = Math.abs(Math.sin(t * 17 + i * 1.3)), wc = [PAL.bubble, PAL.cyan, PAL.lemon, PAL.mint, PAL.coral][i];
    for (const sd of [-1, 1]) {
      paint(ellPts(x + sd * s * (.45 + .4 * fl), y - s * .35, s * (.15 + .45 * fl), s * .44, 12, 0, sd * .5), { wash: wc, washOp: 225, ink: PAL.ink, sw: .6 });
      paint(ellPts(x + sd * s * (.4 + .25 * fl), y + s * .15, s * (.1 + .28 * fl), s * .28, 10, 0, -sd * .4), { wash: wc, washOp: 225, ink: PAL.ink, sw: .5 });
    }
    paint(rrPts(x - s / 2, y - s / 2, s, s, s * .16, 1), { wash: BCOL[i], fill: PAL.cream, fillOp: 50, tex: .4, ink: PAL.ink, sw: .8 });
    letter(WORD[i], x, y + s * .04, s * .72, PAL.cream, { rot: Math.sin(t * 6 + i) * .15 });
  }

  const THROWS = [8.0, 8.48, 8.96];
  function noWords(t) {
    let cam = kf(t, [[7.7, [870, 470, 1.3]], [9.2, [890, 482, 1.4]], [10.1, [1000, 445, 1.38]], [11.05, [1080, 430, 1.4]]]);
    const wk = easeIn(seg(t, 11.12, 11.5)), rot = .34 * wk;
    cam = [lerp(cam[0], 1700, wk), lerp(cam[1], 520, wk), lerp(cam[2], 1.5, wk)];
    screenBg('#1B4450', '#0F2A33', 100);
    camBegin(cam[0], cam[1], cam[2], rot);
    const dictGlow = seg(t, 8.5, 8.8) * (1 - seg(t, 9.8, 10.4));
    bedroom(t);
    // the human, chewing a pencil, then the butterfly net
    const md = mood(t, [[7.7, 'lazy'], [9.22, 'wide', '!'], [9.6, 'normal'], [10.12, 'lazy', 'sweat'], [10.95, 'angry']]);
    let aR = -.45, aL = -.55;
    for (const L of THROWS) aR += 1.5 * bump(t, L - .56, L - .16);
    if (t > 9.3) aR = kf(t, [[9.3, -.45], [9.8, 1.9], [9.86, 1.9], [10.06, -.5], [10.5, -.2], [10.95, .2], [11.2, 1.9], [11.5, -1.2]], ease);
    if (t > 9.86 && t < 10.06) aR = lerp(1.9, -.5, easeIn(seg(t, 9.86, 10.06)));
    if (t > 11.2) aR = lerp(1.9, -1.2, easeIn(seg(t, 11.2, 11.5)));
    const stand = ease(seg(t, 9.3, 9.6)), hO = { ...md, aL, aR, dy: -1.1 * stand, rot: -.06 * bump(t, 9.7, 9.9) + .09 * bump(t, 9.9, 10.3) - .05 * Math.sin(t * 1.2) * (t < 9.2),
      lookX: t < 9.22 ? -.9 : .4, lookY: t < 9.22 ? .2 : -.6, brows: t < 9.22 ? 'worried' : t < 10.9 ? 'up' : 'angry', mouth: t < 9.22 ? 'flat' : t < 10.1 ? 'O' : 'wobble',
      noShadow: true, draw: t < 9.25 ? pencilHook : null, handR: t > 9.34 ? netHook : null };
    human(HX, HG, HS, hO);
    // swoosh arc behind the net
    const sw = t > 9.86 && t < 10.14 ? 1 : 0;
    if (sw) {
      const sh = [HX + 1.75 * HS, HG - 1.1 * HS - 7.4 * HS], R = (3.25 + 5.2) * HS, A = [];
      const a1 = aR, a0 = Math.min(1.9, a1 + .9);
      for (let k = 0; k <= 10; k++) { const a = lerp(a0, a1, k / 10); A.push([sh[0] + Math.cos(a) * R, sh[1] - Math.sin(a) * R]); }
      paint(thickPath(A, 50), { wash: PAL.cream, washOp: 90, ink: null });
    }
    desk(t, { dictGlow });
    // pencil drops when they spot the letters
    if (t >= 9.25 && t < 9.7) { const k = seg(t, 9.25, 9.6), p = arcPt([HX + 40, HG - 1.1 * HS * stand - 9.05 * HS], [HX + 60, 680], -60, k); push(); translate(p[0], p[1]); rotate(k * 6); paint(rrPts(-40, -5, 90, 10, 3), { wash: PAL.lemon, ink: PAL.ink, sw: .6 }); pop(); }
    else if (t >= 9.7) { paint(rrPts(HX + 20, 676, 90, 10, 3), { wash: PAL.lemon, ink: PAL.ink, sw: .6 }); }
    // crumpled paper piles up on the beat
    PILE.forEach(([px, py], i) => {
      const land = i < 2 ? 0 : THROWS[i - 2] ?? 99; if (t < land - .34) return;
      if (t < land) { const hp = humanHand(HX, HG, HS, hO, 1), k = seg(t, land - .34, land), p = arcPt(hp, [px, py], 120, k); paperBall(p[0], p[1], 26, k * 5); }
      else { const sq = boing(t - land, .3); push(); translate(px, py + 24); scale(1 + sq * .4, 1 - sq); paperBall(0, -24, 26, i); pop(); }
    });
    THROWS.forEach(L => { if (t > L - .62 && t < L - .34) { const hp = humanHand(HX, HG, HS, hO, 1); paperBall(hp[0] + jit(2), hp[1] - 10, 12 + 14 * seg(t, L - .62, L - .4), t * 9); } });
    // the letter blocks flutter out and escape
    for (let i = 0; i < 5; i++) { const b = blockPos(t, i); if (b && b.k < 1) letterBlock(b, i, t); }
    if (t > 8.72 && t < 9.4) for (let i = 0; i < 4; i++) { const ph = frac(t * 1.4 + i / 4); paint(sparklePts(DICT - 60 + i * 40, 640 - ph * 120, 10 * (1 - ph), .6, 0, 4), { wash: PAL.lemon, ink: null }); }
    sfx('SWISH', 1330, 520, 80, PAL.cream, t - 9.96, { rot: .15, life: .8 });
    camEnd();
    flushLetters();
    // whip-pan smear into the next shot
    if (wk > .02) smear(wk, t);
  }
  function smear(k, t) {
    for (let i = 0; i < 16; i++) {
      const y = hash(i * 3 + 1) * H, h = 12 + hash(i * 3 + 2) * 60, x = -200 + hash(i * 3 + Math.floor(t * 24)) * 400;
      paint(rectPts(x - 300, y, W + 800, h), { wash: [PAL.cream, '#57C9D8', HOODIE, PAL.magenta][i % 4], washOp: 150 * k, ink: null });
    }
    paint(rectPts(-40, -40, W + 80, H + 80), { wash: '#1B4450', washOp: 200 * k * k, ink: null });
  }

  // =====================================================================================================
  // 11.50 · soul: out of the laptop, into a box, up the tube, into Tune
  // =====================================================================================================
  const HX4 = 1000, BOX = [1185, 690], BW = 150, BH = 120;
  const T_IN = 13.22, T_TOP = 14.5, T_CATCH = 14.8, T_HEART = 15.3;
  const tubeY = t => lerp(625, SY + 600, ease(seg(t, T_IN, T_TOP)));
  const SUNO4 = 1320, GEMI4 = 610, TUNE4 = 960, G4 = SY + 850;
  function skyBits(t, cam) {
    const top = cam[1] - H / 2 / cam[2] - 200, bot = cam[1] + H / 2 / cam[2] + 200;
    // the house roof above the bedroom
    if (top < 0 && bot > -700) {
      paint([[-700, -40], [960, -560], [2700, -40]], { wash: '#3E2750', fill: PAL.grape, fillOp: 70, tex: .6, ink: PAL.ink, sw: 1.3 });
      for (let k = 1; k < 6; k++) { const y = -40 - k * 85, f = k * 85 / 520; inkLine([[-700 + f * 1660, y], [2700 - f * 1740, y]], .7, '#2A1B3D', 'inkfine', 0); }
      paint(rectPts(360, -520, 110, 260, 2), { wash: '#8A4B5E', ink: PAL.ink, sw: 1 });
      paint(rrPts(1570, -330, 140, 40, 10), { wash: '#5E8C9A', ink: PAL.ink, sw: .9 });
      paint(rectPts(-700, -70, 3400, 34), { wash: '#2A1B3D', ink: null });
    }
    // stars all the way up, a moon, then a cloud layer
    for (let i = 0; i < 70; i++) {
      const x = 700 + hash(i * 2.3) * 1900, y = -600 - hash(i * 5.1 + 1) * 3200; if (y < top || y > bot) continue;
      const r = 5 + hash(i) * 9; paint(sparklePts(x, y, r * (.6 + .4 * Math.sin(t * 3 + i)), .62, 0, 4), { wash: i % 3 ? PAL.cream : PAL.lemon, ink: null });
    }
    if (inView(1100, -1250, 150)) { paint(ellPts(1100, -1250, 110, 110, 24, 2), { wash: PAL.cream, fill: PAL.lemon, fillOp: 70, ink: PAL.ink, sw: 1 }); paint(ellPts(1060, -1280, 18, 14, 10), { wash: '#E8DCB8', ink: null }); paint(ellPts(1140, -1210, 12, 10, 10), { wash: '#E8DCB8', ink: null }); }
  }
  const MIDCLOUDS = [[1250, -1750, 420, 0], [2050, -2000, 460, 0], [1200, -2350, 380, 1], [2100, -2600, 340, 1], [1640, -2150, 560, 1]];
  function midClouds(t, front) {
    for (const [x, y, w, f] of MIDCLOUDS) if (f === front && inView(x, y, w)) cloud(x, y, w, f ? '#EDE4FF' : '#C9B8F2', '#9C86DA', 1.1);
  }
  function serverScene(t, oy) {
    glow(960, oy + 360, 900, 460, PAL.magenta, 70);
    paint(ellPts(250, oy + 170, 70, 70, 24, 2), { wash: PAL.cream, fill: PAL.lemon, fillOp: 60, ink: PAL.ink, sw: .9 });
    twinkles(t, 18, 77, -100, oy - 250, 2000, oy + 650, [PAL.cream, PAL.lemon, PAL.cyan], 5, 12);
    // the cloud-server
    halo(960, oy + 400, 620, PAL.cream, 70 + 30 * pulse(t, 3), .6);
    cloud(960, oy + 520, 980, '#F1EAFF', '#A58FE0', 1.3);
    inkLine([[960, oy + 240], [960, oy + 120]], 1.4, PAL.ink, 'ink', 0);
    paint(ellPts(960, oy + 112, 14, 14, 12), { wash: frac(t * 2) < .5 ? PAL.magenta : PAL.lemon, ink: PAL.ink, sw: .6 });
    for (let k = 0; k < 3; k++) { const r = 30 + frac(t * 1.2 + k / 3) * 90; inkLine(ellPts(960, oy + 112, r, r * .55, 14).slice(9, 14), 1, PAL.cyan, 'inkfine', .5); }
    for (let k = -1; k <= 1; k++) {
      const x = 960 + k * 175;
      paint(rrPts(x - 72, oy + 250, 144, 290, 16, 1), { wash: PAL.suno, fill: PAL.grape, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1 });
      for (let r = 0; r < 6; r++) {
        inkLine([[x - 52, oy + 290 + r * 42], [x + 20, oy + 290 + r * 42]], .7, '#5A4F74', 'inkfine', 0);
        for (let c = 0; c < 2; c++) { const on = hash(k * 13 + r * 5 + c + Math.floor(t * 6) * .31) > .4; paint(ellPts(x + 34 + c * 18, oy + 290 + r * 42, 6, 6, 8), { wash: on ? [PAL.mint, PAL.cyan, PAL.magenta, PAL.lemon][(r + c + k + 2) % 4] : '#4A4060', ink: null }); }
      }
    }
    cloudFloor(oy + 790, -600, 3200, 44, 170, t * 18, '#E9DFFF', '#A992E6', 1.2, oy + 1500);
    // the tube pokes up out of the cloud
    paint(rectPts(1590, oy + 640, 100, 170), { wash: '#BFEFFF', washOp: 70, ink: null });
    inkLine([[1590, oy + 640], [1590, oy + 800]], 1.4, PAL.cyan, 'ink', 0); inkLine([[1690, oy + 640], [1690, oy + 800]], 1.4, PAL.cyan, 'ink', 0);
    paint(ellPts(1640, oy + 640, 70, 20, 20), { wash: '#1C3A48', ink: PAL.ink, sw: 1 });
    paint(ellPts(1640, oy + 640, 70, 20, 20), { ink: '#5E8C9A', sw: 2.4 });
    cloud(1640, oy + 810, 300, '#E9DFFF', '#A992E6', 1.1);
  }

  function soulShot(t) {
    // ---- camera: whip-settle in the bedroom → ride the box up the tube → the cloud-server
    let camA = kf(t, [[11.5, [640, 500, 1.45]], [11.8, [820, 500, 1.42]], [12.45, [960, 500, 1.38]], [12.95, [1200, 500, 1.3]], [13.25, [1500, 480, 1.2]]]);
    const shk = shakeXY(t, 9 * Math.exp(-Math.max(0, t - 12.84) * 9) * (t > 12.84 ? 1 : 0)), rot0 = -.26 * (1 - easeOut(seg(t, 11.5, 11.8)));
    const bY = tubeY(t), fk = ease(seg(t, 13.2, 13.5)), sk = ease(seg(t, 14.3, 14.85)), pk = ease(seg(t, 15.25, 16.1));
    let cam = [lerp(camA[0], 1640, fk), lerp(camA[1], bY - 60, fk), lerp(camA[2], 1.15, fk)];
    cam = [lerp(cam[0], 960, sk), lerp(cam[1], SY + lerp(520, 650, pk), sk), lerp(cam[2], lerp(1, 1.38, pk), sk)];
    const skyK = clamp(-(cam[1] - 200) / 3400);
    screenBg(mixCol('#141238', '#3E2878', skyK), mixCol(PAL.indigo, PAL.magenta, skyK), 90);
    camBegin(cam[0] + shk[0], cam[1] + shk[1], cam[2], rot0);
    const view = [cam[1] - H / 2 / cam[2] - 150, cam[1] + H / 2 / cam[2] + 150];

    skyBits(t, cam);
    midClouds(t, 0);
    if (view[0] < SY + 1300) serverScene(t, SY);

    // ---- the bedroom
    const hO = { eyes: 'lazy', noShadow: true, brows: t < 12.0 ? 'up' : null, lookX: t < 12.0 ? -.9 : .6, lookY: t < 12 ? .2 : 0, rot: -.07 * (1 - seg(t, 12.0, 12.3)),
      mouth: t < 12.0 ? 'o' : t < 13.0 ? 'flat' : 'smile',
      aL: kf(t, [[11.5, .3], [11.62, .3], [12.0, 1.0], [12.25, .2], [12.5, -.5]]),
      aR: kf(t, [[11.5, -.45], [12.35, -.45], [12.62, .95], [12.74, .95], [12.84, .42], [12.96, .42], [13.08, .3], [13.35, -.3]], t > 12.74 && t < 12.84 ? easeIn : ease) };
    const stampHook = (s, sw) => { push(); rotate(hO.aR); scale(1.5); paint(rrPts(-.22 * s, -1.2 * s, .44 * s, 1.1 * s, .15 * s), { wash: '#A9764F', ink: PAL.ink, sw: sw * .6 }); paint(ellPts(0, -1.3 * s, .45 * s, .4 * s, 12), { wash: '#A9764F', ink: PAL.ink, sw: sw * .6 });
      paint(rrPts(-1 * s, .25 * s, 2 * s, .6 * s, .12 * s), { wash: '#6B4A3A', ink: PAL.ink, sw: sw * .6 }); paint(rectPts(-.95 * s, .82 * s, 1.9 * s, .22 * s), { wash: PAL.magenta, ink: null }); pop(); };
    if (t > 12.3 && t < 12.98) hO.handR = stampHook;
    const hLeft = humanHand(HX4, HG, HS, hO, -1);
    if (view[1] > -100) {
      bedroom(t, { hatch: t > 12.85 && t < 13.26 ? ease(seg(t, 12.85, 12.95)) * (1 - ease(seg(t, 13.18, 13.26))) : 0 });
      human(HX4, HG, HS, hO);
      desk(t, { noCursor: true });
      // the screen ripples where the hand goes in
      if (t < 12.05) for (let k = 0; k < 3; k++) { const ph = frac(t * 1.6 + k / 3), r = 14 + ph * 90; paint(ellPts(LAP + 70, 560, r, r * .6, 18), { ink: PAL.cyan, sw: 1.4 * (1 - ph) + .2 }); }
      glow(LAP + 70, 560, 140, 110, PAL.bubble, 110 * (1 - seg(t, 11.95, 12.3)));
      PILE.forEach(([px, py], i) => paperBall(px + 60, py, 26, i));
    }
    // the heart-soul
    const hs = seg(t, 11.62, 11.8);
    let heartP = null, heartR = 50, heartIn = false;
    if (t >= 11.62 && t < 12.0) { heartP = [hLeft[0] - 44, hLeft[1] - 10]; heartR = 50 * (.5 + .5 * hs); }
    else if (t >= 12.0 && t < 12.46) { const k = seg(t, 12.0, 12.36), p0 = [humanHand(HX4, HG, HS, { aL: 1.0 }, -1)[0] - 44, humanHand(HX4, HG, HS, { aL: 1.0 }, -1)[1] - 10]; heartP = t < 12.36 ? arcPt(p0, [BOX[0], BOX[1] - BH - 10], 150, ease(k)) : [BOX[0], lerp(BOX[1] - BH - 10, BOX[1] - 40, seg(t, 12.36, 12.46))]; heartR = lerp(50, 36, k); heartIn = t > 12.3; }
    if (heartP && t < 12.0) {
      if (t < 11.99) inkLine([[LAP + 70, 560], [lerp(LAP + 70, heartP[0], .5), heartP[1] + 10], heartP], 2.6 * (1 - seg(t, 11.8, 11.99)) + .4, PAL.bubble, 'ink', .6);
    }
    if (heartP && heartIn) soul(heartP[0], heartP[1], heartR, t, { closed: false });
    // the box: on the desk → tossed into the hatch → up the tube → onto Suno's head
    let bx = BOX[0], bb = BOX[1], brot = 0, bsc = 1, bsq = 0, bopen = t < 12.4 ? 1 : 1 - ease(seg(t, 12.4, 12.58));
    const sunoO = sunoPose(t);
    if (t > 12.96 && t < T_IN) { const k = ease(seg(t, 12.96, T_IN)), p = arcPt(BOX, [1640, 668], 170, k); bx = p[0]; bb = p[1]; brot = -.9 * k; bsc = lerp(1, .6, k); }
    else if (t >= T_IN && t < T_TOP) { bx = 1640; bb = bY + 40; brot = Math.sin(t * 7) * .25; bsc = .6; }
    else if (t >= T_TOP && t < T_CATCH) { const k = seg(t, T_TOP, T_CATCH), top = SY + 850 + sunoO.dy * 26 - 11.1 * 26; const p = arcPt([1640, SY + 640], [SUNO4, top], 260, k); bx = p[0]; bb = p[1]; brot = -k * TAU; bsc = lerp(.6, .75, k); }
    else if (t >= T_CATCH) { bx = SUNO4; bb = SY + 850 + sunoO.dy * 26 - 11.1 * 26 * (1 - sunoO.sq * .7); bsc = .75; bsq = boing(t - T_CATCH, .3); bopen = ease(seg(t, 14.95, 15.1)); }
    if (t < T_IN || t >= T_TOP) cbox(bx, bb, BW, BH, { open: bopen, stamp: t > 12.84, rot: brot, sc: bsc, sq: bsq });
    if (heartP && !heartIn) soul(heartP[0], heartP[1], heartR, t, { closed: t < 11.8 });
    if (t >= T_IN && t < T_TOP) { cbox(bx, bb, BW, BH, { stamp: true, rot: brot, sc: bsc }); }
    if (view[0] < 640 && view[1] > SY + 600) tubeSeg(SY + 640, 556);
    if (t >= T_IN && t < T_TOP) {                                                  // speed puffs trailing the box
      for (let i = 0; i < 5; i++) { const ph = frac(t * 5 + i / 5); paint(ellPts(1640 + (hash(i) - .5) * 60, bb + 40 + ph * 260, 22 * (1 - ph) + 4, 16 * (1 - ph) + 3, 10), { wash: PAL.cream, washOp: 120 * (1 - ph), ink: null }); }
    }
    midClouds(t, 1);
    if (t > 12.3 && t < 12.98) { /* stamp is in the hand hook */ }
    if (view[1] > -100) {
      sfx('THUNK', BOX[0] + 120, 450, 90, PAL.lemon, t - 12.84, { rot: -.1, life: .9 });
      sparkleBurst(LAP + 70, 560, 120, t - 11.99, { n: 8, life: .6, cols: [PAL.bubble, PAL.cream, PAL.lemon] });
    }
    sfx('WHOOSH', 1500, bY - 200 * (t > T_IN ? 1 : 0) + (t > T_IN ? 0 : 0), 90, PAL.cyan, t - 13.24, { rot: -.3, life: 1 });

    // ---- up on the cloud-server
    if (view[0] < SY + 1300) {
      const cheer = t > T_HEART, gl = seg(t, T_HEART, 15.95);
      if (cheer) {
        const cy0 = G4 - 60 - 4 * 17 * ease(gl);
        for (let i = 0; i < 16; i++) { const a0 = -t * .7 + i * TAU / 16, a1 = a0 + TAU / 16 * .55, r0 = 90, r1 = 260 + 1300 * ease(gl); paint([[TUNE4 + Math.cos(a0) * r0, cy0 + Math.sin(a0) * r0], [TUNE4 + Math.cos(a0) * r1, cy0 + Math.sin(a0) * r1], [TUNE4 + Math.cos(a1) * r1, cy0 + Math.sin(a1) * r1], [TUNE4 + Math.cos(a1) * r0, cy0 + Math.sin(a1) * r0]], { wash: i % 2 ? PAL.lemon : PAL.bubble, washOp: i % 2 ? 150 + 90 * gl : 70 + 100 * gl, ink: null }); }
        glow(TUNE4, cy0, 150 + 250 * gl, 150 + 250 * gl, PAL.cream, 90 + 120 * gl);
        for (let k = 0; k < 3; k++) { const ph = frac(bpOf(t) * .5 + k / 3); paint(heartPts(TUNE4, cy0 - 10, 70 + ph * 420), { ink: k % 2 ? PAL.bubble : PAL.magenta, sw: 2.4 * (1 - ph) + .3 }); }
      }
      const gm = move(cheer ? 'hop' : 'bounce', t, 1), gmd = mood(t, [[14, 'look'], [T_HEART, 'happy', 'heart']]);
      gemi(GEMI4, G4, 26, { ...gm, ...gmd, lookX: .8, lookY: -.3, blush: true, mouth: cheer ? 'grin' : 'o', aL: cheer ? 1.6 + .4 * Math.sin(t * 14) : gm.aL, aR: cheer ? 1.6 - .4 * Math.sin(t * 14) : gm.aR, emote: cheer ? gmd.emote : null });
      suno(SUNO4, G4, 26, sunoO);
      const tk = seg(t, T_HEART, 15.9), tmd = mood(t, [[14, 'wide'], [T_HEART, 'spark', 'spark']]), tm = move('hop', t, 2);
      tune(TUNE4, G4, 17, { ...(cheer ? {} : tm), ...tmd, lookX: cheer ? 0 : .8, blush: cheer, mouth: cheer ? 'grin' : 'o', glow: 1.8 * tk, gold: 0,
        dy: cheer ? -4 * ease(tk) + boing(t - T_HEART, .8) + Math.sin(t * 5) * .3 * tk : tm.dy, sq: cheer ? boing(t - T_HEART, .35) : tm.sq, sx: 1 + .35 * ease(tk), sy: 1 + .35 * ease(tk), aL: cheer ? 1.8 : tm.aL - .3, aR: cheer ? 1.8 : tm.aR - .3, flagWave: 2.6, noShadow: cheer });
      if (cheer) for (let i = 0; i < 6; i++) { const a = t * 3 + i * TAU / 6, r = 200 + 20 * Math.sin(t * 7 + i); paint(sparklePts(TUNE4 + Math.cos(a) * r, G4 - 60 - 4 * 17 * ease(tk) + Math.sin(a) * r * .7, 16 + 8 * pulse(t, 5), .6, 0, 5), { wash: [PAL.lemon, PAL.cream, PAL.bubble][i % 3], ink: PAL.ink, sw: .5 }); }
      // heart flies from the box into Tune
      if (t >= 15.0 && t < T_HEART) { const k = seg(t, 15.0, T_HEART), p = arcPt([SUNO4, bb - 60], [TUNE4, G4 - 60], 240, ease(k)); soul(p[0], p[1], lerp(30, 14, k), t); }
      sparkleBurst(TUNE4, G4 - 60, 330, t - T_HEART, { n: 14, life: .7 });
      sparkleBurst(SUNO4, bb - 40, 120, t - T_CATCH, { n: 8, life: .5, seed: 6 });
      if (t > 15.4) confetti(t, 200, 1720, SY - 150, { n: 26, speed: 380, seed: 2 });
      sfx('!', SUNO4 + 150, SY + 420, 90, PAL.lemon, t - T_CATCH, { life: .7 });
      cloudFloor(SY + 905, -600, 3200, 22, 110, -t * 26, '#F6F0FF', '#B7A3E6', 1, SY + 1500);
    }
    camEnd();
    // speed streaks on the ride up
    const spd = t > T_IN && t < T_TOP ? Math.sin(Math.PI * seg(t, T_IN, T_TOP)) : 0;
    if (spd > .05) for (let i = 0; i < 18; i++) {
      const x = hash(i * 7) * W, y = frac(hash(i * 3) + t * 3.5) * (H + 600) - 300, L = 160 + hash(i) * 260;
      if (Math.abs(x - 960) < 140) continue;
      paint(rectPts(x, y, 4 + hash(i + 5) * 5, L * spd), { wash: i % 3 ? PAL.cream : PAL.cyan, washOp: 150 * spd, ink: null });
    }
    // whip-settle smear from the net swing, and the white-out on the drop
    const sm = 1 - easeOut(seg(t, 11.5, 11.74));
    if (sm > .02) smear(sm, t);
    flushLetters();
    flash(ease(seg(t, 15.78, 16.02)));
  }
  function sunoPose(t) {
    const cheer = t > T_HEART, sm = move(cheer ? 'hop' : 'idle', t, 3);
    const md = mood(t, [[14, 'look'], [T_CATCH, 'closed'], [14.98, 'happy', '!'], [T_HEART, 'happy', 'music']]);
    const up = t > 14.45 && t < T_CATCH + .2;
    return { ...sm, ...md, lookX: .6, lookY: -1, blush: true, sing: cheer ? 1 : 0, mouth: t < T_CATCH ? 'O' : cheer ? 'sing' : 'grin', seed: 4,
      aL: up ? 1.9 : cheer ? 1.4 + .4 * Math.sin(t * 13) : sm.aL - .5, aR: up ? 1.9 : cheer ? 1.4 - .4 * Math.sin(t * 13) : sm.aR - .5,
      sq: (sm.sq || 0) + boing(t - T_CATCH, .3), dy: cheer ? sm.dy * .6 : 0 };
  }

  chapter('boot', 0, 16.3, [[0, wake], [3.62, origin], [7.70, noWords], [11.50, soulShot]]);
})();
