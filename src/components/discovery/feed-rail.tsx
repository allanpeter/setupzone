import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { Container } from "@/components/section";
import type { ProductCardData } from "@/lib/queries/products";

/**
 * A horizontally-scrollable discovery rail: eyebrow + title + "ver tudo",
 * then snap-scrolling product cards. The core unit of the home feed.
 */
export function FeedRail({
  eyebrow,
  title,
  subtitle,
  action,
  products,
  hot = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  products: ProductCardData[];
  hot?: boolean;
}) {
  if (products.length === 0) return null;

  return (
    <section className="py-7">
      <Container>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            {eyebrow ? <p className="t-eyebrow mb-2">{eyebrow}</p> : null}
            <h2 className="t-h2">{title}</h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {action ? (
            <Link
              href={action.href}
              className="shrink-0 text-sm font-semibold text-accent hover:underline"
            >
              {action.label} →
            </Link>
          ) : null}
        </div>
      </Container>

      {/* Edge-to-edge scroller, padded to align with the container. */}
      <div className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex max-w-[1180px] snap-x gap-4 px-4 sm:px-6 lg:px-8">
          {products.map((p) => (
            <div key={p.id} className="w-[200px] shrink-0 snap-start sm:w-[230px]">
              <ProductCard product={p} hot={hot} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
