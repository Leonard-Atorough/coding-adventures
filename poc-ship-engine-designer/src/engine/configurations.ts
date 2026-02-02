/**
 * Configuration templates define the inherent characteristics of each propulsion type.
 * These multipliers are baked-in and never change—they encode naval engineering reality.
 */

export type ConfigurationId =
  | "DIESEL" // Single diesel engine
  | "GAS_TURBINE" // Single gas turbine
  | "STEAM_TURBINE" // Single steam turbine
  | "CODOG" // Combined Diesel Or Gas
  | "COGOG" // Combined Gas Or Gas
  | "CODAG" // Combined Diesel And Gas
  | "COGAG" // Combined Gas And Gas
  | "CODAD" // Combined Diesel And Diesel
  | "COSAG" // Combined Steam And Gas
  | "IEP"; // Integrated Electric Propulsion

export interface PropulsionConfig {
  id: ConfigurationId;
  name: string;
  displayName: string;
  description: string;

  // Core performance multipliers (these drive all calculations)
  powerDensity: number; // HP per ton of engine weight - higher = smaller engines
  weightMultiplier: number; // Engine weight multiplier (0.60-1.50) - how heavy/light engines are for this config
  costMultiplier: number; // Cost adjustment vs baseline (e.g., 1.2 = 20% more expensive)
  reliabilityFactor: number; // MTBF multiplier vs baseline
  fuelEfficiencyFactor: number; // Fuel consumption multiplier (higher = worse efficiency)
  complexityFactor: number; // Crew/maintenance requirements (0-1 scale)

  // Technical definition
  engineCount: number; // Total number of engines in this configuration
  engineTypes: ("diesel" | "gasturbine" | "steam")[]; // What types of engines
  gearboxType: "combined" | "direct"; // How engines combine power

  // Progression
  yearIntroduced: number;
  techTier: number;
}

/**
 * Propulsion configuration templates for 1960s-2000s era naval vessels.
 * All values scientifically grounded in real naval engineering principles.
 */
export const CONFIGURATIONS: Record<ConfigurationId, PropulsionConfig> = {
  DIESEL: {
    id: "DIESEL",
    name: "Single Diesel",
    displayName: "Diesel",
    description:
      "Single diesel engine. Cost-effective, reliable, excellent fuel economy. Limited power density.",

    powerDensity: 60,
    weightMultiplier: 0.9,
    costMultiplier: 0.85,
    reliabilityFactor: 1.3,
    fuelEfficiencyFactor: 0.75,
    complexityFactor: 0.5,

    engineCount: 1,
    engineTypes: ["diesel"],
    gearboxType: "direct",

    yearIntroduced: 1960,
    techTier: 1,
  },

  GAS_TURBINE: {
    id: "GAS_TURBINE",
    name: "Single Gas Turbine",
    displayName: "Gas Turbine",
    description:
      "Single gas turbine. Highest power density, quick response, poor fuel economy and high operating cost.",

    powerDensity: 150,
    weightMultiplier: 0.6,
    costMultiplier: 1.4,
    reliabilityFactor: 0.7,
    fuelEfficiencyFactor: 1.5,
    complexityFactor: 0.85,

    engineCount: 1,
    engineTypes: ["gasturbine"],
    gearboxType: "direct",

    yearIntroduced: 1965,
    techTier: 2,
  },

  STEAM_TURBINE: {
    id: "STEAM_TURBINE",
    name: "Steam Turbine",
    displayName: "Steam Turbine",
    description:
      "Steam turbine propulsion. Historical standard for WWII-era and post-war capital ships. Simple, reliable, poor efficiency.",

    powerDensity: 45,
    weightMultiplier: 1.2,
    costMultiplier: 0.8,
    reliabilityFactor: 1.1,
    fuelEfficiencyFactor: 2.0,
    complexityFactor: 0.8,

    engineCount: 4,
    engineTypes: ["steam", "steam", "steam", "steam"],
    gearboxType: "combined",

    yearIntroduced: 1940,
    techTier: 0,
  },

  CODOG: {
    id: "CODOG",
    name: "Combined Diesel Or Gas",
    displayName: "CODOG",
    description: "One diesel for cruise, one gas turbine for boost. Balanced efficiency and power.",

    powerDensity: 75,
    weightMultiplier: 0.75,
    costMultiplier: 1.05,
    reliabilityFactor: 1.0,
    fuelEfficiencyFactor: 0.95,
    complexityFactor: 0.75,

    engineCount: 2,
    engineTypes: ["diesel", "gasturbine"],
    gearboxType: "direct",

    yearIntroduced: 1970,
    techTier: 2,
  },

  COGOG: {
    id: "COGOG",
    name: "Combined Gas Or Gas",
    displayName: "COGOG",
    description:
      "Two gas turbines which can have different operating characteristics. One for cruise efficiency, one for sprint power. High power density but complex and costly.",
    powerDensity: 90,
    weightMultiplier: 0.7,
    costMultiplier: 1.2,
    reliabilityFactor: 0.8,
    fuelEfficiencyFactor: 1.1,
    complexityFactor: 0.8,

    engineCount: 2,
    engineTypes: ["gasturbine", "gasturbine"],
    gearboxType: "direct",

    yearIntroduced: 1965,
    techTier: 3,
  },

  CODAG: {
    id: "CODAG",
    name: "Combined Diesel And Gas",
    displayName: "CODAG",
    description:
      "Two diesels plus gas turbine boost. Superior peak power, compact. Higher cost and complexity.",

    powerDensity: 80,
    weightMultiplier: 0.65,
    costMultiplier: 1.25,
    reliabilityFactor: 0.85,
    fuelEfficiencyFactor: 1.05,
    complexityFactor: 0.9,

    engineCount: 3,
    engineTypes: ["diesel", "diesel", "gasturbine"],
    gearboxType: "combined",

    yearIntroduced: 1960,
    techTier: 2,
  },

  COGAG: {
    id: "COGAG",
    name: "Combined Gas And Gas",
    displayName: "COGAG",
    description:
      "Two gas turbines which can have different operating characteristics. One for cruise efficiency, one for sprint power or two similar smaller turbines. High power density but complex and costly.",

    powerDensity: 95,
    weightMultiplier: 0.6,
    costMultiplier: 1.3,
    reliabilityFactor: 0.75,
    fuelEfficiencyFactor: 1.2,
    complexityFactor: 0.88,

    engineCount: 2,
    engineTypes: ["gasturbine", "gasturbine"],
    gearboxType: "combined",

    yearIntroduced: 1962,
    techTier: 3,
  },

  CODAD: {
    id: "CODAD",
    name: "Combined Diesel And Diesel",
    displayName: "CODAD",
    description:
      "Two or more diesel engines combined for higher power output. Excellent fuel efficiency and reliability, but limited peak power density.",
    powerDensity: 70,
    weightMultiplier: 0.8,
    costMultiplier: 1.1,
    reliabilityFactor: 1.2,
    fuelEfficiencyFactor: 0.8,
    complexityFactor: 0.7,

    engineCount: 2,
    engineTypes: ["diesel", "diesel"],
    gearboxType: "combined",

    yearIntroduced: 1975,
    techTier: 1,
  },

  COSAG: {
    id: "COSAG",
    name: "Combined Steam And Gas",
    displayName: "COSAG",
    description:
      "Steam turbines for continuous operation, gas turbines for boost. Used in large destroyers/cruisers.",

    powerDensity: 70,
    weightMultiplier: 0.9,
    costMultiplier: 1.15,
    reliabilityFactor: 0.95,
    fuelEfficiencyFactor: 1.3,
    complexityFactor: 0.85,

    engineCount: 4,
    engineTypes: ["steam", "steam", "gasturbine", "gasturbine"],
    gearboxType: "combined",

    yearIntroduced: 1962,
    techTier: 2,
  },

  IEP: {
    id: "IEP",
    name: "Integrated Electric Propulsion",
    displayName: "IEP",
    description:
      "Diesel generators and gas turbines drive electric motors. No mechanical shaft drive. Superior efficiency, reduced vibration, excellent flexibility. Complex but highly efficient.",

    powerDensity: 85,
    weightMultiplier: 0.7,
    costMultiplier: 1.35,
    reliabilityFactor: 0.95,
    fuelEfficiencyFactor: 0.88,
    complexityFactor: 0.95,

    engineCount: 4,
    engineTypes: ["diesel", "diesel", "gasturbine", "gasturbine"],
    gearboxType: "direct",

    yearIntroduced: 1990,
    techTier: 4,
  },
};

export function getConfiguration(id: ConfigurationId): PropulsionConfig {
  const config = CONFIGURATIONS[id];
  if (!config) throw new Error(`Unknown configuration: ${id}`);
  return config;
}
