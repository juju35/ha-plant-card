import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./load.mjs";

const api = load();
// Values from the sandbox (another realm) compared as plain data.
const plain = (v) => JSON.parse(JSON.stringify(v));
const { PlantArt, STRINGS, guessType, resolvePlant, statusOf, plantConfigs, historyPoints, linePath, careKind } = api;

const sensor = (state, device_class, unit) => ({ state: String(state), attributes: { device_class, unit_of_measurement: unit }, last_updated: "2026-06-12T15:00:00Z" });
const hassOf = (states = {}, extra = {}) => ({ states, entities: {}, devices: {}, language: "en", locale: { language: "en" }, themes: { darkMode: false }, ...extra });

test("every plant draws, in every state, and every variety draws", () => {
  assert.ok(PlantArt.list.length >= 79);
  for (const p of PlantArt.list) {
    for (const state of ["ok", "dry", "wet", "cold", "hot"]) {
      const svg = PlantArt.svg(p.key, { state });
      assert.match(svg, /^<svg class="pa pa-/, `${p.key} ${state}`);
      assert.ok(!svg.includes("undefined") && !svg.includes("NaN"), `${p.key} ${state}`);
    }
    for (const v of PlantArt.varieties(p.key)) {
      const svg = PlantArt.svg(p.key, { variety: v.id });
      assert.ok(!svg.includes("undefined") && !svg.includes("NaN"), `${p.key} ${v.id}`);
      assert.ok(v.en && v.fr, `${p.key} ${v.id} has its labels`);
    }
  }
  const total = PlantArt.list.reduce((n, p) => n + PlantArt.varieties(p.key).length, 0);
  assert.ok(total >= 100, `${total} varieties`);
});

test("a variety recolors its plant", () => {
  assert.notEqual(PlantArt.svg("rosier", { variety: "blanc" }), PlantArt.svg("rosier"));
  assert.match(PlantArt.svg("tulipe", { variety: "queen-of-night" }), /#3a1638/);
});

test("the plant type is guessed from a name, in English or French", () => {
  assert.equal(guessType("Monstera du salon"), "monstera");
  assert.equal(guessType("Kitchen basil"), "basilic");
  assert.equal(guessType("Mon olivier"), "olivier");
  assert.equal(guessType("Sensor 12"), null);
});

test("ideal ranges come from the kind of plant, the plant's own options win", () => {
  assert.equal(careKind("cactus"), "succulent");
  assert.equal(careKind("calathea"), "humid");
  assert.equal(careKind("monstera"), "tropical");
  const hass = hassOf({ "sensor.m": sensor(20, "moisture", "%") });
  assert.deepEqual(plain(resolvePlant(hass, { plant_type: "cactus", moisture: "sensor.m" }).ranges.moisture), [10, 40]);
  assert.deepEqual(plain(resolvePlant(hass, { plant_type: "cactus", moisture: "sensor.m", min_moisture: 15, max_moisture: 25 }).ranges.moisture), [15, 25]);
});

test("the state follows the sensors, the worst first", () => {
  const states = { "sensor.m": sensor(46, "moisture", "%"), "sensor.t": sensor(21, "temperature", "°C") };
  const st = (m, t, cfg = {}) => {
    states["sensor.m"] = sensor(m, "moisture", "%");
    states["sensor.t"] = sensor(t, "temperature", "°C");
    return statusOf(resolvePlant(hassOf(states), { plant_type: "monstera", moisture: "sensor.m", temperature: "sensor.t", ...cfg }));
  };
  assert.equal(st(46, 21), "ok");
  assert.equal(st(25, 21), "dry");
  assert.equal(st(12, 21), "very_dry");
  assert.equal(st(75, 21), "wet");
  assert.equal(st(46, 12), "cold");
  assert.equal(st(46, 1), "frost");
  assert.equal(st(46, 36), "hot");
  assert.equal(st("unavailable", "unavailable"), "no_data");
});

test("a pot temperature in °F is compared in °C", () => {
  const hass = hassOf({ "sensor.t": sensor(95, "temperature", "°F") });
  const p = resolvePlant(hass, { plant_type: "monstera", temperature: "sensor.t" });
  assert.equal(statusOf(p), "hot");
  assert.equal(p.unit, "°F");
});

test("a device's sensors and a Plant Monitor's thresholds are found by themselves", () => {
  const states = {
    "plant.ficus": { state: "ok", attributes: { friendly_name: "Ficus" } },
    "sensor.ficus_soil_moisture": sensor(18, "moisture", "%"),
    "sensor.ficus_temperature": sensor(22, "temperature", "°C"),
    "sensor.ficus_battery": sensor(70, "battery", "%"),
    "number.ficus_min_soil_moisture": { state: "20", attributes: {} },
    "number.ficus_max_soil_moisture": { state: "55", attributes: {} },
  };
  const entities = Object.fromEntries(Object.keys(states).map((id) => [id, { entity_id: id, device_id: "dev1" }]));
  const p = resolvePlant(hassOf(states, { entities }), { entity: "plant.ficus" });
  assert.equal(p.moistureId, "sensor.ficus_soil_moisture");
  assert.equal(p.batteryId, "sensor.ficus_battery");
  assert.deepEqual(plain(p.ranges.moisture), [20, 55]);
  assert.equal(p.name, "Ficus");
  assert.equal(statusOf(p), "dry");
});

test("the Plant integration's readings are read from its plant entity", () => {
  const hass = hassOf({ "plant.basil": { state: "problem", attributes: { friendly_name: "Basil", moisture: 50, temperature: 20 } } });
  const p = resolvePlant(hass, { entity: "plant.basil" });
  assert.equal(p.key, "basilic");
  assert.equal(p.moisture, 50);
  assert.equal(statusOf(p), "problem");
});

test("with no plants listed, the card shows every plant entity", () => {
  const hass = hassOf({ "plant.b": { state: "ok", attributes: {} }, "plant.a": { state: "ok", attributes: {} }, "sensor.x": sensor(1) });
  assert.deepEqual(plain(plantConfigs(hass, {}).map((c) => c.entity)), ["plant.a", "plant.b"]);
  assert.equal(plantConfigs(hass, { plants: ["plant.b"] })[0].entity, "plant.b");
});

test("history rows (compressed or not) become points, and a line", () => {
  const pts = historyPoints([{ s: "40", lu: 1000 }, { state: "42", last_updated: "1970-01-01T00:00:02Z" }, { s: "unavailable", lu: 3 }]);
  assert.deepEqual(plain(pts), [[1000000, 40], [2000, 42]]);
  assert.match(linePath([[0, 10], [1000, 20]], 0, 100, 1000), /^M/);
  assert.equal(linePath([[0, 10]], 0, 100, 1000), "");
});

test("every language has every English key", () => {
  const keys = Object.keys(STRINGS.en);
  for (const [l, table] of Object.entries(STRINGS)) {
    const missing = keys.filter((k) => !(k in table));
    assert.deepEqual(missing, [], `${l} misses ${missing}`);
  }
});

test("the full card draws its tiles, its filter and its popup", () => {
  const states = {
    "sensor.a_m": sensor(46, "moisture", "%"),
    "sensor.b_m": sensor(10, "moisture", "%"),
  };
  const card = new api.PlantCard();
  card.setConfig({ plants: [{ name: "A", plant_type: "monstera", moisture: "sensor.a_m" }, { name: "B", plant_type: "olivier", location: "outdoor", moisture: "sensor.b_m" }] });
  card.hass = hassOf(states);
  const html = card.shadowRoot.innerHTML;
  assert.match(html, /data-plant="sensor.a_m"/);
  assert.match(html, /data-filter="outdoor"/);
  assert.match(html, /1 alert/);
  card._onClick({ composedPath: () => [{ dataset: { plant: "sensor.b_m" } }] });
  assert.match(card.shadowRoot.innerHTML, /class="popup"/);
  card._onClick({ composedPath: () => [{ dataset: { close: "" } }] });
  assert.doesNotMatch(card.shadowRoot.innerHTML, /class="popup"/);
});

test("the mini card expands into the detail and folds back when it leaves the page", () => {
  const card = new api.PlantMiniCard();
  card.setConfig({ name: "M", plant_type: "monstera", moisture: "sensor.m" });
  card.hass = hassOf({ "sensor.m": sensor(46, "moisture", "%") });
  assert.match(card.shadowRoot.innerHTML, /data-zoom/);
  card._onClick({ composedPath: () => [{ dataset: { zoom: "" } }] });
  assert.match(card.shadowRoot.innerHTML, /class="detail"/);
  card.disconnectedCallback();
  assert.equal(card._zoomed, false);
});

test("an untrusted name is escaped", () => {
  const card = new api.PlantMiniCard();
  card.setConfig({ name: "<img src=x onerror=alert(1)>", plant_type: "monstera", moisture: "sensor.m" });
  card.hass = hassOf({ "sensor.m": sensor(46, "moisture", "%") });
  assert.doesNotMatch(card.shadowRoot.innerHTML, /<img src=x/);
});
