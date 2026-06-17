import { Check, Minus, ThumbsDown, ThumbsUp, X } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { ProductCardGrid } from "@/components/product-card";
import { Container } from "@/components/section";
import { StoreBuyList, type StoreOffer } from "@/components/store-buy-list";
import { asSpecs, formatBRL } from "@/lib/format";
import { productJsonLd } from "@/lib/jsonld";
import {
  getPriceStats,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/queries/products";
import { cn } from "@/lib/utils";

const VERDICT = {
  VALE: {
    label: "Vale a pena",
    icon: ThumbsUp,
    className: "text-lime-400 border-lime-400/30 bg-lime-400/10",
  },
  NAO_VALE: {
    label: "Não vale a pena",
    icon: ThumbsDown,
    className: "text-destructive border-destructive/30 bg-destructive/10",
  },
  DEPENDE: {
    label: "Depende",
    icon: Minus,
    className: "text-accent border-accent/30 bg-accent/10",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription ?? undefined,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: product.media[0]?.url ? [{ url: product.media[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "PUBLISHED") notFound();

  const specs = asSpecs(product.specs);
  const cover = product.media[0];
  const categorySlugs = product.categories.map((c) => c.slug);
  const [related, priceStats] = await Promise.all([
    product.alternatives.length === 0
      ? getRelatedProducts(product.id, categorySlugs)
      : Promise.resolve([]),
    getPriceStats(product.id),
  ]);

  // "Alternativas": curadas se houver, senão produtos relacionados da categoria.
  const alternatives =
    product.alternatives.length > 0 ? product.alternatives : related;

  // Build store offers: join current price + affiliate link per store.
  const lowest = product.lowestPriceCents;
  const offers: StoreOffer[] = product.affiliateLinks.map((link) => {
    const price = product.prices.find((p) => p.storeId === link.storeId);
    return {
      storeSlug: link.store.slug,
      storeName: link.store.name,
      brandColor: link.store.brandColor,
      priceCents: price?.priceCents ?? null,
      isLowest: price?.priceCents != null && price.priceCents === lowest,
    };
  });
  offers.sort((a, b) => (a.priceCents ?? Infinity) - (b.priceCents ?? Infinity));

  const verdict = product.verdict ? VERDICT[product.verdict] : null;

  return (
    <Container className="py-10">
      <JsonLd
        data={productJsonLd({
          name: product.name,
          slug: product.slug,
          description: product.shortDescription,
          image: cover?.url,
          brand: product.brand?.name,
          priceCents: product.lowestPriceCents,
          offerCount: offers.length,
        })}
      />
      <Breadcrumbs
        items={[
          { name: "Produtos", path: "/produtos" },
          ...(product.categories[0]
            ? [
                {
                  name: product.categories[0].name,
                  path: `/produtos?categoria=${product.categories[0].slug}`,
                },
              ]
            : []),
          { name: product.name, path: `/produtos/${product.slug}` },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sticker border border-border bg-muted">
            {cover ? (
              <Image
                src={cover.url}
                alt={cover.alt ?? product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
            ) : null}
          </div>
          {product.media.length > 1 ? (
            <div className="grid grid-cols-4 gap-2">
              {product.media.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
                >
                  <Image src={m.url} alt={m.alt ?? ""} fill sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div>
          {product.brand ? (
            <p className="t-eyebrow mb-3">{product.brand.name}</p>
          ) : null}
          <h1 className="t-h1">{product.name}</h1>
          {product.shortDescription ? (
            <p className="mt-3 text-lg text-muted-foreground">
              {product.shortDescription}
            </p>
          ) : null}

          {/* Verdict badge (sinal rápido) */}
          {verdict ? (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-sm font-semibold",
                  verdict.className,
                )}
              >
                <verdict.icon className="size-4" />
                {verdict.label}
              </span>
              {product.verdictNote ? (
                <span className="text-sm text-muted-foreground">
                  {product.verdictNote}
                </span>
              ) : null}
            </div>
          ) : null}

          {/* Categories */}
          {product.categories.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/produtos?categoria=${c.slug}`}
                  className="rounded-pill border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          ) : null}

          {/* Para quem serve / não serve */}
          {(product.audienceFor || product.audienceNotFor) && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {product.audienceFor ? (
                <div className="rounded-card border border-border bg-card p-4">
                  <h2 className="t-eyebrow mb-2 text-lime-400">para quem serve</h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {product.audienceFor}
                  </p>
                </div>
              ) : null}
              {product.audienceNotFor ? (
                <div className="rounded-card border border-border bg-card p-4">
                  <h2 className="t-eyebrow mb-2 text-destructive">
                    para quem não serve
                  </h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {product.audienceNotFor}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Pontos positivos / negativos */}
      {(product.pros.length > 0 || product.cons.length > 0) && (
        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          {product.pros.length > 0 ? (
            <div className="rounded-sticker border border-border bg-card p-5">
              <h2 className="t-eyebrow mb-3 text-primary">pontos positivos</h2>
              <ul className="space-y-2">
                {product.pros.map((p) => (
                  <li key={p} className="flex gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {product.cons.length > 0 ? (
            <div className="rounded-sticker border border-border bg-card p-5">
              <h2 className="t-eyebrow mb-3 text-destructive">pontos negativos</h2>
              <ul className="space-y-2">
                {product.cons.map((c) => (
                  <li key={c} className="flex gap-2 text-sm">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}

      {/* Specs */}
      {specs.length > 0 ? (
        <section className="mt-14">
          <h2 className="t-h2 mb-5">Especificações</h2>
          <dl className="grid gap-x-8 gap-y-0 rounded-sticker border border-border bg-card sm:grid-cols-2">
            {specs.map((spec, i) => (
              <div
                key={spec.label}
                className="flex justify-between gap-4 border-b border-border px-5 py-3.5 last:border-b-0"
                data-row={i}
              >
                <dt className="text-sm text-muted-foreground">{spec.label}</dt>
                <dd className="text-right text-sm font-medium text-foreground">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* Description */}
      {product.description ? (
        <section className="mt-14 max-w-3xl">
          <h2 className="t-h2 mb-4">Sobre o produto</h2>
          <div className="prose-sz text-muted-foreground">{product.description}</div>
        </section>
      ) : null}

      {/* Nossa opinião */}
      {product.editorialOpinion ? (
        <section className="mt-14 max-w-3xl">
          <h2 className="t-h2 mb-4">Nossa opinião</h2>
          <div className="prose-sz text-muted-foreground">
            {product.editorialOpinion}
          </div>
        </section>
      ) : null}

      {/* Vale a pena? */}
      {verdict ? (
        <section className="mt-14 max-w-3xl">
          <h2 className="t-h2 mb-4">Vale a pena?</h2>
          <div
            className={cn(
              "flex items-start gap-3 rounded-sticker border p-5",
              verdict.className,
            )}
          >
            <verdict.icon className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-display text-lg font-bold">{verdict.label}</p>
              {product.verdictNote ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {product.verdictNote}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Comprar em (após o editorial) */}
      <section className="mt-14 max-w-3xl">
        <h2 className="t-h2 mb-4">Onde comprar</h2>
        <StoreBuyList productSlug={product.slug} offers={offers} />
        {priceStats.lowestEverCents != null ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Menor preço registrado:{" "}
            <span className="t-num text-accent">
              {formatBRL(priceStats.lowestEverCents)}
            </span>
            {priceStats.points > 1 ? ` · ${priceStats.points} registros` : null}
          </p>
        ) : null}
      </section>

      {/* Alternativas */}
      {alternatives.length > 0 ? (
        <section className="mt-16">
          <h2 className="t-h2 mb-6">Alternativas</h2>
          <ProductCardGrid products={alternatives} />
        </section>
      ) : null}
    </Container>
  );
}
