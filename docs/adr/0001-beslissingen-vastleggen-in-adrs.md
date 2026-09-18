# 0001. Architectuurbeslissingen vastleggen in ADR's

- **Status:** Geaccepteerd
- **Datum:** 2026-09-18
- **Bron:** overleg Jan

## Context

De keuzes achter de vrijstellingen-checker staan nu verspreid over `BOUWOPDRACHT.md`,
de vervolgopdrachten, commitberichten en commentaar in de code. Wie later iets wil
aanpassen (een nieuwe regeling, een andere server, een andere beheerder) moet dat allemaal
bij elkaar zoeken, en ziet niet meteen welke afwijkingen van de opdracht bewust zijn.

## Besluit

We leggen elke beslissing die de opbouw, de beslislogica, privacy of deploy raakt vast als
een genummerd Architecture Decision Record (ADR) in `docs/adr/`, volgens
[het sjabloon](0000-sjabloon.md). ADR's worden niet herschreven: een besluit dat verandert
krijgt een nieuwe ADR, en de oude krijgt de status "Vervangen door NNNN".

## Gevolgen

- Eén plek om te zien *waarom* iets zo is, niet alleen *hoe*.
- Een wijziging aan de regeling zelf (een cijfergrens, een nieuwe regel in `regels.js`) is
  géén ADR — dat is gewoon onderhoud. Een ADR is voor keuzes over hoe de tool werkt.
- ADR 0002 t/m 0011 zijn achteraf vastgelegd op basis van de bouwopdracht (augustus 2026),
  vervolgopdracht 01 en de code; de datum is die van het oorspronkelijke besluit.

## Overwogen alternatieven

- **Alles in de README** — die gaat over hoe je de tool gebruikt en beheert; de
  achtergrond van besluiten maakt hem te lang.
- **Alleen commentaar in de code** — goed voor details, maar niet vindbaar voor iemand die
  geen JavaScript leest.
