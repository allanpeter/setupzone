import { Check, Trophy, X } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/section";
import { Button } from "@/components/ui/button";
import { asSpecs, formatBRL } from "@/lib/format";
import { getComparisonBySlug } from "@/lib/queries/comparisons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comparison = await getComparisonBySlug(slug);
  if (!comparison) return {};
  return {
    title: comparison.title,
    description: comparison.summary ?? undefined,
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comparison = await getComparisonBySlug(slug);
  if (!comparison || comparison.status !== "PUBLISHED") notFound();

  const items = comparison.items;
  // Union of spec labels across all products, preserving first-seen order.
  const specMaps = items.map((it) => {
    const map = new Map<string, string>();
    for (const s of asSpecs(it.product.specs)) map.set(s.label, s.value);
    return map;
  });
  const specLabels: string[] = [];
  for (const map of specMaps) {
    for (const label of map.keys()) {
      if (!specLabels.includes(label)) specLabels.push(label);
    }
  }

  return (
    <Container className="py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/comparar" className="hover:text-foreground">
          Comparativos
        </Link>
      </nav>

      <header className="mb-8 max-w-3xl">
        <h1 className="t-display-md">{comparison.title}</h1>
        {comparison.summary ? (
          <p className="mt-3 text-lg text-muted-foreground">{comparison.summary}</p>
        ) : null}
      </header>

      {/* Verdict */}
      {comparison.verdict ? (
        <div className="mb-8 flex gap-3 rounded-sticker border border-primary/30 bg-primary/5 p-5">
          <Trophy className="size-5 shrink-0 text-primary" />
          <div>
            <p className="t-eyebrow mb-1 text-primary">recomendação</p>
            <p className="text-foreground">{comparison.verdict}</p>
          </div>
        </div>
      ) : null}

      {/* Side-by-side table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="w-40 p-3 text-left align-bottom" />
              {items.map((it) => {
                const cover = it.product.media[0];
                return (
                  <th key={it.id} className="p-3 align-bottom">
                    <Link
                      href={`/produtos/${it.product.slug}`}
                      className="block space-y-2"
                    >
                      <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-md border border-border bg-muted">
                        {cover ? (
                          <Image
                            src={cover.url}
                            alt={cover.alt ?? it.product.name}
                            fill
                            sizes="240px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <span className="block text-left font-display text-sm font-bold leading-snug text-foreground hover:text-primary">
                        {it.product.name}
                      </span>
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Price row */}
            <tr>
              <td className="border-t border-border p-3 text-sm text-muted-foreground">
                Preço
              </td>
              {items.map((it) => (
                <td
                  key={it.id}
                  className="t-num border-t border-border p-3 text-center text-base text-foreground"
                >
                  {formatBRL(it.product.lowestPriceCents)}
                </td>
              ))}
            </tr>

            {/* Spec rows */}
            {specLabels.map((label) => (
              <tr key={label}>
                <td className="border-t border-border p-3 text-sm text-muted-foreground">
                  {label}
                </td>
                {specMaps.map((map, i) => (
                  <td
                    key={items[i]!.id}
                    className="border-t border-border p-3 text-center text-sm text-foreground"
                  >
                    {map.get(label) ?? "—"}
                  </td>
                ))}
              </tr>
            ))}

            {/* Pros */}
            <tr>
              <td className="border-t border-border p-3 align-top text-sm text-muted-foreground">
                Prós
              </td>
              {items.map((it) => (
                <td key={it.id} className="border-t border-border p-3 align-top">
                  <ul className="space-y-1.5 text-left">
                    {it.pros.map((p) => (
                      <li key={p} className="flex gap-1.5 text-xs">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Cons */}
            <tr>
              <td className="border-t border-border p-3 align-top text-sm text-muted-foreground">
                Contras
              </td>
              {items.map((it) => (
                <td key={it.id} className="border-t border-border p-3 align-top">
                  <ul className="space-y-1.5 text-left">
                    {it.cons.map((c) => (
                      <li key={c} className="flex gap-1.5 text-xs">
                        <X className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* CTA */}
            <tr>
              <td className="border-t border-border p-3" />
              {items.map((it) => (
                <td key={it.id} className="border-t border-border p-3 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/produtos/${it.product.slug}`} />}
                  >
                    Ver produto
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Container>
  );
}
