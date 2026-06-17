import { ProductForm } from "@/components/admin/product-form";
import { AdminHeader, FormError } from "@/components/admin/ui";
import { db } from "@/lib/db";

export default async function NewProduct({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [brands, categories, products] = await Promise.all([
    db.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.category.findMany({ orderBy: { displayOrder: "asc" }, select: { id: true, name: true } }),
    db.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <AdminHeader title="Novo produto" />
      {error === "slug" ? (
        <FormError message="Já existe um produto com esse slug. Use um nome/slug diferente." />
      ) : null}
      <ProductForm brands={brands} categories={categories} products={products} />
    </div>
  );
}
