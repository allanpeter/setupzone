import { jsonLdScript } from "@/lib/jsonld";

/** Inlines one or more JSON-LD objects as script tags. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(item)}
        />
      ))}
    </>
  );
}
