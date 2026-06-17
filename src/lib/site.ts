/**
 * Global site configuration. Single source of truth for brand strings,
 * canonical URL, and primary navigation (pt-BR content).
 */
export const siteConfig = {
  name: "SetupZone",
  // Used in <title> templates and OpenGraph.
  tagline: "Monte seu setup sem comprar peça errada",
  description:
    "Guias, comparativos e montagens reais para homelab, infraestrutura, produtividade, IA local e gadgets — explicados por quem realmente usa. Recomendações para você montar setups melhores e evitar compras erradas.",
  locale: "pt-BR",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  themeColor: "#0FA958",
} as const;

/** Primary public navigation (pt-BR labels → routes). Foco editorial: montagens e guias primeiro. */
export const mainNav = [
  { label: "Montagens", href: "/montagens" },
  { label: "Guias", href: "/blog" },
  { label: "Comparativos", href: "/comparar" },
  { label: "Produtos", href: "/produtos" },
] as const;

/** Footer link groups. */
export const footerNav = [
  {
    title: "Explorar",
    links: [
      { label: "Montagens", href: "/montagens" },
      { label: "Guias e comparativos", href: "/blog" },
      { label: "Comparativos", href: "/comparar" },
      { label: "Produtos", href: "/produtos" },
    ],
  },
  {
    title: "Conteúdo",
    links: [
      { label: "Guias", href: "/blog" },
      { label: "Comece por aqui", href: "/#comece-por-aqui" },
      { label: "Buscar", href: "/busca" },
    ],
  },
  {
    title: "Sobre",
    links: [
      { label: "Sobre o projeto", href: "/sobre" },
      { label: "Privacidade", href: "/privacidade" },
      { label: "Divulgação de afiliados", href: "/afiliados" },
    ],
  },
] as const;
