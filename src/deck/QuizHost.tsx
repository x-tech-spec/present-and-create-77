import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import QRCode from "qrcode";
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Users,
  ArrowRight,
  Download,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  HelpCircle,
  Landmark,
  Megaphone,
  Briefcase,
  Layers,
} from "lucide-react";
import { QUIZ_QUESTIONS, type QuizQuestion } from "./quizData";
import { QuizAvatar, type AvatarId } from "./QuizAvatars";
import {
  createSession,
  subscribeToSession,
  updateSessionState,
  type SessionData,
  type PlayerData,
} from "./firebaseQuiz";
import { play, setSound, isSoundOn } from "./sound";
import { Character } from "./Characters";

// Icône selon le bâtiment
function BuildingIcon({ b }: { b: string }) {
  if (b === "mairie") return <Landmark className="h-7 w-7 text-deep" />;
  if (b === "marketing") return <Megaphone className="h-7 w-7 text-lavender" />;
  if (b === "rh") return <Briefcase className="h-7 w-7 text-cosmic" />;
  if (b === "place") return <Layers className="h-7 w-7 text-deep" />;
  return <Trophy className="h-7 w-7 text-deep" />;
}

// Bâtiments de la ville
const STOPS_DATA = [
  { id: "mairie", label: "Mairie", x: 280, y: 580, color: "var(--silver)" },
  { id: "marketing", label: "Immeuble Marketing", x: 620, y: 440, color: "var(--lavender)" },
  { id: "rh", label: "Immeuble RH", x: 980, y: 440, color: "var(--cosmic)" },
  { id: "place", label: "Place / Pont", x: 1300, y: 580, color: "var(--silver)" },
  { id: "stade", label: "Stade", x: 1540, y: 520, color: "var(--silver)" },
  { id: "gare", label: "Gare (Podium)", x: 1720, y: 560, color: "var(--silver)" },
];

export function QuizHost() {
  const [pin] = useState(() => {
    // Code PIN stable à 4 chiffres généré pour la session
    return String(Math.floor(1000 + Math.random() * 9000));
  });

  const [session, setSession] = useState<SessionData | null>(null);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [soundActive, setSoundActive] = useState(isSoundOn());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [travelProgress, setTravelProgress] = useState(0);

  // Initialisation de la session
  useEffect(() => {
    const s = createSession(pin);
    setSession(s);

    const unsub = subscribeToSession(pin, (updated) => {
      if (updated) setSession(updated);
    });

    // Génération du QR code local SVG
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const joinUrl = `${origin}/?mode=player&pin=${pin}`;
    QRCode.toDataURL(joinUrl, {
      margin: 1,
      width: 440,
      color: {
        dark: "#2b1e3e",
        light: "#ffffff",
      },
    }).then(setQrUrl).catch(() => {});

    return () => unsub();
  }, [pin]);

  const toggleSound = () => {
    const next = !soundActive;
    setSound(next);
    setSoundActive(next);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const playersList = useMemo(() => {
    if (!session?.players) return [];
    return Object.values(session.players);
  }, [session?.players]);

  const sortedLeaderboard = useMemo(() => {
    return [...playersList].sort((a, b) => b.score - a.score);
  }, [playersList]);

  const currentQIndex = session?.currentQuestionIndex ?? 0;
  const currentQ: QuizQuestion | undefined = QUIZ_QUESTIONS[currentQIndex];

  // Gestion de la touche Espace pour faire avancer la présentation
  const handleNextStep = useCallback(() => {
    if (!session) return;
    const st = session.state;

    if (st === "lobby") {
      // Démarrage du bus depuis la Mairie
      play("vroom");
      setTravelFrom(0);
      setTravelTo(QUIZ_QUESTIONS[0]!.buildingIndex);
      updateSessionState(pin, { state: "travel" });
      setTimeout(() => {
        updateSessionState(pin, {
          state: "question",
          currentBuilding: QUIZ_QUESTIONS[0]!.building,
          currentQuestionIndex: 0,
          questionStartedAt: Date.now(),
          showAnswers: false,
        });
      }, 2200);
    } else if (st === "question") {
      // Affichage de la correction
      play("ding");
      updateSessionState(pin, { state: "correction", showAnswers: true });
    } else if (st === "correction") {
      // Affichage du classement intermédiaire
      updateSessionState(pin, { state: "intermediate_rank" });
    } else if (st === "intermediate_rank") {
      // Prochaine question ou Podium
      if (currentQIndex < QUIZ_QUESTIONS.length - 1) {
        const nextIdx = currentQIndex + 1;
        const currQ = QUIZ_QUESTIONS[currentQIndex]!;
        const nextQ = QUIZ_QUESTIONS[nextIdx]!;
        play("vroom");
        setTravelFrom(currQ.buildingIndex);
        setTravelTo(nextQ.buildingIndex);
        updateSessionState(pin, { state: "travel" });
        setTimeout(() => {
          updateSessionState(pin, {
            state: "question",
            currentBuilding: nextQ.building,
            currentQuestionIndex: nextIdx,
            questionStartedAt: Date.now(),
            showAnswers: false,
          });
        }, 2200);
      } else {
        // Arrivée au podium à la Gare (stop 4)
        const currQ = QUIZ_QUESTIONS[currentQIndex]!;
        play("vroom");
        setTravelFrom(currQ.buildingIndex);
        setTravelTo(4);
        updateSessionState(pin, { state: "travel" });
        setTimeout(() => {
          play("fanfare");
          updateSessionState(pin, { state: "podium", currentBuilding: "gare" });
        }, 2200);
      }
    }
  }, [session, pin, currentQIndex, play]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        handleNextStep();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleNextStep]);

  // Statistiques des réponses sur la question active
  const stats = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    if (!currentQ || !session?.players) return counts;
    const qKey = `q${currentQ.id}`;
    for (const p of Object.values(session.players)) {
      const ans = p.answers?.[qKey];
      if (ans?.choice && ans.choice in counts) {
        counts[ans.choice as keyof typeof counts]++;
      }
    }
    return counts;
  }, [currentQ, session?.players]);

  const answeredCount = stats.A + stats.B + stats.C + stats.D;

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ["Rang", "Pseudo", "Avatar", "Score Total"],
      ...sortedLeaderboard.map((p, idx) => [idx + 1, p.name, p.avatar, p.score]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bus-quizz-resultats-${pin}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const state = session?.state ?? "lobby";

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none bg-paper font-sans text-deep flex flex-col justify-between">
      {/* Barre supérieure fixe pour vidéoprojecteur */}
      <header className="h-16 px-8 flex items-center justify-between border-b border-deep/15 bg-paper/90 backdrop-blur z-20">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-deep text-silver font-bold">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none text-deep">
              LE BUS QUIZZ · LINA COSMÉTIQUES
            </h1>
            <p className="text-xs font-semibold text-deep/60 mt-0.5">
              Écran Vidéoprojecteur · Datashow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 rounded-full border border-deep/20 bg-silver/70 px-4 py-1.5 text-sm font-bold text-deep shadow-sm">
            <Users className="h-4 w-4" />
            <span>{playersList.length} passagers à bord</span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-deep/20 bg-deep px-5 py-1.5 text-sm font-extrabold text-silver tracking-widest shadow-md">
            <span>PIN : {pin}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-deep/20 bg-silver/80 text-deep hover:bg-silver transition cursor-pointer"
              title={soundActive ? "Désactiver le son" : "Activer le son"}
            >
              {soundActive ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-deep/20 bg-silver/80 text-deep hover:bg-silver transition cursor-pointer"
              title="Plein écran (Touche F)"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal selon l'état du jeu */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
        {/* ÉCRAN 1 : LOBBY AVEC VILLE 3D ET BUS */}
        {state === "lobby" && (
          <div className="relative w-full max-w-7xl h-full flex flex-col justify-between">
            {/* Vue Ville 3D interactive */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden border-2 border-deep/20 shadow-2xl bg-paper">
              <CityMap active={0} mode="browse" />
            </div>

            {/* Éléments HUD superposés sur la ville 3D */}
            <div className="relative z-10 grid grid-cols-[380px_1fr_420px] gap-6 w-full h-full p-6 pointer-events-none items-center">
              {/* Panneau gauche : QR Code & PIN */}
              <div className="pointer-events-auto flex flex-col items-center justify-center rounded-3xl border-2 border-deep/20 bg-silver/90 backdrop-blur-md p-6 shadow-2xl text-center">
                <span className="text-xs font-bold text-deep/70 uppercase tracking-widest mb-2">
                  Scannez le QR Code ou ouvrez le lien
                </span>
                <div className="p-3 bg-white rounded-2xl border-2 border-deep shadow-inner my-1">
                  {qrUrl ? (
                    <img src={qrUrl} alt="QR code pour rejoindre le quiz" className="h-56 w-56" />
                  ) : (
                    <div className="h-56 w-56 flex items-center justify-center text-xs font-semibold">Génération du QR code...</div>
                  )}
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-base font-bold text-deep">Code PIN :</span>
                  <span className="text-4xl font-black tracking-widest text-deep bg-silver px-5 py-1 rounded-xl border border-deep/30">
                    {pin}
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold text-deep/60">
                  Lien direct : <span className="underline">{typeof window !== "undefined" ? window.location.host : ""}</span> (?mode=player)
                </p>
              </div>

              {/* Centre : Ville 3D avec badge Bus Mairie */}
              <div className="flex flex-col items-center justify-start h-full pt-4">
                <div className="pointer-events-auto inline-flex items-center gap-3 rounded-full border border-deep/20 bg-silver/95 px-6 py-2.5 shadow-xl backdrop-blur-md">
                  <Truck className="h-6 w-6 text-cosmic" />
                  <span className="text-sm font-black text-deep">Départ : Mairie de la Ville-Entreprise</span>
                </div>
              </div>

              {/* Panneau droite : Passagers & Démarrage */}
              <div className="pointer-events-auto flex flex-col h-[520px] justify-between rounded-3xl border-2 border-deep/20 bg-silver/90 backdrop-blur-md p-6 shadow-2xl">
                <div>
                  <div className="flex items-center justify-between border-b border-deep/20 pb-3">
                    <h2 className="text-xl font-black">Passagers à bord</h2>
                    <span className="text-xs font-bold bg-cosmic text-silver px-3 py-1 rounded-full">
                      {playersList.length} connecté{playersList.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-1">
                    {playersList.length === 0 ? (
                      <div className="w-full py-12 text-center text-deep/60 font-semibold text-sm italic">
                        En attente des étudiants... Scannez le QR code pour monter dans le Bus.
                      </div>
                    ) : (
                      playersList.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2.5 rounded-xl border border-deep/20 bg-silver px-3 py-1.5 shadow-sm"
                        >
                          <QuizAvatar id={p.avatar} size={32} />
                          <span className="text-sm font-bold text-deep">{p.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Bouton pour démarrer */}
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={handleNextStep}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-deep py-4 px-6 text-xl font-black text-silver shadow-xl hover:bg-deep-dark transition cursor-pointer"
                  >
                    Faire démarrer le Bus <ArrowRight className="h-6 w-6" />
                  </button>
                  <div className="text-center text-xs font-bold text-deep/60">
                    Appuyez sur <kbd className="px-1.5 py-0.5 bg-silver border border-deep/20 rounded font-mono">ESPACE</kbd> pour lancer
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÉCRAN 2 : DÉPLACEMENT 3D DU BUS SUR LA VILLE */}
        {state === "travel" && (
          <div className="relative w-full max-w-7xl h-full flex flex-col items-center justify-center">
            {/* Ville 3D avec déplacement en direct du bus */}
            <div className="w-full h-full rounded-3xl overflow-hidden border-2 border-deep/20 shadow-2xl bg-paper">
              <CityMap
                active={travelTo}
                from={travelFrom}
                mode="travel"
              />
            </div>

            {/* Bannière supérieure de trajet */}
            <div className="absolute top-6 z-20 flex items-center gap-4 rounded-full border-2 border-deep/20 bg-silver/95 px-8 py-3.5 shadow-2xl backdrop-blur-md">
              <Truck className="h-7 w-7 text-cosmic animate-pulse" />
              <div className="flex flex-col">
                <span className="text-xs font-extrabold uppercase tracking-widest text-deep/60">
                  Déplacement du Bus dans la Ville-Entreprise
                </span>
                <span className="text-xl font-black text-deep">
                  {travelTo === 4 ? "En route vers la Gare (Podium final)..." : `Arrêt suivant : ${QUIZ_QUESTIONS.find((q) => q.buildingIndex === travelTo)?.buildingLabel || "Prochain Bâtiment"}`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ÉCRAN 3 : QUESTION ACTIVE */}
        {state === "question" && currentQ && (
          <div className="w-full max-w-6xl flex flex-col justify-between h-full py-4">
            {/* En-tête bâtiment */}
            <div className="flex items-center justify-between border-b border-deep/15 pb-4">
              <div className="flex items-center gap-3">
                <BuildingIcon b={currentQ.building} />
                <span className="text-xl font-black uppercase tracking-wider text-deep">
                  {currentQ.buildingLabel}
                </span>
                <span className="rounded-full bg-silver px-3 py-1 text-xs font-bold text-deep border border-deep/20">
                  {currentQ.questionInBuilding}
                </span>
              </div>
              <div className="text-lg font-bold text-deep/80">
                {answeredCount} / {playersList.length} ont répondu
              </div>
            </div>

            {/* Question posée en très grand */}
            <div className="my-6 text-center">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-snug">
                {currentQ.question}
              </h2>
            </div>

            {/* 4 choix A/B/C/D */}
            <div className="grid grid-cols-2 gap-6 my-auto">
              {currentQ.options.map((opt) => (
                <div
                  key={opt.letter}
                  className="flex items-center gap-6 rounded-3xl border-2 border-deep/20 bg-silver/60 p-6 shadow-md transition"
                >
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-deep text-3xl font-black text-silver shadow-md">
                    {opt.letter}
                  </span>
                  <span className="text-2xl font-bold leading-tight text-deep">
                    {opt.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Barre inférieure pour le professeur */}
            <div className="flex items-center justify-between pt-4 border-t border-deep/15">
              <span className="text-sm font-semibold text-deep/60">
                Prenez le temps de faire voter la salle
              </span>
              <button
                onClick={handleNextStep}
                className="flex items-center gap-3 rounded-full bg-deep px-8 py-3.5 text-lg font-extrabold text-silver shadow-lg hover:bg-deep-dark transition cursor-pointer"
              >
                Afficher la correction (Espace) <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* ÉCRAN 4 : CORRECTION ET EXPLICATION */}
        {state === "correction" && currentQ && (
          <div className="w-full max-w-6xl flex flex-col justify-between h-full py-4">
            <div className="flex items-center justify-between border-b border-deep/15 pb-3">
              <div className="flex items-center gap-3">
                <BuildingIcon b={currentQ.building} />
                <span className="text-lg font-black uppercase tracking-wider">
                  Correction · {currentQ.buildingLabel}
                </span>
              </div>
              <span className="text-sm font-bold bg-cosmic text-silver px-3 py-1 rounded-full">
                Bonne réponse : Option {currentQ.correctLetter}
              </span>
            </div>

            {/* Intitulé de la question */}
            <h2 className="text-3xl font-black text-center my-3">
              {currentQ.question}
            </h2>

            {/* Grille avec la bonne réponse en Cosmic Blue et les mauvaises en Deep/Silver */}
            <div className="grid grid-cols-2 gap-4">
              {currentQ.options.map((opt) => {
                const isCorrect = opt.letter === currentQ.correctLetter;
                const voteCount = stats[opt.letter];
                return (
                  <div
                    key={opt.letter}
                    className={`flex items-center justify-between gap-4 rounded-2xl p-5 border-2 transition ${
                      isCorrect
                        ? "bg-cosmic text-silver border-cosmic shadow-xl"
                        : "bg-silver/40 text-deep/75 border-deep/15 opacity-80"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl font-black ${
                          isCorrect ? "bg-silver text-cosmic" : "bg-deep text-silver"
                        }`}
                      >
                        {opt.letter}
                      </span>
                      <span className="text-xl font-bold leading-snug">
                        {opt.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-lg font-black">{voteCount} vote{voteCount > 1 ? "s" : ""}</span>
                      {isCorrect && <CheckCircle2 className="h-7 w-7 text-silver" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explication officielle du cours avec le personnage associé */}
            <div className="my-3 flex items-center gap-6 rounded-2xl border-2 border-cosmic/40 bg-silver/60 p-5 shadow-lg">
              <div className="shrink-0 scale-75 -my-8 -mx-4">
                <Character id={currentQ.characterId} size={150} label={false} />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-cosmic">
                  Explication de {currentQ.characterName}
                </div>
                <p className="text-xl font-extrabold text-deep mt-1 leading-snug">
                  {currentQ.explanation}
                </p>
              </div>
            </div>

            {/* Action suivante */}
            <div className="flex items-center justify-between pt-3 border-t border-deep/15">
              <span className="text-sm font-semibold text-deep/60">
                {answeredCount} étudiant{answeredCount > 1 ? "s ont" : " a"} répondu
              </span>
              <button
                onClick={handleNextStep}
                className="flex items-center gap-3 rounded-full bg-deep px-8 py-3 text-lg font-extrabold text-silver shadow-lg hover:bg-deep-dark transition cursor-pointer"
              >
                Voir le classement intermédiaire (Espace) <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* ÉCRAN 5 : CLASSEMENT INTERMÉDIAIRE (TOP 5) */}
        {state === "intermediate_rank" && (
          <div className="w-full max-w-4xl flex flex-col justify-between h-full py-6">
            <div className="text-center">
              <span className="text-sm font-bold uppercase tracking-widest text-deep/60">
                Arrêt {currentQIndex + 1} / {QUIZ_QUESTIONS.length}
              </span>
              <h2 className="text-4xl font-black mt-1">
                Classement intermédiaire
              </h2>
            </div>

            <div className="my-6 flex flex-col gap-3">
              {sortedLeaderboard.slice(0, 5).map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-2xl border-2 border-deep/15 bg-silver/70 p-4 shadow-sm"
                >
                  <div className="flex items-center gap-5">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-black ${
                        idx === 0
                          ? "bg-deep text-silver"
                          : idx === 1
                          ? "bg-cosmic text-silver"
                          : "bg-silver text-deep border border-deep/20"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <QuizAvatar id={p.avatar} size={48} />
                    <span className="text-2xl font-black text-deep">{p.name}</span>
                  </div>
                  <span className="text-2xl font-black text-deep">
                    {p.score} <span className="text-sm font-semibold text-deep/60">pts</span>
                  </span>
                </div>
              ))}

              {sortedLeaderboard.length === 0 && (
                <div className="py-12 text-center text-lg font-semibold text-deep/60">
                  Aucun point enregistré pour l'instant.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-deep/15">
              <button
                onClick={handleNextStep}
                className="flex items-center gap-3 rounded-full bg-deep px-8 py-3.5 text-xl font-extrabold text-silver shadow-xl hover:bg-deep-dark transition cursor-pointer"
              >
                {currentQIndex < QUIZ_QUESTIONS.length - 1
                  ? "Continuer la visite en Bus (Espace)"
                  : "Arriver au Podium final (Espace)"}{" "}
                <ArrowRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}

        {/* ÉCRAN 6 : PODIUM FINAL À LA GARE */}
        {state === "podium" && (
          <div className="w-full max-w-5xl flex flex-col justify-between h-full py-6 items-center text-center">
            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-deep/60">
                Terminus : La Gare
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-1">
                Podium final · Top 3
              </h2>
            </div>

            {/* Podium des 3 premiers */}
            <div className="grid grid-cols-3 gap-6 items-end w-full max-w-3xl my-6">
              {/* 2ème place */}
              <div className="flex flex-col items-center">
                {sortedLeaderboard[1] ? (
                  <>
                    <QuizAvatar id={sortedLeaderboard[1].avatar} size={80} />
                    <span className="mt-2 text-xl font-extrabold">{sortedLeaderboard[1].name}</span>
                    <span className="text-sm font-bold text-deep/70">{sortedLeaderboard[1].score} pts</span>
                  </>
                ) : (
                  <span className="text-sm text-deep/40 italic">-</span>
                )}
                <div className="mt-3 w-full h-36 rounded-t-2xl bg-silver border-2 border-deep/20 flex items-center justify-center text-3xl font-black shadow-md">
                  2
                </div>
              </div>

              {/* 1ère place */}
              <div className="flex flex-col items-center">
                {sortedLeaderboard[0] ? (
                  <>
                    <div className="relative">
                      <QuizAvatar id={sortedLeaderboard[0].avatar} size={100} />
                      <Trophy className="absolute -top-3 -right-3 h-8 w-8 text-cosmic animate-bounce" />
                    </div>
                    <span className="mt-2 text-2xl font-black text-deep">{sortedLeaderboard[0].name}</span>
                    <span className="text-base font-bold text-cosmic">{sortedLeaderboard[0].score} pts</span>
                  </>
                ) : (
                  <span className="text-sm text-deep/40 italic">-</span>
                )}
                <div className="mt-3 w-full h-52 rounded-t-2xl bg-deep text-silver border-2 border-deep flex items-center justify-center text-5xl font-black shadow-xl">
                  1
                </div>
              </div>

              {/* 3ème place */}
              <div className="flex flex-col items-center">
                {sortedLeaderboard[2] ? (
                  <>
                    <QuizAvatar id={sortedLeaderboard[2].avatar} size={80} />
                    <span className="mt-2 text-xl font-extrabold">{sortedLeaderboard[2].name}</span>
                    <span className="text-sm font-bold text-deep/70">{sortedLeaderboard[2].score} pts</span>
                  </>
                ) : (
                  <span className="text-sm text-deep/40 italic">-</span>
                )}
                <div className="mt-3 w-full h-28 rounded-t-2xl bg-silver/60 border-2 border-deep/20 flex items-center justify-center text-3xl font-black shadow-md">
                  3
                </div>
              </div>
            </div>

            {/* Boutons d'action finale */}
            <div className="flex items-center gap-6 mt-4">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-3 rounded-full border-2 border-deep bg-silver px-6 py-3 font-bold text-deep hover:bg-silver/80 transition cursor-pointer"
              >
                <Download className="h-5 w-5" /> Exporter le classement CSV
              </button>

              <a
                href="../#4.1"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = window.location.pathname;
                  }
                }}
                className="flex items-center gap-3 rounded-full bg-deep px-8 py-3.5 text-lg font-black text-silver shadow-xl hover:bg-deep-dark transition cursor-pointer"
              >
                Retour à la présentation → Conclusion <ArrowRight className="h-6 w-6" />
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer sobre */}
      <footer className="h-10 px-8 flex items-center justify-between text-xs font-semibold text-deep/50 border-t border-deep/10 bg-paper">
        <span>Lina Cosmétiques · Exposés 4.2 Marketing & 4.3 RH</span>
        <span>Appuyez sur ESPACE pour passer à l'étape suivante · Touche F pour Plein écran</span>
      </footer>
    </div>
  );
}
