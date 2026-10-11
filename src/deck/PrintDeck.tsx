import { Printer } from "lucide-react";
import { SECTIONS } from "./slides";
import { ScenarioScene } from "./Scenario";
import { allFrames } from "./scenarios";
import { SvgDefs } from "./Characters";

/** Version imprimable : 1 page par slide (contenu complet), scénarios étape par étape. */
export function PrintDeck() {
  const pages: { key: string; node: React.ReactNode }[] = [];
  for (const sec of SECTIONS) {
    for (const sl of sec.slides) {
      if (sl.scenario) {
        allFrames(sl.scenario).forEach((f, i) => pages.push({ key: `${sl.id}-${i}`, node: <ScenarioScene sc={sl.scenario!} frame={f} /> }));
      } else {
        pages.push({ key: sl.id, node: sl.render?.(sl.steps - 1, { goTo: () => {} }) });
      }
    }
  }
  return (
    <div className="print-root fixed inset-0 overflow-auto bg-silver p-8">
      <SvgDefs />
      <div className="no-print sticky top-0 z-50 mx-auto mb-8 flex max-w-[1122px] items-center justify-between rounded-2xl bg-deep px-6 py-4 text-silver shadow-lg">
        <div>
          <div className="font-bold">Version imprimable — {pages.length} pages</div>
          <div className="text-sm opacity-80">Ctrl+P → « Enregistrer en PDF », format A4 paysage, marges : aucune.</div>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-full bg-lavender px-5 py-2 font-bold text-deep">
          <Printer className="h-5 w-5" /> Imprimer / PDF
        </button>
      </div>
      <div className="flex flex-col items-center gap-8">
        {pages.map((p) => (
          <div key={p.key} className="print-page shadow-xl">
            <div className="print-scale">{p.node}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
