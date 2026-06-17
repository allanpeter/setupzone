import { Layers } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BuildCard } from "@/components/build-card";
import { EmptyState } from "@/components/empty-state";
import { Container } from "@/components/section";
import { listBuilds } from "@/lib/queries/builds";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Montagens",
  description:
    "Setups completos prontos para montar: homelab, estação de dev, servidor de IA local e mais — com objetivo, dificuldade, lista de peças e alternativas.",
};

export default async function BuildsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const builds = await listBuilds();

  // Categorias editoriais presentes (esconde as vazias).
  const categories = [
    ...new Set(builds.map((b) => b.category).filter((c): c is string => !!c)),
  ].sort();

  const filtered = categoria
    ? builds.filter((b) => b.category === categoria)
    : builds;

  return (
    <Container className="py-12">
      <header className="mb-8">
        <p className="t-eyebrow mb-3">montagens</p>
        <h1 className="t-display-md">Setups reais, peça por peça</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Cada montagem traz objetivo, nível de dificuldade, orçamento, lista de
          peças e alternativas mais baratas ou premium.
        </p>
      </header>

      {categories.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/montagens"
            className={cn(
              "rounded-pill border border-border px-4 py-1.5 text-sm transition-colors hover:border-accent/50",
              !categoria
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground",
            )}
          >
            Todas
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/montagens?categoria=${encodeURIComponent(cat)}`}
              className={cn(
                "rounded-pill border border-border px-4 py-1.5 text-sm transition-colors hover:border-accent/50",
                categoria === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground",
              )}
            >
              {cat}
            </Link>
          ))}
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((build) => (
            <BuildCard key={build.id} build={build} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title={
            categoria
              ? "Nenhuma montagem nesta categoria ainda"
              : "As primeiras montagens estão a caminho"
          }
          description="Estamos preparando setups completos de homelab, estação de dev e servidor de IA local."
          action={
            categoria
              ? { label: "Ver todas as montagens", href: "/montagens" }
              : { label: "Ler os guias", href: "/blog" }
          }
        />
      )}
    </Container>
  );
}
