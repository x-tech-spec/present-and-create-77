import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Presentation } from "@/deck/Presentation";
import { PrintDeck } from "@/deck/PrintDeck";

export const Route = createFileRoute("/")({
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
  const [print, setPrint] = useState<boolean | null>(null);
  useEffect(() => setPrint(new URLSearchParams(window.location.search).has("print-pdf")), []);
  if (print === null) return <div className="fixed inset-0 bg-paper" />;
  return print ? <PrintDeck /> : <Presentation />;
}
