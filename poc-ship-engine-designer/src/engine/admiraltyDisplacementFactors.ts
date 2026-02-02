/**
 * Admiralty Coefficient Displacement Adjustment Factors
 * 
 * Accounts for how displacement naturally affects the Admiralty coefficient.
 * Factors derived from 1960s warship dataset, excluding outliers (Brooke-class).
 * 
 * The Admiralty formula C = (D^(2/3) × V^3) / P shows that:
 * - Smaller vessels (high power-to-displacement) tend to have LOWER coefficients
 * - Larger vessels (lower power-to-displacement) tend to have HIGHER coefficients
 * 
 * These factors normalize the coefficient against expected values for each displacement class.
 */

export interface DisplacementFactor {
  minDisplacement: number;  // tonnes
  maxDisplacement: number;  // tonnes
  label: string;
  expectedCoefficient: number; // baseline expected coefficient for this class
  adjustmentFactor: number; // multiplier to normalize to fleet average
}

/**
 * Displacement-based adjustment factors
 * 
 * Derived from normalized coefficients (27kt baseline):
 * - Poti (508t): 22.1
 * - Whitby (2150t): 73.3
 * - Leander (2350t): 77.8
 * - Charles F. Adams (3277t): 83.2
 * - Kashin (3400t): 62.2
 * - County (6200t): 74.2
 * (Brooke-class 144.1 excluded as outlier with insufficient power allocation)
 * 
 * Fleet average (excluding Brooke): 73.5
 * Expected pattern: small vessels more efficient, mid-range less efficient, large vessels recover efficiency
 */
export const admiraltyDisplacementFactors: DisplacementFactor[] = [
  {
    minDisplacement: 0,
    maxDisplacement: 600,
    label: "Corvette/Fast Attack",
    expectedCoefficient: 22.1, // Poti-class baseline
    adjustmentFactor: 3.32,    // 73.5 / 22.1 = normalize to fleet average
  },
  {
    minDisplacement: 600,
    maxDisplacement: 2000,
    label: "Light Frigate",
    expectedCoefficient: 60.0, // interpolated between corvette and medium frigate
    adjustmentFactor: 1.225,   // 73.5 / 60.0
  },
  {
    minDisplacement: 2000,
    maxDisplacement: 2500,
    label: "Medium Frigate",
    expectedCoefficient: 75.5, // average of Whitby (73.3) and Leander (77.8)
    adjustmentFactor: 0.973,   // 73.5 / 75.5 = slightly less efficient
  },
  {
    minDisplacement: 2500,
    maxDisplacement: 3500,
    label: "Large Frigate / Small Destroyer",
    expectedCoefficient: 83.2, // Charles F. Adams baseline
    adjustmentFactor: 0.884,   // 73.5 / 83.2
  },
  {
    minDisplacement: 3500,
    maxDisplacement: 4500,
    label: "Destroyer",
    expectedCoefficient: 68.2, // average of Kashin (62.2) and midpoint
    adjustmentFactor: 1.078,   // 73.5 / 68.2 = more efficient
  },
  {
    minDisplacement: 4500,
    maxDisplacement: Infinity,
    label: "Large Destroyer / Cruiser",
    expectedCoefficient: 74.2, // County-class baseline
    adjustmentFactor: 0.991,   // 73.5 / 74.2 ≈ 1.0 (reference point)
  },
];

/**
 * Get displacement adjustment factor for a given displacement
 * @param displacement Standard displacement in tonnes
 * @returns DisplacementFactor configuration for this displacement class
 */
export function getDisplacementFactor(displacement: number): DisplacementFactor {
  for (const factor of admiraltyDisplacementFactors) {
    if (displacement >= factor.minDisplacement && displacement <= factor.maxDisplacement) {
      return factor;
    }
  }
  // Fallback to largest category
  return admiraltyDisplacementFactors[admiraltyDisplacementFactors.length - 1];
}

/**
 * Apply displacement adjustment to Admiralty coefficient
 * Normalizes coefficient against expected value for displacement class
 * 
 * @param coefficient Raw Admiralty coefficient
 * @param displacement Standard displacement in tonnes
 * @returns Adjusted coefficient normalized to fleet average
 */
export function applyDisplacementAdjustment(
  coefficient: number,
  displacement: number,
): number {
  const factor = getDisplacementFactor(displacement);
  return coefficient * factor.adjustmentFactor;
}

/**
 * Get Admiralty coefficient with displacement context
 * 
 * @param coefficient Raw Admiralty coefficient
 * @param displacement Standard displacement in tonnes
 * @returns Object with coefficient, displacement factor info, and adjusted value
 */
export function analyzeAdmiraltyCoefficient(coefficient: number, displacement: number) {
  const factor = getDisplacementFactor(displacement);
  const adjusted = coefficient * factor.adjustmentFactor;
  
  return {
    rawCoefficient: coefficient,
    displacement,
    displacementClass: factor.label,
    expectedCoefficient: factor.expectedCoefficient,
    adjustmentFactor: factor.adjustmentFactor,
    adjustedCoefficient: adjusted,
    isOutlier: Math.abs(adjusted - 73.5) > 40, // > 40 points from fleet average
  };
}

export default admiraltyDisplacementFactors;
