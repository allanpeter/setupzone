import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { Container } from "@/components/section";
import { getBlogCategory, listPosts } from "@/lib/queries/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getBlogCategory(slug);
  if (!category) return {};
  return {
    title: `${category.name} · Blog`,
    description: category.description ?? undefined,
  };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getBlogCategory(slug);
  if (!category) notFound();
  const posts = await listPosts({ category: slug });

  return (
    <Container className="py-12">
      <header className="mb-8">
        <p className="t-eyebrow mb-3">categoria</p>
        <h1 className="t-display-md">{category.name}</h1>
        {category.description ? (
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {category.description}
          </p>
        ) : null}
      </header>

      {posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhum artigo nesta categoria ainda.</p>
      )}
    </Container>
  );
}
