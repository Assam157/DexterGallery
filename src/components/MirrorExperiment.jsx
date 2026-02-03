import React, { useRef, useEffect, useState } from "react";
import "./RadiationDexterLab.css";

/* ================= CANVAS ================= */
const W = 820;
const H = 440;
const AXIS_Y = H / 2;

/* ================= MIRROR GEOMETRY ================= */
const P = 560;
const F = P - 120;
const C = P - 240;

/* ================= CASES ================= */
const CASES = [
  { id: 1, label: "Beyond C", objX: C - 80 },
  { id: 2, label: "At C", objX: C },
  { id: 3, label: "Between C & F", objX: (C + F) / 2 },
  { id: 4, label: "At F", objX: F },
  { id: 5, label: "Between F & P", objX: F + 40 }
];

export default function ConcaveMirrorPhysicsLab() {
  const canvasRef = useRef(null);
  const [caseId, setCaseId] = useState(1);
  const [tall, setTall] = useState(true);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, W, H);

    drawAxis(ctx);
    drawConcaveMirror(ctx);
    drawPoints(ctx);

    drawCase(ctx, CASES[caseId - 1], tall ? 100 : 60);
  }, [caseId, tall]);

  return (
    <div className="dexter-root">
      <div className="control-panel">
        <h3>Concave Mirror</h3>
        {CASES.map(c => (
          <button
            key={c.id}
            className={caseId === c.id ? "active" : ""}
            onClick={() => setCaseId(c.id)}
          >
            {c.id}. {c.label}
          </button>
        ))}
        <hr />
        <button onClick={() => setTall(t => !t)}>
          Object Height: {tall ? "Tall" : "Short"}
        </button>
      </div>

      <div className="canvas-panel">
        <canvas ref={canvasRef} width={W} height={H} />
      </div>
    </div>
  );
}

/* ================= DRAW CASE ================= */
 function drawCase(ctx, cfg, h) {
  const objX = cfg.objX;
  const objTopY = AXIS_Y - h;

  /* ---------- OBJECT ---------- */
  drawArrow(ctx, objX, h, "#000", "A", "B");

  /* =================================================
     CASE 4: OBJECT AT F (C-RAY + PARALLEL RAY)
     ================================================= */
  if (cfg.id === 4) {

    /* --- Ray 1: Parallel from A --- */
    drawRay(ctx, objX, objTopY, P, objTopY);

    // Reflects through F (extend freely)
    drawRay(ctx, P, objTopY, F - 0, AXIS_Y);

    /* --- Ray 2: C-ray from A --- */
    const slopeAC = (AXIS_Y - objTopY) / (C - objX);
    const yAtP_C = objTopY + slopeAC * (P - objX);

    drawRay(ctx, objX, objTopY, P, yAtP_C);

    // Retraces through C
    drawRay(ctx, P, yAtP_C, C - 0, AXIS_Y);

    // No image
    return;
  }

  /* =================================================
     CASE 5: OBJECT BETWEEN F & P
     ================================================= */
  if (cfg.id === 5) {

    /* --- Ray 1: Parallel from A --- */
    drawRay(ctx, objX, objTopY, P, objTopY);

    // Reflected (diverging)
    drawRay(ctx, P, objTopY, P - 120, AXIS_Y);

    /* --- Ray 2: Aimed towards C --- */
    const slopeAC = (AXIS_Y - objTopY) / (C - objX);
    const yAtP_C = objTopY + slopeAC * (P - objX);

    drawRay(ctx, objX, objTopY, P, yAtP_C);
 

    /* --- Backward extensions (must meet at C) --- */
    ctx.setLineDash([6, 6]);
 
    drawRay(ctx, P, yAtP_C, C, AXIS_Y);
    ctx.setLineDash([]);

    /* --- Virtual upright image at C --- */
 
    return;
  }

  /* =================================================
     OTHER CASES (UNCHANGED)
     ================================================= */

  const slopeAF = (AXIS_Y - objTopY) / (F - objX);
  const yAtP = objTopY + slopeAF * (P - objX);
  const slopePF = (AXIS_Y - objTopY) / (F - P);

  const imgY = yAtP;
  const imgX = F + (imgY - AXIS_Y) / slopePF;

  drawRay(ctx, objX, objTopY, P, objTopY);
  drawRay(ctx, objX, objTopY, P, yAtP);
  drawRay(ctx, P, objTopY, imgX, imgY);
  drawRay(ctx, P, yAtP, imgX, imgY);

  drawArrow(ctx, imgX, AXIS_Y - imgY, "#444", "A′", "B′");
}




/* ================= BASE DRAW ================= */

function drawAxis(ctx) {
  ctx.strokeStyle = "#aaa";
  ctx.beginPath();
  ctx.moveTo(0, AXIS_Y);
  ctx.lineTo(W, AXIS_Y);
  ctx.stroke();
}

 function drawConcaveMirror(ctx) {
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 4;

  const R = 200;   // half height (unchanged)
  const D = 60;    // curvature depth (unchanged)

  // Shift curve LEFT so vertex lies at x = P
  const xShift = D / 3;

  ctx.beginPath();
  ctx.moveTo(P - xShift, AXIS_Y - R);
  ctx.quadraticCurveTo(
    P + D - xShift, AXIS_Y,
    P - xShift, AXIS_Y + R
  );
  ctx.stroke();
}


function drawPoints(ctx) {
  drawPoint(ctx, P, AXIS_Y, "P");
  drawPoint(ctx, F, AXIS_Y, "F");
  drawPoint(ctx, C, AXIS_Y, "C");
}

/* ================= PRIMITIVES ================= */

function drawArrow(ctx, x, h, color, top, bottom) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, AXIS_Y);
  ctx.lineTo(x, AXIS_Y - h);
  ctx.stroke();
  ctx.fillText(top, x - 18, AXIS_Y - h - 6);
  ctx.fillText(bottom, x - 18, AXIS_Y + 14);
}

function drawRay(ctx, x1, y1, x2, y2) {
  ctx.strokeStyle = "purple";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawPoint(ctx, x, y, label) {
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText(label, x - 8, y + 16);
}
