# Temporary Code Archive

## Removed Formulas and Analysis Sections

The following code was removed from test-1960s-formulas.ts during cleanup. It may be useful for future enhancements or analysis.

### Formula 5: Normalized Speed Factor (Removed)

```typescript
function calculateFormula5(
  displacement: number,
  speed: number,
  baseConst: number = 300,
  speedFactorMult: number = 0.5,
): number {
  const basePower = Math.pow(displacement, 2 / 3) * Math.pow(speed, 3);
  const speedNormalized = speed / Math.pow(displacement, 1 / 3);
  const speedFactor = Math.pow(speedNormalized / 1.5, speedFactorMult);
  return (basePower / baseConst) * speedFactor;
}
```

### Formula 6: Hydrodynamic-Aware (Removed)

```typescript
function calculateFormula6(
  displacement: number,
  speed: number,
  scaling: number = 130,
  hullForm: "planing" | "displacement" = "displacement",
  propulsionEfficiency: number = 1.0,
): number {
  const baseFormula = Math.pow(displacement, 2 / 3) * Math.pow(speed, 3);
  const resistanceFactor = hullForm === "planing" && displacement < 1000 ? 0.82 : 1.0;
  return (baseFormula / scaling) * resistanceFactor * propulsionEfficiency;
}
```

### Admiralty Coefficient Analysis Section (Removed)

```typescript
interface ClassCoefficient {
  class: string;
  coefficient: number;
  normalizedCoefficient: number;
  vesselCount: number;
  avgDisplacement: number;
  avgSpeed: number;
  avgPower: number;
}

const SHP_TO_KW = 0.7457;

function calculateAdmiraltyCoefficient(
  displacement: number,
  speed: number,
  powerSHP: number,
): number {
  const powerKW = powerSHP * SHP_TO_KW;
  return (Math.pow(displacement, 2 / 3) * Math.pow(speed, 3)) / powerKW;
}

function calculateNormalizedAdmiraltyCoefficient(
  displacement: number,
  powerSHP: number,
  baselineSpeed: number = 27,
): number {
  const powerKW = powerSHP * SHP_TO_KW;
  return (Math.pow(displacement, 2 / 3) * Math.pow(baselineSpeed, 3)) / powerKW;
}

// Coefficient grouping and analysis code...
// (See git history for full implementation)
```

### Coefficient Range Analysis (Removed)

```typescript
// Analyzed:
// 1. Coefficient statistics (min, max, average, median)
// 2. Efficiency tiers (excellent, good, average, poor)
// 3. Speed design penalty comparison
// 4. Analysis by vessel type
// 5. Analysis by propulsion type
// 6. Displacement-adjusted coefficient analysis
```

## Historical Test Data

These formulas were tested against 12 verified 1960s warship specifications.
The cleaned version retained the 3 best performers:

1. Admiralty + Resistance Factor (4.3% error) - TOP PERFORMER
2. Admiralty Coefficient (5.2% error)
3. Empirical (10.6% error)

Removed formulas (6.x% error and worse) are preserved here for reference.
