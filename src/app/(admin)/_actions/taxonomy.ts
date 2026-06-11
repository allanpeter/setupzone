"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { isUniqueViolation, slugTakenRedirect } from "./_shared";

/** On duplicate slug, bounce back to the list (keeping edit context) with a flag. */
function duplicateRedirect(basePath: string, editId?: string): never {
  slugTakenRedirect(editId ? `${basePath}?edit=${editId}` : basePath);
}

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
  try {
    if (data.id) {
      await db.category.update({ where: { id: data.id }, data: payload });
    } else {
      await db.category.create({ data: payload });
    }
  } catch (e) {
    if (isUniqueViolation(e)) duplicateRedirect("/admin/categorias", data.id);
    throw e;
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
  try {
    if (data.id) {
      await db.brand.update({ where: { id: data.id }, data: payload });
    } else {
      await db.brand.create({ data: payload });
    }
  } catch (e) {
    if (isUniqueViolation(e)) duplicateRedirect("/admin/marcas", data.id);
    throw e;
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
  try {
    if (data.id) {
      await db.store.update({ where: { id: data.id }, data: payload });
    } else {
      await db.store.create({ data: payload });
    }
  } catch (e) {
    if (isUniqueViolation(e)) duplicateRedirect("/admin/lojas", data.id);
    throw e;
  }
  revalidatePath("/admin/lojas");
}

export async function deleteStore(id: string) {
  await requireAdmin();
  await db.store.delete({ where: { id } });
  revalidatePath("/admin/lojas");
}
