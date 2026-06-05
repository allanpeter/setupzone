import { cache } from "react";
import { db } from "@/lib/db";

export const listComparisons = cache(() =>
  db.comparison.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      _count: { select: { items: true } },
    },
  }),
);

export const getComparisonBySlug = cache((slug: string) =>
  db.comparison.findUnique({
    where: { slug },
    include: {
      items: {
        orderBy: { displayOrder: "asc" },
        include: {
          product: {
            include: {
              brand: { select: { name: true } },
              media: { orderBy: { displayOrder: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  }),
);

export type ComparisonListItem = Awaited<ReturnType<typeof listComparisons>>[number];
