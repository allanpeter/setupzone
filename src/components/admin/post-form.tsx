import { Field, inputClass, textareaClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { savePost } from "@/app/(admin)/_actions/blog";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  status: string;
  categoryId: string | null;
  readingMinutes: number | null;
  tags: { name: string }[];
};

export function PostForm({
  post,
  categories,
}: {
  post?: Post;
  categories: { id: string; name: string }[];
}) {
  return (
    <form action={savePost} className="space-y-6">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Título">
          <input name="title" required defaultValue={post?.title} className={inputClass} />
        </Field>
        <Field label="Slug" hint="Deixe vazio para gerar do título">
          <input name="slug" defaultValue={post?.slug} className={inputClass} />
        </Field>
      </div>

      <Field label="Resumo">
        <input name="excerpt" defaultValue={post?.excerpt ?? ""} className={inputClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Status">
          <select name="status" defaultValue={post?.status ?? "DRAFT"} className={inputClass}>
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="ARCHIVED">Arquivado</option>
          </select>
        </Field>
        <Field label="Categoria">
          <select name="categoryId" defaultValue={post?.categoryId ?? ""} className={inputClass}>
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tempo de leitura (min)">
          <input name="readingMinutes" type="number" defaultValue={post?.readingMinutes ?? ""} className={inputClass} />
        </Field>
      </div>

      <Field label="URL da imagem de capa">
        <input name="coverImageUrl" defaultValue={post?.coverImageUrl ?? ""} placeholder="https://" className={inputClass} />
      </Field>

      <Field label="Tags" hint="Separadas por vírgula">
        <input name="tags" defaultValue={post?.tags.map((t) => t.name).join(", ")} className={inputClass} />
      </Field>

      <Field label="Conteúdo (HTML)" hint="Aceita HTML. Um editor rico pode ser plugado aqui.">
        <textarea name="content" rows={14} defaultValue={post?.content} className={`${textareaClass} font-mono text-xs`} />
      </Field>

      <Button type="submit" variant="brand" nativeButton>
        {post ? "Salvar artigo" : "Criar artigo"}
      </Button>
    </form>
  );
}
