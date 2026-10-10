<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- The deck lives in `src/deck/`: `slides.tsx` is the single slide registry (sections → slides with step counts), `scenarios.ts` holds scenario dialogue data. Why: one source feeds both the live presentation and the print/PDF export.
- Slides render on a fixed 1920×1080 canvas scaled to fit (`ScaledSlide`). Why: identical rendering on any projector.
- Scenario dialogue text in `scenarios.ts` is copied verbatim from the user's scripts and must never be paraphrased. Why: hard user requirement.
- The current slide is encoded in the URL hash (`#1.3`), not search params. Why: the router re-serializes search params as JSON.
- `?print-pdf` renders every step of every slide as one A4 landscape page. Why: required step-by-step PDF export.
