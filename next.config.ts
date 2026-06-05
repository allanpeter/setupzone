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
      // AliExpress / marketplace CDNs + S3 media bucket. Tighten in prod.
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
