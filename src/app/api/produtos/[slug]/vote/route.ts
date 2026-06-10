import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getClientIp, hashIp } from "@/lib/tracking";

/**
 * "Quero" / upvote a product. Anonymous + deduped by salted IP hash.
 *   POST /api/produtos/<slug>/vote
 * Returns the new vote count and whether this request added a vote.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    select: { id: true, voteCount: true },
  });
  if (!product) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const ipHash = hashIp(getClientIp(_req)) ?? "anon";

  try {
    await db.productVote.create({ data: { productId: product.id, ipHash } });
  } catch {
    // Unique violation → already voted from this IP. Return current count.
    return NextResponse.json({ voteCount: product.voteCount, voted: true, already: true });
  }

  const updated = await db.product.update({
    where: { id: product.id },
    data: { voteCount: { increment: 1 } },
    select: { voteCount: true },
  });

  return NextResponse.json({ voteCount: updated.voteCount, voted: true });
}
