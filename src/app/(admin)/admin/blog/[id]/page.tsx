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
  const [post, categories, products, builds] = await Promise.all([
    db.blogPost.findUnique({
      where: { id },
      include: {
        tags: true,
        relatedProducts: { select: { id: true } },
        relatedBuilds: { select: { id: true } },
      },
    }),
    db.blogCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.build.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
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
      <PostForm
        post={post}
        categories={categories}
        products={products}
        builds={builds}
      />
    </div>
  );
}
