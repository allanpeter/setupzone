import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/format";
import type { ProductCardData } from "@/lib/queries/products";

export function ProductCard({ product }: { product: ProductCardData }) {
  const cover = product.media[0];
  const category = product.categories[0];

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-sticker border border-border bg-card shadow-sticker-1 transition-all hover:-translate-y-1 hover:shadow-sticker-3"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        {product.isTrending ? (
          <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">
            Em alta
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {category ? (
          <span className="t-eyebrow bg-transparent p-0 text-muted-foreground">
            {category.name}
          </span>
        ) : null}
        <h3 className="line-clamp-2 font-display text-base font-bold leading-snug text-foreground">
          {product.name}
        </h3>
        {product.shortDescription ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.shortDescription}
          </p>
        ) : null}

        <div className="mt-auto flex items-baseline gap-1.5 pt-2">
          <span className="text-xs text-muted-foreground">a partir de</span>
          <span className="t-num text-lg text-foreground">
            {formatBRL(product.lowestPriceCents)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardGrid({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
