import { ArrowRight, GitCompare } from "lucide-react";
import Link from "next/link";
import { BuildCard } from "@/components/build-card";
import { ProductCardGrid } from "@/components/product-card";
import { Container, Section, SectionHeader } from "@/components/section";
import { Button } from "@/components/ui/button";
import { getFeaturedBuilds } from "@/lib/queries/builds";
import {
  getCategoriesWithCounts,
  getFeaturedProducts,
  getTrendingProducts,
} from "@/lib/queries/products";

const heroStats = [
  { value: "+500", label: "produtos" },
  { value: "+120", label: "montagens" },
  { value: "04", label: "lojas" },
  { value: "+50", label: "comparativos" },
];

export default async function HomePage() {
  const [featured, trending, builds, categories] = await Promise.all([
    getFeaturedProducts(4),
    getTrendingProducts(8),
    getFeaturedBuilds(3),
    getCategoriesWithCounts(),
  ]);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Container className="py-16 sm:py-24">
          <p className="t-eyebrow mb-5">listas abertas · sem ranking pago</p>
          <h1 className="t-display-xl max-w-4xl">
            Pare de pesquisar.{" "}
            <span className="relative whitespace-nowrap text-primary">
              Monte direto.
              <span className="absolute inset-x-0 bottom-1.5 -z-10 h-2.5 rounded bg-accent" />
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Setups completos de PC Gamer, Homelab, impressoras 3D, drones e
            gadgets — com listas de peças curadas, preços comparados entre
            AliExpress, Mercado Livre, Shopee e Amazon, e guias de montagem.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button variant="brand" size="xl" render={<Link href="/montagens" />}>
              Explorar montagens
              <ArrowRight />
            </Button>
            <Button variant="outline" size="xl" render={<Link href="/comparar" />}>
              <GitCompare />
              Ver comparativos
            </Button>
          </div>

          <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-sticker border border-border bg-card p-4 shadow-sticker-1"
              >
                <dd className="t-num text-2xl text-foreground">{stat.value}</dd>
                <dt className="mt-1 text-xs text-muted-foreground">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ── Categorias ───────────────────────────────────────── */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="categorias"
          title="Explore por categoria"
          action={{ label: "Ver tudo", href: "/produtos" }}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/produtos?categoria=${cat.slug}`}
              className="flex items-center justify-between rounded-sticker border border-border bg-card px-4 py-3.5 shadow-sticker-1 transition-colors hover:border-primary/40"
            >
              <span className="font-display text-base font-bold text-foreground">
                {cat.name}
              </span>
              <span className="t-num text-sm text-muted-foreground">
                {cat._count.products}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── Em destaque ──────────────────────────────────────── */}
      {featured.length > 0 ? (
        <Section className="border-t border-border">
          <SectionHeader
            eyebrow="seleção do editor"
            title="Produtos em destaque"
            action={{ label: "Ver produtos", href: "/produtos" }}
          />
          <ProductCardGrid products={featured} />
        </Section>
      ) : null}

      {/* ── Montagens ────────────────────────────────────────── */}
      {builds.length > 0 ? (
        <Section className="border-t border-border">
          <SectionHeader
            eyebrow="montagens"
            title="Setups prontos para montar"
            action={{ label: "Ver montagens", href: "/montagens" }}
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {builds.map((build) => (
              <BuildCard key={build.id} build={build} />
            ))}
          </div>
        </Section>
      ) : null}

      {/* ── Em alta ──────────────────────────────────────────── */}
      {trending.length > 0 ? (
        <Section className="border-t border-border">
          <SectionHeader
            eyebrow="tendências"
            title="Em alta agora"
            action={{ label: "Ver produtos", href: "/produtos?ordenar=novidades" }}
          />
          <ProductCardGrid products={trending} />
        </Section>
      ) : null}
    </>
  );
}
