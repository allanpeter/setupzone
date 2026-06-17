import { Field, inputClass, textareaClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { asSpecs } from "@/lib/format";
import { saveProduct } from "@/app/(admin)/_actions/products";

type Product = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  status: string;
  isFeatured: boolean;
  isTrending: boolean;
  brandId: string | null;
  specs: unknown;
  audienceFor: string | null;
  audienceNotFor: string | null;
  pros: string[];
  cons: string[];
  editorialOpinion: string | null;
  verdict: string | null;
  verdictNote: string | null;
  categories: { id: string }[];
  media: { url: string }[];
  alternatives?: { id: string }[];
};

export function ProductForm({
  product,
  brands,
  categories,
  products = [],
}: {
  product?: Product;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  /** Other products, for the "Alternativas" multiselect. */
  products?: { id: string; name: string }[];
}) {
  const selectedCats = new Set(product?.categories.map((c) => c.id) ?? []);
  const selectedAlts = new Set(product?.alternatives?.map((a) => a.id) ?? []);
  const specsText = asSpecs(product?.specs)
    .map((s) => `${s.label}: ${s.value}`)
    .join("\n");

  return (
    <form action={saveProduct} className="space-y-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome">
          <input name="name" required defaultValue={product?.name} className={inputClass} />
        </Field>
        <Field label="Slug" hint="Deixe vazio para gerar do nome">
          <input name="slug" defaultValue={product?.slug} className={inputClass} />
        </Field>
      </div>

      <Field label="Descrição curta">
        <input name="shortDescription" defaultValue={product?.shortDescription ?? ""} className={inputClass} />
      </Field>

      <Field label="Descrição completa">
        <textarea name="description" rows={4} defaultValue={product?.description ?? ""} className={textareaClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Status">
          <select name="status" defaultValue={product?.status ?? "DRAFT"} className={inputClass}>
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="ARCHIVED">Arquivado</option>
          </select>
        </Field>
        <Field label="Marca">
          <select name="brandId" defaultValue={product?.brandId ?? ""} className={inputClass}>
            <option value="">Sem marca</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="URL da imagem">
          <input name="coverImageUrl" defaultValue={product?.media[0]?.url ?? ""} placeholder="https://" className={inputClass} />
        </Field>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Categorias</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <label
              key={c.id}
              className="inline-flex items-center gap-2 rounded-pill border border-border bg-card px-3 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/10"
            >
              <input
                type="checkbox"
                name="categoryIds"
                value={c.id}
                defaultChecked={selectedCats.has(c.id)}
                className="accent-primary"
              />
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-6">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} className="accent-primary" />
          Em destaque
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="isTrending" defaultChecked={product?.isTrending} className="accent-primary" />
          Em alta
        </label>
      </div>

      <Field label="Especificações" hint='Uma por linha, no formato "Rótulo: Valor"'>
        <textarea name="specs" rows={5} defaultValue={specsText} placeholder="CPU: Ryzen 5 5600&#10;RAM: 16GB DDR4" className={textareaClass} />
      </Field>

      {/* ── Conteúdo editorial ──────────────────────────────────── */}
      <div className="space-y-6 rounded-sticker border border-border bg-card/40 p-5">
        <p className="t-eyebrow">conteúdo editorial</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Para quem serve">
            <textarea name="audienceFor" rows={3} defaultValue={product?.audienceFor ?? ""} className={textareaClass} />
          </Field>
          <Field label="Para quem não serve">
            <textarea name="audienceNotFor" rows={3} defaultValue={product?.audienceNotFor ?? ""} className={textareaClass} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pontos positivos" hint="Um por linha">
            <textarea name="pros" rows={4} defaultValue={product?.pros.join("\n")} className={textareaClass} />
          </Field>
          <Field label="Pontos negativos" hint="Um por linha">
            <textarea name="cons" rows={4} defaultValue={product?.cons.join("\n")} className={textareaClass} />
          </Field>
        </div>

        <Field label="Nossa opinião">
          <textarea name="editorialOpinion" rows={4} defaultValue={product?.editorialOpinion ?? ""} className={textareaClass} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Vale a pena?">
            <select name="verdict" defaultValue={product?.verdict ?? ""} className={inputClass}>
              <option value="">Sem veredito</option>
              <option value="VALE">Vale a pena</option>
              <option value="NAO_VALE">Não vale a pena</option>
              <option value="DEPENDE">Depende</option>
            </select>
          </Field>
          <Field label="Justificativa do veredito">
            <input name="verdictNote" defaultValue={product?.verdictNote ?? ""} className={inputClass} />
          </Field>
        </div>

        {products.length > 0 ? (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">Alternativas</legend>
            <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
              {products.map((p) => (
                <label
                  key={p.id}
                  className="inline-flex items-center gap-2 rounded-pill border border-border bg-card px-3 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                >
                  <input
                    type="checkbox"
                    name="alternativeIds"
                    value={p.id}
                    defaultChecked={selectedAlts.has(p.id)}
                    className="accent-primary"
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
      </div>

      <Button type="submit" variant="brand" nativeButton>
        {product ? "Salvar produto" : "Criar produto"}
      </Button>
    </form>
  );
}
