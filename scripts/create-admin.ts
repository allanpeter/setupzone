/**
 * Create (or promote) an admin user.
 *   pnpm tsx scripts/create-admin.ts <email> <password> [name]
 * Falls back to ADMIN_EMAIL / ADMIN_PASSWORD env vars.
 */
import "dotenv/config";
import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";

async function main() {
  const email = process.argv[2] ?? process.env.ADMIN_EMAIL;
  const password = process.argv[3] ?? process.env.ADMIN_PASSWORD;
  const name = process.argv[4] ?? "Admin";

  if (!email || !password) {
    console.error(
      "Usage: pnpm tsx scripts/create-admin.ts <email> <password> [name]",
    );
    process.exit(1);
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    await db.user.update({ where: { email }, data: { role: "admin" } });
    console.log(`✅ Promoted existing user ${email} to admin.`);
  } else {
    await auth.api.signUpEmail({ body: { email, password, name } });
    await db.user.update({ where: { email }, data: { role: "admin" } });
    console.log(`✅ Created admin user ${email}.`);
  }
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
