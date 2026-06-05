import { Field, inputClass, textareaClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { saveComparison } from "@/app/(admin)/_actions/comparisons";

type Comparison = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  verdict: string | null;
  status: string;
};

export function ComparisonForm({ comparison }: { comparison?: Comparison }) {
  return (
    <form action={saveComparison} className="space-y-6">
      {comparison ? <input type="hidden" name="id" value={comparison.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Título">
          <input name="title" required defaultValue={comparison?.title} className={inputClass} />
        </Field>
        <Field label="Slug" hint="Deixe vazio para gerar do título">
          <input name="slug" defaultValue={comparison?.slug} className={inputClass} />
        </Field>
      </div>

      <Field label="Resumo">
        <input name="summary" defaultValue={comparison?.summary ?? ""} className={inputClass} />
      </Field>

      <Field label="Recomendação / veredito">
        <textarea name="verdict" rows={3} defaultValue={comparison?.verdict ?? ""} className={textareaClass} />
      </Field>

      <Field label="Status">
        <select name="status" defaultValue={comparison?.status ?? "DRAFT"} className={`${inputClass} max-w-xs`}>
          <option value="DRAFT">Rascunho</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="ARCHIVED">Arquivado</option>
        </select>
      </Field>

      <Button type="submit" variant="brand" nativeButton>
        {comparison ? "Salvar comparativo" : "Criar comparativo"}
      </Button>
    </form>
  );
}
