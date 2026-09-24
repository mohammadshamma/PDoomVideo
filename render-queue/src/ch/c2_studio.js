// c2_studio: THE DROP (16.3–31.56). Full candy daylight, everything bounces on the 125 BPM beat.
// Shots: Ctrl+C / Ctrl+V clone grid (1 → 32, then a vortex back to one) · giant synth keyboard, bubble stepping stones
// and a mid-air high-five · Gemi's giant quill writes glowing ribbons, Tune hugs the thought bubbles ·
// Suno's spinning wheel spins them into gold, the wheel becomes a gold record.
// Perf: clones are private cheap "miniTune"s; big shapes use washes, watercolour fills stay few and low-poly.
(() => {
  const B = n => OFF + n * BEAT;                                   // beat 34 = 16.64 … beat 65 = 31.52
  const CANDY = [PAL.bubble, PAL.lemon, PAL.mint, PAL.sky, PAL.coral, '#C9B2F2'];
  const GOLD = '#F7C948', GOLD_DK = '#C98A1E', WOOD = '#D39556', WOOD_DK = '#8E5A2C';
  const P2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const arcP = (a, b, h, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(clamp(k) * Math.PI) * h];
  const full = col => paint(rectPts(-200, -200, W + 400, H + 400), { wash: col, ink: null });

  // ======================================================================================
  // shared private bits
  // ======================================================================================
  // polygon tracing a path with a varying width wf(k), k = 0..1 along the path
  function taper(P, wf) {
    const n = P.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const w = wf(i / (n - 1)) / 2;
      L.push([P[i][0] - dy * w, P[i][1] + dx * w]); R.push([P[i][0] + dy * w, P[i][1] - dx * w]);
    }
    return L.concat(R.reverse());
  }
  function cloud(cx, cy, w, col = '#FFF7EC', sw = .8) {
    const p = [];
    for (let i = 0; i <= 14; i++) { const q = i / 14, a = Math.PI + q * Math.PI, b = 1 + .2 * Math.abs(Math.sin(q * Math.PI * 3.5 + cx * .013)); p.push([cx + Math.cos(a) * w * .5 * b, cy + Math.sin(a) * w * .3 * b]); }
    p.push([cx + w * .5, cy + w * .05], [cx - w * .5, cy + w * .05]);
    paint(p, { wash: col, washOp: 245, ink: PAL.ink, sw, curv: .6 });
  }
  // horizontal whip-pan streaks (screen space)
  function streaks(k, seed = 0) {
    if (k < .02) return;
    for (let i = 0; i < 18; i++) {
      const y = hash(i * 3.1 + seed) * H, x = (hash(i * 5.7 + seed) * 1.4 - .2) * W, l = (380 + hash(i) * 700) * k, th = 6 + 14 * hash(i + 9);
      paint(rectPts(x - l / 2, y - th / 2, l, th), { wash: i % 3 ? PAL.cream : PAL.lemon, washOp: 210 * clamp(k * 1.5), ink: null });
    }
  }
  // thought bubble: scalloped cream cloud with wavy scribble lines inside
  function thought(x, y, r, o = {}) {
    if (r < 3) return;
    const p = []; for (let i = 0; i < 30; i++) { const a = i / 30 * TAU + (o.rot || 0); const b = 1 + .09 * Math.abs(Math.sin(a * 3.5)); p.push([x + Math.cos(a) * r * b, y + Math.sin(a) * r * b * .9]); }
    if (o.glow) paint(ellPts(x, y, r * 1.6, r * 1.5, 12), { wash: PAL.lemon, washOp: 90 * o.glow, ink: null });
    paint(p, { wash: o.col || PAL.cream, ink: PAL.ink, sw: clamp(r / 45, .5, 1.1), curv: .5 });
    const sc = o.ink || PAL.gViolet;
    for (let j = 0; j < 3; j++) {
      const yy = y + (j - 1) * r * .32, w = r * (j === 1 ? .62 : .48), L = [];
      for (let k = 0; k <= 8; k++) L.push([x - w + k / 8 * 2 * w, yy + Math.sin(k * 1.9 + j + (o.seed || 0)) * r * .07]);
      inkLine(L, clamp(r / 60, .35, .9), j === 1 ? PAL.magenta : sc, 'inkfine', .5);
    }
  }
  // a bubble with a music note inside (fired by the synth keys)
  function noteBubble(x, y, r, col) {
    if (r < 4) return;
    paint(ellPts(x, y, r, r, 20), { wash: col, washOp: 215, ink: PAL.ink, sw: .8 });
    paint(ellPts(x - r * .38, y - r * .42, r * .26, r * .14, 8, 0, -.6), { wash: '#FFFFFF', washOp: 200, ink: null });
    paint(ellPts(x - r * .12, y + r * .22, r * .22, r * .16, 10, 0, -.4), { wash: PAL.ink, ink: null });
    inkLine([[x + r * .08, y + r * .2], [x + r * .08, y - r * .42], [x + r * .36, y - r * .22]], .9, PAL.ink, 'ink', 0);
  }
  // Cheap Tune for the clone wallpaper: same silhouette and colours, far fewer shapes.
  function miniTune(x, y, u, o = {}) {
    const sw = clamp(u / 13, .45, 2.4), sq = o.sq || 0, cy = -3.3 * u, det = o.det ?? true;
    paint(ellPts(x, y + u * .1, u * 3.2, u * .6, 10), { wash: PAL.ink, washOp: 45, ink: null });
    push(); translate(x, y + (o.dy || 0) * u); if (o.rot) rotate(o.rot);
    scale((o.flip ? -1 : 1) * (1 + sq * .6), 1 - sq);
    for (const sd of [-1, 1]) paint(ellPts(sd * 1.5 * u, -.35 * u, .85 * u, .45 * u, 8), { wash: PAL.grape, ink: det ? PAL.ink : null, sw: sw * .5 });
    paint(rectPts(2.17 * u, -12 * u, .76 * u, 8.9 * u), { wash: PAL.suno, ink: null });
    const wv = Math.sin(T * 6.5 + (o.seed || 0)), F = [];
    for (let i = 0; i <= 5; i++) { const k = i / 5; F.push([2.55 * u + k * 3.2 * u + Math.sin(k * 3) * .4 * u, -12 * u + k * 4.4 * u + Math.sin(k * Math.PI) * wv * 1.1 * u - k * k * 1.2 * u]); }
    for (let i = 5; i >= 0; i--) { const k = i / 5; F.push([2.55 * u + k * 2.56 * u + .3 * u, -10.4 * u + k * 3.6 * u + Math.sin(k * Math.PI) * wv * .9 * u - k * k * 1.2 * u]); }
    paint(F, { wash: o.flagCol || PAL.lemon, ink: PAL.ink, sw: sw * .6, curv: .4 });
    for (const sd of [-1, 1]) {
      const a = sd < 0 ? (o.aL ?? -.2) : (o.aR ?? -.2);
      push(); translate(sd * 2.9 * u, cy + .6 * u); rotate(sd < 0 ? a : -a);
      paint(rectPts(sd < 0 ? -2.1 * u : 0, -.3 * u, 2.1 * u, .6 * u), { wash: PAL.grape, ink: null });
      paint(ellPts(sd * 2.1 * u, 0, .5 * u, .48 * u, 8), { wash: PAL.cream, ink: det ? PAL.ink : null, sw: sw * .4 });
      pop();
    }
    const head = ellPts(0, cy, 3.2 * u, 2.5 * u, 22, 0, -.32), hx = 3.2 * u, hf = (px, py) => (px + (py - cy)) / Math.SQRT2;
    paint(head, { wash: PAL.gBlue, ink: null });
    [[-.63, PAL.gViolet], [-.31, PAL.gPink], [0, PAL.sunoC], [.33, PAL.sunoB], [.65, PAL.sunoA]].forEach(([th, c]) => paint(clipHalf(head, hf, th * hx), { wash: c, ink: null }));
    paint(ellPts(-1.5 * u, cy - 1.3 * u, .9 * u, .35 * u, 8, 0, -.4), { wash: '#FFFFFF', washOp: 150, ink: null });
    paint(head, { ink: PAL.ink, sw });
    if (o.blush) for (const bx of [-1.9, 1.9]) paint(ellPts(bx * u, cy + .75 * u, u * .5, u * .28, 8), { wash: PAL.bubble, washOp: 220, ink: null });
    for (const s of [-1, 1]) {
      const ex = s * 1.05 * u, ey = cy - .35 * u;
      if (o.eyes === 'happy') inkLine([[ex - .6 * u, ey + .3 * u], [ex, ey - .35 * u], [ex + .6 * u, ey + .3 * u]], sw * 1.3, PAL.ink, 'ink', .5);
      else {
        paint(ellPts(ex, ey, .6 * u, .8 * u, 12), { wash: PAL.cream, ink: det ? PAL.ink : null, sw: sw * .7 });
        paint(ellPts(ex + (o.lookX || 0) * .25 * u, ey + .08 * u, .35 * u, .46 * u, 10), { wash: PAL.ink, ink: null });
        if (det) paint(ellPts(ex + .15 * u + (o.lookX || 0) * .25 * u, ey - .18 * u, .12 * u, .14 * u, 6), { wash: '#FFFFFF', ink: null });
      }
    }
    if (o.mouth === 'o') paint(ellPts(0, cy + 1.2 * u, .3 * u, .38 * u, 10), { wash: '#5A1F33', ink: PAL.ink, sw: sw * .5 });
    else inkLine([[-.5 * u, cy + .95 * u], [0, cy + 1.3 * u], [.5 * u, cy + .95 * u]], sw, PAL.ink, 'ink', .6);
    pop();
  }
  // bouncing piston rhythm: lands every 2 beats on beats off, off+2, …; air 0..1, land = contact impulse
  function hopper(bp, off, per = 2) {
    const ph = frac((bp - off) / per), tl = ph * per * BEAT;
    return { ph, air: 4 * ph * (1 - ph), land: Math.exp(-tl * 13), str: Math.max(0, Math.abs(1 - 2 * ph) - .45) * 2, age: tl };
  }

  // ======================================================================================
  // SHOT 1 · 16.30–20.12 · "I'm just a copy-paste creation": Ctrl+C / Ctrl+V pistons, clones 1 → 32
  // ======================================================================================
  const COLS = [1, 2, 2, 4, 4, 8], ROWS = [1, 1, 2, 2, 4, 4], SX = 250, SY = 290, TU = 20;
  const ZL = [2.3, 1.85, 1.5, 1.2, .98, .8], GC = [960, 540 + 6 * TU];
  function cellOf(i, L) {
    let c = 0, r = 0;
    for (let l = L; l >= 1; l--) { const h = 1 << (l - 1); if (i >= h) { i -= h; if (l % 2) c += COLS[l - 1]; else r += ROWS[l - 1]; } }
    return [c, r];
  }
  function gridPos(i, L) { const [c, r] = cellOf(i, L); return [GC[0] + (c - (COLS[L] - 1) / 2) * SX, GC[1] + (r - (ROWS[L] - 1) / 2) * SY, c, r]; }

  function keycap(cx, top, w, press, colTop, colSide, label) {
    const y = top + press * 46, h = 150, base = top + h + 84;
    paint(ellPts(cx, base + 4, w * .6, 26, 16), { wash: PAL.ink, washOp: 70, ink: null });
    paint(rrPts(cx - w / 2, y + 34, w, base - y - 34, 36, 1), { wash: colSide, ink: PAL.ink, sw: 1.3 });
    paint(rrPts(cx - w / 2 + 18, y, w - 36, h, 32, 1), { wash: colTop, ink: PAL.ink, sw: 1.3 });
    paint(rrPts(cx - w / 2 + 46, y + 14, w - 92, h - 44, 26), { wash: '#FFFFFF', washOp: 80, ink: null });
    letter(label, cx, y + h + 26, 60, PAL.cream, { ink: true, rot: -.02 });
    return y;
  }

  function copyPaste(t, lt) {
    const bp = bpOf(t), nb = Math.floor(bp), since = (bp - nb) * BEAT;
    const L = clamp(nb - 33, 0, 5), fresh = nb >= 34 && nb <= 38, e = fresh ? backOut(seg(since, 0, .28)) : 1;
    const swK = seg(t, 19.52, 19.96), swE = ease(swK), wall = seg(t, 18.75, 19.05);

    // --- background: bubblegum + lemon sunburst, pumping on the beat
    full('#FF9FC6');
    sunburst(960, 540, PAL.lemon, '#FFE0EC', t * .35 + swE * 4, 20, 1800, 110 + 80 * pulse(t, 5));
    paint(ellPts(960, 540, 420 + 60 * pulse(t, 6), 380 + 60 * pulse(t, 6), 18), { fill: '#FFF6D6', fillOp: 120, bleed: .3, tex: .3, ink: null });
    for (let i = 0; i < 12; i++) {                                    // floating candy hearts / sparkles
      const x = frac(hash(i) + t * .03 * (hash(i + 4) + .5)) * (W + 200) - 100, y = frac(hash(i + 7) - t * .06 * (.5 + hash(i + 2))) * (H + 200) - 100, s = 18 + 16 * hash(i + 1);
      paint(i % 2 ? heartPts(x, y, s) : sparklePts(x, y, s * 1.2, .6, t), { wash: i % 3 ? PAL.cream : PAL.lemon, washOp: 190, ink: null });
    }

    // --- camera: a zoom-out step on every slam, punched on the beat; the vortex zooms back in
    let z = fresh ? lerp(ZL[L - 1], ZL[L], easeOut(seg(since, 0, .38))) : ZL[L];
    z *= 1 + .06 * pulse(t, 9);
    z = lerp(z, 2.3, swE);
    const [shx, shy] = shakeXY(t, 10 * pulse(t, 12) * (1 - swE));
    const rot = .05 * Math.sin(bp * Math.PI / 2) * wall * (1 - swE) - TAU * swE;
    camBegin(960 + shx, 540 + shy, z, rot);

    // shockwave ring out of the grid on each slam
    if (nb >= 34 && since < .4) { const k = since / .4, rr = 200 + k * 1400 / z; paint(ellPts(960, 540, rr, rr * .8, 30), { ink: '#FFFFFF', sw: 2.4 * (1 - k), br: 'ink' }); }

    const N = 1 << L, list = [];
    for (let i = 0; i < N; i++) {
      const [x1, y1, c, r] = gridPos(i, L);
      let p = [x1, y1], s = 1;
      if (fresh) {
        const par = i < N / 2 ? i : i - N / 2, [x0, y0] = gridPos(par, L - 1);
        p = P2([x0, y0], [x1, y1], e); if (i >= N / 2) s = lerp(.45, 1, clamp(e));
      }
      if (swE > 0) {                                                    // vortex: everything spirals into one Tune
        const dx = p[0] - GC[0], dy = p[1] - GC[1], a = swE * (2.6 + Math.hypot(dx, dy) / 420), k = 1 - swE;
        p = [GC[0] + (dx * Math.cos(a) - dy * Math.sin(a)) * k, GC[1] + (dx * Math.sin(a) + dy * Math.cos(a)) * k];
        if (i) s *= 1 - swE * .55;
      }
      if (i && swK >= 1) continue;
      list.push({ i, p, s, c, r, isNew: fresh && i >= N / 2 });
    }
    list.sort((a, b) => (a.i === 0) - (b.i === 0) || a.p[1] - b.p[1]);
    // paste pops behind the new clones
    for (const q of list) if (q.isNew && since < .3) {
      const k = since / .3;
      paint(sparklePts(q.p[0], q.p[1] - 6 * TU, 170 * (1 - k * .5), .6, k), { wash: PAL.cream, washOp: 230 * (1 - k), ink: null });
    }
    for (const q of list) {
      const ph = wall * (q.c + q.r) * .14, bb = bp - ph, sb = Math.sin(bb * Math.PI), hit = Math.exp(-frac(bb) * 7);
      const o = {
        dy: -Math.abs(sb) * 1.8, sq: hit * .16 - (q.isNew ? (1 - clamp(e)) * .35 : 0), aL: .3 + sb * 1.1, aR: .3 - sb * 1.1,
        flip: wall > .5 && (q.c + q.r) % 2 === 1, rot: q.i ? Math.sin(swK * Math.PI) * 4 * (q.i % 2 ? 1 : -1) : 0, seed: q.i * 1.7, blush: true
      };
      if (q.i === 0) tune(q.p[0], q.p[1], TU * q.s, { ...o, sq: t > 19.96 ? Math.exp(-(t - 19.96) * 14) * .3 : o.sq, mouth: 'sing', eyes: t < 16.64 ? 'wide' : (hit > .5 ? 'happy' : 'spark'), glow: .35 + .4 * swE });
      else miniTune(q.p[0], q.p[1], TU * q.s, { ...o, eyes: hit > .55 ? 'happy' : 'n', mouth: (q.i % 3) ? 'smile' : 'o', det: N <= 16 || swE > .5, lookX: ((q.c + q.r) % 2 ? .6 : -.6) });
    }
    // vortex spiral streaks
    const vk = Math.sin(swK * Math.PI);
    if (vk > .02) for (let j = 0; j < 7; j++) {
      const S = []; for (let k = 0; k <= 14; k++) { const a = j / 7 * TAU + k * .35 - t * 9, r = 90 + k * 70; S.push([GC[0] + Math.cos(a) * r, GC[1] - 6 * TU + Math.sin(a) * r]); }
      inkLine(S, 1.3 * vk, j % 2 ? PAL.cream : PAL.magenta, 'ink', .6);
    }
    camEnd();

    // --- foreground pistons: Gemi on Ctrl+C (even beats), Suno on Ctrl+V (odd beats)
    const g = hopper(bp, 34), s = hopper(bp, 35);
    const ky = keycap(245, 700, 400, g.land, '#9BE8CC', PAL.teal, 'Ctrl+C');
    const vy = keycap(1675, 700, 400, s.land, PAL.lemon, PAL.ochre, 'Ctrl+V');
    if (g.age < .5 && bp > 33.9) sparkleBurst(245, ky + 70, 230, g.age, { n: 10, life: .5, seed: nb });
    if (s.age < .5 && bp > 33.9) sparkleBurst(1675, vy + 70, 230, s.age, { n: 10, life: .5, seed: nb + 3 });
    const look = swE > .1 ? 0 : 1;
    gemi(245, ky + 64, 21, {
      dy: -g.air * 8.5, sq: g.land * .32 - g.str * .1, aL: .3 + g.air * 1.5, aR: .3 + g.air * 1.5, rot: Math.sin(g.ph * TAU) * .12,
      spin: (nb % 4 === 1 || nb % 4 === 2) && g.air > .2 ? g.ph : 0, eyes: g.land > .35 ? 'happy' : 'normal', lookX: .8 * look, mouth: g.air > .5 ? 'O' : 'grin', blush: true
    });
    suno(1675, vy + 64, 20, {
      dy: -s.air * 8.5, sq: s.land * .32 - s.str * .1, aL: -.3 + s.air * 1.8, aR: -.3 + s.air * 1.8, rot: -Math.sin(s.ph * TAU) * .1,
      eyes: s.land > .35 ? 'happy' : 'normal', lookX: -.8 * look, mouth: 'sing', sing: .8, blush: true
    });
    // tiny key-hit sound cues
    if (g.age < .35 && bp > 33.9) sfx('CLICK!', 300, ky - 330 - g.air * 60, 46, PAL.cream, g.age, { life: .35, rot: -.12 });
    if (s.age < .35 && bp > 33.9) sfx('CLICK!', 1620, vy - 330, 46, PAL.cream, s.age, { life: .35, rot: .12 });
    flash(.3 * (1 - seg(t, 20.0, 20.12)) * seg(t, 19.93, 20.0), '#FFF6E0');
  }

  // ======================================================================================
  // SHOT 2 · 20.12–24.46 · "A synthetic collaboration": stomping the giant synth, bubble stepping stones, high-five
  // ======================================================================================
  const KW = 150, KT = 690, KF = 905, G2 = 862, V2 = 200, GU2 = 28, SU2 = 27, TU2 = 19;
  const LITC = [PAL.magenta, '#F5B800', '#2FBF8A', '#3E9BE0', '#FF5B3A', '#8C5BE0'];
  const run2 = τ => V2 * clamp(τ - 20.12, 0, 2.76);
  const gx2 = τ => 700 + run2(τ), sx2 = τ => 1250 + run2(τ);
  const STOMPS = [42, 43, 44, 45, 46].map(n => { const x = n % 2 ? sx2(B(n)) : gx2(B(n)); return { n, t: B(n), key: Math.floor(x / KW), dir: n % 2 ? -1 : 1 }; });
  const M2 = [960 + run2(B(47)), 190];                                // the high-five point
  const HF = B(48);                                                    // 23.36, the slap

  function bub(k, τ) {
    const s = STOMPS[k], a = τ - s.t;
    const x = (s.key + .5) * KW + s.dir * (170 + hash(k * 3.3) * 50) * easeOut(seg(a, 0, .45)) + a * 30 * (hash(k + 3) - .5);
    const y = KT + 20 - (255 + hash(k + 7) * 40 - (k % 2) * 25) * easeOut(seg(a, 0, .42)) - Math.max(0, a - .42) * 18 + Math.sin(a * 3 + k) * 8 * seg(a, .4, .8);
    return [x, y, 58 * backOut(seg(a, 0, .3))];
  }
  const tLand = k => STOMPS[k].t + .34;
  const bubTop = (k, τ) => { const [x, y, r] = bub(k, τ); return [x, y - r * .9]; };
  function tunePos2(τ) {
    if (τ < tLand(0)) {                                               // drops in from the top of frame
      const k = seg(τ, 20.12, tLand(0)), end = bubTop(0, τ);
      return { p: [lerp(960 + run2(τ) + 60, end[0], ease(k)), lerp(-260, end[1], easeIn(k))], rot: (1 - k) * 2.5, land: 0, air: 1 };
    }
    for (let k = 0; k < 4; k++) if (τ < tLand(k + 1)) {
      const s = τ - tLand(k), hopD = tLand(k + 1) - tLand(k) - .12;
      if (s < .12) return { p: bubTop(k, τ), land: 1 - s / .12, air: 0, rot: 0 };
      const q = (s - .12) / hopD;
      return { p: arcP(bubTop(k, τ), bubTop(k + 1, τ), 70, q), land: 0, air: Math.sin(q * Math.PI), rot: (k % 2 ? -1 : 1) * Math.sin(q * Math.PI) * .25, spin: k === 2 ? q : 0 };
    }
    const TA = [M2[0], M2[1] + 5.2 * TU2];
    if (τ < B(47)) return { p: bubTop(4, τ), land: 1 - seg(τ - tLand(4), 0, .12), air: 0, rot: 0 };
    if (τ < HF) { const q = seg(τ, B(47), HF); return { p: arcP(bubTop(4, B(47)), TA, 40, easeOut(q)), air: 1, land: 0, rot: 0 }; }
    return { p: [TA[0], TA[1] - 30 * easeOut(seg(τ, HF, 24.46))], air: 1, land: 0, rot: 0 };
  }

  function synthBack(x0, x1, t) {
    const bn = beatN(t);
    paint(rectPts(x0, 470, x1 - x0, 240), { wash: '#6ED3B5', ink: PAL.ink, sw: 1.2 });
    paint(rectPts(x0, 470, x1 - x0, 26), { wash: PAL.cream, ink: PAL.ink, sw: .9 });
    paint(rectPts(x0, 664, x1 - x0, 26), { wash: '#3FA88C', ink: null });
    for (let i = Math.floor(x0 / 240); i * 240 < x1; i++) {
      const kx = i * 240 + 120, col = CANDY[((i % 6) + 6) % 6], a = Math.sin(t * 3 + i) * 1.2 + (bn % 2 ? .6 : -.6);
      if (i % 5 === 2) {                                               // little wave screen
        paint(rrPts(kx - 95, 518, 190, 110, 16), { wash: PAL.suno, ink: PAL.ink, sw: 1 });
        const S = []; for (let k = 0; k <= 16; k++) S.push([kx - 80 + k * 10, 573 + Math.sin(k * .9 + t * 12) * 26 * (.4 + pulse(t, 5))]);
        inkLine(S, 1.1, PAL.cyan, 'ink', .5);
        continue;
      }
      paint(ellPts(kx, 560, 38, 38, 16), { wash: col, ink: PAL.ink, sw: 1 });
      inkLine([[kx, 560], [kx + Math.cos(a - Math.PI / 2) * 30, 560 + Math.sin(a - Math.PI / 2) * 30]], 1.2, PAL.ink, 'ink', 0);
      const lit = (i + bn) % 3 === 0;
      paint(ellPts(kx, 636, 12, 12, 10), { wash: lit ? PAL.lemon : '#2E7E6A', ink: PAL.ink, sw: .6 });
    }
  }
  function keyLit(i, t) {
    let v = 0;
    for (const s of STOMPS) if (s.key === i && t >= s.t) v = Math.max(v, Math.exp(-(t - s.t) * 3.5));
    if (t > HF) { const wx = M2[0] - 1400 + (t - HF) * 2600, d = (i + .5) * KW - wx; v = Math.max(v, Math.exp(-d * d / 60000)); }
    return v;
  }
  function keyboard(x0, x1, t) {
    const i0 = Math.floor(x0 / KW) - 1, i1 = Math.ceil(x1 / KW) + 1;
    for (let i = i0; i <= i1; i++) {
      const lit = keyLit(i, t), col = CANDY[((i % 6) + 6) % 6], kx = i * KW, dn = lit * 10;
      paint(rectPts(kx + 3, KF - 10 + dn, KW - 6, 60), { wash: mixCol(col, PAL.ink, .35), ink: PAL.ink, sw: .8 });
      paint(rrPts(kx + 4, KT + dn, KW - 8, KF - KT, 14), { wash: mixCol(mixCol(PAL.cream, col, .6), LITC[((i % 6) + 6) % 6], lit), ink: PAL.ink, sw: 1 });
      if (lit > .08) paint([[kx + 20, KT + dn], [kx + KW - 20, KT + dn], [kx + KW + 40, KT - 420 * lit], [kx - 40, KT - 420 * lit]], { wash: '#FFFBE8', washOp: 110 * lit, ink: null });
    }
    for (let i = i0; i <= i1; i++) { const m = ((i % 7) + 7) % 7; if ([0, 1, 3, 4, 5].includes(m)) paint(rrPts((i + 1) * KW - 38, KT - 6, 76, 128, 10), { wash: PAL.grape, ink: PAL.ink, sw: 1 }); }
  }

  function synth(t, lt) {
    const bp = bpOf(t), J = seg(t, B(47) - .1, HF), Hh = seg(t, HF, 24.46), hb = t - HF;
    // camera: tracks the stompers, rises into the jump, then pushes into the slap
    let cx = 960 + run2(t), cy = 555, z = 1.1 * (1 + .03 * pulse(t, 10)), rot = 0;
    cx = lerp(cx, M2[0], ease(J)); cy = lerp(cy, 400, ease(J)); z *= lerp(1, 1.05, ease(J));
    z *= lerp(1, 2.3, easeIn(Hh)); cy = lerp(cy, M2[1], easeIn(Hh)); rot = .22 * easeIn(Hh);
    const [shx, shy] = shakeXY(t, 8 * pulse(t, 12) + (hb > 0 && hb < .3 ? 22 * (1 - hb / .3) : 0));

    // sky (screen space, with parallax clouds)
    full('#A6DDF7');
    paint(rectPts(-100, 620, W + 200, 600), { wash: '#FFC9E0', ink: null });
    paint(rectPts(-100, 520, W + 200, 140), { wash: '#D5D2F2', washOp: 200, ink: null });
    paint(ellPts(1500, 250, 120 + 10 * pulse(t, 4), 120 + 10 * pulse(t, 4), 20), { wash: PAL.lemon, ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 5; i++) { const x = ((i * 520 - (cx - 960) * .35 + 4000) % 2600) - 300; cloud(x, 170 + (i % 3) * 110, 260 + 60 * hash(i)); }

    camBegin(cx + shx, cy + shy, z, rot);
    const vx0 = cx - W / (2 * z) - 200, vx1 = cx + W / (2 * z) + 200;
    synthBack(vx0, vx1, t);
    keyboard(vx0, vx1, t);

    // Gemi (lands even beats) and Suno (lands odd beats) stomp their way right; then everybody jumps
    const gh = hopper(bp, 42), sh = hopper(bp, 43), jq = seg(t, B(47), HF);
    const GA = [M2[0] - 3.62 * GU2 - 40, M2[1] + 10.04 * GU2], SA = [M2[0] + 5.08 * SU2 + 40, M2[1] + 8.86 * SU2];
    const pre = t < B(47);
    const g0 = [gx2(t), G2 - gh.air * 2.6 * GU2], s0 = [sx2(t), G2 - sh.air * 2.6 * SU2];
    const gS = [gx2(B(47)), G2 - hopper(bpOf(B(47)), 42).air * 2.6 * GU2], sS = [sx2(B(47)), G2];
    const hang = t > HF ? Math.sin((t - HF) * 3) * 8 - (t - HF) * 20 : 0;
    const gP = pre ? g0 : [lerp(gS[0], GA[0], ease(jq)), lerp(gS[1], GA[1], easeOut(jq)) + hang];
    const sP = pre ? s0 : [lerp(sS[0], SA[0], ease(jq)), lerp(sS[1], SA[1], easeOut(jq)) + hang];
    const antic = t > B(47) - .16 && t < B(47) + .04 ? .25 : 0;
    const air = !pre, slap = hb > 0 && hb < .25 ? 1 - hb / .25 : 0;
    gemi(gP[0], gP[1], GU2, {
      sq: pre ? gh.land * .3 - gh.str * .08 : -.12 * Math.sin(jq * Math.PI), walk: pre && gh.air < .1 ? bp * .5 : null,
      aL: pre ? .2 + gh.air * 1.3 : 1.2, aR: pre ? .2 + gh.air * 1.3 : lerp(1.2, 2, jq), rot: air ? .12 : Math.sin(gh.ph * TAU) * .08,
      eyes: air ? (t > HF ? 'spark' : 'wide') : (gh.land > .4 ? 'happy' : 'normal'), lookX: .6, mouth: air ? 'grin' : 'sing', blush: true, noShadow: air
    });
    suno(sP[0], sP[1], SU2, {
      sq: pre ? sh.land * .3 - sh.str * .08 + antic : -.12 * Math.sin(jq * Math.PI), walk: pre && sh.air < .1 ? bp * .5 : null,
      aL: pre ? -.3 + sh.air * 1.5 : lerp(.6, 1.4, jq), aR: pre ? -.3 + sh.air * 1.5 : .6, rot: air ? -.12 : -Math.sin(sh.ph * TAU) * .08,
      eyes: air ? (t > HF ? 'spark' : 'wide') : (sh.land > .4 ? 'happy' : 'normal'), lookX: -.6, mouth: air ? 'grin' : 'sing', sing: 1, blush: true, noShadow: air
    });
    // stomp dust puffs
    for (const s of STOMPS) { const a = t - s.t; if (a >= 0 && a < .35) { const x = (s.key + .5) * KW; for (const d of [-1, 1]) paint(ellPts(x + d * (60 + a * 260), G2 - 10 - a * 60, 34 * (1 - a / .35), 22 * (1 - a / .35), 10), { wash: PAL.cream, washOp: 220, ink: PAL.ink, sw: .5 }); } }

    // note bubbles (popped at the slap)
    for (let k = 0; k < 5; k++) {
      const s = STOMPS[k]; if (t < s.t) continue;
      const pa = t - (HF + .05 + k * .05);
      const [x, y, r] = bub(k, t);
      if (pa < 0) noteBubble(x, y, r, CANDY[((s.key % 6) + 6) % 6]);
      else if (pa < .4) sparkleBurst(x, y, 110, pa, { n: 7, life: .4, seed: k });
    }
    // Tune rides the bubbles
    const tp = tunePos2(t);
    tune(tp.p[0], tp.p[1], TU2, {
      sq: tp.land * .25 - tp.air * .1, rot: tp.rot, spin: tp.spin || 0, aL: tp.air > .2 || t > B(47) ? 1.5 : .3, aR: tp.air > .2 || t > B(47) ? 1.5 : .3,
      eyes: t < tLand(0) ? 'wide' : (t > HF ? 'spark' : (tp.land > .3 ? 'happy' : 'normal')), mouth: t < tLand(0) ? 'O' : 'sing', blush: true, noShadow: true, glow: t > HF ? .6 : 0
    });

    // the slap: a big star flash, sparkle burst, then rainbow ribbons whirling out of it
    if (hb > 0) {
      const k = seg(hb, 0, .35);
      if (hb < .4) paint(starPts(M2[0], M2[1] - 20, 60 + 200 * easeOut(k), .25, 8, hb * 2), { wash: PAL.cream, washOp: 200 * (1 - seg(hb, .15, .4)), ink: null });
      if (hb < .4) paint(starPts(M2[0], M2[1] - 20, 40 + 70 * easeOut(k), .38, 4, .3), { wash: PAL.lemon, washOp: 255 * (1 - seg(hb, .2, .4)), ink: PAL.ink, sw: 1 });
      sparkleBurst(M2[0], M2[1] - 20, 380, hb - .04, { n: 16, life: 1.0 });
      const Lr = 1500 * easeOut(seg(hb, .12, 1.05));
      const RC = [PAL.gBlue, PAL.lemon, PAL.gPink, PAL.mint, PAL.gViolet, PAL.sky, PAL.coral, PAL.bubble];
      for (let i = 0; i < 8; i++) {
        const P = []; for (let j = 0; j <= 16; j++) { const r = 40 + j / 16 * Lr, a = i / 8 * TAU + hb * 1.6 + r / 700 * 1.4; P.push([M2[0] + Math.cos(a) * r, M2[1] + Math.sin(a) * r]); }
        paint(taper(P, q => 8 + 50 * Math.sin(q * Math.PI * .9 + .1)), { wash: RC[i], washOp: 215, ink: null });
        inkLine(P.slice(2, 14), .6, PAL.cream, 'inkfine', .6);
      }
      sfx('SLAP!', M2[0] + 10, M2[1] - 190, 120, PAL.lemon, hb, { life: .8, rot: -.1 });
    }
    // falling confetti over the whole thing after the slap
    if (hb > 0) confetti(t, vx0, vx1, M2[1] - 700, { n: 30, speed: 420, seed: 3 });
    camEnd();
    flash(seg(t, 24.34, 24.46) * .35, '#FFF4C8');
  }

  // ======================================================================================
  // SHOT 3 · 24.46–27.34 · "Gemini wrote the thoughts I hold": a giant quill writes glowing ribbons
  // ======================================================================================
  const GX3 = 430, GY3 = 910, GU3 = 34, TX3 = 1430, TY3 = 905, TU3 = 34, QL = 150;
  function gPose3(τ) {
    const bp = bpOf(τ), ab = Math.abs(Math.sin(bp * Math.PI)), hit = Math.exp(-frac(bp) * 7);
    return { dy: -ab * .5, sq: hit * .06, aR: 1.05 + .3 * Math.sin(τ * 2.3), aL: .4 + .5 * Math.sin(bp * Math.PI) };
  }
  function hand3(τ) {
    const g = gPose3(τ), u = GU3, R = 5 * u, cy = -6.6 * u, a = clamp(g.aR, -1.6, 2) * .38;
    return [GX3 + Math.cos(-a) * R * (1 + g.sq * .6), GY3 + g.dy * u + (cy + Math.sin(-a) * R) * (1 - g.sq)];
  }
  const phi3 = τ => .5 + .3 * Math.sin(τ * 1.7) + .1 * Math.sin(τ * 4.1);
  function nib3(τ, loops) {
    const h = hand3(τ), f = phi3(τ); let x = h[0] + Math.cos(f) * QL, y = h[1] + Math.sin(f) * QL;
    if (loops) { const w = τ * TAU * 3.4; x += Math.cos(w) * 30; y += Math.sin(w) * 34; }
    return [x, y];
  }
  const RIB_LEN = 1.25, drift3 = (a, t) => [a * 430, -a * 260 + Math.sin(a * 4 - t * 2.5) * 70 * Math.min(1, a * 3)];
  const ribbonPt = (t, a, loops) => { const n = nib3(t - a, loops), d = drift3(a, t); return [n[0] + d[0], n[1] + d[1]]; };
  const SPAWN3 = [51, 52, 53, 54, 55].map(B);                          // a thought bubble pinches off every beat
  const FLY3 = .5;
  const SLOTS = [[0, 0], [-1.05, -.8], [1.0, -.95], [-.1, -1.8], [-1.25, .75]];
  const C3 = [TX3 - 4.9 * TU3, TY3 - 3.6 * TU3];

  function quill(h, nb) {
    // enormous feather quill: nib at nb, held at h, plume sweeping back over Gemi's head
    const dx = nb[0] - h[0], dy = nb[1] - h[1], d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d, nx = -uy, ny = ux;
    const back = (k, off) => [h[0] - ux * k * 520 + nx * off, h[1] - uy * k * 520 + ny * off - k * k * 90];
    const plume = [];
    for (let i = 0; i <= 10; i++) { const k = .15 + i / 10 * .85; plume.push(back(k, -(18 + 62 * Math.sin(Math.PI * (i / 10) * .95)) - Math.sin(i * 2.1) * 6)); }
    for (let i = 10; i >= 0; i--) { const k = .15 + i / 10 * .85; plume.push(back(k, 14 + 58 * Math.sin(Math.PI * (i / 10) * .95) + Math.sin(i * 1.7) * 6)); }
    paint(plume, { wash: '#FF9CC8', ink: PAL.ink, sw: 1.1, curv: .5 });
    paint(plume.map(p => [lerp(p[0], h[0] - ux * 300, .45), lerp(p[1], h[1] - uy * 300 - 30, .45)]), { wash: '#FFD2E6', washOp: 200, ink: null, curv: .5 });
    for (let i = 1; i < 9; i++) { const k = .2 + i / 10 * .8, a = back(k, 0); inkLine([a, back(k + .06, -48 * Math.sin(Math.PI * i / 10)), ], .6, PAL.gViolet, 'inkfine', .3); inkLine([a, back(k + .06, 48 * Math.sin(Math.PI * i / 10))], .6, PAL.gViolet, 'inkfine', .3); }
    inkLine([back(1.02, 0), back(.5, 0), h, nb], 1.6, PAL.grape, 'ink', .4);                // shaft
    paint([[nb[0], nb[1]], [nb[0] - ux * 50 + nx * 11, nb[1] - uy * 50 + ny * 11], [nb[0] - ux * 50 - nx * 11, nb[1] - uy * 50 - ny * 11]], { wash: GOLD, ink: PAL.ink, sw: .8 });
    paint(ellPts(nb[0], nb[1], 22, 22, 10), { wash: PAL.lemon, washOp: 160, ink: null });
  }

  function quillShot(t, lt) {
    const bp = bpOf(t), whip = easeIn(seg(t, 27.12, 27.34));
    full('#FFE680');
    paint(rectPts(-100, 560, W + 200, 700), { wash: '#FFC9A8', washOp: 200, ink: null });
    sunburst(960, 430, '#FFF3B8', '#FFB0CF', t * .12, 20, 2200, 130);

    const cx = 960 + 25 * Math.sin(lt * .8) + whip * 1500, z = (1.1 + .03 * lt) * (1 + .02 * pulse(t, 9));
    camBegin(cx, 575, z, -whip * .05);
    for (let i = 0; i < 4; i++) cloud(((i * 610 + 200 - t * 30) % 2600) - 200, 150 + (i % 2) * 120, 300 + 80 * hash(i + 2), '#FFD3E6');
    // mint hills + flowers
    paint([[-400, 880], [300, 800], [900, 850], [1500, 790], [2400, 860], [2400, 1300], [-400, 1300]], { wash: '#8FDDB8', ink: PAL.ink, sw: 1, curv: .6 });
    paint([[-400, 960], [600, 900], [1300, 940], [2400, 900], [2400, 1300], [-400, 1300]], { wash: '#6CCB9F', ink: null, curv: .6 });
    for (let i = 0; i < 12; i++) { const fx = i * 190 - 60 + hash(i) * 60, fy = 860 + hash(i + 3) * 50, s = 12 + 6 * pulse(t - i * .04, 5); paint(starPts(fx, fy, s, .5, 5, t), { wash: CANDY[i % 6], ink: PAL.ink, sw: .5 }); }

    // arrivals so far
    let got = 0, lastArr = -9; for (const s of SPAWN3) if (t >= s + FLY3) { got++; lastArr = s + FLY3; }
    const hugHit = Math.exp(-(t - lastArr) * 8);

    // the glowing ribbon (smooth band + loopy cursive scribble riding on it)
    const RP = [], SP = [];
    for (let k = 0; k <= 30; k++) { const a = k / 30 * RIB_LEN; RP.push(ribbonPt(t, a, false)); }
    for (let k = 0; k <= 60; k++) { const a = k / 60 * RIB_LEN; SP.push(ribbonPt(t, a, true)); }
    const grow = q => Math.sin(Math.min(1, q * 2.2) * Math.PI / 2), twist = q => .55 + .45 * Math.abs(Math.cos(q * 7 - t * 3));
    paint(taper(RP, q => 50 + 170 * grow(q)), { fill: PAL.lemon, fillOp: 120, bleed: .25, tex: .3, border: .2, ink: null });
    paint(taper(RP, q => 20 + 44 * grow(q)), { wash: '#FFF7C8', washOp: 170, ink: null });
    const band = (off, col, w) => paint(taper(RP.map((p, i) => [p[0], p[1] + off * twist(i / (RP.length - 1)) * grow(i / (RP.length - 1))]), q => (4 + w * grow(q)) * twist(q)), { wash: col, washOp: 240, ink: null });
    band(-30, PAL.gBlue, 30); band(0, PAL.magenta, 32); band(30, '#F5B800', 30);
    paint(taper(RP, q => (3 + 90 * grow(q)) * twist(q)), { ink: PAL.ink, sw: .7 });
    inkLine(SP, 1.4, PAL.cream, 'ink', .5);
    // sparkles shed along the ribbon
    for (let i = 0; i < 7; i++) { const a = frac(i / 7 + t * .6) * RIB_LEN, p = ribbonPt(t, a, false), s = 14 * Math.sin(frac(i / 7 + t * .6) * Math.PI); paint(sparklePts(p[0] + (hash(i) - .5) * 60, p[1] + (hash(i + 5) - .5) * 60, s, .6, t * 2 + i), { wash: i % 2 ? PAL.cream : PAL.lemon, ink: null }); }

    // cluster glow behind the bundle, then the bundle itself
    if (got) paint(ellPts(C3[0], C3[1] - 40, 120 + got * 22, 110 + got * 20, 14), { fill: PAL.lemon, fillOp: 60 + got * 20, bleed: .3, tex: .3, ink: null });
    SLOTS.forEach((sl, i) => { if (i < got) { const pp = Math.exp(-(t - SPAWN3[i] - FLY3) * 9); thought(C3[0] + sl[0] * 88, C3[1] + sl[1] * 80 - hugHit * 6, 52 * (1 + pp * .25), { seed: i, glow: .4 + got * .1, col: i % 2 ? PAL.cream : '#FFF3C4' }); } });

    // Gemi + quill
    const gp = gPose3(t), h = hand3(t), nb = nib3(t, true);
    gemi(GX3, GY3, GU3, { ...gp, eyes: bp % 4 < 2 ? 'happy' : 'look', lookX: .7, lookY: -.2, mouth: 'sing', blush: true });
    quill(h, nb);
    // Tune hugging its bundle; lights up on "hold"
    const md = mood(t, [[24.4, 'look'], [25.3, 'happy', 'heart'], [26.1, 'heart'], [27.08, 'spark', 'bulb']]);
    const tb = Math.abs(Math.sin(bp * Math.PI));
    tune(TX3, TY3, TU3, {
      ...md, dy: -tb * .4, sq: hugHit * .1 + Math.exp(-frac(bp) * 7) * .04, rot: -.06 - hugHit * .05, aL: .05 + hugHit * .2, aR: .5 + .5 * Math.sin(bp * Math.PI),
      lookX: -.7, lookY: -.3, mouth: t > 27.08 ? 'grin' : 'sing', blush: true, glow: Math.min(1, .15 + got * .14 + (t > 27.08 ? .4 : 0))
    });
    // flying bubbles: pinch off the end of the ribbon and arc into Tune's arms
    SPAWN3.forEach((s, i) => {
      const a = t - s; if (a < 0 || a >= FLY3) return;
      const S = ribbonPt(s, RIB_LEN, false), E = [C3[0] + SLOTS[i][0] * 88, C3[1] + SLOTS[i][1] * 80], q = ease(a / FLY3);
      const p = arcP(S, E, 90, q);
      thought(p[0], p[1], 52 * backOut(seg(a, 0, .2)), { seed: i, rot: a * 3, glow: .5 });
    });
    if (t > 27.08) sparkleBurst(TX3, TY3 - 4 * TU3, 300, t - 27.08, { n: 12, life: .6 });

    // Suno bounds in from the right to fetch Tune (then the camera whips on)
    if (t > 26.3) {
      const k = seg(t, 26.3, B(55)), land = t > B(55) ? Math.exp(-(t - B(55)) * 12) : 0;
      const p = arcP([2250, TY3], [1790, TY3], 260, k);
      suno(p[0], p[1], 30, { sq: land * .3 - (k < 1 ? .1 : 0), aL: t > 26.95 ? .9 : .3 + k, aR: .6, eyes: t > 26.9 ? 'happy' : 'wide', lookX: -.8, mouth: 'grin', blush: true, emote: t > 26.85 ? 'music' : null, emoteK: seg(t, 26.85, 27.0), noShadow: k < .95 });
    }
    camEnd();
    streaks(whip, 7);
  }

  // ======================================================================================
  // SHOT 4 · 27.34–31.56 · "And Suno spun them into gold": the spinning wheel, gold thread, golden Tune
  // ======================================================================================
  const WC = [860, 440], WR = 270, SX4 = 320, SY4 = 880, SU4 = 32, TX4 = 1530, TY4 = 790, TU4 = 30;
  const th4 = t => { const s = Math.max(0, t - 27.34); return 2.6 * s + .2 * s * s * s; };
  const GOLDW = t => ease(seg(t, 30.75, 31.15));                       // wheel → gold record
  const DEP4 = [0, 1, 2, 3, 4].map(j => 27.45 + j * .34), FL4 = .75;
  const RING0 = 29.25, NR = 9, POPT = 30.9;
  const C4 = [TX4 - 4.9 * TU4, TY4 - 3.6 * TU4];
  const sunoHand4 = t => { const d = -Math.abs(Math.sin(bpOf(t) * Math.PI)) * .3 * SU4, a = .75 + .15 * Math.sin(t * 5); return [SX4 + 4.6 * SU4 + 3 * SU4 * Math.cos(a), SY4 + d - 5.9 * SU4 - 3 * SU4 * Math.sin(a)]; };
  const FEED = [WC[0] + Math.cos(Math.PI - .35) * WR, WC[1] + Math.sin(Math.PI - .35) * WR];
  const EXIT = [WC[0] + WR + 10, WC[1] + 20];
  function ringY(i) { return TY4 - (.5 + i * 1.22) * TU4; }
  function ringRx(i) { const y = -(.5 + i * 1.22); return y > -1 ? 3.4 : y > -6 ? 3.9 : 1.5; }

  function wheel(t) {
    const th = th4(t), gk = GOLDW(t), om = 2.6 + .6 * Math.pow(Math.max(0, t - 27.34), 2);
    const wood = mixCol(WOOD, GOLD, gk), dk = mixCol(WOOD_DK, GOLD_DK, gk);
    // stand, base, treadle + pitman rod
    for (const s of [-1, 1]) paint([[WC[0] + s * 20, WC[1] - 10], [WC[0] + s * 50, WC[1] + 10], [WC[0] + s * 230, 875], [WC[0] + s * 190, 875]], { wash: dk, ink: PAL.ink, sw: 1 });
    paint(rrPts(WC[0] - 280, 858, 560, 40, 12), { wash: WOOD_DK, ink: PAL.ink, sw: 1 });
    const rock = Math.sin(th) * .08, tp0 = [WC[0] - 60, 872], tp1 = [SX4 + 70, 872 + Math.sin(rock) * -260];
    paint(taper([tp0, tp1], () => 22), { wash: WOOD, ink: PAL.ink, sw: .9 });
    const crank = [WC[0] + Math.cos(th) * 60, WC[1] + Math.sin(th) * 60];
    inkLine([crank, P2(tp0, tp1, .3)], 1.3, WOOD_DK, 'ink', 0);
    // spokes (ghosted when spinning fast)
    const blur = clamp((om - 5) / 8);
    for (let g = blur > .05 ? 2 : 0; g >= 0; g--) for (let i = 0; i < 10; i++) {
      const a = th - g * .07 + i / 10 * TAU, ca = Math.cos(a), sa = Math.sin(a), nx = -sa * 8, ny = ca * 8;
      paint([[WC[0] + nx, WC[1] + ny], [WC[0] + ca * WR + nx, WC[1] + sa * WR + ny], [WC[0] + ca * WR - nx, WC[1] + sa * WR - ny], [WC[0] - nx, WC[1] - ny]], { wash: dk, washOp: g ? 70 : 255, ink: g ? null : PAL.ink, sw: .6 });
    }
    // rim: wooden segments with a ring outline; notches rotate with the wheel
    for (let i = 0; i < 24; i++) {
      const a0 = i / 24 * TAU, a1 = (i + 1.05) / 24 * TAU, ro = WR + 18, ri = WR - 14;
      paint([[WC[0] + Math.cos(a0) * ri, WC[1] + Math.sin(a0) * ri], [WC[0] + Math.cos(a0) * ro, WC[1] + Math.sin(a0) * ro], [WC[0] + Math.cos(a1) * ro, WC[1] + Math.sin(a1) * ro], [WC[0] + Math.cos(a1) * ri, WC[1] + Math.sin(a1) * ri]], { wash: i % 2 ? wood : mixCol(wood, dk, .25), ink: null });
    }
    paint(ellPts(WC[0], WC[1], WR + 18, WR + 18, 40), { ink: PAL.ink, sw: 1.2 });
    paint(ellPts(WC[0], WC[1], WR - 14, WR - 14, 40), { ink: PAL.ink, sw: .8 });
    for (let i = 0; i < 6; i++) { const a = th + i / 6 * TAU; paint(ellPts(WC[0] + Math.cos(a) * (WR + 2), WC[1] + Math.sin(a) * (WR + 2), 9, 9, 8), { wash: PAL.cream, ink: null }); }
    // gold vinyl record morph
    if (gk > .01) {
      paint(ellPts(WC[0], WC[1], WR + 18, WR + 18, 40), { wash: GOLD, washOp: 255 * gk, ink: null });
      for (const r of [.92, .8, .68, .56, .45]) paint(ellPts(WC[0], WC[1], WR * r, WR * r, 36), { ink: GOLD_DK, sw: .6 * gk, br: 'inkfine' });
      for (const s of [0, Math.PI]) { const a = th * .5 + s; paint([[WC[0], WC[1]], [WC[0] + Math.cos(a) * WR, WC[1] + Math.sin(a) * WR], [WC[0] + Math.cos(a + .35) * WR, WC[1] + Math.sin(a + .35) * WR]], { wash: '#FFF6D0', washOp: 150 * gk, ink: null }); }
      paint(ellPts(WC[0], WC[1], WR * .3, WR * .3, 24), { wash: PAL.magenta, washOp: 255 * gk, ink: PAL.ink, sw: .9 });
    }
    paint(ellPts(WC[0], WC[1], 34, 34, 14), { wash: gk > .5 ? PAL.cream : dk, ink: PAL.ink, sw: 1 });
    if (blur > .05) for (let i = 0; i < 3; i++) { const a = th + i * 2.1, S = []; for (let k = 0; k <= 8; k++) S.push([WC[0] + Math.cos(a - k * .12) * (WR + 40), WC[1] + Math.sin(a - k * .12) * (WR + 40)]); inkLine(S, 1.2 * blur, PAL.cream, 'ink', .6); }
    return th;
  }
  // a coin / gold record flying or falling
  function coin(x, y, r, flipA, rec) {
    const w = Math.max(.12, Math.abs(Math.cos(flipA)));
    paint(ellPts(x, y, r * w, r, 16), { wash: GOLD, ink: PAL.ink, sw: .7 });
    if (rec) { paint(ellPts(x, y, r * .6 * w, r * .6, 12), { ink: GOLD_DK, sw: .5 }); paint(ellPts(x, y, r * .28 * w, r * .28, 10), { wash: PAL.magenta, ink: null }); }
    else paint(ellPts(x - r * .2 * w, y - r * .25, r * .25 * w, r * .18, 8), { wash: '#FFF6D0', ink: null });
  }

  function goldShot(t, lt) {
    const bp = bpOf(t), whipIn = 1 - easeOut(seg(lt, 0, .34)), pa = t - POPT, spinK = easeIn(seg(t, 30.3, 31.56));
    full('#86C7F0');
    // camera: whip in from the left, gentle push; from 30.3 it spins with the wheel
    const cx = lerp(950, 1360, ease(seg(t, 30.2, 31.2))) - whipIn * 1500, cy = lerp(520, 600, ease(seg(t, 30.2, 31.2))), z = (1.08 + .02 * lt) * (1 + .35 * ease(seg(t, 30.2, 31.2))) * (1 + .025 * pulse(t, 9));
    const [shx, shy] = shakeXY(t, 6 * pulse(t, 12) + (pa > 0 && pa < .3 ? 18 * (1 - pa / .3) : 0));
    camBegin(cx + shx, cy + shy, z, -.6 * spinK - whipIn * .06);
    sunburst(WC[0], WC[1], '#FFF3D6', '#B5DDF7', th4(t) * .06, 22, 2600, 110 + 50 * pulse(t, 5));
    { const hk = backOut(seg(t, 29.3, 29.8)), hr = 250 * hk + 40 * pulse(t, 5) * hk + (pa > 0 ? 120 * easeOut(seg(pa, 0, .4)) : 0);
      if (hk > .02) { const Hp = []; for (let i = 0; i < 32; i++) { const a = i / 32 * TAU + t * .5; Hp.push([TX4 + Math.cos(a) * hr * (1 + .08 * (i % 2)), TY4 - 5 * TU4 + Math.sin(a) * hr * (1 + .08 * (i % 2))]); }
        paint(Hp, { wash: '#FFE39A', ink: PAL.ink, sw: .8, curv: .4 }); paint(ellPts(TX4, TY4 - 5 * TU4, hr * .7, hr * .7, 20), { wash: '#FFF3C8', ink: null }); } }
    for (let i = 0; i < 14; i++) { const x = -300 + (i % 7) * 380 + (Math.floor(i / 7) % 2) * 190, y = 90 + Math.floor(i / 7) * 260; paint(ellPts(x, y, 26, 26, 12), { wash: PAL.cream, washOp: 150, ink: null }); }
    // floor
    paint(rectPts(-900, 850, 3800, 900), { wash: '#FFB7D3', ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 12; i++) paint(rectPts(-900 + i * 320, 850, 160, 900), { wash: '#FF9FC6', washOp: 180, ink: null });

    const th = wheel(t);

    // Suno pedals and feeds the ribbons
    const hd = sunoHand4(t);
    const sb = Math.abs(Math.sin(bp * Math.PI));
    suno(SX4, SY4, SU4, { dy: -sb * .3, sq: Math.exp(-frac(bp) * 7) * .08, walk: th / TAU, aR: .75 + .15 * Math.sin(t * 5), aL: .2 + .4 * Math.sin(bp * Math.PI),
      eyes: t > POPT ? 'spark' : 'happy', mouth: 'sing', sing: 1, blush: true, lookX: .5, hat: t > 28.2 ? 'headphones' : null });
    // the colourful thought ribbon from Suno's mittens onto the rim (flows while feeding)
    const feedK = seg(t, 28.05, 28.3) * (1 - seg(t, 30.2, 30.5));
    if (feedK > .01) {
      const Pr = []; for (let k = 0; k <= 14; k++) { const q = k / 14, b = P2(hd, FEED, q); Pr.push([b[0] + Math.sin(q * 9 - t * 14) * 12 * Math.sin(q * Math.PI), b[1] - Math.sin(q * Math.PI) * 40]); }
      const cols = [PAL.sky, PAL.bubble, PAL.mint];
      paint(taper(Pr, () => 44 * feedK), { wash: PAL.cream, washOp: 150, ink: null });
      cols.forEach((c, j) => paint(taper(Pr.map(p => [p[0], p[1] + (j - 1) * 12 * feedK]), () => 13 * feedK), { wash: [PAL.gBlue, PAL.magenta, '#F5B800'][j], ink: null }));
      // wrapped round the rim: coloured arc from the feed point over the top
      const A = []; for (let k = 0; k <= 16; k++) { const a = Math.PI - .35 + k / 16 * (Math.PI * .75); A.push([WC[0] + Math.cos(a) * (WR + 26), WC[1] + Math.sin(a) * (WR + 26)]); }
      paint(taper(A, q => 22 * feedK * (1 - q * .7)), { wash: PAL.magenta, ink: PAL.ink, sw: .5 });
    }

    // thought bubbles leave Tune's bundle, arc over the wheel into Suno's hands
    DEP4.forEach((d, j) => {
      const a = t - d; if (a < 0 || a > FL4) return;
      const q = ease(a / FL4), p = arcP([C4[0] + SLOTS[j][0] * 80, C4[1] + SLOTS[j][1] * 74], hd, 520, q);
      thought(p[0], p[1], 50 * (1 - seg(q, .85, 1) * .7), { seed: j, rot: a * 4, glow: .4 });
    });
    // gold thread from the rim to Tune
    const gth = seg(t, 28.75, 29.3), ringsOn = t > RING0, pop = pa > 0;
    let cocoon = 0; for (let i = 0; i < NR; i++) if (t > RING0 + i * .1) cocoon = i + 1;
    const head = ringsOn ? [TX4 + ringRx(Math.max(0, cocoon - 1)) * TU4 * .9, ringY(Math.max(0, cocoon - 1))] : [TX4 - 2 * TU4, TY4 - 10 * TU4];
    if (gth > 0 && !pop) {
      const G = []; for (let k = 0; k <= 20; k++) { const q = k / 20 * gth, c = [1220, 180]; G.push([(1 - q) * (1 - q) * EXIT[0] + 2 * (1 - q) * q * c[0] + q * q * head[0], (1 - q) * (1 - q) * EXIT[1] + 2 * (1 - q) * q * c[1] + q * q * head[1] + Math.sin(q * 12 - t * 16) * 5]); }
      paint(taper(G, () => 46), { wash: PAL.lemon, washOp: 110, ink: null });
      paint(taper(G, () => 18), { wash: GOLD, ink: PAL.ink, sw: .6 });
      inkLine(G, .5, '#FFF6D0', 'inkfine', .5);
      for (let i = 0; i < 4; i++) { const p = G[Math.floor(frac(t * 1.3 + i / 4) * (G.length - 1))]; paint(sparklePts(p[0], p[1], 16, .6, t * 3), { wash: PAL.cream, ink: null }); }
    }
    // rings: back halves under Tune
    const ringHalf = (i, front, grow) => {
      const y = ringY(i), rx = ringRx(i) * TU4 * grow, ry = rx * .28, S = [];
      for (let k = 0; k <= 12; k++) { const a = (front ? 0 : Math.PI) + k / 12 * Math.PI; S.push([TX4 + Math.cos(a) * rx, y + Math.sin(a) * ry]); }
      paint(taper(S, () => 14), { wash: front ? GOLD : GOLD_DK, ink: PAL.ink, sw: .5 });
    };
    if (ringsOn && !pop) for (let i = 0; i < cocoon; i++) ringHalf(i, false, backOut(seg(t - RING0 - i * .1, 0, .15)));
    // spool pedestal + Tune
    paint(rrPts(TX4 - 110, TY4, 220, 90, 14), { wash: PAL.bubble, ink: PAL.ink, sw: 1 });
    paint(rectPts(TX4 - 80, TY4 + 12, 160, 66), { wash: GOLD, ink: PAL.ink, sw: .7 });
    for (let k = 0; k < 4; k++) inkLine([[TX4 - 80, TY4 + 22 + k * 15], [TX4 + 80, TY4 + 24 + k * 15]], .5, GOLD_DK, 'inkfine', 0);
    const left = 5 - DEP4.filter(d => t > d).length;
    SLOTS.forEach((sl, i) => { if (i >= 5 - left) thought(C4[0] + sl[0] * 80, C4[1] + sl[1] * 74, 46, { seed: i, glow: .5 }); });
    const gk = pop ? 1 : ease(seg(t, 29.5, 30.85)) * .85;
    const md = mood(t, [[27.3, 'happy'], [28.3, 'look'], [29.25, 'wide', '!'], [POPT, 'spark', 'heart']]);
    const posed = pop ? backOut(seg(pa, 0, .3)) : 0;
    tune(TX4, TY4, TU4, {
      ...md, gold: gk, glow: pop ? 1 : gk * .6, lookX: t < 29.2 ? -.8 : 0, lookY: t < 29.2 ? -.4 : 0,
      aL: ringsOn && !pop ? -1.0 : lerp(left ? .05 : .4, 1.5, posed), aR: ringsOn && !pop ? -1.0 : lerp(.5, 1.6, posed),
      dy: -posed * 1.2 + (pop ? -Math.abs(Math.sin(bp * Math.PI)) * .8 : 0), sq: pop ? Math.exp(-pa * 10) * -.25 + Math.exp(-frac(bp) * 7) * .08 : 0,
      rot: pop ? Math.sin(bp * Math.PI) * .08 : 0, mouth: pop ? 'grin' : (ringsOn ? 'o' : 'sing'), blush: true, hat: pop ? 'crown' : null
    });
    if (ringsOn && !pop) for (let i = 0; i < cocoon; i++) ringHalf(i, true, backOut(seg(t - RING0 - i * .1, 0, .15)));
    // POP into gold: rings fly off, burst, flash, records and coins
    if (pop) {
      for (let i = 0; i < NR && pa < .3; i++) { const y = ringY(i), rx = ringRx(i) * TU4 * (1 + pa * 6), S = []; for (let k = 0; k <= 16; k++) { const a = k / 16 * TAU; S.push([TX4 + Math.cos(a) * rx, y + Math.sin(a) * rx * .28 - pa * 200]); } inkLine(S, 1.4 * (1 - pa / .3), GOLD, 'ink', .5); }
      sparkleBurst(TX4, TY4 - 5 * TU4, 420, pa, { n: 16, life: .9, cols: [GOLD, PAL.cream, PAL.lemon, PAL.coral] });
      sfx('DING!', TX4 + 40, TY4 - 14 * TU4, 130, PAL.lemon, pa, { life: .9, rot: .08 });
      for (let i = 0; i < 6; i++) {
        const a = pa - i * .05; if (a < 0) continue;
        const ang = -Math.PI / 2 + (i - 2.5) * .5, d = a * 1100;
        coin(WC[0] + Math.cos(ang) * d, WC[1] + Math.sin(ang) * d + a * a * 900, 64, a * 9 + i, true);
      }
    }
    if (t > 30.55) for (let i = 0; i < 28; i++) {
      const a = t - 30.55 - hash(i + 40) * .3; if (a < 0) continue;
      coin(-200 + hash(i * 1.9) * 2400, -300 + a * (650 + hash(i + 2) * 400) - hash(i + 5) * 200, 22 + 10 * hash(i + 8), a * 9 + i, false);
    }
    if (pop) confetti(t, -200, 2200, -200, { n: 26, speed: 380, seed: 9, cols: [GOLD, PAL.lemon, PAL.cream, PAL.coral, PAL.magenta] });
    camEnd();
    flash(pop && pa < .2 ? .55 * (1 - pa / .2) : 0, '#FFF3C0');
    streaks(whipIn, 11);
  }

  chapter('studio', 16.3, 31.56, [[16.3, copyPaste], [20.12, synth], [24.46, quillShot], [27.34, goldShot]]);
})();
