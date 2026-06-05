-- Full-text search: generated tsvector columns (Portuguese) + GIN indexes.
-- Abstracted behind src/lib/search.ts so it can be swapped for Meilisearch.

-- Products: name + short description + description
ALTER TABLE "products"
  ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce("name", '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce("shortDescription", '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce("description", '')), 'C')
  ) STORED;

CREATE INDEX "products_search_idx" ON "products" USING GIN ("searchVector");

-- Builds: title + summary + description
ALTER TABLE "builds"
  ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce("summary", '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce("description", '')), 'C')
  ) STORED;

CREATE INDEX "builds_search_idx" ON "builds" USING GIN ("searchVector");

-- Blog posts: title + excerpt + content
ALTER TABLE "blog_posts"
  ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce("excerpt", '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce("content", '')), 'C')
  ) STORED;

CREATE INDEX "blog_posts_search_idx" ON "blog_posts" USING GIN ("searchVector");
