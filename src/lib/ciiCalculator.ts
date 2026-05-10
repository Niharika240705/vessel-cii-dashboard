import { VesselType } from "@prisma/client"

/**
 * CII Calculator (MEPC.337(76) and MEPC.339(76) implementations)
 * Note: These are simplified proxy constants mapped to IMO regulatory bounds
 */

const SHIP_TYPE_PARAMETERS: Record<VesselType, { a: number, c: number, d1: number, d2: number, d3: number, d4: number }> = {
  BULK_CARRIER: { a: 4745, c: 0.464, d1: 0.86, d2: 0.94, d3: 1.06, d4: 1.18 },
  TANKER: { a: 5247, c: 0.461, d1: 0.82, d2: 0.93, d3: 1.08, d4: 1.28 },
  CONTAINER: { a: 1984, c: 0.489, d1: 0.83, d2: 0.94, d3: 1.07, d4: 1.19 },
  LNG_CARRIER: { a: 9806, c: 0.471, d1: 0.89, d2: 0.98, d3: 1.06, d4: 1.14 },
  RO_RO: { a: 1967, c: 0.488, d1: 0.87, d2: 0.96, d3: 1.06, d4: 1.14 },
  GENERAL_CARGO: { a: 31948, c: 0.579, d1: 0.83, d2: 0.94, d3: 1.06, d4: 1.19 },
  PATROL_VESSEL: { a: 31948, c: 0.579, d1: 0.83, d2: 0.94, d3: 1.06, d4: 1.19 },
  OFFSHORE_PATROL_VESSEL: { a: 31948, c: 0.579, d1: 0.83, d2: 0.94, d3: 1.06, d4: 1.19 },
  LOGISTICS_SUPPORT: { a: 5247, c: 0.461, d1: 0.82, d2: 0.93, d3: 1.08, d4: 1.28 },
  AUXILIARY: { a: 31948, c: 0.579, d1: 0.83, d2: 0.94, d3: 1.06, d4: 1.19 },
  REPLENISHMENT_VESSEL: { a: 5247, c: 0.461, d1: 0.82, d2: 0.93, d3: 1.08, d4: 1.28 },
  TRAINING_VESSEL: { a: 31948, c: 0.579, d1: 0.83, d2: 0.94, d3: 1.06, d4: 1.19 }
}

// Reduction factors Z relative to 2019 reference year
const REDUCTION_FACTORS: Record<number, number> = {
  2023: 5,
  2024: 7,
  2025: 9,
  2026: 11,
  2027: 13,
  // 2028-2030 to be decided by IMO, mock extrapolations:
  2028: 15,
  2029: 17,
  2030: 20
}

/**
 * Calculates Required CII (MEPC.337)
 */
export function calculateRequiredCII(type: VesselType, capacity: number, year: number) {
  const params = SHIP_TYPE_PARAMETERS[type];
  if (!params) throw new Error("Unknown vessel type for CII calculation");

  const { a, c } = params;
  
  // Reference CII (2019 baseline)
  const ciiRef = a * Math.pow(capacity, -c);

  // Reduction Factor Z
  const Z = REDUCTION_FACTORS[year] || Math.max(...Object.values(REDUCTION_FACTORS));

  // Required CII
  const required = ciiRef * ((100 - Z) / 100);

  return { ciiRef, required, Z };
}

/**
 * Calculates Attained CII and Rating Band (MEPC.339)
 */
export function calculateAttainedCIIAndRating(
  type: VesselType, 
  capacity: number, 
  year: number, 
  co2EmittedMt: number,
  distanceSailedNm: number
) {
  const params = SHIP_TYPE_PARAMETERS[type];
  if (!params) throw new Error("Unknown vessel type");
  
  const { required } = calculateRequiredCII(type, capacity, year);
  
  // Attained CII (in grams CO2 per capacity-mile)
  // co2EmittedMt is in Metric Tons (1 MT = 1,000,000 grams)
  const attained = (co2EmittedMt * 1_000_000) / (capacity * distanceSailedNm);
  
  const ratio = attained / required;
  
  let rating = 'C';
  if (ratio < params.d1) rating = 'A';
  else if (ratio < params.d2) rating = 'B';
  else if (ratio < params.d3) rating = 'C';
  else if (ratio < params.d4) rating = 'D';
  else rating = 'E';

  // AER proxy = identical to attained for bulk/tankers based on DWT.
  // Actually AER = Attained / 1_000_000 since attained here is explicitly scaled to grams for IMO formulas.
  const aerScore = attained;

  return { attained, required, rating, aerScore };
}
