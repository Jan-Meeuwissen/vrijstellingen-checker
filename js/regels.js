/**
 * regels.js — de vertaling van de Vrijstellingsregeling 2026-2027 naar data.
 *
 * DIT BESTAND BEVAT GEEN LOGICA, ALLEEN DATA. Elke regel verwijst met `bron`
 * naar het artikel of de tabel in de regeling, zodat het examenbureau kan
 * controleren of de vertaling klopt zonder de code te lezen.
 *
 * Hoe lees je een regel? De engine (js/engine.js) filtert deze lijst op de
 * antwoorden van de student. Blijft er één uitkomst over, dan is dat het
 * resultaat. Zie README.md voor hoe je dit bestand bijwerkt.
 *
 * Uitkomst is altijd één van: 'ja' | 'nee' | 'onbekend'.
 * 'onbekend' betekent op het uitkomstscherm: "dit kan ik niet nakijken,
 * bespreek het met je slb'er."
 */

const REGELING_VERSIE = '2026-2027';
const LAATST_BIJGEWERKT = '2026-08-30';

// Voor de 10-jaargrens (§6.3): niet hard "2018" in de tekst, maar afgeleid
// van het huidige jaar, zodat het vanzelf meebeweegt (vervolgopdracht 01, B2).
// -9, niet -10: een opleiding start doorgaans in september, een diploma
// vaak pas in mei/juni. Met -10 zou een bewijsstuk soms net onterecht als
// "te oud" gelden. -9 is de veilige (ruimere) kant — bij twijfel over de
// exacte 10-jaarstermijn kijkt de slb'er toch nog mee (zie de uitleg).
const HUIDIG_JAAR = new Date().getFullYear();
const GRENSJAAR_10_JAAR = HUIDIG_JAAR - 9;

// -----------------------------------------------------------------------
// Onderwerpen die in het startscherm gekozen kunnen worden.
// -----------------------------------------------------------------------
const ONDERWERPEN = [
  { id: 'nederlands', label: 'Nederlands' },
  { id: 'engels', label: 'Engels' },
  { id: 'rekenen', label: 'Rekenen' },
  { id: 'keuzedeel', label: 'Een keuzedeel' },
  { id: 'beroepsgericht', label: 'Een beroepsgericht examenonderdeel' },
  { id: 'burgerschap', label: 'Burgerschap' },
  { id: 'lob', label: 'LOB' },
  { id: 'stage', label: 'Je stage (bpv)' },
  { id: 'buitenlands', label: 'Een buitenlands diploma' },
];

// -----------------------------------------------------------------------
// Cijferbereiken. Er wordt nooit naar een los getal gevraagd, alleen naar
// het bereik rond de grens die in dat geval van belang is (§6.1).
// -----------------------------------------------------------------------
const BEREIK_65 = { veld: 'cijfer', vraag: 'Wat was je cijfer?', opties: [
  { waarde: 'vanaf-6,5', label: '6,5 of hoger' },
  { waarde: 'onder-6,5', label: 'Lager dan 6,5' },
] };

const BEREIK_60 = { veld: 'cijfer', vraag: 'Wat was je cijfer voor Engels?', opties: [
  { waarde: 'vanaf-6,0', label: '6,0 of hoger' },
  { waarde: 'onder-6,0', label: 'Lager dan 6,0' },
] };

const BEREIK_55 = { veld: 'cijfer', vraag: 'Wat was je cijfer?', opties: [
  { waarde: 'vanaf-5,5', label: '5,5 of hoger' },
  { waarde: 'onder-5,5', label: 'Lager dan 5,5' },
] };

// Rekenen 3F kent twee grenzen (4 en 5,5), dus drie bereiken (§6.1, §6.6).
const BEREIK_REKENEN_3F = { veld: 'cijfer', vraag: 'Wat was je cijfer voor rekenen 3F?', opties: [
  { waarde: 'vanaf-5,5', label: '5,5 of hoger' },
  { waarde: '4-tot-5,5', label: 'Tussen de 4 en 5,5' },
  { waarde: 'onder-4', label: 'Lager dan 4' },
] };

// Helper: is een cijferwaarde minimaal de gevraagde grens.
function cijferMinimaal(cijferWaarde, grens) {
  if (cijferWaarde == null) return null;
  if (grens === 6.5) return cijferWaarde === 'vanaf-6,5';
  if (grens === 6.0) return cijferWaarde === 'vanaf-6,0';
  if (grens === 5.5) return cijferWaarde === 'vanaf-5,5' || cijferWaarde === 'vanaf-vanaf-5,5';
  return null;
}

// -----------------------------------------------------------------------
// UITSLUITINGEN (§6.3) — deze gelden voor nederlands/engels/rekenen en
// worden als gewone regels in de pool gestopt zodat de generieke engine
// (§7) ze automatisch meeweegt. Ze winnen niet expliciet "eerst": omdat
// ze op bewijsstuk-niveau matchen zijn ze vanzelf de enige kandidaat zodra
// dat bewijsstuk of die situatie bekend is.
// -----------------------------------------------------------------------
function uitsluitingsregels(onderwerp) {
  const regels = [];

  // Ouder dan 10 jaar bij start van de huidige opleiding — geldt overal.
  // `algemeen: true` markeert regels die ongeacht route/niveau/bewijsstuk
  // relevant blijven. De motor gebruikt dit om het vangnet (§6.2) correct
  // te herkennen: dat kijkt naar de ONDERWERP-SPECIFIEKE regels, niet naar
  // deze generieke uitsluitingen (die anders altijd kandidaat blijven en
  // een "geen enkele regel"-situatie zouden verbergen).
  //
  // We vragen een jaartal, geen "ouder dan 10 jaar?" (dat zijn twee
  // rekenstappen in één zin voor de student — vervolgopdracht 01, B2).
  // Uitkomst is 'onbekend', niet 'nee': de exacte 10-jaarstermijn hangt af
  // van de startdatum van de opleiding, niet alleen van het huidige jaar,
  // dus de tool kan dit niet met zekerheid vaststellen.
  regels.push({
    id: `${onderwerp}-uitsluiting-ouderdom`,
    bron: '§6.3 Uitsluitingen: bewijsstuk ouder dan 10 jaar',
    onderwerp, algemeen: true,
    voorwaarden: { jaarBewijsstuk: 'voor-grensjaar' },
    uitkomst: 'onbekend',
    vrijstellingVoor: null,
    uitleg: `Een bewijsstuk van vóór ${GRENSJAAR_10_JAAR} telt meestal niet meer mee — dat is meer dan 10 jaar geleden. Het hangt wel af van de startdatum van je opleiding. Je slb’er kan dat voor je nakijken.`,
  });

  // EVC
  regels.push({
    id: `${onderwerp}-uitsluiting-evc`,
    bron: '§6.3 Uitsluitingen: EVC (eerder verworven competenties)',
    onderwerp, algemeen: true,
    voorwaarden: { bewijsstuk: 'evc' },
    uitkomst: 'nee',
    vrijstellingVoor: null,
    uitleg: 'Een EVC-verklaring geeft geen recht op vrijstelling.',
  });

  // Remediërend keuzedeel
  regels.push({
    id: `${onderwerp}-uitsluiting-remedierend`,
    bron: '§6.3 Uitsluitingen: remediërend keuzedeel',
    onderwerp, algemeen: true,
    voorwaarden: { bewijsstuk: 'remedierend-keuzedeel' },
    uitkomst: 'nee',
    vrijstellingVoor: null,
    uitleg: 'Een extra vak om je niveau bij te spijkeren (een remediërend keuzedeel) geeft geen recht op vrijstelling.',
  });

  // Onbekend/niet-erkend bewijsstuk, of iets dat niet in het lijstje past.
  regels.push({
    id: `${onderwerp}-uitsluiting-niet-erkend`,
    bron: '§6.3 Uitsluitingen: niet vaststaat dat het bewijsstuk erkend is (of: niets van het lijstje past)',
    onderwerp, algemeen: true,
    voorwaarden: { bewijsstuk: 'niet-erkend' },
    uitkomst: 'onbekend',
    vrijstellingVoor: null,
    uitleg: 'Van dit bewijsstuk staat niet vast dat het erkend is, of het past niet bij de bekende routes. Dat kan deze tool niet beoordelen.',
  });

  // Eerder onvoldoende resultaat — mogelijk compensatie, dus onbekend.
  regels.push({
    id: `${onderwerp}-uitsluiting-onvoldoende`,
    bron: '§6.3 Uitsluitingen: eerder onvoldoende resultaat (compensatieregeling mogelijk)',
    onderwerp, algemeen: true,
    voorwaarden: { eerderOnvoldoende: true },
    uitkomst: 'onbekend',
    vrijstellingVoor: null,
    uitleg: 'Je resultaat was onvoldoende. Een compensatieregeling kan dit soms alsnog toestaan — dat kan deze tool niet beoordelen.',
  });

  // Hbo/wo-resultaat voor Nederlands, Engels of rekenen.
  if (['nederlands', 'engels', 'rekenen'].includes(onderwerp)) {
    regels.push({
      id: `${onderwerp}-uitsluiting-hbo-wo`,
      bron: '§6.3 Uitsluitingen: resultaat uit hbo of wo',
      onderwerp, algemeen: true,
      voorwaarden: { bewijsstuk: 'hbo-wo' },
      uitkomst: 'nee',
      vrijstellingVoor: null,
      uitleg: 'Een resultaat uit het hbo of wo telt niet mee: daar wordt niet op de referentieniveaus geëxamineerd.',
    });
  }

  // Engels-specifiek: Cambridge/Anglia uit voortgezet onderwijs.
  if (onderwerp === 'engels') {
    regels.push({
      id: 'engels-uitsluiting-cambridge-anglia',
      bron: '§6.3 Uitsluitingen: Cambridge- of Anglia-certificaat uit het voortgezet onderwijs voor Engels',
      onderwerp: 'engels', algemeen: true,
      voorwaarden: { bewijsstuk: 'cambridge-anglia-vo' },
      uitkomst: 'nee',
      vrijstellingVoor: null,
      uitleg: 'Een Cambridge- of Anglia-certificaat uit het voortgezet onderwijs telt niet mee voor Engels.',
    });
  }

  // Rekenen-specifiek: wiskunde havo/vwo.
  if (onderwerp === 'rekenen') {
    regels.push({
      id: 'rekenen-uitsluiting-wiskunde-havo-vwo',
      bron: '§6.3 Uitsluitingen: wiskunde van havo of vwo voor rekenen',
      onderwerp: 'rekenen', algemeen: true,
      voorwaarden: { bewijsstuk: 'wiskunde-havo-vwo' },
      uitkomst: 'nee',
      vrijstellingVoor: null,
      uitleg: 'Een wiskunderesultaat van havo of vwo telt niet mee voor rekenen.',
    });
  }

  return regels;
}

// -----------------------------------------------------------------------
// NEDERLANDS (§6.4)
//
// LET OP — bewuste afwijking van het brondocument: artikel 2.2.2 noemt 3F
// als eis vanuit het vmbo, maar vmbo-Nederlands wordt op 2F afgelegd en de
// instroomtabellen gaan ook van 2F uit. We bouwen daarom 2F, niet 3F, voor
// de route 'eerste' met huidig niveau 1/2/3. Overlegd met Jan Meeuwissen;
// meld dit bij het examenbureau als bevestiging nodig is.
// -----------------------------------------------------------------------
function nederlandsRegels() {
  const regels = [];

  // -- Route eerste, huidig niveau 1/2/3 → 2F generiek --
  const bronEerste123 = '§6.4 Nederlands, route eerste, niveau 1/2/3 → 2F generiek (2F i.p.v. 3F: zie notitie bovenaan dit blok)';
  regels.push(
    {
      id: 'nl-eerste-123-2f-ceie-heel-ja',
      bron: bronEerste123 + ' — geheel CE/IE 2F ≥ 6,5',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [1, 2, 3],
      voorwaarden: { bewijsstuk: 'nl-ceie-2f-heel', cijfer: 'vanaf-6,5' },
      uitkomst: 'ja', vrijstellingVoor: '2F generiek Nederlands',
      uitleg: 'Je hebt het hele examen Nederlands op 2F gehaald met minimaal een 6,5.',
    },
    {
      id: 'nl-eerste-123-2f-ceie-heel-nee',
      bron: bronEerste123 + ' — geheel CE/IE 2F onder 6,5',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [1, 2, 3],
      voorwaarden: { bewijsstuk: 'nl-ceie-2f-heel', cijfer: 'onder-6,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor het hele examen Nederlands 2F was lager dan 6,5.',
    },
    {
      id: 'nl-eerste-123-2f-ce-lezenluisteren-ja',
      bron: bronEerste123 + ' — CE 2F lezen/luisteren ≥ 6,5',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [1, 2, 3],
      voorwaarden: { bewijsstuk: 'nl-ce-2f-lezen-luisteren', cijfer: 'vanaf-6,5' },
      uitkomst: 'ja', vrijstellingVoor: '2F generiek Nederlands',
      uitleg: 'Je hebt het landelijke examen Nederlands lezen/luisteren op 2F gehaald met minimaal een 6,5.',
    },
    {
      id: 'nl-eerste-123-2f-ce-lezenluisteren-nee',
      bron: bronEerste123 + ' — CE 2F lezen/luisteren onder 6,5',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [1, 2, 3],
      voorwaarden: { bewijsstuk: 'nl-ce-2f-lezen-luisteren', cijfer: 'onder-6,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor Nederlands lezen/luisteren 2F was lager dan 6,5.',
    },
    {
      id: 'nl-eerste-123-2f-ie-onderdeel-ja',
      bron: bronEerste123 + ' — IE 2F per onderdeel ≥ 6,5',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [1, 2, 3],
      voorwaarden: { bewijsstuk: 'nl-ie-2f-onderdeel', cijfer: 'vanaf-6,5' },
      uitkomst: 'ja', vrijstellingVoor: '2F generiek Nederlands (dat onderdeel)',
      uitleg: 'Je hebt dit onderdeel van het schoolexamen Nederlands 2F gehaald met minimaal een 6,5.',
    },
    {
      id: 'nl-eerste-123-2f-ie-onderdeel-nee',
      bron: bronEerste123 + ' — IE 2F per onderdeel onder 6,5',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [1, 2, 3],
      voorwaarden: { bewijsstuk: 'nl-ie-2f-onderdeel', cijfer: 'onder-6,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor dit onderdeel van Nederlands 2F was lager dan 6,5.',
    },
    {
      id: 'nl-eerste-123-havovwo-ja',
      bron: bronEerste123 + ' — havo/vwo-diploma met Nederlands als eindexamenvak ≥ 6',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [1, 2, 3],
      voorwaarden: { bewijsstuk: 'nl-havo-vwo-eindexamen', cijferHavoVwo: 'vanaf-6' },
      uitkomst: 'ja', vrijstellingVoor: '2F generiek Nederlands',
      uitleg: 'Je hebt Nederlands als eindexamenvak op havo of vwo gehaald met minimaal een 6.',
    },
    {
      id: 'nl-eerste-123-havovwo-nee',
      bron: bronEerste123 + ' — havo/vwo-diploma met Nederlands als eindexamenvak onder 6',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [1, 2, 3],
      voorwaarden: { bewijsstuk: 'nl-havo-vwo-eindexamen', cijferHavoVwo: 'onder-6' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor Nederlands op je havo- of vwo-diploma was lager dan 6.',
    },
    {
      id: 'nl-eerste-123-k0071-ja',
      bron: bronEerste123 + ' — keuzedeel K0071 Nederlands 3F ≥ 5,5',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [1, 2, 3],
      voorwaarden: { bewijsstuk: 'nl-k0071', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: '2F generiek Nederlands',
      uitleg: 'Je hebt het keuzedeel Nederlands 3F (K0071) gehaald met minimaal een 5,5.',
    },
    {
      id: 'nl-eerste-123-k0071-nee',
      bron: bronEerste123 + ' — keuzedeel K0071 Nederlands 3F onder 5,5',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [1, 2, 3],
      voorwaarden: { bewijsstuk: 'nl-k0071', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor het keuzedeel Nederlands 3F (K0071) was lager dan 5,5.',
    },
  );

  // -- Route eerste, huidig niveau 4 → 3F generiek --
  const bronEerste4 = '§6.4 Nederlands, route eerste, niveau 4 → 3F generiek';
  regels.push(
    {
      id: 'nl-eerste-4-3f-ceie-heel-ja',
      bron: bronEerste4 + ' — geheel CE/IE 3F ≥ 5,5',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'nl-ceie-3f-heel', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: '3F generiek Nederlands',
      uitleg: 'Je hebt het hele examen Nederlands op 3F gehaald met minimaal een 5,5.',
    },
    {
      id: 'nl-eerste-4-3f-ceie-heel-nee',
      bron: bronEerste4 + ' — geheel CE/IE 3F onder 5,5',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'nl-ceie-3f-heel', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor het hele examen Nederlands 3F was lager dan 5,5.',
    },
    {
      id: 'nl-eerste-4-3f-onderdeel-ja',
      bron: bronEerste4 + ' — CE/IE 3F per onderdeel ≥ 5,5',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'nl-ceie-3f-onderdeel', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: '3F generiek Nederlands (dat onderdeel)',
      uitleg: 'Je hebt dit onderdeel van Nederlands 3F gehaald met minimaal een 5,5. Dit gaat alleen over het onderdeel dat je al hebt gehaald — bijvoorbeeld alleen schrijven, of alleen spreken. De rest van het examen Nederlands moet je nog wel doen.',
    },
    {
      id: 'nl-eerste-4-3f-onderdeel-nee',
      bron: bronEerste4 + ' — CE/IE 3F per onderdeel onder 5,5',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'nl-ceie-3f-onderdeel', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor dit onderdeel van Nederlands 3F was lager dan 5,5.',
    },
    {
      id: 'nl-eerste-4-havovwo-ja',
      bron: bronEerste4 + ' — havo/vwo-diploma met Nederlands als eindexamenvak ≥ 6',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'nl-havo-vwo-eindexamen', cijferHavoVwo: 'vanaf-6' },
      uitkomst: 'ja', vrijstellingVoor: '3F generiek Nederlands',
      uitleg: 'Je hebt Nederlands als eindexamenvak op havo of vwo gehaald met minimaal een 6.',
    },
    {
      id: 'nl-eerste-4-havovwo-nee',
      bron: bronEerste4 + ' — havo/vwo-diploma met Nederlands als eindexamenvak onder 6',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'nl-havo-vwo-eindexamen', cijferHavoVwo: 'onder-6' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor Nederlands op je havo- of vwo-diploma was lager dan 6.',
    },
    {
      id: 'nl-eerste-4-k0071-ja',
      bron: bronEerste4 + ' — keuzedeel K0071 Nederlands 3F ≥ 5,5',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'nl-k0071', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: '3F generiek Nederlands',
      uitleg: 'Je hebt het keuzedeel Nederlands 3F (K0071) gehaald met minimaal een 5,5.',
    },
    {
      id: 'nl-eerste-4-k0071-nee',
      bron: bronEerste4 + ' — keuzedeel K0071 Nederlands 3F onder 5,5',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'nl-k0071', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor het keuzedeel Nederlands 3F (K0071) was lager dan 5,5.',
    },
    // Niveau 4 vraagt 3F (zie notitie bovenaan dit blok); een bewijsstuk
    // op alleen 2F-niveau is dan onvoldoende, ongeacht het cijfer.
    {
      id: 'nl-eerste-4-alleen-2f-nee',
      bron: bronEerste4 + ' — alleen een bewijsstuk op 2F-niveau: niveau 4 vraagt 3F',
      onderwerp: 'nederlands', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'nl-alleen-2f-niveau' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je bewijsstuk is op taalniveau 2F. Niveau 4 vraagt 3F, dus dit is onvoldoende.',
    },
  );

  // -- Route lager-gelijk: 1→2 of 2→3 → dezelfde 2F-routes, zonder havo/vwo --
  for (const [vorig, huidig] of [[1, 2], [2, 3]]) {
    const bron = `§6.4 Nederlands, route lager-gelijk ${vorig}→${huidig} → 2F generiek (zelfde routes als eerste niveau 1/2/3, zonder havo/vwo)`;
    regels.push(
      {
        id: `nl-lg-${vorig}${huidig}-ceie-heel-ja`, bron: bron + ' — geheel CE/IE 2F ≥ 6,5',
        onderwerp: 'nederlands', route: 'lager-gelijk', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-ceie-2f-heel', cijfer: 'vanaf-6,5' },
        uitkomst: 'ja', vrijstellingVoor: '2F generiek Nederlands',
        uitleg: 'Je hebt het hele examen Nederlands op 2F gehaald met minimaal een 6,5.',
      },
      {
        id: `nl-lg-${vorig}${huidig}-ceie-heel-nee`, bron: bron + ' — geheel CE/IE 2F onder 6,5',
        onderwerp: 'nederlands', route: 'lager-gelijk', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-ceie-2f-heel', cijfer: 'onder-6,5' },
        uitkomst: 'nee', vrijstellingVoor: null,
        uitleg: 'Je cijfer voor het hele examen Nederlands 2F was lager dan 6,5.',
      },
      {
        id: `nl-lg-${vorig}${huidig}-lezenluisteren-ja`, bron: bron + ' — CE 2F lezen/luisteren ≥ 6,5',
        onderwerp: 'nederlands', route: 'lager-gelijk', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-ce-2f-lezen-luisteren', cijfer: 'vanaf-6,5' },
        uitkomst: 'ja', vrijstellingVoor: '2F generiek Nederlands',
        uitleg: 'Je hebt het landelijke examen Nederlands lezen/luisteren op 2F gehaald met minimaal een 6,5.',
      },
      {
        id: `nl-lg-${vorig}${huidig}-lezenluisteren-nee`, bron: bron + ' — CE 2F lezen/luisteren onder 6,5',
        onderwerp: 'nederlands', route: 'lager-gelijk', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-ce-2f-lezen-luisteren', cijfer: 'onder-6,5' },
        uitkomst: 'nee', vrijstellingVoor: null,
        uitleg: 'Je cijfer voor Nederlands lezen/luisteren 2F was lager dan 6,5.',
      },
      {
        id: `nl-lg-${vorig}${huidig}-ie-onderdeel-ja`, bron: bron + ' — IE 2F per onderdeel ≥ 6,5',
        onderwerp: 'nederlands', route: 'lager-gelijk', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-ie-2f-onderdeel', cijfer: 'vanaf-6,5' },
        uitkomst: 'ja', vrijstellingVoor: '2F generiek Nederlands (dat onderdeel)',
        uitleg: 'Je hebt dit onderdeel van het schoolexamen Nederlands 2F gehaald met minimaal een 6,5. Dit gaat alleen over het onderdeel dat je al hebt gehaald — bijvoorbeeld alleen schrijven, of alleen spreken. De rest van het examen Nederlands moet je nog wel doen.',
      },
      {
        id: `nl-lg-${vorig}${huidig}-ie-onderdeel-nee`, bron: bron + ' — IE 2F per onderdeel onder 6,5',
        onderwerp: 'nederlands', route: 'lager-gelijk', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-ie-2f-onderdeel', cijfer: 'onder-6,5' },
        uitkomst: 'nee', vrijstellingVoor: null,
        uitleg: 'Je cijfer voor dit onderdeel van Nederlands 2F was lager dan 6,5.',
      },
      {
        id: `nl-lg-${vorig}${huidig}-k0071-ja`, bron: bron + ' — keuzedeel K0071 Nederlands 3F ≥ 5,5',
        onderwerp: 'nederlands', route: 'lager-gelijk', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-k0071', cijfer: 'vanaf-5,5' },
        uitkomst: 'ja', vrijstellingVoor: '2F generiek Nederlands',
        uitleg: 'Je hebt het keuzedeel Nederlands 3F (K0071) gehaald met minimaal een 5,5.',
      },
      {
        id: `nl-lg-${vorig}${huidig}-k0071-nee`, bron: bron + ' — keuzedeel K0071 Nederlands 3F onder 5,5',
        onderwerp: 'nederlands', route: 'lager-gelijk', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-k0071', cijfer: 'onder-5,5' },
        uitkomst: 'nee', vrijstellingVoor: null,
        uitleg: 'Je cijfer voor het keuzedeel Nederlands 3F (K0071) was lager dan 5,5.',
      },
    );
  }

  // -- Route lager-gelijk: 3→4 of 4→4 → dezelfde 3F-routes, zonder havo/vwo --
  for (const [vorig, huidig] of [[3, 4], [4, 4]]) {
    const bron = `§6.4 Nederlands, route lager-gelijk ${vorig}→${huidig} → 3F generiek (zelfde routes als eerste niveau 4, zonder havo/vwo)`;
    regels.push(
      {
        id: `nl-lg-${vorig}${huidig}-ceie-heel-ja`, bron: bron + ' — geheel CE/IE 3F ≥ 5,5',
        onderwerp: 'nederlands', route: 'lager-gelijk', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-ceie-3f-heel', cijfer: 'vanaf-5,5' },
        uitkomst: 'ja', vrijstellingVoor: '3F generiek Nederlands',
        uitleg: 'Je hebt het hele examen Nederlands op 3F gehaald met minimaal een 5,5.',
      },
      {
        id: `nl-lg-${vorig}${huidig}-ceie-heel-nee`, bron: bron + ' — geheel CE/IE 3F onder 5,5',
        onderwerp: 'nederlands', route: 'lager-gelijk', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-ceie-3f-heel', cijfer: 'onder-5,5' },
        uitkomst: 'nee', vrijstellingVoor: null,
        uitleg: 'Je cijfer voor het hele examen Nederlands 3F was lager dan 5,5.',
      },
      {
        id: `nl-lg-${vorig}${huidig}-onderdeel-ja`, bron: bron + ' — CE/IE 3F per onderdeel ≥ 5,5',
        onderwerp: 'nederlands', route: 'lager-gelijk', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-ceie-3f-onderdeel', cijfer: 'vanaf-5,5' },
        uitkomst: 'ja', vrijstellingVoor: '3F generiek Nederlands (dat onderdeel)',
        uitleg: 'Je hebt dit onderdeel van Nederlands 3F gehaald met minimaal een 5,5. Dit gaat alleen over het onderdeel dat je al hebt gehaald — bijvoorbeeld alleen schrijven, of alleen spreken. De rest van het examen Nederlands moet je nog wel doen.',
      },
      {
        id: `nl-lg-${vorig}${huidig}-onderdeel-nee`, bron: bron + ' — CE/IE 3F per onderdeel onder 5,5',
        onderwerp: 'nederlands', route: 'lager-gelijk', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-ceie-3f-onderdeel', cijfer: 'onder-5,5' },
        uitkomst: 'nee', vrijstellingVoor: null,
        uitleg: 'Je cijfer voor dit onderdeel van Nederlands 3F was lager dan 5,5.',
      },
      {
        id: `nl-lg-${vorig}${huidig}-k0071-ja`, bron: bron + ' — keuzedeel K0071 Nederlands 3F ≥ 5,5',
        onderwerp: 'nederlands', route: 'lager-gelijk', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-k0071', cijfer: 'vanaf-5,5' },
        uitkomst: 'ja', vrijstellingVoor: '3F generiek Nederlands',
        uitleg: 'Je hebt het keuzedeel Nederlands 3F (K0071) gehaald met minimaal een 5,5.',
      },
      {
        id: `nl-lg-${vorig}${huidig}-k0071-nee`, bron: bron + ' — keuzedeel K0071 Nederlands 3F onder 5,5',
        onderwerp: 'nederlands', route: 'lager-gelijk', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-k0071', cijfer: 'onder-5,5' },
        uitkomst: 'nee', vrijstellingVoor: null,
        uitleg: 'Je cijfer voor het keuzedeel Nederlands 3F (K0071) was lager dan 5,5.',
      },
      {
        id: `nl-lg-${vorig}${huidig}-alleen-2f-nee`, bron: bron + ' — alleen een bewijsstuk op 2F-niveau: deze route vraagt 3F',
        onderwerp: 'nederlands', route: 'lager-gelijk', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-alleen-2f-niveau' },
        uitkomst: 'nee', vrijstellingVoor: null,
        uitleg: 'Je bewijsstuk is op taalniveau 2F. Deze route vraagt 3F, dus dit is onvoldoende.',
      },
    );
  }

  // -- Route hoger: 2→1 of 3→2 → 2F (zelfde routes als eerste niveau 1/2/3, mét havo/vwo) --
  for (const [vorig, huidig] of [[2, 1], [3, 2]]) {
    const bron = `§6.4 Nederlands, route hoger ${vorig}→${huidig} → 2F generiek (zelfde routes als eerste niveau 1/2/3)`;
    regels.push(
      {
        id: `nl-hg-${vorig}${huidig}-ceie-heel-ja`, bron: bron + ' — geheel CE/IE 2F ≥ 6,5',
        onderwerp: 'nederlands', route: 'hoger', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-ceie-2f-heel', cijfer: 'vanaf-6,5' },
        uitkomst: 'ja', vrijstellingVoor: '2F generiek Nederlands',
        uitleg: 'Je hebt het hele examen Nederlands op 2F gehaald met minimaal een 6,5.',
      },
      {
        id: `nl-hg-${vorig}${huidig}-ceie-heel-nee`, bron: bron + ' — geheel CE/IE 2F onder 6,5',
        onderwerp: 'nederlands', route: 'hoger', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-ceie-2f-heel', cijfer: 'onder-6,5' },
        uitkomst: 'nee', vrijstellingVoor: null,
        uitleg: 'Je cijfer voor het hele examen Nederlands 2F was lager dan 6,5.',
      },
      {
        id: `nl-hg-${vorig}${huidig}-lezenluisteren-ja`, bron: bron + ' — CE 2F lezen/luisteren ≥ 6,5',
        onderwerp: 'nederlands', route: 'hoger', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-ce-2f-lezen-luisteren', cijfer: 'vanaf-6,5' },
        uitkomst: 'ja', vrijstellingVoor: '2F generiek Nederlands',
        uitleg: 'Je hebt het landelijke examen Nederlands lezen/luisteren op 2F gehaald met minimaal een 6,5.',
      },
      {
        id: `nl-hg-${vorig}${huidig}-lezenluisteren-nee`, bron: bron + ' — CE 2F lezen/luisteren onder 6,5',
        onderwerp: 'nederlands', route: 'hoger', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-ce-2f-lezen-luisteren', cijfer: 'onder-6,5' },
        uitkomst: 'nee', vrijstellingVoor: null,
        uitleg: 'Je cijfer voor Nederlands lezen/luisteren 2F was lager dan 6,5.',
      },
      {
        id: `nl-hg-${vorig}${huidig}-ie-onderdeel-ja`, bron: bron + ' — IE 2F per onderdeel ≥ 6,5',
        onderwerp: 'nederlands', route: 'hoger', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-ie-2f-onderdeel', cijfer: 'vanaf-6,5' },
        uitkomst: 'ja', vrijstellingVoor: '2F generiek Nederlands (dat onderdeel)',
        uitleg: 'Je hebt dit onderdeel van het schoolexamen Nederlands 2F gehaald met minimaal een 6,5. Dit gaat alleen over het onderdeel dat je al hebt gehaald — bijvoorbeeld alleen schrijven, of alleen spreken. De rest van het examen Nederlands moet je nog wel doen.',
      },
      {
        id: `nl-hg-${vorig}${huidig}-ie-onderdeel-nee`, bron: bron + ' — IE 2F per onderdeel onder 6,5',
        onderwerp: 'nederlands', route: 'hoger', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-ie-2f-onderdeel', cijfer: 'onder-6,5' },
        uitkomst: 'nee', vrijstellingVoor: null,
        uitleg: 'Je cijfer voor dit onderdeel van Nederlands 2F was lager dan 6,5.',
      },
      {
        id: `nl-hg-${vorig}${huidig}-havovwo-ja`, bron: bron + ' — havo/vwo-diploma met Nederlands als eindexamenvak ≥ 6',
        onderwerp: 'nederlands', route: 'hoger', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-havo-vwo-eindexamen', cijferHavoVwo: 'vanaf-6' },
        uitkomst: 'ja', vrijstellingVoor: '2F generiek Nederlands',
        uitleg: 'Je hebt Nederlands als eindexamenvak op havo of vwo gehaald met minimaal een 6.',
      },
      {
        id: `nl-hg-${vorig}${huidig}-havovwo-nee`, bron: bron + ' — havo/vwo-diploma met Nederlands als eindexamenvak onder 6',
        onderwerp: 'nederlands', route: 'hoger', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-havo-vwo-eindexamen', cijferHavoVwo: 'onder-6' },
        uitkomst: 'nee', vrijstellingVoor: null,
        uitleg: 'Je cijfer voor Nederlands op je havo- of vwo-diploma was lager dan 6.',
      },
      {
        id: `nl-hg-${vorig}${huidig}-k0071-ja`, bron: bron + ' — keuzedeel K0071 Nederlands 3F ≥ 5,5',
        onderwerp: 'nederlands', route: 'hoger', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-k0071', cijfer: 'vanaf-5,5' },
        uitkomst: 'ja', vrijstellingVoor: '2F generiek Nederlands',
        uitleg: 'Je hebt het keuzedeel Nederlands 3F (K0071) gehaald met minimaal een 5,5.',
      },
      {
        id: `nl-hg-${vorig}${huidig}-k0071-nee`, bron: bron + ' — keuzedeel K0071 Nederlands 3F onder 5,5',
        onderwerp: 'nederlands', route: 'hoger', vorigNiveau: vorig, huidigNiveau: [huidig],
        voorwaarden: { bewijsstuk: 'nl-k0071', cijfer: 'onder-5,5' },
        uitkomst: 'nee', vrijstellingVoor: null,
        uitleg: 'Je cijfer voor het keuzedeel Nederlands 3F (K0071) was lager dan 5,5.',
      },
    );
  }

  // -- Route hoger: 4→3 en 4→2 → twee zelfstandige routes A en B, altijd uitkomst 1 --
  // Geen cijfergrens genoemd in de regeling: geen cijfervraag stellen (§6.4).
  // Er is bewust wél een bewijsstuk-optie ('nl-3f-bewijsstuk-geen-cijfergrens'):
  // zo blijft er naast de generieke uitsluitingen (EVC, niet-erkend, ...) een
  // duidelijke "ja, ik heb een geldig bewijsstuk"-keuze staan.
  for (const [vorig, huidig] of [[4, 3], [4, 2]]) {
    regels.push({
      id: `nl-hg-${vorig}${huidig}-dubbele-route`,
      bron: `§6.4 Nederlands, route hoger ${vorig}→${huidig}: twee zelfstandige routes (A: 2F generiek + keuzedeel 3F, B: alleen generiek 3F). Geen cijfergrens genoemd.`,
      onderwerp: 'nederlands', route: 'hoger', vorigNiveau: vorig, huidigNiveau: [huidig],
      voorwaarden: { bewijsstuk: 'nl-3f-bewijsstuk-geen-cijfergrens' },
      uitkomst: 'ja',
      vrijstellingVoor: 'route A: 2F generiek Nederlands + keuzedeel 3F, óf route B: alleen generiek 3F Nederlands (hoger niveau) — de examencommissie bepaalt welke wordt toegekend',
      uitleg: `Je komt van niveau 4 en doet nu niveau ${huidig}. Er zijn twee mogelijke routes: 2F generiek plus het keuzedeel 3F, óf alleen het generieke 3F-examen op het hogere niveau. De examencommissie bepaalt welke van de twee wordt toegekend.`,
    });
  }

  return regels;
}

// -----------------------------------------------------------------------
// ENGELS (§6.5)
// -----------------------------------------------------------------------
function engelsRegels() {
  const regels = [];

  // -- Route eerste, niveau 2/3 — met minimaal 6,0 voor Engels --
  const bron23 = '§6.5 Engels, route eerste, niveau 2/3, cijfer ≥ 6,0';
  regels.push(
    {
      id: 'en-eerste-23-mbo-ja', bron: bron23 + ' — mbo-diploma/-certificaat/-verklaring → keuzedeel B1/A2',
      onderwerp: 'engels', route: 'eerste', huidigNiveau: [2, 3],
      voorwaarden: { bewijsstuk: 'en-mbo', cijfer: 'vanaf-6,0' },
      uitkomst: 'ja', vrijstellingVoor: 'keuzedeel Engels B1/A2',
      uitleg: 'Je hebt een mbo-bewijsstuk met Engels ≥ 6,0.',
    },
    {
      id: 'en-eerste-23-mbo-nee', bron: bron23 + ' — mbo-diploma/-certificaat/-verklaring onder 6,0',
      onderwerp: 'engels', route: 'eerste', huidigNiveau: [2, 3],
      voorwaarden: { bewijsstuk: 'en-mbo', cijfer: 'onder-6,0' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor Engels was lager dan 6,0.',
    },
    {
      id: 'en-eerste-23-havo-ja', bron: bron23 + ' — havo (A2/B1) → keuzedeel A2/B1',
      onderwerp: 'engels', route: 'eerste', huidigNiveau: [2, 3],
      voorwaarden: { bewijsstuk: 'en-havo', cijfer: 'vanaf-6,0' },
      uitkomst: 'ja', vrijstellingVoor: 'keuzedeel Engels A2/B1',
      uitleg: 'Je hebt een havo-diploma of -certificaat met Engels ≥ 6,0.',
    },
    {
      id: 'en-eerste-23-havo-nee', bron: bron23 + ' — havo onder 6,0',
      onderwerp: 'engels', route: 'eerste', huidigNiveau: [2, 3],
      voorwaarden: { bewijsstuk: 'en-havo', cijfer: 'onder-6,0' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor Engels was lager dan 6,0.',
    },
    {
      id: 'en-eerste-23-vwo-ja', bron: bron23 + ' — vwo (B1/B2) → keuzedeel A2/B1 + keuzedeel B1/B2',
      onderwerp: 'engels', route: 'eerste', huidigNiveau: [2, 3],
      voorwaarden: { bewijsstuk: 'en-vwo', cijfer: 'vanaf-6,0' },
      uitkomst: 'ja', vrijstellingVoor: 'keuzedeel Engels A2/B1 én keuzedeel B1/B2',
      uitleg: 'Je hebt een vwo-diploma of -certificaat met Engels ≥ 6,0.',
    },
    {
      id: 'en-eerste-23-vwo-nee', bron: bron23 + ' — vwo onder 6,0',
      onderwerp: 'engels', route: 'eerste', huidigNiveau: [2, 3],
      voorwaarden: { bewijsstuk: 'en-vwo', cijfer: 'onder-6,0' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor Engels was lager dan 6,0.',
    },
  );

  // -- Route eerste, niveau 4 — met minimaal 6,0 voor Engels --
  const bron4 = '§6.5 Engels, route eerste, niveau 4, cijfer ≥ 6,0';
  regels.push(
    {
      id: 'en-eerste-4-mbo-ja', bron: bron4 + ' — mbo → generiek A2/B1',
      onderwerp: 'engels', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-mbo', cijfer: 'vanaf-6,0' },
      uitkomst: 'ja', vrijstellingVoor: 'generiek Engels A2/B1',
      uitleg: 'Je hebt een mbo-bewijsstuk met Engels ≥ 6,0.',
    },
    {
      id: 'en-eerste-4-mbo-nee', bron: bron4 + ' — mbo onder 6,0',
      onderwerp: 'engels', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-mbo', cijfer: 'onder-6,0' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor Engels was lager dan 6,0.',
    },
    {
      id: 'en-eerste-4-havo-ja', bron: bron4 + ' — havo → generiek A2/B1',
      onderwerp: 'engels', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-havo', cijfer: 'vanaf-6,0' },
      uitkomst: 'ja', vrijstellingVoor: 'generiek Engels A2/B1',
      uitleg: 'Je hebt een havo-diploma of -certificaat met Engels ≥ 6,0.',
    },
    {
      id: 'en-eerste-4-havo-nee', bron: bron4 + ' — havo onder 6,0',
      onderwerp: 'engels', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-havo', cijfer: 'onder-6,0' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor Engels was lager dan 6,0.',
    },
    {
      id: 'en-eerste-4-vwo-ja', bron: bron4 + ' — vwo → generiek B1/B2 (hoger niveau), óf generiek A2/B1, óf generiek A2/B1 + keuzedeel B1/B2',
      onderwerp: 'engels', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-vwo', cijfer: 'vanaf-6,0' },
      uitkomst: 'ja', vrijstellingVoor: 'generiek Engels B1/B2 (hoger niveau), óf generiek A2/B1, óf generiek A2/B1 + keuzedeel B1/B2 — de examencommissie bepaalt welke',
      uitleg: 'Je hebt een vwo-diploma of -certificaat met Engels ≥ 6,0.',
    },
    {
      id: 'en-eerste-4-vwo-nee', bron: bron4 + ' — vwo onder 6,0',
      onderwerp: 'engels', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-vwo', cijfer: 'onder-6,0' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor Engels was lager dan 6,0.',
    },
    // Keuzedelen K0802 en K0803, alleen niveau 4.
    {
      id: 'en-eerste-4-k0802-ja', bron: '§6.5 Engels niveau 4 — keuzedeel K0802 B1/A2 → generiek A2/B1, geheel CE/IE ≥ 5,5 of per onderdeel ≥ 5,5',
      onderwerp: 'engels', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-k0802', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'generiek Engels A2/B1',
      uitleg: 'Je hebt het keuzedeel K0802 (B1/A2) gehaald met minimaal een 5,5.',
    },
    {
      id: 'en-eerste-4-k0802-nee', bron: '§6.5 Engels niveau 4 — keuzedeel K0802 onder 5,5',
      onderwerp: 'engels', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-k0802', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor het keuzedeel K0802 was lager dan 5,5.',
    },
    {
      id: 'en-eerste-4-k0803-ja', bron: '§6.5 Engels niveau 4 — keuzedeel K0803 B1/B2 → generiek A2/B1 en/of K0803 of K0802 A2/B1, geheel CE/IE ≥ 5,5 of per onderdeel ≥ 5,5',
      onderwerp: 'engels', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-k0803', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'generiek Engels A2/B1 en/of keuzedeel K0803 B1/B2 of K0802 A2/B1',
      uitleg: 'Je hebt het keuzedeel K0803 (B1/B2) gehaald met minimaal een 5,5.',
    },
    {
      id: 'en-eerste-4-k0803-nee', bron: '§6.5 Engels niveau 4 — keuzedeel K0803 onder 5,5',
      onderwerp: 'engels', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-k0803', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor het keuzedeel K0803 was lager dan 5,5.',
    },
  );

  // -- Route lager-gelijk 3→4: CE Engels B1 + IE Engels A2 → K0802 --
  regels.push(
    {
      id: 'en-lg-34-ja', bron: '§6.5 Engels, route lager-gelijk 3→4: CE Engels B1 + IE Engels A2 → K0802, gemiddeld B1/A2 ≥ 5,5',
      onderwerp: 'engels', route: 'lager-gelijk', vorigNiveau: 3, huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-ce-b1-ie-a2', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'keuzedeel K0802 B1/A2',
      uitleg: 'Je hebt CE Engels B1 en IE Engels A2 met een gemiddeld resultaat van minimaal 5,5.',
    },
    {
      id: 'en-lg-34-nee', bron: '§6.5 Engels, route lager-gelijk 3→4: gemiddeld B1/A2 onder 5,5',
      onderwerp: 'engels', route: 'lager-gelijk', vorigNiveau: 3, huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-ce-b1-ie-a2', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je gemiddelde voor CE Engels B1 en IE Engels A2 was lager dan 5,5.',
    },
  );

  // -- Route lager-gelijk 4→4 --
  regels.push(
    {
      id: 'en-lg-44-ce-b1-ja', bron: '§6.5 Engels, route lager-gelijk 4→4: CE Engels B1 lezen/luisteren ≥ 5,5',
      onderwerp: 'engels', route: 'lager-gelijk', vorigNiveau: 4, huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-ce-b1-lezen-luisteren', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'CE Engels B1 lezen/luisteren',
      uitleg: 'Je hebt CE Engels B1 lezen/luisteren gehaald met minimaal een 5,5.',
    },
    {
      id: 'en-lg-44-ce-b1-nee', bron: '§6.5 Engels, route lager-gelijk 4→4: CE Engels B1 lezen/luisteren onder 5,5',
      onderwerp: 'engels', route: 'lager-gelijk', vorigNiveau: 4, huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-ce-b1-lezen-luisteren', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor CE Engels B1 lezen/luisteren was lager dan 5,5.',
    },
    {
      id: 'en-lg-44-ie-a2-gem-ja', bron: '§6.5 Engels, route lager-gelijk 4→4: IE Engels A2 gemiddeld ≥ 5,5',
      onderwerp: 'engels', route: 'lager-gelijk', vorigNiveau: 4, huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-ie-a2-gemiddeld', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'IE Engels A2',
      uitleg: 'Je gemiddelde voor IE Engels A2 was minimaal 5,5.',
    },
    {
      id: 'en-lg-44-ie-a2-gem-nee', bron: '§6.5 Engels, route lager-gelijk 4→4: IE Engels A2 gemiddeld onder 5,5',
      onderwerp: 'engels', route: 'lager-gelijk', vorigNiveau: 4, huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-ie-a2-gemiddeld', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je gemiddelde voor IE Engels A2 was lager dan 5,5.',
    },
    {
      id: 'en-lg-44-ie-a2-deel-ja', bron: '§6.5 Engels, route lager-gelijk 4→4: IE Engels A2 deelresultaat ≥ 5,5 → per onderdeel',
      onderwerp: 'engels', route: 'lager-gelijk', vorigNiveau: 4, huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-ie-a2-deelresultaat', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'IE Engels A2 (dat onderdeel)',
      uitleg: 'Je deelresultaat voor IE Engels A2 was minimaal 5,5. Dit gaat alleen over het onderdeel dat je al hebt gehaald. De rest van het examen Engels moet je nog wel doen.',
    },
    {
      id: 'en-lg-44-ie-a2-deel-nee', bron: '§6.5 Engels, route lager-gelijk 4→4: IE Engels A2 deelresultaat onder 5,5',
      onderwerp: 'engels', route: 'lager-gelijk', vorigNiveau: 4, huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-ie-a2-deelresultaat', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je deelresultaat voor IE Engels A2 was lager dan 5,5.',
    },
  );

  // -- Route hoger 4→3: K0802, gemiddeld B1/A2 ≥ 5,5 óf gemiddeld B1/B1 ≥ 5,5 --
  // -- Route hoger 4→2: zelfde voorwaarden als 4→3 (vervolgopdracht 01, A1 —
  //    ontbrak in de eerste versie: er was geen enkel pad voor deze route).
  regels.push(
    {
      id: 'en-hg-43-ja', bron: '§6.5 Engels, route hoger 4→3 → K0802, gemiddeld B1/A2 ≥ 5,5 óf gemiddeld B1/B1 ≥ 5,5',
      onderwerp: 'engels', route: 'hoger', vorigNiveau: 4, huidigNiveau: [3],
      voorwaarden: { bewijsstuk: 'en-hg-hoger-gemiddeld', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'keuzedeel K0802',
      uitleg: 'Je gemiddelde resultaat was minimaal 5,5.',
    },
    {
      id: 'en-hg-43-nee', bron: '§6.5 Engels, route hoger 4→3: gemiddelde onder 5,5',
      onderwerp: 'engels', route: 'hoger', vorigNiveau: 4, huidigNiveau: [3],
      voorwaarden: { bewijsstuk: 'en-hg-hoger-gemiddeld', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je gemiddelde resultaat was lager dan 5,5.',
    },
    {
      id: 'en-hg-42-ja', bron: '§6.5 Engels, route hoger 4→2 (vervolgopdracht 01, A1 — zelfde voorwaarden als 4→3): K0802, gemiddeld B1/A2 ≥ 5,5 óf gemiddeld B1/B1 ≥ 5,5',
      onderwerp: 'engels', route: 'hoger', vorigNiveau: 4, huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 'en-hg-hoger-gemiddeld', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'keuzedeel K0802',
      uitleg: 'Je gemiddelde resultaat was minimaal 5,5.',
    },
    {
      id: 'en-hg-42-nee', bron: '§6.5 Engels, route hoger 4→2: gemiddelde onder 5,5',
      onderwerp: 'engels', route: 'hoger', vorigNiveau: 4, huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 'en-hg-hoger-gemiddeld', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je gemiddelde resultaat was lager dan 5,5.',
    },
  );

  // -- Overig (§6.5): deelresultaat B1/B2 in niveau 3, inzetbaar in niveau 4 --
  regels.push(
    {
      id: 'en-overig-b1b2-niveau3-naar-4-ja',
      bron: '§6.5 Engels, overig: keuzedeel B1/B2 behaald in niveau 3 → in niveau 4 inzetbaar voor keuzedeel B1/B2 én generiek A2/B1',
      onderwerp: 'engels', route: 'lager-gelijk', vorigNiveau: 3, huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 'en-b1b2-niveau3-eerder-behaald' },
      uitkomst: 'ja', vrijstellingVoor: 'keuzedeel B1/B2 én generiek A2/B1',
      uitleg: 'Je hebt het keuzedeel Engels B1/B2 al op niveau 3 behaald.',
    },
  );

  return regels;
}

// -----------------------------------------------------------------------
// REKENEN (§6.6)
// -----------------------------------------------------------------------
function rekenenRegels() {
  const regels = [];

  // -- Route eerste, niveau 2 --
  regels.push(
    {
      id: 're-eerste-2-n2-ja', bron: '§6.6 Rekenen, route eerste, niveau 2 — rekenniveau 2 ≥ 5,5 of examen rekenen mbo 2F ≥ 5,5 → generiek N2',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 're-niveau2-of-mbo2f', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'generiek rekenen N2',
      uitleg: 'Je hebt rekenniveau 2 of het examen rekenen mbo 2F gehaald met minimaal een 5,5.',
    },
    {
      id: 're-eerste-2-n2-nee', bron: '§6.6 Rekenen, route eerste, niveau 2 — onder 5,5',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 're-niveau2-of-mbo2f', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer was lager dan 5,5.',
    },
    {
      id: 're-eerste-2-3f-ja', bron: '§6.6 Rekenen, route eerste, niveau 2 — rekenen 3F ≥ 5,5 → generiek rekenen niveau 2 of 3 én keuzedeel rekenen niveau 3 of 4',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 're-3f', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'generiek rekenen niveau 2 of 3 én keuzedeel rekenen niveau 3 of 4',
      uitleg: 'Je hebt rekenen 3F gehaald met minimaal een 5,5.',
    },
    {
      id: 're-eerste-2-3f-tussen', bron: '§6.6 Rekenen, route eerste, niveau 2 — rekenen 3F tussen 4 en 5,5: zie speciale route met cijfer 4',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 're-3f', cijfer: '4-tot-5,5' },
      uitkomst: 'onbekend', vrijstellingVoor: 'rekenen 2F generiek én keuzedeel rekenen 3F (alleen als aan de slaag-/zakregeling van het keuzedeel is voldaan)',
      uitleg: 'Je cijfer voor rekenen 3F was tussen de 4 en 5,5. Dit kan mogelijk via een speciale route, maar alleen als je ook aan de slaag-/zakvoorwaarde voor het keuzedeel voldoet. Dat kan deze tool niet vaststellen. Als dit lukt, zou het gaan om een vrijstelling voor rekenen 2F generiek én het keuzedeel rekenen 3F. Je slb’er kan dat uitzoeken.',
    },
    {
      id: 're-eerste-2-3f-nee', bron: '§6.6 Rekenen, route eerste, niveau 2 — rekenen 3F onder 4',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 're-3f', cijfer: 'onder-4' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor rekenen 3F was lager dan 4.',
    },
  );

  // -- Route eerste, niveau 3 --
  regels.push(
    {
      id: 're-eerste-3-n3-ja', bron: '§6.6 Rekenen, route eerste, niveau 3 — rekenniveau 3 ≥ 5,5 of examen rekenen mbo 2F ≥ 5,5 → generiek N3',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [3],
      voorwaarden: { bewijsstuk: 're-niveau3-of-mbo2f', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'generiek rekenen N3',
      uitleg: 'Je hebt rekenniveau 3 of het examen rekenen mbo 2F gehaald met minimaal een 5,5.',
    },
    {
      id: 're-eerste-3-n3-nee', bron: '§6.6 Rekenen, route eerste, niveau 3 — onder 5,5',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [3],
      voorwaarden: { bewijsstuk: 're-niveau3-of-mbo2f', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer was lager dan 5,5.',
    },
    {
      id: 're-eerste-3-3f-ja', bron: '§6.6 Rekenen, route eerste, niveau 3 — rekenen 3F ≥ 5,5 → generiek rekenen niveau 2 of 3 én keuzedeel rekenen niveau 3 of 4',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [3],
      voorwaarden: { bewijsstuk: 're-3f', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'generiek rekenen niveau 2 of 3 én keuzedeel rekenen niveau 3 of 4',
      uitleg: 'Je hebt rekenen 3F gehaald met minimaal een 5,5.',
    },
    {
      id: 're-eerste-3-3f-tussen', bron: '§6.6 Rekenen, route eerste, niveau 3 — rekenen 3F tussen 4 en 5,5: zie speciale route met cijfer 4',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [3],
      voorwaarden: { bewijsstuk: 're-3f', cijfer: '4-tot-5,5' },
      uitkomst: 'onbekend', vrijstellingVoor: 'rekenen 2F generiek én keuzedeel rekenen 3F (alleen als aan de slaag-/zakregeling van het keuzedeel is voldaan)',
      uitleg: 'Je cijfer voor rekenen 3F was tussen de 4 en 5,5. Dit kan mogelijk via een speciale route, maar alleen als je ook aan de slaag-/zakvoorwaarde voor het keuzedeel voldoet. Dat kan deze tool niet vaststellen. Als dit lukt, zou het gaan om een vrijstelling voor rekenen 2F generiek én het keuzedeel rekenen 3F. Je slb’er kan dat uitzoeken.',
    },
    {
      id: 're-eerste-3-3f-nee', bron: '§6.6 Rekenen, route eerste, niveau 3 — rekenen 3F onder 4',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [3],
      voorwaarden: { bewijsstuk: 're-3f', cijfer: 'onder-4' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor rekenen 3F was lager dan 4.',
    },
  );

  // -- Route eerste, niveau 4 — generiek N4 --
  const bron4 = '§6.6 Rekenen, route eerste, niveau 4 → generiek N4';
  regels.push(
    {
      id: 're-eerste-4-n4-ja', bron: bron4 + ' — rekenniveau 4 ≥ 5,5',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 're-niveau4', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'generiek rekenen N4',
      uitleg: 'Je hebt rekenniveau 4 gehaald met minimaal een 5,5.',
    },
    {
      id: 're-eerste-4-n4-nee', bron: bron4 + ' — rekenniveau 4 onder 5,5',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 're-niveau4', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor rekenniveau 4 was lager dan 5,5.',
    },
    {
      id: 're-eerste-4-mbo3f-ja', bron: bron4 + ' — examen rekenen mbo 3F ≥ 5,5',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 're-mbo-3f', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'generiek rekenen N4',
      uitleg: 'Je hebt het examen rekenen mbo 3F gehaald met minimaal een 5,5.',
    },
    {
      id: 're-eerste-4-mbo3f-nee', bron: bron4 + ' — examen rekenen mbo 3F onder 5,5',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 're-mbo-3f', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor het examen rekenen mbo 3F was lager dan 5,5.',
    },
    {
      id: 're-eerste-4-havo3f-ja', bron: bron4 + ' — rekentoets havo 3F ≥ 5,5',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 're-havo-3f', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'generiek rekenen N4',
      uitleg: 'Je hebt de rekentoets havo 3F gehaald met minimaal een 5,5.',
    },
    {
      id: 're-eerste-4-havo3f-nee', bron: bron4 + ' — rekentoets havo 3F onder 5,5',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 're-havo-3f', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor de rekentoets havo 3F was lager dan 5,5.',
    },
    // Een rekenresultaat vmbo 3F telt hier ook mee, zonder expliciete bron-eis (§6.6).
    {
      id: 're-eerste-4-vmbo3f-ja', bron: bron4 + ' — rekenresultaat vmbo 3F ≥ 5,5 (§6.6: telt mee waar rekenen 3F zonder bron genoemd wordt)',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 're-vmbo-3f', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'generiek rekenen N4',
      uitleg: 'Je hebt een rekenresultaat van het vmbo op 3F met minimaal een 5,5.',
    },
    {
      id: 're-eerste-4-vmbo3f-nee', bron: bron4 + ' — rekenresultaat vmbo 3F onder 5,5',
      onderwerp: 'rekenen', route: 'eerste', huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 're-vmbo-3f', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je rekenresultaat van het vmbo op 3F was lager dan 5,5.',
    },
  );

  // Vmbo 2F telt nooit mee voor rekenen (§6.6, testgeval 13).
  regels.push({
    id: 're-vmbo-2f-nee', bron: '§6.6 Rekenen: vmbo 2F geeft geen vrijstelling (alleen vmbo 3F kan)',
    onderwerp: 'rekenen', route: null, huidigNiveau: null,
    voorwaarden: { bewijsstuk: 're-vmbo-2f' },
    uitkomst: 'nee', vrijstellingVoor: null,
    uitleg: 'Een rekenresultaat van het vmbo op 2F geeft geen vrijstelling. Dat kan alleen met 3F.',
  });

  // -- Route lager-gelijk --
  regels.push(
    {
      id: 're-lg-12-ja', bron: '§6.6 Rekenen, route lager-gelijk 1→2: 2N ≥ 5,5 → rekenniveau 2',
      onderwerp: 'rekenen', route: 'lager-gelijk', vorigNiveau: 1, huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 're-2n', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'rekenniveau 2',
      uitleg: 'Je hebt 2N gehaald met minimaal een 5,5.',
    },
    {
      id: 're-lg-12-nee', bron: '§6.6 Rekenen, route lager-gelijk 1→2: 2N onder 5,5',
      onderwerp: 'rekenen', route: 'lager-gelijk', vorigNiveau: 1, huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 're-2n', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer voor 2N was lager dan 5,5.',
    },
    {
      id: 're-lg-23-ja', bron: '§6.6 Rekenen, route lager-gelijk 2→3: 2F of 3N ≥ 5,5 → rekenniveau 3',
      onderwerp: 'rekenen', route: 'lager-gelijk', vorigNiveau: 2, huidigNiveau: [3],
      voorwaarden: { bewijsstuk: 're-2f-of-3n', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'rekenniveau 3',
      uitleg: 'Je hebt 2F of 3N gehaald met minimaal een 5,5.',
    },
    {
      id: 're-lg-23-nee', bron: '§6.6 Rekenen, route lager-gelijk 2→3: onder 5,5',
      onderwerp: 'rekenen', route: 'lager-gelijk', vorigNiveau: 2, huidigNiveau: [3],
      voorwaarden: { bewijsstuk: 're-2f-of-3n', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer was lager dan 5,5.',
    },
    {
      id: 're-lg-34-ja', bron: '§6.6 Rekenen, route lager-gelijk 3→4: 3F of 4N ≥ 5,5 → rekenniveau 4',
      onderwerp: 'rekenen', route: 'lager-gelijk', vorigNiveau: 3, huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 're-3f-of-4n', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'rekenniveau 4',
      uitleg: 'Je hebt 3F of 4N gehaald met minimaal een 5,5.',
    },
    {
      id: 're-lg-34-nee', bron: '§6.6 Rekenen, route lager-gelijk 3→4: onder 5,5',
      onderwerp: 'rekenen', route: 'lager-gelijk', vorigNiveau: 3, huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 're-3f-of-4n', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer was lager dan 5,5.',
    },
    // K0089/K1130 alleen voor studenten gestart vóór 2022-2023.
    {
      id: 're-lg-34-keuzedeel-ja', bron: '§6.6 Rekenen, route lager-gelijk 3→4: keuzedeel K0089 of K1130 Rekenen 3F → generiek rekenen 3F, alleen als gestart vóór 2022-2023',
      onderwerp: 'rekenen', route: 'lager-gelijk', vorigNiveau: 3, huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 're-k0089-k1130', gestartVoor2022: true },
      uitkomst: 'ja', vrijstellingVoor: 'generiek rekenen 3F',
      uitleg: 'Je hebt keuzedeel K0089 of K1130 Rekenen 3F behaald en bent gestart vóór het cohort 2022-2023.',
    },
    {
      id: 're-lg-34-keuzedeel-nee', bron: '§6.6 Rekenen, route lager-gelijk 3→4: keuzedeel K0089/K1130, maar gestart in of na 2022-2023',
      onderwerp: 'rekenen', route: 'lager-gelijk', vorigNiveau: 3, huidigNiveau: [4],
      voorwaarden: { bewijsstuk: 're-k0089-k1130', gestartVoor2022: false },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Deze route geldt alleen voor studenten die vóór het cohort 2022-2023 zijn gestart.',
    },
  );

  // -- Route hoger --
  regels.push(
    {
      id: 're-hg-32-2f-n2-ja', bron: '§6.6 Rekenen, route hoger 3→2: 2F of rekenniveau 2 → rekenniveau 2',
      onderwerp: 'rekenen', route: 'hoger', vorigNiveau: 3, huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 're-2f-of-niveau2', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'rekenniveau 2',
      uitleg: 'Je hebt 2F of rekenniveau 2 gehaald met minimaal een 5,5.',
    },
    {
      id: 're-hg-32-2f-n2-nee', bron: '§6.6 Rekenen, route hoger 3→2: onder 5,5',
      onderwerp: 'rekenen', route: 'hoger', vorigNiveau: 3, huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 're-2f-of-niveau2', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer was lager dan 5,5.',
    },
    {
      id: 're-hg-32-2f-n3-ja', bron: '§6.6 Rekenen, route hoger 3→2: 2F of rekenniveau 3 → rekenniveau 2 of keuzedeel rekenen 3',
      onderwerp: 'rekenen', route: 'hoger', vorigNiveau: 3, huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 're-2f-of-niveau3', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'rekenniveau 2 of keuzedeel rekenen 3',
      uitleg: 'Je hebt 2F of rekenniveau 3 gehaald met minimaal een 5,5.',
    },
    {
      id: 're-hg-32-2f-n3-nee', bron: '§6.6 Rekenen, route hoger 3→2: 2F of rekenniveau 3, onder 5,5',
      onderwerp: 'rekenen', route: 'hoger', vorigNiveau: 3, huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 're-2f-of-niveau3', cijfer: 'onder-5,5' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer was lager dan 5,5.',
    },
    // Niet in de regeling, bevestigd door Jan (vervolgopdracht 01, A3): op
    // niveau 2 hoort normaal 2F, maar een enkele student heeft toch het
    // keuzedeel rekenen 3F behaald. Geen cijfergrens genoemd in de
    // regeling → geen cijfer vragen. Altijd conclusie 3: het examenbureau
    // beslist, omdat deze situatie niet in de regeling staat (géén "ja",
    // en géén re-hg-32-tussen-achtige regel die alsnog een vrijstelling
    // toekent).
    {
      id: 're-hg-32-keuzedeel-3f-onbekend',
      bron: '§6.6 Rekenen, route hoger 3→2: student heeft het keuzedeel rekenen 3F behaald — niet in de regeling, examencommissie beslist (vervolgopdracht 01, A3)',
      onderwerp: 'rekenen', route: 'hoger', vorigNiveau: 3, huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 're-32-keuzedeel-3f' },
      uitkomst: 'onbekend', vrijstellingVoor: null,
      uitleg: 'Jij zit nu op niveau 2, en daar hoort normaal rekenen op 2F bij. Jij hebt het extra vak rekenen op 3F gehaald. Die situatie staat niet in de regeling. Vraag de vrijstelling wel gewoon aan: het examenbureau beslist hierover.',
    },
    {
      id: 're-hg-43-ja', bron: '§6.6 Rekenen, route hoger 4→3: 3F of rekenniveau 4 → rekenniveau 3 of keuzedeel rekenen 3-4',
      onderwerp: 'rekenen', route: 'hoger', vorigNiveau: 4, huidigNiveau: [3],
      voorwaarden: { bewijsstuk: 're-3f-of-niveau4', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'rekenniveau 3 of keuzedeel rekenen 3-4',
      uitleg: 'Je hebt 3F of rekenniveau 4 gehaald met minimaal een 5,5.',
    },
    {
      id: 're-hg-43-tussen', bron: '§6.6 Rekenen, route hoger 4→3: cijfer tussen 4 en 5,5 → speciale route met cijfer 4',
      onderwerp: 'rekenen', route: 'hoger', vorigNiveau: 4, huidigNiveau: [3],
      voorwaarden: { bewijsstuk: 're-3f-of-niveau4', cijfer: '4-tot-5,5' },
      uitkomst: 'onbekend', vrijstellingVoor: 'rekenen 2F generiek én keuzedeel rekenen 3F (alleen als aan de slaag-/zakregeling van het keuzedeel is voldaan)',
      uitleg: 'Je cijfer was tussen de 4 en 5,5. Dit kan mogelijk via een speciale route, maar alleen als je ook aan de slaag-/zakvoorwaarde voor het keuzedeel voldoet. Dat kan deze tool niet vaststellen. Als dit lukt, zou het gaan om een vrijstelling voor rekenen 2F generiek én het keuzedeel rekenen 3F. Je slb’er kan dat uitzoeken.',
    },
    {
      id: 're-hg-43-nee', bron: '§6.6 Rekenen, route hoger 4→3: onder 4',
      onderwerp: 'rekenen', route: 'hoger', vorigNiveau: 4, huidigNiveau: [3],
      voorwaarden: { bewijsstuk: 're-3f-of-niveau4', cijfer: 'onder-4' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer was lager dan 4.',
    },
    {
      id: 're-hg-42-ja', bron: '§6.6 Rekenen, route hoger 4→2: 3F of rekenniveau 4 → rekenniveau 2 én keuzedeel rekenen 3-4',
      onderwerp: 'rekenen', route: 'hoger', vorigNiveau: 4, huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 're-3f-of-niveau4', cijfer: 'vanaf-5,5' },
      uitkomst: 'ja', vrijstellingVoor: 'rekenniveau 2 én keuzedeel rekenen 3-4',
      uitleg: 'Je hebt 3F of rekenniveau 4 gehaald met minimaal een 5,5.',
    },
    {
      id: 're-hg-42-tussen', bron: '§6.6 Rekenen, route hoger 4→2: cijfer tussen 4 en 5,5 → speciale route met cijfer 4',
      onderwerp: 'rekenen', route: 'hoger', vorigNiveau: 4, huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 're-3f-of-niveau4', cijfer: '4-tot-5,5' },
      uitkomst: 'onbekend', vrijstellingVoor: 'rekenen generiek én keuzedeel rekenen 3F (alleen als aan de slaag-/zakregeling van het keuzedeel is voldaan)',
      uitleg: 'Je cijfer was tussen de 4 en 5,5. Dit kan mogelijk via een speciale route, maar alleen als je ook aan de slaag-/zakvoorwaarde voor het keuzedeel voldoet. Dat kan deze tool niet vaststellen. Als dit lukt, zou het gaan om een vrijstelling voor rekenen generiek én het keuzedeel rekenen 3F. Je slb’er kan dat uitzoeken.',
    },
    {
      id: 're-hg-42-nee', bron: '§6.6 Rekenen, route hoger 4→2: onder 4',
      onderwerp: 'rekenen', route: 'hoger', vorigNiveau: 4, huidigNiveau: [2],
      voorwaarden: { bewijsstuk: 're-3f-of-niveau4', cijfer: 'onder-4' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je cijfer was lager dan 4.',
    },
  );

  return regels;
}

// -----------------------------------------------------------------------
// KEUZEDELEN (§6.7)
// -----------------------------------------------------------------------
function keuzedeelRegels() {
  return [
    {
      id: 'kd-zelfde-voldoende-ja',
      bron: '§6.7 Keuzedelen: precies hetzelfde keuzedeel eerder behaald, met een voldoende',
      onderwerp: 'keuzedeel', route: null, huidigNiveau: null,
      voorwaarden: { situatie: 'zelfde-keuzedeel', voldoende: true },
      uitkomst: 'ja', vrijstellingVoor: 'dat keuzedeel',
      uitleg: 'Je hebt precies hetzelfde keuzedeel al eerder met een voldoende behaald.',
    },
    {
      id: 'kd-zelfde-onvoldoende',
      bron: '§6.7 Keuzedelen: zelfde keuzedeel, onvoldoende afgesloten vanaf cohort 2020',
      onderwerp: 'keuzedeel', route: null, huidigNiveau: null,
      voorwaarden: { situatie: 'zelfde-keuzedeel', voldoende: false, cohortVanaf2020: true },
      uitkomst: 'onbekend', vrijstellingVoor: null,
      uitleg: 'Je resultaat was onvoldoende. Aan het einde van de opleiding kan de slaag-/zakregeling dit soms alsnog toestaan — dat kan deze tool niet beoordelen.',
    },
    {
      id: 'kd-zelfde-onvoldoende-voor-2020',
      bron: '§6.7 Keuzedelen: zelfde keuzedeel, onvoldoende, cohort vóór 2020 (vervolgopdracht 01, A2 — voor 2016-2019 telde alleen de aanwezigheid van een examenresultaat, dus vrijstelling was daar juist wél mogelijk; de tool kan dit niet beslissen)',
      onderwerp: 'keuzedeel', route: null, huidigNiveau: null,
      voorwaarden: { situatie: 'zelfde-keuzedeel', voldoende: false, cohortVanaf2020: false },
      uitkomst: 'onbekend', vrijstellingVoor: null,
      uitleg: 'Voor opleidingen die vóór 2020 zijn gestart golden andere regels voor een extra vak dat je met een onvoldoende hebt afgesloten. Of dat voor jou geldt, kan ik hier niet nakijken. Je slb’er kan dat uitzoeken.',
    },
    {
      id: 'kd-remedierend',
      bron: '§6.7 Keuzedelen: remediërend keuzedeel geeft geen vrijstelling',
      onderwerp: 'keuzedeel', route: null, huidigNiveau: null,
      voorwaarden: { situatie: 'remedierend' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Een extra vak om je niveau bij te spijkeren (een remediërend keuzedeel) geeft geen recht op vrijstelling.',
    },
    {
      id: 'kd-dubbel-gebruik',
      bron: '§6.7 Keuzedelen: dubbel gebruik van hetzelfde keuzedeel is niet toegestaan',
      onderwerp: 'keuzedeel', route: null, huidigNiveau: null,
      voorwaarden: { situatie: 'dubbel-gebruik' },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Dit keuzedeel telt al mee voor een ander onderdeel van je kwalificatie en kan niet dubbel gebruikt worden.',
    },
    {
      id: 'kd-ander-of-lijkend',
      bron: '§6.7 Keuzedelen: ander of lijkend keuzedeel, of delen van een kwalificatie — gelijkwaardigheid moet beoordeeld worden',
      onderwerp: 'keuzedeel', route: null, huidigNiveau: null,
      voorwaarden: { situatie: 'ander-of-lijkend' },
      uitkomst: 'onbekend', vrijstellingVoor: null,
      uitleg: 'Dit is een ander of lijkend keuzedeel, of delen van een kwalificatie. Iemand moet beoordelen of het gelijkwaardig is — dat doet deze tool nooit.',
    },
  ];
}

// -----------------------------------------------------------------------
// BEROEPSGERICHTE EXAMENS (§6.8)
// -----------------------------------------------------------------------
function beroepsgerichtRegels() {
  return [
    {
      id: 'bg-voldoende-onbekend',
      bron: '§6.8 Beroepsgerichte examens: voldoende eindresultaat, gelijkwaardigheid moet beoordeeld worden',
      onderwerp: 'beroepsgericht', route: null, huidigNiveau: null,
      voorwaarden: { voldoende: true },
      uitkomst: 'onbekend', vrijstellingVoor: null,
      uitleg: 'Je hebt een voldoende eindresultaat. De examencommissie moet nog beoordelen of dit onderdeel gelijkwaardig is aan niveau en inhoud van je huidige kwalificatiedossier — dat doet deze tool nooit.',
    },
    {
      id: 'bg-onvoldoende-nee',
      bron: '§6.8 Beroepsgerichte examens: voorwaarde is een voldoende eindresultaat',
      onderwerp: 'beroepsgericht', route: null, huidigNiveau: null,
      voorwaarden: { voldoende: false },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je resultaat was onvoldoende. Dan is er geen basis voor een vrijstelling.',
    },
  ];
}

// -----------------------------------------------------------------------
// BURGERSCHAP, LOB, STAGE — korte route (§6.9)
// -----------------------------------------------------------------------
function korteRouteRegels() {
  return [
    {
      id: 'burgerschap-altijd-nee',
      bron: '§6.9 Burgerschap: vrijstelling is nooit mogelijk',
      onderwerp: 'burgerschap', route: null, huidigNiveau: null,
      voorwaarden: {},
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Voor burgerschap bestaat geen vrijstelling.',
    },
    {
      id: 'lob-met-groep-nee',
      bron: '§6.9 LOB: kan het programma met de groep volgen',
      onderwerp: 'lob', route: null, huidigNiveau: null,
      voorwaarden: { lobMetGroep: true },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je kunt het LOB-programma met je groep volgen. Dan is er geen vrijstelling mogelijk.',
    },
    {
      id: 'lob-niet-met-groep-onbekend',
      bron: '§6.9 LOB: kan het programma niet met de groep volgen — onderwijsteam beoordeelt',
      onderwerp: 'lob', route: null, huidigNiveau: null,
      voorwaarden: { lobMetGroep: false },
      uitkomst: 'onbekend', vrijstellingVoor: null,
      uitleg: 'Je kunt het LOB-programma niet met je groep volgen. Het onderwijsteam beoordeelt of een uitzondering mogelijk is.',
    },
    {
      id: 'stage-geen-werkervaring-nee',
      bron: '§6.9 Stage: geen langdurige werkervaring in dit beroep',
      onderwerp: 'stage', route: null, huidigNiveau: null,
      voorwaarden: { langdurigeWerkervaring: false },
      uitkomst: 'nee', vrijstellingVoor: null,
      uitleg: 'Je werkte nog niet langere tijd in dit beroep. Voor stage bestaat geen aparte vrijstellingsaanvraag; dit loopt via de opleiding.',
    },
    {
      id: 'stage-wel-werkervaring-onbekend',
      bron: '§6.9 Stage: wel langdurige werkervaring — teammanager beoordeelt',
      onderwerp: 'stage', route: null, huidigNiveau: null,
      voorwaarden: { langdurigeWerkervaring: true },
      uitkomst: 'onbekend', vrijstellingVoor: null,
      uitleg: 'Je werkte al langere tijd in dit beroep. De teammanager beoordeelt of die werkervaring de stage mag vervangen.',
    },
  ];
}

// -----------------------------------------------------------------------
// BUITENLANDS DIPLOMA — altijd maatwerk (§6.10)
// -----------------------------------------------------------------------
function buitenlandsRegels() {
  return [
    {
      id: 'buitenlands-altijd-onbekend',
      bron: '§6.10 Buitenlands diploma: altijd maatwerk, gelijkwaardigheid nooit door de tool beoordeeld',
      onderwerp: 'buitenlands', route: null, huidigNiveau: null,
      voorwaarden: {},
      uitkomst: 'onbekend', vrijstellingVoor: null,
      uitleg: 'Een buitenlands diploma kan formeel aanleiding zijn voor vrijstelling, maar dat is altijd maatwerk. Gelijkwaardigheid wordt nooit door deze tool beoordeeld.',
    },
  ];
}

// -----------------------------------------------------------------------
// Alle regels samengevoegd. Elk topic krijgt zijn uitsluitingsregels erbij
// (behalve de korte-route-onderwerpen en buitenlands, die geen bewijsstuk-
// vraag met cijfer/ouderdom kennen).
// -----------------------------------------------------------------------
// Let op: uitsluitingsregels() geeft de §6.3-uitsluitingen die draaien op
// een open "wat is je bewijsstuk"-vraag (EVC, niet-erkend, hbo/wo, ...).
// Die vraag bestaat alleen bij nederlands/engels/rekenen. Keuzedelen en
// beroepsgerichte examens hebben hun eigen, volledige uitsluitingslogica
// in §6.7/§6.8 (situatie, voldoende, cohort) en krijgen deze niet nog eens
// extra opgelegd.
const REGELS = [
  ...nederlandsRegels(), ...uitsluitingsregels('nederlands'),
  ...engelsRegels(), ...uitsluitingsregels('engels'),
  ...rekenenRegels(), ...uitsluitingsregels('rekenen'),
  ...keuzedeelRegels(),
  ...beroepsgerichtRegels(),
  ...korteRouteRegels(),
  ...buitenlandsRegels(),
];

// -----------------------------------------------------------------------
// VRAAGTEKSTEN — labels voor vragen en antwoordopties. Dit is puur tekst,
// geen beslislogica: pas dit gerust aan zonder engine.js of ui.js te lezen.
// De sleutels (zoals 'nl-ceie-2f-heel') moeten overeenkomen met de
// `voorwaarden`-waarden hierboven.
// -----------------------------------------------------------------------

// Hoeveel vragen ongeveer, voor de voortgangsindicator. Een schatting.
const VRAGEN_SCHATTING = {
  nederlands: 5, engels: 5, rekenen: 5,
  keuzedeel: 2, beroepsgericht: 1,
  burgerschap: 1, lob: 2, stage: 2, buitenlands: 3,
};

// Cijferbereik-labels — gedeeld door alle onderwerpen (§6.1).
const CIJFER_LABELS = {
  'vanaf-6,5': '6,5 of hoger', 'onder-6,5': 'Lager dan 6,5',
  'vanaf-6,0': '6,0 of hoger', 'onder-6,0': 'Lager dan 6,0',
  'vanaf-5,5': '5,5 of hoger', 'onder-5,5': 'Lager dan 5,5',
  '4-tot-5,5': 'Tussen de 4 en 5,5', 'onder-4': 'Lager dan 4',
};
const CIJFER_HAVO_VWO_LABELS = { 'vanaf-6': '6 of hoger', 'onder-6': 'Lager dan 6' };

// Bewijsstuk-labels per onderwerp. 'groep' is alleen voor het overzichtelijk
// groeperen van de knoppen op het scherm, geen beslislogica.
const BEWIJSSTUK_LABELS = {
  nederlands: {
    'nl-ceie-2f-heel': { label: 'Een cijferlijst met het hele examen Nederlands op taalniveau 2F (landelijk + schoolexamen samen)', groep: 'Taalniveau 2F' },
    'nl-ce-2f-lezen-luisteren': { label: 'Een cijferlijst met het landelijke examen Nederlands lezen/luisteren op 2F', groep: 'Taalniveau 2F' },
    'nl-ie-2f-onderdeel': { label: 'Een cijferlijst met één onderdeel van het schoolexamen Nederlands op 2F', groep: 'Taalniveau 2F' },
    'nl-ceie-3f-heel': { label: 'Een cijferlijst met het hele examen Nederlands op taalniveau 3F (landelijk + schoolexamen samen)', groep: 'Taalniveau 3F' },
    'nl-ceie-3f-onderdeel': { label: 'Een cijferlijst met één onderdeel van het examen Nederlands op 3F', groep: 'Taalniveau 3F' },
    'nl-havo-vwo-eindexamen': { label: 'Een havo- of vwo-diploma met Nederlands als eindexamenvak', groep: 'Diploma' },
    'nl-k0071': { label: 'Het extra vak (keuzedeel) Nederlands 3F, code K0071', groep: 'Extra vak' },
    'nl-alleen-2f-niveau': { label: 'Alleen een bewijsstuk op taalniveau 2F (niet op 3F)', groep: 'Anders' },
    'nl-3f-bewijsstuk-geen-cijfergrens': { label: 'Een erkend bewijsstuk voor Nederlands 3F (het cijfer maakt hier niet uit)', groep: 'Taalniveau 3F' },
    'evc': { label: 'Een EVC-verklaring (eerder verworven competenties)', groep: 'Anders' },
    'remedierend-keuzedeel': { label: 'Een extra vak dat je deed om je niveau bij te spijkeren (een remediërend keuzedeel)', groep: 'Anders' },
    'hbo-wo': { label: 'Een resultaat van het hbo of een universiteit', groep: 'Anders' },
    'niet-erkend': { label: 'Iets anders — ik weet niet zeker of dit een erkend bewijsstuk is', groep: 'Anders' },
  },
  engels: {
    'en-mbo': { label: 'Een mbo-diploma, mbo-certificaat of mbo-verklaring met het vak Engels', groep: 'Mbo' },
    'en-havo': { label: 'Een havo-diploma of havo-certificaat met het vak Engels', groep: 'Havo' },
    'en-vwo': { label: 'Een vwo-diploma of vwo-certificaat met het vak Engels', groep: 'Vwo' },
    'en-k0802': { label: 'Het extra vak (keuzedeel) Engels B1/A2, code K0802', groep: 'Extra vak' },
    'en-k0803': { label: 'Het extra vak (keuzedeel) Engels B1/B2, code K0803', groep: 'Extra vak' },
    'en-ce-b1-ie-a2': { label: 'Een cijferlijst met het landelijke examen Engels B1 en het schoolexamen Engels A2', groep: 'Cijferlijst' },
    'en-ce-b1-lezen-luisteren': { label: 'Een cijferlijst met het landelijke examen Engels B1 lezen/luisteren', groep: 'Cijferlijst' },
    'en-ie-a2-gemiddeld': { label: 'Een cijferlijst met het schoolexamen Engels A2, gemiddeld resultaat', groep: 'Cijferlijst' },
    'en-ie-a2-deelresultaat': { label: 'Een cijferlijst met één onderdeel van het schoolexamen Engels A2', groep: 'Cijferlijst' },
    'en-hg-hoger-gemiddeld': { label: 'Een cijferlijst met een gemiddeld resultaat Engels B1/A2 of B1/B1', groep: 'Cijferlijst' },
    'en-b1b2-niveau3-eerder-behaald': { label: 'Het extra vak (keuzedeel) Engels B1/B2, al eerder behaald op niveau 3', groep: 'Extra vak' },
    'cambridge-anglia-vo': { label: 'Een Cambridge- of Anglia-certificaat van de middelbare school (vo)', groep: 'Anders' },
    'hbo-wo': { label: 'Een resultaat van het hbo of een universiteit', groep: 'Anders' },
    'evc': { label: 'Een EVC-verklaring (eerder verworven competenties)', groep: 'Anders' },
    'remedierend-keuzedeel': { label: 'Een extra vak dat je deed om je niveau bij te spijkeren (een remediërend keuzedeel)', groep: 'Anders' },
    'niet-erkend': { label: 'Iets anders — ik weet niet zeker of dit een erkend bewijsstuk is', groep: 'Anders' },
  },
  rekenen: {
    're-niveau2-of-mbo2f': { label: 'Rekenniveau 2 gehaald, of het mbo-examen rekenen 2F', groep: 'Rekenniveau' },
    're-niveau3-of-mbo2f': { label: 'Rekenniveau 3 gehaald, of het mbo-examen rekenen 2F', groep: 'Rekenniveau' },
    're-niveau4': { label: 'Rekenniveau 4 gehaald', groep: 'Rekenniveau' },
    're-3f': { label: 'Het examen rekenen 3F gehaald (zonder verdere bron genoemd)', groep: 'Rekenen 3F' },
    're-mbo-3f': { label: 'Het mbo-examen rekenen 3F gehaald', groep: 'Rekenen 3F' },
    're-havo-3f': { label: 'De rekentoets havo 3F gehaald', groep: 'Rekenen 3F' },
    're-vmbo-3f': { label: 'Een rekenresultaat van het vmbo op 3F', groep: 'Rekenen 3F' },
    're-vmbo-2f': { label: 'Een rekenresultaat van het vmbo op 2F', groep: 'Rekenen 2F' },
    're-2n': { label: 'Rekenen 2N gehaald', groep: 'Rekenen N' },
    're-2f-of-3n': { label: 'Rekenen 2F of 3N gehaald', groep: 'Rekenen N' },
    're-3f-of-4n': { label: 'Rekenen 3F of 4N gehaald', groep: 'Rekenen N' },
    're-k0089-k1130': { label: 'Het extra vak (keuzedeel) Rekenen 3F, code K0089 of K1130', groep: 'Extra vak' },
    're-2f-of-niveau2': { label: 'Rekenen 2F of rekenniveau 2 gehaald', groep: 'Rekenniveau' },
    're-2f-of-niveau3': { label: 'Rekenen 2F of rekenniveau 3 gehaald', groep: 'Rekenniveau' },
    're-3f-of-niveau4': { label: 'Rekenen 3F of rekenniveau 4 gehaald', groep: 'Rekenniveau' },
    're-32-keuzedeel-3f': { label: 'Ik heb het extra vak rekenen op 3F gehaald', groep: 'Rekenen 3F' },
    'wiskunde-havo-vwo': { label: 'Een wiskunderesultaat van havo of vwo', groep: 'Anders' },
    'hbo-wo': { label: 'Een resultaat van het hbo of een universiteit', groep: 'Anders' },
    'evc': { label: 'Een EVC-verklaring (eerder verworven competenties)', groep: 'Anders' },
    'remedierend-keuzedeel': { label: 'Een extra vak dat je deed om je niveau bij te spijkeren (een remediërend keuzedeel)', groep: 'Anders' },
    'niet-erkend': { label: 'Iets anders — ik weet niet zeker of dit een erkend bewijsstuk is', groep: 'Anders' },
  },
};

const SITUATIE_LABELS = {
  'zelfde-keuzedeel': 'Precies hetzelfde extra vak (keuzedeel) als eerder',
  'ander-of-lijkend': 'Een ander of lijkend extra vak, of delen van een kwalificatie',
  'remedierend': 'Een extra vak dat je deed om je niveau bij te spijkeren (een remediërend keuzedeel)',
  'dubbel-gebruik': 'Hetzelfde extra vak dat al meetelt voor iets anders in mijn opleiding',
};

// Vraagteksten en opties voor de "context"-vragen (§5.2: pas als laatste).
const CONTEXT_VRAGEN = {
  huidigNiveau: {
    vraag: 'Op welk niveau doe je nu je opleiding?',
    opties: [
      { waarde: 1, label: 'Niveau 1' }, { waarde: 2, label: 'Niveau 2' },
      { waarde: 3, label: 'Niveau 3' }, { waarde: 4, label: 'Niveau 4' },
    ],
  },
  heeftEerdereMbo: {
    vraag: 'Heb je hiervoor al een andere mbo-opleiding gevolgd?',
    opties: [
      { waarde: true, label: 'Ja' },
      { waarde: false, label: 'Nee, ik kom van het vmbo, de havo, het vwo of van buiten het onderwijs' },
    ],
  },
  vorigNiveau: {
    vraag: 'Op welk niveau was die vorige mbo-opleiding?',
    opties: [
      { waarde: 1, label: 'Niveau 1' }, { waarde: 2, label: 'Niveau 2' },
      { waarde: 3, label: 'Niveau 3' }, { waarde: 4, label: 'Niveau 4' },
    ],
  },
  jaarBewijsstuk: {
    vraag: 'In welk jaar heb je dat diploma of certificaat gehaald?',
    opties: [
      { waarde: 'vanaf-grensjaar', label: `${GRENSJAAR_10_JAAR} of later` },
      { waarde: 'voor-grensjaar', label: `Vóór ${GRENSJAAR_10_JAAR}` },
    ],
  },
  eerderOnvoldoende: {
    vraag: 'Was je resultaat hiervoor een onvoldoende?',
    opties: [{ waarde: true, label: 'Ja' }, { waarde: false, label: 'Nee' }],
  },
  gestartVoor2022: {
    vraag: 'Ben je met je huidige opleiding gestart vóór schooljaar 2022-2023?',
    opties: [{ waarde: true, label: 'Ja' }, { waarde: false, label: 'Nee, in 2022-2023 of later' }],
  },
  cohortVanaf2020: {
    vraag: 'Ben je met je huidige opleiding gestart in schooljaar 2020-2021 of later?',
    opties: [{ waarde: true, label: 'Ja' }, { waarde: false, label: 'Nee, eerder' }],
  },
  voldoende: {
    vraag: 'Was je eindresultaat een voldoende (minimaal een 6, of "voldoende")?',
    opties: [{ waarde: true, label: 'Ja' }, { waarde: false, label: 'Nee' }],
  },
  situatie: {
    vraag: 'Welke situatie past het best?',
    opties: Object.entries(SITUATIE_LABELS).map(([waarde, label]) => ({ waarde, label })),
  },
  lobMetGroep: {
    vraag: 'Kun je het LOB-programma met je groep volgen?',
    opties: [{ waarde: true, label: 'Ja' }, { waarde: false, label: 'Nee' }],
  },
  langdurigeWerkervaring: {
    vraag: 'Werkte je al langere tijd in dit beroep toen je aan deze opleiding begon?',
    opties: [{ waarde: true, label: 'Ja' }, { waarde: false, label: 'Nee' }],
  },
};

if (typeof window !== 'undefined') {
  window.VRAGEN_SCHATTING = VRAGEN_SCHATTING;
  window.CIJFER_LABELS = CIJFER_LABELS;
  window.CIJFER_HAVO_VWO_LABELS = CIJFER_HAVO_VWO_LABELS;
  window.BEWIJSSTUK_LABELS = BEWIJSSTUK_LABELS;
  window.SITUATIE_LABELS = SITUATIE_LABELS;
  window.CONTEXT_VRAGEN = CONTEXT_VRAGEN;
}

// In een browser zonder modules: alles hangt aan het globale window-object.
if (typeof window !== 'undefined') {
  window.REGELING_VERSIE = REGELING_VERSIE;
  window.LAATST_BIJGEWERKT = LAATST_BIJGEWERKT;
  window.HUIDIG_JAAR = HUIDIG_JAAR;
  window.GRENSJAAR_10_JAAR = GRENSJAAR_10_JAAR;
  window.ONDERWERPEN = ONDERWERPEN;
  window.REGELS = REGELS;
  window.BEREIK_65 = BEREIK_65;
  window.BEREIK_60 = BEREIK_60;
  window.BEREIK_55 = BEREIK_55;
  window.BEREIK_REKENEN_3F = BEREIK_REKENEN_3F;
}
// In Node (voor het draaien van tests buiten de browser, mocht dat nodig zijn).
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    REGELING_VERSIE, LAATST_BIJGEWERKT, HUIDIG_JAAR, GRENSJAAR_10_JAAR, ONDERWERPEN, REGELS,
    BEREIK_65, BEREIK_60, BEREIK_55, BEREIK_REKENEN_3F,
    VRAGEN_SCHATTING, CIJFER_LABELS, CIJFER_HAVO_VWO_LABELS,
    BEWIJSSTUK_LABELS, SITUATIE_LABELS, CONTEXT_VRAGEN,
  };
}
