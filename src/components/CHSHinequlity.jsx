import React, { useRef, useEffect, useState } from "react";
import "./QuantumLab.css";

/* ================= CONSTANTS ================= */
const W = 1200;
const H = 600;
const TRIAL_RATE = 25;

/* ================= COMPONENT ================= */
export default function CHSHInequalityLab() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const trialIntervalRef = useRef(null);
  const phaseRef = useRef(0);

  /* ================= ANGLES ================= */
  const [A, setA] = useState(0);
  const [Ap, setAp] = useState(45);
  const [B, setB] = useState(22.5);
  const [Bp, setBp] = useState(67.5);

  /* ===== ACTIVE CONTROL ===== */
  const [activeAngle, setActiveAngle] = useState("A");
  // "A" | "Ap" | "B" | "Bp"

  /* ================= CONTROL ================= */
  const [running, setRunning] = useState(true);
  const [showLines, setShowLines] = useState(false);
  const [flash, setFlash] = useState(null);

  /* ================= TRIAL DATA ================= */
  const trialsRef = useRef({
    AB: [],
    ABp: [],
    ApB: [],
    ApBp: [],
    count: 0,
  });

  /* ================= CORRELATION ================= */
  const E = (arr) =>
    arr.length === 0 ? 0 : arr.reduce((s, v) => s + v, 0) / arr.length;

  const S = Math.abs(
    E(trialsRef.current.AB) -
      E(trialsRef.current.ABp) +
      E(trialsRef.current.ApB) +
      E(trialsRef.current.ApBp)
  );

  /* ================= KEYBOARD (A / D) ================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!["a", "A", "d", "D"].includes(e.key)) return;
      const delta = e.key.toLowerCase() === "a" ? -1 : 1;

      const clamp = (v) => Math.min(180, Math.max(0, v + delta));

      if (activeAngle === "A") setA(clamp);
      if (activeAngle === "Ap") setAp(clamp);
      if (activeAngle === "B") setB(clamp);
      if (activeAngle === "Bp") setBp(clamp);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeAngle]);

  /* ================= TRIAL LOOP ================= */
  useEffect(() => {
    if (running) {
      trialIntervalRef.current = setInterval(runTrial, 1000 / TRIAL_RATE);
    } else {
      clearInterval(trialIntervalRef.current);
      setShowLines(true);
    }
    return () => clearInterval(trialIntervalRef.current);
  }, [running]);

  /* ================= DRAW LOOP ================= */
  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [showLines, flash, A, Ap, B, Bp]);

  /* ================= SINGLE TRIAL ================= */
  const runTrial = () => {
    const settings = [
      ["AB", A, B],
      ["ABp", A, Bp],
      ["ApB", Ap, B],
      ["ApBp", Ap, Bp],
    ];
    const [key, a, b] = settings[Math.floor(Math.random() * 4)];

    const theta = ((a - b) * Math.PI) / 180;
    const same = Math.cos(theta) ** 2;

    const Aout = Math.random() < 0.5 ? 1 : -1;
    const Bout = Math.random() < same ? Aout : -Aout;

    trialsRef.current[key].push(Aout * Bout);
    trialsRef.current.count++;

    setFlash({ key, A: Aout, B: Bout });
  };

  /* ================= DRAW ================= */
  const draw = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    phaseRef.current += 0.02;

    drawSource(ctx);

    drawAnalyzer(ctx, 400, H / 2, A, "A", activeAngle === "A", flash?.A);
    drawAnalyzer(ctx, 400, H / 2 + 200, Ap, "A′", activeAngle === "Ap", flash?.A);

    drawAnalyzer(ctx, 1000, H / 2, B, "B", activeAngle === "B", flash?.B);
    drawAnalyzer(ctx, 1000, H / 2 + 200, Bp, "B′", activeAngle === "Bp", flash?.B);

    if (showLines) drawCurvedConnections(ctx);

    animationRef.current = requestAnimationFrame(draw);
  };

  /* ================= DRAW HELPERS ================= */
  const drawSource = (ctx) => {
    ctx.fillStyle = "#00ffff";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 - 100, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillText("Entangled Pair Source", W / 2 - 70, H / 2 - 65);
  };

  const drawAnalyzer = (ctx, x, y, angle, label, active, value) => {
    const rad = (angle * Math.PI) / 180;

    ctx.strokeStyle = active ? "#22c55e" : "#ffffff";
    ctx.lineWidth = active ? 3 : 2;

    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 35 * Math.cos(rad), y + 35 * Math.sin(rad));
    ctx.lineTo(x + 35 * Math.cos(rad), y - 35 * Math.sin(rad));
    ctx.stroke();

    if (value !== null) {
      const d = value === 1 ? -50 : 50;
      const px = x + d * Math.cos(rad);
      const py = y - d * Math.sin(rad);

      ctx.fillStyle = value === 1 ? "#55ff55" : "#ff5555";
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillText(`${label} = ${angle}°`, x - 32, y + 55);
  };

  /* ================= CURVED CONNECTIONS ================= */
  const drawCurvedConnections = (ctx) => {
    const sx = W / 2;
    const sy = H / 2 - 100;
    const phase = phaseRef.current;

    const targets = [
      [400, H / 2],
      [400, H / 2 + 200],
      [1000, H / 2],
      [1000, H / 2 + 200],
    ];

    targets.forEach(([tx, ty], i) => {
      const strength = Math.min(1, Math.abs(S) / 2.5);
      const hue = 200 - 200 * strength;

      ctx.strokeStyle = `hsla(${hue + i * 30},100%,60%,0.6)`;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(
        (sx + tx) / 2,
        sy + Math.sin(phase + i) * 80,
        (sx + tx) / 2,
        ty - Math.sin(phase + i) * 80,
        tx,
        ty
      );
      ctx.stroke();
    });
  };

  /* ================= UI ================= */
  return (
    <div className="quantum-lab-container">
      <canvas ref={canvasRef} width={W} height={H} className="quantum-canvas" />

      <div className="controls grid">
        <AngleControl label="A" value={A} set={setA}
          active={activeAngle === "A"}
          onSelect={() => setActiveAngle("A")} />

        <AngleControl label="A′" value={Ap} set={setAp}
          active={activeAngle === "Ap"}
          onSelect={() => setActiveAngle("Ap")} />

        <AngleControl label="B" value={B} set={setB}
          active={activeAngle === "B"}
          onSelect={() => setActiveAngle("B")} />

        <AngleControl label="B′" value={Bp} set={setBp}
          active={activeAngle === "Bp"}
          onSelect={() => setActiveAngle("Bp")} />

        <div className="ql-info-box">
          <div>Trials: {trialsRef.current.count}</div>
          <strong
            style={{
              fontSize: "20px",
              color: S > 2 ? "#ff4444" : "#44ff88",
            }}
          >
            S = {S.toFixed(3)}
          </strong>

          <div className="controls">
            <button onClick={() => setRunning(false)}>⏹ Stop Trials</button>
            <button
              onClick={() => {
                trialsRef.current = {
                  AB: [],
                  ABp: [],
                  ApB: [],
                  ApBp: [],
                  count: 0,
                };
                setShowLines(false);
                setRunning(true);
              }}
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= ANGLE CONTROL ================= */
function AngleControl({ label, value, set, active, onSelect }) {
  return (
    <div className="ql-control-group">
      <button
        onClick={onSelect}
        className={active ? "active" : ""}
      >
        {label}
      </button>

      <input
        type="range"
        min="0"
        max="180"
        value={value}
        onChange={(e) => set(+e.target.value)}
      />

      <span>{value}°</span>
    </div>
  );
}
