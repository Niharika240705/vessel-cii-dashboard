import { PrismaClient, VesselType, Role, FuelType, VesselCategory } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const CF_FACTORS: Record<FuelType, number> = {
  [FuelType.HFO]: 3.114,
  [FuelType.VLSFO]: 3.151,
  [FuelType.MGO]: 3.206,
  [FuelType.LNG]: 2.750,
  [FuelType.METHANOL]: 1.375,
  [FuelType.AMMONIA]: 0,
};

const PORTS = [
  'Rotterdam', 'Singapore', 'Houston', 'Fujairah', 'Ningbo', 
  'Santos', 'Durban', 'Mumbai', 'New Orleans', 'Yokohama', 
  'Shanghai', 'Antwerp', 'Los Angeles', 'Hamburg', 'Dubai'
];

const DOC_TYPES = ['DCS', 'MRV', 'SEEMP Part III', 'EEXI Certificate', 'CII Rating Certificate'];
const DOC_STATUSES = ['APPROVED', 'PENDING', 'OVERDUE'];

const getAerForGrade = (grade: string, requiredCii: number) => {
    switch (grade) {
        case 'A': return requiredCii * 0.8;
        case 'B': return requiredCii * 0.9;
        case 'C': return requiredCii * 1.0;
        case 'D': return requiredCii * 1.12;
        case 'E': return requiredCii * 1.25;
        default: return requiredCii;
    }
};

const vesselsData = [
  // Bulk Carriers (3)
  { imoNumber: '9345671', name: 'MV Pacific Star', type: VesselType.BULK_CARRIER, grossTonnage: 35000, deadweight: 60000, builtYear: 2010, flagState: 'Panama', classSociety: 'DNV', primaryFuel: FuelType.VLSFO, trajectory: ['C', 'B', 'A'] },
  { imoNumber: '9456782', name: 'MV Atlantic Horizon', type: VesselType.BULK_CARRIER, grossTonnage: 32000, deadweight: 55000, builtYear: 2012, flagState: 'Liberia', classSociety: 'Lloyds Register', primaryFuel: FuelType.HFO, trajectory: ['B', 'C', 'D'] },
  { imoNumber: '9567893', name: 'MV Nordic Blossom', type: VesselType.BULK_CARRIER, grossTonnage: 25000, deadweight: 40000, builtYear: 2015, flagState: 'Marshall Islands', classSociety: 'ABS', primaryFuel: FuelType.VLSFO, trajectory: ['C', 'C', 'C'] },
  
  // Crude Oil Tankers (2)
  { imoNumber: '9678904', name: 'MT Aegean Spirit', type: VesselType.TANKER, grossTonnage: 60000, deadweight: 105000, builtYear: 2018, flagState: 'Greece', classSociety: 'DNV', primaryFuel: FuelType.VLSFO, trajectory: ['C', 'B', 'A'] },
  { imoNumber: '9789015', name: 'MT Gulf Pioneer', type: VesselType.TANKER, grossTonnage: 62000, deadweight: 110000, builtYear: 2008, flagState: 'Bahamas', classSociety: 'Bureau Veritas', primaryFuel: FuelType.HFO, trajectory: ['B', 'C', 'D'] },
  
  // Container Ships (2)
  { imoNumber: '9890126', name: 'CS Singapore Express', type: VesselType.CONTAINER, grossTonnage: 28000, deadweight: 35000, builtYear: 2006, flagState: 'Singapore', classSociety: 'ClassNK', primaryFuel: FuelType.HFO, trajectory: ['E', 'E', 'E'] },
  { imoNumber: '9901237', name: 'CS Rotterdam Eagle', type: VesselType.CONTAINER, grossTonnage: 18000, deadweight: 20000, builtYear: 2019, flagState: 'Netherlands', classSociety: 'DNV', primaryFuel: FuelType.VLSFO, trajectory: ['B', 'B', 'B'] },
  
  // LNG Carrier (1)
  { imoNumber: '9123458', name: 'LNG Arctic Explorer', type: VesselType.LNG_CARRIER, grossTonnage: 80000, deadweight: 75000, builtYear: 2020, flagState: 'Norway', classSociety: 'DNV', primaryFuel: FuelType.LNG, trajectory: ['A', 'A', 'A'] },
  
  // Chemical Tanker (1)
  { imoNumber: '9234569', name: 'MT Chem Polaris', type: VesselType.TANKER, grossTonnage: 15000, deadweight: 20000, builtYear: 2014, flagState: 'Malta', classSociety: 'RINA', primaryFuel: FuelType.MGO, trajectory: ['C', 'C', 'C'] },
  
  // Ro-Ro (1)
  { imoNumber: '9345670', name: 'MV Auto Transporter', type: VesselType.RO_RO, grossTonnage: 50000, deadweight: 15000, builtYear: 2016, flagState: 'Japan', classSociety: 'ClassNK', primaryFuel: FuelType.VLSFO, trajectory: ['C', 'C', 'C'] },
  
  // Naval Vessels (3)
  { imoNumber: 'P281', name: 'HMS Tyne', type: VesselType.OFFSHORE_PATROL_VESSEL, vesselCategory: VesselCategory.NAVAL, grossTonnage: 1700, deadweight: 500, builtYear: 2003, flagState: 'UK', classSociety: 'Naval Authority', primaryFuel: FuelType.MGO, trajectory: ['B', 'B', 'B'] },
  { imoNumber: 'A388', name: 'RFA Fort Victoria', type: VesselType.REPLENISHMENT_VESSEL, vesselCategory: VesselCategory.NAVAL, grossTonnage: 31000, deadweight: 23000, builtYear: 1990, flagState: 'UK', classSociety: 'Naval Authority', primaryFuel: FuelType.MGO, trajectory: ['C', 'C', 'C'] },
  { imoNumber: 'H88', name: 'HMS Enterprise', type: VesselType.AUXILIARY, vesselCategory: VesselCategory.NAVAL, grossTonnage: 3700, deadweight: 1200, builtYear: 2002, flagState: 'UK', classSociety: 'Naval Authority', primaryFuel: FuelType.MGO, trajectory: ['A', 'A', 'A'] },
];

async function main() {
  console.log('Starting database seed...');

  // 1. Clean up child relations to ensure idempotency when running multiple times
  console.log('Cleaning up old data...');
  await prisma.vesselPositionHistory.deleteMany();
  await prisma.complianceDocument.deleteMany();
  await prisma.fuelConsumption.deleteMany();
  await prisma.voyage.deleteMany();
  await prisma.ciiRating.deleteMany();
  await prisma.vesselOfficer.deleteMany();

  // 2. Users
  console.log('Seeding users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vesselcii.com' },
    update: { password: passwordHash, name: 'Admin User', role: Role.ADMIN },
    create: { email: 'admin@vesselcii.com', password: passwordHash, name: 'Admin User', role: Role.ADMIN }
  });
  
  const manager = await prisma.user.upsert({
    where: { email: 'manager@vesselcii.com' },
    update: { password: passwordHash, name: 'Fleet Manager', role: Role.FLEET_MANAGER },
    create: { email: 'manager@vesselcii.com', password: passwordHash, name: 'Fleet Manager', role: Role.FLEET_MANAGER }
  });

  const officer1 = await prisma.user.upsert({
    where: { email: 'officer1@vesselcii.com' },
    update: { password: passwordHash, name: 'Vessel Officer One', role: Role.VESSEL_OFFICER },
    create: { email: 'officer1@vesselcii.com', password: passwordHash, name: 'Vessel Officer One', role: Role.VESSEL_OFFICER }
  });

  const officer2 = await prisma.user.upsert({
    where: { email: 'officer2@vesselcii.com' },
    update: { password: passwordHash, name: 'Vessel Officer Two', role: Role.VESSEL_OFFICER },
    create: { email: 'officer2@vesselcii.com', password: passwordHash, name: 'Vessel Officer Two', role: Role.VESSEL_OFFICER }
  });

  // 3. Vessels & Data
  console.log('Seeding vessels and historical data (this may take a few seconds)...');
  const createdVessels = [];

  for (let index = 0; index < vesselsData.length; index++) {
    const vDef = vesselsData[index];
    const mmsi = parseInt(`2${Math.floor(Math.random() * 90000000) + 10000000}`);
    
    const dbVessel = await prisma.vessel.upsert({
      where: { imoNumber: vDef.imoNumber },
      update: {
        name: vDef.name,
        type: vDef.type,
        vesselCategory: vDef.vesselCategory || VesselCategory.COMMERCIAL,
        grossTonnage: vDef.grossTonnage,
        deadweight: vDef.deadweight,
        builtYear: vDef.builtYear,
        flagState: vDef.flagState,
        classSociety: vDef.classSociety,
      },
      create: {
        imoNumber: vDef.imoNumber,
        name: vDef.name,
        type: vDef.type,
        vesselCategory: vDef.vesselCategory || VesselCategory.COMMERCIAL,
        grossTonnage: vDef.grossTonnage,
        deadweight: vDef.deadweight,
        builtYear: vDef.builtYear,
        flagState: vDef.flagState,
        classSociety: vDef.classSociety,
        mmsi: mmsi,
        latitude: (Math.random() * 60) - 30,
        longitude: (Math.random() * 100) - 50,
        speed: Math.random() * 15 + 5,
        heading: Math.random() * 360,
        lastPing: new Date(),
      }
    });

    createdVessels.push(dbVessel);

    // Voyages and CII for 2022, 2023, 2024
    for (const [yearIdx, year] of [2022, 2023, 2024].entries()) {
      const numVoyages = Math.floor(Math.random() * 13) + 18; // 18 to 30 voyages per year
      let totalDistance = 0;
      const voyagesTemp = [];
      
      let currentTime = new Date(`${year}-01-05T00:00:00Z`);

      for (let i = 0; i < numVoyages; i++) {
        const distance = Math.floor(Math.random() * 2500) + 500;
        totalDistance += distance;
        
        // Duration based on rough average speed of 12 knots (288 nm/day)
        const durationDays = distance / 288; 
        const arrivalTime = new Date(currentTime.getTime() + durationDays * 24 * 60 * 60 * 1000);
        
        const isBallast = Math.random() > 0.7; // 30% chance of ballast voyage
        const cargoCarried = isBallast ? 0 : dbVessel.deadweight * (Math.random() * 0.45 + 0.5);

        let depPort = PORTS[Math.floor(Math.random() * PORTS.length)];
        let arrPort = PORTS[Math.floor(Math.random() * PORTS.length)];
        while (depPort === arrPort) {
            arrPort = PORTS[Math.floor(Math.random() * PORTS.length)];
        }

        voyagesTemp.push({
            departureTime: currentTime,
            arrivalTime: arrivalTime,
            distanceSailed: distance,
            cargoCarried: cargoCarried,
            departurePort: depPort,
            arrivalPort: arrPort,
        });

        // Next voyage turnaround time (2 to 5 days)
        const turnaroundDays = Math.random() * 3 + 2;
        currentTime = new Date(arrivalTime.getTime() + turnaroundDays * 24 * 60 * 60 * 1000);
      }
      
      // Calculate realistic required CII trajectory
      const requiredCii = year === 2022 ? 4.75 : (year === 2023 ? 4.55 : 4.45);
      const targetGrade = vDef.trajectory[yearIdx];
      const targetAer = getAerForGrade(targetGrade, requiredCii);
      
      // Back-calculate exact fuel requirements to hit the required CII trajectory
      const totalCo2MT = (targetAer * dbVessel.deadweight * totalDistance) / 1000000;
      const totalFuelMT = totalCo2MT / CF_FACTORS[vDef.primaryFuel];
      
      let attainedCo2 = 0;

      for (const vTemp of voyagesTemp) {
        // Distribute fuel proportionally to distance sailed
        const fuelAmt = totalFuelMT * (vTemp.distanceSailed / totalDistance);
        // Add tiny jitter to make data look organic
        const jitter = fuelAmt * (Math.random() * 0.05 - 0.025);
        const finalFuel = fuelAmt + jitter;
        
        await prisma.voyage.create({
            data: {
                vesselId: dbVessel.id,
                departureTime: vTemp.departureTime,
                arrivalTime: vTemp.arrivalTime,
                departurePort: vTemp.departurePort,
                arrivalPort: vTemp.arrivalPort,
                distanceSailed: vTemp.distanceSailed,
                cargoCarried: vTemp.cargoCarried,
                fuelConsumptions: {
                    create: {
                        fuelType: vDef.primaryFuel,
                        quantity: finalFuel
                    }
                }
            }
        });
        
        attainedCo2 += finalFuel * CF_FACTORS[vDef.primaryFuel];
      }
      
      // Calculate final actual AER with jitter included
      const actualAer = (attainedCo2 * 1000000) / (dbVessel.deadweight * totalDistance);
      
      let finalGrade = 'C';
      if (actualAer < requiredCii * 0.85) finalGrade = 'A';
      else if (actualAer < requiredCii * 0.94) finalGrade = 'B';
      else if (actualAer < requiredCii * 1.06) finalGrade = 'C';
      else if (actualAer < requiredCii * 1.19) finalGrade = 'D';
      else finalGrade = 'E';

      await prisma.ciiRating.create({
        data: {
            vesselId: dbVessel.id,
            year: year,
            requiredCii: requiredCii,
            attainedCii: actualAer,
            rating: finalGrade,
            aerScore: actualAer
        }
      });
    }

    // Compliance Documents
    const numDocs = Math.floor(Math.random() * 3) + 3; // 3 to 5 documents per vessel
    const selectedTypes = [...DOC_TYPES].sort(() => 0.5 - Math.random()).slice(0, numDocs);
    
    for (const type of selectedTypes) {
        const now = new Date();
        const daysOffset = Math.floor(Math.random() * 1000) - 300; // -300 to +700 days
        const expiryDate = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
        
        let status = DOC_STATUSES[Math.floor(Math.random() * DOC_STATUSES.length)];
        
        // Force logical status based on date
        if (expiryDate < now && status === 'APPROVED') {
            status = 'OVERDUE';
        }
        
        await prisma.complianceDocument.create({
            data: {
                vesselId: dbVessel.id,
                documentType: type,
                status: status,
                expiryDate: expiryDate,
            }
        });
    }
  }

  // 4. Assignments
  console.log('Assigning users to vessels...');
  
  // Manager gets first 7 vessels
  const managerVessels = createdVessels.slice(0, 7);
  for (const v of managerVessels) {
      await prisma.vesselOfficer.create({
          data: { userId: manager.id, vesselId: v.id }
      });
  }

  // Officer 1 gets vessels 0 and 1
  const officer1Vessels = createdVessels.slice(0, 2);
  for (const v of officer1Vessels) {
      await prisma.vesselOfficer.create({
          data: { userId: officer1.id, vesselId: v.id }
      });
  }

  // Officer 2 gets vessels 2 and 3
  const officer2Vessels = createdVessels.slice(2, 4);
  for (const v of officer2Vessels) {
      await prisma.vesselOfficer.create({
          data: { userId: officer2.id, vesselId: v.id }
      });
  }

  console.log('Seed completed successfully! Database is ready.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
