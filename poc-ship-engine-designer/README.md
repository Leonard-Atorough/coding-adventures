# POC: 1960s Naval Warship Power Formula Analysis

**Status**: Proof of Concept (Completed)

A comprehensive TypeScript analysis framework for evaluating naval warship power prediction formulas against a historical 1960s dataset.

## Executive Summary

Tested 7 power prediction approaches against 8 verified Wikipedia 1960s warships to identify the most accurate formula. **Formula 2 (Admiralty)** achieved the best result at **27.3% average error**. Additionally developed displacement-class efficiency normalization to identify design anomalies and propulsion type comparisons.

See [ANALYSIS_SUMMARY.md](ANALYSIS_SUMMARY.md) for complete findings.

## Core Deliverables

### 1. Historical Dataset (`1960s-naval-vessels.ts`)
8 distinct vessels spanning 3 propulsion types and 3 vessel classes:
- Displacement: 5086,200 tonnes
- Speed: 2738 knots
- Power: 35,000120,000 SHP
- All data from Wikipedia specifications

### 2. Formula Testing Framework (`test-1960s-formulas.ts`)
Implements and compares:
- 7 power prediction formulas (Formula 1, 2, 2a, 2b, 3, 4, 6)
- Admiralty coefficient analysis (raw + normalized @ 27kt baseline)
- Displacement-adjusted efficiency metrics
- Speed design penalty quantification
- Propulsion type and vessel type breakdowns

### 3. Displacement Adjustment System (`src/engine/admiraltyDisplacementFactors.ts`)
Class-based efficiency normalization with:
- 6 displacement classes (corvette to large cruiser)
- Expected coefficients and adjustment factors
- Outlier detection (Brooke-class flagged at 144.1 coefficient)
- Fleet baseline averaging (73.5, excluding outliers)

## Running the Analysis

```bash
npm install
npx tsx test-1960s-formulas.ts
```

Outputs complete formula comparison table, coefficient statistics, efficiency tiers, speed penalties, and displacement-adjusted analysis.

## Key Findings

### Best Formula
**Formula 2: Admiralty**  `(D^2/3  V^3) / 105`
- 27.3% average error (lowest)
- Reliable across displacement ranges
- No propulsion-specific tuning needed

### Efficiency Rankings
1. **Poti-class** (CODAG)  22.1 coefficient  3.32 more efficient than fleet average
2. **Kashin-class** (COGAG)  62.2 coefficient  Good
3. **Whitby/Leander/County** (Mixed)  7377 coefficient  Average
4. **Brooke-class** (Steam-turbine)  144.1 coefficient  **Outlier** (insufficient power allocation)

### Propulsion Performance
- CODAG: 22.1 (exceptional for compact/high-speed)
- COSAG: 74.2 (balanced)
- COGAG: 84.3 (variable)
- Steam-turbine: 94.6 (traditional, less efficient)

### Speed Penalty
Designing for 38 knots vs 27-knot baseline incurs **~179% power increase** (exponential curve).

## Architecture

```
src/engine/
 admiraltyDisplacementFactors.ts  # Displacement class config
1960s-naval-vessels.ts               # Historical dataset
test-1960s-formulas.ts               # Analysis runner
```

## Technical Details

- **Language**: TypeScript 5.0+
- **Runtime**: Node.js (tsx)
- **Key Functions**:
  - `calculateAdmiraltyCoefficient()`  Raw efficiency metric
  - `getDisplacementFactor()`  Class-based adjustment lookup
  - `analyzeAdmiraltyCoefficient()`  Outlier detection

## Limitations & Future Work

**Current Limitations**:
- 27.3% error rate insufficient for production use (<15% target)
- Small sample (8 vessels) limits extrapolation confidence
- 1960s warships prioritize speed/maneuverability over economy

**Recommended Improvements**:
- Incorporate hull form hydrodynamics (Froude number corrections)
- Develop propulsion system efficiency curves
- Expand dataset to 50+ historical vessels
- Multi-regression analysis for secondary factors

## Files

| File | Purpose |
|------|---------|
| `ANALYSIS_SUMMARY.md` | Complete findings, tables, recommendations |
| `test-1960s-formulas.ts` | Main analysis runner (7 formulas, coefficient analysis) |
| `1960s-naval-vessels.ts` | Dataset with hydrodynamic parameters |
| `src/engine/admiraltyDisplacementFactors.ts` | Displacement class configuration |
| `README.md` | This file |