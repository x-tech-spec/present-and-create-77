import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  Volume2,
  VolumeX,
  Sparkles,
  Landmark,
  Megaphone,
  Briefcase,
  Layers,
} from "lucide-react";
import { QUIZ_QUESTIONS, type QuizQuestion } from "./quizData";
import { QuizAvatar, AVATAR_LIST, type AvatarId } from "./QuizAvatars";
import {
  subscribeToSession,
  registerPlayer,
  submitPlayerAnswer,
  isOnline,
  onNetworkStatusChange,
  reconnectPlayer,
  type SessionData,
  type PlayerData,
} from "./firebaseQuiz";
import { play, setSound, isSoundOn } from "./sound";

function BuildingIcon({ b }: { b: string }) {
  if (b === "mairie") return <Landmark className="h-5 w-5 text-deep" />;
  if (b === "marketing") return <Megaphone className="h-5 w-5 text-lavender" />;
  if (b === "rh") return <Briefcase className="h-5 w-5 text-cosmic" />;
  if (b === "place") return <Layers className="h-5 w-5 text-deep" />;
  return <Trophy className="h-5 w-5 text-deep" />;
}

export function QuizPlayer() {
  const [pinInput, setPinInput] = useState(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("pin");
      return p || "";
    }
    return "";
  });

  const [name, setName] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("lina_quiz_player_name") || "";
    }
    return "";
  });

  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(() => {
    if (typeof window !== "undefined") {
      const a = sessionStorage.getItem("lina_quiz_player_avatar") as AvatarId;
      if (a) return a;
    }
    return "girl_long";
  });

  const [playerId] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("lina_quiz_player_id");
      if (stored) return stored;
      const gen = "p_" + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem("lina_quiz_player_id", gen);
      return gen;
    }
    return "p_user";
  });

  const [hasJoined, setHasJoined] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("lina_quiz_joined") === "true";
    }
    return false;
  });

  const [session, setSession] = useState<SessionData | null>(null);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [soundActive, setSoundActive] = useState(isSoundOn());
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    return onNetworkStatusChange((status) => {
      setOnline(status);
      if (status && pinInput && playerId) {
        reconnectPlayer(pinInput, playerId);
      }
    });
  }, [pinInput, playerId]);

  // Inscription / abonnement à la session
  useEffect(() => {
    if (!pinInput || pinInput.length < 4 || !hasJoined) return;

    const unsub = subscribeToSession(pinInput, (data) => {
      if (data) setSession(data);
    });

    return () => unsub();
  }, [pinInput, hasJoined]);

  // Réinitialisation du choix sélectionné lors du changement de question
  useEffect(() => {
    setSelectedOption(null);
  }, [session?.currentQuestionIndex]);

  const toggleSound = () => {
    const next = !soundActive;
    setSound(next);
    setSoundActive(next);
  };

  const currentQIndex = session?.currentQuestionIndex ?? 0;
  const currentQ: QuizQuestion | undefined = QUIZ_QUESTIONS[currentQIndex];

  // Joueur courant dans la session
  const currentPlayer: PlayerData | undefined = useMemo(() => {
    if (!session?.players || !playerId) return undefined;
    return session.players[playerId];
  }, [session?.players, playerId]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput || !name.trim()) return;

    play("click");
    sessionStorage.setItem("lina_quiz_player_name", name.trim());
    sessionStorage.setItem("lina_quiz_player_avatar", selectedAvatar);
    sessionStorage.setItem("lina_quiz_joined", "true");
    sessionStorage.setItem("lina_quiz_pin", pinInput);

    const pData: PlayerData = {
      id: playerId,
      name: name.trim(),
      avatar: selectedAvatar,
      score: 0,
      connected: true,
      answers: {},
    };

    await registerPlayer(pinInput, pData);
    setHasJoined(true);
  };

  const handleSelectAnswer = async (opt: "A" | "B" | "C" | "D") => {
    if (selectedOption || !currentQ || !session) return;
    setSelectedOption(opt);
    play("click");

    const timeSpent = Date.now() - (session.questionStartedAt || Date.now());
    const isCorrect = opt === currentQ.correctLetter;

    // Calcul des points individuels (+100 pour bonne réponse + bonus rapidité jusqu'à +50)
    let points = 0;
    if (isCorrect) {
      const speedBonus = Math.max(0, Math.floor(50 - (timeSpent / 1000) * 2));
      points = 100 + speedBonus;
      setTimeout(() => play("ding"), 200);
    } else {
      setTimeout(() => play("buzz"), 200);
    }

    await submitPlayerAnswer(pinInput, playerId, currentQ.id, opt, timeSpent, points);
  };

  // 1. ÉCRAN D'EMBARQUEMENT / REJOINDRE
  if (!hasJoined) {
    return (
      <div className="min-h-screen w-full bg-paper font-sans text-deep flex flex-col justify-between p-4 sm:p-6 md:p-8">
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-deep">LE BUS QUIZZ</span>
          </div>
          <span className="text-xs font-bold text-deep/60 bg-silver px-3 py-1 rounded-full">
            Lina Cosmétiques
          </span>
        </header>

        <main className="w-full max-w-md mx-auto my-auto flex flex-col gap-6 py-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-black text-deep">
              Monter dans le Bus
            </h1>
            <p className="text-sm font-semibold text-deep/60 mt-1">
              Renseignez vos accès pour participer au quiz individuel.
            </p>
          </div>

          <form onSubmit={handleJoin} className="flex flex-col gap-5">
            {/* Champ PIN */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-deep/70">
                Code PIN du Bus
              </label>
              <input
                type="text"
                pattern="[0-9]*"
                maxLength={4}
                required
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Ex: 4829"
                className="h-14 rounded-2xl border-2 border-deep/20 bg-white px-4 text-center text-2xl font-black tracking-widest text-deep shadow-sm focus:border-deep focus:outline-none"
              />
            </div>

            {/* Champ Pseudo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-deep/70">
                Votre prénom ou pseudo
              </label>
              <input
                type="text"
                maxLength={16}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Amira"
                className="h-14 rounded-2xl border-2 border-deep/20 bg-white px-4 text-lg font-bold text-deep shadow-sm focus:border-deep focus:outline-none"
              />
            </div>

            {/* Choix d'avatar SVG parmi les 4 */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-deep/70">
                Choisissez votre silhouette
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_LIST.map((av) => {
                  const isSel = selectedAvatar === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(av.id);
                        play("click");
                      }}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl p-2.5 transition border-2 cursor-pointer ${
                        isSel
                          ? "border-deep bg-silver shadow-md"
                          : "border-deep/15 bg-white/70 hover:bg-white"
                      }`}
                    >
                      <QuizAvatar id={av.id} size={50} />
                      <span className="text-[10px] font-bold text-deep/80 text-center leading-tight">
                        {av.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bouton de validation */}
            <button
              type="submit"
              className="mt-2 h-14 w-full rounded-2xl bg-deep text-lg font-black text-silver shadow-lg hover:bg-deep-dark transition cursor-pointer flex items-center justify-center gap-3"
            >
              Prendre sa place dans le bus <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </main>

        <footer className="py-2 text-center text-xs font-semibold text-deep/50">
          Quiz individuel · Aucune inscription requise
        </footer>
      </div>
    );
  }

  const gameState = session?.state ?? "lobby";

  // 2. ÉCRAN EN JEU (PLAYER CONNECTÉ)
  return (
    <div className="min-h-screen w-full bg-paper font-sans text-deep flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Barre supérieure permanente */}
      <header className="flex items-center justify-between border-b border-deep/15 pb-3">
        <div className="flex items-center gap-3">
          {currentPlayer && <QuizAvatar id={currentPlayer.avatar} size={42} />}
          <div>
            <div className="text-base font-black leading-none">{name}</div>
            <div className="text-xs font-bold text-deep/60 mt-0.5">
              Score : <span className="text-deep font-black">{currentPlayer?.score || 0} pts</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-deep/20 bg-silver/80 text-deep"
          >
            {soundActive ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <span className="text-xs font-mono font-bold bg-silver px-2.5 py-1 rounded-full border border-deep/20">
            PIN {pinInput}
          </span>
        </div>
      </header>

      {/* Bannière d'état réseau et reconnexion */}
      {!online && (
        <div className="w-full max-w-xl mx-auto my-2 rounded-2xl bg-deep text-silver p-3 text-xs font-bold flex items-center justify-center gap-3 border border-deep shadow-md animate-pulse">
          <WifiOff className="h-4 w-4 text-silver" />
          <span>Connexion réseau interrompue — Réponses conservées en cache local et synchronisées dès reconnexion.</span>
        </div>
      )}

      {/* Contenu principal selon l'état de la session */}
      <main className="w-full max-w-xl mx-auto my-auto flex-1 flex flex-col justify-center py-6">
        {/* LOBBY : Attente dans le bus */}
        {gameState === "lobby" && (
          <div className="flex flex-col items-center text-center gap-6 animate-fade-in">
            <div className="p-6 rounded-3xl bg-silver/60 border-2 border-deep/20 w-full flex flex-col items-center">
              <div className="w-24 h-24 flex items-center justify-center rounded-full bg-deep text-silver shadow-lg my-2">
                <Users className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-black mt-2">Vous êtes à bord du bus !</h2>
              <p className="text-sm font-semibold text-deep/70 mt-1 max-w-xs">
                Le professeur va bientôt lancer le départ. Tenez-vous prêt(e) pour la première étape.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-deep/60">
              <span className="h-2 w-2 rounded-full bg-cosmic animate-pulse" />
              En attente du signal de départ...
            </div>
          </div>
        )}

        {/* TRAJET : Le bus roule */}
        {gameState === "travel" && (
          <div className="flex flex-col items-center text-center gap-4 animate-fade-in">
            <div className="h-20 w-44 flex items-center justify-center">
              <svg viewBox="0 0 160 80" className="w-40 h-20 animate-bounce">
                <rect x="10" y="15" width="140" height="45" rx="8" className="fill-deep" />
                <rect x="10" y="38" width="140" height="6" className="fill-lavender" />
                <rect x="25" y="22" width="22" height="12" rx="2" className="fill-silver" />
                <rect x="55" y="22" width="22" height="12" rx="2" className="fill-silver" />
                <rect x="85" y="22" width="22" height="12" rx="2" className="fill-silver" />
                <rect x="115" y="22" width="25" height="12" rx="2" className="fill-silver" />
                <circle cx="40" cy="60" r="10" className="fill-deep stroke-silver" strokeWidth="3" />
                <circle cx="120" cy="60" r="10" className="fill-deep stroke-silver" strokeWidth="3" />
              </svg>
            </div>
            <h2 className="text-2xl font-black">Le Bus roule vers le prochain bâtiment…</h2>
            <p className="text-sm font-semibold text-deep/60">
              Regardez le vidéoprojecteur !
            </p>
          </div>
        )}

        {/* QUESTION : Répondre au tapotement tactile */}
        {gameState === "question" && currentQ && (
          <div className="flex flex-col gap-5 w-full">
            {/* Repère bâtiment */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BuildingIcon b={currentQ.building} />
                <span className="text-xs font-black uppercase tracking-wider text-deep">
                  {currentQ.buildingLabel}
                </span>
              </div>
              <span className="text-xs font-bold text-deep/60 bg-silver px-2.5 py-0.5 rounded-full border border-deep/20">
                {currentQ.questionInBuilding}
              </span>
            </div>

            {/* Question */}
            <h2 className="text-xl sm:text-2xl font-black leading-snug">
              {currentQ.question}
            </h2>

            {/* 4 choix A/B/C/D adaptés au pouce */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOption === opt.letter;
                return (
                  <button
                    key={opt.letter}
                    disabled={selectedOption !== null}
                    onClick={() => handleSelectAnswer(opt.letter)}
                    className={`flex items-center gap-4 rounded-2xl p-4 sm:p-5 text-left border-2 transition min-h-[64px] cursor-pointer ${
                      isSelected
                        ? "border-deep bg-deep text-silver shadow-lg"
                        : selectedOption !== null
                        ? "border-deep/15 bg-silver/30 text-deep/50 opacity-60"
                        : "border-deep/20 bg-silver/70 text-deep hover:border-deep active:scale-[0.98]"
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-black ${
                        isSelected ? "bg-silver text-deep" : "bg-deep text-silver"
                      }`}
                    >
                      {opt.letter}
                    </span>
                    <span className="text-base font-bold leading-tight">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Retour visuel dès le choix effectué */}
            {selectedOption && (
              <div className="mt-2 text-center rounded-2xl bg-silver/80 border border-deep/20 p-3 text-sm font-black text-deep flex items-center justify-center gap-2 animate-fade-in">
                <CheckCircle2 className="h-5 w-5 text-cosmic" />
                Réponse {selectedOption} enregistrée ! En attente de la correction…
              </div>
            )}
          </div>
        )}

        {/* CORRECTION : Retour individuel */}
        {gameState === "correction" && currentQ && (
          <div className="flex flex-col items-center text-center gap-5 animate-fade-in">
            {selectedOption === currentQ.correctLetter ? (
              /* BONNE RÉPONSE : strictement en Cosmic Blue #4a4e8f (JAMAIS DE VERT) */
              <div className="w-full rounded-3xl bg-cosmic text-silver p-6 border-2 border-cosmic shadow-xl flex flex-col items-center">
                <CheckCircle2 className="h-16 w-16 text-silver mb-2" />
                <h2 className="text-2xl sm:text-3xl font-black">Excellente réponse !</h2>
                <p className="text-sm font-bold opacity-90 mt-1">
                  Option {currentQ.correctLetter} · Points ajoutés à votre score
                </p>
              </div>
            ) : (
              /* MAUVAISE RÉPONSE : strictement en Deep Purple #2b1e3e (JAMAIS DE ROUGE) */
              <div className="w-full rounded-3xl bg-deep text-silver p-6 border-2 border-deep shadow-xl flex flex-col items-center">
                <XCircle className="h-16 w-16 text-silver mb-2" />
                <h2 className="text-2xl sm:text-3xl font-black">Ce n'était pas la bonne…</h2>
                <p className="text-sm font-bold opacity-90 mt-1">
                  La réponse était l'Option {currentQ.correctLetter}
                </p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-silver/60 border border-deep/20 text-sm font-bold text-deep/80 text-left w-full">
              <span className="text-xs uppercase tracking-wider block font-black text-cosmic mb-1">
                L'explication :
              </span>
              {currentQ.explanation}
            </div>
          </div>
        )}

        {/* CLASSEMENT INTERMÉDIAIRE : Voir son score */}
        {gameState === "intermediate_rank" && (
          <div className="flex flex-col items-center text-center gap-5 animate-fade-in">
            <div className="p-6 rounded-3xl bg-silver/60 border-2 border-deep/20 w-full flex flex-col items-center">
              <Trophy className="h-12 w-12 text-cosmic mb-2" />
              <h2 className="text-2xl font-black">Votre score actuel</h2>
              <div className="text-4xl font-black text-deep mt-2">
                {currentPlayer?.score || 0} <span className="text-lg text-deep/60">points</span>
              </div>
            </div>
            <p className="text-xs font-bold text-deep/60">
              Regardez le tableau pour voir le Top 5 du moment !
            </p>
          </div>
        )}

        {/* PODIUM FINAL : Résultat du joueur */}
        {gameState === "podium" && (
          <div className="flex flex-col items-center text-center gap-6 animate-fade-in">
            <div className="p-8 rounded-3xl bg-deep text-silver border-2 border-deep shadow-2xl w-full flex flex-col items-center">
              <Sparkles className="h-14 w-14 text-lavender mb-2" />
              <h2 className="text-3xl font-black">Terminus à la Gare !</h2>
              <p className="text-sm font-semibold opacity-80 mt-1">
                Le quiz est terminé. Félicitations pour votre participation !
              </p>
              <div className="mt-6 rounded-2xl bg-silver text-deep px-6 py-4 border border-deep/20">
                <span className="text-xs font-black uppercase tracking-wider block text-deep/60">
                  Votre score final
                </span>
                <span className="text-4xl font-black text-deep">
                  {currentPlayer?.score || 0} pts
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer sobre */}
      <footer className="border-t border-deep/10 pt-2 text-center text-xs font-semibold text-deep/50">
        Lina Cosmétiques · Bus Quizz
      </footer>
    </div>
  );
}
