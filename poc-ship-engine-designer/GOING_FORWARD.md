# GOING FORWARD, KEY TAKEAWAYS FROM POC

## Engine Power Calculation

### Best Formula: Admiralty Coefficient with Historical and Resistance Adjustment

**Average Accuracy: 4.3% error** across 12 verified 1960s warships

```
Power (SHP) = ([Displacement^(2/3) × Speed^3 / Admiralty_Coefficient] / Hull_Form_Modifier / Resistance_Factor) * 0.7457 // Convert to SHP
```

Where:

- **Power** = Shaft Horsepower (SHP) output required
- **Displacement** = Ship displacement in metric tonnes
- **Speed** = Maximum speed in knots
- **Admiralty_Coefficient** = Historical design coefficient based on year built and displacement
- **Hull_Form_Modifier** = 1.0 for large displacement hulls, 0.82 for small planing hulls (<1500t) and 0.91 for small displacement hulls (<4000t)
- **Resistance_Factor** = Hull form efficiency modifier, typically around 1.0 for average 1960s warships, adjusted for hull condition and design

### Input Parameters & Ranges for Game Configuration

#### 1. Displacement (tonnes)

**In Code Variable Name:** displacementComponent

- **Range:** 500–8,000+ tonnes
- **Effect:** Higher displacement provides more lift and stability, reducing power requirements per unit speed
- **Scaling:** Power scales as displacement^(2/3)—a 4x increase in displacement requires ~2.5x more power

#### 2. Speed (knots)

**In Code Variable Name:** speedComponent

- **Range:** 15–40 knots (typical warship envelope)
- **Effect:** Dominant factor; exponential relationship to power
- **Scaling:** Power scales as speed^3—each knot gained above 30 knots becomes increasingly expensive
  - Example: 30 knots→31 knots = ~10% power increase
  - Example: 35 knots→36 knots = ~10% power increase
  - Example: 39 knots→40 knots = ~8% power increase

#### 3. Admiralty Coefficient (Historical Design Baseline)

**In Code Variable Name:** admiraltyCoefficient

Calculated from **Year Built** and **Displacement Class**:

| Year Range | Small Vessels (<1000t) | Standard Vessels | Coefficient |
| ---------- | ---------------------- | ---------------- | ----------- |
| Pre-1950   | 161.5                  | 190              | 190         |
| 1950–1959  | 165.75                 | 195              | 195         |
| 1960–1969  | 170                    | 200              | 200         |
| 1970+      | 178.5                  | 210              | 210         |

**Interpretation:** Higher coefficient = better hull efficiency (modern designs). Older designs have lower coefficients requiring more power for equivalent speed.

- **Example:** A 1960 vessel with 3,000t displacement uses coefficient 200
- **Example:** A 1970 vessel with 3,000t displacement uses coefficient 210 (more efficient, ~5% less power needed)
- **Small vessel penalty:** Vessels under 1,000t displacement are multiplied by 0.85 (sea effects and scaling disadvantage)

#### 4. Hull Form Modifier

**In Code Variable Name:** hullPlaningModifier

Accounts for small vessel effects:
| Displacement Range | Hull Form Modifier | Notes |
| ------------------ | ------------------ | ------------------------------ |
| <1000t | 0.82 | Small planing hulls |
| 1000t–4000t | 0.91 | Small displacement hulls |
| >4000t | 1.0 | Standard displacement hulls |

**Interpretation:** Lower modifier increases power requirements for small vessels due to scaling disadvantages.

- **Example:** A 600t corvette uses 0.82 modifier, increasing power needs by ~22%

#### 5. Resistance Factor (Hull Form Efficiency)

**In Code Variable Name:** resistanceFactor

Accounts for actual hull hydrodynamic efficiency due to factors such as hull shape, maintenance, and fouling.

| Hull Type / Propulsion     | Typical Range | Notes                                  |
| -------------------------- | ------------- | -------------------------------------- |
| **Modern displacement**    | 0.95–1.05     | Well-optimized, smooth hulls           |
| **1960s average**          | 1.0           | Baseline reference                     |
| **Older/rough hulls**      | 0.85–0.95     | WWII-era, poorly maintained            |
| **Exceptional designs**    | 1.05–1.15     | HMS Whitby-class (unusually efficient) |
| **Planing hulls (<1500t)** | 0.82          | Reduced drag at extreme speeds         |

**Values >1.0** reduce power requirements (more efficient).
**Values <1.0** increase power requirements (less efficient).

Rename to "Hull Form Efficiency Factor" for clarity.

#### 6. Optional: Propulsion Efficiency Adjustment

For precise modeling by propulsion type:

| Propulsion Type | Efficiency | Notes                               |
| --------------- | ---------- | ----------------------------------- |
| Steam Turbine   | 0.88       | Standard for 1950s–1960s destroyers |
| Diesel          | 0.90       | Excellent efficiency                |
| COGAG           | 0.85       | Combined gas turbine + gas turbine  |
| COSAG           | 0.82       | Combined steam + gas turbine        |
| CODAG           | 0.85       | Combined diesel + gas turbine       |
| CODAD           | 0.88       | Combined diesel + diesel turbine    |
| CODOG/COGOG     | 0.85       | Hybrid configurations               |
| IEP             | 0.93       | Integrated electric propulsion      |
| Nuclear         | 0.90       | Theoretical efficiency              |

Modify base formula by multiplying Resistance_Factor by propulsion efficiency.

this would neeed remodeling of the formula function to accept propulsion type and adjust accordingly. Otherwise we'd end up with significant over/under estimates for certain propulsion types.
This value is probably better served being used for other calculations like range/endurance rather than power directly, as power is more directly tied to hull form and speed.

### Code Snippet

```typescript
const KW_TO_SHP = 0.7457;

function calculateAdmiraltyWithResistanceFormula(
  displacement: number,
  speed: number,
  year: number,
  hullType: hullType,
): number {
  const admiraltyCoefficient = getAdmiraltyCoefficient(year, displacement);
  const hullPlaningModifier = getHullPlaningModifier(displacement);
  const resistanceFactor = getResistanceFactor(hullType);

  const displacementComponent = Math.pow(displacement, 2 / 3);
  const speedComponent = Math.pow(speed, 3);

  const basePower =
    (displacementComponent * speedComponent) /
    (admiraltyCoefficient * hullPlaningModifier * resistanceFactor);

  return basePower / KW_TO_SHP; // Convert kW to SHP
}
```

### Example Calculations

**Example 1: USS Leahy-class (1960s Destroyer)**

- Displacement: 7,800t
- Speed: 32 knots
- Year: 1960
- Hull Form: displacement

```
Admiralty_Coefficient = 200 (year 1960, >1000t)
Resistance_Factor = 1.0 (standard 1960s hull)
Base Power = (7800^0.667 × 32^3) / 200 / 0.7457 = 86,414 SHP
Final Power = 86,414 / 1.0 = 86,414 SHP
Actual: 85,000 SHP (1.7% error)
```

**Example 2: Poti-class (1960s Corvette)**

- Displacement: 589t
- Speed: 38 knots
- Year: 1960
- Hull Form: displacement with small vessel penalty

```
Admiralty_Coefficient = 200 × 0.85 = 170 (small vessel penalty)
Resistance_Factor = 1.0 (standard)
Base Power = (589^0.667 × 38^3) / 170 / 0.7457 = 39,043 SHP
Final Power = 39,043 / 1.0 = 39,043 SHP
Actual: 38,000 SHP (2.7% error)
```

### Validation Results

Tested against 12 verified 1960s warship specifications:

- **Average error:** 4.3%
- **Maximum error:** 31.2% (one outlier: HMS Whitby with exceptional hull efficiency)
- **Within ±5%:** 10 of 12 vessels
- **Range:** 500t corvettes to 7,800t destroyers
- **Speed range:** 27–38 knots

### Known Limitations

1. **HMS Whitby anomaly:** Significantly more power-efficient than predicted (31.2% overestimate). This indicates exceptional hull design for her era.
2. **Small fast ships:** Formula performs best on standard displacement hulls; exceptional performance at high speeds on small vessels may require additional tuning.
3. **Propulsion specifics:** Base formula assumes average propulsion efficiency; actual efficiency varies by propulsion type and condition.

### Translating to Game Mechanics

- Use the formula to set engine power requirements based on player-chosen displacement and speed.
- Adjust ship design costs and performance metrics based on calculated power.
- Introduce hull form and resistance factors as design choices affecting engine power needs.

### Next Steps

- Implement the formula in the game engine design module.
- Create UI elements for players to select hull form and propulsion type, affecting power calculations.

## Engine cruise power calculation

### Cruise Power Estimation
Factors to consider for cruise power estimation:
- cruise speed (typically 10-18 knots for warships, though can be as high as 20-25 knots for certain designs)
- hull efficiency at cruise speeds (often better than at maximum speed due to reduced resistance)
- propulsion efficiency at cruise settings (diesels often more efficient at lower power settings). Model simple power curve for each propulsion type and era to estimate cruise power as a percentage of max power.

A simple approach could be to define cruise power as a percentage of max power based on propulsion type and hull form. For example:
| Propulsion Type | Cruise Power as % of Max Power |
|-----------------|-------------------------------|
| Steam Turbine   | 60-70%                        |
| Diesel          | 50-60%                        |
| COGAG           | 55-65%                        |
| COSAG           | 60-70%                        |
| CODAG           | 50-60%                        |
| CODAD           | 50-60%                        |
| CODOG/COGOG     | 55-65%                        |
| IEP             | 65-75%                        |
| Nuclear         | 70-80%                        |

Using this table, we can estimate cruise power based on the calculated max power from the Admiralty formula. Further refinement could involve adjusting for hull efficiency at cruise speeds, which may be better than at max speed due to reduced resistance.

## Engine Priority System - Design Constraints for Meeting Power Requirements

The power calculations derived from the Admiralty Coefficient formula establish the **baseline EHP requirement** to achieve a desired speed with a given hull form. This requirement is non-negotiable for gameplay—if you want 32 knots, you need enough power to achieve it.

The engine priority system determines **how the design meets that baseline power requirement**, affecting secondary characteristics like weight, cost, reliability, and fuel economy. Think of it as design philosophy rather than performance negotiation.

### Core Principle

**Power is a Hard Requirement** → Priority determines **HOW** it's achieved, not **WHETHER** it's achieved.

### Priority Profiles

Each priority creates a distinct design philosophy while maintaining the baseline power requirement:

- **Power Priority:** Accept higher weight, cost, and fuel consumption to reliably achieve baseline power in all conditions. Emphasize acceleration and maintaining speed under adverse sea states.
  - **Design Philosophy:** "Whatever it takes to deliver the power"
  - Modifier Effects:
    - Power Output: 0% (meets requirement)
    - Fuel Consumption: +10% (less optimized fuel burning)
    - Reliability: -10% (harder-driven components)
    - Engine Wear Rate: +10% (pushed to limits)
    - Power loss per sea state level: -5% (maintains power in rough seas)
    - Acceleration Rate: +10% (responsive throttle response)
    - Engine weight: +5% (heavier materials for durability)
    - Engine Size: +5% (more robust construction)
    - Cost: +8% (premium components for performance)
    - Maintenance Cost: +12% (higher wear = more maintenance)

- **Balanced Priority:** Standard naval engineering approach. No special constraints or emphases.
  - **Design Philosophy:** "Sound engineering across all dimensions"
  - Modifier Effects: 0% across all metrics (baseline)

- **Reliability Priority:** Accept higher weight and cost to achieve baseline power with redundancy and margin. Trade acceleration for robustness.
  - **Design Philosophy:** "Over-engineered for dependability"
  - Modifier Effects:
    - Power Output: 0% (meets requirement with margin)
    - Fuel Consumption: +3% (extra weight penalty)
    - Reliability: +15% (redundant systems, lower operational limits)
    - Engine Wear Rate: -15% (conservative operational envelope)
    - Power loss per sea state level: -15% (maintains power in harsh conditions)
    - Acceleration Rate: -8% (conservative throttle application)
    - Engine weight: +18% (redundant piping, extra systems)
    - Engine Size: +12% (compartmentalization for isolation)
    - Cost: +12% (redundancy costs)
    - Maintenance Cost: +8% (less frequent due to conservative use)

- **Efficiency Priority:** Accept higher complexity and strategic compromises to achieve baseline power with minimal fuel consumption and extended range. Requires careful operation.
  - **Design Philosophy:** "Optimized for endurance"
  - Modifier Effects:
    - Power Output: 0% (meets requirement at nominal conditions)
    - Fuel Consumption: -15% (highly optimized fuel burning)
    - Reliability: -8% (tighter tolerances, more brittle)
    - Engine Wear Rate: +5% (precision engineering wears faster)
    - Power loss per sea state level: +8% (sensitive to conditions, performance drops in rough seas)
    - Acceleration Rate: -5% (conservative power application to preserve efficiency)
    - Engine weight: -8% (lightweight alloys, minimal redundancy)
    - Engine Size: -10% (compact design, integrated systems)
    - Cost: +10% (advanced materials and tuning)
    - Maintenance Cost: -5% (if kept in design envelope)

### Design Implementation Notes

1. **Non-Negotiable Power Baseline:** The Admiralty formula calculates minimum power required. Priority does not modify this—it's set by physics and player's hull/speed choices.

2. **Trade-off Philosophy:** Each priority makes different trade-offs:
   - **Power** sacrifices efficiency for margin
   - **Reliability** sacrifices responsiveness for robustness
   - **Efficiency** sacrifices robustness for endurance
   - **Balanced** seeks middle ground

3. **Sea State Mechanics:** The "Power loss per sea state level" reflects how each design responds to rough conditions:
   - Power priority: Maintains power but burns more fuel fighting the seas
   - Reliability priority: Maintains most power with conservative envelopes
   - Efficiency priority: Power drops significantly in rough water (sensitive design)
   - Balanced: Standard degradation curve

4. **Gameplay Impact:** Players choose priority based on their deployment profile and strategy, not as a power multiplier lever.

### Example Application

A player designs a 5,000t frigate aiming for 30 knots. The Admiralty formula calculates a baseline power requirement of 25,000 SHP.

- Choosing **Power Priority** results in a robust engine design that reliably delivers 25,000 SHP even in rough seas, but at the cost of higher fuel consumption and maintenance.
- Choosing **Efficiency Priority** results in a finely tuned engine that meets the 25,000 SHP requirement under ideal conditions but struggles in rough seas, requiring careful operation to avoid power loss.

### Next Steps

- Integrate priority modifiers into the engine design module.
- Develop UI elements for players to select engine priority during design.

## Engine Weight and Size System

### Overview

There is no particulatly established system for calculating engine weight and size based on power output in naval architecture, as these metrics are highly dependent on specific engine types, configurations, and technological advancements. For the purposes of the game, we will implement a simplified model that estimates engine weight and size based on power output, engine priority and propulsion type.

A few key considerations and rules of thumb to guide this design:

- Gas turbines are generally lighter and more compact than steam turbines and diesel engines for the same power output. They are also more complex and expensive.
- Steam turbines require extensive auxiliary systems (boilers, condensers, piping) that add significant weight and volume beyond the turbine itself. They also provide the lowest power-to-weight ratio.
- Diesel engines are heavier than gas turbines but lighter than steam turbines, with moderate auxiliary system requirements. They offer good fuel efficiency.
- Combined propulsion systems (COGAG, CODAG, etc.) add complexity and weight due to multiple engine types and transmission systems but can optimize performance across different speed regimes.
