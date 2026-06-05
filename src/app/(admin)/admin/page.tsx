import {
  FileText,
  GitCompare,
  Layers,
  MousePointerClick,
  Package,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { daysAgo } from "@/lib/format";

export default async function AdminDashboard() {
  const [products, builds, comparisons, posts, clicks7d] = await Promise.all([
    db.product.count(),
    db.build.count(),
    db.comparison.count(),
    db.blogPost.count(),
    db.affiliateClick.count({ where: { createdAt: { gte: daysAgo(7) } } }),
  ]);

  const cards = [
    { label: "Produtos", value: products, href: "/admin/produtos", icon: Package },
    { label: "Montagens", value: builds, href: "/admin/montagens", icon: Layers },
    { label: "Comparativos", value: comparisons, href: "/admin/comparativos", icon: GitCompare },
    { label: "Artigos", value: posts, href: "/admin/blog", icon: FileText },
    { label: "Cliques (7 dias)", value: clicks7d, href: "/admin/analytics", icon: MousePointerClick },
  ];

  return (
    <div>
      <h1 className="t-h1 mb-1">Dashboard</h1>
      <p className="mb-8 text-muted-foreground">Visão geral do conteúdo e desempenho.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="rounded-sticker border border-border bg-card p-5 shadow-sticker-1 transition-colors hover:border-primary/40"
            >
              <Icon className="mb-3 size-5 text-muted-foreground" />
              <p className="t-num text-3xl text-foreground">{c.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
