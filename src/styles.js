// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

export const STYLE = `
  :host { --pl-accent: #2e9e5b; --pl-ok: var(--success-color, #2e9e5b); --pl-warn: var(--warning-color, #d97706);
          --pl-crit: var(--error-color, #dc2626); --pl-idle: var(--secondary-text-color, #9e9e9e); --pl-cold: #0891b2; --pl-wet: #2f6fd6;
          --pl-tile: var(--secondary-background-color, rgba(127,127,127,.08)); --pl-track: color-mix(in srgb, var(--primary-text-color) 12%, transparent);
          display: block; min-width: 0; }
  ha-card { overflow: hidden; container-type: inline-size; container-name: pl-card; position: relative; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  button:focus-visible, [role="button"]:focus-visible { outline: 2px solid var(--primary-color, var(--pl-accent)); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  .ok { --c: var(--pl-ok); } .warn { --c: var(--pl-warn); } .crit { --c: var(--pl-crit); } .wet { --c: var(--pl-wet); }
  .cold { --c: var(--pl-cold); } .idle { --c: var(--pl-idle); }
  .ink { color: color-mix(in srgb, var(--c) 62%, var(--primary-text-color)); }

  /* Illustrated header, 90 px as on the other ha-* cards: a wall and a window (a garden for an outdoor plant), the
     plants on a shelf, the ground bar at the bottom; night when Home Assistant's theme is dark. */
  .hdr { position: relative; height: 90px; overflow: hidden; background: #eef2ea; }
  .hdr.out { background: linear-gradient(#d4eaf9, #e8f3fb); }
  .hdr.night { background: #1d272b; }
  .hdr.out.night { background: linear-gradient(#18243a, #22324a); }
  .hdr .win { position: absolute; top: 10px; left: 46%; width: 84px; height: 72px; border-radius: 6px 6px 0 0; border: 4px solid #fff;
              border-bottom: none; box-sizing: border-box; background: linear-gradient(#bfe0f6, #dcefff); }
  .hdr.night .win { border-color: #3a4650; background: linear-gradient(#0f1a2e, #22324a); }
  .hdr .win::after { content: ""; position: absolute; left: 50%; top: 0; bottom: 0; border-left: 3px solid #fff; }
  .hdr.night .win::after { border-color: #3a4650; }
  /* The sun and the moon at the top middle (the moon in the window indoors), clear of the title and of the pill. */
  .hdr .moon { position: absolute; top: 8px; left: 50%; margin-left: -6px; width: 12px; height: 12px; border-radius: 50%; background: #f1e7b8; box-shadow: -3px -2px 0 0 #22324a inset; }
  .hdr .sun { position: absolute; top: 8px; left: 50%; margin-left: -8px; width: 16px; height: 16px; border-radius: 50%; background: #fbd34d; box-shadow: 0 0 0 4px rgba(251,211,77,.25); }
  .hdr .win .moon { top: 8px; left: auto; right: 8px; margin: 0; z-index: 1; }
  .hdr.out .win { display: none; }
  .hdr .shelf { position: absolute; right: 8px; bottom: 6px; left: 180px; display: flex; justify-content: flex-end; align-items: flex-end; overflow: hidden; }
  /* Narrow (6 of 12 columns on a phone): one plant on the shelf, no window, the pill reduced to its dot. */
  @container pl-card (max-width: 340px) {
    .hdr .win, .hdr .sun, .hdr .moon { display: none; }
    .hdr .shelf { left: auto; width: 60px; justify-content: flex-start; }
    .pill .ink { display: none; }
    .pill { padding: 4px 6px; }
  }
  .hdr .shelf .pa { width: 58px; height: 68px; flex: none; margin: 0 -5px; }
  .hdr .ground { position: absolute; left: 0; right: 0; bottom: 0; height: 7px; background: #b9895a; }
  .hdr.night .ground { background: #7a5a3e; }
  .hdr.out .ground { background: #6fae4f; }
  .hdr.out.night .ground { background: #3f6e34; }
  .hdr .head { position: absolute; left: 14px; top: 14px; right: 60px; display: flex; align-items: center; gap: 12px; min-width: 0; }
  .badge-icon { width: 40px; height: 40px; border-radius: 50%; flex: none; display: grid; place-items: center;
                background: color-mix(in srgb, var(--c) 18%, var(--card-background-color, #fff)); }
  .badge-icon .icon { width: 24px; height: 24px; fill: color-mix(in srgb, var(--c) 75%, var(--primary-text-color)); }
  .titles { min-width: 0; display: flex; flex-direction: column; }
  .name { font-size: 16px; font-weight: 700; line-height: 20px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          text-shadow: 0 0 6px var(--pl-halo, rgba(255,255,255,.7)); }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 0 6px var(--pl-halo, rgba(255,255,255,.7)); }
  .hdr.night { --pl-halo: rgba(0,0,0,.6); }
  .pill { position: absolute; top: 10px; right: 12px; display: inline-flex; align-items: center; gap: 6px; padding: 3px 9px; border-radius: 999px;
          font-size: 11px; font-weight: 600; white-space: nowrap; background: color-mix(in srgb, var(--card-background-color, #fff) 88%, transparent); }
  .pill .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--c); }
  .has-btn .pill { right: 54px; }
  .rbtn { position: absolute; top: 8px; right: 10px; width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--divider-color, rgba(127,127,127,.3));
          background: color-mix(in srgb, var(--card-background-color, #fff) 70%, transparent); color: var(--secondary-text-color);
          display: grid; place-items: center; cursor: pointer; padding: 0; }
  .rbtn .icon { width: 18px; height: 18px; }
  .rbtn:hover { color: var(--primary-text-color); }

  /* Animations of the drawings: the foliage sways (one plant on screen: the mini card, the detail), the effects of a
     state play everywhere (drops, a falling leaf, heat, the probe's light). */
  .sway .pa-fol { transform-box: view-box; transform-origin: 60px 100px; animation: pl-sway 7s ease-in-out infinite; }
  .sway .pa-front { animation-duration: 9s; }
  .sway .pa-dry .pa-fol { animation: none; }
  .pa .pa-led { animation: pl-blink 2.4s ease-in-out infinite; }
  .pa .pa-drop { animation: pl-drop 1.8s ease-in infinite; }
  .pa .pa-drop.d2 { animation-delay: .6s; } .pa .pa-drop.d3 { animation-delay: 1.2s; }
  .pa .pa-fall { animation: pl-fall 5s ease-in-out infinite; }
  .pa .pa-heat { animation: pl-heat 2.6s ease-in-out infinite; }
  @keyframes pl-sway { 0%, 100% { transform: rotate(-1.2deg); } 50% { transform: rotate(1.2deg); } }
  @keyframes pl-blink { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
  @keyframes pl-drop { 0% { transform: translateY(-6px); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(60px); opacity: 0; } }
  @keyframes pl-fall { 0% { transform: translate(0, 0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translate(10px, 30px) rotate(60deg); opacity: 0; } }
  @keyframes pl-heat { 0%, 100% { transform: translateY(0); opacity: .3; } 50% { transform: translateY(-4px); opacity: 1; } }
  .pill .dot.blink { animation: pl-blink 1.6s ease-in-out infinite; }

  /* Values */
  .metrics { display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 600; }
  .metrics span { display: inline-flex; align-items: center; gap: 2px; white-space: nowrap; }
  .metrics .icon { width: 14px; height: 14px; }
  .t-ico { fill: var(--secondary-text-color); } .h-ico { fill: #3b82f6; }
  .metrics .alert .icon { fill: var(--c); }
  .bar { position: relative; height: 5px; border-radius: 3px; background: var(--pl-track); margin-top: 4px; }
  .bar .band { position: absolute; top: 0; bottom: 0; border-radius: 3px; background: color-mix(in srgb, var(--pl-ok) 38%, transparent); }
  .bar .mark { position: absolute; top: -2px; width: 9px; height: 9px; margin-left: -4.5px; border-radius: 50%; background: var(--c);
               box-shadow: 0 0 0 2px var(--pl-tile-bg, var(--card-background-color, #fff)); }

  /* Full card: filters and tiles */
  .body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 12px; }
  .filters { display: flex; flex-wrap: wrap; gap: 6px; }
  .filter { font: inherit; font-size: 12px; font-weight: 500; padding: 6px 12px; border-radius: 999px; cursor: pointer;
            border: 1px solid var(--divider-color, rgba(127,127,127,.3)); background: transparent; color: var(--secondary-text-color); }
  .filter.on { border-color: var(--pl-accent); background: color-mix(in srgb, var(--pl-accent) 12%, transparent);
               color: color-mix(in srgb, var(--pl-accent) 60%, var(--primary-text-color)); font-weight: 600; }
  .grid { display: grid; grid-template-columns: repeat(var(--pl-cols, 2), minmax(0, 1fr)); gap: 8px; }
  @container pl-card (max-width: 340px) { .grid.auto { --pl-cols: 1; } }
  @container pl-card (min-width: 620px) { .grid.auto { --pl-cols: 3; } }
  .tile { all: unset; box-sizing: border-box; position: relative; display: flex; gap: 8px; padding: 8px 10px 10px 6px; border-radius: 10px;
          background: var(--pl-tile); cursor: pointer; min-width: 0; --pl-tile-bg: var(--pl-tile); }
  .tile:hover { background: color-mix(in srgb, var(--pl-accent) 8%, var(--pl-tile)); }
  .tile:focus-visible { outline: 2px solid var(--primary-color, var(--pl-accent)); outline-offset: 2px; }
  .tile .pa { width: 50px; height: 58px; flex: none; }
  .tile .tdot { position: absolute; top: 8px; right: 8px; width: 9px; height: 9px; border-radius: 50%; background: var(--c);
                box-shadow: 0 0 0 2px var(--card-background-color, #fff); }
  .tile .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .tile .tname { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 12px; }
  .tile .troom { font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tile .tstate { font-size: 11px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tile .metrics { margin-top: 3px; }
  .empty { padding: 16px; color: var(--secondary-text-color); font-size: 13px; }

  /* Detail: the popup of the full card (at the top of the card) and the expanded mini card */
  .veil { position: absolute; inset: 0; background: color-mix(in srgb, var(--card-background-color, #fff) 55%, transparent); z-index: 2; }
  .popup { position: absolute; top: 0; left: 0; right: 0; z-index: 3; background: var(--card-background-color, #fff); border-radius: 12px;
           box-shadow: 0 8px 28px rgba(0,0,0,.18); overflow: hidden; }
  .detail .hdr .big { position: absolute; left: 6px; bottom: 4px; width: 72px; height: 84px; }
  .detail .hdr .head { left: 84px; }
  .detail .hdr .win, .mini .hdr .win { display: none; }
  .dbody { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 8px; }
  .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .stat { padding: 10px; border-radius: 10px; background: var(--pl-tile); display: flex; flex-direction: column; gap: 4px; min-width: 0; --pl-tile-bg: var(--pl-tile); }
  .stat .lbl { font-size: 11px; font-weight: 600; color: var(--secondary-text-color); }
  .stat .val { font-size: 22px; font-weight: 700; }
  .stat .rng { font-size: 11px; color: var(--secondary-text-color); }
  .stat.gauge { align-items: center; }
  .stat.gauge .lbl { align-self: flex-start; }
  .gauge svg { width: 100%; max-width: 170px; height: auto; display: block; }
  .gauge .g-track { fill: none; stroke: var(--pl-track); stroke-width: 12; stroke-linecap: round; }
  .gauge .g-band { fill: none; stroke: color-mix(in srgb, var(--pl-ok) 35%, transparent); stroke-width: 12; }
  .gauge .g-val { fill: none; stroke: var(--c); stroke-width: 5; stroke-linecap: round; }
  .gauge .g-dot { fill: var(--c); stroke: var(--card-background-color, #fff); stroke-width: 2; }
  .gauge text { fill: var(--primary-text-color); font-family: inherit; }
  .gauge .g-sub { fill: var(--secondary-text-color); }
  .chart { padding: 10px; border-radius: 10px; background: var(--pl-tile); }
  .chart .lg { display: flex; justify-content: space-between; gap: 8px; font-size: 11px; font-weight: 600; color: var(--secondary-text-color); margin-bottom: 4px; }
  .chart .lg .m { color: var(--pl-wet); } .chart .lg .tp { color: var(--pl-warn); }
  .chart svg { width: 100%; height: 70px; display: block; }
  .chart .c-band { fill: color-mix(in srgb, var(--pl-ok) 14%, transparent); }
  .chart .c-m { fill: none; stroke: var(--pl-wet); stroke-width: 2; vector-effect: non-scaling-stroke; }
  .chart .c-t { fill: none; stroke: var(--pl-warn); stroke-width: 2; stroke-dasharray: 4 3; vector-effect: non-scaling-stroke; }
  .chart .ax { display: flex; justify-content: space-between; font-size: 10px; color: var(--secondary-text-color); }
  .chart .none { font-size: 12px; color: var(--secondary-text-color); padding: 18px 0; text-align: center; }
  .facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px; }
  .fact { padding: 8px 10px; border-radius: 10px; background: var(--pl-tile); min-width: 0; }
  .fact .lbl { font-size: 10px; color: var(--secondary-text-color); }
  .fact .v { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* Mini card: the header alone (the plant, its values, its state), expanded into the detail */
  .mini .hdr .big { position: absolute; left: 6px; bottom: 4px; width: 70px; height: 82px; }
  .mini .hdr .head { left: 84px; top: 12px; flex-direction: column; align-items: flex-start; gap: 2px; }
  .mini .hdr .metrics { font-size: 13px; margin-top: 3px; }
  .mini .hdr .metrics .icon { width: 15px; height: 15px; }
`;
