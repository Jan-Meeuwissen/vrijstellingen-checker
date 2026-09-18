# 0007. Cijfers vragen als bereik rond de grens, niet als getal

- **Status:** Geaccepteerd
- **Datum:** 2026-08-30
- **Bron:** BOUWOPDRACHT.md §6.1; VERVOLGOPDRACHT-01.md B1

## Context

De regeling werkt met drempels (bijvoorbeeld 5,5, 6 of 6,5, en bij rekenen ook 4). Een
exact cijfer typen leidt tot typefouten, discussie over decimalen, en is meer informatie
dan nodig.

## Besluit

We vragen een cijfer altijd als keuze uit bereiken rond de grens die in dát geval telt
("6,5 of hoger" / "lager dan 6,5" / "weet ik niet"), met de labels uit `CIJFER_LABELS` en
`CIJFER_HAVO_VWO_LABELS` in `regels.js`. Regels verwijzen naar die bereiken
(`cijfer: 'vanaf-6,5'`), nooit naar een getal.

## Gevolgen

- Geen invoervalidatie nodig; meerkeuze werkt goed op een telefoon.
- Is een cijferbereik bekend, dan wordt de losse vraag "was je resultaat een onvoldoende?"
  niet meer gesteld (zie [0010](0010-eerder-onvoldoende-afleiden-alleen-als-false.md)).
- Een nieuwe grens in de regeling betekent een nieuw bereik in `regels.js`.

## Overwogen alternatieven

- **Getal invoeren en in de code vergelijken** — meer typefouten, en de student deelt meer
  dan nodig.
