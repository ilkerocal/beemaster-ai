---
module: experts/honey/flora
version: 1.0.0
last_updated: 2026-07-17
sources: [fao-floral-sources-2022, crane-1990]
confidence: high
---

# Flora — Bee Forage Sources

Plants that produce nectar / pollen / both. Beekeepers plan apiary
locations and migration routes around flora.

## 1. Major nectar sources (global)

### 1.1 North America

| Plant | Bloom | Type | Notes |
|---|---|---|---|
| **Almond** (*Prunus dulcis*) | Feb–Mar | Nectar + pollen | Massive pollination event (CA). |
| **Maple** (*Acer* spp.) | Mar–Apr | Nectar + pollen | Early buildup. |
| **Dandelion** (*Taraxacum*) | Apr–May | Nectar + pollen | Critical spring forage. |
| **Tulip poplar** (*Liriodendron*) | May–Jun | Nectar | Premium honey. |
| **Black locust** (*Robinia*) | May–Jun | Nectar | Premium honey, light. |
| **Clover** (*Trifolium*) | May–Aug | Nectar | Reliable mass flow. |
| **Linden / basswood** (*Tilia*) | Jun–Jul | Nectar | Premium honey. |
| **Star thistle** (*Centaurea*) | Jul–Sep | Nectar | Major CA flow. |
| **Sunflower** (*Helianthus*) | Jul–Sep | Nectar + pollen | Major US/EU flow. |
| **Goldenrod** (*Solidago*) | Aug–Oct | Nectar + pollen | Late season. |
| **Buckwheat** (*Fagopyrum*) | Jul–Sep | Nectar | Dark, distinct honey. |

### 1.2 Europe

| Plant | Bloom | Region | Notes |
|---|---|---|---|
| **Acacia** (*Robinia pseudoacacia*) | May–Jun | FR, IT, HU, RO, BG | Light premium honey. |
| **Linden** (*Tilia*) | Jun–Jul | DE, NL, UK | Premium. |
| **Chestnut** (*Castanea*) | Jun | FR, IT, ES | Dark, strong. |
| **Lavender** (*Lavandula*) | Jun–Jul | FR (Provence) | Premium monofloral. |
| **Sunflower** (*Helianthus*) | Jul–Aug | FR, ES, IT, HU | Mass flow. |
| **Heather** (*Calluna*) | Aug–Sep | UK, NL, DE | Thixotropic; difficult to extract. |
| **Borage** (*Borago*) | Jun–Aug | UK, FR | Excellent honey + forage. |
| **Phacelia** | Jun–Sep | DE, NL, UK | Cover crop; great bee plant. |

### 1.3 Mediterranean / Middle East

| Plant | Bloom | Region | Notes |
|---|---|---|---|
| **Citrus** | Mar–May | ES, IT, TR | Premium; pollination + honey. |
| **Rosemary** | Mar–May | ES, FR | Premium monofloral. |
| **Thyme** | May–Jul | GR, ES, TR | Premium Greek thyme honey. |
| **Sage** | Apr–Jun | GR | Premium. |
| **Almond** | Feb–Mar | ES, IT, TR | Pollination crop. |
| **Pine honeydew** | Jun–Sep | TR (Muğla), GR | Major honeydew honey. |

### 1.4 Turkey (TR) — specific

| Plant | Bloom | Region | Notes |
|---|---|---|---|
| **Pine honeydew** (*Marchalina hellenica*) | Jun–Sep | Muğla, Antalya | ~90% of TR honey export. |
| **Sunflower** | Jul–Sep | Trakya, Çukurova, Konya | Major flow. |
| **Citrus** | Apr–May | Adana, Mersin | Early flow. |
| **Chestnut** | Jun | Marmara, Black Sea | Dark honey. |
| **Linden** | Jun–Jul | Marmara, Black Sea | Premium. |
| **Thyme** | Jun–Jul | SE Anatolia, Mediterranean | Premium. |
| **Clover / wildflowers** | May–Jul | Throughout | Mass flow. |
| **Almond** | Feb–Mar | Aegean, SE | Early + pollination. |
| **Anzer thyme** | Jul | Rize (Anzer plateau) | Premium monofloral. |

### 1.5 Diyarbakır (TR — user's region)

| Plant | Bloom | Type | Notes |
|---|---|---|---|
| Almond | Feb–Mar | Nectar + pollen | Early buildup. |
| Hawthorn / wild fruit | Apr–May | Nectar + pollen | Spring buildup. |
| Wild clover | May–Jul | Nectar | Mass flow. |
| Thyme | Jun–Jul | Nectar | Premium. |
| Sunflower | Jul–Aug | Nectar + pollen | Late flow. |
| Goldenrod | Sep–Oct | Nectar + pollen | Winter bee buildup. |

## 2. Pollen sources (general)

| Plant | Notes |
|---|---|
| Hazel, alder, willow | Earliest pollen (Feb–Mar). |
| Dandelion | Major early pollen. |
| Poplar, oak | Spring. |
| Sweet chestnut | Summer. |
| Goldenrod, aster | Autumn. |
| Ivy | Late autumn — last source before winter. |

## 3. Plants to be cautious about

| Plant | Concern |
|---|---|
| Rhododendron | "Mad honey" — grayanotoxin; toxic to humans in quantity. |
| Oleander | Toxic nectar; rare contamination. |
| Some *Delphinium* spp. | Alkaloid nectar. |
| Locust (some regions) | Poisonous if collected from specific trees in autumn. |

The system flags "mad honey" risk for hives near rhododendron.

## 4. Honeydew honey

- **Pine honey** (TR, GR): ~90% of TR honey export. *Marchalina hellenica*
  on Turkish red pine (*Pinus brutia*).
- **Fir honey** (TR, GR): *Cinara* spp. on fir.
- **Oak honey** (DE, TR): *Lachnus* spp.
- **Metcalfa honey** (IT, FR): *Metcalfa pruinosa*.

## 5. Decision pipeline

```text
Region identified?
  ↓
List expected flora in season
  ↓
Plan apiary location (3 km radius forage)
  ↓
Plan migration (if multiple flows)
  ↓
Record actual yield + species
```

## 6. Sources

- FAO. (2022). *Floral sources for honey production.*
- Crane, E. (1990). *Bees and beekeeping.*
- Apimondia. *Regional flora references.*
- TR: TÜİK + Üniversite arıcılık araştırmaları.