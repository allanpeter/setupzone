import Link from "next/link";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminHeader, Field, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { deleteStore, saveStore } from "../../_actions/taxonomy";

export default async function AdminStores({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const stores = await db.store.findMany({ orderBy: { displayOrder: "asc" } });
  const editing = edit ? stores.find((s) => s.id === edit) : null;

  return (
    <div>
      <AdminHeader
        title="Lojas"
        description="Marketplaces de afiliados e seus códigos de rastreio."
      />

      <form
        action={saveStore}
        className="mb-8 grid gap-4 rounded-sticker border border-border bg-card p-5 sm:grid-cols-2"
      >
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
        <Field label="Nome">
          <input name="name" required defaultValue={editing?.name} className={inputClass} />
        </Field>
        <Field label="Slug" hint="ex.: aliexpress">
          <input name="slug" defaultValue={editing?.slug} className={inputClass} />
        </Field>
        <Field label="Cor da marca">
          <input name="brandColor" defaultValue={editing?.brandColor ?? ""} placeholder="#FA3E3E" className={inputClass} />
        </Field>
        <Field label="Código de rastreio">
          <input name="trackingCode" defaultValue={editing?.trackingCode ?? ""} className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Template de URL" hint="Opcional. Tokens: {url} e {trackingCode}">
            <input name="urlTemplate" defaultValue={editing?.urlTemplate ?? ""} className={inputClass} />
          </Field>
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" variant="brand" nativeButton>
            {editing ? "Salvar alterações" : "Criar loja"}
          </Button>
          {editing ? (
            <Button variant="outline" render={<Link href="/admin/lojas" />}>
              Cancelar
            </Button>
          ) : null}
        </div>
      </form>

      <ul className="divide-y divide-border overflow-hidden rounded-sticker border border-border bg-card">
        {stores.map((s) => (
          <li key={s.id} className="flex items-center gap-4 p-4">
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ background: s.brandColor ?? "var(--muted-foreground)" }}
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground">/{s.slug}</p>
            </div>
            <Button variant="outline" size="sm" render={<Link href={`/admin/lojas?edit=${s.id}`} />}>
              Editar
            </Button>
            <DeleteButton id={s.id} action={deleteStore} />
          </li>
        ))}
      </ul>
    </div>
  );
}
