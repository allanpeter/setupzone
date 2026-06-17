-- CreateEnum
CREATE TYPE "BuildDifficulty" AS ENUM ('INICIANTE', 'INTERMEDIARIO', 'AVANCADO');

-- CreateEnum
CREATE TYPE "ProductVerdict" AS ENUM ('VALE', 'NAO_VALE', 'DEPENDE');

-- AlterTable
-- NOTE: Prisma emits spurious `ALTER COLUMN "searchVector" DROP DEFAULT` for the
-- Unsupported(tsvector) GENERATED columns. Those lines were removed by hand so this
-- migration never touches the generated full-text columns (see AGENTS.md).

-- AlterTable
ALTER TABLE "build_items" ADD COLUMN     "budgetAlternativeId" TEXT,
ADD COLUMN     "premiumAlternativeId" TEXT;

-- AlterTable
ALTER TABLE "builds" ADD COLUMN     "category" TEXT,
ADD COLUMN     "conclusion" TEXT,
ADD COLUMN     "difficulty" "BuildDifficulty",
ADD COLUMN     "objective" TEXT,
ADD COLUMN     "observations" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "audienceFor" TEXT,
ADD COLUMN     "audienceNotFor" TEXT,
ADD COLUMN     "cons" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "editorialOpinion" TEXT,
ADD COLUMN     "pros" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "verdict" "ProductVerdict",
ADD COLUMN     "verdictNote" TEXT;

-- CreateTable
CREATE TABLE "_ProductAlternatives" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductAlternatives_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PostProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PostProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PostBuilds" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PostBuilds_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProductAlternatives_B_index" ON "_ProductAlternatives"("B");

-- CreateIndex
CREATE INDEX "_PostProducts_B_index" ON "_PostProducts"("B");

-- CreateIndex
CREATE INDEX "_PostBuilds_B_index" ON "_PostBuilds"("B");

-- AddForeignKey
ALTER TABLE "build_items" ADD CONSTRAINT "build_items_budgetAlternativeId_fkey" FOREIGN KEY ("budgetAlternativeId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_items" ADD CONSTRAINT "build_items_premiumAlternativeId_fkey" FOREIGN KEY ("premiumAlternativeId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductAlternatives" ADD CONSTRAINT "_ProductAlternatives_A_fkey" FOREIGN KEY ("A") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductAlternatives" ADD CONSTRAINT "_ProductAlternatives_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostProducts" ADD CONSTRAINT "_PostProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostProducts" ADD CONSTRAINT "_PostProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostBuilds" ADD CONSTRAINT "_PostBuilds_A_fkey" FOREIGN KEY ("A") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostBuilds" ADD CONSTRAINT "_PostBuilds_B_fkey" FOREIGN KEY ("B") REFERENCES "builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
