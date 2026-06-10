import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for the Docker image (Phase 10).
  output: "standalone",
  // Better Auth pulls in optional adapters (kysely) we don't use. Keep it
  // external so the bundler doesn't statically resolve those broken imports.
  serverExternalPackages: ["better-auth", "@better-auth/kysely-adapter", "kysely"],
  // Pin the workspace root — several lockfiles exist higher up the tree.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" }, // seed/demo images
      { protocol: "https", hostname: "*.alicdn.com" }, // AliExpress
      { protocol: "https", hostname: "http2.mlstatic.com" }, // Mercado Livre
      { protocol: "https", hostname: "*.shopee.com.br" }, // Shopee
      { protocol: "https", hostname: "down-br.img.susercontent.com" }, // Shopee CDN
      { protocol: "https", hostname: "m.media-amazon.com" }, // Amazon
      { protocol: "https", hostname: "*.r2.dev" }, // Cloudflare R2 (S3 media)
      { protocol: "https", hostname: "*.amazonaws.com" }, // S3 media
    ],
  },
};

export default nextConfig;
