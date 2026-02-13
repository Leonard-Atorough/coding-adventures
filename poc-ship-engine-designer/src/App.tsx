import { useState } from "react";
import {
  calculateEngineSystem,
  formatEngineOutput,
  type EngineDesignInput,
  type EngineSystemOutput,
} from "./engine/calculator";
import { CONFIGURATIONS } from "./engine/configurations";
import "./App.css";

function App() {
  const [input, setInput] = useState<EngineDesignInput>({
    configType: "CODAG",
    desiredTopSpeed: 30,
    desiredCruisingSpeed: 0,
    enginePriority: "balanced",
    shipDisplacement: 5000,
    hullDragCoefficient: 0.15,
    hullType: "frigate",
  });

  const [results, setResults] = useState<EngineSystemOutput | null>(null);
  const [comparisonResults, setComparisonResults] = useState<EngineSystemOutput[]>([]);

  const handleCalculate = () => {
    const output = calculateEngineSystem(input);
    setResults(output);
  };

  const handleCompare = () => {
    const allConfigs = Object.keys(CONFIGURATIONS) as Array<keyof typeof CONFIGURATIONS>;
    const comparisons = allConfigs.map((configId) =>
      calculateEngineSystem({
        ...input,
        configType: configId,
      }),
    );
    setComparisonResults(comparisons);
  };

  return (
    <div className="app">
      <header>
        <h1>Ship Engine Designer POC</h1>
        <p>Select configuration and ship parameters to calculate engine system properties</p>
      </header>

      <main>
        <section className="input-panel">
          <h2>Engine Configuration</h2>

          <fieldset>
            <legend>Hull Type</legend>
            <select
              value={input.hullType}
              onChange={(e) => setInput({ ...input, hullType: e.target.value as any })}
            >
              <option value="corvette">Corvette</option>
              <option value="frigate">Frigate</option>
              <option value="destroyer">Destroyer</option>
              <option value="cruiser">Cruiser</option>
              <option value="carrier">Carrier</option>
            </select>
          </fieldset>

          <fieldset>
            <legend>Configuration Type</legend>
            <select
              value={input.configType}
              onChange={(e) => setInput({ ...input, configType: e.target.value as any })}
            >
              {Object.entries(CONFIGURATIONS).map(([id, config]) => (
                <option key={id} value={id}>
                  {config.displayName} - {config.description}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset>
            <legend>Ship Parameters</legend>
            <label>
              Displacement (tons):
              <input
                type="number"
                value={input.shipDisplacement}
                onChange={(e) => setInput({ ...input, shipDisplacement: Number(e.target.value) })}
                min="100"
                max="100000"
                step="100"
              />
            </label>

            <label>
              Hull Drag Coefficient (0-1):
              <input
                type="number"
                value={input.hullDragCoefficient}
                onChange={(e) =>
                  setInput({ ...input, hullDragCoefficient: Number(e.target.value) })
                }
                min="0.05"
                max="0.3"
                step="0.01"
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>Performance Target</legend>
            <label>
              Desired Top Speed (knots):
              <input
                type="number"
                value={input.desiredTopSpeed}
                onChange={(e) => setInput({ ...input, desiredTopSpeed: Number(e.target.value) })}
                min="10"
                max="50"
                step="1"
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>Cruise Performance Target</legend>
            <label>
              Desired Cruise Speed (knots):
              <input
                type="number"
                value={input.desiredCruisingSpeed || 0}
                onChange={(e) =>
                  setInput({
                    ...input,
                    desiredCruisingSpeed: Number(e.target.value),
                  })
                }
                min="0"
                max={input.desiredTopSpeed - 1}
                step="1"
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>Engine Priority</legend>
            {(["efficiency", "power", "reliability", "balanced"] as const).map((priority) => (
              <label key={priority}>
                <input
                  type="radio"
                  name="priority"
                  value={priority}
                  checked={input.enginePriority === priority}
                  onChange={(e) =>
                    setInput({
                      ...input,
                      enginePriority: e.target.value as any,
                    })
                  }
                />
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </label>
            ))}
          </fieldset>

          <div className="button-group">
            <button onClick={handleCalculate} className="btn btn-primary">
              Calculate
            </button>
            <button onClick={handleCompare} className="btn btn-secondary">
              Compare All
            </button>
          </div>
        </section>

        {results && (
          <section className="results-panel">
            <h2>Results</h2>
            <pre>{formatEngineOutput(results)}</pre>

            <div className="metrics-grid">
              <div className="metric">
                <span className="label">Configuration</span>
                <span className="value">{results.configuration}</span>
              </div>
              <div className="metric">
                <span className="label">Max Speed</span>
                <span className="value">{results.maxSpeed.toFixed(1)} knots</span>
              </div>
              <div className="metric">
                <span className="label">Engine Weight</span>
                <span className="value">{results.totalEngineWeight.toFixed(1)} tons</span>
              </div>
              <div className="metric">
                <span className="label">Cost</span>
                <span className="value">{results.totalEngineCost.toLocaleString()}</span>
              </div>
              <div className="metric">
                <span className="label">Max Range</span>
                <span className="value">{results.maxRange.toFixed(0)} nm</span>
              </div>
              <div className="metric">
                <span className="label">MTBF</span>
                <span className="value">{results.mtbf.toFixed(0)} hrs</span>
              </div>
            </div>
          </section>
        )}

        {comparisonResults.length > 0 && (
          <section className="comparison-panel">
            <h2>Configuration Comparison</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Configuration</th>
                  <th>Weight (tons)</th>
                  <th>Cost (credits)</th>
                  <th>Max Speed (knots)</th>
                  <th>Range (nm)</th>
                  <th>MTBF (hrs)</th>
                  <th>Fuel (full power)</th>
                </tr>
              </thead>
              <tbody>
                {comparisonResults.map((result) => (
                  <tr key={result.configuration}>
                    <td>{result.configuration}</td>
                    <td>{result.totalEngineWeight.toFixed(1)}</td>
                    <td>{(result.totalEngineCost / 1_000_000).toFixed(1)}M</td>
                    <td>{result.maxSpeed.toFixed(1)}</td>
                    <td>{result.maxRange.toFixed(0)}</td>
                    <td>{result.mtbf.toFixed(0)}</td>
                    <td>{result.fuelConsumptionAtFullPower.toFixed(2)} t/h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
