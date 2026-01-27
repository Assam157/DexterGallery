 import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import BellLocalHiddenVariableLab from "./HiddenLocaalVariable";
import QuantumWaveNonLocality from "./NonLocality.jsx";
import CHSHInequalityLab from "./CHSHinequlity.jsx";
import QuantumShellLab from "./QuantumNoVisulization.jsx"

import "./QuantumLab.css";

/* =====================================================
   Quantum Side — Experiment Lab Shell
   ===================================================== */

export default function QuantumSideLab() {
  const navigate = useNavigate();

  /* ================= EXPERIMENT STATE ================= */
  const [activeExperiment, setActiveExperiment] = useState("bell");

  /* ================= BELL CONTROLS ================= */
  const [thetaA, setThetaA] = useState(30);
  const [thetaB, setThetaB] = useState(60);

  const correlation =
    -Math.cos((2 * (thetaA - thetaB) * Math.PI) / 180);

  /* ================= WAVE CONTROLS ================= */
  const [waveKey, setWaveKey] = useState(0); // reset trigger

  return (
    <div className="ql-root">
      {/* ================= LEFT PANEL ================= */}
      <div className="ql-sidebar">
        <button
          className="ql-back-btn"
          onClick={() => navigate("/")}
        >
          ⬅ Back to Canvas
        </button>

        <h3 className="ql-title">Experiments</h3>

        <button
          className={`ql-exp-btn ${
            activeExperiment === "bell" ? "active" : ""
          }`}
          onClick={() => setActiveExperiment("bell")}
        >
          🧪 Bell Experiment
        </button>

        <button
          className={`ql-exp-btn ${
            activeExperiment === "wave" ? "active" : ""
          }`}
          onClick={() => setActiveExperiment("wave")}
        >
          🌊 Quantum Wave Non-Locality
        </button>

         <button
  className={`ql-exp-btn ${
    activeExperiment === "chsh" ? "active" : ""
  }`}
  onClick={() => setActiveExperiment("chsh")}
>
  📐 CHSH Inequality
</button>
  <button
          className={`ql-exp-btn ${
            activeExperiment === "no" ? "active" : ""
          }`}
          onClick={() => setActiveExperiment("no")}
        >
          🧪  Quantum No Visualization
        </button>

      </div>

      {/* ================= CENTER PANEL ================= */}
      <div className="ql-center">
        {activeExperiment === "bell" && (
          <>
            <BellLocalHiddenVariableLab
              thetaA={thetaA}
              thetaB={thetaB}
            />
            <div className="ql-overlay-title">
              Bell Experiment — Local Hidden Variable Model
            </div>
          </>
        )}
        {activeExperiment === "chsh" && (
  <>
    <CHSHInequalityLab />
    <div className="ql-overlay-title">
      CHSH Inequality — Quantum Violation
    </div>
  </>
  
)}
  {activeExperiment === "no" && (
  <>
    <QuantumShellLab/>
    <div className="ql-overlay-title">
      CHSH Inequality — Quantum Violation
    </div>
  </>
  )}


        {activeExperiment === "wave" && (
          <>
            <QuantumWaveNonLocality key={waveKey} />
            <div className="ql-overlay-title">
              Quantum Wave Non-Locality — Single Slit Experiment
            </div>
          </>
        )}
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="ql-controls">
        <h3 className="ql-title green">Controls</h3>

        {/* -------- Bell Controls -------- */}
        {activeExperiment === "bell" && (
          <>
            <div className="ql-control-group">
              <label>Detector A Angle θ₁</label>
              <input
                type="range"
                min="0"
                max="180"
                value={thetaA}
                onChange={(e) => setThetaA(+e.target.value)}
              />
              <span>{thetaA}°</span>
            </div>

            <div className="ql-control-group">
              <label>Detector B Angle θ₂</label>
              <input
                type="range"
                min="0"
                max="180"
                value={thetaB}
                onChange={(e) => setThetaB(+e.target.value)}
              />
              <span>{thetaB}°</span>
            </div>

            <div className="ql-info-box">
              E = −cos(2(θ₁ − θ₂)) <br />
              <strong>{correlation.toFixed(3)}</strong>
            </div>
          </>
        )}

        {/* -------- Wave Controls -------- */}
        {activeExperiment === "wave" && (
          <>
            <div className="ql-info-box">
              A single quantum wave passes the slit and spreads
              non-locally across space. Measurement collapses the
              wave probabilistically.
            </div>

            <button
              className="ql-exp-btn"
              onClick={() => setWaveKey((k) => k + 1)}
            >
              🔄 Reset Wave
            </button>
          </>
        )}
      </div>
    </div>
  );
}
