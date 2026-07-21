const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const v = await prisma.vessel.findFirst();
  console.log("Vessel ID:", v.id);

  try {
    const res1 = await fetch(`http://127.0.0.1:3000/api/vessels/${v.id}/cii-trajectory`);
    console.log("Trajectory Status:", res1.status);
    const data1 = await res1.text();
    console.log("Trajectory Data:", data1.substring(0, 500));
  } catch (e) {
    console.log("Fetch 1 failed", e);
  }

  try {
    const res2 = await fetch(`http://127.0.0.1:3000/api/vessels/${v.id}/forecast?speedReduction=1`);
    console.log("Forecast Status:", res2.status);
    const data2 = await res2.text();
    console.log("Forecast Data:", data2.substring(0, 500));
  } catch (e) {
    console.log("Fetch 2 failed", e);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
