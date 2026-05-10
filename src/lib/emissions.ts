import { FuelType } from "@prisma/client"

/**
 * Standard IMO recognized Carbon Emission Factors (Cf).
 * Represents tonnes of CO2 emitted per tonne of fuel burned.
 */
export const EMISSION_FACTORS: Record<FuelType, number> = {
  VLSFO: 3.114,
  MGO: 3.206,
  LNG: 2.750,
  HFO: 3.114,       // Standard heavy fuel equivalent to VLSFO baseline for basic calculation
  METHANOL: 1.375,  // Approximate
  AMMONIA: 0.000    // Tank-to-wake zero carbon
}

/**
 * Calculates the total CO2 emissions for a given quantity of fuel.
 * 
 * Formula: CO2 = fuel_consumption × emission_factor
 * 
 * @param fuelConsumption Metric tonnes of fuel burned.
 * @param fuelType The specific FuelType enum representing the bunker loaded.
 * @returns Total Metric Tonnes of CO2 emitted into the atmosphere.
 */
export function calculateCo2Emissions(
  fuelConsumption: number,
  fuelType: FuelType | keyof typeof FuelType
): number {
  if (fuelConsumption <= 0) return 0

  const factor = EMISSION_FACTORS[fuelType as FuelType] || 3.114 // Default to VLSFO baseline if unknown
  
  return fuelConsumption * factor
}
