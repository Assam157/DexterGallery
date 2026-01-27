import React, { useEffect, useRef, useState } from "react";
import "./EMLab.css";

const W = 1600;
const H = 920;

export default function AtomExperiment() {
  const canvasRef = useRef(null);

  const [energy, setEnergy] = useState(0.2);
  const [paused, setPaused] = useState(false);
  const [activeSlider,setActiveSlider]=useState(0);

  const excitation = useRef(0);       // 0 → 1 smooth excitation
  const photonState = useRef("idle"); // idle | incoming | outgoing
  const photonT = useRef(0);
  const activeElectron = useRef(0); // index of electron that transitions
  const activeElectron2 = useRef(0); // electron that transitions E1 -> E2



  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let t = 0;
    let raf;

    const cx = W / 2;
    const cy = H / 2;

    const levels = [
      { r: 90, label: "E₀", count: 2 },
      { r: 150, label: "E₁", count: 4 },
      { r: 220, label: "E₂", count: 6 },
    ];

    function clear() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
    }

    /* ================= NUCLEUS ================= */
    function drawNucleus() {
      ctx.save();
      ctx.translate(cx, cy);

      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#ff4444";
      ctx.shadowBlur = 35;
      ctx.shadowColor = "#ff4444";
      ctx.fill();
      ctx.shadowBlur = 0;

      const nucleons = [
        [-8, -6, "#ff5555"], [6, -8, "#ccc"],
        [-6, 8, "#ccc"], [8, 6, "#ff5555"],
        [0, 0, "#ff5555"]
      ];

      nucleons.forEach(([x, y, c]) => {
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = c;
        ctx.fill();
      });

      ctx.restore();
    }

    /* ================= ORBITS ================= */
    function drawOrbit(r, label) {
      ctx.strokeStyle = "rgba(120,200,255,0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#aaa";
      ctx.font = "14px monospace";
      ctx.fillText(label, cx + r + 8, cy);
    }

    /* ================= ELECTRONS ================= */
 function drawElectrons(level, idx) {
  const baseR = levels[idx].r;
  const nextR = levels[idx + 1]?.r ?? baseR;

  const angleStep = (Math.PI * 2) / level.count;

  // 🔒 90° spin-phase offset per orbit
  const spinPhaseOffset = idx * (Math.PI / 2);

  const OMEGA = 0.015; // same speed for all orbits

  for (let i = 0; i < level.count; i++) {
    // permanent angular slot
    const basePhase = i * angleStep;

    const isActive1 = idx === 0 && i === activeElectron.current;
    const isActive2 = idx === 1 && i === activeElectron2.current;

    const transitionProgress =
      isActive1 || isActive2 ? excitation.current : 0;

    // diagonal transition component
    const diagonalDrift = transitionProgress * 0.6;

    // ✅ spin-phase offset applies ALWAYS
    const a = paused
      ? basePhase + spinPhaseOffset + diagonalDrift
      : basePhase + spinPhaseOffset + diagonalDrift + t * OMEGA;

    const r =
      isActive1 || isActive2
        ? baseR + transitionProgress * (nextR - baseR)
        : baseR;

    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);

    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#00eaff";
    ctx.shadowColor = "#00eaff";
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}


    /* ================= PHOTON WAVES ================= */
    function drawPhotonWave(xStart, dir = 1) {
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < 80; i++) {
        const x = xStart + dir * i * 1;
        const y =
          cy +
          Math.sin(i * 0.5 + photonT.current * 0.15) * 10; // ⬅ slower wave
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    /* ================= LOOP ================= */
    function loop() {
      clear();

      levels.forEach(l => drawOrbit(l.r, l.label));
      drawNucleus();

      // Excitation logic (always active)
      if (energy > 0.6 && excitation.current < 1) {
        excitation.current += 0.008;
        photonState.current = "incoming";
      } else if (energy < 0.4 && excitation.current > 0) {
        excitation.current -= 0.008;
        photonState.current = "outgoing";
      }

      excitation.current = Math.max(0, Math.min(1, excitation.current));

      drawElectrons(levels[0], 0);
      drawElectrons(levels[1], 1);
      drawElectrons(levels[2], 2);

      // Photon visuals (slower motion)
      if (photonState.current === "incoming") {
        drawPhotonWave(cx - 320 + photonT.current);
        photonT.current += 1.5;
        if (photonT.current > 300) photonT.current = 0;
      }

      if (photonState.current === "outgoing") {
        drawPhotonWave(cx + photonT.current);
        photonT.current += 1.5;
        if (photonT.current > 320) photonState.current = "idle";
      }

      if (!paused) t++;
      raf = requestAnimationFrame(loop);
    }

    loop();
    return () => cancelAnimationFrame(raf);
  }, [energy, paused]);
    useEffect(() => {
    function onKey(e) {
      // ================= SLIDER SWITCH =================
      if (e.key === "q" || e.key === "Q") {
        setActiveSlider(s => (s + 1) % 2);
      }
  
      if (e.key === "e" || e.key === "E") {
        setActiveSlider(s => (s + 1) % 2);
      }
  
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
        <div className="label">EXCITATION ENERGY</div>
        <div className="value">{energy.toFixed(2)}</div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={energy}
          onChange={(e) => setEnergy(+e.target.value)}
        />

        <button
          className="cinema-btn"
          onClick={() => setPaused(p => !p)}
        >
          {paused ? "▶ Resume Rotation" : "⏸ Stop Rotation"}
        </button>

        <div className="panel-hint">
          Rotation can be frozen to observe quantum transitions
        </div>
      </div>
    </div>
  );
}
