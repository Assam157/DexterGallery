import React, { useState } from "react";
import "./ChemLab.css";

/* ===== Indicator color logic ===== */
const indicators = {
  litmus: pH => (pH < 7 ? "#ff4444" : "#4444ff"),
  phenolphthalein: pH => (pH < 8.2 ? "#ffffff" : "#ff66cc"),
  methylOrange: pH =>
    pH < 3.1 ? "#ff4444" : pH > 4.4 ? "#ffff66" : "#ff8844"
};
function Ripple({ delay = 0 }) {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        width: 28,
        height: 8,
        border: "2px solid rgba(255,255,255,0.8)",
        borderRadius: "50%",
        transform: "translateX(-50%)",
        animation: `ripple 1.6s ease-out ${delay}ms infinite`
      }}
    />
  );
}

/* ===== pH calculation ===== */
function calculatePH(acid, base) {
  const total = acid + base;
  if (total === 0) return 7;

  const diff = acid - base;
  if (diff === 0) return 7;

  if (diff > 0) return Math.max(0, -Math.log10(diff / total));
  return Math.min(14, 14 + Math.log10(-diff / total));
}

export default function AcidBaseCylindricalPipeLab() {
  const [acid, setAcid] = useState(40);
  const [base, setBase] = useState(40);
  const [indicator, setIndicator] = useState("litmus");

  const [acidDropKey, setAcidDropKey] = useState(0);
  const [baseDropKey, setBaseDropKey] = useState(0);

  const pH = calculatePH(acid, base);
  const indicatorColor = indicators[indicator](pH);

  return (
    <div style={{ padding: 30, color: "#fff" }}>
      <h2>Acid–Base Mixing (Cylindrical Pipe Model)</h2>

      {/* ===== APPARATUS ===== */}
      <div style={{ position: "relative", width: 600, height: 420, margin: "0 auto" }}>

        {/* BASE LINE */}
        <div style={{ position: "absolute", bottom: 20, width: "100%", height: 4, background: "#555" }} />

        {/* CONTAINERS */}
        <Container x={80} label="Acid" color="#ff4444" level={acid} />
        <Container x={440} label="Base" color="#4444ff" level={base} />

        {/* VERTICAL PIPES */}
        <Pipe x={120} />
        <Pipe x={480} />

        {/* DROPS */}
        {/* Acid drop → move RIGHT */}
<Drop key={acidDropKey} x={255} color="#ff4444" />

{/* Base drop → move LEFT */}
<Drop key={baseDropKey} x={325} color="#4444ff" />

        {/* HORIZONTAL PIPES */}
        <HorizontalPipe x={120} y={50} />
        <HorizontalPipe x={362} y={50} />

        {/* FINAL TUBE */}

     {/* FINAL TUBE */}
<div
  style={{
    position: "absolute",
    left: "50%",
    bottom: 24,
    transform: "translateX(-50%)",
    width: 120,
    height: 260,
    border: "3px solid #aaa",
    borderRadius: "0 0 25px 25px",
    background: "rgba(255,255,255,0.03)",
    overflow: "hidden"
  }}
>
  {/* WHITE LIQUID */}
  <div
    style={{
      position: "absolute",
      bottom: 0,
      height: "70%",
      width: "100%",
      background: "rgba(255,255,255,0.85)"
    }}
  />

  {/* LIQUID SURFACE (RIPPLES) */}
  <div
    style={{
      position: "absolute",
      bottom: "70%",
      width: "100%",
      height: 0,
      pointerEvents: "none"
    }}
  >
    <Ripple />
    <Ripple delay={300} />
  </div>

  {/* FLOATING INDICATOR */}
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: "55%",
      width: 12,
      height: 28,
      background: indicatorColor,
      transform: "translateX(-50%)",
      animation: "float 3s ease-in-out infinite",
      boxShadow: `0 0 10px ${indicatorColor}`,
      borderRadius: 2
    }}
  />

  {/* pH LABEL */}
  <div
    style={{
      position: "absolute",
      top: 6,
      width: "100%",
      textAlign: "center",
      fontSize: 14
    }}
  >
    pH = {pH.toFixed(2)}
  </div>
 

          {/* FLOATING INDICATOR */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "55%",
              width: 12,
              height: 28,
              background: indicatorColor,
              transform: "translateX(-50%)",
              animation: "float 3s ease-in-out infinite",
              boxShadow: `0 0 10px ${indicatorColor}`,
              borderRadius: 2
            }}
          />

          <div style={{ position: "absolute", top: 6, width: "100%", textAlign: "center", fontSize: 14 }}>
            pH = {pH.toFixed(2)}
          </div>
        </div>

        {/* PH DIAL TAB */}
        <PHMeter pH={pH} color={indicatorColor} />
      </div>

      {/* CONTROLS */}
      <div style={{ maxWidth: 420, margin: "30px auto 0" }}>
        <label>Acid amount: <b>{acid}</b></label>
        <input
          type="range"
          min="0"
          max="100"
          value={acid}
          onChange={e => {
            setAcid(+e.target.value);
            setAcidDropKey(k => k + 1);
          }}
        />

        <label style={{ marginTop: 10, display: "block" }}>
          Base amount: <b>{base}</b>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={base}
          onChange={e => {
            setBase(+e.target.value);
            setBaseDropKey(k => k + 1);
          }}
        />

        <div style={{ marginTop: 15 }}>
          <label>Indicator:</label>
          <select value={indicator} onChange={e => setIndicator(e.target.value)}>
            <option value="litmus">Litmus</option>
            <option value="phenolphthalein">Phenolphthalein</option>
            <option value="methylOrange">Methyl Orange</option>
          </select>
        </div>
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes float {
          0% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -12px); }
          100% { transform: translate(-50%, 0); }
        }

        @keyframes drop {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(260px) scale(0.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ===== COMPONENTS ===== */

function Container({ x, label, color, level }) {
  return (
    <div style={{ position: "absolute", left: x, bottom: 24, textAlign: "center" }}>
      <div
        style={{
          width: 80,
          height: 200,
          border: "3px solid #aaa",
          borderRadius: "0 0 20px 20px",
          background: "#111",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", inset: 3, borderRadius: "0 0 16px 16px", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: `${level}%`,
              background: color,
              transition: "height 0.3s ease"
            }}
          />
        </div>
      </div>
      <div style={{ marginTop: 6 }}>{label}</div>
    </div>
  );
}

function Pipe({ x }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 60,
        width: 14,
        height: 140,
        background: "linear-gradient(90deg,#555,#aaa,#555)",
        borderRadius: 7
      }}
    />
  );
}

function HorizontalPipe({ x, y, length = 130 }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: length,
        height: 14,
        background: "linear-gradient(180deg,#555,#aaa,#555)",
        borderRadius: 7
      }}
    />
  );
}

function Drop({ x, color }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 80,
        width: 10,
        height: 10,
        background: color,
        borderRadius: "50%",
        animation: "drop 1.2s ease-in forwards"
      }}
    />
  );
}

function PHMeter({ pH, color }) {
  return (
    <div
      style={{
        position: "absolute",
        right: -120,
        top: 40,
        width: 180,
        padding: 14,
        background: "#0b1225",
        borderRadius: 14,
        border: "1px solid #2a6cff",
        boxShadow: "0 0 18px rgba(42,108,255,0.3)",
        textAlign: "center"
      }}
    >
      <div style={{ fontSize: 13, color: "#aaa" }}>pH Meter</div>

      <div
        style={{
          position: "relative",
          width: 120,
          height: 120,
          margin: "12px auto",
          borderRadius: "50%",
          background: "#111",
          border: "4px solid #555"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 14,
            borderRadius: "50%",
            background: color,
            opacity: 0.8
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 2,
            height: 50,
            background: "#fff",
            top: 10,
            left: "50%",
            transformOrigin: "bottom center",
            transform: `rotate(${(pH / 14) * 180 - 90}deg) translateX(-50%)`
          }}
        />
      </div>

      <div>pH = <b>{pH.toFixed(2)}</b></div>
    </div>
  );
}
