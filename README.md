# Vrijstellingen-checker ROC Nijmegen

Interactieve checker: heeft het zin om een vrijstelling aan te vragen bij ROC Nijmegen? Een
mbo-student beantwoordt een paar meerkeuzevragen en krijgt een inschatting: waarschijnlijk wel
zin, waarschijnlijk weinig zin, of "dit kan ik niet nakijken, bespreek het met je slb'er".

Statische site: HTML + CSS + vanilla JavaScript, geen framework, geen build-stap, geen
dependencies. Alles draait in de browser; er verlaat niets. Zie `BOUWOPDRACHT.md` voor de
volledige opdracht en de achtergrond.

## Lokaal openen

Open dit **niet** via `file://` — dat verbergt padfouten. Draai een lokale server vanaf de
hoofdmap van de repo:

```bash
python3 -m http.server 8000
```

en open <http://localhost:8000/>.

## Hoe de beslislogica in elkaar zit

- **`js/regels.js`** — de vertaling van de *Vrijstellingsregeling 2026-2027* naar data. Puur
  data, geen logica. Elke regel heeft een `bron`-veld dat naar het artikel of de tabel in de
  regeling verwijst, zodat iemand van het examenbureau het kan controleren zonder code te lezen.
- **`js/engine.js`** — de generieke motor. Filtert `js/regels.js` op de gegeven antwoorden en
  bepaalt óf de volgende vraag, óf de uitkomst (zie §7 van de bouwopdracht). Bevat zelf geen
  inhoudelijke kennis over vrijstellingen.
- **`js/ui.js`** — rendering en interactie: schermen, knoppen, voortgang, "wat je al hebt
  ingevuld", de samenvatting om te kopiëren.

### Regels bijwerken als de regeling verandert

1. Zoek in `js/regels.js` de functie die bij het onderwerp hoort (bijvoorbeeld
   `nederlandsRegels()` voor Nederlands, `rekenenRegels()` voor rekenen).
2. Elke regel is een object met een `bron` (verwijzing naar de regeling), `voorwaarden`
   (wanneer de regel van toepassing is), een `uitkomst` (`'ja'`, `'nee'` of `'onbekend'`), en een
   `uitleg` (de tekst die de student te zien krijgt).
3. Pas een bestaande regel aan, of voeg een nieuwe toe naar hetzelfde patroon. Cijfers worden
   altijd als bereik gevraagd (zie `CIJFER_LABELS` en de manier waarop bestaande regels
   `cijfer: 'vanaf-6,5'` of `cijfer: 'onder-6,5'` gebruiken), nooit als los getal.
4. Nieuwe antwoordopties met een eigen tekst? Voeg ze toe aan `BEWIJSSTUK_LABELS` (of de andere
   `*_LABELS`-tabellen) verderop in hetzelfde bestand.
5. Draai de tests (hieronder) om te controleren dat er niets is stukgegaan.

Verander **niets** in `js/engine.js` of `js/ui.js` om de regeling bij te werken — die twee
bestanden weten niets van Nederlands, Engels, rekenen, keuzedelen, enzovoort. Als een aanpassing
daar wél nodig lijkt, is er waarschijnlijk iets structureels aan de hand — overleg dan eerst.

## Tests draaien

Open, met de lokale server draaiend, <http://localhost:8000/test/run.html>. Deze pagina speelt
alle 32 testgevallen uit §12.1 van de bouwopdracht af tegen `bepaal()` en toont per geval
geslaagd/gezakt, met een knop om het gestelde vragenpad te bekijken. Geen testframework nodig.

De testgevallen zelf staan in `test/cases.js`.

## Deployen naar faistos.nl/vrijstelling

1. Kopieer `.env.voorbeeld` naar `.env` en vul de servergegevens in (gebruiker, host, poort,
   pad — zie de uitleg in dat bestand). `.env` staat in `.gitignore` en wordt nooit gecommit.
2. Draai `./deploy.sh`. Het script toont eerst welke bestanden overgezet worden en vraagt om
   bevestiging voor het iets op de server verandert.

Methode: `scp -r`, niet `rsync`. Op de server bleek tijdens het bouwen geen rsync geïnstalleerd
te staan (wel SSH) — zie de toolcheck in §0 van de bouwopdracht. Het script bouwt daarom eerst
een lokale staging-map met precies de bestanden die live moeten staan, leegt daarna de map op de
server (**uitsluitend** het pad dat eindigt op `/vrijstelling` — het script weigert te draaien
als `DEPLOY_PAD` daar niet op eindigt), en zet de staging-map erin.

Na een deploy: controleer met
```bash
curl -sSI https://faistos.nl/vrijstelling/ | head -n 1
```
of je `200` terugkrijgt, en open de site in een browser om te checken dat het logo, de fonts en
de flow werken.

## Structuur

```
index.html            De pagina zelf
css/stijl.css          Huisstijl ROC Nijmegen
js/regels.js           De beslislogica als data
js/engine.js           De motor die vraag/uitkomst bepaalt
js/ui.js                Rendering en interactie
assets/                 Logo's (svg) en lokale webfonts (woff2)
test/cases.js           De 32 testgevallen uit §12.1
test/run.html           Speelt de testgevallen af, toont geslaagd/gezakt
deploy.sh                Zet de site over naar faistos.nl/vrijstelling
.env.voorbeeld           Sjabloon voor de deploy-configuratie
```
