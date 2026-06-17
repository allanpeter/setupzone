"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { isUniqueViolation, slugTakenRedirect } from "./_shared";

const lines = (raw?: string) =>
  (raw ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

const buildSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  budgetReais: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  pros: z.string().optional(),
  cons: z.string().optional(),
  objective: z.string().optional(),
  difficulty: z
    .enum(["INICIANTE", "INTERMEDIARIO", "AVANCADO"])
    .or(z.literal(""))
    .optional(),
  observations: z.string().optional(),
  conclusion: z.string().optional(),
  category: z.string().optional(),
});

export async function saveBuild(formData: FormData) {
  await requireAdmin();
  const data = buildSchema.parse(Object.fromEntries(formData));
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);
  const isFeatured = formData.get("isFeatured") === "on";
  const budget = Number(data.budgetReais?.replace(",", "."));

  const base = {
    title: data.title,
    slug,
    summary: data.summary || null,
    description: data.description || null,
    coverImageUrl: data.coverImageUrl || null,
    budgetCents: Number.isNaN(budget) || budget <= 0 ? null : Math.round(budget * 100),
    status: data.status,
    isFeatured,
    pros: lines(data.pros),
    cons: lines(data.cons),
    objective: data.objective || null,
    difficulty: data.difficulty ? data.difficulty : null,
    observations: data.observations || null,
    conclusion: data.conclusion || null,
    category: data.category?.trim() || null,
    publishedAt: data.status === "PUBLISHED" ? new Date() : null,
  };

  let buildId = data.id;
  try {
    if (buildId) {
      await db.build.update({ where: { id: buildId }, data: base });
    } else {
      const created = await db.build.create({ data: base });
      buildId = created.id;
    }
  } catch (e) {
    if (isUniqueViolation(e)) {
      slugTakenRedirect(data.id ? `/admin/montagens/${data.id}` : "/admin/montagens/novo");
    }
    throw e;
  }
  revalidatePath("/admin/montagens");
  revalidatePath(`/montagens/${slug}`);
  redirect(`/admin/montagens/${buildId}`);
}

export async function deleteBuild(id: string) {
  await requireAdmin();
  await db.build.delete({ where: { id } });
  revalidatePath("/admin/montagens");
}

export async function addBuildItem(formData: FormData) {
  await requireAdmin();
  const buildId = String(formData.get("buildId"));
  const productId = String(formData.get("productId"));
  const role = String(formData.get("role") ?? "") || null;
  const budgetAlternativeId =
    String(formData.get("budgetAlternativeId") ?? "") || null;
  const premiumAlternativeId =
    String(formData.get("premiumAlternativeId") ?? "") || null;
  const count = await db.buildItem.count({ where: { buildId } });
  await db.buildItem.upsert({
    where: { buildId_productId: { buildId, productId } },
    update: { role, budgetAlternativeId, premiumAlternativeId },
    create: {
      buildId,
      productId,
      role,
      budgetAlternativeId,
      premiumAlternativeId,
      displayOrder: count,
    },
  });
  revalidatePath(`/admin/montagens/${buildId}`);
}

export async function deleteBuildItem(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("itemId"));
  const buildId = String(formData.get("buildId"));
  await db.buildItem.delete({ where: { id } });
  revalidatePath(`/admin/montagens/${buildId}`);
}
