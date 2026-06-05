import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/format";

export type StoreOffer = {
  storeSlug: string;
  storeName: string;
  brandColor: string | null;
  priceCents: number | null;
  isLowest: boolean;
};

/**
 * Renders the "Comprar" block: one row per store with its current price and a
 * CTA that routes through /go/<product>/<store> for click tracking.
 */
export function StoreBuyList({
  productSlug,
  offers,
}: {
  productSlug: string;
  offers: StoreOffer[];
}) {
  if (offers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma loja disponível no momento.
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {offers.map((offer) => (
        <li
          key={offer.storeSlug}
          className="flex items-center gap-3 rounded-sticker border border-border bg-card p-3 shadow-sticker-1"
        >
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ background: offer.brandColor ?? "var(--muted-foreground)" }}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {offer.storeName}
            </p>
            {offer.isLowest ? (
              <p className="text-xs font-medium text-primary">Melhor preço</p>
            ) : null}
          </div>
          <span className="t-num text-base text-foreground">
            {formatBRL(offer.priceCents)}
          </span>
          <Button
            variant={offer.isLowest ? "brand" : "outline"}
            size="sm"
            render={
              <a
                href={`/go/${productSlug}/${offer.storeSlug}`}
                rel="nofollow sponsored noopener"
                target="_blank"
              />
            }
          >
            Comprar
            <ExternalLink />
          </Button>
        </li>
      ))}
    </ul>
  );
}
