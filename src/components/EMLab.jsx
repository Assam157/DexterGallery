import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import WireExperiment from "./WireExperiment";
import AtomExperiment from "./AtomExcitation";
import BandGapExperiment from "./BandgapExperiment";
import FaradayExperiment from "./FaradayExperiment";
import WaveInterferenceExperiment from "./WaveExperiment";
import VICircuit from "./VLCCircuit";
import OrbitalBoxes from "./ElectronBoxes";

import "./EMLab.css";
 

/* ================= GLOBAL CANVAS SIZE ================= */
const GLOBAL_W = 1000;
const GLOBAL_H = 920;

export default function EMLab() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("wire");

 return (
  <div className="lab-vertical-root">

    {/* ================= TOP PANEL ================= */}
     <div className="lab-top-panel">

  {/* 🔙 BACK TO CANVAS */}
  <button
    className="panel-btn back-btn"
    onClick={() => navigate("/")}
  >
    ⬅ Back to Canvas
  </button>

  <button className={`panel-btn ${mode === "wire" ? "active" : ""}`} onClick={() => setMode("wire")}>
    Current-Carrying Wires
  </button>

  <button className={`panel-btn ${mode === "atom" ? "active" : ""}`} onClick={() => setMode("atom")}>
    Electron Excitation
  </button>

  <button className={`panel-btn ${mode === "bandgap" ? "active" : ""}`} onClick={() => setMode("bandgap")}>
    Band Gap Transitions
  </button>

  <button className={`panel-btn ${mode === "faraday" ? "active" : ""}`} onClick={() => setMode("faraday")}>
    Faraday Induction
  </button>

  <button className={`panel-btn ${mode === "wave" ? "active" : ""}`} onClick={() => setMode("wave")}>
    Wave Experiment
  </button>

  <button className={`panel-btn ${mode === "vi" ? "active" : ""}`} onClick={() => setMode("vi")}>
    V–I Characteristics
  </button>

  <button className={`panel-btn ${mode === "boxes" ? "active" : ""}`} onClick={() => setMode("boxes")}>
    Electron Boxes
  </button>
</div>


    {/* ================= CANVAS ================= */}
    <div className="lab-canvas-full">
      {mode === "wire" && <WireExperiment />}
      {mode === "atom" && <AtomExperiment />}
      {mode === "bandgap" && <BandGapExperiment />}
      {mode === "faraday" && <FaradayExperiment />}
      {mode === "wave" && <WaveInterferenceExperiment />}
      {mode === "vi" && <VICircuit />}
      {mode === "boxes" && <OrbitalBoxes />}
    </div>

    {/* ================= BOTTOM PANEL (SLIDERS ONLY) ================= */}
    <div className="lab-bottom-panel">
      {/* Each experiment renders its OWN sliders here */}
    </div>

  </div>
);



}
