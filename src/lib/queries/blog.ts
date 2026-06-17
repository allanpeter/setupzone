import { cache } from "react";
import { db } from "@/lib/db";
import { productCardSelect } from "@/lib/queries/products";
import { buildCardSelect } from "@/lib/queries/builds";

export const postCardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImageUrl: true,
  readingMinutes: true,
  publishedAt: true,
  category: { select: { slug: true, name: true } },
} as const;

export const listPosts = cache((params?: { category?: string; tag?: string }) =>
  db.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      ...(params?.category ? { category: { slug: params.category } } : {}),
      ...(params?.tag ? { tags: { some: { slug: params.tag } } } : {}),
    },
    select: postCardSelect,
    orderBy: { publishedAt: "desc" },
  }),
);

export const getPostBySlug = cache((slug: string) =>
  db.blogPost.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: true,
      author: { select: { name: true, image: true } },
      relatedProducts: {
        where: { status: "PUBLISHED" },
        select: productCardSelect,
        take: 4,
      },
      relatedBuilds: {
        where: { status: "PUBLISHED" },
        select: buildCardSelect,
        take: 3,
      },
    },
  }),
);

export const getBlogCategory = cache((slug: string) =>
  db.blogCategory.findUnique({ where: { slug } }),
);

export const getBlogTag = cache((slug: string) =>
  db.blogTag.findUnique({ where: { slug } }),
);

export type PostCardData = Awaited<ReturnType<typeof listPosts>>[number];
