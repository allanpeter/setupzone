import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { Button } from "@/components/ui/button";

/**
 * Estado vazio elegante — evita a sensação de "site vazio / catálogo automático".
 * Use quando uma seção não tem conteúdo ainda, em vez de simplesmente sumir.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-card/40 px-6 py-14 text-center">
      {Icon ? (
        <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground">
          <Icon className="size-5" />
        </span>
      ) : null}
      <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? (
        <Button
          variant="outline"
          size="sm"
          className="mt-5"
          render={<Link href={action.href} />}
        >
          {action.label}
        </Button>
      ) : null}
      {children}
    </div>
  );
}
