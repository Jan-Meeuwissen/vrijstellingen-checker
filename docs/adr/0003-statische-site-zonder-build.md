# 0003. Statische site: HTML, CSS en vanilla JavaScript, zonder build-stap

- **Status:** Geaccepteerd
- **Datum:** 2026-08-30
- **Bron:** BOUWOPDRACHT.md §2, §3, §10, §11

## Context

De tool wordt beheerd door een onderwijsinstelling, niet door een ontwikkelteam. Hij moet
jarenlang blijven werken op een gewone webserver (faistos.nl, submap `/vrijstelling`),
zonder dat iemand dependencies hoeft bij te werken. De doelgroep gebruikt vooral een telefoon.

## Besluit

We bouwen één statische site: `index.html`, `css/stijl.css` en drie scripts
(`js/regels.js`, `js/engine.js`, `js/ui.js`). Geen framework, geen bundler, geen
npm-dependencies, geen backend. De scripts worden als gewone `<script>`-tags geladen en
delen hun gegevens via het `window`-object (geen ES-modules). Alle paden zijn relatief,
omdat de site in een submap draait. Fonts en logo's staan lokaal in `assets/`.

## Gevolgen

- Deployen is bestanden kopiëren (zie [0008](0008-deploy-via-scp-met-staging-map.md)).
- Geen onderhoud aan dependencies, geen beveiligingsupdates van pakketten.
- De scripts moeten in de juiste volgorde geladen worden: eerst `regels.js`, dan
  `engine.js`, dan `ui.js`.
- Absolute paden (`/css/...`) breken de site; `grep -rn 'src="/\|href="/' index.html css js`
  moet leeg blijven.
- Lokaal openen via `file://` verbergt padfouten; gebruik een lokale server (zie README).

## Overwogen alternatieven

- **Framework (React, Vue) met build-stap** — overkill voor een handvol schermen, en maakt
  beheer afhankelijk van een toolchain.
- **ES-modules** — netter, maar werken niet via `file://` en voegen voor deze omvang weinig toe.
