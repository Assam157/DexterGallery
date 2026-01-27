import React, { useRef, useEffect, useState } from "react";
import "./QuantumLab.css";

/* ================= CONSTANTS ================= */
const W = 1200;
const H = 700;
const SOURCE_X = 150;
const SLIT_X = 600;
const DETECTOR_X = 1150;
const NUM_RAYS = 18;

/* ================= COMPONENT ================= */
export default function QuantumWaveNonLocality() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const [t, setT] = useState(0);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [collapseRay, setCollapseRay] = useState(null);

  const [activeControl, setActiveControl] = useState("time");
  // "time" | "phase"

  /* ================= KEYBOARD (A / D) ================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!["a", "A", "d", "D"].includes(e.key)) return;
      const delta = e.key.toLowerCase() === "a" ? -1 : 1;

      if (activeControl === "time") {
        setT(v => Math.min(1, Math.max(0, v + delta * 0.01)));
      }

      if (activeControl === "phase") {
        setPhase(p => p + delta * 0.2);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeControl]);

  /* ================= ANIMATION ================= */
  useEffect(() => {
    draw();
  }, [t, collapseRay, phase]);

  useEffect(() => {
    if (!playing) return;
    animationRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationRef.current);
  }, [playing]);

  const step = () => {
    setT(prev => Math.min(prev + 0.002, 1));
    setPhase(p => p + 0.1);
    animationRef.current = requestAnimationFrame(step);
  };

  /* ================= DRAW ================= */
  const draw = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    drawSource(ctx);
    drawSlit(ctx);
    drawDetector(ctx);
    drawIncidentWave(ctx);

    if (t >= 0.5) drawSplitRays(ctx);
  };

  /* ================= SOURCE ================= */
  const drawSource = (ctx) => {
    const r = 14 + Math.sin(phase) * 2;
    ctx.fillStyle = "rgba(0,255,255,0.8)";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(SOURCE_X, H / 2, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillText("Quantum Source", SOURCE_X - 50, H / 2 + 35);
  };

  /* ================= SLIT ================= */
  const drawSlit = (ctx) => {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(SLIT_X, 0);
    ctx.lineTo(SLIT_X, H / 2 - 70);
    ctx.moveTo(SLIT_X, H / 2 + 70);
    ctx.lineTo(SLIT_X, H);
    ctx.stroke();
    ctx.fillText("Slit", SLIT_X - 10, 40);
  };

  /* ================= DETECTOR ================= */
  const drawDetector = (ctx) => {
    ctx.strokeStyle = "#aaa";
    ctx.strokeRect(DETECTOR_X, 50, 40, H - 100);
    ctx.fillText("Detector", DETECTOR_X - 25, 40);

    if (collapseRay !== null) {
      ctx.fillStyle = "yellow";
      ctx.shadowColor = "yellow";
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(DETECTOR_X + 20, collapseRay, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };

  /* ================= INCIDENT WAVE ================= */
  const drawIncidentWave = (ctx) => {
    const grad = ctx.createLinearGradient(SOURCE_X, 0, SLIT_X, 0);
    grad.addColorStop(0, "#00ffff");
    grad.addColorStop(0.5, "#ff00ff");
    grad.addColorStop(1, "#00ff88");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let y = 0; y < H; y += 3) {
      const x =
        SOURCE_X +
        (SLIT_X - SOURCE_X) * Math.min(t / 0.5, 1) +
        Math.sin(y * 0.05 + phase) * 12;

      if (y === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  /* ================= SPLIT ================= */
  const drawSplitRays = (ctx) => {
    const localT = (t - 0.5) / 0.5;

    for (let i = 0; i < NUM_RAYS; i++) {
      const angle =
        ((i - (NUM_RAYS - 1) / 2) / NUM_RAYS) * Math.PI / 2.5;

      const y0 = H / 2;
      const yEnd =
        y0 + Math.tan(angle) * (DETECTOR_X - SLIT_X) * localT;

      ctx.strokeStyle = `hsla(${i * 20 + phase * 20},100%,60%,0.5)`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(SLIT_X, y0);
      ctx.lineTo(
        SLIT_X + (DETECTOR_X - SLIT_X) * localT,
        yEnd
      );
      ctx.stroke();
    }
  };

  /* ================= MEASUREMENT ================= */
  const measure = () => {
    setCollapseRay(
      H / 2 + (Math.random() - 0.5) * 260
    );
  };

  /* ================= UI ================= */
  return (
    <div className="quantum-lab-container">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="quantum-canvas"
      />

      <div className="controls">
        {/* TIME */}
        <div>
          <button
            onClick={() => setActiveControl("time")}
            className={activeControl === "time" ? "active" : ""}
          >
            TIME
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={t}
            onChange={(e) => setT(+e.target.value)}
          />
        </div>

        {/* PHASE */}
        <div>
          <button
            onClick={() => setActiveControl("phase")}
            className={activeControl === "phase" ? "active" : ""}
          >
            PHASE
          </button>
          <input
            type="range"
            min="0"
            max="50"
            value={phase}
            onChange={(e) => setPhase(+e.target.value)}
          />
        </div>

        <button onClick={() => setPlaying(p => !p)}>
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>

        <button onClick={measure}>
          Measure (Collapse)
        </button>

        <button
          onClick={() => {
            setPlaying(false);
            setT(0);
            setCollapseRay(null);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
