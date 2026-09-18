# 0006. Niets verlaat de browser: geen persoonsgegevens, opslag of externe verzoeken

- **Status:** Geaccepteerd
- **Datum:** 2026-08-30
- **Bron:** BOUWOPDRACHT.md §2, §11, §12.2

## Context

De gebruikers zijn mbo-studenten, deels minderjarig. De tool gaat over hun diploma's en
cijfers. Een hulpmiddel dat alleen een inschatting geeft, hoeft niets over de student te
weten of te bewaren.

## Besluit

- Geen invoerveld voor naam, studentnummer, e-mail of geboortedatum; geen uploads.
- Geen analytics, cookies, `localStorage`/`sessionStorage` of trackers.
- Geen externe verzoeken: geen CDN, geen fonts van buiten; fonts en logo's staan in `assets/`.
- Cijfers worden als bereik gevraagd, niet als exact getal (zie [0007](0007-cijfers-als-bereik.md)).
- De samenvatting wordt alleen getoond en naar het klembord gekopieerd; de student bepaalt
  zelf of hij die deelt.

## Gevolgen

- Geen AVG-verwerking, geen cookiebanner, geen privacyverklaring nodig voor de tool zelf.
- De site vertelt de student dat expliciet ("Je hoeft niet in te loggen. Deze site vraagt
  niets over jou en slaat niets op.").
- We weten niet hoe vaak de tool gebruikt wordt of waar studenten afhaken. Dat accepteren we.
- Herladen = opnieuw beginnen; er wordt geen voortgang bewaard.
- Controleren kan met de grep-checks uit §12.2 van de bouwopdracht.

## Overwogen alternatieven

- **Anonieme statistiek (bijv. zelfgehoste teller)** — nuttig voor verbetering, maar
  voegt een verwerking toe; kan later als aparte ADR worden heroverwogen.
- **Voortgang bewaren in localStorage** — handig bij per ongeluk sluiten, maar de flow is
  kort genoeg om opnieuw te doen.
