import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/jsonld";

export type Crumb = { name: string; path: string };

/**
 * Trilha de navegação reutilizável. Emite também o BreadcrumbList JSON-LD
 * (SEO) a partir dos mesmos itens. O último item é o atual (sem link).
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Trilha de navegação"
      className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
    >
      <JsonLd data={breadcrumbJsonLd(items)} />
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.path} className="inline-flex items-center gap-1.5">
            {i > 0 ? <ChevronRight className="size-3.5 opacity-50" /> : null}
            {isLast ? (
              <span className="text-foreground">{item.name}</span>
            ) : (
              <Link href={item.path} className="hover:text-foreground">
                {item.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
