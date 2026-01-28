  import React, { useEffect, useRef, useState } from "react";
import "./EMLab.css";

const W = 1600;
const H = 920;

export default function BandGapExperiment() {
  const canvasRef = useRef(null);
  const [energy, setEnergy] = useState(0.2);
  const [activeSlider,setActiveSLider]=useState("");

  /* ===== Refs ===== */
  const prevLevelRef = useRef(null);

  // Emission (downward)
  const emitPhoton = useRef(false);
  const emitT = useRef(0);
  const emitY = useRef(0);

  // Absorption (upward)
  const absorbPhoton = useRef(false);
  const absorbT = useRef(0);
  const absorbY = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let t = 0;
    let raf;

    const BANDGAP_X = 550;
    const EMIT_X = 650;
    const ABSORB_START_X = 350;

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

    /* ================= ATOM-STYLE PHOTON WAVE ================= */
 /* ================= PHOTON WAVES ================= */

// Incoming photon (absorption) → left → right
function drawIncomingPhoton(xStart, y) {
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 2;
  ctx.beginPath();

  const Y_OFFSET = -90;
  const X_OFFSET = -180;

  for (let i = 0; i < 140; i++) {
    const x = xStart + i * 1.5 + X_OFFSET;

    const yWave =
      y +
      Y_OFFSET +
      Math.sin(i * 0.5 + t * 0.15) * 10;

    if (i === 0) ctx.moveTo(x, yWave);
    else ctx.lineTo(x, yWave);
  }

  ctx.stroke();
}

// Outgoing photon (emission) → right → left
function drawOutgoingPhoton(xStart, y) {
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 2;
  ctx.beginPath();

  const Y_OFFSET = -90;
  const X_OFFSET = 180;

  for (let i = 0; i < 140; i++) {
    const x = xStart - i * 1.5 + X_OFFSET;

    const yWave =
      y +
      Y_OFFSET +
      Math.sin(i * 0.5 + t * 0.15) * 10;

    if (i === 0) ctx.moveTo(x, yWave);
    else ctx.lineTo(x, yWave);
  }

  ctx.stroke();
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
      ctx.moveTo(BANDGAP_X, E1);
      ctx.lineTo(BANDGAP_X, E2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#aaa";
      ctx.font = "15px monospace";
      ctx.fillText("Eg", BANDGAP_X + 12, (E1 + E2) / 2);

      /* === CURRENT LEVEL === */
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
      ctx.moveTo(EMIT_X, E0);
      ctx.lineTo(EMIT_X, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(EMIT_X - 6, y - 10);
      ctx.lineTo(EMIT_X, y);
      ctx.lineTo(EMIT_X + 6, y - 10);
      ctx.stroke();

      /* === TRANSITION DETECTION === */
      const prev = prevLevelRef.current;

      // 🔽 DOWNWARD → emission
      if (prev !== null && level < prev) {
        emitPhoton.current = true;
        emitT.current = 0;
        emitY.current = y;
      }

      // 🔼 UPWARD → absorption
      if (prev !== null && level > prev) {
        absorbPhoton.current = true;
        absorbT.current = 0;
        absorbY.current = y;
      }

      prevLevelRef.current = level;

      /* === EMITTED PHOTON (LEFTWARD) === */
      if (emitPhoton.current) {
         drawOutgoingPhoton(
    EMIT_X,
    emitY.current
  );
        emitT.current += 1.5;
        if (emitT.current > 140) emitPhoton.current = false;
      }

      /* === ABSORBED PHOTON (FROM LEFT) === */
      if (absorbPhoton.current) {
         drawIncomingPhoton(
    ABSORB_START_X,
    absorbY.current
  );
        absorbT.current += 1.5;
        if (absorbT.current > 140) absorbPhoton.current = false;
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
