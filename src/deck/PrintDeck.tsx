import { Printer } from "lucide-react";
import { SECTIONS } from "./slides";
import { ScenarioScene } from "./Scenario";
import { allFrames } from "./scenarios";
import { SvgDefs } from "./Characters";

/** Version imprimable : 1 étape visible = 1 page A4 paysage, scénarios étape par étape. */
export function PrintDeck() {
  const pages: { key: string; title: string; node: React.ReactNode }[] = [];

  for (const sec of SECTIONS) {
    for (const sl of sec.slides) {
      if (sl.scenario) {
        const frames = allFrames(sl.scenario);
        frames.forEach((f, i) => {
          pages.push({
            key: `${sl.id}-frame-${i}`,
            title: `${sl.title} (${i + 1}/${frames.length})`,
            node: <ScenarioScene sc={sl.scenario!} frame={f} interactive={false} />,
          });
        });
      } else {
        const stepsCount = Math.max(1, sl.steps);
        for (let step = 0; step < stepsCount; step++) {
          pages.push({
            key: `${sl.id}-step-${step}`,
            title: stepsCount > 1 ? `${sl.title} (${step + 1}/${stepsCount})` : sl.title,
            node: sl.render?.(step, { goTo: () => {} }),
          });
        }
      }
    }
  }

  return (
    <div className="print-root min-h-screen bg-paper p-8">
      <SvgDefs />
      <div className="no-print sticky top-0 z-50 mx-auto mb-8 flex max-w-[1122px] items-center justify-between rounded-2xl border border-deep/15 bg-deep px-6 py-4 text-silver shadow-2xl">
        <div>
          <div className="text-lg font-bold text-lavender">Version imprimable complète — {pages.length} pages A4</div>
          <div className="text-sm opacity-85">
            Pour enregistrer en PDF : Ctrl+P (ou Cmd+P) → Format : « A4 paysage », Marges : « Aucune », et cochez « Graphiques d'arrière-plan ».
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full bg-lavender px-6 py-2.5 font-bold text-deep shadow-lg hover:bg-lavender-soft transition cursor-pointer"
        >
          <Printer className="h-5 w-5" /> Imprimer / PDF
        </button>
      </div>

      <div className="print-container flex flex-col items-center gap-8">
        {pages.map((p) => (
          <div key={p.key} className="print-page shadow-xl">
            <div className="print-scale">{p.node}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
