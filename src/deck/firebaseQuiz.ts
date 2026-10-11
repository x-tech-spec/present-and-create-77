import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  off,
  connectDatabaseEmulator,
  type Database,
} from "firebase/database";
import type { AvatarId } from "./QuizAvatars";

export type SessionState = "lobby" | "travel" | "question" | "correction" | "intermediate_rank" | "podium";
export type PlayerAnswer = { choice: "A" | "B" | "C" | "D"; timeMs: number; points: number };
export type PlayerData = { id: string; name: string; avatar: AvatarId; score: number; connected: boolean; answers?: Record<string, PlayerAnswer> };
export type SessionData = {
  pin: string;
  hostToken?: string;
  createdAt: number;
  state: SessionState;
  currentBuilding: string;
  currentBuildingIndex?: number;
  previousBuildingIndex?: number;
  currentQuestionIndex: number;
  questionStartedAt?: number;
  showAnswers: boolean;
  players: Record<string, PlayerData>;
};
export type SyncStatus = "synced" | "pending" | "syncing" | "error";
export type PendingSubmission = { pin: string; playerId: string; questionId: number; choice: "A" | "B" | "C" | "D"; timeMs: number; points: number; timestamp: number };

const emulatorHost =
  (typeof process !== "undefined" && process.env?.["FIREBASE_DATABASE_EMULATOR_HOST"]) ||
  import.meta.env["VITE_FIREBASE_EMULATOR_HOST"] || "";
const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] || "AIzaSyD-LinaCosmeticsQuizDemoKey",
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] || "lina-cosmetiques-quiz.firebaseapp.com",
  databaseURL: import.meta.env["VITE_FIREBASE_DATABASE_URL"] || (emulatorHost ? `http://${emulatorHost}?ns=lina-cosmetiques-quiz` : "https://lina-cosmetiques-quiz-default-rtdb.firebaseio.com"),
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] || "lina-cosmetiques-quiz",
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] || "lina-cosmetiques-quiz.appspot.com",
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] || "100000000000",
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] || "1:100000000000:web:abcdef123456",
};
let app: FirebaseApp | null = null;
let db: Database | null = null;
let isFirebaseAvailable = false;
const isConfiguredEnv = Boolean(emulatorHost || (import.meta.env["VITE_FIREBASE_API_KEY"] && import.meta.env["VITE_FIREBASE_API_KEY"] !== "AIzaSyD-LinaCosmeticsQuizDemoKey" && import.meta.env["VITE_FIREBASE_DATABASE_URL"] && !import.meta.env["VITE_FIREBASE_DATABASE_URL"].includes("lina-cosmetiques-quiz-default-rtdb")));
const isTestEnv = typeof process !== "undefined" && (process.env?.["NODE_ENV"] === "test" || import.meta.env?.MODE === "test");
try {
  if (typeof window !== "undefined" && isConfiguredEnv && (!isTestEnv || emulatorHost)) {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
    db = getDatabase(app);
    if (emulatorHost) {
      const parts = emulatorHost.split(":");
      connectDatabaseEmulator(db, parts[0] || "127.0.0.1", Number(parts[1] || 9000));
    }
    isFirebaseAvailable = true;
  }
} catch { isFirebaseAvailable = false; }
export function setFirebaseAvailableForTesting(available: boolean, customDb?: Database) { isFirebaseAvailable = available; if (customDb) db = customDb; }
export function getDatabaseInstance(): Database | null { return db; }
const broadcast = typeof window !== "undefined" && "BroadcastChannel" in window ? new BroadcastChannel("lina_bus_quiz") : null;
const localSessions: Record<string, SessionData> = {};
const connectionListeners = new Set<(online: boolean) => void>();
let networkOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
if (typeof window !== "undefined") {
  window.addEventListener("online", () => { networkOnline = true; connectionListeners.forEach((cb) => cb(true)); void flushPendingOfflineQueue(); });
  window.addEventListener("offline", () => { networkOnline = false; connectionListeners.forEach((cb) => cb(false)); });
}
export function isOnline(): boolean { return typeof navigator !== "undefined" ? navigator.onLine : networkOnline; }
export function onNetworkStatusChange(callback: (online: boolean) => void): () => void { connectionListeners.add(callback); return () => connectionListeners.delete(callback); }

type SyncListener = (status: SyncStatus, pendingCount: number) => void;
const syncStatusListeners: Record<string, Set<SyncListener>> = {};
const getSyncKey = (pin: string, playerId: string) => `${pin}_${playerId}`;
const getQueueKey = (pin: string, playerId: string) => `lina_quiz_pending_${pin}_${playerId}`;
export function getPendingSubmissions(pin: string, playerId: string): PendingSubmission[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(getQueueKey(pin, playerId)) || "[]"); } catch { return []; }
}
export function getPendingCount(pin: string, playerId: string): number { return getPendingSubmissions(pin, playerId).length; }
export function getSyncStatus(pin: string, playerId: string): SyncStatus {
  const count = getPendingCount(pin, playerId);
  if (!count) return "synced";
  return isOnline() ? "syncing" : "pending";
}
function notifySyncListeners(pin: string, playerId: string, status?: SyncStatus) {
  const count = getPendingCount(pin, playerId);
  const actualStatus = status || (count ? (isOnline() ? "syncing" : "pending") : "synced");
  syncStatusListeners[getSyncKey(pin, playerId)]?.forEach((cb) => cb(actualStatus, count));
}
export function onSyncStatusChange(pin: string, playerId: string, callback: SyncListener): () => void {
  const key = getSyncKey(pin, playerId);
  syncStatusListeners[key] ||= new Set();
  syncStatusListeners[key]!.add(callback);
  callback(getSyncStatus(pin, playerId), getPendingCount(pin, playerId));
  return () => syncStatusListeners[key]?.delete(callback);
}
export function queueOfflineSubmission(submission: PendingSubmission) {
  if (typeof window === "undefined") return;
  try {
    const list = getPendingSubmissions(submission.pin, submission.playerId);
    const index = list.findIndex((item) => item.questionId === submission.questionId);
    if (index >= 0) list[index] = submission; else list.push(submission);
    localStorage.setItem(getQueueKey(submission.pin, submission.playerId), JSON.stringify(list));
    notifySyncListeners(submission.pin, submission.playerId, "pending");
  } catch { notifySyncListeners(submission.pin, submission.playerId, "error"); }
}
let isFlushing = false;
export async function flushPendingOfflineQueue(targetPin?: string, targetPlayerId?: string): Promise<number> {
  if (typeof window === "undefined" || !isOnline() || isFlushing) return 0;
  isFlushing = true;
  let flushed = 0;
  try {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith("lina_quiz_pending_"));
    for (const key of keys) {
      const suffix = key.slice("lina_quiz_pending_".length);
      const [pin, ...playerParts] = suffix.split("_");
      const playerId = playerParts.join("_");
      if (!pin || !playerId || (targetPin && pin !== targetPin) || (targetPlayerId && playerId !== targetPlayerId)) continue;
      const queue = getPendingSubmissions(pin, playerId);
      if (!queue.length) continue;
      notifySyncListeners(pin, playerId, "syncing");
      const remaining: PendingSubmission[] = [];
      for (const item of queue) {
        try {
          if (isFirebaseAvailable && db) {
            const answerRef = ref(db, `sessions/${item.pin}/players/${item.playerId}/answers/q${item.questionId}`);
            const prior = await get(answerRef);
            if (!prior.exists()) await set(answerRef, { choice: item.choice, timeMs: item.timeMs, points: item.points });
            // No score increment on retry; authoritative client session score is preserved.
            const session = getLocalSession(item.pin);
            if (session?.players?.[item.playerId]) {
              await set(ref(db, `sessions/${item.pin}/players/${item.playerId}/score`), session.players[item.playerId]!.score);
            }
          }
          flushed++;
        } catch { remaining.push(item); }
      }
      if (remaining.length) {
        localStorage.setItem(key, JSON.stringify(remaining));
        notifySyncListeners(pin, playerId, "pending");
      } else {
        localStorage.removeItem(key);
        notifySyncListeners(pin, playerId, "synced");
      }
    }
  } finally { isFlushing = false; }
  return flushed;
}
function notifyLocal(pin: string, data: SessionData) {
  localSessions[pin] = data;
  try { if (typeof localStorage !== "undefined") localStorage.setItem(`lina_quiz_session_${pin}`, JSON.stringify(data)); } catch {}
  broadcast?.postMessage({ type: "session_update", pin, data });
}
export function getLocalSession(pin: string): SessionData | null {
  try { const raw = typeof localStorage !== "undefined" ? localStorage.getItem(`lina_quiz_session_${pin}`) : null; if (raw) { const parsed = JSON.parse(raw) as SessionData; localSessions[pin] = parsed; return parsed; } } catch {}
  return localSessions[pin] || null;
}
export function createSession(pin: string, customHostToken?: string): SessionData {
  let hostToken = customHostToken;
  if (!hostToken && typeof sessionStorage !== "undefined") hostToken = sessionStorage.getItem(`lina_quiz_host_token_${pin}`) || undefined;
  if (!hostToken) hostToken = "ht_" + Math.random().toString(36).substring(2, 12);
  if (typeof sessionStorage !== "undefined") sessionStorage.setItem(`lina_quiz_host_token_${pin}`, hostToken);
  const initial: SessionData = { pin, hostToken, createdAt: Date.now(), state: "lobby", currentBuilding: "mairie", currentBuildingIndex: 0, previousBuildingIndex: 0, currentQuestionIndex: 0, questionStartedAt: Date.now(), showAnswers: false, players: {} };
  notifyLocal(pin, initial);
  if (isFirebaseAvailable && db && isOnline()) set(ref(db, `sessions/${pin}`), initial).catch(() => {});
  return initial;
}
export function subscribeToSession(pin: string, onUpdate: (data: SessionData | null) => void): () => void {
  let unsubFirebase = () => {};
  if (isFirebaseAvailable && db) {
    try {
      const sessionRef = ref(db, `sessions/${pin}`);
      const handler = onValue(sessionRef, (snapshot) => { if (snapshot.exists()) { const val = snapshot.val() as SessionData; if (!val.players) val.players = {}; notifyLocal(pin, val); onUpdate(val); } else onUpdate(getLocalSession(pin)); }, () => onUpdate(getLocalSession(pin)));
      unsubFirebase = () => off(sessionRef, "value", handler);
    } catch { onUpdate(getLocalSession(pin)); }
  } else onUpdate(getLocalSession(pin));
  const broadcastListener = (ev: MessageEvent) => { if (ev.data?.pin === pin && ev.data?.data) { localSessions[pin] = ev.data.data; onUpdate(ev.data.data); } };
  broadcast?.addEventListener("message", broadcastListener);
  const storageListener = (e: StorageEvent) => { if (e.key === `lina_quiz_session_${pin}` && e.newValue) { try { const parsed = JSON.parse(e.newValue) as SessionData; localSessions[pin] = parsed; onUpdate(parsed); } catch {} } };
  if (typeof window !== "undefined") window.addEventListener("storage", storageListener);
  return () => { unsubFirebase(); broadcast?.removeEventListener("message", broadcastListener); if (typeof window !== "undefined") window.removeEventListener("storage", storageListener); };
}
export async function updateSessionState(pin: string, patch: Partial<SessionData>): Promise<void> {
  const current = getLocalSession(pin) || { pin, createdAt: Date.now(), state: "lobby" as const, currentBuilding: "mairie" as const, currentBuildingIndex: 0, previousBuildingIndex: 0, currentQuestionIndex: 0, questionStartedAt: Date.now(), showAnswers: false, players: {} };
  let hostToken = patch.hostToken || current.hostToken;
  if (!hostToken && typeof sessionStorage !== "undefined") hostToken = sessionStorage.getItem(`lina_quiz_host_token_${pin}`) || undefined;
  const updated: SessionData = { ...current, ...patch, ...(hostToken ? { hostToken } : {}), players: patch.players !== undefined ? patch.players : current.players || {} } as SessionData;
  notifyLocal(pin, updated);
  if (isFirebaseAvailable && db && isOnline()) {
    const fbPatch: Record<string, any> = { ...patch };
    if (hostToken) fbPatch["hostToken"] = hostToken;
    try { await update(ref(db, `sessions/${pin}`), fbPatch); } catch {}
  }
}
export async function registerPlayer(pin: string, player: PlayerData): Promise<boolean> {
  let session = getLocalSession(pin);
  if (isFirebaseAvailable && db && isOnline()) { try { const snap = await get(ref(db, `sessions/${pin}`)); if (snap.exists()) session = snap.val() as SessionData; } catch {} }
  if (!session) session = createSession(pin);
  session.players ||= {};
  const existing = session.players[player.id];
  session.players[player.id] = existing ? { ...existing, name: player.name, avatar: player.avatar, connected: true } : player;
  notifyLocal(pin, session);
  if (isFirebaseAvailable && db && isOnline()) { try { await set(ref(db, `sessions/${pin}/players/${player.id}`), session.players[player.id]); return true; } catch { return false; } }
  return true;
}
export async function submitPlayerAnswer(pin: string, playerId: string, questionId: number, choice: "A" | "B" | "C" | "D", timeMs: number, points: number): Promise<void> {
  const session = getLocalSession(pin);
  const answerKey = `q${questionId}`;
  if (session?.players?.[playerId]) {
    const player = session.players[playerId]!;
    player.answers ||= {};
    if (!player.answers[answerKey]) player.score = (player.score || 0) + points;
    player.answers[answerKey] = { choice, timeMs, points };
    notifyLocal(pin, session);
  }
  const submission: PendingSubmission = { pin, playerId, questionId, choice, timeMs, points, timestamp: Date.now() };
  if (!isOnline() || !isFirebaseAvailable || !db) { queueOfflineSubmission(submission); return; }
  try {
    notifySyncListeners(pin, playerId, "syncing");
    const answerRef = ref(db, `sessions/${pin}/players/${playerId}/answers/${answerKey}`);
    const oldAnswer = await get(answerRef);
    if (!oldAnswer.exists()) await set(answerRef, { choice, timeMs, points });
    if (session?.players?.[playerId]) await set(ref(db, `sessions/${pin}/players/${playerId}/score`), session.players[playerId]!.score);
    notifySyncListeners(pin, playerId, "synced");
  } catch { queueOfflineSubmission(submission); }
}
export async function reconnectPlayer(pin: string, playerId: string): Promise<PlayerData | null> {
  await flushPendingOfflineQueue(pin, playerId);
  if (isFirebaseAvailable && db && isOnline()) {
    try { const playerRef = ref(db, `sessions/${pin}/players/${playerId}`); const snap = await get(playerRef); if (snap.exists()) { const player = snap.val() as PlayerData; await update(playerRef, { connected: true }); return { ...player, connected: true }; } } catch {}
  }
  const session = getLocalSession(pin);
  if (session?.players?.[playerId]) { session.players[playerId]!.connected = true; notifyLocal(pin, session); return session.players[playerId]!; }
  return null;
}
