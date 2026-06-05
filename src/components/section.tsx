import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Centered max-width container (matches prototype 1180px). */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

/** Vertical section rhythm wrapper. */
export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-14 sm:py-20", className)}>
      <Container>{children}</Container>
    </section>
  );
}

/** Eyebrow + title + optional "see all" link. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? <p className="t-eyebrow mb-3">{eyebrow}</p> : null}
        <h2 className="t-display-md">{title}</h2>
        {description ? (
          <p className="mt-3 text-lg text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {action.label} →
        </Link>
      ) : null}
    </div>
  );
}
