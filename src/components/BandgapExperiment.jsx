import React, { useEffect, useRef, useState } from "react";
import "./EMLab.css";

const W = 1600;
const H = 920;

export default function BandGapExperiment() {
  const canvasRef = useRef(null);
  const [energy, setEnergy] = useState(0.2);
  const [activeSlider,setActiveSlider]=useState(0);

  // 🔑 persistent refs (this was missing before)
  const prevLevelRef = useRef(null);
  const emissionTimerRef = useRef(0);
  const emissionYRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let t = 0;
    let raf;

    function clear() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
    }

    /* ================= ENERGY LEVEL ================= */
    function drawEnergyLevel(y, label, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(300, y);
      ctx.lineTo(800, y);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = "18px monospace";
      ctx.fillText(label, 820, y + 6);
    }

    /* ================= ELECTRON ================= */
    function drawElectron(x, y) {
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#00eaff";
      ctx.shadowColor = "#00eaff";
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    /* ================= PHOTON WAVES ================= */
let verticalWaveStartTime = null;
const VERTICAL_WAVE_LIFETIME = 5000; // 5 seconds

function drawOutgoingVerticalWave(x0, y0) {

  // Start lifetime timer once
  if (verticalWaveStartTime === null) {
    verticalWaveStartTime = performance.now();
  }

  // Check lifetime
  const elapsed = performance.now() - verticalWaveStartTime;
  if (elapsed > VERTICAL_WAVE_LIFETIME) {
    return; // stop drawing after 5 seconds
  }

  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 1.8;

  const lines = 5;
  const spacing = 6;
    const LEFT_SHIFT = 80; 

  for (let l = 0; l < lines; l++) {
    ctx.beginPath();

    for (let i = 0; i < 90; i++) {
      const progress = i / 90;

      const wave1 = Math.sin(i * 0.5 + t * 0.7 + l) * 9;
      const wave2 = Math.sin(i * 0.2 + t * 0.4) * 4;
      const ampFalloff = 1 - progress * 0.65;

       const x =
        x0 -
        LEFT_SHIFT +                     // ← left shift
        (wave1 + wave2) * ampFalloff +
        l * spacing;
      const y =
        y0 -
        i * 6 +
        (wave1 - wave2) * ampFalloff;

      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }

    ctx.stroke();
  }
}


  let diagonalWaveStartTime = null;
const DIAGONAL_WAVE_LIFETIME = 5000; // 5 seconds

function drawOutgoingDiagonalWave(x0, y0) {

  // Start lifetime timer once
  if (diagonalWaveStartTime === null) {
    diagonalWaveStartTime = performance.now();
  }

  // Check lifetime
  const elapsed = performance.now() - diagonalWaveStartTime;
  if (elapsed > DIAGONAL_WAVE_LIFETIME) {
    return; // stop drawing after 5 seconds
  }

  ctx.strokeStyle = "#ffcc88";
  ctx.lineWidth = 1.8;

  const lines = 5;
  const spacing = 6;

  for (let l = 0; l < lines; l++) {
    ctx.beginPath();

    for (let i = 0; i < 90; i++) {
      const progress = i / 90;

      const wave1 = Math.sin(i * 0.45 + t * 0.6 + l) * 8;
      const wave2 = Math.sin(i * 0.18 + t * 0.3) * 4;
      const ampFalloff = 1 - progress * 0.6;

      const x =
        x0 +
        i * 6 +
        (wave1 + wave2) * ampFalloff +
        l * spacing;

      const y =
        y0 +
        i * 5 +
        (wave1 - wave2) * ampFalloff -
        l * spacing;

      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }

    ctx.stroke();
  }
}


    function loop() {
      clear();

      /* === LEVEL POSITIONS === */
      const E0 = H / 2 + 160;
      const E1 = H / 2 + 80;
      const E2 = H / 2 - 120;

      drawEnergyLevel(E0, "E₀ (Valence)", "#5bc0ff");
      drawEnergyLevel(E1, "E₁", "#7fd1ff");
      drawEnergyLevel(E2, "E₂ (Conduction)", "#ff7676");

      /* === BAND GAP === */
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "#aaa";
      ctx.beginPath();
      ctx.moveTo(550, E1);
      ctx.lineTo(550, E2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#aaa";
      ctx.font = "15px monospace";
      ctx.fillText("Eg", 565, (E1 + E2) / 2);

      /* === DETERMINE CURRENT LEVEL === */
      let level, y;
      if (energy < 0.33) {
        level = 0;
        y = E0;
      } else if (energy < 0.66) {
        level = 1;
        y = E1;
      } else {
        level = 2;
        y = E2;
      }

      /* === ELECTRON === */
      const ex = 420 + (t % 240);
      drawElectron(ex, y + Math.sin(t * 0.08) * 5);

      /* === TRANSITION ARROW === */
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(650, E0);
      ctx.lineTo(650, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(645, y - 10);
      ctx.lineTo(650, y);
      ctx.lineTo(655, y - 10);
      ctx.stroke();

      /* === DETECT DOWNWARD TRANSITION (CORRECT) === */
      const prevLevel = prevLevelRef.current;

      if (prevLevel !== null && level < prevLevel) {
        if (prevLevel === 2 && level === 1) {
          emissionYRef.current = E1;
          emissionTimerRef.current = 45;
        }
        if (prevLevel === 1 && level === 0) {
          emissionYRef.current = E0;
          emissionTimerRef.current = 45;
        }
      }
 

if (prevLevel !== null && level > prevLevel) {
  if (prevLevel === 0 && level === 1) {
    emissionYRef.current = E0;
    emissionTimerRef.current = -45;
  }
  if (prevLevel === 1 && level === 2) {
     emissionYRef.current = E1;
    emissionTimerRef.current = -45;
  }
}


      prevLevelRef.current = level;

      /* === EMIT PHOTONS (VISIBLE FOR A WHILE) === */
      if (emissionTimerRef.current < 0) {
        drawOutgoingVerticalWave(650, emissionYRef.current);
        emissionTimerRef.current++;
      }
      else if (emissionTimerRef.current > 0){
        drawOutgoingDiagonalWave(650, emissionYRef.current);
        emissionTimerRef.current--;
     
      }

      t++;
      raf = requestAnimationFrame(loop);
    }

    loop();
    return () => cancelAnimationFrame(raf);
  }, [energy]);
  useEffect(() => {
    function onKey(e) {
  
  
      // ================= ADJUST VALUE =================
      if (e.key === "a" || e.key === "A") {
        adjust(-0.1);
      }
  
      if (e.key === "d" || e.key === "D") {
        adjust(+0.1);
      }
    }
  
    function adjust(dir) {
      
    
    
   
        setEnergy(v =>
          Math.min(1, Math.max(0, v + dir * 0.2))
        );
   
    }
  
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeSlider]);
  
  return (
    <div className="lab-canvas-wrap">
      <canvas ref={canvasRef} width={W} height={H} />

      <div className="cinema-energy">
        <div className="label">INPUT ENERGY</div>
        <div className="value">{energy.toFixed(2)}</div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={energy}
          onChange={(e) => setEnergy(+e.target.value)}
        />

        <div className="panel-hint">
          Arrow = electronic transition
          <br />
          Waves = photons emitted during downward transition
        </div>
      </div>
    </div>
  );
}
