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
  _count: { select: { items: true } },
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
        },
      },
    },
  }),
);

export type BuildCardData = Awaited<ReturnType<typeof getFeaturedBuilds>>[number];
