# 1960s Naval Warship Power Formula Analysis - Final Summary

## Project Objective

Develop and validate power prediction formulas for 1960s-era naval warships by testing multiple approaches against a homogenous historical dataset. Identify the most accurate formula and analyze efficiency patterns across ship classes.

## Dataset

**8 Distinct 1960s-Era Vessels** (Wikipedia-verified specifications):

- **Corvettes/Fast Attack**: Poti-class (508t, CODAG)
- **Frigates**: HMS Whitby (2,150t), HMS Leander (2,350t), USS Brooke (2,640t), Krivak-class (3,300t)
- **Destroyers**: County-class (6,200t), Kashin-class (3,400t), USS Charles F. Adams (3,277t)

**Displacement Range**: 508–6,200 tonnes  
**Speed Range**: 27–38 knots  
**Power Range**: 35,000–120,000 SHP

## Formulas Tested (7 Total)

| Formula                              | Type                            | Best Result           |
| ------------------------------------ | ------------------------------- | --------------------- |
| **Formula 2: Admiralty**             | `(D^2/3 × V^3) / 105`           | **27.3% avg error** ✓ |
| Formula 6: Hydrodynamic-Aware        | With hull form & efficiency     | 30.7% avg error       |
| Formula 2a: Admiralty + Propulsion   | Efficiency modifier             | 35.6% avg error       |
| Formula 2b: Admiralty + Displacement | Class-based scaling             | 38.2% avg error       |
| Formula 1: Empirical                 | Historical coefficient approach | 40.2% avg error       |
| Formula 4: Continuous Scaling        | Displacement exponent           | 59.0% avg error       |
| Formula 3: Discrete Categories       | Type-based buckets              | 88.4% avg error       |

**Winner**: Formula 2 (Admiralty) achieves 27.3% average error—best performance but still above ideal <15% threshold.

## Key Findings

### 1. Admiralty Coefficient Analysis (Normalized @ 27 knots baseline)

The Admiralty coefficient `C = (D^2/3 × V^3) / P` reveals hull efficiency patterns independent of speed design:

| Efficiency Class | Vessels                                   | Coefficient |
| ---------------- | ----------------------------------------- | ----------- |
| **Excellent**    | Poti (CODAG)                              | 22.1        |
| **Good**         | Kashin (COGAG)                            | 62.2        |
| **Average**      | Whitby, Leander, County, Charles F. Adams | 73–83       |
| **Poor**         | Brooke, Krivak                            | 106–144     |

**Fleet Average**: 73.5 (excluding Brooke outlier)  
**Interpretation**: Lower coefficients = more power-efficient (less power needed per unit displacement/speed)

### 2. Propulsion Type Efficiency (Normalized @ 27kt)

```
✓✓ CODAG              avg 22.1 (n=1)   — Most efficient for compact, high-speed designs
✓ COSAG              avg 74.2 (n=1)   — Steam/gas hybrid balance
⚠ COGAG              avg 84.3 (n=2)   — Gas turbine variability
⚠ STEAM-TURBINE      avg 94.6 (n=4)   — Traditional but less efficient
```

**CODAG Impact**: Poti-class is 3.32× more efficient than fleet average when adjusted for displacement class.

### 3. Speed Design Penalty

Designing for 38 knots (vs baseline 27 knots) incurs a significant power penalty:

| Vessel  | Design Speed | Penalty      | % Increase    |
| ------- | ------------ | ------------ | ------------- |
| Poti    | 38kt         | 39.5 HP/ton  | +178.8%       |
| Kashin  | 38kt         | 111.1 HP/ton | +178.8%       |
| Leander | 27kt         | 0.0 HP/ton   | 0% (baseline) |

**Insight**: 38-knot designs require ~1.8× more power than 27-knot equivalents (exponential relationship).

### 4. Displacement-Class Efficiency Normalization

Created adjustment factors accounting for how displacement naturally affects the Admiralty coefficient:

| Displacement Class     | Range      | Expected Coeff | Adjustment Factor |
| ---------------------- | ---------- | -------------- | ----------------- |
| Corvette/Fast Attack   | 0–600t     | 22.1           | 3.320             |
| Light Frigate          | 600–2000t  | 60.0           | 1.225             |
| Medium Frigate         | 2000–2500t | 75.5           | 0.973             |
| Large Frigate/Small DD | 2500–3500t | 83.2           | 0.884             |
| Destroyer              | 3500–4500t | 68.2           | 1.078             |
| Large DD/Cruiser       | 4500t+     | 74.2           | 0.991             |

**Result**: Brooke-class (2,640t, coefficient 144.1) identified as outlier—allocated insufficient power (13.3 kW/t vs expected 20+ kW/t).

### 5. Formula Performance by Vessel Type

- **Corvettes** (Poti): Formulas systematically underpredict power (speed penalty effect)
- **Frigates**: Highest variance; Brooke anomaly skews results
- **Destroyers**: Most consistent predictions; tighter error bands

## Recommendations for Ship Designer Integration

### Use Cases

1. **New Ship Design**: Apply Formula 2 (Admiralty) with 27.3% error margin for initial power estimates
2. **Efficiency Comparison**: Use displacement-adjusted coefficients to benchmark designs against historical classes
3. **Design Validation**: Flag vessels with coefficients >40 points from displacement-class baseline as potential inefficiencies

### Formula Application

```typescript
// Raw power prediction
const predictedPower = (disp^(2/3) × speed^3) / 105  // SHP

// Adjusted for displacement class
const factor = getDisplacementFactor(displacement)
const efficiencyAdjustment = factor.adjustmentFactor
const classNormalizedEfficiency = predictedPower / efficiencyAdjustment
```

### Caveats

- **27.3% error rate** suggests other factors (hull form, propulsion details, age) significantly affect power requirements
- **1960s warships** emphasize speed/maneuverability over fuel economy, making efficiency metrics different from commercial vessels
- **Small sample** (8 vessels) limits confidence in extrapolating to new displacement classes

## Code Artifacts

### Core Files

- `1960s-naval-vessels.ts` - Dataset with 8 vessels, hydrodynamic parameters
- `test-1960s-formulas.ts` - Main analysis runner (6 formulas, coefficient analysis, displacement factors)
- `src/engine/admiraltyDisplacementFactors.ts` - Displacement class configuration and adjustment functions

### Key Functions

- `calculateAdmiraltyCoefficient(D, V, P)` - Raw efficiency metric
- `calculateNormalizedAdmiraltyCoefficient(D, P, baselineSpeed=27)` - Speed-independent efficiency
- `getDisplacementFactor(displacement)` - Returns class configuration
- `analyzeAdmiraltyCoefficient(coefficient, displacement)` - Outlier detection & adjustment

## Conclusion

**Formula 2 (Admiralty)** is the best available option for predicting 1960s warship power (27.3% avg error), though still suboptimal for production use. The displacement-adjusted coefficient analysis effectively isolates efficiency anomalies (like Brooke-class underallocation) and reveals that CODAG propulsion offers exceptional performance in compact, high-speed designs.

The 27.3% error floor suggests future improvements should incorporate:

- Detailed hull form hydrodynamics (Froude number corrections)
- Propulsion system maturity/efficiency curves
- Historical power allocation patterns by design philosophy
- Multi-regression against larger historical datasets (50+ vessels)
