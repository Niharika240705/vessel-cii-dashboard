import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const ratings = await prisma.ciiRating.findMany({ select: { rating: true, attainedCii: true }});
  console.log(ratings);
}
main().catch(console.error).finally(() => prisma.$disconnect());
