import React, { useRef, useEffect, useState } from "react";

export default function MomentumConservationLab() {
  const canvasRef = useRef(null);

  const [running, setRunning] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const [vA, setVA] = useState(4);          // initial velocity of Cart A
  const [active, setActive] = useState("sim"); // sim | velocity

  /* ================= KEYBOARD CONTROL ================= */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "a" && e.key !== "d") return;
      const dir = e.key === "d" ? 1 : -1;

      if (active === "sim") {
        if (dir === 1) setRunning(true);
        if (dir === -1) setRunning(false);
      }

      if (active === "velocity" && !running) {
        setVA(v => Math.max(0, +(v + dir * 0.5).toFixed(1)));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, running]);

  /* ================= CANVAS ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const CART_W = 50;
    const CART_H = 30;
    const WALL_X = 790;

    let cart1 = { x: 100, v: vA, m: 2 };
    let cart2 = { x: 500, v: 0, m: 2 };

    let animationId;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (running) {
        cart1.x += cart1.v;
        cart2.x += cart2.v;

        /* Elastic collision between carts */
        if (cart1.x + CART_W >= cart2.x) {
          const v1 =
            ((cart1.m - cart2.m) / (cart1.m + cart2.m)) * cart1.v;
          const v2 =
            ((2 * cart1.m) / (cart1.m + cart2.m)) * cart1.v;

          cart1.v = v1;
          cart2.v = v2;
        }

        /* Cart B crashes into wall */
        if (cart2.x + CART_W >= WALL_X) {
          cart2.x = WALL_X - CART_W;
          cart2.v = 0;
        }
      }

      /* Wall */
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(WALL_X, 250, 10, 150);
      ctx.fillStyle = "black";
      ctx.fillText("WALL", WALL_X - 15, 240);

      /* Cart A */
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(cart1.x, 300, CART_W, CART_H);
      ctx.fillStyle = "black";
      ctx.fillText("Cart A", cart1.x, 290);
      ctx.fillText(`v = ${cart1.v.toFixed(1)}`, cart1.x, 345);

      /* Cart B */
      ctx.fillStyle = "#f97316";
      ctx.fillRect(cart2.x, 300, CART_W, CART_H);
      ctx.fillStyle = "black";
      ctx.fillText("Cart B", cart2.x, 290);
      ctx.fillText(`v = ${cart2.v.toFixed(1)}`, cart2.x, 345);

      animationId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [running, resetKey, vA]);

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
    <div style={{ color: "#fff", background: "#020617", padding: 12 }}>
      <h2>🚀 Conservation of Momentum (Wall Crash)</h2>

      <div style={{ marginBottom: 10 }}>
        {btn("sim", "Simulation")}
        {btn("velocity", "Cart A Velocity")}
      </div>

      <p>
        Active Mode: <b>{active.toUpperCase()}</b> — use <b>A / D</b>
      </p>

      <button onClick={() => setRunning(true)}>Start</button>
      <button onClick={() => setRunning(false)}>Pause</button>
      <button
        onClick={() => {
          setRunning(false);
          setResetKey(k => k + 1);
        }}
      >
        Reset
      </button>

      {!running && (
        <div style={{ marginTop: 10 }}>
          <label>
            Cart A Initial Velocity: <b>{vA}</b>
          </label>
          <input
            type="range"
            min="0"
            max="8"
            step="0.5"
            value={vA}
            onChange={e => setVA(+e.target.value)}
          />
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: "1px solid #555", marginTop: 10 }}
      />
    </div>
  );
}
