/**
 * Seed: stores, categories, brands, products (with media/links/prices),
 * one build, one comparison, and a blog post. Idempotent via upsert on slug.
 *
 * Run: pnpm db:seed
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const img = (slug: string) => `https://picsum.photos/seed/${slug}/1000/750`;
const brl = (reais: number) => Math.round(reais * 100);

async function main() {
  console.log("🌱 Seeding SetupZone...");

  // ── Stores ──────────────────────────────────────────────────────────
  const storeData = [
    { slug: "aliexpress", name: "AliExpress", brandColor: "#FA3E3E", order: 1 },
    { slug: "mercadolivre", name: "Mercado Livre", brandColor: "#FFE600", order: 2 },
    { slug: "shopee", name: "Shopee", brandColor: "#EE4D2D", order: 3 },
    { slug: "amazon", name: "Amazon", brandColor: "#FF9900", order: 4 },
  ];
  const stores: Record<string, string> = {};
  for (const s of storeData) {
    const store = await db.store.upsert({
      where: { slug: s.slug },
      update: { name: s.name, brandColor: s.brandColor, displayOrder: s.order },
      create: {
        slug: s.slug,
        name: s.name,
        brandColor: s.brandColor,
        displayOrder: s.order,
      },
    });
    stores[s.slug] = store.id;
  }

  // ── Categories ──────────────────────────────────────────────────────
  const categoryData = [
    { slug: "pc-gamer", name: "PC Gamer", order: 1 },
    { slug: "homelab", name: "Homelab", order: 2 },
    { slug: "mini-pcs", name: "Mini PCs", order: 3 },
    { slug: "redes", name: "Redes", order: 4 },
    { slug: "armazenamento", name: "Armazenamento", order: 5 },
    { slug: "perifericos", name: "Periféricos", order: 6 },
    { slug: "impressao-3d", name: "Impressão 3D", order: 7 },
    { slug: "drones", name: "Drones", order: 8 },
    { slug: "gadgets", name: "Gadgets", order: 9 },
  ];
  const cats: Record<string, string> = {};
  for (const c of categoryData) {
    const cat = await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, displayOrder: c.order },
      create: { slug: c.slug, name: c.name, displayOrder: c.order },
    });
    cats[c.slug] = cat.id;
  }

  // ── Brands ──────────────────────────────────────────────────────────
  const brandData = [
    { slug: "beelink", name: "Beelink" },
    { slug: "kingston", name: "Kingston" },
    { slug: "xiaomi", name: "Xiaomi" },
    { slug: "amd", name: "AMD" },
    { slug: "logitech", name: "Logitech" },
    { slug: "creality", name: "Creality" },
    { slug: "ugreen", name: "UGREEN" },
  ];
  const brands: Record<string, string> = {};
  for (const b of brandData) {
    const brand = await db.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name },
      create: { slug: b.slug, name: b.name },
    });
    brands[b.slug] = brand.id;
  }

  // ── Products ────────────────────────────────────────────────────────
  type Spec = { label: string; value: string };
  type ProductSeed = {
    slug: string;
    name: string;
    short: string;
    brand: keyof typeof brands | null;
    categories: string[];
    specs: Spec[];
    featured?: boolean;
    trending?: boolean;
    prices: { store: string; reais: number }[]; // first = primary
  };

  const products: ProductSeed[] = [
    {
      slug: "mini-pc-beelink-ser5",
      name: "Mini PC Beelink SER5 (Ryzen 5 5560U, 16GB, 500GB)",
      short: "Mini PC compacto e silencioso, ótimo para homelab e mídia.",
      brand: "beelink",
      categories: ["mini-pcs", "homelab"],
      featured: true,
      trending: true,
      specs: [
        { label: "CPU", value: "AMD Ryzen 5 5560U (6c/12t)" },
        { label: "RAM", value: "16GB DDR4" },
        { label: "Armazenamento", value: "500GB NVMe" },
        { label: "Rede", value: "2.5GbE + Wi-Fi 6" },
      ],
      prices: [
        { store: "aliexpress", reais: 1299 },
        { store: "mercadolivre", reais: 1499 },
        { store: "amazon", reais: 1599 },
      ],
    },
    {
      slug: "ssd-kingston-nv2-1tb",
      name: "SSD NVMe Kingston NV2 1TB PCIe 4.0",
      short: "Armazenamento rápido e barato para qualquer build.",
      brand: "kingston",
      categories: ["armazenamento", "pc-gamer"],
      trending: true,
      specs: [
        { label: "Capacidade", value: "1TB" },
        { label: "Interface", value: "PCIe 4.0 x4 NVMe" },
        { label: "Leitura", value: "até 3500 MB/s" },
      ],
      prices: [
        { store: "aliexpress", reais: 379 },
        { store: "shopee", reais: 399 },
        { store: "mercadolivre", reais: 449 },
      ],
    },
    {
      slug: "roteador-xiaomi-ax3000",
      name: "Roteador Xiaomi AX3000 Wi-Fi 6",
      short: "Wi-Fi 6 acessível, ideal para casa e laboratório.",
      brand: "xiaomi",
      categories: ["redes"],
      featured: true,
      specs: [
        { label: "Padrão", value: "Wi-Fi 6 (802.11ax)" },
        { label: "Velocidade", value: "até 3000 Mbps" },
        { label: "Portas", value: "3x Gigabit LAN" },
      ],
      prices: [
        { store: "aliexpress", reais: 289 },
        { store: "mercadolivre", reais: 349 },
      ],
    },
    {
      slug: "amd-ryzen-5-5600",
      name: "Processador AMD Ryzen 5 5600",
      short: "Custo-benefício imbatível para PC gamer 1080p.",
      brand: "amd",
      categories: ["pc-gamer"],
      featured: true,
      trending: true,
      specs: [
        { label: "Núcleos", value: "6 núcleos / 12 threads" },
        { label: "Clock", value: "3.5 / 4.4 GHz" },
        { label: "Socket", value: "AM4" },
        { label: "TDP", value: "65W" },
      ],
      prices: [
        { store: "aliexpress", reais: 649 },
        { store: "mercadolivre", reais: 729 },
        { store: "amazon", reais: 769 },
      ],
    },
    {
      slug: "mouse-logitech-g203",
      name: "Mouse Gamer Logitech G203 LIGHTSYNC",
      short: "Mouse leve e preciso com RGB para o setup.",
      brand: "logitech",
      categories: ["perifericos", "pc-gamer"],
      specs: [
        { label: "Sensor", value: "8000 DPI" },
        { label: "Botões", value: "6 programáveis" },
        { label: "RGB", value: "LIGHTSYNC" },
      ],
      prices: [
        { store: "mercadolivre", reais: 149 },
        { store: "amazon", reais: 159 },
      ],
    },
    {
      slug: "impressora-creality-ender-3-v3",
      name: "Impressora 3D Creality Ender-3 V3 SE",
      short: "Entrada perfeita para impressão 3D com auto-nivelamento.",
      brand: "creality",
      categories: ["impressao-3d"],
      trending: true,
      specs: [
        { label: "Volume", value: "220 x 220 x 250 mm" },
        { label: "Velocidade", value: "até 250 mm/s" },
        { label: "Nivelamento", value: "Automático (CR Touch)" },
      ],
      prices: [
        { store: "aliexpress", reais: 1099 },
        { store: "shopee", reais: 1199 },
      ],
    },
    {
      slug: "hub-ugreen-usb-c-6em1",
      name: "Hub UGREEN USB-C 6 em 1",
      short: "Expanda seu notebook ou mini PC com HDMI 4K e USB 3.0.",
      brand: "ugreen",
      categories: ["gadgets", "perifericos"],
      specs: [
        { label: "Portas", value: "HDMI 4K, 3x USB 3.0, SD/TF" },
        { label: "Carga", value: "PD 100W passthrough" },
      ],
      prices: [
        { store: "aliexpress", reais: 159 },
        { store: "shopee", reais: 179 },
      ],
    },
    {
      slug: "memoria-kingston-fury-16gb-ddr4",
      name: "Memória Kingston FURY Beast 16GB DDR4 3200MHz",
      short: "16GB para multitarefa e jogos sem travar.",
      brand: "kingston",
      categories: ["pc-gamer", "armazenamento"],
      specs: [
        { label: "Capacidade", value: "16GB (1x16)" },
        { label: "Velocidade", value: "3200 MHz" },
        { label: "Tipo", value: "DDR4" },
      ],
      prices: [
        { store: "aliexpress", reais: 219 },
        { store: "mercadolivre", reais: 259 },
      ],
    },
  ];

  const productIds: Record<string, string> = {};
  for (const p of products) {
    const lowest = brl(Math.min(...p.prices.map((x) => x.reais)));
    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        shortDescription: p.short,
        specs: p.specs,
        status: "PUBLISHED",
        isFeatured: p.featured ?? false,
        isTrending: p.trending ?? false,
        lowestPriceCents: lowest,
        brandId: p.brand ? brands[p.brand] : null,
        publishedAt: new Date(),
        categories: { set: p.categories.map((c) => ({ id: cats[c] })) },
      },
      create: {
        slug: p.slug,
        name: p.name,
        shortDescription: p.short,
        description: p.short,
        specs: p.specs,
        status: "PUBLISHED",
        isFeatured: p.featured ?? false,
        isTrending: p.trending ?? false,
        lowestPriceCents: lowest,
        brandId: p.brand ? brands[p.brand] : null,
        publishedAt: new Date(),
        categories: { connect: p.categories.map((c) => ({ id: cats[c] })) },
      },
    });
    productIds[p.slug] = product.id;

    // Media (single cover for now)
    await db.mediaAsset.deleteMany({ where: { productId: product.id } });
    await db.mediaAsset.create({
      data: {
        productId: product.id,
        url: img(p.slug),
        alt: p.name,
        width: 1000,
        height: 750,
        displayOrder: 0,
      },
    });

    // Affiliate links + current prices per store
    for (const [i, price] of p.prices.entries()) {
      const storeId = stores[price.store];
      await db.affiliateLink.upsert({
        where: {
          productId_storeId_label: {
            productId: product.id,
            storeId,
            label: "",
          },
        },
        update: { url: `https://example.com/${price.store}/${p.slug}`, isPrimary: i === 0 },
        create: {
          productId: product.id,
          storeId,
          url: `https://example.com/${price.store}/${p.slug}`,
          label: "",
          isPrimary: i === 0,
        },
      });

      // Refresh current price snapshot
      await db.productPrice.updateMany({
        where: { productId: product.id, storeId, isCurrent: true },
        data: { isCurrent: false },
      });
      await db.productPrice.create({
        data: {
          productId: product.id,
          storeId,
          priceCents: brl(price.reais),
          currency: "BRL",
          isCurrent: true,
        },
      });
    }
  }

  // ── Build ───────────────────────────────────────────────────────────
  const build = await db.build.upsert({
    where: { slug: "homelab-proxmox-starter" },
    update: {},
    create: {
      slug: "homelab-proxmox-starter",
      title: "Homelab Proxmox Starter",
      summary:
        "Um homelab silencioso e econômico para rodar Proxmox, containers e VMs.",
      description:
        "Setup inicial de homelab focado em baixo consumo e flexibilidade. Roda Proxmox com folga para VMs e dezenas de containers.",
      coverImageUrl: img("homelab-proxmox-starter"),
      budgetCents: brl(1900),
      status: "PUBLISHED",
      isFeatured: true,
      pros: ["Baixo consumo de energia", "Silencioso", "Fácil de expandir"],
      cons: ["Armazenamento inicial limitado"],
      publishedAt: new Date(),
    },
  });
  await db.buildItem.deleteMany({ where: { buildId: build.id } });
  await db.buildItem.createMany({
    data: [
      { buildId: build.id, productId: productIds["mini-pc-beelink-ser5"], role: "Mini PC", displayOrder: 0 },
      { buildId: build.id, productId: productIds["ssd-kingston-nv2-1tb"], role: "Armazenamento", displayOrder: 1 },
      { buildId: build.id, productId: productIds["roteador-xiaomi-ax3000"], role: "Rede", displayOrder: 2 },
    ],
  });

  // ── Comparison ──────────────────────────────────────────────────────
  const comparison = await db.comparison.upsert({
    where: { slug: "ssd-vs-memoria-prioridade-upgrade" },
    update: {},
    create: {
      slug: "ssd-vs-memoria-prioridade-upgrade",
      title: "SSD NVMe vs Memória: qual upgrade fazer primeiro?",
      summary: "Comparamos custo e impacto de dois upgrades populares.",
      verdict:
        "Se o PC já tem 8GB+, priorize o SSD NVMe pelo ganho de responsividade.",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  await db.comparisonItem.deleteMany({ where: { comparisonId: comparison.id } });
  await db.comparisonItem.createMany({
    data: [
      {
        comparisonId: comparison.id,
        productId: productIds["ssd-kingston-nv2-1tb"],
        pros: ["Maior impacto na velocidade percebida", "Mais barato"],
        cons: ["Não ajuda em multitarefa pesada"],
        displayOrder: 0,
      },
      {
        comparisonId: comparison.id,
        productId: productIds["memoria-kingston-fury-16gb-ddr4"],
        pros: ["Melhora multitarefa", "Bom para jogos modernos"],
        cons: ["Ganho menos perceptível no dia a dia"],
        displayOrder: 1,
      },
    ],
  });

  // ── Blog ────────────────────────────────────────────────────────────
  const blogCat = await db.blogCategory.upsert({
    where: { slug: "homelab" },
    update: {},
    create: { slug: "homelab", name: "Homelab", description: "Tutoriais e guias de homelab." },
  });
  const tagProxmox = await db.blogTag.upsert({
    where: { slug: "proxmox" },
    update: {},
    create: { slug: "proxmox", name: "Proxmox" },
  });
  await db.blogPost.upsert({
    where: { slug: "como-montar-homelab-proxmox" },
    update: {},
    create: {
      slug: "como-montar-homelab-proxmox",
      title: "Como montar um homelab com Proxmox em 2026",
      excerpt:
        "Guia passo a passo para montar seu primeiro homelab econômico rodando Proxmox.",
      content:
        "<p>Neste guia você vai aprender a montar um homelab silencioso e econômico usando um mini PC e o Proxmox VE.</p>",
      coverImageUrl: img("como-montar-homelab-proxmox"),
      status: "PUBLISHED",
      readingMinutes: 8,
      categoryId: blogCat.id,
      publishedAt: new Date(),
      tags: { connect: [{ id: tagProxmox.id }] },
    },
  });

  console.log("✅ Seed complete.");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
