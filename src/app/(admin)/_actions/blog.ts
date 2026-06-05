"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImageUrl: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  categoryId: z.string().optional(),
  readingMinutes: z.string().optional(),
  tags: z.string().optional(),
});

export async function savePost(formData: FormData) {
  await requireAdmin();
  const data = postSchema.parse(Object.fromEntries(formData));
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);

  // Upsert tags from a comma-separated list.
  const tagNames = (data.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const tagIds: { id: string }[] = [];
  for (const name of tagNames) {
    const tagSlug = slugify(name);
    const tag = await db.blogTag.upsert({
      where: { slug: tagSlug },
      update: {},
      create: { slug: tagSlug, name },
    });
    tagIds.push({ id: tag.id });
  }

  const reading = Number(data.readingMinutes);
  const base = {
    title: data.title,
    slug,
    excerpt: data.excerpt || null,
    content: data.content || "",
    coverImageUrl: data.coverImageUrl || null,
    status: data.status,
    categoryId: data.categoryId || null,
    readingMinutes: Number.isNaN(reading) || reading <= 0 ? null : reading,
    publishedAt: data.status === "PUBLISHED" ? new Date() : null,
  };

  let postId = data.id;
  if (postId) {
    await db.blogPost.update({
      where: { id: postId },
      data: { ...base, tags: { set: tagIds } },
    });
  } else {
    const created = await db.blogPost.create({
      data: { ...base, tags: { connect: tagIds } },
    });
    postId = created.id;
  }

  revalidatePath("/admin/blog");
  revalidatePath(`/blog/${slug}`);
  redirect(`/admin/blog/${postId}`);
}

export async function deletePost(id: string) {
  await requireAdmin();
  await db.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
}
