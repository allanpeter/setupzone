import { BuildForm } from "@/components/admin/build-form";
import { AdminHeader, FormError } from "@/components/admin/ui";

export default async function NewBuild({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div>
      <AdminHeader title="Nova montagem" />
      {error === "slug" ? (
        <FormError message="Já existe uma montagem com esse slug. Use um título/slug diferente." />
      ) : null}
      <BuildForm />
    </div>
  );
}
