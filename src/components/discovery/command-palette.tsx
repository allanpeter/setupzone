"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SearchResult } from "@/lib/search";
import { cn } from "@/lib/utils";

const typeLabel: Record<string, string> = {
  produto: "Produto",
  montagem: "Montagem",
  blog: "Blog",
};

/**
 * ⌘K / Ctrl+K command palette. Reuses the full-text search via /api/busca.
 * The trigger is rendered in the nav; this component owns the overlay + state.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global ⌘K / Ctrl+K + "/" shortcut, and a custom event from the nav button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("setupzone:open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("setupzone:open-search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => window.clearTimeout(id);
    }
    // Defer the reset so it isn't a synchronous setState in the effect body.
    const id = window.setTimeout(() => {
      setQuery("");
      setResults([]);
      setActive(0);
    }, 0);
    return () => window.clearTimeout(id);
  }, [open]);

  // Debounced search. All state updates live inside the async timeout callback
  // (never synchronously in the effect body).
  useEffect(() => {
    const q = query.trim();
    const t = setTimeout(async () => {
      if (q.length < 2) {
        setResults([]);
        setActive(0);
        return;
      }
      try {
        const res = await fetch(`/api/busca?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setActive(0);
      } catch {
        setResults([]);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [query]);

  const go = useCallback(
    (r: SearchResult) => {
      setOpen(false);
      router.push(r.href);
    },
    [router],
  );

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-ink-950/70 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-card border border-border bg-popover shadow-glow-magenta"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Buscar produtos, montagens, guias…"
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {query.trim().length >= 2 && results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Nada encontrado para “{query}”.
            </p>
          ) : null}
          {results.map((r, i) => (
            <button
              key={`${r.type}-${r.slug}`}
              type="button"
              onClick={() => go(r)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                i === active ? "bg-secondary" : "hover:bg-secondary/60",
              )}
            >
              <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                {typeLabel[r.type]}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {r.title}
              </span>
            </button>
          ))}
          {query.trim().length < 2 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Digite para explorar o catálogo.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
