import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'Jim.okonma@gmail.com';
  const passwordPlain = 'P@$$w0rd';
  const password = await bcrypt.hash(passwordPlain, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Jim okonma',
      email,
      password,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


