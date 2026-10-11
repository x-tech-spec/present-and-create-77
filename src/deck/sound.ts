// Sons WebAudio intégrés (désactivés par défaut, 100% locaux sans requête réseau).
let enabled = false;
let ctx: AudioContext | null = null;

export const setSound = (v: boolean) => {
  enabled = v;
};
export const isSoundOn = () => enabled;

export function play(kind: "click" | "ding" | "buzz" | "fanfare" | "vroom") {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    ctx ??= new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;

    if (kind === "click") {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(660, t);
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.06);
    } else if (kind === "ding") {
      // Bonne réponse : double note brillante (Cosmic Blue)
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(880, t);
      o.frequency.setValueAtTime(1320, t + 0.12);
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.45);
    } else if (kind === "buzz") {
      // Mauvaise réponse : tonalité basse en dent de scie (Deep Purple)
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(140, t);
      o.frequency.setValueAtTime(110, t + 0.1);
      g.gain.setValueAtTime(0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.35);
    } else if (kind === "vroom") {
      // Vrombissement du bus au démarrage
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(65, t);
      o.frequency.exponentialRampToValueAtTime(130, t + 0.8);
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 1.2);
    } else if (kind === "fanfare") {
      // Fanfare du podium : accord ascendant triomphal
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const o = ctx!.createOscillator();
        const g = ctx!.createGain();
        const start = t + idx * 0.14;
        const dur = idx === 3 ? 0.8 : 0.25;
        o.type = "triangle";
        o.frequency.setValueAtTime(freq, start);
        g.gain.setValueAtTime(0.15, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + dur);
        o.connect(g).connect(ctx!.destination);
        o.start(start);
        o.stop(start + dur);
      });
    }
  } catch {
    /* Audio non disponible */
  }
}
