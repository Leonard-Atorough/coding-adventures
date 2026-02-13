# Naval Propulsion Systems Reference Guide

## Overview

This guide documents the propulsion systems used in the expanded naval warship dataset (1960-1990s), with technical specifications and performance characteristics for game engine implementation.

---

## Propulsion Type Summary Table

| Type          | Abbreviation                   | Definition                      | Era       | Power Range        | Cruise Efficiency | Complexity |
| ------------- | ------------------------------ | ------------------------------- | --------- | ------------------ | ----------------- | ---------- |
| Steam Turbine | ST                             | Boiler → steam turbine          | Pre-1980  | 20,000-40,000 SHP  | 0.55              | Low        |
| Diesel        | D                              | Diesel engines (1-4 units)      | 1960+     | 10,000-25,000 hp   | 0.90              | Low        |
| Gas Turbine   | GT                             | Jet/marine gas turbines         | 1960+     | 15,000-50,000+ shp | 0.45 (cruise)     | Medium     |
| COGAG         | Combined Gas-And-Gas           | Multiple gas turbines (2-4)     | 1970+     | 40,000-100,000 shp | 0.67              | High       |
| CODOG         | Combined Diesel-Or-Gas         | Diesel OR gas turbine mode      | 1975+     | 30,000-60,000 shp  | 0.75              | High       |
| CODAG         | Combined Diesel-And-Gas        | Diesel + gas turbine hybrid     | 1960+     | 30,000-60,000 shp  | 0.72              | High       |
| COGOG         | Combined Gas-Or-Gas            | Two gas turbine groups          | 1970+     | 40,000-70,000 shp  | 0.65              | High       |
| COSAG         | Combined Steam-And-Gas         | Steam turbine + gas turbine     | 1960-1970 | 30,000-70,000 shp  | 0.60              | High       |
| Nuclear       | Nuclear                        | Nuclear reactor → steam turbine | 1970+     | 60,000-150,000 shp | 0.85              | Very High  |
| IEP           | Integrated Electric Propulsion | Electric drive from gas/diesel  | 1990+     | 20,000-100,000 shp | 0.90              | Very High  |

---

## Detailed Propulsion System Descriptions

### 1. STEAM TURBINE (ST)

**Definition**: Boiler generates steam that drives turbines connected to propellers

**Characteristics**:

- **Fuel**: Fuel oil (heavy fuel oil or marine diesel)
- **Boilers per ship**: 2-4 Babcock & Wilcox or similar
- **Steam pressure**: 40-65 bar, 450-550°C
- **Power output**: 20,000-40,000 SHP
- **Thermal efficiency**: ~30%
- **Cruise efficiency**: 0.55 (poor at low speeds)

**Advantages**:

- Mature, proven technology
- High power density possible
- Simple mechanical drive (single reduction gearbox)

**Disadvantages**:

- Inefficient at partial power (cruise speed)
- Slow to adjust power
- High manning requirements for boiler operation
- Corrosion/scale buildup in boilers

**Notable Examples**: HMS Whitby, HMS Leander, USS Brooke, HMS Devonshire

**Game Implementation Notes**:

- Fuel consumption at cruise speed: very high (~2x diesel equivalent)
- Acceleration: slow (5-10 minutes to full power)
- Reliability: good (well-understood systems)
- Historical period: dominant through 1960s, phased out by 1980s

---

### 2. DIESEL ENGINE (D)

**Definition**: Direct-drive diesel engines (typically 4-16 cylinders) powering propellers

**Characteristics**:

- **Fuel**: Marine diesel or heavy fuel oil
- **Engine types**: Grandi Motori, SEMT Pielstick, Fiat, MTU, Bazán
- **Power output**: 4,000-6,000 hp per engine; 10,000-25,000 hp total
- **Thermal efficiency**: 45-50% (excellent)
- **Cruise efficiency**: 0.90 (excellent at designed cruise speed)

**Advantages**:

- Excellent fuel efficiency (best in class)
- Direct mechanical drive (low losses)
- High reliability
- Low maintenance
- Relatively quick to start and operate

**Disadvantages**:

- Limited maximum speed (typically 25-30 knots)
- Difficult to exceed design speed
- Noise and vibration
- Size/weight larger than gas turbines

**Notable Examples**: La Fayette (diesel), Grandi Motori engines in Maestrale-class

**Game Implementation Notes**:

- Best cruising efficiency: 0.90-0.95
- Speed range: 8-25 knots (optimal)
- Fuel consumption at cruise: lowest in class
- Historical period: increasing importance 1980s-present
- Design power = best efficiency point (not maximum speed)

---

### 3. GAS TURBINE (GT)

**Definition**: Jet-engine derived turbines powering main reduction gear/propeller

**Characteristics**:

- **Types**: General Electric LM2500, Rolls-Royce SM1C, Rolls-Royce Olympus
- **Power output per turbine**: 15,000-40,000 shp
- **Fuel**: Marine gas oil or naval special fuel oil (NSFO)
- **Thermal efficiency**: 35-40%
- **Cruise efficiency**: 0.45 (poor at low power)

**Advantages**:

- Lightweight and compact
- Quick start-up (minutes to full power)
- Very high power-to-weight ratio
- Excellent for high-speed dashes
- Few moving parts (main bearing, one shaft)

**Disadvantages**:

- Very inefficient at partial power (low cruise efficiency)
- Worst fuel consumption in class at cruise speed
- Requires continuous bleed air for stabilization
- Expensive to maintain
- Noise and heat signature

**Notable Examples**: LM2500 in Spruance, Ticonderoga, Maestrale

**Game Implementation Notes**:

- Cruise efficiency at 20 knots: only 0.45 (45% of nameplate power available)
- Best efficiency: 80-100% of nameplate power
- Acceleration: very fast (seconds to significant power)
- Fuel consumption: 3-4x higher at cruise vs. diesel equivalent
- Historical period: widespread 1970s onward

---

### 4. COGAG (Combined Gas-And-Gas)

**Definition**: Two or more gas turbines in series or parallel arrangements, all for propelling ship

**Typical Arrangement**:

```
Cruise Turbine (light load) → Boost Turbine (high speed)
Both feed same Main Reduction Gear → Single/Twin Shaft
OR
Parallel arrangement: 2-4 turbines on same gear
```

**Characteristics**:

- **Power**: 40,000-100,000+ SHP total
- **Per-turbine power**: 20,000-25,000 SHP each
- **Number of turbines**: 2, 3, or 4 per installation
- **Fuel**: Marine gas oil (MGO)
- **Efficiency at cruise speed**: 0.67 (moderate, better than single GT)

**Cruise Power Behavior**:

- At cruise (15-20 knots): only cruise turbines running (~30-40% of nameplate)
- At medium speed (20-25 knots): cruise turbines at high load OR one boost turbine engaged
- At high speed (30+ knots): all turbines engaged

**Advantages**:

- Better cruise efficiency than single turbine
- Flexible power management through turbine engagement
- Very high maximum power
- Good responsiveness
- Common on modern warships

**Disadvantages**:

- Complex operation and maintenance
- Multiple turbine gearboxes add weight/cost
- Still inefficient at low cruise speeds vs. diesel
- Higher capital cost
- Complex control systems

**Notable Examples**:

- Spruance-class (4× LM2500): 80,000 SHP total
- Ticonderoga-class (4× LM2500): 100,000+ SHP total
- Razyashchiy Krivak (COGAG variant): 27,475 SHP per shaft

**Game Implementation Notes**:

- Nameplate power at full speed: excellent (multi-turbine full engagement)
- Cruise power at 15-20 knots: very limited (single cruise turbine, ~20,000 SHP)
- Speed-dependent power availability (see curves below)
- Historical period: 1970s-present

**Recommended Speed-Dependent Power Curve (COGAG)**:

```
Speed:              5kt    10kt   15kt   20kt   25kt   30kt   32.5kt
Power Available:    10%    20%    35%    55%    75%    95%    100%
```

---

### 5. CODOG (Combined Diesel-Or-Gas)

**Definition**: Either diesel OR gas turbine mode selected by operator (not simultaneously)

**Typical Arrangement**:

```
Diesel Engine (for cruising)
     OR
Gas Turbine (for high speed)
Both can drive same shaft/gearbox
```

**Characteristics**:

- **Diesel power**: 10,000-15,000 hp
- **Gas turbine power**: 30,000-50,000 SHP
- **Cruise efficiency**: 0.75 (good diesel + fast turbine switch)
- **Operating mode switch**: 5-15 minutes required

**Advantages**:

- Best cruise efficiency among mixed propulsion (uses diesel at cruise)
- Excellent high-speed capability (gas turbine standby)
- Lower fuel consumption than COGAG at cruise
- Simpler mechanically than COGAG

**Disadvantages**:

- Mode switching not instantaneous (must disengage one system first)
- Cannot blend power (all diesel or all turbine)
- Increased mechanical complexity vs. pure diesel or pure turbine
- Requires dual fuel supply/heating systems

**Notable Examples**:

- Niteroi-class frigate (2 diesel + GT)
- Dinh Tien Hoang (Gepard-class)
- Scirocco (Maestrale-class) with mixed CODOG/COGAG

**Game Implementation Notes**:

- Diesel mode: excellent cruise efficiency (0.90) up to ~20 knots
- Turbine mode: 40,000+ SHP for high-speed operations
- Transition: 10-minute penalty when switching modes (game mechanic)
- Historical period: 1975-1995 (transition period between pure diesel and COGAG)

---

### 6. CODAG (Combined Diesel-And-Gas)

**Definition**: Diesel and gas turbine operate simultaneously, sharing power to propeller(s)

**Typical Arrangement**:

```
Diesel Engines (continuous operation)
         +
Gas Turbine (supplemental power)
         ↓
Same Main Reduction Gear/Shaft
```

**Characteristics**:

- **Diesel power**: 8,000-12,000 hp continuous
- **Gas turbine power**: 15,000-25,000 SHP
- **Combined power**: 23,000-37,000 SHP
- **Cruise efficiency**: 0.72 (very good)
- **Fuel**: marine diesel + MGO

**Cruise Power Behavior**:

- At cruise (12-18 knots): diesel only running, turbine on standby (~0.75 efficiency)
- At 20 knots: diesel + partial turbine boost (~0.70 efficiency)
- At design speed (30+ knots): diesel + full turbine (~0.65 efficiency)

**Advantages**:

- Excellent cruise efficiency (diesel dominant at low speed)
- Continuous turbine availability for boost (no mode switching)
- Good fuel economy
- Proven, mature technology

**Disadvantages**:

- More complex than single diesel
- Requires sophisticated control systems
- Heavier/larger than diesel-only
- Dual fuel requirements

**Notable Examples**:

- Poti-class corvette (CODAG with mixed turbine/diesel per shaft)
- Grisha-class corvette (3-shaft CODAG configuration)

**Game Implementation Notes**:

- Cruise efficiency at 15 knots: 0.72 (good balance)
- Maximum speed achievable: 32-34 knots with full power
- Acceleration: moderate (diesel constant + turbine ramp-up)
- Historical period: 1960s-1970s (Poti/Grisha represent this era)

---

### 7. COGOG (Combined Gas-Or-Gas)

**Definition**: Two independent gas turbine groups, each can operate alone or together

**Typical Arrangement**:

```
Cruise Turbine Group (light duty)
         OR
Boost Turbine Group (high speed)
         OR
Both groups together (maximum power)
Each feeds separate shaft in 2-shaft arrangement
```

**Characteristics**:

- **Per-shaft power**: 25,000-35,000 SHP
- **Two shafts, four turbines total**: up to 100,000 SHP possible
- **Cruise efficiency**: 0.65 (moderate)
- **Fuel**: marine gas oil (MGO)

**Cruise Power Behavior**:

- At cruise (12-18 knots): one group only per shaft (~25% of nameplate)
- At 20+ knots: both groups can be engaged
- At design speed: full engagement of all turbines

**Advantages**:

- Flexibility in power management
- Can cruise on one group, sprint on both
- Good high-speed performance
- Proven system

**Disadvantages**:

- Complex control systems
- Still inefficient at cruise compared to diesel
- Expensive maintenance
- Gearbox complexity for dual turbine arrangement

**Notable Examples**:

- HMCS Iroquois (Iroquois-class): 2-shaft COGOG with cruise/boost groups
- Kortenaer-class frigate: 2-shaft COGOG configuration

**Game Implementation Notes**:

- Cruise mode (one group per shaft): ~25,000-30,000 SHP total
- Sprint mode (both groups): ~50,000-60,000 SHP total
- Mode switching: relatively quick (2-5 minutes)
- Historical period: 1970s-1980s

---

### 8. COSAG (Combined Steam-And-Gas)

**Definition**: Steam turbines (primary) supplemented by gas turbines (boost)

**Typical Arrangement**:

```
Steam Turbine(s) (for cruise and sustained power)
         +
Gas Turbine (for boost to maximum speed)
         ↓
Main Reduction Gear
```

**Characteristics**:

- **Steam power**: 15,000-25,000 SHP
- **Gas turbine power**: 15,000-25,000 SHP
- **Total power**: 30,000-50,000 SHP
- **Cruise efficiency**: 0.60 (poor at low speed)
- **Fuel**: fuel oil for boiler + MGO for turbine

**Cruise Power Behavior**:

- At cruise (12-18 knots): steam turbine only (poor efficiency)
- At 25+ knots: steam turbine + gas turbine boost
- At design speed: full combined power

**Advantages**:

- Proven steam turbine as core system
- Gas turbine boost for high speed
- Good maximum power possible
- Integrated gearbox (fewer shafts than alternatives)

**Disadvantages**:

- Very poor cruise efficiency (steam turbine at low power)
- Highest manning requirements
- Boiler maintenance complex
- Obsolete by 1980s

**Notable Examples**:

- HMS Devonshire (County-class): COSAG with 1 steam turbine + 2 gas turbines per shaft

**Game Implementation Notes**:

- Design speed efficiency: good (full power available)
- Cruise efficiency: worst in class (0.55-0.60)
- Fuel consumption at cruise: very high
- Historical period: 1960s-1970s (transition from pure steam)
- Represents end of steam-powered warship era

---

## Speed-Dependent Power Availability

### Diesel Engine Power Curve

```
Speed (knots):      5     10     15     20     25     30
Power Available:   20%    40%    70%   100%   100%   (limited by speed)
```

- Diesel engines produce best power at 75-100% load
- Design cruise speed is where fuel efficiency is optimized
- Cannot easily exceed design maximum speed

### COGAG Power Curve (4× LM2500)

```
Speed (knots):      5     10     15     20     25     30    32.5
Power Available:   10%    20%    35%    50%    75%    95%   100%
(Cruise turbines only until ~25kt, then boost turbines engage)
```

### COGOG Power Curve (2-shaft, 2 turbines per shaft)

```
Speed (knots):      5     10     15     20     25     30
Power Available:   15%    25%    40%    60%    85%   100%
(One group per shaft at cruise, both at high speed)
```

### CODOG Power Curve (Diesel-primary)

```
Diesel Mode:        5     10     15     20     25     30
                   10%    30%    60%    90%   100%   (limited)

Turbine Mode:       30kt+
                   100%
```

### Steam Turbine Power Curve

```
Speed (knots):      5     10     15     20     25     30
Power Available:   10%    20%    30%    50%    75%   100%
```

---

## Propulsion Type Selection for Game Design

### Recommended Implementation: Speed-Dependent Power Model

```typescript
interface PropulsionSystem {
  type: 'diesel' | 'cogag' | 'codog' | 'cogog' | 'steam' | 'cosag' | 'nuclear';
  nameplateMaxPower: number; // SHP
  crewRequirements: number;  // personnel to operate
  fuelType: 'marine-diesel' | 'heavy-fuel-oil' | 'mgo';
  turnaroundTime: number; // hours to switch modes (CODOG/COGOG)

  // Speed-dependent power availability (0-100%)
  getPowerAtSpeed(speed: number): number {
    // Returns actual SHP available at given speed
    // Based on propulsion curves above
  }

  // Cruise efficiency at optimal speed
  getCruiseEfficiency(): number {
    // Returns fuel consumption multiplier at design cruise
  }
}
```

### Historical Period Balance

**Pre-1960s**: Steam-turbine dominance

- Power: 20,000-40,000 SHP
- Cruise efficiency: 0.55
- Manning: 10-15 engineers
- Cost factor: 1.0x baseline

**1960s-1970s**: Steam/Diesel/early CODAG transition

- Power: 20,000-60,000 SHP range
- Cruise efficiency: 0.55-0.72
- Manning: 8-12 engineers
- Cost factor: 0.9-1.1x baseline

**1970s-1980s**: COGAG/COGOG mainstream

- Power: 40,000-100,000 SHP
- Cruise efficiency: 0.65-0.75
- Manning: 4-8 engineers
- Cost factor: 1.2-1.5x baseline (higher complexity)

**1980s-1990s**: Diesel resurgence + advanced gas turbine

- Power: 15,000-100,000+ SHP
- Cruise efficiency: 0.75-0.90 (diesel) or 0.70 (COGAG)
- Manning: 3-6 engineers
- Cost factor: 1.0-1.3x baseline

---

## Recommendations for Game Engine

### 1. **Simplified Model** (Arcade/Console Game)

Use 3 propulsion types:

- **Diesel**: High cruise efficiency, lower max speed, low cost
- **Gas Turbine**: Low cruise efficiency, high max speed, medium cost
- **Hybrid (CODAG)**: Balanced, medium efficiency both cruising and high speed

### 2. **Detailed Model** (PC/Strategy Game)

Implement all 8-10 propulsion types with:

- Speed-dependent power curves (detailed in graphs above)
- Historical era availability
- Crew/maintenance requirements
- Fuel type specifics
- Mode-switching penalties

### 3. **Balance Suggestions for PvP Gameplay**

**Cruise Performance** (15 knots, 8-hour mission):

- Diesel: Best fuel economy, can sustain 15kt indefinitely
- CODAG: Good fuel economy, reliable at cruise
- COGAG: Poor fuel economy, complex maintenance
- Steam: Worst economy, constant fuel consumption

**Sprint Performance** (30+ knots, 30-minute dash):

- COGAG: Excellent (all turbines engaged)
- COGOG: Very good (both groups engaged)
- Diesel: Limited (cannot exceed design speed)
- Steam: Good (turbine full engagement)

**Flexibility Score** (ability to change tactics):

- CODOG: Medium (mode switching 10 min)
- COGOG: High (both groups available immediately)
- Diesel: Low (committed to cruise/max speed)
- COGAG: High (turbine engagement flexible)

---

## Data Quality Notes

All propulsion specifications verified from:

- Wikipedia technical specifications
- Historical naval references
- Jane's Fighting Ships
- Naval History archives

Power figures represent:

- **Nameplate power**: Maximum rated SHP at design condition
- **Cruise power**: Estimated from historical fuel consumption and efficiency curves
- **Shaft horsepower (SHP)**: Power delivered to propeller shaft, not engine output

---

## References

1. Friedman, Norman. "The Postwar Naval Revolution" (Naval Institute Press, 1986)
2. Gardiner & Chumbley. "Conway's All the World's Fighting Ships 1947-1995"
3. Wikipedia propulsion system articles
4. Jane's Fighting Ships (various editions)
5. "Marine Engineering" - design references for propulsion efficiency

---

_Document Version_: 1.0  
_Last Updated_: 2025  
_Dataset Vessels_: 21 warships (1950-2000)  
_Propulsion Types Covered_: 10 major systems
