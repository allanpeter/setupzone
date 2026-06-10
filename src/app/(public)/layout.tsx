import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

// Render the public catalog at request time, not at build. These pages read
// from the database (via @/lib/queries/*), so prerendering them during
// `next build` would require a live, migrated DB inside the build container.
// Keeping the build hermetic lets migrations run AFTER deploy (and unblocks
// future QA/preview environments). Add per-page caching later if needed.
export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
