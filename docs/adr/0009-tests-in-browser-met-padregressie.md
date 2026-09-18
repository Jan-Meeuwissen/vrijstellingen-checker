# 0009. Tests zonder framework, met een padregressietest over alle paden

- **Status:** Geaccepteerd
- **Datum:** 2026-08-30
- **Bron:** BOUWOPDRACHT.md §12; VERVOLGOPDRACHT-01.md E; commit ee7d1b3

## Context

Het grootste probleem van de oude chatbot was dat vragen dubbel werden gesteld en dat
gesprekken vastliepen. De nieuwe tool moet aantoonbaar vrij zijn van die fouten, ook na
elke wijziging aan `regels.js`. Een testframework past niet bij [0003](0003-statische-site-zonder-build.md).

## Besluit

- `test/cases.js` bevat benoemde testgevallen (de 32 uit §12.1 plus die uit
  vervolgopdracht 01, nu 37), elk met een complete antwoordenset en verwachte uitkomst.
- `test/run.html` speelt ze af via `simuleerPad()` en `bepaal()` uit `engine.js` en toont
  geslaagd/gezakt met het gestelde vragenpad.
- Dezelfde pagina doet een **padregressietest**: hij loopt élke combinatie van antwoorden
  door de motor en controleert dat er **0 dubbele vragen** en **0 paden zonder geldige
  uitkomst** zijn.
- `test/` wordt niet gedeployd.

## Gevolgen

- Draaien kan in elke browser via een lokale server; er hoeft niets geïnstalleerd te worden.
- Na elke wijziging aan de logica draai je de testpagina; bij een tekstwijziging is dat niet nodig.
- Inhoudelijke juistheid (klopt de uitkomst met de regeling?) blijft een functionele
  controle door Jan; de tests bewaken alleen dat bekende gevallen niet ongemerkt veranderen.

## Overwogen alternatieven

- **Jest/Vitest met Node** — vereist npm en een `package.json`, tegen ADR 0003 in.
