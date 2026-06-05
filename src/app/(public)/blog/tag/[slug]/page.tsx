import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { Container } from "@/components/section";
import { getBlogTag, listPosts } from "@/lib/queries/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getBlogTag(slug);
  if (!tag) return {};
  return { title: `#${tag.name} · Blog` };
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = await getBlogTag(slug);
  if (!tag) notFound();
  const posts = await listPosts({ tag: slug });

  return (
    <Container className="py-12">
      <header className="mb-8">
        <p className="t-eyebrow mb-3">tag</p>
        <h1 className="t-display-md">#{tag.name}</h1>
      </header>

      {posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhum artigo com esta tag ainda.</p>
      )}
    </Container>
  );
}
