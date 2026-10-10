import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Map as MapIcon, Maximize, Minimize, Printer, Volume2, VolumeX } from "lucide-react";
import { SECTIONS, FLAT } from "./slides";
import { CityMap } from "./CityMap";
import { InteractiveScenario, type SlideCtrl } from "./Scenario";
import { SvgDefs } from "./Characters";
import { play, setSound } from "./sound";

export function ScaledSlide({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => setScale(Math.min(el.clientWidth / 1920, el.clientHeight / 1080));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      <div className="absolute left-1/2 top-1/2" style={{ width: 1920, height: 1080, marginLeft: -960, marginTop: -540, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

type View = "content" | "travel" | "map";

export function Presentation() {
  const [pos, setPos] = useState({ s: 0, sub: 0 });
  const [step, setStep] = useState(0);
  const [view, setView] = useState<View>("content");
  const [travel, setTravel] = useState<{ from: number; to: number; sub: number; last: boolean }>({ from: 0, to: 0, sub: 0, last: false });
  const [dir, setDir] = useState("enter-h-next");
  const [sound, setSoundState] = useState(false);
  const [fs, setFs] = useState(false);
  const ctrlRef = useRef<SlideCtrl>(null);

  const section = SECTIONS[pos.s];
  const slide = section.slides[pos.sub];

  // Lecture de l'URL (?s=1.3) au montage
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("s");
    const f = FLAT.find((x) => x.sl.id === id);
    if (f) setPos({ s: f.s, sub: f.sub });
  }, []);
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("s", slide.id);
    window.history.replaceState(null, "", url);
    const idx = FLAT.findIndex((x) => x.sl.id === slide.id);
    document.title = `${idx + 1}/${FLAT.length} — ${slide.title}`;
  }, [slide]);

  const goSection = useCallback(
    (to: number, sub = 0, last = false) => {
      if (to < 0 || to >= SECTIONS.length) return;
      play("click");
      setTravel({ from: pos.s, to, sub, last });
      setView("travel");
    },
    [pos.s],
  );

  const arrive = useCallback(() => {
    const sec = SECTIONS[travel.to];
    const sub = travel.last ? sec.slides.length - 1 : travel.sub;
    setPos({ s: travel.to, sub });
    setStep(travel.last ? sec.slides[sub].steps - 1 : 0);
    setDir(travel.to >= travel.from ? "enter-h-next" : "enter-h-prev");
    setView("content");
  }, [travel]);

  const nextSub = useCallback(() => {
    if (pos.sub + 1 < section.slides.length) {
      setPos({ s: pos.s, sub: pos.sub + 1 });
      setStep(0);
      setDir("enter-v-next");
    } else goSection(pos.s + 1);
  }, [pos, section, goSection]);

  const prevSub = useCallback(
    (toLast = false) => {
      if (pos.sub > 0) {
        const sub = pos.sub - 1;
        setPos({ s: pos.s, sub });
        setStep(toLast ? section.slides[sub].steps - 1 : 0);
        setDir("enter-v-prev");
      } else goSection(pos.s - 1, 0, true);
    },
    [pos, section, goSection],
  );

  const next = useCallback(() => {
    if (ctrlRef.current?.next()) return;
    if (step < slide.steps - 1) {
      setStep(step + 1);
      play("click");
    } else nextSub();
  }, [step, slide, nextSub]);

  const prev = useCallback(() => {
    if (ctrlRef.current?.prev()) return;
    if (step > 0) setStep(step - 1);
    else prevSub(true);
  }, [step, prevSub]);

  const toggleFs = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  }, []);
  useEffect(() => {
    const h = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (view === "travel") return;
      if (view === "map") {
        if (e.key === "Escape" || e.key.toLowerCase() === "m") setView("content");
        return;
      }
      switch (e.key) {
        case "ArrowRight": e.preventDefault(); goSection(pos.s + 1); break;
        case "ArrowLeft": e.preventDefault(); goSection(pos.s - 1); break;
        case "ArrowDown": e.preventDefault(); nextSub(); break;
        case "ArrowUp": e.preventDefault(); prevSub(); break;
        case " ": case "Enter": case "PageDown": e.preventDefault(); next(); break;
        case "Backspace": case "PageUp": e.preventDefault(); prev(); break;
        case "f": case "F": toggleFs(); break;
        case "m": case "M": setView("map"); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, pos, goSection, nextSub, prevSub, next, prev, toggleFs]);

  // Swipe tactile
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY });
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current || view !== "content") return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
    else if (Math.abs(dy) > 60) (dy < 0 ? nextSub : () => prevSub())();
  };

  const onStageClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button,a")) return;
    if (e.clientX < window.innerWidth * 0.2) prev();
    else next();
  };

  const idx = FLAT.findIndex((x) => x.sl.id === slide.id);
  const ctx = { goTo: (s: number, sub: number) => goSection(s, sub) };

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-paper" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <SvgDefs />
      {view === "content" && (
        <div className="h-full w-full cursor-pointer" onClick={onStageClick}>
          <ScaledSlide>
            <div key={slide.id} className={`h-full w-full ${dir}`}>
              {slide.scenario ? <InteractiveScenario sc={slide.scenario} ctrlRef={ctrlRef} /> : slide.render?.(step, ctx)}
            </div>
          </ScaledSlide>
        </div>
      )}
      {view !== "content" && (
        <div className="relative h-full w-full">
          <CityMap
            key={view === "travel" ? `t${travel.from}-${travel.to}` : "browse"}
            mode={view === "travel" ? "travel" : "browse"}
            active={view === "travel" ? travel.to : pos.s}
            from={view === "travel" ? travel.from : undefined}
            onArrive={arrive}
            onPick={(i) => goSection(i)}
          />
          <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center">
            <div className="rounded-full bg-deep px-6 py-3 text-lg font-bold text-silver shadow-lg">
              {view === "travel" ? `En route vers : ${SECTIONS[travel.to].title}` : "La ville-entreprise — cliquez sur un bâtiment (Échap pour revenir)"}
            </div>
          </div>
        </div>
      )}

      {/* Progression */}
      <div className="no-print absolute inset-x-0 bottom-0 h-1.5 bg-silver">
        <div className="h-full bg-deep transition-all duration-500" style={{ width: `${((idx + 1) / FLAT.length) * 100}%` }} />
      </div>

      {/* Barre d'outils (discrète) */}
      <div className="no-print absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-deep/85 p-1 text-silver opacity-40 shadow-lg transition-opacity hover:opacity-100">
        <ToolBtn label="Précédent" onClick={prev}><ChevronLeft className="h-5 w-5" /></ToolBtn>
        <span className="px-2 text-sm font-semibold tabular-nums">{slide.id} · {idx + 1}/{FLAT.length}</span>
        <ToolBtn label="Suivant" onClick={next}><ChevronRight className="h-5 w-5" /></ToolBtn>
        <ToolBtn label="Carte (M)" onClick={() => setView(view === "map" ? "content" : "map")}><MapIcon className="h-5 w-5" /></ToolBtn>
        <ToolBtn label={sound ? "Couper le son" : "Activer le son"} onClick={() => { setSound(!sound); setSoundState(!sound); }}>
          {sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </ToolBtn>
        <ToolBtn label="Version imprimable / PDF" onClick={() => window.open("/?print-pdf", "_blank")}><Printer className="h-5 w-5" /></ToolBtn>
        <ToolBtn label="Plein écran (F)" onClick={toggleFs}>{fs ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}</ToolBtn>
      </div>
    </div>
  );
}

function ToolBtn({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-silver/20"
    >
      {children}
    </button>
  );
}
