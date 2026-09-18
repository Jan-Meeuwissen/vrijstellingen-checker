# Architecture Decision Records

Hier staan de belangrijke keuzes achter de vrijstellingen-checker: wat we besloten, waarom,
en wat we daarvoor inleverden. Zie [0001](0001-beslissingen-vastleggen-in-adrs.md) voor het
waarom van deze map.

## Overzicht

| Nr | Besluit | Status |
|---|---|---|
| [0001](0001-beslissingen-vastleggen-in-adrs.md) | Architectuurbeslissingen vastleggen in ADR's | Geaccepteerd |
| [0002](0002-deterministische-beslisboom-geen-llm.md) | Deterministische beslisboom in plaats van een chatbot | Geaccepteerd |
| [0003](0003-statische-site-zonder-build.md) | Statische site zonder build-stap | Geaccepteerd |
| [0004](0004-regels-als-data-gescheiden-van-motor.md) | Regeling als data in `regels.js`, gescheiden van de motor | Geaccepteerd |
| [0005](0005-drie-uitkomsten-bij-twijfel-onbekend.md) | Drie uitkomsten, bij twijfel "onbekend" | Geaccepteerd |
| [0006](0006-niets-verlaat-de-browser.md) | Niets verlaat de browser | Geaccepteerd |
| [0007](0007-cijfers-als-bereik.md) | Cijfers vragen als bereik | Geaccepteerd |
| [0008](0008-deploy-via-scp-met-staging-map.md) | Deploy via scp met een staging-map | Geaccepteerd |
| [0009](0009-tests-in-browser-met-padregressie.md) | Tests zonder framework, met padregressie | Geaccepteerd |
| [0010](0010-eerder-onvoldoende-afleiden-alleen-als-false.md) | "Eerder onvoldoende" alleen afleiden als false | Geaccepteerd |
| [0011](0011-tienjaarsgrens-min-negen-en-onbekend.md) | Tienjaarsgrens: huidig jaar min 9, uitkomst "onbekend" | Geaccepteerd |

## Een nieuwe ADR toevoegen

1. Kopieer [`0000-sjabloon.md`](0000-sjabloon.md) naar `NNNN-korte-titel.md`, met het
   volgende vrije nummer.
2. Vul context, besluit, gevolgen en alternatieven in. Kort is prima.
3. Zet hem in de tabel hierboven.
4. Vervangt hij een eerder besluit? Pas dan bij de oude ADR alleen de status aan
   ("Vervangen door NNNN"), en laat de rest staan.

**Wanneer wel een ADR:** een keuze over hoe de tool werkt, wat hij wel of niet doet, privacy,
techniek of deploy. Ook een bewuste afwijking van een opdracht.
**Wanneer niet:** de regeling bijwerken in `regels.js`, een tekst aanpassen, een bug fixen.
