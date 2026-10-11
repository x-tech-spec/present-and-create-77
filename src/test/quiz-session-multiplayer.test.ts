import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createSession,
  subscribeToSession,
  registerPlayer,
  submitPlayerAnswer,
  updateSessionState,
  getLocalSession,
  reconnectPlayer,
  type PlayerData,
  type SessionData,
} from "../deck/firebaseQuiz";
import { QUIZ_QUESTIONS } from "../deck/quizData";

describe("Le Bus Quizz — Session multi-appareils, cycle complet et reconnexion", () => {
  const pin = "7721";

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("garantit un schéma 100% individuel sans aucune équipe", () => {
    const session = createSession(pin);
    expect(session.pin).toBe(pin);
    expect(session.state).toBe("lobby");
    expect((session as any).teams).toBeUndefined();

    const player: PlayerData = {
      id: "p_karim",
      name: "Karim",
      avatar: "boy_normal",
      score: 0,
      connected: true,
      answers: {},
    };

    expect((player as any).team).toBeUndefined();
    expect((player as any).teamColor).toBeUndefined();
  });

  it("gère l'embarquement simultané de plusieurs joueurs sur différents appareils", async () => {
    createSession(pin);

    // Simulation de 3 appareils distincts
    const players: PlayerData[] = [
      { id: "device_1", name: "Amira", avatar: "girl_long", score: 0, connected: true, answers: {} },
      { id: "device_2", name: "Thomas", avatar: "boy_glasses", score: 0, connected: true, answers: {} },
      { id: "device_3", name: "Sarah", avatar: "girl_tied", score: 0, connected: true, answers: {} },
    ];

    for (const p of players) {
      await registerPlayer(pin, p);
    }

    const current = getLocalSession(pin);
    expect(current).not.toBeNull();
    expect(Object.keys(current!.players)).toHaveLength(3);
    expect(current!.players["device_1"]?.name).toBe("Amira");
    expect(current!.players["device_2"]?.name).toBe("Thomas");
    expect(current!.players["device_3"]?.name).toBe("Sarah");
  });

  it("exécute le cycle complet du quiz du lobby jusqu'au podium avec calcul des scores", async () => {
    createSession(pin);

    // Inscription des participants
    const p1: PlayerData = { id: "p1", name: "Léa", avatar: "girl_long", score: 0, connected: true, answers: {} };
    const p2: PlayerData = { id: "p2", name: "Youssef", avatar: "boy_glasses", score: 0, connected: true, answers: {} };
    await registerPlayer(pin, p1);
    await registerPlayer(pin, p2);

    // Host passe de lobby à travel puis question 1
    await updateSessionState(pin, { state: "travel" });
    expect(getLocalSession(pin)?.state).toBe("travel");

    await updateSessionState(pin, {
      state: "question",
      currentBuilding: QUIZ_QUESTIONS[0]!.building,
      currentQuestionIndex: 0,
      questionStartedAt: Date.now() - 2000,
      showAnswers: false,
    });

    // Joueur 1 répond correctement avec rapidité (100 pts + 46 bonus)
    const q1Correct = QUIZ_QUESTIONS[0]!.correctLetter;
    await submitPlayerAnswer(pin, "p1", QUIZ_QUESTIONS[0]!.id, q1Correct, 2000, 146);

    // Joueur 2 répond faux (0 pt)
    const wrongChoice = q1Correct === "A" ? "B" : "A";
    await submitPlayerAnswer(pin, "p2", QUIZ_QUESTIONS[0]!.id, wrongChoice, 4000, 0);

    let session = getLocalSession(pin)!;
    expect(session.players["p1"]?.score).toBe(146);
    expect(session.players["p2"]?.score).toBe(0);

    // Host passe en correction puis classement intermédiaire
    await updateSessionState(pin, { state: "correction", showAnswers: true });
    expect(getLocalSession(pin)?.state).toBe("correction");

    await updateSessionState(pin, { state: "intermediate_rank" });
    expect(getLocalSession(pin)?.state).toBe("intermediate_rank");

    // Enchaînement jusqu'au podium final
    await updateSessionState(pin, { state: "travel" });
    await updateSessionState(pin, { state: "podium", currentBuilding: "gare" });

    const finalSession = getLocalSession(pin)!;
    expect(finalSession.state).toBe("podium");
    expect(finalSession.currentBuilding).toBe("gare");
    expect(finalSession.players["p1"]?.score).toBe(146);
  });

  it("préserve les données et gère la reconnexion après coupure réseau", async () => {
    createSession(pin);
    const p: PlayerData = { id: "p_mobile", name: "Inès", avatar: "girl_tied", score: 50, connected: true, answers: {} };
    await registerPlayer(pin, p);

    // Déconnexion simulée (perte réseau)
    const session = getLocalSession(pin)!;
    session.players["p_mobile"]!.connected = false;
    await updateSessionState(pin, { players: session.players });

    expect(getLocalSession(pin)?.players["p_mobile"]?.connected).toBe(false);

    // Reconnexion de l'appareil
    const reconnected = await reconnectPlayer(pin, "p_mobile");
    expect(reconnected).not.toBeNull();
    expect(reconnected?.connected).toBe(true);
    expect(reconnected?.score).toBe(50);
    expect(getLocalSession(pin)?.players["p_mobile"]?.connected).toBe(true);
  });
});
