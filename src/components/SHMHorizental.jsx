import React, { useRef, useEffect, useState } from "react";

export default function HorizontalSpringWithFriction() {
  const canvasRef = useRef(null);
  const graphRef = useRef(null);
  const rafRef = useRef(null);

  /* ===== Controls ===== */
  const [A, setA] = useState(80);
  const [omega0, setOmega0] = useState(3);
  const [gamma, setGamma] = useState(0.02);
  const [phase, setPhase] = useState(0);
  const [running, setRunning] = useState(true);

  const [active, setActive] = useState("A");

  const t0 = useRef(null);
  const data = useRef([]);

  /* ================= KEYBOARD CONTROL ================= */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== "a" && e.key !== "d") return;
      const dir = e.key === "d" ? 1 : -1;

      if (active === "A")
        setA(v => Math.min(120, Math.max(20, v + dir * 5)));

      if (active === "omega")
        setOmega0(v => +(Math.min(6, Math.max(1, v + dir * 0.1))).toFixed(1));

      if (active === "gamma")
        setGamma(v =>
          +(Math.min(0.05, Math.max(0, v + dir * 0.005))).toFixed(3)
        );

      if (active === "phase")
        setPhase(v => +(v + dir * 0.2).toFixed(2));
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [active]);

  /* ================= ANIMATION ================= */
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const gctx = graphRef.current.getContext("2d");

    const W = canvasRef.current.width;
    const H = canvasRef.current.height;

    function drawSpring(x1, x2, y) {
      const coils = 14;
      const amp = 6;
      const len = x2 - x1;
      const step = len / coils;

      ctx.strokeStyle = "#aaa";
      ctx.beginPath();
      ctx.moveTo(x1, y);

      for (let i = 1; i < coils; i++) {
        const dy = i % 2 === 0 ? -amp : amp;
        ctx.lineTo(x1 + i * step, y + dy);
      }

      ctx.lineTo(x2, y);
      ctx.stroke();
    }

    function animate(time) {
      if (!running) return;

      if (!t0.current) t0.current = time;
      const t = (time - t0.current) / 1000;

      const omega = Math.sqrt(
        Math.max(omega0 * omega0 - gamma * gamma, 0.01)
      );

      const x = A * Math.exp(-gamma * t) * Math.cos(omega * t + phase);

      ctx.clearRect(0, 0, W, H);

      const floorY = H - 40;
      const block = 40;
      const eqX = W / 2;
      const massX = eqX + x;
      const massY = floorY - block;

      /* ground */
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(W, floorY);
      ctx.stroke();

      /* wall */
      ctx.fillStyle = "#777";
      ctx.fillRect(20, massY - 20, 10, 80);

      /* spring */
      drawSpring(30, massX - block / 2, massY + block / 2);

      /* mass */
      ctx.fillStyle = "#ff5555";
      ctx.fillRect(massX - block / 2, massY, block, block);

      /* equilibrium */
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "#444";
      ctx.beginPath();
      ctx.moveTo(eqX, massY - 30);
      ctx.lineTo(eqX, floorY);
      ctx.stroke();
      ctx.setLineDash([]);

      /* graph */
      data.current.push(x);
      if (data.current.length > 260) data.current.shift();

      gctx.clearRect(0, 0, 320, 200);
      gctx.strokeStyle = "#888";
      gctx.beginPath();
      gctx.moveTo(40, 10);
      gctx.lineTo(40, 190);
      gctx.lineTo(300, 190);
      gctx.stroke();

      gctx.strokeStyle = "#00aaff";
      gctx.beginPath();
      data.current.forEach((v, i) => {
        const gx = 40 + i;
        const gy = 100 - v * 0.5;
        i === 0 ? gctx.moveTo(gx, gy) : gctx.lineTo(gx, gy);
      });
      gctx.stroke();

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [A, omega0, gamma, phase, running]);

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
    <div style={{ display: "flex", gap: 20 }}>
      <canvas ref={canvasRef} width={420} height={240} />

      <div>
        <canvas ref={graphRef} width={320} height={200} />

        <div style={{ margin: "10px 0" }}>
          {btn("A", "Amplitude")}
          {btn("omega", "ω₀")}
          {btn("gamma", "γ")}
          {btn("phase", "Phase")}
        </div>

        <p>Active control: <b>{active.toUpperCase()}</b> (A / D)</p>

        <input type="range" min="20" max="120" value={A}
          onChange={e => setA(+e.target.value)} />

        <input type="range" min="1" max="6" step="0.1" value={omega0}
          onChange={e => setOmega0(+e.target.value)} />

        <input type="range" min="0" max="0.05" step="0.005" value={gamma}
          onChange={e => setGamma(+e.target.value)} />

        <input type="range" min="-6.28" max="6.28" step="0.1" value={phase}
          onChange={e => setPhase(+e.target.value)} />

        <button onClick={() => {
          t0.current = null;
          setRunning(r => !r);
        }}>
          {running ? "Pause" : "Resume"}
        </button>
      </div>
    </div>
  );
}
