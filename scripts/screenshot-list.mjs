// The README screenshots (PNG) and animations (GIF) rendered by scripts/screenshots.mjs.
// Every capture has a twin in the other theme ("-dark" for a light capture, "-light" for a dark one)
// that shows exactly the same state: only the theme differs (checked by test/screenshots.test.mjs).
import { indoorConfig, mini, plantsConfig } from "./mock-states.mjs";

const pair = (base, other = "dark") => [
  { ...base, theme: other === "dark" ? "light" : "dark" },
  { ...base, file: `${base.file}-${other}`, theme: other === "dark" ? "dark" : "light" },
];

export const shots = [
  // Every plant as a tile, with the indoor / outdoor filter; the header shows them on the shelf.
  ...pair({ file: "card", type: "plant-card", width: 460, config: plantsConfig }),
  // A tile tapped: the plant's detail in a popup at the top of the card (moisture gauge, pot temperature, last 24 h).
  ...pair({ file: "card-detail", type: "plant-card", width: 460, config: plantsConfig, clicks: ['[data-plant="sensor.calathea_moisture"]'] }),
  // The outdoor plants only (the filter), a garden in the header.
  ...pair({ file: "card-outdoor", type: "plant-card", width: 460, config: plantsConfig, clicks: ['[data-filter="outdoor"]'] }, "light"),
  ...pair({ file: "card-room", type: "plant-card", width: 460, config: indoorConfig }),
  // The mini card, one plant per state, and its detail.
  ...pair({ file: "mini-card", type: "plant-mini-card", width: 380, config: mini("monstera") }),
  ...pair({ file: "mini-card-dry", type: "plant-mini-card", width: 380, config: mini("calathea") }),
  ...pair({ file: "mini-card-cold", type: "plant-mini-card", width: 380, config: mini("olive") }, "light"),
  ...pair({ file: "mini-card-zoom", type: "plant-mini-card", width: 460, config: mini("monstera"), clicks: ["[data-zoom]"] }),
  // Narrow: the full card at 6 of 12 columns of a phone's Sections view (one column of tiles).
  ...pair({ file: "card-narrow", type: "plant-card", width: 238, config: indoorConfig }),
];

// One looping GIF per distinct animation of the drawing (each plays different keyframes):
//   sway  — all good: the foliage sways and the probe's light blinks
//   dry   — needs water: the foliage droops and a dry leaf falls
//   wet   — too wet: drops run down the plant onto the soaked soil
//   hot   — pot too hot: the sun shines and heat waves rise
export const gifs = [
  ...pair({ file: "sway", type: "plant-mini-card", width: 380, config: mini("monstera"), scene: true }),
  ...pair({ file: "dry", type: "plant-mini-card", width: 380, config: mini("calathea"), scene: true }),
  ...pair({ file: "wet", type: "plant-mini-card", width: 380, config: mini("fiddle_leaf"), scene: true }, "light"),
  ...pair({ file: "hot", type: "plant-mini-card", width: 380, config: mini("rubber"), scene: true }),
];
