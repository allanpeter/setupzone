import { ArrowRight, Flame, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BuildCard } from "@/components/build-card";
import { FeedRail } from "@/components/discovery/feed-rail";
import { ProductCardGrid } from "@/components/product-card";
import { Container, Section, SectionHeader } from "@/components/section";
import { formatBRL } from "@/lib/format";
import { getFeaturedBuilds } from "@/lib/queries/builds";
import {
  getCollectionBySlug,
  getHotProducts,
  getMostWantedProducts,
  getProductsByPriceBand,
  PRICE_BANDS,
} from "@/lib/queries/discovery";
import {
  getActiveProducts,
  getCategoriesWithCounts,
} from "@/lib/queries/products";

// The (public) layout forces dynamic rendering, so the discovery feed is always
// fresh (clicks/votes) and never prerendered at build.

const itemsToProducts = (
  collection: Awaited<ReturnType<typeof getCollectionBySlug>>,
) =>
  (collection?.items ?? [])
    .map((i) => i.product)
    .filter((p): p is NonNullable<typeof p> => !!p);

export default async function HomePage() {
  const [
    setupOfWeek,
    hot,
    mostWanted,
    achados,
    viral,
    recent,
    builds,
    categories,
  ] = await Promise.all([
    getCollectionBySlug("setup-da-semana"),
    getHotProducts(10),
    getMostWantedProducts(10),
    getCollectionBySlug("achados-tecnologicos"),
    getCollectionBySlug("viralizou"),
    getActiveProducts(10),
    getFeaturedBuilds(3),
    getCategoriesWithCounts(),
  ]);

  const featuredBuild = setupOfWeek?.items.find((i) => i.build)?.build;
  const priceBands = await Promise.all(
    PRICE_BANDS.map(async (band) => ({
      band,
      products: await getProductsByPriceBand(band, 10),
    })),
  );

  return (
    <>
      {/* ── Spotlight: Setup da semana + Em alta agora ──────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <Container className="py-10 sm:py-14">
          <p className="t-eyebrow mb-5">descubra seu próximo upgrade</p>
          <h1 className="t-display-lg mb-8 max-w-3xl">
            Pare de pesquisar.{" "}
            <span className="text-neon-gradient">Explore e monte.</span>
          </h1>

          <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
            {/* Setup da semana */}
            {featuredBuild ? (
              <Link
                href={`/montagens/${featuredBuild.slug}`}
                className="group relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-card border border-border"
              >
                {featuredBuild.coverImageUrl ? (
                  <Image
                    src={featuredBuild.coverImageUrl}
                    alt={featuredBuild.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 700px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />
                <div className="relative p-6">
                  <span className="t-eyebrow mb-3">⚡ Setup da semana</span>
                  <h2 className="t-h1 mb-2">{featuredBuild.title}</h2>
                  {featuredBuild.summary ? (
                    <p className="mb-4 max-w-xl text-sm text-ink-200">
                      {featuredBuild.summary}
                    </p>
                  ) : null}
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 rounded-pill bg-magenta-500 px-4 py-2 text-sm font-semibold text-magenta-50">
                      Ver montagem <ArrowRight className="size-4" />
                    </span>
                    {featuredBuild.budgetCents ? (
                      <span className="t-num text-accent">
                        {formatBRL(featuredBuild.budgetCents)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            ) : null}

            {/* Em alta agora — ranked ticker */}
            <div className="rounded-card border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Flame className="size-4 text-magenta-400" />
                <h2 className="font-display text-lg font-semibold">Em alta agora</h2>
              </div>
              <ol className="space-y-1">
                {hot.slice(0, 5).map((p, i) => (
                  <li key={p.id}>
                    <Link
                      href={`/produtos/${p.slug}`}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary"
                    >
                      <span className="t-num w-5 shrink-0 text-center text-accent">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                        {p.name}
                      </span>
                      <span className="t-num shrink-0 text-xs text-muted-foreground">
                        {formatBRL(p.lowestPriceCents)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Rails de descoberta ─────────────────────────────────── */}
      <FeedRail
        eyebrow="🔥 tendências"
        title="Em alta"
        subtitle="O que mais recebe cliques nos últimos 7 dias"
        action={{ label: "Ver produtos", href: "/produtos" }}
        products={hot}
        hot
      />

      <FeedRail
        eyebrow="❤ mais desejados"
        title="Mais desejados"
        subtitle="Os queridinhos da comunidade"
        action={{ label: "Ver produtos", href: "/produtos?ordenar=relevancia" }}
        products={mostWanted}
      />

      {achados ? (
        <FeedRail
          eyebrow="💎 achados"
          title={achados.title}
          subtitle={achados.subtitle ?? undefined}
          products={itemsToProducts(achados)}
        />
      ) : null}

      {viral ? (
        <FeedRail
          eyebrow="🚀 viralizou"
          title={viral.title}
          subtitle={viral.subtitle ?? undefined}
          products={itemsToProducts(viral)}
        />
      ) : null}

      <FeedRail
        eyebrow="✨ novidades"
        title="Recém-descobertos"
        subtitle="Os últimos achados adicionados ao catálogo"
        action={{ label: "Ver tudo", href: "/produtos?ordenar=novidades" }}
        products={recent}
      />

      {/* ── Faixas de preço ─────────────────────────────────────── */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="por orçamento"
          title="Melhores upgrades por faixa de preço"
        />
        <div className="space-y-2">
          {priceBands
            .filter((b) => b.products.length > 0)
            .map(({ band, products }) => (
              <details
                key={band.label}
                open
                className="group rounded-card border border-border bg-card"
              >
                <summary className="flex cursor-pointer items-center justify-between p-4 font-display font-semibold">
                  <span className="inline-flex items-center gap-2">
                    <TrendingUp className="size-4 text-accent" />
                    {band.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {products.length} itens
                  </span>
                </summary>
                <div className="border-t border-border p-4">
                  <ProductCardGrid products={products.slice(0, 4)} />
                </div>
              </details>
            ))}
        </div>
      </Section>

      {/* ── Categorias ──────────────────────────────────────────── */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="explorar"
          title="Navegue por categoria"
          action={{ label: "Ver tudo", href: "/produtos" }}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/produtos?categoria=${cat.slug}`}
              className="flex items-center justify-between rounded-card border border-border bg-card px-4 py-3.5 transition-colors hover:border-accent/40"
            >
              <span className="font-display font-semibold text-foreground">
                {cat.name}
              </span>
              <span className="t-num text-sm text-muted-foreground">
                {cat._count.products}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── Montagens ───────────────────────────────────────────── */}
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
    </>
  );
}
