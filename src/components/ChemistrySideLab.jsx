import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import AcidBaseIndicatorLab from "./AcidBaseIndicatorLab";

import "./ChemLab.css";

/* ================= GLOBAL CANVAS SIZE ================= */
const GLOBAL_W = 1000;
const GLOBAL_H = 920;

export default function ChemLab() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("indicator");
  

  return (
    <div className="lab-root">
      {/* ================= LEFT PANEL ================= */}
      <div className="lab-panel">
        <div className="experiment-shell">

          <button
            className="panel-btn back-btn"
            onClick={() => navigate("/")}
          >
            ← Back to Canvas
          </button>

          <div className="lab-panel-title">CHEMISTRY LAB</div>

          <button
            className={`panel-btn ${mode === "indicator" ? "active" : ""}`}
            onClick={() => setMode("indicator")}
          >
            Acid–Base Indicator
          </button>

          

        </div>
      </div>

      {/* ================= CENTER VIEWPORT ================= */}
      <div className="lab-canvas-wrap">
        <div
          className="global-canvas-frame"
          style={{
            width: GLOBAL_W,
            height: GLOBAL_H
          }}
        >
          <div className="global-canvas-scale">
            {mode === "indicator" && <AcidBaseIndicatorLab />}
          </div>
        </div>

        <button className="lab-back" onClick={() => navigate("/")}>
          ← BACK
        </button>
      </div>
    </div>
  );
}
