import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RadiationDexterLab.css";
import "./ExperimentLayout.css"

const W = 700;
const H = 420;

const BASE_RANGE = {
  alpha: 220,
  beta: 360,
  gamma: 720
};

// Correct EM deflection directions
const DEFLECT_FACTOR = {
  alpha: -0.15,
  beta: 0.6,
  gamma: 0.0
};

export default function RadiationDexterLab() {
  const canvasRef = useRef(null);
  const tRef = useRef(0);
  const navigate = useNavigate(); // 👈 added

  /* SLIDERS */
  const [energy, setEnergy] = useState(1.0);
  const [emField, setEmField] = useState(4.0);
  const [goldThickness, setGoldThickness] = useState(1.0); // 👈 ADD
  const [activeSlider, setActiveSlider] = useState(0);
  const [laserMode, setLaserMode] = useState(false);
    const particleProgressRef = useRef({
  alpha: { dist: 0, alive: true, lastDeath: 0 },
  beta:  { dist: 0, alive: true, lastDeath: 0 },
  gamma: { dist: 0, alive: true, lastDeath: 0 }
});





  /* PARTICLE SWITCHES */
  const [particles, setParticles] = useState({
    alpha: true,
    beta: false,
    gamma: false
  });

  /* EXPERIMENT TOGGLES */
  const [experiments, setExperiments] = useState({
    gold: true,
    shield: false,
    emfield: false
  });

  const toggleParticle = (k) =>
    setParticles((p) => ({ ...p, [k]: !p[k] }));

  const toggleExperiment = (k) =>
    setExperiments((e) => ({ ...e, [k]: !e[k] }));

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    
    function drawSource() {
      ctx.fillStyle = "#333";
      ctx.fillRect(60, 160, 70, 100);
      ctx.fillStyle = "#0f0";
      ctx.fillText("SOURCE", 58, 150);
    }
 function drawLaser(y, rgb, baseRange) {
  const startX = 140;
  const length = baseRange * energy;

  // ================= SUBTLE GLOW =================
  for (let i = 3; i >= 1; i--) {
    ctx.strokeStyle = `rgba(${rgb},${0.03 * i})`;
    ctx.lineWidth = i * 2.6;   // 🔹 very thin glow
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(startX + length, y);
    ctx.stroke();
  }

  // ================= ULTRA-THIN CORE =================
  ctx.strokeStyle = `rgba(${rgb},1.9)`;
  ctx.lineWidth = 0.9;         // 🔹 thinner than particle core
  ctx.beginPath();
  ctx.moveTo(startX, y);
  ctx.lineTo(startX + length, y);
  ctx.stroke();
}




    function drawRayStraight(y, rgb, baseRange) {
      const startX = 140;
      const range = baseRange * energy;
      if (range < 5) return;

      const px = startX + (tRef.current % range);

      ctx.strokeStyle = `rgb(${rgb})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + range, y);
      ctx.stroke();

      ctx.fillStyle = `rgb(${rgb})`;
      ctx.beginPath();
      ctx.arc(px, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

  function drawRayDeflected(yBase, rgb, factor) {
  const startX = 140;
  const length = 520 * energy;
  const deflect = (factor * emField * 140) / Math.max(energy, 0.2);

  // =====================
  // DRAW RAY
  // =====================
  ctx.strokeStyle = `rgb(${rgb})`;
  ctx.lineWidth = 3;
  ctx.beginPath();

  for (let i = 0; i <= 100; i++) {
    const p = i / 100;
    const x = startX + length * p;
    const y = yBase + deflect * p * p;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // =====================
  // PARTICLE (SAME CURVE)
  // =====================
  const p = (tRef.current % 100) / 100;   // normalized parameter
  const px = startX + length * p;
  const py = yBase + deflect * p * p;

  ctx.fillStyle = `rgb(${rgb})`;
  ctx.beginPath();
  ctx.arc(px, py, 5, 0, Math.PI * 2);
  ctx.fill();
}


     function drawGoldFoil() {
  const baseX = 360;
  const baseThickness = 150;               // thin real foil
  const thicknessPx = baseThickness * goldThickness;

  ctx.fillStyle = "#d4af37";
  ctx.fillRect(baseX, 120, thicknessPx, 180);

  ctx.strokeStyle = "#aa8c2e";
  ctx.strokeRect(baseX, 120, thicknessPx, 180);

  ctx.fillStyle = "#fff";
  ctx.font = "12px monospace";
  ctx.fillText("GOLD FOIL", baseX - 5, 110);
  ctx.fillText(
    `t = ${(baseThickness * goldThickness).toFixed(1)} μm`,
    baseX - 20,
    320
  );
}

    function drawShielding() {
      const mats = [
        [360, "#7a4a2e"],
        [440, "#888"],
        [520, "#444"]
      ];
      mats.forEach(([x, col]) => {
        ctx.fillStyle = col;
        ctx.fillRect(x, 120, 40, 180);
      });
    }
   function drawLaserDeflected(yBase, rgb, factor) {
  const startX = 140;
  const length = 520 * energy;

  const deflect =
    (factor * emField * 140) / Math.max(energy, 0.2);

  // ================= GLOW (SOFT, BEHIND) =================
  for (let glow = 4; glow >= 1; glow--) {
    ctx.strokeStyle = `rgba(${rgb},${0.035 * glow})`;
    ctx.lineWidth = glow * 2.4;
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

  // ================= TRUE CORE LASER =================
  ctx.strokeStyle = `rgba(${rgb},1)`;   // 🔥 sharp core
  ctx.lineWidth = 0.9;                  // 🔥 same as straight laser
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


    function drawEMField() {
      ctx.strokeStyle = "rgba(0,234,255,0.3)";
      for (let y = 90; y < H - 90; y += 25) {
        ctx.beginPath();
        ctx.moveTo(260, y);
        ctx.lineTo(620, y);
        ctx.stroke();
      }
    }
    function drawMediumLabels() {
  ctx.fillStyle = "#000";
  ctx.font = "12px monospace";

  ctx.fillText("VACUUM / AIR", 140, 100);
  ctx.fillText("TARGET REGION", 360, 100);
  ctx.fillText("DETECTOR ZONE", 560, 100);

  if (experiments.emfield) {
    ctx.fillText("E ⟂ B FIELD REGION", 420, 80);
  }

  if (experiments.shield) {
    ctx.fillText("SHIELDING MATERIALS", 400, 330);
    ctx.fillText("WOOD → METAL → LEAD", 380, 350);
  }
}

 function drawRays() {
  const emOn = experiments.emfield;

  if (!laserMode) {
    // ================= NORMAL PARTICLE VIEW =================
    if (particles.alpha) {
      emOn
        ? drawRayDeflected(190, "255,0,0", DEFLECT_FACTOR.alpha)
        : drawRayStraight(190, "255,0,0", BASE_RANGE.alpha);
    }

    if (particles.beta) {
      emOn
        ? drawRayDeflected(210, "0,255,255", DEFLECT_FACTOR.beta)
        : drawRayStraight(210, "0,255,255", BASE_RANGE.beta);
    }

    if (particles.gamma) {
      emOn
        ? drawRayDeflected(230, "180,0,255", DEFLECT_FACTOR.gamma)
        : drawRayStraight(230, "180,0,255", BASE_RANGE.gamma);
    }
  } else {
    // ================= LASER + PARTICLES =================
    if (particles.alpha) {
      emOn
        ? drawLaserDeflected(190, "255,0,0", DEFLECT_FACTOR.alpha)
        : drawLaser(190, "255,0,0", BASE_RANGE.alpha);

       drawParticleOnPath(
  "alpha",
  190,
  "255,0,0",
  DEFLECT_FACTOR.alpha,
  BASE_RANGE.alpha
);

 

    }

    if (particles.beta) {
      emOn
        ? drawLaserDeflected(210, "0,255,255", DEFLECT_FACTOR.beta)
        : drawLaser(210, "0,255,255", BASE_RANGE.beta);

 

drawParticleOnPath(
  "beta",
  210,
  "0,255,255",
  DEFLECT_FACTOR.beta,
  BASE_RANGE.beta
);

 

    }

    if (particles.gamma) {
      // gamma NEVER deflects
      emOn
        ? drawLaserDeflected(230, "180,0,255", 0)
        : drawLaser(230, "180,0,255", BASE_RANGE.gamma);

      drawParticleOnPath(
  "gamma",
  230,
  "180,0,255",
  0,
  BASE_RANGE.gamma
);
    }
  }

  // ================= LABELS =================
  ctx.fillStyle = "#000";
  ctx.font = "12px monospace";

  if (particles.alpha) ctx.fillText("α (He²⁺)", 20, 190);
  if (particles.beta) ctx.fillText("β (e⁻)", 20, 210);
  if (particles.gamma) ctx.fillText("γ (Photon)", 20, 230);

  if (laserMode) {
    ctx.fillStyle = "#d00";
    ctx.fillText("LASER MODE (PHYSICS-LOCKED)", 240, 30);
  }
}
 function drawParticleOnPath(
  key,
  yBase,
  rgb,
  factor,
  baseRange = 520
) {
  const startX = 140;
  const emOn = experiments.emfield;

  const length = emOn
    ? 520 * energy
    : baseRange * energy;

  if (length <= 1) return;

  const deflect = emOn
    ? (factor * emField * 140) / Math.max(energy, 0.2)
    : 0;

  const SPEED_PX = 1.2;          // 🔒 constant speed
  const RESPAWN_DELAY = 2000;    // 🔒 2 seconds

  const state = particleProgressRef.current[key];
  const now = performance.now();

  // ================= DEAD STATE =================
  if (!state.alive) {
    if (now - state.lastDeath >= RESPAWN_DELAY) {
      // respawn
      state.alive = true;
      state.dist = 0;
    } else {
      return; // invisible during cooldown
    }
  }

  // ================= MOVE =================
  state.dist += SPEED_PX;

  // reached detector → kill immediately
  if (state.dist >= length) {
    state.alive = false;
    state.lastDeath = now;
    return; // do NOT draw this frame
  }

  const p = state.dist / length;

  const px = startX + state.dist;
  const py = yBase + deflect * p * p;

  // ================= BRIGHT HALF-AREA PARTICLE =================
  ctx.save();

  ctx.fillStyle = `rgba(${rgb},0.28)`;
  ctx.beginPath();
  ctx.arc(px, py, 9.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(${rgb},0.55)`;
  ctx.beginPath();
  ctx.arc(px, py, 5.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(px, py, 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}




    function loop() {
      ctx.clearRect(0, 0, W, H);
  
      drawSource();

      if (experiments.gold) drawGoldFoil();
      if (experiments.shield) drawShielding();
      if (experiments.emfield) drawEMField();

      drawMediumLabels();

      drawRays();
      
     
      

      tRef.current += 3;
      requestAnimationFrame(loop);
    }

    ctx.font = "14px monospace";
    loop();
  }, [particles, experiments, energy, emField, goldThickness]);
  useEffect(() => {
  function handleKey(e) {
    const sliders = [];

    // build active slider list dynamically
    sliders.push("energy");
    if (experiments.gold) sliders.push("gold");
    if (experiments.emfield) sliders.push("em");

    // =======================
    // CYCLE SLIDERS
    // =======================
    if (e.key === "q" || e.key === "Q") {
      setActiveSlider((s) => (s - 1 + sliders.length) % sliders.length);
    }

    if (e.key === "e" || e.key === "E") {
      setActiveSlider((s) => (s + 1) % sliders.length);
    }

    // =======================
    // ADJUST CURRENT SLIDER
    // =======================
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
      setGoldThickness((v) =>
        Math.min(1.5, Math.max(1, v + dir * 0.05))
      );
    }

    if (type === "em") {
      setEmField((v) =>
        Math.min(8, Math.max(4, v + dir * 0.05))
      );
    }
  }

  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, [activeSlider, experiments]);


 return (
  <div className="dexter-root">
    {/* ================= LEFT PANEL ================= */}
    <div className="control-panel">
      <h2>☢ RADIATION LAB</h2>

      <button
        className={experiments.gold ? "active" : ""}
        onClick={() => toggleExperiment("gold")}
      >
        GOLD
      </button>

      <button
        className={experiments.shield ? "active" : ""}
        onClick={() => toggleExperiment("shield")}
      >
        SHIELD
      </button>

      <button
        className={experiments.emfield ? "active em" : ""}
        onClick={() => toggleExperiment("emfield")}
      >
        EM
      </button>

      <button
        className={laserMode ? "active laser" : ""}
        onClick={() => setLaserMode(v => !v)}
      >
        LASER VIEW
      </button>

      <div style={{ marginTop: 20 }}>
        <button
          className={`alpha ${particles.alpha ? "active" : ""}`}
          onClick={() => toggleParticle("alpha")}
        >
          α ALPHA
        </button>

        <button
          className={`beta ${particles.beta ? "active" : ""}`}
          onClick={() => toggleParticle("beta")}
        >
          β BETA
        </button>

        <button
          className={`gamma ${particles.gamma ? "active" : ""}`}
          onClick={() => toggleParticle("gamma")}
        >
          γ GAMMA
        </button>
      </div>

      <button style={{ marginTop: 20 }} onClick={() => navigate("/")}>
        ⬅ BACK TO CONSOLE
      </button>
    </div>

    {/* ================= RIGHT COLUMN ================= */}
    <div className="canvas-column">
      {/* CANVAS */}
      <div className="canvas-container-black">
        <canvas ref={canvasRef} width={W} height={H} />
      </div>

      {/* ================= SLIDER PANEL ================= */}
      <div className="energy-panel">

        {/* ===== ENERGY ===== */}
        <div className="slider-row">
          <button
            className={`slider-btn ${activeSlider === 0 ? "active" : ""}`}
            onClick={() => setActiveSlider(0)}
          >
            ENERGY
          </button>

          <div className="slider-wrap">
            {activeSlider === 0 && (
              <div
                className="slider-tooltip"
                style={{
                  left: `${((energy - 0.2) / 0.8) * 100}%`
                }}
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

        {/* ===== GOLD ===== */}
        {experiments.gold && (
          <div className="slider-row">
            <button
              className={`slider-btn ${activeSlider === 1 ? "active" : ""}`}
              onClick={() => setActiveSlider(1)}
            >
              GOLD FOIL
            </button>

            <div className="slider-wrap">
              {activeSlider === 1 && (
                <div
                  className="slider-tooltip"
                  style={{
                    left: `${((goldThickness - 1) / 0.5) * 100}%`
                  }}
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

        {/* ===== EM FIELD ===== */}
        {experiments.emfield && (
          <div className="slider-row">
            <button
              className={`slider-btn ${activeSlider === 2 ? "active" : ""}`}
              onClick={() => setActiveSlider(2)}
            >
              EM FIELD
            </button>

            <div className="slider-wrap">
              {activeSlider === 2 && (
                <div
                  className="slider-tooltip"
                  style={{
                    left: `${((emField - 4) / 4) * 100}%`
                  }}
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



