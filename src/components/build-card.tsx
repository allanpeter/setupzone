import { Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatBRL } from "@/lib/format";
import type { BuildCardData } from "@/lib/queries/builds";

export function BuildCard({ build }: { build: BuildCardData }) {
  return (
    <Link
      href={`/montagens/${build.slug}`}
      className="group flex flex-col overflow-hidden rounded-sticker border border-border bg-card shadow-sticker-1 transition-all hover:-translate-y-1 hover:shadow-sticker-3"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {build.coverImageUrl ? (
          <Image
            src={build.coverImageUrl}
            alt={build.title}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-bold leading-snug text-foreground">
          {build.title}
        </h3>
        {build.summary ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {build.summary}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Layers className="size-3.5" />
            {build._count.items} itens
          </span>
          {build.budgetCents ? (
            <span className="t-num text-base text-primary">
              {formatBRL(build.budgetCents)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
