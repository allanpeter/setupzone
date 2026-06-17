import DOMPurify from "isomorphic-dompurify";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BuildCard } from "@/components/build-card";
import { JsonLd } from "@/components/json-ld";
import { ProductCardGrid } from "@/components/product-card";
import { Container } from "@/components/section";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { articleJsonLd } from "@/lib/jsonld";
import { getPostBySlug } from "@/lib/queries/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
    },
    twitter: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  const hasRelated =
    post.relatedBuilds.length > 0 || post.relatedProducts.length > 0;

  return (
    <article className="py-10">
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          slug: post.slug,
          description: post.excerpt,
          image: post.coverImageUrl,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          authorName: post.author?.name,
        })}
      />
      <Container className="max-w-3xl">
        <Breadcrumbs
          items={[
            { name: "Guias", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]}
        />

        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {post.category ? (
            <Link
              href={`/blog/categoria/${post.category.slug}`}
              className="font-semibold text-primary hover:underline"
            >
              {post.category.name}
            </Link>
          ) : null}
          {post.author?.name ? <span>· por {post.author.name}</span> : null}
          {post.publishedAt ? <span>· {formatDate(post.publishedAt)}</span> : null}
          {post.readingMinutes ? (
            <span>· {post.readingMinutes} min de leitura</span>
          ) : null}
        </div>

        <h1 className="t-display-md">{post.title}</h1>
        {post.excerpt ? (
          <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
        ) : null}
      </Container>

      {post.coverImageUrl ? (
        <Container className="my-8 max-w-4xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-sticker border border-border bg-muted">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
            />
          </div>
        </Container>
      ) : null}

      <Container className="max-w-3xl">
        {/* Content is admin-authored; sanitize defensively before render. */}
        <div
          className="prose-sz"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

        {post.tags.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.slug}`}
                className="rounded-pill border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        ) : null}
      </Container>

      {/* Montagens relacionadas */}
      {post.relatedBuilds.length > 0 ? (
        <Container className="mt-14 max-w-4xl">
          <h2 className="t-h2 mb-6">Montagens relacionadas</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {post.relatedBuilds.map((build) => (
              <BuildCard key={build.id} build={build} />
            ))}
          </div>
        </Container>
      ) : null}

      {/* Produtos relacionados */}
      {post.relatedProducts.length > 0 ? (
        <Container className="mt-14 max-w-4xl">
          <h2 className="t-h2 mb-6">Produtos citados</h2>
          <ProductCardGrid products={post.relatedProducts} />
        </Container>
      ) : null}

      {/* CTA discreto para setups */}
      {!hasRelated ? (
        <Container className="mt-14 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-card p-6">
            <div>
              <p className="font-display font-bold text-foreground">
                Pronto para montar o seu?
              </p>
              <p className="text-sm text-muted-foreground">
                Veja setups completos com lista de peças e alternativas.
              </p>
            </div>
            <Button variant="brand" render={<Link href="/montagens" />}>
              Ver Setups <ArrowRight className="size-4" />
            </Button>
          </div>
        </Container>
      ) : null}
    </article>
  );
}
