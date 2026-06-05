-- Change User.role from enum to string (Better Auth admin plugin convention).
-- The searchVector "DROP DEFAULT" statements Prisma generated are intentionally
-- omitted: those are GENERATED columns managed by the fulltext migration.

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- DropEnum
DROP TYPE "UserRole";

-- Align FTS index names with Prisma's expected naming.
ALTER INDEX "blog_posts_search_idx" RENAME TO "blog_posts_searchVector_idx";
ALTER INDEX "builds_search_idx" RENAME TO "builds_searchVector_idx";
ALTER INDEX "products_search_idx" RENAME TO "products_searchVector_idx";
