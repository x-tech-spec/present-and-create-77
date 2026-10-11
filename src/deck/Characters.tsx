import type { CharId } from "./scenarios";
import { CHARACTERS } from "./scenarios";

type Look = { body: string; hair: "long" | "short" | "bun" | "bob" | "beard"; glasses?: boolean; tie?: boolean };

// Couleurs strictes : Lavender = marketing, Cosmic Blue = RH, Silver = DG / compta / neutre
const LOOKS: Record<CharId, Look> = {
  karim: { body: "fill-silver", hair: "beard", tie: true },
  sofia: { body: "fill-lavender", hair: "long" },
  amine: { body: "fill-cosmic", hair: "short", glasses: true },
  nadia: { body: "fill-[url(#grad-cosmic)]", hair: "bun" },
  sami: { body: "fill-silver", hair: "short", glasses: true },
  leila: { body: "fill-[url(#grad-lavender)]", hair: "bob" },
  lina: { body: "fill-lavender-soft", hair: "long" },
  yasmine: { body: "fill-silver", hair: "bun" },
};

export function SvgDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <linearGradient id="grad-cosmic" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="[stop-color:var(--cosmic-soft)]" />
          <stop offset="100%" className="[stop-color:var(--cosmic)]" />
        </linearGradient>
        <linearGradient id="grad-lavender" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="[stop-color:var(--lavender-soft)]" />
          <stop offset="100%" className="[stop-color:var(--lavender-dark)]" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Character({ id, size = 340, speaking = false, label = true }: { id: CharId; size?: number; speaking?: boolean; label?: boolean }) {
  const l = LOOKS[id];
  return (
    <div className="flex flex-col items-center" style={{ transition: "transform .3s", transform: speaking ? "translateY(-12px) scale(1.04)" : "none" }}>
      <svg viewBox="0 0 200 320" width={size * 0.62} height={size} className="stroke-deep" strokeWidth={5} strokeLinejoin="round">
        {/* ombre */}
        <ellipse cx="100" cy="310" rx="70" ry="9" className="fill-deep/15 stroke-none" />
        {/* jambes */}
        <rect x="70" y="230" width="24" height="75" rx="10" className="fill-deep" />
        <rect x="106" y="230" width="24" height="75" rx="10" className="fill-deep" />
        {/* corps */}
        <path d="M45 245 Q45 140 100 140 Q155 140 155 245 Z" className={l.body} />
        {l.tie && <path d="M100 145 L92 175 L100 205 L108 175 Z" className="fill-cosmic" />}
        {/* bras */}
        <path d="M50 175 Q30 210 44 238" className="fill-none" strokeWidth={14} strokeLinecap="round" />
        <path d="M150 175 Q170 210 156 238" className="fill-none" strokeWidth={14} strokeLinecap="round" />
        {/* cheveux arrière */}
        {l.hair === "long" && <path d="M52 80 Q50 150 70 160 L130 160 Q150 150 148 80 Z" className="fill-deep" />}
        {l.hair === "bob" && <path d="M54 75 Q50 130 66 132 L134 132 Q150 130 146 75 Z" className="fill-deep" />}
        {/* tête */}
        <circle cx="100" cy="85" r="45" className="fill-paper" />
        {/* cheveux avant */}
        {(l.hair === "short" || l.hair === "beard") && <path d="M56 78 Q60 36 100 38 Q142 36 144 78 Q120 58 100 62 Q78 58 56 78 Z" className="fill-deep" />}
        {(l.hair === "long" || l.hair === "bob") && <path d="M56 82 Q58 36 100 38 Q144 38 144 82 Q118 50 82 62 Z" className="fill-deep" />}
        {l.hair === "bun" && (
          <>
            <circle cx="100" cy="34" r="18" className="fill-deep" />
            <path d="M56 80 Q60 40 100 42 Q140 40 144 80 Q122 60 100 60 Q78 60 56 80 Z" className="fill-deep" />
          </>
        )}
        {l.hair === "beard" && <path d="M64 96 Q70 132 100 134 Q130 132 136 96 Q120 112 100 112 Q80 112 64 96 Z" className="fill-deep" />}
        {/* yeux */}
        <circle cx="84" cy="88" r="5" className="fill-deep stroke-none" />
        <circle cx="116" cy="88" r="5" className="fill-deep stroke-none" />
        {l.glasses && (
          <g className="fill-none" strokeWidth={4}>
            <circle cx="84" cy="88" r="13" />
            <circle cx="116" cy="88" r="13" />
            <path d="M97 88 L103 88" />
          </g>
        )}
        {/* bouche */}
        {l.hair !== "beard" && <path d={speaking ? "M88 108 Q100 120 112 108 Z" : "M88 108 Q100 116 112 108"} className={speaking ? "fill-deep" : "fill-none"} strokeWidth={4} strokeLinecap="round" />}
      </svg>
      {label && (
        <div className="slide-chrome mt-2 rounded-full bg-deep px-5 py-2 font-semibold text-silver">
          {CHARACTERS[id].name}
        </div>
      )}
    </div>
  );
}

/** Décor de bureau identique pour tous les scénarios : plaque, plante, écran, graphique mural en boucle. */
export function OfficeBackdrop({ plaque }: { plaque: string }) {
  return (
    <div className="absolute inset-0" aria-hidden>
      {/* mur + sol */}
      <div className="absolute inset-x-0 top-0 h-[760px] bg-paper" />
      <div className="absolute inset-x-0 bottom-0 h-[320px] bg-silver" />
      <div className="absolute inset-x-0 bottom-[320px] h-[6px] bg-deep/20" />
      {/* porte + plaque */}
      <div className="absolute left-[70px] top-[150px] h-[610px] w-[260px] rounded-t-[20px] border-[6px] border-deep/30 bg-silver/60">
        <div className="slide-chrome absolute left-1/2 top-[60px] -translate-x-1/2 whitespace-nowrap rounded-lg bg-deep px-5 py-3 font-semibold text-silver shadow-lg">
          {plaque}
        </div>
        <div className="absolute right-[24px] top-[320px] h-[14px] w-[40px] rounded-full bg-deep/40" />
      </div>
      {/* graphique mural qui grandit */}
      <svg className="absolute right-[90px] top-[120px]" width="300" height="220" viewBox="0 0 300 220">
        <rect x="4" y="4" width="292" height="212" rx="18" className="fill-silver stroke-deep/30" strokeWidth={6} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={36 + i * 50} y={60 + (4 - i) * 22 - 10} width="32" height={130 - (4 - i) * 22} rx="6" className="anim-grow fill-sec" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
      </svg>
      {/* plante */}
      <svg className="absolute bottom-[300px] right-[60px]" width="160" height="260" viewBox="0 0 160 260">
        <path d="M80 160 Q40 100 30 40 Q70 70 80 160 Q90 70 130 30 Q120 100 80 160 Q60 110 70 60" className="fill-lavender stroke-deep" strokeWidth={4} />
        <path d="M40 160 L120 160 L108 250 L52 250 Z" className="fill-deep" />
      </svg>
    </div>
  );
}
