import React, { useEffect, useRef } from "react";
import "./Karnough.css";

export default function CarnotPVExperiment() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
    const runningRef = useRef(false);
const rafRef = useRef(null);

  /* ===== Diagram points ===== */
  const A = { x: 1.1, y: 4.1 };
  const B = { x: 2.9, y: 3.1 };
  const C = { x: 3.1, y: 1.5 };
  const D = { x: 1.4, y: 2.0 };

  /* Bounds */
  const Vmin = 0.8, Vmax = 3.4;
  const Pmin = 0.8, Pmax = 4.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    const margin = { l: 70, r: 30, t: 40, b: 70 };

    const mapX = v =>
      margin.l + ((v - Vmin) / (Vmax - Vmin)) * (W - margin.l - margin.r);

    const mapY = p =>
      H - margin.b -
      ((p - Pmin) / (Pmax - Pmin)) * (H - margin.t - margin.b);

    let animationId = null;
    let running = false;

    /* ===== Axes ===== */
    function drawAxes() {
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(margin.l, H - margin.b);
      ctx.lineTo(W - margin.r, H - margin.b);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(margin.l, margin.t);
      ctx.lineTo(margin.l, H - margin.b);
      ctx.stroke();

      ctx.font = "14px Arial";
      ctx.fillStyle = "#000";

      for (let v = 1; v <= 3; v += 0.5) {
        const x = mapX(v);
        ctx.beginPath();
        ctx.moveTo(x, H - margin.b);
        ctx.lineTo(x, H - margin.b + 6);
        ctx.stroke();
        ctx.fillText(v.toFixed(1), x - 10, H - margin.b + 22);
      }

      for (let p = 1; p <= 4; p++) {
        const y = mapY(p);
        ctx.beginPath();
        ctx.moveTo(margin.l - 6, y);
        ctx.lineTo(margin.l, y);
        ctx.stroke();
        ctx.fillText(p.toFixed(1), margin.l - 35, y + 5);
      }

      ctx.font = "16px Arial";
      ctx.fillText("Volume (V)", W / 2 - 40, H - 20);

      ctx.save();
      ctx.translate(25, H / 2 + 40);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("Pressure (P)", 0, 0);
      ctx.restore();

      ctx.font = "18px Arial";
      ctx.fillText("Carnot Cycle – P–V Diagram", W / 2 - 120, 25);
    }

    /* ===== Carnot structure ===== */
    function drawCarnotStructure() {
      ctx.strokeStyle = "#c4002f";
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(mapX(A.x), mapY(A.y));

      // A → B (INWARD)
      ctx.quadraticCurveTo(
        mapX(2.0), mapY(3.0),
        mapX(B.x), mapY(B.y)
      );

      // B → C (INWARD)
      ctx.quadraticCurveTo(
        mapX(2.3), mapY(2.2),
        mapX(C.x), mapY(C.y)
      );

      // C → D (OUTWARD)
      ctx.quadraticCurveTo(
        mapX(3.5), mapY(1.0),
        mapX(D.x), mapY(D.y)
      );

      // D → A (OUTWARD)
      ctx.quadraticCurveTo(
        mapX(0.7), mapY(4.2),
        mapX(A.x), mapY(A.y)
      );

      ctx.stroke();
    }

    /* ===== Points ===== */
    function drawPoints() {
      ctx.fillStyle = "#ffd400";
      ctx.strokeStyle = "#c4002f";
      ctx.lineWidth = 2;
      ctx.font = "14px Arial";

      [
        { p: A, t: "A (P₁,V₁)" },
        { p: B, t: "B (P₂,V₂)" },
        { p: C, t: "C (P₃,V₃)" },
        { p: D, t: "D (P₄,V₄)" }
      ].forEach(o => {
        const x = mapX(o.p.x);
        const y = mapY(o.p.y);
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillText(o.t, x + 8, y - 8);
      });
    }

    /* ===== Bezier helper ===== */
    function quadBezier(p0, p1, p2, t) {
      return {
        x:
          (1 - t) * (1 - t) * p0.x +
          2 * (1 - t) * t * p1.x +
          t * t * p2.x,
        y:
          (1 - t) * (1 - t) * p0.y +
          2 * (1 - t) * t * p1.y +
          t * t * p2.y
      };
    }

    let phase = 0;
    let t = 0;

    function drawMovingDot() {
  let p;

  if (phase === 0)
    p = quadBezier(A, { x: 2.0, y: 3.0 }, B, t);
  else if (phase === 1)
    p = quadBezier(B, { x: 2.3, y: 2.2 }, C, t);
  else if (phase === 2)
    p = quadBezier(C, { x: 3.5, y: 1.0 }, D, t);
  else
    p = quadBezier(D, { x: 0.7, y: 4.2 }, A, t);

  ctx.fillStyle = "#d60000";
  ctx.beginPath();
  ctx.arc(mapX(p.x), mapY(p.y), 6, 0, Math.PI * 2);
  ctx.fill();

  // ⛔ advance ONLY if video is playing
  if (!runningRef.current) return;

  t += 0.01;
  if (t >= 1) {
    t = 0;
    phase = (phase + 1) % 4;
  }
}


     function animate() {
  if (!runningRef.current) return;

  ctx.clearRect(0, 0, W, H);
  drawAxes();
  drawCarnotStructure();
  drawPoints();
  drawMovingDot();   // dot moves ONLY if runningRef is true

  rafRef.current = requestAnimationFrame(animate);
}


   const start = () => {
  if (runningRef.current) return;
  runningRef.current = true;
  animate();
};

const stop = () => {
  runningRef.current = false;
  if (rafRef.current) {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }
};

video.addEventListener("play", start);
video.addEventListener("pause", stop);
video.addEventListener("ended", stop);

    return () => {
      stop();
      video.removeEventListener("play", start);
      video.removeEventListener("pause", stop);
    };
  }, []);

  return (
    <div className="experiment-container">
      <h2>Carnot Engine – Video & P–V Diagram</h2>

      <div className="experiment-row">
        <video
          ref={videoRef}
          src="./KarnaughtCycle1.mp4"
          controls
          loop
          muted
          className="experiment-video"
        />

        <canvas
          ref={canvasRef}
          width={650}
          height={520}
          className="pv-canvas"
        />
      </div>
    </div>
  );
}
