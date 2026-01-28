 import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RadiationDexterLab.css";

const W = 700;
const H = 420;

/* Band gaps (eV) */
const MATERIALS = {
  Silicon: { Eg: 1.12 },
  Germanium: { Eg: 0.67 },
  GaAs: { Eg: 1.43 }
};

export default function SemiconductorDexterLab() {
  const canvasRef = useRef(null);
  const tRef = useRef(0);
  const navigate = useNavigate();

  /* ===== CONTROLS ===== */
  const [frequency, setFrequency] = useState(1.0);
  const [amount, setAmount] = useState(1.0);
  const [material, setMaterial] = useState("Silicon");

  // 0 = frequency, 1 = amount
  const [activeSlider, setActiveSlider] = useState(0);

  const Eg = MATERIALS[material].Eg;

  /* ===== PHYSICS ===== */
  const emission = frequency >= Eg;
  const excessEnergy = Math.max(0, frequency - Eg);
  const electronCount = emission
    ? Math.min(8, Math.floor(excessEnergy * 6) + 1)
    : 0;

  /* ================= KEYBOARD CONTROLS ================= */
  useEffect(() => {
    function onKey(e) {
      if (["q", "Q", "e", "E"].includes(e.key)) {
        setActiveSlider((s) => (s + 1) % 2);
      }

      if (e.key === "a" || e.key === "A") adjust(-1);
      if (e.key === "d" || e.key === "D") adjust(+1);
    }

    function adjust(dir) {
      if (activeSlider === 0) {
        setFrequency((v) =>
          Math.min(3, Math.max(0.2, +(v + dir * 0.02).toFixed(2)))
        );
      } else {
        setAmount((v) =>
          Math.min(2, Math.max(1, +(v + dir * 0.02).toFixed(2)))
        );
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeSlider]);

  /* ================= CANVAS ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const blockTop = 260;

    function clear() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
    }

    function drawPhotonWaves() {
      const color = emission ? "#ffd700" : "#666";
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = emission ? 14 : 0;
      ctx.shadowColor = color;

      const waveCount = Math.round(2 + (amount - 1) * 6);

      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        for (let t = 0; t < 220; t += 6) {
          const x =
            120 + t + i * 18 +
            Math.sin((t + tRef.current * 3) * 0.08) * 8;
          const y =
            80 + t * 0.75 +
            Math.sin((t + tRef.current * 3) * 0.08) * 8;

          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
    }

    function drawSemiconductor() {
      ctx.fillStyle = "#222";
      ctx.fillRect(260, blockTop, 320, 70);
      ctx.strokeStyle = "#0f0";
      ctx.strokeRect(260, blockTop, 320, 70);

      ctx.fillStyle = "#0f0";
      ctx.font = "14px monospace";
      ctx.fillText(`SEMICONDUCTOR (${material})`, 280, blockTop - 10);
    }

    function drawSurfaceElectrons() {
      ctx.fillStyle = "#ff4444";
      for (let x = 280; x < 560; x += 36) {
        ctx.beginPath();
        ctx.arc(x, blockTop + 6, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawEmittedElectrons() {
      if (!emission || electronCount === 0) return;

      const speed = 0.45;
      const maxTravel = 320;
      const dotSpacing = 24;
      const baseAngle = -Math.PI / 4;

      const ux = Math.cos(baseAngle);
      const uy = Math.sin(baseAngle);

      const baseOriginX = 300;
      const originY = blockTop;
      const surfaceSpacing = 24;

      for (let stream = 0; stream < electronCount; stream++) {
        const originX = baseOriginX + stream * surfaceSpacing;

        for (let j = 0; j < 14; j++) {
          const s =
            (tRef.current * speed - j * dotSpacing - stream * 55) %
            maxTravel;
          if (s < 0) continue;

          let bx = originX + ux * s;
          let by = originY + uy * s;

          const noiseT = tRef.current * 0.02 + j * 10 + stream * 100;
          bx += Math.sin(noiseT) * 4;
          by += Math.cos(noiseT) * 6;

          ctx.shadowBlur = 8;
          ctx.shadowColor = "#ff8866";
          ctx.fillStyle = "#ff6644";

          ctx.beginPath();
          ctx.arc(bx, by, 3.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;
    }

    function drawText() {
      ctx.fillStyle = "#fff";
      ctx.font = "14px monospace";
      ctx.fillText(`Light Frequency: ${frequency.toFixed(2)} eV`, 20, 30);
      ctx.fillText(`Band Gap (Eg): ${Eg} eV`, 20, 50);

      ctx.font = "bold 16px monospace";
      ctx.fillStyle = emission ? "#00ff00" : "#ff3333";
      ctx.fillText(
        emission ? "ELECTRONS EMITTED" : "NO EMISSION",
        20,
        80
      );
    }

    function loop() {
      clear();
      drawPhotonWaves();
      drawSemiconductor();
      drawSurfaceElectrons();
      drawEmittedElectrons();
      drawText();

      tRef.current += 2;
      requestAnimationFrame(loop);
    }

    loop();
  }, [frequency, amount, material, Eg, emission, electronCount]);

  /* ================= UI ================= */
  return (
    <div className="dexter-root">
      <div className="control-panel">
        <h2>🔌 SEMICONDUCTOR LAB</h2>

        {Object.keys(MATERIALS).map((m) => (
          <button
            key={m}
            className={material === m ? "active" : ""}
            onClick={() => setMaterial(m)}
          >
            {m}
          </button>
        ))}

        <button onClick={() => navigate("/PN")}>
          Photoelectric emission
        </button>

        <button onClick={() => navigate("/PNJN")}>
          PN junction bias
        </button>

        <button style={{ marginTop: 20 }} onClick={() => navigate("/")}>
          ⬅ BACK TO CONSOLE
        </button>
      </div>

      <canvas ref={canvasRef} width={W} height={H} />

      {/* ===== ENERGY PANEL ===== */}
      <div className="energy-panel">
        {/* PRIMARY SELECTOR */}
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <button
            className={activeSlider === 0 ? "active" : ""}
            onClick={() => setActiveSlider(0)}
          >
            FREQUENCY
          </button>

          <button
            className={activeSlider === 1 ? "active" : ""}
            onClick={() => setActiveSlider(1)}
          >
            INTENSITY
          </button>
        </div>

        <div className="energy-label">LIGHT FREQUENCY</div>
        <div className="energy-value">{frequency.toFixed(2)} eV</div>
        <input
          className={`energy-slider ${activeSlider === 0 ? "active" : ""}`}
          type="range"
          min="0.2"
          max="3"
          step="0.01"
          value={frequency}
          onChange={(e) => setFrequency(+e.target.value)}
        />

        <div className="energy-label">LIGHT AMOUNT</div>
        <div className="energy-value">{amount.toFixed(2)}×</div>
        <input
          className={`energy-slider ${activeSlider === 1 ? "active" : ""}`}
          type="range"
          min="1"
          max="2"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(+e.target.value)}
        />

        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
          Select → <b>Q / E</b> | Adjust → <b>A / D</b>
        </div>
      </div>
    </div>
  );
}
