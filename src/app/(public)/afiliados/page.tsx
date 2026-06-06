import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Divulgação de afiliados",
  description:
    "Transparência sobre o uso de links de afiliados no SetupZone e como isso afeta as recomendações.",
};

const points = [
  {
    title: "Como funciona",
    text: "Alguns links podem gerar comissão se a compra acontecer após o clique. Isso não altera o preço final para você.",
  },
  {
    title: "Critério editorial",
    text: "As recomendações devem continuar sendo baseadas em custo-benefício, disponibilidade e adequação ao uso.",
  },
  {
    title: "Transparência",
    text: "URLs de afiliado não devem aparecer cruas em páginas públicas; o redirecionamento interno faz essa intermediação.",
  },
];

export default function AfiliadosPage() {
  return (
    <Container className="py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="t-eyebrow mb-3">afiliados</p>
        <h1 className="t-display-md">Divulgação de afiliados</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          O SetupZone pode receber comissão por compras qualificadas feitas em lojas
          parceiras. Isso ajuda a manter o projeto sem cobrar do usuário final.
        </p>
      </header>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {points.map((item) => (
          <div key={item.title} className="rounded-sticker border border-border bg-card p-6 shadow-sticker-1">
            <h2 className="t-h3 mb-3">{item.title}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 max-w-3xl space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          As lojas parceiras atualmente incluem, por exemplo, AliExpress, Mercado
          Livre, Shopee e Amazon. A disponibilidade de links pode variar por produto
          e por campanha.
        </p>
        <p>
          Se um produto tiver múltiplas ofertas, o objetivo é exibir a opção mais
          útil para o contexto da página, e não simplesmente a que paga mais comissão.
        </p>
        <p>
          Você pode navegar normalmente sem clicar em nenhum link de afiliado.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button variant="brand" render={<Link href="/produtos" />}>
          Ver produtos
        </Button>
        <Button variant="outline" render={<Link href="/privacidade" />}>
          Ler privacidade
        </Button>
      </div>
    </Container>
  );
}
