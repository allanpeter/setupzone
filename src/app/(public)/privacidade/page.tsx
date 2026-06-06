import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacidade",
  description:
    "Política de privacidade do SetupZone: dados coletados, uso de cookies e tracking de afiliados.",
};

const sections = [
  {
    title: "O que coletamos",
    text: "Podemos registrar dados técnicos básicos como navegador, página de origem e eventos de clique em links de afiliado.",
  },
  {
    title: "Como usamos",
    text: "Os dados servem para analytics, melhoria do conteúdo, medição de conversão e prevenção de abuso.",
  },
  {
    title: "IP e privacidade",
    text: "Quando aplicável, o IP é tratado de forma minimizada e pode ser armazenado apenas como hash com salt configurável.",
  },
];

export default function PrivacidadePage() {
  return (
    <Container className="py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="t-eyebrow mb-3">privacidade</p>
        <h1 className="t-display-md">Política de privacidade</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Esta página resume como o SetupZone lida com dados de navegação, cliques e
          cookies. Ela deve ser revisada quando a operação entrar em produção.
        </p>
      </header>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {sections.map((item) => (
          <div key={item.title} className="rounded-sticker border border-border bg-card p-6 shadow-sticker-1">
            <h2 className="t-h3 mb-3">{item.title}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 max-w-3xl space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          O site pode usar cookies ou armazenamento local para manter sessão do painel,
          melhorar experiência de navegação e lembrar preferências de interface.
        </p>
        <p>
          Links de afiliado são intermediados por rotas internas de redirecionamento,
          para evitar expor URLs cruas diretamente no HTML. Isso também ajuda a medir
          cliques de forma agregada.
        </p>
        <p>
          Se você quiser remover dados vinculados à sua navegação, entre em contato
          pelo canal de suporte do projeto ou pela área administrativa, se aplicável.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button variant="brand" render={<Link href="/" />}>
          Voltar para a home
        </Button>
      </div>
    </Container>
  );
}
