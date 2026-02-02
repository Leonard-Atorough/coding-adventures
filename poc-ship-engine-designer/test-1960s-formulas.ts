/**
 * 1960s Era-Homogenous Naval Vessel Power Formula Analysis
 * Tests all 6 power formulas against 20 verified Wikipedia 1960s warships
 *
 * Goal: Compare formula accuracy on historically consistent dataset
 * (no technological mixing across 1940s-2000s, just 1950s-1970s vessels)
 */

import { vessels1960s } from "./1960s-naval-vessels.js";
import {
  getDisplacementFactor,
  analyzeAdmiraltyCoefficient,
  admiraltyDisplacementFactors,
} from "./src/engine/admiraltyDisplacementFactors.js";

// ============================================================================
// FORMULA IMPLEMENTATIONS
// ============================================================================

function calculateFormula1(
  displacement: number,
  speed: number,
  hullDragCoefficient: number = 0.1,
): number {
  const baseHPCoefficient = 0.0035;
  const hullDragFactor = 1.0 + hullDragCoefficient * 8;
  return baseHPCoefficient * Math.pow(displacement, 0.67) * Math.pow(speed, 3) * hullDragFactor;
}

function calculateFormula2(displacement: number, speed: number, scaling: number = 105): number {
  return (Math.pow(displacement, 2 / 3) * Math.pow(speed, 3)) / scaling;
}

function calculateFormula2a(
  displacement: number,
  speed: number,
  scaling: number = 140,
  propulsionEfficiency: number = 1.0,
): number {
  return calculateFormula2(displacement, speed, scaling) * propulsionEfficiency;
}

function calculateFormula2b(
  displacement: number,
  speed: number,
  baseScaling: number = 105,
): number {
  // Admiralty formula with displacement scaling factor applied
  // Uses displacement class factor to adjust the scaling constant
  // Smaller vessels get smaller scaling (stronger prediction), larger get larger scaling
  const displacementFactor = getDisplacementFactor(displacement);
  const adjustedScaling = baseScaling * displacementFactor.adjustmentFactor;
  return (Math.pow(displacement, 2 / 3) * Math.pow(speed, 3)) / adjustedScaling;
}

function calculateFormula3(displacement: number, speed: number): number {
  const shipType =
    displacement < 2000
      ? "fast_attack"
      : displacement < 5000
        ? "frigate"
        : displacement < 15000
          ? "destroyer"
          : "capital";

  const scalingFactors: Record<string, number> = {
    fast_attack: 500,
    frigate: 800,
    destroyer: 1200,
    capital: 2800,
  };

  return (Math.pow(displacement, 2 / 3) * Math.pow(speed, 3)) / scalingFactors[shipType];
}

function calculateFormula4(
  displacement: number,
  speed: number,
  baseScaling: number = 500,
  displacementExponent: number = -0.1,
): number {
  const baseFormula = Math.pow(displacement, 2 / 3) * Math.pow(speed, 3);
  const effectiveScaling = baseScaling * Math.pow(displacement, displacementExponent);
  return baseFormula / effectiveScaling;
}

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

// ============================================================================
// TEST RUNNER
// ============================================================================

console.log("╔════════════════════════════════════════════════════════════════════╗");
console.log("║   1960s-ERA WARSHIP POWER FORMULA ANALYSIS                         ║");
console.log("║   Testing 6 Formulas Against 20 Wikipedia-Verified Vessels        ║");
console.log("╚════════════════════════════════════════════════════════════════════╝\n");

console.log(`Dataset: ${vessels1960s.length} vessels\n`);

// ============================================================================
// TEST EACH FORMULA
// ============================================================================

const formulas = [
  {
    name: "Formula 1: Empirical (0.0035 × Disp^0.67 × Speed^3 × HullFactor)",
    calculate: (v: (typeof vessels1960s)[0]) => calculateFormula1(v.displacement.standard, v.speed),
  },
  {
    name: "Formula 2: Admiralty (Disp^2/3 × Speed^3 / 105)",
    calculate: (v: (typeof vessels1960s)[0]) => calculateFormula2(v.displacement.standard, v.speed),
  },
  {
    name: "Formula 2b: Admiralty + Displacement Scaling",
    calculate: (v: (typeof vessels1960s)[0]) => calculateFormula2b(v.displacement.standard, v.speed),
  },
  {
    name: "Formula 2a: Admiralty + Propulsion Efficiency",
    calculate: (v: (typeof vessels1960s)[0]) => {
      const efficiency = v.propulsionType === "cogag" ? 0.93 : 1.0;
      return calculateFormula2a(v.displacement.standard, v.speed, 140, efficiency);
    },
  },
  {
    name: "Formula 3: Discrete Ship Type Categories",
    calculate: (v: (typeof vessels1960s)[0]) => calculateFormula3(v.displacement.standard, v.speed),
  },
  {
    name: "Formula 4: Continuous Displacement Scaling",
    calculate: (v: (typeof vessels1960s)[0]) => calculateFormula4(v.displacement.standard, v.speed),
  },
  {
    name: "Formula 6: Hydrodynamic-Aware (with hull form & efficiency)",
    calculate: (v: (typeof vessels1960s)[0]) => {
      const hullForm = v.hullForm as "planing" | "displacement";
      const efficiency = v.propulsionType === "cogag" ? 0.93 : 1.0;
      return calculateFormula6(v.displacement.standard, v.speed, 130, hullForm, efficiency);
    },
  },
];

const results: { name: string; errors: number[] }[] = [];

for (const formula of formulas) {
  const errors: number[] = [];
  let totalError = 0;

  console.log(`\n─ ${formula.name}`);
  console.log("  Ship | Displacement | Speed | Actual SHP | Calc SHP | Error");
  console.log("  " + "─".repeat(68));

  for (const vessel of vessels1960s) {
    const calculated = formula.calculate(vessel);
    const actualPower = vessel.maxPowerPerEngineGroup * (vessel.numberOfShafts || 1);
    const error = ((calculated - actualPower) / actualPower) * 100;
    const absError = Math.abs(error);
    errors.push(absError);
    totalError += absError;

    const errorIcon = absError < 10 ? "✓" : absError < 20 ? "⚠" : "✗";
    console.log(
      `  ${errorIcon} ${vessel.name.substring(0, 20).padEnd(20)} | ` +
        `${vessel.displacement.standard.toString().padStart(5)}t | ` +
        `${vessel.speed.toString().padStart(2)}kt | ` +
        `${actualPower.toLocaleString().padStart(9)} | ` +
        `${calculated.toFixed(0).padStart(9)} | ` +
        `${error.toFixed(1).padStart(6)}%`,
    );
  }

  const avgError = totalError / vessels1960s.length;
  const minError = Math.min(...errors);
  const maxError = Math.max(...errors);

  console.log("  " + "─".repeat(68));
  console.log(
    `  Results: Avg ${avgError.toFixed(1)}% | Min ${minError.toFixed(1)}% | Max ${maxError.toFixed(1)}%\n`,
  );

  results.push({ name: formula.name, errors });
}

// ============================================================================
// SUMMARY RANKINGS
// ============================================================================

console.log("\n" + "═".repeat(72));
console.log("FORMULA RANKINGS (1960s Dataset)");
console.log("═".repeat(72));

const rankings = results
  .map((r) => ({
    name: r.name,
    avgError: r.errors.reduce((a, b) => a + b, 0) / r.errors.length,
  }))
  .sort((a, b) => a.avgError - b.avgError);

for (let i = 0; i < rankings.length; i++) {
  const rank = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  ";
  const shortName = rankings[i].name.split(":")[1].trim();
  console.log(`${rank} ${shortName.padEnd(48)} ${rankings[i].avgError.toFixed(1)}% avg error`);
}

console.log("\n" + "─".repeat(72));
console.log("RECOMMENDATION:\n");
const bestFormula = rankings[0];
if (bestFormula.avgError < 15) {
  console.log(`✓ ${bestFormula.name.split(":")[1].trim()}`);
  console.log(`  ${bestFormula.avgError.toFixed(1)}% average error on 1960s dataset`);
} else if (bestFormula.avgError < 25) {
  console.log(`⚠ ${bestFormula.name.split(":")[1].trim()}`);
  console.log(`  ${bestFormula.avgError.toFixed(1)}% average error (acceptable)`);
} else {
  console.log(`✗ No formula meets acceptable accuracy threshold`);
  console.log(`  Best option: ${bestFormula.avgError.toFixed(1)}% average error`);
}

// ============================================================================
// ADMIRALTY COEFFICIENT ANALYSIS BY SHIP CLASS
// ============================================================================

console.log("\n" + "═".repeat(72));
console.log("ADMIRALTY COEFFICIENT BY SHIP CLASS");
console.log("═".repeat(72));

interface ClassCoefficient {
  class: string;
  coefficient: number;
  normalizedCoefficient: number; // at 27 knots baseline
  vesselCount: number;
  avgDisplacement: number;
  avgSpeed: number;
  avgPower: number;
}

const SHP_TO_KW = 0.7457; // Conversion factor: 1 SHP = 0.7457 kW

function calculateAdmiraltyCoefficient(
  displacement: number,
  speed: number,
  powerSHP: number,
): number {
  // Wärtsilä formula: C = (D^(2/3) × V^3) / P
  // Where D = displacement (tonnes), V = speed (knots), P = power (kW)
  // Typical range: 400-600 (higher = more economical)
  const powerKW = powerSHP * SHP_TO_KW;
  return (Math.pow(displacement, 2 / 3) * Math.pow(speed, 3)) / powerKW;
}

function calculateNormalizedAdmiraltyCoefficient(
  displacement: number,
  powerSHP: number,
  baselineSpeed: number = 27,
): number {
  // Normalized: C = (D^(2/3) × BaselineSpeed^3) / P
  // Uses constant baseline speed for all vessels for fairer comparison
  // Shows hull efficiency independent of speed design envelope
  const powerKW = powerSHP * SHP_TO_KW;
  return (Math.pow(displacement, 2 / 3) * Math.pow(baselineSpeed, 3)) / powerKW;
}

// Group vessels by class and calculate aggregated Admiralty coefficient
const classCoefficients: Record<string, ClassCoefficient> = {};

for (const vessel of vessels1960s) {
  const actualPower = vessel.maxPowerPerEngineGroup * (vessel.numberOfShafts || 1);
  const coefficient = calculateAdmiraltyCoefficient(
    vessel.displacement.standard,
    vessel.speed,
    actualPower,
  );
  const normalizedCoefficient = calculateNormalizedAdmiraltyCoefficient(
    vessel.displacement.standard,
    actualPower,
    27, // baseline speed: lowest speed in dataset
  );

  if (!classCoefficients[vessel.class]) {
    classCoefficients[vessel.class] = {
      class: vessel.class,
      coefficient: coefficient,
      normalizedCoefficient: normalizedCoefficient,
      vesselCount: 1,
      avgDisplacement: vessel.displacement.standard,
      avgSpeed: vessel.speed,
      avgPower: actualPower,
    };
  } else {
    const existing = classCoefficients[vessel.class];
    existing.coefficient =
      (existing.coefficient * existing.vesselCount + coefficient) / (existing.vesselCount + 1);
    existing.normalizedCoefficient =
      (existing.normalizedCoefficient * existing.vesselCount + normalizedCoefficient) /
      (existing.vesselCount + 1);
    existing.avgDisplacement =
      (existing.avgDisplacement * existing.vesselCount + vessel.displacement.standard) /
      (existing.vesselCount + 1);
    existing.avgSpeed =
      (existing.avgSpeed * existing.vesselCount + vessel.speed) / (existing.vesselCount + 1);
    existing.avgPower =
      (existing.avgPower * existing.vesselCount + actualPower) / (existing.vesselCount + 1);
    existing.vesselCount++;
  }
}

// Sort by displacement, then speed, then power
const sortedClasses = Object.values(classCoefficients).sort((a, b) => {
  // Primary: sort by displacement (ascending)
  if (a.avgDisplacement !== b.avgDisplacement) {
    return a.avgDisplacement - b.avgDisplacement;
  }
  // Secondary: sort by speed (ascending)
  if (a.avgSpeed !== b.avgSpeed) {
    return a.avgSpeed - b.avgSpeed;
  }
  // Tertiary: sort by power (ascending)
  return a.avgPower - b.avgPower;
});

console.log(
  "\nClass Name                          Coefficient  Vessels  Avg Disp  Avg Speed  Avg Power",
);
console.log("─".repeat(92));

for (const classData of sortedClasses) {
  const efficiency = classData.coefficient < 140 ? "✓" : classData.coefficient < 160 ? "⚠" : "✗";
  console.log(
    `${efficiency} ${classData.class.padEnd(32)} ${classData.coefficient.toFixed(1).padStart(10)}` +
      `  ${classData.vesselCount.toString().padStart(7)}  ${classData.avgDisplacement.toFixed(0).padStart(7)}t` +
      `  ${classData.avgSpeed.toFixed(1).padStart(8)}kt  ${classData.avgPower.toFixed(0).padStart(8)} SHP`,
  );
}

console.log("\n" + "═".repeat(92));
console.log("ADMIRALTY COEFFICIENT (Normalized to 27 knots baseline)");
console.log("═".repeat(92));

console.log(
  "\nClass Name                    Coefficient @ 27kt  Vessels  Avg Disp  Avg Speed  Avg Power",
);
console.log("─".repeat(92));

for (const classData of sortedClasses) {
  const efficiency =
    classData.normalizedCoefficient < 140
      ? "✓"
      : classData.normalizedCoefficient < 160
        ? "⚠"
        : "✗";
  console.log(
    `${efficiency} ${classData.class.padEnd(28)} ${classData.normalizedCoefficient.toFixed(1).padStart(16)}` +
      `  ${classData.vesselCount.toString().padStart(7)}  ${classData.avgDisplacement.toFixed(0).padStart(7)}t` +
      `  ${classData.avgSpeed.toFixed(1).padStart(8)}kt  ${classData.avgPower.toFixed(0).padStart(8)} SHP`,
  );
}

console.log("\n" + "─".repeat(92));
console.log("Admiralty Coefficient Interpretation:");
console.log("  Lower values = more power-efficient (good power delivery per unit displacement/speed)");
console.log("  Formula: C = (D^(2/3) × V^3) / P, where D=tonnes, V=knots, P=kW");
console.log("  Wärtsilä benchmark: 400-600 (typical commercial vessels)");
console.log("  Our warship dataset: 22-173 (reflects higher power-to-displacement ratios)");
console.log("  Note: Our values are lower due to warship emphasis on speed/power over economy");
console.log("");

// ============================================================================
// ADMIRALTY COEFFICIENT ANALYSIS
// ============================================================================

console.log("\n" + "═".repeat(92));
console.log("COEFFICIENT RANGE ANALYSIS");
console.log("═".repeat(92));

// Calculate statistics on normalized coefficients (fairer comparison)
const normalizedCoeffs = sortedClasses.map((c) => c.normalizedCoefficient);
const actualCoeffs = sortedClasses.map((c) => c.coefficient);

const minNorm = Math.min(...normalizedCoeffs);
const maxNorm = Math.max(...normalizedCoeffs);
const avgNorm = normalizedCoeffs.reduce((a, b) => a + b, 0) / normalizedCoeffs.length;
const medianNorm =
  normalizedCoeffs.length % 2 === 0
    ? (normalizedCoeffs[normalizedCoeffs.length / 2 - 1] +
        normalizedCoeffs[normalizedCoeffs.length / 2]) /
      2
    : normalizedCoeffs[Math.floor(normalizedCoeffs.length / 2)];

const minAct = Math.min(...actualCoeffs);
const maxAct = Math.max(...actualCoeffs);
const avgAct = actualCoeffs.reduce((a, b) => a + b, 0) / actualCoeffs.length;

console.log("\n1. COEFFICIENT STATISTICS (Normalized to 27 knots)");
console.log("─".repeat(92));
console.log(
  `   Minimum:  ${minNorm.toFixed(1).padStart(6)} (${sortedClasses.find((c) => c.normalizedCoefficient === minNorm)?.class})`,
);
console.log(
  `   Maximum:  ${maxNorm.toFixed(1).padStart(6)} (${sortedClasses.find((c) => c.normalizedCoefficient === maxNorm)?.class})`,
);
console.log(`   Average:  ${avgNorm.toFixed(1).padStart(6)}`);
console.log(`   Median:   ${medianNorm.toFixed(1).padStart(6)}`);
console.log(`   Range:    ${(maxNorm - minNorm).toFixed(1).padStart(6)} (difference)`);
console.log(`   Ratio:    ${(maxNorm / minNorm).toFixed(1).padStart(5)}x (least/most efficient)`);

console.log("\n2. EFFICIENCY TIERS (Normalized @ 27kt)");
console.log("─".repeat(92));

// Define efficiency tiers for warships
const tierBoundaries = [
  { name: "Excellent", max: 40, icon: "✓✓" },
  { name: "Good", max: 70, icon: "✓" },
  { name: "Average", max: 100, icon: "⚠" },
  { name: "Poor", max: Infinity, icon: "✗" },
];

for (const tier of tierBoundaries) {
  const shipsInTier = sortedClasses.filter(
    (c) =>
      c.normalizedCoefficient <=
      tier.max &&
      c.normalizedCoefficient >
        (tierBoundaries[tierBoundaries.indexOf(tier) - 1]?.max ?? -1),
  );
  if (shipsInTier.length > 0) {
    console.log(
      `\n   ${tier.icon} ${tier.name}: ${shipsInTier.map((c) => `${c.class.split("(")[0].trim()} (${c.normalizedCoefficient.toFixed(1)})`).join(", ")}`,
    );
  }
}

console.log("\n3. SPEED DESIGN PENALTY (Actual vs Normalized Coefficient)");
console.log("─".repeat(92));
console.log("   Class Name                           Actual    Normalized    Penalty    % Increase");
console.log("   " + "─".repeat(88));

const speedPenalties = sortedClasses
  .map((c) => ({
    class: c.class,
    actual: c.coefficient,
    normalized: c.normalizedCoefficient,
    penalty: c.coefficient - c.normalizedCoefficient,
    percentIncrease: ((c.coefficient / c.normalizedCoefficient - 1) * 100).toFixed(1),
    speed: c.avgSpeed,
  }))
  .sort((a, b) => b.percentIncrease - a.percentIncrease);

for (const penalty of speedPenalties) {
  const penaltyIcon = parseFloat(penalty.percentIncrease) > 100 ? "⚠" : " ";
  console.log(
    `   ${penaltyIcon} ${penalty.class.padEnd(32)} ${penalty.actual.toFixed(1).padStart(7)}    ${penalty.normalized.toFixed(1).padStart(10)}    ${penalty.penalty.toFixed(1).padStart(7)}    ${penalty.percentIncrease.padStart(6)}%`,
  );
}

console.log("\n4. ANALYSIS BY VESSEL TYPE");
console.log("─".repeat(92));

// Group by vessel type
const byType: Record<string, typeof sortedClasses> = {};
for (const vessel of vessels1960s) {
  const classData = sortedClasses.find((c) => c.class === vessel.class);
  if (classData) {
    if (!byType[vessel.vesselType]) byType[vessel.vesselType] = [];
    if (!byType[vessel.vesselType].includes(classData)) {
      byType[vessel.vesselType].push(classData);
    }
  }
}

for (const [type, ships] of Object.entries(byType)) {
  const coeffs = ships.map((s) => s.normalizedCoefficient);
  const avg = coeffs.reduce((a, b) => a + b, 0) / coeffs.length;
  console.log(
    `\n   ${type.toUpperCase()}: avg coefficient ${avg.toFixed(1)} (n=${ships.length})`,
  );
  for (const ship of ships) {
    console.log(`      - ${ship.class.padEnd(28)} ${ship.normalizedCoefficient.toFixed(1).padStart(6)}`);
  }
}

console.log("\n5. ANALYSIS BY PROPULSION TYPE");
console.log("─".repeat(92));

// Group by propulsion type
const byPropulsion: Record<string, typeof sortedClasses> = {};
for (const vessel of vessels1960s) {
  const classData = sortedClasses.find((c) => c.class === vessel.class);
  if (classData) {
    if (!byPropulsion[vessel.propulsionType]) byPropulsion[vessel.propulsionType] = [];
    if (!byPropulsion[vessel.propulsionType].includes(classData)) {
      byPropulsion[vessel.propulsionType].push(classData);
    }
  }
}

const propulsionStats = Object.entries(byPropulsion).map(([type, ships]) => {
  const coeffs = ships.map((s) => s.normalizedCoefficient);
  const avg = coeffs.reduce((a, b) => a + b, 0) / coeffs.length;
  return { type, avg, ships, count: ships.length };
});

propulsionStats.sort((a, b) => a.avg - b.avg);

for (const stat of propulsionStats) {
  const efficiency = stat.avg < 60 ? "✓✓" : stat.avg < 80 ? "✓" : "⚠";
  console.log(
    `\n   ${efficiency} ${stat.type.toUpperCase().padEnd(20)} avg: ${stat.avg.toFixed(1).padStart(6)} (n=${stat.count})`,
  );
  for (const ship of stat.ships) {
    console.log(`      - ${ship.class.padEnd(28)} ${ship.normalizedCoefficient.toFixed(1).padStart(6)}`);
  }
}

console.log("\n" + "─".repeat(92));

// ============================================================================
// DISPLACEMENT-ADJUSTED ADMIRALTY COEFFICIENT ANALYSIS
// ============================================================================

console.log("\n" + "═".repeat(92));
console.log("DISPLACEMENT-ADJUSTED COEFFICIENT ANALYSIS");
console.log("═".repeat(92));
console.log(
  "\nAdjustment factors account for how displacement class naturally affects the coefficient.",
);
console.log(
  "Smaller vessels are more efficient (lower coefficients), larger vessels less efficient.",
);
console.log(
  "Fleet average baseline: 73.5 (excluding Brooke-class outlier with insufficient power)\n",
);

console.log(
  "Class Name                           Displacement  Displacement Class        Normalized  Adjusted  Outlier?",
);
console.log("─".repeat(92));

const adjustedAnalyses = sortedClasses
  .map((c) => {
    const vessel = vessels1960s.find((v) => v.class === c.class);
    if (!vessel) return null;
    const analysis = analyzeAdmiraltyCoefficient(c.normalizedCoefficient, vessel.displacement.standard);
    return { ...analysis, className: c.class };
  })
  .filter((a) => a !== null)
  .sort((a, b) => a.displacement - b.displacement);

for (const analysis of adjustedAnalyses) {
  const outlierFlag = analysis.isOutlier ? "✗" : " ";
  const factor = getDisplacementFactor(analysis.displacement);
  console.log(
    `${outlierFlag} ${analysis.className.padEnd(32)} ${analysis.displacement.toString().padStart(6)}t  ${factor.label.padEnd(22)}  ${analysis.rawCoefficient.toFixed(1).padStart(9)}  ${analysis.adjustedCoefficient.toFixed(1).padStart(7)}  ${analysis.isOutlier ? "YES" : "no"}`,
  );
}

console.log("\n" + "─".repeat(92));
console.log("Adjustment factor details:");
console.log("────────────────────────────────────────────────────────────────────────────────");
for (const factor of admiraltyDisplacementFactors) {
  if (factor.maxDisplacement === Infinity) {
    console.log(
      `  ${factor.label.padEnd(30)} ${factor.minDisplacement.toString().padStart(5)}t+  ` +
        `Expected: ${factor.expectedCoefficient.toFixed(1).padStart(6)}  Factor: ${factor.adjustmentFactor.toFixed(3)}`,
    );
  } else {
    console.log(
      `  ${factor.label.padEnd(30)} ${factor.minDisplacement.toString().padStart(5)}-${factor.maxDisplacement.toString().padEnd(5)}t  ` +
        `Expected: ${factor.expectedCoefficient.toFixed(1).padStart(6)}  Factor: ${factor.adjustmentFactor.toFixed(3)}`,
    );
  }
}

console.log("");
