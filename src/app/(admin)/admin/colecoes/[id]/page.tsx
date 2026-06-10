import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader, Field, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import {
  addCollectionItem,
  deleteCollectionItem,
  saveCollection,
} from "../../../_actions/collections";

const KINDS = [
  { value: "SHELF", label: "Prateleira" },
  { value: "SETUP_OF_WEEK", label: "Setup da semana" },
  { value: "HIDDEN_GEMS", label: "Achados" },
  { value: "VIRAL", label: "Viralizou" },
  { value: "EDITORIAL", label: "Editorial" },
  { value: "BUYING_GUIDE", label: "Guia de compra" },
];

export default async function EditCollection({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [collection, products, builds] = await Promise.all([
    db.collection.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { displayOrder: "asc" },
          include: {
            product: { select: { name: true } },
            build: { select: { title: true } },
          },
        },
      },
    }),
    db.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.build.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);
  if (!collection) notFound();

  return (
    <div>
      <AdminHeader title="Editar coleção" />

      <form action={saveCollection} className="grid gap-4 rounded-card border border-border bg-card p-5 sm:grid-cols-2">
        <input type="hidden" name="id" value={collection.id} />
        <Field label="Título">
          <input name="title" required defaultValue={collection.title} className={inputClass} />
        </Field>
        <Field label="Slug">
          <input name="slug" defaultValue={collection.slug} className={inputClass} />
        </Field>
        <Field label="Subtítulo">
          <input name="subtitle" defaultValue={collection.subtitle ?? ""} className={inputClass} />
        </Field>
        <Field label="Tipo">
          <select name="kind" defaultValue={collection.kind} className={inputClass}>
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Ordem">
          <input name="displayOrder" type="number" defaultValue={collection.displayOrder} className={inputClass} />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={collection.status} className={inputClass}>
            <option value="PUBLISHED">Publicado</option>
            <option value="DRAFT">Rascunho</option>
            <option value="ARCHIVED">Arquivado</option>
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" variant="brand" nativeButton>Salvar coleção</Button>
        </div>
      </form>

      <section className="mt-12">
        <h2 className="t-h2 mb-5">Itens</h2>

        {collection.items.length > 0 ? (
          <ul className="mb-6 divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
            {collection.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 p-4">
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                  {item.product?.name ?? item.build?.title ?? "—"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.product ? "Produto" : "Montagem"}
                </span>
                <form action={deleteCollectionItem}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <input type="hidden" name="collectionId" value={collection.id} />
                  <Button type="submit" variant="destructive" size="sm" nativeButton>
                    Remover
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}

        <form action={addCollectionItem} className="flex items-end gap-3 rounded-card border border-border bg-card p-5">
          <input type="hidden" name="collectionId" value={collection.id} />
          <Field label="Adicionar produto ou montagem">
            <select name="ref" required className={`${inputClass} min-w-[280px]`}>
              <optgroup label="Produtos">
                {products.map((p) => (
                  <option key={p.id} value={`product:${p.id}`}>{p.name}</option>
                ))}
              </optgroup>
              <optgroup label="Montagens">
                {builds.map((b) => (
                  <option key={b.id} value={`build:${b.id}`}>{b.title}</option>
                ))}
              </optgroup>
            </select>
          </Field>
          <Button type="submit" variant="brand" nativeButton>Adicionar</Button>
        </form>
      </section>

      <div className="mt-8">
        <Button variant="outline" render={<Link href="/admin/colecoes" />}>← Voltar</Button>
      </div>
    </div>
  );
}
