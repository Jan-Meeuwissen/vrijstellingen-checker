/**
 * cases.js — de 32 testgevallen uit §12.1 van de bouwopdracht. Elk geval
 * is een complete antwoordenset; test/run.html speelt die af via
 * `simuleerPad()` uit js/engine.js en vergelijkt de uitkomst met wat hier
 * verwacht wordt.
 *
 * `antwoorden` bevat de ruwe waarden zoals de motor ze gebruikt (zie
 * js/regels.js voor de betekenis van elke bewijsstuk-code). Waar het
 * testgeval geen uitspraak doet over ouderdom of eerdere onvoldoendes is
 * dat stilzwijgend "nee"/"schoon" (dat hoort bij de beschrijving).
 *
 * Testgevallen 33 t/m 37 zijn toegevoegd naar aanleiding van
 * VERVOLGOPDRACHT-01.md (A1, A3, A2, B1).
 */

const SCHOON = { jaarBewijsstuk: 'vanaf-grensjaar', eerderOnvoldoende: false };

const TESTGEVALLEN = [
  {
    nr: 1, omschrijving: 'Nederlands. Eerste mbo, niveau 3. Vmbo-diploma, Nederlands 2F, cijfer ≥ 6,5.',
    antwoorden: { onderwerp: 'nederlands', huidigNiveau: 3, heeftEerdereMbo: false, bewijsstuk: 'nl-ceie-2f-heel', cijfer: 'vanaf-6,5', ...SCHOON },
    verwacht: 'ja',
  },
  {
    nr: 2, omschrijving: 'Nederlands. Eerste mbo, niveau 4. Vmbo-diploma, Nederlands 2F, cijfer ≥ 6,5.',
    toelichting: 'niveau 4 vraagt 3F',
    antwoorden: { onderwerp: 'nederlands', huidigNiveau: 4, heeftEerdereMbo: false, bewijsstuk: 'nl-alleen-2f-niveau', ...SCHOON },
    verwacht: 'nee',
  },
  {
    nr: 3, omschrijving: 'Nederlands. Eerste mbo, niveau 3. Havo-diploma, Nederlands lager dan 6.',
    antwoorden: { onderwerp: 'nederlands', huidigNiveau: 3, heeftEerdereMbo: false, bewijsstuk: 'nl-havo-vwo-eindexamen', cijferHavoVwo: 'onder-6', ...SCHOON },
    verwacht: 'nee',
  },
  {
    nr: 4, omschrijving: 'Nederlands. Was niveau 4, nu 3. Nederlands 3F afgerond, cijfer onbekend.',
    toelichting: 'beide routes tonen, geen cijfervraag stellen',
    antwoorden: { onderwerp: 'nederlands', huidigNiveau: 3, heeftEerdereMbo: true, vorigNiveau: 4, bewijsstuk: 'nl-3f-bewijsstuk-geen-cijfergrens', ...SCHOON },
    verwacht: 'ja',
    controleerGeenVeld: ['cijfer', 'cijferHavoVwo'],
  },
  {
    nr: 5, omschrijving: 'Nederlands. Vorige mbo niveau 2, nu 3. CE/IE 2F lager dan 6,5.',
    antwoorden: { onderwerp: 'nederlands', huidigNiveau: 3, heeftEerdereMbo: true, vorigNiveau: 2, bewijsstuk: 'nl-ceie-2f-heel', cijfer: 'onder-6,5', ...SCHOON },
    verwacht: 'nee',
  },
  {
    nr: 6, omschrijving: 'Engels. Eerste mbo, niveau 4. Vwo-diploma, Engels ≥ 6,0.',
    antwoorden: { onderwerp: 'engels', huidigNiveau: 4, heeftEerdereMbo: false, bewijsstuk: 'en-vwo', cijfer: 'vanaf-6,0', ...SCHOON },
    verwacht: 'ja',
  },
  {
    nr: 7, omschrijving: 'Engels. Vorige mbo niveau 3, nu niveau 3. Mbo-diploma, Engels ≥ 6,0.',
    toelichting: 'via het vangnet',
    antwoorden: { onderwerp: 'engels', huidigNiveau: 3, heeftEerdereMbo: true, vorigNiveau: 3, bewijsstuk: 'en-mbo', cijfer: 'vanaf-6,0', ...SCHOON },
    verwacht: 'ja',
    controleerVangnet: true,
  },
  {
    nr: 8, omschrijving: 'Engels. Vorige mbo niveau 2, nu 3. Mbo-diploma, Engels ≥ 6,0.',
    toelichting: 'via het vangnet',
    antwoorden: { onderwerp: 'engels', huidigNiveau: 3, heeftEerdereMbo: true, vorigNiveau: 2, bewijsstuk: 'en-mbo', cijfer: 'vanaf-6,0', ...SCHOON },
    verwacht: 'ja',
    controleerVangnet: true,
  },
  {
    nr: 9, omschrijving: 'Engels. Cambridge-certificaat van de havo.',
    antwoorden: { onderwerp: 'engels', huidigNiveau: 3, heeftEerdereMbo: false, bewijsstuk: 'cambridge-anglia-vo', ...SCHOON },
    verwacht: 'nee',
  },
  {
    nr: 10, omschrijving: 'Engels. Hbo-propedeuse, Engels een 8.',
    antwoorden: { onderwerp: 'engels', huidigNiveau: 3, heeftEerdereMbo: false, bewijsstuk: 'hbo-wo', ...SCHOON },
    verwacht: 'nee',
  },
  {
    nr: 11, omschrijving: 'Engels. Eerste mbo, niveau 2. Havo-certificaat, Engels ≥ 6,0.',
    antwoorden: { onderwerp: 'engels', huidigNiveau: 2, heeftEerdereMbo: false, bewijsstuk: 'en-havo', cijfer: 'vanaf-6,0', ...SCHOON },
    verwacht: 'ja',
  },
  {
    nr: 12, omschrijving: 'Rekenen. Eerste mbo, niveau 4. Rekentoets havo 3F ≥ 5,5.',
    antwoorden: { onderwerp: 'rekenen', huidigNiveau: 4, heeftEerdereMbo: false, bewijsstuk: 're-havo-3f', cijfer: 'vanaf-5,5', ...SCHOON },
    verwacht: 'ja',
  },
  {
    nr: 13, omschrijving: 'Rekenen. Eerste mbo, niveau 3. Vmbo rekenen 2F.',
    antwoorden: { onderwerp: 'rekenen', huidigNiveau: 3, heeftEerdereMbo: false, bewijsstuk: 're-vmbo-2f', ...SCHOON },
    verwacht: 'nee',
  },
  {
    nr: 14, omschrijving: 'Rekenen. Wiskunde B havo.',
    antwoorden: { onderwerp: 'rekenen', huidigNiveau: 3, heeftEerdereMbo: false, bewijsstuk: 'wiskunde-havo-vwo', ...SCHOON },
    verwacht: 'nee',
  },
  {
    nr: 15, omschrijving: 'Rekenen. Niveau 3. Rekenen 3F, cijfer tussen 4 en 5,5.',
    toelichting: 'slaag-/zakvoorwaarde noemen',
    antwoorden: { onderwerp: 'rekenen', huidigNiveau: 3, heeftEerdereMbo: false, bewijsstuk: 're-3f', cijfer: '4-tot-5,5', ...SCHOON },
    verwacht: 'onbekend',
  },
  {
    nr: 16, omschrijving: 'Rekenen. Vorige mbo niveau 3, nu 4. Rekenen 3F ≥ 5,5.',
    antwoorden: { onderwerp: 'rekenen', huidigNiveau: 4, heeftEerdereMbo: true, vorigNiveau: 3, bewijsstuk: 're-3f-of-4n', cijfer: 'vanaf-5,5', ...SCHOON },
    verwacht: 'ja',
  },
  {
    nr: 17, omschrijving: 'Rekenen. Eerste mbo, niveau 3. Vmbo-diploma met rekenen 3F ≥ 5,5.',
    antwoorden: { onderwerp: 'rekenen', huidigNiveau: 3, heeftEerdereMbo: false, bewijsstuk: 're-3f', cijfer: 'vanaf-5,5', ...SCHOON },
    verwacht: 'ja',
  },
  {
    nr: 18, omschrijving: 'Burgerschap.',
    toelichting: 'geen Eduarte in de uitkomsttekst',
    antwoorden: { onderwerp: 'burgerschap' },
    verwacht: 'nee',
  },
  {
    nr: 19, omschrijving: 'LOB, kan het programma met de groep volgen.',
    toelichting: 'geen Eduarte',
    antwoorden: { onderwerp: 'lob', lobMetGroep: true },
    verwacht: 'nee',
  },
  {
    nr: 20, omschrijving: 'LOB, kan dat niet.',
    toelichting: 'geen Eduarte',
    antwoorden: { onderwerp: 'lob', lobMetGroep: false },
    verwacht: 'onbekend',
  },
  {
    nr: 21, omschrijving: 'Stage, geen langdurige werkervaring.',
    toelichting: 'geen Eduarte',
    antwoorden: { onderwerp: 'stage', langdurigeWerkervaring: false },
    verwacht: 'nee',
  },
  {
    nr: 22, omschrijving: 'Stage, wel langdurige werkervaring.',
    toelichting: 'geen Eduarte',
    antwoorden: { onderwerp: 'stage', langdurigeWerkervaring: true },
    verwacht: 'onbekend',
  },
  {
    nr: 23, omschrijving: 'Beroepsgericht. Kerntaakcertificaat van een andere opleiding, voldoende.',
    antwoorden: { onderwerp: 'beroepsgericht', voldoende: true },
    verwacht: 'onbekend',
  },
  {
    nr: 24, omschrijving: 'Keuzedeel. Precies hetzelfde keuzedeel eerder behaald, voldoende.',
    antwoorden: { onderwerp: 'keuzedeel', situatie: 'zelfde-keuzedeel', voldoende: true },
    verwacht: 'ja',
  },
  {
    nr: 25, omschrijving: 'Keuzedeel. Remediërend keuzedeel.',
    antwoorden: { onderwerp: 'keuzedeel', situatie: 'remedierend' },
    verwacht: 'nee',
  },
  {
    nr: 26, omschrijving: 'Keuzedeel. Afgesloten met een onvoldoende, cohort 2023.',
    antwoorden: { onderwerp: 'keuzedeel', situatie: 'zelfde-keuzedeel', voldoende: false, cohortVanaf2020: true },
    verwacht: 'onbekend',
  },
  {
    nr: 27, omschrijving: 'Keuzedeel. Lijkend maar ander keuzedeel, voldoende.',
    antwoorden: { onderwerp: 'keuzedeel', situatie: 'ander-of-lijkend' },
    verwacht: 'onbekend',
  },
  {
    nr: 28, omschrijving: 'Mbo-diploma van 12 jaar oud, ruim voldoende.',
    toelichting: '10-jaarregel — sinds vervolgopdracht 01 (B2) een jaartal-vraag i.p.v. "ouder dan 10 jaar?", en conclusie 3 i.p.v. 2 (hangt af van de startdatum van de opleiding)',
    antwoorden: { onderwerp: 'nederlands', huidigNiveau: 3, heeftEerdereMbo: false, bewijsstuk: 'nl-ceie-2f-heel', cijfer: 'vanaf-6,5', jaarBewijsstuk: 'voor-grensjaar', eerderOnvoldoende: false },
    verwacht: 'onbekend',
  },
  {
    nr: 29, omschrijving: 'Buitenlands diploma (Pools).',
    antwoorden: { onderwerp: 'buitenlands' },
    verwacht: 'onbekend',
  },
  {
    nr: 30, omschrijving: 'Certificaat particuliere avondcursus Engels.',
    antwoorden: { onderwerp: 'engels', huidigNiveau: 3, heeftEerdereMbo: false, bewijsstuk: 'niet-erkend', ...SCHOON },
    verwacht: 'onbekend',
  },
  {
    nr: 31, omschrijving: '"Weet ik niet" op een gegeven dat de gekozen regel nodig heeft.',
    antwoorden: { onderwerp: 'nederlands', huidigNiveau: 3, heeftEerdereMbo: false, bewijsstuk: 'nl-ceie-2f-heel', ...SCHOON },
    verwacht: 'onbekend',
  },
  {
    nr: 32, omschrijving: '"Weet ik niet" op het cijfer, terwijl de gekozen regel géén cijfer noemt (geval 4).',
    toelichting: 'de vraag mag dan niet eens gesteld worden',
    antwoorden: { onderwerp: 'nederlands', huidigNiveau: 3, heeftEerdereMbo: true, vorigNiveau: 4, bewijsstuk: 'nl-3f-bewijsstuk-geen-cijfergrens', ...SCHOON },
    verwacht: 'ja',
    controleerGeenVeld: ['cijfer', 'cijferHavoVwo'],
  },
  {
    nr: 33, omschrijving: 'Engels. Was niveau 4, nu 2 (afstroom). Gemiddeld resultaat B1/A2 ≥ 5,5.',
    toelichting: 'vervolgopdracht 01, A1 — deze route ontbrak eerder helemaal',
    antwoorden: { onderwerp: 'engels', huidigNiveau: 2, heeftEerdereMbo: true, vorigNiveau: 4, bewijsstuk: 'en-hg-hoger-gemiddeld', cijfer: 'vanaf-5,5', ...SCHOON },
    verwacht: 'ja',
  },
  {
    nr: 34, omschrijving: 'Rekenen. Was niveau 3, nu 2 (afstroom). Keuzedeel rekenen 3F behaald.',
    toelichting: 'vervolgopdracht 01, A3 — niet in de regeling, bevestigd door Jan: altijd conclusie 3, geen cijfervraag',
    antwoorden: { onderwerp: 'rekenen', huidigNiveau: 2, heeftEerdereMbo: true, vorigNiveau: 3, bewijsstuk: 're-32-keuzedeel-3f', ...SCHOON },
    verwacht: 'onbekend',
    controleerGeenVeld: ['cijfer'],
  },
  {
    nr: 35, omschrijving: 'Keuzedeel. Zelfde keuzedeel, onvoldoende, cohort vóór 2020.',
    toelichting: 'vervolgopdracht 01, A2 — was nee, moet onbekend zijn (compensatie mogelijk voor cohorten 2016-2019)',
    antwoorden: { onderwerp: 'keuzedeel', situatie: 'zelfde-keuzedeel', voldoende: false, cohortVanaf2020: false },
    verwacht: 'onbekend',
  },
  {
    nr: 36, omschrijving: 'Nederlands. Cijfer ≥ 6,5 gegeven — de aparte "was het onvoldoende?"-vraag mag dan niet meer gesteld worden.',
    toelichting: 'vervolgopdracht 01, B1',
    antwoorden: { onderwerp: 'nederlands', huidigNiveau: 3, heeftEerdereMbo: false, bewijsstuk: 'nl-ceie-2f-heel', cijfer: 'vanaf-6,5', jaarBewijsstuk: 'vanaf-grensjaar' },
    verwacht: 'ja',
    controleerGeenVeld: ['eerderOnvoldoende'],
  },
  {
    nr: 37, omschrijving: 'Nederlands. Cijfer onder 5,5 (keuzedeel K0071) — geen aparte onvoldoende-vraag, en de al vaststaande "nee" blijft staan.',
    toelichting: 'vervolgopdracht 01, B1 — bewuste afwijking: we laten een cijfer-onder-de-grens de al bepaalde "nee" niet overschrijven naar "onbekend", zie de toelichting in engine.js bij metAfgeleideVelden()',
    antwoorden: { onderwerp: 'nederlands', huidigNiveau: 3, heeftEerdereMbo: false, bewijsstuk: 'nl-k0071', cijfer: 'onder-5,5', jaarBewijsstuk: 'vanaf-grensjaar' },
    verwacht: 'nee',
    controleerGeenVeld: ['eerderOnvoldoende'],
  },
];

if (typeof window !== 'undefined') window.TESTGEVALLEN = TESTGEVALLEN;
if (typeof module !== 'undefined' && module.exports) module.exports = { TESTGEVALLEN };
