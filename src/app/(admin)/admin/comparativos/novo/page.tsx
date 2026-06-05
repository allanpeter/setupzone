import { ComparisonForm } from "@/components/admin/comparison-form";
import { AdminHeader } from "@/components/admin/ui";

export default function NewComparison() {
  return (
    <div>
      <AdminHeader title="Novo comparativo" />
      <ComparisonForm />
    </div>
  );
}
