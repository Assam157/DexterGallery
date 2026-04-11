 import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RadiationDexterLab.css";
import "./ExperimentLayout.css";

const W = 700;
const H = 420;

const BASE_RANGE = {
  alpha: 220,
  beta: 360,
  gamma: 720
};

const DEFLECT_FACTOR = {
  alpha: -0.15,
  beta: 0.6,
  gamma: 0.0
};

export default function RadiationDexterLab() {
  const canvasRef = useRef(null);
  const tRef = useRef(0);
  const navigate = useNavigate();
  const animationRef = useRef(null);
  const lastTimestampRef = useRef(0);

  const [energy, setEnergy] = useState(1.0);
  const [emField, setEmField] = useState(4.0);
  const [goldThickness, setGoldThickness] = useState(1.0);
  const [activeSlider, setActiveSlider] = useState(0);
  const [laserMode, setLaserMode] = useState(false);
  
  const particleProgressRef = useRef({
    alpha: { dist: 0, alive: true, lastDeath: 0, trail: [] },
    beta: { dist: 0, alive: true, lastDeath: 0, trail: [] },
    gamma: { dist: 0, alive: true, lastDeath: 0, trail: [] }
  });

  const [particles, setParticles] = useState({
    alpha: true,
    beta: false,
    gamma: false
  });

  const [experiments, setExperiments] = useState({
    gold: true,
    shield: false,
    emfield: false
  });

  const toggleParticle = (k) =>
    setParticles((p) => ({ ...p, [k]: !p[k] }));

  const toggleExperiment = (k) =>
    setExperiments((e) => ({ ...e, [k]: !e[k] }));

  // Draw enhanced source with glow effect
  function drawSource() {
    // Glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#0f0";
    
    // Main source body
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(58, 158, 74, 104);
    
    // Inner glow
    ctx.fillStyle = "rgba(0,255,0,0.1)";
    ctx.fillRect(60, 160, 70, 100);
    
    // Border highlight
    ctx.strokeStyle = "#0f0";
    ctx.lineWidth = 2;
    ctx.strokeRect(58, 158, 74, 104);
    
    // Source label with glow
    ctx.fillStyle = "#0f0";
    ctx.font = "bold 14px monospace";
    ctx.shadowBlur = 8;
    ctx.fillText("☢ RADIOACTIVE", 52, 148);
    ctx.fillText("SOURCE", 72, 270);
    
    ctx.shadowBlur = 0;
  }

  // Draw enhanced gold foil with metallic effect
  function drawGoldFoil() {
    const baseX = 360;
    const baseThickness = 150;
    const thicknessPx = baseThickness * goldThickness;
    
    // Metallic gradient
    const gradient = ctx.createLinearGradient(baseX, 120, baseX + thicknessPx, 300);
    gradient.addColorStop(0, "#d4af37");
    gradient.addColorStop(0.5, "#f4e542");
    gradient.addColorStop(1, "#b8860b");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(baseX, 120, thicknessPx, 180);
    
    // Glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(212, 175, 55, 0.5)";
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 2;
    ctx.strokeRect(baseX, 120, thicknessPx, 180);
    
    // Atomic structure overlay
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = baseX + thicknessPx / 2 + Math.cos(angle) * 25;
      const y = 210 + Math.sin(angle) * 25;
      ctx.moveTo(baseX + thicknessPx / 2, 210);
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(255,215,0,0.3)";
    ctx.stroke();
    
    ctx.fillStyle = "#fff";
    ctx.font = "12px monospace";
    ctx.shadowBlur = 0;
    ctx.fillText("GOLD FOIL", baseX - 5, 110);
    ctx.fillText(
      `${(baseThickness * goldThickness).toFixed(1)} μm`,
      baseX - 20,
      320
    );
  }

  // Draw enhanced shielding with transparency effect
  function drawShielding() {
    const mats = [
      [360, "#7a4a2e", "WOOD"],
      [440, "#888", "METAL"],
      [520, "#444", "LEAD"]
    ];
    
    mats.forEach(([x, col, name]) => {
      // Gradient for depth
      const grad = ctx.createLinearGradient(x, 120, x + 40, 300);
      grad.addColorStop(0, col);
      grad.addColorStop(1, `rgba(0,0,0,0.8)`);
      
      ctx.fillStyle = grad;
      ctx.fillRect(x, 120, 40, 180);
      
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.strokeRect(x, 120, 40, 180);
      
      ctx.fillStyle = "#fff";
      ctx.font = "10px monospace";
      ctx.fillText(name, x + 5, 115);
    });
  }

  // Draw EM field with animated waves
  function drawEMField() {
    const time = Date.now() / 500;
    
    for (let y = 90; y < H - 90; y += 25) {
      // Animated wave effect
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0, 234, 255, ${0.2 + Math.sin(time + y) * 0.1})`;
      ctx.lineWidth = 1.5;
      
      for (let x = 260; x <= 620; x += 10) {
        const waveY = y + Math.sin(time * 2 + x * 0.05) * 3;
        if (x === 260) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.stroke();
      
      // Field lines
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 234, 255, 0.15)";
      ctx.moveTo(260, y);
      ctx.lineTo(620, y);
      ctx.stroke();
    }
    
    // Field labels
    ctx.fillStyle = "#0af";
    ctx.font = "10px monospace";
    ctx.fillText("⚡ ELECTRIC FIELD", 450, 75);
    ctx.fillText("🧲 MAGNETIC FIELD", 450, 340);
  }

  // Draw enhanced straight ray with glow trail
  function drawRayStraight(y, rgb, baseRange) {
    const startX = 140;
    const range = baseRange * energy;
    if (range < 5) return;

    // Glow trail
    for (let i = 3; i >= 1; i--) {
      ctx.strokeStyle = `rgba(${rgb}, ${0.15 * i})`;
      ctx.lineWidth = 6 + i * 2;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + range, y);
      ctx.stroke();
    }
    
    // Main beam
    ctx.strokeStyle = `rgb(${rgb})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(startX + range, y);
    ctx.stroke();

    // Particle with glow
    const px = startX + (tRef.current % range);
    
    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgb(${rgb})`;
    ctx.fillStyle = `rgb(${rgb})`;
    ctx.beginPath();
    ctx.arc(px, y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(px, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
  }

  // Draw enhanced deflected ray with curve and particles
  function drawRayDeflected(yBase, rgb, factor) {
    const startX = 140;
    const length = 520 * energy;
    const deflect = (factor * emField * 140) / Math.max(energy, 0.2);

    // Glow trail
    for (let glow = 3; glow >= 1; glow--) {
      ctx.strokeStyle = `rgba(${rgb}, ${0.12 * glow})`;
      ctx.lineWidth = 7 + glow * 2;
      ctx.beginPath();
      
      for (let i = 0; i <= 100; i++) {
        const p = i / 100;
        const x = startX + length * p;
        const y = yBase + deflect * p * p;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Main beam
    ctx.strokeStyle = `rgb(${rgb})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const p = i / 100;
      const x = startX + length * p;
      const y = yBase + deflect * p * p;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Particle with glow and trail
    const p = (tRef.current % 100) / 100;
    const px = startX + length * p;
    const py = yBase + deflect * p * p;

    // Particle trail effect
    const trail = particleProgressRef.current[getParticleKey(rgb)].trail || [];
    trail.push({ x: px, y: py, life: 1 });
    if (trail.length > 8) trail.shift();
    
    trail.forEach((t, i) => {
      ctx.fillStyle = `rgba(${rgb}, ${0.2 * t.life})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 3 - i * 0.3, 0, Math.PI * 2);
      ctx.fill();
      t.life *= 0.85;
    });

    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgb(${rgb})`;
    ctx.fillStyle = `rgb(${rgb})`;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Draw enhanced laser with photon effect
  function drawLaser(y, rgb, baseRange) {
    const startX = 140;
    const length = baseRange * energy;
    
    // Photon pulse effect
    const pulse = (Date.now() / 50) % length;
    
    for (let i = 3; i >= 1; i--) {
      ctx.strokeStyle = `rgba(${rgb}, ${0.08 * i})`;
      ctx.lineWidth = i * 3;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + length, y);
      ctx.stroke();
    }
    
    ctx.strokeStyle = `rgba(${rgb}, 1)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(startX + length, y);
    ctx.stroke();
    
    // Photon packets
    for (let offset = 0; offset < length; offset += 40) {
      const pos = (pulse + offset) % length;
      ctx.fillStyle = `rgba(${rgb}, 0.8)`;
      ctx.beginPath();
      ctx.rect(startX + pos - 2, y - 2, 4, 4);
      ctx.fill();
    }
  }

  function drawLaserDeflected(yBase, rgb, factor) {
    const startX = 140;
    const length = 520 * energy;
    const deflect = (factor * emField * 140) / Math.max(energy, 0.2);
    const pulse = (Date.now() / 50) % 100;

    for (let glow = 3; glow >= 1; glow--) {
      ctx.strokeStyle = `rgba(${rgb}, ${0.1 * glow})`;
      ctx.lineWidth = glow * 2.5;
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const p = i / 100;
        const x = startX + length * p;
        const y = yBase + deflect * p * p;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = `rgba(${rgb}, 1)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const p = i / 100;
      const x = startX + length * p;
      const y = yBase + deflect * p * p;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Photon packets along curve
    for (let offset = 0; offset <= 100; offset += 15) {
      const p = ((pulse + offset) % 100) / 100;
      const x = startX + length * p;
      const y = yBase + deflect * p * p;
      ctx.fillStyle = `rgba(${rgb}, 0.7)`;
      ctx.beginPath();
      ctx.rect(x - 2, y - 2, 4, 4);
      ctx.fill();
    }
  }

  function getParticleKey(rgb) {
    if (rgb === "255,0,0") return "alpha";
    if (rgb === "0,255,255") return "beta";
    return "gamma";
  }

  function drawParticleOnPath(key, yBase, rgb, factor, baseRange = 520) {
    const startX = 140;
    const emOn = experiments.emfield;
    const length = emOn ? 520 * energy : baseRange * energy;
    if (length <= 1) return;

    const deflect = emOn ? (factor * emField * 140) / Math.max(energy, 0.2) : 0;
    const SPEED_PX = 1.5;
    const RESPAWN_DELAY = 1800;

    const state = particleProgressRef.current[key];
    const now = performance.now();

    if (!state.alive) {
      if (now - state.lastDeath >= RESPAWN_DELAY) {
        state.alive = true;
        state.dist = 0;
        state.trail = [];
      } else {
        return;
      }
    }

    state.dist += SPEED_PX;

    if (state.dist >= length) {
      state.alive = false;
      state.lastDeath = now;
      return;
    }

    const p = state.dist / length;
    const px = startX + state.dist;
    const py = yBase + deflect * p * p;

    // Trail effect
    if (!state.trail) state.trail = [];
    state.trail.push({ x: px, y: py, life: 1 });
    if (state.trail.length > 10) state.trail.shift();
    
    state.trail.forEach((t, i) => {
      ctx.fillStyle = `rgba(${rgb}, ${0.25 * t.life})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 4 - i * 0.3, 0, Math.PI * 2);
      ctx.fill();
      t.life *= 0.9;
    });

    // Core particle with glow
    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgb(${rgb})`;
    
    ctx.fillStyle = `rgba(${rgb}, 0.9)`;
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
  }

  function drawMediumLabels() {
    ctx.fillStyle = "#ccc";
    ctx.font = "11px monospace";
    ctx.shadowBlur = 0;
    
    ctx.fillText("VACUUM CHAMBER", 150, 95);
    ctx.fillText("TARGET", 380, 95);
    ctx.fillText("DETECTOR", 580, 95);
    
    if (experiments.emfield) {
      ctx.fillStyle = "#0af";
      ctx.fillText("ELECTROMAGNETIC FIELD", 410, 75);
    }
    
    if (experiments.shield) {
      ctx.fillStyle = "#aaa";
      ctx.fillText("SHIELDING", 400, 325);
    }
  }

  function drawRays() {
    const emOn = experiments.emfield;

    if (!laserMode) {
      if (particles.alpha) {
        emOn
          ? drawRayDeflected(190, "255,0,0", DEFLECT_FACTOR.alpha)
          : drawRayStraight(190, "255,0,0", BASE_RANGE.alpha);
        drawParticleOnPath("alpha", 190, "255,0,0", DEFLECT_FACTOR.alpha, BASE_RANGE.alpha);
      }
      
      if (particles.beta) {
        emOn
          ? drawRayDeflected(210, "0,255,255", DEFLECT_FACTOR.beta)
          : drawRayStraight(210, "0,255,255", BASE_RANGE.beta);
        drawParticleOnPath("beta", 210, "0,255,255", DEFLECT_FACTOR.beta, BASE_RANGE.beta);
      }
      
      if (particles.gamma) {
        emOn
          ? drawRayDeflected(230, "180,0,255", 0)
          : drawRayStraight(230, "180,0,255", BASE_RANGE.gamma);
        drawParticleOnPath("gamma", 230, "180,0,255", 0, BASE_RANGE.gamma);
      }
    } else {
      if (particles.alpha) {
        emOn
          ? drawLaserDeflected(190, "255,0,0", DEFLECT_FACTOR.alpha)
          : drawLaser(190, "255,0,0", BASE_RANGE.alpha);
        drawParticleOnPath("alpha", 190, "255,0,0", DEFLECT_FACTOR.alpha, BASE_RANGE.alpha);
      }
      
      if (particles.beta) {
        emOn
          ? drawLaserDeflected(210, "0,255,255", DEFLECT_FACTOR.beta)
          : drawLaser(210, "0,255,255", BASE_RANGE.beta);
        drawParticleOnPath("beta", 210, "0,255,255", DEFLECT_FACTOR.beta, BASE_RANGE.beta);
      }
      
      if (particles.gamma) {
        emOn
          ? drawLaserDeflected(230, "180,0,255", 0)
          : drawLaser(230, "180,0,255", BASE_RANGE.gamma);
        drawParticleOnPath("gamma", 230, "180,0,255", 0, BASE_RANGE.gamma);
      }
    }
    
    // Particle labels
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px monospace";
    if (particles.alpha) {
      ctx.fillStyle = "#ff6666";
      ctx.fillText("α Particles (He²⁺)", 20, 190);
    }
    if (particles.beta) {
      ctx.fillStyle = "#66ffff";
      ctx.fillText("β Particles (e⁻)", 20, 210);
    }
    if (particles.gamma) {
      ctx.fillStyle = "#cc88ff";
      ctx.fillText("γ Radiation (Photons)", 20, 230);
    }
    
    if (laserMode) {
      ctx.fillStyle = "#ff3366";
      ctx.font = "bold 14px monospace";
      ctx.shadowBlur = 8;
      ctx.fillText("⚡ LASER MODE ACTIVE ⚡", 260, 35);
      ctx.shadowBlur = 0;
    }
  }

  const ctx = canvasRef.current?.getContext("2d");
  
  useEffect(() => {
    if (!ctx) return;
    
    let frame = 0;
    
    function animate() {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, W, H);
      
      // Background with grid effect
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);
      
      // Grid overlay
      ctx.strokeStyle = "rgba(0, 255, 0, 0.1)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      
      drawSource();
      
      if (experiments.gold) drawGoldFoil();
      if (experiments.shield) drawShielding();
      if (experiments.emfield) drawEMField();
      
      drawMediumLabels();
      drawRays();
      
      tRef.current += 2.5;
      frame++;
      animationRef.current = requestAnimationFrame(animate);
    }
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [ctx, particles, experiments, energy, emField, goldThickness, laserMode]);

  // Keyboard controls
  useEffect(() => {
    function handleKey(e) {
      const sliders = ["energy"];
      if (experiments.gold) sliders.push("gold");
      if (experiments.emfield) sliders.push("em");

      if (e.key === "q" || e.key === "Q") {
        setActiveSlider((s) => (s - 1 + sliders.length) % sliders.length);
      }
      if (e.key === "e" || e.key === "E") {
        setActiveSlider((s) => (s + 1) % sliders.length);
      }
      if (e.key === "a" || e.key === "A") {
        adjust(sliders[activeSlider], -1);
      }
      if (e.key === "d" || e.key === "D") {
        adjust(sliders[activeSlider], +1);
      }
    }

    function adjust(type, dir) {
      if (type === "energy") {
        setEnergy((v) => Math.min(1, Math.max(0.2, v + dir * 0.02)));
      }
      if (type === "gold") {
        setGoldThickness((v) => Math.min(1.5, Math.max(1, v + dir * 0.05)));
      }
      if (type === "em") {
        setEmField((v) => Math.min(8, Math.max(4, v + dir * 0.05)));
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeSlider, experiments]);

  return (
    <div className="dexter-root">
      {/* LEFT PANEL */}
      <div className="control-panel">
        <h2>☢ RADIATION LAB</h2>

        <button
          className={experiments.gold ? "active" : ""}
          onClick={() => toggleExperiment("gold")}
        >
          🪙 GOLD FOIL
        </button>

        <button
          className={experiments.shield ? "active" : ""}
          onClick={() => toggleExperiment("shield")}
        >
          🛡️ SHIELDING
        </button>

        <button
          className={`${experiments.emfield ? "active em" : ""}`}
          onClick={() => toggleExperiment("emfield")}
        >
          ⚡ EM FIELD
        </button>

        <button
          className={laserMode ? "active laser" : ""}
          onClick={() => setLaserMode(v => !v)}
        >
          🔦 LASER VIEW
        </button>

        <div style={{ marginTop: 20 }}>
          <button
            className={`alpha ${particles.alpha ? "active" : ""}`}
            onClick={() => toggleParticle("alpha")}
          >
            ⚛️ ALPHA (α)
          </button>

          <button
            className={`beta ${particles.beta ? "active" : ""}`}
            onClick={() => toggleParticle("beta")}
          >
            ⚡ BETA (β)
          </button>

          <button
            className={`gamma ${particles.gamma ? "active" : ""}`}
            onClick={() => toggleParticle("gamma")}
          >
            🌟 GAMMA (γ)
          </button>
        </div>

        <button style={{ marginTop: 20 }} onClick={() => navigate("/")}>
          ⬅ BACK TO CONSOLE
        </button>
      </div>

      {/* RIGHT COLUMN */}
      <div className="canvas-column">
        <div className="canvas-container-black">
          <canvas ref={canvasRef} width={W} height={H} />
        </div>

        {/* SLIDER PANEL */}
        <div className="energy-panel">
          {/* Energy Slider */}
          <div className="slider-row">
            <button
              className={`slider-btn ${activeSlider === 0 ? "active" : ""}`}
              onClick={() => setActiveSlider(0)}
            >
              ⚡ ENERGY
            </button>
            <div className="slider-wrap">
              {activeSlider === 0 && (
                <div
                  className="slider-tooltip"
                  style={{ left: `${((energy - 0.2) / 0.8) * 100}%` }}
                >
                  {energy.toFixed(2)}×
                </div>
              )}
              <input
                className={`energy-slider ${activeSlider === 0 ? "selected" : ""}`}
                type="range"
                min="0.2"
                max="1"
                step="0.01"
                value={energy}
                onChange={(e) => setEnergy(+e.target.value)}
              />
            </div>
          </div>

          {/* Gold Foil Slider */}
          {experiments.gold && (
            <div className="slider-row">
              <button
                className={`slider-btn ${activeSlider === 1 ? "active" : ""}`}
                onClick={() => setActiveSlider(1)}
              >
                🪙 GOLD FOIL
              </button>
              <div className="slider-wrap">
                {activeSlider === 1 && (
                  <div
                    className="slider-tooltip"
                    style={{ left: `${((goldThickness - 1) / 0.5) * 100}%` }}
                  >
                    {goldThickness.toFixed(2)}×
                  </div>
                )}
                <input
                  className={`energy-slider ${activeSlider === 1 ? "selected" : ""}`}
                  type="range"
                  min="1"
                  max="1.5"
                  step="0.05"
                  value={goldThickness}
                  onChange={(e) => setGoldThickness(+e.target.value)}
                />
              </div>
            </div>
          )}

          {/* EM Field Slider */}
          {experiments.emfield && (
            <div className="slider-row">
              <button
                className={`slider-btn ${activeSlider === 2 ? "active" : ""}`}
                onClick={() => setActiveSlider(2)}
              >
                🧲 EM FIELD
              </button>
              <div className="slider-wrap">
                {activeSlider === 2 && (
                  <div
                    className="slider-tooltip"
                    style={{ left: `${((emField - 4) / 4) * 100}%` }}
                  >
                    {(emField - 3).toFixed(2)}×
                  </div>
                )}
                <input
                  className={`energy-slider em ${activeSlider === 2 ? "selected" : ""}`}
                  type="range"
                  min="4"
                  max="8"
                  step="0.01"
                  value={emField}
                  onChange={(e) => setEmField(+e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}