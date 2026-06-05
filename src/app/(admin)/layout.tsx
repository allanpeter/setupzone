import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/auth-guard";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userName={session.user.name ?? session.user.email} />
      <div className="flex-1 overflow-x-hidden bg-background">
        <main className="mx-auto max-w-5xl p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
