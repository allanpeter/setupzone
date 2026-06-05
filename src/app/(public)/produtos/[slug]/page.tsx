import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ProductCardGrid } from "@/components/product-card";
import { Container } from "@/components/section";
import { StoreBuyList, type StoreOffer } from "@/components/store-buy-list";
import { asSpecs } from "@/lib/format";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/jsonld";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";

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
  const related = await getRelatedProducts(product.id, categorySlugs);

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

  return (
    <Container className="py-10">
      <JsonLd
        data={[
          productJsonLd({
            name: product.name,
            slug: product.slug,
            description: product.shortDescription,
            image: cover?.url,
            brand: product.brand?.name,
            priceCents: product.lowestPriceCents,
            offerCount: offers.length,
          }),
          breadcrumbJsonLd([
            { name: "Produtos", path: "/produtos" },
            { name: product.name, path: `/produtos/${product.slug}` },
          ]),
        ]}
      />
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/produtos" className="hover:text-foreground">
          Produtos
        </Link>
        {product.categories[0] ? (
          <>
            <span>/</span>
            <Link
              href={`/produtos?categoria=${product.categories[0].slug}`}
              className="hover:text-foreground"
            >
              {product.categories[0].name}
            </Link>
          </>
        ) : null}
      </nav>

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

          {/* Buy */}
          <div className="mt-6">
            <h2 className="t-eyebrow mb-3">comprar em</h2>
            <StoreBuyList productSlug={product.slug} offers={offers} />
          </div>
        </div>
      </div>

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
          <div className="prose-sz text-muted-foreground">
            {product.description}
          </div>
        </section>
      ) : null}

      {/* Related */}
      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="t-h2 mb-6">Produtos relacionados</h2>
          <ProductCardGrid products={related} />
        </section>
      ) : null}
    </Container>
  );
}
