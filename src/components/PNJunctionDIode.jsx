import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const WIDTH = 1200;
const HEIGHT = 500;

export default function PNJunctionDiffusion() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const [current, setCurrent] = useState(1.0);
  const [bias, setBias] = useState("forward");

  /* ================= KEYBOARD (A / D) ================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      setCurrent(prev => {
        let next = prev;
        if (e.key === "a" || e.key === "A") next -= 0.01;
        if (e.key === "d" || e.key === "D") next += 0.01;
        return Math.min(1, Math.max(0.2, +next.toFixed(2)));
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ================= CANVAS ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const MID = WIDTH / 2;

    let animationId;

    /* ===== Depletion ===== */
    let depletionWidth = bias === "forward" ? 120 : 40;
    const MAX = 220;
    const MIN = 40;

    /* ===== Fixed Ions (Column Layout) ===== */
    const staticDots = [];
    const COL = 60;
    const ROW = 40;

    for (let x = 40; x < MID - 40; x += COL) {
      for (let y = 30; y < HEIGHT - 30; y += ROW) {
        staticDots.push({ x, y, color: "#3b82f6", sign: "+" });
      }
    }

    for (let y = 30; y < HEIGHT - 30; y += ROW) {
      staticDots.push({ x: MID - 20, y, color: "#3b82f6", sign: "+" });
    }

    for (let x = MID + 40; x < WIDTH - 40; x += COL) {
      for (let y = 30; y < HEIGHT - 30; y += ROW) {
        staticDots.push({ x, y, color: "#ef4444", sign: "−" });
      }
    }

    /* ===== Moving Charges ===== */
    class Charge {
      constructor(x, y, vx, sign) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.sign = sign;
      }
      move() {
        this.x += this.vx;
      }
      draw() {
        ctx.fillStyle = "#fff";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.sign, this.x, this.y);
      }
    }

    const baseSpeed = 0.6 * current;
    const posV = bias === "forward" ? baseSpeed : -baseSpeed;
    const negV = -posV;

    const positives = [];
    const negatives = [];

    for (let i = 0; i < 45; i++) {
      positives.push(
        new Charge(
          Math.random() * (MID - MAX - 30),
          Math.random() * HEIGHT,
          posV,
          "+"
        )
      );

      negatives.push(
        new Charge(
          MID + MAX + 30 + Math.random() * (MID - MAX - 30),
          Math.random() * HEIGHT,
          negV,
          "−"
        )
      );
    }

    /* ===== Draw Helpers ===== */
    function drawRegions() {
      ctx.fillStyle = "rgba(59,130,246,0.08)";
      ctx.fillRect(0, 0, MID - depletionWidth, HEIGHT);

      ctx.fillStyle = "rgba(239,68,68,0.08)";
      ctx.fillRect(MID + depletionWidth, 0, MID - depletionWidth, HEIGHT);

      ctx.fillStyle = "rgba(250,204,21,0.18)";
      ctx.fillRect(MID - depletionWidth, 0, depletionWidth * 2, HEIGHT);

      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "rgba(250,204,21,0.7)";
      ctx.strokeRect(MID - depletionWidth, 0, depletionWidth * 2, HEIGHT);
      ctx.setLineDash([]);
    }

    function drawStaticDots() {
      staticDots.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(d.sign, d.x, d.y + 0.5);
      });
    }

    function updateCharges() {
      positives.forEach(p => {
        p.move();
        if (p.x > MID - depletionWidth - 10)
          p.x = Math.random() * (MID - depletionWidth - 40);
      });

      negatives.forEach(n => {
        n.move();
        if (n.x < MID + depletionWidth + 10)
          n.x = MID + depletionWidth + Math.random() * (MID - depletionWidth - 40);
      });

      if (bias === "forward" && depletionWidth > MIN)
        depletionWidth -= 0.06 * current;

      if (bias === "reverse" && depletionWidth < MAX)
        depletionWidth += 0.06 * current;
    }

    function drawCharges() {
      positives.forEach(p => p.draw());
      negatives.forEach(n => n.draw());
    }

    function animate() {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      drawRegions();
      drawStaticDots();
      updateCharges();
      drawCharges();

      animationId = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [current, bias]);

  /* ================= UI ================= */
  return (
    <div style={{ background: "#020617", padding: 16 }}>
      <button onClick={() => navigate("/semiconductor")}>
        ⬅ Return to Semiconductor Lab
      </button>

      <button
        style={{
          marginLeft: 10,
          background: bias === "forward" ? "#22c55e" : "#ef4444",
          color: "#000",
          fontWeight: "bold",
          padding: "6px 12px"
        }}
        onClick={() =>
          setBias(bias === "forward" ? "reverse" : "forward")
        }
      >
        {bias === "forward" ? "FORWARD BIAS" : "REVERSE BIAS"}
      </button>
      {/* ===== STATUS HUD ===== */}
<div
  style={{
    maxWidth: 320,
    margin: "12px auto",
    padding: "12px 14px",
    background: "rgba(2,6,23,0.85)",
    border: "1.5px solid #38bdf8",
    borderRadius: 8,
    color: "#e5e7eb",
    fontSize: 14
  }}
>
  <div style={{ fontSize: 16, color: "#fff", marginBottom: 6 }}>
    PN Junction Status
  </div>

  <div>
    Bias:{" "}
    <b style={{ color: bias === "forward" ? "#22c55e" : "#ef4444" }}>
      {bias.toUpperCase()}
    </b>
  </div>

  <div>
    Applied Voltage: {(current * 0.7).toFixed(2)} V
  </div>

  <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
    Keyboard: <b>A</b> ↓ &nbsp; <b>D</b> ↑
  </div>
</div>


      <div style={{ maxWidth: 420, margin: "14px auto", color: "#fff" }}>
        <label>Applied Voltage (A / D keys)</label>
        <input
          type="range"
          min="0.2"
          max="1"
          step="0.01"
          value={current}
          onChange={e => setCurrent(+e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{
          border: "2px solid #38bdf8",
          display: "block",
          margin: "auto"
        }}
      />
    </div>
  );
}
