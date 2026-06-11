"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { isUniqueViolation, slugTakenRedirect } from "./_shared";

const collectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().optional(),
  subtitle: z.string().optional(),
  kind: z.enum(["SHELF", "SETUP_OF_WEEK", "HIDDEN_GEMS", "VIRAL", "EDITORIAL", "BUYING_GUIDE"]),
  displayOrder: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export async function saveCollection(formData: FormData) {
  await requireAdmin();
  const data = collectionSchema.parse(Object.fromEntries(formData));
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);
  const order = Number(data.displayOrder);
  const base = {
    title: data.title,
    slug,
    subtitle: data.subtitle || null,
    kind: data.kind,
    status: data.status,
    displayOrder: Number.isNaN(order) ? 0 : order,
  };

  let collectionId = data.id;
  try {
    if (collectionId) {
      await db.collection.update({ where: { id: collectionId }, data: base });
    } else {
      const created = await db.collection.create({ data: base });
      collectionId = created.id;
    }
  } catch (e) {
    if (isUniqueViolation(e)) {
      slugTakenRedirect(data.id ? `/admin/colecoes/${data.id}` : "/admin/colecoes");
    }
    throw e;
  }
  revalidatePath("/admin/colecoes");
  revalidatePath("/");
  redirect(`/admin/colecoes/${collectionId}`);
}

export async function deleteCollection(id: string) {
  await requireAdmin();
  await db.collection.delete({ where: { id } });
  revalidatePath("/admin/colecoes");
  revalidatePath("/");
}

export async function addCollectionItem(formData: FormData) {
  await requireAdmin();
  const collectionId = String(formData.get("collectionId"));
  const ref = String(formData.get("ref")); // "product:<id>" | "build:<id>"
  const [kind, id] = ref.split(":");
  const count = await db.collectionItem.count({ where: { collectionId } });
  await db.collectionItem.create({
    data: {
      collectionId,
      productId: kind === "product" ? id : null,
      buildId: kind === "build" ? id : null,
      displayOrder: count,
    },
  });
  revalidatePath(`/admin/colecoes/${collectionId}`);
  revalidatePath("/");
}

export async function deleteCollectionItem(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("itemId"));
  const collectionId = String(formData.get("collectionId"));
  await db.collectionItem.delete({ where: { id } });
  revalidatePath(`/admin/colecoes/${collectionId}`);
  revalidatePath("/");
}
