import React, { useRef, useEffect, useState } from "react";
import "./InverseSquareMotion.css";

export default function InverseSquareMotion() {
  const canvasRef = useRef(null);

  const [m1, setM1] = useState(5);
  const [m2, setM2] = useState(5);
  const [distance, setDistance] = useState(300);
  const [activeSlider, setActiveSlider] = useState(0);
// 0 = m1, 1 = m2, 2 = distance

  const G = 60;
  const FORCE_REF = 1; // visual scaling

  const body1 = { x: 400 - distance / 2, y: 300, m: m1 };
  const body2 = { x: 400 + distance / 2, y: 300, m: m2 };

  const force = (G * m1 * m2) / (distance * distance);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    draw(ctx);
  }, [m1, m2, distance]);

  function draw(ctx) {
    ctx.clearRect(0, 0, 800, 600);

    /* ---- DISTANCE LINE ---- */
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.moveTo(body1.x, body1.y);
    ctx.lineTo(body2.x, body2.y);
    ctx.stroke();
    ctx.setLineDash([]);

    drawBody(ctx, body1, "#4ade80");
    drawBody(ctx, body2, "#60a5fa");

    /* ---- FORCE LABEL ---- */
    ctx.font = "bold 18px monospace";
    ctx.fillStyle = "#ff0000";
    ctx.fillText(
      `Force = ${force.toFixed(4)}`,
      300,
      120
    );

    /* ---- FORCE BAR ---- */
    drawForceBar(ctx, force);

    /* ---- FORMULA ---- */
    ctx.font = "16px monospace";
    ctx.fillStyle = "#ff0000";
    ctx.fillText("F = G · m₁ · m₂ / r²", 260, 90);
  }

  function drawForceBar(ctx, force) {
    const barX = 720;
    const barY = 160;
    const barH = 260;
    const barW = 18;

    const normalized = Math.max(
      0,
      Math.min(1, force / FORCE_REF)
    );

    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barW, barH);

    const fillH = barH * normalized;
    const fillY = barY + barH - fillH;

    ctx.fillStyle = "#ff0000";
    ctx.fillRect(barX, fillY, barW, fillH);

    ctx.font = "14px monospace";
    ctx.fillStyle = "#ff0000";
    ctx.fillText("FORCE", barX - 10, barY - 10);
  }

  function drawBody(ctx, b, color) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 10 + b.m, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
useEffect(() => {
  function onKey(e) {
    // ========= SWITCH SLIDER =========
    if (e.key === "q" || e.key === "Q") {
      setActiveSlider(s => (s + 2) % 3);
    }

    if (e.key === "e" || e.key === "E") {
      setActiveSlider(s => (s + 1) % 3);
    }

    // ========= ADJUST VALUE =========
    if (e.key === "a" || e.key === "A") {
      adjust(-1);
    }

    if (e.key === "d" || e.key === "D") {
      adjust(+1);
    }
  }

  function adjust(dir) {
    switch (activeSlider) {
      case 0: // Mass m₁ (1 → 10)
        setM1(v =>
          Math.min(10, Math.max(1, v + dir))
        );
        break;

      case 1: // Mass m₂ (1 → 10)
        setM2(v =>
          Math.min(10, Math.max(1, v + dir))
        );
        break;

      case 2: // Distance r (20 → 500)
        setDistance(v =>
          Math.min(500, Math.max(20, v + dir * 10))
        );
        break;

      default:
        break;
    }
  }

  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [activeSlider]);

  return (
  <div className="inverse-container">
    <h2>Inverse Square Law</h2>

    <canvas ref={canvasRef} width={800} height={600} />

    {/* ================= CONTROLS ================= */}
    <div className="inverse-controls">

      {/* ===== MASS m1 ===== */}
      <div className={`slider-row ${activeSlider === 0 ? "active" : ""}`}>
        <button
          className="slider-select-btn"
          onClick={() => setActiveSlider(0)}
        >
          m₁
        </button>

        <div className="slider-wrap">
          {activeSlider === 0 && (
            <div
              className="slider-tooltip"
              style={{
                left: `${((m1 - 1) / (10 - 1)) * 100}%`
              }}
            >
              {m1}
            </div>
          )}

          <input
            type="range"
            min="1"
            max="10"
            value={m1}
            onChange={(e) => setM1(+e.target.value)}
          />
        </div>
      </div>

      {/* ===== MASS m2 ===== */}
      <div className={`slider-row ${activeSlider === 1 ? "active" : ""}`}>
        <button
          className="slider-select-btn"
          onClick={() => setActiveSlider(1)}
        >
          m₂
        </button>

        <div className="slider-wrap">
          {activeSlider === 1 && (
            <div
              className="slider-tooltip"
              style={{
                left: `${((m2 - 1) / (10 - 1)) * 100}%`
              }}
            >
              {m2}
            </div>
          )}

          <input
            type="range"
            min="1"
            max="10"
            value={m2}
            onChange={(e) => setM2(+e.target.value)}
          />
        </div>
      </div>

      {/* ===== DISTANCE r ===== */}
      <div className={`slider-row ${activeSlider === 2 ? "active" : ""}`}>
        <button
          className="slider-select-btn"
          onClick={() => setActiveSlider(2)}
        >
          r
        </button>

        <div className="slider-wrap">
          {activeSlider === 2 && (
            <div
              className="slider-tooltip"
              style={{
                left: `${((distance - 20) / (500 - 20)) * 100}%`
              }}
            >
              {distance}px
            </div>
          )}

          <input
            type="range"
            min="20"
            max="500"
            value={distance}
            onChange={(e) => setDistance(+e.target.value)}
          />
        </div>
      </div>

    </div>
  </div>
);

}
