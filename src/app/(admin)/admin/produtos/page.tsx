import Link from "next/link";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminHeader } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { deleteProduct } from "../../_actions/products";

export default async function AdminProducts() {
  const products = await db.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: { brand: { select: { name: true } } },
  });

  return (
    <div>
      <AdminHeader
        title="Produtos"
        description="Gerencie o catálogo."
        action={{ label: "Novo produto", href: "/admin/produtos/novo" }}
      />

      <ul className="divide-y divide-border overflow-hidden rounded-sticker border border-border bg-card">
        {products.map((p) => (
          <li key={p.id} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.brand?.name ?? "Sem marca"} · {formatBRL(p.lowestPriceCents)}
              </p>
            </div>
            <Badge variant={p.status === "PUBLISHED" ? "default" : "secondary"}>
              {p.status === "PUBLISHED" ? "Publicado" : p.status === "DRAFT" ? "Rascunho" : "Arquivado"}
            </Badge>
            <Button variant="outline" size="sm" render={<Link href={`/admin/produtos/${p.id}`} />}>
              Editar
            </Button>
            <DeleteButton id={p.id} action={deleteProduct} />
          </li>
        ))}
      </ul>
      {products.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Nenhum produto ainda.</p>
      ) : null}
    </div>
  );
}
