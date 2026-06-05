import Link from "next/link";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminHeader } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { deleteBuild } from "../../_actions/builds";

export default async function AdminBuilds() {
  const builds = await db.build.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <AdminHeader
        title="Montagens"
        description="Setups completos com lista de peças."
        action={{ label: "Nova montagem", href: "/admin/montagens/novo" }}
      />

      <ul className="divide-y divide-border overflow-hidden rounded-sticker border border-border bg-card">
        {builds.map((b) => (
          <li key={b.id} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{b.title}</p>
              <p className="text-xs text-muted-foreground">{b._count.items} itens</p>
            </div>
            <Badge variant={b.status === "PUBLISHED" ? "default" : "secondary"}>
              {b.status === "PUBLISHED" ? "Publicado" : b.status === "DRAFT" ? "Rascunho" : "Arquivado"}
            </Badge>
            <Button variant="outline" size="sm" render={<Link href={`/admin/montagens/${b.id}`} />}>
              Editar
            </Button>
            <DeleteButton id={b.id} action={deleteBuild} />
          </li>
        ))}
      </ul>
      {builds.length === 0 ? <p className="mt-6 text-muted-foreground">Nenhuma montagem ainda.</p> : null}
    </div>
  );
}
