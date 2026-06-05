/**
 * Global site configuration. Single source of truth for brand strings,
 * canonical URL, and primary navigation (pt-BR content).
 */
export const siteConfig = {
  name: "SetupZone",
  // Used in <title> templates and OpenGraph.
  tagline: "Setups prontos para comprar, comparados e atualizados",
  description:
    "Descubra setups completos de PC Gamer, Homelab, Impressoras 3D, Drones e Gadgets. Listas de peças curadas, comparação de preços entre AliExpress, Mercado Livre, Shopee e Amazon, e guias de montagem.",
  locale: "pt-BR",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  themeColor: "#0FA958",
} as const;

/** Primary public navigation (pt-BR labels → routes). */
export const mainNav = [
  { label: "Produtos", href: "/produtos" },
  { label: "Montagens", href: "/montagens" },
  { label: "Comparativos", href: "/comparar" },
  { label: "Blog", href: "/blog" },
] as const;

/** Footer link groups. */
export const footerNav = [
  {
    title: "Explorar",
    links: [
      { label: "Produtos", href: "/produtos" },
      { label: "Montagens", href: "/montagens" },
      { label: "Comparativos", href: "/comparar" },
      { label: "Categorias", href: "/produtos" },
    ],
  },
  {
    title: "Conteúdo",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Guias de montagem", href: "/blog" },
      { label: "Buscar", href: "/busca" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Sobre", href: "/sobre" },
      { label: "Privacidade", href: "/privacidade" },
      { label: "Divulgação de afiliados", href: "/afiliados" },
    ],
  },
] as const;
