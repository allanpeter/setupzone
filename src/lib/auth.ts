import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { db } from "@/lib/db";

// Origins allowed to call the auth API. In prod set BETTER_AUTH_URL (and
// optionally TRUSTED_ORIGINS, comma-separated) to the real domain(s).
const trustedOrigins = [
  process.env.BETTER_AUTH_URL,
  process.env.NEXT_PUBLIC_SITE_URL,
  ...(process.env.TRUSTED_ORIGINS?.split(",").map((o) => o.trim()) ?? []),
].filter((o): o is string => !!o);

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: trustedOrigins.length > 0 ? trustedOrigins : undefined,
  emailAndPassword: {
    enabled: true,
    // Admin-created accounts only — no public sign-up flow in the UI.
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  plugins: [admin()],
});

export type Session = typeof auth.$Infer.Session;
