import React, { useRef, useEffect, useState } from "react";
import "./TidesMoonLab.css";
import BulgeGraph from "./BulgeGraph";

const W = 820;
const H = 460;

export default function TidesMoonLab() {
  const canvasRef = useRef(null);
  const [angle, setAngle] = useState(90);
  const [autoOrbit, setAutoOrbit] = useState(false);

  const bgImg = useRef(new Image());
  const earthImg = useRef(new Image());
  const moonImg = useRef(new Image());

  useEffect(() => {
    bgImg.current.src = "/sky.jpg";
    earthImg.current.src = "/earth.png";
    moonImg.current.src = "/moon.png";
  }, []);

  // ⌨ Keyboard control
  useEffect(() => {
    const key = (e) => {
      if (e.key === "a" || e.key === "A")
        setAngle(a => (a - 4 + 360) % 360);
      if (e.key === "d" || e.key === "D")
        setAngle(a => (a + 4) % 360);
      if (e.key === "r" || e.key === "R")
        setAngle(90);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  // 🕒 Auto orbit
  useEffect(() => {
    if (!autoOrbit) return;
    const id = setInterval(() => {
      setAngle(a => (a + 1) % 360);
    }, 50);
    return () => clearInterval(id);
  }, [autoOrbit]);

  // 🌊 Physics
  const bulgeStrength =
    Math.abs(Math.cos((angle * Math.PI) / 180)) * 35 + 10;

  const tideType =
    angle % 180 === 0
      ? "Spring Tide"
      : angle % 90 === 0
      ? "Neap Tide"
      : "Intermediate Tide";

  // 🎨 Draw
  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");

    const cx = W / 2;
    const cy = H / 2;
    const orbitR = 160;

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(bgImg.current, 0, 0, W, H);

    // Orbit
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
    ctx.stroke();

    // Tidal bulge
    ctx.fillStyle = "rgba(56,189,248,0.45)";
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      55 + bulgeStrength,
      55,
      (angle * Math.PI) / 180,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Earth
    ctx.drawImage(earthImg.current, cx - 45, cy - 45, 90, 90);

    // Moon
    const mx = cx + orbitR * Math.cos((angle * Math.PI) / 180);
    const my = cy - orbitR * Math.sin((angle * Math.PI) / 180);
    ctx.drawImage(moonImg.current, mx - 18, my - 18, 36, 36);
  }, [angle, bulgeStrength]);

  return (
    <div className="tide-lab">
      <h2>🌊 Moon–Earth Tides Simulation</h2>

      <canvas ref={canvasRef} width={W} height={H} />

      {/* Readings */}
      <div className="info section">
        <span>🌙 Angle: <b>{angle}°</b></span>
        <span>🌊 Tide: <b>{tideType}</b></span>
        <span>💧 Bulge: <b>{bulgeStrength.toFixed(1)}</b></span>
      </div>

      {/* Controls */}
      <div className="controls section">
        <button onClick={() => setAngle(a => (a - 5 + 360) % 360)}>A ◀</button>

        <input
          type="range"
          min="0"
          max="360"
          value={angle}
          onChange={e => setAngle(Number(e.target.value))}
        />

        <button onClick={() => setAngle(a => (a + 5) % 360)}>▶ D</button>
      </div>

      <button
        className={`orbit-btn ${autoOrbit ? "active" : ""}`}
        onClick={() => setAutoOrbit(o => !o)}
      >
        {autoOrbit ? "⏸ Auto Orbit ON" : "▶ Auto Orbit OFF"}
      </button>

      <button className="reset" onClick={() => setAngle(90)}>
        Reset (R)
      </button>

      {/* 📈 Bulge graph */}
      <BulgeGraph angle={angle} bulge={bulgeStrength} />
    </div>
  );
}
