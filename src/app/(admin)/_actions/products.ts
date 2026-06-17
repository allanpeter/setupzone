"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import type { ProductSpec } from "@/lib/format";
import { slugify } from "@/lib/slug";
import { isUniqueViolation, slugTakenRedirect } from "./_shared";

/** Parse "Label: Value" lines into spec objects. */
function parseSpecs(raw: string): ProductSpec[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return { label: line, value: "" };
      return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
    });
}

/** Recompute the denormalised lowest current price for a product. */
async function recomputeLowest(productId: string) {
  const prices = await db.productPrice.findMany({
    where: { productId, isCurrent: true },
    select: { priceCents: true },
  });
  const lowest = prices.length
    ? Math.min(...prices.map((p) => p.priceCents))
    : null;
  await db.product.update({ where: { id: productId }, data: { lowestPriceCents: lowest } });
}

/** Split a textarea into trimmed, non-empty lines. */
const lines = (raw?: string) =>
  (raw ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  brandId: z.string().optional(),
  coverImageUrl: z.string().optional(),
  specs: z.string().optional(),
  audienceFor: z.string().optional(),
  audienceNotFor: z.string().optional(),
  pros: z.string().optional(),
  cons: z.string().optional(),
  editorialOpinion: z.string().optional(),
  verdict: z.enum(["VALE", "NAO_VALE", "DEPENDE"]).or(z.literal("")).optional(),
  verdictNote: z.string().optional(),
});

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const data = productSchema.parse(Object.fromEntries(formData));
  const categoryIds = formData.getAll("categoryIds").map(String).filter(Boolean);
  const alternativeIds = formData
    .getAll("alternativeIds")
    .map(String)
    .filter((id) => Boolean(id) && id !== data.id);
  const isFeatured = formData.get("isFeatured") === "on";
  const isTrending = formData.get("isTrending") === "on";
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);

  const base = {
    name: data.name,
    slug,
    shortDescription: data.shortDescription || null,
    description: data.description || null,
    status: data.status,
    isFeatured,
    isTrending,
    brandId: data.brandId || null,
    specs: parseSpecs(data.specs ?? ""),
    audienceFor: data.audienceFor || null,
    audienceNotFor: data.audienceNotFor || null,
    pros: lines(data.pros),
    cons: lines(data.cons),
    editorialOpinion: data.editorialOpinion || null,
    verdict: data.verdict ? data.verdict : null,
    verdictNote: data.verdictNote || null,
    publishedAt:
      data.status === "PUBLISHED" ? new Date() : null,
  };

  let productId = data.id;
  try {
    if (productId) {
      await db.product.update({
        where: { id: productId },
        data: {
          ...base,
          categories: { set: categoryIds.map((id) => ({ id })) },
          alternatives: { set: alternativeIds.map((id) => ({ id })) },
        },
      });
    } else {
      const created = await db.product.create({
        data: {
          ...base,
          categories: { connect: categoryIds.map((id) => ({ id })) },
          alternatives: { connect: alternativeIds.map((id) => ({ id })) },
        },
      });
      productId = created.id;
    }
  } catch (e) {
    if (isUniqueViolation(e)) {
      slugTakenRedirect(data.id ? `/admin/produtos/${data.id}` : "/admin/produtos/novo");
    }
    throw e;
  }

  // Cover image (single primary asset).
  if (data.coverImageUrl?.trim()) {
    const existing = await db.mediaAsset.findFirst({
      where: { productId },
      orderBy: { displayOrder: "asc" },
    });
    if (existing) {
      await db.mediaAsset.update({
        where: { id: existing.id },
        data: { url: data.coverImageUrl, alt: data.name },
      });
    } else {
      await db.mediaAsset.create({
        data: { productId, url: data.coverImageUrl, alt: data.name, displayOrder: 0 },
      });
    }
  }

  revalidatePath("/admin/produtos");
  revalidatePath(`/produtos/${slug}`);
  redirect(`/admin/produtos/${productId}`);
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.product.delete({ where: { id } });
  revalidatePath("/admin/produtos");
}

const offerSchema = z.object({
  productId: z.string(),
  storeId: z.string(),
  url: z.string().min(1),
  priceReais: z.string().optional(),
});

/** Create/update an affiliate link + current price for a (product, store). */
export async function saveOffer(formData: FormData) {
  await requireAdmin();
  const data = offerSchema.parse(Object.fromEntries(formData));

  await db.affiliateLink.upsert({
    where: {
      productId_storeId_label: {
        productId: data.productId,
        storeId: data.storeId,
        label: "",
      },
    },
    update: { url: data.url, isActive: true },
    create: {
      productId: data.productId,
      storeId: data.storeId,
      url: data.url,
      label: "",
      isPrimary: false,
    },
  });

  const reais = Number(data.priceReais?.replace(",", "."));
  if (!Number.isNaN(reais) && reais > 0) {
    await db.productPrice.updateMany({
      where: { productId: data.productId, storeId: data.storeId, isCurrent: true },
      data: { isCurrent: false },
    });
    await db.productPrice.create({
      data: {
        productId: data.productId,
        storeId: data.storeId,
        priceCents: Math.round(reais * 100),
        currency: "BRL",
        isCurrent: true,
      },
    });
    await recomputeLowest(data.productId);
  }

  revalidatePath(`/admin/produtos/${data.productId}`);
}

export async function deleteOffer(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId"));
  const storeId = String(formData.get("storeId"));
  await db.affiliateLink.deleteMany({ where: { productId, storeId } });
  await db.productPrice.deleteMany({ where: { productId, storeId } });
  await recomputeLowest(productId);
  revalidatePath(`/admin/produtos/${productId}`);
}
