import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { AdminHeader, Field, FormError, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { deleteOffer, saveOffer } from "../../../_actions/products";

export default async function EditProduct({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [product, brands, categories, stores] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        categories: { select: { id: true } },
        media: { orderBy: { displayOrder: "asc" } },
        affiliateLinks: { include: { store: true } },
        prices: { where: { isCurrent: true } },
      },
    }),
    db.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.category.findMany({ orderBy: { displayOrder: "asc" }, select: { id: true, name: true } }),
    db.store.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);

  if (!product) notFound();

  const priceByStore = new Map(product.prices.map((p) => [p.storeId, p.priceCents]));

  return (
    <div>
      <AdminHeader
        title="Editar produto"
        action={{ label: "Ver no site", href: `/produtos/${product.slug}` }}
      />

      {error === "slug" ? (
        <FormError message="Já existe um produto com esse slug. Use um nome/slug diferente." />
      ) : null}

      <ProductForm product={product} brands={brands} categories={categories} />

      {/* Offers (affiliate links + current price per store) */}
      <section className="mt-12">
        <h2 className="t-h2 mb-1">Ofertas por loja</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Link de afiliado e preço atual em cada loja.
        </p>

        {product.affiliateLinks.length > 0 ? (
          <ul className="mb-6 divide-y divide-border overflow-hidden rounded-sticker border border-border bg-card">
            {product.affiliateLinks.map((link) => (
              <li key={link.id} className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{link.store.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{link.url}</p>
                </div>
                <span className="t-num text-sm">{formatBRL(priceByStore.get(link.storeId) ?? null)}</span>
                <form action={deleteOffer}>
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="storeId" value={link.storeId} />
                  <Button type="submit" variant="destructive" size="sm" nativeButton>
                    Remover
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}

        <form
          action={saveOffer}
          className="grid items-end gap-3 rounded-sticker border border-border bg-card p-5 sm:grid-cols-[1fr_2fr_1fr_auto]"
        >
          <input type="hidden" name="productId" value={product.id} />
          <Field label="Loja">
            <select name="storeId" required className={inputClass}>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="URL de afiliado">
            <input name="url" required placeholder="https://" className={inputClass} />
          </Field>
          <Field label="Preço (R$)">
            <input name="priceReais" placeholder="1299,00" className={inputClass} />
          </Field>
          <Button type="submit" variant="brand" nativeButton>
            Salvar oferta
          </Button>
        </form>
      </section>

      <div className="mt-8">
        <Button variant="outline" render={<Link href="/admin/produtos" />}>
          ← Voltar
        </Button>
      </div>
    </div>
  );
}
