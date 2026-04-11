import React, { useRef, useEffect, useState } from "react";
import "./RadiationDexterLab.css";

const W = 800;
const H = 460;

export default function RGBMixingExperiment() {
  const canvasRef = useRef(null);
  const sliderRef = useRef(null);

  const [redOn, setRedOn] = useState(true);
  const [greenOn, setGreenOn] = useState(true);
  const [blueOn, setBlueOn] = useState(true);

  const [overlap, setOverlap] = useState(0.6);
  const [sliderSelected, setSliderSelected] = useState(false);

  /* ================= KEYBOARD CONTROL ================= */
  useEffect(() => {
    const handleKey = (e) => {
      if (!sliderSelected) return;

      if (e.key === "a" || e.key === "A") {
        setOverlap(v => Math.max(0, +(v - 0.02).toFixed(2)));
      }
      if (e.key === "d" || e.key === "D") {
        setOverlap(v => Math.min(1, +(v + 0.02).toFixed(2)));
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [sliderSelected]);

  /* ================= DRAW ================= */
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    drawScreen(ctx);
    drawProjectors(ctx);

    ctx.globalCompositeOperation = "lighter";

    const cx = 400;
    const cy = 240;
    const spread = 120 * (1 - overlap);

    if (redOn)
      drawLight(ctx, cx - spread, cy - spread, "rgba(255,0,0,0.9)");
    if (greenOn)
      drawLight(ctx, cx - spread, cy + spread, "rgba(0,255,0,0.9)");
    if (blueOn)
      drawLight(ctx, cx + spread, cy + spread, "rgba(0,0,255,0.9)");

    ctx.globalCompositeOperation = "source-over";
    drawLabels(ctx, redOn, greenOn, blueOn);
  }, [redOn, greenOn, blueOn, overlap]);

  return (
    <div className="dexter-root">
      {/* ===== LEFT PANEL ===== */}
      <div className="control-panel">
        <h2>🎨 RGB Color Mixing</h2>

        <button
          className={redOn ? "active" : ""}
          onClick={() => setRedOn(v => !v)}
          style={{ color: "#ff5555" }}
        >
          🔴 Red {redOn ? "ON" : "OFF"}
        </button>

        <button
          className={greenOn ? "active" : ""}
          onClick={() => setGreenOn(v => !v)}
          style={{ color: "#55ff55" }}
        >
          🟢 Green {greenOn ? "ON" : "OFF"}
        </button>

        <button
          className={blueOn ? "active" : ""}
          onClick={() => setBlueOn(v => !v)}
          style={{ color: "#5599ff" }}
        >
          🔵 Blue {blueOn ? "ON" : "OFF"}
        </button>

        {/* ===== SLIDER ===== */}
        <div style={{ marginTop: 18 }}>
          <label style={{ fontSize: 13 }}>
            Overlap Amount
          </label>

          <input
            ref={sliderRef}
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={overlap}
            onChange={e => setOverlap(parseFloat(e.target.value))}
            style={{
              width: "100%",
              outline: sliderSelected ? "2px solid #00ffff" : "none"
            }}
          />

          <button
            onClick={() => {
              setSliderSelected(v => !v);
              sliderRef.current?.focus();
            }}
            style={{
              marginTop: 6,
              width: "100%",
              fontSize: 12
            }}
            className={sliderSelected ? "active" : ""}
          >
            {sliderSelected ? "🎯 Slider Selected (A / D)" : "Select Slider"}
          </button>
        </div>

        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 12 }}>
          Use <b>A</b> / <b>D</b> to change overlap
        </p>
      </div>

      {/* ===== CANVAS ===== */}
      <div className="canvas-panel">
        <canvas ref={canvasRef} width={W} height={H} />
      </div>
    </div>
  );
}

/* ================= DRAWING ================= */

function drawScreen(ctx) {
  ctx.fillStyle = "#222";
  ctx.fillRect(220, 40, 360, 380);
}

function drawLight(ctx, x, y, color) {
  const r = 140;
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "transparent");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawProjectors(ctx) {
  projector(ctx, 650, 120, "R", "#ff0000");
  projector(ctx, 650, 300, "B", "#0000ff");
  projector(ctx, 420, 420, "G", "#00ff00");
}

function projector(ctx, x, y, label, color) {
  ctx.fillStyle = "#333";
  ctx.fillRect(x - 30, y - 15, 60, 30);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x - 35, y, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.font = "bold 16px monospace";
  ctx.fillText(label, x - 5, y + 6);
}

function drawLabels(ctx, r, g, b) {
  ctx.font = "14px monospace";

  if (r && g) label(ctx, "Yellow", 300, 220, "#ffff00");
  if (r && b) label(ctx, "Magenta", 420, 220, "#ff00ff");
  if (g && b) label(ctx, "Cyan", 300, 320, "#00ffff");
  if (r && g && b) label(ctx, "White", 360, 270, "#ffffff");
}

function label(ctx, text, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}
