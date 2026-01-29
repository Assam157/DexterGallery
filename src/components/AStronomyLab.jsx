import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PulsarView from "./PulsarView.jsx";
import "./RadiationDexterLab.css";

export default function AstronomyLab() {
  const navigate = useNavigate();

  /* ===== CONTROLS ===== */
  const [spin, setSpin] = useState(1.0);

  // primary slider (future-proof)
  const [activeSlider, setActiveSlider] = useState(0);

  /* ===== KEYBOARD ===== */
  useEffect(() => {
    function onKey(e) {
      // switch slider
      if (e.key === "q" || e.key === "Q" || e.key === "e" || e.key === "E") {
        setActiveSlider(0);
      }

      // adjust slider
      if (e.key === "a" || e.key === "A") {
        setSpin(v => Math.max(0.2, +(v - 0.05).toFixed(2)));
      }

      if (e.key === "d" || e.key === "D") {
        setSpin(v => Math.min(3, +(v + 0.05).toFixed(2)));
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="dexter-root">
      {/* ================= LEFT PANEL ================= */}
      <div className="control-panel">
        <h2>🌌 ASTRONOMY LAB</h2>

        <button className="active">
          Pulsar (Neutron Star)
        </button>

        <p style={{ fontSize: 13, opacity: 0.8 }}>
          Observe pulsed emission caused by rapid neutron star rotation.
        </p>

        <button style={{ marginTop: 20 }} onClick={() => navigate("/")}>
          ⬅ BACK TO CONSOLE
        </button>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="canvas-column">
        <PulsarView spin={spin} />

        {/* ===== CONTROL PANEL ===== */}
        <div className="energy-panel">
          {/* PRIMARY SELECT */}
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <button className="active">
              SPIN RATE
            </button>
          </div>

          <div className="energy-label">NEUTRON STAR SPIN</div>
          <div className="energy-value">{spin.toFixed(2)}×</div>

          <input
            className="energy-slider active"
            type="range"
            min="0.2"
            max="3"
            step="0.01"
            value={spin}
            onChange={(e) =>
              setSpin(+(+e.target.value).toFixed(2))
            }
          />

          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
            Adjust → <b>A / D</b>
          </div>
        </div>
      </div>
    </div>
  );
}
