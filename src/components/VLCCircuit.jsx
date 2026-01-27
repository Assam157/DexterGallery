import React, { useRef, useEffect, useState } from "react";

const W = 1100;
const H = 620;

export default function VICircuit() {
  const canvasRef = useRef(null);
  const tRef = useRef(0);

  const [connected, setConnected] = useState(false);
  const [R, setR] = useState(10);

  const V = 10;
  const I = connected ? V / R : 0;

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    function animate() {
      ctx.clearRect(0, 0, W, H);
      drawCircuit(ctx);
      if (connected) tRef.current += 1.5;
      requestAnimationFrame(animate);
    }
    animate();
  }, [connected, R]);

  /* ---------------- BASIC HELPERS ---------------- */

  function wire(ctx, x1, y1, x2, y2) {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function arrow(ctx, x, y, a) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(8, 0);
    ctx.lineTo(-6, 4);
    ctx.fillStyle = "#16a34a";
    ctx.fill();
    ctx.restore();
  }

  function flow(ctx, x1, y1, x2, y2, a) {
    const L = Math.hypot(x2 - x1, y2 - y1);
    const d = (tRef.current * 2) % L;
    arrow(
      ctx,
      x1 + ((x2 - x1) * d) / L,
      y1 + ((y2 - y1) * d) / L,
      a
    );
  }

  /* ---------------- ANALOG METER ---------------- */

 function analogMeter(ctx, x, y, label, value, max, unit) {
  const radius = 60;
  const dialOffsetY = -25;

  /* ===== BODY RECT (UNCHANGED DESIGN) ===== */
  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  ctx.fillRect(x - 95, y - 75, 190, 115);
  ctx.strokeRect(x - 95, y - 75, 190, 115);

  /* ===== FULL CIRCLE DIAL (SHIFTED UP) ===== */
  ctx.beginPath();
  ctx.arc(x, y + 10 + dialOffsetY, radius-3, 0, Math.PI * 2);
  ctx.stroke();

  /* ===== TICK MARKS (FULL CIRCLE) ===== */
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(
      x + 52 * Math.cos(a),
      y + 10 + dialOffsetY - 52 * Math.sin(a)
    );
    ctx.lineTo(
      x + radius * Math.cos(a),
      y + 10 + dialOffsetY - radius * Math.sin(a)
    );
    ctx.stroke();
  }

  /* ===== NEEDLE ===== */
  const clamped = Math.max(0, Math.min(value, max));
  const ang = (clamped / max) * Math.PI * 2 - Math.PI / 2;

  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, y + 10 + dialOffsetY);
  ctx.lineTo(
    x + 55 * Math.cos(ang),
    y + 10 + dialOffsetY - 55 * Math.sin(ang)
  );
  ctx.stroke();

  arrow(
    ctx,
    x + 55 * Math.cos(ang),
    y + 10 + dialOffsetY - 55 * Math.sin(ang),
    ang
  );

  /* ===== CENTER HUB ===== */
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(x, y + 10 + dialOffsetY, 4, 0, Math.PI * 2);
  ctx.fill();

  /* ===== LABELS ===== */
  ctx.fillStyle = "#000";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";

  ctx.fillText(label, x, y - 45);
  ctx.fillText(`${clamped.toFixed(2)} ${unit}`, x, y + 55);

  ctx.textAlign = "start";
}


  /* ---------------- CIRCUIT ---------------- */

   function drawCircuit(ctx) {
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#000";

  /* ================= WIRES ================= */

  // Bottom wire
  wire(ctx, 200, 460, 900, 460);

  // Left vertical
  wire(ctx, 200, 460, 200, 260);

  // Top wire (with resistors)
  wire(ctx, 200, 260, 350, 260); // to R1
  wire(ctx, 450, 260, 600, 260); // between R1 & R2
  wire(ctx, 700, 260, 900, 260); // after R2

  // Right vertical
  wire(ctx, 900, 260, 900, 460);

  /* ================= BATTERY ================= */

 wire(ctx, 300, 430, 300, 490); // long plate
wire(ctx, 280, 445, 280, 475); // short plate
ctx.fillText("10 V Battery", 230, 515);



  /* ================= SWITCH ================= */

  ctx.beginPath();
  ctx.moveTo(200, 260);
  ctx.lineTo(connected ? 230 : 220, connected ? 260 : 230);
  ctx.stroke();
  ctx.fillText(connected ? "Closed" : "Open", 190, 220);

  /* ================= R1 ================= */

 /* ================= R1 ================= */

ctx.strokeRect(350, 235, 100, 50);
ctx.fillText("R₁", 390, 230);

// Slider track (R1)
ctx.strokeStyle = "#dc2626";
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(360, 260);
ctx.lineTo(440, 260);
ctx.stroke();

// Slider knob (R1)
const k1 = 360 + (R / 50) * 80;
ctx.fillStyle = "#dc2626";
ctx.beginPath();
ctx.arc(k1, 260, 5, 0, Math.PI * 2);
ctx.fill();

// R1 value
ctx.fillStyle = "#000";
ctx.font = "13px sans-serif";
ctx.fillText(`R₁ = ${R} Ω`, 360, 305);


/* ================= R2 ================= */

ctx.strokeRect(600, 235, 100, 50);
ctx.fillText("R₂", 640, 230);

// Slider track (R2)
ctx.strokeStyle = "#dc2626";
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(610, 260);
ctx.lineTo(690, 260);
ctx.stroke();

// Slider knob (R2)
const k2 = 610 + (R / 50) * 80;
ctx.fillStyle = "#dc2626";
ctx.beginPath();
ctx.arc(k2, 260, 5, 0, Math.PI * 2);
ctx.fill();

// R2 value
ctx.fillStyle = "#000";
ctx.font = "13px sans-serif";
ctx.fillText(`R₂ = ${R} Ω`, 610, 305);


/* ================= NET RESISTANCE ================= */

ctx.font = "14px sans-serif";
ctx.fillText(`Net Resistance  R = ${2 * R} Ω`, 480, 330);

  /* ================= VOLTMETER (ACROSS R1) ================= */

  // parallel connections
  wire(ctx, 350, 260, 350, 180);
  wire(ctx, 450, 260, 450, 180);

  analogMeter(ctx, 400, 150, "V", connected ? V : 0, 10, "V");

  /* ================= AMMETER (SERIES RIGHT) ================= */

  ctx.save();
  ctx.translate(930, 360);
  ctx.rotate(Math.PI / 2);
  analogMeter(ctx, 0, 0, "A", connected ? I : 0, 2, "A");
  ctx.restore();

  wire(ctx, 900, 260, 930, 260);
  wire(ctx, 900, 460, 930, 460);

  /* ================= CURRENT FLOW ================= */

  if (connected) {
    flow(ctx, 200, 460, 200, 260, -Math.PI / 2);
    flow(ctx, 200, 260, 350, 260, 0);
    flow(ctx, 450, 260, 600, 260, 0);
    flow(ctx, 700, 260, 900, 260, 0);
    flow(ctx, 900, 260, 900, 460, Math.PI / 2);
  }
}


  return (
    <div style={{ textAlign: "center" }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ background: "#fff", border: "2px solid #000" }}
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={() => setConnected(v => !v)}>
          {connected ? "Disconnect Battery" : "Connect Battery"}
        </button>

        <button onClick={() => setR(r => Math.max(1, r - 1))} style={{ marginLeft: 10 }}>
          − R
        </button>

         <button onClick={() => setR(r => Math.min(r + 1, 50))}style={{ marginLeft: 6 }}>
          + R
          </button>

      </div>
    </div>
  );
}
