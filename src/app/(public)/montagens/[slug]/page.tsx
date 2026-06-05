import { Check, X } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/section";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/format";
import { getBuildBySlug } from "@/lib/queries/builds";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const build = await getBuildBySlug(slug);
  if (!build) return {};
  return {
    title: build.title,
    description: build.summary ?? undefined,
    openGraph: {
      title: build.title,
      description: build.summary ?? undefined,
      images: build.coverImageUrl ? [{ url: build.coverImageUrl }] : undefined,
    },
  };
}

export default async function BuildPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const build = await getBuildBySlug(slug);
  if (!build || build.status !== "PUBLISHED") notFound();

  const estimatedTotal = build.items.reduce(
    (sum, item) => sum + (item.product.lowestPriceCents ?? 0) * item.quantity,
    0,
  );

  return (
    <Container className="py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/montagens" className="hover:text-foreground">
          Montagens
        </Link>
      </nav>

      {/* Header */}
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
          <h1 className="t-display-md">{build.title}</h1>
          {build.summary ? (
            <p className="mt-4 text-lg text-muted-foreground">{build.summary}</p>
          ) : null}
          <div className="mt-6 inline-flex items-baseline gap-2 rounded-sticker border border-border bg-card px-5 py-3 shadow-sticker-1">
            <span className="text-sm text-muted-foreground">custo estimado</span>
            <span className="t-num text-2xl text-primary">
              {formatBRL(estimatedTotal)}
            </span>
          </div>
        </div>
        {build.coverImageUrl ? (
          <div className="relative aspect-[16/10] overflow-hidden rounded-sticker border border-border bg-muted">
            <Image
              src={build.coverImageUrl}
              alt={build.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 460px"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>

      {/* Pros / cons */}
      {(build.pros.length > 0 || build.cons.length > 0) && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {build.pros.length > 0 ? (
            <div className="rounded-sticker border border-border bg-card p-5">
              <h2 className="t-eyebrow mb-3 text-primary">prós</h2>
              <ul className="space-y-2">
                {build.pros.map((p) => (
                  <li key={p} className="flex gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {build.cons.length > 0 ? (
            <div className="rounded-sticker border border-border bg-card p-5">
              <h2 className="t-eyebrow mb-3 text-rare-400">contras</h2>
              <ul className="space-y-2">
                {build.cons.map((c) => (
                  <li key={c} className="flex gap-2 text-sm">
                    <X className="mt-0.5 size-4 shrink-0 text-rare-400" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {/* Description */}
      {build.description ? (
        <p className="mt-10 max-w-3xl text-muted-foreground">{build.description}</p>
      ) : null}

      {/* Items */}
      <section className="mt-12">
        <h2 className="t-h2 mb-5">Lista de peças</h2>
        <ul className="space-y-3">
          {build.items.map((item) => {
            const cover = item.product.media[0];
            const primaryLink =
              item.product.affiliateLinks.find((l) => l.isPrimary) ??
              item.product.affiliateLinks[0];
            return (
              <li
                key={item.id}
                className="flex items-center gap-4 rounded-sticker border border-border bg-card p-3 shadow-sticker-1"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {cover ? (
                    <Image
                      src={cover.url}
                      alt={cover.alt ?? item.product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  {item.role ? (
                    <span className="t-eyebrow bg-transparent p-0 text-muted-foreground">
                      {item.role}
                      {item.quantity > 1 ? ` · ${item.quantity}x` : ""}
                    </span>
                  ) : null}
                  <Link
                    href={`/produtos/${item.product.slug}`}
                    className="block truncate font-display font-bold text-foreground hover:text-primary"
                  >
                    {item.product.name}
                  </Link>
                </div>
                <span className="t-num hidden text-base text-foreground sm:block">
                  {formatBRL(item.product.lowestPriceCents)}
                </span>
                {primaryLink ? (
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <a
                        href={`/go/${item.product.slug}/${primaryLink.store.slug}`}
                        rel="nofollow sponsored noopener"
                        target="_blank"
                      />
                    }
                  >
                    Comprar
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </Container>
  );
}
