const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "m.aleidi@kmt.kw" }
  });

  if (user) {
    console.log("✓ User found:");
    console.log({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPassword: !!user.password,
      passwordHash: user.password ? user.password.substring(0, 10) + "..." : null
    });
  } else {
    console.log("✗ User not found");
  }

  await prisma.$disconnect();
}

main().catch(console.error);
