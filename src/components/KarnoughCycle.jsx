import React, { useEffect, useRef } from "react";
import "./Karnough.css";

export default function CarnotPVExperiment() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const runningRef = useRef(false);
  const rafRef = useRef(null);
  const pathRef = useRef([]); // 🔴 stores dot path

  /* ===== Diagram points ===== */
  const A = { x: 1.1, y: 4.1 };
  const B = { x: 2.9, y: 4.1 };
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
    const W = canvas.width;
    const H = canvas.height;

    const margin = { l: 70, r: 30, t: 40, b: 70 };

    const mapX = v =>
      margin.l + ((v - Vmin) / (Vmax - Vmin)) * (W - margin.l - margin.r);

    const mapY = p =>
      H - margin.b -
      ((p - Pmin) / (Pmax - Pmin)) * (H - margin.t - margin.b);

    /* ===== AXES ===== */
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

    /* ===== POINT LABELS ===== */
    function drawPoints() {
      ctx.fillStyle = "#ffd400";
      ctx.strokeStyle = "#c4002f";
      ctx.lineWidth = 2;
      ctx.font = "14px Arial";

      [
        { p: A, t: "A" },
        { p: B, t: "B" },
        { p: C, t: "C" },
        { p: D, t: "D" }
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

    /* ===== PROPER QUADRATIC BEZIER ===== */
    function quadBezier(p0, p1, p2, t) {
      const u = 1 - t;
      return {
        x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
        y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y
      };
    }

    /* ===== SEGMENTS (USED BY DOT) ===== */
    const curves = [
      { p0: A, p1: { x: 1.75, y: 3.55 }, p2: B }, // A → B
      { p0: B, p1: { x: 2.25, y: 2.55 }, p2: C }, // B → C
      {
  p0: C,
  p1: { x: 2.25, y: 2.25 },  // inward, stable
  p2: D
}
, // C → D
      { p0: D, p1: { x: 1.85, y: 2.75 }, p2: A }  // D → A
    ];

    let phase = 0;
    let t = 0;

    function drawMovingDot() {
      const { p0, p1, p2 } = curves[phase];
      const p = quadBezier(p0, p1, p2, t);

      const x = mapX(p.x);
      const y = mapY(p.y);

      /* ===== SAVE PATH ===== */
      pathRef.current.push({ x, y });

      /* ===== DRAW PATH ===== */
      ctx.strokeStyle = "#c4002f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      pathRef.current.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      /* ===== LABEL ===== */
      ctx.fillStyle = "#c4002f";
      ctx.font = "14px Arial";
      ctx.fillText("Carnot Cycle Path", mapX(2.15), mapY(3.9));

      /* ===== DRAW DOT ===== */
      ctx.fillStyle = "#d60000";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      if (!runningRef.current) return;

      t += 0.01;
      if (t >= 1) {
        t = 0;
        phase = (phase + 1) % curves.length;
      }
    }

    function animate() {
      if (!runningRef.current) return;

      ctx.clearRect(0, 0, W, H);
      drawAxes();
      drawPoints();
      drawMovingDot();

      rafRef.current = requestAnimationFrame(animate);
    }

    const start = () => {
      if (runningRef.current) return;
      runningRef.current = true;
      pathRef.current = []; // 🔥 reset trail
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
      video.removeEventListener("ended", stop);
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
