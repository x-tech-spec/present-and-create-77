export type QuizQuestion = {
  id: number;
  building: "mairie" | "marketing" | "rh" | "place" | "stade";
  buildingIndex: number; // 0: Mairie, 1: Marketing, 2: RH, 3: Place/Stade, 4: Gare
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
    buildingIndex: 0,
    buildingLabel: "Mairie — Stratégie & Création d'Entreprise",
    buildingTheme: "neutral",
    questionInBuilding: "Question 1/1",
    characterId: "karim",
    characterName: "Karim (Fondateur)",
    question: "Lors du passage d'une idée artisanale à une entreprise viable, quel arbitrage économique fonde la pérennité de Lina Cosmétiques ?",
    options: [
      { letter: "A", text: "La maximisation immédiate des volumes de vente par cassage des prix sans couvrir le coût de revient." },
      { letter: "B", text: "La structuration d'une combinaison productive (capital, compétences, approvisionnement) dégageant une valeur ajoutée supérieure aux consommations intermédiaires." },
      { letter: "C", text: "L'externalisation intégrale des fonctions pour annuler l'ensemble des charges fixes de l'entreprise." },
      { letter: "D", text: "La dépendance exclusive aux subventions publiques pour financer le Besoin en Fonds de Roulement (BFR)." },
    ],
    correctLetter: "B",
    explanation: "Une entreprise pérenne combine durablement ses facteurs de production pour créer une valeur ajoutée nette supérieure à ses coûts de fonctionnement, garantissant son autonomie financière.",
  },
  {
    id: 2,
    building: "marketing",
    buildingIndex: 1,
    buildingLabel: "Immeuble Marketing — Segmentation & Marché",
    buildingTheme: "lavender",
    questionInBuilding: "Question 1/2",
    characterId: "sofia",
    characterName: "Sofia (Marketing)",
    question: "Pour cibler la crème « Éclat du Sud », quelle approche de segmentation offre la meilleure valeur prédictive sur l'acte d'achat réel ?",
    options: [
      { letter: "A", text: "La segmentation démographique basique (tranche d'âge et ville de résidence uniquement)." },
      { letter: "B", text: "La segmentation par volume global de consommation du foyer sans distinction de catégorie." },
      { letter: "C", text: "La segmentation comportementale et psychographique croisée (sensibilité bio, fréquence d'usage et valeurs éthiques)." },
      { letter: "D", text: "La segmentation géographique exclusive calquée sur les zones climatiques." },
    ],
    correctLetter: "C",
    explanation: "En cosmétique de spécialité, les motivations profondes (bénéfice recherché, engagement éco-responsable) et les habitudes d'usage prédisent l'acte d'achat avec bien plus de précision que l'âge ou la localisation seule.",
  },
  {
    id: 3,
    building: "marketing",
    buildingIndex: 1,
    buildingLabel: "Immeuble Marketing — Mix 4P & Distribution",
    buildingTheme: "lavender",
    questionInBuilding: "Question 2/2",
    characterId: "sofia",
    characterName: "Sofia (Marketing)",
    question: "Face à l'arbitrage entre vente directe D2C (e-shop) et distribution sélective (parapharmacies), quel est l'impact stratégique clé ?",
    options: [
      { letter: "A", text: "Le D2C maximise la marge brute et la maîtrise des First-Party Data, mais implique un Coût d'Acquisition Client (CAC) direct." },
      { letter: "B", text: "Le réseau sélectif offre une marge unitaire plus élevée car le distributeur finance la totalité du marketing." },
      { letter: "C", text: "Les deux canaux génèrent automatiquement le même taux de marge nette et la même notoriété spontanée." },
      { letter: "D", text: "Le D2C supprime totalement la nécessité d'investir dans le branding et la communication digitale." },
    ],
    correctLetter: "A",
    explanation: "En D2C, la marque conserve 100% de la marge unitaire et la relation client directe, mais doit assumer l'acquisition de trafic. Le réseau sélectif apporte un volume immédiat contre une rétrocession de marge.",
  },
  {
    id: 4,
    building: "rh",
    buildingIndex: 2,
    buildingLabel: "Immeuble RH — Recrutement & Cadre Légal",
    buildingTheme: "cosmic",
    questionInBuilding: "Question 1/2",
    characterId: "amine",
    characterName: "Amine (DRH)",
    question: "Face à une hausse imprévue des commandes, quel choix de recrutement concilie réactivité opérationnelle et sécurité juridique ?",
    options: [
      { letter: "A", text: "Embaucher en CDD/intérim pour surcroît temporaire d'activité en respectant le motif légal et le délai de carence." },
      { letter: "B", text: "Faire appel à un travailleur indépendant (freelance) en lui imposant horaires fixes et lien de subordination direct." },
      { letter: "C", text: "Recruter des stagiaires non rémunérés pour assumer des tâches permanentes de production." },
      { letter: "D", text: "Prolonger unilatéralement la période d'essai des salariés en poste au-delà des plafonds légaux." },
    ],
    correctLetter: "A",
    explanation: "Le recours au CDD ou à l'intérim pour surcroît d'activité est strictement encadré par le droit du travail. Imposer des horaires et un lien d'autorité à un freelance crée un risque majeur de requalification judiciaire en CDI.",
  },
  {
    id: 5,
    building: "rh",
    buildingIndex: 2,
    buildingLabel: "Immeuble RH — Rétention & Marque Employeur",
    buildingTheme: "cosmic",
    questionInBuilding: "Question 2/2",
    characterId: "amine",
    characterName: "Amine (DRH)",
    question: "Comment la fonction RH prévient-elle durablement le risque de fuite des talents clés (formulateurs, chimistes) chez Lina Cosmétiques ?",
    options: [
      { letter: "A", text: "En imposant des clauses de non-concurrence sans contrepartie financière obligatoire." },
      { letter: "B", text: "Par une politique de rémunération globale associant parcours d'intégration soigné, formation continue (GPEC) et reconnaissance du travail." },
      { letter: "C", text: "En s'alignant systématiquement sur les minima conventionnels les plus bas pour limiter les charges." },
      { letter: "D", text: "En restreignant les échanges transversaux entre les équipes pour éviter les comparaisons salariales." },
    ],
    correctLetter: "B",
    explanation: "La fidélisation des profils à haute technicité repose sur un triptyque : onboarding structuré, perspectives d'évolution (GPEC) et équilibre de la rémunération globale (salaire, avantages, reconnaissance du sens du travail).",
  },
  {
    id: 6,
    building: "place",
    buildingIndex: 3,
    buildingLabel: "Place / Pont — Synergie Marketing ↔ RH",
    buildingTheme: "neutral",
    questionInBuilding: "Question 1/1",
    characterId: "nadia",
    characterName: "Nadia (RH) & Sami (Compta)",
    question: "Sur la Place Centrale, quelle notion de management formalise l'alignement entre la promesse client externe et l'expérience collaborateur ?",
    options: [
      { letter: "A", text: "Le cloisonnement strict des budgets opérationnels entre chaque direction." },
      { letter: "B", text: "La symétrie des attentions : la qualité perçue par les clientes reflète la qualité managériale vécue en interne." },
      { letter: "C", text: "La primauté absolue des objectifs de vente sur le climat social et le bien-être au travail." },
      { letter: "D", text: "La sous-traitance intégrale de la gestion administrative de la paie pour dissoudre les responsabilités." },
    ],
    correctLetter: "B",
    explanation: "La 'symétrie des attentions' postule qu'une marque ne peut tenir une promesse d'authenticité et d'excellence auprès de ses clients que si elle applique ce même niveau d'écoute et d'exigence bienveillante envers ses salariés.",
  },
  {
    id: 7,
    building: "stade",
    buildingIndex: 3,
    buildingLabel: "Stade — Compétitivité & Cercle Vertueux",
    buildingTheme: "neutral",
    questionInBuilding: "Question 1/1",
    characterId: "karim",
    characterName: "Karim (Direction)",
    question: "Comment se manifeste concrètement l'interdépendance vertueuse entre la performance RH et la rentabilité Marketing ?",
    options: [
      { letter: "A", text: "Des compétences RH ciblées conçoivent des innovations marketing distinctives, générant de la marge qui autofinance la formation et la qualité de vie au travail." },
      { letter: "B", text: "La coupe drastique dans les budgets de recrutement permet d'augmenter sans limite les dépenses publicitaires." },
      { letter: "C", text: "Le marketing prend la tutelle hiérarchique sur les Ressources Humaines pour imposer ses rythmes." },
      { letter: "D", text: "L'entreprise fige son catalogue produit afin de supprimer tout besoin de formation continue." },
    ],
    correctLetter: "A",
    explanation: "Le cercle vertueux de compétitivité lie directement le capital humain à l'avantage concurrentiel : le talent produit la valeur marketing, qui génère la rentabilité requise pour valoriser et développer les talents.",
  },
];
