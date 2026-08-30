# Vervolgopdracht 01 — Vrijstellingen-checker

**Voor:** Claude Code
**Betreft:** https://www.faistos.nl/vrijstelling/
**Aanleiding:** functionele test op de live site, plus bevindingen van Jan.

De basis staat. Hieronder eerst wat goed werkt, dan 15 punten om te verbeteren, gesorteerd op
zwaarte. Werk ze in deze volgorde af.

---

## Wat al goed werkt — niet stukmaken

Ik heb de engine uitputtend doorlopen: **alle 1127 mogelijke paden**, door `bepaal()` te
voeden met elke combinatie van antwoorden.

- **0 dubbele vragen** over alle 1127 paden. Dit was hét probleem van de chatbotversie en het
  is nu aantoonbaar opgelost. Bewaak dit: elke wijziging hieronder moet deze eigenschap
  behouden.
- **0 doodlopende paden**, geen enkele fout of ontbrekende uitkomst.
- Maximaal 8 vragen per pad, minimaal 1.
- Alle paden eindigen in een uitkomst: 139× "ja", 636× "nee", 352× "onbekend".
- Alle bestandspaden zijn relatief, dus de submap werkt goed.
- "Wat je al hebt ingevuld" met wijzig-knoppen werkt, Terug werkt.

Handig testgereedschap dat ik gebruikte en dat je kunt overnemen in `test/`:

```js
function alleParen(max){
  const paden=[], dubbel=[];
  (function go(a,g){
    if(paden.length>=max) return;
    const r = bepaal(a);
    if(!r) return;
    if(r.type==='uitkomst'){ paden.push({a:{...a}, g:[...g], u:r}); return; }
    if(g.includes(r.veld)){ dubbel.push({veld:r.veld, a:{...a}}); return; }  // mag nooit
    for(const o of r.opties) go({...a,[r.veld]:o.waarde},[...g,r.veld]);
  })({},[]);
  return {paden, dubbel};
}
```

Zet dit als vaste regressietest in `test/run.html`: **`dubbel.length` moet altijd 0 zijn.**

---

## A. Inhoudelijke fouten — eerst dit

### A1. Ontbrekende route: Engels 4 → 2

Er is **geen enkel pad** voor een student die van niveau 4 naar niveau 2 gaat en Engels wil
laten checken (0 van de 1127 paden). Alleen `en-hg-43-ja` en `en-hg-43-nee` bestaan, allebei
voor huidigNiveau 3.

Voeg de regels voor **4 → 2** toe, met dezelfde voorwaarden als 4 → 3:

> K0802, bij gemiddeld resultaat B1/A2 ≥ 5,5 óf gemiddeld B1/B1 ≥ 5,5.

### A2. Keuzedeel met onvoldoende, cohort vóór 2020, moet conclusie 3 zijn

De regel `kd-zelfde-onvoldoende-voor-2020` geeft nu uitkomst **`nee`**. Dat is onjuist: voor
cohorten 2016-2019 was vrijstelling voor een keuzedeel dat met een onvoldoende is afgesloten
juist wél mogelijk, omdat toen alleen de aanwezigheid van een examenresultaat telde.

De tool kan dit niet beslissen. Zet de uitkomst op **`onbekend`** (conclusie 3) en leg in de
uitleg uit waarom:

> "Voor opleidingen die vóór 2020 zijn gestart golden andere regels voor een extra vak dat je
> met een onvoldoende hebt afgesloten. Of dat voor jou geldt, kan ik hier niet nakijken. Je
> slb'er kan dat uitzoeken."

### A3. Rekenen bij afstroom 3 → 2 met een keuzedeel rekenen 3F

*Ook bevestigd door de opdrachtgever. Let op: dit wordt géén "ja", maar conclusie 3.*

Bij `vorigNiveau 3 → huidigNiveau 2` worden alleen deze bewijsstukken aangeboden: `re-vmbo-2f`,
`re-2f-of-niveau2`, `re-2f-of-niveau3`. Een student die rekenen op **3F** heeft gehaald, kan
dat op dit pad dus nergens invullen.

Dat de regeling hier niets over zegt is opzettelijk: een student op mbo-niveau 3 krijgt normaal
gesproken 2F aangeboden, dus 3F hoort daar niet thuis. Maar er is een kleine kans dat hij het
**keuzedeel rekenen 3F** tóch heeft behaald. In dat geval moet hij wel degelijk een vrijstelling
aanvragen — en omdat deze situatie niet in de regeling staat, beslist het examenbureau.

Bouw daarom:

- Voeg op het pad 3 → 2 een bewijsstukoptie toe voor het **keuzedeel rekenen 3F**, in gewone
  taal, bijvoorbeeld: *"Ik heb het extra vak rekenen op 3F gehaald"*.
- Die optie leidt **altijd naar conclusie 3**, ongeacht het cijfer. Vraag er dus ook geen
  cijfer bij — dat verandert de uitkomst niet (zie ook B1 en regel 15 van de bouwopdracht).
- Uitleg in gewone taal:

> "Jij zit nu op niveau 2, en daar hoort normaal rekenen op 2F bij. Jij hebt het extra vak
> rekenen op 3F gehaald. Die situatie staat niet in de regeling. Vraag de vrijstelling wel
> gewoon aan: het examenbureau beslist hierover."

- Voeg **geen** `re-hg-32-tussen`-regel toe die een vrijstelling toekent. De speciale route met
  cijfer 4 blijft dus beperkt tot de situaties waar de regeling hem noemt: huidige opleiding
  mbo 2 of 3 in de eerste-route, 4 → 3 en 4 → 2.

### A4. Bij conclusie 3 wordt een concrete vrijstelling getoond

Op het uitkomstscherm van conclusie 3 staat nu een blok:

> **Vrijstelling voor**
> rekenen 2F generiek én keuzedeel rekenen 3F (alleen als aan de slaag-/zakregeling van het
> keuzedeel is voldaan)

Dat leest als een toegekende vrijstelling, terwijl de tool juist zegt dat ze het niet kan
nakijken. **Toon het blok "Vrijstelling voor" alleen bij conclusie 1.** Bij conclusie 3 mag je
hooguit in de lopende uitleg noemen waar het *om zou kunnen gaan*, in voorwaardelijke vorm:

> "Als dit lukt, zou het gaan om een vrijstelling voor het gewone rekenexamen en het extra vak
> rekenen. Je slb'er kan dat uitzoeken."

### A5. Onderdeelvrijstellingen presenteren als deelvrijstelling

Negen regels geven een vrijstelling voor slechts één examenonderdeel; ze heten intern netjes
`...-onderdeel-ja` en `vrijstellingVoor` eindigt op "(dat onderdeel)". Maar de conclusiezin is
dezelfde als bij een volledige vrijstelling, en "2F generiek Nederlands (dat onderdeel)" is voor
een student niet te begrijpen.

Maak in de uitleg en in de samenvatting expliciet dat het om **één onderdeel** gaat, in gewone
taal. Bijvoorbeeld:

> "Dit gaat alleen over het onderdeel dat je al hebt gehaald — bijvoorbeeld alleen schrijven,
> of alleen spreken. De rest van het examen Nederlands moet je nog wel doen."

Doe dit voor de acht Nederlands-regels en de Engels-regel `en-lg-44-ie-a2-deel-ja`.

---

## B. Overbodige en verkeerd gestelde vragen

### B1. Cijfer én "eerder onvoldoende" worden allebei gevraagd

**480 van de 1127 paden** vragen eerst een cijferbereik en daarna alsnog of het resultaat
onvoldoende was. Als de student net "6,5 of hoger" heeft gekozen, is die tweede vraag onzinnig.

Leid het antwoord af waar dat kan:

- Cijferbereik ligt op of boven de slaaggrens → `eerderOnvoldoende = false`, niet vragen.
- Cijferbereik ligt onder de 5,5 → `eerderOnvoldoende = true`, niet vragen.
- Alleen als de student "weet ik niet" koos op het cijfer, of als er helemaal geen cijfervraag
  is gesteld, mag je de vraag stellen.

### B2. De 10-jaarvraag laat de student rekenen

Nu: *"Is je bewijsstuk ouder dan 10 jaar (gerekend vanaf de start van je huidige opleiding)?"*
Dat zijn twee rekenstappen in één zin.

Vervang door een jaartal, en behandel "weet ik niet" als onbekend:

> **In welk jaar heb je dat diploma of certificaat gehaald?**
> A. In 2018 of later B. Vóór 2018 C. Weet ik niet

- 2018 of later → gaat door.
- Vóór 2018 → **conclusie 3**, met uitleg dat een bewijsstuk ouder dan 10 jaar meestal niet
  meer meetelt, maar dat het van de startdatum van de opleiding afhangt en de slb'er dat kan
  nakijken.
- Weet ik niet → conclusie 3.

Zet het jaartal 2018 als afgeleide constante in `regels.js` (huidig jaar min 10), niet hard in
de tekst, zodat het meebeweegt.

### B3. "Remediërend" staat als optie in de lijst

In de bewijsstuklijst staat *"Een remediërend extra vak (keuzedeel)"*. Studenten kennen dat
woord niet.

Vervang door een omschrijving van wat het is:

> "Een extra vak dat je deed om je niveau bij te spijkeren"

Zet het vakwoord er eventueel klein tussen haakjes achter, maar begin met de gewone taal.

---

## C. Teksten

### C1. Foute formulering bij conclusie 3

Nu: *"Neem je bewijsstuk mee en leg uit waarom je twijfelt over een vrijstelling."*

De student twijfelt niet over de vrijstelling, maar over de aanvraag. Vervang door:

> "Neem je bewijsstuk mee en vraag of het zin heeft om een vrijstelling aan te vragen."

Loop meteen alle andere "wat nu"-teksten na op dit soort verschuivingen.

### C2. Disclaimer herschrijven

De huidige tekst staat dubbel op het scherm (in de inhoud én in de footer) en zegt niet wat
Jan wil. Maak er één blok van, in B1-taal:

> **Let op**
> Je hoeft niet in te loggen. Deze pagina vraagt niets over jou en slaat niets op.
> Dit is een hulpmiddel, geen besluit. Je kunt er geen rechten aan ontlenen. De
> examencommissie beslist.

Toon dit op het startscherm en op het uitkomstscherm. Haal de dubbele footerregel weg, of laat
in de footer alleen de laatste zin staan.

### C3. Samenvatting tonen op het uitkomstscherm

Er is nu alleen een knop **Kopieer samenvatting**; je ziet niet wat je kopieert.

Toon de samenvatting zichtbaar op het uitkomstscherm, in een kader, precies zoals hij ook
gekopieerd wordt: het onderwerp, de gegeven antwoorden, de uitkomst en de vervolgstap. De knop
kopieert dan letterlijk wat er staat. Zet boven het kader een kopje als "Dit kopieer je".

---

## D. Weergave

### D1. Voortgang klopt niet op het eerste scherm

Het eerste vraagscherm zegt **"Vraag 1 van ongeveer 1"**, terwijl er nog 5 tot 8 volgen. Daarna
klopt de schatting wel ("Vraag 2 van ongeveer 5").

Bereken de schatting over de nog mogelijke paden, of toon op het eerste scherm geen aantal maar
alleen "Vraag 1". Beter een eerlijke ondergrens ("vraag 1 van ongeveer 6") dan een schatting die
direct achterhaald is.

### D2. Mobiel controleren

Dit kon ik vanaf mijn kant niet betrouwbaar testen: mijn browservenster is 2048px breed en ik
kan het niet verkleinen. Wat ik wel zag: er is **maar één media query**, op `max-width: 420px`,
en er staan drie vaste pixelbreedtes en één `min-width` in de CSS.

Controleer zelf met apparaatemulatie op 360×640, 390×844 en 768×1024:

- Geen horizontaal scrollen.
- De knoppen zijn nu 46px hoog — dat is goed, houd dat zo.
- Let op het gat tussen 421px en desktop: een tablet krijgt nu de desktoplayout. Overweeg een
  tweede breekpunt rond 768px.
- Controleer of de lange bewijsstuklijst met kopjes ("REKENEN 2F", "REKENNIVEAU", "ANDERS") op
  een klein scherm leesbaar blijft.

---

## E. Na afloop

1. Draai de volledige padtest opnieuw en bevestig: **0 dubbele vragen, 0 doodlopende paden**.
2. Controleer dat het aantal paden logisch is toegenomen (A1 en A3 voegen routes toe).
3. Werk `test/run.html` bij met de nieuwe gevallen: Engels 4→2, rekenen 3→2 met cijfer 4-5,5,
   keuzedeel onvoldoende vóór 2020, en een pad waar het cijferbereik de onvoldoende-vraag moet
   onderdrukken.
4. Deploy en controleer de live site opnieuw.
5. Meld aan Jan wat je hebt aangepast. A2 en A3 zijn al door hem beslist en hoeven niet meer
   te worden voorgelegd. Kom je onderweg een ánder geval tegen dat niet eenduidig in de
   regeling staat, bouw dan conclusie 3 en zet het op een lijstje voor het examenbureau.
