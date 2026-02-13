/**
 * 1960s Naval Warship Dataset
 * Structured specifications for power formula analysis
 * Data source: Wikipedia (verified across multiple articles)
 *
 * Includes:
 * - 20+ vessels spanning corvettes (440t) to destroyers (6,200t)
 * - 1950s-1970s era (focused on 1960s common platform)
 * - Multiple propulsion types for comparison
 * - Hydrodynamic parameters for resistance modeling
 */
export type propulsionType =
  | "steam-turbine"
  | "diesel"
  | "cogag"
  | "cosag"
  | "iep"
  | "codag"
  | "codog"
  | "codad"
  | "cogog"
  | "nuclear";

export const propulsionTypeData: Record<
  propulsionType,
  { description: string; typicalCruiseEfficiency: number }
> = {
  "steam-turbine": {
    description:
      "Steam turbines powered by boilers, common in mid-20th century warships. Steam turbines are less efficient at lower speeds.",
    typicalCruiseEfficiency: 0.55,
  },
  diesel: {
    description:
      "Diesel engines, efficient for cruising speeds. Diesel engines maintain good fuel efficiency across a range of speeds.",
    typicalCruiseEfficiency: 0.75,
  },
  cogag: {
    description:
      "Combined Gas and Gas - multiple gas turbines for different speed regimes. Gas turbines are efficient at high speeds but less so at cruising speeds. COGAG setups help optimize efficiency across speed ranges but is less efficient at cruising speeds then diesel engines.",
    typicalCruiseEfficiency: 0.67,
  },
  cosag: {
    description:
      "Combined Steam and Gas - steam turbines for cruising, gas turbines for high speed. Steam turbines are less efficient at lower speeds, making COSAG less efficient at cruising speeds compared to diesel engines.",
    typicalCruiseEfficiency: 0.6,
  },
  iep: {
    description:
      "Integrated Electric Propulsion - electric motors powered by various prime movers. Highly efficient across a wide speed range due to electric drive characteristics.",
    typicalCruiseEfficiency: 0.9,
  },
  codag: {
    description:
      "Combined Diesel and Gas - diesels for cruising, gas turbines for high speed. Diesels provide good fuel efficiency at cruising speeds, while gas turbines offer high power for sprints.",
    typicalCruiseEfficiency: 0.72,
  },
  codog: {
    description:
      "Combined Diesel or Gas - either diesels or gas turbines can drive the ship. Diesels are used for cruising, gas turbines for high speed.",
    typicalCruiseEfficiency: 0.75,
  },
  codad: {
    description:
      "Combined Diesel and Diesel - multiple diesel engines for different speed regimes. All engines are diesels, optimizing efficiency across speed ranges.",
    typicalCruiseEfficiency: 0.78,
  },
  cogog: {
    description:
      "Combined Gas or Gas - multiple gas turbines, only one set active at a time. Gas turbines are less efficient at cruising speeds compared to diesels.",
    typicalCruiseEfficiency: 0.65,
  },
  nuclear: {
    description:
      "Nuclear propulsion - nuclear reactors generate steam for turbines. Provides consistent power and efficiency across all speeds.",
    typicalCruiseEfficiency: 0.85,
  },
};

export interface VesselSpecification {
  name: string;
  class: string;
  nation: string;
  designYear: number;

  // Physical characteristics
  displacement: {
    standard: number; // tonnes
    fullLoad?: number; // tonnes
  };

  // Hull dimensions (meters)
  dimensions: {
    length: number; // Length Overall (LOA)
    beam: number; // Beam (width)
    draught: number; // Operational draught
  };

  // Performance
  speed: number; // knots (maximum)
  cruiseSpeed?: number; // knots (optional)
  maxPowerPerEngineGroup: number; // shaft horsepower (SHP)
  knownMaxCruisePower?: number; // SHP (optional)
  numberOfShafts?: number;
  admiraltyCoefficient?: number; // optional pre-calculated value

  // Classification
  propulsionType: propulsionType;
  hullForm: "planing" | "displacement";
  vesselType: "corvette" | "minesweeper" | "frigate" | "destroyer" | "cruiser";

  // Calculated hydrodynamic parameters
  calculations: {
    lengthToBeamRatio: number;
    displaceToLength: number; // ∇ = Disp / (0.01 * Lwl)^3
    froudeNumber: number; // V / √(g × Lwl)
    powerToDisplacement: number; // shp/tonne
    resistanceFactor: number; // multiplier for resistance adjustment
  };
}

/**
 * Complete 1960s Naval Warship Dataset
 * 7 distinct vessels representing major 1960s propulsion types
 */
export const vessels1960s: VesselSpecification[] = [
  // ==================== CORVETTES ====================
  {
    name: "Poti",
    class: "Poti-class",
    nation: "Soviet Navy",
    designYear: 1960,
    displacement: { standard: 508, fullLoad: 589 },
    dimensions: { length: 59.4, beam: 7.9, draught: 2.0 },
    speed: 38,
    cruiseSpeed: 15,
    maxPowerPerEngineGroup: 19000, // COmbined power of 15000 turbine + 4000 diesel per shaft
    knownMaxCruisePower: 8000, // SHP at 10 knots
    numberOfShafts: 2,
    propulsionType: "codag",
    hullForm: "planing",
    vesselType: "corvette",
    calculations: {
      lengthToBeamRatio: 7.52,
      displaceToLength: 1.84,
      froudeNumber: 0.431, // 38 / √(9.81 × 59.4) = 0.431
      powerToDisplacement: 59.06,
      resistanceFactor: 0.95,
    },
  },
  {
    name: "Grisha",
    class: "Grisha-class",
    nation: "Soviet Navy",
    designYear: 1966,
    displacement: { standard: 803, fullLoad: 980 },
    dimensions: { length: 71.6, beam: 19.8, draught: 3.7 },
    speed: 34,
    cruiseSpeed: 15,
    maxPowerPerEngineGroup: 12667, // 3 shafts, one with one gas turbine and two with diesels
    knownMaxCruisePower: 20000, // SHP at 10 knots
    numberOfShafts: 3,
    propulsionType: "codag",
    hullForm: "planing",
    vesselType: "corvette",
    calculations: {
      lengthToBeamRatio: 3.62,
      displaceToLength: 2.74,
      froudeNumber: 0.402, // 34 / √(9.81 × 71.6) = 0.402
      powerToDisplacement: 15.77,
      resistanceFactor: 0.92,
    },
  },

  // ==================== FRIGATES ====================
  {
    name: "Niteroi",
    class: "Niteroi-class",
    nation: "Brazil Navy",
    designYear: 1972,
    displacement: { standard: 2700, fullLoad: 3385 },
    dimensions: { length: 129, beam: 13.5, draught: 5.5 },
    speed: 30,
    cruiseSpeed: 22,
    maxPowerPerEngineGroup: 28000, // Power per shaft for 2-shaft setup
    knownMaxCruisePower: 17000,
    numberOfShafts: 2,
    propulsionType: "codog",
    hullForm: "displacement",
    vesselType: "frigate",
    calculations: {
      lengthToBeamRatio: 9.56,
      displaceToLength: 2.14,
      froudeNumber: 0.267, // 30 / √(9.81 × 129) = 0.267
      powerToDisplacement: 10.37,
      resistanceFactor: 1.0,
    },
  },
  {
    name: "HMS Whitby",
    class: "Whitby-class (Type 12)",
    nation: "British Royal Navy",
    designYear: 1953,
    displacement: { standard: 2150, fullLoad: 2560 },
    dimensions: { length: 110, beam: 12, draught: 5.2 },
    speed: 30,
    cruiseSpeed: 16,
    maxPowerPerEngineGroup: 15000, // Power per shaft for 2-shaft setup
    knownMaxCruisePower: 3000, // SHP at 12 knots
    numberOfShafts: 2,
    propulsionType: "steam-turbine",
    hullForm: "displacement",
    vesselType: "frigate",
    calculations: {
      lengthToBeamRatio: 9.17,
      displaceToLength: 2.12,
      froudeNumber: 0.303, // 30 / √(9.81 × 110) = 0.303
      powerToDisplacement: 13.95,
      resistanceFactor: 0.97,
    },
  },
  {
    name: "HMS Leander",
    class: "Leander-class (Type 12I)",
    nation: "British Royal Navy",
    designYear: 1959,
    displacement: { standard: 2350, fullLoad: 2860 },
    dimensions: { length: 113.4, beam: 13.1, draught: 4.5 },
    speed: 27,
    cruiseSpeed: 17,
    maxPowerPerEngineGroup: 15000,
    numberOfShafts: 2,
    propulsionType: "steam-turbine",
    hullForm: "displacement",
    vesselType: "frigate",
    calculations: {
      lengthToBeamRatio: 8.65,
      displaceToLength: 2.17,
      froudeNumber: 0.27, // 27 / √(9.81 × 113.4) = 0.270
      powerToDisplacement: 12.77,
      resistanceFactor: 0.95,
    },
  },
  // Brooke-class (US Navy)
  {
    name: "USS Brooke",
    class: "Brooke-class",
    nation: "United States Navy",
    designYear: 1962,
    displacement: { standard: 2640, fullLoad: 3426 },
    dimensions: { length: 118, beam: 13.5, draught: 4.42 },
    speed: 27.2,
    cruiseSpeed: 17,
    maxPowerPerEngineGroup: 35000,
    numberOfShafts: 1,
    propulsionType: "steam-turbine",
    hullForm: "displacement",
    vesselType: "frigate",
    calculations: {
      lengthToBeamRatio: 8.74,
      displaceToLength: 2.28, // ∇ = 2640 / (0.01 * 118)^3
      froudeNumber: 0.252, // 27.2 / √(9.81 × 118) = 0.252
      powerToDisplacement: 13.26, // 35000 / 2640
      resistanceFactor: 0.96,
    },
  },
  // Krivak-class (Soviet Navy)
  {
    name: "Razyashchiy",
    class: "Krivak-class (Project 1135)",
    nation: "Soviet Navy",
    designYear: 1968,
    displacement: { standard: 3300, fullLoad: 3575 },
    dimensions: { length: 123, beam: 14.2, draught: 4.6 },
    speed: 32,
    cruiseSpeed: 19,
    maxPowerPerEngineGroup: 27475, // One cruise turbine + one boost turbine per shaft
    knownMaxCruisePower: 14950, // SHP at 14 knots
    numberOfShafts: 2,
    propulsionType: "cogag",
    hullForm: "displacement",
    vesselType: "frigate",
    calculations: {
      lengthToBeamRatio: 8.66,
      displaceToLength: 2.21,
      froudeNumber: 0.288, // 32 / √(9.81 × 123) = 0.288
      powerToDisplacement: 16.63,
      resistanceFactor: 0.98,
    },
  },
  {
    name: "Dinh Tien Hoang",
    class: "Gepard-class (Project 11661 E)",
    nation: "Vietnam Navy",
    designYear: 2000,
    displacement: { standard: 2050, fullLoad: 2500 },
    dimensions: { length: 102.4, beam: 13.9, draught: 5.7 },
    hullForm: "displacement",
    speed: 29,
    cruiseSpeed: 16,
    maxPowerPerEngineGroup: 15000, // 2 shafts with 15000 SHP each
    knownMaxCruisePower: 8000, // SHP at 10 knots
    numberOfShafts: 2,
    propulsionType: "codog",
    vesselType: "frigate",
    calculations: {
      lengthToBeamRatio: 7.37,
      displaceToLength: 2.89,
      froudeNumber: 0.283, // 29 / √(9.81 × 102.4) = 0.283
      powerToDisplacement: 11.72,
      resistanceFactor: 1.0, // modern hull design
    },
  },
  {
    name: "USS Knox",
    class: "Knox-class",
    nation: "United States Navy",
    designYear: 1966,
    displacement: { standard: 3385, fullLoad: 4130 },
    dimensions: { length: 134, beam: 14.25, draught: 7.54 },
    speed: 27,
    cruiseSpeed: 20,
    maxPowerPerEngineGroup: 35000, // Power per shaft for 1-shaft setup
    numberOfShafts: 1,
    propulsionType: "steam-turbine",
    hullForm: "displacement",
    vesselType: "frigate",
    calculations: {
      lengthToBeamRatio: 9.4,
      displaceToLength: 2.39,
      froudeNumber: 0.241, // 27 / √(9.81 × 134) = 0.241
      powerToDisplacement: 10.34,
      resistanceFactor: 0.99,
    },
  },

  // ==================== DESTROYERS ====================
  {
    name: "HMS Devonshire",
    class: "County-class",
    nation: "British Royal Navy",
    designYear: 1962,
    displacement: { standard: 5080, fullLoad: 6200 },
    dimensions: { length: 158, beam: 16.5, draught: 6.4 },
    speed: 30,
    cruiseSpeed: 18,
    maxPowerPerEngineGroup: 30000, // 1 steam turbine and 2 gas turbines per shaft
    knownMaxCruisePower: 30000,
    numberOfShafts: 2,
    propulsionType: "cosag",
    hullForm: "displacement",
    vesselType: "destroyer",
    calculations: {
      lengthToBeamRatio: 9.58,
      displaceToLength: 1.69,
      froudeNumber: 0.23, // 30 / √(9.81 × 158) = 0.230
      powerToDisplacement: 9.68,
      resistanceFactor: 1.02,
    },
  },
  {
    name: "Komsomolets",
    class: "Kashin-class (Project 61)",
    nation: "Soviet Navy",
    designYear: 1962,
    displacement: { standard: 3400, fullLoad: 4390 },
    dimensions: { length: 144, beam: 15.8, draught: 4.6 },
    speed: 38,
    cruiseSpeed: 18,
    maxPowerPerEngineGroup: 48000, // 2 gas turbines per shaft
    knownMaxCruisePower: 48000,
    numberOfShafts: 2,
    admiraltyCoefficient: 204.3,
    propulsionType: "cogag",
    hullForm: "displacement",
    vesselType: "destroyer",
    calculations: {
      lengthToBeamRatio: 9.11,
      displaceToLength: 2.37,
      froudeNumber: 0.356, // 38 / √(9.81 × 144) = 0.356
      powerToDisplacement: 24.71,
      resistanceFactor: 1.0,
    },
  },
  {
    name: "USS Charles F. Adams",
    class: "Charles F. Adams-class",
    nation: "United States Navy",
    designYear: 1960,
    displacement: { standard: 3277, fullLoad: 4526 },
    dimensions: { length: 133, beam: 14, draught: 4.6 },
    speed: 33,
    cruiseSpeed: 20,
    maxPowerPerEngineGroup: 35000, // 1 steam turbine per shaft
    numberOfShafts: 2,
    propulsionType: "steam-turbine",
    hullForm: "displacement",
    vesselType: "destroyer",
    calculations: {
      lengthToBeamRatio: 9.5,
      displaceToLength: 2.54,
      froudeNumber: 0.306, // 33 / √(9.81 × 133) = 0.306
      powerToDisplacement: 10.69,
      resistanceFactor: 0.99,
    },
  },

  // ==================== CRUISERS ====================
  {
    name: "Vladivostok",
    class: "Kresta I-class (Project 1134)",
    nation: "Soviet Navy",
    designYear: 1967,
    displacement: { standard: 6000, fullLoad: 7500 },
    dimensions: { length: 159, beam: 17, draught: 6 },
    speed: 34,
    cruiseSpeed: 20,
    maxPowerPerEngineGroup: 50000, // 2 gas turbines per shaft
    numberOfShafts: 2,
    propulsionType: "steam-turbine",
    hullForm: "displacement",
    vesselType: "cruiser",
    calculations: {
      lengthToBeamRatio: 9.35,
      displaceToLength: 1.83,
      froudeNumber: 0.271, // 34 / √(9.81 × 159) = 0.271
      powerToDisplacement: 16.67,
      resistanceFactor: 1.01,
    },
  },

  {
    name: "USS Leahy",
    class: "Leahy-class",
    nation: "United States Navy",
    designYear: 1962,
    displacement: { fullLoad: 7800, standard: 7000 },
    dimensions: { length: 162, beam: 17.1, draught: 7.9 },
    speed: 32,
    cruiseSpeed: 20,
    maxPowerPerEngineGroup: 42500, // 1 steam turbine per shaft
    numberOfShafts: 2,
    propulsionType: "steam-turbine",
    hullForm: "displacement",
    vesselType: "cruiser",
    calculations: {
      lengthToBeamRatio: 9.47,
      displaceToLength: 1.88,
      froudeNumber: 0.224, // 32 / √(9.81 × 162) = 0.224
      powerToDisplacement: 12.14,
      resistanceFactor: 1.02,
    },
  },

  // ==================== MODERN DESTROYERS ====================
  {
    name: "HMCS Iroquois",
    class: "Iroquois-class",
    nation: "Royal Canadian Navy",
    designYear: 1972,
    displacement: { standard: 4500, fullLoad: 5200 },
    dimensions: { length: 129, beam: 15, draught: 4.42 },
    speed: 29,
    cruiseSpeed: 20,
    maxPowerPerEngineGroup: 25000, // 50,000 SHP total boost (2 shafts × 25,000 SHP)
    knownMaxCruisePower: 12600, // SHP from cruise turbines (6,400 BHP / 0.7457 = ~8,570 SHP, rounded down for 2-shaft avg)
    numberOfShafts: 2,
    propulsionType: "cogog",
    hullForm: "displacement",
    vesselType: "destroyer",
    calculations: {
      lengthToBeamRatio: 8.6,
      displaceToLength: 2.15, // ∇ = 4500 / (0.01 * 129)^3
      froudeNumber: 0.254, // 29 / √(9.81 × 129) = 0.254
      powerToDisplacement: 13.92, // 50,000 SHP / 4,500t
      resistanceFactor: 0.98,
    },
  },

  // ==================== MODERN FRIGATES ====================
  {
    name: "Kortenaer",
    class: "Kortenaer-class",
    nation: "Royal Netherlands Navy",
    designYear: 1978,
    displacement: { standard: 3100, fullLoad: 3690 },
    dimensions: { length: 130.5, beam: 14.6, draught: 4.3 },
    speed: 30,
    cruiseSpeed: 20,
    maxPowerPerEngineGroup: 25700, // 51,400 SHP total boost (2 shafts × 25,700 SHP)
    knownMaxCruisePower: 9800, // SHP from cruise turbines per shaft (2 × 4,900 = 9,800 SHP total, but listed as per-turbine)
    numberOfShafts: 2,
    propulsionType: "cogog",
    hullForm: "displacement",
    vesselType: "frigate",
    calculations: {
      lengthToBeamRatio: 8.94,
      displaceToLength: 2.08, // ∇ = 3690 / (0.01 * 130.5)^3
      froudeNumber: 0.262, // 30 / √(9.81 × 130.5) = 0.262
      powerToDisplacement: 13.93, // 51,400 SHP / 3,690t
      resistanceFactor: 0.97,
    },
  },

  // ==================== 1970s-1990s GAS TURBINE DESTROYERS ====================
  {
    name: "USS Spruance",
    class: "Spruance-class",
    nation: "United States Navy",
    designYear: 1970,
    displacement: { standard: 7050, fullLoad: 8040 },
    dimensions: { length: 172, beam: 16.8, draught: 8.8 },
    speed: 32.5,
    cruiseSpeed: 20,
    maxPowerPerEngineGroup: 20000, // 4× LM2500 gas turbines = 80,000 SHP total (20,000 SHP per turbine)
    numberOfShafts: 2,
    propulsionType: "cogag",
    hullForm: "displacement",
    vesselType: "destroyer",
    calculations: {
      lengthToBeamRatio: 10.24,
      displaceToLength: 2.18, // ∇ = 7050 / (0.01 * 172)^3
      froudeNumber: 0.247, // 32.5 / √(9.81 × 172) = 0.247
      powerToDisplacement: 11.32, // 80,000 SHP / 7,050t
      resistanceFactor: 0.99,
    },
  },

  {
    name: "USS Ticonderoga",
    class: "Ticonderoga-class",
    nation: "United States Navy",
    designYear: 1980,
    displacement: { standard: 9000, fullLoad: 9600 },
    dimensions: { length: 173, beam: 16.8, draught: 10.2 },
    speed: 32.5,
    cruiseSpeed: 20,
    maxPowerPerEngineGroup: 25000, // 4× LM2500 gas turbines = 100,000 SHP total (25,000 SHP per turbine avg)
    numberOfShafts: 2,
    propulsionType: "cogag",
    hullForm: "displacement",
    vesselType: "cruiser",
    calculations: {
      lengthToBeamRatio: 10.31,
      displaceToLength: 2.31, // ∇ = 9600 / (0.01 * 173)^3
      froudeNumber: 0.245, // 32.5 / √(9.81 × 173) = 0.245
      powerToDisplacement: 11.11, // 100,000 SHP / 9,600t (conservatively estimated)
      resistanceFactor: 1.0,
    },
  },

  // ==================== 1990s MODERN DIESEL FRIGATES ====================
  {
    name: "La Fayette",
    class: "La Fayette-class",
    nation: "French Navy",
    designYear: 1990,
    displacement: { standard: 3200, fullLoad: 3800 },
    dimensions: { length: 125, beam: 15.4, draught: 4.1 },
    speed: 25,
    cruiseSpeed: 15,
    maxPowerPerEngineGroup: 10500, // 4× SEMT Pielstick diesel = 21,000 hp total (5,250 hp per engine)
    numberOfShafts: 2,
    propulsionType: "diesel",
    hullForm: "displacement",
    vesselType: "frigate",
    calculations: {
      lengthToBeamRatio: 8.12,
      displaceToLength: 2.24, // ∇ = 3800 / (0.01 * 125)^3
      froudeNumber: 0.224, // 25 / √(9.81 × 125) = 0.224
      powerToDisplacement: 5.53, // 21,000 hp / 3,800t (hp converted to equivalent SHP)
      resistanceFactor: 0.95, // modern stealth hull design reduces resistance
    },
  },

  // ==================== ALTERNATIVE 1960s DESTROYER ====================
  {
    name: "Scirocco",
    class: "Maestrale-class",
    nation: "Italian Navy",
    designYear: 1982,
    displacement: { standard: 2990, fullLoad: 3040 },
    dimensions: { length: 122.7, beam: 12.9, draught: 4.2 },
    speed: 33,
    cruiseSpeed: 21,
    maxPowerPerEngineGroup: 18390, // 2× GE LM2500 gas turbines (18,380 MW = ~24,648 hp each) + 2× diesel engines (4,044 MW = ~5,423 hp each)
    numberOfShafts: 2,
    propulsionType: "codog",
    hullForm: "displacement",
    vesselType: "frigate",
    calculations: {
      lengthToBeamRatio: 9.51,
      displaceToLength: 2.02, // ∇ = 3040 / (0.01 * 122.7)^3
      froudeNumber: 0.302, // 33 / √(9.81 × 122.7) = 0.302
      powerToDisplacement: 16.25, // ~49,300 total SHP / 3,040t
      resistanceFactor: 0.96,
    },
  },
];

/**
 * Analysis helper functions
 */

export function getVesselsByDisplacementRange(
  minDisplacement: number,
  maxDisplacement: number,
): VesselSpecification[] {
  return vessels1960s.filter(
    (v) => v.displacement.standard >= minDisplacement && v.displacement.standard <= maxDisplacement,
  );
}

export function getVesselsByPropulsion(propulsionType: string): VesselSpecification[] {
  return vessels1960s.filter((v) => v.propulsionType === propulsionType);
}

export function getVesselsByVesselType(vesselType: string): VesselSpecification[] {
  return vessels1960s.filter((v) => v.vesselType === vesselType);
}

export function calculateAveragePowerPerDisplacement(
  vessels: VesselSpecification[] = vessels1960s,
): number {
  const total = vessels.reduce((sum, v) => sum + v.calculations.powerToDisplacement, 0);
  return total / vessels.length;
}

export function getResistanceFactorByDisplacementAndHullForm(
  displacement: number,
  hullForm: "planing" | "displacement" = "displacement",
): number {
  if (hullForm === "planing" && displacement < 1500) {
    return 0.82; // planing effect: -18%
  } else if (displacement < 4000) {
    return 0.91; // medium displacement: -9%
  } else {
    return 1.0; // large displacement: no adjustment
  }
}

export function getEstimatedAdmiraltyCoefficientByYear(year: number, displacement: number): number {
  // Calculated for some 1960's vessels gives us an average of between 190 and 210
  // As vessels get more modern, the coefficient tends to increase due to better hull designs and propulsion
  // For vessels below a displacement of 1000t, sea effects and planing hulls reduce the coefficient, so we adjust downwards
  let baseCoefficient: number;
  if (year < 1950) {
    baseCoefficient = 190;
  } else if (year < 1960) {
    baseCoefficient = 195;
  } else if (year < 1970) {
    baseCoefficient = 200;
  } else {
    baseCoefficient = 210;
  }
  if (displacement < 1000) {
    baseCoefficient *= 0.85; // reduce for small vessels
  }
  return baseCoefficient;
}

export function calculateAggregatePropulsionEfficiency(
  propulsionType: propulsionType,
  shaftCount: number = 2,
  hullForm: "planing" | "displacement" = "displacement",
): number {
  // An efficiency model taking into account propulsion type, modified by shaft count and hull form
  const propulsionEfficiencyMap: Record<propulsionType, number> = {
    "steam-turbine": 0.88,
    diesel: 0.9,
    cogag: 0.85,
    cosag: 0.82,
    codag: 0.85,
    codad: 0.88,
    codog: 0.85,
    cogog: 0.85,
    iep: 0.93,
    nuclear: 0.9,
  } as const;

  // Calculate average efficiency for the given vessels
  const totalEfficiency = propulsionEfficiencyMap[propulsionType] || 0.85; // default to 0.85 if unknown

  // Adjust for shaft number. Propulsively, less shafts can mean less efficiency due to load distribution but more shafts can add drag. Ideal is 2 shafts so we can define a quadratic penalty.
  const shaftEfficiencyFactor = shaftCount === 2 ? 1.0 : 1.0 - Math.abs(2 - shaftCount) * 0.03; // 3% penalty per shaft away from 2

  return totalEfficiency * shaftEfficiencyFactor;
}

export function calculatePowerEstimate(
  displacement: number,
  speed: number,
  length: number,
  propulsionType: propulsionType = "steam-turbine",
): number {
  // Base formula: Admiralty method with hydrodynamic adjustments
  const froudeNumber = speed / Math.sqrt(9.81 * length);
  const resistanceFactor = getResistanceFactorByDisplacementAndHullForm(
    displacement,
    "displacement",
  );

  // Propulsion efficiency factors
  const efficiencyFactor = calculateAggregatePropulsionEfficiency(propulsionType);

  // Power estimate (simplified): Disp^(2/3) * Speed^3 * resistance_factor
  const estimatedPower =
    Math.pow(displacement, 2 / 3) * Math.pow(speed, 3) * resistanceFactor * efficiencyFactor * 0.8; // empirical scaling constant

  return estimatedPower;
}

export default vessels1960s;
