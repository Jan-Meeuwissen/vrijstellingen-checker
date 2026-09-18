# 0010. "Eerder onvoldoende" alleen afleiden als false, nooit als true

- **Status:** Geaccepteerd
- **Datum:** 2026-08-30
- **Bron:** VERVOLGOPDRACHT-01.md B1; `metAfgeleideVelden()` in `js/engine.js`

## Context

Veel paden vroegen eerst een cijferbereik en daarna alsnog "was je resultaat een
onvoldoende?". Vervolgopdracht 01 vroeg om het antwoord af te leiden: cijfer boven de grens
→ `false`, cijfer onder 5,5 → `true`.

Maar een eerder onvoldoende resultaat is in §6.3 een algemene uitsluiting met uitkomst
`onbekend` (er kan een compensatieregeling gelden). Zouden we bij een laag cijfer `true`
invullen, dan wint die algemene regel altijd van de onderwerp-specifieke `nee` die al uit
het cijferbereik volgt. Een duidelijke afwijzing verandert dan stilzwijgend in "kan ik niet
beoordelen", wat de regeling niet vraagt en onder meer testgeval 3 en 5 tegenspreekt.

## Besluit

Zodra een cijferbereik bekend is, vult de motor `eerderOnvoldoende = false` in en stelt hij
die vraag niet. Hij vult nooit `true` in. De cijfergrens van de onderwerp-regel is al de
regeling-eigen beoordeling van "voldoende of niet" voor díe vrijstelling. Dit wijkt
bewust af van de letterlijke tekst van vervolgopdracht 01.

## Gevolgen

- Geen dubbele vraag meer na een cijferbereik.
- De vraag "was het onvoldoende?" wordt alleen nog gesteld als er geen cijfer bekend is
  (geen cijfervraag, of "weet ik niet").
- Wie deze functie aanpast, moet testgeval 3 en 5 opnieuw controleren.

## Overwogen alternatieven

- **Letterlijk volgens vervolgopdracht 01 (`true` bij < 5,5)** — verandert duidelijke
  `nee`-uitkomsten in `onbekend`.
- **Beide vragen blijven stellen** — de dubbele vraag was juist het probleem.
