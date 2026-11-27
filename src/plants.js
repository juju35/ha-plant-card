// ---------------------------------------------------------------------------
// Plant illustrations
// ---------------------------------------------------------------------------
// Every plant is drawn in SVG (viewBox 0 0 120 140): its foliage, its pot, the soil probe and the effects of its state
// (dry, wet, cold, hot). A variety recolors a plant (color swaps, a leaf tint) or adds a variegation pattern to its
// leaves (marbled, speckled, splashed, edged, half-moon, pinstriped, center stripe); a few have their own drawing.
// PlantArt.svg(key, { state, variety, pot, probe, sway }) returns the markup; PlantArt.list describes the plants.
export const PlantArt = (() => {
  let uid = 0;
  const C = { d: '#2c5a33', m: '#3d7540', l: '#58904a', xl: '#7ea95f', y: '#d8d36a', br: '#7a5236', brd: '#5c3d28' };
  const R = Math.PI / 180;
  const hex = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16)); };
  let MODE = { swap: {} };
  const shade = (c, k) => { c = MODE.swap[c] || c; if (!/^#[0-9a-f]{3,6}$/i.test(c)) return c; const t = k < 0 ? 0 : 255, p = Math.abs(k); return `#${hex(c).map((v) => Math.round(v + (t - v) * p).toString(16).padStart(2, '0')).join('')}`; };
  let jr = () => 0.5;
  const jit = (c) => shade(c, (jr() - 0.5) * 0.22);
  const n1 = (v) => Math.round(v * 10) / 10;

  // feuille simple : base en (x,y), a=0 vers le haut
  const pat = (L, W) => {
    const m = MODE.pattern; if (!m) return '';
    const c1 = MODE.c1 || '#f2f2e6', c2 = MODE.c2 || c1, r = jr;
    const env = (t) => W * 0.78 * Math.sin(Math.PI * Math.min(0.98, t * 1.02));
    const pt = (sp = 0.8) => { const t = 0.12 + r() * 0.76; return [n1((r() * 2 - 1) * env(t) * sp), n1(L * t)]; };
    let o = '';
    if (m === 'speckle') for (let k = 0; k < 14; k++) { const [x, y] = pt(0.85); o += `<circle cx="${x}" cy="${y}" r="${n1(0.25 + r() * 0.5)}" fill="${k % 3 ? c1 : c2}"/>`; }
    if (m === 'splash') for (let k = 0; k < 3; k++) { const [x, y] = pt(0.45); o += `<ellipse cx="${x}" cy="${y}" rx="${n1(Math.abs(W) * (0.2 + r() * 0.25))}" ry="${n1(Math.abs(L) * (0.06 + r() * 0.08))}" fill="${k % 2 ? c2 : c1}" opacity=".95"/>`; }
    if (m === 'marble') { for (let k = 0; k < 4; k++) { const [x, y] = pt(0.5); o += `<ellipse cx="${x}" cy="${y}" rx="${n1(Math.abs(W) * (0.15 + r() * 0.3))}" ry="${n1(Math.abs(L) * (0.05 + r() * 0.1))}" fill="${k % 2 ? c2 : c1}" transform="rotate(${n1(r() * 60 - 30)} ${x} ${y})" opacity=".92"/>`; } for (let k = 0; k < 3; k++) { const t = 0.2 + r() * 0.6, sd = r() > 0.5 ? 1 : -1; o += `<path d="M0 ${n1(L * t)}q${n1(sd * env(t) * 0.4)} ${n1(L * 0.04)} ${n1(sd * env(t) * 0.75)} ${n1(L * 0.1)}" stroke="${c1}" stroke-width="${n1(0.4 + r() * 0.6)}" fill="none"/>`; } }
    if (m === 'margin') o += `<path d="M0 0C${n1(W * 0.9)} ${n1(L * 0.12)} ${n1(W * 1.08)} ${n1(L * 0.58)} 0 ${n1(L)}C${n1(-W * 1.02)} ${n1(L * 0.6)} ${n1(-W * 0.85)} ${n1(L * 0.14)} 0 0Z" fill="none" stroke="${c1}" stroke-width="${n1(Math.max(0.7, Math.abs(W) * 0.32))}" opacity=".95"/>`;
    if (m === 'halfmoon') o += `<path d="M0 0C${n1(-W * 0.85)} ${n1(L * 0.14)} ${n1(-W * 1.02)} ${n1(L * 0.6)} 0 ${n1(L)}Q${n1(W * 0.1)} ${n1(L * 0.5)} 0 0Z" fill="${c1}" opacity=".95"/>`;
    if (m === 'pinstripe') for (let k = 1; k < 10; k++) { const t = k / 10.5, e = env(t); o += `<path d="M0 ${n1(L * t)}q${n1(e * 0.5)} ${n1(L * 0.03)} ${n1(e * 0.85)} ${n1(L * 0.08)}M0 ${n1(L * t)}q${n1(-e * 0.5)} ${n1(L * 0.03)} ${n1(-e * 0.85)} ${n1(L * 0.08)}" stroke="${c1}" stroke-width=".35" fill="none" opacity=".95"/>`; }
    if (m === 'center') o += `<path d="M0 ${n1(L * 0.04)}Q${n1(W * 0.3)} ${n1(L * 0.5)} 0 ${n1(L * 0.92)}Q${n1(-W * 0.3)} ${n1(L * 0.5)} 0 ${n1(L * 0.04)}Z" fill="${c1}" opacity=".9"/>`;
    return o;
  };
  const leaf = (x, y, a, len, w, fill, vein = 1) => {
    const depth = Math.max(-0.16, Math.min(0.1, (64 - y) / 300));
    const f = shade(jit(MODE.tint || MODE.swap[fill] || fill), depth), lt = shade(f, 0.12), dk = shade(f, -0.14);
    const L = -len, W = w;
    let v = '';
    if (vein && len > 11) { for (let k = 1; k < 5; k++) { const t = 0.18 * k, yy = L * t, ww = W * 0.85 * Math.sin(Math.PI * Math.min(0.95, t + 0.1)); v += `<path d="M0 ${n1(yy)}Q${n1(ww * 0.45)} ${n1(yy + L * 0.06)} ${n1(ww * 0.9)} ${n1(yy + L * 0.14)}M0 ${n1(yy)}Q${n1(-ww * 0.45)} ${n1(yy + L * 0.06)} ${n1(-ww * 0.9)} ${n1(yy + L * 0.14)}" stroke="${shade(f, 0.28)}" stroke-width=".4" fill="none" opacity=".75"/>`; } }
    return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(a)})"><path d="M0 0C${n1(W * 0.9)} ${n1(L * 0.12)} ${n1(W * 1.08)} ${n1(L * 0.58)} 0 ${n1(L)}Q${n1(W * 0.1)} ${n1(L * 0.5)} 0 0Z" fill="${dk}"/><path d="M0 0C${n1(-W * 0.85)} ${n1(L * 0.14)} ${n1(-W * 1.02)} ${n1(L * 0.6)} 0 ${n1(L)}Q${n1(W * 0.1)} ${n1(L * 0.5)} 0 0Z" fill="${lt}"/><path d="M0 0C${n1(-W * 0.85)} ${n1(L * 0.14)} ${n1(-W * 1.02)} ${n1(L * 0.6)} 0 ${n1(L)}" stroke="${shade(f, 0.32)}" stroke-width=".35" fill="none" opacity=".6"/>${
      vein ? `<path d="M0 0Q${n1(W * 0.1)} ${n1(L * 0.5)} 0 ${n1(L * 0.94)}" stroke="${shade(f, 0.38)}" stroke-width="${len > 20 ? 0.8 : 0.5}" fill="none" opacity=".85"/>${v}` : ''
    }${pat(L, W)}</g>`;
  };
  const st = (d, c = '#4f7d3a', w = 1.6) => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  const bez = (p0, p1, p2, t) => [
    (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
    (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
  ];
  const tan = (p0, p1, p2, t) => {
    const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
    const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
    return Math.atan2(dy, dx) / R + 90; // angle « leaf »
  };
  // tige courbe garnie de folioles
  function frond(p0, p1, p2, o) {
    const { n = 8, len = 10, w = 3, fill = C.m, spread = 55, t0 = 0.2, sc = '#4f7d3a', sw = 1.3, shrink = 0.5, tip = true, alt = false, vein = 0 } = o;
    let s = st(`M${p0}Q${p1} ${p2}`, sc, sw);
    for (let i = 0; i < n; i++) {
      const t = t0 + ((1 - t0) * i) / Math.max(1, n - 1);
      const p = bez(p0, p1, p2, t), a = tan(p0, p1, p2, t), L = len * (1 - shrink * t);
      if (!alt || i % 2 === 0) s += leaf(p[0], p[1], a - spread, L, w, fill, vein);
      if (!alt || i % 2 === 1) s += leaf(p[0], p[1], a + spread, L, w, fill, vein);
    }
    if (tip) s += leaf(p2[0], p2[1], tan(p0, p1, p2, 1), len * (1 - shrink), w, fill, vein);
    return s;
  }
  const circ = (x, y, r, f, extra = '') => `<circle cx="${n1(x)}" cy="${n1(y)}" r="${r}" fill="${f}" ${extra}/>`;
  const flower5 = (x, y, r, petal, center, n = 5) => {
    let s = `<g transform="translate(${n1(x)} ${n1(y)})">`;
    for (let i = 0; i < n; i++) s += `<ellipse cx="0" cy="${-r}" rx="${r * 0.62}" ry="${r}" fill="${petal}" transform="rotate(${(360 / n) * i})"/>`;
    return `${s}<circle r="${r * 0.45}" fill="${center}"/></g>`;
  };
  const rng = (seed) => () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

  // ---------- plantes ----------
  const P = {};
  const def = (key, meta, fn) => (P[key] = Object.assign({ key }, meta, { fn }));

  /* ======== INTÉRIEUR ======== */
  const monsteraFn = (kind) => (id) => {
    const albo = !!kind;
    const shape = 'M0 0C-5 5-17 7-23 0C-30-9-29-29-19-40C-13-46-5-49 0-50C5-49 13-46 19-40C29-29 30-9 23 0C17 7 5 5 0 0Z';
    const right = 'M0 0C5 5 17 7 23 0C30-9 29-29 19-40C13-46 5-49 0-50Q1.6-25 0 0Z';
    const cut = (y, sx, x0) => `<path d="M${x0 * sx} ${y}Q${20 * sx} ${y - 4} ${36 * sx} ${y - 11}" stroke="#000" stroke-width="3.4" stroke-linecap="round" fill="none"/>`;
    const mk = (n, cuts, holes) => `<mask id="mo${id}${n}" maskUnits="userSpaceOnUse" x="-40" y="-56" width="80" height="70"><path d="${shape}" fill="#fff"/>${cuts}${holes.map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="1.3" ry="3" fill="#000" transform="rotate(${a} ${x} ${y})"/>`).join('')}</mask>`;
    const masks =
      mk('a', cut(-12, -1, 11) + cut(-25, -1, 10) + cut(-36, -1, 9) + cut(-17, 1, 12) + cut(-30, 1, 10), [[-6, -18, -30], [6, -23, 30], [-5, -31, -30]]) +
      mk('b', cut(-14, -1, 13) + cut(-28, -1, 12) + cut(-20, 1, 13) + cut(-34, 1, 12), [[5, -12, 30], [-6, -22, -30]]) +
      mk('c', '', []);
    const clip = `<clipPath id="mc${id}"><path d="${shape}"/></clipPath>`;
    const varieg = (seed) => {
      if (!albo) return '';
      const r = rng(seed);
      let v = '';
      if (kind === 'thai') { for (let k = 0; k < 60; k++) { const x = (r() - 0.5) * 50, y = -r() * 48; v += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(0.6 + r() * 1.8)}" ry="${n1(0.5 + r() * 1)}" fill="#efe9c8" opacity=".95"/>`; } return `<g clip-path="url(#mc${id})">${v}</g>`; }
      const W1 = kind === 'aurea' ? '#e8d25a' : '#f4f2e6', W2 = kind === 'aurea' ? '#c9c45a' : '#cfdcb4';
      if (seed % 3 === 0) v += `<path d="M0 0C-5 5-17 7-23 0C-30-9-29-29-19-40C-13-46-5-49 0-50Q-1.5-25 0 0Z" fill="${W1}"/>`;
      else if (seed % 3 === 1) v += `<path d="M-30-10Q-10-20 4-46L30-48L30 10L-30 10Z" fill="${W1}"/>`;
      for (let k = 0; k < 18; k++) { const x = (r() - 0.5) * 50, y = -r() * 48; v += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(1 + r() * 4)}" ry="${n1(0.8 + r() * 2.4)}" fill="${r() > 0.5 ? W1 : W2}" transform="rotate(${n1(r() * 180)} ${n1(x)} ${n1(y)})" opacity=".9"/>`; }
      return `<g clip-path="url(#mc${id})">${v}</g>`;
    };
    const L = (x, y, a, s, f, m, sx = 1, seed = 1) => {
      const ff = shade(f, Math.max(-0.12, Math.min(0.08, (60 - y) / 300)));
      return `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s * sx} ${s})"><g mask="url(#mo${id}${m})"><path d="${shape}" fill="${shade(ff, 0.08)}"/>${varieg(seed)}<path d="${right}" fill="rgba(0,0,0,.14)"/>${[-12, -20, -28, -36].map((yy) => `<path d="M0 ${yy + 4}Q-12 ${yy} -24 ${yy - 7}M0 ${yy + 1}Q12 ${yy - 3} 24 ${yy - 10}" stroke="rgba(255,255,255,.22)" stroke-width=".6" fill="none"/>`).join('')}</g><path d="M0 1Q1.6-25 0-48" stroke="${albo ? '#e8ecd8' : shade(ff, 0.4)}" stroke-width="1.3" fill="none"/></g>`;
    };
    const pc = albo ? '#9aa874' : '#5d8a4c';
    const pet = (d) => st(d, pc, 2);
    return {
      defs: masks + clip,
      back:
        pet('M60 99Q56 72 37 54') + pet('M60 99Q60 64 58 40') + pet('M60 99Q70 72 81 52') + pet('M60 99Q52 84 30 70') +
        L(37, 54, -70, 0.52, '#2f5e36', 'c', 0.8, 2) +
        L(30, 70, -118, 0.58, '#2c5a33', 'c', 0.85, 1) +
        L(58, 40, -6, 0.62, '#33663b', 'b', 0.95, 3) +
        L(81, 52, 112, 0.7, '#2f6038', 'a', 0.85, 4),
    };
  };
  def('monstera', { fr: 'Monstera', en: 'Monstera', where: 'indoor', pot: 'ceramic' }, monsteraFn(false));

  def('ficus-lyrata', { fr: 'Figuier lyre', en: 'Fiddle-leaf fig', where: 'indoor', pot: 'concrete' }, () => {
    const shape = 'M0 0C-5-3-8-9-7-14C-6-19-12-22-13-28C-14-35-7-40-1-38C1-41 5-41 7-39C12-37 15-31 13-25C11-20 6-18 7-13C8-8 5-3 0 0Z';
    const half = 'M0 0C5-3 8-8 7-13C6-18 11-20 13-25C15-31 12-37 7-39C5-41 1-41-1-38Q1-20 0 0Z';
    const L = (x, y, a, sc, f) => { const ff = shade(f, Math.max(-0.14, Math.min(0.1, (60 - y) / 260))); return `<g transform="translate(${x} ${y}) rotate(${a}) scale(${sc})"><path d="${shape}" fill="${shade(ff, 0.1)}"/><path d="${half}" fill="${shade(ff, -0.12)}"/><path d="M0 0Q1-20-1-37M0-10L-6-15M0-10L6-14M0-18L-8-24M0-18L8-23M0-26L-7-32M0-26L7-31" stroke="${shade(ff, 0.38)}" stroke-width=".6" fill="none"/><path d="M-8-16C-10-22-12-28-8-34" stroke="rgba(255,255,255,.22)" stroke-width="1.4" fill="none"/></g>`; };
    let s = `<path d="M59 100Q57 70 60 40Q62 26 60 16L62 16Q64 28 62 42Q60 70 62 100Z" fill="#6d5a42"/>${st('M60 70Q52 64 46 62', '#6d5a42', 1.4)}`;
    [[60, 92, -78, 0.72, '#24452c'], [61, 86, 74, 0.72, '#24452c'], [61, 76, -60, 0.78, '#2a5232'], [60, 68, 56, 0.8, '#2a5232'], [46, 62, -84, 0.6, '#2f5a36'], [60, 56, -44, 0.78, '#2f5a36'], [61, 48, 38, 0.76, '#346340'], [60, 38, -28, 0.72, '#3a6b44'], [61, 32, 24, 0.66, '#3f7448'], [60, 22, -10, 0.56, '#4a804f'], [61, 18, 14, 0.46, '#5a8f58']].forEach((l) => {
      s += L(...l);
    });
    return { back: s };
  });

  def('sansevieria', { fr: 'Sansevieria', en: 'Snake plant', where: 'indoor', pot: 'white' }, () => {
    const sw = (x, w, h, lean, f) => {
      const d = `M${x - w} 100Q${x - w * 1.1 + lean * 0.4} ${100 - h * 0.5} ${x + lean} ${100 - h}Q${x + w * 1.1 + lean * 0.4} ${100 - h * 0.5} ${x + w} 100Z`;
      let bands = '';
      for (let k = 1; k < 5; k++) {
        const yy = 100 - (h * k) / 5.5, xx = x + (lean * k) / 6;
        bands += `<path d="M${xx - w * 0.7} ${yy}q${w * 0.7} -3 ${w * 1.4} 0" stroke="rgba(200,230,170,.45)" stroke-width="1.1" fill="none"/>`;
      }
      return `<path d="${d}" fill="${f}" stroke="#cfcf63" stroke-width="1.3"/>${bands}`;
    };
    return { back: sw(46, 6, 60, -12, '#2f6b47') + sw(72, 6, 56, 13, '#2f6b47') + sw(56, 7, 82, -4, '#2a6141') + sw(65, 7, 72, 5, '#357552') + sw(60, 5, 46, 0, '#3f8a5c') };
  });

  def('pothos', { fr: 'Pothos', en: 'Pothos', where: 'indoor', pot: 'sage' }, () => {
    const H = (x, y, a, s = 1, f = '#3f7d3e') => {
      const ff = shade(f, Math.max(-0.14, Math.min(0.08, (70 - y) / 260)));
      return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(a)}) scale(${s})"><path d="M0-14C-2-11-9-8-8-3C-7 1-2 1 0-2C2 1 7 1 8-3C9-8 2-11 0-14Z" fill="${shade(ff, 0.08)}"/><path d="M0-14C2-11 9-8 8-3C7 1 2 1 0-2Q.6-8 0-14Z" fill="${shade(ff, -0.12)}"/><path d="M-1-3Q-4-6-3-9M2-5Q5-7 4-10M-2-8Q-3-11-1-12" stroke="#e8e08a" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".85"/><path d="M0-2Q.6-8 0-13" stroke="${shade(ff, 0.35)}" stroke-width=".6" fill="none"/></g>`;
    };
    let back = st('M58 99Q50 80 42 64', '#6a8f45', 1.2) + st('M62 99Q70 78 80 62', '#6a8f45', 1.2) + st('M60 99Q60 76 60 54', '#6a8f45', 1.2) + st('M60 99Q48 88 38 84', '#6a8f45', 1.1) + st('M60 99Q74 88 84 84', '#6a8f45', 1.1);
    [[42, 64, -20, 1.2], [46, 76, -50, 1.1], [80, 62, 20, 1.2], [74, 74, 55, 1.1], [60, 54, 0, 1.25], [56, 68, -30, 1.05], [65, 70, 32, 1.05], [38, 84, -70, 1], [84, 84, 70, 1], [52, 86, -40, 1], [68, 88, 44, 1], [60, 82, 6, 0.95]].forEach(([x, y, a, sc]) => {
      back += H(x, y, a, sc);
    });
    const vine = (p0, p1, p2, side) => {
      let s = st(`M${p0}Q${p1} ${p2}`, '#6a8f45', 1.1);
      for (let i = 0; i < 7; i++) { const t = 0.1 + i * 0.14, p = bez(p0, p1, p2, t); s += H(p[0], p[1], 180 + side * (i % 2 ? 45 : -15), 1 - i * 0.05); }
      return s;
    };
    return { back, front: vine([34, 101], [18, 112], [24, 138], 1) + vine([86, 101], [102, 114], [94, 136], -1) };
  });

  def('cactus', { fr: 'Cactus', en: 'Cactus', where: 'indoor', pot: 'terracotta' }, () => {
    const col = '#4f9a5a';
    let s = st('M54 74H42V54', col, 10) + st('M66 62H79V40', col, 10);
    s += `<rect x="51" y="26" width="18" height="76" rx="9" fill="${col}"/>`;
    s += st('M60 30V100', 'rgba(255,255,255,.18)', 1.2) + st('M55 34V100', 'rgba(0,0,0,.12)', 1) + st('M65 34V100', 'rgba(0,0,0,.12)', 1);
    let sp = '';
    const r = rng(7);
    for (let i = 0; i < 26; i++) sp += `<circle cx="${n1(52 + r() * 16)}" cy="${n1(30 + r() * 68)}" r=".7" fill="#f3f0d0"/>`;
    for (let i = 0; i < 6; i++) sp += `<circle cx="${n1(38 + r() * 8)}" cy="${n1(52 + r() * 22)}" r=".7" fill="#f3f0d0"/><circle cx="${n1(75 + r() * 8)}" cy="${n1(40 + r() * 22)}" r=".7" fill="#f3f0d0"/>`;
    return { back: s + sp + flower5(60, 25, 4, '#f06ba0', '#ffd36b', 6) };
  });

  def('aloe', { fr: 'Aloe vera', en: 'Aloe vera', where: 'indoor', pot: 'terracotta' }, () => {
    let s = '';
    const a = [-68, 66, -46, 44, -24, 22, -8, 8];
    const l = [34, 32, 44, 42, 52, 50, 46, 40];
    a.forEach((ang, i) => {
      s += leaf(60, 100, ang, l[i], 7.5, i % 2 ? '#78ad84' : '#86b991', 0);
      const r = rng(i + 3);
      for (let k = 0; k < 4; k++) {
        const t = 0.25 + r() * 0.5, d = l[i] * t;
        s += `<circle cx="${n1(60 + Math.sin(ang * R) * d + (r() - 0.5) * 3)}" cy="${n1(100 - Math.cos(ang * R) * d)}" r=".9" fill="#e8f2e0" opacity=".8"/>`;
      }
    });
    return { back: s };
  });

  def('orchidee', { fr: 'Orchidée', en: 'Orchid', where: 'indoor', pot: 'white' }, () => {
    let s = st('M66 99L66 26', '#a98a5c', 1.2);
    s += st('M62 96Q63 44 66 30Q78 20 92 32', '#6b7f3a', 1.3);
    const fl = (x, y, sc) =>
      `<g transform="translate(${x} ${y}) scale(${sc})"><ellipse cx="-5" cy="-1" rx="5" ry="3.2" fill="#f7e4f1" transform="rotate(-20)"/><ellipse cx="5" cy="-1" rx="5" ry="3.2" fill="#f7e4f1" transform="rotate(20)"/><ellipse cx="0" cy="-5" rx="3" ry="4.4" fill="#fbeef7"/><ellipse cx="-3" cy="4" rx="2.6" ry="3.6" fill="#f3d2e6" transform="rotate(30)"/><ellipse cx="3" cy="4" rx="2.6" ry="3.6" fill="#f3d2e6" transform="rotate(-30)"/><ellipse cx="0" cy="3" rx="2.2" ry="2.6" fill="#d9478f"/><circle cy=".5" r="1" fill="#ffd36b"/></g>`;
    s += `${fl(68, 30, 1) + fl(78, 25, 1.05) + fl(87, 28, 0.95)}<ellipse cx="93" cy="34" rx="2" ry="2.6" fill="#ecc9de"/>`;
    s += leaf(60, 99, -74, 32, 9, C.d) + leaf(60, 99, 72, 30, 9, C.m) + leaf(60, 99, -50, 26, 8, C.m) + leaf(60, 99, 46, 24, 8, C.l);
    return { back: s };
  });

  def('calathea', { fr: 'Calathea', en: 'Calathea', where: 'indoor', pot: 'ceramic' }, () => {
    const L = (x, y, a, len) => {
      let s = `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0Q12 ${-len * 0.5} 0 ${-len}Q-12 ${-len * 0.5} 0 0Z" fill="#3d7552"/>`;
      for (let k = 1; k < 6; k++) {
        const yy = (-len * k) / 6.3, w = 9 * Math.sin((Math.PI * k) / 6.3);
        s += `<path d="M0 ${n1(yy)}Q${n1(w * 0.5)} ${n1(yy - 3)} ${n1(w)} ${n1(yy - 5)}M0 ${n1(yy)}Q${n1(-w * 0.5)} ${n1(yy - 3)} ${n1(-w)} ${n1(yy - 5)}" stroke="#a7d49a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
      }
      return `${s}<path d="M0 0L0 ${-len}" stroke="#bfe0a8" stroke-width=".9"/></g>`;
    };
    const stems = [[-42, 40, 64], [-16, 52, 70], [10, 56, 72], [38, 42, 66], [-62, 30, 84], [60, 30, 82]];
    let s = '';
    stems.forEach(([a, sl, ly]) => {
      const x = 60 + Math.sin(a * R) * sl * 0.5, y = 100 - Math.cos(a * R) * sl * 0.5;
      s += st(`M60 99L${n1(x)} ${n1(y)}`, '#6a5a7a', 1.3) + L(n1(x), n1(y), a, ly > 70 ? 26 : 34);
    });
    return { back: s };
  });

  def('zamioculcas', { fr: 'Zamioculcas', en: 'ZZ plant', where: 'indoor', pot: 'concrete' }, () => {
    let s = '';
    const fr = [
      [[56, 99], [40, 70], [28, 44]],
      [[60, 99], [58, 60], [56, 22]],
      [[64, 99], [80, 66], [92, 42]],
      [[58, 99], [48, 82], [32, 76]],
      [[62, 99], [74, 84], [90, 78]],
    ];
    fr.forEach((f, i) => {
      s += frond(f[0], f[1], f[2], { n: 5, len: 13, w: 6.5, fill: i % 2 ? '#2f7a45' : '#3e8f55', spread: 34, sc: '#4a7a3a', sw: 2, shrink: 0.2, t0: 0.32, vein: 1 });
    });
    return { back: s };
  });

  const pileaFn = (variant) => (id) => {
    const pts = [[30, 72, 8.5, 1], [36, 54, 9.5, 2], [48, 40, 10, 3], [64, 34, 10.5, 4], [80, 42, 10, 5], [90, 60, 9.5, 6], [92, 78, 8, 7], [42, 78, 7.5, 8], [76, 78, 7.5, 9], [58, 52, 9, 10], [52, 22, 8, 11], [72, 20, 7.5, 12], [26, 90, 6.5, 13]];
    let s = `<path d="M59 99Q57 80 58 62Q60 46 60 30" stroke="#7a8f4e" stroke-width="2.2" fill="none"/>${st('M59 70Q50 66 44 64', '#7a8f4e', 1.2)}`;
    pts.forEach(([x, y]) => {
      s += st(`M${x < 60 ? 59 : 60} ${Math.max(32, Math.min(92, y + 14))}Q${(60 + x) / 2} ${y - 4} ${x} ${y}`, '#8fa860', 0.9);
    });
    const coin = (x, y, r, seed) => {
      const ff = shade(seed % 2 ? '#3f8a40' : '#4a9646', Math.max(-0.12, Math.min(0.08, (60 - y) / 280)));
      const cid = `pc${id}_${seed}`, q = rng(seed * 31 + 7);
      let v = '';
      if (variant === 'mojito') {
        const blob = (cx, cy, rad, col) => { const n = 7, p = []; for (let k = 0; k < n; k++) { const a = (k / n) * 6.28, rr = rad * (0.55 + q() * 0.7); p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * (0.6 + q() * 0.5)]); } let d = `M${n1((p[0][0] + p[n - 1][0]) / 2)} ${n1((p[0][1] + p[n - 1][1]) / 2)}`; for (let k = 0; k < n; k++) { const a = p[k], b = p[(k + 1) % n]; d += `Q${n1(a[0])} ${n1(a[1])} ${n1((a[0] + b[0]) / 2)} ${n1((a[1] + b[1]) / 2)}`; } return `<path d="${d}Z" fill="${col}"/>`; };
        const cols = ['#c3db73', '#e9edc4', '#9cc45a', '#d6e59a'];
        for (let k = 0; k < 4; k++) v += blob(x + (q() - 0.5) * r * 1.4, y + (q() - 0.5) * r * 1.4, r * (0.35 + q() * 0.4), cols[(seed + k) % 4]);
        for (let k = 0; k < 6; k++) { const a = q() * 6.28; v += `<path d="M${n1(x + Math.cos(a) * r * 0.2)} ${n1(y + Math.sin(a) * r * 0.2)}Q${n1(x + Math.cos(a + 0.3) * r * 0.6)} ${n1(y + Math.sin(a + 0.3) * r * 0.6)} ${n1(x + Math.cos(a + 0.15) * r)} ${n1(y + Math.sin(a + 0.15) * r)}" stroke="${q() > 0.5 ? '#e3eab8' : '#2f6e34'}" stroke-width="${n1(0.5 + q())}" fill="none" opacity=".8"/>`; }
      } else if (variant === 'sugar') {
        for (let k = 0; k < 26; k++) { const a = q() * 6.28, d = Math.sqrt(q()) * r * 0.92; v += `<circle cx="${n1(x + Math.cos(a) * d)}" cy="${n1(y + Math.sin(a) * d)}" r="${n1(0.3 + q() * 0.45)}" fill="#f4f6ec" opacity=".9"/>`; }
      } else if (variant === 'splash') {
        for (let k = 0; k < 7; k++) { const a = q() * 6.28, d = Math.sqrt(q()) * r * 0.85; v += `<ellipse cx="${n1(x + Math.cos(a) * d)}" cy="${n1(y + Math.sin(a) * d)}" rx="${n1(0.8 + q() * 1.6)}" ry="${n1(0.6 + q() * 1)}" fill="#f2f4e6" opacity=".92" transform="rotate(${n1(q() * 180)} ${n1(x + Math.cos(a) * d)} ${n1(y + Math.sin(a) * d)})"/>`; }
      }
      let veins = '';
      for (let k = 0; k < 9; k++) { const a = (k / 9) * 6.28 + 0.3; veins += `<path d="M${x} ${y}L${n1(x + Math.cos(a) * r * 0.86)} ${n1(y + Math.sin(a) * r * 0.86)}" stroke="${shade(ff, 0.3)}" stroke-width=".35" opacity=".7"/>`; }
      return `<clipPath id="${cid}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath><circle cx="${x}" cy="${y}" r="${r}" fill="${ff}"/><g clip-path="url(#${cid})">${v}<path d="M${x - r} ${y}A${r} ${r} 0 0 0 ${x + r} ${y}Z" fill="rgba(0,0,0,.12)" transform="rotate(${(seed * 47) % 90 - 20} ${x} ${y})"/></g>${veins}<circle cx="${x}" cy="${y}" r="1" fill="${shade(ff, 0.35)}"/><path d="M${n1(x - r * 0.6)} ${n1(y - r * 0.45)}A${r * 0.75} ${r * 0.75} 0 0 1 ${n1(x + r * 0.2)} ${n1(y - r * 0.75)}" stroke="rgba(255,255,255,.3)" stroke-width="1.1" fill="none"/>`;
    };
    pts.forEach(([x, y, r, seed]) => {
      s += coin(x, y, r, seed);
    });
    return { back: s };
  };
  def('pilea', { fr: 'Pilea', en: 'Chinese money plant', where: 'indoor', pot: 'white' }, pileaFn(''));

  def('spathiphyllum', { fr: 'Fleur de lune', en: 'Peace lily', where: 'indoor', pot: 'ceramic' }, () => {
    let s = '';
    [-58, -34, -12, 14, 36, 60, -46, 48].forEach((a, i) => {
      s += leaf(60, 99, a, 38 + (i % 3) * 6, 8.5, i % 2 ? C.d : '#256b40');
    });
    const spa = (x, y, a) => `${st(`M60 99Q${(60 + x) / 2} ${y + 20} ${x} ${y + 8}`, '#4f7d3a', 1.2)}<g transform="translate(${x} ${y + 8}) rotate(${a})"><path d="M0 0Q8-8 0-20Q-8-8 0 0Z" fill="#fbfbf5" stroke="#dfe5d5" stroke-width=".6"/><rect x="-1.3" y="-12" width="2.6" height="9" rx="1.3" fill="#e9dd8f"/></g>`;
    s += spa(48, 24, -14) + spa(72, 28, 16) + spa(60, 16, 0);
    return { back: s };
  });

  def('fougere', { fr: 'Fougère', en: 'Boston fern', where: 'indoor', pot: 'sage' }, () => {
    let s = '';
    const ends = [[8, 96], [16, 64], [34, 36], [60, 22], [86, 36], [104, 64], [112, 96]];
    ends.forEach(([x, y], i) => {
      const c = [60 + (x - 60) * 0.25, y - 18];
      s += frond([60, 99], c, [x, y], { n: 11, len: 8, w: 2.4, fill: i % 2 ? C.l : C.m, spread: 70, sc: '#4e8a3d', sw: 1.1, shrink: 0.55, t0: 0.15 });
    });
    return { back: s };
  });

  def('kentia', { fr: 'Palmier kentia', en: 'Kentia palm', where: 'indoor', pot: 'concrete' }, () => {
    let s = '';
    const fr = [
      [[58, 99], [36, 40], [8, 50]],
      [[60, 99], [52, 30], [30, 14]],
      [[62, 99], [70, 26], [94, 16]],
      [[64, 99], [86, 40], [112, 52]],
      [[60, 99], [60, 40], [62, 10]],
    ];
    fr.forEach((f, i) => {
      s += frond(f[0], f[1], f[2], { n: 12, len: 16, w: 2, fill: i % 2 ? '#3b8d52' : '#4aa063', spread: 58, sc: '#6a8a40', sw: 1.5, shrink: 0.55, t0: 0.4, tip: false });
    });
    return { back: s };
  });

  def('ficus-elastica', { fr: 'Caoutchouc', en: 'Rubber plant', where: 'indoor', pot: 'white' }, () => {
    let s = st('M60 99L60 18', '#6d5a3c', 2.4);
    const L = (y, a, sc) =>
      `<g transform="translate(60 ${y}) rotate(${a}) scale(${sc})"><path d="M0 0C10-6 12-26 0-36C-12-26-10-6 0 0Z" fill="#2c4a3a"/>${MODE.pattern === 'margin' ? `<path d="M0 0C10-6 12-26 0-36C-12-26-10-6 0 0Z" fill="none" stroke="${MODE.c1}" stroke-width="3.4" opacity=".95"/><path d="M-3-6C-6-14-5-24-1-31" stroke="${MODE.c2 || MODE.c1}" stroke-width="2" fill="none" opacity=".6"/>` : ''}<path d="M0-2L0-34" stroke="#b5485a" stroke-width="1.1"/><path d="M-4-8Q-6-20-2-30" stroke="rgba(255,255,255,.18)" stroke-width="1.6" fill="none"/></g>`;
    [[90, -76, 0.8], [82, 74, 0.8], [70, -56, 0.85], [60, 54, 0.85], [48, -36, 0.8], [38, 32, 0.76], [28, -16, 0.66]].forEach((l) => {
      s += L(...l);
    });
    s += `<path d="M60 22Q63 12 60 6Q57 12 60 22Z" fill="#c44a5e"/>`;
    return { back: s };
  });

  def('dracaena', { fr: 'Dracaena', en: 'Dragon tree', where: 'indoor', pot: 'concrete' }, () => {
    const tuft = (x, y, s = 1) => {
      let o = '';
      for (let a = -100; a <= 100; a += 16) o += `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="M0 0Q2-11 0-22Q-2-11 0 0Z" fill="#4c9a4e" stroke="#b8465a" stroke-width=".5"/></g>`;
      return o;
    };
    let s = st('M58 99Q50 60 38 34', '#8a7550', 2.4) + st('M61 99Q62 50 66 18', '#8a7550', 2.6) + st('M63 99Q74 70 86 50', '#8a7550', 2.2);
    s += tuft(38, 34, 0.9) + tuft(66, 18, 1) + tuft(86, 50, 0.85);
    return { back: s };
  });

  def('chlorophytum', { fr: 'Plante araignée', en: 'Spider plant', where: 'indoor', pot: 'white' }, () => {
    let s = '';
    const blade = (p1, p2) => `<path d="M60 99Q${p1} ${p2}" stroke="#4f9a52" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M60 99Q${p1} ${p2}" stroke="#f1f3dc" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
    [[[44, 60], [18, 74]], [[50, 50], [30, 46]], [[58, 50], [50, 34]], [[64, 50], [74, 32]], [[70, 54], [92, 46]], [[76, 62], [104, 76]], [[52, 70], [26, 96]], [[68, 70], [96, 98]]].forEach(([a, b]) => {
      s += blade(a.join(' '), b.join(' '));
    });
    const front = st('M76 70Q104 70 104 112', '#b9a86e', 1) + [-70, -40, -10, 20, 50, 80].map((a) => `<g transform="translate(104 112) rotate(${a})"><path d="M0 0Q1.6-5 0-10Q-1.6-5 0 0Z" fill="#5aa85a"/></g>`).join('');
    return { back: s, front };
  });

  def('echeveria', { fr: 'Succulente', en: 'Echeveria', where: 'indoor', pot: 'bowl' }, () => {
    let s = '';
    const lay = (n, len, w, f, base) => {
      for (let i = 0; i < n; i++) {
        const a = -84 + (168 / (n - 1)) * i;
        s += `<g transform="translate(60 ${base}) rotate(${a})"><path d="M0 0Q${w} ${-len * 0.5} 0 ${-len}Q${-w} ${-len * 0.5} 0 0Z" fill="${f}"/><circle cy="${-len + 1.2}" r="1.3" fill="#e0889a"/></g>`;
      }
    };
    lay(9, 32, 10, '#86ada3', 102);
    lay(7, 26, 9, '#97bdb1', 100);
    lay(5, 20, 8, '#a9cbbe', 99);
    lay(3, 14, 6.5, '#bcd8cb', 98);
    return { back: s };
  });

  /* ======== EXTÉRIEUR ======== */
  def('tomate', { fr: 'Tomate', en: 'Tomato', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = st('M72 101L72 14', '#a7865a', 1.8) + st('M60 99Q62 60 64 20', '#4f8a3a', 2);
    s += st('M70 40H74M70 64H74', '#e6dcc0', 1);
    [[[62, 80], [44, 74], [30, 62]], [[62, 66], [80, 60], [94, 50]], [[63, 50], [46, 42], [34, 30]], [[63, 36], [80, 30], [90, 18]]].forEach((f, i) => {
      s += frond(f[0], f[1], f[2], { n: 4, len: 8, w: 3.6, fill: i % 2 ? C.m : C.l, spread: 50, sc: '#4f8a3a', sw: 1.2, shrink: 0.2, t0: 0.35, vein: 1 });
    });
    const tom = (x, y, r, f) => `${circ(x, y, r, f)}<path d="M${x} ${y - r}l-2.4-1.4M${x} ${y - r}l2.4-1.4M${x} ${y - r}l0-2.4" stroke="#3e7a2e" stroke-width="1"/>${circ(x - r * 0.35, y - r * 0.35, r * 0.25, 'rgba(255,255,255,.35)')}`;
    s += tom(44, 82, 6, '#e0412f') + tom(54, 88, 5, '#ea5a32') + tom(80, 74, 5.5, '#e0412f') + tom(48, 50, 4.5, '#f08a3a') + tom(82, 40, 4, '#9fcf5a');
    return { back: s };
  });

  def('basilic', { fr: 'Basilic', en: 'Basil', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = st('M60 99Q56 74 46 60M60 99Q64 72 76 58M60 99L60 50', '#5f9a3d', 1.4);
    const r = rng(11);
    const pts = [];
    for (let i = 0; i < 34; i++) {
      const a = r() * Math.PI, rad = 10 + r() * 28;
      pts.push([60 + Math.cos(a) * rad * 1.15, 92 - Math.sin(a) * rad * 1.25, (r() - 0.5) * 140]);
    }
    pts.sort((a, b) => a[1] - b[1]);
    pts.forEach(([x, y, a], i) => {
      s += `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(a)})"><path d="M0 4Q7-2 0-9Q-7-2 0 4Z" fill="${i % 3 ? '#5cb85c' : '#4aa24c'}"/><path d="M0 3L0-7" stroke="rgba(0,0,0,.14)" stroke-width=".7"/></g>`;
    });
    return { back: s };
  });

  def('lavande', { fr: 'Lavande', en: 'Lavender', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = '';
    for (let a = -60; a <= 60; a += 12) s += leaf(60, 99, a, 18, 1.6, '#93a88f', 0);
    const stems = [-38, -28, -18, -9, 0, 9, 18, 28, 38];
    stems.forEach((a, i) => {
      const h = 58 + ((i * 7) % 3) * 8, x = 60 + Math.sin(a * R) * h, y = 99 - Math.cos(a * R) * h;
      s += st(`M60 99Q${n1(60 + Math.sin(a * R) * h * 0.4)} ${n1(99 - h * 0.6)} ${n1(x)} ${n1(y)}`, '#8aa07c', 1);
      for (let k = 0; k < 6; k++) {
        const t = k / 6, px = x - Math.sin(a * R) * 14 * t, py = y + Math.cos(a * R) * 14 * t;
        s += `<ellipse cx="${n1(px)}" cy="${n1(py)}" rx="${n1(2.2 - t * 0.5)}" ry="2" fill="${k % 2 ? '#8a6cc9' : '#7a5bb8'}"/>`;
      }
    });
    return { back: s };
  });

  def('rosier', { fr: 'Rosier', en: 'Rose bush', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = '';
    const stems = [[[60, 99], [46, 60], [40, 30]], [[60, 99], [64, 56], [62, 20]], [[60, 99], [78, 64], [84, 36]], [[60, 99], [40, 84], [28, 62]], [[60, 99], [82, 86], [94, 64]], [[60, 99], [56, 76], [50, 52]]];
    stems.forEach((f) => {
      s += st(`M${f[0]}Q${f[1]} ${f[2]}`, '#5d6b32', 1.6);
      for (let k = 0; k < 4; k++) { const t = 0.25 + k * 0.18, p = bez(f[0], f[1], f[2], t), a = tan(f[0], f[1], f[2], t); s += st(`M${n1(p[0])} ${n1(p[1])}l${k % 2 ? 1.4 : -1.4} -1.2`, '#7a4a2a', 0.7); const side = k % 2 ? 1 : -1, q = [p[0] + side * 4, p[1] - 2]; s += st(`M${n1(p[0])} ${n1(p[1])}L${n1(q[0])} ${n1(q[1])}`, '#5d6b32', 0.8) + leaf(q[0], q[1], a + side * 70, 8, 3.6, '#2f5e34', 1) + leaf(q[0], q[1], a + side * 30, 6.5, 3, '#2f5e34', 1) + leaf(q[0], q[1], a + side * 110, 6.5, 3, '#2f5e34', 1); }
    });
    const rose = (x, y, r, c) => {
      const d = shade(c, -0.3), l = shade(c, 0.15);
      return `<g transform="translate(${x} ${y})"><path d="M-${r * 0.7} ${r * 0.5}l-2.4 2.6M${r * 0.7} ${r * 0.5}l2.4 2.6M0 ${r * 0.8}v2.6" stroke="#3e6a32" stroke-width="1.3"/><circle r="${r}" fill="${d}"/><path d="M-${r} 0C-${r} -${r * 1.1} ${r} -${r * 1.1} ${r} 0C${r * 0.6} ${r * 0.9}-${r * 0.6} ${r * 0.9}-${r} 0Z" fill="${c}"/><path d="M-${r * 0.7}-${r * 0.1}C-${r * 0.6}-${r * 0.8} ${r * 0.6}-${r * 0.8} ${r * 0.7}-${r * 0.1}C${r * 0.3} ${r * 0.4}-${r * 0.3} ${r * 0.4}-${r * 0.7}-${r * 0.1}Z" fill="${l}"/><path d="M-${r * 0.35}-${r * 0.25}C-${r * 0.2}-${r * 0.65} ${r * 0.3}-${r * 0.6} ${r * 0.35}-${r * 0.25}" stroke="${d}" stroke-width=".9" fill="none"/><path d="M-${r * 0.15}-${r * 0.35}q${r * 0.15}-${r * 0.2} ${r * 0.3} 0" stroke="${d}" stroke-width=".7" fill="none"/></g>`;
    };
    s += `${rose(40, 28, 7, '#c8283e') + rose(62, 18, 8, '#d23447') + rose(84, 34, 7, '#c8283e') + rose(28, 60, 5.5, '#e0566a') + rose(94, 62, 5.5, '#e0566a') + rose(50, 50, 6, '#c8283e')}<ellipse cx="72" cy="46" rx="2.2" ry="3.4" fill="#b8283e"/><path d="M70 48l2 2l2-2" stroke="#3e6a32" stroke-width="1" fill="none"/>`;
    return { back: s };
  });

  def('olivier', { fr: 'Olivier', en: 'Olive tree', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = `<path d="M55 100C52 88 61 82 56 70C52 62 57 54 59 46L65 46C63 55 60 60 64 68C69 78 62 88 67 100Z" fill="#8a7d6c"/><path d="M58 96C57 88 62 84 59 74M62 66C61 60 62 54 63 48" stroke="#6a5e50" stroke-width=".8" fill="none"/><path d="M57 78c2 1 3 3 2 5" stroke="#5e5346" stroke-width="1" fill="none"/>`;
    s += st('M60 52Q48 44 34 42M60 50Q50 38 44 26M62 50Q74 40 88 38M62 48Q66 34 74 24M60 48L60 28', '#7d6e5c', 2);
    const r = rng(5);
    const cl = [[34, 40, 15], [46, 26, 14], [60, 22, 16], [74, 24, 14], [88, 36, 15], [48, 44, 12], [72, 44, 12], [60, 36, 12]];
    cl.forEach(([cx, cy, rad]) => {
      for (let i = 0; i < 34; i++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * rad, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.75 + 3;
        const up = r() > 0.55;
        s += leaf(x, y, (r() - 0.5) * 200, 7 + r() * 3, 1.5, up ? '#a9b9a0' : '#6f8a62', 0);
      }
    });
    for (let i = 0; i < 9; i++) { const x = 32 + r() * 56, y = 26 + r() * 22; s += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="1.5" ry="1.9" fill="#3a3148"/><circle cx="${n1(x - 0.5)}" cy="${n1(y - 0.6)}" r=".45" fill="#8a7aa0"/>`; }
    return { back: s };
  });

  def('citronnier', { fr: 'Citronnier', en: 'Lemon tree', where: 'outdoor', pot: 'terracotta' }, (id, fruit) => {
    const fc = fruit || ['#f2d33b', '#c9a51e', '#fff6b8'];
    let s = `<path d="M58.5 100L59 54L61 54L61.5 100Z" fill="#7a5e3e"/>${st('M60 66Q50 58 44 50M60 62Q70 56 78 48M60 56L58 40', '#7a5e3e', 1.8)}`;
    const r = rng(9);
    s += `<ellipse cx="60" cy="38" rx="30" ry="25" fill="#1f4a2a"/>`;
    for (let i = 0; i < 170; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()), x = 60 + Math.cos(a) * d * 31, y = 38 + Math.sin(a) * d * 26;
      s += leaf(x, y, r() * 360, 7 + r() * 2, 2.8, r() > 0.4 ? '#2f6a3a' : '#3f7d44', 0);
    }
    [[44, 46], [70, 50], [58, 30], [80, 36], [38, 32], [62, 50], [50, 20]].forEach(([x, y], i) => {
      const g = `fr${id}${i}`;
      s += `<radialGradient id="${g}" cx=".35" cy=".35"><stop offset="0" stop-color="${fc[2]}"/><stop offset=".45" stop-color="${fc[0]}"/><stop offset="1" stop-color="${fc[1]}"/></radialGradient><ellipse cx="${x}" cy="${y}" rx="${fruit ? 4.2 : 4.6}" ry="${fruit ? 4.2 : 3.6}" fill="url(#${g})" transform="rotate(${(i * 37) % 60 - 30} ${x} ${y})"/>`;
    });
    s += flower5(50, 30, 1.6, '#fff', '#f4d34b') + flower5(72, 26, 1.6, '#fff', '#f4d34b') + flower5(36, 44, 1.5, '#fff', '#f4d34b');
    return { back: s };
  });

  def('fraisier', { fr: 'Fraisier', en: 'Strawberry', where: 'outdoor', pot: 'terracotta' }, () => {
    const tri = (x, y, a, sc) => {
      let o = `<g transform="translate(${x} ${y}) rotate(${a}) scale(${sc})">`;
      [-36, 0, 36].forEach((b) => {
      o += `<g transform="rotate(${b})"><path d="M0 0Q8-6 0-15Q-8-6 0 0Z" fill="#3f9a4e" stroke="#2f7a3c" stroke-width=".8" stroke-dasharray="1.4 1"/><path d="M0 0L0-13" stroke="rgba(0,0,0,.16)" stroke-width=".7"/></g>`;
    });
      return `${o}</g>`;
    };
    let s = '';
    [[-60, 30, 74], [-30, 42, 60], [0, 60, 54], [30, 76, 60], [60, 90, 74], [-10, 50, 70], [16, 70, 72]].forEach(([a, x, y]) => {
      s += st(`M60 99Q${(60 + x) / 2} ${y + 10} ${x} ${y}`, '#5f9a3d', 1.2) + tri(x, y, a, 1.1);
    });
    s += flower5(44, 60, 2.6, '#fff', '#f4d34b') + flower5(78, 56, 2.6, '#fff', '#f4d34b');
    const berry = (x, y, sc = 1) => `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M0 0C5 0 6 4 4 8C2 12 0 13 0 13C0 13-2 12-4 8C-6 4-5 0 0 0Z" fill="#e2333f"/><path d="M-4 0L0 2L4 0L2-2L0 0L-2-2Z" fill="#3e8a3a"/><g fill="#ffe08a"><circle cx="-2" cy="4" r=".5"/><circle cx="2" cy="5" r=".5"/><circle cx="0" cy="8" r=".5"/><circle cx="-1.5" cy="9.5" r=".5"/><circle cx="1.8" cy="9" r=".5"/></g></g>`;
    const front = st('M36 100Q28 104 28 112', '#5f9a3d', 1) + st('M84 100Q94 106 92 116', '#5f9a3d', 1) + st('M70 100Q74 108 72 114', '#5f9a3d', 1) + berry(28, 112, 1.1) + berry(92, 116, 1.05) + berry(72, 114, 0.9);
    return { back: s, front };
  });

  def('geranium', { fr: 'Géranium', en: 'Geranium', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = '';
    const lf = (x, y, r) => `${circ(x, y, r, '#4f9a4e')}<circle cx="${x}" cy="${y}" r="${r * 0.6}" fill="none" stroke="#6b5a2e" stroke-width="1.4" opacity=".45"/>${circ(x, y, r, 'none', `stroke="#3f8a40" stroke-width="1" stroke-dasharray="2 1.5"`)}`;
    [[36, 84, 9], [50, 78, 10], [70, 78, 10], [84, 84, 9], [60, 86, 9], [44, 92, 7], [76, 92, 7]].forEach(([x, y, r]) => {
      s += lf(x, y, r);
    });
    const umb = (x, y) => {
      let o = st(`M60 90Q${(60 + x) / 2} ${y + 20} ${x} ${y}`, '#5f9a3d', 1.2);
      const r = rng(x + y);
      for (let i = 0; i < 9; i++) {
        const a = r() * Math.PI * 2, d = r() * 7;
        o += flower5(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, 2.4, i % 2 ? '#e8344a' : '#f24c5e', '#ffd0d6');
      }
      return o;
    };
    s += umb(40, 46) + umb(62, 36) + umb(84, 48);
    return { back: s };
  });

  def('hortensia', { fr: 'Hortensia', en: 'Hydrangea', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = '';
    [[-70, 30], [-46, 34], [-20, 30], [20, 30], [46, 34], [70, 30]].forEach(([a, l]) => {
      s += leaf(60, 99, a, l, 10, '#3f8a4a');
    });
    const ball = (x, y, r, c1, c2) => {
      let o = circ(x, y, r, c1);
      const q = rng(x * 3 + y);
      for (let i = 0; i < 22; i++) {
        const a = q() * Math.PI * 2, d = Math.sqrt(q()) * (r - 2);
        o += `<g transform="translate(${n1(x + Math.cos(a) * d)} ${n1(y + Math.sin(a) * d)}) rotate(${n1(q() * 90)})">${[0, 90, 180, 270].map((b) => `<ellipse cx="0" cy="-1.6" rx="1.3" ry="1.7" fill="${i % 2 ? c2 : '#d7e3fb'}" transform="rotate(${b})"/>`).join('')}</g>`;
      }
      return o;
    };
    s += ball(40, 58, 15, '#7f9be0', '#9fb5ee') + ball(80, 56, 15, '#d78ac2', '#e9a8d6') + ball(60, 40, 17, '#8d93e3', '#b1b6f2');
    return { back: s };
  });

  def('tournesol', { fr: 'Tournesol', en: 'Sunflower', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = st('M60 99Q58 60 60 34', '#5f8f3a', 3);
    s += leaf(59, 80, -64, 24, 9, C.m, 1) + leaf(60, 64, 60, 22, 9, C.l, 1) + leaf(59, 48, -56, 18, 7, C.m, 1);
    s += `<g transform="translate(60 26)">`;
    for (let i = 0; i < 16; i++) s += `<ellipse cx="0" cy="-15" rx="3.4" ry="7" fill="${i % 2 ? '#f6c21f' : '#f9d23c'}" transform="rotate(${i * 22.5})"/>`;
    s += `<circle r="10" fill="#6b4320"/><circle r="7" fill="#7d5128"/><g fill="#4e2f14">${[...Array(14)].map((_, i) => `<circle cx="${n1(Math.cos(i * 2.4) * (i * 0.55))}" cy="${n1(Math.sin(i * 2.4) * (i * 0.55))}" r=".8"/>`).join('')}</g></g>`;
    return { back: s };
  });

  def('menthe', { fr: 'Menthe', en: 'Mint', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = '';
    const stems = [[[52, 99], [46, 70], [40, 40]], [[60, 99], [60, 66], [60, 28]], [[68, 99], [76, 70], [82, 42]], [[46, 99], [34, 82], [26, 66]], [[74, 99], [86, 84], [94, 70]]];
    stems.forEach((f, i) => {
      s += frond(f[0], f[1], f[2], { n: 4, len: 11, w: 5.6, fill: i % 2 ? '#6cc46a' : '#5cb65c', spread: 70, sc: '#6b8f3a', sw: 1.4, shrink: 0.4, t0: 0.3, vein: 1 });
    });
    return { back: s };
  });

  def('romarin', { fr: 'Romarin', en: 'Rosemary', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = '';
    const stems = [[44, 30, -16], [52, 22, -8], [60, 16, 0], [68, 22, 8], [76, 30, 16], [36, 44, -26], [84, 44, 26]];
    stems.forEach(([x, y], i) => {
      const p0 = [60, 99], p1 = [(60 + x) / 2, 64], p2 = [x, y];
      s += st(`M60 99Q${p1} ${p2}`, '#7a6a4a', 1.2);
      for (let k = 0; k < 14; k++) {
        const t = 0.2 + k * 0.057, p = bez(p0, p1, p2, t), a = tan(p0, p1, p2, t);
        s += leaf(p[0], p[1], a + (k % 2 ? 40 : -40), 6, 0.9, i % 2 ? '#4e6e52' : '#5a7d5c', 0);
      }
      s += circ(x, y + 6, 1.3, '#8fa8e6');
    });
    return { back: s };
  });

  def('erable-japon', { fr: 'Érable du Japon', en: 'Japanese maple', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = st('M60 100Q58 80 62 62', '#6a4a3a', 3) + st('M61 70Q48 60 40 52M61 66Q74 58 82 50M62 62L60 44', '#6a4a3a', 1.8);
    const star = (x, y, sc, f, a) => {
      let o = `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(a)}) scale(${sc})">`;
      [-60, -30, 0, 30, 60].forEach((b, i) => {
      o += `<path d="M0 0Q2.2-4 0-${i === 2 ? 9 : 7}Q-2.2-4 0 0Z" fill="${f}" transform="rotate(${b})"/>`;
    });
      return `${o}</g>`;
    };
    const r = rng(21);
    const cols = ['#c0392b', '#d9483b', '#a8322d', '#e3663f'];
    for (let i = 0; i < 46; i++) {
      const a = r() * Math.PI, d = 8 + r() * 30;
      s += star(60 + Math.cos(a) * d * 1.3, 62 - Math.sin(a) * d * 1.05, 1 + r() * 0.3, cols[i % 4], (r() - 0.5) * 80);
    }
    return { back: s };
  });

  def('bambou', { fr: 'Bambou', en: 'Bamboo', where: 'outdoor', pot: 'planter' }, () => {
    let s = '';
    [[48, 12, -4], [58, 6, 0], [68, 14, 4], [76, 26, 7]].forEach(([x, top, lean]) => {
      s += st(`M${x} 100L${x + lean} ${top}`, '#9cb84a', 3.2);
      for (let y = 88; y > top + 6; y -= 16) {
        const xx = x + (lean * (100 - y)) / (100 - top);
        s += st(`M${n1(xx - 2)} ${y}H${n1(xx + 2)}`, '#6f8a2e', 1.4);
        s += leaf(xx, y, lean > 0 ? 60 : -60, 16, 2.4, '#5aa04a', 0) + leaf(xx, y - 2, lean > 0 ? 90 : -90, 13, 2.2, '#6bb252', 0);
      }
    });
    return { back: s };
  });

  def('buis', { fr: 'Buis', en: 'Boxwood', where: 'outdoor', pot: 'planter' }, () => {
    let s = st('M60 100L60 80', '#6a5038', 3) + circ(60, 56, 30, '#2f6b3a');
    const r = rng(33);
    for (let i = 0; i < 90; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 28;
      s += `<ellipse cx="${n1(60 + Math.cos(a) * d)}" cy="${n1(56 + Math.sin(a) * d)}" rx="1.8" ry="1.2" fill="${r() > 0.5 ? '#3f8a4a' : '#26592f'}" transform="rotate(${n1(r() * 180)} ${n1(60 + Math.cos(a) * d)} ${n1(56 + Math.sin(a) * d)})"/>`;
    }
    s += `<path d="M38 44A26 26 0 0 1 60 30" stroke="rgba(255,255,255,.18)" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    return { back: s };
  });

  def('piment', { fr: 'Piment', en: 'Chili pepper', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = st('M60 99Q58 76 50 56M60 99Q62 74 72 54M60 99L61 44', '#4f8a3a', 1.6);
    const r = rng(17);
    for (let i = 0; i < 18; i++) {
      const a = r() * Math.PI, d = 12 + r() * 24;
      s += leaf(60 + Math.cos(a) * d * 1.1, 82 - Math.sin(a) * d * 1.2, (r() - 0.5) * 160, 11, 3.6, r() > 0.5 ? C.m : C.l, 1);
    }
    const chili = (x, y, a, f) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0C3 0 4 4 3 10C2 15-1 18-2 18C-1 14-2 6-2 2C-2 1-1 0 0 0Z" fill="${f}"/><path d="M0 0L0-3" stroke="#3e7a2e" stroke-width="1.4"/></g>`;
    s += chili(44, 62, 10, '#d8262e') + chili(56, 70, -8, '#e33a2a') + chili(70, 60, -14, '#d8262e') + chili(80, 72, -20, '#f28a2a') + chili(50, 48, 4, '#e33a2a');
    return { back: s };
  });

  def('thym', { fr: 'Thym', en: 'Thyme', where: 'outdoor', pot: 'bowl' }, () => {
    let s = '';
    const r = rng(41);
    for (let i = 0; i < 16; i++) {
      const x = 36 + i * 3.2, h = 18 + r() * 16;
      s += st(`M${n1(x)} 102Q${n1(x + (r() - 0.5) * 8)} ${n1(102 - h / 2)} ${n1(x + (r() - 0.5) * 10)} ${n1(102 - h)}`, '#7a6a4a', 0.8);
    }
    for (let i = 0; i < 120; i++) {
      const x = 34 + r() * 52, y = 102 - r() * (20 + 10 * Math.sin(((x - 34) / 52) * Math.PI));
      s += circ(x, y, 1.1, r() > 0.5 ? '#6f8f64' : '#5b7d54');
    }
    for (let i = 0; i < 18; i++) {
      const x = 38 + r() * 44;
      s += circ(x, 102 - (18 + 8 * Math.sin(((x - 34) / 52) * Math.PI)) - r() * 4, 1.4, '#d58fd0');
    }
    return { back: s };
  });

  def('laitue', { fr: 'Salade', en: 'Lettuce', where: 'outdoor', pot: 'planter' }, () => {
    const _s = '';
    const head = (x) => {
      let o = '';
      [-70, -40, -14, 14, 40, 70].forEach((a, i) => {
      o += `<g transform="translate(${x} 100) rotate(${a})"><path d="M0 0C9-3 10-12 7-18C5-21 3-19 2-22C0-24-2-21-3-22C-6-20-9-16-8-10C-7-4-4-1 0 0Z" fill="${i % 2 ? '#8fcf6a' : '#7cc25a'}" stroke="#5e9e42" stroke-width=".8"/></g>`;
    });
      return `${o + circ(x, 92, 6, '#b7e08a')}<path d="M${x - 4} 92q4-5 8 0" stroke="#8fcf6a" stroke-width="1" fill="none"/>`;
    };
    return { back: head(42) + head(78) };
  });

  /* ======== AJOUTS ======== */
  const heart = (x, y, a, s, f, v = 'rgba(0,0,0,.16)') => {
    f = MODE.tint || MODE.swap[f] || f;
    return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(a)}) scale(${s})"><path d="M0-16C-3-12-11-9-10-3C-9 1-3 1 0-2C3 1 9 1 10-3C11-9 3-12 0-16Z" fill="${shade(f, 0.06)}"/><path d="M0-16C3-12 11-9 10-3C9 1 3 1 0-2Z" fill="${shade(f, -0.12)}"/><g transform="translate(0 -1)">${pat(-14, 8)}</g><path d="M0-2L0-15" stroke="${v}" stroke-width="1"/></g>`;
  };
  const arrow = (x, y, a, s, f, v) =>
    `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(a)}) scale(${s})"><path d="M0-30C-4-22-13-10-12 2L0-4L12 2C13-10 4-22 0-30Z" fill="${f}"/><path d="M0-4L0-28M0-12L-8-4M0-12L8-4M0-20L-6-14M0-20L6-14" stroke="${v}" stroke-width="1" fill="none"/></g>`;
  const radial = (n, a0, a1, fn) => { let s = ''; for (let i = 0; i < n; i++) s += fn(a0 + ((a1 - a0) * i) / Math.max(1, n - 1), i); return s; };
  const at = (a, d, cx = 60, cy = 99) => [cx + Math.sin(a * R) * d, cy - Math.cos(a * R) * d];
  const scatter = (seed, n, cx, cy, rx, ry, fn) => { const r = rng(seed); let s = ''; for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()); s += fn(cx + Math.cos(a) * d * rx, cy + Math.sin(a) * d * ry, r, i); } return s; };

  def('philodendron', { fr: 'Philodendron', en: 'Philodendron', where: 'indoor', pot: 'concrete' }, () =>
    ({ back: [[-50, 40], [-22, 52], [6, 58], [32, 50], [58, 38]].map(([a, d], i) => { const p = at(a, d); return st(`M60 99Q${n1((60 + p[0]) / 2)} ${n1(p[1] + 18)} ${n1(p[0])} ${n1(p[1])}`, '#5a7a3a', 1.4) + heart(p[0], p[1] + 2, a * 0.6, 1.5, i % 2 ? '#24543a' : '#2d6545', 'rgba(190,230,170,.5)'); }).join('') }));

  def('alocasia', { fr: 'Alocasia', en: 'Alocasia', where: 'indoor', pot: 'white' }, () =>
    ({ back: [[-40, 48], [-10, 62], [20, 56], [48, 44]].map(([a, d], i) => { const p = at(a, d); return st(`M60 99L${n1(p[0])} ${n1(p[1] + 4)}`, '#7a8a5a', 1.6) + arrow(p[0], p[1] + 6, a * 0.7, 1.15, i % 2 ? '#1f3d30' : '#25483a', '#e4efe0'); }).join('') }));

  def('strelitzia', { fr: 'Oiseau de paradis', en: 'Bird of paradise', where: 'indoor', pot: 'concrete' }, () => {
    const pad = (x, y, a, len, f) => {
      const ff = shade(f, Math.max(-0.14, Math.min(0.08, (60 - y) / 260)));
      let tears = '';
      [0.3, 0.52, 0.7].forEach((t, i) => {
      tears += `<path d="M${i % 2 ? 9 : -9} ${n1(-len * t)}L0 ${n1(-len * t - 3)}" stroke="#f4f6f8" stroke-width="1.1"/>`;
    });
      return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${a})"><path d="M0 0C10-4 12-${len * 0.6} 0-${len}C-11-${len * 0.6}-10-4 0 0Z" fill="${shade(ff, 0.1)}"/><path d="M0 0C10-4 12-${len * 0.6} 0-${len}Q1-${len / 2} 0 0Z" fill="${shade(ff, -0.12)}"/><path d="M0 0Q1-${len / 2} 0-${len - 1}" stroke="${shade(ff, 0.45)}" stroke-width="1"/>${[0.2, 0.35, 0.5, 0.65, 0.8].map((t) => `<path d="M0 -${n1(len * t)}l8 -${n1(len * 0.1)}M0 -${n1(len * t)}l-8 -${n1(len * 0.1)}" stroke="${shade(ff, 0.25)}" stroke-width=".4"/>`).join('')}${tears}</g>`;
    };
    let s = '';
    [[-40, 56, '#24502e'], [42, 52, '#24502e'], [-18, 70, '#2c5c34'], [20, 68, '#2c5c34'], [-4, 78, '#346a3c'], [60, 36, '#3a7242'], [-60, 38, '#3a7242']].forEach(([a, d, f]) => {
      const p = at(a, d * 0.62);
      s += `<path d="M59 99Q${n1((60 + p[0]) / 2)} ${n1(p[1] + 20)} ${n1(p[0])} ${n1(p[1])}" stroke="#6a8a4a" stroke-width="2" fill="none"/>${pad(p[0], p[1] + 1, a * 0.9, 32, f)}`;
    });
    s += `${st('M61 99Q68 72 74 56', '#6a8a4a', 1.6)}<g transform="translate(74 56) rotate(-8)"><path d="M0 0Q12 2 22 0Q12 6 0 4Z" fill="#3a5a7a"/><path d="M2 1L8-14L11-1Z" fill="#f28a1e"/><path d="M5 0L14-12L13 0Z" fill="#f6a623"/><path d="M8 1L18-8L15 1Z" fill="#f9b84a"/><path d="M6 1L4-11L10-1Z" fill="#3b6fd8"/></g>`;
    return { back: s };
  });

  def('yucca', { fr: 'Yucca', en: 'Yucca', where: 'indoor', pot: 'terracotta' }, () => {
    const tuft = (x, y) => radial(11, -100, 100, (a) => leaf(x, y, a, 22, 2.6, '#5f9a6a', 0));
    return { back: `<path d="M54 100L56 46L62 46L64 100Z" fill="#9a8466"/><path d="M60 70L74 40L78 42L64 74Z" fill="#9a8466"/>${st('M55 60H63M55 80H63', '#7d6a50', 1)}${tuft(59, 44)}${tuft(76, 40)}` };
  });

  def('crassula', { fr: 'Arbre de jade', en: 'Jade plant', where: 'indoor', pot: 'terracotta' }, () => {
    let s = st('M60 100Q58 84 60 72M60 76Q48 66 42 56M60 74Q72 64 80 54M60 72L60 50', '#7a6a4a', 4);
    s += scatter(13, 34, 60, 50, 30, 18, (x, y, r) => `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="4" ry="3" fill="${r() > 0.5 ? '#4f9a5c' : '#5fae6a'}" stroke="#c44a4a" stroke-width=".6" transform="rotate(${n1(r() * 180)} ${n1(x)} ${n1(y)})"/>`);
    return { back: s };
  });

  def('bonsai', { fr: 'Bonsaï', en: 'Bonsai', where: 'indoor', pot: 'tray' }, () => {
    const s = `<path d="M54 104C52 92 62 88 56 78C50 70 60 62 70 58L72 62C64 66 60 72 64 80C70 90 60 94 64 104Z" fill="#6f5a48"/>${st('M60 74Q46 70 36 64M66 62Q78 54 86 56', '#6f5a48', 2.4)}`;
    const pad = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#2f6e3e"/>${scatter(x + y, 26, x, y - 1, rx * 0.9, ry * 0.7, (a, b, r) => circ(a, b, 1.8, r() > 0.5 ? '#3f8a4c' : '#4f9a58'))}`;
    return { back: s + pad(36, 60, 14, 7) + pad(70, 48, 18, 9) + pad(88, 54, 10, 5) };
  });

  def('dionee', { fr: 'Dionée', en: 'Venus flytrap', where: 'indoor', pot: 'bowl' }, () =>
    ({ back: radial(7, -70, 70, (a, i) => { const p = at(a, 22 + (i % 2) * 6, 60, 102); return `${st(`M60 102L${n1(p[0])} ${n1(p[1])}`, '#7ab84a', 2.2)}<g transform="translate(${n1(p[0])} ${n1(p[1])}) rotate(${a})"><path d="M0 0C-8-2-9-12-1-14Z" fill="#8fc75a"/><path d="M0 0C8-2 9-12 1-14Z" fill="#8fc75a"/><path d="M-1-2C-5-4-5-10-1-12M1-2C5-4 5-10 1-12" stroke="#d2384a" stroke-width="2" fill="none"/><path d="M-1-14l-2-3M1-14l2-3M-5-12l-3-2M5-12l3-2" stroke="#b9e08a" stroke-width=".8"/></g>`; }) }));

  def('anthurium', { fr: 'Anthurium', en: 'Anthurium', where: 'indoor', pot: 'white' }, () => {
    const s = [[-50, 36], [-20, 46], [16, 44], [48, 34]].map(([a, d], i) => { const p = at(a, d); return st(`M60 99L${n1(p[0])} ${n1(p[1])}`, '#4f7d3a', 1.3) + heart(p[0], p[1] + 2, a * 0.5, 1.35, i % 2 ? C.d : '#256b40'); }).join('');
    const sp = (x, y, a) => `${st(`M60 99Q${(60 + x) / 2} ${y + 24} ${x} ${y}`, '#4f7d3a', 1.2)}<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0-14C-3-10-10-8-9-2C-8 2-2 1 0-1C2 1 8 2 9-2C10-8 3-10 0-14Z" fill="#e0263a"/><path d="M-3-3C-5-5-6-8-2-12" stroke="rgba(255,255,255,.35)" stroke-width="1.4" fill="none"/><path d="M0-4L4-16" stroke="#f3d34b" stroke-width="2.4" stroke-linecap="round"/></g>`;
    return { back: s + sp(46, 30, -14) + sp(76, 26, 16) };
  });

  def('lierre', { fr: 'Lierre', en: 'Ivy', where: 'indoor', pot: 'terracotta' }, () => {
    const ivy = (x, y, a, s, f) => `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(a)}) scale(${s})"><path d="M0 0L-7-3L-5-8L-8-12L-2-11L0-17L2-11L8-12L5-8L7-3Z" fill="${f}"/><path d="M0 0L0-14M0-4L-6-10M0-4L6-10" stroke="#e8edc8" stroke-width=".7" fill="none"/></g>`;
    const vine = (p0, p1, p2, side, n = 6) => { let s = st(`M${p0}Q${p1} ${p2}`, '#6a5a3a', 1); for (let i = 0; i < n; i++) { const t = 0.1 + i / n, p = bez(p0, p1, p2, t); s += ivy(p[0], p[1], 180 + side * (i % 2 ? 50 : -20), 0.85, i % 2 ? '#2f6b3f' : '#3d8050'); } return s; };
    return { back: vine([56, 99], [44, 70], [40, 50], 1, 5) + vine([64, 99], [76, 72], [82, 54], -1, 5), front: vine([34, 101], [16, 112], [20, 138], 1) + vine([86, 101], [104, 114], [100, 136], -1) + vine([60, 101], [56, 116], [58, 136], 1, 4) };
  });

  def('tradescantia', { fr: 'Misère', en: 'Wandering dude', where: 'indoor', pot: 'white' }, () => {
    const tl = (x, y, a) => `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(a)})"><path d="M0 0Q5-6 0-14Q-5-6 0 0Z" fill="#6b3f8a"/><path d="M-1.5-3Q-2.5-7-1-11M1.5-3Q2.5-7 1-11" stroke="#d8c8ef" stroke-width="1.2" fill="none"/></g>`;
    const back = radial(9, -70, 70, (a) => { const p = at(a, 26); return st(`M60 99L${n1(p[0])} ${n1(p[1])}`, '#7a5a8a', 1) + tl(p[0], p[1], a) + tl(...at(a, 16), a - 30); });
    const tr = (p0, p1, p2) => { let s = st(`M${p0}Q${p1} ${p2}`, '#7a5a8a', 1); for (let i = 0; i < 5; i++) { const p = bez(p0, p1, p2, 0.15 + i * 0.2); s += tl(p[0], p[1], 200 + (i % 2) * 60 - 30); } return s; };
    return { back, front: tr([34, 101], [20, 112], [24, 134]) + tr([86, 101], [100, 112], [96, 132]) };
  });

  def('peperomia', { fr: 'Peperomia', en: 'Peperomia', where: 'indoor', pot: 'sage' }, () =>
    ({ back: scatter(29, 26, 60, 80, 28, 18, (x, y, _r, i) => `${st(`M60 99L${n1(x)} ${n1(y)}`, '#8a5a5a', 0.8)}<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="6" ry="5" fill="${i % 3 ? '#3d8a4a' : '#4f9a58'}"/><path d="M${n1(x - 3)} ${n1(y - 2)}q3-2 6 0" stroke="rgba(255,255,255,.3)" stroke-width="1" fill="none"/>`) }));

  def('croton', { fr: 'Croton', en: 'Croton', where: 'indoor', pot: 'ceramic' }, () => {
    const cols = ['#e2b62a', '#d9532e', '#3f7a3a', '#c43a4a', '#e8862a'];
    let s = st('M60 99L60 40', '#7a5a3a', 2);
    for (let i = 0; i < 12; i++) { const y = 92 - i * 4.6, a = (i % 2 ? 1 : -1) * (70 - i * 4); s += `<g transform="translate(60 ${y}) rotate(${a})"><path d="M0 0Q7-12 0-26Q-7-12 0 0Z" fill="${cols[i % 5]}"/><path d="M0 0L0-24" stroke="${i % 2 ? '#f5e07a' : '#f3a04a'}" stroke-width="1.4"/></g>`; }
    return { back: s };
  });

  def('ficus-benjamina', { fr: 'Ficus benjamina', en: 'Weeping fig', where: 'indoor', pot: 'white' }, () => {
    let s = st('M58 100Q62 80 58 62Q56 50 60 40', '#8a7a5a', 2.4) + st('M62 100Q56 80 62 62Q64 52 60 42', '#7a6a4a', 2.2);
    s += scatter(37, 120, 60, 40, 34, 26, (x, y, r) => leaf(x, y, 140 + r() * 80, 7, 2.6, r() > 0.5 ? C.m : C.l, 0));
    return { back: s };
  });

  def('pachira', { fr: 'Pachira', en: 'Money tree', where: 'indoor', pot: 'concrete' }, () => {
    let s = MODE.single ? `<path d="M51 100C50 88 56 80 58 52L62 52C64 80 70 88 69 100Z" fill="#8a7456"/><path d="M55 96C56 84 58 70 59 56" stroke="#a08a6a" stroke-width="1.2" fill="none"/><path d="M53 90q3-2 6 0M61 80q3-2 5 0" stroke="#6a5640" stroke-width=".8" fill="none"/>` : st('M56 100Q64 84 56 68Q50 56 58 48', '#9a8466', 3) + st('M64 100Q56 84 64 68Q70 56 62 48', '#8a7456', 3);
    const palm = (x, y, sc) => radial(5, -70, 70, (a) => leaf(x, y, a, 18 * sc, 4 * sc, C.m, 1));
    [[60, 46, 1.1], [44, 36, 0.9], [76, 34, 0.95], [58, 26, 0.85]].forEach(([x, y, sc]) => {
      s += st(`M60 48L${x} ${y}`, '#5f7a3a', 1.2) + palm(x, y, sc);
    });
    return { back: s };
  });

  def('haworthia', { fr: 'Haworthia', en: 'Zebra plant', where: 'indoor', pot: 'bowl' }, () =>
    ({ back: radial(11, -75, 75, (a, i) => `<g transform="translate(60 102) rotate(${a})"><path d="M0 0Q5-12 0-${24 + (i % 3) * 4}Q-5-12 0 0Z" fill="#3d6e50"/><path d="M-2.5-6h5M-3-11h6M-2.5-16h5M-2-21h4" stroke="#e8f0e0" stroke-width="1.2"/></g>`) }));

  def('begonia', { fr: 'Bégonia maculata', en: 'Polka dot begonia', where: 'indoor', pot: 'white' }, () => {
    const w = (x, y, a, s) => `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(a)}) scale(${s})"><path d="M0 0C-6-4-8-16-2-28C2-22 10-14 8-6C7-2 3 0 0 0Z" fill="#2f5a46"/><path d="M0 0C3-1 6-3 7-6" stroke="#b03a4a" stroke-width="1.6" fill="none"/>${[[0, -8], [2, -14], [-1, -19], [4, -9], [1, -24], [-2, -12]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="1.1" fill="#e8eef0"/>`).join('')}</g>`;
    let s = st('M58 99L52 40M62 99L70 46', '#8a5a4a', 1.8);
    [[52, 44, -60], [52, 56, 40], [54, 70, -70], [70, 48, 60], [68, 62, -30], [66, 78, 70], [54, 84, -40]].forEach(([x, y, a]) => {
      s += w(x, y, a, 0.95);
    });
    return { back: s };
  });

  def('cyclamen', { fr: 'Cyclamen', en: 'Cyclamen', where: 'indoor', pot: 'terracotta' }, () => {
    let s = radial(7, -70, 70, (a) => { const p = at(a, 20); return st(`M60 99L${n1(p[0])} ${n1(p[1])}`, '#7a3a4a', 1) + heart(p[0], p[1] + 2, a, 0.9, '#2f5e3e', 'rgba(220,240,220,.6)'); });
    [[44, 46, -14], [58, 38, 0], [72, 44, 14], [52, 54, -6], [66, 52, 8]].forEach(([x, y, a]) => {
      s += `${st(`M60 96Q${x} 70 ${x} ${y + 4}`, '#7a3a4a', 1)}<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 4C-6-2-6-10-3-14C-1-8 0-4 0 4Z" fill="#e5487a"/><path d="M0 4C6-2 6-10 3-14C1-8 0-4 0 4Z" fill="#f06a95"/><circle cy="5" r="1.6" fill="#a8234e"/></g>`;
    });
    return { back: s };
  });

  def('poinsettia', { fr: 'Poinsettia', en: 'Poinsettia', where: 'indoor', pot: 'white' }, () => {
    const s = radial(7, -80, 80, (a) => leaf(60, 99, a, 26, 8, C.d, 1));
    const star = (x, y, sc) => radial(8, 0, 315, (a, i) => leaf(x, y, a, 14 * sc, 5 * sc, i % 2 ? '#d61f32' : '#e8303f', 1)) + circ(x, y, 2.4, '#e8c23a');
    return { back: s + star(42, 58, 1) + star(78, 56, 1) + star(60, 44, 1.15) };
  });

  def('bromelia', { fr: 'Broméliacée', en: 'Bromeliad', where: 'indoor', pot: 'ceramic' }, () =>
    ({ back: `${radial(10, -78, 78, (a, i) => leaf(60, 100, a, 34 - Math.abs(a) / 8, 5, i % 2 ? '#3f8a50' : '#4f9a5c', 1))}<path d="M60 98L52 66L56 58L60 40L64 58L68 66Z" fill="#e2304a"/><path d="M56 66L60 50L64 66M54 80L60 70L66 80" stroke="#b81f3a" stroke-width="1" fill="none"/><g fill="#f3d34b"><circle cx="58" cy="56" r="1.2"/><circle cx="62" cy="60" r="1.2"/><circle cx="60" cy="48" r="1.2"/></g>` }));

  def('cactus-boule', { fr: 'Cactus boule', en: 'Barrel cactus', where: 'indoor', pot: 'terracotta' }, () => {
    let s = `<ellipse cx="60" cy="82" rx="24" ry="22" fill="#4f9a5a"/>`;
    for (let k = -3; k <= 3; k++) s += `<path d="M${60 + k * 7} 61Q${60 + k * 9.5} 82 ${60 + k * 7} 103" stroke="rgba(0,0,0,.14)" stroke-width="1.2" fill="none"/>`;
    s += scatter(53, 40, 60, 82, 22, 20, (x, y) => `<path d="M${n1(x)} ${n1(y)}l-1.6-1.6M${n1(x)} ${n1(y)}l1.6-1.6M${n1(x)} ${n1(y)}l0-2" stroke="#f6e9b0" stroke-width=".6"/>`);
    return { back: s + flower5(52, 61, 3.2, '#f9d23c', '#e8862a', 7) + flower5(66, 60, 3.4, '#f9d23c', '#e8862a', 7) };
  });

  /* extérieur */
  def('petunia', { fr: 'Pétunia', en: 'Petunia', where: 'outdoor', pot: 'terracotta' }, () => {
    const tr = (x, y, f) => `<g transform="translate(${n1(x)} ${n1(y)})">${radial(5, 0, 288, (a) => `<ellipse cx="0" cy="-3.2" rx="3" ry="3.6" fill="${f}" transform="rotate(${a})"/>`)}<circle r="1.5" fill="#f6f0c8"/><path d="M0-1V-5M0-1L3-3M0-1L-3-3" stroke="rgba(60,0,60,.4)" stroke-width=".6"/></g>`;
    const back = scatter(61, 26, 60, 82, 32, 18, (x, y, r) => leaf(x, y, r() * 360, 9, 3.6, C.m, 0)) + scatter(62, 12, 60, 78, 30, 16, (x, y, _r, i) => tr(x, y, i % 2 ? '#9b3fc4' : '#c45aa8'));
    const front = scatter(63, 6, 60, 110, 34, 10, (x, y, _r, i) => (Math.abs(x - 60) > 22 ? tr(x, y, i % 2 ? '#9b3fc4' : '#e07ac0') : ''));
    return { back, front };
  });

  def('tulipe', { fr: 'Tulipe', en: 'Tulip', where: 'outdoor', pot: 'planter' }, () => {
    let s = '';
    [[40, '#e0263a'], [52, '#f5c21f'], [64, '#e0263a'], [76, '#f07aa8'], [86, '#f5c21f']].forEach(([x, f], i) => {
      const top = 44 + (i % 2) * 10;
      s += st(`M${x} 100L${x + (i - 2) * 2} ${top}`, '#5f9a3d', 1.6) + leaf(x, 100, -20 + i * 8, 26, 4.6, '#6aa84f', 0);
      s += `<g transform="translate(${x + (i - 2) * 2} ${top})"><path d="M-5 0C-6-6-5-11-4-13L-1.6-9L0-14L1.6-9L4-13C5-11 6-6 5 0C3 3-3 3-5 0Z" fill="${f}"/><path d="M-2-3Q-3-7-2-10" stroke="rgba(255,255,255,.35)" stroke-width="1" fill="none"/></g>`;
    });
    return { back: s };
  });

  def('agapanthe', { fr: 'Agapanthe', en: 'Agapanthus', where: 'outdoor', pot: 'terracotta' }, () => {
    const s = radial(9, -70, 70, (a, i) => leaf(60, 99, a, 30 + (i % 2) * 6, 3.6, '#4f8a3a', 0));
    const glob = (x, y) => st(`M60 99Q${(60 + x) / 2} 60 ${x} ${y}`, '#5f8f3a', 1.4) + radial(16, 0, 337, (a) => { const p = [x + Math.sin(a * R) * 9, y - Math.cos(a * R) * 9]; return `${st(`M${x} ${y}L${n1(p[0])} ${n1(p[1])}`, '#6f9a4a', 0.5)}<ellipse cx="${n1(p[0])}" cy="${n1(p[1])}" rx="1.8" ry="2.6" fill="#5a7ae0" transform="rotate(${a} ${n1(p[0])} ${n1(p[1])})"/>`; });
    return { back: s + glob(46, 28) + glob(72, 22) };
  });

  def('bougainvillier', { fr: 'Bougainvillier', en: 'Bougainvillea', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = st('M60 99Q50 70 34 50M60 99Q62 60 58 24M60 99Q74 70 90 46', '#7a5a3a', 1.8);
    s += scatter(71, 40, 60, 50, 32, 28, (x, y, r) => leaf(x, y, r() * 360, 7, 3, C.m, 0));
    s += scatter(72, 26, 60, 46, 32, 28, (x, y, _r, i) => `<g transform="translate(${n1(x)} ${n1(y)})">${radial(3, 0, 240, (a) => `<path d="M0 0Q4-3 0-6Q-4-3 0 0Z" fill="${i % 2 ? '#d02a8a' : '#e848a0'}" transform="rotate(${a})"/>`)}<circle r=".8" fill="#fff6c8"/></g>`);
    return { back: s };
  });

  def('framboisier', { fr: 'Framboisier', en: 'Raspberry', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = '';
    [[[52, 99], [44, 60], [36, 26]], [[60, 99], [62, 56], [60, 16]], [[68, 99], [80, 62], [88, 30]]].forEach((f) => {
      s += frond(f[0], f[1], f[2], { n: 4, len: 12, w: 5, fill: '#4f9a4e', spread: 60, sc: '#8a5a3a', sw: 2, shrink: 0.25, t0: 0.3, vein: 1 });
    });
    const rb = (x, y) => `<g transform="translate(${x} ${y})">${[[0, 0], [-2, 2], [2, 2], [0, 4], [-1.6, 5.6], [1.6, 5.6], [0, 7.4]].map(([a, b]) => circ(a, b, 1.6, '#d6264a')).join('')}<path d="M-3-1L0 1L3-1" stroke="#3e7a2e" stroke-width="1.2" fill="none"/></g>`;
    return { back: s + rb(42, 46) + rb(56, 62) + rb(74, 50) + rb(84, 70) + rb(48, 78) };
  });

  def('myrtille', { fr: 'Myrtillier', en: 'Blueberry', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = st('M60 99Q52 76 42 58M60 99Q60 70 60 44M60 99Q70 76 80 58', '#8a4a3a', 1.6);
    s += scatter(81, 50, 60, 62, 30, 24, (x, y, r) => leaf(x, y, r() * 360, 8, 3.4, r() > 0.5 ? '#3f8a50' : '#5aa05a', 0));
    s += scatter(82, 16, 60, 70, 26, 20, (x, y) => circ(x, y, 2.6, '#3a4a9a') + circ(x - 0.8, y - 0.8, 0.8, '#8a9ad8'));
    return { back: s };
  });

  def('courgette', { fr: 'Courgette', en: 'Zucchini', where: 'outdoor', pot: 'planter' }, () => {
    const big = (x, y, a, s, f) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="M0 0C-10 2-18-6-14-14C-18-20-10-28-4-24C-2-30 6-30 6-24C12-28 20-20 14-14C18-6 10 2 0 0Z" fill="${f}"/><path d="M0 0L0-24M0-6L-12-14M0-6L12-14" stroke="rgba(230,240,210,.6)" stroke-width="1" fill="none"/></g>`;
    const s = radial(5, -60, 60, (a) => st(`M60 99L${n1(at(a, 30)[0])} ${n1(at(a, 30)[1])}`, '#6a9a4a', 1.8)) + radial(5, -60, 60, (a, i) => big(...at(a, 30).map(n1), a, 0.95, i % 2 ? '#3f8a40' : '#4f9a48'));
    const front = `<g transform="translate(36 104) rotate(-20)"><rect x="-4" y="0" width="8" height="26" rx="4" fill="#3f7a2e"/><path d="M-2 3V23M2 3V23" stroke="#8ac05a" stroke-width=".8"/></g>${flower5(80, 96, 4, '#f6b21f', '#e8862a', 5)}`;
    return { back: s, front };
  });

  def('persil', { fr: 'Persil', en: 'Parsley', where: 'outdoor', pot: 'terracotta' }, () =>
    ({ back: radial(9, -60, 60, (a) => st(`M60 99L${n1(at(a, 30)[0])} ${n1(at(a, 30)[1])}`, '#5f9a3d', 1)) + scatter(91, 60, 60, 72, 30, 20, (x, y, r) => `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(r() * 360)})">${radial(3, -40, 40, (a) => `<path d="M0 0Q2.6-2 0-5.4Q-2.6-2 0 0Z" fill="${r() > 0.5 ? '#3f9a3e' : '#4fae48'}" transform="rotate(${a})"/>`)}</g>`) }));

  def('ciboulette', { fr: 'Ciboulette', en: 'Chives', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = '';
    for (let i = 0; i < 22; i++) { const x = 40 + i * 1.9, h = 34 + ((i * 7) % 5) * 5, lean = (i - 11) * 1.2; s += st(`M${n1(x)} 100Q${n1(x + lean * 0.4)} ${100 - h / 2} ${n1(x + lean)} ${100 - h}`, i % 2 ? '#4f9a3e' : '#5fae48', 1.6); }
    [[46, 54], [58, 44], [70, 50], [80, 60]].forEach(([x, y]) => {
      s += st(`M${x} 100L${x} ${y}`, '#5f9a3e', 1.2) + scatter(x * y, 14, x, y, 4.4, 4.4, (a, b) => circ(a, b, 1.3, '#b08ad8'));
    });
    return { back: s };
  });

  def('palmier', { fr: 'Palmier', en: 'Windmill palm', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = `<path d="M55 100L57 44H63L65 100Z" fill="#7a5e44"/>`;
    for (let y = 48; y < 100; y += 6) s += st(`M55 ${y}l10 3`, '#5a4430', 1.4);
    const fan = (x, y, a, sc) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${sc})">${radial(11, -70, 70, (b) => leaf(0, 0, b, 22, 2.4, '#3f8a50', 0))}</g>`;
    s += st('M60 44L34 34M60 44L86 32M60 44L60 18M60 44L40 56M60 44L82 56', '#6a8a40', 1.4);
    return { back: s + fan(34, 34, -60, 0.8) + fan(86, 32, 60, 0.8) + fan(60, 18, 0, 0.85) + fan(40, 56, -110, 0.6) + fan(82, 56, 110, 0.6) };
  });

  def('agave', { fr: 'Agave', en: 'Agave', where: 'outdoor', pot: 'terracotta' }, () =>
    ({ back: radial(9, -80, 80, (a, i) => `<g transform="translate(60 100) rotate(${a})"><path d="M-6 0Q-5-20 0-${40 - Math.abs(a) / 6}Q5-20 6 0Z" fill="${i % 2 ? '#7aa0a8' : '#8db2b6'}" stroke="#e8d8a0" stroke-width=".8"/><path d="M0-${40 - Math.abs(a) / 6}l0-3" stroke="#5a3a2a" stroke-width="1.2"/></g>`) }));

  def('dahlia', { fr: 'Dahlia', en: 'Dahlia', where: 'outdoor', pot: 'terracotta' }, () => {
    const s = radial(6, -70, 70, (a) => leaf(60, 99, a, 26, 8, C.m, 1)) + st('M60 99Q50 60 42 40M60 99Q62 56 64 30M60 99Q72 66 82 48', '#5f8f3a', 1.6);
    const dh = (x, y, r, c1, c2) => `<g transform="translate(${x} ${y})">${[1, 0.72, 0.45].map((k, j) => radial(12, 0, 330, (a) => `<ellipse cx="0" cy="${-r * k}" rx="${r * 0.22}" ry="${r * 0.42 * k}" fill="${j % 2 ? c2 : c1}" transform="rotate(${a + j * 15})"/>`)).join('')}<circle r="${r * 0.16}" fill="#f3c23a"/></g>`;
    return { back: s + dh(42, 40, 11, '#e2306a', '#f25a8a') + dh(64, 30, 12, '#f28a2a', '#f6a84a') + dh(82, 48, 10, '#b02a5a', '#d84a7a') };
  });

  def('marguerite', { fr: 'Marguerite', en: 'Daisy', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = scatter(101, 26, 60, 86, 28, 12, (x, y, r) => leaf(x, y, r() * 120 - 60, 10, 2.4, C.m, 0));
    [[38, 52], [50, 40], [62, 34], [74, 42], [86, 54], [56, 56], [70, 60]].forEach(([x, y]) => {
      s += st(`M60 99Q${(60 + x) / 2} ${y + 20} ${x} ${y}`, '#5f8f3a', 1) + radial(14, 0, 334, (a) => `<ellipse cx="0" cy="-5" rx="1.3" ry="3.6" fill="#fff" stroke="#e3e3dc" stroke-width=".3" transform="translate(${x} ${y}) rotate(${a})"/>`) + circ(x, y, 2.6, '#f3c21f');
    });
    return { back: s };
  });

  def('hibiscus', { fr: 'Hibiscus', en: 'Hibiscus', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = st('M60 99L60 40M60 70Q48 60 40 50M60 64Q72 56 80 46', '#7a5a3a', 2);
    s += scatter(111, 30, 60, 52, 30, 26, (x, y, r) => leaf(x, y, r() * 360, 11, 5, r() > 0.5 ? C.d : C.m, 1));
    const hb = (x, y, r) => `<g transform="translate(${x} ${y})">${radial(5, 0, 288, (a) => `<path d="M0 0C-${r * 0.8}-${r * 0.4}-${r * 0.7}-${r} 0-${r}C${r * 0.7}-${r} ${r * 0.8}-${r * 0.4} 0 0Z" fill="#e2263a" transform="rotate(${a})"/>`)}<circle r="${r * 0.25}" fill="#8a0f22"/><path d="M0 0L${r * 0.6}-${r * 0.9}" stroke="#f3d34b" stroke-width="1.4"/></g>`;
    return { back: s + hb(44, 44, 9) + hb(74, 36, 10) + hb(62, 62, 8) };
  });

  def('laurier-rose', { fr: 'Laurier-rose', en: 'Oleander', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = st('M60 99Q52 70 44 44M60 99Q60 66 62 28M60 99Q70 70 80 44', '#6a7a4a', 1.6);
    s += scatter(121, 46, 60, 52, 28, 30, (x, y, r) => leaf(x, y, r() * 360, 14, 2.4, r() > 0.5 ? '#3f7a4a' : '#4f8a58', 0));
    s += [[44, 40], [62, 26], [80, 40], [52, 56], [72, 58]].map(([x, y]) => scatter(x + y, 5, x, y, 5, 4, (a, b) => flower5(a, b, 2.2, '#f07aa0', '#fbd0dc'))).join('');
    return { back: s };
  });

  def('oranger', { fr: 'Oranger', en: 'Orange tree', where: 'outdoor', pot: 'terracotta' }, (id) => P.citronnier.fn(id, ['#f2861e', '#c45f0e', '#ffd09a']));

  def('fuchsia', { fr: 'Fuchsia', en: 'Fuchsia', where: 'outdoor', pot: 'terracotta' }, () => {
    const s = scatter(131, 34, 60, 70, 30, 22, (x, y, r) => leaf(x, y, r() * 360, 9, 3.6, r() > 0.5 ? C.d : C.m, 1));
    const bell = (x, y) => `${st(`M${x} ${y - 6}L${x} ${y}`, '#a83a5a', 0.8)}<g transform="translate(${x} ${y})"><path d="M0 0L-6 4L0 2L6 4Z" fill="#e2305a"/><path d="M-3 2C-4 7-2 10 0 10C2 10 4 7 3 2Z" fill="#7a3ac4"/><path d="M0 10V14M-1 10L-2 14M1 10L2 14" stroke="#e2305a" stroke-width=".6"/></g>`;
    const front = [[36, 104], [46, 110], [74, 108], [86, 102], [58, 112]].map(([x, y]) => bell(x, y)).join('');
    return { back: s + bell(44, 72) + bell(70, 66) + bell(58, 82), front };
  });

  def('pensee', { fr: 'Pensée', en: 'Pansy', where: 'outdoor', pot: 'planter' }, () => {
    const s = scatter(141, 30, 60, 92, 30, 8, (x, y, r) => leaf(x, y, r() * 140 - 70, 10, 4, C.m, 0));
    const pz = (x, y, c1, c2) => `<g transform="translate(${x} ${y})"><circle cx="-3" cy="-3" r="3.6" fill="${c1}"/><circle cx="3" cy="-3" r="3.6" fill="${c1}"/><circle cx="-3.4" cy="1.4" r="3.2" fill="${c2}"/><circle cx="3.4" cy="1.4" r="3.2" fill="${c2}"/><circle cy="3" r="3.6" fill="${c2}"/><path d="M0 0L-2 3M0 0L2 3M0 0V4" stroke="#2a1a3a" stroke-width=".9"/><circle r="1" fill="#f3d34b"/></g>`;
    return { back: s + pz(38, 82, '#5a3aa8', '#f3d34b') + pz(52, 76, '#7a2a8a', '#7a2a8a') + pz(66, 80, '#f3d34b', '#e8862a') + pz(80, 76, '#5a3aa8', '#e8e0f8') + pz(60, 88, '#f6f0e0', '#7a5ac4') };
  });

  def('sauge', { fr: 'Sauge', en: 'Sage', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = scatter(151, 34, 60, 80, 28, 14, (x, y, r) => `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(r() * 160 - 80)})"><path d="M0 0Q5-6 0-13Q-5-6 0 0Z" fill="${r() > 0.5 ? '#94a88a' : '#a6b89c'}"/></g>`);
    [-24, -8, 8, 24].forEach((a) => { const p = at(a, 62); s += st(`M60 96L${n1(p[0])} ${n1(p[1])}`, '#8aa07c', 1); for (let k = 0; k < 5; k++) s += circ(p[0] - Math.sin(a * R) * k * 4, p[1] + k * 4, 1.6, '#7a5ac4'); });
    return { back: s };
  });

  def('poivron', { fr: 'Poivron', en: 'Bell pepper', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = st('M60 99Q58 76 50 56M60 99Q62 74 72 54M60 99L61 44', '#4f8a3a', 1.8);
    s += scatter(161, 18, 60, 64, 28, 26, (x, y, r) => leaf(x, y, (r() - 0.5) * 160, 13, 4.6, r() > 0.5 ? C.m : C.l, 1));
    const bp = (x, y, f) => `<g transform="translate(${x} ${y})"><path d="M-6 0C-8 6-6 13-3 14C-1 15 1 15 3 14C6 13 8 6 6 0C3-2-3-2-6 0Z" fill="${f}"/><path d="M0-1V-5" stroke="#3e7a2e" stroke-width="1.6"/><path d="M-3 3Q-4 8-2 11" stroke="rgba(255,255,255,.35)" stroke-width="1.2" fill="none"/></g>`;
    return { back: s + bp(46, 62, '#d8262e') + bp(72, 58, '#f3c21f') + bp(60, 76, '#3f8a2e') };
  });

  def('graminee', { fr: 'Graminée', en: 'Ornamental grass', where: 'outdoor', pot: 'concrete' }, () => {
    let s = '';
    for (let i = 0; i < 24; i++) { const a = -60 + i * 5.2, p = at(a, 48 + (i % 3) * 8); s += st(`M60 99Q${n1(60 + (p[0] - 60) * 0.3)} ${n1(p[1] + 10)} ${n1(p[0])} ${n1(p[1] + Math.abs(a) / 3)}`, i % 2 ? '#8aa05a' : '#a4b46a', 1.1); }
    [-30, -10, 10, 30].forEach((a) => { const p = at(a, 70); s += `${st(`M60 99L${n1(p[0])} ${n1(p[1])}`, '#c8b88a', 0.8)}<g transform="translate(${n1(p[0])} ${n1(p[1])}) rotate(${a})"><path d="M0 0Q4-8 0-18Q-4-8 0 0Z" fill="#e8dcb8"/></g>`; });
    return { back: s };
  });

  def('figuier', { fr: 'Figuier', en: 'Fig tree', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = st('M60 100L60 60M60 72Q48 62 40 54M60 66Q72 58 80 50', '#8a8070', 3);
    const fl = (x, y, a, sc) => `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(a)}) scale(${sc})"><path d="M0 0C-4 0-8-4-12-4C-10-8-12-12-8-14C-10-18-6-22-2-20C-2-24 2-24 2-20C6-22 10-18 8-14C12-12 10-8 12-4C8-4 4 0 0 0Z" fill="#3f8a40"/><path d="M0 0L0-20M0-6L-9-10M0-6L9-10" stroke="rgba(230,240,210,.5)" stroke-width=".9" fill="none"/></g>`;
    s += scatter(171, 16, 60, 44, 30, 20, (x, y, r) => fl(x, y, r() * 120 - 60, 1));
    [[48, 52], [70, 46], [58, 34]].forEach(([x, y]) => {
      s += `<path d="M${x} ${y}c-4 2-4 8 0 9c4-1 4-7 0-9Z" fill="#6a3a6a"/>`;
    });
    return { back: s };
  });

  def('jasmin', { fr: 'Jasmin', en: 'Jasmine', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = `<g stroke="#b89a6a" stroke-width="1.6"><path d="M40 100V18M60 100V12M80 100V18M36 30H84M36 54H84M36 78H84"/></g>`;
    s += st('M58 99C40 86 80 70 60 56C40 42 80 30 58 16', '#5a7a3a', 1.3) + st('M62 99C80 84 42 66 62 48C78 34 46 24 64 12', '#5a7a3a', 1.2);
    s += scatter(181, 34, 60, 56, 24, 40, (x, y, r) => leaf(x, y, r() * 360, 7, 2.8, C.d, 0));
    s += scatter(182, 18, 60, 52, 22, 38, (x, y) => radial(5, 0, 288, (a) => `<path d="M0 0Q1.6-2 0-4.6Q-1.6-2 0 0Z" fill="#fff" transform="translate(${n1(x)} ${n1(y)}) rotate(${a})"/>`));
    return { back: s };
  });

  def('camelia', { fr: 'Camélia', en: 'Camellia', where: 'outdoor', pot: 'terracotta' }, () => {
    let s = st('M60 99L60 50M60 76Q48 66 42 56M60 70Q72 62 80 54', '#6a5a4a', 2);
    s += scatter(191, 40, 60, 54, 30, 28, (x, y, r) => `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(r() * 360)})"><path d="M0 0Q5-5 0-11Q-5-5 0 0Z" fill="${r() > 0.5 ? '#1f5a36' : '#2a6a40'}"/><path d="M-1-3Q-2-6-1-9" stroke="rgba(255,255,255,.25)" stroke-width="1" fill="none"/></g>`);
    const cm = (x, y) => `<g transform="translate(${x} ${y})">${radial(7, 0, 308, (a) => `<ellipse cx="0" cy="-5" rx="3.6" ry="4.6" fill="#f07a98" transform="rotate(${a})"/>`)}${radial(5, 20, 308, (a) => `<ellipse cx="0" cy="-2.6" rx="2.4" ry="3" fill="#f6a2b8" transform="rotate(${a})"/>`)}<circle r="1.6" fill="#f3d34b"/></g>`;
    return { back: s + cm(44, 46) + cm(72, 40) + cm(60, 64) + cm(82, 62) };
  });


  def('generique', { fr: 'Plante', en: 'Plant', where: 'indoor', pot: 'ceramic' }, () => {
    let s = '';
    [-56, -30, -6, 18, 42, 64].forEach((a, i) => {
      s += st(`M60 99L${n1(60 + Math.sin(a * R) * 30)} ${n1(99 - Math.cos(a * R) * 30)}`, '#4f7d3a', 1.3) + leaf(60 + Math.sin(a * R) * 30, 99 - Math.cos(a * R) * 30, a, 26, 9, i % 2 ? C.m : C.l);
    });
    return { back: s };
  });


  /* ======== VARIÉTÉS ======== */
  const VEN = {"Tronc simple": "Single trunk", "Tronc simple variegata": "Single trunk variegata", "Blanche": "White", "Blanc": "White", "Jaune": "Yellow", "Violette": "Purple", "Violet": "Purple", "Rose": "Pink", "Rouge": "Red", "Orange": "Orange", "Bleu": "Blue", "Vert": "Green", "Pourpre": "Purple", "Noire de Crimée": "Black Krim", "Rosea": "Rosea", "Fleur jaune": "Yellow flower", "Bambou noir": "Black bamboo", "Feuille de chêne rouge": "Red oak leaf", "Jaune (Fallgold)": "Yellow (Fallgold)", "Pineberry (blanche)": "Pineberry (white)", "Blanc et rose": "White and pink", "Annabelle (blanc)": "Annabelle (white)", "Viridis (vert)": "Viridis (green)", "Katsura (orange)": "Katsura (orange)", "Nicolai (fleur blanche)": "Nicolai (white flower)"};
  const V = (key, id, fr, o = {}) => { (P[key].vars = P[key].vars || {})[id] = Object.assign({ fr, en: VEN[fr] || fr }, o); };
  const W = '#f3f2e4', CR = '#efe9c8', _Y = '#e8d25a', PK = '#f08ab0';
  V('monstera', 'albo', 'Albo Variegata', { fn: monsteraFn('albo'), pot: 'terracotta' });
  V('monstera', 'thai', 'Thai Constellation', { fn: monsteraFn('thai') });
  V('monstera', 'aurea', 'Aurea', { fn: monsteraFn('aurea') });
  V('pilea', 'mojito', 'Mojito', { fn: pileaFn('mojito'), pot: 'terracotta' });
  V('pilea', 'sugar', 'Sugar', { fn: pileaFn('sugar'), pot: 'sage' });
  V('pilea', 'splash', 'White Splash', { fn: pileaFn('splash'), pot: 'concrete' });
  V('pachira', 'variegata', 'Variegata', { pattern: 'marble', c1: W, c2: '#cfe0a8' });
  V('pachira', 'simple', 'Tronc simple', { single: true });
  V('pachira', 'simple-variegata', 'Tronc simple variegata', { single: true, pattern: 'marble', c1: W, c2: '#cfe0a8' });
  V('sansevieria', 'moonshine', 'Moonshine', { swap: { '#2f6b47': '#a9c0b0', '#2a6141': '#9fb8a6', '#357552': '#b4c9ba', '#3f8a5c': '#bfd1c3', '#cfcf63': '#cfdccf' } });
  V('sansevieria', 'black-gold', 'Black Gold', { swap: { '#2f6b47': '#1f2b24', '#2a6141': '#1a241e', '#357552': '#24322a', '#3f8a5c': '#2a3a30', '#cfcf63': '#e6c84a' } });
  V('sansevieria', 'zeylanica', 'Zeylanica', { swap: { '#cfcf63': '#3a6e4a' } });
  V('pothos', 'marble-queen', 'Marble Queen', { swap: { '#e8e08a': '#f6f6ee', '#3f7d3e': '#5a8a56' } });
  V('pothos', 'neon', 'Neon', { swap: { '#3f7d3e': '#a4d24e', '#e8e08a': '#c8e878', '#6a8f45': '#8ab048' } });
  V('pothos', 'njoy', "N'Joy", { swap: { '#e8e08a': '#ffffff', '#3f7d3e': '#3a7a3c' } });
  V('pothos', 'jade', 'Jade', { swap: { '#e8e08a': '#3f7d3e' } });
  V('orchidee', 'blanche', 'Blanche', { swap: { '#f7e4f1': '#fbfbf8', '#fbeef7': '#ffffff', '#f3d2e6': '#f2f0ea', '#d9478f': '#e8c84a', '#ecc9de': '#f0eee8' } });
  V('orchidee', 'jaune', 'Jaune', { swap: { '#f7e4f1': '#f6dc6a', '#fbeef7': '#f9e48a', '#f3d2e6': '#f0cc5a', '#d9478f': '#c2402e', '#ecc9de': '#f2d870' } });
  V('orchidee', 'violette', 'Violette', { swap: { '#f7e4f1': '#b65ac6', '#fbeef7': '#c46ed2', '#f3d2e6': '#a04ab2', '#d9478f': '#5e1670', '#ecc9de': '#c07ace' } });
  V('calathea', 'white-fusion', 'White Fusion', { swap: { '#a7d49a': '#f4f4ec', '#3d7552': '#4c8a5a', '#bfe0a8': '#ffffff' } });
  V('calathea', 'medallion', 'Medallion', { swap: { '#3d7552': '#24443a', '#a7d49a': '#9fc4a0', '#6a5a7a': '#8a3a5a' } });
  V('zamioculcas', 'raven', 'Raven', { swap: { '#2f7a45': '#1a221d', '#3e8f55': '#212a24', '#4a7a3a': '#2a2a2a' } });
  V('zamioculcas', 'variegata', 'Variegata', { pattern: 'halfmoon', c1: '#eef0d8' });
  V('spathiphyllum', 'domino', 'Domino', { pattern: 'speckle', c1: W, c2: '#d8e8c8' });
  V('ficus-elastica', 'tineke', 'Tineke', { pattern: 'margin', c1: CR, c2: '#b8d0a0', swap: { '#2c4a3a': '#4f7a50' } });
  V('ficus-elastica', 'ruby', 'Ruby', { pattern: 'margin', c1: '#eaa0b6', c2: '#f6d0dc', swap: { '#2c4a3a': '#56704e' } });
  V('ficus-elastica', 'robusta', 'Robusta', { swap: { '#2c4a3a': '#2f6a3e', '#b5485a': '#6a9a5a', '#c44a5e': '#7aa85a' } });
  V('dracaena', 'tricolor', 'Tricolor', { swap: { '#b8465a': '#ee6a8a', '#4c9a4e': '#86ad5c' } });
  V('dracaena', 'bicolor', 'Bicolor', { swap: { '#b8465a': '#d03a3a', '#4c9a4e': '#3f7a3e' } });
  V('chlorophytum', 'vert', 'Vert', { swap: { '#f1f3dc': '#4f9a52' } });
  V('echeveria', 'pourpre', 'Perle von Nürnberg', { swap: { '#86ada3': '#9a7aa8', '#97bdb1': '#a88ab4', '#a9cbbe': '#b89ac0', '#bcd8cb': '#c8acd0' } });
  V('philodendron', 'pink-princess', 'Pink Princess', { tint: '#2c2a2b', pattern: 'splash', c1: PK, c2: '#f6b8d0' });
  V('philodendron', 'birkin', 'Birkin', { tint: '#2a5236', pattern: 'pinstripe', c1: W });
  V('philodendron', 'brasil', 'Brasil', { pattern: 'center', c1: '#b8d860' });
  V('philodendron', 'lemon-lime', 'Lemon Lime', { tint: '#a8d45a' });
  V('alocasia', 'black-velvet', 'Black Velvet', { swap: { '#1f3d30': '#16191a', '#25483a': '#1c2022', '#e4efe0': '#c8d0cc' } });
  V('alocasia', 'frydek', 'Frydek', { swap: { '#1f3d30': '#2e5a3a', '#25483a': '#356442' } });
  V('strelitzia', 'nicolai', 'Nicolai (fleur blanche)', { swap: { '#f28a1e': '#f6f6f2', '#f6a623': '#ecebe4', '#f9b84a': '#fbfbf6', '#3b6fd8': '#5a6ab0', '#3a5a7a': '#2a3240' } });
  V('yucca', 'variegata', 'Variegata', { pattern: 'margin', c1: '#e8d86a' });
  V('crassula', 'tricolor', 'Tricolor', { swap: { '#4f9a5c': '#9ac07a', '#5fae6a': '#dfe6b0', '#c44a4a': '#ec6a8a' } });
  V('dionee', 'red-dragon', 'Red Dragon', { swap: { '#8fc75a': '#b8323e', '#7ab84a': '#8a2a30', '#b9e08a': '#e86a6a' } });
  V('anthurium', 'rose', 'Rose', { swap: { '#e0263a': PK } });
  V('anthurium', 'blanc', 'Blanc', { swap: { '#e0263a': '#f6f6f0', '#f3d34b': '#e8e0a0' } });
  V('anthurium', 'noir', 'Black Queen', { swap: { '#e0263a': '#2a1018' } });
  V('lierre', 'glacier', 'Glacier', { swap: { '#2f6b3f': '#7a9a80', '#3d8050': '#a0b8a4', '#e8edc8': '#ffffff' } });
  V('lierre', 'goldchild', 'Goldchild', { swap: { '#2f6b3f': '#7a9a40', '#3d8050': '#cccc62' } });
  V('tradescantia', 'nanouk', 'Nanouk', { swap: { '#6b3f8a': '#7a9a6a', '#d8c8ef': '#f2b2d2' } });
  V('tradescantia', 'quicksilver', 'Quicksilver', { swap: { '#6b3f8a': '#3f7a4a', '#d8c8ef': '#eef4ea', '#7a5a8a': '#5a7a4a' } });
  V('peperomia', 'variegata', 'Variegata', { swap: { '#3d8a4a': '#98c060', '#4f9a58': '#cadb84' } });
  V('ficus-benjamina', 'starlight', 'Starlight', { pattern: 'margin', c1: W });
  V('cyclamen', 'blanc', 'Blanc', { swap: { '#e5487a': '#f8f6f2', '#f06a95': '#ffffff', '#a8234e': '#d0a0b0' } });
  V('cyclamen', 'rouge', 'Rouge', { swap: { '#e5487a': '#c81e3a', '#f06a95': '#d8283e' } });
  V('poinsettia', 'blanc', 'Blanc', { swap: { '#d61f32': '#f2efe0', '#e8303f': '#f8f6ec' } });
  V('poinsettia', 'rose', 'Rose', { swap: { '#d61f32': '#e87aa0', '#e8303f': '#f08ab0' } });
  V('bromelia', 'jaune', 'Jaune', { swap: { '#e2304a': '#f3c21f', '#b81f3a': '#c89a10' } });
  V('bromelia', 'orange', 'Orange', { swap: { '#e2304a': '#f07a1e', '#b81f3a': '#c85a10' } });
  V('tomate', 'noire', 'Noire de Crimée', { swap: { '#e0412f': '#5a2a2a', '#ea5a32': '#6a3030' } });
  V('tomate', 'jaune', 'Jaune', { swap: { '#e0412f': '#f3c21f', '#ea5a32': '#f5cc3a' } });
  V('basilic', 'pourpre', 'Pourpre', { swap: { '#5cb85c': '#6a3a5a', '#4aa24c': '#4a2a40' } });
  V('lavande', 'blanche', 'Blanche', { swap: { '#8a6cc9': '#f2f0f6', '#7a5bb8': '#e2deea' } });
  V('lavande', 'rose', 'Rosea', { swap: { '#8a6cc9': '#e8a0c8', '#7a5bb8': '#d88ab8' } });
  V('rosier', 'rose', 'Rose', { swap: { '#c8283e': '#e87a98', '#d23447': '#f08aa6', '#b8283e': '#e07090', '#e0566a': '#f4a8bc' } });
  V('rosier', 'blanc', 'Blanc', { swap: { '#c8283e': '#f2eee6', '#d23447': '#faf8f2', '#b8283e': '#eeeae0', '#e0566a': '#fffdf8' } });
  V('rosier', 'jaune', 'Jaune', { swap: { '#c8283e': '#f0c01f', '#d23447': '#f6d040', '#b8283e': '#e8b81a', '#e0566a': '#f8dc70' } });
  V('rosier', 'orange', 'Orange', { swap: { '#c8283e': '#f07a3a', '#d23447': '#f58a4a', '#b8283e': '#e86a2a', '#e0566a': '#f8a870' } });
  V('geranium', 'rose', 'Rose', { swap: { '#e8344a': '#f07ab0', '#f24c5e': '#f590c0' } });
  V('geranium', 'blanc', 'Blanc', { swap: { '#e8344a': '#f6f4f0', '#f24c5e': '#ffffff', '#ffd0d6': '#f0a0b0' } });
  V('geranium', 'violet', 'Violet', { swap: { '#e8344a': '#9a4ac0', '#f24c5e': '#b060d0' } });
  V('hortensia', 'bleu', 'Bleu', { swap: { '#d78ac2': '#7f9be0', '#e9a8d6': '#9fb5ee', '#8d93e3': '#6a8ae0' } });
  V('hortensia', 'rose', 'Rose', { swap: { '#7f9be0': '#e08ac0', '#9fb5ee': '#f0a8d4', '#8d93e3': '#e890c8', '#b1b6f2': '#f4b8dc', '#d7e3fb': '#fbe0ef' } });
  V('hortensia', 'annabelle', 'Annabelle (blanc)', { swap: { '#7f9be0': '#e6ecd4', '#9fb5ee': '#f2f6e6', '#d78ac2': '#e6ecd4', '#e9a8d6': '#f2f6e6', '#8d93e3': '#e2e8d0', '#b1b6f2': '#f6f8ee', '#d7e3fb': '#ffffff' } });
  V('tournesol', 'velvet-queen', 'Velvet Queen', { swap: { '#f6c21f': '#9a2a1e', '#f9d23c': '#b8361e' } });
  V('erable-japon', 'vert', 'Viridis (vert)', { swap: { '#c0392b': '#5a9a3a', '#d9483b': '#6aaa48', '#a8322d': '#4a8a30', '#e3663f': '#7ab858' } });
  V('erable-japon', 'orange', 'Katsura (orange)', { swap: { '#c0392b': '#e8822a', '#d9483b': '#f09a3a', '#a8322d': '#d06a1a', '#e3663f': '#f4b050' } });
  V('bambou', 'noir', 'Bambou noir', { swap: { '#9cb84a': '#2a2a2a', '#6f8a2e': '#0e0e0e' } });
  V('piment', 'jaune', 'Jaune', { swap: { '#d8262e': '#f3c21f', '#e33a2a': '#f5cc3a' } });
  V('piment', 'violet', 'Violet', { swap: { '#d8262e': '#4a1a5a', '#e33a2a': '#5a2a6a' } });
  V('laitue', 'chene-rouge', 'Feuille de chêne rouge', { swap: { '#8fcf6a': '#a8344a', '#7cc25a': '#8a2a3e', '#5e9e42': '#6a1e30', '#b7e08a': '#c8607a' } });
  V('petunia', 'rouge', 'Rouge', { swap: { '#9b3fc4': '#d8263a', '#c45aa8': '#e8344a', '#e07ac0': '#f0505e' } });
  V('petunia', 'blanc', 'Blanc', { swap: { '#9b3fc4': '#f6f4f2', '#c45aa8': '#ffffff', '#e07ac0': '#f2eeec' } });
  V('petunia', 'rose', 'Rose', { swap: { '#9b3fc4': '#e87ab8', '#c45aa8': '#f090c4', '#e07ac0': '#f4a8d0' } });
  V('tulipe', 'rouge', 'Rouge', { swap: { '#f5c21f': '#e0263a', '#f07aa8': '#e0263a' } });
  V('tulipe', 'jaune', 'Jaune', { swap: { '#e0263a': '#f5c21f', '#f07aa8': '#f5c21f' } });
  V('tulipe', 'blanche', 'Blanche', { swap: { '#e0263a': '#f6f4ee', '#f5c21f': '#ffffff', '#f07aa8': '#f2f0e8' } });
  V('tulipe', 'queen-of-night', 'Queen of Night', { swap: { '#e0263a': '#3a1638', '#f5c21f': '#4a1e48', '#f07aa8': '#2e1030' } });
  V('agapanthe', 'blanche', 'Blanche', { swap: { '#5a7ae0': '#f4f4f0' } });
  V('bougainvillier', 'orange', 'Orange', { swap: { '#d02a8a': '#f07a2a', '#e848a0': '#f59a4a' } });
  V('bougainvillier', 'blanc', 'Blanc', { swap: { '#d02a8a': '#f2f0ea', '#e848a0': '#ffffff' } });
  V('framboisier', 'jaune', 'Jaune (Fallgold)', { swap: { '#d6264a': '#f2c64a' } });
  V('fraisier', 'pineberry', 'Pineberry (blanche)', { swap: { '#e2333f': '#f6f2ec', '#ffe08a': '#e2333f' } });
  V('courgette', 'jaune', 'Jaune', { swap: { '#3f7a2e': '#f2c21f', '#8ac05a': '#f8de70' } });
  V('dahlia', 'cafe-au-lait', 'Café au lait', { swap: { '#e2306a': '#f2dcc8', '#f25a8a': '#f8e8d8', '#f28a2a': '#f0d0b8', '#f6a84a': '#f8e4d0', '#b02a5a': '#e8d0c0', '#d84a7a': '#f4e0d0' } });
  V('hibiscus', 'rose', 'Rose', { swap: { '#e2263a': '#f07aa8', '#8a0f22': '#b02a5a' } });
  V('hibiscus', 'jaune', 'Jaune', { swap: { '#e2263a': '#f6c21f', '#8a0f22': '#c0301a' } });
  V('laurier-rose', 'blanc', 'Blanc', { swap: { '#f07aa0': '#f8f6f2', '#fbd0dc': '#ffffff' } });
  V('laurier-rose', 'rouge', 'Rouge', { swap: { '#f07aa0': '#d02a3a', '#fbd0dc': '#f6a0a8' } });
  V('fuchsia', 'blanc-rose', 'Blanc et rose', { swap: { '#7a3ac4': '#f6f2f6', '#e2305a': '#f07aa8' } });
  V('camelia', 'blanc', 'Blanc', { swap: { '#f07a98': '#f8f6f2', '#f6a2b8': '#ffffff' } });
  V('camelia', 'rouge', 'Rouge', { swap: { '#f07a98': '#c81e3a', '#f6a2b8': '#e0304a' } });
  V('sauge', 'pourpre', 'Purpurascens', { swap: { '#94a88a': '#7a5a7a', '#a6b89c': '#8a6a8a' } });
  V('graminee', 'rubrum', 'Pennisetum Rubrum', { swap: { '#8aa05a': '#7a3a4a', '#a4b46a': '#9a4a5a', '#e8dcb8': '#c890a0' } });
  V('agave', 'variegata', 'Americana Variegata', { swap: { '#e8d8a0': '#f0d040' } });
  V('aloe', 'christmas', 'Christmas', { swap: { '#78ad84': '#6a9a7a', '#86b991': '#7aa888', '#e8f2e0': '#f07a8a' } });
  V('cactus', 'fleur-jaune', 'Fleur jaune', { swap: { '#f06ba0': '#f6c21f' } });

  // ---------- pots ----------
  const POTS = {
    ceramic: ['#ece7de', '#d7d0c4', '#f7f4ee'],
    white: ['#f4f4f2', '#dcdcd8', '#ffffff'],
    concrete: ['#a3a8ad', '#8b9095', '#b8bdc2'],
    terracotta: ['#c8693f', '#a9542f', '#d9805a'],
    sage: ['#86ab9b', '#6f9383', '#9cc0b0'],
  };
  const SOIL = { ok: '#6b4a33', dry: '#b89470', wet: '#3a271b', cold: '#5f4a3e', hot: '#9a7656' };
  function pot(kind, state) {
    const soil = SOIL[state] || SOIL.ok;
    if (kind === 'bowl') {
      const [b, d, h] = POTS.ceramic;
      return `<ellipse cx="60" cy="102" rx="30" ry="4" fill="${soil}"/><path d="M28 101H92L86 122Q60 128 34 122Z" fill="${b}"/><path d="M28 101H92L91 105H29Z" fill="${d}"/><path d="M36 108Q38 118 42 121" stroke="${h}" stroke-width="2" fill="none" opacity=".8"/>`;
    }
    if (kind === 'tray') {
      return `<ellipse cx="60" cy="104" rx="34" ry="2.6" fill="${soil}"/><path d="M24 103H96L92 114H28Z" fill="#3a4a5a"/><rect x="22" y="101" width="76" height="4" rx="1.5" fill="#2e3c4a"/><path d="M32 114v4M88 114v4" stroke="#2e3c4a" stroke-width="3"/>`;
    }
    if (kind === 'planter') {
      const b = '#5b5f66', d = '#474b51';
      return `<rect x="26" y="98" width="68" height="6" rx="1.5" fill="${d}"/><rect x="29" y="103" width="62" height="33" rx="2" fill="${b}"/><path d="M29 112H91M29 122H91" stroke="rgba(255,255,255,.07)" stroke-width="1"/><ellipse cx="60" cy="99" rx="31" ry="2.4" fill="${soil}"/>`;
    }
    const [b, d, _h] = POTS[kind] || POTS.ceramic;
    const g = `pg${uid}`;
    return `<defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="${shade(b, -0.18)}"/><stop offset=".3" stop-color="${shade(b, 0.12)}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${shade(b, -0.32)}"/></linearGradient><linearGradient id="${g}r" x1="0" x2="1"><stop offset="0" stop-color="${shade(d, -0.15)}"/><stop offset=".35" stop-color="${shade(d, 0.18)}"/><stop offset="1" stop-color="${shade(d, -0.3)}"/></linearGradient><radialGradient id="${g}s" cy=".4"><stop offset="0" stop-color="${shade(soil, -0.25)}"/><stop offset="1" stop-color="${soil}"/></radialGradient></defs><ellipse cx="60" cy="137" rx="30" ry="3" fill="rgba(0,0,0,.18)"/><ellipse cx="60" cy="100" rx="27" ry="4" fill="url(#${g}s)"/>${soilDots(state)}<path d="M32 104H88L82 136H38Z" fill="url(#${g})"/><path d="M32 104H88L87.4 108H32.6Z" fill="rgba(0,0,0,.18)"/><rect x="29" y="97" width="62" height="9" rx="2.5" fill="url(#${g}r)"/><path d="M31 98.2H89" stroke="rgba(255,255,255,.35)" stroke-width=".8"/><path d="M38 136H82" stroke="rgba(0,0,0,.2)" stroke-width="1.2"/>`;
  }
  function soilDots(state) { const r = rng(5); let s = ''; for (let i = 0; i < 16; i++) s += `<circle cx="${n1(36 + r() * 48)}" cy="${n1(98 + r() * 4)}" r="${n1(0.4 + r() * 0.6)}" fill="${shade(SOIL[state] || SOIL.ok, r() > 0.5 ? 0.25 : -0.3)}"/>`; return s; }
  // sonde (capteur de sol type Mi Flora)
  const probe = (state) =>
    `<g class="pa-probe"><rect x="80" y="84" width="6" height="16" rx="2" fill="#f2f3f5" stroke="#c9ccd1" stroke-width=".6"/><path d="M82 100V108M84 100V108" stroke="#b8bcc2" stroke-width="1"/><circle cx="83" cy="88" r="1.3" fill="${
      { ok: '#3ecf6e', dry: '#ef4444', wet: '#3b82f6', cold: '#06b6d4', hot: '#f59e0b' }[state] || '#3ecf6e'
    }" class="pa-led"/></g>`;
  // effets d'état
  const fx = {
    dry: () => `<g class="pa-fx-dry"><path d="M44 101l4-1 3 2M66 100l3 1 2-1M54 103l2-1" stroke="#7d5a3c" stroke-width=".8" fill="none"/><g class="pa-fall"><path d="M0 0Q4-3 0-8Q-4-3 0 0Z" fill="#c9a84a" transform="translate(24 70) rotate(40)"/></g></g>`,
    wet: () => `<g class="pa-fx-wet"><path class="pa-drop d1" d="M44 30q3 5 0 7q-3-2 0-7Z" fill="#5aa9f0"/><path class="pa-drop d2" d="M74 22q3 5 0 7q-3-2 0-7Z" fill="#5aa9f0"/><path class="pa-drop d3" d="M60 14q3 5 0 7q-3-2 0-7Z" fill="#7cbcf5"/><ellipse cx="52" cy="100" rx="8" ry="1.2" fill="rgba(160,210,255,.45)"/></g>`,
    cold: () => `<g class="pa-fx-cold" stroke="#7fd3ea" stroke-width="1.3" stroke-linecap="round"><g transform="translate(16 18)"><path d="M0-7V7M-6-3.5L6 3.5M-6 3.5L6-3.5"/></g><g transform="translate(104 30) scale(.7)"><path d="M0-7V7M-6-3.5L6 3.5M-6 3.5L6-3.5"/></g><path d="M31 98q4 3 8 0q4 3 8 0q4 3 8 0q4 3 8 0q4 3 8 0q4 3 8 0q4 3 8 0" fill="none" stroke="#e7f7fc" stroke-width="2" opacity=".9"/></g>`,
    hot: () => `<g class="pa-fx-hot"><circle cx="102" cy="16" r="7" fill="#fbbf24"/><g stroke="#fbbf24" stroke-width="1.4" stroke-linecap="round"><path d="M102 4v-3M102 31v-3M90 16h-3M117 16h-3M93 7l-2-2M111 25l2 2M111 7l2-2M93 25l-2 2"/></g><path class="pa-heat" d="M20 40q3-4 0-8q-3-4 0-8M28 44q3-4 0-8q-3-4 0-8" stroke="rgba(245,158,11,.6)" stroke-width="1.3" fill="none"/></g>`,
  };

  function svg(key, opts = {}) {
    let p = P[key] || P.generique;
    const vr = opts.variety && p.vars?.[opts.variety];
    MODE = Object.assign({ swap: {} }, vr || {});
    if (vr) p = Object.assign({}, p, { fn: vr.fn || p.fn, pot: vr.pot || p.pot });
    try { let out = svg0(p, key, opts); for (const [a, b] of Object.entries(MODE.swap)) out = out.split(a).join(b); return out; } finally { MODE = { swap: {} }; }
  }
  function svg0(p, key, opts) {
    const state = opts.state || 'ok';
    const id = ++uid;
    jr = rng(key.length * 97 + 13);
    const o = p.fn(id);
    const potKind = opts.pot || p.pot;
    const bake = { dry: [`<filter id="f${id}"><feColorMatrix type="matrix" values=".62 .3 .08 0 .04  .3 .58 .1 0 .03  .2 .25 .4 0 0  0 0 0 1 0"/></filter>`, ' transform="translate(60 100) scale(1 .93) skewX(-3) translate(-60 -100)"'], cold: [`<filter id="f${id}"><feColorMatrix type="hueRotate" values="18"/><feColorMatrix type="saturate" values=".75"/></filter>`, ''] }[state];
    if (bake) { const fol = (x, c = "") => `<g class="pa-fol${c}" filter="url(#f${id})"${bake[1]}><g filter="url(#L${id})">${x}</g></g>`; return `<svg class="pa pa-${state}" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${o.defs || ''}${bake[0]}${`<filter id="L${id}" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.3" result="b"/><feDiffuseLighting in="b" surfaceScale="2" diffuseConstant="1.05" lighting-color="#fff" result="l"><feDistantLight azimuth="225" elevation="62"/></feDiffuseLighting><feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1="1.08" k2="0" k3="0" k4="0.04" result="lit"/><feComposite in="lit" in2="SourceAlpha" operator="in" result="c"/><feDropShadow dx="1" dy="1.6" stdDeviation="1.1" flood-color="#000" flood-opacity=".14"/></filter>`}</defs>${fol(o.back)}${pot(potKind, state)}${o.front ? fol(o.front, ' pa-front') : ''}${opts.probe === false ? '' : probe(state)}${fx[state] ? fx[state]() : ''}</svg>`; }
    return `<svg class="pa pa-${state}" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${o.defs || ''}${`<filter id="L${id}" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.3" result="b"/><feDiffuseLighting in="b" surfaceScale="2" diffuseConstant="1.05" lighting-color="#fff" result="l"><feDistantLight azimuth="225" elevation="62"/></feDiffuseLighting><feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1="1.08" k2="0" k3="0" k4="0.04" result="lit"/><feComposite in="lit" in2="SourceAlpha" operator="in" result="c"/><feDropShadow dx="1" dy="1.6" stdDeviation="1.1" flood-color="#000" flood-opacity=".14"/></filter>`}</defs><g class="pa-fol"><g filter="url(#L${id})">${o.back}</g></g>${pot(potKind, state)}${o.front ? `<g class="pa-fol pa-front"><g filter="url(#L${id})">${o.front}</g></g>` : ''}${opts.probe === false ? '' : probe(state)}${fx[state] ? fx[state]() : ''}</svg>`;
  }
  return {
    svg,
    has: (key) => !!P[key] && key !== "generique",
    varieties: (key) => Object.entries(P[key]?.vars || {}).map(([id, v]) => ({ id, fr: v.fr, en: v.en || v.fr })),
    list: Object.values(P)
      .filter((p) => p.key !== "generique")
      .map(({ key, fr, en, where }) => ({ key, fr, en, where })),
  };
})();
