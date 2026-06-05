import type { Metadata } from "next";
import { PostCard } from "@/components/post-card";
import { Container } from "@/components/section";
import { listPosts } from "@/lib/queries/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guias de compra, tutoriais de homelab e redes, reviews e comparativos de hardware.",
};

export default async function BlogPage() {
  const posts = await listPosts();

  return (
    <Container className="py-12">
      <header className="mb-8">
        <p className="t-eyebrow mb-3">blog</p>
        <h1 className="t-display-md">Guias, tutoriais e reviews</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Conteúdo prático para você montar, comparar e economizar.
        </p>
      </header>

      {posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhum artigo publicado ainda.</p>
      )}
    </Container>
  );
}
