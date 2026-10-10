// Sons optionnels (désactivés par défaut) — générés en WebAudio, aucun fichier externe.
let enabled = false;
let ctx: AudioContext | null = null;

export const setSound = (v: boolean) => {
  enabled = v;
};
export const isSoundOn = () => enabled;

export function play(kind: "click" | "ding" | "buzz") {
  if (!enabled || typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const t = ctx.currentTime;
    const cfg = { click: [660, 0.06, "triangle"], ding: [988, 0.35, "sine"], buzz: [140, 0.3, "sawtooth"] } as const;
    const [f, d, type] = cfg[kind];
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (kind === "ding") o.frequency.setValueAtTime(1318, t + 0.12);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + d);
  } catch {
    /* audio indisponible */
  }
}
