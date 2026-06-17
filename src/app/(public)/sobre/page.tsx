import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/section";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "O SetupZone é mantido por um profissional de tecnologia que trabalha com desenvolvimento, infraestrutura, cloud, homelab e IA. Experiências reais e pesquisa aprofundada para você montar setups melhores.",
  openGraph: {
    title: `Sobre · ${siteConfig.name}`,
    description:
      "Experiências reais e pesquisa aprofundada para você montar setups melhores e evitar compras erradas.",
  },
};

export default function SobrePage() {
  return (
    <Container className="py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="t-eyebrow mb-3">sobre</p>
        <h1 className="t-display-md">Tecnologia explicada por quem usa</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          O {siteConfig.name} nasceu de uma frustração simples: comprar a peça
          errada. Aqui eu compartilho as montagens, comparativos e decisões que
          tomo no meu próprio dia a dia com tecnologia.
        </p>
      </header>

      <section className="mt-10 max-w-3xl space-y-4 text-base leading-7 text-muted-foreground">
        <p>
          Trabalho com desenvolvimento de software, infraestrutura, cloud,
          homelab, automação e IA. No caminho, montei (e remontei) servidores
          caseiros, estações de trabalho, laboratórios de rede e ambientes para
          rodar modelos de IA localmente — quase sempre testando na prática o que
          funciona e o que é desperdício de dinheiro.
        </p>
        <p>
          O objetivo do site não é vender o máximo de produtos. É ajudar você a
          montar um setup melhor, com recomendações honestas: o que serve, o que
          não serve, onde economizar e onde vale gastar mais. Cada montagem e cada
          guia parte de uso real e pesquisa aprofundada — não de uma tabela de
          afiliados.
        </p>
        <p>
          Quando há link de afiliado, isso é sempre sinalizado. Ele ajuda a manter
          o projeto no ar, mas nunca define qual produto eu recomendo. Se algo não
          vale a pena, eu digo que não vale.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button variant="brand" render={<Link href="/montagens" />}>
          Ver Setups <ArrowRight className="size-4" />
        </Button>
        <Button variant="outline" render={<Link href="/blog" />}>
          Explorar Guias
        </Button>
      </div>

      <p className="mt-10 max-w-3xl text-sm text-muted-foreground">
        Quer sugerir uma montagem ou comparativo? Veja a{" "}
        <Link href="/afiliados" className="text-accent hover:underline">
          divulgação de afiliados
        </Link>{" "}
        e a{" "}
        <Link href="/privacidade" className="text-accent hover:underline">
          política de privacidade
        </Link>
        .
      </p>
    </Container>
  );
}
