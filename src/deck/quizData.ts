export type QuizQuestion = {
  id: number;
  building: "mairie" | "marketing" | "rh" | "place" | "stade";
  buildingLabel: string;
  buildingTheme: "neutral" | "lavender" | "cosmic";
  questionInBuilding: string; // ex: "Question 1/2"
  characterId: "karim" | "sofia" | "amine" | "nadia" | "sami";
  characterName: string;
  question: string;
  options: { letter: "A" | "B" | "C" | "D"; text: string }[];
  correctLetter: "A" | "B" | "C" | "D";
  explanation: string;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    building: "mairie",
    buildingLabel: "Mairie",
    buildingTheme: "neutral",
    questionInBuilding: "Question 1/1",
    characterId: "karim",
    characterName: "Karim (Fondateur)",
    question: "Qu'est-ce qu'une entreprise ?",
    options: [
      { letter: "A", text: "Un organisme qui produit des biens ou services pour satisfaire des besoins" },
      { letter: "B", text: "Uniquement une usine de fabrication" },
      { letter: "C", text: "Un service public gratuit" },
      { letter: "D", text: "Une association sans but économique" },
    ],
    correctLetter: "A",
    explanation: "L'entreprise combine des ressources (humaines, financières, matérielles) pour créer de la valeur.",
  },
  {
    id: 2,
    building: "marketing",
    buildingLabel: "Immeuble Marketing",
    buildingTheme: "lavender",
    questionInBuilding: "Question 1/2",
    characterId: "sofia",
    characterName: "Sofia (Marketing)",
    question: "Quelle est la mission principale du marketing ?",
    options: [
      { letter: "A", text: "Enregistrer les factures" },
      { letter: "B", text: "Étudier le marché et adapter l'offre aux besoins des clientes" },
      { letter: "C", text: "Gérer les salaires" },
      { letter: "D", text: "Réparer les machines" },
    ],
    correctLetter: "B",
    explanation: "Sofia étudie les clientes de Lina Cosmétiques avant de lancer la crème « Éclat du Sud ».",
  },
  {
    id: 3,
    building: "marketing",
    buildingLabel: "Immeuble Marketing",
    buildingTheme: "lavender",
    questionInBuilding: "Question 2/2",
    characterId: "sofia",
    characterName: "Sofia (Marketing)",
    question: "Quelle différence entre marketing, ventes et publicité ?",
    options: [
      { letter: "A", text: "Ce sont trois mots pour la même chose" },
      { letter: "B", text: "Le marketing = vendre en magasin ; la publicité = recruter" },
      { letter: "C", text: "Le marketing définit la cible et la stratégie ; la vente conclut la vente ; la publicité fait connaître le produit" },
      { letter: "D", text: "La publicité gère toute l'entreprise" },
    ],
    correctLetter: "C",
    explanation: "Le marketing décide À QUI parler, la publicité fait parler du produit, la vente transforme l'intérêt en achat.",
  },
  {
    id: 4,
    building: "rh",
    buildingLabel: "Immeuble RH",
    buildingTheme: "cosmic",
    questionInBuilding: "Question 1/2",
    characterId: "amine",
    characterName: "Amine (DRH)",
    question: "Quelle est la mission des Ressources Humaines ?",
    options: [
      { letter: "A", text: "Gérer les clients" },
      { letter: "B", text: "Gérer les machines de production" },
      { letter: "C", text: "Gérer les humains de l'entreprise : recrutement, formation, paie" },
      { letter: "D", text: "Faire la comptabilité" },
    ],
    correctLetter: "C",
    explanation: "Amine recrute, forme et paie les salariés de Lina Cosmétiques.",
  },
  {
    id: 5,
    building: "rh",
    buildingLabel: "Immeuble RH",
    buildingTheme: "cosmic",
    questionInBuilding: "Question 2/2",
    characterId: "amine",
    characterName: "Amine (DRH)",
    question: "Parmi ces missions, laquelle appartient aux RH ?",
    options: [
      { letter: "A", text: "Le recrutement et la formation des salariés" },
      { letter: "B", text: "Le choix de la couleur du packaging" },
      { letter: "C", text: "La vente aux distributeurs" },
      { letter: "D", text: "La maintenance des locaux" },
    ],
    correctLetter: "A",
    explanation: "Le recrutement et la formation sont au cœur du travail du DRH.",
  },
  {
    id: 6,
    building: "place",
    buildingLabel: "Place / Pont",
    buildingTheme: "neutral",
    questionInBuilding: "Question 1/1",
    characterId: "nadia",
    characterName: "Nadia (RH) & Sami (Compta)",
    question: "Qui paie les salaires chez Lina Cosmétiques ?",
    options: [
      { letter: "A", text: "Sami le comptable calcule et Nadia la RH paie" },
      { letter: "B", text: "Nadia (RH) calcule la paie, Sami (comptabilité) enregistre et exécute le virement" },
      { letter: "C", text: "Le client paie directement les salariés" },
      { letter: "D", text: "Personne, les salaires tombent du ciel" },
    ],
    correctLetter: "B",
    explanation: "Les RH CALCULENT et gèrent la paie ; la comptabilité ENREGISTRE et EXÉCUTE le paiement. Cas : les heures sup de Yasmine ont été calculées par Nadia, payées via Sami.",
  },
  {
    id: 7,
    building: "stade",
    buildingLabel: "Stade",
    buildingTheme: "neutral",
    questionInBuilding: "Question 1/1",
    characterId: "karim",
    characterName: "Karim (Direction)",
    question: "Comment fonctionne le cercle vertueux de Lina Cosmétiques ?",
    options: [
      { letter: "A", text: "RH → bons recrutements → marketing qui comprend mieux la cliente → meilleur produit → croissance → plus de budget RH → et ça recommence" },
      { letter: "B", text: "On arrête de recruter pour économiser" },
      { letter: "C", text: "Le marketing remplace les RH" },
      { letter: "D", text: "Les RH font la publicité" },
    ],
    correctLetter: "A",
    explanation: "Karim a réuni Sofia et Amine : les deux fonctions se renforcent mutuellement pour la croissance.",
  },
];
