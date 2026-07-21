import { prisma } from './src/lib/prisma';
async function main() {
  const ratings = await prisma.ciiRating.findMany({ select: { rating: true, attainedCii: true }});
  console.log(ratings);
}
main().catch(console.error).finally(() => prisma.$disconnect());
