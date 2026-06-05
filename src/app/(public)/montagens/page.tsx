import type { Metadata } from "next";
import { BuildCard } from "@/components/build-card";
import { Container } from "@/components/section";
import { listBuilds } from "@/lib/queries/builds";

export const metadata: Metadata = {
  title: "Montagens",
  description:
    "Setups completos prontos para montar: PC gamer, homelab, estações de trabalho e mais, com lista de peças e preços.",
};

export default async function BuildsPage() {
  const builds = await listBuilds();

  return (
    <Container className="py-12">
      <header className="mb-8">
        <p className="t-eyebrow mb-3">montagens</p>
        <h1 className="t-display-md">Setups prontos para montar</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Listas de peças curadas com orçamento, prós e contras, e links de
          compra para cada item.
        </p>
      </header>

      {builds.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {builds.map((build) => (
            <BuildCard key={build.id} build={build} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhuma montagem publicada ainda.</p>
      )}
    </Container>
  );
}
