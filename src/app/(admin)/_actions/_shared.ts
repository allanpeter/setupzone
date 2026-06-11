import { redirect } from "next/navigation";

/** Prisma unique-constraint violation (duplicate slug, etc.). */
export function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: string }).code === "P2002"
  );
}

/**
 * Bounce back to a form page flagging a duplicate slug, so the UI can show a
 * friendly message instead of crashing on the Prisma unique-constraint error.
 */
export function slugTakenRedirect(path: string): never {
  const params = new URLSearchParams({ error: "slug" });
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}${params.toString()}`);
}
