import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/section";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Entenda o que é o SetupZone, como o catálogo é organizado e qual o objetivo do projeto.",
};

const pillars = [
  {
    title: "Curadoria prática",
    text: "Selecionamos produtos e montagens pensando em uso real: custo-benefício, disponibilidade e contexto de compra.",
  },
  {
    title: "Conteúdo em pt-BR",
    text: "O site é pensado para quem compra no Brasil, com foco em lojas, preços e linguagem local.",
  },
  {
    title: "Transparência",
    text: "Quando houver link de afiliado, isso é sinalizado. A ideia é recomendar com clareza, não empurrar produto.",
  },
];

export default function SobrePage() {
  return (
    <Container className="py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="t-eyebrow mb-3">sobre</p>
        <h1 className="t-display-md">{siteConfig.name}</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Um catálogo de afiliados e plataforma de conteúdo para ajudar a montar,
          comparar e comprar setups com menos tempo perdido em pesquisa.
        </p>
      </header>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {pillars.map((item) => (
          <div key={item.title} className="rounded-sticker border border-border bg-card p-6 shadow-sticker-1">
            <h2 className="t-h3 mb-3">{item.title}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 max-w-3xl space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          O foco do projeto é tecnologia: PC Gamer, homelab, redes, periféricos,
          impressão 3D, drones e gadgets. A navegação prioriza listas curadas,
          comparativos e páginas de conteúdo com SEO forte.
        </p>
        <p>
          A estrutura do site foi desenhada para crescer sem bagunça: produtos,
          montagens, comparativos e blog são entidades separadas, mas conectadas.
          Isso facilita edição, busca e atualização de preços ao longo do tempo.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button variant="brand" render={<Link href="/produtos" />}>
          Ver produtos
        </Button>
        <Button variant="outline" render={<Link href="/montagens" />}>
          Ver montagens
        </Button>
      </div>
    </Container>
  );
}
