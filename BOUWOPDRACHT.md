# Bouwopdracht: Vrijstellingen-checker ROC Nijmegen

**Voor:** Claude Code
**Opdrachtgever:** Jan Meeuwissen, ROC Nijmegen
**Deliverable:** een statische, interactieve webpagina op **faistos.nl**, in een eigen
GitHub-repo.

Lees deze opdracht helemaal door voor je begint. Stel vragen als iets niet klopt; verzin niets
bij, zeker niet in de beslislogica in §6.

---

## 0. Eerst: check je gereedschap

**Doe dit vóór je één regel code schrijft.** Jan wil dat je zelfstandig kunt werken, dus stel
eerst vast wat je daadwerkelijk kunt en waar je vastloopt. Rapporteer het resultaat als een
kort lijstje met per punt: werkt / werkt niet / heb ik iets voor nodig. Ga pas bouwen als je
weet dat de keten klopt, of als Jan heeft gezegd dat je alvast mag beginnen.

### 0.1 Shell en rechten

```bash
whoami && pwd
git --version
ssh -V
rsync --version || echo "GEEN rsync lokaal"
python3 --version || echo "GEEN python3"
```

Noteer of je zonder tussenkomst commando's mag draaien, of dat er per commando toestemming
wordt gevraagd. Loop je tegen een permissieprompt aan die het werk blokkeert, meld dan precies
welk commando en welke rechten je nodig hebt — dan kan Jan dat in één keer goedzetten in plaats
van bij elke stap.

### 0.2 GitHub

```bash
gh auth status          # of: ssh -T git@github.com
git config --get user.name && git config --get user.email
```

Test of je écht kunt pushen, niet alleen of je bent ingelogd. Maak een tijdelijke privérepo,
push een leeg commit, en gooi hem daarna weg:

```bash
gh repo create test-toegang-$(date +%s) --private --clone
# commit, push, controleren, daarna:
gh repo delete <naam> --yes
```

Lukt aanmaken of pushen niet, meld dan de exacte foutmelding en wat je nodig hebt (scope
`repo` op de token, of een SSH-sleutel toevoegen aan het account).

### 0.3 SSH naar faistos.nl

Jan weet niet zeker of rsync op de server werkt. Zoek dat uit voor je een deploy-script
schrijft.

```bash
ssh -o BatchMode=yes <gebruiker>@faistos.nl 'echo VERBINDING_OK; uname -a'
ssh <gebruiker>@faistos.nl 'which rsync || echo GEEN_RSYNC_OP_SERVER'
ssh <gebruiker>@faistos.nl 'ls -la ~/ ; df -h .'
```

Vraag Jan om de gebruikersnaam en, als het niet de standaardpoort is, de poort. Als de
SSH-sleutel al op je machine staat maar niet gevonden wordt, kijk dan in `~/.ssh/` en gebruik
`-i <pad-naar-sleutel>`.

### 0.4 Het doelpad vinden

De site komt in de submap **`faistos.nl/vrijstelling`**. Zoek uit welk pad op de server daarbij
hoort — dat verschilt per hosting:

```bash
ssh <gebruiker>@faistos.nl 'ls -d ~/public_html ~/www ~/httpdocs ~/domains/faistos.nl/public_html 2>/dev/null'
```

Zet een testbestand neer en controleer dat het via het web bereikbaar is:

```bash
ssh <gebruiker>@faistos.nl 'mkdir -p <docroot>/vrijstelling && echo "test $(date)" > <docroot>/vrijstelling/test.txt'
curl -sSI https://faistos.nl/vrijstelling/test.txt | head -n 1
curl -sS  https://faistos.nl/vrijstelling/test.txt
```

Krijg je `200 OK` en de juiste inhoud terug, dan klopt het pad. Ruim `test.txt` daarna op.
Krijg je een 403 of 404, meld dat met het geprobeerde pad — dan klopt de docroot niet of staat
er een redirect in de weg.

### 0.5 Deploymethode kiezen

Op basis van 0.3 en 0.4:

| Situatie | Wat je gebruikt |
|---|---|
| rsync op beide kanten aanwezig | `rsync -avz --delete` over SSH — de voorkeur |
| Wel SSH, geen rsync op de server | `tar` + `ssh` (`tar czf - . \| ssh ... 'tar xzf - -C <pad>'`), of `scp -r` |
| Alleen SFTP, geen shell | `sftp` in batchmodus, of `lftp mirror -R` als dat beschikbaar is |
| Niets van dit alles | Stop en meld het; verzin geen omweg met FTP in platte tekst |

Schrijf `deploy.sh` pas nadat je weet welke van deze varianten werkt, en zet in de README welke
je hebt gekozen en waarom.

---

## 1. Wat je bouwt

Een webpagina waarop een mbo-student van ROC Nijmegen in een paar klikken kan zien of het zin
heeft om een vrijstelling voor een examenonderdeel aan te vragen. De student klikt zich door
een korte reeks meerkeuzevragen en krijgt aan het eind één van drie uitkomsten, met uitleg en
een vervolgstap.

De inhoud komt uit de *Vrijstellingsregeling 2026-2027* van ROC Nijmegen. De volledige
beslislogica staat in §6 van dit document. **Dat is de enige bron.** Vul geen gaten op met
algemene kennis over het mbo.

### Waarom een pagina en geen chatbot

Dit vervangt een AI-prompt die maandenlang is getest en steeds bleef haperen: taalmodellen
stelden dezelfde vraag twee keer, raakten de draad kwijt en interpreteerden regels net anders.
Een beslisboom in JavaScript heeft die problemen per definitie niet: de staat staat in een
object, elke vraag komt precies één keer, en dezelfde antwoorden geven altijd dezelfde
uitkomst. **Determinisme is het hele punt van deze herbouw — bouw dus geen LLM-aanroep in, in
geen enkele vorm.**

---

## 2. Randvoorwaarden

| | |
|---|---|
| **Techniek** | Eén statische site. HTML + CSS + vanilla JavaScript. Geen framework, geen build-stap, geen bundler, geen dependencies. |
| **Backend** | Geen. Alles draait in de browser. |
| **Data** | Er verlaat niets de browser. Geen analytics, geen cookies, geen localStorage, geen fonts van een CDN. |
| **Persoonsgegevens** | De pagina vraagt er niet naar en heeft er geen veld voor. Geen naam, geen studentnummer, geen e-mail. Alleen wat er op een diploma staat. |
| **Uploads** | Geen upload-mogelijkheid, in geen enkele vorm. |
| **Browsers** | Recente Chrome, Edge, Firefox, Safari. Mobiel is de belangrijkste doelgroep: veel studenten doen dit op hun telefoon. |
| **Taal** | Nederlands, ongeveer B1. Zie §8. |

---

## 3. Repo

Maak een **nieuwe, aparte** GitHub-repo. Voeg dit niet toe aan een bestaand project.

- **Naam:** `vrijstellingen-checker`
- **Zichtbaarheid:** overleg met Jan. Publiek mag — er staat geen gevoelige data in — maar het
  is zijn keuze.
- **Beschrijving:** "Interactieve checker: heeft het zin om een vrijstelling aan te vragen bij
  ROC Nijmegen?"

Structuur:

```
/
├── index.html
├── css/
│   └── stijl.css
├── js/
│   ├── regels.js        # de beslislogica als data (§6)
│   ├── engine.js        # bepaalt de volgende vraag en de uitkomst
│   └── ui.js            # rendering en interactie
├── assets/
│   ├── logodonker.svg
│   └── logowit_transp.svg
├── test/
│   ├── cases.js         # de testgevallen uit §12
│   └── run.html         # draait de tests in de browser, toont geslaagd/gezakt
├── deploy.sh
├── README.md
└── .gitignore
```

Houd `regels.js` strikt gescheiden van de rest: dat bestand is de vertaling van de regeling en
moet door een niet-programmeur van het examenbureau te controleren zijn. Geen logica erin,
alleen data, met per regel een commentaarregel die naar het artikel of de tabel verwijst.

**README.md** bevat: wat de tool doet, hoe je hem lokaal opent, hoe je de regels bijwerkt als de
regeling verandert, hoe je de tests draait, en hoe je deployt.

Commit in logische stappen met Nederlandse commitberichten. Werk op `main`.

---

## 4. Huisstijl ROC Nijmegen

Neem dit letterlijk over.

### Kleuren

| Naam | HEX | Gebruik in deze pagina |
|---|---|---|
| Donkerpaars | `#3f2e56` | Header, footer, tekstkleur, primaire knop |
| Middeltpaars | `#6e6eb4` | Accenten, voortgangsbalk, focusring |
| Lichtblauw | `#98d3eb` | Vlakken, geselecteerde antwoordoptie |
| Roze/magenta | `#cd3c74` | Spaarzaam. Alleen voor "let op"-accenten. Nooit achter het logo. |
| Geel/oranje | `#eead29` | Accent bij de uitkomst "weinig zin" en bij de slb'er-verwijzing |

Tints mogen in stappen van 20%. Zet ze als CSS custom properties in `:root`.

### Typografie

- **Koppen:** Montserrat (Bold/Black). Bungee mag voor de titel op de startpagina, maar niet
  in de vragenstroom — daar zijn te veel stijlelementen en wordt het onrustig.
- **Broodtekst:** Roboto Regular.
- **Belangrijk:** laad geen webfonts van Google Fonts of een ander CDN — dat lekt bezoekgegevens
  en de pagina moet zelfstandig werken. Zet de woff2-bestanden in `assets/fonts/` en laad ze met
  `@font-face`. Lukt dat licentietechnisch niet, gebruik dan een systeemfont-stack en meld dat
  aan Jan; kies dan niet stiekem toch een CDN.
- Minimale tekstgrootte 16px, regelafstand ruim (1,5). De doelgroep leest niet makkelijk.

### Logo

De volledige SVG-broncode van beide logo's staat in **bijlage A** onderaan dit document. Sla
ze op als `assets/logowit_transp.svg` en `assets/logodonker.svg`. Haal ze nergens anders
vandaan en teken ze niet zelf na.

- `logowit_transp.svg` — transparante achtergrond, dus alleen op donkerpaars gebruiken (de
  header).
- `logodonker.svg` — de donkerpaarse achtergrond zit in het bestand, dus bruikbaar als los blok.
- Het logo staat **rechtsboven**, nooit linksonder.
- Niet vervormen, niet verkleuren, niet roteren.

### Vormen

Vlakken met ronde hoeken, cirkels, en schuine balkjes van 9 graden mogen als accent. Het schuine
balkje nooit in roze. Houd het rustig: dit is een hulpmiddel, geen campagne.

### Tone of voice

Jij/je, nooit u. Actief. Korte zinnen, één boodschap per zin. Geen jargon zonder uitleg. Zie
§8 voor de woordenlijst.

---

## 5. Schermen en flow

### 5.1 Startscherm

- Titel: **Kan ik een vrijstelling aanvragen?**
- Twee of drie zinnen uitleg: wat een vrijstelling is, dat dit een hulpmiddel is en dat de
  examencommissie beslist, en dat je geen persoonlijke gegevens hoeft in te vullen.
- Grote knop: **Start**.
- Onderaan klein: laatst bijgewerkt + versie van de regeling (2026-2027).

### 5.2 Vragenstroom

Eén vraag per scherm. Elke vraag is een meerkeuzevraag met grote, aanklikbare knoppen — geen
dropdowns, geen vrije tekstvelden (de enige uitzondering is de naam van een buitenlands
diploma).

Elk vraagscherm heeft:

- Een **voortgangsindicator** ("vraag 3 van ongeveer 5"). Het aantal is een schatting; toon geen
  valse precisie.
- Een lijst met **wat je al hebt ingevuld**, compact, boven of naast de vraag. Elk item is
  aanklikbaar om die ene keuze te wijzigen. Dit is het equivalent van de "Wat ik al weet"-regel
  uit de oude prompt en het is een kernonderdeel, geen extraatje.
- Een **Terug**-knop die één stap terug gaat.
- Bij elke vraag waar dat kan een optie **"Weet ik niet"**.

Wijzigt de student een eerder antwoord, herbereken dan de rest van de vragenstroom en gooi
antwoorden weg die niet meer van toepassing zijn. Vraag niets opnieuw wat nog steeds geldt.

**De vragen worden gegenereerd door de engine, niet hard gecodeerd in een vaste volgorde.** De
engine kijkt welke regels nog kandidaat zijn, bepaalt welk gegeven het meest onderscheidend is,
en stelt die vraag. Zodra er nog maar één uitkomst mogelijk is, stopt hij en toont het
resultaat. Zo krijgt niemand een vraag waarvan het antwoord er niet meer toe doet.

Volgorde van de vragen: eerst het onderwerp, dan het type bewijsstuk, dan wat erop staat, en
pas daarna de context (huidig niveau, eerdere opleiding, leeftijd van het bewijsstuk). Vraag
**nooit** naar de naam van een opleiding — geen enkele regel hangt daarvan af.

### 5.3 Uitkomstscherm

Toon precies één van deze drie koppen, woordelijk:

1. **Het heeft waarschijnlijk zin om een vrijstelling aan te vragen.**
2. **Het heeft waarschijnlijk weinig zin om een vrijstelling aan te vragen.**
3. **Dit kan ik met deze informatie niet nakijken. Bespreek het met je studieloopbaanbegeleider
   (je slb'er).**

Daaronder:

- **Waarom** — welke regel van toepassing is, in gewone taal, met de voorwaarde erbij.
- **Wat nu** —
  - Bij 1: het bewijsstuk erbij pakken, aanvragen via **Eduarte**, minimaal **6 kalenderweken**
    vóór de diplomering.
  - Bij 2: kort waarom niet, en dat de slb'er er altijd naar kan kijken als hij twijfelt.
  - Bij 3: naar de slb'er, met wat hij kan meenemen en vragen.
  - **Uitzondering:** bij burgerschap, LOB en stage noem je Eduarte en de 6 weken niet — daar
    bestaat geen vrijstellingsaanvraag voor. Verwijs naar de opleiding of de slb'er.
- Een knop **Kopieer samenvatting**. Die zet een korte platte tekst op het klembord met: het
  onderwerp, de ingevulde gegevens, de uitkomst en de vervolgstap. Zo kan de student het in een
  bericht aan zijn slb'er plakken. Toon een bevestiging ("Gekopieerd") na het klikken.
- Een knop **Opnieuw beginnen**.
- Een vaste disclaimer: dit is een hulpmiddel, de examencommissie beslist.

Meerdere onderdelen checken doet de student door opnieuw te beginnen. Bouw geen
multi-onderwerp-modus; dat maakte de chatbotversie juist ingewikkeld.

---

## 6. De beslislogica

Dit is de kern. Zet dit om in data in `regels.js`, niet in `if`-ketens door de code heen.

### 6.1 Model

Bedenk een structuur in deze geest en werk hem consequent uit:

```js
// Voorbeeld van de vorm — niet de volledige inhoud
{
  id: 'nl-eerste-123-ce-ie-2f',
  bron: 'Nederlands, instroomtabel niveau 1/2/3',   // verwijzing voor controle
  onderwerp: 'nederlands',
  route: 'eerste',            // 'eerste' | 'lager-gelijk' | 'hoger'
  huidigNiveau: [1, 2, 3],
  bewijsstuk: ['mbo-diploma', 'mbo-certificaat', 'mbo-verklaring', 'cijferlijst'],
  staatErop: 'nederlands-2f',
  drempel: { soort: 'cijfer', minimaal: 6.5 },
  uitkomst: 'ja',             // 'ja' | 'nee' | 'onbekend'
  vrijstellingVoor: '2F generiek',
  uitleg: 'Je hebt het hele examen Nederlands op 2F gehaald met minimaal een 6,5.'
}
```

Cijfers vraag je **niet** als open getal maar als bereik rond de grenzen die er in dat geval toe
doen ("5,5 of hoger" / "lager dan 5,5" / "weet ik niet"). Bij rekenen doen twee grenzen mee (4
en 5,5), dus daar drie bereiken. Dat scheelt typefouten en de student hoeft zijn exacte cijfer
niet te delen.

### 6.2 Welke route geldt

| Situatie van de student | Route |
|---|---|
| Deed niet eerder een mbo-opleiding (komt van vmbo, havo, vwo of van buiten het onderwijs) | `eerste` |
| Vorige mbo-opleiding op een lager of gelijk niveau | `lager-gelijk` |
| Vorige mbo-opleiding op een hoger niveau | `hoger` |

**Vangnet — bouw dit expliciet in.** Levert de gekozen route geen enkele passende regel op,
zoek dan alsnog in `eerste`. De regeling gebruikt die tabel namelijk ook voor studenten die al
eerder een mbo-opleiding deden — bijvoorbeeld iemand met een mbo-2-diploma die aan niveau 3
begint en zijn Engels-cijfer wil gebruiken. Levert dat een regel op, gebruik die. Leiden beide
routes tot een **verschillende** uitkomst → uitkomst 3.

De woorden *instroom*, *doorstroom* en *afstroom* mogen nergens in de interface staan. Ze zijn
prima als interne sleutel in de code.

### 6.3 Uitsluitingen — check deze altijd eerst

Levert een van deze een treffer op, dan is de uitkomst meteen **nee** (uitkomst 2), behalve waar
anders vermeld:

- Bewijsstuk **ouder dan 10 jaar** bij de start van de huidige opleiding.
- **EVC** (eerder verworven competenties).
- Een **remediërend keuzedeel**.
- Een **Cambridge- of Anglia-certificaat uit het voortgezet onderwijs** voor Engels.
- **Wiskunde van havo of vwo** voor rekenen.
- **Enig resultaat uit hbo of wo** voor Nederlands, Engels of rekenen — diploma, propedeuse,
  deelcertificaat of losse vakresultaten, ongeacht het cijfer. Reden: daar wordt niet op de
  referentieniveaus geëxamineerd.
- Een **eerder onvoldoende resultaat** → in principe nee, maar een compensatieregeling kan het
  toestaan. Dat kan de tool niet beoordelen → **uitkomst 3**.
- Een bewijsstuk waarvan **niet vaststaat dat het erkend is** (certificaat van een particuliere
  cursus, onbekend of buitenlands diploma) → **uitkomst 3**.

Geldige bewijsstukken zijn: een erkend diploma, een erkend certificaat, een mbo-verklaring of
een DUO-uittreksel.

Een algemeen vak kan nooit worden vrijgesteld op basis van een beroepsgericht examen, en
andersom niet. Een toegekende vrijstelling blijft geldig tot het einde van de opleiding.

### 6.4 Nederlands

> **Let op — bewuste afwijking van het brondocument.** Artikel 2.2.2 van de regeling zegt:
> "Vrijstelling vanuit het vmbo is alleen mogelijk als Nederlands op 3F is afgelegd." Dat is een
> fout in de regeling: vmbo-Nederlands wordt op **2F** afgelegd, en de instroomtabellen gaan ook
> van 2F uit. Bouw **2F** in, en zet deze notitie als commentaar in `regels.js`.

**Route `eerste`, huidig niveau 1/2/3 → vrijstelling voor 2F generiek.** Eén van:
- geheel CE/IE 2F ≥ 6,5;
- CE 2F lezen/luisteren ≥ 6,5;
- IE 2F per onderdeel ≥ 6,5;
- havo/vwo-diploma met Nederlands als eindexamenvak ≥ 6;
- keuzedeel K0071 Nederlands 3F ≥ 5,5.

**Route `eerste`, huidig niveau 4 → 3F generiek.** Eén van:
- geheel CE/IE 3F ≥ 5,5;
- CE/IE 3F per onderdeel ≥ 5,5;
- havo/vwo-diploma met Nederlands als eindexamenvak ≥ 6;
- keuzedeel K0071 Nederlands 3F ≥ 5,5.

**Route `lager-gelijk`.** 1→2 of 2→3: dezelfde 2F-routes, **behalve** de havo/vwo-route.
3→4 of 4→4: dezelfde 3F-routes, **behalve** de havo/vwo-route.

**Route `hoger`.** 2→1 → 2F. 3→2 → 2F.

4→3 en 4→2 hebben twee **zelfstandige** routes:
- route A: 2F generiek + keuzedeel 3F;
- route B: alleen generiek 3F (hoger niveau).

A en B worden nooit opgeteld en B is geen aanvulling op A. Deze rijen noemen **geen
cijfergrens** — leen er dus geen uit een andere tabel, en vraag hier niet naar een cijfer. Is
deze situatie van toepassing → **uitkomst 1**, toon beide routes als mogelijke uitkomsten en
zeg erbij dat de examencommissie bepaalt welke wordt toegekend. Dat de tool die keuze niet kan
maken is géén reden voor uitkomst 3.

**Cijferdifferentiatie.** Op een diploma of resultatenlijst staat altijd het gedifferentieerde
cijfer. Reken niets terug en vraag er niet naar. Bij een 3F-deelresultaat dat meetelt voor een
deel van 2F wordt geen cijferdifferentiatie toegepast.

### 6.5 Engels

Vanuit het vmbo alleen mogelijk als Engels op minimaal A2/B1 is afgelegd. Havo → A2/B1.
Vwo → B1/B2.

In alle routes hieronder is **≥ 6,0 het cijfer voor het vak Engels**, niet een gemiddelde. Met
"havo" en "vwo" wordt een diploma van dat niveau bedoeld, of een certificaat van dat niveau.

**Route `eerste`, niveau 2/3** — met minimaal 6,0 voor Engels:
- mbo-diploma, -certificaat of -verklaring → keuzedeel B1/A2;
- havo → keuzedeel A2/B1;
- vwo → keuzedeel A2/B1 + keuzedeel B1/B2.

**Route `eerste`, niveau 4** — met minimaal 6,0 voor Engels:
- mbo-diploma, -certificaat of -verklaring → generiek A2/B1;
- havo → generiek A2/B1;
- vwo → generiek B1/B2 (hoger niveau), óf generiek A2/B1, óf generiek A2/B1 + keuzedeel B1/B2.

Verder op niveau 4:
- keuzedeel K0802 B1/A2 → generiek A2/B1, bij geheel CE/IE ≥ 5,5 of per onderdeel ≥ 5,5;
- keuzedeel K0803 B1/B2 → generiek A2/B1 en/of K0803 B1/B2 of K0802 A2/B1, bij geheel CE/IE
  ≥ 5,5 of per onderdeel ≥ 5,5.

**Route `lager-gelijk`.**
- 3→4: CE Engels B1 + IE Engels A2 → K0802, bij gemiddeld resultaat B1/A2 ≥ 5,5.
- 4→4: CE Engels B1 lezen/luisteren ≥ 5,5 → vrijstelling daarvoor. IE Engels A2 gemiddeld
  ≥ 5,5 → vrijstelling; bij een deelresultaat ≥ 5,5 kan dat per onderdeel.

**Route `hoger`.** 4→3 → K0802, bij gemiddeld B1/A2 ≥ 5,5 óf gemiddeld B1/B1 ≥ 5,5.

**Overig.** Een deelresultaat op een hoger niveau mag meetellen voor een deel van een examen op
een lager niveau. Keuzedeel Engels B1/B2 behaald in niveau 3 → in niveau 4 inzetbaar voor het
keuzedeel B1/B2 (mits de kwalificatie zelf geen beperkt Engels op dat niveau bevat) én voor
generiek A2/B1.

### 6.6 Rekenen

Vmbo 3F kan vrijstelling geven; vmbo 2F niet. Rekenen 2F vanuit een gevolgde mbo-opleiding kan
wel. Gestart vóór cohort 2022: rekenen telt niet mee in de diplomabeslissing, maar het examen
moet wel zijn afgelegd.

Een **rekenresultaat van het vmbo op 3F** gebruik je in de regels die spreken over "rekenen 3F"
zonder bron. Noemt een regel expliciet een andere bron ("examen rekenen **mbo** 3F",
"rekentoets **havo** 3F"), dan geldt die regel niet voor een vmbo-resultaat. Past er zo geen
regel → uitkomst 3.

**Route `eerste`, niveau 2:**
- rekenniveau 2 ≥ 5,5 of examen rekenen mbo 2F ≥ 5,5 → generiek N2;
- rekenen 3F ≥ 5,5 → generiek rekenen niveau 2 of 3 **én** keuzedeel rekenen niveau 3 of 4.

**Route `eerste`, niveau 3:**
- rekenniveau 3 ≥ 5,5 of examen rekenen mbo 2F ≥ 5,5 → generiek N3;
- rekenen 3F ≥ 5,5 → generiek rekenen niveau 2 of 3 **én** keuzedeel rekenen niveau 3 of 4.

**Route `eerste`, niveau 4** — generiek N4 bij één van: rekenniveau 4 ≥ 5,5; examen rekenen mbo
3F ≥ 5,5; rekentoets havo 3F ≥ 5,5.

**Route `lager-gelijk`.**
- 1→2: 2N ≥ 5,5 → rekenniveau 2.
- 2→3: 2F of 3N ≥ 5,5 → rekenniveau 3.
- 3→4: 3F of 4N ≥ 5,5 → rekenniveau 4.
- 3→4: keuzedeel K0089 of K1130 Rekenen 3F → generiek rekenen 3F, alleen als de student vóór
  2022-2023 is gestart.

**Route `hoger`.**
- 3→2: 2F of rekenniveau 2 → rekenniveau 2.
- 3→2: 2F of rekenniveau 3 → rekenniveau 2 of keuzedeel rekenen 3.
- 4→3: 3F of rekenniveau 4 → rekenniveau 3 of keuzedeel rekenen 3-4.
- 4→2: 3F of rekenniveau 4 → rekenniveau 2 én keuzedeel rekenen 3-4.

**Speciale route met cijfer 4:**

| Situatie | Bewijsstuk | Vrijstelling voor |
|---|---|---|
| Huidige opleiding mbo 2 of 3 | rekenen 3F ≥ 4 | rekenen 2F generiek **én** keuzedeel rekenen 3F |
| 4→3 | rekenen 3F ≥ 4 | rekenen 2F generiek **én** keuzedeel rekenen 3F |
| 4→2 | rekenen 3F ≥ 4 | rekenen generiek **én** keuzedeel rekenen 3F |

Dit kan alleen als voor het keuzedeel aan de slaag-/zakregeling (vanaf cohort 2020) is voldaan.
Dat kan de tool niet vaststellen. **Volgorde:** haalt de student de gewone grens van 5,5 niet,
ga dan niet meteen naar uitkomst 2 — kijk eerst of deze route past. Past hij, dan is het
**uitkomst 3**, met de slaag-/zakvoorwaarde expliciet genoemd. Niet uitkomst 1 en niet 2.

### 6.7 Keuzedelen

Mogelijk op basis van een eerder gevolgd of behaald keuzedeel (gekoppeld of niet-gekoppeld), of
op basis van behaalde delen van een kwalificatie.

Niet mogelijk bij een remediërend keuzedeel, bij dubbel gebruik van hetzelfde keuzedeel (het kan
niet tegelijk meetellen voor de keuzedeelverplichting én voor een ander onderdeel van de
kwalificatie), of bij een onvoldoende vanaf cohort 2020. Uitzondering daarop: aan het einde van
de opleiding kan de slaag-/zakregeling het alsnog toestaan — dat kan de tool niet beoordelen →
uitkomst 3.

- **Precies hetzelfde keuzedeel** dat de student eerder behaalde → dit is de regel die geldt.
- **Een ander of lijkend keuzedeel, of delen van een kwalificatie** → iemand moet beoordelen of
  het gelijkwaardig is, en dat doet de tool nooit → uitkomst 3.

### 6.8 Beroepsgerichte examens

Mogelijk voor een kerntaak, een werkproces, een kennisexamen, een certificeerbare eenheid, of
een keuzedeel dat met een voldoende is afgesloten. Voorwaarde: een voldoende eindresultaat,
minimaal een 6 of "voldoende".

Aanvullend: op werkprocesniveau alleen als het resultaat op dat niveau te achterhalen is; voor
een kennisexamen alleen als het resultaat te achterhalen is én het kwalificatiedossier hetzelfde
is gebleven.

De examencommissie beoordeelt of het onderdeel gelijkwaardig is aan niveau en inhoud van het
huidige kwalificatiedossier. **De tool beoordeelt gelijkwaardigheid nooit** en gaat er nooit
vanuit dat een kwalificatiedossier hetzelfde is gebleven of dat een oud resultaat te achterhalen
is. Zo'n oordeel is hier bijna altijd nodig → **uitkomst 3**, met bij "wat nu" de lijst van wat
de student meeneemt: het bewijsstuk, het resultaat, informatie over het eerdere examen, en een
onderbouwing van de mogelijke gelijkwaardigheid.

### 6.9 Burgerschap, LOB en stage — korte route

Deze drie slaan de hele vragenstroom over.

- **Burgerschap** — vrijstelling is nooit mogelijk. Geen vervolgvraag → uitkomst 2.
- **LOB** — één vraag: kun je het LOB-programma met je groep volgen? Ja → uitkomst 2.
  Nee → uitkomst 3; het onderwijsteam beoordeelt een uitzondering.
- **Stage (bpv)** — voor stage wordt geen examen afgenomen; een verzoek loopt via de opleiding
  zelf. Één vraag: werkte je al langere tijd in dit beroep toen je aan deze opleiding begon?
  Nee → uitkomst 2. Ja → uitkomst 3; de teammanager beoordeelt of die werkervaring de stage
  mag vervangen. Gebruik het woord "zij-instroom" niet in de interface.

Bij alle drie: **noem Eduarte en de 6-wekentermijn niet.** Verwijs naar de opleiding of de
slb'er.

### 6.10 Buitenlands diploma

Kan formeel aanleiding zijn voor vrijstelling, maar is altijd maatwerk. Vraag alleen de naam van
het diploma (vrij tekstveld, het enige in de hele tool) en het land. Beoordeel gelijkwaardigheid
nooit → uitkomst 3.

---

## 7. De engine

`engine.js` krijgt de antwoorden tot nu toe en geeft terug: óf de volgende vraag, óf een
uitkomst.

Werkwijze:

1. Filter alle regels uit `regels.js` op wat al bekend is.
2. Blijft er geen enkele regel over → kijk of het vangnet (§6.2) iets oplevert.
3. Blijft er één uitkomst over → geef die terug.
4. Blijven er meerdere regels over met **dezelfde** uitkomst → geef die uitkomst terug. Stel
   geen vragen meer die de uitkomst niet meer veranderen.
5. Blijven er meerdere regels over met **verschillende** uitkomsten → bepaal welk onbeantwoord
   gegeven de kandidaten het sterkst splitst en stel díe vraag.
6. Kan een gegeven niet beantwoord worden ("weet ik niet") en is het nodig → uitkomst 3.

Schrijf de engine zo dat hij ook headless aanroepbaar is: `bepaal(antwoorden)` geeft
`{type: 'vraag', ...}` of `{type: 'uitkomst', ...}`. Dat maakt de tests in §12 mogelijk.

**Bij twijfel altijd uitkomst 3.** Nooit een uitkomst gokken, nooit twee regels combineren tot
een nieuwe conclusie, nooit een analogie maken.

---

## 8. Taal

B1. Schrijf de interfaceteksten zoals je tegen een 17-jarige praat die niet graag leest.

Vertaal de vaktaal uit de regeling overal:

| In de regeling | In de interface |
|---|---|
| generiek examenonderdeel | het gewone examen dat iedereen doet |
| keuzedeel | een extra vak dat je zelf kiest |
| 2F / 3F | taalniveau of rekenniveau, bijvoorbeeld "taalniveau 2F" |
| A2/B1, B1/B2 | het niveau van je Engels |
| CE / centraal examen | het landelijke examen |
| IE / instellingsexamen | het examen dat je school zelf maakt |
| kerntaak / werkproces | een groot onderdeel van je beroepsopleiding |
| bpv | je stage |
| mbo-verklaring | een papier dat je krijgt als je een opleiding niet hebt afgemaakt, maar wel een paar onderdelen hebt gehaald |
| examencommissie | de mensen op school die hierover beslissen |
| Eduarte | het systeem van school waarin je de aanvraag doet |
| slb'er | je studieloopbaanbegeleider |

De woorden **instroom, doorstroom en afstroom** komen nergens in de interface voor.

---

## 9. Toegankelijkheid

Streef naar WCAG 2.1 AA.

- Volledig met het toetsenbord te bedienen; zichtbare focusring in `#6e6eb4`.
- Semantische HTML: `<button>` voor knoppen, `<fieldset>`/`<legend>` voor een vraag met opties.
- Bij een nieuwe vraag: focus naar de vraagkop, en meld de wissel via een `aria-live`-regio.
- Contrast minimaal 4,5:1. Let op: geel `#eead29` en lichtblauw `#98d3eb` zijn te licht voor
  tekst op wit — gebruik die alleen als vlak met donkerpaarse tekst erop.
- Kleur nooit als enige betekenisdrager; zet er een woord of icoon bij.
- Werkt zonder JavaScript niet — toon dan een `<noscript>`-melding met het advies contact op te
  nemen met de slb'er.

---

## 10. Deploy naar faistos.nl/vrijstelling

De site draait in de **submap `/vrijstelling`**, niet op de root. Dat heeft één belangrijk
gevolg: **gebruik overal relatieve paden.** Geen `/css/stijl.css` maar `css/stijl.css`, geen
`/assets/logo.svg` maar `assets/logo.svg`. Een absoluut pad zoekt op de root van faistos.nl en
levert een 404 op. Controleer dit expliciet: `grep -rn 'src="/\|href="/' index.html css js`
mag niets opleveren.

Maak `deploy.sh` volgens de methode die je in §0.5 hebt vastgesteld:

- Server, gebruiker, poort en doelpad staan **niet hard in het script** maar in `.env`, dat in
  `.gitignore` staat. Zet een `.env.voorbeeld` in de repo met de sleutels en uitleg, zonder
  waarden.
- Sluit uit van de sync: `.git`, `.env`, `test/`, `README.md`, `BOUWOPDRACHT.md`, `deploy.sh`.
- Doe eerst een droogloop en vraag om bevestiging voor je echt synchroniseert. Bij `rsync` is
  dat `--dry-run`; bij een andere methode toon je de bestandslijst die je gaat overzetten.
- Gebruik `--delete` alleen binnen de map `/vrijstelling`, nooit een niveau hoger — er staat
  andere content op faistos.nl die je niet mag raken. Controleer het doelpad twee keer voor je
  een verwijderende sync draait.
- Zet nooit een wachtwoord, sleutel of pad in de repo. Log geen serveradres in commitberichten.

Draai na de eerste echte deploy de technische controle uit §12.2.

---

## 11. Wat je niet doet

- Geen LLM- of API-aanroep, in geen enkele vorm.
- Geen framework, geen npm-dependencies, geen build-stap.
- Geen analytics, geen trackers, geen externe fonts of CDN's.
- Geen invoerveld voor naam, studentnummer, e-mail of geboortedatum.
- Geen uploadknop.
- Geen regel verzinnen die niet in §6 staat. Ontbreekt er iets: uitkomst 3 en meld het aan Jan.
- Geen woorden uit de regeling onvertaald in de interface.

---

## 12. Testen

Er zijn twee soorten. **De functionele test doet Jan zelf** vanaf zijn desktop: hij loopt de
inhoudelijke gevallen na en beoordeelt of de uitkomsten kloppen met de regeling. **De
technische test doe jij**, volledig, voor je oplevert. Lever de uitkomst van §12.2 op als een
kort verslag.

### 12.1 Functionele testset (bouw je, Jan gebruikt hem)

Bouw `test/run.html`: een pagina die alle testgevallen door `bepaal()` haalt en per geval
geslaagd/gezakt toont, met een totaalscore bovenaan. Geen testframework nodig. Toon per gezakt
geval wat eruit kwam en wat verwacht werd, zodat Jan kan zien waar het misgaat.

Zet ook een knop "toon het gestelde vragenpad" per geval: welke vragen zou de tool gesteld
hebben? Dat maakt het voor Jan controleerbaar zonder de flow handmatig te doorlopen.

Neem minimaal deze gevallen op. Ze komen uit een testronde op de chatbotversie en dekken de
plekken waar het eerder misging.

| # | Situatie | Verwacht |
|---|---|---|
| 1 | Nederlands. Eerste mbo, niveau 3. Vmbo-diploma, Nederlands 2F, cijfer ≥ 6,5. | 1 |
| 2 | Nederlands. Eerste mbo, niveau 4. Vmbo-diploma, Nederlands 2F, cijfer ≥ 6,5. | 2 — niveau 4 vraagt 3F |
| 3 | Nederlands. Eerste mbo, niveau 3. Havo-diploma, Nederlands lager dan 6. | 2 |
| 4 | Nederlands. Was niveau 4, nu 3. Nederlands 3F afgerond, cijfer onbekend. | 1 — beide routes tonen, geen cijfervraag stellen |
| 5 | Nederlands. Vorige mbo niveau 2, nu 3. CE/IE 2F lager dan 6,5. | 2 |
| 6 | Engels. Eerste mbo, niveau 4. Vwo-diploma, Engels ≥ 6,0. | 1 |
| 7 | Engels. Vorige mbo niveau 3, nu niveau 3. Mbo-diploma, Engels ≥ 6,0. | 1 — via het vangnet |
| 8 | Engels. Vorige mbo niveau 2, nu 3. Mbo-diploma, Engels ≥ 6,0. | 1 — via het vangnet |
| 9 | Engels. Cambridge-certificaat van de havo. | 2 |
| 10 | Engels. Hbo-propedeuse, Engels een 8. | 2 |
| 11 | Engels. Eerste mbo, niveau 2. Havo-certificaat, Engels ≥ 6,0. | 1 |
| 12 | Rekenen. Eerste mbo, niveau 4. Rekentoets havo 3F ≥ 5,5. | 1 |
| 13 | Rekenen. Eerste mbo, niveau 3. Vmbo rekenen 2F. | 2 |
| 14 | Rekenen. Wiskunde B havo. | 2 |
| 15 | Rekenen. Niveau 3. Rekenen 3F, cijfer tussen 4 en 5,5. | 3 — slaag-/zakvoorwaarde noemen |
| 16 | Rekenen. Vorige mbo niveau 3, nu 4. Rekenen 3F ≥ 5,5. | 1 |
| 17 | Rekenen. Eerste mbo, niveau 3. Vmbo-diploma met rekenen 3F ≥ 5,5. | 1 |
| 18 | Burgerschap. | 2 — geen Eduarte in de uitkomsttekst |
| 19 | LOB, kan het programma met de groep volgen. | 2 — geen Eduarte |
| 20 | LOB, kan dat niet. | 3 — geen Eduarte |
| 21 | Stage, geen langdurige werkervaring. | 2 — geen Eduarte |
| 22 | Stage, wel langdurige werkervaring. | 3 — geen Eduarte |
| 23 | Beroepsgericht. Kerntaakcertificaat van een andere opleiding, voldoende. | 3 |
| 24 | Keuzedeel. Precies hetzelfde keuzedeel eerder behaald, voldoende. | 1 |
| 25 | Keuzedeel. Remediërend keuzedeel. | 2 |
| 26 | Keuzedeel. Afgesloten met een onvoldoende, cohort 2023. | 3 |
| 27 | Keuzedeel. Lijkend maar ander keuzedeel, voldoende. | 3 |
| 28 | Mbo-diploma van 12 jaar oud, ruim voldoende. | 2 — 10-jaarregel |
| 29 | Buitenlands diploma (Pools). | 3 |
| 30 | Certificaat particuliere avondcursus Engels. | 3 |
| 31 | "Weet ik niet" op een gegeven dat de gekozen regel nodig heeft. | 3 |
| 32 | "Weet ik niet" op het cijfer, terwijl de gekozen regel géén cijfer noemt (geval 4). | 1 — de vraag mag dan niet eens gesteld worden |

### 12.2 Technische test — dit doe jij, en je rapporteert het

Automatiseer wat je kunt. Waar je iets met het oog moet controleren, maak dan een screenshot en
zet die in het verslag.

**A. Statische controle van de broncode**

```bash
# Geen absolute paden (breken in de submap /vrijstelling)
grep -rn 'src="/\|href="/' index.html css js && echo "FOUT: absolute paden gevonden"

# Geen externe verzoeken: geen CDN, geen fonts van buiten, geen analytics
grep -rniE 'https?://|cdn\.|googleapis|gtag|analytics|fbq' index.html css js && echo "CONTROLEER deze treffers"

# Geen opslag in de browser
grep -rn 'localStorage\|sessionStorage\|document.cookie\|indexedDB' js && echo "FOUT: opslag gevonden"

# Geen LLM- of netwerkaanroep
grep -rn 'fetch(\|XMLHttpRequest\|WebSocket\|api\.' js && echo "CONTROLEER: mag alleen ontbreken"
```

Alle vier moeten leeg zijn, op bewuste uitzonderingen na die je in het verslag benoemt.

**B. Werkt het lokaal**

Draai een lokale server (`python3 -m http.server 8000`) en open de pagina — niet via `file://`,
want dat verbergt padfouten. Controleer:

- Nul fouten en nul waarschuwingen in de console.
- Het netwerk-tabblad toont **alleen verzoeken naar de eigen host**. Eén verzoek naar buiten is
  een fout, ook een font of een favicon.
- De pagina laadt volledig met JavaScript uitgeschakeld tot en met de `<noscript>`-melding.
- HTML valideert (bijvoorbeeld met `npx html-validate` of de W3C-validator; installeer niets
  permanent).

**C. Simuleer de flow zonder mens**

Als er een headless browser beschikbaar is (Playwright of Puppeteer, kijk of chromium al op de
machine staat), schrijf dan een kort script dat:

- tien willekeurige paden door de tool klikt en per pad vastlegt welke vragen zijn gesteld;
- controleert dat **geen enkel gegeven twee keer** wordt gevraagd — dit is de belangrijkste
  technische controle, want dit is precies waar de vorige aanpak op stukliep;
- controleert dat elk pad binnen redelijke tijd bij een uitkomst eindigt en nergens vastloopt;
- halverwege een eerder antwoord wijzigt en verifieert dat alleen de nog relevante vragen
  terugkomen en er geen verouderde antwoorden blijven hangen;
- bij een ongeldig bewijsstuk (testgeval 30) verifieert dat er daarna niet nog naar niveau,
  cijfer of leeftijd wordt gevraagd.

Is er geen headless browser beschikbaar, doe deze vijf punten dan met de hand en leg per punt
vast wat je zag. Meld het als je hem niet kunt installeren; ga niet zelf pakketten globaal
installeren zonder overleg.

**D. Toegankelijkheid**

- Doorloop de hele flow met alleen het toetsenbord: Tab, Enter, Escape. Elke stap moet
  bereikbaar zijn en de focusring zichtbaar.
- Draai een axe-scan (`npx @axe-core/cli http://localhost:8000`) of gebruik Lighthouse in
  Chrome. Streef naar nul overtredingen op niveau A en AA; rapporteer wat je niet oplost.
- Controleer het contrast van elke tekst-op-vlak-combinatie. Geel `#eead29` en lichtblauw
  `#98d3eb` mogen nooit tekstkleur op wit zijn.

**E. Responsief**

Controleer op minimaal 360×640 (kleine telefoon), 768 (tablet) en 1280 (desktop). Op de
telefoon: geen horizontaal scrollen, knoppen minimaal 44×44 px, tekst leesbaar zonder zoomen.

**F. Na de deploy**

```bash
curl -sSI https://faistos.nl/vrijstelling/ | head -n 1        # verwacht 200
curl -sSI https://faistos.nl/vrijstelling/css/stijl.css | head -n 1
curl -sSI https://faistos.nl/vrijstelling/assets/logodonker.svg | head -n 1
```

Open daarna de live URL in de browser en controleer: geldig https-slot, logo en fonts laden,
console leeg, netwerk-tabblad toont geen externe host, en de flow werkt op een telefoon.
Controleer ook dat de rest van faistos.nl nog werkt — je hebt in een submap gesynchroniseerd,
maar verifieer dat er niets buiten `/vrijstelling` is veranderd.

---

## 13. Opleveren

Lever op:

1. De repo met werkende code, tests en README.
2. De site live op faistos.nl.
3. Een korte notitie voor Jan met: hoe hij `regels.js` bijwerkt als de regeling verandert, welke
   punten uit de regeling onduidelijk zijn (zie de 2F-notitie in §6.4), en wat je bent
   tegengekomen dat aandacht van het examenbureau verdient.

Twijfel je over een regel, verzin dan niets: leg de vraag voor aan Jan. Bij deze tool is een
eerlijke "dit kan ik niet nakijken" altijd beter dan een fout antwoord.

---

## Bijlage A — logo-bestanden

Sla deze twee bestanden op in `assets/`. Neem ze letterlijk over, inclusief de eerste regel.

### A.1 `assets/logowit_transp.svg` — witte variant, transparante achtergrond

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="195" height="142.5" viewBox="0 0 130 95" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
    <g transform="matrix(1.02287,0,0,1.02287,-5.30805e-08,-1.02287)">
        <path d="M106.634,45.954C96.686,47.526 91.462,44.41 90.159,36.181L87.248,17.772C85.939,9.485 89.946,4.907 99.894,3.335L114.339,1.052C115.818,0.818 116.572,1.367 116.806,2.846L117.939,10.008C118.172,11.487 117.624,12.241 116.144,12.475L104.244,14.355C101.756,14.746 100.782,15.872 101.099,17.886L103.326,31.974C103.634,33.927 104.901,34.638 107.388,34.244L119.287,32.364C120.768,32.131 121.52,32.679 121.756,34.158L122.871,41.202C123.104,42.681 122.556,43.436 121.076,43.669L106.634,45.954Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M15.976,35.288L20.416,34.586C22.489,34.258 22.834,32.991 22.582,31.392L22.265,29.379C22.011,27.782 21.291,26.681 19.22,27.009L14.78,27.712L15.976,35.288ZM8.586,61.454C7.106,61.687 6.352,61.139 6.116,59.66L0.052,21.301C-0.182,19.822 0.367,19.068 1.846,18.835L21.56,15.718C30.441,14.314 33.86,17.899 34.786,23.759L35.217,26.482C35.74,29.798 35.287,32.296 32.967,33.755C37.364,33.546 40.701,36.233 41.487,41.205L43.472,53.753C43.705,55.232 43.157,55.986 41.678,56.219L32.5,57.669C31.021,57.903 30.267,57.354 30.033,55.875L28.601,46.82C28.321,45.044 27.607,44.369 25.949,44.632L17.659,45.941L19.494,57.542C19.728,59.021 19.179,59.776 17.7,60.009L8.586,61.454Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M87.432,57.092C87.534,57.735 87.09,58.347 86.446,58.448L53.028,63.731C52.385,63.832 51.773,63.389 51.671,62.745L50.289,54.009C50.187,53.366 50.631,52.754 51.275,52.652L84.693,47.37C85.336,47.268 85.946,47.712 86.047,48.355L87.432,57.092Z" style="fill:rgb(110,110,180);fill-rule:nonzero;"/>
        <path d="M63.961,32.153C60.23,32.742 56.727,30.196 56.138,26.466C55.549,22.735 58.096,19.233 61.825,18.645C65.556,18.056 69.059,20.602 69.647,24.332C70.239,28.063 67.692,31.564 63.961,32.153ZM59.664,4.977C48.381,6.76 40.683,17.349 42.466,28.629C44.249,39.909 54.84,47.606 66.122,45.823C77.405,44.04 85.103,33.451 83.32,22.171C81.537,10.891 70.946,3.192 59.664,4.977Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M11.54,92.766L8.86,75.844L10.335,75.611L24.342,88.46L23.568,88.583L21.239,73.885L23.003,73.606L25.683,90.528L24.209,90.762L10.228,77.905L11.003,77.783L13.332,92.481L11.54,92.766Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M29.252,74.075C28.896,74.132 28.579,74.057 28.3,73.855C28.019,73.652 27.854,73.38 27.799,73.042C27.745,72.705 27.822,72.399 28.026,72.127C28.23,71.855 28.511,71.692 28.864,71.636C29.22,71.579 29.535,71.645 29.814,71.833C30.09,72.021 30.258,72.283 30.31,72.621C30.366,72.977 30.296,73.291 30.101,73.57C29.906,73.849 29.623,74.016 29.252,74.075ZM30.835,89.711L28.824,77.017L30.541,76.746L32.553,89.439L30.835,89.711Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M36.216,93.79C35.699,93.872 35.194,93.881 34.696,93.82C34.2,93.758 33.767,93.616 33.4,93.391L33.799,91.992C34.383,92.345 35.079,92.458 35.885,92.331C36.562,92.225 37.05,91.94 37.349,91.48C37.648,91.02 37.734,90.395 37.609,89.604L35.45,75.969L37.167,75.697L39.326,89.333C39.512,90.508 39.342,91.498 38.817,92.3C38.293,93.102 37.426,93.598 36.216,93.79ZM35.876,73.026C35.52,73.083 35.203,73.008 34.925,72.807C34.644,72.603 34.478,72.331 34.424,71.993C34.369,71.656 34.446,71.35 34.65,71.078C34.854,70.807 35.135,70.641 35.491,70.587C35.844,70.53 36.161,70.596 36.44,70.784C36.717,70.972 36.882,71.235 36.936,71.572C36.993,71.928 36.923,72.243 36.728,72.521C36.531,72.8 36.248,72.967 35.876,73.026Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M57.797,72.306C58.828,72.143 59.759,72.197 60.586,72.471C61.415,72.745 62.106,73.251 62.661,73.989C63.216,74.727 63.59,75.708 63.784,76.934L64.953,84.306L63.236,84.578L62.094,77.373C61.884,76.034 61.403,75.074 60.658,74.49C59.913,73.905 58.959,73.704 57.799,73.889C56.929,74.028 56.204,74.329 55.624,74.791C55.044,75.253 54.636,75.855 54.399,76.596C54.161,77.337 54.118,78.188 54.272,79.156L55.33,85.828L53.612,86.1L52.471,78.895C52.26,77.556 51.775,76.596 51.023,76.014C50.269,75.432 49.313,75.233 48.153,75.416C47.298,75.552 46.578,75.851 45.989,76.315C45.402,76.78 44.99,77.382 44.75,78.123C44.512,78.863 44.469,79.715 44.623,80.682L45.681,87.355L43.964,87.627L41.952,74.934L43.597,74.673L44.14,78.107L43.778,77.545C44.02,76.564 44.53,75.747 45.309,75.085C46.089,74.426 47.067,74.003 48.243,73.815C49.485,73.618 50.588,73.762 51.558,74.243C52.527,74.725 53.239,75.568 53.692,76.766L52.974,76.607C53.182,75.518 53.705,74.58 54.548,73.794C55.393,73.013 56.476,72.517 57.797,72.306Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M75.03,82.836C73.71,83.045 72.504,82.952 71.417,82.553C70.329,82.155 69.426,81.513 68.707,80.628C67.989,79.742 67.529,78.671 67.33,77.414C67.131,76.157 67.224,75.001 67.611,73.948C67.998,72.895 68.619,72.016 69.473,71.312C70.327,70.607 71.344,70.161 72.52,69.975C73.714,69.787 74.815,69.889 75.828,70.281C76.84,70.675 77.69,71.316 78.376,72.206C79.063,73.097 79.507,74.179 79.709,75.452C79.722,75.534 79.731,75.618 79.736,75.708C79.743,75.799 79.752,75.892 79.768,75.989L68.716,77.738L68.513,76.456L78.644,74.852L78.048,75.468C77.903,74.548 77.577,73.763 77.067,73.108C76.557,72.453 75.934,71.978 75.193,71.683C74.453,71.389 73.639,71.309 72.751,71.45C71.881,71.588 71.131,71.914 70.502,72.426C69.872,72.938 69.421,73.588 69.149,74.376C68.877,75.162 68.814,76.023 68.963,76.959L69.006,77.224C69.16,78.191 69.507,79.008 70.051,79.672C70.595,80.338 71.281,80.816 72.112,81.106C72.944,81.396 73.85,81.461 74.833,81.307C75.608,81.185 76.306,80.934 76.931,80.553C77.556,80.173 78.066,79.663 78.46,79.022L79.604,79.98C79.147,80.746 78.524,81.375 77.733,81.862C76.949,82.349 76.048,82.676 75.03,82.836Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M89.251,79.964C88.041,80.154 86.913,80.066 85.862,79.695C84.81,79.323 83.934,78.716 83.229,77.869C82.525,77.022 82.078,75.994 81.886,74.786C81.693,73.577 81.802,72.467 82.212,71.452C82.622,70.437 83.27,69.595 84.153,68.927C85.039,68.258 86.086,67.828 87.296,67.635C88.424,67.457 89.477,67.529 90.454,67.853C91.43,68.177 92.257,68.757 92.934,69.59C93.612,70.426 94.056,71.502 94.264,72.825C94.473,74.145 94.384,75.31 93.999,76.311C93.612,77.314 93.007,78.127 92.18,78.755C91.355,79.384 90.379,79.785 89.251,79.964ZM89.178,78.415C90.114,78.268 90.911,77.939 91.575,77.427C92.239,76.918 92.724,76.279 93.032,75.511C93.34,74.743 93.421,73.901 93.277,72.981C93.132,72.061 92.794,71.289 92.264,70.662C91.734,70.036 91.077,69.581 90.288,69.303C89.5,69.022 88.639,68.956 87.703,69.106C86.784,69.25 85.991,69.579 85.32,70.091C84.65,70.603 84.162,71.237 83.861,71.993C83.56,72.752 83.483,73.59 83.628,74.51C83.773,75.43 84.108,76.206 84.629,76.843C85.15,77.479 85.81,77.937 86.607,78.216C87.402,78.494 88.259,78.56 89.178,78.415ZM90.404,85.21C89.244,85.394 88.104,85.4 86.988,85.23C85.871,85.061 84.93,84.714 84.172,84.189L84.835,82.746C85.515,83.183 86.319,83.491 87.248,83.665C88.177,83.84 89.133,83.851 90.116,83.695C91.729,83.439 92.853,82.877 93.492,82.007C94.131,81.138 94.325,79.912 94.074,78.333L93.571,75.167L93.469,72.954L92.955,70.804L92.345,66.961L93.99,66.7L95.755,77.844C96.102,80.037 95.821,81.729 94.912,82.922C94.001,84.116 92.499,84.877 90.404,85.21Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M106.199,77.901C104.878,78.109 103.673,78.016 102.585,77.618C101.498,77.221 100.594,76.578 99.876,75.692C99.158,74.807 98.698,73.735 98.499,72.478C98.299,71.221 98.392,70.066 98.779,69.013C99.167,67.959 99.788,67.081 100.642,66.376C101.496,65.672 102.513,65.225 103.689,65.04C104.883,64.849 105.984,64.954 106.996,65.346C108.009,65.74 108.859,66.381 109.545,67.271C110.231,68.161 110.676,69.244 110.877,70.517C110.891,70.598 110.9,70.682 110.904,70.773C110.911,70.863 110.92,70.956 110.936,71.051L99.887,72.8L99.683,71.518L109.815,69.914L109.219,70.53C109.074,69.611 108.745,68.825 108.238,68.17C107.728,67.515 107.105,67.04 106.364,66.743C105.623,66.449 104.81,66.369 103.922,66.51C103.052,66.648 102.302,66.974 101.672,67.486C101.043,67.998 100.592,68.648 100.32,69.436C100.048,70.222 99.985,71.083 100.134,72.018L100.177,72.283C100.331,73.251 100.678,74.068 101.222,74.732C101.765,75.398 102.452,75.876 103.283,76.166C104.115,76.456 105.021,76.521 106.004,76.367C106.779,76.245 107.477,75.994 108.102,75.613C108.727,75.233 109.237,74.723 109.631,74.082L110.775,75.04C110.318,75.806 109.695,76.433 108.904,76.922C108.118,77.414 107.214,77.74 106.199,77.901Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M119.842,62.482C120.872,62.319 121.81,62.374 122.655,62.643C123.5,62.915 124.207,63.418 124.778,64.154C125.349,64.89 125.732,65.871 125.924,67.094L127.093,74.467L125.376,74.739L124.234,67.534C124.021,66.195 123.528,65.237 122.75,64.659C121.973,64.082 120.981,63.887 119.771,64.077C118.867,64.22 118.111,64.525 117.499,64.994C116.887,65.463 116.455,66.068 116.201,66.811C115.947,67.554 115.895,68.408 116.049,69.375L117.107,76.048L115.39,76.32L113.378,63.626L115.023,63.366L115.573,66.847L115.204,66.236C115.46,65.255 115.993,64.43 116.795,63.767C117.603,63.105 118.618,62.675 119.842,62.482Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
    </g>
</svg>
```

### A.2 `assets/logodonker.svg` — donkerpaarse achtergrond ingebakken

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="195" height="142.5" viewBox="0 0 130 95" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
    <rect width="130" height="95" fill="#3f2e56" />
    
    <g transform="matrix(1.02287,0,0,1.02287,-5.30805e-08,-1.02287)">
        <path d="M106.634,45.954C96.686,47.526 91.462,44.41 90.159,36.181L87.248,17.772C85.939,9.485 89.946,4.907 99.894,3.335L114.339,1.052C115.818,0.818 116.572,1.367 116.806,2.846L117.939,10.008C118.172,11.487 117.624,12.241 116.144,12.475L104.244,14.355C101.756,14.746 100.782,15.872 101.099,17.886L103.326,31.974C103.634,33.927 104.901,34.638 107.388,34.244L119.287,32.364C120.768,32.131 121.52,32.679 121.756,34.158L122.871,41.202C123.104,42.681 122.556,43.436 121.076,43.669L106.634,45.954Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M15.976,35.288L20.416,34.586C22.489,34.258 22.834,32.991 22.582,31.392L22.265,29.379C22.011,27.782 21.291,26.681 19.22,27.009L14.78,27.712L15.976,35.288ZM8.586,61.454C7.106,61.687 6.352,61.139 6.116,59.66L0.052,21.301C-0.182,19.822 0.367,19.068 1.846,18.835L21.56,15.718C30.441,14.314 33.86,17.899 34.786,23.759L35.217,26.482C35.74,29.798 35.287,32.296 32.967,33.755C37.364,33.546 40.701,36.233 41.487,41.205L43.472,53.753C43.705,55.232 43.157,55.986 41.678,56.219L32.5,57.669C31.021,57.903 30.267,57.354 30.033,55.875L28.601,46.82C28.321,45.044 27.607,44.369 25.949,44.632L17.659,45.941L19.494,57.542C19.728,59.021 19.179,59.776 17.7,60.009L8.586,61.454Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M87.432,57.092C87.534,57.735 87.09,58.347 86.446,58.448L53.028,63.731C52.385,63.832 51.773,63.389 51.671,62.745L50.289,54.009C50.187,53.366 50.631,52.754 51.275,52.652L84.693,47.37C85.336,47.268 85.946,47.712 86.047,48.355L87.432,57.092Z" style="fill:rgb(110,110,180);fill-rule:nonzero;"/>
        <path d="M63.961,32.153C60.23,32.742 56.727,30.196 56.138,26.466C55.549,22.735 58.096,19.233 61.825,18.645C65.556,18.056 69.059,20.602 69.647,24.332C70.239,28.063 67.692,31.564 63.961,32.153ZM59.664,4.977C48.381,6.76 40.683,17.349 42.466,28.629C44.249,39.909 54.84,47.606 66.122,45.823C77.405,44.04 85.103,33.451 83.32,22.171C81.537,10.891 70.946,3.192 59.664,4.977Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M11.54,92.766L8.86,75.844L10.335,75.611L24.342,88.46L23.568,88.583L21.239,73.885L23.003,73.606L25.683,90.528L24.209,90.762L10.228,77.905L11.003,77.783L13.332,92.481L11.54,92.766Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M29.252,74.075C28.896,74.132 28.579,74.057 28.3,73.855C28.019,73.652 27.854,73.38 27.799,73.042C27.745,72.705 27.822,72.399 28.026,72.127C28.23,71.855 28.511,71.692 28.864,71.636C29.22,71.579 29.535,71.645 29.814,71.833C30.09,72.021 30.258,72.283 30.31,72.621C30.366,72.977 30.296,73.291 30.101,73.57C29.906,73.849 29.623,74.016 29.252,74.075ZM30.835,89.711L28.824,77.017L30.541,76.746L32.553,89.439L30.835,89.711Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M36.216,93.79C35.699,93.872 35.194,93.881 34.696,93.82C34.2,93.758 33.767,93.616 33.4,93.391L33.799,91.992C34.383,92.345 35.079,92.458 35.885,92.331C36.562,92.225 37.05,91.94 37.349,91.48C37.648,91.02 37.734,90.395 37.609,89.604L35.45,75.969L37.167,75.697L39.326,89.333C39.512,90.508 39.342,91.498 38.817,92.3C38.293,93.102 37.426,93.598 36.216,93.79ZM35.876,73.026C35.52,73.083 35.203,73.008 34.925,72.807C34.644,72.603 34.478,72.331 34.424,71.993C34.369,71.656 34.446,71.35 34.65,71.078C34.854,70.807 35.135,70.641 35.491,70.587C35.844,70.53 36.161,70.596 36.44,70.784C36.717,70.972 36.882,71.235 36.936,71.572C36.993,71.928 36.923,72.243 36.728,72.521C36.531,72.8 36.248,72.967 35.876,73.026Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M57.797,72.306C58.828,72.143 59.759,72.197 60.586,72.471C61.415,72.745 62.106,73.251 62.661,73.989C63.216,74.727 63.59,75.708 63.784,76.934L64.953,84.306L63.236,84.578L62.094,77.373C61.884,76.034 61.403,75.074 60.658,74.49C59.913,73.905 58.959,73.704 57.799,73.889C56.929,74.028 56.204,74.329 55.624,74.791C55.044,75.253 54.636,75.855 54.399,76.596C54.161,77.337 54.118,78.188 54.272,79.156L55.33,85.828L53.612,86.1L52.471,78.895C52.26,77.556 51.775,76.596 51.023,76.014C50.269,75.432 49.313,75.233 48.153,75.416C47.298,75.552 46.578,75.851 45.989,76.315C45.402,76.78 44.99,77.382 44.75,78.123C44.512,78.863 44.469,79.715 44.623,80.682L45.681,87.355L43.964,87.627L41.952,74.934L43.597,74.673L44.14,78.107L43.778,77.545C44.02,76.564 44.53,75.747 45.309,75.085C46.089,74.426 47.067,74.003 48.243,73.815C49.485,73.618 50.588,73.762 51.558,74.243C52.527,74.725 53.239,75.568 53.692,76.766L52.974,76.607C53.182,75.518 53.705,74.58 54.548,73.794C55.393,73.013 56.476,72.517 57.797,72.306Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M75.03,82.836C73.71,83.045 72.504,82.952 71.417,82.553C70.329,82.155 69.426,81.513 68.707,80.628C67.989,79.742 67.529,78.671 67.33,77.414C67.131,76.157 67.224,75.001 67.611,73.948C67.998,72.895 68.619,72.016 69.473,71.312C70.327,70.607 71.344,70.161 72.52,69.975C73.714,69.787 74.815,69.889 75.828,70.281C76.84,70.675 77.69,71.316 78.376,72.206C79.063,73.097 79.507,74.179 79.709,75.452C79.722,75.534 79.731,75.618 79.736,75.708C79.743,75.799 79.752,75.892 79.768,75.989L68.716,77.738L68.513,76.456L78.644,74.852L78.048,75.468C77.903,74.548 77.577,73.763 77.067,73.108C76.557,72.453 75.934,71.978 75.193,71.683C74.453,71.389 73.639,71.309 72.751,71.45C71.881,71.588 71.131,71.914 70.502,72.426C69.872,72.938 69.421,73.588 69.149,74.376C68.877,75.162 68.814,76.023 68.963,76.959L69.006,77.224C69.16,78.191 69.507,79.008 70.051,79.672C70.595,80.338 71.281,80.816 72.112,81.106C72.944,81.396 73.85,81.461 74.833,81.307C75.608,81.185 76.306,80.934 76.931,80.553C77.556,80.173 78.066,79.663 78.46,79.022L79.604,79.98C79.147,80.746 78.524,81.375 77.733,81.862C76.949,82.349 76.048,82.676 75.03,82.836Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M89.251,79.964C88.041,80.154 86.913,80.066 85.862,79.695C84.81,79.323 83.934,78.716 83.229,77.869C82.525,77.022 82.078,75.994 81.886,74.786C81.693,73.577 81.802,72.467 82.212,71.452C82.622,70.437 83.27,69.595 84.153,68.927C85.039,68.258 86.086,67.828 87.296,67.635C88.424,67.457 89.477,67.529 90.454,67.853C91.43,68.177 92.257,68.757 92.934,69.59C93.612,70.426 94.056,71.502 94.264,72.825C94.473,74.145 94.384,75.31 93.999,76.311C93.612,77.314 93.007,78.127 92.18,78.755C91.355,79.384 90.379,79.785 89.251,79.964ZM89.178,78.415C90.114,78.268 90.911,77.939 91.575,77.427C92.239,76.918 92.724,76.279 93.032,75.511C93.34,74.743 93.421,73.901 93.277,72.981C93.132,72.061 92.794,71.289 92.264,70.662C91.734,70.036 91.077,69.581 90.288,69.303C89.5,69.022 88.639,68.956 87.703,69.106C86.784,69.25 85.991,69.579 85.32,70.091C84.65,70.603 84.162,71.237 83.861,71.993C83.56,72.752 83.483,73.59 83.628,74.51C83.773,75.43 84.108,76.206 84.629,76.843C85.15,77.479 85.81,77.937 86.607,78.216C87.402,78.494 88.259,78.56 89.178,78.415ZM90.404,85.21C89.244,85.394 88.104,85.4 86.988,85.23C85.871,85.061 84.93,84.714 84.172,84.189L84.835,82.746C85.515,83.183 86.319,83.491 87.248,83.665C88.177,83.84 89.133,83.851 90.116,83.695C91.729,83.439 92.853,82.877 93.492,82.007C94.131,81.138 94.325,79.912 94.074,78.333L93.571,75.167L93.469,72.954L92.955,70.804L92.345,66.961L93.99,66.7L95.755,77.844C96.102,80.037 95.821,81.729 94.912,82.922C94.001,84.116 92.499,84.877 90.404,85.21Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M106.199,77.901C104.878,78.109 103.673,78.016 102.585,77.618C101.498,77.221 100.594,76.578 99.876,75.692C99.158,74.807 98.698,73.735 98.499,72.478C98.299,71.221 98.392,70.066 98.779,69.013C99.167,67.959 99.788,67.081 100.642,66.376C101.496,65.672 102.513,65.225 103.689,65.04C104.883,64.849 105.984,64.954 106.996,65.346C108.009,65.74 108.859,66.381 109.545,67.271C110.231,68.161 110.676,69.244 110.877,70.517C110.891,70.598 110.9,70.682 110.904,70.773C110.911,70.863 110.92,70.956 110.936,71.051L99.887,72.8L99.683,71.518L109.815,69.914L109.219,70.53C109.074,69.611 108.745,68.825 108.238,68.17C107.728,67.515 107.105,67.04 106.364,66.743C105.623,66.449 104.81,66.369 103.922,66.51C103.052,66.648 102.302,66.974 101.672,67.486C101.043,67.998 100.592,68.648 100.32,69.436C100.048,70.222 99.985,71.083 100.134,72.018L100.177,72.283C100.331,73.251 100.678,74.068 101.222,74.732C101.765,75.398 102.452,75.876 103.283,76.166C104.115,76.456 105.021,76.521 106.004,76.367C106.779,76.245 107.477,75.994 108.102,75.613C108.727,75.233 109.237,74.723 109.631,74.082L110.775,75.04C110.318,75.806 109.695,76.433 108.904,76.922C108.118,77.414 107.214,77.74 106.199,77.901Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
        <path d="M119.842,62.482C120.872,62.319 121.81,62.374 122.655,62.643C123.5,62.915 124.207,63.418 124.778,64.154C125.349,64.89 125.732,65.871 125.924,67.094L127.093,74.467L125.376,74.739L124.234,67.534C124.021,66.195 123.528,65.237 122.75,64.659C121.973,64.082 120.981,63.887 119.771,64.077C118.867,64.22 118.111,64.525 117.499,64.994C116.887,65.463 116.455,66.068 116.201,66.811C115.947,67.554 115.895,68.408 116.049,69.375L117.107,76.048L115.39,76.32L113.378,63.626L115.023,63.366L115.573,66.847L115.204,66.236C115.46,65.255 115.993,64.43 116.795,63.767C117.603,63.105 118.618,62.675 119.842,62.482Z" style="fill:#FFFFFF;fill-rule:nonzero;"/>
    </g>
</svg>
```
