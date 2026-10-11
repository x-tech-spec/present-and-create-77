// Scénarios V5 intégraux — Fil rouge unifié « Lina Cosmétiques »
// Cahier des charges Cosmic Purple — Dialogues exacts et cartouches narrateurs

export type CharId = "karim" | "sofia" | "amine" | "nadia" | "sami" | "leila" | "lina" | "yasmine";

export type Visual =
  | "stat"
  | "budgetDown"
  | "postitMission"
  | "spc"
  | "spc1"
  | "spc2"
  | "spc3"
  | "spc4"
  | "targetSuccess"
  | "notif"
  | "viteBien"
  | "recruterProcessus"
  | "process7"
  | "process7-1"
  | "process7-2"
  | "process7-3"
  | "process7-4"
  | "process7-5"
  | "process7-6"
  | "process7-7"
  | "cvFilter"
  | "enter"
  | "payslip"
  | "phoneCall"
  | "payflow"
  | "confetti"
  | "whiteboardSolaire"
  | "needsDuo"
  | "circle"
  | "circle-1"
  | "circle-2"
  | "circle-3"
  | "circle-4"
  | "counter"
  | "truckBack"
  | "crack"
  | "chart"
  | "phone";

export type Line = { who: CharId; text: string; note?: string };
export type Step = { type: string; narrator: string; lines: Line[]; visual?: Visual };
export type Outcome = "success" | "trap" | "fail" | "partial";
export type Choice = {
  key: "A" | "B" | "C";
  text: string;
  outcome: Outcome;
  narrator: string;
  line: Line;
  visual?: Visual;
};

export type Scenario = {
  id: string;
  title: string;
  fn: "mk" | "rh" | "mix";
  plaque: string;
  place: string;
  left: CharId;
  right: CharId;
  center?: CharId;
  before: Step[];
  choiceNarrator: string;
  question: string;
  choices: Choice[];
  after: Step[];
  lesson: string;
};

export const CHARACTERS: Record<CharId, { name: string; role: string }> = {
  karim: { name: "Karim", role: "Direction générale / Fondateur" },
  sofia: { name: "Sofia", role: "Responsable Marketing" },
  amine: { name: "Amine", role: "Responsable RH" },
  nadia: { name: "Nadia", role: "RH — Gestion de la paie" },
  sami: { name: "Sami", role: "Comptabilité" },
  leila: { name: "Leïla", role: "Manager commercial" },
  lina: { name: "Lina", role: "Nouvelle commerciale" },
  yasmine: { name: "Yasmine", role: "Salariée production" },
};

export const SCENARIOS: Record<string, Scenario> = {
  s1: {
    id: "s1",
    title: "Scénario 1 — « Le lancement »",
    fn: "mk",
    plaque: "Responsable Marketing",
    place: "Bureau de Sofia — Lina Cosmétiques",
    left: "sofia",
    right: "karim",
    before: [
      {
        type: "Mise en situation",
        narrator: "Le produit est prêt… mais peut-on le lancer demain ?",
        visual: "stat",
        lines: [{ who: "sofia", text: "Karim, notre crème « Éclat du Sud » est prête !" }],
      },
      {
        type: "L'enjeu",
        narrator: "Une startup n'a pas le droit à l'erreur : le budget est limité.",
        visual: "budgetDown",
        lines: [{ who: "karim", text: "Avant de publier le produit on va étudier le marché." }],
      },
      {
        type: "La mission du marketing",
        narrator: "La mission du marketing : COMPRENDRE avant de VENDRE.",
        visual: "postitMission",
        lines: [{ who: "sofia", text: "Je dois trouver LA bonne cliente avant de dépenser en publicité." }],
      },
      {
        type: "Méthode — 1. Étudier",
        narrator: "1ʳᵉ mission : connaître le marché.",
        visual: "spc1",
        lines: [{ who: "sofia", text: "J'étudie : questionnaires, concurrence." }],
      },
      {
        type: "Méthode — 2. Segmenter",
        narrator: "2ᵉ mission : découper le marché en groupes.",
        visual: "spc2",
        lines: [{ who: "sofia", text: "Je découpe : toutes les femmes ne veulent pas la même crème." }],
      },
      {
        type: "Méthode — 3. Cibler",
        narrator: "3ᵉ mission : choisir UNE cible.",
        visual: "spc3",
        lines: [{ who: "sofia", text: "Je choisis celle qui achètera vraiment." }],
      },
      {
        type: "Méthode — 4. Positionner",
        narrator: "4ᵉ mission : définir notre promesse.",
        visual: "spc4",
        lines: [{ who: "sofia", text: "Ma promesse : « naturel, fait pour vous »." }],
      },
    ],
    choiceNarrator: "À vous de décider : quelle cible Sofia doit-elle choisir ?",
    question: "Deux clientes possibles pour « Éclat du Sud ». Je choisis laquelle ?",
    choices: [
      {
        key: "A",
        text: "Toutes les femmes de 18 à 60 ans : plus grande, mieux !",
        outcome: "fail",
        narrator: "Viser tout le monde = ne viser personne.",
        visual: "truckBack",
        line: { who: "sofia", text: "Message trop vague… personne ne se sent visée. Budget dilué. Échec." },
      },
      {
        key: "B",
        text: "Femmes 25-40 ans, urbaines, sensibles au naturel.",
        outcome: "success",
        narrator: "C'est ça le ciblage : une cliente décrite exactement.",
        visual: "targetSuccess",
        line: { who: "sofia", text: "Cible précise = message précis. Elle se reconnaît dans notre pub." },
      },
      {
        key: "C",
        text: "Les parapharmacies : vendre en gros, c'est vendre plus.",
        outcome: "trap",
        narrator: "Canal de distribution ≠ cible marketing.",
        line: { who: "sofia", text: "Piège ! La parapharmacie, c'est PAR OÙ je vends, pas À QUI je vends." },
      },
    ],
    after: [
      {
        type: "Le résultat",
        narrator: "Le ciblage a payé : les bonnes clientes ont acheté vite et en masse.",
        visual: "chart",
        lines: [{ who: "sofia", text: "Conversion doublée… rupture de stock au 2ᵉ mois !" }],
      },
    ],
    lesson: "Le marketing ne vend pas d'abord : il COMPREND le marché avant d'agir. Étudier → Segmenter → Cibler → Positionner → puis communiquer et vendre.",
  },

  s2: {
    id: "s2",
    title: "Scénario 2 — « L'embauche urgente »",
    fn: "rh",
    plaque: "Direction des Ressources Humaines",
    place: "Bureau d'Amine — Lina Cosmétiques",
    left: "amine",
    right: "leila",
    before: [
      {
        type: "Mise en situation",
        narrator: "Une équipe commerciale a besoin d'une recrue… en urgence.",
        visual: "notif",
        lines: [{ who: "leila", text: "Amine, on a besoin d'une commerciale terrain EN URGENCE ! Trois parapharmacies en attente." }],
      },
      {
        type: "L'enjeu",
        narrator: "Recruter vite ET bien : les deux, jamais l'un sans l'autre.",
        visual: "viteBien",
        lines: [{ who: "amine", text: "Si j'embauche la mauvaise personne, dans 3 mois on repart à zéro : argent perdu, ventes en retard, équipe démotivée." }],
      },
      {
        type: "La mission des RH",
        narrator: "La mission RH du jour : conduire un recrutement complet.",
        visual: "recruterProcessus",
        lines: [{ who: "amine", text: "Le recrutement n'est pas un coup de chance : c'est une méthode." }],
      },
      {
        type: "Méthode (1/7)",
        narrator: "1ʳᵉ étape : définir le poste AVEC le manager.",
        visual: "process7-1",
        lines: [{ who: "amine", text: "Je définis le besoin AVEC Leïla : compétences, salaire." }],
      },
      {
        type: "Méthode (2/7)",
        narrator: "2ᵉ étape : transformer le besoin en annonce.",
        visual: "process7-2",
        lines: [{ who: "amine", text: "Je rédige l'annonce." }],
      },
      {
        type: "Méthode (3/7)",
        narrator: "3ᵉ étape : publier au bon endroit.",
        visual: "process7-3",
        lines: [{ who: "amine", text: "Je diffuse sur les bons canaux." }],
      },
      {
        type: "Méthode (4/7)",
        narrator: "4ᵉ étape : sélectionner selon des critères.",
        visual: "process7-4",
        lines: [{ who: "amine", text: "Je trie les CV selon le profil validé." }],
      },
      {
        type: "Méthode (5/7)",
        narrator: "5ᵉ étape : tester, pas seulement discuter.",
        visual: "process7-5",
        lines: [{ who: "amine", text: "Entretiens + mise en situation : je vois la personne AGIR." }],
      },
      {
        type: "Méthode (6/7)",
        narrator: "6ᵉ étape : décider sur des preuves.",
        visual: "process7-6",
        lines: [{ who: "amine", text: "Je décide : les preuves d'entretien, pas l'intuition." }],
      },
      {
        type: "Méthode (7/7)",
        narrator: "7ᵉ étape : l'embauche ne s'arrête pas à la signature.",
        visual: "process7-7",
        lines: [{ who: "amine", text: "J'intègre la nouvelle : accueil, parrain, formation." }],
      },
    ],
    choiceNarrator: "40 CV sont arrivés. Que fait Amine ? À vous de décider.",
    question: "40 CV reçus pour ce poste. Je fais quoi ?",
    choices: [
      {
        key: "A",
        text: "La première candidate disponible : aller vite.",
        outcome: "fail",
        narrator: "Aller vite sans méthode = recommencer deux fois plus lentement.",
        visual: "truckBack",
        line: { who: "amine", text: "Disponible ≠ compétente. Licenciement à 3 mois, trois parapharmacies perdues." },
      },
      {
        key: "B",
        text: "Tri selon le profil validé avec Leïla, puis entretien + mise en situation.",
        outcome: "success",
        narrator: "C'est ça, un processus : chaque étape filtre, rien n'est au hasard.",
        visual: "cvFilter",
        line: { who: "amine", text: "5 CV retenus, 2 entretiens, 1 mise en situation réussie : Lina." },
      },
      {
        key: "C",
        text: "Je laisse Leïla choisir seule, c'est son équipe.",
        outcome: "trap",
        narrator: "Déléguer ≠ se décharger : la responsabilité RH reste aux RH.",
        visual: "recruterProcessus",
        line: { who: "amine", text: "Piège ! Leïla gère l'équipe, mais le recrutement est une mission RH : contrat, salaire, conformité. Sans moi, risque juridique !" },
      },
    ],
    after: [
      {
        type: "Le résultat",
        narrator: "Un recrutement réussi, c'est une intégration réussie.",
        visual: "enter",
        lines: [{ who: "amine", text: "Lina arrive aujourd'hui : accueil préparé, un parrain pour la guider, formation sur nos produits. Autonome en 1 mois !" }],
      },
    ],
    lesson: "Le recrutement est un PROCESSUS : analyser le besoin → rechercher → sélectionner → intégrer. Vite fait = mal fait : les RH protègent la qualité, pas seulement la vitesse.",
  },

  s3: {
    id: "s3",
    title: "Scénario 3 — « Yasmine et les heures sup »",
    fn: "rh",
    plaque: "RH — Gestion de la paie",
    place: "Lina Cosmétiques — Production & Service RH",
    left: "yasmine",
    right: "nadia",
    before: [
      {
        type: "Mise en situation",
        narrator: "Fin de mois chez Lina Cosmétiques : Yasmine reçoit sa fiche de paie.",
        visual: "payslip",
        lines: [{ who: "yasmine", text: "Ma fiche de paie… Attends, mes 10 heures sup du mois ne sont pas dedans !" }],
      },
    ],
    choiceNarrator: "À vous de décider : qui doit Yasmine contacter ?",
    question: "Pour mes heures manquantes… je contacte qui ?",
    choices: [
      {
        key: "A",
        text: "Nadia, aux Ressources Humaines : c'est elle qui s'occupe de la paie.",
        outcome: "success",
        narrator: "Bon réflexe : la paie se calcule aux RH — l'erreur sera corrigée à la source.",
        line: { who: "nadia", text: "Tu as bien fait ! C'est moi qui calcule la paie : heures, primes, retenues. Je vérifie tout de suite." },
      },
      {
        key: "B",
        text: "Sami, le comptable : c'est lui qui gère l'argent de l'entreprise.",
        outcome: "trap",
        narrator: "Le comptable exécute le paiement — le calcul de la paie, c'est le travail des RH.",
        line: { who: "sami", text: "Piège ! Moi je paie, mais je ne calcule pas : je ne connais ni tes heures ni tes primes. Va voir Nadia !" },
      },
      {
        key: "C",
        text: "Personne : 10 heures, ce n'est pas grave.",
        outcome: "fail",
        narrator: "Ignorer une erreur de paie, c'est créer un litige qui coûte plus cher que le correctif.",
        visual: "truckBack",
        line: { who: "nadia", text: "10 heures × 12 mois × 30 salariés = une grosse somme… et un précédent d'injustice." },
      },
    ],
    after: [
      {
        type: "La correction",
        narrator: "Yasmine appelle Nadia : c'est la bonne porte.",
        visual: "phoneCall",
        lines: [
          { who: "yasmine", text: "Nadia, mes 10 heures sup sont manquantes sur ma fiche !" },
          { who: "nadia", text: "Tu as raison, je les vois dans le pointage. Je revérifie le calcul et j'envoie la nouvelle fiche à Sami." },
        ],
      },
      {
        type: "Exécution du virement",
        narrator: "Fiche corrigée : RH → Comptabilité. Le virement part.",
        visual: "payflow",
        lines: [{ who: "sami", text: "Fiche reçue, montant corrigé. J'enregistre la charge salariale et j'exécute le virement." }],
      },
      {
        type: "Le résultat",
        narrator: "Le bon montant, payé à temps : le flux a fonctionné.",
        visual: "confetti",
        lines: [{ who: "yasmine", text: "Virement reçu, montant exact. Merci Nadia, merci Sami !" }],
      },
    ],
    lesson: "Une erreur de paie ? On s'adresse d'abord aux RH : elles CALCULENT (heures, primes, retenues). La comptabilité ENREGISTRE et EXÉCUTE le paiement. RH et comptabilité : deux fonctions, un seul flux.",
  },

  s4: {
    id: "s4",
    title: "Scénario 4 — « Le lancement en duo »",
    fn: "mix",
    plaque: "Bureau du Fondateur",
    place: "Bureau de Karim — Direction générale",
    left: "sofia",
    right: "amine",
    center: "karim",
    before: [
      {
        type: "Mise en situation",
        narrator: "Lina Cosmétiques lance une nouvelle gamme dans 2 mois.",
        visual: "whiteboardSolaire",
        lines: [{ who: "karim", text: "Lina Cosmétiques lance sa gamme solaire dans 2 mois. Sofia, Amine : je compte sur vous DEUX." }],
      },
      {
        type: "Les deux besoins",
        narrator: "Chacun a besoin de l'autre pour réussir.",
        visual: "needsDuo",
        lines: [
          { who: "sofia", text: "J'ai besoin d'une équipe commerciale formée et motivée pour convaincre les clientes !" },
          { who: "amine", text: "Et moi, j'ai besoin que Sofia me décrive le profil EXACT qu'elle veut recruter !" },
        ],
      },
      {
        type: "Le cercle — 1. RH",
        narrator: "Maillon 1 : des gens bien choisis et formés.",
        visual: "circle-1",
        lines: [{ who: "karim", text: "Amine recrute et forme les bons profils…" }],
      },
      {
        type: "Le cercle — 2. Marketing",
        narrator: "Maillon 2 : une équipe qui comprend les clientes.",
        visual: "circle-2",
        lines: [{ who: "karim", text: "…l'équipe de Sofia comprend mieux les clientes…" }],
      },
      {
        type: "Le cercle — 3. Ventes",
        narrator: "Maillon 3 : de meilleures ventes.",
        visual: "circle-3",
        lines: [{ who: "karim", text: "…donc de meilleures ventes…" }],
      },
      {
        type: "Le cercle — 4. Croissance",
        narrator: "Maillon 4 : la croissance finance les gens. Et le cercle recommence.",
        visual: "circle-4",
        lines: [{ who: "karim", text: "…donc plus de budget pour recruter et former. C'est un CERCLE !" }],
      },
    ],
    choiceNarrator: "Le budget est serré. Que finance Karim en priorité ?",
    question: "Je ne peux pas tout financer. Ma priorité ?",
    choices: [
      {
        key: "A",
        text: "Couper la formation pour économiser.",
        outcome: "fail",
        narrator: "Économiser sur les gens, c'est casser le premier maillon du cercle.",
        visual: "crack",
        line: { who: "sofia", text: "Sans formation, nos commerciaux ont démissionné en 4 mois. Le cercle s'est brisé : temps et argent perdus." },
      },
      {
        key: "B",
        text: "Recruter 2 commerciaux formés, comme le demande Sofia.",
        outcome: "success",
        narrator: "Investir dans les gens, c'est alimenter le cercle à sa source.",
        visual: "circle",
        line: { who: "amine", text: "2 recrutements ciblés + formation produit. L'équipe de Sofia était opérationnelle en 3 semaines !" },
      },
      {
        key: "C",
        text: "Tout mettre dans la publicité.",
        outcome: "partial",
        narrator: "La publicité attire, mais seule une équipe formée transforme l'attention en ventes.",
        line: { who: "sofia", text: "Piège ! La pub a attiré des clientes… vers une équipe incapable de les convaincre. Pub sans les gens = argent brûlé." },
      },
    ],
    after: [
      {
        type: "Le résultat",
        narrator: "Le cercle s'est bouclé : les gens ont fait la croissance.",
        visual: "counter",
        lines: [{ who: "karim", text: "Ventes en hausse de 30 % dès le premier trimestre ! Le budget RH est augmenté : on recommence le cercle." }],
      },
    ],
    lesson: "Marketing et RH ne sont pas en silos : chacune nourrit l'autre. Les GENS font le produit, le produit fait la CROISSANCE, la croissance fait les MOYENS des gens.",
  },
};

export type Frame =
  | { k: "step"; i: number }
  | { k: "choice" }
  | { k: "cons"; c: number }
  | { k: "after"; i: number }
  | { k: "lesson" };

/** Toutes les étapes visibles d'un scénario (pour l'export PDF). */
export function allFrames(sc: Scenario): Frame[] {
  return [
    ...sc.before.map((_, i) => ({ k: "step", i }) as Frame),
    { k: "choice" },
    ...sc.choices.map((_, c) => ({ k: "cons", c }) as Frame),
    ...sc.after.map((_, i) => ({ k: "after", i }) as Frame),
    { k: "lesson" },
  ];
}
