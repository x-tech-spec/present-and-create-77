import { Printer, CheckCircle2 } from "lucide-react";
import { SECTIONS, SlideFrame } from "./slides";
import { ScenarioScene } from "./Scenario";
import { allFrames } from "./scenarios";
import { SvgDefs, Character } from "./Characters";
import { QUIZ_QUESTIONS } from "./quizData";

/** Version imprimable : contenu complet par diapo (sans étapes intermédiaires démultipliées), scénarios étape par étape, et quiz corrigé complet. */
export function PrintDeck() {
  const pages: { key: string; title: string; node: React.ReactNode }[] = [];

  for (const sec of SECTIONS) {
    for (const sl of sec.slides) {
      if (sl.scenario) {
        // Scénarios : conservation de toutes les frames étape par étape
        const frames = allFrames(sl.scenario);
        frames.forEach((f, i) => {
          pages.push({
            key: `${sl.id}-frame-${i}`,
            title: `${sl.title} (${i + 1}/${frames.length})`,
            node: <ScenarioScene sc={sl.scenario!} frame={f} interactive={false} />,
          });
        });
      } else {
        // Diapositives classiques : uniquement le contenu complet final (pas d'étapes intermédiaires)
        const finalStep = Math.max(0, sl.steps - 1);
        pages.push({
          key: `${sl.id}-complete`,
          title: sl.title,
          node: sl.render?.(finalStep, { goTo: () => {} }),
        });
      }
    }
  }

  // Intégration du Quiz corrigé complet dans le PDF (les 7 questions officielles)
  QUIZ_QUESTIONS.forEach((q) => {
    pages.push({
      key: `quiz-corrige-q${q.id}`,
      title: `Quiz Corrigé — Q${q.id} (${q.buildingLabel})`,
      node: (
        <SlideFrame
          fn={q.buildingTheme === "lavender" ? "mk" : q.buildingTheme === "cosmic" ? "rh" : "neutral"}
          kicker={`Quiz corrigé · ${q.buildingLabel}`}
          title={`Question ${q.id}/7 : ${q.question}`}
          id={`3.Q${q.id}`}
        >
          <div className="flex h-full flex-col justify-between">
            <div className="grid grid-cols-2 gap-6 my-auto">
              {q.options.map((opt) => {
                const isCorrect = opt.letter === q.correctLetter;
                return (
                  <div
                    key={opt.letter}
                    className={`flex items-center justify-between gap-4 rounded-3xl p-6 border-2 transition ${
                      isCorrect
                        ? "bg-cosmic text-silver border-cosmic shadow-xl"
                        : "bg-silver/50 text-deep/80 border-deep/15"
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <span
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-black ${
                          isCorrect ? "bg-silver text-cosmic" : "bg-deep text-silver"
                        }`}
                      >
                        {opt.letter}
                      </span>
                      <span className="slide-body-lg font-bold leading-snug">
                        {opt.text}
                      </span>
                    </div>
                    {isCorrect && <CheckCircle2 className="h-8 w-8 text-silver shrink-0" />}
                  </div>
                );
              })}
            </div>

            <div className="rounded-3xl border-2 border-cosmic/30 bg-silver/60 p-6 flex items-center gap-6 mt-4">
              <div className="shrink-0 -my-6 scale-90">
                <Character id={q.characterId} size={140} label={false} />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-wider text-cosmic">
                  Explication — {q.characterName}
                </div>
                <p className="slide-body font-bold text-deep mt-1 leading-snug">
                  {q.explanation}
                </p>
              </div>
            </div>
          </div>
        </SlideFrame>
      ),
    });
  });

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
