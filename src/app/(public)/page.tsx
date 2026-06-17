import { ArrowRight, GitCompare, Layers, Newspaper } from "lucide-react";
import Link from "next/link";
import { BuildCard } from "@/components/build-card";
import { EmptyState } from "@/components/empty-state";
import { HubCard } from "@/components/hub-card";
import { PostCard } from "@/components/post-card";
import { ProductCardGrid } from "@/components/product-card";
import { Container, Section, SectionHeader } from "@/components/section";
import { Button } from "@/components/ui/button";
import { hubs } from "@/lib/hubs";
import { listPosts } from "@/lib/queries/blog";
import { getFeaturedBuilds } from "@/lib/queries/builds";
import { listComparisons } from "@/lib/queries/comparisons";
import { getFeaturedProducts } from "@/lib/queries/products";

// The (public) layout forces dynamic rendering, so a montagem/guia recém-publicada
// aparece sem precisar de rebuild.

export default async function HomePage() {
  const [builds, posts, comparisons, products] = await Promise.all([
    getFeaturedBuilds(6),
    listPosts(),
    listComparisons(),
    getFeaturedProducts(8),
  ]);

  const recentPosts = posts.slice(0, 3);
  const recentComparisons = comparisons.slice(0, 4);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <Container className="relative py-16 sm:py-24">
          <p className="t-eyebrow mb-5">homelab · infra · setup dev · ia local</p>
          <h1 className="t-display-lg max-w-3xl">
            Monte seu setup sem{" "}
            <span className="text-neon-gradient">comprar peça errada.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Guias, comparativos e recomendações para homelab, infraestrutura,
            produtividade, IA local e gadgets — explicados por quem realmente usa.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="brand" render={<Link href="/montagens" />}>
              Ver Setups <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" render={<Link href="/blog" />}>
              Explorar Guias
            </Button>
          </div>
        </Container>
      </section>

      {/* ── Comece por aqui ──────────────────────────────────────── */}
      <Section id="comece-por-aqui">
        <SectionHeader
          eyebrow="comece por aqui"
          title="Por onde você quer começar?"
          description="Escolha um tema e veja montagens, guias e recomendações selecionados."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {hubs.map((hub) => (
            <HubCard key={hub.slug} hub={hub} />
          ))}
        </div>
      </Section>

      {/* ── Setups recomendados ──────────────────────────────────── */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="montagens"
          title="Setups recomendados"
          description="Listas de peças completas, com alternativas mais baratas e premium."
          action={builds.length > 0 ? { label: "Ver todas as montagens", href: "/montagens" } : undefined}
        />
        {builds.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {builds.map((build) => (
              <BuildCard key={build.id} build={build} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Layers}
            title="As primeiras montagens estão a caminho"
            description="Estamos preparando setups completos de homelab, estação de dev e servidor de IA local. Enquanto isso, explore os guias."
            action={{ label: "Ler os guias", href: "/blog" }}
          />
        )}
      </Section>

      {/* ── Guias e comparativos ─────────────────────────────────── */}
      <Section className="border-t border-border">
        <SectionHeader
          eyebrow="conteúdo"
          title="Guias e comparativos"
          description="Pesquisa aprofundada para você decidir com segurança antes de comprar."
          action={posts.length > 0 ? { label: "Ver todos os guias", href: "/blog" } : undefined}
        />
        {recentPosts.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Newspaper}
            title="Guias em produção"
            description="Conteúdo aprofundado sobre homelab, IA local e produtividade está sendo escrito."
          />
        )}

        {recentComparisons.length > 0 ? (
          <div className="mt-8">
            <h3 className="t-eyebrow mb-4">comparativos recentes</h3>
            <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
              {recentComparisons.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/comparar/${c.slug}`}
                    className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-secondary"
                  >
                    <GitCompare className="size-4 shrink-0 text-accent" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display font-semibold text-foreground">
                        {c.title}
                      </span>
                      {c.summary ? (
                        <span className="block truncate text-sm text-muted-foreground">
                          {c.summary}
                        </span>
                      ) : null}
                    </span>
                    <span className="t-num shrink-0 text-xs text-muted-foreground">
                      {c._count.items} itens
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      {/* ── Produtos (posição secundária) ────────────────────────── */}
      {products.length > 0 ? (
        <Section className="border-t border-border">
          <SectionHeader
            eyebrow="catálogo"
            title="Produtos em destaque"
            description="As peças que mais recomendamos nas nossas montagens."
            action={{ label: "Ver catálogo", href: "/produtos" }}
          />
          <ProductCardGrid products={products} />
        </Section>
      ) : null}
    </>
  );
}
