import { ArrowDownRight, ArrowUpRight, Check, Tag, Target, X } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BuildDifficultyBadge } from "@/components/build-difficulty-badge";
import { JsonLd } from "@/components/json-ld";
import { Container } from "@/components/section";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/format";
import { buildJsonLd } from "@/lib/jsonld";
import { getBuildBySlug } from "@/lib/queries/builds";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const build = await getBuildBySlug(slug);
  if (!build) return {};
  return {
    title: build.title,
    description: build.summary ?? undefined,
    openGraph: {
      title: build.title,
      description: build.summary ?? undefined,
      images: build.coverImageUrl ? [{ url: build.coverImageUrl }] : undefined,
    },
    twitter: {
      title: build.title,
      description: build.summary ?? undefined,
      images: build.coverImageUrl ? [build.coverImageUrl] : undefined,
    },
  };
}

export default async function BuildPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const build = await getBuildBySlug(slug);
  if (!build || build.status !== "PUBLISHED") notFound();

  const estimatedTotal = build.items.reduce(
    (sum, item) => sum + (item.product.lowestPriceCents ?? 0) * item.quantity,
    0,
  );

  return (
    <Container className="py-10">
      <JsonLd
        data={buildJsonLd({
          title: build.title,
          slug: build.slug,
          summary: build.summary,
          image: build.coverImageUrl,
          estimatedTotalCents: estimatedTotal,
          items: build.items.map((i) => ({
            name: i.product.name,
            slug: i.product.slug,
          })),
        })}
      />
      <Breadcrumbs
        items={[
          { name: "Montagens", path: "/montagens" },
          { name: build.title, path: `/montagens/${build.slug}` },
        ]}
      />

      {/* Header */}
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {build.category ? (
              <span className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <Tag className="size-3.5" />
                {build.category}
              </span>
            ) : null}
            {build.difficulty ? (
              <BuildDifficultyBadge difficulty={build.difficulty} />
            ) : null}
          </div>
          <h1 className="t-display-md mt-4">{build.title}</h1>
          {build.summary ? (
            <p className="mt-4 text-lg text-muted-foreground">{build.summary}</p>
          ) : null}

          {/* Objetivo */}
          {build.objective ? (
            <div className="mt-6 flex gap-3 rounded-sticker border border-border bg-card p-5">
              <Target className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <h2 className="t-eyebrow mb-1 text-accent">objetivo</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {build.objective}
                </p>
              </div>
            </div>
          ) : null}

          {/* Orçamento vs custo estimado */}
          <div className="mt-6 flex flex-wrap gap-3">
            {build.budgetCents ? (
              <div className="rounded-sticker border border-border bg-card px-5 py-3 shadow-sticker-1">
                <span className="block text-xs text-muted-foreground">
                  orçamento alvo
                </span>
                <span className="t-num text-xl text-foreground">
                  {formatBRL(build.budgetCents)}
                </span>
              </div>
            ) : null}
            <div className="rounded-sticker border border-border bg-card px-5 py-3 shadow-sticker-1">
              <span className="block text-xs text-muted-foreground">
                custo estimado
              </span>
              <span className="t-num text-xl text-primary">
                {formatBRL(estimatedTotal)}
              </span>
            </div>
          </div>
        </div>
        {build.coverImageUrl ? (
          <div className="relative aspect-[16/10] overflow-hidden rounded-sticker border border-border bg-muted">
            <Image
              src={build.coverImageUrl}
              alt={build.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 460px"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>

      {/* Pros / cons */}
      {(build.pros.length > 0 || build.cons.length > 0) && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {build.pros.length > 0 ? (
            <div className="rounded-sticker border border-border bg-card p-5">
              <h2 className="t-eyebrow mb-3 text-primary">prós</h2>
              <ul className="space-y-2">
                {build.pros.map((p) => (
                  <li key={p} className="flex gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {build.cons.length > 0 ? (
            <div className="rounded-sticker border border-border bg-card p-5">
              <h2 className="t-eyebrow mb-3 text-destructive">contras</h2>
              <ul className="space-y-2">
                {build.cons.map((c) => (
                  <li key={c} className="flex gap-2 text-sm">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {/* Description */}
      {build.description ? (
        <div className="prose-sz mt-10 max-w-3xl text-muted-foreground">
          {build.description}
        </div>
      ) : null}

      {/* Items */}
      <section className="mt-12">
        <h2 className="t-h2 mb-5">Lista de peças</h2>
        <ul className="space-y-3">
          {build.items.map((item) => {
            const cover = item.product.media[0];
            const primaryLink =
              item.product.affiliateLinks.find((l) => l.isPrimary) ??
              item.product.affiliateLinks[0];
            const hasAlternatives =
              item.budgetAlternative || item.premiumAlternative;
            return (
              <li
                key={item.id}
                className="rounded-sticker border border-border bg-card p-3 shadow-sticker-1"
              >
                <div className="flex items-center gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {cover ? (
                      <Image
                        src={cover.url}
                        alt={cover.alt ?? item.product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    {item.role ? (
                      <span className="t-eyebrow bg-transparent p-0 text-muted-foreground">
                        {item.role}
                        {item.quantity > 1 ? ` · ${item.quantity}x` : ""}
                      </span>
                    ) : null}
                    <Link
                      href={`/produtos/${item.product.slug}`}
                      className="block truncate font-display font-bold text-foreground hover:text-primary"
                    >
                      {item.product.name}
                    </Link>
                    {item.note ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {item.note}
                      </p>
                    ) : null}
                  </div>
                  <span className="t-num hidden text-base text-foreground sm:block">
                    {formatBRL(item.product.lowestPriceCents)}
                  </span>
                  {primaryLink ? (
                    <Button
                      variant="outline"
                      size="sm"
                      render={
                        <a
                          href={`/go/${item.product.slug}/${primaryLink.store.slug}`}
                          rel="nofollow sponsored noopener"
                          target="_blank"
                        />
                      }
                    >
                      Comprar
                    </Button>
                  ) : null}
                </div>

                {/* Alternativas mais barata / premium */}
                {hasAlternatives ? (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                    {item.budgetAlternative ? (
                      <Link
                        href={`/produtos/${item.budgetAlternative.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-pill border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-xs text-lime-400 hover:border-lime-400/60"
                      >
                        <ArrowDownRight className="size-3.5" />
                        Mais barata: {item.budgetAlternative.name}
                        <span className="t-num">
                          {formatBRL(item.budgetAlternative.lowestPriceCents)}
                        </span>
                      </Link>
                    ) : null}
                    {item.premiumAlternative ? (
                      <Link
                        href={`/produtos/${item.premiumAlternative.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-pill border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent hover:border-accent/60"
                      >
                        <ArrowUpRight className="size-3.5" />
                        Premium: {item.premiumAlternative.name}
                        <span className="t-num">
                          {formatBRL(item.premiumAlternative.lowestPriceCents)}
                        </span>
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Observações */}
      {build.observations ? (
        <section className="mt-12 max-w-3xl">
          <h2 className="t-h2 mb-4">Observações</h2>
          <div className="prose-sz text-muted-foreground">{build.observations}</div>
        </section>
      ) : null}

      {/* Conclusão */}
      {build.conclusion ? (
        <section className="mt-12 max-w-3xl">
          <h2 className="t-h2 mb-4">Conclusão</h2>
          <div className="prose-sz text-muted-foreground">{build.conclusion}</div>
        </section>
      ) : null}
    </Container>
  );
}
