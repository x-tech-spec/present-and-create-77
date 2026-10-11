import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Presentation } from "@/deck/Presentation";
import { PrintDeck } from "@/deck/PrintDeck";
import { QuizHost } from "@/deck/QuizHost";
import { QuizPlayer } from "@/deck/QuizPlayer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Marketing & RH — Lina Cosmétiques | Exposés 4.2 & 4.3" },
      { name: "description", content: "Présentation interactive et Bus Quizz en direct : les fonctions Marketing et Ressources humaines de l'entreprise racontées avec Lina Cosmétiques." },
      { property: "og:title", content: "Marketing & RH — Lina Cosmétiques" },
      { property: "og:description", content: "Présentation interactive des fonctions Marketing et RH : ville-entreprise, camion-roadmap, scénarios à choix et Bus Quizz interactif." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [mode, setMode] = useState<"presentation" | "print" | "host" | "player" | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("print-pdf")) {
      setMode("print");
    } else if (params.get("mode") === "host") {
      setMode("host");
    } else if (params.get("mode") === "player") {
      setMode("player");
    } else {
      setMode("presentation");
    }
  }, []);

  if (mode === null) return <div className="fixed inset-0 bg-paper" />;
  if (mode === "print") return <PrintDeck />;
  if (mode === "host") return <QuizHost />;
  if (mode === "player") return <QuizPlayer />;
  return <Presentation />;
}
