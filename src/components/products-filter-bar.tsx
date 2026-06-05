"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

type Option = { slug: string; name: string };

const sorts = [
  { value: "relevancia", label: "Relevância" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "novidades", label: "Novidades" },
];

export function ProductsFilterBar({
  categories,
  brands,
}: {
  categories: Option[];
  brands: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const activeCategory = params.get("categoria") ?? "";
  const activeBrand = params.get("marca") ?? "";
  const activeSort = params.get("ordenar") ?? "relevancia";

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("pagina"); // reset pagination on filter change
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  return (
    <div className="space-y-4">
      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setParam("categoria", "")}
          className={cn(
            "rounded-pill border px-3.5 py-1.5 text-sm font-medium transition-colors",
            activeCategory === ""
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setParam("categoria", c.slug)}
            className={cn(
              "rounded-pill border px-3.5 py-1.5 text-sm font-medium transition-colors",
              activeCategory === c.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Brand + sort selects */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={activeBrand}
          onChange={(e) => setParam("marca", e.target.value)}
          className="h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground"
          aria-label="Filtrar por marca"
        >
          <option value="">Todas as marcas</option>
          {brands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={activeSort}
          onChange={(e) => setParam("ordenar", e.target.value)}
          className="ml-auto h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground"
          aria-label="Ordenar"
        >
          {sorts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
