# 0002. Deterministische beslisboom in plaats van een chatbot

- **Status:** Geaccepteerd
- **Datum:** 2026-08-30
- **Bron:** BOUWOPDRACHT.md §1 ("Waarom een pagina en geen chatbot"), §11

## Context

De checker vervangt een AI-prompt die maandenlang is getest en steeds bleef haperen:
het taalmodel stelde dezelfde vraag twee keer, raakte de draad kwijt en interpreteerde
regels telkens net anders. Voor een inschatting over vrijstellingen moeten dezelfde
antwoorden altijd dezelfde uitkomst geven, en elke uitkomst moet terug te voeren zijn op
een artikel in de regeling.

## Besluit

De checker is een beslisboom in JavaScript. De staat staat in een object, elke vraag wordt
hooguit één keer gesteld, en dezelfde antwoorden geven altijd dezelfde uitkomst. Er zit
geen LLM- of API-aanroep in, in geen enkele vorm.

## Gevolgen

- Uitkomsten zijn reproduceerbaar en testbaar (zie [0009](0009-tests-in-browser-met-padregressie.md)).
- Elke uitkomst verwijst via het `bron`-veld naar de regeling.
- Geen vrije invoer of "vraag het maar": wat niet in de regels staat, levert uitkomst
  "onbekend" op (zie [0005](0005-drie-uitkomsten-bij-twijfel-onbekend.md)).
- Nieuwe situaties vragen om het bijwerken van `regels.js`, niet om het bijsturen van een prompt.

## Overwogen alternatieven

- **Betere prompt / ander model** — maandenlang geprobeerd; het probleem (niet-determinisme)
  zit in de aanpak, niet in de prompt.
- **Hybride: beslisboom plus LLM voor uitleg** — brengt het risico op tegenstrijdige tekst
  terug en stuurt gegevens naar buiten (zie [0006](0006-niets-verlaat-de-browser.md)).
