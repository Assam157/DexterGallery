import React, { useRef, useEffect, useState } from "react";

export default function NewtonThirdLawLab() {
  const canvasRef = useRef(null);

  const [fire, setFire] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [active, setActive] = useState("fire"); // fire | sim

  /* ================= KEYBOARD CONTROL ================= */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "a" && e.key !== "d") return;

      if (active === "fire") {
        if (e.key === "d") setFire(true);
      }

      if (active === "sim") {
        if (e.key === "a") setFire(false);
        if (e.key === "d") setFire(true);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  /* ================= CANVAS ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const GUN_Y = 320;
    const BARREL_OFFSET = 120;

    let gun = { x: 300, v: 0 };
    let bullet = {
      x: gun.x + BARREL_OFFSET + 20,
      y: GUN_Y + 20,
      v: 0,
      fired: false,
      trail: []
    };

    let animationId;

    function drawGun() {
      ctx.fillStyle = "#334155";
      ctx.fillRect(gun.x, GUN_Y, 140, 40);
      ctx.fillRect(gun.x + BARREL_OFFSET, GUN_Y - 10, 50, 20);
      ctx.fillStyle = "black";
      ctx.fillText("Gun", gun.x + 50, GUN_Y - 15);
    }

    function drawBullet() {
      ctx.fillStyle = "#fde047";
      bullet.trail.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#facc15";
      ctx.fill();
      ctx.fillStyle = "black";
      ctx.fillText("Bullet", bullet.x - 15, bullet.y - 15);
    }

    function drawGround() {
      ctx.strokeStyle = "#64748b";
      ctx.beginPath();
      ctx.moveTo(0, GUN_Y + 60);
      ctx.lineTo(canvas.width, GUN_Y + 60);
      ctx.stroke();
    }

    function drawText() {
      ctx.fillStyle = "black";
      ctx.fillText("Action: Gun pushes bullet forward", 20, 40);
      ctx.fillText("Reaction: Bullet pushes gun backward", 20, 65);
      ctx.fillText(
        "Forces are equal in magnitude and opposite in direction",
        20,
        95
      );
    }

    function updatePhysics() {
      if (fire && !bullet.fired) {
        bullet.v = 10;
        gun.v = -2;
        bullet.fired = true;
      }

      if (bullet.fired) {
        bullet.trail.push({ x: bullet.x, y: bullet.y });
        if (bullet.trail.length > 80) bullet.trail.shift();
      }

      bullet.x += bullet.v;
      gun.x += gun.v;

      bullet.v *= 0.995;
      gun.v *= 0.98;
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      updatePhysics();
      drawGround();
      drawGun();
      drawBullet();
      drawText();

      animationId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [fire, resetKey]);

  const btn = (key, label) => (
    <button
      onClick={() => setActive(key)}
      style={{
        background: active === key ? "#00aaff" : "#222",
        color: "#fff",
        marginRight: 6
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ color: "#fff" }}>
      <h2>🔄 Newton’s Third Law: Gun Recoil</h2>

      {/* Primary control selector */}
      <div style={{ marginBottom: 10 }}>
        {btn("fire", "Fire Control")}
        {btn("sim", "Simulation")}
      </div>

      <p>
        Active: <b>{active.toUpperCase()}</b> — use <b>A / D</b>
      </p>

      {/* Mouse controls */}
      <button onClick={() => setFire(true)}>Fire Gun</button>

      <button
        onClick={() => {
          setFire(false);
          setResetKey(k => k + 1);
        }}
      >
        Reset
      </button>

      <canvas
        ref={canvasRef}
        width={1200}
        height={500}
        style={{ border: "1px solid #555", marginTop: 10 }}
      />
    </div>
  );
}
