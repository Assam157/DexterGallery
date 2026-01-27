import React, { useRef, useEffect, useState } from "react";
import "./QuantumLab.css";

/* =========================================================
   Quantum Abstract Orbital Lab
   (Artistic / Conceptual Representation)
   ========================================================= */

const W = 1500;
const H = 1000;
const subshells = ["s", "p", "d", "f", "g"];

export default function QuantumAbstractLab() {
  const canvasRef = useRef(null);

  const [n, setN] = useState(3);

  /* ===== ACTIVE CONTROL ===== */
  const [activeControl, setActiveControl] = useState("n");
  // future-proof: "n"

  /* ================= KEYBOARD (A / D) ================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!["a", "A", "d", "D"].includes(e.key)) return;
      if (activeControl !== "n") return;

      const delta = e.key.toLowerCase() === "a" ? -1 : 1;
      setN(v => Math.min(6, Math.max(1, v + delta)));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeControl]);

  /* ================= DRAW ================= */
  useEffect(() => {
    draw();
  }, [n]);

  function draw() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Abstract Quantum Orbital Visualization`, 20, 30);
    ctx.fillText(`n = ${n}`, 20, 58);

    const baseRadius = 90;

    for (let l = 0; l <= n - 1; l++) {
      const radius = baseRadius + l * 75;
      const petals = Math.max(1, l * 2);
      const color = `hsl(${l * 75}, 85%, 60%)`;

      drawAbstractOrbital(ctx, cx, cy, radius, petals, color);
      drawMLSpokes(ctx, cx, cy, radius, l, color);

      ctx.fillStyle = color;
      ctx.fillText(
        `ℓ = ${l}  (${subshells[l] || "?"})`,
        20,
        100 + l * 24
      );
    }
  }

  /* ================= Abstract Orbital ================= */
  function drawAbstractOrbital(ctx, cx, cy, radius, petals, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.01) {
      const wave =
        Math.sin(a * petals) * 18 +
        Math.sin(a * (petals + 1)) * 8;
      const r = radius + wave;

      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);

      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.stroke();
  }

  /* ================= mℓ Spokes ================= */
  function drawMLSpokes(ctx, cx, cy, radius, l, color) {
    if (l === 0) return;

    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.4;

    const count = 2 * l + 1;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(angle) * radius,
        cy + Math.sin(angle) * radius
      );
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  /* ================= UI ================= */
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "260px 1fr 300px",
        background: "#020617",
        color: "white",
        overflow: "hidden",
      }}
    >
      {/* ================= CENTER PANEL ================= */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100vw",
          height: "100vh",
          overflowX: "auto",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x pan-y",
        }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{
            border: "1px solid #334155",
            borderRadius: "12px",
          }}
        />

        {/* ===== CONTROLS ===== */}
        <div style={{ width: "420px", marginTop: "14px" }}>
          <button
            onClick={() => setActiveControl("n")}
            style={{
              width: "100%",
              marginBottom: "6px",
              padding: "6px",
              fontWeight: "bold",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background:
                activeControl === "n" ? "#22c55e" : "#334155",
              color: "#000",
            }}
          >
            PRINCIPAL QUANTUM NUMBER (n)
          </button>

          <input
            type="range"
            min="1"
            max="6"
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            style={{ width: "100%" }}
          />

          <div style={{ textAlign: "center", marginTop: "6px" }}>
            n = {n} &nbsp; | &nbsp; Use <b>A / D</b> keys
          </div>
        </div>
      </div>
    </div>
  );
}
