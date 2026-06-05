import { notFound } from "next/navigation";
import { ComparisonForm } from "@/components/admin/comparison-form";
import { AdminHeader, Field, inputClass, textareaClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import {
  addComparisonItem,
  deleteComparisonItem,
} from "../../../_actions/comparisons";

export default async function EditComparison({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [comparison, products] = await Promise.all([
    db.comparison.findUnique({
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
  if (!comparison) notFound();

  return (
    <div>
      <AdminHeader
        title="Editar comparativo"
        action={{ label: "Ver no site", href: `/comparar/${comparison.slug}` }}
      />
      <ComparisonForm comparison={comparison} />

      <section className="mt-12">
        <h2 className="t-h2 mb-5">Produtos comparados</h2>

        {comparison.items.length > 0 ? (
          <ul className="mb-6 divide-y divide-border overflow-hidden rounded-sticker border border-border bg-card">
            {comparison.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.pros.length} prós · {item.cons.length} contras
                  </p>
                </div>
                <form action={deleteComparisonItem}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <input type="hidden" name="comparisonId" value={comparison.id} />
                  <Button type="submit" variant="destructive" size="sm" nativeButton>
                    Remover
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}

        <form action={addComparisonItem} className="space-y-3 rounded-sticker border border-border bg-card p-5">
          <input type="hidden" name="comparisonId" value={comparison.id} />
          <Field label="Produto">
            <select name="productId" required className={inputClass}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Prós" hint="Um por linha">
              <textarea name="pros" rows={3} className={textareaClass} />
            </Field>
            <Field label="Contras" hint="Um por linha">
              <textarea name="cons" rows={3} className={textareaClass} />
            </Field>
          </div>
          <Button type="submit" variant="brand" nativeButton>
            Adicionar produto
          </Button>
        </form>
      </section>
    </div>
  );
}
