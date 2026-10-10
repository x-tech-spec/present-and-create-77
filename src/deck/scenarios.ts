// Dialogues EXACTS — copiés mot pour mot depuis les scripts V2. Ne pas réécrire.

export type CharId = "karim" | "sofia" | "amine" | "nadia" | "sami" | "leila" | "lina" | "yasmine";

export type Visual =
  | "stat"
  | "spc"
  | "chart"
  | "notif"
  | "process7"
  | "enter"
  | "payslip"
  | "payflow"
  | "confetti"
  | "circle"
  | "counter"
  | "truckBack"
  | "crack"
  | "phone";

export type Line = { who: CharId; text: string; note?: string };
export type Step = { type: string; lines: Line[]; visual?: Visual };
export type Outcome = "success" | "trap" | "fail" | "partial";
export type Choice = { key: "A" | "B" | "C"; text: string; outcome: Outcome; line: Line; visual?: Visual };

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
  question: string;
  choices: Choice[];
  after: Step[];
  lesson: string;
};

export const CHARACTERS: Record<CharId, { name: string; role: string }> = {
  karim: { name: "Karim", role: "Fondateur / DG" },
  sofia: { name: "Sofia", role: "Responsable Marketing" },
  amine: { name: "Amine", role: "DRH" },
  nadia: { name: "Nadia", role: "Responsable paie (RH)" },
  sami: { name: "Sami", role: "Comptable" },
  leila: { name: "Leïla", role: "Directrice commerciale" },
  lina: { name: "Lina", role: "Nouvelle commerciale" },
  yasmine: { name: "Yasmine", role: "Salariée de production" },
};

export const SCENARIOS = {
  s1: {
    id: "s1",
    title: "Scénario 1 — « Le lancement »",
    fn: "mk",
    plaque: "Responsable Marketing",
    place: "Bureau de Sofia — Lina Cosmétiques",
    left: "sofia",
    right: "karim",
    before: [
      { type: "Situation", lines: [{ who: "sofia", text: "Karim, notre crème \"Éclat du Sud\" est prête ! Avant de la lancer chez Lina Cosmétiques, je dois être sûre qu'elle trouvera SES clientes." }] },
      { type: "Situation", lines: [{ who: "karim", text: "Le budget est serré, Sofia. Une startup comme la nôtre n'a pas le droit de se tromper de cible." }] },
      { type: "Problème", visual: "stat", lines: [{ who: "sofia", text: "60 % des nouveaux produits cosmétiques échouent… faute d'étude de marché. Si je me trompe de cliente, tout notre investissement part en fumée." }] },
      { type: "Analyse", visual: "spc", lines: [{ who: "sofia", text: "Mon plan : ① Étude de marché (questionnaires, concurrence) ② Segmentation ③ Ciblage ④ Positionnement. Ensuite SEULEMENT : publicité et vente." }] },
    ],
    question: "Deux clientes possibles pour \"Éclat du Sud\". Que choisit Sofia ?",
    choices: [
      { key: "A", text: "Toutes les femmes de 18 à 60 ans : marché maximum !", outcome: "fail", visual: "truckBack", line: { who: "sofia", text: "Message trop vague… personne ne se sent visée. Budget publicitaire dilué. Échec." } },
      { key: "B", text: "Femmes 25-40 ans, urbaines, sensibles au naturel.", outcome: "success", line: { who: "sofia", text: "Cliente précise = message précis. Notre campagne parle directement à elle." } },
      { key: "C", text: "Les parapharmacies : vendre en gros, c'est vendre plus.", outcome: "trap", line: { who: "sofia", text: "Attention : la parapharmacie, c'est un canal de DISTRIBUTION, pas une cible marketing. Je confonds \"à qui je vends\" et \"par où je vends\" !" } },
    ],
    after: [
      { type: "Résultat", visual: "chart", lines: [{ who: "sofia", text: "Campagne \"Naturel, fait pour vous\" : taux de conversion doublé, rupture de stock au 2ᵉ mois chez Lina Cosmétiques !" }] },
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
      { type: "Situation", visual: "notif", lines: [{ who: "leila", note: "notification", text: "Amine, l'équipe commerciale de Lina Cosmétiques a besoin d'une commerciale terrain EN URGENCE. Trois nouvelles parapharmacies en attente !" }] },
      { type: "Problème", lines: [{ who: "amine", text: "Recruter vite ET bien. Une mauvaise embauche = on recommence dans 3 mois : coût, retard, équipe démotivée." }] },
      { type: "Analyse", visual: "process7", lines: [{ who: "amine", text: "Mon processus : ① Définir le besoin avec Leïla (compétences, salaire) ② Rédiger l'annonce ③ Diffuser ④ Trier les CV ⑤ Entretiens + mise en situation ⑥ Décision ⑦ Intégration." }] },
    ],
    question: "40 CV reçus pour Lina Cosmétiques. Que fait Amine ?",
    choices: [
      { key: "A", text: "Je prends la première candidate disponible pour aller vite.", outcome: "fail", line: { who: "amine", text: "Disponible ≠ compétente. Licenciement 3 mois plus tard, trois parapharmacies perdues. Retour à la case départ." } },
      { key: "B", text: "Je trie selon le profil validé avec Leïla, puis entretien et mise en situation.", outcome: "success", line: { who: "amine", text: "5 CV retenus, 2 entretiens, 1 mise en situation réussie : Lina. Profil exact pour notre réseau de parapharmacies." } },
      { key: "C", text: "Je laisse Leïla choisir seule, c'est son équipe.", outcome: "trap", line: { who: "amine", text: "Leïla gère une équipe, mais le RECRUTEMENT est une mission RH : conformité du contrat, salaire, intégration. Sans moi, risque juridique pour Lina Cosmétiques !" } },
    ],
    after: [
      { type: "Résultat", visual: "enter", lines: [{ who: "amine", text: "Lina intégrée : plan d'accueil, parrain, formation produit. Objectif : autonome en 1 mois." }] },
    ],
    lesson: "Le recrutement est un PROCESSUS RH : analyser le besoin → rechercher → sélectionner → intégrer. Vite fait = mal fait : les RH protègent la qualité, pas seulement la vitesse.",
  },
  s3: {
    id: "s3",
    title: "Scénario 3 — « Qui paie les salaires ? »",
    fn: "rh",
    plaque: "RH — Gestion de la paie",
    place: "Bureau de Nadia — Lina Cosmétiques",
    left: "nadia",
    right: "sami",
    before: [
      { type: "Situation", visual: "payslip", lines: [{ who: "nadia", note: "fiches de paie à l'écran", text: "Fin de mois chez Lina Cosmétiques. Calcul des heures, primes, retenues, congés…" }] },
      { type: "Problème", lines: [{ who: "sami", note: "frappe à la porte", text: "Nadia, les salariés demandent : c'est qui qui nous paie au juste — les RH ou la comptabilité ?" }] },
      { type: "Analyse", visual: "payflow", lines: [{ who: "nadia", text: "Simple ! Moi (RH) : je CALCULE la paie — salaire de base, heures sup, primes, retenues. Toi (compta) : tu VÉRIFIES, tu ENREGISTRES la charge salariale et tu EXÉCUTES le virement via la banque." }] },
    ],
    question: "Cas concret : Yasmine, salariée de production, signale 10 heures supplémentaires oubliées sur sa fiche. Qui corrige, et quand ?",
    choices: [
      { key: "A", text: "Les RH, AVANT de transmettre à la comptabilité.", outcome: "success", line: { who: "sami", text: "Parfait : erreur corrigée à la source. Je reçois une paie juste, je paie Yasmine à temps." } },
      { key: "B", text: "La comptabilité seule, au moment du virement.", outcome: "partial", line: { who: "sami", text: "Je peux corriger le montant, mais je ne connais pas les motifs RH (heures sup, prime négociée…). Risque d'erreur et de litige." } },
      { key: "C", text: "Personne, c'est négligeable.", outcome: "fail", line: { who: "nadia", text: "\"Négligeable\" × 12 mois × 30 salariés = une grosse somme… et un précédent d'injustice chez Lina Cosmétiques." } },
    ],
    after: [
      { type: "Résultat", visual: "confetti", lines: [{ who: "yasmine", note: "téléphone", text: "Virement reçu, montant exact. Merci !" }] },
    ],
    lesson: "Les RH CALCULENT et GÈRENT la paie ; la COMPTABILITÉ ENREGISTRE et EXÉCUTE le paiement. Deux fonctions, un seul flux — ni l'une ni l'autre ne fait tout seule.",
  },
  s4: {
    id: "s4",
    title: "Scénario 4 — « Le lancement en duo »",
    fn: "mix",
    plaque: "Bureau de Karim — Fondateur / DG",
    place: "Bureau de Karim — Lina Cosmétiques",
    left: "sofia",
    right: "amine",
    center: "karim",
    before: [
      { type: "Situation", lines: [{ who: "karim", text: "Lina Cosmétiques lance sa nouvelle gamme solaire dans 2 mois. Sofia, Amine : je compte sur vous DEUX." }] },
      { type: "Problème", lines: [
        { who: "sofia", text: "J'ai besoin d'une équipe commerciale formée et motivée !" },
        { who: "amine", text: "Et j'ai besoin que Sofia me décrive le profil EXACT qu'elle veut !" },
      ] },
      { type: "Analyse", visual: "circle", lines: [{ who: "karim", text: "Regardez : Amine recrute et forme les bons profils → l'équipe de Sofia comprend mieux les clientes → meilleures ventes → croissance → plus de budget pour recruter et former… C'est un CERCLE." }] },
    ],
    question: "Budget serré : que finance Karim en priorité pour Lina Cosmétiques ?",
    choices: [
      { key: "A", text: "Couper la formation pour économiser.", outcome: "fail", visual: "crack", line: { who: "sofia", text: "Commerciaux non formés… démissions en 4 mois. Le cercle s'est brisé : perte de temps ET d'argent." } },
      { key: "B", text: "Recruter 2 commerciaux formés, comme le demande Sofia.", outcome: "success", line: { who: "amine", text: "2 recrutements ciblés + formation produit. Équipe opérationnelle en 3 semaines." } },
      { key: "C", text: "Tout mettre dans la publicité.", outcome: "partial", line: { who: "sofia", text: "La pub attire des clientes… vers une équipe qui ne sait pas les convaincre. La pub sans les gens = de l'argent brûlé." } },
    ],
    after: [
      { type: "Résultat", visual: "counter", lines: [{ who: "karim", text: "Ventes +30 % au premier trimestre pour Lina Cosmétiques ! Budget RH augmenté : on boucle le cercle." }] },
    ],
    lesson: "Marketing et RH ne sont pas en silos : chacune nourrit l'autre. Les GENS font le produit, le produit fait la CROISSANCE, la croissance fait les MOYENS des gens.",
  },
} satisfies Record<string, Scenario>;

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
