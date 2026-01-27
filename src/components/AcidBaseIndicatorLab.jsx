import React, { useState,useEffect } from "react";
import "./ChemLab.css"

/* ===== Indicator color logic ===== */
const indicators = {
  litmus: pH => (pH < 7 ? "#ff4444" : "#4444ff"),
  phenolphthalein: pH => (pH < 8.2 ? "#ffffff" : "#ff66cc"),
  methylOrange: pH =>
    pH < 3.1 ? "#ff4444" : pH > 4.4 ? "#ffff66" : "#ff8844"
};

/* ===== pH calculation (strong acid + strong base) ===== */
function calculatePH(acid, base) {
  const total = acid + base;
  if (total === 0) return 7;

  const diff = acid - base;
  if (diff === 0) return 7;

  if (diff > 0) return Math.max(0, -Math.log10(diff / total));
  return Math.min(14, 14 + Math.log10((-diff) / total));
}

export default function AcidBaseCylindricalPipeLab() {
  const [acid, setAcid] = useState(40);
  const [base, setBase] = useState(40);
  const [activeSlider, setActiveSlider] = useState("acid"); 
// "acid" | "base"

  const [indicator, setIndicator] = useState("litmus");

  const pH = calculatePH(acid, base);
  const indicatorColor = indicators[indicator](pH);
 useEffect(() => {
  const handleKeyDown = (e) => {
    if (!["a", "A", "d", "D"].includes(e.key)) return;

    const delta = e.key.toLowerCase() === "a" ? -1 : 1;

    if (activeSlider === "acid") {
      setAcid(v => Math.min(100, Math.max(0, v + delta)));
    }

    if (activeSlider === "base") {
      setBase(v => Math.min(100, Math.max(0, v + delta)));
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [activeSlider]);



  return (
  <div style={{ padding: 30, color: "#fff" }}>
    <h2>Acid–Base Mixing (Cylindrical Pipe Model)</h2>

    {/* ===== APPARATUS ===== */}
    <div
      style={{
        position: "relative",
        width: 600,
        height: 420,
        margin: "0 auto"
      }}
    >
      {/* ===== BASE LINE ===== */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 0,
          width: "100%",
          height: 4,
          background: "#555"
        }}
      />

      {/* ===== ACID CONTAINER ===== */}
      <Container x={80} label="Acid" color="#ff4444" level={acid} />

      {/* ===== BASE CONTAINER ===== */}
      <Container x={440} label="Base" color="#4444ff" level={base} />

      {/* ===== PIPES ===== */}
      <Pipe x={120} />
      <Pipe x={480} />
      <Pipe x={500} offsetX={-160} />
      <Pipe x={500} offsetX={-260} />
      <HorizontalPipe x={120} y={50} />
      <HorizontalPipe x={350} y={50} />

      {/* ===== FINAL TUBE ===== */}
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
        {/* solution */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "70%",
            background: "rgba(255,255,255,0.06)"
          }}
        />

        {/* indicator */}
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

        {/* pH label */}
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
      </div>
    </div>

    {/* ===== CONTROLS ===== */}
    <div style={{ maxWidth: 420, margin: "30px auto 0" }}>
      {/* ACID CONTROL */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => setActiveSlider("acid")}
          style={{
            minWidth: 70,
            padding: "8px 10px",
            borderRadius: 8,
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            background:
              activeSlider === "acid" ? "#dc2626" : "#334155",
            color: "#fff"
          }}
        >
          ACID
        </button>

        <div style={{ flex: 1 }}>
          <label>
            Acid amount: <b>{acid}</b>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={acid}
            onChange={(e) => setAcid(+e.target.value)}
            style={{
              width: "100%",
              outline:
                activeSlider === "acid"
                  ? "2px solid #dc2626"
                  : "none"
            }}
          />
        </div>
      </div>

      {/* BASE CONTROL */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 14
        }}
      >
        <button
          onClick={() => setActiveSlider("base")}
          style={{
            minWidth: 70,
            padding: "8px 10px",
            borderRadius: 8,
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            background:
              activeSlider === "base" ? "#2563eb" : "#334155",
            color: "#fff"
          }}
        >
          BASE
        </button>

        <div style={{ flex: 1 }}>
          <label>
            Base amount: <b>{base}</b>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={base}
            onChange={(e) => setBase(+e.target.value)}
            style={{
              width: "100%",
              outline:
                activeSlider === "base"
                  ? "2px solid #2563eb"
                  : "none"
            }}
          />
        </div>
      </div>

      <small style={{ color: "#94a3b8", marginTop: 12, display: "block" }}>
        Click <b>ACID</b> or <b>BASE</b> → Use <b>A / D</b> keys to adjust
      </small>
    </div>

    {/* ===== FLOAT ANIMATION ===== */}
    <style>
      {`
        @keyframes float {
          0% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -12px); }
          100% { transform: translate(-50%, 0); }
        }
      `}
    </style>
  </div>
);

}

/* ===== Container Component ===== */
function Container({ x, label, color, level }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        bottom: 24,
        textAlign: "center"
      }}
    >
      <div
        style={{
          width: 80,
          height: 200,
          border: "3px solid #aaa",
          borderRadius: "0 0 20px 20px",
          position: "relative",
          background: "#111",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: `${level}%`,
            background: color
          }}
        />
      </div>
      <div style={{ marginTop: 6 }}>{label}</div>
    </div>
  );
}

/* ===== Cylindrical Pipe ===== */
 function Pipe({ x, offsetX = 0 }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x + offsetX,
        top: 60,
        width: 14,
        height: 140,
        background: "linear-gradient(90deg, #555, #aaa, #555)",
        borderRadius: 7
      }}
    />
  );
}

  function BentPipe({ x }) {
  return (
    <div style={{ position: "absolute", left: x, top: 40 }}>
      {/* vertical section */}
      <div
        style={{
          width: 14,
          height: 80,
          background: "linear-gradient(90deg, #555, #aaa, #555)",
          borderRadius: 7
        }}
      />

      {/* horizontal section (90° bend) */}
      <div
        style={{
          width: 180,
          height: 30,
          background: "linear-gradient(180deg, #555, #aaa, #555)",
          borderRadius: 7,
          marginLeft: 7
        }}
      />
    </div>
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
        background: "linear-gradient(180deg, #555, #aaa, #555)",
        borderRadius: 7
      }}
    />
  );
}

;