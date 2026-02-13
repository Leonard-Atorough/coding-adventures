/**
 * Core calculation engine for engine system design.
 * Takes ship constraints + configuration + desired performance targets
 * and calculates all engine system properties.
 */

import { getConfiguration, ConfigurationId } from "./configurations";

export type EnginePriority = "efficiency" | "power" | "reliability" | "balanced";

export type hullType = "corvette" | "frigate" | "destroyer" | "cruiser" | "carrier";

const hullTypeProperties: Record<
  hullType,
  { displacementRange: [number, number]; admiraltyCoefficient: number }
> = {
  corvette: { displacementRange: [500, 2000], admiraltyCoefficient: 180 },
  frigate: { displacementRange: [2000, 6000], admiraltyCoefficient: 210 },
  destroyer: { displacementRange: [6000, 10000], admiraltyCoefficient: 210 },
  cruiser: { displacementRange: [10000, 20000], admiraltyCoefficient: 210 },
  carrier: { displacementRange: [20000, 100000], admiraltyCoefficient: 210 },
};

/**
 * Input parameters provided by the ship designer
 */
export interface EngineDesignInput {
  configType: ConfigurationId;
  desiredTopSpeed: number; // knots
  enginePriority: EnginePriority;
  shipDisplacement: number; // tons
  hullDragCoefficient: number; // 0.0 - 1.0, higher = more drag
  desiredCruisingSpeed?: number; // knots, optional
  year?: number; // constraints available configs
  hullType: hullType;
}

/**
 * Calculated output for an engine system design
 */
export interface EngineSystemOutput {
  // Identification
  configuration: ConfigurationId;

  // Physical properties
  totalEngineWeight: number; // tons
  totalEngineCost: number; // credits
  engineVolume: number; // m³

  // Performance metrics
  maxPower: number; // HP
  maxSpeed: number; // knots
  cruisingSpeed: number; // knots (optimal fuel economy point)
  maxRange: number; // nautical miles

  // Operational characteristics
  mtbf: number; // mean time between failures, hours
  reliabilityScore: number; // 0-100
  fuelConsumptionAtFullPower: number; // tonnes/hour
  fuelConsumptionAtCruise: number; // tonnes/hour
  operatingCostPerHour: number; // USD, at full power

  // Strategic properties
  accelerationRating: number; // arbitrary 0-100 scale
  heatSignature: number; // 0-100 detection difficulty
  complexityRating: number; // 0-100 crew requirements
}

/**
 * Base parameters for calculation (grounded in naval engineering data)
 * All units: metric (tonnes, meters, knots, hours)
 * Currency: USD
 */
const CALCULATION_CONSTANTS = {
  // Cost basis (USD per horsepower for complete propulsion system)
  // Real data: Arleigh Burke DDG-51 costs ~$2B total
  // Propulsion system (engines + shafts + gearbox) ~$150-200M for ~100,000 HP = ~$1,500-2,000/HP
  // FFG-7 class: $500M for ~40,000 HP = ~$12,500/HP (older, less efficient design)
  // Estimate for modern systems: 1,500 USD/HP (includes all propulsion integration)
  costPerHP: 1_500, // USD per horsepower for complete propulsion system package
  fuelCostPerTonne: 600, // USD per tonne of marine fuel

  // Fuel consumption basis
  // Real-world measurement from DDG-51 at full power: ~48 tonnes/hour at 100,000 HP
  // 100,000 HP = 74,570 kW, so consumption = 48 / 74,570 = 0.000644 tonnes/kWh
  // (0.19 kg/kWh is engine efficiency; actual propulsion plant includes gearbox/cooling losses)
  baseFullPowerConsumption: 0.00064, // tonnes/kWh (full propulsion plant at full power)

  // Power and thrust (from resistance and hydrodynamic principles)
  // Based on Froude number and typical naval hull forms
  hullResistanceFactor: 0.05, // N·s²/m⁴ - pure water drag coefficient
  propellerEfficiency: 0.68, // typical naval propeller efficiency (50-propeller systems)
  shaftLossEfficiency: 0.98, // gearbox/shaft losses

  // Reliability
  baseMTBF: 8000, // hours between failures baseline (real naval diesel baseline)

  // Ship model (typical destroyer fuel load and power requirements)
  fuelLoadPercentage: 0.35, // 35% of ship displacement for fuel (realistic for warships)
};

/**
 * Main calculation function
 * Takes desired parameters and configuration, returns all engine system properties
 */
export function calculateEngineSystem(input: EngineDesignInput): EngineSystemOutput {
  const config = getConfiguration(input.configType);

  // Priority adjustments (small tweaks, not dramatic changes)
  const priorityAdjustment = getPriorityAdjustment(input.enginePriority);

  // Step 1: Calculate required thrust and power
  // let { powerRequired } = calculatePowerRequirement(
  //   input.shipDisplacement,
  //   input.hullDragCoefficient,
  //   input.desiredTopSpeed,
  // );

  let { powerRequired } = alternateCalculatePowerRequirement(
    input.shipDisplacement,
    input.desiredTopSpeed,
    input.hullType,
  );

  // Apply power priority adjustment - power priority means willing to use more fuel for more available power
  if (input.enginePriority === "power") powerRequired *= 1.05; // 5% more power available
  if (input.enginePriority === "efficiency") powerRequired *= 0.98; // Accept slightly less power for efficiency

  // Step 2: Calculate engine weight using linear combination formula
  // Weight = (Displacement × 0.14 + SHP × 0.003) × config.weightMultiplier
  const baseEngineWeight = input.shipDisplacement * 0.14 + powerRequired * 0.003;
  const totalEngineWeight =
    baseEngineWeight * config.weightMultiplier * (1 + priorityAdjustment.weight);

  // Step 3: Calculate cost
  const totalEngineCost = calculateCost(powerRequired, config.costMultiplier, input.enginePriority);

  // Step 4: Calculate reliability
  const mtbf = calculateMTBF(config.reliabilityFactor, input.enginePriority);

  // Step 5: Calculate cruising speed (needed to determine cruise power)
  const cruisingSpeed = calculateCruisingSpeed(
    input.shipDisplacement,
    input.hullDragCoefficient,
    input.desiredCruisingSpeed,
  );

  // Step 6: Calculate power required for cruising speed (if custom cruise speed specified)
  let cruisePowerRequired = powerRequired;
  let cruisePowerRatio = 0.65; // Default: 65% power for cruise

  if (input.desiredCruisingSpeed && input.desiredCruisingSpeed > 0) {
    // Custom cruising speed specified: calculate required power
    // Power scales with speed cubed, so: P_cruise / P_max = (speed_cruise / speed_max)^3
    cruisePowerRatio = Math.pow(cruisingSpeed / input.desiredTopSpeed, 3);
    cruisePowerRequired = powerRequired * cruisePowerRatio;
  }

  // Step 7: Calculate fuel consumption (adjusted for priority)
  let fuelEfficiencyMultiplier = 1.0;
  if (input.enginePriority === "efficiency") fuelEfficiencyMultiplier = 0.85; // 15% better fuel economy
  if (input.enginePriority === "power") fuelEfficiencyMultiplier = 1.1; // 10% worse fuel economy (accept it for more power)

  const fuelConsumptionFull = calculateFuelConsumption(
    powerRequired,
    config.fuelEfficiencyFactor,
    1.0, // Full power
    fuelEfficiencyMultiplier,
  );

  // For custom cruise speeds: consume fuel proportional to actual cruise power (no additional efficiency curve)
  // The power^3 law already accounts for the real-world efficiency, don't double-apply part-power curve
  const fuelConsumptionCruise =
    input.desiredCruisingSpeed && input.desiredCruisingSpeed > 0
      ? calculateFuelConsumption(
          cruisePowerRequired,
          config.fuelEfficiencyFactor,
          1.0, // Cruise power is the full operating point (no part-power multiplier)
          fuelEfficiencyMultiplier,
        )
      : calculateFuelConsumption(
          powerRequired,
          config.fuelEfficiencyFactor,
          0.65, // 65% power for default cruise (with efficiency curve benefit)
          fuelEfficiencyMultiplier,
        );

  // Step 8: Calculate range
  const maxRange = calculateRange(fuelConsumptionCruise, input.shipDisplacement, cruisingSpeed);

  // Step 9: Calculate secondary metrics
  const accelerationRating = calculateAcceleration(powerRequired, totalEngineWeight);
  const heatSignature = calculateHeatSignature(config.id, fuelConsumptionFull);
  const complexityRating = calculateComplexity(config.complexityFactor);

  return {
    configuration: input.configType,

    totalEngineWeight,
    totalEngineCost,
    engineVolume: totalEngineWeight * 2.5, // Rough approximation: heavier engines are bulkier

    maxPower: powerRequired,
    maxSpeed: input.desiredTopSpeed,
    cruisingSpeed,
    maxRange,

    mtbf,
    reliabilityScore: (mtbf / CALCULATION_CONSTANTS.baseMTBF) * 100,
    fuelConsumptionAtFullPower: fuelConsumptionFull,
    fuelConsumptionAtCruise: fuelConsumptionCruise,
    operatingCostPerHour: fuelConsumptionFull * CALCULATION_CONSTANTS.fuelCostPerTonne,

    accelerationRating,
    heatSignature,
    complexityRating,
  };
}

/**
 * Calculate thrust and power required for desired speed
 * Based on empirical power law for naval vessels
 *
 * For naval vessels, power scales roughly as:
 * P ∝ displacement^(2/3) * speed³
 * This is empirically validated against real warships:
 * - FFG-7 (4,100t @ 29kt): ~40,000 HP
 * - DDG-51 (9,100t @ 30kt): ~100,000 HP
 * - Type 45 (8,500t @ 29kt): ~70,000 HP
 */
function calculatePowerRequirement(
  shipDisplacement: number,
  hullDragCoefficient: number,
  desiredSpeed: number,
): { thrustRequired: number; powerRequired: number } {
  // Empirical power law for naval vessels (derived from real ship data)
  // Base formula: P (HP) = 0.003 * displacement^(2/3) * speed^3 * hull_drag_factor
  // The constant is calibrated for typical destroyer hulls

  // Calculate power in HP using empirical law
  const baseHPCoefficient = 0.0035; // Calibrated to match real destroyers. We can have a range of constants for different hull types or have hulls pass in their constant.
  const displacementExponent = 0.67; // displacement factor (2/3)
  const speedExponent = 3.0; // speed factor (cubic relationship)

  // Apply hull drag coefficient (higher = worse hull, needs more power)
  // Drag coefficient ranges 0.05 (very fine hull) to 0.25 (bluff body)
  const hullDragFactor = 1.0 + hullDragCoefficient * 8; // Scale drag 1-3x multiplier

  // Calculate power requirement in HP
  const powerHP =
    baseHPCoefficient *
    Math.pow(shipDisplacement, displacementExponent) *
    Math.pow(desiredSpeed, speedExponent) *
    hullDragFactor;

  // Thrust is a derived value (placeholder for consistency)
  const thrustRequired = powerHP * 100; // Arbitrary conversion

  return { thrustRequired, powerRequired: powerHP };
}

function alternateCalculatePowerRequirement(
  shipDisplacement: number,
  desiredSpeed: number,
  hullType: hullType,
): { thrustRequired: number; powerRequired: number } {
  const hullProps = hullTypeProperties[hullType];

  // Ensure displacement is within hull type range
  if (
    shipDisplacement < hullProps.displacementRange[0] ||
    shipDisplacement > hullProps.displacementRange[1]
  ) {
    throw new Error(
      `Displacement ${shipDisplacement}t is out of range for hull type ${hullType} (${hullProps.displacementRange[0]}t - ${hullProps.displacementRange[1]}t)`,
    );
  }
  const kWToSHP = 0.7457;
  const powerAdjustmentFactor = 1.0; // Placeholder for gameplay adjustments based on selected hull design. Probably don't need as admiralty coefficient already accounts for hull efficiency and planingEfficiencyFactor helps smooth out outliers.
  let planingEfficiencyFactor = 1.0;

  // get planing efficiency factor
  if (shipDisplacement < 1500) {
    // planing hull
    planingEfficiencyFactor = 0.82;
  } else if (shipDisplacement < 4000) {
    // small displacement hull
    planingEfficiencyFactor = 0.91;
  }

  // using the AdmiraltyWithResistance formula
  const powerKW =
    (Math.pow(shipDisplacement, 2 / 3) * Math.pow(desiredSpeed, 3)) /
    hullProps.admiraltyCoefficient;
  const powerHP = powerKW / planingEfficiencyFactor / kWToSHP;
  const thrustRequired = powerHP * 100; // Arbitrary conversion

  return { thrustRequired, powerRequired: powerHP };
}

/**
 * Determine priority-based adjustments
 * Small multipliers that favor certain characteristics
 */
function getPriorityAdjustment(priority: EnginePriority): {
  weight: number;
  cost: number;
  reliability: number;
  fuel: number;
} {
  const adjustments = {
    efficiency: { weight: 0.05, cost: 0.1, reliability: -0.05, fuel: -0.15 },
    power: { weight: -0.1, cost: 0.15, reliability: -0.1, fuel: 0.1 },
    reliability: { weight: 0.08, cost: 0.12, reliability: 0.15, fuel: -0.05 },
    balanced: { weight: 0, cost: 0, reliability: 0, fuel: 0 },
  };

  return adjustments[priority];
}

/**
 * Calculate total cost based on power, configuration, and priority
 */
function calculateCost(
  powerRequired: number,
  configCostMultiplier: number,
  priority: EnginePriority,
): number {
  let baseCost = powerRequired * CALCULATION_CONSTANTS.costPerHP * configCostMultiplier;

  // Priority adjustments (small multipliers for balance)
  if (priority === "power") baseCost *= 1.08; // More expensive engines for more power
  if (priority === "efficiency") baseCost *= 1.05; // Efficient engines slightly pricier
  if (priority === "reliability") baseCost *= 1.1; // Redundant/reliable systems cost more

  return Math.round(baseCost);
}

/**
 * Calculate MTBF based on configuration and priority
 */
function calculateMTBF(configReliabilityFactor: number, priority: EnginePriority): number {
  let mtbf = CALCULATION_CONSTANTS.baseMTBF * configReliabilityFactor;

  if (priority === "reliability") mtbf *= 1.25;
  if (priority === "power") mtbf *= 0.85;

  return Math.round(mtbf);
}

/**
 * Calculate fuel consumption at given power setting (kWh basis)
 * Uses real naval diesel efficiency curves
 */
function calculateFuelConsumption(
  powerRequiredHP: number,
  configFuelEfficiency: number,
  powerSetting: number, // 0-1.0
  priorityMultiplier: number = 1.0, // Priority adjustment for efficiency vs power
): number {
  // Convert HP to kW
  const powerKW = powerRequiredHP * 0.7457;

  // Fuel consumption in tonnes per hour
  // Based on: 0.19 kg/kWh for diesel engines * config efficiency * non-linear power curve
  const baseConsumption =
    powerKW * CALCULATION_CONSTANTS.baseFullPowerConsumption * configFuelEfficiency;

  // Non-linear consumption curve (ships are more efficient at 60-75% power)
  const consumptionAtSetting = baseConsumption * Math.pow(powerSetting, 1.25) * priorityMultiplier;

  // Round to 4 decimal places for readability
  return Math.round(consumptionAtSetting * 10000) / 10000;
}

/**
 * Calculate cruising speed (optimal fuel economy point)
 * Typically around 60-70% power for optimal efficiency
 */
function calculateCruisingSpeed(
  shipDisplacement: number,
  hullDragCoefficient: number,
  desiredCruisingSpeed?: number,
): number {
  // Cruising speed is typically 60-65% of max speed for naval vessels
  // Return as fixed ratio for now (can be parameterized if needed)
  if (desiredCruisingSpeed) return desiredCruisingSpeed;
  return shipDisplacement * hullDragCoefficient < 0.12 ? 18 : 15; // Faster hulls cruise faster
}

/**
 * Calculate maximum range
 * Based on fuel capacity (percentage of ship displacement) and consumption at cruise
 */
function calculateRange(
  fuelConsumptionPerHour: number,
  shipDisplacement: number,
  cruisingSpeed: number,
): number {
  if (fuelConsumptionPerHour === 0 || cruisingSpeed === 0) return 0;

  // Fuel capacity is a percentage of ship displacement (typical: 30-40% for warships)
  const fuelCapacity = shipDisplacement * CALCULATION_CONSTANTS.fuelLoadPercentage;

  // Hours of operation at cruise consumption
  const hoursAtCruise = fuelCapacity / fuelConsumptionPerHour;

  // Range in nautical miles
  const range = hoursAtCruise * cruisingSpeed;

  return Math.round(range);
}

/**
 * Calculate acceleration rating (time to reach combat speed)
 * More power and less weight = faster acceleration
 */
function calculateAcceleration(powerRequired: number, engineWeight: number): number {
  // Higher power-to-weight ratio = better acceleration
  const powerToWeight = powerRequired / engineWeight;
  const rating = (powerToWeight / 50) * 100; // Normalize to 0-100 scale

  return Math.min(100, Math.round(rating));
}

/**
 * Calculate heat signature (detection difficulty)
 * More fuel burn = higher heat = easier to detect
 * CODAD quieter, All-Gas noisier
 */
function calculateHeatSignature(configId: ConfigurationId, fuelConsumption: number): number {
  const baseSignatures: Record<ConfigurationId, number> = {
    CODAD: 30, // Quiet, low-signature
    DIESEL: 35,
    CODOG: 50, // Mixed signature
    CODAG: 65, // Higher signature
    GAS_TURBINE: 85, // Very hot, loud
    COGOG: 90, // All gas turbines
    COGAG: 80, // All gas turbines
    STEAM_TURBINE: 70,
    COSAG: 75,
    IEP: 40, // Electric drive reduces signature
  };

  const base = baseSignatures[configId];
  const consumptionFactor = Math.min(20, fuelConsumption * 10); // Cap at 20 points

  return Math.min(100, base + consumptionFactor);
}

/**
 * Calculate crew complexity rating
 */
function calculateComplexity(complexityFactor: number): number {
  return Math.round(complexityFactor * 100);
}

/**
 * Format engine output for display
 */
export function formatEngineOutput(output: EngineSystemOutput): string {
  return `
Engine System: ${output.configuration}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Physical:
  Weight: ${output.totalEngineWeight.toFixed(1)} tons
  Cost: ${output.totalEngineCost.toLocaleString()} credits
  Volume: ${output.engineVolume.toFixed(1)} m³

Performance:
  Max Power: ${output.maxPower.toFixed(0)} HP
  Max Speed: ${output.maxSpeed.toFixed(1)} knots
  Cruising Speed: ${output.cruisingSpeed.toFixed(1)} knots
  Max Range: ${output.maxRange.toFixed(0)} nautical miles

Operational:
  MTBF: ${output.mtbf.toFixed(0)} hours
  Reliability Score: ${output.reliabilityScore.toFixed(0)}/100
  Full Power Consumption: ${output.fuelConsumptionAtFullPower.toFixed(2)} tons/hour
  Cruise Consumption: ${output.fuelConsumptionAtCruise.toFixed(2)} tons/hour
  Operating Cost: ${output.operatingCostPerHour.toFixed(0)} credits/hour

Strategic:
  Acceleration: ${output.accelerationRating.toFixed(0)}/100
  Heat Signature: ${output.heatSignature.toFixed(0)}/100
  Complexity: ${output.complexityRating.toFixed(0)}/100
  `;
}
