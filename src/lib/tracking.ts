import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Hash a visitor IP with the configured salt. We never store raw IPs — only a
 * salted SHA-256 digest, which is enough to roughly de-duplicate clicks while
 * staying privacy-friendly (LGPD/GDPR).
 */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT ?? "setupzone";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/** Best-effort client IP from common proxy headers. */
export function getClientIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip");
}

/**
 * Build the final destination URL, applying the store's optional URL template
 * and tracking code. Template tokens: {url}, {trackingCode}.
 */
export function buildAffiliateUrl(
  rawUrl: string,
  opts: { urlTemplate?: string | null; trackingCode?: string | null },
): string {
  const trackingCode = opts.trackingCode ?? "";
  if (opts.urlTemplate) {
    return opts.urlTemplate
      .replace("{url}", encodeURIComponent(rawUrl))
      .replace("{trackingCode}", encodeURIComponent(trackingCode));
  }
  return rawUrl;
}
