import DOMPurify from "isomorphic-dompurify";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { Container } from "@/components/section";
import { formatDate } from "@/lib/format";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
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

  return (
    <article className="py-10">
      <JsonLd
        data={[
          articleJsonLd({
            title: post.title,
            slug: post.slug,
            description: post.excerpt,
            image: post.coverImageUrl,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
            authorName: post.author?.name,
          }),
          breadcrumbJsonLd([
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <Container className="max-w-3xl">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
        </nav>

        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {post.category ? (
            <Link
              href={`/blog/categoria/${post.category.slug}`}
              className="font-semibold text-primary hover:underline"
            >
              {post.category.name}
            </Link>
          ) : null}
          {post.publishedAt ? <span>· {formatDate(post.publishedAt)}</span> : null}
          {post.readingMinutes ? <span>· {post.readingMinutes} min de leitura</span> : null}
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
    </article>
  );
}
