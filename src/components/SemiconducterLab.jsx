import React, { useEffect, useRef, useState } from "react";
import { useNavigate,BrowserRouter,Routes,Route } from "react-router-dom";
import "./RadiationDexterLab.css";
import DiodeBiasLab from "./PN-JunctionDiodeShwoing";
import PNJunctionDiffusion from "./PNJunctionDIode";

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

  /* CONTROLS */
  const [frequency, setFrequency] = useState(1.0);
  const [amount, setAmount] = useState(1.0);
  const [material, setMaterial] = useState("Silicon");

  const Eg = MATERIALS[material].Eg;

  /* PHYSICS */
  const emission = frequency >= Eg;
  const excessEnergy = Math.max(0, frequency - Eg);
  const electronCount = emission
    ? Math.min(8, Math.floor(excessEnergy * 6) + 1)
    : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const blockTop = 260;

    /* ---------- BLACK CLEAR (CRITICAL FIX) ---------- */
    function clear() {
      ctx.fillStyle = "#000";           // ← opaque black
      ctx.fillRect(0, 0, W, H);
    }

    /* ---------- GRID (NOW INVISIBLE ON BLACK) ---------- */
    function grid() {
      ctx.strokeStyle = "#111"; // black-on-black → invisible
      for (let i = 0; i < W; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, H);
        ctx.stroke();
      }
    }

    /* ---------- PHOTON WAVES ---------- */
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

    /* ---------- SEMICONDUCTOR ---------- */
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

    /* ---------- EMITTED ELECTRONS ---------- */
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
  const dotsPerStream = 14;

  for (let stream = 0; stream < electronCount; stream++) {
    const originX = baseOriginX + stream * surfaceSpacing;

    for (let j = 0; j < dotsPerStream; j++) {
      const s =
        (tRef.current * speed - j * dotSpacing - stream * 55) %
        maxTravel;

      if (s < 0) continue;

      /* --------- BALLISTIC BASE --------- */
      let bx = originX + ux * s;
      let by = originY + uy * s;

      /* --------- BROWNIAN JITTER --------- */
      const noiseT = tRef.current * 0.02 + j * 10 + stream * 100;

      const jitterX =
        (Math.sin(noiseT * 2.3) + Math.sin(noiseT * 0.7)) * 4;
      const jitterY =
        (Math.cos(noiseT * 1.9) + Math.sin(noiseT * 1.1)) * 6;

      bx += jitterX;
      by += jitterY;

      /* --------- ANGULAR DIFFUSION --------- */
      const angularDrift =
        Math.sin(noiseT * 0.6) * 0.15 * (s / maxTravel);

      bx += Math.cos(baseAngle + Math.PI / 2) * angularDrift * 25;
      by += Math.sin(baseAngle + Math.PI / 2) * angularDrift * 25;

      if (bx < -40 || by < -40 || bx > W + 40 || by > H + 40) continue;

      /* --------- DRAW ELECTRON --------- */
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


    /* ---------- TEXT ---------- */
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
      clear();                 // ← BLACK BACKGROUND EVERY FRAME
      grid();
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
        <button
  className="experiment-card"
  onClick={() => navigate("/PN")}
>
 
  <p>Photoelectric emission in semiconductors</p>
</button>
<button
  className="experiment-card"
  onClick={() => navigate("/PNJN")}
>
 
  <p>PN junction forwaard and reverse bia</p>
</button>


        <button style={{ marginTop: 20 }} onClick={() => navigate("/")}>
          ⬅ BACK TO CONSOLE
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ background: "#000" }}
      />

      <div className="energy-panel">
        <div className="energy-label">LIGHT FREQUENCY</div>
        <div className="energy-value">{frequency.toFixed(2)} eV</div>
        <input
          className="energy-slider"
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
          className="energy-slider em"
          type="range"
          min="1"
          max="2"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(+e.target.value)}
        />
      </div>
 

    </div>
  );
}

