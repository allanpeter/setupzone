/**
 * Seed: curadoria realista no novo posicionamento (homelab / setup dev / IA local).
 * Lojas, categorias, marcas, produtos com conteúdo editorial, montagens com
 * objetivo/dificuldade/alternativas, comparativo e guias vinculados.
 * Idempotente via upsert no slug. Run: pnpm db:seed
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

  // ── Reset de conteúdo (substitui dados de teste por curadoria real) ──
  // Ordem segura para FKs. Preserva lojas, marcas, categorias e usuários.
  await db.collectionItem.deleteMany();
  await db.collection.deleteMany();
  await db.buildItem.deleteMany();
  await db.build.deleteMany();
  await db.comparisonItem.deleteMany();
  await db.comparison.deleteMany();
  await db.blogPost.deleteMany();
  await db.affiliateClick.deleteMany();
  await db.productVote.deleteMany();
  await db.productPrice.deleteMany();
  await db.affiliateLink.deleteMany();
  await db.mediaAsset.deleteMany();
  await db.product.deleteMany();

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

  // ── Categories (taxonomia de produto, alinhada ao posicionamento) ────
  const categoryData = [
    { slug: "homelab", name: "Homelab", order: 1 },
    { slug: "mini-pcs", name: "Mini PCs", order: 2 },
    { slug: "ia-local", name: "IA Local", order: 3 },
    { slug: "setup-dev", name: "Setup Dev", order: 4 },
    { slug: "redes", name: "Redes", order: 5 },
    { slug: "armazenamento", name: "Armazenamento", order: 6 },
    { slug: "perifericos", name: "Periféricos", order: 7 },
    { slug: "produtividade", name: "Produtividade", order: 8 },
    { slug: "impressao-3d", name: "Impressão 3D", order: 9 },
    { slug: "gadgets", name: "Gadgets", order: 10 },
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
    { slug: "nvidia", name: "NVIDIA" },
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
    audienceFor?: string;
    audienceNotFor?: string;
    pros?: string[];
    cons?: string[];
    opinion?: string;
    verdict?: "VALE" | "NAO_VALE" | "DEPENDE";
    verdictNote?: string;
    alternatives?: string[]; // slugs
    prices: { store: string; reais: number }[]; // first = primary
  };

  const products: ProductSeed[] = [
    {
      slug: "mini-pc-beelink-ser5",
      name: "Mini PC Beelink SER5 (Ryzen 5 5560U, 16GB, 500GB)",
      short: "Mini PC compacto e silencioso, ótimo nó para um homelab caseiro.",
      brand: "beelink",
      categories: ["mini-pcs", "homelab"],
      featured: true,
      audienceFor:
        "Quem quer começar um homelab silencioso e de baixo consumo, rodando Proxmox, containers e alguns serviços self-hosted sem ocupar espaço.",
      audienceNotFor:
        "Quem precisa de muitas baias de disco ou de uma GPU dedicada para IA — aqui o foco é eficiência, não expansão.",
      pros: [
        "Consumo de energia baixíssimo (ideal para ficar 24/7)",
        "Silencioso mesmo sob carga",
        "Rede 2.5GbE de fábrica",
      ],
      cons: [
        "Só 1 slot NVMe + 1 SATA 2.5\"",
        "RAM soldada limita upgrades futuros em alguns lotes",
      ],
      opinion:
        "É o ponto de partida que eu mais recomendo para quem está montando o primeiro homelab. Roda Proxmox com folga e o consumo é tão baixo que você esquece que ele está ligado.",
      verdict: "VALE",
      verdictNote: "Melhor custo-benefício para um nó de homelab 24/7.",
      alternatives: ["amd-ryzen-5-5600"],
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
      short: "Armazenamento rápido e barato para qualquer montagem.",
      brand: "kingston",
      categories: ["armazenamento", "homelab", "setup-dev"],
      audienceFor:
        "Quem precisa de um disco de sistema veloz por pouco dinheiro — homelab, estação de dev ou desktop.",
      audienceNotFor:
        "Cargas de escrita pesadas e contínuas (servidor de banco intenso), onde um SSD com DRAM e maior TBW faz diferença.",
      pros: ["Ótimo preço por TB", "Leitura sequencial alta", "Funciona frio"],
      cons: ["Sem cache DRAM", "TBW modesto para uso de servidor pesado"],
      opinion:
        "Para 90% dos setups é o SSD que eu compro sem pensar duas vezes. Onde houver escrita intensa, suba para um modelo com DRAM.",
      verdict: "VALE",
      verdictNote: "Disco de sistema padrão para a maioria das montagens.",
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
      short: "Wi-Fi 6 acessível, ideal para casa e laboratório de rede.",
      brand: "xiaomi",
      categories: ["redes", "homelab"],
      audienceFor:
        "Quem quer Wi-Fi 6 barato e estável, e gosta de experimentar com OpenWRT no laboratório.",
      audienceNotFor:
        "Quem precisa de VLANs avançadas e roteamento de nível pro — aí o caminho é um mini PC com pfSense/OPNsense.",
      pros: ["Wi-Fi 6 por um preço baixo", "Boa cobertura", "Comunidade ativa"],
      cons: ["Firmware de fábrica limitado", "Sem porta 2.5GbE"],
      verdict: "DEPENDE",
      verdictNote: "Ótimo como AP; para roteamento avançado, considere outra abordagem.",
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
      short: "Base barata e eficiente para uma estação de desenvolvimento AM4.",
      brand: "amd",
      categories: ["setup-dev"],
      featured: true,
      audienceFor:
        "Programadores montando uma estação AM4 econômica: compila rápido, roda containers e máquinas virtuais sem suar.",
      audienceNotFor:
        "Quem precisa de muitos núcleos para compilação massiva ou renderização pesada — olhe um Ryzen 9.",
      pros: ["6c/12t suficientes para dev", "Eficiente (65W)", "Plataforma AM4 barata"],
      cons: ["Sem PCIe 5.0", "Cooler de fábrica é básico"],
      opinion:
        "Para estação de dev de entrada, é a melhor relação custo/desempenho hoje. Compila projetos médios e roda Docker com tranquilidade.",
      verdict: "VALE",
      alternatives: ["mini-pc-beelink-ser5"],
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
      slug: "rtx-3060-12gb",
      name: "Placa de Vídeo NVIDIA RTX 3060 12GB",
      short: "12GB de VRAM: a porta de entrada para rodar LLMs e Stable Diffusion localmente.",
      brand: "nvidia",
      categories: ["ia-local", "setup-dev"],
      featured: true,
      audienceFor:
        "Quem quer começar com IA local: rodar modelos quantizados de 7B–13B e gerar imagens com Stable Diffusion sem depender da nuvem.",
      audienceNotFor:
        "Quem mira modelos grandes (30B+) ou treino sério — aí 12GB ficam apertados e vale uma 3090/4090 usada.",
      pros: [
        "12GB de VRAM por um preço acessível",
        "Suporte CUDA maduro",
        "Consumo controlado",
      ],
      cons: ["Barramento de 192-bit", "VRAM limita modelos maiores"],
      opinion:
        "É a GPU que eu indico para quem está entrando em IA local. Os 12GB de VRAM fazem toda a diferença frente à 3060 Ti de 8GB para inferência.",
      verdict: "VALE",
      verdictNote: "Melhor entrada para inferência de LLMs e imagem em casa.",
      specs: [
        { label: "VRAM", value: "12GB GDDR6" },
        { label: "CUDA Cores", value: "3584" },
        { label: "Barramento", value: "192-bit" },
        { label: "TDP", value: "170W" },
      ],
      prices: [
        { store: "mercadolivre", reais: 1799 },
        { store: "amazon", reais: 1899 },
      ],
    },
    {
      slug: "memoria-kingston-fury-16gb-ddr4",
      name: "Memória Kingston FURY Beast 16GB DDR4 3200MHz",
      short: "16GB para multitarefa, containers e máquinas virtuais.",
      brand: "kingston",
      categories: ["armazenamento", "setup-dev", "homelab"],
      audienceFor:
        "Quem monta estação de dev ou homelab e quer espaço de sobra para Docker e VMs.",
      pros: ["Boa frequência por preço justo", "Estável", "Perfil XMP fácil"],
      cons: ["Sem dissipador robusto"],
      verdict: "VALE",
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
    {
      slug: "teclado-keychron-k8",
      name: "Teclado Mecânico Keychron K8 (sem fio)",
      short: "Teclado mecânico confortável para quem passa o dia programando.",
      brand: null,
      categories: ["perifericos", "produtividade", "setup-dev"],
      audienceFor:
        "Devs que digitam o dia inteiro e querem um mecânico hot-swap, com layout que funciona em Mac e Windows.",
      audienceNotFor:
        "Quem prefere teclados de perfil baixo silenciosos ou quer algo bem barato.",
      pros: ["Hot-swap", "Bluetooth + cabo", "Compatível com Mac e Windows"],
      cons: ["Alto sem apoio de pulso", "Switches de fábrica medianos"],
      verdict: "VALE",
      specs: [
        { label: "Layout", value: "TKL (87 teclas)" },
        { label: "Conexão", value: "Bluetooth 5.1 + USB-C" },
        { label: "Switch", value: "Hot-swappable" },
      ],
      prices: [
        { store: "aliexpress", reais: 459 },
        { store: "amazon", reais: 529 },
      ],
    },
    {
      slug: "hub-ugreen-usb-c-6em1",
      name: "Hub UGREEN USB-C 6 em 1",
      short: "Expanda notebook ou mini PC com HDMI 4K e USB 3.0.",
      brand: "ugreen",
      categories: ["gadgets", "produtividade"],
      audienceFor:
        "Quem usa notebook ou mini PC e precisa de portas: monitor 4K, pendrives e leitor de cartão.",
      pros: ["HDMI 4K", "Passthrough PD 100W", "Construção sólida"],
      cons: ["Esquenta sob carga contínua"],
      verdict: "VALE",
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
      slug: "impressora-creality-ender-3-v3",
      name: "Impressora 3D Creality Ender-3 V3 SE",
      short: "Entrada perfeita para impressão 3D com auto-nivelamento.",
      brand: "creality",
      categories: ["impressao-3d"],
      audienceFor:
        "Quem quer começar a imprimir em 3D sem dor de cabeça: chega quase montada e se nivela sozinha.",
      audienceNotFor:
        "Quem busca volume grande de impressão ou recursos avançados de uma máquina enclausurada.",
      pros: ["Auto-nivelamento (CR Touch)", "Fácil de montar", "Boa qualidade de fábrica"],
      cons: ["Volume de impressão médio", "Sem câmara fechada"],
      verdict: "VALE",
      verdictNote: "Melhor primeira impressora 3D na faixa de entrada.",
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
  ];

  const productIds: Record<string, string> = {};
  for (const p of products) {
    const lowest = brl(Math.min(...p.prices.map((x) => x.reais)));
    const editorial = {
      audienceFor: p.audienceFor ?? null,
      audienceNotFor: p.audienceNotFor ?? null,
      pros: p.pros ?? [],
      cons: p.cons ?? [],
      editorialOpinion: p.opinion ?? null,
      verdict: p.verdict ?? null,
      verdictNote: p.verdictNote ?? null,
    };
    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        shortDescription: p.short,
        specs: p.specs,
        status: "PUBLISHED",
        isFeatured: p.featured ?? false,
        lowestPriceCents: lowest,
        brand: p.brand
          ? { connect: { id: brands[p.brand] } }
          : { disconnect: true },
        publishedAt: new Date(),
        categories: { set: p.categories.map((c) => ({ id: cats[c] })) },
        ...editorial,
      },
      create: {
        slug: p.slug,
        name: p.name,
        shortDescription: p.short,
        description: p.short,
        specs: p.specs,
        status: "PUBLISHED",
        isFeatured: p.featured ?? false,
        lowestPriceCents: lowest,
        brand: p.brand ? { connect: { id: brands[p.brand] } } : undefined,
        publishedAt: new Date(),
        categories: { connect: p.categories.map((c) => ({ id: cats[c] })) },
        ...editorial,
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

  // Curated alternatives (second pass — all products exist now).
  for (const p of products) {
    if (!p.alternatives?.length) continue;
    await db.product.update({
      where: { id: productIds[p.slug] },
      data: {
        alternatives: {
          set: p.alternatives
            .filter((s) => productIds[s])
            .map((s) => ({ id: productIds[s] })),
        },
      },
    });
  }

  // ── Builds (montagens) ──────────────────────────────────────────────
  type BuildItemSeed = {
    product: string;
    role: string;
    note?: string;
    budgetAlt?: string;
    premiumAlt?: string;
  };
  type BuildSeed = {
    slug: string;
    title: string;
    summary: string;
    objective: string;
    category: string; // rótulo editorial (casa com hubs)
    difficulty: "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";
    budgetReais: number;
    featured?: boolean;
    pros: string[];
    cons: string[];
    observations?: string;
    conclusion?: string;
    items: BuildItemSeed[];
  };

  const builds: BuildSeed[] = [
    {
      slug: "homelab-proxmox-ate-3000",
      title: "Homelab Proxmox até R$ 3.000",
      summary:
        "Um homelab silencioso e econômico para rodar Proxmox, containers e VMs em casa.",
      objective:
        "Ter um servidor caseiro 24/7 de baixo consumo para aprender virtualização, self-hosting e automação — sem barulho e sem conta de luz alta.",
      category: "Homelab",
      difficulty: "INTERMEDIARIO",
      budgetReais: 2200,
      featured: true,
      pros: ["Baixo consumo de energia", "Silencioso", "Fácil de expandir com containers"],
      cons: ["Armazenamento inicial limitado a 2 discos"],
      observations:
        "Reserve uma tarde para configurar o Proxmox e as primeiras VMs. Um no-break pequeno evita corrupção em quedas de energia.",
      conclusion:
        "Para começar no homelab, essa combinação entrega o melhor equilíbrio entre consumo, silêncio e capacidade. Cresça depois adicionando discos e nós.",
      items: [
        {
          product: "mini-pc-beelink-ser5",
          role: "Nó de virtualização",
          note: "Roda o Proxmox VE com folga.",
          premiumAlt: "amd-ryzen-5-5600",
        },
        {
          product: "ssd-kingston-nv2-1tb",
          role: "Armazenamento",
          budgetAlt: "memoria-kingston-fury-16gb-ddr4",
        },
        { product: "roteador-xiaomi-ax3000", role: "Rede / AP" },
      ],
    },
    {
      slug: "setup-programador-am4",
      title: "Setup Programador (AM4)",
      summary:
        "Estação de desenvolvimento econômica que compila rápido e roda Docker sem travar.",
      objective:
        "Montar uma máquina confortável para programar o dia todo: containers, VMs, vários monitores e um teclado bom.",
      category: "Setup Dev",
      difficulty: "INICIANTE",
      budgetReais: 2800,
      featured: true,
      pros: ["Compila projetos médios com folga", "Roda Docker e VMs", "Periféricos confortáveis"],
      cons: ["Plataforma AM4 não tem upgrade para a próxima geração"],
      conclusion:
        "Uma base sólida e barata para quem programa. Quando precisar de mais núcleos, troque só a CPU dentro do AM4.",
      items: [
        { product: "amd-ryzen-5-5600", role: "Processador" },
        { product: "memoria-kingston-fury-16gb-ddr4", role: "Memória", note: "Suba para 32GB se rodar muitas VMs." },
        { product: "ssd-kingston-nv2-1tb", role: "Armazenamento" },
        { product: "teclado-keychron-k8", role: "Teclado" },
        { product: "hub-ugreen-usb-c-6em1", role: "Conectividade" },
      ],
    },
    {
      slug: "servidor-local-para-ia",
      title: "Servidor Local para IA",
      summary:
        "Máquina para rodar LLMs e geração de imagem localmente, com privacidade total.",
      objective:
        "Rodar modelos de IA na sua própria máquina — inferência de LLMs 7B–13B e Stable Diffusion — sem enviar dados para a nuvem.",
      category: "IA Local",
      difficulty: "AVANCADO",
      budgetReais: 4500,
      pros: ["Privacidade: nada sai da sua rede", "Sem custo por token", "12GB de VRAM para começar"],
      cons: ["VRAM limita modelos muito grandes", "Consumo de energia maior sob carga"],
      observations:
        "Use modelos quantizados (GGUF/AWQ) para caber nos 12GB. Ferramentas como Ollama e LM Studio facilitam muito o início.",
      conclusion:
        "É o ponto de entrada honesto para IA local. Dá para evoluir trocando a GPU por uma com mais VRAM quando os modelos crescerem.",
      items: [
        { product: "rtx-3060-12gb", role: "GPU (inferência)", premiumAlt: "rtx-3060-12gb" },
        { product: "amd-ryzen-5-5600", role: "Processador" },
        { product: "memoria-kingston-fury-16gb-ddr4", role: "Memória", note: "32GB ajudam a carregar modelos grandes." },
        { product: "ssd-kingston-nv2-1tb", role: "Armazenamento" },
      ],
    },
  ];

  const buildIds: Record<string, string> = {};
  for (const b of builds) {
    const build = await db.build.upsert({
      where: { slug: b.slug },
      update: {
        title: b.title,
        summary: b.summary,
        objective: b.objective,
        category: b.category,
        difficulty: b.difficulty,
        budgetCents: brl(b.budgetReais),
        status: "PUBLISHED",
        isFeatured: b.featured ?? false,
        pros: b.pros,
        cons: b.cons,
        observations: b.observations ?? null,
        conclusion: b.conclusion ?? null,
        coverImageUrl: img(b.slug),
        publishedAt: new Date(),
      },
      create: {
        slug: b.slug,
        title: b.title,
        summary: b.summary,
        objective: b.objective,
        category: b.category,
        difficulty: b.difficulty,
        description: b.objective,
        budgetCents: brl(b.budgetReais),
        status: "PUBLISHED",
        isFeatured: b.featured ?? false,
        pros: b.pros,
        cons: b.cons,
        observations: b.observations ?? null,
        conclusion: b.conclusion ?? null,
        coverImageUrl: img(b.slug),
        publishedAt: new Date(),
      },
    });
    buildIds[b.slug] = build.id;

    await db.buildItem.deleteMany({ where: { buildId: build.id } });
    for (const [i, item] of b.items.entries()) {
      await db.buildItem.create({
        data: {
          buildId: build.id,
          productId: productIds[item.product],
          role: item.role,
          note: item.note ?? null,
          budgetAlternativeId: item.budgetAlt ? productIds[item.budgetAlt] : null,
          premiumAlternativeId: item.premiumAlt ? productIds[item.premiumAlt] : null,
          displayOrder: i,
        },
      });
    }
  }

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
        pros: ["Melhora multitarefa", "Essencial para containers e VMs"],
        cons: ["Ganho menos perceptível no dia a dia"],
        displayOrder: 1,
      },
    ],
  });

  // ── Blog (guias vinculados a montagens/produtos) ────────────────────
  const blogCats: Record<string, string> = {};
  for (const c of [
    { slug: "homelab", name: "Homelab", description: "Tutoriais e guias de homelab." },
    { slug: "ia-local", name: "IA Local", description: "Rodando IA na sua própria máquina." },
  ]) {
    const cat = await db.blogCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
    blogCats[c.slug] = cat.id;
  }

  const tag = async (slug: string, name: string) =>
    db.blogTag.upsert({
      where: { slug },
      update: {},
      create: { slug, name },
    });
  const tagProxmox = await tag("proxmox", "Proxmox");
  const tagIa = await tag("ia-local", "IA Local");

  const posts: {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    cat: string;
    minutes: number;
    tags: string[];
    relatedBuilds: string[];
    relatedProducts: string[];
  }[] = [
    {
      slug: "como-montar-homelab-proxmox",
      title: "Como montar um homelab com Proxmox em 2026",
      excerpt:
        "Guia passo a passo para montar seu primeiro homelab econômico rodando Proxmox.",
      content:
        "<p>Neste guia você vai aprender a montar um homelab silencioso e econômico usando um mini PC e o Proxmox VE.</p><p>A ideia é ter um servidor 24/7 de baixo consumo para aprender virtualização e self-hosting na prática.</p>",
      cat: "homelab",
      minutes: 8,
      tags: [tagProxmox.id],
      relatedBuilds: ["homelab-proxmox-ate-3000"],
      relatedProducts: ["mini-pc-beelink-ser5", "ssd-kingston-nv2-1tb"],
    },
    {
      slug: "rodando-ia-local-o-que-voce-precisa",
      title: "Rodando IA local: o que você precisa em 2026",
      excerpt:
        "Hardware e ferramentas para rodar LLMs e geração de imagem na sua própria máquina.",
      content:
        "<p>Rodar IA localmente ficou acessível. Neste guia eu explico quanta VRAM você precisa, quais modelos cabem em 12GB e como começar com Ollama e LM Studio.</p>",
      cat: "ia-local",
      minutes: 10,
      tags: [tagIa.id],
      relatedBuilds: ["servidor-local-para-ia"],
      relatedProducts: ["rtx-3060-12gb"],
    },
  ];

  for (const post of posts) {
    await db.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: img(post.slug),
        status: "PUBLISHED",
        readingMinutes: post.minutes,
        categoryId: blogCats[post.cat],
        publishedAt: new Date(),
        tags: { set: post.tags.map((id) => ({ id })) },
        relatedBuilds: { set: post.relatedBuilds.map((s) => ({ id: buildIds[s] })) },
        relatedProducts: {
          set: post.relatedProducts.map((s) => ({ id: productIds[s] })),
        },
      },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: img(post.slug),
        status: "PUBLISHED",
        readingMinutes: post.minutes,
        categoryId: blogCats[post.cat],
        publishedAt: new Date(),
        tags: { connect: post.tags.map((id) => ({ id })) },
        relatedBuilds: { connect: post.relatedBuilds.map((s) => ({ id: buildIds[s] })) },
        relatedProducts: {
          connect: post.relatedProducts.map((s) => ({ id: productIds[s] })),
        },
      },
    });
  }

  console.log("✅ Seed complete.");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
