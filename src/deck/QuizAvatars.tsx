export type AvatarId = "girl_long" | "girl_tied" | "boy_glasses" | "boy_normal";

export const AVATAR_LIST: { id: AvatarId; label: string }[] = [
  { id: "girl_long", label: "Cheveux longs" },
  { id: "girl_tied", label: "Cheveux attachés" },
  { id: "boy_glasses", label: "Avec lunettes" },
  { id: "boy_normal", label: "Sans lunettes" },
];

export function QuizAvatar({
  id,
  size = 64,
  className = "",
}: {
  id: AvatarId;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-silver/60 p-1 border-2 border-deep/20 ${className}`}
      style={{ width: size, height: size }}
      aria-label={id}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        className="stroke-deep"
        strokeWidth={3.5}
        strokeLinejoin="round"
      >
        {/* Corps neutre */}
        <path d="M22 92 Q22 64 50 64 Q78 64 78 92 Z" className="fill-deep/80 stroke-none" />

        {/* Tête */}
        <circle cx="50" cy="42" r="22" className="fill-paper" />

        {/* Coiffures spécifiques */}
        {id === "girl_long" && (
          <>
            {/* Cheveux longs derrière et côtés */}
            <path d="M26 40 Q24 72 34 76 L66 76 Q76 72 74 40 Z" className="fill-deep" />
            <path d="M28 42 Q30 20 50 20 Q70 20 72 42 Q60 26 40 32 Z" className="fill-deep" />
          </>
        )}

        {id === "girl_tied" && (
          <>
            {/* Chignon au sommet */}
            <circle cx="50" cy="16" r="9" className="fill-deep" />
            {/* Cheveux attachés */}
            <path d="M28 38 Q30 22 50 22 Q70 22 72 38 Q60 28 38 34 Z" className="fill-deep" />
          </>
        )}

        {id === "boy_glasses" && (
          <>
            {/* Cheveux courts */}
            <path d="M28 38 Q32 20 50 21 Q68 20 72 38 Q60 30 50 32 Q40 30 28 38 Z" className="fill-deep" />
            {/* Lunettes */}
            <rect x="34" y="38" width="12" height="9" rx="2" className="fill-silver/40 stroke-deep" strokeWidth={2.5} />
            <rect x="54" y="38" width="12" height="9" rx="2" className="fill-silver/40 stroke-deep" strokeWidth={2.5} />
            <line x1="46" y1="42" x2="54" y2="42" strokeWidth={2.5} />
          </>
        )}

        {id === "boy_normal" && (
          <>
            {/* Cheveux courts mèches */}
            <path d="M28 40 Q32 18 50 20 Q68 18 72 40 Q58 28 48 31 Q38 28 28 40 Z" className="fill-deep" />
            {/* Yeux simples */}
            <circle cx="41" cy="42" r="2.5" className="fill-deep stroke-none" />
            <circle cx="59" cy="42" r="2.5" className="fill-deep stroke-none" />
            <path d="M46 51 Q50 54 54 51" className="fill-none stroke-deep" strokeWidth={2} />
          </>
        )}

        {id !== "boy_normal" && (
          <>
            {/* Yeux et sourire */}
            <circle cx="41" cy="42" r="2.5" className="fill-deep stroke-none" />
            <circle cx="59" cy="42" r="2.5" className="fill-deep stroke-none" />
            <path d="M46 52 Q50 55 54 52" className="fill-none stroke-deep" strokeWidth={2} />
          </>
        )}
      </svg>
    </div>
  );
}
