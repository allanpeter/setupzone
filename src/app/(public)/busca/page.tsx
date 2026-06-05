import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/section";
import { search } from "@/lib/search";

export const metadata: Metadata = {
  title: "Buscar",
  robots: { index: false },
};

const typeLabel: Record<string, string> = {
  produto: "Produto",
  montagem: "Montagem",
  blog: "Blog",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await search(query) : [];

  return (
    <Container className="py-12">
      <h1 className="t-display-md mb-6">Buscar</h1>

      <form action="/busca" className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          name="q"
          defaultValue={query}
          autoFocus
          placeholder="Buscar produtos, montagens e artigos…"
          className="h-12 w-full rounded-sticker border border-border bg-card pl-12 pr-4 text-base shadow-sticker-1 outline-none focus:border-primary"
        />
      </form>

      <div className="mt-8">
        {query && results.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhum resultado para <strong>“{query}”</strong>.
          </p>
        ) : null}

        {results.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {results.length} resultado{results.length > 1 ? "s" : ""} para “{query}”
            </p>
            <ul className="divide-y divide-border overflow-hidden rounded-sticker border border-border bg-card">
              {results.map((r) => (
                <li key={`${r.type}-${r.slug}`}>
                  <Link
                    href={r.href}
                    className="flex flex-col gap-1 p-4 transition-colors hover:bg-muted/50"
                  >
                    <span className="t-eyebrow bg-transparent p-0 text-muted-foreground">
                      {typeLabel[r.type]}
                    </span>
                    <span className="font-display font-bold text-foreground">
                      {r.title}
                    </span>
                    {r.description ? (
                      <span className="line-clamp-1 text-sm text-muted-foreground">
                        {r.description}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </Container>
  );
}
