import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ExperimentLayout.css"

/* ===============================
   GLOBAL CANVAS DIMENSIONS
   =============================== */
const W = 1900;
const H = 600;

const DiodeBiasLab = () => {
  const canvasRef = useRef(null);

  const [bias, setBias] = useState("forward");
  const navigate=useNavigate();
  const [orientation, setOrientation] = useState("normal"); // 👈 NEW
  const [voltage, setVoltage] = useState(0);

  // Diode parameters
  const Is = 0.000001;
  const Vt = 0.026;

  // Effective voltage based on orientation
  const effectiveVoltage =
    orientation === "normal" ? voltage : -voltage;

  // Compute current
  const getCurrent = (V) => {
    if (bias === "forward") {
      return Is * (Math.exp(V / Vt) - 1);
    } else {
      return -Is;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, W, H);

    // Axes
    ctx.strokeStyle = "#94a3b8";
    ctx.beginPath();
    ctx.moveTo(40, H / 2);
    ctx.lineTo(W - 10, H / 2);
    ctx.moveTo(40, 10);
    ctx.lineTo(40, H - 10);
    ctx.stroke();

    // Curve
    ctx.strokeStyle = "#22c55e";
    ctx.beginPath();

    for (let v = -1; v <= 1; v += 0.01) {
      const i = getCurrent(
        orientation === "normal" ? v : -v
      );
      const x = 40 + ((v + 1) / 2) * (W - 60);
      const y = H / 2 - i * 2000;

      if (v === -1) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();

    // Operating point
    const I = getCurrent(effectiveVoltage);
    const x = 40 + ((voltage + 1) / 2) * (W - 60);
    const y = H / 2 - I * 2000;

    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    // =======================================
// FIXED: Diode + Battery Circuit (Top-Right)
// =======================================

// Anchor position
const x0 = W - 190;
const y0 = 35;
const width = 130;
const height = 70;

ctx.strokeStyle = "#e5e7eb";
ctx.lineWidth = 2;
ctx.lineCap = "round";

// ---------- Top wire (left)
ctx.beginPath();
ctx.moveTo(x0, y0);
ctx.lineTo(x0 + 30, y0);
ctx.stroke();

// ---------- Diode (top branch)
ctx.beginPath();
if (orientation === "normal") {
  // ▶|
  ctx.moveTo(x0 + 30, y0 - 10);
  ctx.lineTo(x0 + 30, y0 + 10); // cathode bar

  ctx.moveTo(x0 + 30, y0 - 10);
  ctx.lineTo(x0 + 55, y0);
  ctx.lineTo(x0 + 30, y0 + 10);
} else {
  // |◀
  ctx.moveTo(x0 + 55, y0 - 10);
  ctx.lineTo(x0 + 55, y0 + 10); // cathode bar

  ctx.moveTo(x0 + 55, y0 - 10);
  ctx.lineTo(x0 + 30, y0);
  ctx.lineTo(x0 + 55, y0 + 10);
}
ctx.stroke();

// ---------- Top wire (right)
ctx.beginPath();
ctx.moveTo(x0 + 55, y0);
ctx.lineTo(x0 + width, y0);
ctx.stroke();

// ---------- Right vertical wire
ctx.beginPath();
ctx.moveTo(x0 + width, y0);
ctx.lineTo(x0 + width, y0 + height);
ctx.stroke();

// ---------- Battery (bottom branch)
const by = y0 + height;
ctx.beginPath();

// Long plate (+)
ctx.moveTo(x0 + 45, by - 28);
ctx.lineTo(x0 + 45, by+12);

// Short plate (−)
ctx.moveTo(x0 + 58, by - 20);
ctx.lineTo(x0 + 58, by+12);

ctx.stroke();

// ---------- Bottom wire
ctx.beginPath();
ctx.moveTo(x0 + width, by);
ctx.lineTo(x0, by);
ctx.stroke();

// ---------- Left vertical wire
ctx.beginPath();
ctx.moveTo(x0, by);
ctx.lineTo(x0, y0);
ctx.stroke();

// ---------- Labels
ctx.fillStyle = "#94a3b8";
ctx.font = "12px Arial";
ctx.fillText("+", x0 + 38, by + 14);
ctx.fillText("−", x0 + 60, by + 14);

  }, [voltage, bias, orientation]);
  useEffect(() => {
  const handleKeyDown = (e) => {
    setVoltage((prev) => {
      let next = prev;

      if (e.key === "a" || e.key === "A") {
        next = prev - 0.01;
      }
      if (e.key === "d" || e.key === "D") {
        next = prev + 0.01;
      }

      // Clamp voltage
      if (next > 1) next = 1;
      if (next < -1) next = -1;

      return parseFloat(next.toFixed(2));
    });
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);



  return (
    
 
    <div style={styles.lab}>
      <div style={{ background: "#020617", padding: "16px" }}>
      {/* 🔙 Return */}
      <button
        style={{ marginBottom: 10 }}
        onClick={() => navigate("/semiconductor")}
      >
        ⬅ Return to Semiconductor Lab
      </button>
      </div>
      <h2>🔬 Semiconductor Lab — PN Diode</h2>

      {/* Bias Toggle */}
      <button
        onClick={() =>
          setBias(bias === "forward" ? "reverse" : "forward")
        }
        style={{
          ...styles.toggle,
          background: bias === "forward" ? "#22c55e" : "#ef4444",
        }}
      >
        {bias === "forward" ? "Forward Bias" : "Reverse Bias"}
      </button>

      {/* Orientation Toggle */}
      <button
        onClick={() =>
          setOrientation(
            orientation === "normal" ? "flipped" : "normal"
          )
        }
        style={{
          ...styles.toggle,
          background: "#0ea5e9",
        }}
      >
        Orientation: {orientation === "normal" ? "▶|" : "|◀"}
      </button>

      {/* Voltage Slider */}
      <div style={styles.sliderBox}>
        <label>Voltage (V): {voltage.toFixed(2)}</label>
        <input
          type="range"
          min={-1}
          max={1}
          step="0.01"
          value={voltage}
          onChange={(e) => setVoltage(parseFloat(e.target.value))}
        />
      </div>

      {/* Diode Symbol */}
      <div style={styles.diode}>
        <div style={styles.terminal} />
        <span style={{ fontSize: "28px" }}>
          {orientation === "normal" ? "▶|" : "|◀"}
        </span>
        <div style={styles.terminal} />
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={styles.canvas}
      />
    </div>
  );
};

const styles = {
  lab: {
    background: "#020617",
    color: "#e5e7eb",
    padding: "20px",
    borderRadius: "12px",
    width: "fit-content",
    fontFamily: "Arial",
  },
  toggle: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    marginBottom: "10px",
    marginRight: "6px",
  },
  sliderBox: {
    margin: "10px 0",
  },
  diode: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px",
  },
  terminal: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    background: "#64748b",
  },
  canvas: {
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "8px",
  },
};

export default DiodeBiasLab;
