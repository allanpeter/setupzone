import Link from "next/link";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminHeader } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { deletePost } from "../../_actions/blog";

export default async function AdminBlog() {
  const posts = await db.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: { select: { name: true } } },
  });

  return (
    <div>
      <AdminHeader
        title="Blog"
        description="Artigos, guias e reviews."
        action={{ label: "Novo artigo", href: "/admin/blog/novo" }}
      />

      <ul className="divide-y divide-border overflow-hidden rounded-sticker border border-border bg-card">
        {posts.map((p) => (
          <li key={p.id} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{p.title}</p>
              <p className="text-xs text-muted-foreground">{p.category?.name ?? "Sem categoria"}</p>
            </div>
            <Badge variant={p.status === "PUBLISHED" ? "default" : "secondary"}>
              {p.status === "PUBLISHED" ? "Publicado" : p.status === "DRAFT" ? "Rascunho" : "Arquivado"}
            </Badge>
            <Button variant="outline" size="sm" render={<Link href={`/admin/blog/${p.id}`} />}>
              Editar
            </Button>
            <DeleteButton id={p.id} action={deletePost} />
          </li>
        ))}
      </ul>
      {posts.length === 0 ? <p className="mt-6 text-muted-foreground">Nenhum artigo ainda.</p> : null}
    </div>
  );
}
