import { siteConfig } from "@/lib/site";

/** Renders a <script type="application/ld+json"> tag. */
export function jsonLdScript(data: Record<string, unknown>) {
  return {
    __html: JSON.stringify(data),
  };
}

export function productJsonLd(input: {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  brand?: string | null;
  priceCents?: number | null;
  offerCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description ?? undefined,
    image: input.image ?? undefined,
    brand: input.brand ? { "@type": "Brand", name: input.brand } : undefined,
    url: `${siteConfig.url}/produtos/${input.slug}`,
    ...(input.priceCents != null
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "BRL",
            lowPrice: (input.priceCents / 100).toFixed(2),
            offerCount: input.offerCount ?? 1,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

export function articleJsonLd(input: {
  title: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
  authorName?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description ?? undefined,
    image: input.image ?? undefined,
    datePublished: input.publishedAt?.toISOString(),
    dateModified: (input.updatedAt ?? input.publishedAt)?.toISOString(),
    author: { "@type": "Organization", name: input.authorName ?? siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
    url: `${siteConfig.url}/blog/${input.slug}`,
  };
}

export function buildJsonLd(input: {
  title: string;
  slug: string;
  summary?: string | null;
  image?: string | null;
  estimatedTotalCents?: number | null;
  items: { name: string; slug: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.title,
    description: input.summary ?? undefined,
    image: input.image ?? undefined,
    url: `${siteConfig.url}/montagens/${input.slug}`,
    numberOfItems: input.items.length,
    itemListElement: input.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: `${siteConfig.url}/produtos/${item.slug}`,
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}

export function itemListJsonLd(input: {
  name: string;
  path: string;
  items: { name: string; path: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    url: `${siteConfig.url}${input.path}`,
    itemListElement: input.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: `${siteConfig.url}${item.path}`,
    })),
  };
}
