/**
 * engine.js — bepaalt op basis van de gegeven antwoorden óf de volgende
 * vraag, óf een uitkomst. Bevat geen inhoudelijke regels: die staan in
 * regels.js. Zie §7 van de bouwopdracht voor de werkwijze.
 *
 * Kern: `bepaal(antwoorden)` geeft altijd één van deze twee vormen terug:
 *   { type: 'vraag', veld, vraag, opties: [{waarde, label}, ...] }
 *   { type: 'uitkomst', uitkomst: 'ja'|'nee'|'onbekend', regel, viaVangnet }
 *
 * Dit bestand is puur en heeft geen state: dezelfde antwoorden geven altijd
 * dezelfde uitkomst. Dat maakt het ook headless testbaar (zie test/).
 */

// Volgorde van vragen bij een gelijke "score" in het splitsen van
// kandidaten (§5.2 noemt: onderwerp, dan bewijsstuk, dan wat erop staat,
// dan context). We wijken hiervan bewust af: huidig niveau en eerdere
// mbo-opleiding vragen we vóór het bewijsstuk, niet erna. Reden: zonder
// dat niveau al te kennen zou de bewijsstuk-vraag opties tonen die voor
// dat niveau niet relevant zijn (bv. een 2F-bewijsstuk aanbieden aan een
// niveau-4-student die 3F nodig heeft), en zou een mismatch niet meer
// herkenbaar zijn als "nee" zodra het niveau later alsnog bekend wordt.
// Zie de notitie in de opleverbrief aan Jan.
const VELD_VOLGORDE = [
  'huidigNiveau',
  'heeftEerdereMbo',
  'vorigNiveau',
  'bewijsstuk',
  'cijferHavoVwo',
  'cijfer',
  'situatie',
  'voldoende',
  'lobMetGroep',
  'langdurigeWerkervaring',
  'jaarBewijsstuk',
  'eerderOnvoldoende',
  'cohortVanaf2020',
  'gestartVoor2022',
];

const WEET_IK_NIET = '__weet_ik_niet__';

// Een waarde die gebruikt kan worden om kandidaten te filteren: alles
// behalve "nog niet gevraagd" en "weet ik niet" (dat laatste is wél een
// antwoord — de student heeft de vraag gehad — maar draagt geen informatie
// om regels op te filteren).
function waardeBekend(v) {
  return v !== undefined && v !== null && v !== WEET_IK_NIET;
}

// Is dit veld al aan de student voorgelegd (ongeacht of het antwoord
// "weet ik niet" was)? Gebruikt om te voorkomen dat de motor dezelfde
// vraag blijft herhalen nadat iemand "weet ik niet" heeft gekozen.
function isBeantwoord(v) {
  return v !== undefined;
}

// Berekent de route ('eerste' | 'lager-gelijk' | 'hoger') uit de ruwe
// antwoorden, of undefined als dat nog niet volledig vastligt (§6.2).
function berekenRoute(antwoorden) {
  if (!waardeBekend(antwoorden.heeftEerdereMbo)) return undefined;
  if (antwoorden.heeftEerdereMbo === false) return 'eerste';
  if (!waardeBekend(antwoorden.vorigNiveau) || !waardeBekend(antwoorden.huidigNiveau)) return undefined;
  return antwoorden.vorigNiveau <= antwoorden.huidigNiveau ? 'lager-gelijk' : 'hoger';
}

// Vervangt heeftEerdereMbo/vorigNiveau zodat de route geforceerd 'eerste'
// wordt, voor het vangnet uit §6.2 (huidigNiveau blijft gelijk).
function alsEersteRoute(antwoorden) {
  return { ...antwoorden, heeftEerdereMbo: false, vorigNiveau: undefined };
}

// Matcht één regel tegen de (deels) bekende antwoorden. Een veld dat nog
// niet beantwoord is, sluit een regel nooit uit — dat is hoe de motor
// "kandidaten" bepaalt volgens §7 stap 1.
function regelMatcht(regel, antwoorden) {
  if (regel.onderwerp !== antwoorden.onderwerp) return false;

  if (regel.route != null) {
    // Zodra heeftEerdereMbo bekend is, ligt al vast of route 'eerste' kan
    // zijn of niet — ook zonder vorigNiveau te kennen.
    if (waardeBekend(antwoorden.heeftEerdereMbo)) {
      const kanEerste = antwoorden.heeftEerdereMbo === false;
      if (regel.route === 'eerste' && !kanEerste) return false;
      if (regel.route !== 'eerste' && kanEerste) return false;
    }
    const route = berekenRoute(antwoorden);
    if (route !== undefined && route !== regel.route) return false;
  }
  if (regel.huidigNiveau != null) {
    if (waardeBekend(antwoorden.huidigNiveau) && !regel.huidigNiveau.includes(antwoorden.huidigNiveau)) return false;
  }
  if (regel.vorigNiveau != null) {
    if (waardeBekend(antwoorden.vorigNiveau) && antwoorden.vorigNiveau !== regel.vorigNiveau) return false;
  }

  for (const [veld, verwacht] of Object.entries(regel.voorwaarden || {})) {
    const waarde = antwoorden[veld];
    if (waardeBekend(waarde) && waarde !== verwacht) return false;
  }
  return true;
}

function vindKandidaten(regels, antwoorden) {
  return regels.filter((r) => regelMatcht(r, antwoorden));
}

// Onderdrukt de aparte "was je resultaat een onvoldoende?"-vraag zodra er
// al een cijferbereik bekend is (vervolgopdracht 01, B1): het cijfer dat de
// student net gaf ís voor déze vrijstellingsregel al de officiële grens
// (zie de tabellen in §6.4-6.6), dus nog een keer in het algemeen vragen
// "was het onvoldoende" is dubbelop.
//
// Bewuste keuze, en een afwijking van de letterlijke vervolgopdracht: we
// vullen hier altijd `false` in (nooit `true`), ook als het cijfer
// duidelijk onder de 5,5 lag. Reden: bij elk bewijsstuk+cijfer-paar ligt de
// onderwerp-specifieke uitkomst (ja/nee/onbekend) al volledig vast via de
// eigen cijfergrens van die regel — dat IS al de regeling-eigen beoordeling
// van "voldoende of niet" voor déze vrijstelling. Zou je hier `true`
// invullen, dan wint de generieke §6.3-uitsluiting (eerder onvoldoende →
// mogelijk compensatie, dus onbekend) altijd van een reeds vastgestelde
// "nee" — dat verandert dan stilzwijgend een duidelijke afwijzing in "kan
// ik niet beoordelen", wat nergens in de regeling wordt gevraagd en o.a.
// testgeval 3/5 uit de oorspronkelijke bouwopdracht zou tegenspreken. Zie
// de opleverbrief.
function metAfgeleideVelden(antwoorden) {
  if (isBeantwoord(antwoorden.eerderOnvoldoende)) return antwoorden;
  if (!waardeBekend(antwoorden.cijfer) && !waardeBekend(antwoorden.cijferHavoVwo)) return antwoorden;
  return { ...antwoorden, eerderOnvoldoende: false };
}

// Matcht de regel, én is elk veld waar de regel iets van vindt ook
// daadwerkelijk (bekend) beantwoord — niet slechts "nog niet tegengesproken".
// Gebruikt om te bepalen of een regel definitief van toepassing is, ook als
// er elders nog onbeantwoorde vragen openstaan.
function regelVolledigVoldaan(regel, antwoorden) {
  if (!regelMatcht(regel, antwoorden)) return false;
  if (regel.route != null && !waardeBekend(berekenRoute(antwoorden))) return false;
  if (regel.huidigNiveau != null && !waardeBekend(antwoorden.huidigNiveau)) return false;
  if (regel.vorigNiveau != null && !waardeBekend(antwoorden.vorigNiveau)) return false;
  for (const veld of Object.keys(regel.voorwaarden || {})) {
    if (!waardeBekend(antwoorden[veld])) return false;
  }
  return true;
}

// Onderwerp-specifieke kandidaten: alles behalve de generieke §6.3-
// uitsluitingen (die hebben `algemeen: true` en blijven anders altijd
// kandidaat, ook als de gekozen route/niveau geen enkele echte regel meer
// oplevert — precies de situatie waarin het vangnet moet ingrijpen).
function heeftOnderwerpSpecifiekeKandidaat(kandidaten) {
  return kandidaten.some((r) => !r.algemeen);
}

// Domein van mogelijke waarden voor een veld. Voor niveau/eerdere-mbo
// gebruiken we het volledige, vaste domein (1 t/m 4, true/false) — ook als
// maar één kandidaat er iets van vindt, want dat ene antwoord kan die
// kandidaat alsnog laten afvallen (zie test 2 in §12.1: een 2F-bewijsstuk
// bij niveau 4 moet "nee" opleveren, niet "geen regel gevonden").
// Velden waarvan "geen van deze/niet van toepassing" nergens als losse
// regel is vastgelegd (er bestaat geen expliciete "niet onvoldoende"-regel
// — dat is domweg de afwezigheid van de uitsluiting). Zonder het volledige
// domein hier op te geven, zou de motor nooit doorhebben dat dit veld nog
// iets kan uitsluiten en de vraag dus overslaan.
const VOLLEDIGE_DOMEINEN = {
  heeftEerdereMbo: [true, false],
  eerderOnvoldoende: [true, false],
  jaarBewijsstuk: ['vanaf-grensjaar', 'voor-grensjaar'],
};

function veldDomein(veld, kandidaten) {
  if (veld === 'huidigNiveau' || veld === 'vorigNiveau') return [1, 2, 3, 4];
  if (VOLLEDIGE_DOMEINEN[veld]) return VOLLEDIGE_DOMEINEN[veld];
  const waarden = new Set();
  for (const regel of kandidaten) {
    if (regel.voorwaarden && veld in regel.voorwaarden) waarden.add(regel.voorwaarden[veld]);
  }
  return [...waarden];
}

// Is het zinvol dit veld te vragen? Ja, als er minstens één mogelijk
// antwoord is dat de huidige kandidatenlijst daadwerkelijk zou verkleinen.
function veldIsZinvol(veld, kandidaten, antwoorden) {
  const domein = veldDomein(veld, kandidaten);
  if (domein.length < 2) return false;
  return domein.some((waarde) => {
    const proef = { ...antwoorden, [veld]: waarde };
    return vindKandidaten(kandidaten, proef).length < kandidaten.length;
  });
}

function kiesVolgendeVeld(kandidaten, antwoorden) {
  for (const veld of VELD_VOLGORDE) {
    if (isBeantwoord(antwoorden[veld])) continue;
    if (veld === 'vorigNiveau' && antwoorden.heeftEerdereMbo !== true) continue;
    if (veldIsZinvol(veld, kandidaten, antwoorden)) return veld;
  }
  return null;
}

function veldNaarVraag(veld, kandidaten, antwoorden, data) {
  return { type: 'vraag', ...veldNaarVraagData(veld, kandidaten, antwoorden, data) };
}

function veldNaarVraagData(veld, kandidaten, antwoorden, data) {
  if (veld === 'bewijsstuk') {
    const labels = data.BEWIJSSTUK_LABELS[antwoorden.onderwerp] || {};
    const waarden = [...new Set(kandidaten.map((r) => r.voorwaarden && r.voorwaarden.bewijsstuk).filter(Boolean))];
    const opties = waarden.map((w) => ({ waarde: w, label: (labels[w] && labels[w].label) || w, groep: labels[w] && labels[w].groep }));
    return { veld, vraag: 'Wat is je bewijsstuk, en wat staat erop?', opties };
  }
  if (veld === 'cijfer') {
    const waarden = [...new Set(kandidaten.map((r) => r.voorwaarden && r.voorwaarden.cijfer).filter(Boolean))];
    const opties = waarden.map((w) => ({ waarde: w, label: data.CIJFER_LABELS[w] || w }));
    return { veld, vraag: 'Wat was je cijfer?', opties };
  }
  if (veld === 'cijferHavoVwo') {
    const waarden = [...new Set(kandidaten.map((r) => r.voorwaarden && r.voorwaarden.cijferHavoVwo).filter(Boolean))];
    const opties = waarden.map((w) => ({ waarde: w, label: data.CIJFER_HAVO_VWO_LABELS[w] || w }));
    return { veld, vraag: 'Wat was je cijfer voor Nederlands op je havo- of vwo-diploma?', opties };
  }
  if (veld === 'situatie') {
    const waarden = [...new Set(kandidaten.map((r) => r.voorwaarden && r.voorwaarden.situatie).filter(Boolean))];
    const opties = waarden.map((w) => ({ waarde: w, label: data.SITUATIE_LABELS[w] || w }));
    return { veld, vraag: data.CONTEXT_VRAGEN.situatie.vraag, opties };
  }
  if (data.CONTEXT_VRAGEN[veld]) {
    return { veld, vraag: data.CONTEXT_VRAGEN[veld].vraag, opties: data.CONTEXT_VRAGEN[veld].opties };
  }
  return { veld, vraag: veld, opties: [] };
}

// De onderwerpen waarvan de tabellen op route/niveau zijn gebouwd en dus
// het vangnet uit §6.2 kunnen gebruiken.
const ONDERWERPEN_MET_VANGNET = ['nederlands', 'engels', 'rekenen'];

/**
 * bepaal(antwoorden, data?) — het hart van de engine. `data` is optioneel
 * en dient alleen om in Node (buiten de browser) regels.js expliciet mee
 * te geven; in de browser wordt automatisch `window` gebruikt.
 */
function bepaal(antwoorden, data) {
  data = data || (typeof window !== 'undefined' ? window : globalThis);
  const regels = data.REGELS;

  if (!waardeBekend(antwoorden.onderwerp)) {
    return { type: 'vraag', veld: 'onderwerp', vraag: 'Waar gaat het om?', opties: data.ONDERWERPEN.map((o) => ({ waarde: o.id, label: o.label })) };
  }

  antwoorden = metAfgeleideVelden(antwoorden);

  let kandidaten = vindKandidaten(regels, antwoorden);
  let effectieveAntwoorden = antwoorden;
  let viaVangnet = false;

  if (
    !heeftOnderwerpSpecifiekeKandidaat(kandidaten) &&
    ONDERWERPEN_MET_VANGNET.includes(antwoorden.onderwerp) &&
    antwoorden.heeftEerdereMbo === true &&
    waardeBekend(antwoorden.huidigNiveau)
  ) {
    const vangnetAntwoorden = alsEersteRoute(antwoorden);
    const vangnetKandidaten = vindKandidaten(regels, vangnetAntwoorden);
    if (heeftOnderwerpSpecifiekeKandidaat(vangnetKandidaten)) {
      kandidaten = vangnetKandidaten;
      effectieveAntwoorden = vangnetAntwoorden;
      viaVangnet = true;
    }
  }

  if (kandidaten.length === 0) {
    // Geen enkele regel past meer (en het vangnet hielp niet of was niet
    // van toepassing): niets verzinnen, uitkomst 3.
    return { type: 'uitkomst', uitkomst: 'onbekend', regel: null, viaVangnet };
  }

  // Een generieke §6.3-uitsluiting (`algemeen: true`) wint altijd, zodra
  // aan al haar eigen voorwaarden is voldaan — ook als er nog een
  // onderwerp-specifieke regel openstaat die een andere kant op wijst of
  // nog vragen nodig heeft. Dat is precies wat "dan is de uitkomst meteen
  // nee" in §6.3 betekent: dit is geen kandidaat die nog moet concurreren,
  // het is een korte-sluiting.
  const voldaneUitsluiting = kandidaten.find((r) => r.algemeen && regelVolledigVoldaan(r, effectieveAntwoorden));
  if (voldaneUitsluiting) {
    return { type: 'uitkomst', uitkomst: voldaneUitsluiting.uitkomst, regel: voldaneUitsluiting, viaVangnet };
  }

  const uitkomsten = new Set(kandidaten.map((r) => r.uitkomst));
  if (uitkomsten.size === 1) {
    const representant = kandidaten.find((r) => !r.algemeen) || kandidaten[0];
    return { type: 'uitkomst', uitkomst: representant.uitkomst, regel: representant, viaVangnet };
  }

  const volgendVeld = kiesVolgendeVeld(kandidaten, effectieveAntwoorden);
  if (volgendVeld === null) {
    // Geen enkel veld kan de resterende ambiguïteit nog oplossen: niet
    // gokken, niet combineren — uitkomst 3.
    return { type: 'uitkomst', uitkomst: 'onbekend', regel: null, viaVangnet };
  }
  return veldNaarVraag(volgendVeld, kandidaten, antwoorden, data);
}

// -----------------------------------------------------------------------
// Headless: het pad van vragen simuleren voor een gegeven antwoordenset
// (gebruikt door test/run.html om "toon het gestelde vragenpad" te tonen,
// en om de testgevallen in test/cases.js te draaien).
// -----------------------------------------------------------------------
function simuleerPad(volledigeAntwoorden, data) {
  data = data || (typeof window !== 'undefined' ? window : globalThis);
  const antwoorden = {};
  const pad = [];
  let stap = bepaal(antwoorden, data);
  let veiligheidsteller = 0;
  while (stap.type === 'vraag' && veiligheidsteller < 50) {
    veiligheidsteller += 1;
    const veld = stap.veld;
    const heeftWaarde = Object.prototype.hasOwnProperty.call(volledigeAntwoorden, veld);
    const waarde = heeftWaarde ? volledigeAntwoorden[veld] : WEET_IK_NIET;
    pad.push({ veld, vraag: stap.vraag, gegeven: waarde });
    antwoorden[veld] = waarde;
    stap = bepaal(antwoorden, data);
  }
  return { pad, resultaat: stap, antwoorden };
}

if (typeof window !== 'undefined') {
  window.bepaal = bepaal;
  window.simuleerPad = simuleerPad;
  window.WEET_IK_NIET = WEET_IK_NIET;
  window.berekenRoute = berekenRoute;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { bepaal, simuleerPad, WEET_IK_NIET, berekenRoute };
}
