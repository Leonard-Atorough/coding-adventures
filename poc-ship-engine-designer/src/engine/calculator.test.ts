/**
 * Unit tests for the engine calculation system
 */

import { describe, it, expect } from "vitest";
import { calculateEngineSystem, type EngineDesignInput } from "./calculator";

describe("Engine Calculator", () => {
  // Standard test ship: 5000-ton destroyer with average hull
  const baseInput: EngineDesignInput = {
    configType: "CODAG",
    desiredTopSpeed: 30,
    enginePriority: "balanced",
    shipDisplacement: 5000,
    hullDragCoefficient: 0.15,
    desiredCruisingSpeed: 18,
  };

  describe("Configuration Comparison", () => {
    it("should calculate CODAD engines correctly", () => {
      const result = calculateEngineSystem({
        ...baseInput,
        configType: "CODAD",
      });

      expect(result.configuration).toBe("CODAD");
      expect(result.totalEngineWeight).toBeGreaterThan(0);
      expect(result.maxPower).toBeGreaterThan(0);
      expect(result.mtbf).toBeGreaterThan(2000); // CODAD is very reliable
    });

    it("should calculate CODAG engines with higher power density", () => {
      const codad = calculateEngineSystem({
        ...baseInput,
        configType: "CODAD",
      });

      const codag = calculateEngineSystem({
        ...baseInput,
        configType: "CODAG",
      });

      // CODAG should have better power density (lighter for same power)
      expect(codag.totalEngineWeight).toBeLessThan(codad.totalEngineWeight);

      // But CODAG costs more
      expect(codag.totalEngineCost).toBeGreaterThan(codad.totalEngineCost);

      // CODAG should be less reliable
      expect(codag.mtbf).toBeLessThan(codad.mtbf);
    });

    it("should calculate ALL_GAS with excellent power but poor range", () => {
      const allGas = calculateEngineSystem({
        ...baseInput,
        configType: "GAS_TURBINE",
      });

      const allDiesel = calculateEngineSystem({
        ...baseInput,
        configType: "DIESEL",
      });

      // All-Gas should have excellent power-to-weight
      expect(allGas.totalEngineWeight).toBeLessThan(allDiesel.totalEngineWeight);

      // But terrible fuel economy and range
      expect(allGas.fuelConsumptionAtCruise).toBeGreaterThan(
        allDiesel.fuelConsumptionAtCruise * 1.5,
      );
      expect(allGas.maxRange).toBeLessThan(allDiesel.maxRange);

      // All-Gas is more expensive
      expect(allGas.totalEngineCost).toBeGreaterThan(allDiesel.totalEngineCost);

      // All-Gas is less reliable
      expect(allGas.mtbf).toBeLessThan(allDiesel.mtbf);
    });
  });

  describe("Priority Effects", () => {
    it("efficiency priority should reduce fuel consumption slightly", () => {
      const balanced = calculateEngineSystem({
        ...baseInput,
        enginePriority: "balanced",
      });

      const efficient = calculateEngineSystem({
        ...baseInput,
        enginePriority: "efficiency",
      });

      expect(efficient.fuelConsumptionAtFullPower).toBeLessThan(
        balanced.fuelConsumptionAtFullPower,
      );
    });

    it("power priority should increase max power", () => {
      const balanced = calculateEngineSystem({
        ...baseInput,
        enginePriority: "balanced",
      });

      const powerful = calculateEngineSystem({
        ...baseInput,
        enginePriority: "power",
      });

      expect(powerful.maxPower).toBeGreaterThan(balanced.maxPower);
    });

    it("reliability priority should increase MTBF", () => {
      const balanced = calculateEngineSystem({
        ...baseInput,
        enginePriority: "balanced",
      });

      const reliable = calculateEngineSystem({
        ...baseInput,
        enginePriority: "reliability",
      });

      expect(reliable.mtbf).toBeGreaterThan(balanced.mtbf);
    });
  });

  describe("Ship Size Effects", () => {
    it("larger ships should need more power", () => {
      const small = calculateEngineSystem({
        ...baseInput,
        shipDisplacement: 2000,
      });

      const large = calculateEngineSystem({
        ...baseInput,
        shipDisplacement: 10000,
      });

      expect(large.maxPower).toBeGreaterThan(small.maxPower);
      expect(large.totalEngineWeight).toBeGreaterThan(small.totalEngineWeight);
    });

    it("draggy ships should need more power", () => {
      const sleek = calculateEngineSystem({
        ...baseInput,
        hullDragCoefficient: 0.1,
      });

      const draggy = calculateEngineSystem({
        ...baseInput,
        hullDragCoefficient: 0.2,
      });

      expect(draggy.maxPower).toBeGreaterThan(sleek.maxPower);
    });
  });

  describe("Output Validation", () => {
    it("should have realistic values", () => {
      const result = calculateEngineSystem(baseInput);

      // Weight should be reasonable (1000-15000 tons for engine package)
      expect(result.totalEngineWeight).toBeGreaterThan(10);
      expect(result.totalEngineWeight).toBeLessThan(50000);

      // Cost should be reasonable (millions of credits)
      expect(result.totalEngineCost).toBeGreaterThan(10_000_000);
      expect(result.totalEngineCost).toBeLessThan(5_000_000_000);

      // Speed should be achievable (15-35 knots for warships)
      expect(result.maxSpeed).toBeGreaterThan(10);
      expect(result.maxSpeed).toBeLessThan(50);

      // Cruising speed should be less than max
      expect(result.cruisingSpeed).toBeLessThan(result.maxSpeed);

      // MTBF should be thousands of hours
      expect(result.mtbf).toBeGreaterThan(1000);
      expect(result.mtbf).toBeLessThan(20000);

      // All scores should be 0-100
      expect(result.accelerationRating).toBeGreaterThanOrEqual(0);
      expect(result.accelerationRating).toBeLessThanOrEqual(100);
      expect(result.heatSignature).toBeGreaterThanOrEqual(0);
      expect(result.heatSignature).toBeLessThanOrEqual(100);
      expect(result.complexityRating).toBeGreaterThanOrEqual(0);
      expect(result.complexityRating).toBeLessThanOrEqual(100);
    });

    it("should calculate non-zero fuel consumption", () => {
      const result = calculateEngineSystem(baseInput);

      expect(result.fuelConsumptionAtFullPower).toBeGreaterThan(0);
      expect(result.fuelConsumptionAtCruise).toBeGreaterThan(0);
      expect(result.fuelConsumptionAtCruise).toBeLessThan(result.fuelConsumptionAtFullPower);
    });

    it("should calculate positive range", () => {
      const result = calculateEngineSystem(baseInput);

      expect(result.maxRange).toBeGreaterThan(0);
    });
  });
});
