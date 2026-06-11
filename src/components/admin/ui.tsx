import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="t-h1">{title}</h1>
        {description ? (
          <p className="mt-1 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Button variant="brand" render={<Link href={action.href} />}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-6 rounded-sticker border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
      {message}
    </div>
  );
}

export const inputClass =
  "h-9 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary";
export const textareaClass =
  "w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary";
