# 0004. De regeling staat als data in regels.js, gescheiden van de motor

- **Status:** Geaccepteerd
- **Datum:** 2026-08-30
- **Bron:** BOUWOPDRACHT.md §3, §6, §7; README "Hoe de beslislogica in elkaar zit"

## Context

De *Vrijstellingsregeling* verandert elk schooljaar. Iemand van het examenbureau moet kunnen
controleren of de tool de regeling goed volgt, zonder programmeercode te lezen. Tegelijk
moet de vraagvolgorde slim zijn: geen vragen stellen die de uitkomst niet meer veranderen.

## Besluit

We splitsen de logica in drie lagen:

- **`js/regels.js`** — de vertaling van de regeling naar data. Elke regel is een object met
  `id`, `bron` (verwijzing naar artikel of tabel), `onderwerp`, `voorwaarden`, `uitkomst`,
  `vrijstellingVoor` en `uitleg`. Geen `if`-ketens, geen beslislogica.
- **`js/engine.js`** — een generieke motor zonder inhoudelijke kennis. `bepaal(antwoorden)`
  filtert de regels op wat bekend is en geeft óf de uitkomst, óf de vraag die de overgebleven
  kandidaten het sterkst splitst. Staan er alleen nog regels met dezelfde uitkomst, dan stopt
  hij met vragen. Hij is ook headless aan te roepen (voor de tests).
- **`js/ui.js`** — alleen weergave en interactie.

## Gevolgen

- Een nieuwe regeling bijwerken = alleen `regels.js` aanpassen. Moet daarvoor `engine.js` of
  `ui.js` veranderen, dan is er iets structureels aan de hand en is een nieuwe ADR nodig.
- De vraagvolgorde volgt uit de data; er is geen vaste vragenlijst om bij te houden.
- `regels.js` is lang (±1500 regels), maar lineair en per onderwerp gegroepeerd.
- Uitzondering: sommige vragen hebben een onderwerp-specifieke vervolgtekst in `ui.js`
  (het "wat nu"-blok voor LOB, stage en beroepsgericht).

## Overwogen alternatieven

- **Beslisboom als geneste `if`-code** — sneller geschreven, maar niet te controleren door
  het examenbureau en foutgevoelig bij wijzigingen.
- **Regels in JSON** — scheidt nog strikter, maar dan kan er geen commentaar bij en kunnen
  afgeleide waarden zoals het grensjaar ([0011](0011-tienjaarsgrens-min-negen-en-onbekend.md))
  niet in hetzelfde bestand.
