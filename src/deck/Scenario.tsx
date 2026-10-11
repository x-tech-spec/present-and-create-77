import { useEffect, useState, type MutableRefObject, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  FileText,
  Landmark,
  Phone,
  RotateCcw,
  Truck,
  Users,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Calculator,
  Megaphone,
  TrendingUp,
  UserPlus,
  Sparkles,
} from "lucide-react";
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

function ScreenVisual({ v }: { v?: Visual | undefined }) {
  switch (v) {
    case "stat":
      return (
        <div className="flex items-center gap-8">
          <BarChart3 className="h-28 w-28 text-sec" strokeWidth={1.6} />
          <div>
            <div className="text-[130px] font-black leading-none tracking-tighter text-deep">60 %</div>
            <div className="slide-caption text-deep/70">des nouveaux produits cosmétiques échouent sans étude de marché</div>
          </div>
        </div>
      );
    case "budgetDown":
      return (
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <div className="flex items-center gap-3 rounded-full bg-deep px-6 py-2 text-silver font-bold">
            <AlertTriangle className="h-6 w-6 text-lavender" />
            <span>BUDGET STARTUP LIMITÉ</span>
          </div>
          <div className="text-[44px] font-black text-deep leading-tight">Zéro droit à l'erreur</div>
          <div className="slide-caption text-deep/75 max-w-[620px]">
            Chaque dinar investi en publicité doit toucher la bonne cliente
          </div>
        </div>
      );
    case "postitMission":
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <span className="slide-kicker text-sec mb-2">LA MISSION DU MARKETING</span>
          <div className="text-[46px] font-black leading-tight text-deep">
            COMPRENDRE<br />
            <span className="text-sec">AVANT DE VENDRE</span>
          </div>
          <p className="mt-2 text-[20px] font-semibold text-deep/70">Trouver la cliente avant de dépenser en publicité</p>
        </div>
      );
    case "spc":
    case "spc1":
    case "spc2":
    case "spc3":
    case "spc4": {
      const activeIdx = v === "spc1" ? 0 : v === "spc2" ? 1 : v === "spc3" ? 2 : 3;
      const steps = [
        { title: "1. Étudier", desc: "Questionnaires, concurrence" },
        { title: "2. Segmenter", desc: "Découper le marché" },
        { title: "3. Cibler", desc: "Choisir UNE cible" },
        { title: "4. Positionner", desc: "Notre promesse unique" },
      ];
      return (
        <div className="grid grid-cols-4 gap-3 px-4 w-full">
          {steps.map((s, i) => {
            const isDone = i < activeIdx;
            const isCurrent = i === activeIdx;
            return (
              <div
                key={s.title}
                className={`flex flex-col rounded-2xl p-4 transition-all ${
                  isCurrent
                    ? "bg-sec text-silver ring-4 ring-sec/30 shadow-lg scale-105"
                    : isDone
                    ? "bg-deep text-silver opacity-90"
                    : "bg-paper text-deep/50 border border-deep/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[18px] font-bold">{s.title}</span>
                  {isDone && <CheckCircle2 className="h-5 w-5 text-lavender" />}
                </div>
                <span className="text-[14px] opacity-80 leading-snug">{s.desc}</span>
              </div>
            );
          })}
        </div>
      );
    }
    case "targetSuccess":
      return (
        <div className="flex items-center gap-8 px-6">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-sec text-silver shadow-lg">
            <CheckCircle2 className="h-16 w-16" />
          </div>
          <div>
            <div className="slide-kicker text-sec">CIBLE ATTEINTE</div>
            <div className="text-[34px] font-extrabold text-deep leading-tight">Femmes 25-40 ans, urbaines, naturel</div>
            <div className="slide-caption text-deep/75 mt-1">Cible précise = Message précis = Ventes assurées</div>
          </div>
        </div>
      );
    case "notif":
      return (
        <div className="anim-pop flex items-center gap-6 rounded-3xl bg-paper p-6 shadow-xl border-2 border-deep/10">
          <Bell className="h-16 w-16 text-sec animate-bounce" />
          <div>
            <div className="slide-chrome font-bold text-sec">Manager commercial (Leïla)</div>
            <div className="text-[28px] font-black text-deep">Commerciale terrain EN URGENCE !</div>
            <div className="slide-caption text-deep/70">3 parapharmacies en attente</div>
          </div>
        </div>
      );
    case "viteBien":
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-4 text-[42px] font-black text-deep">
            <span className="rounded-2xl bg-paper px-6 py-2 border border-deep/15">VITE</span>
            <span className="text-sec">+</span>
            <span className="rounded-2xl bg-sec text-silver px-6 py-2 shadow-md">BIEN</span>
          </div>
          <div className="slide-caption font-bold text-deep/80">Les deux, jamais l'un sans l'autre</div>
          <p className="text-[18px] text-deep/60 max-w-[580px]">
            Mauvaise embauche = on recommence dans 3 mois (coût, retard, équipe démotivée)
          </p>
        </div>
      );
    case "recruterProcessus":
      return (
        <div className="flex flex-col items-center justify-center text-center p-4">
          <span className="slide-kicker text-sec mb-2">MISSION RH</span>
          <div className="text-[42px] font-black text-deep leading-tight">
            LE RECRUTEMENT N'EST PAS UN HASARD :<br />
            <span className="text-sec">C'EST UN PROCESSUS</span>
          </div>
        </div>
      );
    case "process7":
    case "process7-1":
    case "process7-2":
    case "process7-3":
    case "process7-4":
    case "process7-5":
    case "process7-6":
    case "process7-7": {
      const activeIdx = v === "process7" ? 6 : parseInt(v.replace("process7-", ""), 10) - 1;
      const steps = [
        "1. Analyser le besoin",
        "2. Rédiger l'annonce",
        "3. Diffuser",
        "4. Trier les CV",
        "5. Entretiens & test",
        "6. Décider",
        "7. Intégrer",
      ];
      return (
        <div className="grid grid-cols-4 gap-2.5 px-4 w-full">
          {steps.map((t, i) => {
            const isDone = i < activeIdx;
            const isCurrent = i === activeIdx;
            return (
              <div
                key={t}
                className={`rounded-xl px-3 py-2 font-bold transition-all text-[15px] ${
                  isCurrent
                    ? "bg-sec text-silver ring-4 ring-sec/30 shadow-md scale-105"
                    : isDone
                    ? "bg-deep text-silver opacity-90"
                    : "bg-paper text-deep/50 border border-deep/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{t}</span>
                  {isDone && <CheckCircle2 className="h-4 w-4 text-lavender shrink-0" />}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    case "cvFilter":
      return (
        <div className="flex items-center justify-center gap-3">
          {[
            { n: "40 CV", s: "Reçus", c: "bg-paper text-deep border border-deep/10" },
            { n: "5 CV", s: "Profil validé", c: "bg-silver text-deep" },
            { n: "2", s: "Entretiens", c: "bg-lavender text-deep" },
            { n: "1 : Lina", s: "Mise en situation", c: "bg-sec text-silver shadow-lg" },
          ].map((item, i) => (
            <div key={item.n} className="flex items-center gap-2">
              <div className={`flex flex-col items-center rounded-2xl px-5 py-3 ${item.c}`}>
                <span className="text-[26px] font-black">{item.n}</span>
                <span className="text-[13px] font-semibold opacity-85">{item.s}</span>
              </div>
              {i < 3 && <ArrowRight className="h-6 w-6 text-deep/40 shrink-0" />}
            </div>
          ))}
        </div>
      );
    case "enter":
      return (
        <div className="flex items-center gap-8 px-6">
          <div className="anim-slide-x" style={{ ["--from-x" as string]: "-200px" }}>
            <Character id="lina" size={210} label={false} />
          </div>
          <div>
            <div className="slide-kicker text-sec">INTÉGRATION RÉUSSIE</div>
            <div className="text-[34px] font-black text-deep">Bienvenue Lina !</div>
            <div className="mt-2 flex flex-col gap-1 text-[17px] font-semibold text-deep/80">
              <span>✅ Plan d'accueil & parrain désigné</span>
              <span>✅ Formation produit & terrain</span>
              <span>✅ 100 % autonome en 1 mois</span>
            </div>
          </div>
        </div>
      );
    case "payslip":
      return (
        <div className="flex flex-col items-center gap-3 w-full px-6">
          <div className="slide-kicker text-sec">FICHE DE PAIE — YASMINE</div>
          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="rounded-2xl bg-paper p-4 text-center border border-deep/10">
              <span className="text-[14px] text-deep/70 font-semibold">Heures normales</span>
              <div className="text-[26px] font-black text-deep">151,67 h</div>
            </div>
            <div className="rounded-2xl bg-destructive p-4 text-center text-silver ring-4 ring-destructive/30">
              <span className="text-[14px] font-bold">Heures sup</span>
              <div className="text-[24px] font-black">0 h (MANQUENT 10h !)</div>
            </div>
            <div className="rounded-2xl bg-paper p-4 text-center border border-deep/10">
              <span className="text-[14px] text-deep/70 font-semibold">Net à payer</span>
              <div className="text-[26px] font-black text-deep">Incomplet</div>
            </div>
          </div>
        </div>
      );
    case "phoneCall":
      return (
        <div className="flex items-center justify-center gap-6 px-6">
          <div className="flex items-center gap-3 rounded-2xl bg-paper px-6 py-4 border border-deep/15 shadow-md">
            <Phone className="h-10 w-10 text-sec animate-pulse" />
            <div>
              <div className="text-[20px] font-black text-deep">Yasmine ↔ Nadia</div>
              <div className="text-[14px] font-semibold text-deep/70">Pointage vérifié : 10h sup confirmées</div>
            </div>
          </div>
          <ArrowRight className="h-7 w-7 text-sec" />
          <div className="rounded-2xl bg-sec px-6 py-4 text-silver font-bold shadow-md text-[18px]">
            Transmission à Sami (Compta)
          </div>
        </div>
      );
    case "payflow":
      return (
        <div className="flex items-center gap-2">
          {[
            { t: "Employé", s: "Signale l'erreur", I: Users, c: "bg-paper text-deep border border-deep/10" },
            { t: "RH (Nadia)", s: "CALCULE", I: Calculator, c: "bg-sec text-silver shadow-md" },
            { t: "Compta (Sami)", s: "ENREGISTRE", I: FileText, c: "bg-paper text-deep border border-deep/10" },
            { t: "Banque", s: "PAIE", I: Landmark, c: "bg-deep text-silver" },
          ].map(({ t, s, I, c }, i) => (
            <div key={t} className="flex items-center gap-2">
              <div className={`anim-pop flex w-[150px] flex-col items-center rounded-2xl p-3 ${c}`} style={{ animationDelay: `${i * 0.4}s` }}>
                <I className="h-8 w-8" />
                <span className="slide-chrome mt-1 font-bold text-center leading-tight">{t}</span>
                {s && <span className="text-[11px] opacity-80 text-center font-semibold mt-0.5">[{s}]</span>}
              </div>
              {i < 3 && <ArrowRight className="h-6 w-6 shrink-0 text-deep/40" />}
            </div>
          ))}
        </div>
      );
    case "confetti":
      return (
        <div className="flex items-center gap-6">
          <CheckCircle2 className="h-20 w-20 text-sec" />
          <div>
            <div className="text-[38px] font-black text-deep">Virement reçu !</div>
            <div className="slide-caption text-deep/75">Montant corrigé avec les 10h sup · Flux RH → Compta validé</div>
          </div>
        </div>
      );
    case "whiteboardSolaire":
      return (
        <div className="flex flex-col items-center justify-center text-center p-4">
          <div className="rounded-full bg-deep px-6 py-2 text-silver text-[15px] font-bold mb-2">
            TABLEAU DE BORD STRATÉGIQUE
          </div>
          <div className="text-[44px] font-black text-deep leading-tight">LANCEMENT GAMME SOLAIRE</div>
          <div className="text-[26px] font-extrabold text-sec mt-1">Échéance : J - 60 jours</div>
        </div>
      );
    case "needsDuo":
      return (
        <div className="grid grid-cols-2 gap-6 px-6 w-full">
          <div className="flex flex-col items-center rounded-2xl bg-paper p-5 border border-deep/15 text-center">
            <Megaphone className="h-10 w-10 text-lavender mb-2" />
            <span className="text-[18px] font-extrabold text-deep">Besoin Marketing (Sofia)</span>
            <span className="text-[15px] text-deep/75 mt-1">« Des commerciaux formés et motivés pour convaincre »</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-paper p-5 border border-deep/15 text-center">
            <UserPlus className="h-10 w-10 text-cosmic mb-2" />
            <span className="text-[18px] font-extrabold text-deep">Besoin RH (Amine)</span>
            <span className="text-[15px] text-deep/75 mt-1">« Le profil de compétences exact pour recruter »</span>
          </div>
        </div>
      );
    case "circle":
    case "circle-1":
    case "circle-2":
    case "circle-3":
    case "circle-4": {
      const activeIdx = v === "circle" ? 4 : parseInt(v.replace("circle-", ""), 10);
      return <MiniCircle activeLink={activeIdx} />;
    }
    case "crack":
      return <MiniCircle cracked />;
    case "chart":
    case "counter":
      return (
        <div className="flex items-end gap-6">
          {[30, 45, 60, 95, 140, 200].map((h, i) => (
            <div key={i} className="anim-slide-y w-16 rounded-t-xl bg-sec" style={{ height: h, animationDelay: `${i * 0.15}s` }} />
          ))}
          <div className="ml-6 flex items-center gap-3">
            <TrendingUp className="h-20 w-20 text-sec" />
            <span className="text-[100px] font-black leading-none text-deep">{v === "counter" ? "+30 %" : "×2"}</span>
          </div>
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

function MiniCircle({ cracked = false, activeLink = 4 }: { cracked?: boolean; activeLink?: number }) {
  const items = [
    { t: "1. RH : Recrute & forme", I: UserPlus, c: "bg-cosmic text-silver" },
    { t: "2. Marketing : Comprend", I: Megaphone, c: "bg-lavender text-deep" },
    { t: "3. Ventes : Meilleures", I: TrendingUp, c: "bg-lavender text-deep" },
    { t: "4. Croissance : Budget RH", I: Sparkles, c: "bg-deep text-silver" },
  ];
  return (
    <div className="relative h-[270px] w-[620px]">
      <svg className="absolute inset-0" viewBox="0 0 620 270">
        <ellipse cx="310" cy="135" rx="250" ry="105" className={`fill-none stroke-deep/40 ${cracked ? "" : "anim-flow"}`} strokeWidth={6} />
        {cracked && <path d="M295 20 L325 65 L290 100 L330 145" className="fill-none stroke-destructive" strokeWidth={8} />}
      </svg>
      {items.map(({ t, I, c }, i) => {
        const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
        const isCurrent = i + 1 === activeLink;
        const isPassed = i + 1 <= activeLink;
        return (
          <div
            key={t}
            className={`anim-pop slide-chrome absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full px-4 py-2 font-semibold transition-all ${c} ${
              cracked && i === 0 ? "line-through opacity-50 bg-destructive text-silver" : ""
            } ${isCurrent ? "ring-4 ring-sec/40 scale-105 shadow-lg" : !isPassed ? "opacity-40" : ""}`}
            style={{ left: 310 + Math.cos(a) * 250, top: 135 + Math.sin(a) * 105, animationDelay: `${i * 0.3}s` }}
          >
            <I className="h-5 w-5" /> {t}
          </div>
        );
      })}
    </div>
  );
}

function Bubble({ who, text, note, side }: { who: CharId; text: string; note?: string | undefined; side: "left" | "right" | "center" }) {
  return (
    <div className={`bubble anim-pop px-10 py-6 ${side === "right" ? "bubble-right" : "bubble-left"}`}>
      <div className="slide-chrome mb-1 font-bold text-sec">
        {CHARACTERS[who].name}
        <span className="font-normal opacity-70"> · {CHARACTERS[who].role}</span>
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
  const step = frame.k === "step" ? sc.before[frame.i]! : frame.k === "after" ? sc.after[frame.i]! : null;
  const cons = frame.k === "cons" ? sc.choices[frame.c]! : null;
  const speakers = new Set<CharId>(step ? step.lines.map((l) => l.who) : cons ? [cons.line.who] : []);
  const sideOf = (who: CharId): "left" | "right" | "center" => (who === sc.left ? "left" : who === sc.right ? "right" : "center");
  const totalSteps = sc.before.length + 1 + sc.after.length + 1;
  const stepNo =
    frame.k === "step"
      ? frame.i + 1
      : frame.k === "choice" || frame.k === "cons"
      ? sc.before.length + 1
      : frame.k === "after"
      ? sc.before.length + 2 + frame.i
      : totalSteps;
  const stepLabel = step?.type ?? (frame.k === "lesson" ? "Leçon" : frame.k === "cons" ? "Conséquence" : "Choix A/B/C");
  const visual = cons?.visual ?? step?.visual;

  const currentNarrator =
    frame.k === "step"
      ? step?.narrator
      : frame.k === "choice"
      ? sc.choiceNarrator
      : frame.k === "cons"
      ? cons?.narrator
      : frame.k === "after"
      ? step?.narrator
      : frame.k === "lesson"
      ? "📖 La règle d'or à retenir pour toujours"
      : null;

  const choose = (c: number) => {
    if (!interactive) return;
    const o = sc.choices[c]!.outcome;
    play(o === "success" ? "ding" : "buzz");
    onFrame?.({ k: "cons", c });
  };

  const extraSpeaker = [...speakers].find((w) => w !== sc.left && w !== sc.right && w !== sc.center);

  return (
    <div className={`slide-content ${accent}`}>
      <OfficeBackdrop plaque={sc.plaque} />

      {/* En-tête : Titre à gauche, numéro d'étape à droite */}
      <div className="absolute left-[380px] right-[400px] top-[30px] flex items-center justify-between">
        <div className="flex items-baseline gap-5">
          <span className="slide-kicker text-sec">{sc.fn === "mk" ? "Marketing" : sc.fn === "rh" ? "Ressources humaines" : "Marketing × RH"}</span>
          <span className="text-[38px] font-extrabold tracking-tight">{sc.title}</span>
        </div>
        <div className="slide-chrome rounded-full bg-deep px-5 py-2 font-semibold text-silver shrink-0 shadow-sm">
          Étape {stepNo}/{totalSteps} · {stepLabel}
        </div>
      </div>

      {/* Cartouche narrateur — conforme au cahier des charges Cosmic Purple */}
      {currentNarrator && (
        <div className="absolute left-[380px] right-[400px] top-[88px] z-20 flex items-center gap-3.5 rounded-full border border-deep/20 bg-silver/95 px-6 py-2.5 text-deep shadow-md backdrop-blur">
          <BookOpen className="h-6 w-6 shrink-0 text-sec" />
          <span className="text-[21px] font-bold leading-tight line-clamp-1">{currentNarrator}</span>
        </div>
      )}

      {/* Écran mural */}
      <div className="absolute left-[550px] top-[156px] flex h-[310px] w-[820px] items-center justify-center rounded-[28px] border-[10px] border-deep bg-silver shadow-xl">
        {frame.k === "cons" && cons?.visual === "truckBack" ? (
          <div className="flex items-center gap-6">
            <div className="anim-truck-back">
              <Truck className="h-28 w-28 text-deep" />
            </div>
            <span className="slide-body font-bold">Le camion recule…</span>
          </div>
        ) : frame.k === "cons" && cons?.visual === "crack" ? (
          <MiniCircle cracked />
        ) : (
          <ScreenVisual key={`${frame.k}-${"i" in frame ? frame.i : ""}`} v={frame.k === "cons" ? undefined : visual} />
        )}
      </div>

      {/* Personnages */}
      <div className="absolute bottom-[24px] left-[380px]">
        <Character id={sc.left} speaking={speakers.has(sc.left)} />
      </div>
      <div className="absolute bottom-[24px] right-[380px]">
        <Character id={sc.right} speaking={speakers.has(sc.right)} />
      </div>
      {sc.center && (
        <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2">
          <Character id={sc.center} speaking={speakers.has(sc.center)} />
        </div>
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
        <div
          className="absolute inset-x-[300px] top-[485px] flex gap-6"
          style={{
            justifyContent:
              step.lines.length > 1
                ? "space-between"
                : sideOf(step.lines[0]!.who) === "left"
                ? "flex-start"
                : sideOf(step.lines[0]!.who) === "right"
                ? "flex-end"
                : "center",
          }}
        >
          {step.lines.map((l, i) => (
            <div key={i} style={{ maxWidth: step.lines.length > 1 ? 640 : 1220, animationDelay: `${i * 0.6}s` }} className="anim-pop">
              <Bubble who={l.who} text={l.text} note={l.note} side={step.lines.length > 1 ? (i === 0 ? "left" : "right") : sideOf(l.who)} />
            </div>
          ))}
        </div>
      )}

      {/* Choix A/B/C */}
      {frame.k === "choice" && (
        <div className="absolute left-1/2 top-[120px] z-30 w-[1260px] -translate-x-1/2 rounded-[36px] bg-deep p-10 text-silver shadow-2xl anim-pop">
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
                className="slide-body flex items-center gap-5 rounded-2xl bg-silver px-7 py-4 text-left font-semibold text-deep transition hover:-translate-y-1 hover:bg-lavender-soft cursor-pointer"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sec text-[30px] font-black text-silver">
                  {c.key}
                </span>
                « {c.text} »
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conséquence */}
      {cons && (
        <div className={`absolute left-1/2 top-[490px] z-30 w-[1240px] -translate-x-1/2 rounded-[36px] p-9 shadow-2xl anim-pop ${OUTCOME[cons.outcome].cls}`}>
          {(() => {
            const O = OUTCOME[cons.outcome];
            return (
              <>
                <div className="mb-3 flex items-center gap-4">
                  <O.Icon className="h-12 w-12" />
                  <span className="slide-kicker">
                    Réponse {cons.key} — {O.label}
                  </span>
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
                  className="slide-body mt-6 inline-flex items-center gap-3 rounded-full bg-silver px-8 py-3 font-bold text-deep transition hover:-translate-y-1 cursor-pointer"
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
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-deep/60 backdrop-blur-sm">
          <div className="postit anim-pop w-[1300px] rounded-[18px] px-20 py-16">
            <div className="slide-kicker mb-6 text-sec">La règle d'or à retenir</div>
            <p className="text-[50px] font-extrabold leading-[1.25] tracking-tight text-deep">« {sc.lesson} »</p>
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
      if (frame.k === "choice") return true;
      if (frame.k === "cons") {
        setFrame(sc.choices[frame.c]!.outcome === "success" ? { k: "after", i: 0 } : { k: "choice" });
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
