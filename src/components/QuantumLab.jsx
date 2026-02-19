import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import BellLocalHiddenVariableLab from "./HiddenLocaalVariable";
import QuantumWaveNonLocality from "./NonLocality.jsx";
import CHSHInequalityLab from "./CHSHinequlity.jsx";
import QuantumShellLab from "./QuantumNoVisulization.jsx";
import QuantumBosonHiggsPrticle from "./QuantumHiggsBoson";
import QuantumParticleAccelerator from "./QuantumLabAccelarator";
import LigoChirpSimulation from "./QuantumLabLIGOExperiment.jsx";

import "./QuantumLab.css";

/* =====================================================
   Quantum Side — Experiment Lab Shell
   ===================================================== */

export default function QuantumSideLab() {
  const navigate = useNavigate();

  /* ================= ACTIVE EXPERIMENT ================= */
  const [activeExperiment, setActiveExperiment] = useState("bell");

  /* ================= BELL ================= */
  const [thetaA, setThetaA] = useState(30);
  const [thetaB, setThetaB] = useState(60);

  const correlation =
    -Math.cos((2 * (thetaA - thetaB) * Math.PI) / 180);

  /* ================= WAVE ================= */
  const [waveKey, setWaveKey] = useState(0);

  /* ================= HIGGS ================= */
  const [higgsEnergy, setHiggsEnergy] = useState(125);
  const [higgsKey, setHiggsKey] = useState(0);

  /* ================= ACCELERATOR ================= */
  const [accSpeed, setAccSpeed] = useState(6);
  const [accEnergy, setAccEnergy] = useState(150);
  const [accKey, setAccKey] = useState(0);

  return (
    <div className="ql-root">

      {/* ================= LEFT SIDEBAR ================= */}
      <div className="ql-sidebar">
        <button
          className="ql-back-btn"
          onClick={() => navigate("/")}
        >
          ⬅ Back to Canvas
        </button>

        <h3 className="ql-title">Experiments</h3>

        <button
          className={`ql-exp-btn ${activeExperiment === "bell" ? "active" : ""}`}
          onClick={() => setActiveExperiment("bell")}
        >
          🧪 Bell Experiment
        </button>

        <button
          className={`ql-exp-btn ${activeExperiment === "wave" ? "active" : ""}`}
          onClick={() => setActiveExperiment("wave")}
        >
          🌊 Quantum Wave
        </button>

        <button
          className={`ql-exp-btn ${activeExperiment === "chsh" ? "active" : ""}`}
          onClick={() => setActiveExperiment("chsh")}
        >
          📐 CHSH Inequality
        </button>
        <button
        className={`ql-exp-btn ${activeExperiment === "ligo" ? "active" : ""}`}
        onClick={() => setActiveExperiment("ligo")}
        >
        🌌 Gravitational Waves (LIGO)
        </button>


        <button
          className={`ql-exp-btn ${activeExperiment === "no" ? "active" : ""}`}
          onClick={() => setActiveExperiment("no")}
        >
          🧪 Shell Model
        </button>

        <button
          className={`ql-exp-btn ${activeExperiment === "higgs" ? "active" : ""}`}
          onClick={() => setActiveExperiment("higgs")}
        >
          ⚛️ Higgs Boson
        </button>

        <button
          className={`ql-exp-btn ${activeExperiment === "accelerator" ? "active" : ""}`}
          onClick={() => setActiveExperiment("accelerator")}
        >
          🌀 Particle Accelerator
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
              Bell Experiment — Local Hidden Variables
            </div>
          </>
        )}

        {activeExperiment === "wave" && (
          <>
            <QuantumWaveNonLocality key={waveKey} />
            <div className="ql-overlay-title">
              Quantum Wave — Non Local Behavior
            </div>
          </>
        )}
        {activeExperiment === "ligo" && (
  <>
    <LigoChirpSimulation />
    <div className="ql-overlay-title">
      Gravitational Waves — LIGO Interferometer
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
            <QuantumShellLab />
            <div className="ql-overlay-title">
              Quantum Shell Model
            </div>
          </>
        )}

        {activeExperiment === "higgs" && (
          <>
            <QuantumBosonHiggsPrticle
              key={higgsKey}
              energy={higgsEnergy}
              trigger={higgsKey}
            />
            <div className="ql-overlay-title">
              Higgs Boson Production (~125 GeV)
            </div>
          </>
        )}

        {activeExperiment === "accelerator" && (
          <>
            <QuantumParticleAccelerator
              speed={accSpeed}
              energy={accEnergy}
              trigger={accKey}
            />
            <div className="ql-overlay-title">
              Circular Particle Accelerator
            </div>
          </>
        )}
      </div>

      {/* ================= RIGHT CONTROLS ================= */}
      <div className="ql-controls">
        <h3 className="ql-title green">Controls</h3>

        {/* ===== Bell ===== */}
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

        {/* ===== Wave ===== */}
        {activeExperiment === "wave" && (
          <>
            <div className="ql-info-box">
              Single quantum wave spreading non-locally.
            </div>

            <button
              className="ql-exp-btn"
              onClick={() => setWaveKey((k) => k + 1)}
            >
              🔄 Reset Wave
            </button>
          </>
        )}
        {activeExperiment === "ligo" && (
  <>
    <div className="ql-info-box">
      Laser interferometer detecting spacetime strain
      from black hole mergers.
      <br />
      Chirp signal increases in frequency & amplitude
      before merger.
    </div>
  </>
)}


        {/* ===== Higgs ===== */}
        {activeExperiment === "higgs" && (
          <>
            <div className="ql-control-group">
              <label>Collision Energy (GeV)</label>
              <input
                type="range"
                min="50"
                max="300"
                value={higgsEnergy}
                onChange={(e) => setHiggsEnergy(+e.target.value)}
              />
              <span>{higgsEnergy} GeV</span>
            </div>

            <div className="ql-info-box">
              Higgs production threshold ≈ 125 GeV.
              Higher energy increases probability.
            </div>

            <button
              className="ql-exp-btn"
              onClick={() => setHiggsKey((k) => k + 1)}
            >
              🚀 Run Collision
            </button>
          </>
        )}

        {/* ===== Accelerator ===== */}
        {activeExperiment === "accelerator" && (
          <>
            <div className="ql-control-group">
              <label>Beam Speed</label>
              <input
                type="range"
                min="1"
                max="20"
                value={accSpeed}
                onChange={(e) => setAccSpeed(+e.target.value)}
              />
              <span>{accSpeed}</span>
            </div>

            <div className="ql-control-group">
              <label>Collision Energy (GeV)</label>
              <input
                type="range"
                min="50"
                max="400"
                value={accEnergy}
                onChange={(e) => setAccEnergy(+e.target.value)}
              />
              <span>{accEnergy} GeV</span>
            </div>

            <button
              className="ql-exp-btn"
              onClick={() => setAccKey((k) => k + 1)}
            >
              🔄 Reset Accelerator
            </button>
          </>
        )}
      </div>
    </div>
  );
}
