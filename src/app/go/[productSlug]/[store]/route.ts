import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { buildAffiliateUrl, getClientIp, hashIp } from "@/lib/tracking";

/**
 * Affiliate redirect + click tracker.
 *   GET /go/<productSlug>/<storeSlug>
 * Records an AffiliateClick (privacy-hashed IP) then 302s to the destination.
 * Raw affiliate URLs are never exposed in page markup.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productSlug: string; store: string }> },
) {
  const { productSlug, store } = await params;

  const link = await db.affiliateLink.findFirst({
    where: {
      isActive: true,
      product: { slug: productSlug },
      store: { slug: store },
    },
    orderBy: { isPrimary: "desc" },
    include: { store: true, product: { select: { id: true } } },
  });

  // Nothing to redirect to — bounce back to the product page.
  if (!link) {
    return NextResponse.redirect(new URL(`/produtos/${productSlug}`, req.url), 302);
  }

  const destination = buildAffiliateUrl(link.url, {
    urlTemplate: link.store.urlTemplate,
    trackingCode: link.trackingCode ?? link.store.trackingCode,
  });

  // Record the click (best-effort — never block the redirect on logging).
  try {
    await db.affiliateClick.create({
      data: {
        productId: link.product.id,
        storeId: link.storeId,
        affiliateLinkId: link.id,
        referrer: req.headers.get("referer") ?? null,
        userAgent: req.headers.get("user-agent") ?? null,
        ipHash: hashIp(getClientIp(req)),
      },
    });
  } catch (err) {
    console.error("Failed to record affiliate click", err);
  }

  return NextResponse.redirect(destination, 302);
}
