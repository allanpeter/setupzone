import { db } from "@/lib/db";

export type SearchResult = {
  type: "produto" | "montagem" | "blog";
  slug: string;
  title: string;
  description: string | null;
  href: string;
  rank: number;
};

/**
 * Global search across products, builds and blog posts using Postgres
 * full-text search (Portuguese config, websearch syntax) on the generated
 * `searchVector` columns. Interface is intentionally narrow so the backing
 * store can later be swapped for Meilisearch without touching callers.
 */
export async function search(query: string, limit = 20): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const [products, builds, posts] = await Promise.all([
    db.$queryRaw<
      { slug: string; title: string; description: string | null; rank: number }[]
    >`
      SELECT "slug", "name" AS title, "shortDescription" AS description,
             ts_rank("searchVector", websearch_to_tsquery('portuguese', ${q})) AS rank
      FROM "products"
      WHERE "status" = 'PUBLISHED'
        AND "searchVector" @@ websearch_to_tsquery('portuguese', ${q})
      ORDER BY rank DESC
      LIMIT ${limit}
    `,
    db.$queryRaw<
      { slug: string; title: string; description: string | null; rank: number }[]
    >`
      SELECT "slug", "title", "summary" AS description,
             ts_rank("searchVector", websearch_to_tsquery('portuguese', ${q})) AS rank
      FROM "builds"
      WHERE "status" = 'PUBLISHED'
        AND "searchVector" @@ websearch_to_tsquery('portuguese', ${q})
      ORDER BY rank DESC
      LIMIT ${limit}
    `,
    db.$queryRaw<
      { slug: string; title: string; description: string | null; rank: number }[]
    >`
      SELECT "slug", "title", "excerpt" AS description,
             ts_rank("searchVector", websearch_to_tsquery('portuguese', ${q})) AS rank
      FROM "blog_posts"
      WHERE "status" = 'PUBLISHED'
        AND "searchVector" @@ websearch_to_tsquery('portuguese', ${q})
      ORDER BY rank DESC
      LIMIT ${limit}
    `,
  ]);

  const results: SearchResult[] = [
    ...products.map((r) => ({ ...r, type: "produto" as const, href: `/produtos/${r.slug}` })),
    ...builds.map((r) => ({ ...r, type: "montagem" as const, href: `/montagens/${r.slug}` })),
    ...posts.map((r) => ({ ...r, type: "blog" as const, href: `/blog/${r.slug}` })),
  ];

  return results.sort((a, b) => b.rank - a.rank).slice(0, limit);
}
