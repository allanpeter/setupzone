import { cache } from "react";
import { db } from "@/lib/db";

/** Fields needed to render a ProductCard. */
export const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  shortDescription: true,
  lowestPriceCents: true,
  isFeatured: true,
  isTrending: true,
  voteCount: true,
  brand: { select: { name: true, slug: true } },
  media: {
    orderBy: { displayOrder: "asc" },
    take: 1,
    select: { url: true, alt: true },
  },
  categories: { select: { name: true, slug: true } },
} as const;

export const PAGE_SIZE = 12;

export type ProductSort = "relevancia" | "menor-preco" | "maior-preco" | "novidades";

export const getFeaturedProducts = cache((limit = 4) =>
  db.product.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    select: productCardSelect,
    orderBy: { updatedAt: "desc" },
    take: limit,
  }),
);

/** Active (published) products, newest first. */
export const getActiveProducts = cache((limit = PAGE_SIZE) =>
  db.product.findMany({
    where: { status: "PUBLISHED" },
    select: productCardSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  }),
);

export const getTrendingProducts = cache((limit = 8) =>
  db.product.findMany({
    where: { status: "PUBLISHED", isTrending: true },
    select: productCardSelect,
    orderBy: { updatedAt: "desc" },
    take: limit,
  }),
);

export const getCategoriesWithCounts = cache(async () => {
  const categories = await db.category.findMany({
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      _count: {
        select: { products: { where: { status: "PUBLISHED" } } },
      },
    },
  });
  return categories;
});

export const getBrands = cache(() =>
  db.brand.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } }),
);

const sortOrder = (sort: ProductSort) => {
  switch (sort) {
    case "menor-preco":
      return [{ lowestPriceCents: "asc" as const }];
    case "maior-preco":
      return [{ lowestPriceCents: "desc" as const }];
    case "novidades":
      return [{ publishedAt: "desc" as const }];
    default:
      return [{ isFeatured: "desc" as const }, { updatedAt: "desc" as const }];
  }
};

export async function listProducts(params: {
  category?: string;
  brand?: string;
  q?: string;
  sort?: ProductSort;
  page?: number;
}) {
  const page = Math.max(1, params.page ?? 1);
  const where = {
    status: "PUBLISHED" as const,
    ...(params.category ? { categories: { some: { slug: params.category } } } : {}),
    ...(params.brand ? { brand: { slug: params.brand } } : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { shortDescription: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      select: productCardSelect,
      orderBy: sortOrder(params.sort ?? "relevancia"),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
  ]);

  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export const getProductBySlug = cache((slug: string) =>
  db.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      categories: { orderBy: { displayOrder: "asc" } },
      media: { orderBy: { displayOrder: "asc" } },
      affiliateLinks: {
        where: { isActive: true },
        include: { store: true },
      },
      prices: {
        where: { isCurrent: true },
        include: { store: true },
        orderBy: { priceCents: "asc" },
      },
      // Curated alternatives (editorial). Only published ones are shown.
      alternatives: {
        where: { status: "PUBLISHED" },
        select: productCardSelect,
        take: 4,
      },
    },
  }),
);

/** Products that share a category, excluding the current one. */
export const getRelatedProducts = cache(
  async (productId: string, categorySlugs: string[], limit = 4) => {
    if (categorySlugs.length === 0) return [];
    return db.product.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: productId },
        categories: { some: { slug: { in: categorySlugs } } },
      },
      select: productCardSelect,
      take: limit,
      orderBy: { isFeatured: "desc" },
    });
  },
);

export type ProductCardData = Awaited<ReturnType<typeof getFeaturedProducts>>[number];

/**
 * Price history stats for a product: lowest ever recorded + how many points
 * we've tracked. Powers the "menor preço registrado" urgency cue (and grows
 * richer once the price crawler is wired in the Growth phase).
 */
export const getPriceStats = cache(async (productId: string) => {
  const [agg, count] = await Promise.all([
    db.productPrice.aggregate({
      where: { productId },
      _min: { priceCents: true },
      _max: { priceCents: true },
    }),
    db.productPrice.count({ where: { productId } }),
  ]);
  return {
    lowestEverCents: agg._min.priceCents,
    highestEverCents: agg._max.priceCents,
    points: count,
  };
});
