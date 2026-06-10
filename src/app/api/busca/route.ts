import { NextResponse, type NextRequest } from "next/server";
import { search } from "@/lib/search";

/** JSON search for the ⌘K command palette. GET /api/busca?q=... */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 2) return NextResponse.json({ results: [] });
  const results = await search(q, 8);
  return NextResponse.json({ results });
}
