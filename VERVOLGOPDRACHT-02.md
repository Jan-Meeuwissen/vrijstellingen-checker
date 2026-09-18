# Vervolgopdracht 02 — tekst over wat een vrijstelling is

**Voor:** Claude Code
**Betreft:** https://www.faistos.nl/vrijstelling/
**Losstaand van vervolgopdracht 01** (die is al verwerkt).

Eén tekstuele correctie, plus een controleronde op hetzelfde probleem elders.

---

## 1. De uitleg op de startpagina is te smal

Nu staat er:

> "Een vrijstelling betekent dat je een examenonderdeel niet meer hoeft te doen, omdat je al
> hebt laten zien dat je het kunt."

Dat klopt niet voor alle onderwerpen die deze tool behandelt. Voor **LOB, burgerschap en stage
(bpv)** wordt helemaal geen examen afgenomen — dat zijn diploma-eisen, geen examenonderdelen.
Een student die voor zijn stage komt, leest hier dat het over examens gaat en kan denken dat hij
op de verkeerde plek is.

Vervang de zin door:

> Voor je diploma moet je verschillende dingen doen. Examens, maar bijvoorbeeld ook je stage.
> Heb je zoiets al ergens anders gehaald? Dan hoef je het misschien niet nog een keer te doen.
> Dat heet een vrijstelling.
>
> Deze site helpt je in een paar vragen inschatten of het zin heeft om er een aan te vragen.

Drie dingen om te behouden bij eventueel herschrijven:

- **De volgorde.** Eerst wat je voor je diploma moet doen, dán pas het woord "vrijstelling".
  Zo hoeft de student de term niet al te kennen om de eerste zin te begrijpen.
- **"Stage" als voorbeeld.** Dat is het meest herkenbare onderdeel waar geen examen bij hoort.
  LOB en burgerschap zeggen een student weinig, en die staan toch al in het keuzemenu.
- **"Deze site", niet "deze pagina".** De student doorloopt meerdere schermen; "pagina"
  suggereert dat alles op één scherm staat. Gebruik "site" overal waar je naar het geheel
  verwijst, en "pagina" of "scherm" alleen als je één specifiek scherm bedoelt.

---

## 2. Controleer dezelfde aanname in de rest van de teksten

Op meer plekken kan "examen" of "examenonderdeel" als enige categorie zijn gebruikt, terwijl
het ook over een diploma-eis kan gaan. Loop deze na en herformuleer waar nodig naar "onderdeel
van je opleiding" of "iets voor je diploma":

- de uitkomstteksten van de korte route: **burgerschap, LOB en stage**;
- de tekst die de knop **Kopieer samenvatting** produceert;
- de "waarom"- en "wat nu"-blokken op het uitkomstscherm;
- de `uitleg`-velden in `regels.js` van de korte-routeregels;
- de `<title>`, de metabeschrijving en eventuele koppen.

Neem in diezelfde ronde het woord **"pagina"** mee: overal waar het over het geheel gaat, moet
dat "site" zijn (zie punt 1). Check ook de `<noscript>`-melding en de disclaimer.

Waar het écht alleen om een examen gaat — Nederlands, Engels, rekenen, keuzedelen,
beroepsgerichte onderdelen — mag "examen" gewoon blijven staan. Het gaat om de plekken waar de
tekst over *alle* onderwerpen tegelijk spreekt.

---

## 3. Controle achteraf

- Doorloop de drie korte routes (burgerschap, LOB, stage) en controleer dat er nergens meer
  staat dat het om een examen gaat.
- Draai de padtest opnieuw en bevestig dat er nog steeds **0 dubbele vragen** en **0
  doodlopende paden** zijn.
- Deploy en controleer de live tekst.
