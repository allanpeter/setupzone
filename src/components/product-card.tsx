import { Flame } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { VoteButton } from "@/components/discovery/vote-button";
import { formatBRL } from "@/lib/format";
import type { ProductCardData } from "@/lib/queries/products";

export function ProductCard({
  product,
  hot = false,
}: {
  product: ProductCardData;
  hot?: boolean;
}) {
  const cover = product.media[0];
  const category = product.categories[0];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-border bg-card transition-all hover:-translate-y-1 hover:border-magenta-500/40 hover:shadow-glow-magenta">
      {/* Whole-card link overlay (sits below interactive bits). */}
      <Link
        href={`/produtos/${product.slug}`}
        className="absolute inset-0 z-10"
        aria-label={product.name}
      />

      <div className="relative aspect-[4/3] overflow-hidden bg-ink-850">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        {hot ? (
          <span className="absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-pill bg-magenta-500 px-2.5 py-1 text-xs font-bold text-magenta-50 shadow-glow-magenta">
            <Flame className="size-3.5" /> Em alta
          </span>
        ) : null}
        <VoteButton
          slug={product.slug}
          initialCount={product.voteCount}
          className="absolute right-3 top-3"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {category ? (
          <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
            {category.name}
          </span>
        ) : null}
        <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-foreground">
          {product.name}
        </h3>

        <div className="mt-auto flex items-baseline gap-1.5 pt-2">
          <span className="text-xs text-muted-foreground">a partir de</span>
          <span className="t-num text-lg text-foreground">
            {formatBRL(product.lowestPriceCents)}
          </span>
        </div>
      </div>
    </article>
  );
}

export function ProductCardGrid({
  products,
  hot = false,
}: {
  products: ProductCardData[];
  hot?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} hot={hot} />
      ))}
    </div>
  );
}
