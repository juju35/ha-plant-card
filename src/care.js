// ---------------------------------------------------------------------------
// Care: ideal ranges, sensors of a plant and its state
// ---------------------------------------------------------------------------
import { PlantArt } from "./plants.js";
import { domainOf, norm, num, toNum, valid } from "./helpers.js";

// Ideal soil moisture (%) and pot temperature (°C) by kind of plant; a plant's own min_/max_ options win.
export const CARE = {
  succulent: { moisture: [10, 40], temperature: [8, 35] },
  tropical: { moisture: [30, 60], temperature: [15, 32] },
  humid: { moisture: [40, 70], temperature: [15, 30] },
  mediterranean: { moisture: [15, 45], temperature: [0, 38] },
  edible: { moisture: [35, 65], temperature: [8, 35] },
  garden: { moisture: [30, 60], temperature: [-5, 35] },
  tender: { moisture: [30, 60], temperature: [7, 35] },
};
const KIND_OF = {
  succulent: "cactus aloe echeveria haworthia crassula cactus-boule agave sansevieria zamioculcas yucca",
  humid: "calathea fougere spathiphyllum alocasia dionee begonia anthurium cyclamen bromelia hortensia",
  mediterranean: "olivier citronnier oranger lavande romarin thym sauge laurier-rose palmier figuier",
  edible: "tomate basilic piment poivron courgette laitue persil ciboulette menthe fraisier framboisier myrtille",
  garden: "rosier geranium tournesol petunia tulipe agapanthe dahlia marguerite fuchsia pensee camelia jasmin erable-japon bambou buis graminee",
  tender: "hibiscus bougainvillier",
};
export const careKind = (key) => {
  for (const [kind, keys] of Object.entries(KIND_OF)) if (keys.split(" ").includes(key)) return kind;
  return "tropical";
};

// The plant type named in a free text (an entity's or a device's name): "Monstera du salon" is a monstera.
export const guessType = (text) => {
  const n = norm(text);
  if (!n) return null;
  let best = null;
  for (const p of PlantArt.list)
    for (const label of [p.fr, p.en, p.key.replace(/-/g, " ")]) {
      const l = norm(label);
      if (l.length > 2 && n.includes(l) && (!best || l.length > best.len)) best = { key: p.key, len: l.length };
    }
  return best?.key ?? null;
};

// The entities of each device, indexed once per entity registry (Home Assistant hands a new object when it changes).
const DEVICE_INDEX = new WeakMap();
export const devicesIndex = (hass) => {
  const reg = hass?.entities;
  if (!reg) return new Map();
  let idx = DEVICE_INDEX.get(reg);
  if (!idx) {
    idx = new Map();
    for (const e of Object.values(reg)) if (e.device_id && !e.hidden && !e.disabled_by) (idx.get(e.device_id) || idx.set(e.device_id, []).get(e.device_id)).push(e);
    DEVICE_INDEX.set(reg, idx);
  }
  return idx;
};
const entitiesOfDevice = (hass, deviceId) => (deviceId ? devicesIndex(hass).get(deviceId) || [] : []);
const devClass = (hass, id) => hass?.states?.[id]?.attributes?.device_class;
const pick = (list, test) => list.find(test)?.entity_id;

// The sensors of a device: soil moisture, temperature, battery, and the Plant Monitor's threshold numbers.
export const deviceRoles = (hass, deviceId) => {
  const ents = entitiesOfDevice(hass, deviceId);
  const sensors = ents.filter((e) => domainOf(e.entity_id) === "sensor");
  const numbers = ents.filter((e) => ["number", "input_number"].includes(domainOf(e.entity_id)));
  const byId = (re) => (e) => re.test(e.entity_id);
  return {
    moisture: pick(sensors, (e) => devClass(hass, e.entity_id) === "moisture") || pick(sensors, byId(/moisture/)),
    temperature: pick(sensors, (e) => devClass(hass, e.entity_id) === "temperature") || pick(sensors, byId(/temperature/)),
    battery: pick(sensors, (e) => devClass(hass, e.entity_id) === "battery") || pick(sensors, byId(/battery/)),
    min_moisture: pick(numbers, byId(/min.*moisture/)),
    max_moisture: pick(numbers, byId(/max.*moisture/)),
    min_temperature: pick(numbers, byId(/min.*temperature/)),
    max_temperature: pick(numbers, byId(/max.*temperature/)),
  };
};

// A value that may be a number, an entity id or missing.
const readValue = (hass, v) => (typeof v === "string" && v.includes(".") ? num(hass?.states?.[v]) : toNum(v));

// A plant of the configuration resolved against Home Assistant: its drawing, its sensors, its values and ranges.
export const resolvePlant = (hass, cfg = {}) => {
  const plantId = cfg.entity && domainOf(cfg.entity) === "plant" ? cfg.entity : null;
  const plantState = plantId ? hass?.states?.[plantId] : null;
  const deviceId = cfg.device || (plantId && hass?.entities?.[plantId]?.device_id) || null;
  const dev = deviceRoles(hass, deviceId);
  const deviceName = deviceId ? hass?.devices?.[deviceId]?.name_by_user || hass?.devices?.[deviceId]?.name : "";
  const name = cfg.name || plantState?.attributes?.friendly_name || deviceName || "";
  const key = PlantArt.has(cfg.plant_type) ? cfg.plant_type : guessType(`${cfg.name || ""} ${plantState?.attributes?.species || ""} ${name}`) || "generique";
  const art = PlantArt.list.find((p) => p.key === key);
  const where = cfg.location === "outdoor" || cfg.location === "indoor" ? cfg.location : art?.where || "indoor";
  const moistureId = cfg.moisture || dev.moisture || null;
  const temperatureId = cfg.temperature || dev.temperature || null;
  const batteryId = cfg.battery || dev.battery || null;
  // The Home Assistant Plant integration keeps the readings as attributes of its plant entity.
  const attr = plantState?.attributes || {};
  const moisture = moistureId ? num(hass?.states?.[moistureId]) : toNum(attr.moisture);
  const rawTemp = temperatureId ? num(hass?.states?.[temperatureId]) : toNum(attr.temperature);
  const unit = (temperatureId && hass?.states?.[temperatureId]?.attributes?.unit_of_measurement) || hass?.config?.unit_system?.temperature || "°C";
  const tempC = rawTemp === null ? null : unit === "°F" ? ((rawTemp - 32) * 5) / 9 : rawTemp;
  const battery = batteryId ? num(hass?.states?.[batteryId]) : toNum(attr.battery);
  const care = CARE[careKind(key)];
  const range = (k, i, def) => readValue(hass, cfg[k]) ?? readValue(hass, dev[k]) ?? toNum(attr[k]) ?? def[i];
  const ranges = {
    moisture: [range("min_moisture", 0, care.moisture), range("max_moisture", 1, care.moisture)],
    temperature: [range("min_temperature", 0, care.temperature), range("max_temperature", 1, care.temperature)],
  };
  const updated = [moistureId, temperatureId].map((id) => hass?.states?.[id]?.last_updated).filter(Boolean).sort().pop() || plantState?.last_updated || null;
  return {
    id: cfg.id || plantId || moistureId || temperatureId || name || key,
    name: name || (art ? art.en : "Plant"),
    customName: !!(cfg.name || plantState || deviceName),
    key,
    variety: cfg.variety || "",
    pot: cfg.pot || "",
    where,
    room: cfg.room || cfg.area || "",
    plantId,
    moistureId,
    temperatureId,
    batteryId,
    moisture,
    temperature: rawTemp,
    tempC,
    unit,
    battery,
    ranges,
    problem: plantState?.state === "problem",
    available: moisture !== null || rawTemp !== null || valid(plantState),
    updated,
  };
};

// The state of a plant, the worst first: very dry, frost, pot too hot, dry, too wet, too cold, a problem the Plant
// integration reports, all good. `art` is the drawing's state, `cls` the color class.
export const STATUS = {
  very_dry: { art: "dry", cls: "crit", rank: 6 },
  frost: { art: "cold", cls: "crit cold", rank: 6 },
  hot: { art: "hot", cls: "crit", rank: 5 },
  dry: { art: "dry", cls: "warn", rank: 4 },
  wet: { art: "wet", cls: "wet", rank: 3 },
  cold: { art: "cold", cls: "cold", rank: 3 },
  problem: { art: "ok", cls: "warn", rank: 2 },
  ok: { art: "ok", cls: "ok", rank: 0 },
  no_data: { art: "ok", cls: "idle", rank: 1 },
};
export const statusOf = (p) => {
  const [minM, maxM] = p.ranges.moisture;
  const [minT, maxT] = p.ranges.temperature;
  const m = p.moisture;
  const tc = p.tempC;
  if (!p.available) return "no_data";
  if (m !== null && m < minM * 0.6) return "very_dry";
  if (tc !== null && tc <= 2 && tc < minT) return "frost";
  if (tc !== null && tc > maxT) return "hot";
  if (m !== null && m < minM) return "dry";
  if (m !== null && m > maxM) return "wet";
  if (tc !== null && tc < minT) return "cold";
  if (p.problem) return "problem";
  return "ok";
};

// The plants the card shows: its `plants` list, or every plant entity of Home Assistant when it has none.
export const plantConfigs = (hass, config) => {
  if (Array.isArray(config.plants) && config.plants.length) return config.plants.map((p) => (typeof p === "string" ? { entity: p } : p));
  if (config.moisture || config.temperature || config.entity || config.device) return [config];
  return Object.keys(hass?.states || {})
    .filter((id) => domainOf(id) === "plant")
    .sort()
    .map((entity) => ({ entity }));
};
