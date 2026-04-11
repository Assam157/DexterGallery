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
  const animationRef = useRef(null);

  const [frequency, setFrequency] = useState(1.0);
  const [amount, setAmount] = useState(1.0);
  const [material, setMaterial] = useState("Silicon");
  const [activeSlider, setActiveSlider] = useState(0);

  const Eg = MATERIALS[material].Eg;
  const emission = frequency >= Eg;
  const excessEnergy = Math.max(0, frequency - Eg);
  const electronCount = emission
    ? Math.min(8, Math.floor(excessEnergy * 6) + Math.floor(amount * 2))
    : 0;

  // Keyboard Controls
  useEffect(() => {
    function onKey(e) {
      const key = e.key.toLowerCase();
      
      if (key === "q" || key === "e") {
        setActiveSlider((s) => (s + 1) % 2);
      }

      if (key === "a") adjust(-1);
      if (key === "d") adjust(+1);
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

  // Canvas Animation
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
          const x = 120 + t + i * 18 + Math.sin((t + tRef.current * 3) * 0.08) * 8;
          const y = 80 + t * 0.75 + Math.sin((t + tRef.current * 3) * 0.08) * 8;

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
      
      ctx.fillStyle = "#ffaa44";
      ctx.font = "10px monospace";
      ctx.fillText(`Eg = ${Eg} eV`, 280, blockTop + 85);
    }

    function drawSurfaceElectrons() {
      ctx.fillStyle = "#ff4444";
      for (let x = 280; x < 560; x += 36) {
        ctx.beginPath();
        ctx.arc(x, blockTop + 6, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawRippleEffect() {
      if (!emission) return;
      
      const rippleCount = Math.floor(3 + amount * 2);
      const centerX = 400;
      const centerY = blockTop + 35;
      
      for (let i = 0; i < rippleCount; i++) {
        const radius = 20 + (tRef.current * 0.8 + i * 35) % 80;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 100, 50, ${0.4 - i * 0.05})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    function drawSurfaceGraph() {
      ctx.beginPath();
      ctx.moveTo(260, blockTop + 35);
      
      for (let x = 260; x <= 580; x += 5) {
        const energyLevel = emission 
          ? 10 + Math.sin(x * 0.03 + tRef.current * 0.1) * 5 + excessEnergy * 8
          : 10 + Math.sin(x * 0.03 + tRef.current * 0.1) * 3;
        const y = blockTop + 35 - Math.min(25, Math.max(0, energyLevel));
        ctx.lineTo(x, y);
      }
      
      ctx.strokeStyle = emission ? "#ffaa44" : "#4488ff";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      if (emission) {
        ctx.fillStyle = "rgba(255, 170, 68, 0.2)";
        ctx.fillRect(260, blockTop + 10, 320, 30);
      }
    }

    function drawEmittedElectrons() {
      if (!emission || electronCount === 0) return;

      const speed = 0.45;
      const maxTravel = 400; // Increased maxTravel for longer lasting electrons
      const dotSpacing = 28;
      const baseAngle = -Math.PI / 4;

      const ux = Math.cos(baseAngle);
      const uy = Math.sin(baseAngle);

      const baseOriginX = 300;
      const originY = blockTop;
      const surfaceSpacing = 28;

      for (let stream = 0; stream < electronCount; stream++) {
        const originX = baseOriginX + stream * surfaceSpacing;

        // Draw more electrons in each stream for continuous flow
        for (let j = 0; j < 20; j++) {
          // Use large offset to ensure electrons are always visible
          const s = (tRef.current * speed + j * dotSpacing + stream * 40) % maxTravel;
          
          let bx = originX + ux * s;
          let by = originY + uy * s;

          const noiseT = tRef.current * 0.02 + j * 8 + stream * 80;
          bx += Math.sin(noiseT) * 4;
          by += Math.cos(noiseT) * 6;

          // Only draw if within canvas bounds
          if (bx > 80 && bx < 680 && by > 50 && by < 380) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#ff8866";
            
            // Brighter electrons that are closer to surface
            const brightness = 0.7 + Math.sin(s * 0.1) * 0.3;
            ctx.fillStyle = `rgba(255, 100, 68, ${brightness})`;

            ctx.beginPath();
            ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner glow
            ctx.fillStyle = "#ffaa88";
            ctx.beginPath();
            ctx.arc(bx - 1, by - 1, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.shadowBlur = 0;
    }

    function drawStatusText() {
      ctx.fillStyle = "#fff";
      ctx.font = "14px monospace";
      ctx.fillText(`Light Frequency: ${frequency.toFixed(2)} eV`, 20, 30);
      ctx.fillText(`Band Gap (Eg): ${Eg} eV`, 20, 50);

      ctx.font = "bold 16px monospace";
      ctx.fillStyle = emission ? "#00ff00" : "#ff3333";
      
      if (emission) {
        ctx.fillText(`⚡ ELECTRONS EMITTED: ${electronCount}`, 20, 80);
        ctx.fillStyle = "#ffaa44";
        ctx.font = "12px monospace";
        ctx.fillText(`Excess Energy: ${excessEnergy.toFixed(2)} eV`, 20, 105);
        ctx.fillStyle = "#0f0";
        ctx.font = "10px monospace";
        ctx.fillText(`Continuous Stream →`, 20, 125);
      } else {
        ctx.fillText("⛔ NO EMISSION", 20, 80);
        ctx.fillStyle = "#ffaa44";
        ctx.font = "12px monospace";
        ctx.fillText(`Need ${(Eg - frequency).toFixed(2)} eV more`, 20, 105);
      }
    }

    function loop() {
      clear();
      drawPhotonWaves();
      drawSemiconductor();
      drawSurfaceElectrons();
      drawSurfaceGraph();
      drawRippleEffect();
      drawEmittedElectrons();
      drawStatusText();

      tRef.current = (tRef.current + 2) % 500; // Increased range for longer electron trails
      animationRef.current = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [frequency, amount, material, Eg, emission, electronCount, excessEnergy]);

  return (
    <div className="dexter-root">
      {/* LEFT PANEL */}
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

        <div style={{ marginTop: 20, fontSize: 12, color: "#aaa", textAlign: "center" }}>
          <div>⚡ Band Gap: {Eg} eV</div>
          {emission && (
            <div style={{ color: "#0f0", marginTop: 8 }}>
              ✅ Electrons: {electronCount}
              <div style={{ fontSize: 10, color: "#ffaa44" }}>
                Excess: {excessEnergy.toFixed(2)} eV
              </div>
            </div>
          )}
          {!emission && frequency > 0 && (
            <div style={{ color: "#f66", marginTop: 8 }}>
              ❌ Need {(Eg - frequency).toFixed(2)} eV more
            </div>
          )}
        </div>

        <button style={{ marginTop: 20 }} onClick={() => navigate("/")}>
          ⬅ BACK TO CONSOLE
        </button>
      </div>

      {/* CANVAS */}
      <canvas ref={canvasRef} width={W} height={H} />

      {/* RIGHT PANEL - SLIDERS */}
      <div className="energy-panel">
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <button
            className={`selector-btn ${activeSlider === 0 ? "active" : ""}`}
            onClick={() => setActiveSlider(0)}
          >
            🌊 FREQUENCY
          </button>
          <button
            className={`selector-btn ${activeSlider === 1 ? "active" : ""}`}
            onClick={() => setActiveSlider(1)}
          >
            💡 INTENSITY
          </button>
        </div>

        <div className="energy-label">LIGHT FREQUENCY</div>
        <div className="energy-value">{frequency.toFixed(2)} eV</div>
        <div className="slider-wrap">
          <div
            className="slider-tooltip"
            style={{ left: `${((frequency - 0.2) / 2.8) * 100}%` }}
          >
            {frequency.toFixed(2)} eV
          </div>
          <input
            className={`energy-slider ${activeSlider === 0 ? "selected" : ""}`}
            type="range"
            min="0.2"
            max="3"
            step="0.01"
            value={frequency}
            onChange={(e) => setFrequency(+e.target.value)}
          />
        </div>
        <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
          Threshold: {Eg} eV 
          <span style={{ color: frequency >= Eg ? "#0f0" : "#f66", marginLeft: 8 }}>
            {frequency >= Eg ? "✓ Above" : "✗ Below"}
          </span>
        </div>

        <div className="energy-label" style={{ marginTop: 24 }}>LIGHT INTENSITY</div>
        <div className="energy-value">{amount.toFixed(2)}×</div>
        <div className="slider-wrap">
          <div
            className="slider-tooltip"
            style={{ left: `${((amount - 1) / 1) * 100}%` }}
          >
            {amount.toFixed(2)}×
          </div>
          <input
            className={`energy-slider ${activeSlider === 1 ? "selected" : ""}`}
            type="range"
            min="1"
            max="2"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(+e.target.value)}
          />
        </div>

        {emission && (
          <div style={{ marginTop: 16, fontSize: 12, color: "#0f0", textAlign: "center" }}>
            ⚡ Continuous Electron Stream
            <div style={{ fontSize: 10, color: "#ffaa44" }}>
              {electronCount} streams active
            </div>
          </div>
        )}

        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 20, textAlign: "center" }}>
          <kbd style={{ background: "#1a1a2a", padding: "2px 6px", borderRadius: 4 }}>Q/E</kbd> Switch · 
          <kbd style={{ background: "#1a1a2a", padding: "2px 6px", borderRadius: 4, marginLeft: 8 }}>A/D</kbd> Adjust
        </div>
      </div>
    </div>
  );
}