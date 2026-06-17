/**
 * "Comece por aqui" — editorial entry points (camada por cima da taxonomia).
 * Cada hub é um tema de autoridade do SetupZone. O `category` casa com o
 * rótulo editorial de Build.category (ver prisma/seed.ts) para filtrar montagens.
 * `icon` é uma chave resolvida em <HubCard/> para um ícone lucide.
 */
export type HubIcon =
  | "server"
  | "code"
  | "cpu"
  | "box"
  | "smartphone"
  | "zap";

export type Hub = {
  slug: string;
  title: string;
  description: string;
  /** Rótulo editorial usado em Build.category. */
  category: string;
  icon: HubIcon;
};

export const hubs: readonly Hub[] = [
  {
    slug: "homelab",
    title: "Homelab",
    description: "Servidores caseiros, virtualização e self-hosting.",
    category: "Homelab",
    icon: "server",
  },
  {
    slug: "setup-dev",
    title: "Setup Dev",
    description: "Estações de trabalho para programar com conforto.",
    category: "Setup Dev",
    icon: "code",
  },
  {
    slug: "ia-local",
    title: "IA Local",
    description: "Rodar modelos de IA na sua própria máquina.",
    category: "IA Local",
    icon: "cpu",
  },
  {
    slug: "impressao-3d",
    title: "Impressão 3D",
    description: "Impressoras, filamentos e acessórios.",
    category: "Impressão 3D",
    icon: "box",
  },
  {
    slug: "gadgets",
    title: "Gadgets",
    description: "Pequenos aparelhos que melhoram o dia a dia.",
    category: "Gadgets",
    icon: "smartphone",
  },
  {
    slug: "produtividade",
    title: "Produtividade",
    description: "Periféricos e acessórios para render mais.",
    category: "Produtividade",
    icon: "zap",
  },
] as const;

/** Link de um hub para a listagem de montagens filtrada por categoria. */
export const hubHref = (hub: Hub) =>
  `/montagens?categoria=${encodeURIComponent(hub.category)}`;
