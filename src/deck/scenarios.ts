// Scénarios courts et méthodologiques (version validée par l'utilisateur).

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
  karim: { name: "Direction générale", role: "Direction générale" },
  sofia: { name: "Responsable Marketing", role: "Responsable Marketing" },
  amine: { name: "Responsable RH", role: "Responsable RH" },
  nadia: { name: "RH — Paie", role: "RH — Paie" },
  sami: { name: "Comptabilité", role: "Comptabilité" },
  leila: { name: "Manager commercial", role: "Manager commercial" },
  lina: { name: "Nouvelle commerciale", role: "Nouvelle commerciale" },
  yasmine: { name: "Salariée", role: "Salariée" },
};

// Scénarios épurés (méthode) : Situation & enjeu → Méthode → Choix → Débriefing → Règle clé.
export const SCENARIOS = {
  s1: {
    id: "s1",
    title: "Scénario 1 — « Le lancement »",
    fn: "mk",
    plaque: "Responsable Marketing",
    place: "Service Marketing",
    left: "sofia",
    right: "karim",
    before: [
      { type: "Situation & enjeu", visual: "stat", lines: [{ who: "sofia", text: "Lancement de la crème « Éclat du Sud ». Enjeu : 60 % des nouveaux produits cosmétiques échouent faute d'étude de marché." }] },
      { type: "Méthode", visual: "spc", lines: [{ who: "sofia", text: "① Étude de marché ② Segmentation ③ Ciblage ④ Positionnement. Ensuite seulement : publicité et vente." }] },
    ],
    question: "Quelle cible choisir pour « Éclat du Sud » ?",
    choices: [
      { key: "A", text: "Toutes les femmes de 18 à 60 ans : marché maximum !", outcome: "fail", visual: "truckBack", line: { who: "sofia", text: "Cible trop large : message vague, budget publicitaire dilué." } },
      { key: "B", text: "Femmes 25-40 ans, urbaines, sensibles au naturel.", outcome: "success", line: { who: "sofia", text: "Cible précise = message précis : la campagne parle directement à la cliente." } },
      { key: "C", text: "Les parapharmacies : vendre en gros, c'est vendre plus.", outcome: "trap", line: { who: "sofia", text: "La parapharmacie est un canal de DISTRIBUTION, pas une cible : confusion entre « à qui je vends » et « par où je vends »." } },
    ],
    after: [
      { type: "Résultat", visual: "chart", lines: [{ who: "sofia", text: "Taux de conversion doublé, rupture de stock au 2ᵉ mois." }] },
    ],
    lesson: "Le marketing ne vend pas d'abord : il COMPREND le marché avant d'agir. Étudier → Segmenter → Cibler → Positionner → puis communiquer et vendre.",
  },
  s2: {
    id: "s2",
    title: "Scénario 2 — « L'embauche urgente »",
    fn: "rh",
    plaque: "Direction des Ressources Humaines",
    place: "Service RH",
    left: "amine",
    right: "leila",
    before: [
      { type: "Situation & enjeu", visual: "notif", lines: [{ who: "leila", note: "notification", text: "Besoin urgent d'une commerciale terrain : 3 nouvelles parapharmacies en attente. Enjeu : une mauvaise embauche coûte temps, argent et motivation." }] },
      { type: "Méthode", visual: "process7", lines: [{ who: "amine", text: "① Définir le besoin avec le manager ② Rédiger l'annonce ③ Diffuser ④ Trier les CV ⑤ Entretiens + mise en situation ⑥ Décision ⑦ Intégration." }] },
    ],
    question: "40 CV reçus. Quelle décision RH ?",
    choices: [
      { key: "A", text: "Je prends la première candidate disponible pour aller vite.", outcome: "fail", line: { who: "amine", text: "Disponible ≠ compétente : départ 3 mois plus tard, tout est à refaire." } },
      { key: "B", text: "Je trie selon le profil validé avec le manager, puis entretien et mise en situation.", outcome: "success", line: { who: "amine", text: "5 CV retenus, 2 entretiens, 1 mise en situation réussie : profil exact." } },
      { key: "C", text: "Je laisse le manager choisir seul, c'est son équipe.", outcome: "trap", line: { who: "amine", text: "Le RECRUTEMENT est une mission RH : conformité du contrat, salaire, intégration. Sans les RH, risque juridique." } },
    ],
    after: [
      { type: "Résultat", visual: "enter", lines: [{ who: "amine", text: "Intégration : plan d'accueil, parrain, formation produit. Autonome en 1 mois." }] },
    ],
    lesson: "Le recrutement est un PROCESSUS RH : analyser le besoin → rechercher → sélectionner → intégrer. Vite fait = mal fait : les RH protègent la qualité, pas seulement la vitesse.",
  },
  s3: {
    id: "s3",
    title: "Scénario 3 — « Qui paie les salaires ? »",
    fn: "rh",
    plaque: "RH — Gestion de la paie",
    place: "Service RH — Paie",
    left: "nadia",
    right: "sami",
    before: [
      { type: "Situation & enjeu", visual: "payslip", lines: [{ who: "nadia", text: "Fin de mois : qui paie les salariés, les RH ou la comptabilité ? Enjeu : une paie juste et versée à temps." }] },
      { type: "Méthode", visual: "payflow", lines: [{ who: "nadia", text: "RH : CALCULENT la paie (base, heures sup, primes, retenues). Comptabilité : VÉRIFIE, ENREGISTRE la charge et EXÉCUTE le virement." }] },
    ],
    question: "Une salariée signale 10 heures supplémentaires oubliées. Qui corrige, et quand ?",
    choices: [
      { key: "A", text: "Les RH, AVANT de transmettre à la comptabilité.", outcome: "success", line: { who: "sami", text: "Erreur corrigée à la source : paie juste, versée à temps." } },
      { key: "B", text: "La comptabilité seule, au moment du virement.", outcome: "partial", line: { who: "sami", text: "La comptabilité ne connaît pas les motifs RH (heures sup, primes) : risque d'erreur et de litige." } },
      { key: "C", text: "Personne, c'est négligeable.", outcome: "fail", line: { who: "nadia", text: "« Négligeable » × 12 mois × 30 salariés = une grosse somme et un sentiment d'injustice." } },
    ],
    after: [
      { type: "Résultat", visual: "confetti", lines: [{ who: "yasmine", note: "téléphone", text: "Virement reçu, montant exact." }] },
    ],
    lesson: "Les RH CALCULENT et GÈRENT la paie ; la COMPTABILITÉ ENREGISTRE et EXÉCUTE le paiement. Deux fonctions, un seul flux — ni l'une ni l'autre ne fait tout seule.",
  },
  s4: {
    id: "s4",
    title: "Scénario 4 — « Le lancement en duo »",
    fn: "mix",
    plaque: "Direction générale",
    place: "Direction générale",
    left: "sofia",
    right: "amine",
    center: "karim",
    before: [
      { type: "Situation & enjeu", lines: [{ who: "karim", text: "Lancement d'une gamme solaire dans 2 mois. Enjeu : le Marketing a besoin d'une équipe formée, les RH ont besoin du profil exact." }] },
      { type: "Méthode", visual: "circle", lines: [{ who: "karim", text: "Les RH recrutent et forment → l'équipe comprend mieux les clientes → ventes → croissance → budget pour recruter et former." }] },
    ],
    question: "Budget serré : que financer en priorité ?",
    choices: [
      { key: "A", text: "Couper la formation pour économiser.", outcome: "fail", visual: "crack", line: { who: "sofia", text: "Équipe non formée : démissions en 4 mois, le cercle se brise." } },
      { key: "B", text: "Recruter 2 commerciaux formés, selon le profil défini par le Marketing.", outcome: "success", line: { who: "amine", text: "2 recrutements ciblés + formation produit : équipe opérationnelle en 3 semaines." } },
      { key: "C", text: "Tout mettre dans la publicité.", outcome: "partial", line: { who: "sofia", text: "La pub attire des clientes vers une équipe qui ne sait pas les convaincre : argent brûlé." } },
    ],
    after: [
      { type: "Résultat", visual: "counter", lines: [{ who: "karim", text: "Ventes +30 % au 1er trimestre, budget RH augmenté : le cercle est bouclé." }] },
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
