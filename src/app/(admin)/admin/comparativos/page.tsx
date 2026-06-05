import Link from "next/link";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminHeader } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { deleteComparison } from "../../_actions/comparisons";

export default async function AdminComparisons() {
  const comparisons = await db.comparison.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <AdminHeader
        title="Comparativos"
        description="Comparações lado a lado."
        action={{ label: "Novo comparativo", href: "/admin/comparativos/novo" }}
      />

      <ul className="divide-y divide-border overflow-hidden rounded-sticker border border-border bg-card">
        {comparisons.map((c) => (
          <li key={c.id} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{c.title}</p>
              <p className="text-xs text-muted-foreground">{c._count.items} itens</p>
            </div>
            <Badge variant={c.status === "PUBLISHED" ? "default" : "secondary"}>
              {c.status === "PUBLISHED" ? "Publicado" : c.status === "DRAFT" ? "Rascunho" : "Arquivado"}
            </Badge>
            <Button variant="outline" size="sm" render={<Link href={`/admin/comparativos/${c.id}`} />}>
              Editar
            </Button>
            <DeleteButton id={c.id} action={deleteComparison} />
          </li>
        ))}
      </ul>
      {comparisons.length === 0 ? <p className="mt-6 text-muted-foreground">Nenhum comparativo ainda.</p> : null}
    </div>
  );
}
