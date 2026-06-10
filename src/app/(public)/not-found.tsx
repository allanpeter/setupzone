import Link from "next/link";
import { Container } from "@/components/section";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="t-eyebrow mb-4">404</p>
      <h1 className="t-display-md mb-3">
        Esse <span className="text-neon-gradient">achado</span> sumiu
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        A página que você procura não existe ou foi movida. Que tal continuar
        explorando?
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="brand" render={<Link href="/" />}>
          Voltar à home
        </Button>
        <Button variant="outline" render={<Link href="/produtos" />}>
          Explorar produtos
        </Button>
      </div>
    </Container>
  );
}
