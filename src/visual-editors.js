// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------
import { LANGUAGES } from "./core.js";
import { lang, t } from "./helpers.js";
import { PlantArt } from "./plants.js";

export class PlantEditorBase extends HTMLElement {
  static defaults() {
    return {};
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _tr(k) {
    return t(this._hass, this._config, k);
  }

  _common() {
    const tr = (k) => this._tr(k);
    return [
      { name: "illustration_theme", selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((v) => ({ value: v, label: tr(`theme_${v}`) })) } } },
      {
        name: "language",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))] } },
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => this._tr(s.name);
      this._form.computeHelper = (s) => (["entity", "device", "plants_info"].includes(s.name) ? this._tr(`${s.name}_helper`) : undefined);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        const defaults = { illustration_theme: "auto", ...this.constructor.defaults() };
        delete config.plants_info;
        for (const [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: drop empty values and options left at their default.
          if (v === "" || v === undefined || v === null || (k in defaults && v === defaults[k])) delete config[k];
        }
        // A variety belongs to its plant type.
        if (config.variety && !PlantArt.varieties(config.plant_type).some((x) => x.id === config.variety)) delete config.variety;
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    if (this._dataFor !== this._config) {
      this._dataFor = this._config;
      this._form.data = { illustration_theme: "auto", ...this.constructor.defaults(), ...this._config };
    }
    const key = `${lang(this._hass, this._config)}|${this._config.plant_type || ""}`;
    if (this._schemaKey !== key) {
      this._schemaKey = key;
      this._form.schema = this._schema();
    }
  }
}

export class PlantCardEditor extends PlantEditorBase {
  static defaults() {
    return { show_header: true, show_filter: true, columns: "auto" };
  }

  _schema() {
    const tr = (k) => this._tr(k);
    return [
      { name: "title", selector: { text: {} } },
      { name: "columns", selector: { select: { mode: "dropdown", options: ["auto", "1", "2", "3", "4"].map((v) => ({ value: v, label: v === "auto" ? tr("auto") : v })) } } },
      { type: "grid", name: "", schema: ["show_header", "show_filter"].map((name) => ({ name, selector: { boolean: {} } })) },
      ...this._common(),
      { name: "plants_info", type: "constant", value: "" },
    ];
  }
}

// The mini card's detailed view is the plant's detail: its editor holds the plant itself.
export class PlantMiniCardEditor extends PlantEditorBase {
  static defaults() {
    return { zoom: true, location: "auto" };
  }

  _schema() {
    const tr = (k) => this._tr(k);
    const fr = lang(this._hass, this._config) === "fr";
    const types = PlantArt.list.map((p) => ({ value: p.key, label: fr ? p.fr : p.en })).sort((a, b) => a.label.localeCompare(b.label));
    const varieties = PlantArt.varieties(this._config.plant_type).map((v) => ({ value: v.id, label: fr ? v.fr : v.en }));
    return [
      { name: "entity", selector: { entity: { domain: "plant" } } },
      { name: "device", selector: { device: {} } },
      { name: "name", selector: { text: {} } },
      { name: "plant_type", selector: { select: { mode: "dropdown", options: types } } },
      ...(varieties.length ? [{ name: "variety", selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("variety_none") }, ...varieties] } } }] : []),
      {
        type: "grid",
        name: "",
        schema: [
          { name: "location", selector: { select: { mode: "dropdown", options: ["auto", "indoor", "outdoor"].map((v) => ({ value: v, label: tr(v === "auto" ? "auto" : v) })) } } },
          { name: "room", selector: { text: {} } },
        ],
      },
      {
        type: "expandable",
        name: "",
        flatten: true,
        title: tr("sensors"),
        icon: "mdi:leaf",
        schema: [
          { name: "moisture", selector: { entity: { domain: "sensor" } } },
          { name: "temperature", selector: { entity: { domain: "sensor" } } },
          { name: "battery", selector: { entity: { domain: "sensor" } } },
        ],
      },
      {
        type: "expandable",
        name: "",
        flatten: true,
        title: tr("ranges"),
        icon: "mdi:tune-vertical",
        schema: [
          {
            type: "grid",
            name: "",
            schema: ["min_moisture", "max_moisture", "min_temperature", "max_temperature"].map((name) => ({ name, selector: { number: { mode: "box", step: "any" } } })),
          },
        ],
      },
      { name: "zoom", selector: { boolean: {} } },
      ...this._common(),
    ];
  }
}
