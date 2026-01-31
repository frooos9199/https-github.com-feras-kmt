const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const email = "m.aleidi@kmt.kw";
  const newPassword = "123123123";

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log("✗ User not found");
    return;
  }

  console.log(`Found user: ${user.name} (${user.email})`);
  
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });

  console.log(`✓ Password updated successfully for ${email}`);
  console.log(`  New password: ${newPassword}`);

  await prisma.$disconnect();
}

main().catch(console.error);
