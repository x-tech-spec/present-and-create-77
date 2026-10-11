import { useEffect, useRef, useState } from "react";

// Vue Carte : ville isométrique en SVG pur. Camion-roadmap + caméra qui suit.
type P = { x: number; y: number };
const ROUTE: P[] = [
  { x: 120, y: 800 },
  { x: 800, y: 460 },
  { x: 1400, y: 760 },
  { x: 1860, y: 530 },
];
// Arrêts (sur la route) : 0 Introduction · 1 Marketing · 2 RH · 3 Quiz · 4 Conclusion
const STOPS: P[] = [
  { x: 300, y: 710 },
  { x: 650, y: 535 },
  { x: 950, y: 535 },
  { x: 1300, y: 710 },
  { x: 1700, y: 610 },
];

const segLen = (a: P, b: P) => Math.hypot(b.x - a.x, b.y - a.y);
const CUM = ROUTE.reduce<number[]>((acc, p, i) => (i === 0 ? [0] : [...acc, acc[i - 1]! + segLen(ROUTE[i - 1]!, p)]), []);
function lengthOf(p: P) {
  let best = 0, bestD = Infinity;
  for (let i = 1; i < ROUTE.length; i++) {
    const a = ROUTE[i - 1]!, b = ROUTE[i]!;
    const L = segLen(a, b);
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (L * L)));
    const q = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
    const d = segLen(p, q);
    if (d < bestD) { bestD = d; best = CUM[i - 1]! + t * L; }
  }
  return best;
}
const STOP_L = STOPS.map(lengthOf);
/** Position sur la route : -1 = début de la rue. */
const stopL = (i: number) => (i < 0 ? 0 : STOP_L[i]!);
function pointAt(l: number): P & { dx: number } {
  for (let i = 1; i < ROUTE.length; i++) {
    if (l <= CUM[i]! || i === ROUTE.length - 1) {
      const a = ROUTE[i - 1]!, b = ROUTE[i]!;
      const t = Math.max(0, Math.min(1, (l - CUM[i - 1]!) / (CUM[i]! - CUM[i - 1]!)));
      return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y), dx: b.x - a.x };
    }
  }
  return { ...ROUTE[0]!, dx: 1 };
}

const BUILDINGS = [
  { id: 0, label: "Introduction", c: { x: 251, y: 612 }, r: 100, h: 150, color: "fill-silver", kind: "mairie" },
  { id: 1, label: "Marketing", c: { x: 601, y: 437 }, r: 110, h: 250, color: "fill-lavender", kind: "tower" },
  { id: 2, label: "Ressources Humaines", c: { x: 999, y: 437 }, r: 110, h: 250, color: "fill-cosmic", kind: "tower" },
  { id: 3, label: "Quiz", c: { x: 1349, y: 612 }, r: 120, h: 60, color: "fill-silver", kind: "stade" },
  { id: 4, label: "Conclusion", c: { x: 1651, y: 512 }, r: 120, h: 90, color: "fill-silver", kind: "gare" },
] as const;

const pts = (a: [number, number][]) => a.map((p) => p.join(",")).join(" ");

function IsoBox({ c, r, h, color, windows = 0 }: { c: P; r: number; h: number; color: string; windows?: number }) {
  const { x, y } = c;
  const L: [number, number][] = [[x - r, y], [x, y + r / 2], [x, y + r / 2 - h], [x - r, y - h]];
  const R: [number, number][] = [[x, y + r / 2], [x + r, y], [x + r, y - h], [x, y + r / 2 - h]];
  const T: [number, number][] = [[x, y - r / 2 - h], [x + r, y - h], [x, y + r / 2 - h], [x - r, y - h]];
  const win: [number, number][][] = [];
  const rows = Math.max(0, Math.floor((h - 40) / 46));
  for (let row = 0; row < Math.min(rows, windows); row++) {
    for (const u of [0.15, 0.45, 0.75]) {
      const v1 = 30 + row * 46, v2 = v1 + 26;
      const lp = (uu: number, v: number): [number, number] => [x - r + uu * r, y + (uu * r) / 2 - v];
      const rp = (uu: number, v: number): [number, number] => [x + uu * r, y + r / 2 - (uu * r) / 2 - v];
      win.push([lp(u, v1), lp(u + 0.16, v1), lp(u + 0.16, v2), lp(u, v2)]);
      win.push([rp(u, v1), rp(u + 0.16, v1), rp(u + 0.16, v2), rp(u, v2)]);
    }
  }
  return (
    <g className="stroke-deep/40" strokeWidth={2} strokeLinejoin="round">
      <polygon points={pts(L)} className={color} />
      <polygon points={pts(R)} className={color} />
      <polygon points={pts(R)} className="fill-deep/25" />
      <polygon points={pts(T)} className={color} />
      <polygon points={pts(T)} className="fill-silver/45" />
      {win.map((w, i) => <polygon key={i} points={pts(w)} className="fill-paper/80 stroke-none" />)}
    </g>
  );
}

function Building({ b, state, onPick }: { b: (typeof BUILDINGS)[number]; state: "active" | "dim" | "normal"; onPick?: ((i: number) => void) | undefined }) {
  const { c, r, h } = b;
  return (
    <g
      onClick={onPick ? (e) => { e.stopPropagation(); onPick(b.id); } : undefined}
      style={{ opacity: state === "dim" ? 0.42 : 1, transition: "opacity .6s, filter .6s", cursor: onPick ? "pointer" : "default", filter: state === "active" ? "drop-shadow(0 0 28px var(--sec))" : "none" }}
      className={b.id === 1 ? "accent-mk" : b.id === 2 ? "accent-rh" : "accent-neutral"}
    >
      <ellipse cx={c.x} cy={c.y + r / 2 + 6} rx={r * 1.05} ry={r * 0.32} className="fill-deep/12" />
      {b.kind === "tower" && <IsoBox c={c} r={r} h={h} color={b.color} windows={4} />}
      {b.kind === "mairie" && (
        <>
          <IsoBox c={c} r={r} h={h} color={b.color} windows={2} />
          <polygon points={pts([[c.x - r, c.y - h], [c.x, c.y - h - 90], [c.x + r, c.y - h], [c.x, c.y - h + r / 2]])} className="fill-deep/70" />
          {/* graphique qui grandit sur la façade */}
          <g transform={`translate(${c.x - 150}, ${c.y - h - 150})`}>
            <rect width="110" height="80" rx="8" className="fill-silver stroke-deep/40" strokeWidth={2} />
            {[0, 1, 2, 3].map((i) => <rect key={i} x={12 + i * 24} y={20 + (3 - i) * 10} width="16" height={50 - (3 - i) * 10} className="anim-grow fill-cosmic" style={{ animationDelay: `${i * 0.4}s` }} />)}
          </g>
        </>
      )}
      {(b.kind as string) === "place" && (
        <>
          <IsoBox c={c} r={r} h={h} color="fill-silver" />
          <circle cx={c.x} cy={c.y - h} r={22} className="fill-lavender stroke-deep/40" />
          <circle cx={c.x} cy={c.y - h} r={11} className="fill-cosmic" />
          {/* pont Marketing ↔ RH */}
          <path d={`M${c.x - 160} ${c.y + 30} Q${c.x} ${c.y - 60} ${c.x + 160} ${c.y + 30}`} className="fill-none stroke-lavender" strokeWidth={10} />
          <path d={`M${c.x - 160} ${c.y + 44} Q${c.x} ${c.y - 46} ${c.x + 160} ${c.y + 44}`} className="fill-none stroke-cosmic" strokeWidth={10} />
        </>
      )}
      {b.kind === "stade" && (
        <>
          <IsoBox c={c} r={r} h={h} color="fill-silver" />
          <ellipse cx={c.x} cy={c.y - h} rx={r * 0.6} ry={r * 0.28} className="fill-lavender-soft stroke-deep/40" />
        </>
      )}
      {b.kind === "gare" && (
        <>
          <IsoBox c={c} r={r} h={h} color="fill-silver" windows={1} />
          <polygon points={pts([[c.x - r, c.y - h], [c.x, c.y - h - r / 2 - 40], [c.x + r, c.y - h], [c.x, c.y - h + r / 2]])} className="fill-deep/70" />
        </>
      )}
      <g transform={`translate(${c.x}, ${c.y - h - (b.kind === "mairie" || b.kind === "gare" ? 130 : 70)})`}>
        <rect x={-b.label.length * 7.5 - 18} y={-26} width={b.label.length * 15 + 36} height={44} rx={22} className={state === "active" ? "fill-sec" : "fill-deep"} />
        <text textAnchor="middle" y={4} className="fill-silver" style={{ font: "700 24px Inter, sans-serif" }}>{b.label}</text>
      </g>
    </g>
  );
}

function Truck({ p, flip }: { p: P; flip: boolean }) {
  return (
    <g transform={`translate(${p.x}, ${p.y - 14}) scale(${flip ? -1 : 1}, 1)`}>
      <ellipse cx="0" cy="18" rx="46" ry="9" className="fill-deep/25" />
      <rect x="-44" y="-36" width="60" height="44" rx="6" className="fill-deep" />
      <rect x="-38" y="-30" width="48" height="10" rx="3" className="fill-lavender" />
      <path d="M16 -24 L36 -24 L46 -6 L46 8 L16 8 Z" className="fill-deep" />
      <path d="M22 -19 L34 -19 L40 -8 L22 -8 Z" className="fill-silver" />
      <circle cx="-28" cy="10" r="9" className="fill-deep stroke-silver" strokeWidth={3} />
      <circle cx="30" cy="10" r="9" className="fill-deep stroke-silver" strokeWidth={3} />
    </g>
  );
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export function CityMap({
  active,
  mode,
  from,
  onArrive,
  onPick,
}: {
  active: number;
  mode: "static" | "browse" | "travel";
  from?: number | undefined;
  onArrive?: () => void;
  onPick?: (i: number) => void;
}) {
  const start = from ?? active;
  const [truckL, setTruckL] = useState(stopL(mode === "travel" || from !== undefined ? start : active));
  const [vb, setVb] = useState({ x: 0, y: 0, w: 1920, h: 1080 });
  const [fade, setFade] = useState(1);
  const [flip, setFlip] = useState(false);
  const arrived = useRef(false);

  useEffect(() => {
    if (mode !== "travel" || active < 0) return;
    arrived.current = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { onArrive?.(); return; }
    const L0 = stopL(start), L1 = stopL(active);
    const DRIVE = 1700, ENTER = 650;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = now - t0;
      if (t <= DRIVE) {
        const k = ease(t / DRIVE);
        const l = L0 + (L1 - L0) * k;
        const p = pointAt(l);
        setTruckL(l);
        setFlip((L1 < L0) !== (p.dx < 0));
        const z = 1 + 0.55 * Math.min(1, t / 400);
        const w = 1920 / z, h = 1080 / z;
        const follow = Math.min(1, t / 500);
        const cx = 960 + (p.x - 960) * follow, cy = 540 + (p.y - 80 - 540) * follow;
        setVb({ x: cx - w / 2, y: cy - h / 2, w, h });
      } else if (t <= DRIVE + ENTER) {
        const k = ease((t - DRIVE) / ENTER);
        const b = BUILDINGS[active]!.c;
        const p = pointAt(L1);
        const z = 1.55 + 2.6 * k;
        const w = 1920 / z, h = 1080 / z;
        const cx = p.x + (b.x - p.x) * k, cy = p.y - 80 + (b.y - 80 - (p.y - 80)) * k;
        setVb({ x: cx - w / 2, y: cy - h / 2, w, h });
        setFade(1 - k);
      } else {
        if (!arrived.current) { arrived.current = true; onArrive?.(); }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, active, start]);

  const ambient = mode !== "static";
  const road = pts(ROUTE.map((p) => [p.x, p.y]));
  const sidewalk = `M${ROUTE.map((p) => `${p.x} ${p.y + 34}`).join(" L")}`;
  const sidewalkBack = `M${[...ROUTE].reverse().map((p) => `${p.x} ${p.y - 34}`).join(" L")}`;
  const truck = pointAt(truckL);

  return (
    <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ opacity: fade }} className="block">
      {/* ciel blanc lavande */}
      <rect x="-2000" y="-2000" width="6000" height="5000" className="fill-paper" />
      {ambient &&
        [0, 1, 2, 3].map((i) => (
          <g key={i} className="anim-cloud" style={{ animationDuration: `${50 + i * 14}s`, animationDelay: `${-i * 13}s` }}>
            <g transform={`translate(0, ${80 + i * 60})`}>
              <ellipse cx="0" cy="0" rx="90" ry="32" className="fill-silver" />
              <ellipse cx="50" cy="-18" rx="60" ry="30" className="fill-silver" />
              <ellipse cx="-50" cy="-8" rx="50" ry="24" className="fill-silver" />
            </g>
          </g>
        ))}
      {/* sol */}
      <polygon points={pts([[960, 120], [2100, 690], [960, 1260], [-180, 690]])} className="fill-silver/60" />
      {/* route + roadmap */}
      <polyline points={road} className="fill-none stroke-silver" strokeWidth={70} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={road} className="fill-none stroke-deep/10" strokeWidth={76} strokeLinecap="round" strokeLinejoin="round" style={{ mixBlendMode: "multiply" }} />
      <polyline points={road} className="fill-none stroke-silver" strokeWidth={64} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={road} className="fill-none stroke-deep" strokeWidth={5} strokeDasharray="22 16" strokeLinecap="round" />
      {/* arbres décoratifs */}
      {([[450, 860], [700, 760], [1150, 820], [1550, 780], [1000, 960], [300, 930]] as [number, number][]).map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 4} y={y - 10} width="8" height="22" className="fill-deep/60" />
          <circle cx={x} cy={y - 22} r="22" className={i % 2 ? "fill-lavender" : "fill-cosmic/70"} />
        </g>
      ))}
      {/* bâtiments (ordre de profondeur) */}
      {[1, 2, 0, 4, 3].map((i) => (
        <Building key={i} b={BUILDINGS[i]!} state={active < 0 ? "normal" : i === active ? "active" : "dim"} onPick={mode === "browse" ? onPick : undefined} />
      ))}
      {/* employés qui marchent */}
      {ambient &&
        [0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <g>
              <circle r="7" cy="-26" className="fill-deep" />
              <rect x="-7" y="-19" width="14" height="22" rx="6" className={["fill-lavender", "fill-cosmic", "fill-deep/60"][i % 3]} />
              <animateMotion dur={`${26 + i * 5}s`} begin={`${-i * 6}s`} repeatCount="indefinite" path={i % 2 ? sidewalkBack : sidewalk} />
            </g>
          </g>
        ))}
      {ambient &&
        [1, 2, 0].map((bi, i) => {
          const b = BUILDINGS[bi]!.c;
          const s = STOPS[bi]!;
          return (
            <g key={`in${bi}`}>
              <circle r="6" cy="-22" className="fill-deep" />
              <rect x="-6" y="-16" width="12" height="18" rx="5" className={bi === 1 ? "fill-lavender" : bi === 2 ? "fill-cosmic" : "fill-deep/60"} />
              <animateMotion dur={`${7 + i}s`} repeatCount="indefinite" keyPoints="0;1;1;0;0" keyTimes="0;0.4;0.5;0.9;1" calcMode="linear" path={`M${s.x - 40} ${s.y - 30} L${b.x - 20} ${b.y + 40}`} />
            </g>
          );
        })}
      {mode !== "static" && <Truck p={truck} flip={flip} />}
    </svg>
  );
}
