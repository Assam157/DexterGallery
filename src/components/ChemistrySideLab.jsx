 import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AcidBaseCylindricalPipeLab from "./AcidBaseIndicatorLab";
import "./ChemLab.css";

/* ================= GLOBAL CANVAS SIZE ================= */
const GLOBAL_W = 1200;
const GLOBAL_H = 920;

export default function ChemLab() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("pipe");

  return (
    <div className="lab-root">
      {/* ================= LEFT PANEL ================= */}
      <div className="lab-panel">
        <div className="experiment-shell">
          

          <div className="lab-panel-title">CHEMISTRY LAB</div>

          <button
            className={`panel-btn ${mode === "pipe" ? "active" : ""}`}
            onClick={() => setMode("pipe")}
          >
            🧪 Acid–Base Cylindrical Pipe
          </button>

           
        </div>
      </div>

      {/* ================= CENTER VIEWPORT ================= */}
      <div className="lab-canvas-wrap">
        <div
          className="global-canvas-frame"
          style={{
            width: GLOBAL_W*2,
            height: GLOBAL_H*2,
            overflow: "auto",
            background: "linear-gradient(145deg, #0a0f1e 0%, #070b14 100%)"
          }}
        >
          <div className="global-canvas-scale">
            {mode === "pipe" && <AcidBaseCylindricalPipeLab />}
          </div>
        </div>

        <button className="lab-back" onClick={() => navigate("/")}>
          ← BACK
        </button>
      </div>
    </div>
  );
}