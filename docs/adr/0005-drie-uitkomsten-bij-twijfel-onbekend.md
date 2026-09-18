# 0005. Drie uitkomsten, en bij twijfel altijd "onbekend"

- **Status:** Geaccepteerd
- **Datum:** 2026-08-30
- **Bron:** BOUWOPDRACHT.md §5.3, §6.2, §6.3, §7; VERVOLGOPDRACHT-01.md A4

## Context

De tool neemt geen besluit; de examencommissie beslist. Een student die onterecht "nee"
hoort, vraagt misschien een vrijstelling niet aan waar hij recht op heeft. Een student die
onterecht "ja" hoort, rekent zich rijk. Sommige situaties kan de tool principieel niet
beoordelen (compensatieregeling, erkenning van een buitenlands diploma, gelijkwaardigheid
van een beroepsgericht examen).

## Besluit

Elke route eindigt in precies één van drie uitkomsten:

- `ja` — het heeft waarschijnlijk zin om een vrijstelling aan te vragen;
- `nee` — het heeft waarschijnlijk weinig zin;
- `onbekend` — dit kan de tool niet nakijken; bespreek het met je slb'er.

Bij twijfel is de uitkomst altijd `onbekend`. De motor gokt nooit, combineert nooit twee
regels tot een nieuwe conclusie en maakt geen analogieën. "Weet ik niet" op een vraag die
nodig is, leidt tot `onbekend`. Geven de vangnetroute (§6.2) en de eigen route een
verschillende uitkomst, dan ook `onbekend`. Bij `onbekend` tonen we nooit een concrete
"vrijstelling mogelijk voor", zodat het niet als toegekend overkomt.

## Gevolgen

- De tool is voorzichtig; relatief veel paden eindigen in `onbekend` (bij de padtest van
  september 2026: 395 van de 898).
- Elke uitkomst heeft een eigen "wat nu"-tekst met een concrete vervolgstap.
- Ontbreekt een situatie in de regeling, dan is dat geen bug in de motor maar een melding
  voor Jan / het examenbureau.

## Overwogen alternatieven

- **Alleen ja/nee** — dwingt tot gokken bij situaties die de regeling open laat.
- **Kansschatting of percentage** — suggereert een precisie die er niet is.
