import Link from "next/link";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminHeader, Field, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { deleteCategory, saveCategory } from "../../_actions/taxonomy";

export default async function AdminCategories({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const categories = await db.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  const editing = edit ? categories.find((c) => c.id === edit) : null;

  return (
    <div>
      <AdminHeader title="Categorias" description="Organize os produtos por categoria." />

      <form
        action={saveCategory}
        className="mb-8 grid gap-4 rounded-sticker border border-border bg-card p-5 sm:grid-cols-2"
      >
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
        <Field label="Nome">
          <input name="name" required defaultValue={editing?.name} className={inputClass} />
        </Field>
        <Field label="Slug" hint="Deixe vazio para gerar do nome">
          <input name="slug" defaultValue={editing?.slug} className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Descrição">
            <input
              name="description"
              defaultValue={editing?.description ?? ""}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" variant="brand" nativeButton>
            {editing ? "Salvar alterações" : "Criar categoria"}
          </Button>
          {editing ? (
            <Button variant="outline" render={<Link href="/admin/categorias" />}>
              Cancelar
            </Button>
          ) : null}
        </div>
      </form>

      <ul className="divide-y divide-border overflow-hidden rounded-sticker border border-border bg-card">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{c.name}</p>
              <p className="text-xs text-muted-foreground">
                /{c.slug} · {c._count.products} produtos
              </p>
            </div>
            <Button variant="outline" size="sm" render={<Link href={`/admin/categorias?edit=${c.id}`} />}>
              Editar
            </Button>
            <DeleteButton id={c.id} action={deleteCategory} />
          </li>
        ))}
      </ul>
    </div>
  );
}
