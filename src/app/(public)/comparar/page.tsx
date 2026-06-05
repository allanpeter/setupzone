import { GitCompare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/section";
import { listComparisons } from "@/lib/queries/comparisons";

export const metadata: Metadata = {
  title: "Comparativos",
  description:
    "Comparativos lado a lado de produtos de tecnologia: mini PCs, SSDs, roteadores e mais.",
};

export default async function ComparisonsPage() {
  const comparisons = await listComparisons();

  return (
    <Container className="py-12">
      <header className="mb-8">
        <p className="t-eyebrow mb-3">comparativos</p>
        <h1 className="t-display-md">Comparativos</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Especificações lado a lado, prós e contras, e uma recomendação clara.
        </p>
      </header>

      {comparisons.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-sticker border border-border bg-card">
          {comparisons.map((c) => (
            <li key={c.id}>
              <Link
                href={`/comparar/${c.slug}`}
                className="flex items-center gap-4 p-5 transition-colors hover:bg-muted/50"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                  <GitCompare className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display font-bold text-foreground">
                    {c.title}
                  </h2>
                  {c.summary ? (
                    <p className="truncate text-sm text-muted-foreground">
                      {c.summary}
                    </p>
                  ) : null}
                </div>
                <span className="t-num shrink-0 text-sm text-muted-foreground">
                  {c._count.items} itens
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">Nenhum comparativo publicado ainda.</p>
      )}
    </Container>
  );
}
