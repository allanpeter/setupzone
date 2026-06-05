import { Field, inputClass, textareaClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { saveBuild } from "@/app/(admin)/_actions/builds";

type Build = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  coverImageUrl: string | null;
  budgetCents: number | null;
  status: string;
  isFeatured: boolean;
  pros: string[];
  cons: string[];
};

export function BuildForm({ build }: { build?: Build }) {
  return (
    <form action={saveBuild} className="space-y-6">
      {build ? <input type="hidden" name="id" value={build.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Título">
          <input name="title" required defaultValue={build?.title} className={inputClass} />
        </Field>
        <Field label="Slug" hint="Deixe vazio para gerar do título">
          <input name="slug" defaultValue={build?.slug} className={inputClass} />
        </Field>
      </div>

      <Field label="Resumo">
        <input name="summary" defaultValue={build?.summary ?? ""} className={inputClass} />
      </Field>

      <Field label="Descrição">
        <textarea name="description" rows={3} defaultValue={build?.description ?? ""} className={textareaClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Status">
          <select name="status" defaultValue={build?.status ?? "DRAFT"} className={inputClass}>
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="ARCHIVED">Arquivado</option>
          </select>
        </Field>
        <Field label="Orçamento (R$)">
          <input name="budgetReais" defaultValue={build?.budgetCents ? (build.budgetCents / 100).toString() : ""} className={inputClass} />
        </Field>
        <Field label="URL da capa">
          <input name="coverImageUrl" defaultValue={build?.coverImageUrl ?? ""} placeholder="https://" className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prós" hint="Um por linha">
          <textarea name="pros" rows={4} defaultValue={build?.pros.join("\n")} className={textareaClass} />
        </Field>
        <Field label="Contras" hint="Um por linha">
          <textarea name="cons" rows={4} defaultValue={build?.cons.join("\n")} className={textareaClass} />
        </Field>
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" name="isFeatured" defaultChecked={build?.isFeatured} className="accent-primary" />
        Em destaque
      </label>

      <div>
        <Button type="submit" variant="brand" nativeButton>
          {build ? "Salvar montagem" : "Criar montagem"}
        </Button>
      </div>
    </form>
  );
}
