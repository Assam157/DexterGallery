import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";

import DipoleAntenna from "./antenna/DipoleLab.jsx";
import RadiationPattern from "./antenna/RadiationPattern.jsx";
import YagiUdaAntenna from "./antenna/YagiUdaAntenna.jsx";
import ParabolicDish from "./antenna/ParabolicDish.jsx";
import PhasedArray from "./antenna/PhasedArray.jsx";
import SignalTransmission from "./antenna/SignalTransmission.jsx";
import FrequencyWavelength from "./antenna/FrequencyWavelength.jsx";
import Polarization from "./antenna/Polarization.jsx";

import "./AntennaLab.css";

/* -------------------------------------------------------------------------- */
/*                              Static configuration                          */
/* -------------------------------------------------------------------------- */

const EXPERIMENTS = [
  { id: "dipole", name: "📡 Dipole Antenna" },
  { id: "pattern", name: "📈 Radiation Pattern" },
  { id: "yagi", name: "📶 Yagi-Uda Antenna" },
  { id: "dish", name: "🛰️ Parabolic Dish" },
  { id: "array", name: "🎯 Phased Array" },
  { id: "transmission", name: "〰️ Signal Transmission" },
  { id: "frequency", name: "🌊 Frequency & Wavelength" },
  { id: "polarization", name: "🧭 Polarization" },
];

const VIEWS = {
  dipole: DipoleAntenna,
  pattern: RadiationPattern,
  yagi: YagiUdaAntenna,
  dish: ParabolicDish,
  array: PhasedArray,
  transmission: SignalTransmission,
  frequency: FrequencyWavelength,
  polarization: Polarization,
};

const TITLES = Object.fromEntries(
  EXPERIMENTS.map(({ id, name }) => [id, name])
);

 

const DEFAULTS = {
  frequency: 100,
  length: 1.5,
  power: 70,
  angle: 0,
  gain: 8,
  elements: 8,
  phase: 25,
  polarization: "vertical",
};

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export default function AntennaLab() {
  const navigate = useNavigate();

  const [active, setActive] = useState("dipole");
  const [settings, setSettings] = useState(DEFAULTS);
  const [paused, setPaused] = useState(false);

  // Curried updater: update("frequency")(value)
  const update = (key) => (value) =>
    setSettings((current) => ({ ...current, [key]: value }));

  const { frequency, angle, elements, polarization } = settings;

  const wavelength = 300 / frequency;

  const ActiveView = VIEWS[active] ?? VIEWS.dipole;

  // Which control groups are relevant to the current experiment.
  const showsAntennaControls =
    active === "dipole" || active === "transmission";
  const showsBeamControls =
    active === "pattern" || active === "yagi" || active === "dish";

  const handleReset = () => {
    setSettings(DEFAULTS);
    setPaused(false);
  };

  return (
    <div className="antenna-root">
      {/* LEFT SIDEBAR */}
      <aside className="antenna-sidebar">
        <button
          type="button"
          className="antenna-back"
          onClick={() => navigate("/")}
        >
          ← Back to Console
        </button>

        <h2>📡 ANTENNA LAB</h2>

        <p className="antenna-muted">RF · ELECTROMAGNETICS · WAVES</p>

        {EXPERIMENTS.map((experiment) => (
          <button
            type="button"
            key={experiment.id}
            className={`antenna-exp-btn ${
              active === experiment.id ? "active" : ""
            }`}
            aria-pressed={active === experiment.id}
            onClick={() => setActive(experiment.id)}
          >
            {experiment.name}
          </button>
        ))}

        <div className="antenna-side-note">
          DEXTERS LAB
          <br />
          Interactive RF Experiments
        </div>
      </aside>

      {/* MAIN SIMULATION */}
      <main className="antenna-stage">
        <header className="antenna-stage-header">
          <div>
            <span className="antenna-eyebrow">
              DEXTERS LAB / ELECTROMAGNETICS
            </span>
            <h1>{TITLES[active]}</h1>
          </div>

          <button
            type="button"
            className="antenna-pause"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? "▶ Resume Animation" : "⏸ Pause Animation"}
          </button>
        </header>

        <section className="antenna-visual">
          <ActiveView {...settings} paused={paused} />
        </section>

        
      </main>

      {/* RIGHT CONTROL PANEL */}
      <aside className="antenna-controls">
        <h2>🎛 CONTROLS</h2>

        {showsAntennaControls && (
          <>
            <Slider
              label="Frequency"
              value={settings.frequency}
              min={10}
              max={1000}
              step={10}
              unit=" MHz"
              set={update("frequency")}
            />

            <Slider
              label="Antenna Length"
              value={settings.length}
              min={0.25}
              max={3}
              step={0.05}
              unit=" m"
              set={update("length")}
            />

            <Slider
              label="Transmit Power"
              value={settings.power}
              min={10}
              max={100}
              step={5}
              unit="%"
              set={update("power")}
            />
          </>
        )}

        {showsBeamControls && (
          <>
            <Slider
              label="Beam Direction"
              value={settings.angle}
              min={-90}
              max={90}
              step={5}
              unit="°"
              set={update("angle")}
            />

            <Slider
              label="Relative Gain"
              value={settings.gain}
              min={1}
              max={20}
              step={1}
              unit=""
              set={update("gain")}
            />
          </>
        )}

        {active === "yagi" && (
          <Slider
            label="Antenna Elements"
            value={elements}
            min={3}
            max={12}
            step={1}
            unit=""
            set={update("elements")}
          />
        )}

        {active === "array" && (
          <>
            <Slider
              label="Array Elements"
              value={elements}
              min={2}
              max={16}
              step={1}
              unit=""
              set={update("elements")}
            />

            <Slider
              label="Phase Difference"
              value={settings.phase}
              min={-180}
              max={180}
              step={5}
              unit="°"
              set={update("phase")}
            />

            <Slider
              label="Steering Angle"
              value={angle}
              min={-90}
              max={90}
              step={5}
              unit="°"
              set={update("angle")}
            />
          </>
        )}

        {active === "frequency" && (
          <Slider
            label="Frequency"
            value={frequency}
            min={10}
            max={1000}
            step={10}
            unit=" MHz"
            set={update("frequency")}
          />
        )}

        {active === "polarization" && (
          <div className="antenna-control-group">
            <label htmlFor="antenna-polarization">Polarization</label>

            <select
              id="antenna-polarization"
              value={polarization}
              onChange={(event) => update("polarization")(event.target.value)}
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
              <option value="circular">Circular (conceptual)</option>
            </select>
          </div>
        )}

        <div className="antenna-readout">
          <span>Frequency</span>
          <strong>{frequency} MHz</strong>

          <span>Wavelength</span>
          <strong>{wavelength.toFixed(3)} m</strong>

          <span>Half-Wavelength</span>
          <strong>{(wavelength / 2).toFixed(3)} m</strong>
        </div>

        <p className="antenna-footnote">
          Wavelength assumes free-space propagation. Radiation visualizations
          are illustrative, not validated antenna-design calculations.
        </p>

        <button
          type="button"
          className="antenna-reset"
          onClick={handleReset}
        >
          ↻ RESET EXPERIMENT
        </button>
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Sub-components                              */
/* -------------------------------------------------------------------------- */

function Slider({ label, value, min, max, step, unit = "", set }) {
  const id = useId();

  return (
    <div className="antenna-control-group">
      <div className="antenna-slider-label">
        <label htmlFor={id}>{label}</label>
        <strong>
          {value}
          {unit}
        </strong>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => set(Number(event.target.value))}
      />

      <div className="antenna-range">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}