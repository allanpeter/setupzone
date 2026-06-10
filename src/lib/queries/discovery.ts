import { cache } from "react";
import { db } from "@/lib/db";
import { daysAgo } from "@/lib/format";
import { productCardSelect, type ProductCardData } from "@/lib/queries/products";

/**
 * "Em alta" — trending by real affiliate-click velocity over the last 7 days.
 * Reuses the AffiliateClick stream we already record on /go redirects.
 */
export const getHotProducts = cache(async (limit = 8): Promise<ProductCardData[]> => {
  const grouped = await db.affiliateClick.groupBy({
    by: ["productId"],
    where: { createdAt: { gte: daysAgo(7) }, productId: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { productId: "desc" } },
    take: limit,
  });

  const ids = grouped.map((g) => g.productId).filter((id): id is string => !!id);
  if (ids.length === 0) {
    // Cold start (no clicks yet): fall back to flagged trending products.
    return db.product.findMany({
      where: { status: "PUBLISHED", isTrending: true },
      select: productCardSelect,
      take: limit,
    });
  }

  const products = await db.product.findMany({
    where: { id: { in: ids }, status: "PUBLISHED" },
    select: productCardSelect,
  });
  // Preserve the click-ranked order.
  const order = new Map(ids.map((id, i) => [id, i]));
  return products.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
});

/** "Mais desejados" — by the denormalised voteCount. */
export const getMostWantedProducts = cache((limit = 8) =>
  db.product.findMany({
    where: { status: "PUBLISHED", voteCount: { gt: 0 } },
    select: productCardSelect,
    orderBy: { voteCount: "desc" },
    take: limit,
  }),
);

/** Price-band shelves ("melhores upgrades por faixa de preço"). */
export const PRICE_BANDS = [
  { label: "Até R$200", max: 20000 },
  { label: "R$200–500", min: 20000, max: 50000 },
  { label: "R$500–1.000", min: 50000, max: 100000 },
  { label: "Acima de R$1.000", min: 100000 },
] as const;

export const getProductsByPriceBand = cache(
  (band: { min?: number; max?: number }, limit = 8) =>
    db.product.findMany({
      where: {
        status: "PUBLISHED",
        lowestPriceCents: {
          not: null,
          ...(band.min != null ? { gte: band.min } : {}),
          ...(band.max != null ? { lt: band.max } : {}),
        },
      },
      select: productCardSelect,
      orderBy: { voteCount: "desc" },
      take: limit,
    }),
);

/** Fetch a curated collection (rail) by slug with its product/build items. */
export const getCollectionBySlug = cache((slug: string) =>
  db.collection.findUnique({
    where: { slug },
    include: {
      items: {
        orderBy: { displayOrder: "asc" },
        include: {
          product: { select: productCardSelect },
          build: {
            select: {
              id: true,
              slug: true,
              title: true,
              summary: true,
              coverImageUrl: true,
              budgetCents: true,
              isFeatured: true,
              _count: { select: { items: true } },
            },
          },
        },
      },
    },
  }),
);

/** All published collections of a kind (e.g. all SHELF rails), feed-ordered. */
export const getCollectionsByKind = cache(
  (kind: "SHELF" | "SETUP_OF_WEEK" | "HIDDEN_GEMS" | "VIRAL" | "EDITORIAL" | "BUYING_GUIDE") =>
    db.collection.findMany({
      where: { status: "PUBLISHED", kind },
      orderBy: { displayOrder: "asc" },
      include: {
        items: {
          orderBy: { displayOrder: "asc" },
          include: { product: { select: productCardSelect } },
        },
      },
    }),
);

export type CollectionWithItems = Awaited<ReturnType<typeof getCollectionBySlug>>;
