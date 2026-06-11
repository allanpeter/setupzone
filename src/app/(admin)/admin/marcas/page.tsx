import Link from "next/link";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminHeader, Field, FormError, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { deleteBrand, saveBrand } from "../../_actions/taxonomy";

export default async function AdminBrands({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; error?: string }>;
}) {
  const { edit, error } = await searchParams;
  const brands = await db.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  const editing = edit ? brands.find((b) => b.id === edit) : null;

  return (
    <div>
      <AdminHeader title="Marcas" description="Fabricantes dos produtos." />

      {error === "slug" ? (
        <FormError message="Já existe uma marca com esse nome/slug. Use um nome diferente ou edite a existente." />
      ) : null}

      <form
        action={saveBrand}
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
          <Field label="Site">
            <input
              name="websiteUrl"
              defaultValue={editing?.websiteUrl ?? ""}
              placeholder="https://"
              className={inputClass}
            />
          </Field>
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" variant="brand" nativeButton>
            {editing ? "Salvar alterações" : "Criar marca"}
          </Button>
          {editing ? (
            <Button variant="outline" render={<Link href="/admin/marcas" />}>
              Cancelar
            </Button>
          ) : null}
        </div>
      </form>

      <ul className="divide-y divide-border overflow-hidden rounded-sticker border border-border bg-card">
        {brands.map((b) => (
          <li key={b.id} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{b.name}</p>
              <p className="text-xs text-muted-foreground">
                /{b.slug} · {b._count.products} produtos
              </p>
            </div>
            <Button variant="outline" size="sm" render={<Link href={`/admin/marcas?edit=${b.id}`} />}>
              Editar
            </Button>
            <DeleteButton id={b.id} action={deleteBrand} />
          </li>
        ))}
      </ul>
    </div>
  );
}
