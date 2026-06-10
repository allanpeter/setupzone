"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * "Quero" — anonymous upvote. Optimistic; posts to /api/produtos/<slug>/vote.
 * Sits above a card's link overlay (z-20) and stops propagation so a click
 * votes instead of navigating.
 */
export function VoteButton({
  slug,
  initialCount,
  className,
}: {
  slug: string;
  initialCount: number;
  className?: string;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [pending, setPending] = useState(false);

  async function vote(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (voted || pending) return;
    setPending(true);
    setCount((c) => c + 1); // optimistic
    setVoted(true);
    try {
      const res = await fetch(`/api/produtos/${slug}/vote`, { method: "POST" });
      const data = await res.json();
      if (typeof data.voteCount === "number") setCount(data.voteCount);
    } catch {
      setCount((c) => c - 1);
      setVoted(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={vote}
      aria-pressed={voted}
      aria-label="Quero este produto"
      className={cn(
        "relative z-20 inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-semibold backdrop-blur transition-all",
        voted
          ? "border-magenta-500/60 bg-magenta-500/20 text-magenta-300"
          : "border-border bg-background/70 text-muted-foreground hover:border-magenta-500/50 hover:text-foreground",
        className,
      )}
    >
      <Heart className={cn("size-3.5", voted && "fill-magenta-400 text-magenta-400")} />
      <span className="t-num">{count}</span>
    </button>
  );
}
