(function () {
  const storageKey = 'apodo_prototype_parcours_7_moments';
  const structure = [
    { id: 'valeur', title: 'Ce qui fait la valeur de votre entreprise', topics: [['clients', 'Vos clients'], ['savoirfaire', 'Votre savoir-faire'], ['preuve', 'Un exemple concret']] },
    { id: 'ressources', title: 'Vos ressources et votre environnement', topics: [['matieres', 'Matières, eau et déchets'], ['energie', 'Équipements, énergie et déplacements'], ['impacts', 'Les effets de votre activité'], ['climat', 'Les changements qui pourraient vous affecter']] },
    { id: 'equipe', title: 'La vie de votre équipe', topics: [['accueil_competences', 'Arriver, apprendre et transmettre'], ['conditions', 'Travailler dans de bonnes conditions'], ['equite_dialogue', 'Trouver sa place et pouvoir s’exprimer']] },
    { id: 'relations', title: 'Vos relations et votre territoire', topics: [['achats', 'Choisir ses fournisseurs et partenaires'], ['confiance', 'Protéger la confiance'], ['territoire', 'Votre place dans le territoire']] },
    { id: 'progres', title: 'Votre manière de progresser', topics: [['suivi', 'Ce que vous suivez déjà'], ['pilotage', 'Responsabilités et objectifs']] },
    { id: 'avenir', title: 'Votre avenir et quelques repères', topics: [['innovation', 'Innovation et développement'], ['resilience', 'Votre capacité d’adaptation'], ['autre', 'Un dernier tour de mémoire']] }
  ];
  const companyFields = [
    ['company_name', 'Nom de l’entreprise'],
    ['company_staff', 'Effectif actuel'],
    ['company_year', 'Année de création ou ancienneté'],
    ['company_activity', 'Présentation de l’entreprise'],
    ['company_history', 'Éléments d’histoire'],
    ['company_revenue', 'Chiffre d’affaires ou tranche'],
    ['company_trend', 'Évolution récente de l’activité'],
    ['company_development', 'Dynamisme et développement']
  ];

  function loadData() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch (_) {
      return {};
    }
  }

  function hasContent(data) {
    const buckets = [data.main || {}, data.company || {}];
    if (buckets.some((bucket) => Object.values(bucket).some((value) => String(value || '').trim()))) return true;
    return Object.values(data.topics || {}).some((topic) => String((topic || {}).text || '').trim());
  }

  function rtfEsc(value) {
    const source = String(value || '').replace(/\\/g, '\\\\').replace(/{/g, '\\{').replace(/}/g, '\\}');
    let output = '';
    for (const char of source) {
      const code = char.charCodeAt(0);
      if (char === '\n') output += '\\par ';
      else if (code > 127) output += `\\u${code > 32767 ? code - 65536 : code}?`;
      else output += char;
    }
    return output;
  }

  function download() {
    const data = loadData();
    if (!hasContent(data)) {
      window.alert('Aucun élément n’a encore été enregistré sur cet appareil. Commencez ou reprenez le parcours guidé.');
      return;
    }
    let rtf = '{\\rtf1\\ansi\\ansicpg1252\\deff0\\uc1{\\fonttbl{\\f0 Calibri;}}\\f0\\fs22\\sa140 ';
    const add = (value) => { rtf += rtfEsc(value); };
    const para = () => { rtf += '\\par '; };
    rtf += '\\b\\fs36 '; add('Méthode APODO - éléments à transmettre'); rtf += '\\b0\\fs22'; para();
    add('Document de travail issu du parcours guidé APODO. Il reprend les informations saisies par l’entreprise et ne constitue ni une évaluation ni le rapport RSE final.'); para();

    structure.forEach((moment) => {
      const main = String((data.main || {})[moment.id] || '').trim();
      const topicTexts = moment.topics.map(([id, label]) => [label, String((((data.topics || {})[id] || {}).text) || '').trim()]).filter(([, text]) => text);
      if (!main && !topicTexts.length) return;
      para(); rtf += '\\b\\fs27 '; add(moment.title); rtf += '\\b0\\fs22'; para();
      if (main) { add(main); para(); }
      topicTexts.forEach(([label, text]) => { rtf += '\\b '; add(`${label} : `); rtf += '\\b0 '; add(text); para(); });
    });

    const company = data.company || {};
    const values = companyFields.filter(([id]) => String(company[id] || '').trim());
    if (values.length) {
      para(); rtf += '\\b\\fs27 '; add('Quelques repères sur l’entreprise'); rtf += '\\b0\\fs22'; para();
      values.forEach(([id, label]) => { rtf += '\\b '; add(`${label} : `); rtf += '\\b0 '; add(company[id]); para(); });
    }
    rtf += '}';

    const blob = new Blob([rtf], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const companyName = String(company.company_name || 'Entreprise').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '_');
    link.href = url;
    link.download = `APODO_elements_${companyName || 'Entreprise'}.rtf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  const data = loadData();
  const status = document.getElementById('draftStatus');
  const button = document.getElementById('downloadTransmission');
  if (status) {
    if (hasContent(data)) {
      status.classList.add('status-good');
      status.innerHTML = '<strong>Brouillon retrouvé sur cet appareil</strong><p>Vous pouvez télécharger le document de travail préparé à partir de vos réponses.</p>';
    } else {
      status.classList.add('status-empty');
      status.innerHTML = '<strong>Aucun brouillon retrouvé</strong><p>Le brouillon est lié à ce navigateur et à cet appareil. Commencez le parcours ou ouvrez cette page depuis l’appareil utilisé pour répondre.</p><a class="text-link" href="parcours.html">Commencer le parcours</a>';
    }
  }
  if (button) button.addEventListener('click', download);
})();
