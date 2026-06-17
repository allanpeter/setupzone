import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site";

// Built from the database, so generate it at request time (not at build) to
// keep the build hermetic. See the note in (public)/layout.tsx.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const [products, builds, comparisons, posts, categories] = await Promise.all([
    db.product.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    db.build.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    db.comparison.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    db.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    db.blogCategory.findMany({ select: { slug: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/produtos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/montagens`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/comparar`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/sobre`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/afiliados`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticRoutes,
    ...products.map((p) => ({
      url: `${base}/produtos/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...builds.map((b) => ({
      url: `${base}/montagens/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...comparisons.map((c) => ({
      url: `${base}/comparar/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...categories.map((c) => ({
      url: `${base}/blog/categoria/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
