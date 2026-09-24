// c4_binary.js: "It doesn't matter I suppose" → "You didn't even strike a single chord" (47.78–62.2).
// Shots: sunset float (foam clears, shrugs, a tiny rain cloud that rains a microphone) → neon synthwave stage (Tune
// sings streams of glowing 1s and 0s) → casino: hammock jackpot 0 0 0 powered by the crank crew → dusty spotlit
// guitar: one plink, BOING, the spider moves out, tumbleweed, spotlight off.
(() => {
  const B = n => OFF + n * BEAT;
  const GOLD = '#F7C948';
  const colAt = (cols, k) => { k = clamp(k) * (cols.length - 1); const i = Math.min(cols.length - 2, Math.floor(k)); return mixCol(cols[i], cols[i + 1], k - i); };
  function vgrad(x0, y0, x1, y1, cols, n = 10) {
    for (let i = 0; i < n; i++) {
      const a = lerp(y0, y1, i / n), b = lerp(y0, y1, (i + 1) / n);
      paint([[x0, a - 3], [x1, a - 3], [x1, b + 3], [x0, b + 3]], { wash: colAt(cols, (i + .5) / n), washOp: 255, ink: null });
    }
  }
  const rot2 = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  // a quick "hit" envelope: pops up with overshoot at t0, holds, eases back down
  const bump = (t, t0, up = .16, hold = .45, down = .3) => backOut(seg(t, t0, t0 + up)) * (1 - ease(seg(t, t0 + up + hold, t0 + up + hold + down)));
  const clamp1 = x => clamp(x, -1, 1);

  // ---------- shared props ----------
  // Handheld microphone: grille head centred at (x, y), handle along local +y. s = head radius.
  function mic(x, y, s, rot, glow = 0) {
    push(); translate(x, y); rotate(rot);
    if (glow > .02) paint(ellPts(0, 0, s * 2.6, s * 2.6, 18), { fill: PAL.cyan, fillOp: 90 * glow, bleed: .3, tex: .3, ink: null });
    paint([[-s * .42, s * .7], [s * .42, s * .7], [s * .26, s * 3.5], [-s * .26, s * 3.5]], { wash: PAL.suno, ink: PAL.ink, sw: .9 });
    paint(rrPts(-s * .56, s * .6, s * 1.12, s * .42, s * .15), { wash: PAL.magenta, ink: PAL.ink, sw: .7 });
    paint(ellPts(0, 0, s, s, 16), { wash: '#CFC8E0', ink: PAL.ink, sw: .9 });
    for (const k of [-.45, 0, .45]) { inkLine([[-s * .85 * Math.cos(k * 1.2), k * s], [s * .85 * Math.cos(k * 1.2), k * s]], .5, '#7E7896', 'inkfine', 0); inkLine([[k * s, -s * .85 * Math.cos(k * 1.2)], [k * s, s * .85 * Math.cos(k * 1.2)]], .5, '#7E7896', 'inkfine', 0); }
    paint(ellPts(-s * .35, -s * .4, s * .24, s * .16, 8), { wash: '#FFFFFF', washOp: 210, ink: null });
    pop();
  }
  // Tune with its own stem + flag, so the flag can droop (droop 0..1). Same transform as tune() (no flip/spin).
  function tuneDroop(x, y, u, o, droop) {
    const gk = clamp(o.gold || 0), G = c => mixCol(c, GOLD, gk * .85), sq = (o.sq || 0) + (o.take || 0), sw = clamp(u / 13, .45, 2.4);
    push(); translate(x, y + (o.dy || 0) * u); if (o.rot) rotate(o.rot); scale((o.sx ?? 1) * (1 + sq * .6), 1 - sq);
    const cy = -3.3 * u, sx0 = 2.55 * u, stemTop = -12 * u + droop * 1.2 * u;
    paint(rrPts(sx0 - .38 * u, stemTop, .76 * u, -stemTop + cy, .38 * u), { wash: G(PAL.suno), ink: PAL.ink, sw: sw * .6 });
    const wv = (1 - droop) * Math.sin(T * 6.5), F = [], ang = droop * .8;
    const put = (px, py) => { const [rx, ry] = rot2(px - sx0, py - stemTop, ang); F.push([sx0 + rx, stemTop + ry]); };
    for (let i = 0; i <= 8; i++) { const k = i / 8; put(sx0 + k * 3.2 * u * (1 - droop * .15) + Math.sin(k * 3) * .4 * u, stemTop + k * 4.4 * u + Math.sin(k * Math.PI) * wv * 1.1 * u - k * k * 1.2 * u * (1 - droop)); }
    for (let i = 8; i >= 0; i--) { const k = i / 8; put(sx0 + k * 3.2 * u * .8 * (1 - droop * .15) + .3 * u, stemTop + 1.6 * u + k * 3.6 * u + Math.sin(k * Math.PI) * wv * .9 * u - k * k * 1.2 * u * (1 - droop)); }
    paint(F, { wash: G(PAL.lemon), fill: G(PAL.coral), fillOp: 80, bleed: .1, tex: .6, ink: PAL.ink, sw: sw * .7, curv: .4 });
    pop();
    tune(x, y, u, { ...o, noStem: true });
  }
  // foam blob cluster, used for splash-in and dust-out transitions
  function blobs(k, cols, seed, n = 18, rMax = 330) {
    for (let i = 0; i < n; i++) {
      const gx = (i % 6) / 5, gy = Math.floor(i / 6) / 2, bx = lerp(-60, W + 60, gx) + (hash(seed + i) - .5) * 160, by = lerp(40, H - 40, gy) + (hash(seed + i * 2) - .5) * 160;
      const dx = bx - W / 2, dy = by - H / 2, d = Math.hypot(dx, dy) || 1, r = rMax * (.75 + .4 * hash(seed + i * 3)) * (1 - k);
      if (r < 8) continue;
      const px = bx + dx / d * k * 380, py = by + dy / d * k * 300;
      paint(ellPts(px, py, r, r * .92, 18, r * .04), { wash: cols[0], washOp: 255, fill: cols[1], fillOp: 90, bleed: .1, tex: .5, border: .6, ink: cols[2] || null, sw: .8 });
    }
  }

  // soft dust puffs (k = 0 dense → 1 cleared)
  function dust(k, seed, n = 16) {
    for (let i = 0; i < n; i++) {
      const bx = hash(seed + i) * W, by = 150 + hash(seed + i * 2) * 800, r = (240 + hash(seed + i * 3) * 220) * (1 - k * .5), op = 190 * (1 - k);
      if (op < 4) continue;
      paint(ellPts(bx + (bx - W / 2) * k * .6, by - k * 120, r, r * .7, 18), { fill: i % 2 ? '#D8BE96' : '#B89A70', fillOp: op, bleed: .3, tex: .5, border: .3, ink: null });
    }
  }

  // ======================================================================================================
  // SHOT 1 · 47.78–51.46 · "It doesn't matter I suppose": calm sunset sea, floating on Suno
  // ======================================================================================================
  const SEA_Y = 560;
  const SKY1 = ['#5B3F9E', '#9B4FB0', '#E354A6', '#FF8466', '#FFB27A', '#FFDB8E'];
  const SEA1 = ['#FFB889', '#F0848C', '#C0609E', '#7E4FA8', '#4E3C92'];
  function gull(x, y, s, f) {
    inkLine([[x - s, y - f * s * .5], [x - s * .5, y - s * .32], [x, y], [x + s * .5, y - s * .32], [x + s, y - f * s * .5]], 1.3, PAL.ink, 'ink', .5);
  }
  function cloudPts(cx, cy, w, h, n = 34) {
    const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, bump = 1 + .2 * Math.abs(Math.sin(a * 3.5 + .4)), sy = Math.sin(a) > 0 ? .55 : 1; p.push([cx + Math.cos(a) * w * bump, cy + Math.sin(a) * h * bump * sy]); } return p;
  }
  function sunsetBG(t) {
    vgrad(-300, -300, W + 300, SEA_Y + 4, SKY1, 16);
    // sun glow + sun
    paint(ellPts(1350, SEA_Y - 20, 480, 300, 28), { fill: '#FFE08A', fillOp: 120, bleed: .3, tex: .3, ink: null });
    paint(clipHalf(ellPts(1350, SEA_Y + 10, 175, 175, 36), (x, y) => -y, -(SEA_Y + 2)), { wash: '#FFE58A', fill: '#FFAE5A', fillOp: 90, bleed: .05, tex: .5, ink: PAL.ink, sw: 1 });
    // streaky clouds
    for (const [cx, cy, w, h, c] of [[420, 170, 260, 26, '#FFB8D2'], [760, 250, 200, 18, '#FFC9A8'], [1560, 150, 300, 28, '#F7A0C8'], [1180, 330, 240, 16, '#FFD0A0'], [1750, 380, 180, 14, '#FFC0B0']]) {
      const x = cx + ((t * 9) % 400) - 200;
      paint(ellPts(x, cy, w, h, 20), { wash: c, washOp: 190, ink: null });
      paint(ellPts(x + w * .25, cy - h * .6, w * .45, h * .8, 16), { wash: c, washOp: 210, ink: null });
    }
    // tiny palm island on the horizon
    paint(clipHalf(ellPts(250, SEA_Y + 4, 170, 36, 20), (x, y) => -y, -(SEA_Y + 3)), { wash: '#6A3F84', ink: null });
    inkLine([[262, SEA_Y - 20], [252, SEA_Y - 80], [236, SEA_Y - 140]], 5, '#5A3474', 'fat', .6);
    for (let i = 0; i < 5; i++) { const a = -2.9 + i * .62 + Math.sin(t * 1.7 + i) * .06, L = 70; paint([[236, SEA_Y - 140], [236 + Math.cos(a - .18) * L * .55, SEA_Y - 140 + Math.sin(a - .18) * L * .55 - 6], [236 + Math.cos(a) * L, SEA_Y - 140 + Math.sin(a) * L + 16], [236 + Math.cos(a + .2) * L * .5, SEA_Y - 140 + Math.sin(a + .2) * L * .5 + 6]], { wash: '#5A3474', ink: null, curv: .4 }); }
    // sea
    vgrad(-300, SEA_Y, W + 300, 1250, SEA1, 10);
    inkLine([[-100, SEA_Y + 1], [W + 100, SEA_Y + 1]], .9, '#7E4FA8', 'inkfine', 0);
    // sun path on the water
    for (let j = 0; j < 11; j++) {
      const y = SEA_Y + 12 + j * j * 4.2 + j * 10, w = (260 - j * 18) * (.75 + .25 * Math.sin(t * 2.6 + j * 1.7));
      paint(rrPts(1350 - w / 2 + Math.sin(t * 1.5 + j) * 14, y, w, 7 + j * .8, 4), { wash: j < 4 ? '#FFF0B0' : '#FFD98A', washOp: 220 - j * 12, ink: null });
    }
    // glints
    for (let i = 0; i < 26; i++) {
      const x = ((hash(i) * 2300 + t * (18 + hash(i + 9) * 20)) % 2300) - 190, y = SEA_Y + 30 + hash(i * 3.3) * 480, s = 16 + hash(i + 4) * 22;
      inkLine([[x - s, y], [x - s * .4, y - s * .28], [x + s * .2, y]], .8, '#FFE3D0', 'inkfine', .5);
    }
  }

  function sunset(t, lt, dur) {
    const bp = bpOf(t), u = 40, gu = 27, tu = 19;
    const OX = 880 + wob(t, .21) * 16, OY = 704 - Math.abs(Math.sin(bp * Math.PI)) * 8, tilt = Math.sin(bp * Math.PI * .5) * .035;
    // story beats
    const shT = [48.3, 50.24], shG = [49.0, 50.24], shS = [50.24];
    const sT = Math.max(...shT.map(a => bump(t, a, .16, .45, .3))), sG = Math.max(...shG.map(a => bump(t, a, .16, .45, .3))), sS = Math.max(...shS.map(a => bump(t, a, .16, .45, .3)));
    const CATCH = 50.98, MDROP = 50.72, drip = seg(t, 50.0, 50.1) * (1 - seg(t, 50.9, 51.1));
    const CX = kf(t, [[49.05, 2250], [49.85, OX + 30]], easeOut) + (t > 50.5 && t < 50.75 ? Math.sin(t * 90) * 6 : 0), CY = 262 + wob(t, .6) * 8;
    // Tune pose (after the catch it hops up, holding the mic high)
    const up = t >= CATCH ? backOut(seg(t, CATCH, CATCH + .22)) : 0;
    const TX = OX + 104, TY = OY - 168;
    const tDy = -sT * .35 - up * 1.1 - (t > CATCH ? Math.abs(Math.sin((t - CATCH) * 9)) * .4 * (1 - seg(t, CATCH + .3, CATCH + .5)) : 0);
    const headW = [TX, TY + tDy * tu - 4 * tu];
    // camera: settles in from the wave, drifts, then punches into Tune on the mic grab
    const pk = easeIn(seg(t, 51.12, 51.46));
    const z = lerp(1.4, 1.2, easeOut(seg(t, 47.78, 48.7))) + .06 * ease(seg(t, 48.7, 50.9));
    const cx = lerp(905 + (OX - 880) * .3, headW[0], pk), cy = lerp(560 - 10 * wob(t, .3), headW[1], pk);
    camBegin(cx, cy, z * (1 + pk * 1.7), Math.sin(t * .7) * .012 * (1 - pk));
    sunsetBG(t);
    // gulls
    for (let i = 0; i < 3; i++) { const k = seg(t, 47.9 + i * .9, 47.9 + i * .9 + 3.6); if (k <= 0 || k >= 1) continue; gull(lerp(-180, 2150, k), 250 + i * 60 + Math.sin(k * 9 + i) * 20, 26 - i * 5, Math.sin(t * 9 + i * 2)); }
    // ripples around the float
    for (let k = 0; k < 2; k++) {
      const ph = frac(bp * .5 + k * .5), r = 250 + ph * 260;
      paint(ellPts(OX, OY + 128, r, r * .17, 30), { ink: '#FFE8D8', sw: .8 * (1 - ph), br: 'inkfine' });
    }
    // GEMI lounging behind the float (left), bottom tip tucked behind the orb
    const GX = OX - 96, GY = OY - 104, gRot = -.24 - sG * .08 + tilt, gA = lerp(.4, 1.9, sG);
    gemi(GX, GY, gu, { noLegs: true, noShadow: true, rot: gRot, eyes: 'shades', mouth: sG > .3 ? 'wobble' : (t > CATCH ? 'O' : 'smile'), aL: gA, aR: gA, dy: -sG * .3, sq: -sG * .05, blush: true, lookX: 1 });
    // SUNO, floating on its back like a pool float
    const sArm = lerp(-.35, 1.1, sS);
    suno(OX + Math.sin(tilt) * 256, OY + 256 * Math.cos(tilt), u, { rot: tilt - .12, noLegs: true, noShadow: true, eyes: 'shades', mouth: sS > .3 ? 'wobble' : 'smile', aL: sArm, aR: sArm, blush: true, waveLive: .1 });
    // TUNE (right). Shrugs, gets rained on, then catches the mic and pops up.
    const tA = lerp(-.2, .75, sT);
    const tOpt = { gold: 1, rot: .16 - sT * .1 + tilt - up * .16, dy: tDy, sq: -sT * .06 - up * .06 + drip * .05, blush: true,
      eyes: t < CATCH ? 'shades' : 'spark', mouth: t >= CATCH ? 'grin' : sT > .3 ? 'wobble' : drip > .5 ? 'flat' : 'smile',
      aL: tA, aR: t >= CATCH - .05 ? 1.25 : tA, noShadow: true,
      armR: t >= CATCH ? (uu => mic(1.7 * uu, 0, .62 * uu, Math.PI / 2, seg(t, CATCH, CATCH + .2) * (1 - seg(t, CATCH + .3, CATCH + .6)))) : null };
    tune(TX, TY, tu, tOpt);
    // water in front of the float (the orb sits half-sunk)
    const WL = OY + 122, wcol = colAt(SEA1, (WL + 60 - SEA_Y) / 690);
    { const patch = clipHalf(ellPts(OX, OY + 175, 340, 118, 32), (x, y) => y, WL);
      for (let i = 0; i < 10; i++) { const a = lerp(SEA_Y, 1250, i / 10), b = lerp(SEA_Y, 1250, (i + 1) / 10); if (b < WL || a > OY + 300) continue;
        paint(clipHalf(clipHalf(patch, (x, y) => y, a - 3), (x, y) => -y, -(b + 3)), { wash: colAt(SEA1, (i + .5) / 10), washOp: 222, ink: null }); } }
    const wl = []; for (let i = 0; i <= 14; i++) { const x = OX - 280 + i * 40; wl.push([x, WL + 2 + Math.sin(i * 1.3 + t * 5) * 4]); }
    inkLine(wl, 1.1, '#FFE8D8', 'ink', .5);
    // Suno's sneakers poking out, kicking
    for (const [i, dx] of [[0, 230], [1, 300]]) {
      const k = Math.sin(t * 5 + i * 2.2) * .25;
      paint(ellPts(OX + dx, WL - 6 - Math.max(0, Math.sin(t * 5 + i * 2.2)) * 12, 34, 18, 14, 0, -.5 + k), { wash: PAL.cream, fill: PAL.gPink, fillOp: 60, ink: PAL.ink, sw: 1 });
    }
    // the tiny rain cloud
    if (t > 49.05) {
      paint(cloudPts(CX, CY, 150, 62), { wash: '#9C92C6', fill: '#6E6498', fillOp: 90, bleed: .08, tex: .6, border: .5, ink: PAL.ink, sw: 1.1 });
      const sad = t > 50.5 ? 'x' : 'closed';
      for (const s of [-1, 1]) toonEye(CX + s * 34, CY - 4, 12, 13, t > 50.5 && t < 50.8 ? 'wide' : 'closed', {}, 1, s, false);
      toonMouth(CX, CY + 26, 12, t > 50.5 && t < 50.8 ? 'o' : 'frown', 1, false);
      // rain
      if (t > 49.95) for (let i = 0; i < 16; i++) {
        const ph = hash(i * 1.7), c = Math.floor((t - 49.95) / .4 - ph); if (c < 0) continue;
        const launch = 49.95 + (c + ph) * .4; if (launch > 50.85) continue;
        const k = frac((t - 49.95) / .4 - ph), x = CX + (hash(i * 3.1) - .5) * 230, y = CY + 40 + k * 300;
        paint([[x, y - 16], [x + 6, y], [x, y + 7], [x - 6, y]], { wash: PAL.sky, fill: '#FFFFFF', fillOp: 50, ink: PAL.ink, sw: .6, curv: .5 });
      }
    }
    // the cloud rains... a microphone
    if (t >= MDROP && t < CATCH) {
      const k = seg(t, MDROP, CATCH), hx = TX + 3.66 * tu, hy = TY + tDy * tu - 4.66 * tu - 30;
      mic(lerp(CX, hx, k), lerp(CY + 50, hy, easeIn(k)), .8 * tu, k * 7, .6);
    }
    // Tune's shades fly off on the catch
    if (t >= CATCH && t < CATCH + .8) {
      const a = t - CATCH;
      push(); translate(TX - 60 * a * 3, TY - 3.6 * tu - 520 * a + 900 * a * a); rotate(-a * 9); shadesAt(0, 0, 2.3 * tu, 1.2); pop();
    }
    camEnd();
    // the wave's foam clearing off the lens
    const fk = seg(t, 47.78, 48.45);
    if (fk < 1) { flash((1 - fk * 2.5), '#E8FBFF'); blobs(easeOut(fk), ['#F4FDFF', PAL.cyan, PAL.cyan], 3, 18, 360); }
    // lens droplets sliding down
    for (let i = 0; i < 6; i++) {
      const a = t - 47.9 - hash(i + 20) * .3, fade = 1 - seg(a, 1.2, 1.8); if (a < 0 || fade <= 0) continue;
      const x = 120 + hash(i * 5.3) * 1680, y = 80 + hash(i * 2.1) * 600 + a * a * 140, r = 26 + hash(i) * 26;
      paint(ellPts(x, y, r, r * 1.1, 16), { wash: '#FFFFFF', washOp: 60 * fade, ink: '#CFF4FF', sw: .7, br: 'inkfine' });
      paint(ellPts(x - r * .35, y - r * .4, r * .22, r * .15, 8), { wash: '#FFFFFF', washOp: 200 * fade, ink: null });
    }
    // neon spark-out into the stage
    flash(seg(t, 51.3, 51.46) * .9, '#FF5FA0');
  }

  // ======================================================================================================
  // SHOT 2 · 51.46–54.78 · "I'm singing now in binary prose": neon synthwave stage
  // ======================================================================================================
  const HZ = 560;
  const RIB = [[-2.45, 1.9, PAL.cyan], [-1.62, -1.1, PAL.magenta], [-.72, -1.9, PAL.lemon]];
  const E0 = 51.7, E1 = 54.3, DT = .075, LIFE = 1.7, BIN = 53.02;
  function neonBG(t, bp, p) {
    vgrad(-500, -500, W + 500, HZ + 4, ['#150A33', '#2E1760', '#5B2A8E', '#A8358F', '#FF5FA0'], 12);
    for (let i = 0; i < 44; i++) {
      const x = hash(i) * 2600 - 340, y = hash(i + 50) * 560 - 160, tw = .5 + .5 * Math.sin(t * 4 + i * 1.7);
      if (y > HZ - 170) continue;
      paint(starPts(x, y, 5 + tw * 7, .3), { wash: i % 5 ? PAL.cream : PAL.cyan, washOp: 140 + 110 * tw, ink: null });
    }
    // striped sun
    const sx = 960, sy = HZ - 10, R = 300;
    paint(ellPts(sx, sy - 60, R * 1.6, R * 1.1, 28), { fill: '#FF6FB0', fillOp: 90 + 50 * p, bleed: .3, tex: .3, ink: null });
    const disc = ellPts(sx, sy, R, R, 48);
    for (let k = 0; k < 9; k++) {
      const y0 = sy - R + k * 36, gap = k < 3 ? 0 : 4 + (k - 3) * 3.2, y1 = y0 + 36 - gap;
      if (y0 > HZ) break;
      paint(clipHalf(clipHalf(disc, (x, y) => y, y0), (x, y) => -y, -Math.min(y1, HZ)), { wash: colAt(['#FFF08A', '#FFB84A', '#FF6F7A', '#E354A6'], k / 8), washOp: 255, ink: null });
    }
    // mountains
    for (const [x0, pk, s] of [[-300, [[-120, 170], [120, 90], [330, 210], [520, 120], [720, 60]], 1], [1200, [[1320, 120], [1520, 230], [1700, 110], [1900, 190], [2100, 80]], 1]]) {
      const pts = [[x0, HZ + 2], ...pk.map(([x, h]) => [x, HZ - h]), [pk[pk.length - 1][0] + 200, HZ + 2]];
      paint(pts, { wash: '#2A1450', fill: '#4A2078', fillOp: 90, tex: .5, ink: PAL.cyan, sw: 1.1, br: 'inkfine' });
    }
    // floor + scrolling grid
    vgrad(-500, HZ, W + 500, 1300, ['#3A1060', '#220A40', '#170830'], 6);
    paint(rectPts(-500, HZ - 6, W + 1000, 26), { fill: PAL.magenta, fillOp: 120, bleed: .3, tex: .3, ink: null });
    for (let i = -16; i <= 16; i++) inkLine([[960 + i * 22, HZ + 2], [960 + i * 330, 1300]], 1.1, i % 4 ? PAL.cyan : PAL.magenta, 'ink', 0);
    for (let j = 0; j < 12; j++) {
      const d = ((j - t * 3.2) % 12 + 12) % 12 + .7, y = HZ + 520 / d;
      if (y > 1300) continue;
      inkLine([[-500, y], [W + 500, y]], clamp(1.6 / d * 2, .5, 1.6), PAL.cyan, 'ink', 0);
    }
  }
  function beams(t, p, burst) {
    for (let i = 0; i < 4; i++) {
      const bx = [180, 620, 1300, 1740][i], a = Math.PI / 2 + Math.sin(t * 1.3 + i * 1.9) * .38, L = 1200, w = .09 + burst * .05;
      paint([[bx, -40], [bx + Math.cos(a - w) * L, -40 + Math.sin(a - w) * L], [bx + Math.cos(a + w) * L, -40 + Math.sin(a + w) * L]], { fill: i % 2 ? PAL.cyan : PAL.magenta, fillOp: 45 + 40 * p + 60 * burst, bleed: .2, tex: .3, ink: null });
    }
  }
  function amp(x, y, p) {
    paint(rrPts(x - 110, y - 330, 220, 330, 16), { wash: '#241238', fill: PAL.grape, fillOp: 70, tex: .5, ink: PAL.magenta, sw: 1.1 });
    for (const [cy, r] of [[y - 245, 62], [y - 95, 62]]) {
      paint(ellPts(x, cy, r, r, 20), { wash: '#15091F', ink: PAL.cyan, sw: .9 });
      paint(ellPts(x, cy, r * (.55 + .12 * p), r * (.55 + .12 * p), 16), { wash: '#3A1C5E', fill: PAL.magenta, fillOp: 60 + 100 * p, bleed: .15, ink: PAL.ink, sw: .8 });
      paint(ellPts(x, cy, r * .16, r * .16, 10), { wash: PAL.magenta, ink: null });
    }
  }
  function drums(x, y, t, bp) {
    const hitC = pulse2(t, 9) * (Math.floor(bp * 2) % 2), hitK = pulse(t, 8);
    // cymbal (right) + hi-hat (left)
    inkLine([[x + 170, y - 20], [x + 170, y - 190]], 1.6, '#C8C0D8', 'ink', 0);
    push(); translate(x + 170, y - 196); rotate(-.18 + hitC * .22 * Math.sin(t * 40));
    paint(ellPts(0, 0, 82, 13, 18), { wash: '#F2C94C', fill: GOLD, fillOp: 90, ink: PAL.ink, sw: .9 }); pop();
    inkLine([[x - 170, y - 20], [x - 170, y - 150]], 1.6, '#C8C0D8', 'ink', 0);
    paint(ellPts(x - 170, y - 156, 62, 10, 16), { wash: '#F2C94C', ink: PAL.ink, sw: .8 });
    // snare
    paint(rrPts(x - 150, y - 104, 104, 40, 10), { wash: PAL.cyan, fill: '#2A7FA8', fillOp: 70, ink: PAL.ink, sw: .9 });
    paint(ellPts(x - 98, y - 104, 52, 12, 16), { wash: PAL.cream, ink: PAL.ink, sw: .8 });
    // kick drum with a Gemini sparkle on its skin
    const r = 102 * (1 + hitK * .06);
    paint(ellPts(x, y - 40, r, r, 30), { wash: PAL.magenta, fill: PAL.grape, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.2 });
    paint(ellPts(x, y - 40, r * .82, r * .82, 28), { wash: '#FFE6F2', fill: PAL.bubble, fillOp: 60, ink: PAL.ink, sw: .8 });
    paint(sparklePts(x, y - 40, r * .55, .62, hitK * .3), { wash: PAL.gViolet, fill: PAL.gBlue, fillOp: 90, ink: PAL.ink, sw: .8 });
    paint(ellPts(x, y - 40, r * 1.15, r * 1.15, 24), { fill: PAL.magenta, fillOp: 80 * hitK, bleed: .3, ink: null });
  }
  function ribbonPt(M, r, s, t) {
    const [th, curl] = RIB[r], R = 860 * Math.pow(s, .8), ph = th + curl * s * s + .16 * Math.sin(s * 7 - t * 5 + r);
    return [M[0] + Math.cos(ph) * R, M[1] + Math.sin(ph) * R * .78];
  }

  function neon(t, lt, dur) {
    const bp = bpOf(t), p = pulse(t, 5), burstAge = t - BIN, burst = burstAge >= 0 ? Math.exp(-burstAge * 3) : 0;
    const TX = 960, TY = 928, tu = 26;
    const m = move('bounce', t), belt = bump(t, BIN, .12, .6, .4);
    const tDy = m.dy * .6 - belt * .5, tSq = m.sq - belt * .08, tRot = Math.sin(bp * Math.PI * .5) * .06 - belt * .1;
    const mouth = [TX + rot2(0, -2.25 * tu, tRot)[0], TY + tDy * tu + rot2(0, -2.25 * tu * (1 - tSq), tRot)[1]];
    // camera: pull out from the close-up on Tune, bob, punch on "binary"
    const open = easeOut(seg(t, 51.46, 52.05));
    const z = lerp(2.6, 1.32, open) * (1 + .05 * seg(t, 52, 54.3) + .07 * burst);
    const [sx, sy] = shakeXY(t, 16 * burst);
    camBegin(lerp(TX, 960, open) + sx, lerp(TY - 4 * tu, 640, open) + sy, z, Math.sin(bp * Math.PI * .5) * .018 * open);
    neonBG(t, bp, p);
    beams(t, p, burst);
    amp(150, 900, p); amp(1770, 900, p);
    // stage disc
    paint(ellPts(960, 890, 760, 118, 36), { wash: '#2A0F48', washOp: 230, fill: PAL.magenta, fillOp: 40, tex: .4, ink: PAL.cyan, sw: 1.4 });
    paint(ellPts(960, 890, 790, 132, 36), { fill: PAL.cyan, fillOp: 40 + 50 * p, bleed: .25, ink: null });
    // SUNO on drums (back left)
    const SX = 560, SY = 760, su = 22, hitL = pulse(t, 9), hitR = pulse2(t, 9) * (Math.floor(bp * 2) % 2);
    const stick = uu => paint(thickPath([[-.2 * uu, 0], [2.7 * uu, .55 * uu]], .32 * uu), { wash: '#F2D6A2', ink: PAL.ink, sw: .7 });
    suno(SX, SY + Math.abs(Math.sin(bp * Math.PI)) * -6, su, { sing: 1, mouth: 'grin', eyes: 'happy', blush: true, aL: .7 - hitL * 1.1, aR: .8 - hitR * 1.2, armL: stick, armR: stick, sq: hitL * .06, hat: 'headphones' });
    drums(SX, SY + 50, t, bp);
    // GEMI backup singer (back right), spinning every 4th beat
    const gm = move('spin', t);
    gemi(1340 + Math.sin(bp * Math.PI) * 20, 770, 24, { ...gm, mouth: 'sing', eyes: 'happy', blush: true, aL: .9 + .5 * Math.sin(bp * Math.PI), aR: 1.3, lean: Math.sin(bp * Math.PI) * .15 });
    notes(1420, 520, t, { col: PAL.cyan, n: 4, spread: 200 });
    // glow of the binary ribbons (under Tune)
    if (t > E0) for (let r = 0; r < 3; r++) {
      const s1 = Math.min(1, (t - E0) / LIFE), s0 = Math.max(0, (t - Math.min(t, E1)) / LIFE); if (s1 - s0 < .04 || t > E1 + .3) continue;
      const pts = []; for (let k = 0; k <= 16; k++) pts.push(ribbonPt(mouth, r, lerp(s0, s1, k / 16), t));
      paint(thickPath(pts, 70 + 30 * p), { fill: RIB[r][2], fillOp: 55 + 40 * burst, bleed: .25, tex: .3, ink: null });
    }
    // TUNE, gold, belting into the mic
    const micHook = uu => { mic(1.95 * uu, -2.05 * uu, .72 * uu, -1.45, .4 + .4 * p); };
    tune(TX, TY, tu, { gold: 1, dy: tDy, sq: tSq, rot: tRot, mouth: 'sing', eyes: t > BIN - .05 && t < BIN + .7 ? 'spark' : 'closed', blush: true,
      aL: .9 + .7 * p + belt * .5, aR: -.5, draw: micHook, glow: .4 + .5 * burst });
    // the binary streams: 1s and 0s pouring out of Tune's mouth, curling into ribbons
    const fall = seg(t, 54.28, 54.7);
    for (let r = 0; r < 3; r++) {
      const jMin = Math.max(0, Math.floor((t - LIFE - E0) / DT) - 1), jMax = Math.floor((Math.min(t, E1) - E0) / DT);
      for (let j = jMin; j <= jMax; j++) {
        const te = E0 + j * DT + r * DT / 3, s = (t - te) / LIFE; if (s < 0 || s > 1) continue;
        let [x, y] = ribbonPt(mouth, r, s, t);
        y += fall * fall * 900 * (1 + hash(j + r * 50));
        const ch = hash(j * 3.1 + r * 17) < .5 ? '0' : '1', sz = 30 + 58 * Math.pow(s, .7);
        letter(ch, x, y, sz, PAL.cream, { ink: false, stroke: RIB[r][2], alpha: (1 - seg(s, .8, 1)) * (1 - fall), rot: Math.sin(s * 9 + j) * .12, font: `800 ${sz}px "Shantell Sans"` });
      }
    }
    // "binary!": a radial burst of digits
    if (burstAge > 0 && burstAge < 1.1) {
      for (let i = 0; i < 22; i++) {
        const a = i / 22 * TAU + hash(i) * .2, d = 60 + easeOut(burstAge / 1.1) * (420 + hash(i * 3) * 260);
        letter(hash(i * 7.7) < .5 ? '0' : '1', mouth[0] + Math.cos(a) * d, mouth[1] - 40 + Math.sin(a) * d * .8, 44 + 30 * hash(i * 2), PAL.cream, { ink: false, stroke: [PAL.cyan, PAL.magenta, PAL.lemon][i % 3], alpha: 1 - seg(burstAge, .7, 1.1), rot: a * .2, font: `800 ${Math.round(44 + 30 * hash(i * 2))}px "Shantell Sans"` });
      }
      sparkleBurst(mouth[0], mouth[1] - 60, 320, burstAge, { n: 12, life: .8, cols: [PAL.cyan, PAL.magenta, PAL.lemon, PAL.cream] });
    }
    camEnd();
    flash(seg(t, 51.46, 51.62) < 1 ? (1 - seg(t, 51.46, 51.62)) * .7 : 0, '#FF5FA0');
    flash(fall * .88, '#1A0B2E');
    // three big 0s drop into place: they'll be the slot reels
    if (t > 54.3) for (let i = 0; i < 3; i++) {
      const k = seg(t, 54.32 + i * .06, 54.66 + i * .04), land = t - (54.66 + i * .04);
      const y = lerp(-220, 530, easeIn(k)) + (land > 0 ? -Math.sin(Math.min(1, land / .12) * Math.PI) * 30 : 0);
      letter('0', [751, 960, 1169][i], y, 228, '#D8394E', { screen: true, stroke: PAL.cream, rot: (1 - k) * (i - 1) * .6, font: '800 228px "Shantell Sans"' });
    }
  }

  // ======================================================================================================
  // SHOT 3 · 54.78–58.98 · "Zero effort maximum reward": the jackpot
  // ======================================================================================================
  const SPIN0 = 55.56, STOPS = [56.48, 56.8, 57.12], JACK = 57.12, RS = 150, RV = 15, REEL_Y = 475, REELS = [750, 860, 970];
  const FLOOR = 880, AX_Y = 650, RC = 72, BAR0 = -30, BAR1 = 620, CXG = 70, CXT = 250, CXS = 470;
  const RED = '#E0303F', RED_DK = '#9A1830';
  const theta = t => bpOf(Math.min(t, JACK)) * Math.PI;
  function casinoBG(t, jk, bp) {
    vgrad(-500, -500, 2500, FLOOR + 4, ['#2E0718', '#4A0C24', '#661230', '#7A1838'], 8);
    // glow + sunburst behind the machine (flares at the jackpot)
    paint(ellPts(860, 420, 700, 560, 28), { fill: '#FF7A4A', fillOp: 70 + 90 * jk, bleed: .3, tex: .3, ink: null });
    sunburst(860, 380, PAL.lemon, '#FF5A4A', t * .25 + jk * 2, 14, 1500, 60 + 110 * jk);
    // marquee arch of chasing bulbs
    const n = 22, chase = Math.floor(bp * 2), arc = [];
    for (let i = 0; i <= 30; i++) { const a = Math.PI + i / 30 * Math.PI; arc.push([860 + Math.cos(a) * 600, 700 + Math.sin(a) * 600]); }
    paint(thickPath(arc, 64), { wash: '#F2B84A', fill: '#C07A20', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1.2 });
    for (let i = 0; i < n; i++) {
      const a = Math.PI + (i + .5) / n * Math.PI, x = 860 + Math.cos(a) * 600, y = 700 + Math.sin(a) * 600, on = jk > .05 ? (Math.floor(t * 12) + i) % 2 === 0 : (i + chase) % 3 === 0;
      if (on) paint(ellPts(x, y, 34, 34, 12), { fill: '#FFF6C0', fillOp: 170, bleed: .3, ink: null });
      paint(ellPts(x, y, 15, 15, 10), { wash: on ? '#FFF6C0' : '#B0322E', ink: PAL.ink, sw: .6 });
    }
    // velvet drapes + scalloped valance
    for (const [x0, dir] of [[-500, 1], [2400, -1]]) {
      const pts = [[x0, -500], [x0 + dir * 560, -500], [x0 + dir * 470, 200], [x0 + dir * 340, 880], [x0, 880]];
      paint(pts, { wash: '#C81E3A', fill: '#7A0F24', fillOp: 110, tex: .6, border: .6, ink: PAL.ink, sw: 1.2, curv: .4 });
      for (let k = 1; k < 4; k++) inkLine([[x0 + dir * k * 130, -500], [x0 + dir * k * 110, 880]], .8, '#7A0F24', 'ink', .4);
    }
    const val = [[-500, -500], [2400, -500], [2400, -60]];
    for (let i = 14; i >= 0; i--) { const x = -500 + i * 2900 / 14; val.push([x, -60], [x - 2900 / 28, 10]); }
    paint(val, { wash: '#C81E3A', fill: '#7A0F24', fillOp: 90, tex: .5, ink: PAL.ink, sw: 1.1, curv: .5 });
    // floor
    vgrad(-500, FLOOR, 2500, 1400, ['#3A0A22', '#26061A'], 3);
    inkLine([[-500, FLOOR], [2500, FLOOR]], 1.2, PAL.ink, 'ink', 0);
    for (let i = 0; i < 22; i++) { const x = (i % 11) * 230 - 300 + (i > 10 ? 115 : 0), y = FLOOR + 50 + (i > 10 ? 90 : 0); paint(starPts(x, y, 26, .45, 4, 0), { wash: '#5A1236', ink: null }); }
  }
  // crank crew: a long bar that rises and falls with the crank, three sweating characters hanging on
  function crew(t, jk) {
    const th = theta(t), barY = AX_Y + RC * Math.sin(th), rel = Math.sin(th), done = seg(t, JACK + .1, JACK + .35);
    // support post + axle bearings
    paint(rrPts(BAR0 - 44, AX_Y - 26, 28, FLOOR - AX_Y + 26, 10), { wash: '#B08A3A', fill: '#7A5A20', fillOp: 70, ink: PAL.ink, sw: 1 });
    paint(ellPts(BAR0 - 30, AX_Y, 26, 26, 14), { wash: '#E8C060', ink: PAL.ink, sw: 1 });
    const barYd = done > 0 ? lerp(barY, AX_Y + RC, 0) : barY;
    for (const ex of [BAR0 - 30, BAR1 + 14]) paint(thickPath([[ex, AX_Y], [ex, barYd]], 26), { wash: '#C9A14A', ink: PAL.ink, sw: .9 });
    // the bar (behind the crew; hands grip over it)
    paint(thickPath([[BAR0 - 34, barYd], [BAR1 + 18, barYd]], 34), { wash: '#F2C94C', fill: '#B08A3A', fillOp: 50, ink: PAL.ink, sw: 1.2 });
    inkLine([[BAR0 - 20, barYd - 8], [BAR1, barYd - 8]], 1.2, '#FFF3C0', 'inkfine', 0);
    const h = FLOOR - barYd, wig = Math.sin(t * 22);
    // GEMI
    {
      const u = 26, sq = done > 0 ? .28 * done : Math.max(0, rel) * .14; let sa = (h / (1 - sq) - 6.6 * u) / (5 * u), dy = 0;
      if (sa > .69) { dy = -(h - (1 - sq) * (6.6 * u + 5 * u * .69)) / u; sa = .69; }
      const A = Math.asin(clamp1(sa)) / .38;
      if (done > 0) gemi(CXG, FLOOR, u, { sq, eyes: 'swirl', mouth: 'tongue', aL: -1, aR: -1, rot: -.25 * done, emote: 'sweat', emoteK: 1 });
      else gemi(CXG, FLOOR, u, { dy, sq, aL: A, aR: A, eyes: 'closed', mouth: 'wobble', emote: 'sweat', emoteK: .7 + .3 * wig, lean: .1 * wig, walk: dy < -.1 ? t * 3 : null });
    }
    // TUNE (smallest): dangles off the bar, feet kicking
    {
      const u = 17, a = 1.3, dy = -(h - (2.7 * u + 2.1 * u * Math.sin(a))) / u;
      tune(CXT, FLOOR, u, { gold: 1, dy: Math.min(0, dy), aL: a, aR: a, eyes: done > 0 ? 'swirl' : 'scared', mouth: done > 0 ? 'wobble' : 'O', walk: t * 4, emote: 'sweat', emoteK: 1, rot: Math.sin(t * 6) * .08 });
    }
    // SUNO
    {
      const u = 26, sq = done > 0 ? .3 * done : Math.max(0, rel) * .16; let sa = (h / (1 - sq) - 5.9 * u) / (3 * u), dy = 0;
      if (sa > .96) { dy = -(h - (1 - sq) * (5.9 * u + 3 * u * .96)) / u; sa = .96; }
      const A = Math.asin(clamp1(sa));
      if (done > 0) suno(CXS, FLOOR, u, { sq, eyes: 'swirl', mouth: 'tongue', aL: -1.2, aR: -1.2, rot: .2 * done, emote: 'sweat', emoteK: 1 });
      else suno(CXS, FLOOR, u, { dy, sq, aL: A, aR: A, eyes: 'closed', mouth: 'grin', emote: 'sweat', emoteK: .7 + .3 * wig, walk: dy < -.1 ? t * 3 : null, sing: .3 });
    }
    // flying sweat
    if (done < 1) for (let i = 0; i < 9; i++) {
      const ph = frac(t * 1.6 + hash(i)), x0 = [CXG, CXT, CXS][i % 3], y0 = barYd - 60, dir = hash(i * 3) < .5 ? -1 : 1;
      const x = x0 + dir * ph * 120, y = y0 - 80 * ph + 260 * ph * ph;
      paint([[x, y - 10], [x + 5, y + 2], [x, y + 7], [x - 5, y + 2]], { wash: PAL.sky, washOp: 255 * (1 - ph), ink: null, curv: .5 });
    }
  }
  function machine(t, jk, bp) {
    const p = pulse(t, 6);
    // axle stub into the machine side
    paint(thickPath([[BAR1 + 14, AX_Y], [640, AX_Y]], 26), { wash: '#C9A14A', ink: PAL.ink, sw: 1 });
    paint(rectPts(598, FLOOR - 52, 524, 60), { wash: '#3A1030', ink: PAL.ink, sw: 1.1 });
    paint(rrPts(620, 230, 480, 620, 44), { wash: RED, fill: RED_DK, fillOp: 90, bleed: .05, tex: .6, border: .5, ink: PAL.ink, sw: 1.5 });
    paint(ellPts(720, 300, 60, 140, 16, 0, .2), { fill: '#FF8A8A', fillOp: 70, bleed: .2, ink: null });
    // reel panel + windows
    paint(rrPts(670, 372, 380, 206, 22), { wash: PAL.suno, ink: PAL.ink, sw: 1.2 });
    for (const [i, cx] of REELS.entries()) {
      const stopped = t >= STOPS[i], fl = stopped && jk > .05 ? (Math.floor(t * 10) % 2 ? 1 : 0) : 0;
      paint(rrPts(cx - 48, REEL_Y - 85, 96, 170, 12), { wash: fl ? '#FFF2A0' : PAL.cream, fill: '#D8C8B0', fillOp: 60, ink: PAL.ink, sw: .9 });
    }
  }
  function reelPos(t, i) {
    if (t < SPIN0) return 0;
    const ts = STOPS[i], a = Math.min(t, ts) - SPIN0, run = RV * (a < .25 ? a * a / .5 : a - .125);
    if (t < ts) return run;
    const P = 2 * Math.round((run + .3) / 2);
    return P - .35 * (1 - elasticOut(seg(t, ts, ts + .5)));
  }
  function reelDigits(t) {
    for (const [i, cx] of REELS.entries()) {
      const pp = reelPos(t, i), k0 = Math.floor(pp), spinning = t > SPIN0 + .1 && t < STOPS[i];
      for (const k of [k0, k0 + 1]) {
        const y = REEL_Y + (pp - k) * RS;
        letter(((k % 2) + 2) % 2 ? '1' : '0', cx, y, 120, '#D8394E', { alpha: spinning ? .8 : 1, font: '800 120px "Shantell Sans"' });
      }
      if (spinning) for (let j = 0; j < 4; j++) inkLine([[cx - 30 + j * 20, REEL_Y - 70], [cx - 30 + j * 20, REEL_Y + 70]], .7, '#B8A89A', 'inkfine', 0);
    }
  }
  function machineFront(t, jk, bp) {
    const p = pulse(t, 6);
    // body strips over the reel spill (painted after the reel digits are flushed)
    paint(rectPts(636, 250, 448, 122), { wash: RED, ink: null });
    paint(rectPts(636, 578, 448, 126), { wash: RED, ink: null });
    paint(rectPts(670, 372, 380, 18), { wash: PAL.suno, ink: null });
    paint(rectPts(670, 560, 380, 18), { wash: PAL.suno, ink: null });
    for (const x of [796, 906]) paint(rectPts(x - 1, 380, 16, 190), { wash: PAL.suno, ink: null });
    paint(rectPts(670, 380, 32, 190), { wash: PAL.suno, ink: null }); paint(rectPts(1018, 380, 32, 190), { wash: PAL.suno, ink: null });
    paint(rrPts(670, 372, 380, 206, 22), { ink: PAL.ink, sw: 1.2 });
    for (const cx of REELS) { paint(rrPts(cx - 48, REEL_Y - 85, 96, 170, 12), { ink: PAL.ink, sw: .9 }); paint(rectPts(cx - 40, REEL_Y - 78, 20, 150), { wash: '#FFFFFF', washOp: 40, ink: null }); }
    inkLine([[690, REEL_Y], [1030, REEL_Y]], .9, jk > .05 ? PAL.lemon : '#E0485A', 'ink', 0);
    // buttons, payout tray
    for (const [i, c] of [PAL.cyan, PAL.magenta, PAL.lemon].entries()) paint(ellPts(760 + i * 100, 640, 30, 20, 14), { wash: c, ink: PAL.ink, sw: .9 });
    paint(rrPts(720, 720, 280, 90, 18), { wash: '#3A1030', ink: PAL.ink, sw: 1.1 });
    paint(rrPts(745, 740, 230, 50, 14), { wash: '#1E0818', ink: null });
    for (let i = 0; i < 7; i++) paint(ellPts(770 + i * 30, 782, 18, 9, 10), { wash: GOLD, ink: PAL.ink, sw: .5 });
    // dome + marquee + star light
    paint(clipHalf(ellPts(860, 250, 240, 125, 30), (x, y) => -y, -252), { wash: PAL.lemon, fill: PAL.ochre, fillOp: 90, tex: .5, ink: PAL.ink, sw: 1.3 });
    paint(rrPts(640, 236, 440, 60, 18), { wash: '#FFE070', ink: PAL.ink, sw: 1.1 });
    const chase = Math.floor(bpOf(t) * 2);
    for (let i = 0; i < 9; i++) paint(ellPts(668 + i * 48, 266, 11, 11, 10), { wash: (i + chase) % 2 || jk > .05 ? '#FF4A5A' : '#8A2030', ink: PAL.ink, sw: .5 });
    const sr = 44 * (1 + .15 * p + .4 * jk);
    paint(ellPts(860, 112, sr * 2.2, sr * 2.2, 18), { fill: PAL.lemon, fillOp: 90 + 120 * jk, bleed: .3, ink: null });
    paint(starPts(860, 112, sr, .45, 5, -Math.PI / 2 + jk * t * 6), { wash: '#FFF3A0', fill: PAL.lemon, fillOp: 90, ink: PAL.ink, sw: 1 });
  }
  function leverAng(t) {
    const down = easeIn(seg(t, 55.34, 55.52)), back = elasticOut(seg(t, 55.64, 56.2));
    return lerp(-1.28, .38, down * (1 - back));
  }
  // hammock + snoozing human (feet toward the lever), the toe-rope, and the zzz
  const HM0 = [1300, 596], HM1 = [1830, 588];
  const hamY = x => { const f = clamp((x - HM0[0]) / (HM1[0] - HM0[0])); return lerp(HM0[1], HM1[1], f) + 118 * Math.sin(Math.PI * f); };
  function hammockBack(sw) {
    for (const [px, top] of [[1282, 560], [1848, 548]]) paint(rrPts(px - 12, top, 24, FLOOR - top, 10), { wash: '#E8C060', fill: '#B08A3A', fillOp: 60, ink: PAL.ink, sw: 1 });
    inkLine([[1282, 566], [HM0[0], HM0[1]]], 1, PAL.ink, 'ink', 0); inkLine([[1848, 554], [HM1[0], HM1[1]]], 1, PAL.ink, 'ink', 0);
    const top = [], bot = []; for (let i = 0; i <= 16; i++) { const x = lerp(HM0[0], HM1[0], i / 16); top.push([x, hamY(x) - 40 * Math.sin(Math.PI * i / 16) + sw]); bot.push([x, hamY(x) + 30 * Math.sin(Math.PI * i / 16) + sw]); }
    paint([...top, ...bot.reverse()], { wash: '#F2B84A', fill: '#D8394E', fillOp: 40, tex: .5, ink: PAL.ink, sw: 1, curv: .3 });
  }
  function hammockFront(sw) {
    const pts = [], pts2 = []; for (let i = 0; i <= 16; i++) { const x = lerp(HM0[0] + 20, HM1[0] - 20, i / 16), s = Math.sin(Math.PI * i / 16); pts.push([x, hamY(x) - 24 * s + sw]); pts2.push([x, hamY(x) + 34 * s + sw]); }
    paint([...pts, ...pts2.reverse()], { wash: PAL.lemon, fill: '#F2A83A', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1, curv: .3 });
    for (const off of [-8, 10]) { const s = []; for (let i = 1; i < 16; i++) { const x = lerp(HM0[0] + 20, HM1[0] - 20, i / 16); s.push([x, hamY(x) + off * Math.sin(Math.PI * i / 16) + sw]); } paint(thickPath(s, 7), { wash: '#E0303F', ink: null }); }
  }
  const HU = { x: 1392, y: 650, s: 26, r: Math.PI / 2 - .06 };
  function toeOf(run) {
    const s = HU.s, a = Math.sin(run * TAU) * .55, lx = -.8 * s - .2 * s * Math.cos(a) - 2.4 * s * Math.sin(a), ly = -2.3 * s - .2 * s * Math.sin(a) + 2.4 * s * Math.cos(a);
    const [rx, ry] = rot2(lx, ly, HU.r); return [HU.x + rx, HU.y + ry];
  }
  function coinItem(x, y, s, kind, spin) {
    if (kind === 0) { paint(ellPts(x, y, s * Math.max(.2, Math.abs(Math.cos(spin))), s, 14), { wash: '#FFE070', ink: '#8A5A10', sw: .6 }); inkLine([[x - s * .2 * Math.cos(spin), y - s * .5], [x - s * .2 * Math.cos(spin), y + s * .5]], .6, '#FFF3A0', 'inkfine', 0); }
    else if (kind === 1) paint(heartPts(x, y, s * 1.1), { wash: PAL.magenta, ink: PAL.ink, sw: .7 });
    else if (kind === 2) { paint(ellPts(x, y, s * 1.2, s * 1.2, 16), { wash: '#2C2538', ink: PAL.ink, sw: .7 }); paint(ellPts(x, y, s * .45, s * .45, 10), { wash: GOLD, ink: null }); }
    else trophy(x, y, s * 1.1, spin * .2);
  }
  function trophy(x, y, s, rot) {
    push(); translate(x, y); rotate(rot);
    paint([[-s, -s], [s, -s], [s * .7, 0], [s * .2, s * .35], [-s * .2, s * .35], [-s * .7, 0]], { wash: GOLD, fill: PAL.ochre, fillOp: 70, ink: PAL.ink, sw: .8, curv: .3 });
    paint(rectPts(-s * .15, s * .3, s * .3, s * .5), { wash: PAL.ochre, ink: PAL.ink, sw: .6 });
    paint(rectPts(-s * .55, s * .78, s * 1.1, s * .3), { wash: '#B0762A', ink: PAL.ink, sw: .6 });
    for (const sd of [-1, 1]) inkLine([[sd * s * .95, -s * .8], [sd * s * 1.45, -s * .5], [sd * s * .8, -s * .1]], 1, PAL.ink, 'ink', .6);
    pop();
  }
  const PCX = 1480, PW = 560;
  const pileTop = (x, hgt) => { const f = clamp((x - (PCX - PW)) / (2 * PW)); return FLOOR + 10 - hgt * Math.pow(Math.sin(Math.PI * f), .75); };

  function jackpot(t, lt, dur) {
    const bp = bpOf(t), jk = t >= JACK ? Math.exp(-(t - JACK) * 1.2) * .7 + .3 : 0;
    const slide = easeIn(seg(t, 58.4, 58.9)) * 1700;
    // camera: reels close-up → wide (lever pull) → the crank crew → back to the reels → jackpot wide
    const keys = [[54.78, [860, 480, 1.9]], [55.22, [1080, 560, 1.12]], [55.72, [1080, 560, 1.12]], [56.08, [300, 640, 1.45]], [56.3, [300, 640, 1.45]], [56.46, [860, 480, 1.6]], [57.1, [860, 474, 1.8]], [57.3, [900, 520, 1.0]], [58.5, [960, 540, 1.02]], [58.98, [1100, 560, 1.08]]];
    let cam = kf(t, keys, ease);
    const [sx, sy] = shakeXY(t, (t > JACK ? 22 * Math.exp(-(t - JACK) * 3) : 0) + (t > 55.5 && t < 55.7 ? 6 : 0));
    camBegin(cam[0] + sx, cam[1] + sy, cam[2], 0);
    casinoBG(t, jk, bp);
    crew(t, jk);
    machine(t, jk, bp);
    reelDigits(t);
    flushLetters();
    machineFront(t, jk, bp);
    // lever
    const la = leverAng(t), LP = [1112, 600], ball = [LP[0] + Math.cos(la) * 250, LP[1] + Math.sin(la) * 250];
    paint(rrPts(1094, 560, 40, 80, 12), { wash: '#C9C0D8', ink: PAL.ink, sw: 1 });
    paint(thickPath([LP, ball], 16), { wash: '#DCD4E8', ink: PAL.ink, sw: 1 });
    paint(ellPts(ball[0], ball[1], 34, 34, 18), { wash: '#FF3A4A', fill: '#A01830', fillOp: 60, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(ball[0] - 10, ball[1] - 12, 9, 6, 8), { wash: '#FFFFFF', washOp: 200, ink: null });
    // hammock, human, rope (these slide off with the coin pile at the end)
    const swing = Math.sin(t * 2.2) * 5, kick = bump(t, 55.18, .2, .15, .35), run = .25 * kick;
    const buried = t > 58.05;
    push(); translate(slide, 0);
    hammockBack(swing);
    if (!buried) {
      human(HU.x, HU.y + swing, HU.s, { rot: HU.r, eyes: 'closed', mouth: t > JACK ? 'o' : 'smile', aL: 2.3, aR: -1.3, run, noShadow: true });
      const toe = toeOf(run); toe[1] += swing;
      const mid = [(ball[0] + toe[0]) / 2, (ball[1] + toe[1]) / 2 + 40 * (1 - kick)];
      inkLine([[ball[0] - slide, ball[1]], mid, toe], 1.1, '#F2D6A2', 'ink', .5);
    }
    hammockFront(swing);
    pop();
    // zzz
    if (t < JACK + .3) for (let i = 0; i < 3; i++) { const ph = frac(t * .7 + i / 3); letter('z', 1690 + ph * 60 + i * 8, 560 - ph * 170, 34 + ph * 30, PAL.cream, { alpha: Math.sin(ph * Math.PI), rot: -.2 }); }
    // the coin pile grows and buries the hammock, then slides away
    const hgt = 400 * easeOut(seg(t, JACK + .15, 58.3));
    if (hgt > 4) {
      push(); translate(slide, 0);
      const top = []; for (let i = 0; i <= 22; i++) { const x = PCX - PW + i * 2 * PW / 22; top.push([x, pileTop(x, hgt) + (i % 22 ? (hash(i * 3.7) - .5) * 14 : 0)]); }
      paint([...top, [PCX + PW + 30, FLOOR + 40], [PCX - PW - 30, FLOOR + 40]], { wash: GOLD, fill: PAL.ochre, fillOp: 100, bleed: .06, tex: .7, border: .5, ink: PAL.ink, sw: 1.2, curv: .3 });
      for (let i = 0; i < 46; i++) {
        const x = PCX - PW * .92 + hash(i * 1.3) * PW * 1.84, tp = pileTop(x, hgt), y = lerp(tp + 16, FLOOR, Math.pow(hash(i * 2.9), 1.5) * .9);
        if (y > FLOOR - 4 || tp > FLOOR - 20) continue;
        coinItem(x, y, 16 + hash(i) * 8, hash(i * 5.3) < .82 ? 0 : Math.floor(1 + hash(i * 7.1) * 3), hash(i * 4) * 3);
      }
      // the human's hand pokes out of the pile, holding a trophy
      if (buried) {
        const hx = 1560, hy = pileTop(1560, hgt) + 10, k = backOut(seg(t, 58.05, 58.3)), wv = Math.sin(t * 12) * .1;
        push(); translate(hx, hy); rotate(wv);
        paint(rrPts(-22, -120 * k, 44, 130 * k, 18), { wash: '#F29A38', fill: '#C46A1E', fillOp: 50, ink: PAL.ink, sw: 1 });
        paint(ellPts(0, -130 * k, 26, 24, 12), { wash: '#F2C4A0', ink: PAL.ink, sw: .9 });
        pop();
        trophy(hx + Math.sin(wv) * 130, hy - 190 * k, 40 * k, wv);
      }
      pop();
    }
    // the eruption: coins, hearts, gold records and trophies gush out
    if (t > JACK) for (let i = 0; i < 64; i++) {
      const tl = JACK + hash(i * 1.9) * 1.25, a = t - tl; if (a < 0 || a > 1.6) continue;
      const fromTop = i % 3 === 0, x0 = fromTop ? 860 : 860 + (hash(i) - .5) * 200, y0 = fromTop ? 110 : 760;
      const vx = (hash(i * 2.3) - .2) * 1100, vy = -(fromTop ? 500 : 900) - hash(i * 3.7) * 800, x = x0 + vx * a, y = y0 + vy * a + 1300 * a * a;
      if (y > FLOOR + 30) continue;
      const kind = hash(i * 5.1) < .7 ? 0 : Math.floor(1 + hash(i * 6.3) * 3);
      coinItem(x, y, kind === 3 ? 26 : 25, kind, t * 9 + i);
    }
    if (t > JACK && t < JACK + .5) sparkleBurst(860, 470, 420, t - JACK, { n: 14, life: .5, cols: [PAL.lemon, '#FFF3A0', PAL.cream, PAL.coral] });
    sfx('KA-CHING!', 900, 190, 150, PAL.lemon, t - JACK, { life: 1.4, stroke: '#D8394E', rot: -.1 });
    camEnd();
    flash(t > JACK ? (1 - seg(t, JACK, JACK + .18)) * .8 : 0, '#FFF6C0');
    // dust left behind by the sliding pile fills the frame (the next shot opens in the dust)
    const dk = seg(t, 58.6, 58.98);
    if (dk > 0) { dust(1 - dk, 11); flash(dk * .8, '#CDB08A'); }
  }

  // ======================================================================================================
  // SHOT 4 · 58.98–62.2 · "You didn't even strike a single chord": the dusty spotlit guitar
  // ======================================================================================================
  const TUX = 560, TUU = 30, GX = 960, GY = 692, GR = -.05, POKE = 60.82, SNAP = 61.34, OFFT = 62.07;
  const WD = '#C98A4B', WDK = '#8A5530', WLT = '#E8B77A';
  const STR = [-15, -9, -3, 3, 9, 15], BR_Y = 45, NUT_Y = -520, PK_Y = -130;
  const strX = (i, y) => lerp(STR[i], STR[i] * .62, (BR_Y - y) / (BR_Y - NUT_Y));
  const toW = (x, y) => { const [rx, ry] = rot2(x, y, GR); return [GX + rx, GY + ry]; };
  function stageBG(t, spot) {
    vgrad(-500, -500, 2500, 764, ['#1E1612', '#342419', '#4A3322'], 6);
    for (let i = 0; i < 12; i++) { const x = i * 190 - 220; paint(rectPts(x, -500, 90, 1270), { wash: '#2A1D15', washOp: 150, ink: null }); inkLine([[x + 95, -500], [x + 95, 764]], .7, '#1A120D', 'inkfine', 0); }
    vgrad(-500, 760, 2500, 1400, ['#6B4A33', '#4E3423', '#3A2619'], 5);
    for (let i = 0; i < 7; i++) { const y = 760 + i * i * 9 + i * 18; inkLine([[-500, y], [2500, y]], .7, '#2E1E14', 'inkfine', 0); }
    for (let i = 0; i < 14; i++) { const x = -300 + i * 180; inkLine([[x, 764], [x + (x - 960) * .5, 1400]], .6, '#2E1E14', 'inkfine', 0); }
    if (spot > .02) {
      paint([[900, -120], [1020, -120], [1360, 850], [560, 850]], { fill: '#FFE9B8', fillOp: 85 * spot, bleed: .15, tex: .3, ink: null });
      paint([[930, -120], [990, -120], [1200, 850], [720, 850]], { fill: '#FFF3D0', fillOp: 60 * spot, bleed: .15, tex: .3, ink: null });
      paint(ellPts(960, 842, 420, 78, 30), { fill: '#FFE3A8', fillOp: 150 * spot, bleed: .2, tex: .4, ink: null });
    }
  }
  function web(cx, cy, r, a0, a1, n = 6, rings = 3) {
    const col = '#E8DCC8';
    for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); inkLine([[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]], .45, col, 'inkfine', 0); }
    for (let k = 1; k <= rings; k++) {
      const rr = r * k / (rings + .4), pts = [];
      for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); if (i < n) { const am = lerp(a0, a1, (i + .5) / n); pts.push([cx + Math.cos(am) * rr * .86, cy + Math.sin(am) * rr * .86]); } }
      inkLine(pts, .4, col, 'inkfine', .4);
    }
  }
  function guitar(t) {
    // stand (behind)
    for (const sd of [-1, 1]) inkLine([[GX + sd * 120, 850], [GX + sd * 30, 770]], 2.2, '#2A2A30', 'ink', 0);
    inkLine([[GX, 850], [GX + 6, 300]], 2.2, '#2A2A30', 'ink', 0);
    push(); translate(GX, GY); rotate(GR);
    paint(ellPts(0, 0, 132, 120, 30), { wash: WD, fill: WDK, fillOp: 60, tex: .6, ink: PAL.ink, sw: 1.3 });
    paint(ellPts(0, -165, 100, 90, 28), { wash: WD, fill: WDK, fillOp: 60, tex: .6, ink: PAL.ink, sw: 1.3 });
    paint(ellPts(0, -80, 84, 50, 20), { wash: WD, ink: null });
    paint(ellPts(-40, -40, 50, 70, 16, 0, .3), { fill: WLT, fillOp: 90, bleed: .2, ink: null });
    paint(ellPts(0, -80, 40, 40, 20), { wash: '#2A1A12', ink: PAL.ink, sw: 1 });
    paint(ellPts(0, -80, 48, 48, 20), { ink: '#6A3E22', sw: .8, br: 'inkfine' });
    paint(rrPts(-42, BR_Y - 8, 84, 16, 5), { wash: '#4A2A18', ink: PAL.ink, sw: .8 });
    paint(rectPts(-18, NUT_Y, 36, -NUT_Y - 222), { wash: '#6A3E22', fill: '#3A2012', fillOp: 60, ink: PAL.ink, sw: 1 });
    for (let k = 1; k < 8; k++) inkLine([[-18, NUT_Y + k * 40], [18, NUT_Y + k * 40]], .5, '#D8C8A8', 'inkfine', 0);
    paint([[-20, NUT_Y], [20, NUT_Y], [28, NUT_Y - 96], [-28, NUT_Y - 96]], { wash: '#5A341E', ink: PAL.ink, sw: 1 });
    for (let k = 0; k < 3; k++) for (const sd of [-1, 1]) paint(ellPts(sd * 38, NUT_Y - 20 - k * 28, 10, 7, 8), { wash: '#D8C8A8', ink: PAL.ink, sw: .5 });
    // dust on the top
    paint(ellPts(0, -40, 120, 100, 20), { fill: '#BBA88C', fillOp: 55, bleed: .2, tex: .9, border: .8, ink: null });
    inkLine([[-100, -210], [-40, -240], [30, -235]], 3, '#CDBB9E', 'dry', .5);
    // strings
    for (let i = 0; i < 6; i++) {
      if (i === 5 && t >= SNAP) continue;
      const pts = []; for (let k = 0; k <= 10; k++) { const y = lerp(BR_Y, NUT_Y, k / 10); pts.push([strX(i, y), y]); }
      if (i === 5) {
        // the poked string: pushed left by the finger, then vibrating
        const press = seg(t, 60.62, POKE), vib = t > POKE ? 7 * Math.exp(-(t - POKE) * 2.2) * Math.sin(t * 70) : 0;
        for (let k = 0; k <= 10; k++) { const y = pts[k][1], f = y > PK_Y ? (BR_Y - y) / (BR_Y - PK_Y) : (y - NUT_Y) / (PK_Y - NUT_Y); pts[k][0] += (t < POKE ? -10 * press * f : vib * Math.sin(Math.PI * (BR_Y - y) / (BR_Y - NUT_Y))); }
      }
      inkLine(pts, i > 3 ? .6 : .8, '#E8E0D0', 'inkfine', 0);
    }
    // the snapped string curls up both ways
    if (t >= SNAP) {
      const k = elasticOut(seg(t, SNAP, SNAP + .6));
      for (const [y0, dir] of [[BR_Y, -1], [NUT_Y, 1]]) {
        const pts = []; let x = strX(5, y0), y = y0, a = dir < 0 ? -Math.PI / 2 : Math.PI / 2;
        const L = (dir < 0 ? BR_Y - PK_Y : PK_Y - NUT_Y) * (dir < 0 ? 1 : .45), n = 30;
        for (let j = 0; j <= n; j++) { pts.push([x, y]); a += dir * (j / n) * 1.3 * k; x += Math.cos(a) * L / n; y += Math.sin(a) * L / n; }
        inkLine(pts, 1.5, '#FFF6E0', 'ink', .5);
      }
    }
    pop();
    web(GX - 18, GY - 330, 120, 1.9, 3.5, 6, 3);
    web(GX + 30, GY - 600, 190, -.9, .5, 6, 4);
  }
  function spider(x, y, s, lookX, suitcase, climb) {
    for (const sd of [-1, 1]) for (let j = 0; j < 4; j++) {
      const a = sd * (.5 + j * .32) + (climb ? Math.sin(T * 26 + j) * .25 : 0), ax = x + sd * s * .5, ay = y + (j - 1.5) * s * .25;
      inkLine([[ax, ay], [ax + sd * s * 1.1 * Math.cos(a - sd * .6), ay - s * .8 + j * s * .3], [ax + sd * s * 1.8, ay + s * .4 + j * s * .25]], .7, PAL.ink, 'inkfine', .4);
    }
    paint(ellPts(x, y, s * .8, s * .95, 14), { wash: '#2A1E2A', ink: PAL.ink, sw: .7 });
    for (const sd of [-1, 1]) { paint(ellPts(x + sd * s * .3, y - s * .25, s * .26, s * .3, 10), { wash: PAL.cream, ink: null }); paint(ellPts(x + sd * s * .3 + lookX * s * .1, y - s * .2, s * .12, s * .15, 8), { wash: PAL.ink, ink: null }); }
    if (suitcase > .02) {
      const k = backOut(suitcase), bx = x + s * 1.6, by = y + s * 1.2;
      paint(rrPts(bx - s * .8 * k, by - s * .5 * k, s * 1.6 * k, s * 1.05 * k, s * .15), { wash: '#C8864A', fill: '#8A5530', fillOp: 60, ink: PAL.ink, sw: .6 });
      inkLine([[bx - s * .3 * k, by - s * .5 * k], [bx, by - s * .8 * k], [bx + s * .3 * k, by - s * .5 * k]], .6, PAL.ink, 'inkfine', .5);
      inkLine([[x + s * .6, y + s * .3], [bx, by - s * .8 * k]], .6, PAL.ink, 'inkfine', 0);
    }
  }
  function tumbleweed(x, y, r, rot) {
    push(); translate(x, y); rotate(rot);
    paint(ellPts(0, 0, r, r, 16), { fill: '#C8A064', fillOp: 70, bleed: .2, tex: .6, ink: null });
    for (let i = 0; i < 5; i++) paint(ellPts(0, 0, r * (.6 + .1 * i), r * (.9 - .08 * i), 14, 0, i * .7), { ink: i % 2 ? '#E0BC7A' : '#5A3E24', sw: 1.2, br: 'ink' });
    for (let i = 0; i < 7; i++) { const a = i * .9; inkLine([[Math.cos(a) * r * .9, Math.sin(a) * r * .9], [Math.cos(a + 2.2) * r * .5, Math.sin(a + 2.2) * r * .5], [Math.cos(a + 3.8) * r * .85, Math.sin(a + 3.8) * r * .85]], 1, '#7A5A38', 'ink', .6); }
    pop();
  }
  function hand(tipX, tipY) {
    // the human's sleeve + hand, index finger extended to the left
    paint(rrPts(tipX + 175, tipY - 58, 1400, 132, 50), { wash: '#F29A38', fill: '#C46A1E', fillOp: 60, tex: .6, ink: PAL.ink, sw: 1.3 });
    paint(rrPts(tipX + 160, tipY - 62, 44, 140, 18), { wash: '#C46A1E', ink: PAL.ink, sw: 1 });
    paint(ellPts(tipX + 120, tipY + 14, 64, 54, 18), { wash: '#F2C4A0', fill: '#E9A98A', fillOp: 50, ink: PAL.ink, sw: 1.1 });
    for (let k = 0; k < 3; k++) paint(ellPts(tipX + 92 + k * 6, tipY + 34 + k * 16, 26, 11, 10), { wash: '#F2C4A0', ink: PAL.ink, sw: .7 });
    paint(rrPts(tipX, tipY - 14, 120, 30, 14), { wash: '#F2C4A0', fill: '#E9A98A', fillOp: 40, ink: PAL.ink, sw: 1.1 });
    paint(rrPts(tipX + 6, tipY - 10, 22, 18, 7), { wash: '#FFE6DA', ink: PAL.ink, sw: .5 });
    paint(ellPts(tipX + 118, tipY - 30, 34, 16, 12, 0, -.3), { wash: '#F2C4A0', ink: PAL.ink, sw: .8 });
  }

  function chord(t, lt, dur) {
    const spot = t < OFFT ? 1 - (t > 61.95 && t < 62.0 ? .6 : 0) : 0;
    const pokeW = toW(strX(5, PK_Y) + 4, PK_Y);
    const tipX = t < SNAP ? kf(t, [[59.25, 2300], [59.6, 1560], [60.62, 1030], [POKE, pokeW[0] + 2]], ease)
      : lerp(pokeW[0] + 2 + 50 * backOut(seg(t, SNAP, SNAP + .12)), 2400, easeIn(seg(t, 61.5, 61.95)));
    const boing = t >= SNAP ? Math.exp(-(t - SNAP) * 4) : 0;
    const [sx, sy] = shakeXY(t, 10 * boing);
    const z = 1.14 + .1 * ease(seg(t, 58.98, 61.2)), cx = lerp(890, 860, seg(t, 58.98, 62)), cy = lerp(545, 530, seg(t, 58.98, 62));
    camBegin(cx + sx, cy + sy, z, 0);
    stageBG(t, spot);
    guitar(t);
    // spider on its thread from the headstock
    const anchor = toW(34, NUT_Y - 90), climb = seg(t, 61.68, 62.08), sy0 = 320 + Math.sin(t * 2.4) * 10 - (t > SNAP && t < SNAP + .3 ? Math.sin((t - SNAP) / .3 * Math.PI) * 36 : 0);
    const spY = lerp(sy0 + 60, -80, easeIn(climb));
    inkLine([anchor, [anchor[0] + 24, spY]], .5, '#E8DCC8', 'inkfine', 0);
    spider(anchor[0] + 24, spY, 24, t < SNAP ? clamp((tipX - 1100) / -200, -1, 1) * -1 + 1 : 0, seg(t, 61.46, 61.62), climb > 0);
    if (t > SNAP + .02 && t < SNAP + .5) letter('!', anchor[0] + 50, spY - 40, 48, PAL.lemon, { pop: (t - SNAP) * 5, rot: .15 });
    // tumbleweed through the silence
    const tk = seg(t, 61.05, 62.35);
    if (tk > 0 && tk < 1) { const x = lerp(-180, 2200, tk); tumbleweed(x, 815 - Math.abs(Math.sin(tk * Math.PI * 4)) * 80, 66, x / 66); }
    // Tune, watching hopefully from the side; flag droops after the BOING
    const hope = seg(t, 59.3, 60.3), hop = bump(t, POKE, .14, .2, .25), sad = seg(t, SNAP + .1, SNAP + .5);
    const md = mood(t, [[58.98, 'look'], [POKE, 'spark'], [SNAP, 'wide', '!'], [SNAP + .45, 'cry']]);
    tuneDroop(TUX, 850, TUU, { gold: 1, ...md, lookX: 1, lookY: -.2, blush: true, mouth: t < POKE ? 'o' : t < SNAP ? 'grin' : 'frown',
      aL: t < SNAP ? .35 + hope * .4 + hop * .6 : -.6 - sad * .3, aR: t < SNAP ? .35 + hope * .4 + hop * .6 : -.6 - sad * .3, dy: -hop * 1.2, sq: sad * .1, rot: .06 * hope - sad * .08, emote: md.emote, emoteK: md.emoteK }, easeOut(seg(t, SNAP + .15, SNAP + .9)));
    // dust motes in the spotlight
    if (spot > 0) for (let i = 0; i < 26; i++) {
      const y = 860 - frac(hash(i) + t * (.03 + hash(i * 2) * .04)) * 900, x = 960 + (hash(i * 3.3) - .5) * (180 + (y + 120) * .75) + Math.sin(t * .8 + i) * 16;
      paint(ellPts(x, y, 3 + hash(i * 5) * 3, 3 + hash(i * 5) * 3, 6), { wash: '#FFF3D8', washOp: 160, ink: null });
    }
    // the finger (slow motion)
    if (tipX < 2300) hand(tipX, pokeW[1]);
    sfx('plink', pokeW[0] + 30, pokeW[1] - 90, 60, PAL.cream, t - POKE, { life: .55, rot: -.15 });
    sfx('BOING!', 1200, 300, 140, PAL.lemon, t - SNAP, { life: .62, stroke: '#8A5530', rot: .12 });
    const eyes = [toScreen(TUX - 1.05 * TUU, 850 - 3.65 * TUU), toScreen(TUX + 1.05 * TUU, 850 - 3.65 * TUU)];
    camEnd();
    // dust from the coin pile clearing
    const dk = seg(t, 58.98, 59.5);
    if (dk < 1) { dust(easeOut(dk), 11); flash((1 - dk) * .8, '#CDB08A'); }
    // spotlight snaps off: darkness, just Tune's two glinting eyes
    if (t >= OFFT) {
      flash(1, '#141018');
      if (!(t > 62.14 && t < 62.18)) for (const [ex, ey] of eyes) paint(ellPts(ex, ey + 4, 13, 17, 12), { wash: PAL.cream, ink: null });
    }
  }

  chapter('binary', 47.78, 62.2, [[47.78, sunset], [51.46, neon], [54.78, jackpot], [58.98, chord]]);
})();
