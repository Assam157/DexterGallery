import React, { useEffect, useRef, useState } from "react";
import "./LensRayDiagram.css";

const W = 700;
const H = 420;
const F = 90;

export default function LensRayDiagram() {
  const canvasRef = useRef(null);

  const [lensType, setLensType] = useState("convex"); // convex | concave
  const [lightOn, setLightOn] = useState(true);
  const [sourceY, setSourceY] = useState(-1); // -1 = above axis, +1 = below

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const cx = W / 2;
    const cy = H / 2;

    const objX = 100;
    const objTopY = cy + sourceY * 60;

    function clear() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
    }

    /* ---------------- AXIS ---------------- */
    function drawAxis() {
      ctx.strokeStyle = "#444";
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(W, cy);
      ctx.stroke();
    }

    /* ---------------- LENS (PERFECT CURVATURE) ---------------- */
    function drawLens() {
      ctx.strokeStyle = "#7fdfff";
      ctx.lineWidth = 2;

      ctx.beginPath();

       ctx.beginPath();

 ctx.beginPath();

const topY = 60;
const botY = H - 60;
const halfGap = 18;   // separation between the two surfaces
const curveDepth = 60;

if (lensType === "convex") {
  /* ------------ CONVEX LENS ( ) ------------ */

  // Top edge
  ctx.moveTo(cx - halfGap, topY);
  ctx.lineTo(cx + halfGap, topY);

  // Right surface (bulge right)
  ctx.bezierCurveTo(
    cx + halfGap + curveDepth, cy,
    cx + halfGap + curveDepth, cy,
    cx + halfGap, botY
  );

  // Bottom edge
  ctx.lineTo(cx - halfGap, botY);

  // Left surface (bulge left)
  ctx.bezierCurveTo(
    cx - halfGap - curveDepth, cy,
    cx - halfGap - curveDepth, cy,
    cx - halfGap, topY
  );

} else {
  /* ------------ CONCAVE LENS ) ( ------------ */

  // Top edge
  ctx.moveTo(cx - halfGap, topY);
  ctx.lineTo(cx + halfGap, topY);

  // Right surface (bend inward)
  ctx.bezierCurveTo(
    cx + halfGap - curveDepth, cy,
    cx + halfGap - curveDepth, cy,
    cx + halfGap, botY
  );

  // Bottom edge
  ctx.lineTo(cx - halfGap, botY);

  // Left surface (bend inward)
  ctx.bezierCurveTo(
    cx - halfGap + curveDepth, cy,
    cx - halfGap + curveDepth, cy,
    cx - halfGap, topY
  );
}

ctx.closePath();
ctx.stroke();



      ctx.fillStyle = "#7fdfff";
      ctx.font = "13px monospace";
      ctx.fillText(
        lensType === "convex" ? "Convex Lens" : "Concave Lens",
        cx - 40,
        40
      );
    }

    /* ---------------- FOCAL POINTS ---------------- */
    function drawFocalPoints() {
      [-1, 1].forEach(m => {
        ctx.strokeStyle = "#aaa";
        ctx.beginPath();
        ctx.moveTo(cx + m * F, cy - 6);
        ctx.lineTo(cx + m * F, cy + 6);
        ctx.stroke();
        ctx.fillStyle = "#aaa";
        ctx.fillText("F", cx + m * F - 5, cy + 22);
      });
    }

    /* ---------------- OBJECT ---------------- */
    function drawObject() {
      ctx.strokeStyle = "#0f0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(objX, cy);
      ctx.lineTo(objX, objTopY);
      ctx.stroke();

      ctx.fillStyle = "#0f0";
      ctx.fillText("Object", objX - 22, objTopY - 6);
    }

    /* ---------------- RAYS (EXAM PERFECT) ---------------- */
    function drawRays() {
      if (!lightOn) return;

      ctx.strokeStyle = "#ff0";
      ctx.lineWidth = 2;

      // Ray 1: Parallel → Focus (or appears from focus)
      ctx.beginPath();
      ctx.moveTo(objX, objTopY);
      ctx.lineTo(cx, objTopY);

      if (lensType === "convex") {
        ctx.lineTo(cx + F, cy);
      } else {
        ctx.lineTo(cx + 120, objTopY + 40);

        // Backward extension
        ctx.setLineDash([6, 6]);
        ctx.moveTo(cx, objTopY);
        ctx.lineTo(cx - F, cy);
        ctx.setLineDash([]);
      }
      ctx.stroke();

      // Ray 2: Through optical center (undeviated)
      ctx.beginPath();
      ctx.moveTo(objX, objTopY);
      ctx.lineTo(cx + 140, cy + (objTopY - cy));
      ctx.stroke();
    }

    function loop() {
      clear();
      drawAxis();
      drawLens();
      drawFocalPoints();
      drawObject();
      drawRays();

      ctx.fillStyle = "#fff";
      ctx.font = "12px monospace";
      ctx.fillText(
        sourceY === -1 ? "Light from +Y axis" : "Light from -Y axis",
        20,
        30
      );

      requestAnimationFrame(loop);
    }

    loop();
  }, [lensType, lightOn, sourceY]);

  return (
    <div className="lens-root">
      <h2>🔬 Lens Ray Diagram (Correct Geometry)</h2>

      <canvas ref={canvasRef} width={W} height={H} />

      <div className="controls">
        <button onClick={() => setLensType(lensType === "convex" ? "concave" : "convex")}>
          Lens: {lensType.toUpperCase()}
        </button>

        <button onClick={() => setLightOn(!lightOn)}>
          {lightOn ? "Light OFF" : "Light ON"}
        </button>

        <button onClick={() => setSourceY(sourceY * -1)}>
          Source Axis: {sourceY === -1 ? "+Y" : "-Y"}
        </button>
      </div>
    </div>
  );
}
