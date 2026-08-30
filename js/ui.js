/**
 * ui.js — rendering en interactie. Praat met de motor via `bepaal()` en
 * `simuleerPad()` uit engine.js, en met de inhoud via de data in regels.js.
 * Bevat zelf geen beslislogica over vrijstellingen.
 */
(function () {
  const app = document.getElementById('app');

  // Onderwerpen waar Eduarte en de 6-wekentermijn nooit genoemd worden,
  // ook niet in een hypothetisch "ja" (§6.9) — daar bestaat geen
  // vrijstellingsaanvraag voor.
  const GEEN_EDUARTE = new Set(['burgerschap', 'lob', 'stage']);

  // -----------------------------------------------------------------
  // State. `geschiedenis` is de lijst van beantwoorde vragen, in volgorde.
  // Elk item: { veld, vraag, waarde, waardeLabel }. De antwoorden-object
  // voor de motor wordt hieruit afgeleid — dat maakt "wijzig een eerder
  // antwoord" simpel: geschiedenis inkorten en opnieuw renderen.
  // -----------------------------------------------------------------
  let geschiedenis = [];

  function antwoordenUitGeschiedenis() {
    const antwoorden = {};
    for (const item of geschiedenis) antwoorden[item.veld] = item.waarde;
    return antwoorden;
  }

  // Vaste extra vragen voor een buitenlands diploma (§6.10): de enige
  // vrije tekstvelden in de hele tool. Ze doen niet mee in de
  // beslislogica (de motor kent deze velden niet), maar horen wel in de
  // samenvatting.
  function volgendeStap(antwoorden) {
    if (antwoorden.onderwerp === 'buitenlands') {
      if (antwoorden.diplomaNaam === undefined) {
        return { type: 'vraag', veld: 'diplomaNaam', vraag: 'Wat is de naam van je diploma?', tekstveld: true };
      }
      if (antwoorden.land === undefined) {
        return { type: 'vraag', veld: 'land', vraag: 'In welk land heb je dat diploma gehaald?', tekstveld: true };
      }
    }
    return window.bepaal(antwoorden, window);
  }

  // -----------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------
  function wisAppEnFocus(element) {
    app.innerHTML = '';
    app.appendChild(element);
    if (element.focus) element.focus();
  }

  // Eén gedeeld "Let op"-blok voor start- en uitkomstscherm (vervolgopdracht
  // 01, C2) — voorheen stond vergelijkbare tekst los op drie plekken
  // (startscherm, disclaimer, footer).
  function renderLetOp() {
    const div = document.createElement('div');
    div.className = 'let-op';
    div.innerHTML = `
      <p>Je hoeft niet in te loggen. Deze site vraagt niets over jou en slaat niets op.
      Dit is een hulpmiddel, geen besluit. Je kunt er geen rechten aan ontlenen. De
      examencommissie beslist.</p>
    `;
    return div;
  }

  function renderStart() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <h1 class="start-titel" tabindex="-1">Kan ik een vrijstelling aanvragen?</h1>
      <div class="start-uitleg">
        <p>Voor je diploma moet je verschillende dingen doen. Examens, maar bijvoorbeeld ook je
        stage. Heb je zoiets al ergens anders gehaald? Dan hoef je het misschien niet nog een
        keer te doen. Dat heet een vrijstelling.</p>
        <p>Deze site helpt je in een paar vragen inschatten of het zin heeft om er een aan te
        vragen.</p>
      </div>
      <div class="start-knop-wrap">
        <button type="button" class="knop knop-primair" id="start-knop">Start</button>
      </div>
    `;
    wrap.appendChild(renderLetOp());
    const meta = document.createElement('p');
    meta.className = 'start-meta';
    meta.textContent = `Laatst bijgewerkt: ${window.LAATST_BIJGEWERKT} — regeling ${window.REGELING_VERSIE}`;
    wrap.appendChild(meta);
    wisAppEnFocus(wrap);
    document.getElementById('start-knop').addEventListener('click', () => {
      geschiedenis = [];
      render();
    });
  }

  function labelVoorWaarde(stap, waarde) {
    if (waarde === window.WEET_IK_NIET) return 'Weet ik niet';
    const optie = (stap.opties || []).find((o) => o.waarde === waarde);
    return optie ? optie.label : String(waarde);
  }

  function renderIngevuld() {
    if (geschiedenis.length === 0) return null;
    const box = document.createElement('div');
    box.className = 'ingevuld';
    box.innerHTML = '<h2>Wat je al hebt ingevuld</h2>';
    const ul = document.createElement('ul');
    geschiedenis.forEach((item, index) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gewijzigd-item';
      btn.innerHTML = `<span><span class="label">${item.vraag}</span><br><span class="waarde">${item.waardeLabel}</span></span><span class="wijzig-hint">wijzig</span>`;
      btn.addEventListener('click', () => {
        geschiedenis = geschiedenis.slice(0, index);
        render();
      });
      li.appendChild(btn);
      ul.appendChild(li);
    });
    box.appendChild(ul);
    return box;
  }

  // Schatting vóór het onderwerp bekend is: een eerlijke ondergrens, geen
  // "vraag 1 van ongeveer 1" die meteen achterhaald is (vervolgopdracht 01,
  // D1). 6 is de langste realistische schatting van VRAGEN_SCHATTING.
  const SCHATTING_VOOR_ONDERWERP_BEKEND = 6;

  function schattingVoorOnderwerp(onderwerp) {
    return (window.VRAGEN_SCHATTING && window.VRAGEN_SCHATTING[onderwerp]) || 5;
  }

  function renderVoortgang(antwoorden) {
    const vraagNummer = geschiedenis.length + 1;
    const totaalSchatting = antwoorden.onderwerp ? schattingVoorOnderwerp(antwoorden.onderwerp) : SCHATTING_VOOR_ONDERWERP_BEKEND;
    const percentage = Math.min(100, Math.round((vraagNummer / Math.max(totaalSchatting, vraagNummer)) * 100));
    const div = document.createElement('div');
    div.className = 'voortgang';
    div.innerHTML = `
      <div class="voortgang-tekst">Vraag ${vraagNummer} van ongeveer ${Math.max(totaalSchatting, vraagNummer)}</div>
      <div class="voortgang-balk-buiten"><div class="voortgang-balk-binnen" style="width:${percentage}%"></div></div>
    `;
    return div;
  }

  function kiesAntwoord(stap, waarde, label) {
    geschiedenis.push({ veld: stap.veld, vraag: stap.vraag, waarde, waardeLabel: label });
    render();
  }

  function renderVraag(stap, antwoorden) {
    const wrap = document.createElement('div');
    wrap.className = 'vraagblok';

    wrap.appendChild(renderVoortgang(antwoorden));
    const ingevuld = renderIngevuld();
    if (ingevuld) wrap.appendChild(ingevuld);

    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = stap.vraag;
    legend.tabIndex = -1;
    fieldset.appendChild(legend);

    if (stap.tekstveld) {
      const label = document.createElement('label');
      label.className = 'veldlabel';
      label.setAttribute('for', 'tekstveld-' + stap.veld);
      label.textContent = stap.vraag;
      label.style.position = 'absolute';
      label.style.left = '-9999px'; // legend toont de vraag al zichtbaar
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'tekstveld';
      input.id = 'tekstveld-' + stap.veld;
      fieldset.appendChild(label);
      fieldset.appendChild(input);

      const knoppenrij = document.createElement('div');
      knoppenrij.className = 'knoppenrij';
      const verderKnop = document.createElement('button');
      verderKnop.type = 'button';
      verderKnop.className = 'knop knop-primair';
      verderKnop.textContent = 'Verder';
      verderKnop.addEventListener('click', () => {
        const waarde = input.value.trim();
        kiesAntwoord(stap, waarde, waarde || '(niet ingevuld)');
      });
      knoppenrij.appendChild(verderKnop);
      fieldset.appendChild(knoppenrij);
    } else {
      const optiesDiv = document.createElement('div');
      optiesDiv.className = 'opties';
      let laatsteGroep = null;
      stap.opties.forEach((optie) => {
        if (optie.groep && optie.groep !== laatsteGroep) {
          const groepTitel = document.createElement('div');
          groepTitel.className = 'opties-groep-titel';
          groepTitel.textContent = optie.groep;
          optiesDiv.appendChild(groepTitel);
          laatsteGroep = optie.groep;
        }
        const knop = document.createElement('button');
        knop.type = 'button';
        knop.className = 'antwoord-knop';
        knop.textContent = optie.label;
        knop.addEventListener('click', () => kiesAntwoord(stap, optie.waarde, optie.label));
        optiesDiv.appendChild(knop);
      });

      // "Weet ik niet" mag bijna overal, behalve bij de allereerste vraag
      // (het onderwerp) — dat is nu net waar de student voor kwam.
      if (stap.veld !== 'onderwerp') {
        const weetNietKnop = document.createElement('button');
        weetNietKnop.type = 'button';
        weetNietKnop.className = 'antwoord-knop weet-ik-niet';
        weetNietKnop.textContent = 'Weet ik niet';
        weetNietKnop.addEventListener('click', () => kiesAntwoord(stap, window.WEET_IK_NIET, 'Weet ik niet'));
        optiesDiv.appendChild(weetNietKnop);
      }
      fieldset.appendChild(optiesDiv);
    }

    wrap.appendChild(fieldset);

    const knoppenOnder = document.createElement('div');
    knoppenOnder.className = 'knoppenrij';
    if (geschiedenis.length > 0) {
      const terugKnop = document.createElement('button');
      terugKnop.type = 'button';
      terugKnop.className = 'knop knop-secundair';
      terugKnop.textContent = '← Terug';
      terugKnop.addEventListener('click', () => {
        geschiedenis = geschiedenis.slice(0, -1);
        render();
      });
      knoppenOnder.appendChild(terugKnop);
    }
    wrap.appendChild(knoppenOnder);

    wisAppEnFocus(wrap);
    legend.focus();
  }

  // -----------------------------------------------------------------
  // Uitkomstscherm
  // -----------------------------------------------------------------
  const UITKOMST_KOP = {
    ja: 'Het heeft waarschijnlijk zin om een vrijstelling aan te vragen.',
    nee: 'Het heeft waarschijnlijk weinig zin om een vrijstelling aan te vragen.',
    onbekend: 'Dit kan ik met deze informatie niet nakijken. Bespreek het met je studieloopbaanbegeleider (je slb’er).',
  };

  function watNuTekst(resultaat, antwoorden) {
    const onderwerp = antwoorden.onderwerp;
    const geenEduarte = GEEN_EDUARTE.has(onderwerp);
    if (resultaat.uitkomst === 'ja') {
      if (geenEduarte) {
        return 'Bespreek dit met je opleiding of je studieloopbaanbegeleider.';
      }
      return 'Pak je bewijsstuk erbij en vraag de vrijstelling aan via Eduarte. Doe dit minimaal 6 kalenderweken vóór je diplomering.';
    }
    if (resultaat.uitkomst === 'nee') {
      return 'Twijfel je toch? Je studieloopbaanbegeleider (slb’er) kan er altijd naar kijken.';
    }
    // onbekend
    if (onderwerp === 'beroepsgericht') {
      return 'Ga naar je slb’er of de examencommissie. Neem mee: je bewijsstuk, het resultaat, informatie over het eerdere examen, en een onderbouwing van waarom het volgens jou gelijkwaardig is.';
    }
    if (onderwerp === 'lob') {
      return 'Het onderwijsteam beoordeelt of een uitzondering mogelijk is. Bespreek dit met je slb’er.';
    }
    if (onderwerp === 'stage') {
      return 'De teammanager beoordeelt of je werkervaring de stage mag vervangen. Bespreek dit met je slb’er.';
    }
    return 'Ga naar je slb’er. Neem je bewijsstuk mee en vraag of het zin heeft om een vrijstelling aan te vragen.';
  }

  function samenvattingTekst(resultaat, antwoorden) {
    const regels = [];
    regels.push('Samenvatting — vrijstellingen-checker ROC Nijmegen');
    const onderwerpLabel = (window.ONDERWERPEN.find((o) => o.id === antwoorden.onderwerp) || {}).label || antwoorden.onderwerp;
    regels.push('Onderwerp: ' + onderwerpLabel);
    regels.push('');
    regels.push('Ingevulde gegevens:');
    geschiedenis.forEach((item) => {
      regels.push('- ' + item.vraag + ' ' + item.waardeLabel);
    });
    regels.push('');
    regels.push('Uitkomst: ' + UITKOMST_KOP[resultaat.uitkomst]);
    if (resultaat.regel && resultaat.regel.uitleg) {
      regels.push('Waarom: ' + resultaat.regel.uitleg);
    }
    // "Vrijstelling voor" alleen bij een echte "ja" — bij conclusie 3 mag
    // dit niet als toegekend overkomen (vervolgopdracht 01, A4).
    if (resultaat.uitkomst === 'ja' && resultaat.regel && resultaat.regel.vrijstellingVoor) {
      regels.push('Vrijstelling mogelijk voor: ' + resultaat.regel.vrijstellingVoor);
    }
    regels.push('Wat nu: ' + watNuTekst(resultaat, antwoorden));
    return regels.join('\n');
  }

  function renderUitkomst(resultaat, antwoorden) {
    const wrap = document.createElement('div');
    wrap.className = 'uitkomstblok';

    const kop = document.createElement('h1');
    kop.className = 'uitkomst-kop uitkomst-' + resultaat.uitkomst;
    kop.tabIndex = -1;
    kop.textContent = UITKOMST_KOP[resultaat.uitkomst];
    wrap.appendChild(kop);

    const waarom = document.createElement('div');
    waarom.className = 'uitkomst-sectie';
    waarom.innerHTML = `<h2><span class="balkje"></span>Waarom</h2><p>${(resultaat.regel && resultaat.regel.uitleg) || 'Geen van de bekende regels past op je antwoorden.'}</p>`;
    wrap.appendChild(waarom);

    if (resultaat.uitkomst === 'ja' && resultaat.regel && resultaat.regel.vrijstellingVoor) {
      const voor = document.createElement('div');
      voor.className = 'uitkomst-sectie';
      voor.innerHTML = `<h2><span class="balkje"></span>Vrijstelling mogelijk voor</h2><p>${resultaat.regel.vrijstellingVoor}</p>`;
      wrap.appendChild(voor);
    }

    const watNu = document.createElement('div');
    watNu.className = 'uitkomst-sectie';
    watNu.innerHTML = `<h2><span class="balkje"></span>Wat nu</h2><p>${watNuTekst(resultaat, antwoorden)}</p>`;
    wrap.appendChild(watNu);

    // Zichtbare samenvatting, in een kader — precies de tekst die de knop
    // hieronder ook kopieert (vervolgopdracht 01, C3).
    const samenvattingTekstWaarde = samenvattingTekst(resultaat, antwoorden);
    const samenvattingBlok = document.createElement('div');
    samenvattingBlok.className = 'uitkomst-sectie';
    const samenvattingKop = document.createElement('h2');
    samenvattingKop.innerHTML = '<span class="balkje"></span>Samenvatting';
    const samenvattingKader = document.createElement('pre');
    samenvattingKader.className = 'samenvatting-kader';
    samenvattingKader.textContent = samenvattingTekstWaarde;
    samenvattingBlok.appendChild(samenvattingKop);
    samenvattingBlok.appendChild(samenvattingKader);
    wrap.appendChild(samenvattingBlok);

    const knoppenrij = document.createElement('div');
    knoppenrij.className = 'knoppenrij';

    const kopieerKnop = document.createElement('button');
    kopieerKnop.type = 'button';
    kopieerKnop.className = 'knop knop-secundair';
    kopieerKnop.textContent = 'Kopieer samenvatting';
    const bevestigingSpan = document.createElement('span');
    bevestigingSpan.className = 'bevestiging';
    bevestigingSpan.setAttribute('role', 'status');
    kopieerKnop.addEventListener('click', async () => {
      const tekst = samenvattingTekstWaarde;
      try {
        await navigator.clipboard.writeText(tekst);
      } catch (fout) {
        const tijdelijk = document.createElement('textarea');
        tijdelijk.value = tekst;
        tijdelijk.style.position = 'fixed';
        tijdelijk.style.left = '-9999px';
        document.body.appendChild(tijdelijk);
        tijdelijk.select();
        document.execCommand('copy');
        document.body.removeChild(tijdelijk);
      }
      bevestigingSpan.textContent = 'Gekopieerd';
      setTimeout(() => { bevestigingSpan.textContent = ''; }, 4000);
    });

    const opnieuwKnop = document.createElement('button');
    opnieuwKnop.type = 'button';
    opnieuwKnop.className = 'knop knop-primair';
    opnieuwKnop.textContent = 'Opnieuw beginnen';
    opnieuwKnop.addEventListener('click', () => {
      geschiedenis = [];
      render();
    });

    knoppenrij.appendChild(kopieerKnop);
    knoppenrij.appendChild(bevestigingSpan);
    knoppenrij.appendChild(opnieuwKnop);
    wrap.appendChild(knoppenrij);

    wrap.appendChild(renderLetOp());

    wisAppEnFocus(wrap);
    kop.focus();
  }

  // -----------------------------------------------------------------
  // Hoofdlus
  // -----------------------------------------------------------------
  function render() {
    const antwoorden = antwoordenUitGeschiedenis();
    const stap = volgendeStap(antwoorden);
    if (stap.type === 'vraag') {
      renderVraag(stap, antwoorden);
    } else {
      renderUitkomst(stap, antwoorden);
    }
  }

  renderStart();
})();
