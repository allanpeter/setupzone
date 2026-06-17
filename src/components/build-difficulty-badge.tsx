import { Signal } from "lucide-react";
import { cn } from "@/lib/utils";

type Difficulty = "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";

const LABELS: Record<Difficulty, string> = {
  INICIANTE: "Iniciante",
  INTERMEDIARIO: "Intermediário",
  AVANCADO: "Avançado",
};

const STYLES: Record<Difficulty, string> = {
  INICIANTE: "text-lime-400 border-lime-400/30 bg-lime-400/10",
  INTERMEDIARIO: "text-accent border-accent/30 bg-accent/10",
  AVANCADO: "text-magenta-400 border-magenta-400/30 bg-magenta-400/10",
};

/** Selo de dificuldade da montagem. */
export function BuildDifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-xs font-medium",
        STYLES[difficulty],
        className,
      )}
    >
      <Signal className="size-3.5" />
      {LABELS[difficulty]}
    </span>
  );
}
