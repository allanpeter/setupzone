import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";
import { AdminHeader, FormError } from "@/components/admin/ui";
import { db } from "@/lib/db";

export default async function EditPost({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [post, categories] = await Promise.all([
    db.blogPost.findUnique({ where: { id }, include: { tags: true } }),
    db.blogCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!post) notFound();

  return (
    <div>
      <AdminHeader
        title="Editar artigo"
        action={{ label: "Ver no site", href: `/blog/${post.slug}` }}
      />
      {error === "slug" ? (
        <FormError message="Já existe um artigo com esse slug. Use um título/slug diferente." />
      ) : null}
      <PostForm post={post} categories={categories} />
    </div>
  );
}
