import { ComparisonForm } from "@/components/admin/comparison-form";
import { AdminHeader, FormError } from "@/components/admin/ui";

export default async function NewComparison({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div>
      <AdminHeader title="Novo comparativo" />
      {error === "slug" ? (
        <FormError message="Já existe um comparativo com esse slug. Use um título/slug diferente." />
      ) : null}
      <ComparisonForm />
    </div>
  );
}
