# Changelog

## 1.0.1 - 2026-11-27

### Fixes

- A long plant name no longer runs under the status pill: the pill sits at the end of the title row
- A device's air humidity sensor is no longer taken for the soil moisture
- "Updated … ago" in the detail moves on with time
- Two plants on the same sensor (or with none) get their own tile and detail
- From the keyboard, opening a plant's detail moves the focus to its close button

### Performance

- The entities of each device are indexed once per entity registry instead of scanned on every update

## 1.0.0 - 2026-11-27

### Features

- First release: the **Plant Card** (`custom:plant-card`) and the **Plant Mini Card** (`custom:plant-mini-card`)
- 79 illustrated plants (37 indoor, 42 outdoor) and 104 varieties (variegated leaves, black, lime, silver or purple foliage, flower and fruit colors)
- The drawing follows the sensors: dry, too wet, too cold or frost, pot too hot, with their animations
- Pot temperature and soil moisture against the ideal range of the species, set by kind of plant, by the Plant Monitor's thresholds or per plant
- Tiles with an indoor / outdoor filter, a detail popup with a moisture gauge, the pot temperature and the last 24 hours
- Works with any soil sensor, the Plant integration and the Plant Monitor custom integration (sensors and thresholds found from the device)
- Illustrated 90 px header (shelf and window, garden outdoors, night with a dark theme), visual editors, 22 languages
