import bcrypt from "bcryptjs";

import { prisma } from "../lib/client";

const BCRYPT_ROUNDS = 12;

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    console.error(
      "Missing ADMIN_EMAIL or ADMIN_PASSWORD. Set them in your .env file (or environment).",
    );
    process.exit(1);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(`ADMIN_EMAIL is not a valid email address: ${email}`);
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters long.");
    process.exit(1);
  }

  console.log(`Hashing password for ${email} ...`);
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const name = email.split("@")[0];

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const updated = await prisma.user.update({
      where: { email },
      data: { password: passwordHash, name },
    });
    console.log(
      `Admin user updated: ${updated.email} (password reset, account remains active).`,
    );
  } else {
    const created = await prisma.user.create({
      data: { email, name, password: passwordHash },
    });
    console.log(`Admin user created: ${created.email}`);
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});