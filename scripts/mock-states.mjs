// Mock Home Assistant states for the screenshots: neutral plants and rooms, frozen at a fixed day and time.
export const NOW = new Date("2026-06-12T15:30:00");

const plant = (id, name, type, room, moisture, temperature, extra = {}) => ({ id, name, type, room, moisture, temperature, ...extra });
const PLANTS = [
  plant("monstera", "Monstera", "monstera", "Living room", 46, 21.4, { battery: 82 }),
  plant("calathea", "Calathea", "calathea", "Office", 14, 22.1, { battery: 64 }),
  plant("fiddle_leaf", "Fiddle-leaf fig", "ficus-lyrata", "Living room", 82, 20.8),
  plant("rubber", "Rubber plant", "ficus-elastica", "By the radiator", 41, 34.5, { variety: "tineke" }),
  plant("orchid", "Orchid", "orchidee", "Bathroom", 52, 23.0, { variety: "blanche" }),
  plant("pilea", "Pilea Mojito", "pilea", "Kitchen", 35, 21.9, { variety: "mojito" }),
  plant("olive", "Olive tree", "olivier", "Terrace", 40, -1.5, { location: "outdoor" }),
  plant("lavender", "Lavender", "lavande", "Terrace", 28, 16.8, { location: "outdoor" }),
  plant("lemon", "Lemon tree", "citronnier", "Patio", 44, 18.5, { location: "outdoor" }),
];

const sensor = (state, unit, device_class, name) => ({
  state: String(state),
  last_updated: new Date(NOW.getTime() - 4 * 60000).toISOString(),
  attributes: { unit_of_measurement: unit, device_class, friendly_name: name },
});

export const states = {};
for (const p of PLANTS) {
  states[`sensor.${p.id}_moisture`] = sensor(p.moisture, "%", "moisture", `${p.name} moisture`);
  states[`sensor.${p.id}_temperature`] = sensor(p.temperature, "°C", "temperature", `${p.name} temperature`);
  if (p.battery) states[`sensor.${p.id}_battery`] = sensor(p.battery, "%", "battery", `${p.name} battery`);
}
export const entities = {};
export const devices = {};

const conf = (p) => ({
  name: p.name,
  plant_type: p.type,
  ...(p.variety ? { variety: p.variety } : {}),
  ...(p.location ? { location: p.location } : {}),
  room: p.room,
  moisture: `sensor.${p.id}_moisture`,
  temperature: `sensor.${p.id}_temperature`,
  ...(p.battery ? { battery: `sensor.${p.id}_battery` } : {}),
});
const byId = Object.fromEntries(PLANTS.map((p) => [p.id, p]));

export const plantsConfig = { title: "Plants", plants: PLANTS.map(conf) };
export const indoorConfig = { title: "Living room", plants: ["monstera", "fiddle_leaf", "pilea", "orchid"].map((id) => conf(byId[id])) };
export const mini = (id) => conf(byId[id]);

// 24 hours of moisture (slowly drying, watered in the morning) and pot temperature (day/night) for every sensor.
export const history = () => {
  const out = {};
  const end = NOW.getTime();
  for (const p of PLANTS) {
    const m = [];
    const t = [];
    for (let i = 0; i <= 96; i++) {
      const ms = end - (96 - i) * 15 * 60000;
      const h = (i / 4 + 15.5) % 24;
      const wet = i > 62 && p.moisture > 20 ? 0 : 8;
      m.push({ s: String(Math.round((p.moisture + wet - (i / 96) * 6 + Math.sin(i / 7) * 0.8) * 10) / 10), lu: ms / 1000 });
      t.push({ s: String(Math.round((p.temperature + Math.sin(((h - 9) / 24) * 2 * Math.PI) * 1.8) * 10) / 10), lu: ms / 1000 });
    }
    out[`sensor.${p.id}_moisture`] = m;
    out[`sensor.${p.id}_temperature`] = t;
  }
  return out;
};
