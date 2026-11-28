// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
import { ICONS } from "./core.js";
import { clamp, esc, fmtNum, intlLocale, lang, svgIcon, t, toNum } from "./helpers.js";
import { PlantArt } from "./plants.js";
import { STATUS, devicesIndex, plantConfigs, resolvePlant, statusOf } from "./care.js";
import { STYLE } from "./styles.js";
import { rcMorph } from "./in-place-redraw.js";

// Home Assistant dialogs (more-info opened from the card): a click there is not a click elsewhere on the page.
export const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
export const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS a tap on something that is not
// clickable sends no click to the page. The handler runs when the press and the release are both outside the card;
// keyboard clicks (no click count) still go through the click event.
export const watchOutside = (card, handler) => {
  let downOutside = false;
  const outside = (ev) => isOutside(card, ev);
  const onDown = (ev) => {
    downOutside = outside(ev);
  };
  const onUp = (ev) => {
    if (downOutside && outside(ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && outside(ev)) handler(ev);
  };
  const onKey = (ev) => {
    if (ev.key === "Escape") handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
      document.addEventListener("keydown", onKey, true);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
  };
};

// The drawing of a plant, cached: the same plant in the same state gives the same markup (and the same ids), so a
// redraw leaves it untouched.
export const ART_CACHE = new Map();
export const artOf = (p, status) => {
  const k = `${p.key}|${p.variety}|${p.pot}|${STATUS[status].art}`;
  if (!ART_CACHE.has(k)) {
    if (ART_CACHE.size > 400) ART_CACHE.clear();
    ART_CACHE.set(k, PlantArt.svg(p.key, { state: STATUS[status].art, variety: p.variety || undefined, pot: p.pot || undefined }));
  }
  return ART_CACHE.get(k);
};

export const HISTORY_MS = 24 * 3600 * 1000;
export const HISTORY_TTL = 5 * 60 * 1000;
// A history/history_during_period answer (compressed or not) as [time ms, value] points.
export const historyPoints = (rows) =>
  (rows || [])
    .map((r) => [r.lu !== undefined ? r.lu * 1000 : Date.parse(r.last_updated || r.last_changed || ""), toNum(r.s ?? r.state)])
    .filter(([x, v]) => Number.isFinite(x) && v !== null);

// A line of points in a 300 × 70 box, x over the last 24 h, y over [lo, hi].
export const linePath = (pts, lo, hi, now) => {
  if (pts.length < 2 || hi <= lo) return "";
  const x = (ms) => clamp(((ms - (now - HISTORY_MS)) / HISTORY_MS) * 300, 0, 300);
  const y = (v) => clamp(66 - ((v - lo) / (hi - lo)) * 62, 2, 68);
  return pts.map(([ms, v], i) => `${i ? "L" : "M"}${x(ms).toFixed(1)} ${y(v).toFixed(1)}`).join("") + `L300 ${y(pts[pts.length - 1][1]).toFixed(1)}`;
};

export const plantLabel = (hass, config, key) => {
  const art = PlantArt.list.find((p) => p.key === key);
  if (!art) return t(hass, config, "plant");
  return lang(hass, config) === "fr" ? art.fr : art.en;
};
export const varietyLabel = (hass, config, p) => {
  const v = PlantArt.varieties(p.key).find((x) => x.id === p.variety);
  return v ? (lang(hass, config) === "fr" ? v.fr : v.en) : "";
};

// Shared by both cards: values, header, detail.
export class PlantBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._history = new Map();
    this._outside = watchOutside(this, () => this._onOutside());
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
  }

  set hass(hass) {
    this._hass = hass;
    const sig = this._signature();
    if (sig === this._sig) return;
    this._sig = sig;
    this._render();
  }

  get hass() {
    return this._hass;
  }

  connectedCallback() {
    if (this._hass) this._render();
  }

  // A card that leaves the page (another view, a conditional card hidden) closes its popup and folds back.
  disconnectedCallback() {
    this._outside.off();
    this._close(false);
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _night() {
    const th = this._config?.illustration_theme;
    if (th === "day" || th === "night") return th === "night";
    return !!this._hass?.themes?.darkMode;
  }

  _plants() {
    const seen = new Set();
    return plantConfigs(this._hass, this._config || {}).map((c) => {
      const p = resolvePlant(this._hass, c);
      // Two plants on one sensor (or with none) still get their own tile.
      while (seen.has(p.id)) p.id = `${p.id}~`;
      seen.add(p.id);
      if (!p.customName) p.name = plantLabel(this._hass, this._config, p.key);
      p.status = statusOf(p);
      return p;
    });
  }

  _signature() {
    if (!this._hass || !this._config) return "";
    const ids = [];
    for (const c of plantConfigs(this._hass, this._config)) {
      for (const k of ["entity", "moisture", "temperature", "battery", "min_moisture", "max_moisture", "min_temperature", "max_temperature"]) if (typeof c[k] === "string") ids.push(c[k]);
      if (c.device || c.entity) ids.push(`dev:${c.device || this._hass.entities?.[c.entity]?.device_id || ""}`);
    }
    const st = this._hass.states || {};
    const index = devicesIndex(this._hass);
    for (const id of ids.filter((i) => i.startsWith("dev:"))) for (const e of index.get(id.slice(4)) || []) ids.push(e.entity_id);
    // The minute too: "Updated 4 min ago" moves on with the next update of the house.
    return JSON.stringify([this._night(), lang(this._hass, this._config), Math.floor(Date.now() / 60000), ids.map((i) => st[i]?.state + (st[i]?.attributes?.moisture ?? "") + (st[i]?.attributes?.temperature ?? ""))]);
  }

  _fmtTemp(p) {
    return p.temperature === null ? "—" : `${fmtNum(p.temperature, 1, intlLocale(this._hass, this._config))} ${p.unit}`;
  }

  _fmtMoisture(p) {
    return p.moisture === null ? "—" : `${fmtNum(Math.round(p.moisture), 0, intlLocale(this._hass, this._config))} %`;
  }

  _tempRange(p) {
    const [lo, hi] = p.ranges.temperature;
    const f = (c) => (p.unit === "°F" ? Math.round((c * 9) / 5 + 32) : c);
    return this._t("ideal", { min: f(lo), max: f(hi), unit: p.unit });
  }

  _metrics(p) {
    const st = p.status;
    const hot = st === "hot" || st === "cold" || st === "frost";
    const water = st === "dry" || st === "very_dry" || st === "wet";
    return `<span class="metrics"><span class="${hot ? "alert" : ""}">${svgIcon(ICONS.thermometer, "t-ico")}${esc(this._fmtTemp(p))}</span><span class="${water ? "alert" : ""}">${svgIcon(ICONS.water, "h-ico")}${esc(this._fmtMoisture(p))}</span></span>`;
  }

  _bar(p) {
    const [lo, hi] = p.ranges.moisture;
    const m = p.moisture === null ? null : clamp(p.moisture, 0, 100);
    return `<span class="bar" aria-hidden="true"><span class="band" style="left:${clamp(lo, 0, 100)}%;width:${clamp(hi - lo, 0, 100)}%"></span>${m === null ? "" : `<span class="mark" style="left:${m}%"></span>`}</span>`;
  }

  // The 90 px header: the scene, the title block, the status pill and the round button of the top right corner.
  _header({ out, title, sub, cls, pill, blink, shelf = "", big = "", btn = "", extra = "" }) {
    const night = this._night();
    return `<div class="hdr ${out ? "out" : ""} ${night ? "night" : ""} ${btn ? "has-btn" : ""}">
      ${out ? (night ? '<div class="moon"></div>' : '<div class="sun"></div>') : `<div class="win">${night ? '<div class="moon"></div>' : ""}</div>${night && (big || btn) ? '<div class="moon"></div>' : ""}`}
      ${shelf ? `<div class="shelf">${shelf}</div>` : ""}${big}
      <div class="ground"></div>
      <div class="head">${big ? "" : `<div class="badge-icon ${cls}">${svgIcon(ICONS.sprout)}</div>`}<div class="titles"><div class="name">${esc(title)}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ""}${extra}</div>${
        pill ? `<div class="pill ${cls}" title="${esc(pill)}"><span class="dot ${blink ? "blink" : ""}"></span><span class="ink">${esc(pill)}</span></div>` : ""
      }</div>
      ${btn}
    </div>`;
  }

  _stateText(p) {
    return this._t(`st_${p.status}`);
  }

  _ago(iso) {
    const ms = Date.parse(iso || "");
    if (!Number.isFinite(ms)) return "—";
    const min = Math.round((Date.now() - ms) / 60000);
    const rtf = new Intl.RelativeTimeFormat(intlLocale(this._hass, this._config), { numeric: "auto", style: "short" });
    if (Math.abs(min) < 60) return rtf.format(-min, "minute");
    if (Math.abs(min) < 2880) return rtf.format(-Math.round(min / 60), "hour");
    return rtf.format(-Math.round(min / 1440), "day");
  }

  async _loadHistory(p) {
    const ids = [p.moistureId, p.temperatureId].filter(Boolean);
    const key = ids.join(",");
    if (!key || !this._hass?.callWS) return;
    const cached = this._history.get(key);
    if (cached && (cached.loading || Date.now() - cached.at < HISTORY_TTL)) return;
    this._history.set(key, { loading: true, at: Date.now() });
    const now = Date.now();
    try {
      const res = await this._hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(now - HISTORY_MS).toISOString(),
        end_time: new Date(now).toISOString(),
        entity_ids: ids,
        minimal_response: true,
        no_attributes: true,
        significant_changes_only: false,
      });
      this._history.set(key, { at: Date.now(), m: historyPoints(res?.[p.moistureId]), t: historyPoints(res?.[p.temperatureId]) });
    } catch (_e) {
      this._history.set(key, { at: Date.now(), m: [], t: [] });
    }
    this._sig = null;
    this._render();
  }

  _gauge(p) {
    const [lo, hi] = p.ranges.moisture;
    const pt = (v) => {
      const a = Math.PI * (1 - clamp(v, 0, 100) / 100);
      return `${(90 + 70 * Math.cos(a)).toFixed(1)} ${(86 - 70 * Math.sin(a)).toFixed(1)}`;
    };
    const val = p.moisture;
    const loc = intlLocale(this._hass, this._config);
    return `<div class="stat gauge ${STATUS[p.status].cls}"><div class="lbl">${esc(this._t("moisture"))}</div>
      <svg viewBox="0 0 180 96" role="img" aria-label="${esc(`${this._t("moisture")} ${this._fmtMoisture(p)}`)}"><path class="g-track" d="M20 86A70 70 0 0 1 160 86"/><path class="g-band" d="M${pt(lo)}A70 70 0 0 1 ${pt(hi)}"/>${
        val === null ? "" : `<path class="g-val" d="M20 86A70 70 0 0 1 ${pt(val)}"/><circle class="g-dot" r="6" cx="${pt(val).split(" ")[0]}" cy="${pt(val).split(" ")[1]}"/>`
      }<text x="90" y="74" text-anchor="middle" font-size="24" font-weight="700">${esc(this._fmtMoisture(p))}</text><text class="g-sub" x="90" y="90" text-anchor="middle" font-size="10">${esc(this._t("ideal", { min: fmtNum(lo, 0, loc), max: fmtNum(hi, 0, loc), unit: "%" }))}</text></svg></div>`;
  }

  _tempStat(p) {
    const [lo, hi] = p.ranges.temperature;
    const scaleLo = Math.min(lo - 10, -5);
    const scaleHi = Math.max(hi + 10, 40);
    const pos = (c) => clamp(((c - scaleLo) / (scaleHi - scaleLo)) * 100, 0, 100);
    const hot = p.status === "hot" || p.status === "cold" || p.status === "frost";
    return `<div class="stat ${hot ? STATUS[p.status].cls : "ok"}"><div class="lbl">${esc(this._t("temperature"))}</div><div class="val ${hot ? "ink" : ""}">${esc(this._fmtTemp(p))}</div>
      <div class="bar"><div class="band" style="left:${pos(lo)}%;width:${pos(hi) - pos(lo)}%"></div>${p.tempC === null ? "" : `<div class="mark" style="left:${pos(p.tempC)}%"></div>`}</div>
      <div class="rng">${esc(this._tempRange(p))}</div></div>`;
  }

  _chart(p) {
    const h = this._history.get([p.moistureId, p.temperatureId].filter(Boolean).join(","));
    const now = Date.now();
    let inner;
    if (!h || h.loading) inner = `<div class="none">…</div>`;
    else if (h.m.length < 2 && h.t.length < 2) inner = `<div class="none">${esc(this._t("no_history"))}</div>`;
    else {
      const [lo, hi] = p.ranges.moisture;
      const tv = h.t.map(([, v]) => v);
      const tlo = Math.min(...tv) - 2;
      const thi = Math.max(...tv) + 2;
      const band = `<rect class="c-band" x="0" y="${(66 - (hi / 100) * 62).toFixed(1)}" width="300" height="${(((hi - lo) / 100) * 62).toFixed(1)}"/>`;
      inner = `<svg viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true">${band}<path class="c-m" d="${linePath(h.m, 0, 100, now)}"/><path class="c-t" d="${linePath(h.t, tlo, thi, now)}"/></svg>
        <div class="ax"><span>${esc(this._t("h24_ago"))}</span><span>${esc(this._t("now"))}</span></div>`;
    }
    return `<div class="chart"><div class="lg"><span>${esc(this._t("last_24h"))}</span><span><span class="m">— ${esc(this._t("moisture_short"))}</span> · <span class="tp">- - ${esc(this._t("temperature_short"))}</span></span></div>${inner}</div>`;
  }

  _facts(p) {
    const facts = [[this._t("updated"), this._ago(p.updated)]];
    if (p.battery !== null) facts.push([this._t("battery"), `${Math.round(p.battery)} %`]);
    const v = varietyLabel(this._hass, this._config, p);
    facts.push([this._t("plant_type"), v ? `${plantLabel(this._hass, this._config, p.key)} · ${v}` : plantLabel(this._hass, this._config, p.key)]);
    return `<div class="facts">${facts.map(([l, v]) => `<div class="fact"><div class="lbl">${esc(l)}</div><div class="v">${esc(v)}</div></div>`).join("")}</div>`;
  }

  _detail(p, btn) {
    const s = STATUS[p.status];
    const sub = [p.room, this._t(p.where)].filter(Boolean).join(" · ");
    return `<div class="detail">${this._header({ out: p.where === "outdoor", title: p.name, sub, cls: s.cls, pill: this._stateText(p), blink: s.rank >= 5, big: `<div class="big sway">${artOf(p, p.status)}</div>`, btn })}
      <div class="dbody"><div class="stats">${this._gauge(p)}${this._tempStat(p)}</div>${this._chart(p)}${this._facts(p)}</div></div>`;
  }

  _onOutside() {
    this._close(true);
  }

  _close(render) {
    void render;
  }

  _onClick() {}

  _style() {
    return `<style>${STYLE}</style>`;
  }
}

// ── plant-card: every plant as a tile, a popup with the detail of one ────────────────────────────────────────────
export class PlantCard extends PlantBase {
  static getConfigElement() {
    return document.createElement("plant-card-editor");
  }

  static getStubConfig(hass) {
    const plants = Object.keys(hass?.states || {}).filter((id) => id.startsWith("plant."));
    return plants.length ? { plants: plants.slice(0, 6) } : {};
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this._filter = this._filter || "all";
    this._sig = null;
    if (this._hass) this._render();
  }

  getCardSize() {
    return 2 + Math.ceil((this._count || 1) / 2) * 2;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  _onClick(ev) {
    const path = ev.composedPath();
    const filter = path.find((n) => n.dataset?.filter);
    if (filter) {
      this._filter = filter.dataset.filter;
      this._sig = null;
      return this._render();
    }
    if (path.some((n) => n.dataset?.close !== undefined)) return this._close(true);
    const tile = path.find((n) => n.dataset?.plant);
    if (tile) {
      this._open = tile.dataset.plant;
      this._outside.on();
      this._sig = null;
      this._render();
      // From the keyboard (a click with no click count), the focus moves to the popup's close button.
      if (ev.detail === 0) this.shadowRoot.querySelector?.(".popup .rbtn")?.focus?.();
    }
  }

  _close(render) {
    if (!this._open) return;
    this._open = null;
    this._outside.off();
    if (render) {
      this._sig = null;
      this._render();
    }
  }

  _render() {
    if (!this._hass || !this._config) return;
    const c = this._config;
    const all = this._plants();
    this._count = all.length;
    if (!all.length) {
      rcMorph(this.shadowRoot, `${this._style()}<ha-card><div class="empty">${esc(this._t("no_plants"))}</div></ha-card>`);
      return;
    }
    const kinds = new Set(all.map((p) => p.where));
    const filter = kinds.size > 1 && c.show_filter !== false ? this._filter : "all";
    const shown = filter === "all" ? all : all.filter((p) => p.where === filter);
    const alerts = all.filter((p) => STATUS[p.status].rank >= 2);
    const worst = all.reduce((w, p) => (STATUS[p.status].rank > STATUS[w].rank ? p.status : w), "ok");
    const cls = STATUS[worst].cls;
    const sub = `${this._t("plants_count", { n: all.length })} · ${alerts.length ? this._t("to_watch", { n: alerts.length }) : this._t("all_good")}`;
    const pill = alerts.length ? this._t(alerts.length > 1 ? "alerts" : "alert", { n: alerts.length }) : this._t("st_ok");
    const shelf = all.slice(0, 8).map((p) => artOf(p, p.status)).join("");
    const out = kinds.size === 1 && kinds.has("outdoor");
    const header = c.show_header === false ? "" : this._header({ out, title: c.title || this._t("default_title"), sub, cls, pill, blink: STATUS[worst].rank >= 5, shelf });
    const filters =
      kinds.size > 1 && c.show_filter !== false
        ? `<div class="filters" role="group">${["all", "indoor", "outdoor"]
            .map((f) => {
              const n = f === "all" ? all.length : all.filter((p) => p.where === f).length;
              return `<button class="filter ${filter === f ? "on" : ""}" data-filter="${f}" aria-pressed="${filter === f}">${esc(this._t(f))} · ${n}</button>`;
            })
            .join("")}</div>`
        : "";
    const cols = Number(c.columns) > 0 ? Number(c.columns) : null;
    const tiles = shown
      .map((p) => {
        const s = STATUS[p.status];
        return `<button class="tile ${s.cls}" data-plant="${esc(p.id)}" aria-label="${esc(`${p.name}: ${this._stateText(p)}`)}">
          <span class="tdot"></span>${artOf(p, p.status)}
          <span class="info"><span class="tname">${esc(p.name)}</span>${p.room ? `<span class="troom">${esc(p.room)}</span>` : ""}<span class="tstate ink">${esc(this._stateText(p))}</span>${this._metrics(p)}${this._bar(p)}</span>
        </button>`;
      })
      .join("");
    const open = this._open ? all.find((p) => p.id === this._open) : null;
    if (this._open && !open) this._close(false);
    if (open) this._loadHistory(open);
    const btn = `<button class="rbtn" data-close aria-label="${esc(this._t("close"))}">${svgIcon(ICONS.close)}</button>`;
    const popup = open ? `<div class="veil" data-close></div><div class="popup">${this._detail(open, btn)}</div>` : "";
    rcMorph(
      this.shadowRoot,
      `${this._style()}<ha-card>${header}<div class="body">${filters}<div class="grid ${cols ? "" : "auto"}" ${cols ? `style="--pl-cols:${cols}"` : ""}>${tiles}</div></div>${popup}</ha-card>`,
    );
  }
}

// ── plant-mini-card: one plant, its header alone; the button of the top right corner opens the detail ─────────────
export class PlantMiniCard extends PlantBase {
  static getConfigElement() {
    return document.createElement("plant-mini-card-editor");
  }

  static getStubConfig(hass) {
    const plant = Object.keys(hass?.states || {}).find((id) => id.startsWith("plant."));
    return plant ? { entity: plant } : { plant_type: "monstera" };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config, plants: undefined };
    this._sig = null;
    if (this._hass) this._render();
  }

  getCardSize() {
    return this._zoomed ? 7 : 2;
  }

  getGridOptions() {
    return this._zoomed ? { columns: 12, min_columns: 6, rows: "auto" } : { columns: 6, min_columns: 6, rows: "auto" };
  }

  _plants() {
    const c = this._config;
    const p = resolvePlant(this._hass, c);
    if (!p.customName) p.name = plantLabel(this._hass, c, p.key);
    p.status = statusOf(p);
    return [p];
  }

  _onClick(ev) {
    const path = ev.composedPath();
    if (path.some((n) => n.dataset?.zoom !== undefined)) {
      if (this._zoomed) return this._close(true);
      this._zoomed = true;
      this._outside.on();
      this._sig = null;
      this._render();
    }
  }

  _close(render) {
    if (!this._zoomed) return;
    this._zoomed = false;
    this._outside.off();
    if (render) {
      this._sig = null;
      this._render();
    }
  }

  _render() {
    if (!this._hass || !this._config) return;
    const [p] = this._plants();
    const s = STATUS[p.status];
    const zoom = this._config.zoom !== false;
    const btn = zoom
      ? `<button class="rbtn" data-zoom aria-label="${esc(this._t(this._zoomed ? "collapse" : "expand"))}" aria-expanded="${!!this._zoomed}">${svgIcon(this._zoomed ? ICONS.collapse : ICONS.expand)}</button>`
      : "";
    let html;
    if (this._zoomed) {
      this._loadHistory(p);
      html = this._detail(p, btn);
    } else {
      html = `<div class="mini">${this._header({
        out: p.where === "outdoor",
        title: p.name,
        cls: s.cls,
        pill: this._stateText(p),
        blink: s.rank >= 5,
        big: `<div class="big sway">${artOf(p, p.status)}</div>`,
        btn,
        extra: `<div class="sub">${esc(p.room || this._t(p.where))}</div>${this._metrics(p)}`,
      })}</div>`;
    }
    rcMorph(this.shadowRoot, `${this._style()}<ha-card class="${s.cls}">${html}</ha-card>`);
  }
}
