import { createFileRoute } from "@tanstack/react-router";
import { Presentation } from "@/deck/Presentation";
import { PrintDeck } from "@/deck/PrintDeck";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    "print-pdf": "print-pdf" in search ? true : undefined,
    s: typeof search.s === "string" ? search.s : typeof search.s === "number" ? String(search.s) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Marketing & RH — Lina Cosmétiques | Exposés 4.2 & 4.3" },
      { name: "description", content: "Présentation interactive : les fonctions Marketing et Ressources humaines de l'entreprise, racontées avec Lina Cosmétiques." },
      { property: "og:title", content: "Marketing & RH — Lina Cosmétiques" },
      { property: "og:description", content: "Présentation interactive des fonctions Marketing et RH : ville-entreprise, camion-roadmap et scénarios à choix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const search = Route.useSearch();
  return search["print-pdf"] ? <PrintDeck /> : <Presentation />;
}
