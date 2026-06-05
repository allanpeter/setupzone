import { BuildForm } from "@/components/admin/build-form";
import { AdminHeader } from "@/components/admin/ui";

export default function NewBuild() {
  return (
    <div>
      <AdminHeader title="Nova montagem" />
      <BuildForm />
    </div>
  );
}
