import React, { useRef, useEffect, useState } from "react";
import "./SidebarPhysicsLab.css"

/* ===============================
   Canvas size
   =============================== */
const W = 900;
const H = 520;

/* ===============================
   Liquids (fixed)
   =============================== */
const LIQUIDS = [
  { name: "Water", density: 1.0, color: "rgba(59,130,246,0.45)" },
  { name: "Oil", density: 0.8, color: "rgba(250,204,21,0.45)" },
  { name: "Mercury", density: 13.6, color: "rgba(148,163,184,0.6)" }
];

/* ===============================
   Materials (fixed)
   =============================== */
const MATERIALS = [
  { name: "Wood", density: 0.6, color: [146, 64, 14] },
  { name: "Ice", density: 0.92, color: [103, 232, 249] },
  { name: "Aluminum", density: 2.7, color: [156, 163, 175] },
  { name: "Iron", density: 7.8, color: [75, 85, 99] }
];

export default function BuoyancyLab() {
  /* ===============================
     Refs
     =============================== */
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const materialIndexRef = useRef(0);
  const materialBlendRef = useRef(0);
  const liquidIndexRef = useRef(0);

  const submergeRef = useRef(0);
  const timeRef = useRef(0);

  /* ===============================
     State (UI)
     =============================== */
  const [materialIndex, setMaterialIndex] = useState(0);
  const [materialBlend, setMaterialBlend] = useState(0);
  const [liquidIndex, setLiquidIndex] = useState(0);

  /* ===============================
     Sync state → refs
     =============================== */
  useEffect(() => {
    materialIndexRef.current = materialIndex;
  }, [materialIndex]);

  useEffect(() => {
    materialBlendRef.current = materialBlend;
  }, [materialBlend]);

  useEffect(() => {
    liquidIndexRef.current = liquidIndex;
  }, [liquidIndex]);

  /* ===============================
     Animation loop (once)
     =============================== */
  useEffect(() => {
    function animate() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      draw(ctx);

      rafRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ===============================
     Draw
     =============================== */
  function draw(ctx) {
    const tank = { x: 250, y: 80, w: 400, h: 320 };
    const surfaceY = tank.y + 40;

    timeRef.current += 0.04;

    const material = MATERIALS[materialIndexRef.current];
    const liquid = LIQUIDS[liquidIndexRef.current];
    const blend = materialBlendRef.current;

    /* Density + color interpolation */
    const density =
      material.density * (0.7 + blend * 0.6);

    const color = material.color.map(c =>
      Math.round(c * (0.8 + blend * 0.4))
    );

    /* Buoyancy */
    const ratio = liquid.density / density;
    const targetSubmerge =
      ratio >= 1 ? 35 : Math.min(120, 120 / ratio);

    submergeRef.current +=
      (targetSubmerge - submergeRef.current) * 0.05;

    const bob =
      density < liquid.density
        ? Math.sin(timeRef.current) * 3
        : 0;

    /* Background */
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, W, H);

    /* Tank */
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.strokeRect(tank.x, tank.y, tank.w, tank.h);

    /* 🌊 Liquid with ripples */
    ctx.fillStyle = liquid.color;
    ctx.beginPath();
    ctx.moveTo(tank.x, surfaceY);

    for (let x = 0; x <= tank.w; x += 6) {
      const wave =
        Math.sin(x * 0.04 + timeRef.current * 2) * 4;
      ctx.lineTo(tank.x + x, surfaceY + wave);
    }

    ctx.lineTo(tank.x + tank.w, tank.y + tank.h);
    ctx.lineTo(tank.x, tank.y + tank.h);
    ctx.closePath();
    ctx.fill();

    /* Block */
    const blockW = 80;
    const blockH = 80;
    const blockX = tank.x + tank.w / 2 - blockW / 2;
    const blockY =
      surfaceY + submergeRef.current - blockH + bob;

    ctx.fillStyle = `rgb(${color.join(",")})`;
    ctx.fillRect(blockX, blockY, blockW, blockH);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(blockX, blockY, blockW, blockH);

    /* Labels */
    ctx.fillStyle = "#fff";
    ctx.font = "15px Arial";
    ctx.fillText(
      `${liquid.name} (ρ = ${liquid.density})`,
      tank.x + 10,
      tank.y + 25
    );

    ctx.fillText(
      `${material.name} (ρ ≈ ${density.toFixed(2)})`,
      blockX - 10,
      blockY - 10
    );

    ctx.fillStyle = "#34d399";
    ctx.fillText(
      density < liquid.density
        ? "Status: FLOATING"
        : "Status: SINKING",
      20,
      40
    );
  }

  /* ===============================
     UI
     =============================== */
  return (
    <div style={{ background: "#020617", padding: 16 }}>
      <h2 style={{ color: "#38bdf8" }}>
        🌊 Buoyancy — Physics Lab
      </h2>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          border: "2px solid #334155",
          borderRadius: 12,
          display: "block",
          marginBottom: 14
        }}
      />

      <div style={{ color: "white", maxWidth: 460 }}>
        {/* Liquid */}
        <label>Liquid</label>
        <select
          value={liquidIndex}
          onChange={e => setLiquidIndex(+e.target.value)}
        >
          {LIQUIDS.map((l, i) => (
            <option key={l.name} value={i}>
              {l.name}
            </option>
          ))}
        </select>

        {/* Material */}
        <label style={{ marginTop: 10, display: "block" }}>
          Material
        </label>
        <select
          value={materialIndex}
          onChange={e => setMaterialIndex(+e.target.value)}
        >
          {MATERIALS.map((m, i) => (
            <option key={m.name} value={i}>
              {m.name}
            </option>
          ))}
        </select>

        {/* Slider */}
        <label style={{ marginTop: 10, display: "block" }}>
          Material Adjustment
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={materialBlend}
          onChange={e => setMaterialBlend(+e.target.value)}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
