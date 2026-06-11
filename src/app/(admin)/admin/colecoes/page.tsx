import Link from "next/link";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminHeader, Field, FormError, inputClass } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { deleteCollection, saveCollection } from "../../_actions/collections";

const KINDS = [
  { value: "SHELF", label: "Prateleira" },
  { value: "SETUP_OF_WEEK", label: "Setup da semana" },
  { value: "HIDDEN_GEMS", label: "Achados" },
  { value: "VIRAL", label: "Viralizou" },
  { value: "EDITORIAL", label: "Editorial" },
  { value: "BUYING_GUIDE", label: "Guia de compra" },
];

export default async function AdminCollections({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const collections = await db.collection.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <AdminHeader
        title="Coleções"
        description="Curadoria dos rails da home (Setup da semana, Achados, Viralizou…)."
      />

      {error === "slug" ? (
        <FormError message="Já existe uma coleção com esse slug. Use um título/slug diferente." />
      ) : null}

      <form
        action={saveCollection}
        className="mb-8 grid gap-4 rounded-card border border-border bg-card p-5 sm:grid-cols-2"
      >
        <Field label="Título">
          <input name="title" required className={inputClass} />
        </Field>
        <Field label="Slug" hint="Deixe vazio para gerar do título">
          <input name="slug" className={inputClass} />
        </Field>
        <Field label="Subtítulo">
          <input name="subtitle" className={inputClass} />
        </Field>
        <Field label="Tipo">
          <select name="kind" className={inputClass}>
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ordem">
          <input name="displayOrder" type="number" defaultValue={0} className={inputClass} />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue="PUBLISHED" className={inputClass}>
            <option value="PUBLISHED">Publicado</option>
            <option value="DRAFT">Rascunho</option>
            <option value="ARCHIVED">Arquivado</option>
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" variant="brand" nativeButton>
            Criar coleção
          </Button>
        </div>
      </form>

      <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
        {collections.map((c) => (
          <li key={c.id} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{c.title}</p>
              <p className="text-xs text-muted-foreground">
                /{c.slug} · {c._count.items} itens
              </p>
            </div>
            <Badge variant="secondary">{c.kind}</Badge>
            <Button variant="outline" size="sm" render={<Link href={`/admin/colecoes/${c.id}`} />}>
              Editar
            </Button>
            <DeleteButton id={c.id} action={deleteCollection} />
          </li>
        ))}
      </ul>
      {collections.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Nenhuma coleção ainda.</p>
      ) : null}
    </div>
  );
}
