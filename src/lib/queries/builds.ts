import { cache } from "react";
import { db } from "@/lib/db";

export const buildCardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  coverImageUrl: true,
  budgetCents: true,
  isFeatured: true,
  category: true,
  difficulty: true,
  _count: { select: { items: true } },
} as const;

/** Minimal product projection for a build-item alternative chip. */
const altProductSelect = {
  slug: true,
  name: true,
  lowestPriceCents: true,
} as const;

export const getFeaturedBuilds = cache((limit = 3) =>
  db.build.findMany({
    where: { status: "PUBLISHED" },
    select: buildCardSelect,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: limit,
  }),
);

export const listBuilds = cache(() =>
  db.build.findMany({
    where: { status: "PUBLISHED" },
    select: buildCardSelect,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
  }),
);

export const listBuildsByCategory = cache((category: string) =>
  db.build.findMany({
    where: { status: "PUBLISHED", category },
    select: buildCardSelect,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
  }),
);

export const getBuildBySlug = cache((slug: string) =>
  db.build.findUnique({
    where: { slug },
    include: {
      items: {
        orderBy: { displayOrder: "asc" },
        include: {
          product: {
            include: {
              media: { orderBy: { displayOrder: "asc" }, take: 1 },
              affiliateLinks: { where: { isActive: true }, include: { store: true } },
            },
          },
          budgetAlternative: { select: altProductSelect },
          premiumAlternative: { select: altProductSelect },
        },
      },
    },
  }),
);

export type BuildCardData = Awaited<ReturnType<typeof getFeaturedBuilds>>[number];
