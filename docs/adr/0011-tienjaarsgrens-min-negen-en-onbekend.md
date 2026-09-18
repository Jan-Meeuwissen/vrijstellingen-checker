# 0011. Tienjaarsgrens als jaartal (huidig jaar min 9), met uitkomst "onbekend"

- **Status:** Geaccepteerd
- **Datum:** 2026-08-30
- **Bron:** BOUWOPDRACHT.md §6.3; VERVOLGOPDRACHT-01.md B2; commit e8fdccb; `GRENSJAAR_10_JAAR` in `js/regels.js`

## Context

Een bewijsstuk dat bij de start van de opleiding ouder is dan 10 jaar, telt niet mee (§6.3).
De oorspronkelijke vraag ("is je bewijsstuk ouder dan 10 jaar, gerekend vanaf de start van
je opleiding?") liet de student zelf rekenen. De tool kent de startdatum van de opleiding
niet. Een opleiding start meestal in september, een diploma wordt vaak in mei of juni gehaald.

## Besluit

- We vragen een jaartal: "In welk jaar heb je dat diploma of certificaat gehaald?", met
  "[grensjaar] of later" / "Vóór [grensjaar]" / "weet ik niet".
- Het grensjaar is `GRENSJAAR_10_JAAR = HUIDIG_JAAR - 9`, berekend in `regels.js`, zodat het
  elk jaar vanzelf meebeweegt.
- We gebruiken −9 in plaats van −10, zodat een bewijsstuk niet net onterecht als te oud geldt.
- "Vóór het grensjaar" leidt tot `onbekend`, niet tot `nee`: de exacte termijn hangt af
  van de startdatum, en die kan de slb'er nakijken.

## Gevolgen

- De student hoeft niet te rekenen.
- Het grensjaar wisselt op 1 januari, gebaseerd op de klok van de browser.
- Bij een bewijsstuk van rond de grens is de tool ruim; de slb'er doet de exacte controle.

## Overwogen alternatieven

- **Huidig jaar min 10** — kan een bewijsstuk dat nog net geldig is als te oud aanmerken.
- **Vragen naar startjaar opleiding én jaar bewijsstuk** — een extra vraag en nog steeds
  geen exacte datum.
- **"Vóór grensjaar" → `nee`** — te stellig voor een grens die de tool niet exact kan bepalen.
