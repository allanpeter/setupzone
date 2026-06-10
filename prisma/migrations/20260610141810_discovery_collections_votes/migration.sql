-- CreateEnum
CREATE TYPE "CollectionKind" AS ENUM ('SHELF', 'SETUP_OF_WEEK', 'HIDDEN_GEMS', 'VIRAL', 'EDITORIAL', 'BUYING_GUIDE');

-- AlterTable
-- NOTE: searchVector "DROP DEFAULT" statements omitted — those are GENERATED
-- columns managed by the fulltext migration (Prisma can't see the expression).
ALTER TABLE "products" ADD COLUMN     "voteCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "kind" "CollectionKind" NOT NULL DEFAULT 'SHELF',
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_items" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "productId" TEXT,
    "buildId" TEXT,
    "note" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "collection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_votes" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collections_slug_key" ON "collections"("slug");

-- CreateIndex
CREATE INDEX "collections_status_displayOrder_idx" ON "collections"("status", "displayOrder");

-- CreateIndex
CREATE INDEX "collections_kind_idx" ON "collections"("kind");

-- CreateIndex
CREATE INDEX "collection_items_collectionId_displayOrder_idx" ON "collection_items"("collectionId", "displayOrder");

-- CreateIndex
CREATE INDEX "collection_items_productId_idx" ON "collection_items"("productId");

-- CreateIndex
CREATE INDEX "collection_items_buildId_idx" ON "collection_items"("buildId");

-- CreateIndex
CREATE INDEX "product_votes_productId_idx" ON "product_votes"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_votes_productId_ipHash_key" ON "product_votes"("productId", "ipHash");

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_votes" ADD CONSTRAINT "product_votes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
