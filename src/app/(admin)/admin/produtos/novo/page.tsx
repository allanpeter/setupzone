import { ProductForm } from "@/components/admin/product-form";
import { AdminHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";

export default async function NewProduct() {
  const [brands, categories] = await Promise.all([
    db.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.category.findMany({ orderBy: { displayOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <AdminHeader title="Novo produto" />
      <ProductForm brands={brands} categories={categories} />
    </div>
  );
}
