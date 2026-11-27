// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
import { STRINGS } from "./i18n/strings.js";

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: the card's language, keeping HA's region when its base matches (pt-BR, de-CH); a bare "pt"
// (European Portuguese) becomes "pt-PT", otherwise Intl formats it the Brazilian way.
export const intlLocale = (hass, config) => {
  const l = lang(hass, config);
  const src = config?.language || (hass && (hass.locale?.language || hass.language)) || "";
  const out = src && src.split("-")[0] === l.split("-")[0] ? src : l;
  return out === "pt" ? "pt-PT" : out;
};

export const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

export const valid = (s) => !!s && !["unknown", "unavailable", ""].includes(s.state);
export const toNum = (v) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
};
export const num = (s) => (valid(s) ? toNum(s.state) : null);
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const svgIcon = (path, cls = "") => `<svg class="icon${cls ? ` ${cls}` : ""}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
export const norm = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
export const domainOf = (id) => String(id || "").split(".")[0];
export const fmtNum = (v, digits, locale) =>
  v === null || v === undefined ? "—" : Number(v).toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
