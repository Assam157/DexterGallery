import React, { useRef, useEffect, useState, useMemo } from "react";
import "./ProjectileMotionGraph.css";

const W = 560;
const H = 360;
const g = 9.8; // m/s^2

const M = { left: 70, right: 40, top: 40, bottom: 60 };
const MAX_RANGE = 160;   // meters
const MAX_HEIGHT = 80;  // meters

export default function ProjectileMotionLab() {
  const canvasRef = useRef(null);

  const [angle, setAngle] = useState(45);      // degrees
  const [speed, setSpeed] = useState(30);      // m/s
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [activeSlider, setActiveSlider] = useState(0);
// 0 = angle, 1 = speed

  const proj = useRef({ t: 0, path: [], maxH: 0, range: 0 });

  /* ---------- AUTO SAFE PHYSICS LIMIT ---------- */
  const maxAllowedSpeed = useMemo(() => {
    const rad = (angle * Math.PI) / 180;
    const byRange = Math.sqrt(
      (MAX_RANGE * g) / Math.max(Math.sin(2 * rad), 0.01)
    );
    const byHeight = Math.sqrt(
      (2 * g * MAX_HEIGHT) / Math.max(Math.sin(rad) ** 2, 0.01)
    );
    return Math.min(byRange, byHeight);
  }, [angle]);

  useEffect(() => {
    if (speed > maxAllowedSpeed) {
      setSpeed(+maxAllowedSpeed.toFixed(1));
    }
  }, [maxAllowedSpeed, speed]);

  /* ---------- MAIN DRAW LOOP ---------- */
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    let raf;

    const loop = () => {
      // white laboratory board
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      drawAxes(ctx);
      drawLabels(ctx);
      drawTrajectory(ctx);

      if (running) {
        updateProjectile();
        drawLiveVelocity(ctx);
      }

      if (finished) drawSixSignificantPoints(ctx);

      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(raf);
  }, [running, finished, angle, speed]);

  /* ---------- PHYSICS ---------- */
  const launch = () => {
    proj.current = { t: 0, path: [], maxH: 0, range: 0 };
    setFinished(false);
    setRunning(true);
  };

  const reset = () => {
    proj.current = { t: 0, path: [], maxH: 0, range: 0 };
    setRunning(false);
    setFinished(false);
  };

  const updateProjectile = () => {
    const p = proj.current;
    const dt = 0.04;
    p.t += dt;

    const rad = (angle * Math.PI) / 180;
    const x = speed * Math.cos(rad) * p.t;
    const y = speed * Math.sin(rad) * p.t - 0.5 * g * p.t * p.t;

    if (y < 0) {
      p.range = x;
      setRunning(false);
      setFinished(true);
      return;
    }

    p.maxH = Math.max(p.maxH, y);
    p.path.push({ x, y, t: p.t });
  };

  /* ---------- SCALING ---------- */
  const scaleX = (x) =>
    M.left + (x / MAX_RANGE) * (W - M.left - M.right);

  const scaleY = (y) =>
    H - M.bottom - (y / MAX_HEIGHT) * (H - M.top - M.bottom);

  /* ---------- VECTOR ARROW ---------- */
  const drawArrow = (ctx, x1, y1, x2, y2, color, width = 3) => {
    const head = 9;
    const ang = Math.atan2(y2 - y1, x2 - x1);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - head * Math.cos(ang - Math.PI / 6),
      y2 - head * Math.sin(ang - Math.PI / 6)
    );
    ctx.lineTo(
      x2 - head * Math.cos(ang + Math.PI / 6),
      y2 - head * Math.sin(ang + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  };

  /* ---------- AXES ---------- */
  const drawAxes = (ctx) => {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(M.left, H - M.bottom);
    ctx.lineTo(W - M.right, H - M.bottom);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(M.left, M.top);
    ctx.lineTo(M.left, H - M.bottom);
    ctx.stroke();

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#000";

    ctx.fillText("Horizontal Range (m)", W / 2 - 60, H - 20);

    ctx.save();
    ctx.translate(22, H / 2 + 40);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Vertical Height (m)", 0, 0);
    ctx.restore();

    drawTicks(ctx);
  };

  const drawTicks = (ctx) => {
    ctx.font = "12px sans-serif";

    for (let x = 0; x <= MAX_RANGE; x += 20) {
      const cx = scaleX(x);
      ctx.beginPath();
      ctx.moveTo(cx, H - M.bottom);
      ctx.lineTo(cx, H - M.bottom + 6);
      ctx.stroke();
      ctx.fillText(x, cx - 6, H - M.bottom + 20);
    }

    for (let y = 0; y <= MAX_HEIGHT; y += 10) {
      const cy = scaleY(y);
      ctx.beginPath();
      ctx.moveTo(M.left - 6, cy);
      ctx.lineTo(M.left, cy);
      ctx.stroke();
      ctx.fillText(y, M.left - 35, cy + 4);
    }
  };

  /* ---------- TRAJECTORY ---------- */
  const drawTrajectory = (ctx) => {
    ctx.strokeStyle = "#1e90ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    proj.current.path.forEach((p, i) => {
      const cx = scaleX(p.x);
      const cy = scaleY(p.y);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
  };

  /* ---------- LIVE VELOCITY VECTORS ---------- */
  const drawLiveVelocity = (ctx) => {
    if (proj.current.path.length === 0) return;

    const p = proj.current.path.at(-1);
    const rad = (angle * Math.PI) / 180;

    const vx = speed * Math.cos(rad);
    const vy = speed * Math.sin(rad) - g * p.t;

    const px = scaleX(p.x);
    const py = scaleY(p.y);

    drawArrow(ctx, px, py, px + vx * 0.9, py, "#ff9800", 4); // vx
    drawArrow(ctx, px, py, px, py - vy * 0.9, "#00a65a", 4); // vy
  };

  /* ---------- SIX SIGNIFICANT POINTS ---------- */
  const drawSixSignificantPoints = (ctx) => {
    const path = proj.current.path;
    if (path.length < 6) return;

    const idx = [
      0,
      Math.floor(path.length * 0.2),
      Math.floor(path.length * 0.4),
      Math.floor(path.length * 0.5),
      Math.floor(path.length * 0.7),
      path.length - 1,
    ];

    const rad = (angle * Math.PI) / 180;

    idx.forEach((i) => {
      const p = path[i];
      const px = scaleX(p.x);
      const py = scaleY(p.y);

      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();

      const vx = speed * Math.cos(rad);
      const vy = speed * Math.sin(rad) - g * p.t;

      drawArrow(ctx, px, py, px + vx * 0.9, py, "#ff9800", 3.5);
      drawArrow(ctx, px, py, px, py - vy * 0.9, "#00a65a", 3.5);
    });
  };

  /* ---------- LAB LABELS ---------- */
  const drawLabels = (ctx) => {
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#000";

    ctx.fillText(`Launch Angle: ${angle}°`, W - 190, 28);
    ctx.fillText(`Initial Speed: ${speed.toFixed(1)} m/s`, W - 190, 48);

    if (finished) {
      ctx.fillText(`Maximum Height = ${proj.current.maxH.toFixed(1)} m`, 90, 28);
      ctx.fillText(`Horizontal Range = ${proj.current.range.toFixed(1)} m`, 90, 48);
    }
  };
  useEffect(() => {
  function onKey(e) {
    // ========= SWITCH SLIDER =========
    if (e.key === "q" || e.key === "Q") {
      setActiveSlider(s => (s + 1) % 2);
    }

    if (e.key === "e" || e.key === "E") {
      setActiveSlider(s => (s + 1) % 2);
    }

    // ========= ADJUST VALUE =========
    if (e.key === "a" || e.key === "A") {
      adjust(-1);
    }

    if (e.key === "d" || e.key === "D") {
      adjust(+1);
    }
  }

  function adjust(dir) {
    if (activeSlider === 0) {
      // Launch Angle (5 → 85)
      setAngle(v =>
        Math.min(85, Math.max(5, v + dir))
      );
    } else {
      // Initial Speed (5 → maxAllowedSpeed)
      setSpeed(v =>
        Math.min(
          maxAllowedSpeed,
          Math.max(5, v + dir * 0.5)
        )
      );
    }
  }

  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [activeSlider, maxAllowedSpeed]);


  /* ---------- UI ---------- */
 return (
  <div className="proj-graph-root">
    <h2>Projectile Motion Laboratory (Vector Decomposition)</h2>

    <canvas ref={canvasRef} width={W} height={H} />

    {/* ================= CONTROLS ================= */}
    <div className="proj-controls">

      {/* ===== ANGLE CONTROL ===== */}
      <div className={`proj-slider-row ${activeSlider === 0 ? "active" : ""}`}>
        <button
          className="slider-select-btn"
          onClick={() => setActiveSlider(0)}
        >
          ANGLE
        </button>

        <div className="slider-wrap">
          {activeSlider === 0 && (
            <div
              className="slider-tooltip"
              style={{
                left: `${((angle - 5) / (85 - 5)) * 100}%`
              }}
            >
              {angle}°
            </div>
          )}

          <input
            type="range"
            min="5"
            max="85"
            value={angle}
            onChange={(e) => setAngle(+e.target.value)}
          />
        </div>
      </div>

      {/* ===== SPEED CONTROL ===== */}
      <div className={`proj-slider-row ${activeSlider === 1 ? "active" : ""}`}>
        <button
          className="slider-select-btn"
          onClick={() => setActiveSlider(1)}
        >
          SPEED
        </button>

        <div className="slider-wrap">
          {activeSlider === 1 && (
            <div
              className="slider-tooltip"
              style={{
                left: `${((speed - 5) / (maxAllowedSpeed - 5)) * 100}%`
              }}
            >
              {speed.toFixed(1)} m/s
            </div>
          )}

          <input
            type="range"
            min="5"
            max={maxAllowedSpeed}
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(+e.target.value)}
          />
        </div>
      </div>

    </div>

    {/* ================= ACTION BUTTONS ================= */}
    <div className="lab-buttons">
      <button onClick={launch}>Launch Projectile</button>
      <button onClick={reset}>Reset Experiment</button>
    </div>
  </div>
);

}

