"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

const lines = (raw?: string) =>
  (raw ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

const comparisonSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().optional(),
  summary: z.string().optional(),
  verdict: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export async function saveComparison(formData: FormData) {
  await requireAdmin();
  const data = comparisonSchema.parse(Object.fromEntries(formData));
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);
  const base = {
    title: data.title,
    slug,
    summary: data.summary || null,
    verdict: data.verdict || null,
    status: data.status,
    publishedAt: data.status === "PUBLISHED" ? new Date() : null,
  };

  let comparisonId = data.id;
  if (comparisonId) {
    await db.comparison.update({ where: { id: comparisonId }, data: base });
  } else {
    const created = await db.comparison.create({ data: base });
    comparisonId = created.id;
  }
  revalidatePath("/admin/comparativos");
  revalidatePath(`/comparar/${slug}`);
  redirect(`/admin/comparativos/${comparisonId}`);
}

export async function deleteComparison(id: string) {
  await requireAdmin();
  await db.comparison.delete({ where: { id } });
  revalidatePath("/admin/comparativos");
}

export async function addComparisonItem(formData: FormData) {
  await requireAdmin();
  const comparisonId = String(formData.get("comparisonId"));
  const productId = String(formData.get("productId"));
  const pros = lines(String(formData.get("pros") ?? ""));
  const cons = lines(String(formData.get("cons") ?? ""));
  const count = await db.comparisonItem.count({ where: { comparisonId } });
  await db.comparisonItem.upsert({
    where: { comparisonId_productId: { comparisonId, productId } },
    update: { pros, cons },
    create: { comparisonId, productId, pros, cons, displayOrder: count },
  });
  revalidatePath(`/admin/comparativos/${comparisonId}`);
}

export async function deleteComparisonItem(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("itemId"));
  const comparisonId = String(formData.get("comparisonId"));
  await db.comparisonItem.delete({ where: { id } });
  revalidatePath(`/admin/comparativos/${comparisonId}`);
}
