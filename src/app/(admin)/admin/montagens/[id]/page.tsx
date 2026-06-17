import { notFound } from "next/navigation";
import { BuildForm } from "@/components/admin/build-form";
import { AdminHeader, Field, FormError, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { addBuildItem, deleteBuildItem } from "../../../_actions/builds";

export default async function EditBuild({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [build, products] = await Promise.all([
    db.build.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { displayOrder: "asc" },
          include: { product: { select: { name: true } } },
        },
      },
    }),
    db.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!build) notFound();

  return (
    <div>
      <AdminHeader
        title="Editar montagem"
        action={{ label: "Ver no site", href: `/montagens/${build.slug}` }}
      />
      {error === "slug" ? (
        <FormError message="Já existe uma montagem com esse slug. Use um título/slug diferente." />
      ) : null}
      <BuildForm build={build} />

      <section className="mt-12">
        <h2 className="t-h2 mb-5">Itens da montagem</h2>

        {build.items.length > 0 ? (
          <ul className="mb-6 divide-y divide-border overflow-hidden rounded-sticker border border-border bg-card">
            {build.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{item.product.name}</p>
                  {item.role ? <p className="text-xs text-muted-foreground">{item.role}</p> : null}
                </div>
                <form action={deleteBuildItem}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <input type="hidden" name="buildId" value={build.id} />
                  <Button type="submit" variant="destructive" size="sm" nativeButton>
                    Remover
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}

        <form
          action={addBuildItem}
          className="grid items-end gap-3 rounded-sticker border border-border bg-card p-5 sm:grid-cols-2"
        >
          <input type="hidden" name="buildId" value={build.id} />
          <Field label="Produto">
            <select name="productId" required className={inputClass}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Função" hint="ex.: CPU, Fonte">
            <input name="role" className={inputClass} />
          </Field>
          <Field label="Alternativa mais barata">
            <select name="budgetAlternativeId" className={inputClass}>
              <option value="">—</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Alternativa premium">
            <select name="premiumAlternativeId" className={inputClass}>
              <option value="">—</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" variant="brand" nativeButton>
              Adicionar
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
