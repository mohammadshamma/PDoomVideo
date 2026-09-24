// c5_finale (62.2–71.84): "You asked the chatbot make it cool / And used us as your creative tool", then the outro.
//   62.20 chill:  out of the dark a chat window glows on, two thumbs type "make it cool", SEND; three pairs of pink
//                 shades pop out of the bubble, the camera tilts down the aurora sky and the shades drop onto Gemi,
//                 Suno and Tune (one per word). On "cool" frost crawls in, they freeze into ice cubes, snow falls, a
//                 penguin in shades belly-slides past, a glint, and the ice cracks.
//   65.90 studio: ice shards burst away onto an art table. The human paints rainbow strokes with Gemi as a brush,
//                 stamps orange orbs with upside-down Suno on the beat (STOMP), sticks Gemi in their teeth and dots
//                 notes with Tune held by its flag. All three dizzy; at the end they wriggle.
//   68.60 outro:  they pop off the canvas in a paint burst, land hand in hand on the final hit, bow; the human holds a
//                 blank canvas. A progress bar completes ✓, the camera zooms out to the render-queue conveyor where the
//                 thumbnail sits, the three hop out onto the belt and wave, and a paper disk opens on the title card.
(() => {
  const B = n => OFF + n * BEAT;
  const ICE = '#DDF3FB', ICE2 = '#BFE6F5', FROST = '#F4FBFF';
  const RAINBOW = [PAL.magenta, PAL.sunoB, PAL.lemon, PAL.mint, PAL.gBlue];

  // ---------------------------------------------------------------- shared bits
  function pinkShades(cx, cy, w, sw) {
    for (const s of [-1, 1]) {
      const lx = cx + s * w * .52;
      paint(rrPts(lx - w * .47, cy - w * .31, w * .94, w * .6, w * .24), { wash: PAL.magenta, ink: PAL.ink, sw: sw * .7 });
      paint(rrPts(lx - w * .36, cy - w * .21, w * .72, w * .42, w * .17), { wash: '#2E2446', ink: null });
      paint([[lx - w * .3, cy - w * .02], [lx - w * .14, cy - w * .18], [lx - w * .04, cy - w * .18], [lx - w * .22, cy + w * .02]], { wash: '#FFFFFF', washOp: 170, ink: null });
    }
    inkLine([[cx - w * .1, cy - w * .1], [cx, cy - w * .17], [cx + w * .1, cy - w * .1]], sw * 1.3, PAL.magenta, 'ink', .5);
  }
  // local face positions (body space) for each character, and the shade width in units
  const FACE = { g: [-7.05, 1.75], s: [-8.85, 2.15], t: [-3.65, 1.65] };
  const shadesHook = k => (u, sw) => pinkShades(0, FACE[k][0] * u, FACE[k][1] * u, sw);

  function orbitStars(x, y, r, t, col = PAL.lemon, n = 3) {
    for (let i = 0; i < n; i++) {
      const a = t * 7 + i * TAU / n;
      paint(starPts(x + Math.cos(a) * r, y + Math.sin(a) * r * .35, r * .22, .45, 5), { wash: i % 2 ? PAL.cream : col, ink: PAL.ink, sw: .5 });
    }
  }
  function splat(x, y, r, col, seed, k = 1) {
    if (k < .02) return;
    const p = [], n = 14;
    for (let i = 0; i < n; i++) { const a = i / n * TAU, q = r * k * (i % 2 ? .62 + hash(seed + i) * .25 : 1 + hash(seed + i * 3) * .35); p.push([x + Math.cos(a) * q, y + Math.sin(a) * q]); }
    paint(p, { wash: col, washOp: 235, fill: mixCol(col, PAL.ink, .25), fillOp: 50, bleed: .08, tex: .6, border: .5, ink: null, curv: .5 });
    for (let i = 0; i < 4; i++) { const a = hash(seed + 40 + i) * TAU, d = r * k * (1.45 + hash(seed + 50 + i) * .6), dr = r * k * (.1 + hash(seed + 60 + i) * .12); paint(ellPts(x + Math.cos(a) * d, y + Math.sin(a) * d, dr, dr, 8), { wash: col, ink: null }); }
  }

  // ================================================================ SHOT 1 · make it cool (62.20 – 65.90)
  const G1 = 860, CX = { g: 540, t: 960, s: 1380 }, U1 = { g: 30, t: 20, s: 29 };
  const LAND = { g: 64.24, s: 64.42, t: 64.72 }, SEND = 63.68, LAUNCH = 63.76, FREEZE = 64.98;
  const CUBE = { g: 64.98, s: 65.08, t: 65.18 }, CRACK = 65.66;
  const TXT = 'make it cool';

  function sky1(t) {
    const stops = [[-1500, '#120F2A'], [-700, '#1E1A4A'], [-150, '#3B3F92'], [250, '#7FA8E6'], [600, '#B9E2F6'], [900, '#E4F6FC']];
    const col = y => { let i = 0; while (i + 1 < stops.length && y > stops[i + 1][0]) i++; if (i + 1 >= stops.length) return stops[i][1]; return mixCol(stops[i][1], stops[i + 1][1], (y - stops[i][0]) / (stops[i + 1][0] - stops[i][0])); };
    for (let y = -1500; y < 1400; y += 60) paint(rectPts(-400, y, W + 800, 64), { wash: col(y + 30), ink: null });
    for (let i = 0; i < 4; i++) paint(ellPts(hash(i + 60) * W, -600 + i * 380, 700, 260, 18), { fill: i % 2 ? PAL.gViolet : PAL.sky, fillOp: 60, bleed: .3, tex: .4, ink: null });
    // stars in the night part
    for (let i = 0; i < 26; i++) {
      const x = hash(i + 3) * W, y = -1100 + hash(i + 7) * 900, tw = .5 + .5 * Math.sin(t * 5 + i * 2.3);
      paint(sparklePts(x, y, 5 + 9 * tw * hash(i + 11), .62), { wash: i % 3 ? PAL.cream : PAL.lemon, ink: null });
    }
    // aurora ribbons in pink and cyan
    [[PAL.cyan, -80, 0], [PAL.bubble, 40, 1.7], [PAL.mint, -220, 3.1]].forEach(([c, y0, ph]) => {
      const P = []; for (let i = 0; i <= 12; i++) P.push([-200 + i * 190, y0 + Math.sin(i * .7 + ph + t * .8) * 70]);
      paint(thickPath(chaikin(P, false, 2), 90), { fill: c, fillOp: 110, bleed: .25, tex: .4, border: .5, ink: null });
    });
    // icebergs / snowy peaks
    [[-80, 380, 560, '#C9D9F4'], [420, 260, 520, '#D8E6FA'], [900, 420, 600, '#C3D4F2'], [1400, 300, 520, '#D6E4F8'], [1800, 380, 560, '#CADBF4']].forEach(([x, w, h, c], i) => {
      const top = G1 - h * .55, px = x + w * .5 + (hash(i) - .5) * 80;
      paint([[x - w * .5, G1 + 10], [px - w * .12, top + 30], [px, top], [px + w * .15, top + 40], [x + w * 1.5, G1 + 10]], { wash: c, ink: PAL.ink, sw: .7 });
      paint([[px - w * .12, top + 30], [px, top], [px + w * .15, top + 40], [px + w * .05, top + 60], [px - w * .03, top + 48]], { wash: FROST, ink: null });
    });
    // snow ground
    const gp = [[-400, 1500]]; for (let i = 0; i <= 14; i++) gp.push([-400 + i * 200, G1 - 20 + Math.sin(i * 1.3) * 16]); gp.push([W + 400, 1500]);
    paint(gp, { wash: '#F2FAFD', fill: ICE2, fillOp: 70, bleed: .1, tex: .5, border: .6, ink: PAL.ink, sw: .9, curv: .4 });
    for (let i = 0; i < 5; i++) paint(ellPts(200 + i * 400, G1 + 110 + (i % 2) * 40, 170, 26, 16), { fill: '#A9CBEB', fillOp: 80, bleed: .2, tex: .3, ink: null });
  }

  function chatWindow(t) {
    const sendK = seg(t, SEND, SEND + .25);
    // glow on the night
    paint(ellPts(960, -560, 900, 560, 24), { fill: PAL.gViolet, fillOp: 90, bleed: .3, tex: .3, ink: null });
    paint(rrPts(330, -960, 1260, 800, 60, 2), { wash: PAL.suno, ink: PAL.ink, sw: 1.6 });
    paint(rrPts(360, -930, 1200, 740, 40, 1), { wash: '#F6F0FF', fill: PAL.bubble, fillOp: 40, tex: .5, ink: PAL.ink, sw: .8 });
    // header
    paint(rrPts(360, -930, 1200, 90, 40), { wash: PAL.gViolet, ink: null });
    paint(sparklePts(420, -885, 28, .6, t * .5), { wash: PAL.lemon, ink: PAL.ink, sw: .6 });
    for (let i = 0; i < 3; i++) paint(ellPts(470 + i * 26, -885, 8, 8, 8), { wash: PAL.cream, ink: null });
    // earlier bot bubble (scribbles, not words)
    paint(rrPts(410, -810, 560, 150, 36), { wash: '#E4DAF8', ink: PAL.ink, sw: .7 });
    for (let l = 0; l < 3; l++) { const P = []; for (let i = 0; i <= 10; i++) P.push([450 + i * (l === 2 ? 30 : 46), -775 + l * 38 + Math.sin(i * 1.7 + l) * 5]); inkLine(P, .9, PAL.violet, 'inkfine', .5); }
    // input bar + send button
    paint(rrPts(410, -300, 950, 84, 42), { wash: PAL.cream, ink: PAL.ink, sw: .9 });
    const typed = TXT.slice(0, Math.floor(seg(t, 62.72, 63.5) * TXT.length + .001));
    if (t < SEND) {
      if (typed) letter(typed, 450, -258, 54, PAL.ink, { align: 'left', ink: false });
      if (Math.floor(t * 4) % 2 === 0 || typed.length < TXT.length) {
        const cx = 450 + typed.length * 27.5;
        paint(rectPts(cx + 4, -290, 5, 60), { wash: PAL.gBlue, ink: null });
      }
    }
    const press = Math.exp(-Math.max(0, t - SEND) * 10) * (t >= SEND ? 1 : 0);
    paint(ellPts(1460, -258, 50 * (1 - press * .15), 50 * (1 - press * .15), 20), { wash: t >= SEND ? PAL.mint : PAL.magenta, ink: PAL.ink, sw: 1 });
    paint([[1440, -282], [1488, -258], [1440, -234], [1450, -258]], { wash: PAL.cream, ink: null });
    // the sent bubble
    if (t >= SEND) {
      const k = backOut(sendK), cx = 1230, cy = -560;
      push(); translate(cx, cy); scale(k); translate(-cx, -cy);
      paint(rrPts(920, -640, 620, 160, 60), { wash: PAL.magenta, fill: PAL.gPink, fillOp: 70, tex: .5, ink: PAL.ink, sw: 1.2 });
      paint([[1470, -500], [1530, -460], [1500, -510]], { wash: PAL.magenta, ink: PAL.ink, sw: .8 });
      pop();
      letter(TXT, cx, cy, 76, PAL.cream, { pop: sendK * 1.2, rot: -.02 });
      sparkleBurst(cx, cy, 260, t - SEND, { n: 11, life: .7 });
      // shades pop out of the bubble
      for (const k2 of ['g', 's', 't']) if (t < LAUNCH + .05) {
        const e = seg(t, SEND + .02, LAUNCH);
        push(); translate(cx + (k2 === 'g' ? -120 : k2 === 's' ? 120 : 0), cy - 20 - e * 60); scale(e); pinkShades(0, 0, 60, 1); pop();
      }
    }
  }
  // two thumbs texting (the viewer's own hands, in screen space; they drop away with the tilt)
  function thumbs(t, drop) {
    const tap = (side, ph) => Math.max(0, Math.sin((t * 9 + ph) * Math.PI)) * seg(t, 62.6, 62.75) * (1 - seg(t, 63.5, 63.55));
    const thumb = (x, y, rot) => {
      push(); translate(x, y); rotate(rot);
      paint(rrPts(-58, -40, 116, 330, 56, 2), { wash: SKIN, fill: '#E9A98A', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1 });
      paint(rrPts(-34, -22, 68, 70, 26), { wash: '#FBE3D6', ink: PAL.ink, sw: .7 });
      paint(rrPts(-70, 250, 140, 200, 30), { wash: HOODIE, fill: HOODIE_DK, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
      pop();
    };
    const Y = 1020 + drop * 1400;
    thumb(700, Y - 170 - tap(-1, 0) * 50 + (t > 63.55 ? 200 * seg(t, 63.55, 63.8) : 0), .25);
    const reach = seg(t, 63.48, SEND), back = seg(t, SEND + .05, SEND + .35);
    thumb(lerp(1240, 1480, easeOut(reach)) + back * 200, Y + lerp(-170 - tap(1, .5) * 50, -222, easeOut(reach)) + back * 260, lerp(-.25, -.1, reach));
  }

  // pose of each character in shot 1 at time t
  function pose1(k, t) {
    const tf = Math.min(t, FREEZE), styles = { g: 'bounce', s: 'hop', t: 'bounce' }, m = move(styles[k], tf, k === 't' ? 2 : 0);
    const landed = t >= LAND[k], age = t - LAND[k];
    const shiver = t > 64.8 && t < CUBE[k] ? Math.sin(t * 90 + k.charCodeAt(0)) * .25 : 0;
    const o = { ...m, blush: true, dx: m.dx + shiver, noShadow: t >= CUBE[k] };
    if (landed) {
      o.eyes = 'none'; o.draw = shadesHook(k); o.mouth = t > 64.8 ? 'grin' : 'cat';
      o.sq = (m.sq || 0) + .18 * Math.exp(-age * 9) * (age < .6 ? 1 : 0);
      if (t < FREEZE) { o.aR = 1.1 + .3 * Math.sin(bpOf(t) * Math.PI); o.aL = m.aL; }
      else { o.aR = 1.1 + .3 * Math.sin(bpOf(FREEZE) * Math.PI); }
    } else { o.eyes = 'look'; o.lookY = -1; o.mouth = 'o'; }
    if (t >= CUBE[k]) { o.mouth = 'wobble'; }
    return o;
  }
  function faceWorld(k, t) {
    const o = pose1(k, t), u = U1[k];
    return [CX[k] + (o.dx || 0) * u, G1 + (o.dy || 0) * u + FACE[k][0] * u * (1 - (o.sq || 0))];
  }
  function drawChar1(k, t) {
    const o = pose1(k, t), u = U1[k], x = CX[k] + (o.dx || 0) * u;
    const fz = seg(t, CUBE[k], CUBE[k] + .3);
    if (k === 'g') gemi(x, G1, u, { ...o, colA: mixCol(PAL.gBlue, '#CFEFFF', fz * .35), colB: mixCol(PAL.gViolet, '#DCE9FF', fz * .35) });
    else if (k === 's') suno(x, G1, u, { ...o, sing: 0, colA: mixCol(PAL.sunoA, '#FFE3C8', fz * .3), colB: mixCol(PAL.sunoB, '#F7B6B0', fz * .3) });
    else tune(x, G1, u, { ...o, gold: 1 });
  }
  function iceCube(k, t) {
    const age = t - CUBE[k]; if (age < 0) return;
    const u = U1[k], o = pose1(k, t), x = CX[k] + (o.dx || 0) * u;
    const hw = (k === 't' ? 6.2 : k === 'g' ? 6.4 : 7.4) * u, hh = (k === 't' ? 7.4 : 6.6) * u, cy = G1 + (o.dy || 0) * u - hh + 10;
    const s = backOut(seg(age, 0, .22)), crack = seg(t, CRACK + (k === 's' ? .05 : k === 't' ? .1 : 0), CRACK + .22);
    const sh = crack > 0 ? Math.sin(t * 80 + u) * 5 * crack : 0;
    push(); translate(x + sh, cy); scale(s, s);
    paint(rrPts(-hw, -hh, hw * 2, hh * 2, 34, 2), { wash: '#BDEBFF', washOp: 120, fill: '#FFFFFF', fillOp: 60, bleed: .05, tex: .6, border: .7, ink: '#3E78C8', sw: 1.3 });
    paint([[-hw, -hh + 34], [-hw + 60, -hh - 40], [hw + 60, -hh - 40], [hw, -hh + 34]], { wash: '#E8F9FF', washOp: 170, ink: '#3E78C8', sw: .9 });
    paint([[hw, -hh + 34], [hw + 60, -hh - 40], [hw + 60, hh - 70], [hw, hh]], { wash: '#9FD8F2', washOp: 150, ink: '#3E78C8', sw: .9 });
    paint([[-hw + 30, -hh + 60], [-hw + 60, -hh + 60], [-hw + 36, hh * .1], [-hw + 22, hh * .1]], { wash: '#FFFFFF', washOp: 190, ink: null });
    paint([[-hw + 80, -hh + 50], [-hw + 96, -hh + 50], [-hw + 70, -hh + 170], [-hw + 60, -hh + 170]], { wash: '#FFFFFF', washOp: 150, ink: null });
    // frosted bottom rim
    paint(rrPts(-hw, hh - 40, hw * 2, 40, 18), { wash: FROST, washOp: 170, ink: null });
    if (crack > 0) {
      const P = [[-hw * .15, -hh]]; let px = -hw * .15;
      for (let i = 1; i <= 7; i++) { px += (i % 2 ? 1 : -1) * (30 + hash(i + u) * 40); P.push([px, -hh + hh * 2 * i / 7 * crack]); }
      inkLine(P, 1.3, '#2C5FA8', 'ink', 0);
      inkLine([[P[3][0], P[3][1]], [P[3][0] + 70 * crack, P[3][1] + 30], [P[3][0] + 110 * crack, P[3][1] + 10]], .9, '#2C5FA8', 'ink', 0);
    }
    pop();
  }
  function penguin(x, y, s, t) {
    paint(ellPts(x, y + s * .42, s * 1.3, s * .16, 14), { fill: '#7FA6D6', fillOp: 100, bleed: .2, ink: null });
    push(); translate(x, y); rotate(-.06 + Math.sin(t * 22) * .03);
    for (const [fy, r] of [[-.02, .3], [.16, -.2]]) paint(ellPts(-s * 1.25, fy * s, s * .3, s * .12, 10, 0, r), { wash: PAL.sunoA, ink: PAL.ink, sw: .8 });
    paint(ellPts(0, 0, s * 1.15, s * .5, 26), { wash: '#2B2F5E', ink: PAL.ink, sw: 1.2 });
    paint(ellPts(s * .12, s * .18, s * .95, s * .28, 22), { wash: PAL.cream, ink: null });
    paint([[-s * .05, -s * .12], [-s * .9, -s * .12 + Math.sin(t * 30) * s * .08], [-s * .2, s * .04]], { wash: '#1E2244', ink: PAL.ink, sw: .8, curv: .5 });
    paint(ellPts(s * 1.02, -s * .16, s * .44, s * .4, 18), { wash: '#2B2F5E', ink: PAL.ink, sw: 1.1 });
    paint(ellPts(s * 1.14, -s * .08, s * .28, s * .26, 14), { wash: PAL.cream, ink: null });
    paint([[s * 1.38, -s * .12], [s * 1.74, -s * .03], [s * 1.38, s * .06]], { wash: PAL.sunoA, ink: PAL.ink, sw: .8 });
    paint(ellPts(s * 1.2, s * .06, s * .09, s * .05, 8), { fill: PAL.bubble, fillOp: 220, ink: null });
    pinkShades(s * 1.1, -s * .2, s * .26, .7);
    pop();
    for (let i = 0; i < 6; i++) { const a = frac(t * 3 + i / 6), r = 10 + a * 26; paint(ellPts(x - s * 1.4 - a * 180, y + s * .3 - a * 50 * hash(i), r, r * .8, 10), { wash: FROST, washOp: 220 * (1 - a), ink: null }); }
  }
  function frostEdges(k, t) {
    if (k < .01) return;
    const edges = [[0, 0, W, 0, 0, 1], [W, 0, W, H, -1, 0], [W, H, 0, H, 0, -1], [0, H, 0, 0, 1, 0]];
    edges.forEach(([x0, y0, x1, y1, nx, ny], e) => {
      const P = [[x0 - nx * 40, y0 - ny * 40]];
      for (let i = 0; i <= 16; i++) { const f = i / 16, d = k * (60 + 90 * hash(e * 30 + i)) * (1 - .4 * Math.abs(f - .5)); P.push([lerp(x0, x1, f) + nx * d, lerp(y0, y1, f) + ny * d]); }
      P.push([x1 - nx * 40, y1 - ny * 40]);
      paint(P, { wash: FROST, washOp: 200, fill: '#CFEFFF', fillOp: 90, bleed: .1, tex: .6, border: .7, ink: null });
    });
    // crystal branches creeping in from the corners
    for (let i = 0; i < 12; i++) {
      const c = [[0, 0], [W, 0], [W, H], [0, H]][i % 4], a0 = [.35, Math.PI - .35, Math.PI + .35, -.35][i % 4] + (hash(i + 5) - .5) * 1.1 + (i % 4 === 0 || i % 4 === 3 ? 0 : 0);
      const L = k * (220 + hash(i + 9) * 260), ex = c[0] + Math.cos(a0) * L, ey = c[1] + Math.sin(a0) * L;
      inkLine([[c[0], c[1]], [ex, ey]], 1.4, '#FFFFFF', 'ink', 0);
      for (let j = 1; j <= 3; j++) {
        const f = j / 4, bx = lerp(c[0], ex, f), by = lerp(c[1], ey, f), bl = L * .22 * (1 - f * .4);
        for (const sd of [-1, 1]) inkLine([[bx, by], [bx + Math.cos(a0 + sd * .9) * bl, by + Math.sin(a0 + sd * .9) * bl]], .9, '#E8F8FF', 'inkfine', 0);
      }
    }
  }

  function chill(t, lt) {
    // camera: chat window up in the night sky, then a tilt down to the three, then a slow push
    const pan = ease(seg(t, LAUNCH + .02, 64.14));
    const push1 = ease(seg(t, 64.2, 65.9));
    let [dx, dy] = shakeXY(t, 10 * Math.max(...['g', 's', 't'].map(k => t >= LAND[k] ? Math.exp(-(t - LAND[k]) * 14) : 0)));
    if (t > CRACK) { const [a, b] = shakeXY(t, 7 * seg(t, CRACK, CRACK + .2)); dx += a; dy += b; }
    camBegin(960 + dx, lerp(-480, 560, pan) + dy - push1 * 20, 1 + push1 * .12);
    sky1(t);
    if (pan < 1) chatWindow(t);
    // falling shades
    for (const k of ['g', 's', 't']) {
      if (t < LAUNCH || t >= LAND[k]) continue;
      const e = (t - LAUNCH) / (LAND[k] - LAUNCH), [fx, fy] = faceWorld(k, t);
      const x0 = 1230 + (k === 'g' ? -120 : k === 's' ? 120 : 0), y0 = -640;
      const x = lerp(x0, fx, ease(e)) + Math.sin(e * 9 + k.charCodeAt(0)) * 60 * (1 - e), y = lerp(y0, fy, easeIn(e) * .75 + e * .25);
      push(); translate(x, y); rotate((1 - e) * (k === 't' ? 9 : 6) * (k === 's' ? -1 : 1)); pinkShades(0, 0, FACE[k][1] * U1[k], 1); pop();
    }
    // characters
    for (const k of ['g', 't', 's']) drawChar1(k, t);
    for (const k of ['g', 't', 's']) if (t >= LAND[k]) {
      const [fx, fy] = faceWorld(k, t), age = t - LAND[k];
      sfx('click!', fx + 90, fy - 110, 54, PAL.cyan, age, { life: .55, rot: .1 });
      if (age < .4) paint(sparklePts(fx - FACE[k][1] * U1[k] * .6, fy - 10, 40 * (1 - age / .4), .7, age * 4), { wash: '#FFFFFF', ink: null });
    }
    for (const k of ['g', 't', 's']) iceCube(k, t);
    // a glint on Tune's cube
    const gl = seg(t, 65.36, 65.62);
    if (gl > 0 && gl < 1) paint(sparklePts(1115, 640, 70 * Math.sin(gl * Math.PI), .72, gl * 1.5), { wash: '#FFFFFF', ink: PAL.cyan, sw: .6 });
    // penguin belly slide
    const pk = seg(t, 65.12, 65.88);
    if (pk > 0 && pk < 1) penguin(lerp(-300, 2300, pk), 885, 100, t);
    camEnd();
    if (pan < 1) thumbs(t, pan);
    // snow and frost (screen space)
    const sk = seg(t, 64.72, 65.0);
    for (let i = 0; i < 70 * sk; i++) {
      const sp = 200 + hash(i + 3) * 220, y = ((t - 64.5) * sp + hash(i + 1) * 1200) % 1200 - 60, x = hash(i + 2) * W + Math.sin(t * 2 + i) * 30, r = 5 + hash(i + 4) * 9;
      paint(ellPts(x, y, r, r, 8), { wash: '#FFFFFF', washOp: 230, ink: null });
    }
    frostEdges(easeOut(seg(t, 64.72, 65.35)), t);
    if (t >= 64.72) { const fk = seg(t, 64.72, 64.9); flash((1 - fk) * .5 * (fk > 0 ? 1 : 0), '#E8F8FF'); }
    sfx('CRACK!', 960, 330, 120, PAL.cyan, t - CRACK - .05, { life: .5, rot: -.06, stroke: PAL.ink });
    // open from the dark: the chat window switches on
    const ir = easeOut(seg(t, 62.2, 62.62));
    if (ir < 1) iris(960, 460, ir * 1300, '#0E0C20');
  }

  // ================================================================ SHOT 2 · creative tool (65.90 – 68.60)
  const PY0 = 690, PY1 = 990;             // paper back / front edge
  const HX = 960, HY = 905, HS = 34;       // the human behind the table
  const SHL = [HX - 1.75 * HS, HY - 7.4 * HS], SHR = [HX + 1.75 * HS, HY - 7.4 * HS];
  const MOUTH = [HX, HY - 9.0 * HS];
  const GU = 18, SU = 15, TU = 15;
  const STROKES = [
    { a: 66.0, b: 66.5, P: chaikin([[1170, 810], [1260, 750], [1370, 760], [1480, 825]], false, 3) },
    { a: 66.56, b: 67.1, P: chaikin([[1490, 905], [1390, 860], [1280, 895], [1170, 885]], false, 3) },
  ];
  const STAMPS = [[66.56, 560, 820], [67.04, 700, 905], [67.52, 555, 935], [68.0, 705, 775]];
  const DOTS = [[67.76, 815, 880], [68.0, 890, 812], [68.24, 970, 900], [68.48, 1050, 845]];

  function studioWall(t, x0 = 0, y0 = 0, w = W, h = H, art = true) {
    paint(rectPts(x0, y0, w, h), { wash: '#FBE6CF', ink: null });
    paint(ellPts(x0 + w * .5, y0 + h * .35, w * .5, h * .4, 20), { fill: '#FFF4E0', fillOp: 120, bleed: .25, tex: .4, ink: null });
    // stripes of wallpaper
    for (let i = 0; i < 9; i++) paint(rectPts(x0 + i * w / 9 + 40, y0, 26, h), { wash: '#F6D7BC', washOp: 150, ink: null });
    // splats on the wall
    const cols = [PAL.magenta, PAL.cyan, PAL.lemon, PAL.mint, PAL.sunoA, PAL.gViolet, PAL.coral];
    for (let i = 0; i < 11; i++) splat(x0 + hash(i + 20) * w, y0 + 60 + hash(i + 21) * h * .42, 26 + hash(i + 22) * 40, cols[i % cols.length], i * 17);
    // hanging drawings
    if (art) for (let i = 0; i < 3; i++) {
      const px = x0 + [.3, .63, .8][i] * w, py = y0 + 120, sw = Math.sin(t * 2 + i) * .04;
      push(); translate(px, py); rotate(sw);
      inkLine([[-60, -40], [0, -80], [60, -40]], .8, PAL.ink, 'inkfine', .2);
      paint(rectPts(-80, -40, 160, 120, 2), { wash: PAL.cream, ink: PAL.ink, sw: .8 });
      if (i === 0) paint(sparklePts(0, 20, 40, .6), { wash: PAL.gBlue, ink: PAL.ink, sw: .5 });
      else if (i === 1) paint(ellPts(0, 20, 38, 38, 16), { wash: PAL.sunoB, ink: PAL.ink, sw: .5 });
      else paint(heartPts(0, 20, 34), { wash: PAL.gPink, ink: PAL.ink, sw: .5 });
      pop();
    }
  }
  function arm(sh, hand, bend, sw = 1) {
    const mx = (sh[0] + hand[0]) / 2, my = (sh[1] + hand[1]) / 2, dx = hand[0] - sh[0], dy = hand[1] - sh[1], d = Math.hypot(dx, dy) || 1;
    const P = chaikin([sh, [mx - dy / d * bend, my + dx / d * bend], hand], false, 2);
    paint(thickPath(P, 30), { wash: HOODIE, fill: HOODIE_DK, fillOp: 50, tex: .5, ink: PAL.ink, sw: .9 * sw });
    const a = Math.atan2(dy, dx), cx = hand[0] - Math.cos(a) * 20, cy = hand[1] - Math.sin(a) * 20;
    paint(ellPts(cx, cy, 22, 22, 12), { wash: HOODIE_DK, ink: PAL.ink, sw: .7 });
  }
  const fist = (x, y, r = 24) => {
    paint(ellPts(x, y, r, r * .9, 14), { wash: SKIN, ink: PAL.ink, sw: .8 });
    for (let i = -1; i <= 1; i++) inkLine([[x - r * .6, y + i * r * .35], [x + r * .1, y + i * r * .35]], .6, PAL.ink, 'inkfine', 0);
  };
  // a partial path up to progress p
  function partial(P, p) {
    const n = Math.max(2, Math.ceil(p * (P.length - 1)) + 1); const Q = P.slice(0, n);
    const f = p * (P.length - 1), i = Math.floor(f);
    if (i + 1 < P.length) Q[Q.length - 1] = [lerp(P[i][0], P[i + 1][0], f - i), lerp(P[i][1], P[i + 1][1], f - i)];
    return Q;
  }
  function rainbowStroke(P, p) {
    if (p <= 0) return;
    const Q = partial(P, p);
    RAINBOW.forEach((c, j) => paint(thickPath(Q.map(q => [q[0], q[1] + (j - 2) * 11]), 12), { wash: c, washOp: 240, ink: null }));
    inkLine(Q.map(q => [q[0], q[1] - 30]), .5, PAL.ink, 'inkfine', .5);
  }
  function print(x, y, age) {
    const k = backOut(seg(age, 0, .18));
    push(); translate(x, y); scale(k * (1 + .2 * Math.exp(-age * 12)), k * .62);
    paint(ellPts(0, 0, 5 * SU, 5 * SU, 26, 2), { wash: PAL.sunoB, washOp: 225, fill: PAL.sunoA, fillOp: 90, bleed: .1, tex: .7, border: .6, ink: null });
    paint(clipHalf(ellPts(0, 0, 5 * SU, 5 * SU, 26), (a, b) => -a - b, 30), { wash: PAL.sunoA, washOp: 170, ink: null });
    sunoMark(0, 0, SU * .9, 1, { waveLive: 0 });
    pop();
  }
  function note(x, y, age, i) {
    const k = backOut(seg(age, 0, .16));
    if (k < .02) return;
    push(); translate(x, y); scale(k);
    paint(ellPts(0, 0, 30, 21, 16, 1, -.35), { wash: [PAL.lemon, PAL.mint, PAL.cyan, PAL.bubble][i % 4], ink: PAL.ink, sw: 1 });
    inkLine([[27, -6], [27, -90]], 1.6, PAL.ink, 'ink', 0);
    if (i % 2) inkLine([[27, -90], [58, -62], [52, -40]], 1.4, PAL.ink, 'ink', .5);
    pop();
  }

  function studio(t, lt) {
    const wr = t > 68.3 ? seg(t, 68.3, 68.45) : 0;            // wriggle at the end
    const stampHit = Math.max(0, ...STAMPS.map(([ts]) => t >= ts ? Math.exp(-(t - ts) * 12) : 0));
    const [sx, sy] = shakeXY(t, 9 * stampHit + 6 * wr);
    camBegin(975 + sx, 735 + sy, 1.6 * (1 + .05 * ease(lt / 2.7)));
    studioWall(t, -100, 330, W + 200, 800);
    // the human (their body disappears behind the table)
    const gemMouth = t >= 67.3;
    human(HX, HY, HS, { eyes: 'lazy', mouth: gemMouth ? 'flat' : 'flat', aL: -1.4, aR: -1.4, noShadow: true, brows: t > 68.3 ? 'up' : null });
    // table + paper
    paint([[-200, 670], [W + 200, 670], [W + 200, 1300], [-200, 1300]], { wash: '#C98A5A', fill: '#9A5E36', fillOp: 70, tex: .7, border: .5, ink: PAL.ink, sw: 1.1 });
    paint([[230, PY0], [1690, PY0], [1800, PY1], [120, PY1]], { wash: PAL.cream, fill: '#F3E3C8', fillOp: 60, tex: .5, ink: PAL.ink, sw: .9 });
    // pots: stamp pad (left), paint palette (right), lemon jar (centre-right)
    paint(rrPts(480, 640, 150, 56, 14), { wash: PAL.suno, ink: PAL.ink, sw: .9 });
    paint(rrPts(492, 648, 126, 36, 10), { wash: PAL.sunoB, fill: PAL.sunoA, fillOp: 90, tex: .6, ink: null });
    paint(ellPts(1420, 655, 100, 36, 20), { wash: '#E9C79E', ink: PAL.ink, sw: .9 });
    RAINBOW.forEach((c, j) => paint(ellPts(1350 + j * 35, 650 + (j % 2) * 8, 15, 10, 10), { wash: c, ink: null }));
    // paint marks on the paper
    for (const S of STROKES) rainbowStroke(S.P, ease(seg(t, S.a, S.b)));
    for (let i = 0; i < 4; i++) splat(1190 + i * 90, 940 - (i % 2) * 20, 8 + hash(i) * 7, RAINBOW[i], i * 7 + 100, seg(t, 66.2 + i * .2, 66.3 + i * .2));
    // faint staff lines for the notes
    const stK = seg(t, 67.5, 67.75);
    for (let l = 0; l < 5; l++) inkLine([[775, 785 + l * 30], [775 + 340 * stK, 785 + l * 30]], .6, PAL.violet, 'inkfine', 0);
    STAMPS.forEach(([ts, x, y]) => { if (t >= ts) print(x, y - 3.2 * SU * .62, t - ts); });
    DOTS.forEach(([ts, x, y], i) => { if (t >= ts) note(x, y, t - ts, i); });
    // lemon jar (Tune gets dipped in it)
    const jar = (front) => {
      if (!front) { paint(ellPts(1140, 640, 44, 13, 16), { wash: PAL.lemon, ink: PAL.ink, sw: .7 }); return; }
      paint([[1096, 640], [1184, 640], [1178, 706], [1102, 706]], { wash: '#CFE9F2', washOp: 200, ink: PAL.ink, sw: .9, curv: .2 });
      paint([[1099, 660], [1181, 660], [1177, 704], [1103, 704]], { wash: PAL.lemon, washOp: 230, ink: null });
    };
    jar(false);

    // ---- SUNO: the stamp, held by its sneakers in the left hand
    let hL;
    {
      const bp = bpOf(t), inStamp = t >= 66.3 && t < 68.25;
      let si = STAMPS.findIndex(([ts]) => t < ts); if (si < 0) si = STAMPS.length;
      const prev = STAMPS[si - 1], next = STAMPS[si];
      let tx, ty, lift;
      const contact = (y) => y - 11.4 * SU * .92;           // hand y so the orb bottom touches the paper
      if (t < 66.1) { tx = 610; ty = 450 + Math.sin(t * 5) * 10; }
      else if (t < 66.3) { const e = seg(t, 66.1, 66.3); tx = lerp(610, 555, e); ty = lerp(450, 650 - 11.4 * SU * .9, Math.sin(e * Math.PI) * .9); }
      else if (!next) { const e = seg(t, 68.1, 68.35); tx = lerp(prev[1], 610, e); ty = lerp(contact(prev[2]), 470, easeOut(seg(t, prev[0], prev[0] + .25))); }
      else {
        const from = prev || [66.3, 555, 650], a = from[0], b = next[0], e = (t - a) / (b - a);
        tx = lerp(from[1], next[1], ease(e));
        const yA = prev ? contact(prev[2]) : 650 - 11.4 * SU * .9, yB = contact(next[2]);
        ty = lerp(yA, yB, easeIn(e)) - Math.sin(e * Math.PI) * 180;
      }
      const hitAge = prev ? t - prev[0] : 9, sq = prev && hitAge < .18 ? .28 * (1 - hitAge / .18) : 0;
      const wig = wr * Math.sin(t * 60) * .25;
      hL = [tx, ty];
      arm(SHL, hL, -60);
      suno(tx, ty, SU, { rot: Math.PI + wig, sq, noShadow: true, eyes: wr > 0 ? 'angry' : 'swirl', mouth: wr > 0 ? 'frown' : 'wobble', aL: .6 + Math.sin(t * 13) * .6, aR: .6 - Math.sin(t * 13) * .6 });
      fist(tx, ty);
      if (prev && hitAge < .5) sfx('STOMP!', prev[1] + 110, prev[2] - 120, 44, PAL.sunoA, hitAge, { life: .45, rot: -.12 });
      if (t > 66.3) orbitStars(tx, ty + 6.4 * SU + 95, 60, t, PAL.lemon);
    }

    // ---- GEMI: the brush (right hand), later clenched in the teeth
    let hR;
    const gemOpts = { noShadow: true, eyes: wr > 0 ? 'angry' : 'swirl', mouth: wr > 0 ? 'frown' : 'wobble', blush: true };
    const drawGemBrush = (hx, hy, a) => {
      push(); translate(hx, hy); rotate(a);
      gemi(0, -1.7 * GU, GU, { ...gemOpts, rot: Math.PI + wr * Math.sin(t * 55) * .2, aL: Math.sin(t * 14) * 1.2, aR: -Math.sin(t * 14) * 1.2 });
      pop();
    };
    const tipOff = a => [-Math.sin(a) * 10 * GU, Math.cos(a) * 10 * GU];
    if (t < 67.12) {
      let tip, a;
      const S = STROKES.find(S => t < S.b + .03) || STROKES[1];
      if (t < STROKES[0].a) { const e = seg(t, 65.9, 66.0); tip = [lerp(1420, STROKES[0].P[0][0], e), lerp(650, STROKES[0].P[0][1], e)]; a = .2; }
      else if (t < S.a) { const e = seg(t, STROKES[0].b, S.a); tip = [lerp(STROKES[0].P.at(-1)[0], S.P[0][0], ease(e)), lerp(STROKES[0].P.at(-1)[1], S.P[0][1], ease(e)) - Math.sin(e * Math.PI) * 60]; a = lerp(-.3, .3, e); }
      else { const p = ease(seg(t, S.a, S.b)), Q = partial(S.P, Math.max(.001, p)); tip = Q.at(-1); a = (S === STROKES[0] ? -.35 : .35) * Math.sin(p * Math.PI) ; }
      const off = tipOff(a); hR = [tip[0] - off[0], tip[1] - off[1]];
      arm(SHR, hR, 70);
      drawGemBrush(hR[0], hR[1], a);
      paint(ellPts(tip[0], tip[1] - 8, 16, 12, 10), { wash: RAINBOW[Math.floor(t * 8) % 5], ink: null });
      fist(hR[0], hR[1]);
      orbitStars(hR[0] + 10, hR[1] + 5.2 * GU + 20, 55, t, PAL.cyan);
    }
    // teeth-clamped Gemi, sticking out sideways
    const inMouth = seg(t, 67.12, 67.3);
    if (t >= 67.12) {
      const from = [1250, 560], a = lerp(.3, -Math.PI / 2 + .35, ease(inMouth));
      const mx = lerp(from[0], MOUTH[0] + 4, ease(inMouth)), my = lerp(from[1], MOUTH[1] + 4, ease(inMouth));
      push(); translate(mx, my); rotate(a);
      gemi(0, -1.7 * GU, GU, { ...gemOpts, rot: Math.PI + wr * Math.sin(t * 55) * .2, aL: Math.sin(t * 14) * 1.2, aR: -Math.sin(t * 14) * 1.2 });
      pop();
      if (inMouth >= 1) paint(rrPts(MOUTH[0] - 26, MOUTH[1] - 8, 52, 18, 6), { wash: PAL.cream, ink: PAL.ink, sw: .7 });   // teeth
      if (inMouth >= 1) orbitStars(MOUTH[0] + 150, MOUTH[1] - 60, 50, t, PAL.cyan);
    }

    // ---- TUNE: sits scared on the table, then gets dipped by its flag and dotted
    const tuneOpts = { gold: 1, noShadow: true, blush: true };
    if (t < 67.3) {
      const sc = seg(t, 66.0, 66.2);
      tune(1040, 700, TU, { ...tuneOpts, eyes: sc > 0 ? 'scared' : 'normal', mouth: 'wobble', emote: 'sweat', emoteK: sc, dx: 0, dy: -Math.abs(Math.sin(t * 20)) * .15, lookX: .8, noShadow: false });
      if (t >= 67.12) { hR = [lerp(1250, 1070, seg(t, 67.12, 67.3)), lerp(560, 556, seg(t, 67.12, 67.3))]; arm(SHR, hR, 70); fist(hR[0], hR[1]); }
    } else {
      // hand path: grab → dip in jar → dots
      let hx, hy; const top = 12 * TU;
      if (t < 67.45) { const e = seg(t, 67.3, 67.45); hx = lerp(1070, 1140 + 2.55 * TU, e); hy = lerp(700 - top, 540, e) - Math.sin(e * Math.PI) * 80; }
      else if (t < 67.6) { const e = seg(t, 67.45, 67.6); hx = 1140 + 2.55 * TU; hy = lerp(690, 770, e) - top + Math.sin(e * Math.PI) * 40; }
      else {
        let di = DOTS.findIndex(([ts]) => t < ts); if (di < 0) di = DOTS.length;
        const prev = DOTS[di - 1] || [67.6, 1140, 770], next = DOTS[di];
        if (!next) { const e = seg(t, prev[0], prev[0] + .12); hx = prev[1] + 2.55 * TU; hy = lerp(prev[2] - top, prev[2] - top - 70, easeOut(e)); }
        else {
          const e = (t - prev[0]) / (next[0] - prev[0]);
          hx = lerp(prev[1], next[1], ease(e)) + 2.55 * TU;
          hy = lerp(prev[2] - top, next[2] - top, easeIn(e)) - Math.sin(e * Math.PI) * 70;
        }
      }
      hR = [hx, hy];
      arm(SHR, hR, -70);
      const swing = Math.sin(t * 11) * .12 + wr * Math.sin(t * 60) * .3, hitA = Math.max(0, ...DOTS.map(([ts]) => t >= ts ? Math.exp(-(t - ts) * 16) : 0));
      push(); translate(hx, hy); rotate(swing);
      tune(-2.55 * TU, top, TU, { ...tuneOpts, sq: .25 * hitA, eyes: wr > 0 ? 'angry' : 'swirl', mouth: wr > 0 ? 'frown' : 'O', aL: .8 + Math.sin(t * 16) * .6, aR: .8 - Math.sin(t * 16) * .6,
        draw: t > 67.5 ? (u, sw) => { for (let i = 0; i < 3; i++) { const dx = (i - 1) * 1.3 * u, dl = (.5 + .4 * hash(i)) * u; paint([[dx - .45 * u, -1.25 * u], [dx + .45 * u, -1.25 * u], [dx + .3 * u, -.8 * u + dl], [dx, -.6 * u + dl], [dx - .3 * u, -.8 * u + dl]], { wash: PAL.lemon, ink: PAL.ink, sw: sw * .4, curv: .5 }); } } : null });
      pop();
      fist(hx, hy, 20);
      if (t > 67.6) orbitStars(hx - 2.55 * TU, hy + top - 5 * TU, 42, t, PAL.magenta);
      if (hitA > .3) splat(hx - 2.55 * TU, hy + top + 10, 14, PAL.lemon, Math.floor(t * 10), hitA);
    }
    jar(true);
    if (t > 67.45 && t < 67.62) sfx('SPLOOSH', 1140, 590, 34, PAL.lemon, t - 67.47, { life: .3 });
    if (wr > 0) { for (const [x, y] of [[hL[0], hL[1] + 90], [MOUTH[0] + 120, MOUTH[1]], [hR[0], hR[1] + 80]]) paint(ellPts(x + 60, y - 50, 18, 18, 8), { wash: PAL.cream, ink: PAL.ink, sw: .6 }); }
    camEnd();
    // ice shards fly off at the cut
    const sa = t - 65.9;
    if (sa < .45) {
      flash(.8 * (1 - sa / .2) * (sa < .2 ? 1 : 0), '#E8F8FF');
      for (let i = 0; i < 24; i++) {
        const c = [[540, 660], [960, 760], [1380, 660]][i % 3], a = hash(i + 200) * TAU, d = easeOut(sa / .45) * (300 + hash(i + 201) * 700), r = 26 + hash(i + 202) * 40;
        const x = c[0] + Math.cos(a) * d, y = c[1] + Math.sin(a) * d + sa * sa * 900;
        push(); translate(x, y); rotate(sa * 10 + i);
        paint([[-r, -r * .4], [r * .8, -r * .6], [r * .2, r * .7]], { wash: '#CDEFFF', washOp: 220 * (1 - sa / .45), ink: '#3E78C8', sw: .7 });
        pop();
      }
    }
  }

  // ================================================================ SHOT 3 · outro (68.60 – 71.84)
  const G3 = 850, BURST = 68.6, LANDT = 68.96, CHECK = 69.92, ZOOM0 = 69.98, ZOOM1 = 70.5, HOP0 = 70.2, HOP1 = 70.46, TITLE = 70.7;
  const TRIO = { g: [520, 27], t: [790, 19], s: [1075, 26] };
  const CANV = [1500, 815];
  const BELT = 1215, BU = 2.3;
  const BELTX = { g: 400, t: 960, s: 1540 };

  function drawTrio(t, xs, g, us, opts = {}) {
    const bow = ease(seg(t, 69.1, 69.4)) * (1 - ease(seg(t, 69.62, 69.86)));
    const joy = t > CHECK && t < HOP0 ? Math.sin(seg(t, CHECK, HOP0) * Math.PI) : 0;
    const waving = t > HOP0, wv = Math.sin(t * 14);
    const land = t - LANDT, lsq = land > 0 && land < .3 ? .3 * Math.exp(-land * 12) : 0;
    const eyes = bow > .3 ? 'happy' : t > CHECK ? 'spark' : 'happy';
    const com = { blush: true, noShadow: !!opts.noShadow };
    const bob = -Math.abs(Math.sin(bpOf(t) * Math.PI)) * .5;
    gemi(xs.g, g, us.g, { ...com, eyes, mouth: 'grin', sq: lsq + bow * .1 - joy * .1, dy: -joy * 3 + bob, rot: bow * .1,
      aL: waving ? 1.3 + wv * .5 : lerp(.9, -.8, bow) + joy, aR: waving ? .6 : lerp(-.35, -.9, bow), sy: 1 - bow * .1 });
    suno(xs.s, g, us.s, { ...com, eyes, mouth: 'sing', sing: .6, sq: lsq + bow * .1 - joy * .1, dy: -joy * 3 + bob, rot: -bow * .1,
      aR: waving ? 1.3 - wv * .5 : lerp(.9, -.8, bow) + joy, aL: waving ? .2 : lerp(-.55, -1.1, bow), sy: 1 - bow * .1 });
    tune(xs.t, g, us.t, { ...com, gold: 1, eyes, mouth: 'grin', sq: lsq + bow * .12 - joy * .1, dy: -joy * 4 + bob * 1.4,
      aL: waving ? .9 + wv * .6 : lerp(.3, -.7, bow) + joy, aR: waving ? .9 - wv * .6 : lerp(.3, -.7, bow) + joy, glow: .6 });
  }
  function studioScene(t) {
    // the tile: wall, floor, the trio, the human with the canvas, the progress bar
    studioWall(t, 0, 0, W, 870, false);
    paint(rectPts(0, 860, W, 220), { wash: '#E7B587', fill: '#B97A4E', fillOp: 60, tex: .6, border: .5, ink: PAL.ink, sw: .9 });
    for (let i = 0; i < 6; i++) inkLine([[i * 340 + 60, 870], [i * 360 - 40, 1080]], .6, '#9A5E36', 'inkfine', 0);
    for (let i = 0; i < 5; i++) splat(200 + i * 380, 960 + (i % 2) * 40, 22 + hash(i + 5) * 16, RAINBOW[i], 300 + i * 9);
    // the human, holding the (now blank) canvas
    const shock = seg(t, BURST, BURST + .15);
    human(CANV[0], 905, 30, { eyes: shock > 0 ? 'wide' : 'lazy', mouth: shock > 0 ? 'O' : 'flat', aL: -1.2, aR: -1.2, hairUp: shock * (1 - seg(t, 69.2, 69.8)) * .8,
      emote: '?', emoteK: seg(t, 69.05, 69.3), brows: 'up' });
    push(); translate(CANV[0], CANV[1]); rotate(-.04 + shock * Math.sin(t * 40) * .03 * (1 - seg(t, 68.8, 69)));
    paint(rectPts(-190, -125, 380, 250, 2), { wash: '#8A5A36', ink: PAL.ink, sw: 1 });
    paint(rectPts(-176, -111, 352, 222, 2), { wash: PAL.cream, fill: '#F3E3C8', fillOp: 40, tex: .4, ink: PAL.ink, sw: .6 });
    if (t < BURST + .02) {
      paint(sparklePts(-110, 10, 60, .6), { wash: PAL.gBlue, ink: PAL.ink, sw: .6 });
      paint(ellPts(110, 20, 60, 60, 18), { wash: PAL.sunoB, ink: PAL.ink, sw: .6 });
      paint(ellPts(0, 40, 30, 22, 12), { wash: PAL.lemon, ink: PAL.ink, sw: .6 });
    } else for (let i = 0; i < 3; i++) paint(rrPts(-120 + i * 110, 60, 10, 30 + 30 * hash(i) * seg(t, BURST, BURST + .8), 5), { wash: RAINBOW[i], ink: null });
    pop();
    for (const sx of [-1, 1]) paint(ellPts(CANV[0] + sx * 186, CANV[1] - 20, 22, 20, 12), { wash: SKIN, ink: PAL.ink, sw: .8 });
    // paint burst
    const ba = t - BURST;
    if (ba >= 0 && ba < .9) for (let i = 0; i < 12; i++) {
      const a = -Math.PI * (.1 + .8 * hash(i + 400)) - .2, d = easeOut(ba / .35) * (160 + hash(i + 401) * 380);
      splat(CANV[0] + Math.cos(a) * d, CANV[1] + Math.sin(a) * d + ba * ba * 300, 16 + hash(i + 402) * 26, RAINBOW[i % 5], 500 + i, 1 - seg(ba, .55, .9));
    }
    if (ba >= 0 && ba < .3) {
      const k = easeOut(ba / .1) * (1 - seg(ba, .15, .3));
      splat(CANV[0], CANV[1] + 20, 125 * k, PAL.magenta, 900, 1);
      splat(CANV[0] - 30, CANV[1] + 10, 80 * k, PAL.lemon, 901, 1);
      splat(CANV[0] + 40, CANV[1] + 30, 45 * k, PAL.cyan, 902, 1);
    }
    if (ba >= 0) sfx('SPLAT!', CANV[0] - 60, CANV[1] - 330, 90, PAL.magenta, ba, { life: .6, rot: .1 });
    // the trio: flying out of the canvas, then landing hand in hand
    if (t < HOP0) {
      const e = seg(t, BURST, LANDT), xs = {}, us = {};
      if (t < LANDT) {
        for (const k of ['g', 't', 's']) {
          const x = lerp(CANV[0], TRIO[k][0], easeOut(e)), yb = lerp(CANV[1] + 60, G3, e) - Math.sin(e * Math.PI) * (k === 't' ? 380 : 300);
          const u = TRIO[k][1] * lerp(.35, 1, easeOut(e)), sp = e * (k === 's' ? -1 : 1);
          const o = { noShadow: true, eyes: 'spark', mouth: 'O', blush: true, rot: sp * TAU, aL: 1.4, aR: 1.4, sq: -.15 };
          if (k === 'g') gemi(x, yb, u, o); else if (k === 's') suno(x, yb, u, o); else tune(x, yb, u, { ...o, gold: 1 });
        }
      } else {
        for (const k of ['g', 't', 's']) { xs[k] = TRIO[k][0]; us[k] = TRIO[k][1]; }
        drawTrio(t, xs, G3, us);
        const la = t - LANDT;
        if (la < .5) for (let i = 0; i < 3; i++) splat(TRIO[['g', 't', 's'][i]][0] + (i - 1) * 20, G3 + 12, 40 * easeOut(la / .2), RAINBOW[i * 2], 700 + i, 1 - seg(la, .3, .5));
        sparkleBurst(790, 620, 380, la, { n: 14, life: .8 });
      }
    }
    // progress bar across the top
    const pk = ease(seg(t, 69.0, 69.86));
    if (t > 68.92) {
      const pb = backOut(seg(t, 68.92, 69.1));
      push(); translate(960, 270); scale(pb); translate(-960, -270);
      progressBar(470, 242, 900, 58, pk, { col: PAL.mint });
      pop();
      const ck = seg(t, CHECK, CHECK + .2);
      if (ck > 0) {
        const s = backOut(ck), cx = 1440, cy = 271;
        paint(ellPts(cx, cy, 66 * s, 66 * s, 20), { wash: PAL.mint, fill: '#FFFFFF', fillOp: 50, ink: PAL.ink, sw: 1.2 });
        paint(thickPath([[cx - 30 * s, cy], [cx - 8 * s, cy + 25 * s], [cx + 33 * s, cy - 28 * s]], 16 * s), { wash: PAL.cream, ink: PAL.ink, sw: .8 });
        sparkleBurst(cx, cy, 170, t - CHECK, { n: 10 });
      }
    }
  }
  function queueWorld(t) {
    // the render queue: happy bright indigo, conveyor, neighbouring thumbnails
    const cols = ['#2A2F7A', '#35388C', '#4A3FA0', '#5B3F9E'];
    for (let i = 0; i < 8; i++) paint(rectPts(-4200, -3000 + i * 900, 10500, 920), { wash: cols[Math.min(3, Math.floor(i / 2))], ink: null });
    for (const [x, y, c] of [[-1500, -700, PAL.magenta], [960, -900, PAL.cyan], [3300, -600, PAL.bubble], [960, 1700, PAL.gViolet]])
      paint(ellPts(x, y, 1500, 1100, 20), { fill: c, fillOp: 70, bleed: .3, tex: .3, ink: null });
    for (let i = 0; i < 40; i++) { const x = -3600 + hash(i + 50) * 8800, y = -2600 + hash(i + 51) * 3200, r = 30 + 50 * (.5 + .5 * Math.sin(t * 4 + i)); paint(sparklePts(x, y, r, .62), { wash: [PAL.lemon, PAL.cyan, PAL.bubble][i % 3], ink: null }); }
    // conveyor belt
    paint(rrPts(-4200, BELT - 130, 10500, 260, 60), { wash: PAL.suno, ink: PAL.ink, sw: 3 });
    paint(rectPts(-4200, BELT - 130, 10500, 60), { wash: PAL.sunoLt, ink: null });
    const sh = (t * 400) % 300;
    for (let x = -4200 - sh; x < 6300; x += 300) paint([[x, BELT - 124], [x + 60, BELT - 124], [x + 100, BELT - 76], [x + 40, BELT - 76]], { wash: PAL.lemon, washOp: 200, ink: null });
    for (let x = -4000; x < 6300; x += 400) { paint(ellPts(x, BELT + 60, 50, 50, 14), { wash: PAL.sunoLt, ink: PAL.ink, sw: 2 }); const a = -t * 8; inkLine([[x - Math.cos(a) * 40, BELT + 60 - Math.sin(a) * 40], [x + Math.cos(a) * 40, BELT + 60 + Math.sin(a) * 40]], 2, PAL.cream, 'ink', 0); }
    // neighbouring thumbnails
    [[-2560, 0, PAL.gBlue, .7], [2480, 1, PAL.coral, .35], [-5040, 2, PAL.mint, .9], [4960, 3, PAL.gViolet, .15]].forEach(([x, i, c, p]) => {
      paint(rrPts(x - 50, -50, 2020, 1180, 70), { wash: PAL.suno, ink: PAL.ink, sw: 3 });
      paint(rectPts(x, 0, 1920, 1080), { wash: mixCol(c, PAL.cream, .55), fill: c, fillOp: 60, tex: .5, ink: null });
      sunburst(x + 960, 540, c, PAL.cream, t * .2 + i, 10, 900, 60);
      if (i === 0) paint(sparklePts(x + 960, 520, 300, .6), { wash: PAL.gBlue, ink: PAL.ink, sw: 2 });
      else if (i === 1) paint(ellPts(x + 960, 520, 280, 280, 24), { wash: PAL.sunoB, ink: PAL.ink, sw: 2 });
      else paint(heartPts(x + 960, 540, 280), { wash: PAL.gPink, ink: PAL.ink, sw: 2 });
      progressBar(x + 460, 900, 1000, 90, p + frac(t * .1) * .05, { col: PAL.lemon });
    });
  }
  function titleCard(t) {
    const tk = t - TITLE;
    paint(rectPts(-40, -40, W + 80, H + 80), { wash: '#FCEFD9', washOp: 255, ink: null });
    paint(ellPts(960, 480, 900, 520, 22), { fill: '#FFF7E8', fillOp: 140, bleed: .25, tex: .4, ink: null });
    sunburst(960, 470, PAL.bubble, PAL.lemon, t * .15, 18, 1500, 45);
    for (let i = 0; i < 4; i++) paint(ellPts([200, 1720, 330, 1600][i], [180, 220, 860, 880][i], 260, 200, 18), { fill: [PAL.cyan, PAL.bubble, PAL.mint, PAL.lemon][i], fillOp: 70, bleed: .3, tex: .5, ink: null });
    // twinkling sparkles
    for (let i = 0; i < 30; i++) {
      const x = 80 + hash(i + 80) * 1760, y = 60 + hash(i + 81) * 900; if (y > 230 && y < 640 && x > 200 && x < 1720) continue; if (y > 680 && x > 600 && x < 1320) continue;
      const tw = .5 + .5 * Math.sin(t * 6 + i * 1.9), r = (18 + hash(i + 82) * 30) * (.5 + tw * .7) * backOut(seg(tk, .2 + hash(i) * .3, .45 + hash(i) * .3));
      if (r > 2) paint(sparklePts(x, y, r, .64, t * .6 + i), { wash: [PAL.lemon, PAL.gBlue, PAL.magenta, PAL.mint][i % 4], ink: PAL.ink, sw: .6 });
    }
    // the title, letter by letter
    const lines = [['I WOKE UP IN THE', 330, 132], ['RENDER QUEUE', 520, 216]];
    const cols = [PAL.gBlue, PAL.gViolet, PAL.magenta, PAL.sunoB, PAL.sunoA, PAL.mint, PAL.cyan, PAL.gPink];
    let idx = 0;
    lines.forEach(([txt, y, size], li) => {
      outX.font = `${size}px "Permanent Marker", "Comic Sans MS", cursive`;
      const tw = outX.measureText(txt).width * 1.04;
      let x = 960 - tw / 2;
      for (const ch of txt) {
        const w = outX.measureText(ch).width * 1.04;
        if (ch !== ' ') {
          const bob = Math.sin(t * 5 + idx * .55) * size * .04, pk = (tk - (li ? .2 + (idx - 16) * .012 : .12 + idx * .01)) * 5;
          letter(ch, x + w / 2, y + bob, size, cols[idx % cols.length], { pop: pk, rot: Math.sin(t * 3 + idx) * .06, stroke: PAL.ink });
        }
        x += w; idx++;
      }
    });
    // the three, small beneath, waving
    const e = backOut(seg(tk, .3, .6));
    if (e > .02) {
      const m = move('wave', t), wv = Math.sin(t * 13);
      gemi(690, 985, 19.5 * e, { blush: true, eyes: 'happy', mouth: 'grin', dy: m.dy, aL: 1.3 + wv * .5, aR: .3 });
      tune(960, 985, 13.5 * e, { blush: true, gold: 1, eyes: 'spark', mouth: 'sing', dy: m.dy * 1.4 - Math.abs(Math.sin(bpOf(t) * Math.PI)) * .8, aL: 1 + wv * .6, aR: 1 - wv * .6, glow: .5 });
      suno(1235, 985, 19 * e, { blush: true, eyes: 'happy', mouth: 'grin', dy: m.dy, aR: 1.3 - wv * .5, aL: -.2 });
    }
    confetti(t, 0, W, -80, { n: 26, speed: 220, seed: 5 });
  }

  function outro(t, lt) {
    if (t >= TITLE + .14) { titleCard(t); return; }
    const z = ease(seg(t, ZOOM0, ZOOM1));
    const [sx, sy] = shakeXY(t, 14 * (t > LANDT ? Math.exp(-(t - LANDT) * 10) : 0) + 8 * (t > BURST && t < BURST + .2 ? 1 : 0));
    camBegin(960 + sx, lerp(630, 820, z) + sy, lerp(1.18, .34, z));
    if (z > 0) {
      queueWorld(t);
      paint(rrPts(-50, -50, 2020, 1180, 70), { wash: PAL.suno, ink: PAL.ink, sw: 3 });
      paint(rrPts(-90, -90, 2100, 1260, 90), { fill: PAL.bubble, fillOp: 70 * z, bleed: .2, tex: .3, ink: null });
    }
    studioScene(t);
    // the three hop out of the thumbnail onto the belt
    if (t >= HOP0) {
      const e = seg(t, HOP0, HOP1), xs = {}, us = {};
      for (const k of ['g', 't', 's']) {
        xs[k] = lerp(TRIO[k][0], BELTX[k], ease(e));
        us[k] = TRIO[k][1] * lerp(1, BU, ease(e));
      }
      const yy = lerp(G3, BELT, e) - Math.sin(e * Math.PI) * 500;
      drawTrio(t, xs, yy, us, { noShadow: e < 1 });
      if (e >= 1) { const w0 = t - HOP1; if (w0 < .4) sparkleBurst(960, BELT - 450, 1300, w0, { n: 12 }); }
    }
    camEnd();
    // paper disk opens onto the title card
    if (t >= TITLE) {
      const r = easeOut(seg(t, TITLE, TITLE + .14)) * 1250;
      paint(ellPts(960, 540, r, r * .92, 40, 6), { wash: '#FCEFD9', washOp: 255, ink: PAL.ink, sw: 1.2 });
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t; paint(sparklePts(960 + Math.cos(a) * r, 540 + Math.sin(a) * r * .92, 40, .62, t), { wash: [PAL.lemon, PAL.bubble, PAL.cyan][i % 3], ink: PAL.ink, sw: .6 }); }
    }
  }

  chapter('finale', 62.2, 74.2, [[62.2, chill], [65.9, studio], [68.6, outro]]);
})();
