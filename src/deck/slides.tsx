import type { ReactNode } from "react";
import {
  Award, BadgeCheck, Banknote, Briefcase, Building2, Calculator, ClipboardList, Factory, FileText, GraduationCap, Handshake,
  HardHat, Landmark, LineChart, Megaphone, Newspaper, Package, Repeat, Scale, Search, ShieldCheck, ShoppingBag, Sparkles,
  Store, Swords, Target, TrendingUp, Truck, UserPlus, Users, Wallet, Crosshair, Layers, Heart, Gavel, HelpCircle, ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { SCENARIOS, type Scenario } from "./scenarios";
import { CityMap } from "./CityMap";

export type Fn = "mk" | "rh" | "neutral";
export type SlideCtx = { goTo: (s: number, sub: number) => void };
export type SlideDef = {
  id: string;
  title: string;
  steps: number;
  scenario?: Scenario;
  render?: (step: number, ctx: SlideCtx) => ReactNode;
};
export type SectionDef = { id: number; title: string; short: string; fn: Fn; slides: SlideDef[] };

/* ---------------- Primitives ---------------- */

export function SlideFrame({ fn, kicker, title, id, children }: { fn: Fn; kicker: string; title: string; id: string; children: ReactNode }) {
  const accent = fn === "mk" ? "accent-mk" : fn === "rh" ? "accent-rh" : "accent-neutral";
  return (
    <div className={`slide-content ${accent}`}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]"><CityMap active={-1} mode="static" /></div>
      <div className="absolute left-0 top-0 h-full w-[18px] bg-sec" />
      <div className="absolute left-[110px] right-[110px] top-[70px] flex items-start justify-between">
        <div>
          <div className="slide-kicker text-sec">{kicker}</div>
          <h2 className="slide-title mt-3 max-w-[1500px]">{title}</h2>
        </div>
        <div className="slide-chrome rounded-full bg-silver px-5 py-2 font-bold">{id}</div>
      </div>
      <div className="absolute inset-x-[110px] bottom-[90px] top-[290px]">{children}</div>
    </div>
  );
}

function Reveal({ show, children, className = "", style }: { show: boolean; children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{ ...style, opacity: show ? 1 : 0, transform: show ? "none" : "translateY(24px)", transition: "opacity .5s, transform .5s" }}
    >
      {children}
    </div>
  );
}

function IconCard({ I, title, text, on = true, dim = false }: { I: LucideIcon; title: string; text?: string; on?: boolean; dim?: boolean }) {
  return (
    <div className={`card-3d flex h-full flex-col gap-4 p-8 ${dim ? "opacity-35 saturate-0" : ""}`} style={{ opacity: on ? undefined : 0 }}>
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-sec text-silver">
        <I className="h-11 w-11" strokeWidth={1.8} />
      </div>
      <div className="slide-body-lg font-extrabold">{title}</div>
      {text && <div className="slide-body text-deep/75">{text}</div>}
    </div>
  );
}

function Definition({ text, example, step }: { text: ReactNode; example: ReactNode; step: number }) {
  return (
    <>
      <Reveal show={step >= 0}>
        <p className="slide-body-lg max-w-[1300px] font-medium">{text}</p>
      </Reveal>
      <Reveal show={step >= 2} className="absolute bottom-0 left-0 right-0">
        <div className="flex items-center gap-6 rounded-[28px] bg-sec-soft px-10 py-7">
          <Building2 className="h-14 w-14 shrink-0 text-sec" />
          <p className="slide-body"><b>Exemple — Lina Cosmétiques :</b> {example}</p>
        </div>
      </Reveal>
    </>
  );
}

function Pictos({ items, step, at = 1 }: { items: { I: LucideIcon; t: string; d?: string }[]; step: number; at?: number }) {
  const w = items.length > 4 ? 280 : 330;
  return (
    <div className="absolute left-0 right-0 top-[170px] flex items-center justify-between">
      {items.map(({ I, t, d }, i) => (
        <div key={t} className="flex items-center gap-4">
          <Reveal show={step >= at} style={{ transitionDelay: `${i * 0.12}s`, width: w }} className="card-3d flex flex-col items-center gap-3 px-5 py-7 text-center">
            <I className="h-16 w-16 text-sec" strokeWidth={1.6} />
            <span className="slide-body font-bold">{t}</span>
            {d && <span className="slide-caption text-deep/70">{d}</span>}
          </Reveal>
          {i < items.length - 1 && <Reveal show={step >= at}><ArrowRight className="h-9 w-9 text-deep/40" /></Reveal>}
        </div>
      ))}
    </div>
  );
}

/* Organigramme acteurs + flux animés */
type Actor = { I: LucideIcon; t: string; ex: string };
function ActorsChart({ center, centerI, internes, externes, step }: { center: string; centerI: LucideIcon; internes: Actor[]; externes: Actor[]; step: number }) {
  const W = 1700, H = 700, cx = 640, cy = 350;
  const intPos = internes.map((_, i) => ({ x: 150, y: 110 + i * (480 / Math.max(1, internes.length - 1)) }));
  const extPos = externes.map((_, i) => ({ x: i % 2 === 0 ? 1170 : 1500, y: 90 + Math.floor(i / 2) * 260 }));
  const C = centerI;
  const Node = ({ a, p, show, kind }: { a: Actor; p: { x: number; y: number }; show: boolean; kind: "int" | "ext" }) => (
    <div
      className={`absolute w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] px-5 py-4 shadow-lg ${kind === "int" ? "bg-sec-soft" : "bg-silver"}`}
      style={{ left: p.x, top: p.y, opacity: show ? 1 : 0, transition: "opacity .5s" }}
    >
      <div className="flex items-center gap-3">
        <a.I className="h-9 w-9 shrink-0 text-sec" />
        <span className="slide-caption font-extrabold">{a.t}</span>
      </div>
      <div className="slide-chrome mt-1 whitespace-normal text-deep/70">{a.ex}</div>
    </div>
  );
  return (
    <div className="relative" style={{ width: W, height: H }}>
      <svg className="absolute inset-0" width={W} height={H}>
        {intPos.map((p, i) => (
          <line key={`i${i}`} x1={cx} y1={cy} x2={p.x + 150} y2={p.y} className="anim-flow stroke-sec" strokeWidth={5} style={{ opacity: step >= 1 ? 1 : 0, transition: "opacity .5s" }} />
        ))}
        {extPos.map((p, i) => (
          <line key={`e${i}`} x1={cx} y1={cy} x2={p.x - 150} y2={p.y} className="anim-flow stroke-deep/50" strokeWidth={4} style={{ opacity: step >= 2 ? 1 : 0, transition: "opacity .5s" }} />
        ))}
      </svg>
      <div className="slide-kicker absolute left-[150px] top-[-40px] -translate-x-1/2 text-sec" style={{ opacity: step >= 1 ? 1 : 0 }}>Acteurs internes</div>
      <div className="slide-kicker absolute left-[1335px] top-[-40px] -translate-x-1/2 text-deep/70" style={{ opacity: step >= 2 ? 1 : 0 }}>Acteurs externes</div>
      <div className="absolute flex h-[220px] w-[300px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-3 rounded-full bg-sec text-silver shadow-2xl" style={{ left: cx, top: cy }}>
        <C className="h-16 w-16" />
        <span className="slide-body text-center font-black">{center}</span>
      </div>
      {internes.map((a, i) => <Node key={a.t} a={a} p={intPos[i]!} show={step >= 1} kind="int" />)}
      {externes.map((a, i) => <Node key={a.t} a={a} p={extPos[i]!} show={step >= 2} kind="ext" />)}
    </div>
  );
}

/* ---------------- Contenu ---------------- */

const MK_MISSIONS: Actor[] = [
  { I: Search, t: "Étude de marché", ex: "Questionnaires, analyse des concurrents" },
  { I: Layers, t: "Segmentation", ex: "Découper le marché en groupes (âge, ville, attentes)" },
  { I: Crosshair, t: "Ciblage", ex: "Choisir le groupe : femmes 25-40 ans, urbaines" },
  { I: Target, t: "Positionnement (Se différencier)", ex: "Définir ce qui rend le produit unique face aux concurrents (ex. 100 % naturel et local)" },
  { I: Package, t: "Marketing Mix (Les 4P)", ex: "Produit, Prix, Distribution, Communication : l'offre concrète" },
  { I: Heart, t: "Fidélisation", ex: "Garder les clientes : conseils, suivi, carte fidélité" },
];

const RH_MISSIONS: Actor[] = [
  { I: UserPlus, t: "Recrutement", ex: "Trouver la bonne commerciale terrain" },
  { I: GraduationCap, t: "Formation", ex: "Formation produit des vendeuses" },
  { I: Wallet, t: "Paie", ex: "Salaires, primes, heures sup" },
  { I: Handshake, t: "Relations sociales", ex: "Dialogue avec les représentants du personnel" },
  { I: HardHat, t: "Sécurité", ex: "Prévenir les accidents à l'atelier" },
  { I: ClipboardList, t: "Évaluation", ex: "Entretien annuel de chaque salarié" },
  { I: LineChart, t: "GPEC", ex: "Anticiper les compétences de demain" },
];

function MissionsTree({ root, rootI, items, step }: { root: string; rootI: LucideIcon; items: Actor[]; step: number }) {
  const R = rootI;
  const cols = items.length > 6 ? 4 : 3;
  return (
    <div className="flex h-full items-center gap-14">
      <div className="flex h-[260px] w-[260px] shrink-0 flex-col items-center justify-center gap-3 rounded-[40px] bg-sec text-silver shadow-2xl">
        <R className="h-20 w-20" />
        <span className="slide-body-lg font-black">{root}</span>
      </div>
      <div className="grid flex-1 gap-6" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {items.map((m, i) => (
          <Reveal key={m.t} show={step >= i} className="card-3d relative p-6">
            <div className="flex items-center gap-4">
              <span className="slide-caption flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-deep font-black text-silver">{i + 1}</span>
              <m.I className="h-10 w-10 shrink-0 text-sec" />
            </div>
            <div className="slide-body mt-3 font-extrabold leading-tight">{m.t}</div>
            <div className="slide-caption mt-2 text-deep/70">{m.ex}</div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function CompareTable({ step }: { step: number }) {
  const rows = [
    { I: Target, f: "Marketing", o: "Comprendre le marché et créer l'offre", q: "« À qui s'adresse la crème, et pourquoi ? »", e: "Cibler les femmes 25-40 ans, urbaines, sensibles au naturel" },
    { I: ShoppingBag, f: "Ventes", o: "Conclure l'achat", q: "« Comment convaincre cette cliente d'acheter ? »", e: "L'équipe commerciale place la crème dans 3 nouvelles parapharmacies" },
    { I: Megaphone, f: "Publicité", o: "Faire connaître le message", q: "« Comment faire savoir que la crème existe ? »", e: "Diffuser des annonces visuelles (réseaux sociaux, affiches) annonçant l'arrivée de la crème" },
  ];
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="slide-kicker grid grid-cols-[280px_1fr_1fr_1fr] gap-4 px-6 text-deep/60">
        <span />
        <span>Objectif</span>
        <span>Question clé</span>
        <span>Exemple : crème « Éclat du Sud »</span>
      </div>
      {rows.map((r, i) => (
        <Reveal key={r.f} show={step >= i} className={`grid grid-cols-[280px_1fr_1fr_1fr] items-center gap-4 rounded-[24px] px-6 py-6 ${i === 0 ? "bg-sec text-silver" : "bg-silver"}`}>
          <div className="flex items-center gap-4"><r.I className="h-10 w-10" /><span className="slide-body-lg font-black">{r.f}</span></div>
          <span className="slide-caption font-semibold">{r.o}</span>
          <span className="slide-caption">{r.q}</span>
          <span className="slide-caption font-semibold">{r.e}</span>
        </Reveal>
      ))}
      <Reveal show={step >= 2} className="slide-body mt-2 px-6 font-semibold">
        La publicité et la vente sont des <b>outils</b> au service du marketing.
      </Reveal>
    </div>
  );
}

function RhVsCompta({ step }: { step: number }) {
  const col = (I: LucideIcon, t: string, verbs: string, items: string[], cls: string) => (
    <div className={`card-3d flex h-full flex-col gap-4 p-10 ${cls}`}>
      <div className="flex items-center gap-4"><I className="h-14 w-14" /><span className="slide-subtitle">{t}</span></div>
      <div className="slide-body-lg font-black tracking-wide">{verbs}</div>
      <ul className="slide-body flex flex-col gap-2">{items.map((x) => <li key={x}>— {x}</li>)}</ul>
    </div>
  );
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="grid h-[440px] grid-cols-2 gap-10">
        <Reveal show={step >= 0}>{col(Calculator, "RH", "CALCULENT et GÈRENT la paie", ["Salaire de base, heures sup", "Primes, retenues, congés", "Corrigent les erreurs à la source"], "bg-cosmic text-silver")}</Reveal>
        <Reveal show={step >= 1}>{col(FileText, "Comptabilité", "ENREGISTRE et EXÉCUTE le paiement", ["Vérifie le montant", "Enregistre la charge salariale", "Exécute le virement via la banque"], "bg-silver")}</Reveal>
      </div>
      <Reveal show={step >= 2} className="flex items-center justify-center gap-5 rounded-[24px] bg-deep px-8 py-5 text-silver">
        {[{ I: Users, t: "Employés" }, { I: Calculator, t: "RH" }, { I: FileText, t: "Comptabilité" }, { I: Landmark, t: "Banque" }].map(({ I, t }, i) => (
          <div key={t} className="flex items-center gap-5">
            <span className="slide-body flex items-center gap-3 font-bold"><I className="h-9 w-9" />{t}</span>
            {i < 3 && <ArrowRight className="h-8 w-8 opacity-60" />}
          </div>
        ))}
        <span className="slide-body ml-6 font-black text-lavender">Deux fonctions, un seul flux</span>
      </Reveal>
    </div>
  );
}

function Synergy({ step }: { step: number }) {
  const mk = [
    { I: Award, t: "La marque employeur", d: "Une marque forte et attractive attire de meilleurs talents." },
    { I: Search, t: "La vision des compétences", d: "Le marketing anticipe les attentes clients et indique les profils à recruter." },
    { I: Megaphone, t: "L'alignement interne", d: "Chaque salarié comprend la promesse faite aux clients." },
  ];
  const rh = [
    { I: UserPlus, t: "Les bons talents au bon poste", d: "Recruter les créatifs, analystes et commerciaux qui réalisent la stratégie." },
    { I: GraduationCap, t: "La formation terrain", d: "Former les vendeurs aux produits et à l'argumentaire." },
    { I: Banknote, t: "Motivation & rémunération", d: "Des primes alignées sur la satisfaction client et les ventes." },
  ];
  const col = (title: string, items: typeof mk, cls: string, show: boolean) => (
    <Reveal show={show} className={`flex flex-col gap-4 ${cls}`}>
      <div className="slide-kicker text-sec">{title}</div>
      {items.map((x) => (
        <div key={x.t} className="card-3d flex items-start gap-5 p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sec text-silver"><x.I className="h-8 w-8" /></div>
          <div>
            <div className="slide-body font-extrabold">{x.t}</div>
            <div className="slide-caption mt-1 text-deep/75">{x.d}</div>
          </div>
        </div>
      ))}
    </Reveal>
  );
  return (
    <div className="grid h-full grid-cols-[1fr_380px_1fr] items-center gap-8">
      {col("Le Marketing apporte aux RH", mk, "accent-mk", step >= 0)}
      <Reveal show={step >= 2} className="flex flex-col items-center gap-5 rounded-[32px] bg-deep p-8 text-center text-silver shadow-2xl">
        <Repeat className="h-16 w-16" />
        <p className="slide-body font-black">« Le marketing promet, les collaborateurs délivrent. »</p>
        <p className="slide-caption opacity-85">Sans les RH, la promesse reste vide. Sans le Marketing, les RH n'ont pas de cap commercial.</p>
      </Reveal>
      {col("Les RH apportent au Marketing", rh, "accent-rh", step >= 1)}
    </div>
  );
}

/** Lien du quiz (à renseigner quand le quiz sera prêt). */
const QUIZ_URL = "";

/* ---------------- Plan ---------------- */

export const SECTIONS: SectionDef[] = [
  {
    id: 0, title: "Introduction", short: "Intro", fn: "neutral",
    slides: [
      {
        id: "0.1", title: "Page de titre", steps: 1,
        render: () => (
          <div className="slide-content accent-neutral">
            <div className="absolute inset-0 opacity-35"><CityMap active={-1} mode="static" /></div>
            <div className="absolute inset-0 bg-paper/75" />
            <div className="absolute left-[140px] top-[200px] max-w-[1400px]">
              <div className="slide-kicker anim-rise text-cosmic">Entrepreneuriat</div>
              <h1 className="slide-title-lg anim-rise mt-6" style={{ animationDelay: ".1s" }}>Les principales fonctions de l'entreprise</h1>
              <div className="anim-rise mt-12 flex gap-6" style={{ animationDelay: ".25s" }}>
                <span className="slide-body-lg rounded-full bg-lavender px-9 py-4 font-bold">Marketing</span>
                <span className="slide-body-lg rounded-full bg-cosmic px-9 py-4 font-bold text-silver">Ressources humaines</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "0.2", title: "L'entreprise", steps: 3,
        render: (s) => (
          <SlideFrame fn="neutral" kicker="Introduction" title="Une entreprise, c'est quoi ?" id="0.2">
            <Definition
              step={s}
              text={<>Une organisation qui <b>combine des ressources</b> (humaines, matérielles, financières) pour <b>produire</b> des biens ou des services et les <b>vendre</b> sur un marché.</>}
              example={<>une équipe + des ingrédients + un budget → la crème « Éclat du Sud » → ses clientes.</>}
            />
            <Pictos step={s} items={[{ I: Users, t: "Ressources" }, { I: Factory, t: "Transformation" }, { I: Package, t: "Produits" }, { I: Store, t: "Clients" }]} />
          </SlideFrame>
        ),
      },
      {
        id: "0.3", title: "L'arbre des fonctions", steps: 2,
        render: (s) => {
          const fns = [
            { I: Factory, t: "Production", k: "x" }, { I: Truck, t: "Achats", k: "x" }, { I: ShoppingBag, t: "Ventes", k: "x" },
            { I: Landmark, t: "Finance", k: "x" }, { I: Megaphone, t: "Marketing", k: "mk" }, { I: Users, t: "Ressources humaines", k: "rh" },
          ];
          return (
            <SlideFrame fn="neutral" kicker="Rappel" title="L'arbre des fonctions de l'entreprise" id="0.3">
              <div className="relative h-full">
                <div className="absolute left-1/2 top-0 flex -translate-x-1/2 items-center gap-4 rounded-[28px] bg-deep px-12 py-6 text-silver">
                  <Building2 className="h-12 w-12" /><span className="slide-subtitle">L'entreprise</span>
                </div>
                <svg className="absolute inset-0" width="1700" height="700">
                  {fns.map((_, i) => (
                    <path key={i} d={`M850 120 C850 220 ${140 + i * 284} 220 ${140 + i * 284} 330`} className="fill-none stroke-deep/30" strokeWidth={5} />
                  ))}
                </svg>
                <div className="absolute inset-x-0 top-[330px] grid grid-cols-6 gap-6">
                  {fns.map((f) => (
                    <div key={f.t} className={f.k === "mk" ? "accent-mk" : f.k === "rh" ? "accent-rh" : "accent-neutral"} style={{ transition: "all .6s", opacity: s >= 1 && f.k === "x" ? 0.3 : 1, transform: s >= 1 && f.k !== "x" ? "translateY(-16px) scale(1.06)" : "none" }}>
                      <div className={`card-3d flex h-[230px] flex-col items-center justify-center gap-4 p-5 text-center ${s >= 1 && f.k !== "x" ? "bg-deep text-silver" : ""}`}>
                        <f.I className="h-14 w-14" />
                        <span className="slide-caption font-extrabold">{f.t}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Reveal show={s >= 1} className="slide-body absolute inset-x-0 bottom-0 text-center font-semibold">
                  Aujourd'hui : Marketing et Ressources humaines.
                </Reveal>
              </div>
            </SlideFrame>
          );
        },
      },
    ],
  },
  {
    id: 1, title: "Partie 1 · Marketing", short: "Marketing", fn: "mk",
    slides: [
      {
        id: "1.1", title: "Le marketing, c'est quoi ?", steps: 3,
        render: (s) => (
          <SlideFrame fn="mk" kicker="Partie 1 · Marketing" title="Le marketing, c'est quoi exactement ?" id="1.1">
            <Definition
              step={s}
              text={<>L'ensemble des actions pour <b>comprendre les besoins des clients</b> et y <b>répondre mieux que les concurrents</b>.</>}
              example={<>avant de lancer « Éclat du Sud », le service marketing découvre ce que veulent vraiment les clientes.</>}
            />
            <Pictos step={s} items={[{ I: Search, t: "Écouter" }, { I: Target, t: "Comprendre" }, { I: Package, t: "Proposer" }, { I: Heart, t: "Fidéliser" }]} />
          </SlideFrame>
        ),
      },
      {
        id: "1.2", title: "Les missions du marketing", steps: 6,
        render: (s) => (
          <SlideFrame fn="mk" kicker="Partie 1 · Marketing" title="Les missions du marketing" id="1.2">
            <MissionsTree root="Marketing" rootI={Megaphone} items={MK_MISSIONS} step={s} />
          </SlideFrame>
        ),
      },
      {
        id: "1.3", title: "Acteurs du marketing", steps: 3,
        render: (s) => (
          <SlideFrame fn="mk" kicker="Partie 1 · Marketing" title="Acteurs et environnement" id="1.3">
            <ActorsChart
              step={s}
              center="Marketing"
              centerI={Megaphone}
              internes={[
                { I: Briefcase, t: "Direction", ex: "Valide le budget" },
                { I: ShoppingBag, t: "Équipe commerciale", ex: "Remonte les avis clients" },
                { I: Factory, t: "Production", ex: "Adapte la formule" },
              ]}
              externes={[
                { I: Users, t: "Clientes", ex: "Avis, achats" },
                { I: Swords, t: "Concurrents", ex: "Prix, nouveautés" },
                { I: Truck, t: "Fournisseurs", ex: "Ingrédients naturels" },
                { I: Store, t: "Distributeurs", ex: "Parapharmacies" },
                { I: Newspaper, t: "Presse", ex: "Articles, influence" },
                { I: Scale, t: "Institutions", ex: "Normes cosmétiques" },
              ]}
            />
          </SlideFrame>
        ),
      },
      { id: "1.4", title: "Scénario 1 — Le lancement", steps: 1, scenario: SCENARIOS.s1 },
      {
        id: "1.5", title: "Marketing / Ventes / Publicité", steps: 3,
        render: (s) => (
          <SlideFrame fn="mk" kicker="Partie 1 · Marketing" title="Marketing, ventes, publicité : ne pas confondre" id="1.5">
            <CompareTable step={s} />
          </SlideFrame>
        ),
      },
    ],
  },
  {
    id: 2, title: "Partie 2 · Ressources humaines", short: "RH", fn: "rh",
    slides: [
      {
        id: "2.1", title: "Les RH, c'est quoi ?", steps: 3,
        render: (s) => (
          <SlideFrame fn="rh" kicker="Partie 2 · Ressources humaines" title="Les RH, c'est quoi exactement ?" id="2.1">
            <Definition
              step={s}
              text={<>La fonction qui <b>organise, développe et valorise le capital humain</b> de l'entreprise, en conciliant les besoins de <b>performance</b> de l'organisation et l'<b>épanouissement</b> des salariés.</>}
              example={<>accompagner l'arrivée d'une nouvelle collaboratrice : de la sélection de son profil et la rédaction de son contrat, jusqu'à sa formation aux produits et le versement régulier de sa paie.</>}
            />
            <Pictos step={s} items={[
              { I: UserPlus, t: "Recruter", d: "Identifier les besoins et sélectionner" },
              { I: Handshake, t: "Intégrer", d: "Accueillir et accompagner" },
              { I: GraduationCap, t: "Former", d: "Développer les compétences" },
              { I: FileText, t: "Administrer", d: "Contrats, absences et paie" },
              { I: Heart, t: "Engager", d: "Bien-être, dialogue et fidélisation" },
            ]} />
          </SlideFrame>
        ),
      },
      {
        id: "2.2", title: "Les missions des RH", steps: 7,
        render: (s) => (
          <SlideFrame fn="rh" kicker="Partie 2 · Ressources humaines" title="Les missions des RH" id="2.2">
            <MissionsTree root="RH" rootI={Users} items={RH_MISSIONS} step={s} />
          </SlideFrame>
        ),
      },
      {
        id: "2.3", title: "Acteurs des RH", steps: 3,
        render: (s) => (
          <SlideFrame fn="rh" kicker="Partie 2 · Ressources humaines" title="Acteurs et environnement" id="2.3">
            <ActorsChart
              step={s}
              center="RH"
              centerI={Users}
              internes={[
                { I: Briefcase, t: "Direction", ex: "Fixe la politique RH" },
                { I: Award, t: "Managers", ex: "Expriment les besoins" },
                { I: Users, t: "Employés", ex: "Paie, formation, carrière" },
              ]}
              externes={[
                { I: Search, t: "Cabinets de recrutement", ex: "Trouvent des candidats" },
                { I: GraduationCap, t: "Organismes de formation", ex: "Forment les équipes" },
                { I: Gavel, t: "Inspection du travail", ex: "Contrôle le droit du travail" },
                { I: BadgeCheck, t: "CNAS / assurances", ex: "Protection sociale" },
                { I: Landmark, t: "ANEM", ex: "Agence nationale de l'emploi" },
              ]}
            />
          </SlideFrame>
        ),
      },
      { id: "2.4", title: "Scénario 2 — L'embauche urgente", steps: 1, scenario: SCENARIOS.s2 },
      { id: "2.5", title: "Scénario 3 — Qui paie les salaires ?", steps: 1, scenario: SCENARIOS.s3 },
      {
        id: "2.6", title: "RH vs Comptabilité", steps: 3,
        render: (s) => (
          <SlideFrame fn="rh" kicker="Partie 2 · Ressources humaines" title="RH vs Comptabilité" id="2.6">
            <RhVsCompta step={s} />
          </SlideFrame>
        ),
      },
      { id: "2.7", title: "Scénario 4 — Le lancement en duo", steps: 1, scenario: SCENARIOS.s4 },
      {
        id: "2.8", title: "Synergie Marketing ↔ RH", steps: 3,
        render: (s) => (
          <SlideFrame fn="neutral" kicker="Marketing & RH" title="Synergie Marketing ↔ RH" id="2.8">
            <Synergy step={s} />
          </SlideFrame>
        ),
      },
    ],
  },
  {
    id: 3, title: "Quiz", short: "Quiz", fn: "neutral",
    slides: [
      {
        id: "3.1", title: "Place au Quiz !", steps: 1,
        render: (_s, ctx) => (
          <SlideFrame fn="neutral" kicker="Quiz interactif" title="Place au Quiz !" id="3.1">
            <div className="flex h-full flex-col items-center justify-center gap-10">
              <div className="flex flex-wrap items-center justify-center gap-8">
                <a
                  href="?mode=host"
                  onClick={(e) => { e.stopPropagation(); window.location.href = "?mode=host"; }}
                  className="flex items-center gap-4 rounded-3xl bg-deep px-10 py-7 text-2xl font-black text-silver shadow-2xl transition hover:-translate-y-1 hover:shadow-deep/30 cursor-pointer"
                >
                  <Building2 className="h-8 w-8 text-lavender" />
                  Lancer l'écran Host
                  <ArrowRight className="h-7 w-7 text-silver" />
                </a>

                <a
                  href="?mode=player"
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-4 rounded-3xl border-2 border-deep/20 bg-silver px-10 py-7 text-2xl font-black text-deep shadow-2xl transition hover:-translate-y-1 cursor-pointer"
                >
                  <Users className="h-8 w-8 text-cosmic" />
                  Lancer l'écran Player
                  <ArrowRight className="h-7 w-7 text-deep" />
                </a>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); ctx.goTo(4, 0); }}
                className="inline-flex items-center gap-3 rounded-full border border-deep/20 bg-paper/80 px-8 py-3.5 text-base font-bold text-deep/70 transition hover:bg-silver hover:text-deep cursor-pointer"
              >
                Passer directement à la conclusion <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </SlideFrame>
        ),
      },
    ],
  },
  {
    id: 4, title: "Conclusion", short: "Conclusion", fn: "neutral",
    slides: [
      {
        id: "4.1", title: "Synthèse", steps: 3,
        render: (s) => (
          <SlideFrame fn="neutral" kicker="Conclusion" title="3 idées à retenir" id="4.1">
            <div className="grid h-full grid-cols-3 gap-8">
              <Reveal show={s >= 0} className="accent-mk h-full"><IconCard I={Target} title="Marketing" text="COMPRENDRE le marché avant de vendre : étudier, segmenter, cibler, positionner." /></Reveal>
              <Reveal show={s >= 1} className="accent-rh h-full"><IconCard I={Users} title="Ressources humaines" text="Les bonnes PERSONNES, bien recrutées, payées justement et formées." /></Reveal>
              <Reveal show={s >= 2} className="accent-neutral h-full"><IconCard I={Repeat} title="Un système" text="Marketing × RH : chacune nourrit l'autre, c'est un cercle vertueux." /></Reveal>
            </div>
          </SlideFrame>
        ),
      },
      {
        id: "4.2", title: "Merci — Questions ?", steps: 1,
        render: () => (
          <div className="slide-content accent-neutral flex flex-col items-center justify-center">
            <div className="absolute inset-0 opacity-30"><CityMap active={4} mode="static" /></div>
            <div className="absolute inset-0 bg-paper/50" />
            <h2 className="slide-title-lg anim-pop relative">Merci !</h2>
            <p className="slide-subtitle anim-rise relative mt-8 text-cosmic" style={{ animationDelay: ".2s" }}>Des questions ?</p>
          </div>
        ),
      },
    ],
  },
];

export const FLAT = SECTIONS.flatMap((sec) => sec.slides.map((sl, sub) => ({ sec, sl, s: sec.id, sub })));
