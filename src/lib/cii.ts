/**
 * Carbon Intensity Indicator (CII) & Annual Efficiency Ratio (AER) core module.
 */

/**
 * Calculates the exact CII metric (AER Formula).
 * Formula: CII = CO₂ / (DWT × Distance)
 * 
 * To match the industry-standard scale (where CII usually falls between 3.0 to 15.0),
 * CO2 metric tonnes are converted to grams.
 * 
 * @param co2EmittedMt Total Metric Tonnes of CO2 emitted.
 * @param deadweightTonnage The capacity of the vessel in tonnes.
 * @param distance Total distance sailed in nautical miles.
 * @returns CII numeric value (gCO2 / t*nm).
 */
export function calculateAER(co2EmittedMt: number, deadweightTonnage: number, distance: number): number {
  if (deadweightTonnage <= 0 || distance <= 0) return 0

  // 1 Metric Tonne = 1,000,000 Grams
  const totalCo2Grams = co2EmittedMt * 1_000_000
  const transportWork = deadweightTonnage * distance

  return totalCo2Grams / transportWork
}

/**
 * Maps a numeric CII value to the regulatory A-E rating band.
 * Implementation of strict structural thresholds.
 * 
 * A: CII < 5
 * B: 5 ≤ CII < 7
 * C: 7 ≤ CII < 9
 * D: 9 ≤ CII < 11
 * E: ≥ 11
 */
export function determineCiiRating(cii: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  if (cii <= 0) return 'A' // No emissions or no work performed default
  if (cii < 5) return 'A'
  if (cii < 7) return 'B'
  if (cii < 9) return 'C'
  if (cii < 11) return 'D'
  return 'E'
}
