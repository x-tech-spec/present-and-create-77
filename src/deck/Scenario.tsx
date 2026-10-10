import { useEffect, useState, type MutableRefObject, type ReactNode } from "react";
import { BarChart3, Bell, Building2, CheckCircle2, FileText, Landmark, Phone, RotateCcw, Truck, Users, AlertTriangle, XCircle, ArrowRight, Calculator, Megaphone, TrendingUp, UserPlus, Sparkles } from "lucide-react";
import { Character, OfficeBackdrop } from "./Characters";
import { CHARACTERS, type Frame, type Outcome, type Scenario, type Visual, type CharId } from "./scenarios";
import { play } from "./sound";

export type SlideCtrl = { next: () => boolean; prev: () => boolean } | null;

const OUTCOME: Record<Outcome, { label: string; cls: string; Icon: typeof CheckCircle2; btn: string }> = {
  success: { label: "Réussite", cls: "panel-success", Icon: CheckCircle2, btn: "Continuer" },
  trap: { label: "Piège", cls: "panel-trap", Icon: AlertTriangle, btn: "Retour au choix" },
  partial: { label: "Échec partiel", cls: "panel-trap", Icon: AlertTriangle, btn: "Essayer encore ?" },
  fail: { label: "Échec", cls: "panel-fail", Icon: XCircle, btn: "Essayer encore ?" },
};

function Chip({ children, on = true, delay = 0 }: { children: ReactNode; on?: boolean; delay?: number }) {
  return (
    <div
      className={`slide-caption rounded-2xl px-5 py-3 font-semibold ${on ? "bg-sec text-silver" : "bg-silver text-deep"}`}
      style={on ? { animation: `light-on .4s ${delay}s both` } : undefined}
    >
      {children}
    </div>
  );
}

function ScreenVisual({ v }: { v?: Visual }) {
  switch (v) {
    case "stat":
      return (
        <div className="flex items-center gap-8">
          <BarChart3 className="h-28 w-28 text-sec" strokeWidth={1.6} />
          <div>
            <div className="text-[150px] font-black leading-none tracking-tighter text-deep">60 %</div>
            <div className="slide-caption text-deep/70">des nouveaux produits cosmétiques échouent</div>
          </div>
        </div>
      );
    case "spc":
      return (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {["Étude de marché", "Segmentation", "Ciblage", "Positionnement"].map((t, i) => (
            <div key={t} className="flex items-center gap-3">
              <Chip delay={i * 0.5}>{t}</Chip>
              {i < 3 && <ArrowRight className="h-8 w-8 text-deep" />}
            </div>
          ))}
        </div>
      );
    case "process7":
      return (
        <div className="grid grid-cols-4 gap-3">
          {["Besoin", "Annonce", "Diffusion", "Tri des CV", "Entretiens", "Décision", "Intégration"].map((t, i) => (
            <Chip key={t} delay={i * 0.45}>
              {i + 1}. {t}
            </Chip>
          ))}
        </div>
      );
    case "chart":
    case "counter":
      return (
        <div className="flex items-end gap-6">
          {[30, 45, 60, 95, 140, 200].map((h, i) => (
            <div key={i} className="anim-slide-y w-16 rounded-t-xl bg-sec" style={{ height: h, animationDelay: `${i * 0.15}s` }} />
          ))}
          <div className="ml-6 flex items-center gap-3">
            <TrendingUp className="h-20 w-20 text-sec" />
            <span className="text-[110px] font-black leading-none text-deep">{v === "counter" ? "+30 %" : "x2"}</span>
          </div>
        </div>
      );
    case "notif":
      return (
        <div className="anim-pop flex items-center gap-6 rounded-3xl bg-paper p-6 shadow-xl">
          <Bell className="h-16 w-16 text-sec" />
          <div>
            <div className="slide-chrome font-bold">Leïla · Directrice commerciale</div>
            <div className="slide-caption">Nouveau message — URGENT</div>
          </div>
        </div>
      );
    case "payslip":
      return (
        <div className="flex gap-6">
          {["Heures", "Primes", "Retenues", "Congés"].map((t, i) => (
            <div key={t} className="anim-rise flex flex-col items-center gap-2 rounded-2xl bg-paper p-5" style={{ animationDelay: `${i * 0.2}s` }}>
              <FileText className="h-14 w-14 text-sec" />
              <span className="slide-caption font-semibold">{t}</span>
            </div>
          ))}
        </div>
      );
    case "payflow":
      return (
        <div className="flex items-center gap-3">
          {[
            { t: "Employés", s: "", I: Users, c: "bg-silver text-deep" },
            { t: "RH", s: "calcule", I: Calculator, c: "bg-cosmic text-silver" },
            { t: "Comptabilité", s: "vérifie + écrit", I: FileText, c: "bg-paper text-deep" },
            { t: "Banque", s: "paie", I: Landmark, c: "bg-deep text-silver" },
          ].map(({ t, s, I, c }, i) => (
            <div key={t} className="flex items-center gap-3">
              <div className={`anim-pop flex w-[150px] flex-col items-center rounded-2xl p-3 ${c}`} style={{ animationDelay: `${i * 0.5}s` }}>
                <I className="h-10 w-10" />
                <span className="slide-chrome mt-1 font-bold">{t}</span>
                {s && <span className="slide-chrome opacity-80">[{s}]</span>}
              </div>
              {i < 3 && <ArrowRight className="h-8 w-8 shrink-0 text-deep" />}
            </div>
          ))}
        </div>
      );
    case "circle":
      return <MiniCircle />;
    case "enter":
      return (
        <div className="flex items-center gap-8">
          <div className="anim-slide-x" style={{ ["--from-x" as string]: "-300px" }}>
            <Character id="lina" size={240} label={false} />
          </div>
          <div>
            <UserPlus className="h-16 w-16 text-sec" />
            <div className="slide-body font-bold">Open space — Lina Cosmétiques</div>
          </div>
        </div>
      );
    case "confetti":
      return (
        <div className="flex items-center gap-6">
          <Phone className="h-24 w-24 text-sec" />
          <div className="slide-body-lg font-bold">Virement reçu</div>
          <CheckCircle2 className="h-20 w-20 text-cosmic" />
        </div>
      );
    default:
      return (
        <div className="flex flex-col items-center gap-4 text-deep/70">
          <Building2 className="h-24 w-24 text-sec" strokeWidth={1.4} />
          <span className="slide-caption font-semibold">Lina Cosmétiques</span>
        </div>
      );
  }
}

function MiniCircle({ cracked = false }: { cracked?: boolean }) {
  const items = [
    { t: "Recruter & former", I: UserPlus, c: "bg-cosmic text-silver" },
    { t: "Comprendre les clientes", I: Megaphone, c: "bg-lavender text-deep" },
    { t: "Meilleures ventes", I: TrendingUp, c: "bg-lavender text-deep" },
    { t: "Croissance", I: Sparkles, c: "bg-deep text-silver" },
    { t: "Budget RH", I: Calculator, c: "bg-cosmic text-silver" },
  ];
  return (
    <div className="relative h-[280px] w-[560px]">
      <svg className="absolute inset-0" viewBox="0 0 560 280">
        <ellipse cx="280" cy="140" rx="230" ry="110" className={`fill-none stroke-deep/40 ${cracked ? "" : "anim-flow"}`} strokeWidth={5} />
        {cracked && <path d="M270 20 L290 60 L265 90 L295 130" className="fill-none stroke-deep" strokeWidth={8} />}
      </svg>
      {items.map(({ t, I, c }, i) => {
        const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <div
            key={t}
            className={`anim-pop slide-chrome absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full px-4 py-2 font-semibold ${c} ${cracked && i === 0 ? "line-through opacity-50" : ""}`}
            style={{ left: 280 + Math.cos(a) * 230, top: 140 + Math.sin(a) * 110, animationDelay: `${i * 0.45}s` }}
          >
            <I className="h-5 w-5" /> {t}
          </div>
        );
      })}
    </div>
  );
}

function Bubble({ who, text, note, side }: { who: CharId; text: string; note?: string; side: "left" | "right" | "center" }) {
  return (
    <div className={`bubble anim-pop px-10 py-6 ${side === "right" ? "bubble-right" : "bubble-left"}`}>
      <div className="slide-chrome mb-1 font-bold text-sec">
        {CHARACTERS[who].name}
        {note ? <span className="font-normal text-deep/60"> ({note})</span> : null}
      </div>
      <p className="text-[31px] font-medium leading-[1.3]">« {text} »</p>
    </div>
  );
}

export function ScenarioScene({
  sc,
  frame,
  onFrame,
  interactive = false,
}: {
  sc: Scenario;
  frame: Frame;
  onFrame?: (f: Frame) => void;
  interactive?: boolean;
}) {
  const accent = sc.fn === "mk" ? "accent-mk" : sc.fn === "rh" ? "accent-rh" : "accent-neutral";
  const step = frame.k === "step" ? sc.before[frame.i] : frame.k === "after" ? sc.after[frame.i] : null;
  const cons = frame.k === "cons" ? sc.choices[frame.c] : null;
  const speakers = new Set<CharId>(step ? step.lines.map((l) => l.who) : cons ? [cons.line.who] : []);
  const sideOf = (who: CharId): "left" | "right" | "center" => (who === sc.left ? "left" : who === sc.right ? "right" : "center");
  const totalSteps = sc.before.length + 1 + sc.after.length + 1;
  const stepNo =
    frame.k === "step" ? frame.i + 1 : frame.k === "choice" || frame.k === "cons" ? sc.before.length + 1 : frame.k === "after" ? sc.before.length + 2 + frame.i : totalSteps;
  const stepLabel = step?.type ?? (frame.k === "lesson" ? "Leçon" : frame.k === "cons" ? "Conséquence" : "Choix A/B/C");
  const visual = cons?.visual ?? step?.visual;

  const choose = (c: number) => {
    if (!interactive) return;
    const o = sc.choices[c].outcome;
    play(o === "success" ? "ding" : "buzz");
    onFrame?.({ k: "cons", c });
  };

  // Personnages visibles : Yasmine n'apparaît qu'au téléphone ; Karim au centre (S4)
  const extraSpeaker = [...speakers].find((w) => w !== sc.left && w !== sc.right && w !== sc.center);

  return (
    <div className={`slide-content ${accent}`}>
      <OfficeBackdrop plaque={sc.plaque} />

      {/* En-tête */}
      <div className="absolute left-[380px] right-[420px] top-[36px] flex items-baseline gap-5">
        <span className="slide-kicker text-sec">{sc.fn === "mk" ? "Marketing" : sc.fn === "rh" ? "Ressources humaines" : "Marketing × RH"}</span>
        <span className="text-[40px] font-extrabold tracking-tight">{sc.title}</span>
      </div>
      <div className="slide-chrome absolute right-[420px] top-[96px] rounded-full bg-deep px-5 py-2 font-semibold text-silver">
        Étape {stepNo}/{totalSteps} · {stepLabel}
      </div>

      {/* Écran mural */}
      <div className="absolute left-[560px] top-[150px] flex h-[320px] w-[800px] items-center justify-center rounded-[28px] border-[10px] border-deep bg-silver shadow-xl">
        {frame.k === "cons" && cons?.visual === "truckBack" ? (
          <div className="flex items-center gap-6">
            <div className="anim-truck-back"><Truck className="h-28 w-28 text-deep" /></div>
            <span className="slide-body font-bold">Le camion recule…</span>
          </div>
        ) : frame.k === "cons" && cons?.visual === "crack" ? (
          <MiniCircle cracked />
        ) : (
          <ScreenVisual key={`${frame.k}-${"i" in frame ? frame.i : ""}`} v={frame.k === "cons" ? undefined : visual} />
        )}
      </div>

      {/* Personnages */}
      <div className="absolute bottom-[24px] left-[400px]"><Character id={sc.left} speaking={speakers.has(sc.left)} /></div>
      <div className="absolute bottom-[24px] right-[400px]"><Character id={sc.right} speaking={speakers.has(sc.right)} /></div>
      {sc.center && (
        <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2"><Character id={sc.center} speaking={speakers.has(sc.center)} /></div>
      )}
      {extraSpeaker && (
        <div className="anim-pop absolute bottom-[60px] left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-[40px] border-[6px] border-deep bg-silver p-4">
          <Phone className="h-12 w-12 text-sec" />
          <Character id={extraSpeaker} size={220} speaking />
        </div>
      )}
      {frame.k === "after" && sc.id === "s3" && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 26 }).map((_, i) => (
            <span
              key={i}
              className={`anim-confetti absolute top-0 h-4 w-3 rounded-sm ${["bg-lavender", "bg-cosmic", "bg-silver", "bg-deep"][i % 4]}`}
              style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * 0.15}s` }}
            />
          ))}
        </div>
      )}

      {/* Bulles */}
      {step && (
        <div className="absolute inset-x-[300px] top-[495px] flex gap-6" style={{ justifyContent: step.lines.length > 1 ? "space-between" : sideOf(step.lines[0].who) === "left" ? "flex-start" : sideOf(step.lines[0].who) === "right" ? "flex-end" : "center" }}>
          {step.lines.map((l, i) => (
            <div key={i} style={{ maxWidth: step.lines.length > 1 ? 640 : 1220, animationDelay: `${i * 0.6}s` }} className="anim-pop">
              <Bubble who={l.who} text={l.text} note={l.note} side={step.lines.length > 1 ? (i === 0 ? "left" : "right") : sideOf(l.who)} />
            </div>
          ))}
        </div>
      )}

      {/* Choix A/B/C */}
      {frame.k === "choice" && (
        <div className="absolute left-1/2 top-[120px] z-10 w-[1260px] -translate-x-1/2 rounded-[36px] bg-deep p-10 text-silver shadow-2xl anim-pop">
          <div className="slide-kicker mb-3 text-lavender">Que décide le responsable ?</div>
          <p className="slide-body-lg mb-7 font-bold">« {sc.question} »</p>
          <div className="flex flex-col gap-4">
            {sc.choices.map((c, i) => (
              <button
                key={c.key}
                onClick={(e) => {
                  e.stopPropagation();
                  choose(i);
                }}
                className="slide-body flex items-center gap-5 rounded-2xl bg-silver px-7 py-4 text-left font-semibold text-deep transition hover:-translate-y-1 hover:bg-lavender-soft"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sec text-[30px] font-black text-silver">{c.key}</span>
                « {c.text} »
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conséquence */}
      {cons && (
        <div className={`absolute left-1/2 top-[500px] z-10 w-[1240px] -translate-x-1/2 rounded-[36px] p-9 shadow-2xl anim-pop ${OUTCOME[cons.outcome].cls}`}>
          {(() => {
            const O = OUTCOME[cons.outcome];
            return (
              <>
                <div className="mb-3 flex items-center gap-4">
                  <O.Icon className="h-12 w-12" />
                  <span className="slide-kicker">Réponse {cons.key} — {O.label}</span>
                  <span className={`slide-caption ml-2 opacity-80 ${cons.outcome === "fail" ? "line-through" : ""}`}>« {cons.text} »</span>
                </div>
                <p className="text-[32px] font-semibold leading-[1.3]">
                  <span className="font-black">{CHARACTERS[cons.line.who].name} : </span>« {cons.line.text} »
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!interactive) return;
                    play("click");
                    onFrame?.(cons.outcome === "success" ? { k: "after", i: 0 } : { k: "choice" });
                  }}
                  className="slide-body mt-6 inline-flex items-center gap-3 rounded-full bg-silver px-8 py-3 font-bold text-deep transition hover:-translate-y-1"
                >
                  {cons.outcome === "success" ? <ArrowRight className="h-7 w-7" /> : <RotateCcw className="h-7 w-7" />}
                  {O.btn}
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Leçon : post-it géant */}
      {frame.k === "lesson" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-paper/70">
          <div className="postit anim-pop w-[1300px] rounded-[18px] px-20 py-16">
            <div className="slide-kicker mb-6 text-sec">La leçon à retenir</div>
            <p className="text-[52px] font-extrabold leading-[1.2] tracking-tight">« {sc.lesson} »</p>
          </div>
        </div>
      )}
    </div>
  );
}

/** Scénario interactif : 1 clic = 1 étape. */
export function InteractiveScenario({ sc, ctrlRef }: { sc: Scenario; ctrlRef: MutableRefObject<SlideCtrl> }) {
  const [frame, setFrame] = useState<Frame>({ k: "step", i: 0 });

  useEffect(() => {
    const next = () => {
      if (frame.k === "step") {
        setFrame(frame.i + 1 < sc.before.length ? { k: "step", i: frame.i + 1 } : { k: "choice" });
        play("click");
        return true;
      }
      if (frame.k === "choice") return true; // attendre un choix
      if (frame.k === "cons") {
        setFrame(sc.choices[frame.c].outcome === "success" ? { k: "after", i: 0 } : { k: "choice" });
        return true;
      }
      if (frame.k === "after") {
        setFrame(frame.i + 1 < sc.after.length ? { k: "after", i: frame.i + 1 } : { k: "lesson" });
        play("click");
        return true;
      }
      return false;
    };
    const prev = () => {
      if (frame.k === "step") {
        if (frame.i === 0) return false;
        setFrame({ k: "step", i: frame.i - 1 });
        return true;
      }
      if (frame.k === "choice") {
        setFrame({ k: "step", i: sc.before.length - 1 });
        return true;
      }
      if (frame.k === "cons") {
        setFrame({ k: "choice" });
        return true;
      }
      if (frame.k === "after") {
        setFrame(frame.i > 0 ? { k: "after", i: frame.i - 1 } : { k: "choice" });
        return true;
      }
      setFrame({ k: "after", i: sc.after.length - 1 });
      return true;
    };
    ctrlRef.current = { next, prev };
    return () => {
      ctrlRef.current = null;
    };
  }, [frame, sc, ctrlRef]);

  return <ScenarioScene sc={sc} frame={frame} onFrame={setFrame} interactive />;
}
