/** Format an integer number of BRL cents as "R$ 1.299,00". */
export function formatBRL(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/** A Date `n` days in the past (kept out of render bodies for lint cleanliness). */
export function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

/** Compact date in pt-BR, e.g. "4 de jun. de 2026". */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/** Product spec JSON shape stored on Product.specs. */
export type ProductSpec = { label: string; value: string };

export function asSpecs(value: unknown): ProductSpec[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (s): s is ProductSpec =>
      !!s &&
      typeof s === "object" &&
      typeof (s as ProductSpec).label === "string" &&
      typeof (s as ProductSpec).value === "string",
  );
}
