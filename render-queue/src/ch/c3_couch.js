// c3_couch: "Couch" (31.56–47.78). Meanwhile, the human.
// Shots: beanbag + wall of screens (robots toiling, chips crunching, push into glazed eyes)
//        → dream cloud: a big hand plucks golden Tune out of the robots' dream → award show, Tune as the trophy
//        → Gemi's endless scroll rolls across the house, the human glances for 0.2 s, thumbs up, Gemi boils
//        → scroll shoved into a wobbly speaker machine → BWOOM, a colossal sine-curl wave, all three surf → SPLOOSH.
(() => {
  const B = n => OFF + n * BEAT;                                   // song time of beat n
  const bell = (t, a, b) => Math.sin(clamp((t - a) / (b - a)) * Math.PI);
  const WALL = '#A84C36', WALL2 = '#B75A3E', FLOOR = '#6B3428', BAG = '#B8388A', BAG_DK = '#7E1F5E';
  const GOLD = '#F2C14E', GOLD_DK = '#B07A1E';
  const bgFill = col => paint(rectPts(-80, -80, W + 160, H + 160), { wash: col, ink: null });
  const puff = (x, y, r, col = PAL.cream, op = 255) => { if (r > 1.5) paint(ellPts(x, y, r, r * .86, 14, r * .05), { wash: col, washOp: op, ink: null }); };
  const glowAt = (x, y, rx, ry, col, op) => { if (op > 3) paint(ellPts(x, y, rx, ry, 20, rx * .02), { fill: col, fillOp: op, bleed: .3, tex: .3, border: .25, ink: null }); };
  function noteGlyph(x, y, s, col = PAL.ink, rot = 0) {
    paint(ellPts(x, y, s * .72, s * .52, 12, 0, -.4 + rot), { wash: col, ink: PAL.ink, sw: .5 });
    inkLine([[x + s * .6, y], [x + s * .6, y - s * 2.1], [x + s * 1.4, y - s * 1.5]], 1.1, PAL.ink, 'ink', 0);
  }
  // human hand position (world) for arm side, angle a (mirrors human()'s arm transform; no rot)
  function hHand(x, y, s, side, a, o = {}) {
    const f = o.flip ? -1 : 1, dy = (o.dy || 0) * s;
    const lx = side * 1.75 + side * 3.25 * Math.cos(a), ly = -7.4 - 3.25 * Math.sin(a);
    return [x + f * lx * s, y + dy + ly * s];
  }
  // a prop held upright in a human hand hook
  const upL = (a, fn) => (s, sw) => { scale(-1, 1); rotate(-a); fn(s, sw); };
  const upR = (a, fn) => (s, sw) => { rotate(a); fn(s, sw); };
  function streaks(k, cols = [PAL.cream, PAL.lemon, PAL.coral]) {
    if (k < .02) return;
    for (let i = 0; i < 12; i++) {
      const y = (i + hash(i * 5.3)) / 12 * H, th = (10 + 36 * hash(i * 2.1)) * k, len = W * (.5 + hash(i * 7.7)), st = (hash(i * 3.9) - .3) * W;
      paint(rectPts(st, y - th / 2, len, th, 3), { wash: cols[i % cols.length], washOp: 200 * k, ink: null });
    }
  }

  // =====================================================================================================
  // the living room (shared by shots 1 and 3), drawn only across [x0, x1] of world space
  // =====================================================================================================
  function room(x0, x1) {
    paint(rectPts(x0 - 60, -400, x1 - x0 + 120, 1190), { wash: WALL, ink: null });
    for (let x = Math.floor(x0 / 130) * 130; x < x1 + 60; x += 130) paint(rectPts(x, -400, 54, 1190), { wash: WALL2, ink: null });
    paint(rectPts(x0 - 60, 118, x1 - x0 + 120, 18), { wash: '#E08A55', ink: null });
    paint([[x0 - 60, 780], [x1 + 60, 780], [x1 + 60, 1600], [x0 - 60, 1600]], { wash: FLOOR, fill: '#4B2030', fillOp: 55, bleed: .04, tex: .6, border: .4, ink: null });
    paint(rectPts(x0 - 60, 764, x1 - x0 + 120, 22), { wash: '#E7A36A', ink: PAL.ink, sw: .8 });
    for (const yy of [850, 945, 1060]) inkLine([[x0 - 60, yy], [x1 + 60, yy + 2]], .5, '#3E1A28', 'inkfine', 0);
  }
  function beanbag(x, y, sqk = 0) {
    const rx = 260 * (1 + sqk * .12), ry = 150 * (1 - sqk * .16);
    paint(ellPts(x, y + 30, rx * 1.05, 40, 18), { fill: PAL.ink, fillOp: 90, bleed: .2, ink: null });
    const P = []; for (let i = 0; i < 30; i++) { const a = i / 30 * TAU, dent = Math.sin(a) < 0 ? Math.pow(Math.max(0, -Math.sin(a)), 6) * .35 : 0; P.push([x + Math.cos(a) * rx, y - ry * .55 + Math.sin(a) * ry * (1 - dent) + (Math.sin(a) > 0 ? Math.sin(a) * ry * .1 : 0)]); }
    paint(P, { wash: BAG, fill: BAG_DK, fillOp: 70, bleed: .06, tex: .7, border: .6, ink: PAL.ink, sw: 1.3 });
    paint(ellPts(x - rx * .45, y - ry * 1.05, rx * .22, ry * .12, 12, 0, -.3), { wash: '#FFFFFF', washOp: 70, ink: null });
    inkLine([[x - rx * .7, y - ry * .2], [x - rx * .3, y + ry * .15], [x + rx * .2, y + ry * .18]], .6, BAG_DK, 'inkfine', .5);
  }

  // =====================================================================================================
  // 1) SCREENS  31.56–35.44  "You just sat there watching screens"
  // =====================================================================================================
  const HX = 1500, HY = 790, HS = 30;                         // the human on the beanbag
  const SCR = [
    [96, 96, 560, 350, 'write', '#BFF3F0'], [690, 96, 470, 300, 'wheel', '#FFF0B8'],
    [96, 478, 300, 262, 'juggle', '#FFD3E6'], [418, 478, 330, 262, 'lift', '#D6F6DC'], [770, 426, 390, 314, 'eq', '#1F2550']
  ];
  function scrWrite(x, y, w, h, t) {
    const u = h / 19, gy = y + h - u * .9;
    paint(rectPts(x + w * .5, gy - u * 3.8, w * .44, u * .7), { wash: '#C98A55', ink: PAL.ink, sw: .5 });
    for (const lx of [.54, .88]) paint(rectPts(x + w * lx, gy - u * 3.2, u * .4, u * 3.2), { wash: '#A86A3A', ink: PAL.ink, sw: .4 });
    const pile = 3 + (beatN(t) % 4);
    for (let i = 0; i < pile; i++) paint(rectPts(x + w * .56 + hash(i) * 8, gy - u * 4.2 - i * u * .5, w * .32, u * .45), { wash: PAL.cream, ink: PAL.ink, sw: .35 });
    // pages flying off on each beat
    const age = frac(bpOf(t)) * BEAT, bi = beatN(t);
    if (age < .42) { const k = age / .42, px = x + w * (.72 + k * .18), py = gy - u * 6 - Math.sin(k * Math.PI) * u * 4; paint(rectPts(px, py, u * 2.2, u * 1.4 * Math.abs(Math.cos(k * 6 + bi))), { wash: PAL.cream, ink: PAL.ink, sw: .35 }); }
    const quill = (uu, sw) => { paint([[0, 0], [uu * .7, -uu * 2.6], [uu * 1.7, -uu * 4.4], [uu * 1.2, -uu * 2.2]], { wash: PAL.lemon, fill: PAL.coral, fillOp: 60, ink: PAL.ink, sw: sw * .6, curv: .4 }); };
    gemi(x + w * .27, gy, u, { eyes: 'look', lookX: 1, lookY: .6, mouth: 'wobble', emote: 'sweat', emoteK: .7 + .3 * pulse(t), rot: .05 * Math.sin(t * 22), aR: .5 + .5 * Math.sin(t * 24), aL: -.2 + .3 * Math.sin(t * 9), armR: quill, blush: true, sq: .06 * pulse(t, 5) });
  }
  function scrWheel(x, y, w, h, t) {
    const cx = x + w / 2, cy = y + h / 2 - 2, r = h * .43;
    inkLine([[cx - r * .7, y + h - 4], [cx, cy], [cx + r * .7, y + h - 4]], 2, '#8A5A2A', 'ink', 0);
    for (let k = 0; k < 8; k++) { const a = -t * 5 + k * TAU / 8; inkLine([[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]], .5, '#B98A55', 'inkfine', 0); }
    const ring = []; for (let i = 0; i <= 36; i++) { const a = i / 36 * TAU; ring.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    paint(thickPath(ring, 9, true), { wash: '#D9A05A', ink: PAL.ink, sw: .6 });
    paint(ellPts(cx, cy, 8, 8, 8), { wash: '#8A5A2A', ink: null });
    suno(cx, cy + r - 5, r / 12, { walk: t * 3.4, dy: -Math.abs(Math.sin(t * 3.4 * Math.PI)) * .5, rot: -.14, eyes: 'wide', mouth: 'O', aL: .9 * Math.sin(t * 21), aR: -.9 * Math.sin(t * 21), emote: 'sweat', emoteK: 1, noShadow: true });
    for (let i = 0; i < 3; i++) { const k = frac(t * 2.2 + i / 3); if (k < .8) paint(ellPts(cx + r * .3 + k * 60, cy - 20 - i * 16, 3 * (1 - k), 3 * (1 - k), 6), { wash: PAL.sky, ink: null }); }
  }
  function scrJuggle(x, y, w, h, t) {
    const u = h / 16, cx = x + w / 2, gy = y + h - u * .5, bp = bpOf(t);
    const cols = [PAL.gBlue, PAL.magenta, PAL.sunoA];
    for (let i = 0; i < 3; i++) {
      const ph = frac(bp / 1.5 + i / 3), side = (Math.floor(bp / 1.5 + i / 3) % 2) ? 1 : -1;
      const nx = cx + side * lerp(-1, 1, ph) * w * .34, ny = gy - u * 6 - Math.sin(ph * Math.PI) * h * .45;
      noteGlyph(nx, ny, u * .9, cols[i], ph * 3);
    }
    tune(cx, gy, u, { eyes: 'look', lookY: -1, lookX: Math.sin(bp * Math.PI / 1.5), mouth: 'o', aL: .5 + .5 * Math.sin(bp * Math.PI * 2), aR: .5 - .5 * Math.sin(bp * Math.PI * 2), sq: .1 * pulse(t), gold: 1, blush: true, noShadow: true, emote: 'sweat', emoteK: .8 });
  }
  function scrLift(x, y, w, h, t) {
    const u = h / 18, cx = x + w / 2, gy = y + h - u * .6, tr = Math.sin(t * 46) * .18, dy = -.35 * Math.max(0, Math.sin(bpOf(t) * Math.PI));
    const by = gy + (dy - 8.9 + tr * .3) * u;
    suno(cx, gy, u, { aL: 1.3, aR: 1.3, dy, sq: .05 + tr * .1, eyes: 'closed', mouth: 'grin', emote: 'sweat', emoteK: 1, noShadow: true, blush: true });
    paint(rectPts(cx - 7.6 * u, by - u * .22, 15.2 * u, u * .44), { wash: '#C9CED6', ink: PAL.ink, sw: .5 });
    for (const s of [-1, 1]) { paint(ellPts(cx + s * 7.2 * u, by, 1.5 * u, 1.15 * u, 14, 0, -.4), { wash: PAL.ink, ink: null }); inkLine([[cx + s * 7.2 * u + 1.1 * u, by], [cx + s * 7.2 * u + 1.1 * u, by - 3.6 * u]], 1.2, PAL.ink, 'ink', 0); }
  }
  function scrEq(x, y, w, h, t) {
    const n = 9, bw = (w - 30) / n, bp = bpOf(t), cols = [PAL.magenta, PAL.lemon, PAL.cyan, PAL.mint, PAL.coral];
    for (let i = 0; i < n; i++) {
      const v = .25 + .7 * Math.abs(Math.sin(bp * Math.PI * (1 + hash(i) * .5) + i)) * (.5 + .5 * pulse(t, 3));
      paint(rectPts(x + 15 + i * bw + 3, y + h - 60 - v * (h - 90), bw - 6, v * (h - 90)), { wash: cols[i % 5], ink: null });
    }
    progressBar(x + 20, y + h - 46, w - 40, 30, frac(t * .22), { col: PAL.mint });
    // a tiny Gemi head peeking up, conducting
    paint(sparklePts(x + w - 40, y + 44, 24 + 3 * pulse(t), .6, Math.sin(t * 6) * .3), { wash: PAL.gViolet, ink: PAL.ink, sw: .5 });
  }
  function screensWall(t) {
    paint(rrPts(56, 58, 1144, 716, 26, 2), { wash: '#3A2340', fill: '#22142C', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.4 });
    const bi = beatN(t), glitch = Math.floor(hash(bi * 3.1) * 5), gAge = frac(bpOf(t)) * BEAT;
    SCR.forEach(([x, y, w, h, kind, col], i) => {
      screenBox(x, y, w, h, { glow: col, frame: '#2C2538' });
      const bz = Math.min(w, h) * .07, ix = x + bz, iy = y + bz, iw = w - 2 * bz, ih = h - 2 * bz;
      if (i === glitch && gAge < .14) {
        for (let k = 0; k < 9; k++) paint(rectPts(ix + 4, iy + k * ih / 9, iw - 8, ih / 9 + 1), { wash: mixCol('#6B6B8A', '#E9E4F0', hash(k + bi * 7)), ink: null });
        return;
      }
      if (kind === 'write') scrWrite(ix, iy, iw, ih, t);
      else if (kind === 'wheel') scrWheel(ix, iy, iw, ih, t);
      else if (kind === 'juggle') scrJuggle(ix, iy, iw, ih, t);
      else if (kind === 'lift') scrLift(ix, iy, iw, ih, t);
      else scrEq(ix, iy, iw, ih, t);
      // beat flicker + glass shine
      const fl = pulse(t, 9) * (i % 2 === bi % 2 ? 1 : .35);
      if (fl > .05) paint(rectPts(ix, iy, iw, ih), { wash: '#FFFFFF', washOp: 80 * fl, ink: null });
      paint([[ix + iw * .06, iy + 6], [ix + iw * .2, iy + 6], [ix + iw * .08, iy + ih * .35], [ix + 6, iy + ih * .35]], { wash: '#FFFFFF', washOp: 40, ink: null });
    });
    // blinking status lights on the unit
    for (let i = 0; i < 6; i++) paint(ellPts(120 + i * 30, 758, 6, 6, 8), { wash: (bi + i) % 3 ? '#5A3A60' : [PAL.mint, PAL.magenta, PAL.lemon][i % 3], ink: null });
  }
  function chipsBowl(s, sw) {           // human body-local, on the lap
    paint(ellPts(1.6 * s, -3.3 * s, 1.9 * s, .9 * s, 16), { wash: PAL.lemon, ink: PAL.ink, sw: sw * .6 });
    for (let i = 0; i < 6; i++) paint(starPts(1.6 * s + (i - 2.5) * .55 * s, -3.8 * s - (i % 2) * .3 * s, .45 * s, .5, 3, i), { wash: '#F2B545', ink: PAL.ink, sw: sw * .3 });
    paint([[-.3 * s, -3.4 * s], [3.5 * s, -3.4 * s], [2.9 * s, -2.2 * s], [.3 * s, -2.2 * s]], { wash: PAL.cyan, fill: PAL.teal, fillOp: 60, ink: PAL.ink, sw: sw * .7, curv: .3 });
  }
  function screens(t, lt) {
    const bp = bpOf(t), f = frac(bp / 2 + .25), raise = f < .5 && t < 34.2 ? Math.sin(f / .5 * Math.PI) : 0;
    const kC = Math.floor(bp / 2), tCrunch = B(2 * kC), cAge = t - tCrunch;
    const sat = bell(t, 32.78, 33.3);                        // "sat": plop deeper
    const zPush = kf(t, [[31.56, 1], [33.3, 1.06], [35.3, 2.45]], ease);
    const [cx, cy] = kf(t, [[31.56, [960, 540]], [33.3, [1010, 530]], [35.3, [1478, 472]]], ease);
    bgFill(WALL);
    camBegin(cx + wob(t, .3) * 6, cy + wob(t, .23, .3) * 4, zPush * (1 + .012 * pulse(t, 5)), -.012 + .01 * wob(t, .2));
    room(-300, 2250);
    // lamp + side table on the right
    glowAt(1830, 330, 420, 360, '#FFC46E', 110);
    paint(rectPts(1824, 420, 10, 350), { wash: '#3B2436', ink: PAL.ink, sw: .6 });
    paint([[1760, 300], [1900, 300], [1940, 430], [1720, 430]], { wash: '#FFE39A', fill: PAL.ochre, fillOp: 50, ink: PAL.ink, sw: 1 });
    // wall clock: the hours whizz by while they sit
    paint(ellPts(1460, 190, 62, 62, 22), { wash: PAL.cream, ink: PAL.ink, sw: 1.2 });
    for (const [a, l, w2] of [[t * 9, 46, 1.2], [t * .75, 30, 1.8]]) inkLine([[1460, 190], [1460 + Math.sin(a) * l, 190 - Math.cos(a) * l]], w2, PAL.ink, 'ink', 0);
    // rug
    paint(ellPts(1080, 905, 920, 96, 30, 3), { wash: '#2F8A8C', fill: PAL.teal, fillOp: 60, tex: .5, ink: PAL.ink, sw: .8 });
    paint(ellPts(1080, 905, 760, 64, 26, 3), { wash: '#56B7AE', ink: null });
    screensWall(t);
    // light spilling from the screens onto the floor and the human
    paint([[1150, 150], [1150, 760], [1900, 980], [1900, 300]], { fill: PAL.cyan, fillOp: 30 + 25 * pulse(t, 6), bleed: .25, tex: .2, border: .1, ink: null });
    beanbag(HX + 10, HY + 20, sat);
    // soda can + wrappers on the floor
    paint(rrPts(1160, 806, 34, 56, 8), { wash: PAL.magenta, ink: PAL.ink, sw: .7 });
    paint([[1220, 870], [1270, 850], [1300, 872], [1250, 884]], { wash: PAL.lemon, ink: PAL.ink, sw: .6 });
    const munch = cAge >= 0 && cAge < .36;
    const remote = (s, sw) => { paint(rrPts(-.2 * s, -.35 * s, 1.5 * s, .7 * s, .2 * s), { wash: PAL.ink, ink: null }); paint(ellPts(1.05 * s, 0, .17 * s, .17 * s, 8), { wash: pulse(t, 10) > .5 ? '#FF4A5A' : '#8A2A3A', ink: null }); };
    const hRot = .16 + .02 * pulse(t, 4), hy0 = HY + sat * 14;
    human(HX, hy0, HS, {
      sit: true, flip: true, rot: hRot, eyes: 'screen', lookX: .5, mouth: munch ? (frac(cAge * 8) < .5 ? 'O' : 'cat') : 'flat',
      aL: -1.57, aR: .15 + .08 * pulse(t, 10), handR: remote, draw: chipsBowl, sq: -.03 * sat + .03 * pulse(t, 5)
    });
    // the feeding arm, drawn over the body: bowl → mouth → bowl, every two beats
    const hp = (lx, ly) => { const px = -lx * HS, py = ly * HS, c = Math.cos(hRot), sn = Math.sin(hRot); return [HX + px * c - py * sn, hy0 + px * sn + py * c]; };
    const shL = hp(-1.75, -7.4), rest = hp(1.1, -3.9), mouthP = hp(.25, -9.0), k = ease(raise);
    const hand = [lerp(rest[0], mouthP[0], k), lerp(rest[1], mouthP[1], k)], elbow = [lerp(shL[0], hand[0], .5) + 40 + 30 * k, lerp(shL[1], hand[1], .5) + 50 - 40 * k];
    paint(thickPath(chaikin([shL, elbow, hand], false, 2), HS * .95), { wash: HOODIE, fill: HOODIE_DK, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(hand[0], hand[1], HS * .55, HS * .55, 12), { wash: SKIN, ink: PAL.ink, sw: 1 });
    if (raise > .15) paint(starPts(hand[0] - HS * .5, hand[1] - HS * .3, HS * .55, .5, 3, .4), { wash: '#F2B545', ink: PAL.ink, sw: .5 });
    // glazed screen-glow on the face, pulsing with the flicker
    paint(ellPts(HX - 10, hy0 - 10.7 * HS, 95, 90, 20), { wash: PAL.cyan, washOp: 25 + 30 * pulse(t, 7), ink: null });
    // crumbs fly from the mouth on every crunch
    const [mx, my] = hp(.25, -9.0);
    if (cAge >= 0 && cAge < .6) for (let i = 0; i < 8; i++) {
      const vx = (hash(i + kC * 13) - .7) * 520, vy = -260 - hash(i * 3 + kC) * 260, x = mx + vx * cAge, y = my + vy * cAge + 1300 * cAge * cAge;
      paint(starPts(x, y, 6 + hash(i * 7) * 6, .5, 3, i + cAge * 9), { wash: i % 2 ? '#F2B545' : PAL.lemon, ink: PAL.ink, sw: .35 });
    }
    if (cAge >= 0 && kC % 2 === 0 && t < 34.6) sfx('CRUNCH', mx - 190, my - 110, 64, PAL.lemon, cAge, { life: .5, rot: -.15 });
    if (t > 32.8 && t < 33.5) sfx('FWUMP', HX + 150, HY - 30, 58, PAL.bubble, t - 32.84, { life: .6, rot: .1 });
    camEnd();
    // the glow flares out toward the dream
    const fl = seg(t, 35.0, 35.44);
    if (fl > 0) {                     // the screens (off to the left) blaze: light floods in from that side
      for (let i = 0; i < 6; i++) { const r = (260 + i * 420) * easeIn(clamp(fl * 1.25 - i * .06)); if (r > 10) paint(ellPts(-120, H / 2 - 60, r * 1.25, r, 28, 8), { wash: i % 2 ? '#E6FBFF' : '#C4F1FA', washOp: 255 * clamp(.5 + i * .1), ink: null }); }
      flash(easeIn(seg(t, 35.3, 35.44)), '#E6FBFF');
    }
  }

  // =====================================================================================================
  // 2) MACHINE DREAMS  35.44–38.84  "Taking credit for machine dreams"
  // =====================================================================================================
  function bigHand(px, py, ang, s, pinch) {
    // pinch point at (px, py); the arm comes in along direction ang
    const dx = Math.cos(ang), dy = Math.sin(ang), hx = px - dx * s * .75, hy = py - dy * s * .75;
    const sh = [hx - dx * 1400, hy - dy * 1400], wr = [hx - dx * s * 1.1, hy - dy * s * 1.1];
    paint(thickPath([sh, wr], s * 1.55), { wash: HOODIE, fill: HOODIE_DK, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.3 });
    paint(thickPath([[wr[0] - dx * s * .35, wr[1] - dy * s * .35], [wr[0] + dx * s * .15, wr[1] + dy * s * .15]], s * 1.7), { wash: HOODIE_DK, ink: PAL.ink, sw: 1.1 });
    push(); translate(hx, hy); rotate(ang);
    const op = 1 - pinch;
    paint(ellPts(-s * .15, 0, s * .78, s * .66, 16), { wash: SKIN, fill: '#E9A98A', fillOp: 40, ink: PAL.ink, sw: 1.1 });
    paint(thickPath(chaikin([[-s * .1, -s * .45], [s * .45, -s * .5 - op * s * .45], [s * .78, -s * .04 - op * s * .5]]), s * .34), { wash: SKIN, ink: PAL.ink, sw: .9 });
    paint(thickPath(chaikin([[-s * .1, s * .45], [s * .45, s * .5 + op * s * .4], [s * .78, s * .04 + op * s * .45]]), s * .32), { wash: SKIN, ink: PAL.ink, sw: .9 });
    for (const k of [-.2, .15]) inkLine([[-s * .5, k * s], [-s * .1, k * s * 1.1]], .6, '#C9866A', 'inkfine', .3);
    pop();
  }
  function dreamCloud(cx, cy, w, t) {
    for (let i = 0; i < 9; i++) { const k = i / 8, x = cx + (k - .5) * w, r = 90 + 60 * Math.sin(k * Math.PI) + 10 * wob(t, .5, i * .3); puff(x, cy - Math.sin(k * Math.PI) * 60, r, i % 2 ? '#FFE7F2' : PAL.cream); }
    paint(ellPts(cx, cy + 60, w * .56, 80, 24, 3), { wash: '#F5D5EA', ink: null });
  }
  function dream(t, lt) {
    bgFill('#34296E');
    glowAt(960, 380, 900, 520, PAL.gViolet, 90);
    glowAt(1500, 250, 400, 300, PAL.magenta, 50);
    for (let i = 0; i < 26; i++) { const x = hash(i * 3.1) * W, y = hash(i * 5.7) * 700, tw = .5 + .5 * Math.sin(t * 5 + i * 1.7); paint(starPts(x, y, 6 + 8 * tw * hash(i), .35, 4), { wash: i % 3 ? PAL.cream : PAL.lemon, ink: null }); }
    // moon
    paint(ellPts(260, 180, 80, 80, 22), { wash: PAL.lemon, ink: PAL.ink, sw: .8 });
    paint(ellPts(296, 160, 70, 72, 20), { wash: '#34296E', ink: null });
    const sh = wob(t, .4) * 4;
    camBegin(960, 540 + sh, 1 + lt * .02, 0);
    // back cloud
    dreamCloud(960, 900, 1300, t);
    const breath = Math.sin(t * 2.6) * .04;
    gemi(700, 930, 36, { rot: .3, eyes: 'closed', mouth: 'o', sq: breath, aL: -.9, aR: 1.1, blush: true, emote: 'zzz', emoteK: .6 + .4 * Math.sin(t * 2.6), noShadow: true, noLegs: true });
    suno(1230, 935, 34, { rot: -.26, eyes: 'closed', mouth: 'smile', sq: -breath, aL: 1.0, aR: -1, blush: true, noShadow: true, noLegs: true, waveLive: .02 });
    // front cloud puffs tuck them in
    for (let i = 0; i < 8; i++) puff(470 + i * 140, 900 + 12 * Math.sin(i * 2), 80 + 24 * hash(i), i % 2 ? PAL.cream : '#FFEAF5');
    // dream bubble
    const pop = 36.46, grown = backOut(seg(t, 35.3, 35.9)), popped = t >= pop;
    const bx = 960, by = 330, br = 270 * grown * (1 + .03 * Math.sin(t * 3));
    const tuneU = 22, stemTop = [bx + 2.55 * tuneU, by + 120 - 12 * tuneU + 2];
    if (!popped) {
      for (const [k, r] of [[.25, 16], [.5, 26], [.75, 38]]) paint(ellPts(lerp(960, bx, k) + Math.sin(t * 3 + k * 5) * 10, lerp(640, by + br, k), r, r, 14), { wash: '#FFF3FA', washOp: 200, ink: PAL.ink, sw: .6 });
      paint(ellPts(bx, by, br, br * .92, 36, 2), { wash: '#FFE3F1', washOp: 220, fill: PAL.bubble, fillOp: 80, bleed: .1, tex: .5, ink: PAL.ink, sw: 1.2 });
      // stars, notes and hearts orbiting inside
      for (let i = 0; i < 9; i++) {
        const a = t * .9 + i * TAU / 9, r = br * (.62 + .1 * Math.sin(i * 2.3)), x = bx + Math.cos(a) * r, y = by + Math.sin(a) * r * .8;
        if (i % 3 === 0) paint(starPts(x, y, 18, .45, 5, a), { wash: PAL.lemon, ink: PAL.ink, sw: .5 });
        else if (i % 3 === 1) paint(heartPts(x, y, 16), { wash: PAL.magenta, ink: PAL.ink, sw: .5 });
        else noteGlyph(x, y, 14, PAL.gBlue, 0);
      }
      paint(ellPts(bx - br * .5, by - br * .55, br * .18, br * .07, 12, 0, -.6), { wash: '#FFFFFF', washOp: 180, ink: null });
    }
    // Tune: asleep in the dream until the hand plucks it out
    const grab = t >= 36.3;
    const P = kf(t, [[35.44, [1880, -320]], [35.85, [1700, -160]], [36.28, stemTop], [36.36, stemTop], [36.42, [stemTop[0] + 6, stemTop[1] + 18]], [36.9, [1560, -520]]], ease);
    if (!grab) {
      tune(bx, by + 120, tuneU, { gold: 1, eyes: 'closed', mouth: 'smile', sq: .12 + .04 * Math.sin(t * 2.6), rot: .12, aL: -.9, aR: -.9, blush: true, noShadow: true });
      if (t > 35.6) letter('z', bx + 70, by - 70 - 20 * frac(t), 40, PAL.cream, { pop: seg(t, 35.6, 35.8), rot: .2 });
    } else {
      const sw = Math.sin((t - 36.3) * 16) * .35 * Math.exp(-(t - 36.3) * 1.5), su = tuneU;
      const sx = 2.55 * su, sy = -12 * su, fx = P[0] - (sx * Math.cos(sw) - sy * Math.sin(sw)), fy = P[1] - (sx * Math.sin(sw) + sy * Math.cos(sw));
      tune(fx, fy, su, { gold: 1, eyes: 'wide', mouth: 'O', rot: sw, walk: t * 5, aL: .6 + .8 * Math.sin(t * 20), aR: .6 - .8 * Math.sin(t * 20), noShadow: true });
      letter('!?', fx - 120, fy - 200, 90, PAL.cyan, { pop: seg(t, 36.34, 36.5) * 1.3, rot: -.15 });
    }
    bigHand(P[0], P[1], Math.atan2(1.2, -1), 92, seg(t, 36.22, 36.32));
    if (popped) {
      sparkleBurst(bx, by, 320, t - pop, { n: 14, life: .5 });
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, d = 250 + 300 * easeOut((t - pop) * 3); if (t - pop < .35) paint(ellPts(bx + Math.cos(a) * d, by + Math.sin(a) * d * .9, 12, 12, 8), { wash: '#FFE3F1', ink: PAL.ink, sw: .5 }); }
      sfx('POP!', bx - 200, by - 60, 110, PAL.bubble, t - pop, { life: .5 });
    }
    camEnd();
  }

  // --- award show ---
  function bowTie(s, sw) {
    const y = -8.35 * s;
    for (const d of [-1, 1]) paint([[0, y], [d * 1.25 * s, y - .6 * s], [d * 1.35 * s, y + .6 * s]], { wash: PAL.magenta, fill: PAL.lemon, fillOp: 40, ink: PAL.ink, sw: sw * .7 });
    paint(ellPts(0, y, .32 * s, .3 * s, 10), { wash: GOLD, ink: PAL.ink, sw: sw * .5 });
    for (let i = 0; i < 4; i++) { const k = .5 + .5 * Math.sin(T * 12 + i * 2); paint(starPts((i % 2 ? .75 : -.8) * s, y + (i < 2 ? -.2 : .25) * s, .22 * s * k + 1, .3, 4), { wash: PAL.cream, ink: null }); }
  }
  function trophyBase(x, y, s) {          // gold plinth, top-centre at (x, y)
    paint([[x - 1.3 * s, y], [x + 1.3 * s, y], [x + .9 * s, y + 1.2 * s], [x - .9 * s, y + 1.2 * s]], { wash: GOLD, fill: GOLD_DK, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
    paint(rectPts(x - 1.1 * s, y + 1.2 * s, 2.2 * s, .7 * s), { wash: '#7A3A2A', ink: PAL.ink, sw: .9 });
    paint(rectPts(x - .6 * s, y + 1.35 * s, 1.2 * s, .4 * s), { wash: GOLD, ink: null });
  }
  function trophyCup(x, y, s) {        // gold trophy held by its base at (x, y); Tune stands in the cup
    paint(rectPts(x - 1.3 * s, y - .5 * s, 2.6 * s, .9 * s), { wash: '#7A3A2A', ink: PAL.ink, sw: .9 });
    paint([[x - .35 * s, y - .5 * s], [x + .35 * s, y - .5 * s], [x + .2 * s, y - 2.4 * s], [x - .2 * s, y - 2.4 * s]], { wash: GOLD, ink: PAL.ink, sw: .8 });
    const cup = [[x - 1.9 * s, y - 4.3 * s]]; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI; cup.push([x - Math.cos(a) * 1.7 * s, y - 4.1 * s + Math.sin(a) * 1.7 * s]); }
    cup.push([x + 1.9 * s, y - 4.3 * s]);
    paint(cup, { wash: GOLD, fill: GOLD_DK, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
    for (const d of [-1, 1]) inkLine([[x + d * 1.75 * s, y - 3.9 * s], [x + d * 2.6 * s, y - 3.5 * s], [x + d * 1.4 * s, y - 2.8 * s]], 1.4, GOLD_DK, 'ink', .6);
    paint(ellPts(x - .8 * s, y - 3.4 * s, .25 * s, .5 * s, 10, 0, .3), { wash: '#FFFFFF', washOp: 150, ink: null });
  }
  function curtain(x0, x1, y1, t, side) {
    paint(rectPts(x0, -60, x1 - x0, y1 + 60), { wash: '#B8216A', ink: null });
    const n = Math.max(2, Math.round((x1 - x0) / 60));
    for (let i = 0; i < n; i++) { const x = lerp(x0, x1, (i + .3) / n) + Math.sin(t * 1.5 + i) * 4; paint(rectPts(x, -60, (x1 - x0) / n * .4, y1 + 60), { wash: '#861650', ink: null }); }
    inkLine([[side > 0 ? x0 : x1, -60], [side > 0 ? x0 : x1, y1]], 1.2, PAL.ink, 'ink', 0);
  }
  function award(t, lt) {
    const bp = bpOf(t), aT = t - 36.92, flashBeat = pulse2(t, 10);
    bgFill('#5E1450');
    const zoom = kf(t, [[36.92, 1.35], [37.3, 1.16], [38.84, 1.26]], easeOut), [sx, sy] = shakeXY(t, 5 * flashBeat);
    camBegin(960 + sx, 590 + sy, zoom * (1 + .01 * pulse(t, 5)), .01 * wob(t, .3));
    paint(rectPts(-200, -200, 2320, 1000), { wash: '#6A1757', ink: null });
    for (let i = 0; i < 16; i++) { const a0 = t * .25 + i * TAU / 16, a1 = a0 + TAU / 32; paint([[960, 470], [960 + Math.cos(a0) * 1600, 470 + Math.sin(a0) * 1600], [960 + Math.cos(a1) * 1600, 470 + Math.sin(a1) * 1600]], { wash: i % 2 ? '#9C2A78' : '#B8418A', ink: null }); }
    glowAt(960, 470, 520, 440, PAL.lemon, 90 + 60 * pulse(t, 4));
    // stage floor
    paint([[-200, 820], [2120, 820], [2120, 1300], [-200, 1300]], { wash: '#E3A43A', fill: '#B0701E', fillOp: 50, tex: .6, ink: PAL.ink, sw: 1.2 });
    paint(rectPts(-200, 900, 2320, 40), { wash: '#8E4A18', ink: PAL.ink, sw: .9 });
    glowAt(960, 850, 380, 60, '#FFF3B0', 150);
    // spotlight beams
    for (const [sx0, col] of [[120, PAL.lemon], [1800, PAL.cream]]) { const sw2 = Math.sin(t * 1.6 + sx0) * 60; paint([[sx0 - 30, -100], [sx0 + 30, -100], [960 + 260 + sw2, 860], [960 - 260 + sw2, 860]], { fill: col, fillOp: 70, bleed: .15, tex: .2, border: .1, ink: null }); }
    // the robots peeking from the wings, jaws on the floor
    const peek = backOut(seg(t, 37.2, 37.55)), m = mood(t, [[36.92, 'wide'], [37.56, 'wide', '!!']]);
    gemi(lerp(150, 300, peek), 830, 25, { ...m, mouth: t > 37.56 ? 'O' : 'o', rot: .22 * peek, lean: .2, aL: .3, aR: -.2, sq: -.08 * bell(t, 37.56, 37.9), noShadow: true });
    suno(lerp(1800, 1640, peek), 832, 24, { ...m, emote: null, mouth: t > 37.56 ? 'O' : 'o', rot: -.2 * peek, aL: 1.1, aR: .2, sq: -.08 * bell(t, 37.6, 37.9), noShadow: true });
    curtain(-200, 230, 900, t, 1); curtain(1700, 2120, 900, t, -1);
    // valance
    const V = [[-200, -200], [2120, -200], [2120, 80]]; for (let i = 0; i <= 16; i++) { const x = lerp(2120, -200, i / 16); V.push([x, 80 + (i % 2 ? 50 : 0)]); }
    paint(V, { wash: '#C92B78', fill: '#861650', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1, curv: .5 });
    inkLine(V.slice(3).map(p => [p[0], p[1] + 8]), 2.5, GOLD, 'ink', .5);
    // the human, lifting golden Tune like a trophy
    const lift = backOut(seg(t, 36.92, 37.28)), s = 30, hx = 880, hy = 850;
    const dy = -.35 * Math.abs(Math.sin(bp * Math.PI)), aR = lerp(-.6, 1.05, lift) + .12 * pulse(t, 5), aL = .8 + .5 * Math.sin(bp * Math.PI);
    const [px, py] = hHand(hx, hy, s, 1, aR, { dy });
    human(hx, hy, s, { dy, aR, aL, eyes: t > 38.3 ? 'happy' : 'lazy', mouth: 'grin', blush: true, draw: bowTie, sq: .05 * pulse(t, 6) });
    trophyCup(px, py, 30);
    const squirm = Math.sin(t * 13);
    tune(px, py - 128, 17, { gold: 1, eyes: 'wide', mouth: 'wobble', rot: squirm * .22, walk: t * 4.5, aL: .8 + squirm, aR: .8 - squirm, noShadow: true, glow: .6 + .3 * pulse(t, 4), sq: .05 * pulse(t) });
    letter('!?', px + 120, py - 360, 74, PAL.cyan, { pop: seg(t, 37.1, 37.35) * 1.3, rot: .15 + squirm * .05 });
    // audience silhouettes with flashing cameras
    for (let i = 0; i < 11; i++) {
      const x = -60 + i * 190 + hash(i) * 60, y = 1010 + hash(i * 3) * 20 - 14 * Math.abs(Math.sin(bp * Math.PI + i)), cx2 = x + (hash(i * 5) - .5) * 60;
      inkLine([[x + 20, y - 20], [cx2, y - 85]], 5, '#2A0E2E', 'ink', 0);
      paint(ellPts(x, y, 50, 56, 16), { wash: '#2A0E2E', ink: null });
      paint(rrPts(cx2 - 24, y - 110, 48, 32, 6), { wash: '#3B2436', ink: PAL.cream, sw: .5 });
    }
    const fi = Math.floor(bp * 2), fAge = frac(bp * 2) * BEAT / 2;
    for (let j = 0; j < 2; j++) {
      const i = Math.floor(hash(fi * 7.3 + j * 11) * 11), x = -60 + i * 190 + hash(i) * 60 + (hash(i * 5) - .5) * 60, y = 1010 + hash(i * 3) * 20 - 95;
      if (fAge < .16) { const k = 1 - fAge / .16; paint(starPts(x, y, 120 * k + 20, .12, 8, fi), { wash: PAL.cream, ink: null }); glowAt(x, y, 260 * k, 220 * k, '#FFFFFF', 160 * k); }
    }
    confetti(t, -100, 2020, -120, { n: 46, speed: 300, seed: 3 });
    camEnd();
    flash(.18 * flashBeat * (fAge < .1 ? 1 : 0));
    // "dreams": a monster flashbulb whites everything out
    const wo = t > 38.36 ? easeOut(seg(t, 38.36, 38.8)) : 0;
    if (wo > 0) { flushLetters(); glowAt(1200, 700, 700 * wo + 100, 600 * wo + 100, '#FFFFFF', 220 * wo); flash(wo, '#FFFDF6'); }
    if (aT < .25) flash(1 - aT / .25, '#FFF2FA');
  }
  function dreams(t, lt, dur) { if (t < 36.92) dream(t, lt); else award(t, lt); }

  // =====================================================================================================
  // 3) THE ENDLESS SCROLL  38.84–42.78  "Did you even read the text it gave"
  // =====================================================================================================
  const GX = 470, GY = 890, GU = 32, HX3 = 1480, HY3 = 800, HS3 = 33;
  const rollX = t => { const d = Math.max(0, t - 39.6); return 720 + 2500 * (d - .22 * (1 - Math.exp(-d * 4.5))); };
  function glasses(u, sw) {
    const cy = -6.6 * u - .45 * u;
    for (const s of [-1, 1]) { paint(ellPts(s * .95 * u, cy, .85 * u, .8 * u, 16), { wash: '#FFFFFF', washOp: 60, ink: PAL.ink, sw: sw * .9 }); }
    inkLine([[-.15 * u, cy - .1 * u], [.15 * u, cy - .1 * u]], sw * .8, PAL.ink, 'ink', 0);
  }
  function selfie(x, y, t, i) {      // framed selfies of the human along the hallway
    paint(rectPts(x - 80, y - 100, 160, 200, 2), { wash: GOLD, ink: PAL.ink, sw: 1 });
    paint(rectPts(x - 64, y - 84, 128, 168), { wash: ['#8EC3E6', '#FFD3E6', '#D6F6DC'][i % 3], ink: null });
    paint(rectPts(x - 40, y + 30, 80, 60), { wash: HOODIE, ink: null });
    paint(ellPts(x, y, 34, 34, 16), { wash: SKIN, ink: PAL.ink, sw: .6 });
    paint([[x - 38, y - 4], [x - 36, y - 30], [x, y - 44], [x + 36, y - 30], [x + 38, y - 4], [x + 20, y - 20], [x - 20, y - 20]], { wash: HAIR, ink: null, curv: .4 });
    for (const s of [-1, 1]) inkLine([[x + s * 14 - 7, y + 2], [x + s * 14 + 7, y + 2]], .9, PAL.ink, 'ink', 0);
    inkLine([[x - 8, y + 18], [x, y + 22], [x + 8, y + 18]], .7, PAL.ink, 'ink', .5);
    paint([[x + 36, y + 40], [x + 48, y - 6], [x + 58, y - 4], [x + 54, y + 40]], { wash: SKIN, ink: PAL.ink, sw: .5 });   // peace sign-ish
  }
  function scrollStrip(x0, x1, v0, v1, t) {
    const a = Math.max(x0, v0 - 40), b = Math.min(x1, v1 + 40); if (b <= a) return;
    paint([[a, 872], [b, 872], [b, 962], [a, 962]], { wash: PAL.cream, fill: '#EED9B0', fillOp: 50, tex: .5, ink: null });
    inkLine([[a, 872], [b, 872]], .9, PAL.ink, 'ink', 0); inkLine([[a, 962], [b, 962]], .9, PAL.ink, 'ink', 0);
    for (let row = 0; row < 3; row++) {
      const yy = 892 + row * 24;
      for (let s0 = Math.floor(a / 150) * 150; s0 < b; s0 += 150) {
        const len = 70 + hash(s0 * .01 + row) * 60, xs = s0 + 12 + row * 20; if (xs < a || xs + len > b) continue;
        const P = []; for (let k = 0; k <= 6; k++) P.push([xs + len * k / 6, yy + Math.sin(k * 2.2 + s0) * 3]);
        inkLine(P, .8, row === 1 ? PAL.gViolet : '#6A5A80', 'inkfine', .5);
      }
    }
  }
  function scroll(t, lt) {
    const bp = bpOf(t), rx = rollX(t);
    const cam = t < 39.6 ? [960, 600, 1.12] : t < 40.95 ? [Math.max(960, rx - 420), 600, 1.12]
      : t < 41.22 ? kf(t, [[40.95, [Math.max(960, rollX(40.95) - 420), 600, 1.12]], [41.22, [HX3 - 60, 500, 1.5]]], ease)
      : t < 41.95 ? [HX3 - 60 - (t - 41.22) * 20, 500 + (t - 41.22) * 8, 1.5 + (t - 41.22) * .05]
      : kf(t, [[41.95, [HX3 - 75, 506, 1.536]], [42.22, [1000, 590, 1.14]]], ease);
    const whip = bell(t, 40.93, 41.24), anger = seg(t, 41.98, 42.1), [shx, shy] = shakeXY(t, 6 * anger);
    bgFill(WALL);
    camBegin(cam[0] + shx, cam[1] + shy, cam[2], .01 * wob(t, .25));
    const vx0 = cam[0] - W / 2 / cam[2] - 60, vx1 = cam[0] + W / 2 / cam[2] + 60;
    room(vx0, vx1);
    // things along the house
    if (vx0 < 2000 && vx1 > 1650) { glowAt(1830, 330, 380, 320, '#FFC46E', 100); paint(rectPts(1824, 420, 10, 350), { wash: '#3B2436', ink: PAL.ink, sw: .6 }); paint([[1760, 300], [1900, 300], [1940, 430], [1720, 430]], { wash: '#FFE39A', fill: PAL.ochre, fillOp: 50, ink: PAL.ink, sw: 1 }); }
    for (let i = 0; i < 6; i++) { const x = 2300 + i * 560; if (x > vx0 - 100 && x < vx1 + 100) selfie(x, 420 + (i % 2) * 40, t, i); }
    for (let i = 0; i < 4; i++) { const x = 2580 + i * 1120; if (x > vx0 - 120 && x < vx1 + 120) { paint(rrPts(x - 60, 640, 120, 130, 18), { wash: PAL.coral, ink: PAL.ink, sw: .9 }); for (let k = 0; k < 5; k++) paint(ellPts(x + (k - 2) * 26, 590 - Math.abs(k - 2) * -14 - 40, 30, 60, 12, 0, (k - 2) * .4), { wash: k % 2 ? PAL.sap : '#8CC56A', ink: PAL.ink, sw: .6 }); } }
    // the scroll: unrolled strip + the rolling roll
    const dropped = t >= 39.16, landed = t >= 39.45;
    const stripL = t < 42.45 ? 620 : lerp(620, 1400, easeIn(seg(t, 42.45, 42.78)));
    if (landed) scrollStrip(stripL, Math.max(690, rx), vx0, vx1, t);
    beanbag(HX3 + 10, HY3 + 20, 0);
    // Gemi, proud author in reading glasses → boiling kettle
    const m = mood(t, [[38.84, 'happy'], [39.6, 'normal', 'spark'], [41.98, 'angry', 'anger']]);
    const redK = anger, tw = t > 42 ? (frac(t * 7) < .35 ? .45 : 0) : 0, shake = anger * Math.sin(t * 70) * 5;
    const hold = !dropped;
    const gy = GY, gdy = hold ? -.2 * Math.abs(Math.sin(bp * Math.PI)) : -.4 * Math.abs(Math.sin(bp * Math.PI)) * (1 - anger);
    gemi(GX + shake, gy, GU, {
      ...m, squint: Math.max(m.squint, tw), mouth: t > 41.98 ? 'frown' : t < 39.6 ? 'grin' : 'smile', lookX: t > 39.6 && t < 41.98 ? 1 : 0, blush: t < 41.98, draw: glasses,
      aL: hold ? .1 : .5 + .2 * Math.sin(bp * Math.PI), aR: hold ? -.1 : t > 41.98 ? 1.2 : .4, dy: gdy, rot: t > 41.98 ? 0 : -.06, sq: .06 * pulse(t, 5) + .1 * bell(t, 41.98, 42.2),
      colA: mixCol(PAL.gBlue, '#E0283F', redK * .8), colB: mixCol(PAL.gViolet, '#F24A3A', redK * .8), colC: mixCol(PAL.gPink, '#FF7A3A', redK * .6), noShadow: false
    });
    // the scroll tube: held proudly, then dropped, then rolling off
    if (!landed) {
      const k = seg(t, 39.16, 39.45), tx = GX + 250 + k * 60, ty = lerp(GY - 140 + Math.sin(bp * Math.PI) * -6, 900, easeIn(k)), r = 58;
      paint(rrPts(tx - 190, ty - r, 380, 2 * r, r, 1), { wash: PAL.cream, fill: '#EED9B0', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.2 });
      for (const e of [-1, 1]) paint(ellPts(tx + e * 190, ty, 22, r, 14), { wash: '#F6E7C8', ink: PAL.ink, sw: .8 });
      paint(rectPts(tx - 14, ty - r - 2, 28, 2 * r + 4), { wash: PAL.magenta, ink: PAL.ink, sw: .7 });
      if (t < 39.16) for (let i = 0; i < 3; i++) paint(starPts(tx - 120 + i * 120, ty - 90 - 14 * Math.sin(t * 8 + i), 16 * (.6 + .4 * Math.sin(t * 9 + i * 2)), .35, 4), { wash: PAL.lemon, ink: PAL.ink, sw: .4 });
    } else if (t < 39.6) {
      const k = seg(t, 39.45, 39.6), tx = 780, r = 58, bnc = Math.abs(Math.sin(k * Math.PI)) * 20;
      paint(ellPts(tx, 900 - bnc, r * (1 + .1 * (1 - k)), r * (1 - .1 * (1 - k)), 20), { wash: PAL.cream, ink: PAL.ink, sw: 1.2 });
      if (t - 39.45 < .4) sfx('THUD', 780, 760, 60, PAL.lemon, t - 39.45, { life: .4 });
    } else if (rx > vx0 - 80 && rx < vx1 + 80) {
      const r = 58, ang = rx / r, P = [];
      paint(ellPts(rx, 900, r, r, 22), { wash: PAL.cream, fill: '#EED9B0', fillOp: 60, tex: .4, ink: PAL.ink, sw: 1.2 });
      for (let k = 0; k < 22; k++) { const a = ang + k * .55, rr = r * (1 - k / 24); P.push([rx + Math.cos(a) * rr, 900 + Math.sin(a) * rr]); }
      inkLine(P, .7, '#B89A70', 'inkfine', .6);
      for (let i = 0; i < 4; i++) { const k = frac(t * 3 + i / 4); puff(rx - 50 - k * 160, 945 - k * 30, 16 * (1 - k), '#E7C9A0', 160); }
    }
    // Tune: runs along the paper, pointing at every line
    if (t > 39.6 && t < 41.3) {
      const tx = rx - 200, tb = bp * 2;
      tune(tx, 930, 21, { gold: 1, walk: tb, dy: -Math.abs(Math.sin(tb * Math.PI)) * .8, rot: -.1, eyes: 'spark', mouth: 'sing', aR: -.1 + .35 * Math.sin(tb * Math.PI), aL: .9, blush: true, noShadow: true });
      speedLines(tx - 400, 700, .15, PAL.cream, 10);
    } else if (t <= 39.6) tuneDancer(GX + 420, 930, 21, 'hop', t, { gold: 1, eyes: 'spark', mouth: 'grin', blush: true });
    // the human: phone, phone, phone. One 0.2 s glance and a thumbs up.
    const glance = bell(t, 41.4, 41.66), thumb = seg(t, 41.8, 41.95) * (1 - seg(t, 42.3, 42.4));
    const grabK = seg(t, 42.3, 42.45), ballK = seg(t, 42.45, 42.7);
    const aL = thumb > 0 ? lerp(-1.1, .55, backOut(thumb)) : lerp(-1.1, -.55, grabK);
    const thumbHook = upL(aL, (s, sw) => {
      if (ballK > 0) { const br = s * (.4 + .6 * backOut(ballK)); paint(ellPts(0, -br * .6, br, br * .9, 12, s * .08), { wash: PAL.cream, ink: PAL.ink, sw: sw * .7 }); inkLine([[-br * .5, -br * .7], [0, -br * .3], [br * .3, -br * .9]], sw * .4, '#9C8A70', 'inkfine', .3); return; }
      if (thumb <= 0) return;
      paint(ellPts(0, 0, .62 * s, .55 * s, 12), { wash: SKIN, ink: PAL.ink, sw: sw * .6 });
      paint(rrPts(-.22 * s, -1.25 * s, .44 * s, .95 * s, .2 * s), { wash: SKIN, ink: PAL.ink, sw: sw * .6 });
    });
    human(HX3, HY3, HS3, { sit: true, flip: true, rot: .14, phone: true, aR: -.2, eyes: 'screen', lookX: glance > .3 ? 1.6 : -.2, mouth: t > 41.9 && t < 42.4 ? 'smile' : 'flat', aL, handL: thumbHook, brows: glance > .3 ? 'up' : null, sq: .02 * pulse(t, 5) });
    paint(ellPts(HX3 - 30, HY3 - 10.6 * HS3, 90, 85, 18), { wash: PAL.cyan, washOp: 35, ink: null });
    if (glance > .3) {             // the comic eye-line: a dotted zip down to the paper and straight back
      const ex = HX3 - 40, ey = HY3 - 10.5 * HS3;
      for (let i = 0; i < 8; i++) { const k = i / 8; paint(ellPts(lerp(ex - 30, ex - 420, k), lerp(ey + 10, 900, k), 8, 8, 8), { wash: PAL.lemon, ink: PAL.ink, sw: .4 }); }
      sfx('ZIP', ex - 260, ey + 150, 44, PAL.lemon, t - 41.42, { life: .3, rot: .3 });
    }
    if (thumb > 0) { const [px, py] = hHand(HX3, HY3, HS3, -1, aL, { flip: true }); sparkleBurst(px, py - 40, 70, t - 41.9, { n: 6, life: .4 }); sfx('DING', px + 20, py - 110, 52, PAL.lemon, t - 41.9, { life: .45, rot: .1 }); }
    if (ballK > 0) sfx('SCRUNCH', HX3 + 180, HY3 - 200, 56, PAL.cream, t - 42.47, { life: .4 });
    // the kettle boils over
    if (anger > 0) {
      const topY = GY - 6.6 * GU - 5.3 * GU;
      for (let i = 0; i < 7; i++) { const k = frac((t - 41.98) * 1.8 + i / 7), sx = GX + shake + Math.sin(i * 2.1 + k * 4) * 30 * k; puff(sx, topY - k * 220, (16 + 34 * k) * anger, '#FFF3F0', 230 * (1 - k)); }
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const k = frac(t * 3 + i / 3); puff(GX + shake + s * (5.4 * GU + k * 120), GY - 6.6 * GU - 10 - k * 30, (8 + 18 * k) * anger, PAL.cream, 200 * (1 - k)); }
      sfx('TWITCH', GX - 150, GY - 400, 44, PAL.cream, t - 42.02, { life: .5, rot: -.2 });
    }
    camEnd();
    if (whip > .05) streaks(whip);
    if (lt < .3) flash(1 - ease(lt / .3), '#FFFDF6');
  }

  // =====================================================================================================
  // 4) THE AUDIO WAVE  42.78–47.78  "Or just shoved it in the audio wave"
  // =====================================================================================================
  const MX = 1210, MB = 870, SPK = [1250, 610];               // machine centre-x, base y, speaker centre
  function machine(t, shake) {
    const bp = bpOf(t), pk = pulse(t, 5), gulp = bell(t, 43.72, 44.02);
    const rot = shake * (Math.sin(t * 31) * .025 + Math.sin(t * 13) * .015), sq = shake * .06 * pk - gulp * .05;
    push(); translate(MX, MB); rotate(rot); scale(1 + sq * .6, 1 - sq); translate(-MX, -MB);
    // springy legs
    for (const lx of [-220, 200]) { const P = []; for (let k = 0; k <= 10; k++) P.push([MX + lx + (k % 2 ? 16 : -16), MB - 64 + k * 6.4]); inkLine(P, 1.4, '#6A6F80', 'ink', 0); paint(ellPts(MX + lx, MB, 34, 10, 10), { wash: PAL.suno, ink: null }); }
    // body
    paint(rrPts(MX - 290, MB - 590, 580, 530, 44, 2), { wash: PAL.coral, fill: PAL.sunoB, fillOp: 60, bleed: .05, tex: .6, border: .5, ink: PAL.ink, sw: 1.5 });
    paint(rrPts(MX - 290, MB - 590, 580, 70, 30, 1), { wash: PAL.lemon, ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 5; i++) paint(ellPts(MX - 200 + i * 100, MB - 555, 16, 16, 10), { wash: (beatN(t) + i) % 2 ? [PAL.mint, PAL.magenta, PAL.cyan][i % 3] : '#7A3A40', ink: PAL.ink, sw: .5 });
    for (const [x, y] of [[-265, -500], [265, -500], [-265, -85], [265, -85]]) paint(ellPts(MX + x, MB + y, 7, 7, 8), { wash: '#FFE0C0', ink: PAL.ink, sw: .4 });
    // gauges
    for (const [gx, gy, sp] of [[MX + 190, MB - 460, 3], [MX + 190, MB - 370, -5]]) {
      paint(ellPts(gx, gy, 36, 36, 16), { wash: PAL.cream, ink: PAL.ink, sw: .8 });
      const a = -1.2 + shake * (Math.sin(t * sp * 2) * 1.4 + 1);
      inkLine([[gx, gy], [gx + Math.cos(a - 1.57) * 28, gy + Math.sin(a - 1.57) * 28]], 1.2, '#D8394E', 'ink', 0);
    }
    // chimney with smoke rings on the beats
    paint(rectPts(MX + 120, MB - 700, 70, 120), { wash: '#6A6F80', ink: PAL.ink, sw: 1 });
    paint(rectPts(MX + 108, MB - 716, 94, 26), { wash: PAL.suno, ink: PAL.ink, sw: .8 });
    if (shake > .1) for (let i = 0; i < 3; i++) { const k = frac(bp / 2 + i / 3); paint(ellPts(MX + 155 + k * 60, MB - 740 - k * 260, 26 + 40 * k, 16 + 24 * k, 16), { wash: i % 2 ? PAL.cream : '#E5DDEE', washOp: 230 * (1 - k), ink: PAL.ink, sw: .6 * (1 - k) }); }
    // funnel hopper sticking out of the upper-left
    const mw = 1 + gulp * .25;
    const FY = 150;
    paint([[MX - 280, MB - 470 + FY], [MX - 280, MB - 390 + FY], [MX - 420, MB - 300 + FY + 20 * gulp], [MX - 470, MB - 240 + FY], [MX - 470, MB - 520 + FY], [MX - 420, MB - 460 + FY]], { wash: '#C9CED6', fill: '#8A93A5', fillOp: 60, ink: PAL.ink, sw: 1.1, curv: .3 });
    paint(ellPts(MX - 470, MB - 380 + FY, 44 * mw, 150 * mw, 20), { wash: '#5A6275', ink: PAL.ink, sw: 1.2 });
    paint(ellPts(MX - 462, MB - 380 + FY, 28 * mw, 124 * mw, 18), { wash: '#2C2538', ink: null });
    if (gulp > .05) paint(ellPts(lerp(MX - 430, MX - 300, seg(t, 43.72, 44.02)), MB - 395 + FY, 60 * gulp, 64 * gulp, 14), { wash: '#C9CED6', ink: PAL.ink, sw: .8 });
    // speaker cone
    const pump = 1 + .1 * pk * shake + .25 * easeIn(seg(t, 44.8, 45.34));
    paint(ellPts(SPK[0], SPK[1], 210, 210, 30, 1), { wash: PAL.suno, ink: PAL.ink, sw: 1.4 });
    paint(ellPts(SPK[0], SPK[1], 180 * pump, 180 * pump, 30), { wash: PAL.grape, fill: PAL.gViolet, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1 });
    paint(ellPts(SPK[0], SPK[1], 120 * pump, 120 * pump, 26), { wash: '#7A5CC0', ink: PAL.ink, sw: .7 });
    paint(ellPts(SPK[0], SPK[1], 58 * pump, 58 * pump, 20), { wash: PAL.magenta, ink: PAL.ink, sw: .8 });
    paint(ellPts(SPK[0] - 18, SPK[1] - 20, 16, 10, 10, 0, -.6), { wash: '#FFFFFF', washOp: 170, ink: null });
    pop();
    // sound rings
    if (shake > .1) for (let i = 0; i < 3; i++) { const k = frac(bp + i / 3), r = 220 + k * 260; const P = []; for (let a = -1; a <= 1; a += .1) P.push([SPK[0] + Math.cos(a) * r, SPK[1] + Math.sin(a) * r]); inkLine(P, 1.4 * (1 - k), PAL.cream, 'ink', .5); }
  }
  function shove(t) {
    const shake = seg(t, 44.0, 44.12) + .6 * seg(t, 44.5, 45.2), push2 = easeIn(seg(t, 44.62, 45.34));
    const zoom = 1.28 + push2 * 3.3, cx = lerp(980, SPK[0], ease(seg(t, 44.62, 45.3))), cy = lerp(600, SPK[1], ease(seg(t, 44.62, 45.3)));
    const [sx, sy] = shakeXY(t, 10 * seg(t, 44.06, 44.2) * (1 - push2 * .5));
    bgFill(WALL);
    camBegin(cx + sx, cy + sy, zoom, .02 * push2 * Math.sin(t * 30));
    room(-200, 2200);
    paint(ellPts(900, 905, 820, 80, 26, 3), { wash: '#2F8A8C', fill: PAL.teal, fillOp: 60, tex: .5, ink: PAL.ink, sw: .8 });
    machine(t, shake);
    // the human: lazy shove, eyes on the phone
    const hx = 560, hy = 880, s = 31;
    const aR = kf(t, [[42.78, -1.1], [43.2, .95], [43.5, 1.05], [43.68, .22], [43.9, .25], [44.25, -1.15]], ease);
    const lean = kf(t, [[42.78, 0], [43.5, -.08], [43.68, .14], [44.0, .1], [44.3, 0]], ease);
    const ballIn = seg(t, 43.66, 43.76);
    const ballHook = null;
    const phoneL = upL(-.4, (ss, sw) => { paint(rrPts(-.4 * ss, -1.2 * ss, .9 * ss, 1.6 * ss, .15 * ss), { wash: PAL.ink, ink: null }); paint(rrPts(-.3 * ss, -1.1 * ss, .7 * ss, 1.35 * ss, .1 * ss), { wash: PAL.cyan, fill: '#FFFFFF', fillOp: 60, ink: null }); });
    const blown = seg(t, 44.9, 45.2);
    human(hx - blown * 20, hy, s, { rot: lean - blown * .12, aR, handR: ballHook, aL: -.4, handL: phoneL, eyes: blown > .5 ? 'wide' : 'screen', lookX: -.6, mouth: blown > .5 ? 'O' : 'flat', hairUp: blown, sq: .03 * pulse(t, 5) });
    if (t < 43.78) {                  // the crumpled scroll: in the hand, then stuffed into the funnel mouth
      const [bx0, by0] = hHand(hx, hy, s, 1, aR), mouth = [MX - 465, MB - 230], k = easeIn(ballIn);
      const bx = lerp(bx0 + 20, mouth[0], k), by = lerp(by0 - 20, mouth[1], k), br = 42 * (1 - k * .5);
      paint(ellPts(bx, by, br, br * .9, 12, 5), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
      inkLine([[bx - br * .6, by - br * .2], [bx, by + br * .3], [bx + br * .5, by - br * .5]], .7, '#9C8A70', 'inkfine', .3);
      inkLine([[bx - br * .3, by + br * .5], [bx + br * .4, by + br * .1]], .6, PAL.gViolet, 'inkfine', .3);
    }
    if (t > 43.68 && t < 44.2) sfx('GULP!', MX - 500, MB - 440, 70, PAL.lemon, t - 43.72, { life: .5, rot: -.12 });
    if (t > 44.06 && t < 44.7) sfx('RATTLE', MX + 330, MB - 640, 54, PAL.cream, t - 44.06, { life: .6, rot: .15 });
    camEnd();
    // BWOOM: water blasts out of the cone at the lens
    const bl = seg(t, 45.26, 45.46);
    if (bl > 0) {
      const r = easeIn(bl) * 1400 + 40;
      paint(ellPts(W / 2, H / 2, r * 1.1, r, 30, 8), { wash: '#3FB7D6', ink: null });
      paint(ellPts(W / 2, H / 2, r * .8, r * .72, 26, 8), { wash: PAL.cyan, ink: null });
      paint(ellPts(W / 2, H / 2, r * .45, r * .4, 20, 6), { wash: '#BFF3F0', ink: null });
    }
  }
  // the colossal wave: a face rising to the right, a crest, and a lip that throws forward (left) over the face
  const faceY = (x, t) => { const k = clamp((x + 800) / 2150); return 800 - 400 * k * k + Math.sin(x * .012 - t * 7) * 8; };
  function surf(t) {
    const lt = t - 45.46, bp = bpOf(t), crash = easeIn(seg(t, 46.45, 46.95));
    const zoom = 1.02 + crash * 1.3, rot = .025 * Math.sin(t * 2.2) - crash * .08;
    const cx = 960 + Math.sin(t * 1.3) * 20 + crash * 260, cy = 540 + Math.sin(t * 3.1) * 12 - crash * 260;
    bgFill('#BDEFF2');
    camBegin(cx, cy, zoom, rot);
    paint(rectPts(-800, -900, 3600, 1300), { wash: '#BDEFF2', ink: null });
    paint(rectPts(-800, -900, 3600, 500), { wash: '#A6E6F0', ink: null });
    glowAt(300, 140, 260, 240, PAL.lemon, 150);
    paint(ellPts(300, 140, 80, 80, 20), { wash: PAL.lemon, ink: PAL.ink, sw: .8 });
    for (let i = 0; i < 4; i++) { const x = ((i * 520 + t * 220) % 2400 + 2400) % 2400 - 700, y = 100 + (i % 3) * 90; for (const [dx, dy, r] of [[0, 0, 48], [46, -18, 56], [96, 0, 40]]) puff(x + dx, y + dy, r, PAL.cream, 230); }
    // far sea
    paint([[-800, 560], [2800, 560], [2800, 1600], [-800, 1600]], { wash: '#3FA9C9', ink: null });
    for (let i = 0; i < 7; i++) { const x = -700 + ((i * 330 + t * 400) % 2000); inkLine([[x, 590 + i * 22], [x + 70, 590 + i * 22]], .8, PAL.cream, 'inkfine', 0); }
    // wave body: face → crest → back
    const face = []; for (let x = -800; x <= 1300; x += 60) face.push([x, faceY(x, t)]);
    const crestP = [[1400, 330], [1500, 240], [1580, 215], [1720, 290], [1920, 420], [2800, 520]];
    const body = [...face, ...crestP, [2800, 1600], [-800, 1600]];
    paint(body, { wash: '#1F8FB0', ink: null });
    for (const [th, col] of [[-700, '#2EA3C4'], [-600, '#45BAD5'], [-480, PAL.cyan], [-340, '#86DCE6'], [-200, '#B3EDEC']]) paint(clipHalf(body, (x, y) => -y, th), { wash: col, ink: null });
    paint(body, { fill: '#0F6E8E', fillOp: 35, bleed: .04, tex: .7, border: .5, ink: PAL.ink, sw: 1.2 });
    for (let i = 0; i < 12; i++) {          // flow lines streaming down the face
      const k = frac(t * .9 + hash(i)), x0 = -200 + hash(i * 3.3) * 1400, y0 = faceY(x0, t) + 40 + k * 260;
      inkLine([[x0 - k * 60, y0], [x0 - k * 60 - 90, y0 + 50]], 1, '#E6FBFF', 'inkfine', .3);
    }
    // the lip: an arc thrown over the face, ending in a sine-wave foam curl
    const cc = [1250 - crash * 200, 330 - crash * 60], R = 330 + crash * 700, a0 = -.35, a1 = -Math.PI * (1.02 + .1 * seg(t, 46.0, 46.45) + crash * .5);
    const outer = [], inner = [];
    for (let i = 0; i <= 22; i++) { const a = lerp(a0, a1, i / 22), w = (190 + crash * 300) * (1 - i / 25), r = R + Math.sin(i * .9 - t * 10) * 7; outer.push([cc[0] + Math.cos(a) * r, cc[1] + Math.sin(a) * r]); inner.push([cc[0] + Math.cos(a) * (r - w), cc[1] + Math.sin(a) * (r - w)]); }
    const barrel = [...inner.slice().reverse().slice(0, 23)]; for (let x = cc[0] - R; x <= 1330; x += 60) barrel.push([x, faceY(x, t)]);
    paint(barrel, { wash: '#16708F', ink: null });
    paint([...outer, ...inner.slice().reverse()], { wash: '#45BAD5', ink: null });
    paint(clipHalf([...outer, ...inner.slice().reverse()], (x, y) => -y, -cc[1] + R * .35), { wash: '#86DCE6', ink: null });
    paint([...outer, ...inner.slice().reverse()], { ink: PAL.ink, sw: 1.1 });
    paint(thickPath(outer.map((p, i) => [p[0], p[1] + Math.sin(i * 1.3 - t * 12) * 6]), 22), { wash: PAL.cream, ink: null });
    // foam curl at the tip
    const tip = outer[22];
    for (let i = 0; i < 6; i++) { const a = t * 6 + i; puff(tip[0] + Math.cos(a) * 26, tip[1] + 20 + Math.sin(a) * 18 + i * 8, 26 - i * 3, i % 2 ? PAL.cream : '#E6FBFF'); }
    // sine-wave foam crest along the face top
    paint(thickPath(face.filter(p => p[0] > -700).map(p => [p[0], p[1] + Math.sin(p[0] * .03 - t * 9) * 9]), 20), { wash: PAL.cream, ink: null });
    // spray off the lip
    for (let i = 0; i < 18; i++) {
      const k = frac(t * 1.4 + hash(i * 2.2)), j = Math.floor(hash(i * 5.1) * 22), p = outer[j];
      puff(p[0] + (hash(i) - .5) * 80 - k * 120, p[1] - 30 - k * 140 + k * k * 260, (6 + 12 * hash(i * 9)) * (1 - k), i % 3 ? PAL.cream : '#E6FBFF');
    }
    // the record surfboard and the three riders, racing ahead of the lip
    const bx = 620 + lt * 70 + Math.sin(t * 2.1) * 30, by = faceY(bx, t) + 190 + Math.sin(bp * Math.PI) * 12, ba = -.3 + .05 * Math.sin(t * 3);
    const along = d => [bx + Math.cos(ba) * d, by + Math.sin(ba) * d];
    for (let i = 0; i < 8; i++) { const k = frac(t * 3 + i / 8), [px, py] = along(-240 - k * 220); puff(px + (hash(i) - .5) * 60, py + 20 - k * 60, 32 * (1 - k), PAL.cream, 230); }
    push(); translate(bx, by); rotate(ba);
    paint(ellPts(0, 0, 270, 46, 30), { wash: PAL.ink, ink: PAL.ink, sw: 1 });
    for (const r of [.8, .6]) paint(ellPts(0, -2, 270 * r, 46 * r, 26), { ink: '#6A6080', sw: .5 });
    paint(ellPts(0, -2, 76, 17, 16), { wash: PAL.magenta, ink: null });
    paint(ellPts(0, -2, 22, 6, 10), { wash: PAL.lemon, ink: null });
    pop();
    const u = 24, bob = pulse(t, 5);
    const [gx, gy] = along(-135), [sx, sy] = along(105);
    const balance = Math.sin(t * 4);
    gemi(gx, gy - 30, u, { rot: ba * .35 + balance * .06, eyes: 'spark', mouth: 'grin', aL: .5 + balance * .5, aR: .2 - balance * .5, sq: .08 * bob, blush: true, noShadow: true });
    suno(sx, sy - 34, u, { rot: ba * .35 - balance * .05, eyes: 'happy', mouth: 'sing', sing: 1, aL: .7, aR: .9 + .3 * Math.sin(t * 6), sq: .08 * bob, blush: true, noShadow: true });
    const tr = ba * .35 - balance * .05, tx = sx + Math.sin(tr) * 11.1 * u, ty = sy - 34 - Math.cos(tr) * 11.1 * u * (1 - .08 * bob);
    tune(tx, ty, 15, { gold: 1, rot: tr + .1 * Math.sin(t * 5), eyes: 'spark', mouth: 'O', aL: 1.3 + .3 * Math.sin(t * 9), aR: 1.3 - .3 * Math.sin(t * 9), noShadow: true, sq: .1 * bob, blush: true });
    if (lt < 1) sfx('WHEEE', 420, 330, 76, PAL.magenta, lt - .2, { life: .9, rot: -.12 });
    camEnd();
    // the lip crashes over the lens
    const fall = seg(t, 46.72, 47.0);
    if (fall > 0) {
      flushLetters();
      for (let i = 0; i < 26; i++) {
        const hx = hash(i * 1.7), hy = hash(i * 3.9), d = easeOut(clamp((fall - hx * .35) / .65));
        const x = lerp(W + 400, (hx * 1.3 - .15) * W, d), y = lerp(-400, (hy * 1.3 - .15) * H, d);
        paint(ellPts(x, y, 280 + 140 * hy, 240 + 120 * hx, 20, 10), { wash: i % 3 ? '#EAFBF8' : i % 2 ? '#C6F0EE' : '#FFFFFF', ink: i % 4 ? null : '#9ADDE0', sw: 1 });
      }
    }
    if (lt < .3) flash(.8 * (1 - lt / .3), '#BFF3F0');
  }
  function foam(t) {
    const k = seg(t, 46.98, 47.78);
    bgFill('#EAFBF8');
    for (let i = 0; i < 22; i++) {
      const x = hash(i * 2.3) * W, y = hash(i * 4.1) * H + Math.sin(t * 1.5 + i) * 20 - k * 60, r = 140 + 120 * hash(i * 6.2);
      paint(ellPts(x + Math.sin(t + i) * 30, y, r, r * .8, 18, 6), { wash: i % 3 ? '#F4FDFB' : i % 2 ? '#D6F5F2' : '#FFFFFF', washOp: 230, ink: null });
    }
    glowAt(W / 2, H / 2, 900, 500, PAL.cyan, 40 * (1 - k));
    for (let i = 0; i < 30; i++) {
      const bx = hash(i * 7.7) * W, ph = frac(t * .5 + hash(i * 1.1)), by = H + 60 - ph * (H + 200), r = 8 + 22 * hash(i * 3.3);
      paint(ellPts(bx + Math.sin(ph * 12 + i) * 16, by, r, r, 12), { wash: '#FFFFFF', washOp: 120, ink: '#7FCFD8', sw: .5 });
    }
    sfx('SPLOOSH', 960, 420, 190, PAL.cyan, t - 46.9, { life: .85, rot: -.06, stroke: PAL.cream });
  }
  function wave(t, lt, dur) {
    if (t < 45.46) shove(t);
    else if (t < 47.0) surf(t);
    else foam(t);
    if (t >= 46.9 && t < 47.0) sfx('SPLOOSH', 960, 420, 190, PAL.cyan, t - 46.9, { life: .85, rot: -.06, stroke: PAL.cream });
  }

  chapter('couch', 31.56, 47.78, [[31.56, screens], [35.44, dreams], [38.84, scroll], [42.78, wave]]);
})();
