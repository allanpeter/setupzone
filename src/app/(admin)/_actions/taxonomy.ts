"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const data = categorySchema.parse(Object.fromEntries(formData));
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);
  const payload = { name: data.name, slug, description: data.description || null };
  if (data.id) {
    await db.category.update({ where: { id: data.id }, data: payload });
  } else {
    await db.category.create({ data: payload });
  }
  revalidatePath("/admin/categorias");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categorias");
}

const brandSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().optional(),
  websiteUrl: z.string().optional(),
});

export async function saveBrand(formData: FormData) {
  await requireAdmin();
  const data = brandSchema.parse(Object.fromEntries(formData));
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);
  const payload = { name: data.name, slug, websiteUrl: data.websiteUrl || null };
  if (data.id) {
    await db.brand.update({ where: { id: data.id }, data: payload });
  } else {
    await db.brand.create({ data: payload });
  }
  revalidatePath("/admin/marcas");
}

export async function deleteBrand(id: string) {
  await requireAdmin();
  await db.brand.delete({ where: { id } });
  revalidatePath("/admin/marcas");
}

const storeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().optional(),
  brandColor: z.string().optional(),
  trackingCode: z.string().optional(),
  urlTemplate: z.string().optional(),
});

export async function saveStore(formData: FormData) {
  await requireAdmin();
  const data = storeSchema.parse(Object.fromEntries(formData));
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);
  const payload = {
    name: data.name,
    slug,
    brandColor: data.brandColor || null,
    trackingCode: data.trackingCode || null,
    urlTemplate: data.urlTemplate || null,
  };
  if (data.id) {
    await db.store.update({ where: { id: data.id }, data: payload });
  } else {
    await db.store.create({ data: payload });
  }
  revalidatePath("/admin/lojas");
}

export async function deleteStore(id: string) {
  await requireAdmin();
  await db.store.delete({ where: { id } });
  revalidatePath("/admin/lojas");
}
