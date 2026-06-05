import { AdminHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { daysAgo } from "@/lib/format";

export default async function AdminAnalytics() {
  const since30 = daysAgo(30);
  const since7 = daysAgo(7);

  const [total, last30, last7, byStoreRaw, byProductRaw] = await Promise.all([
    db.affiliateClick.count(),
    db.affiliateClick.count({ where: { createdAt: { gte: since30 } } }),
    db.affiliateClick.count({ where: { createdAt: { gte: since7 } } }),
    db.affiliateClick.groupBy({
      by: ["storeId"],
      _count: { _all: true },
      orderBy: { _count: { storeId: "desc" } },
    }),
    db.affiliateClick.groupBy({
      by: ["productId"],
      _count: { _all: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    }),
  ]);

  const storeIds = byStoreRaw.map((r) => r.storeId).filter(Boolean) as string[];
  const productIds = byProductRaw.map((r) => r.productId).filter(Boolean) as string[];
  const [stores, products] = await Promise.all([
    db.store.findMany({ where: { id: { in: storeIds } }, select: { id: true, name: true } }),
    db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } }),
  ]);
  const storeName = new Map(stores.map((s) => [s.id, s.name]));
  const productName = new Map(products.map((p) => [p.id, p.name]));

  const cards = [
    { label: "Total de cliques", value: total },
    { label: "Últimos 30 dias", value: last30 },
    { label: "Últimos 7 dias", value: last7 },
  ];

  return (
    <div>
      <AdminHeader title="Analytics" description="Cliques de afiliados." />

      <div className="mb-10 grid grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-sticker border border-border bg-card p-5 shadow-sticker-1">
            <p className="t-num text-3xl text-foreground">{c.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="t-h3 mb-4">Cliques por loja</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-sticker border border-border bg-card">
            {byStoreRaw.map((r) => (
              <li key={r.storeId ?? "none"} className="flex items-center justify-between p-4">
                <span className="text-sm text-foreground">
                  {r.storeId ? storeName.get(r.storeId) ?? "—" : "Desconhecida"}
                </span>
                <span className="t-num text-sm">{r._count._all}</span>
              </li>
            ))}
            {byStoreRaw.length === 0 ? (
              <li className="p-4 text-sm text-muted-foreground">Sem dados ainda.</li>
            ) : null}
          </ul>
        </section>

        <section>
          <h2 className="t-h3 mb-4">Top produtos</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-sticker border border-border bg-card">
            {byProductRaw.map((r) => (
              <li key={r.productId ?? "none"} className="flex items-center justify-between gap-4 p-4">
                <span className="min-w-0 truncate text-sm text-foreground">
                  {r.productId ? productName.get(r.productId) ?? "—" : "Desconhecido"}
                </span>
                <span className="t-num shrink-0 text-sm">{r._count._all}</span>
              </li>
            ))}
            {byProductRaw.length === 0 ? (
              <li className="p-4 text-sm text-muted-foreground">Sem dados ainda.</li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
