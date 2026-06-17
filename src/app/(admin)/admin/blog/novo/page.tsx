import { PostForm } from "@/components/admin/post-form";
import { AdminHeader, FormError } from "@/components/admin/ui";
import { db } from "@/lib/db";

export default async function NewPost({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [categories, products, builds] = await Promise.all([
    db.blogCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.build.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);
  return (
    <div>
      <AdminHeader title="Novo artigo" />
      {error === "slug" ? (
        <FormError message="Já existe um artigo com esse slug. Use um título/slug diferente." />
      ) : null}
      <PostForm categories={categories} products={products} builds={builds} />
    </div>
  );
}
