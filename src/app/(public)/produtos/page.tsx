import type { Metadata } from "next";
import Link from "next/link";
import { ProductCardGrid } from "@/components/product-card";
import { ProductsFilterBar } from "@/components/products-filter-bar";
import { Container } from "@/components/section";
import { Button } from "@/components/ui/button";
import {
  getBrands,
  getCategoriesWithCounts,
  listProducts,
  type ProductSort,
} from "@/lib/queries/products";

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Catálogo de produtos de tecnologia: mini PCs, homelab, redes, periféricos e mais, com preços comparados.",
};

type SearchParams = Promise<{
  categoria?: string;
  marca?: string;
  ordenar?: string;
  pagina?: string;
  q?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Number(sp.pagina ?? "1") || 1;

  const [{ items, total, pageCount }, categories, brands] = await Promise.all([
    listProducts({
      category: sp.categoria,
      brand: sp.marca,
      q: sp.q,
      sort: (sp.ordenar as ProductSort) ?? "relevancia",
      page,
    }),
    getCategoriesWithCounts(),
    getBrands(),
  ]);

  const buildPageHref = (p: number) => {
    const next = new URLSearchParams();
    if (sp.categoria) next.set("categoria", sp.categoria);
    if (sp.marca) next.set("marca", sp.marca);
    if (sp.ordenar) next.set("ordenar", sp.ordenar);
    if (sp.q) next.set("q", sp.q);
    next.set("pagina", String(p));
    return `/produtos?${next.toString()}`;
  };

  return (
    <Container className="py-12">
      <header className="mb-8">
        <p className="t-eyebrow mb-3">catálogo</p>
        <h1 className="t-display-md">Produtos</h1>
        <p className="mt-2 text-muted-foreground">
          {total} {total === 1 ? "produto" : "produtos"} encontrados
        </p>
      </header>

      <ProductsFilterBar categories={categories} brands={brands} />

      <div className="mt-8">
        {items.length > 0 ? (
          <ProductCardGrid products={items} />
        ) : (
          <div className="rounded-sticker border border-dashed border-border py-20 text-center">
            <p className="font-display text-lg font-bold">Nada por aqui</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tente remover alguns filtros.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              render={<Link href="/produtos" />}
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>

      {pageCount > 1 ? (
        <nav className="mt-10 flex items-center justify-center gap-2">
          {page > 1 ? (
            <Button variant="outline" render={<Link href={buildPageHref(page - 1)} />}>
              Anterior
            </Button>
          ) : null}
          <span className="px-3 text-sm text-muted-foreground">
            Página {page} de {pageCount}
          </span>
          {page < pageCount ? (
            <Button variant="outline" render={<Link href={buildPageHref(page + 1)} />}>
              Próxima
            </Button>
          ) : null}
        </nav>
      ) : null}
    </Container>
  );
}
