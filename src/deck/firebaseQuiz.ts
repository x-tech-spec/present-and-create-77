import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  off,
  type Database,
} from "firebase/database";
import type { AvatarId } from "./QuizAvatars";

export type SessionState = "lobby" | "travel" | "question" | "correction" | "intermediate_rank" | "podium";

export type PlayerData = {
  id: string;
  name: string;
  avatar: AvatarId;
  score: number;
  connected: boolean;
  answers?: Record<string, { choice: "A" | "B" | "C" | "D"; timeMs: number; points: number }>;
};

export type SessionData = {
  pin: string;
  createdAt: number;
  state: SessionState;
  currentBuilding: "mairie" | "marketing" | "rh" | "place" | "stade" | "gare";
  currentQuestionIndex: number;
  questionStartedAt: number;
  showAnswers: boolean;
  players: Record<string, PlayerData>;
};

// Configuration Firebase (fournie par variable d'environnement ou fallback)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD-LinaCosmeticsQuizDemoKey",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lina-cosmetiques-quiz.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://lina-cosmetiques-quiz-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lina-cosmetiques-quiz",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lina-cosmetiques-quiz.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "100000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:100000000000:web:abcdef123456",
};

let app: FirebaseApp | null = null;
let db: Database | null = null;
let isFirebaseAvailable = false;

try {
  if (typeof window !== "undefined") {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
    db = getDatabase(app);
    isFirebaseAvailable = true;
  }
} catch {
  isFirebaseAvailable = false;
}

// Canal local BroadcastChannel pour synchronisation immédiate inter-onglets ou offline
const broadcast = typeof window !== "undefined" && "BroadcastChannel" in window ? new BroadcastChannel("lina_bus_quiz") : null;

// Mémoire locale de session pour fonctionnement hors-ligne ou réseau dégradé
const localSessions: Record<string, SessionData> = {};

function notifyLocal(pin: string, data: SessionData) {
  localSessions[pin] = data;
  try {
    localStorage.setItem(`lina_quiz_session_${pin}`, JSON.stringify(data));
  } catch {}
  broadcast?.postMessage({ type: "session_update", pin, data });
}

export function createSession(pin: string): SessionData {
  const initial: SessionData = {
    pin,
    createdAt: Date.now(),
    state: "lobby",
    currentBuilding: "mairie",
    currentQuestionIndex: 0,
    questionStartedAt: Date.now(),
    showAnswers: false,
    players: {},
  };

  notifyLocal(pin, initial);

  if (isFirebaseAvailable && db) {
    try {
      const sessionRef = ref(db, `sessions/${pin}`);
      set(sessionRef, initial).catch(() => {});
    } catch {}
  }

  return initial;
}

export function subscribeToSession(pin: string, onUpdate: (data: SessionData | null) => void): () => void {
  let unsubFirebase = () => {};

  if (isFirebaseAvailable && db) {
    try {
      const sessionRef = ref(db, `sessions/${pin}`);
      const handler = onValue(
        sessionRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val() as SessionData;
            if (!val.players) val.players = {};
            notifyLocal(pin, val);
            onUpdate(val);
          } else {
            // Regarder en cache local
            const local = getLocalSession(pin);
            onUpdate(local);
          }
        },
        () => {
          // Erreur réseau : repli sur le cache local
          const local = getLocalSession(pin);
          onUpdate(local);
        }
      );
      unsubFirebase = () => off(sessionRef, "value", handler);
    } catch {
      const local = getLocalSession(pin);
      onUpdate(local);
    }
  } else {
    const local = getLocalSession(pin);
    onUpdate(local);
  }

  const broadcastListener = (ev: MessageEvent) => {
    if (ev.data?.pin === pin && ev.data?.data) {
      onUpdate(ev.data.data);
    }
  };
  broadcast?.addEventListener("message", broadcastListener);

  return () => {
    unsubFirebase();
    broadcast?.removeEventListener("message", broadcastListener);
  };
}

export function getLocalSession(pin: string): SessionData | null {
  if (localSessions[pin]) return localSessions[pin]!;
  try {
    const raw = localStorage.getItem(`lina_quiz_session_${pin}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      localSessions[pin] = parsed;
      return parsed;
    }
  } catch {}
  return null;
}

export async function updateSessionState(pin: string, patch: Partial<SessionData>): Promise<void> {
  const current = getLocalSession(pin) || {
    pin,
    createdAt: Date.now(),
    state: "lobby" as const,
    currentBuilding: "mairie" as const,
    currentQuestionIndex: 0,
    questionStartedAt: Date.now(),
    showAnswers: false,
    players: {},
  };

  const updated: SessionData = { ...current, ...patch };
  notifyLocal(pin, updated);

  if (isFirebaseAvailable && db) {
    try {
      const sessionRef = ref(db, `sessions/${pin}`);
      await update(sessionRef, patch);
    } catch {}
  }
}

export async function registerPlayer(pin: string, player: PlayerData): Promise<boolean> {
  let session = getLocalSession(pin);

  if (isFirebaseAvailable && db) {
    try {
      const sessionRef = ref(db, `sessions/${pin}`);
      const snap = await get(sessionRef);
      if (snap.exists()) {
        session = snap.val() as SessionData;
      }
    } catch {}
  }

  if (!session) {
    // Si la session n'existe pas encore, on l'initialise
    session = createSession(pin);
  }

  session.players = session.players || {};
  session.players[player.id] = player;
  notifyLocal(pin, session);

  if (isFirebaseAvailable && db) {
    try {
      const playerRef = ref(db, `sessions/${pin}/players/${player.id}`);
      await set(playerRef, player);
    } catch {}
  }

  return true;
}

export async function submitPlayerAnswer(
  pin: string,
  playerId: string,
  questionId: number,
  choice: "A" | "B" | "C" | "D",
  timeMs: number,
  points: number
): Promise<void> {
  const session = getLocalSession(pin);
  if (session?.players?.[playerId]) {
    const player = session.players[playerId]!;
    player.answers = player.answers || {};
    player.answers[`q${questionId}`] = { choice, timeMs, points };
    player.score = (player.score || 0) + points;
    notifyLocal(pin, session);
  }

  if (isFirebaseAvailable && db) {
    try {
      const answerRef = ref(db, `sessions/${pin}/players/${playerId}/answers/q${questionId}`);
      await set(answerRef, { choice, timeMs, points });
      const scoreRef = ref(db, `sessions/${pin}/players/${playerId}/score`);
      const newScore = (session?.players?.[playerId]?.score || 0);
      await set(scoreRef, newScore);
    } catch {}
  }
}
