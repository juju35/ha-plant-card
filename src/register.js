// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
import { pickerDefine } from "./card-picker.js";
import { VERSION } from "./core.js";
import { PlantCard, PlantMiniCard } from "./cards.js";
import { PlantCardEditor, PlantMiniCardEditor } from "./visual-editors.js";

export const define = (name, cls) => {
  if (!customElements.get(name)) pickerDefine(name, cls);
};
define("plant-card", PlantCard);
define("plant-mini-card", PlantMiniCard);
define("plant-card-editor", PlantCardEditor);
define("plant-mini-card-editor", PlantMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "plant-card",
    name: "Plant Card",
    description: "Indoor and outdoor plants drawn as they are, with their pot temperature and soil moisture against the ideal range, and a detail popup with the last 24 hours.",
  },
  {
    type: "plant-mini-card",
    name: "Plant Mini Card",
    description: "One plant: its drawing, pot temperature, soil moisture and state, expanded into its detail.",
  },
]) {
  if (!window.customCards.some((c) => c.type === card.type))
    window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-plant-card" });
}

console.info(`%c PLANT-CARD %c v${VERSION} `, "color: white; background: #2e9e5b; font-weight: 700;", "color: #2e9e5b; background: white; font-weight: 700;");
