import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import {
  createSession,
  registerPlayer,
  reconnectPlayer,
  queueOfflineSubmission,
  getPendingSubmissions,
  getPendingCount,
  getSyncStatus,
  flushPendingOfflineQueue,
  type PlayerData,
} from "../deck/firebaseQuiz";

const rules = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../../database.rules.json"), "utf8")
).rules;

function canWriteSession(pin: string, existing: any, nextVal: any) {
  if (!existing) return nextVal?.pin === pin;
  if (existing?.hostToken) return nextVal?.hostToken === existing.hostToken;
  return nextVal?.pin === pin;
}

function canWritePlayer(pin: string, playerId: string, existing: any, nextVal: any, actorPlayerId?: string) {
  if (actorPlayerId && actorPlayerId !== playerId) return false;
  if (nextVal?.id !== playerId) return false;
  if (!nextVal?.name || nextVal.name.length > 30) return false;
  if (!["girl_long", "girl_tied", "boy_glasses", "boy_normal"].includes(nextVal.avatar)) return false;
  if (typeof nextVal.score !== "number" || nextVal.score < 0) return false;
  return true;
}

function canWriteAnswer(playerId: string, existing: any, nextVal: any, actorPlayerId?: string) {
  if (actorPlayerId && actorPlayerId !== playerId) return false;
  if (!["A", "B", "C", "D"].includes(nextVal?.choice)) return false;
  if (typeof nextVal?.points !== "number" || nextVal.points < 0 || nextVal.points > 150) return false;
  return true;
}

describe("Règles RTDB et reprise hors ligne dédoublonnée", () => {
  const pin = "4931";

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("vérifie les règles de sécurité RTDB pour la session, le joueur et les réponses", () => {
    expect(canWriteSession("4931", null, { pin: "4931" })).toBe(true);
    expect(canWriteSession("4931", { hostToken: "ht_true" }, { hostToken: "ht_false" })).toBe(false);

    expect(canWritePlayer("4931", "p1", null, { id: "p1", name: "Lina", avatar: "girl_long", score: 0 }, "p1")).toBe(true);
    expect(canWritePlayer("4931", "p1", null, { id: "p1", name: "Lina", avatar: "alien", score: 0 }, "p1")).toBe(false);
    expect(canWritePlayer("4931", "p1", null, { id: "p1", name: "Lina", avatar: "girl_long", score: -10 }, "p1")).toBe(false);
    expect(canWritePlayer("4931", "p1", null, { id: "p1", name: "Lina", avatar: "girl_long", score: 0 }, "p_other")).toBe(false);

    expect(canWriteAnswer("p1", null, { choice: "A", points: 120 }, "p1")).toBe(true);
    expect(canWriteAnswer("p1", null, { choice: "E", points: 100 }, "p1")).toBe(false);
    expect(canWriteAnswer("p1", null, { choice: "A", points: 200 }, "p1")).toBe(false);
    expect(canWriteAnswer("p1", null, { choice: "A", points: 100 }, "p_other")).toBe(false);
  });

  it("dédoublonne strictement la file d'attente hors ligne par question", () => {
    queueOfflineSubmission({ pin, playerId: "p1", questionId: 1, choice: "A", timeMs: 3000, points: 100, timestamp: 1 });
    queueOfflineSubmission({ pin, playerId: "p1", questionId: 1, choice: "B", timeMs: 2500, points: 0, timestamp: 2 });

    expect(getPendingCount(pin, "p1")).toBe(1);
    expect(getPendingSubmissions(pin, "p1")[0]?.choice).toBe("B");
    expect(getSyncStatus(pin, "p1")).toBe("syncing");
  });

  it("resynchronise les réponses en attente à la reconnexion sans perte", async () => {
    createSession(pin);
    await registerPlayer(pin, { id: "p1", name: "Karim", avatar: "boy_glasses", score: 50, connected: false });
    queueOfflineSubmission({ pin, playerId: "p1", questionId: 2, choice: "C", timeMs: 1200, points: 140, timestamp: 3 });

    expect(getPendingCount(pin, "p1")).toBe(1);
    const reconnected = await reconnectPlayer(pin, "p1");
    expect(reconnected?.connected).toBe(true);
    await flushPendingOfflineQueue(pin, "p1");
    expect(getPendingCount(pin, "p1")).toBe(0);
  });
});
