/**
 * Maritime fuel consumption dynamics module.
 */

// Baseline scaling constant indicating hydrodynamic drag offset.
const HYDRODYNAMIC_CONSTANT = 0.0002

/**
 * Calculates the realistic instantaneous fuel consumption for a vessel
 * at a given speed based on the Admiralty coefficient formula derivative.
 * 
 * Formula: Fuel Consumption = k * DWT * (speed^3)
 * 
 * @param deadweightTonnage The structural capacity (DWT) of the vessel in tonnes.
 * @param speedKnots The current recorded speed over ground (SOG) in knots.
 * @returns Rate of fuel consumption per day (in metric tonnes).
 */
export function calculateDailyFuelConsumption(
  deadweightTonnage: number,
  speedKnots: number
): number {
  if (speedKnots <= 0 || deadweightTonnage <= 0) return 0

  // Standard cubic relation for bunker consumption mapping
  const fuelConsumption = HYDRODYNAMIC_CONSTANT * deadweightTonnage * Math.pow(speedKnots, 3)

  return fuelConsumption
}

/**
 * Maps the daily fuel consumption array over a specific voyage duration
 * to determine the exact aggregate fuel burned.
 * 
 * @param dailyConsumption Rate from `calculateDailyFuelConsumption()`.
 * @param durationHours How long the vessel maintained this exact speed block.
 * @returns Total fuel consumed sequentially block over block in metric tonnes.
 */
export function calculateVoyageBlockFuel(
  dailyConsumption: number,
  durationHours: number
): number {
  // Translate 24h cycle to specific hour duration
  return (dailyConsumption / 24) * durationHours
}
