import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./DigitalGateLab.css";

const W = 1400;
const H = 900;

/* ================= GATES ================= */

const gates = {
  AND: (a, b) => a & b,
  OR: (a, b) => a | b,
  NAND: (a, b) => (!(a & b) ? 1 : 0),
  NOR: (a, b) => (!(a | b) ? 1 : 0),
  XOR: (a, b) => a ^ b,
  NOT: (a) => (!a ? 1 : 0),
};

/* ================= BULB SPRITE ================= */

const bulbImg = new Image();
bulbImg.src = "/bulby.png";

export default function DigitalGateLab() {
  const canvasRef = useRef(null);
  const animRef = useRef(0);
  const navigate = useNavigate();

  const [gate, setGate] = useState("AND");
  const [A, setA] = useState(0);
  const [B, setB] = useState(0);
  const [phase, setPhase] = useState(0);

  const output = gate === "NOT" ? gates.NOT(A) : gates[gate](A, B);

  /* ================= ANIMATION ================= */

  useEffect(() => {
    let raf;
    const animate = () => {
      setPhase((p) => (p + 1) % 1000);
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    draw();
  }, [gate, A, B, phase]);

  /* ================= DRAW ================= */

  const getGateOutputX = () => {
    if (gate === "AND" || gate === "NAND") return 365;
    if (gate === "OR" || gate === "NOR" || gate === "XOR") return 405;
    if (gate === "NOT") return 375;
    return 400;
  };

  const draw = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, W, H);

    drawWire(ctx, 100, 140, 260, 140, A);
    drawLabel(ctx, "A", 70, 145);

    if (gate !== "NOT") {
      drawWire(ctx, 100, 180, 260, 180, B);
      drawLabel(ctx, "B", 70, 185);
    }

    drawGate(ctx, gate);
    drawGateLabel(ctx, gate);

    const outX = getGateOutputX();
    drawWire(ctx, outX, 160, 620, 160, output);
    drawLabel(ctx, "OUTPUT", 630, 165);

    drawLamp(ctx, output);
    drawBulbLabel(ctx);
  };

  /* ================= WIRES ================= */

  const drawWire = (ctx, x1, y1, x2, y2, state) => {
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (state) animateCurrent(ctx, x1, y1, x2, y2);
  };

  const animateCurrent = (ctx, x1, y1, x2, y2) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const speed = 6;
    const segLen = 40;

    const t = (phase * speed) % len;
    const dx = (x2 - x1) / len;
    const dy = (y2 - y1) / len;

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 6;
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#22c55e";

    ctx.beginPath();
    ctx.moveTo(x1 + dx * t, y1 + dy * t);
    ctx.lineTo(
      x1 + dx * Math.min(t + segLen, len),
      y1 + dy * Math.min(t + segLen, len)
    );

    if (t + segLen > len) {
      ctx.moveTo(x1, y1);
      ctx.lineTo(
        x1 + dx * ((t + segLen) % len),
        y1 + dy * ((t + segLen) % len)
      );
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  /* ================= LABELS ================= */

  const drawLabel = (ctx, text, x, y) => {
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "14px monospace";
    ctx.fillText(text, x, y);
  };

  const drawGateLabel = (ctx, gateName) => {
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.fillText(gateName, 320, 165);
    ctx.textAlign = "left";
  };

  const drawBulbLabel = (ctx) => {
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "13px monospace";
    ctx.textAlign = "center";
    ctx.fillText("OUTPUT LAMP", 650, 255);
    ctx.textAlign = "left";
  };

  /* ================= GATES ================= */

  const drawGate = (ctx, type) => {
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.fillStyle = "#0f172a";

    if (type === "AND") drawAND(ctx, false);
    if (type === "NAND") drawAND(ctx, true);
    if (type === "OR") drawOR(ctx, false);
    if (type === "NOR") drawOR(ctx, true);
    if (type === "XOR") drawXOR(ctx);
    if (type === "NOT") drawNOT(ctx);
  };

  const drawAND = (ctx, inverted) => {
    ctx.beginPath();
    ctx.moveTo(260, 120);
    ctx.lineTo(320, 120);
    ctx.arc(320, 160, 40, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(260, 200);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (inverted) drawBubble(ctx, 365, 160);
  };

  const drawOR = (ctx, inverted) => {
    ctx.beginPath();
    ctx.moveTo(260, 120);
    ctx.quadraticCurveTo(310, 160, 260, 200);
    ctx.quadraticCurveTo(350, 200, 390, 160);
    ctx.quadraticCurveTo(350, 120, 260, 120);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (inverted) drawBubble(ctx, 405, 160);
  };

  const drawXOR = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(245, 120);
    ctx.quadraticCurveTo(295, 160, 245, 200);
    ctx.stroke();
    drawOR(ctx, false);
  };

  const drawNOT = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(260, 120);
    ctx.lineTo(260, 200);
    ctx.lineTo(360, 160);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawBubble(ctx, 375, 160);
  };

  const drawBubble = (ctx, x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#020617";
    ctx.fill();
    ctx.stroke();
  };

  /* ================= LAMP ================= */

  const drawLamp = (ctx, state) => {
    ctx.beginPath();
    ctx.arc(650, 160, 18, 0, Math.PI * 2);
    ctx.fillStyle = state ? "#fde047" : "#334155";
    ctx.shadowBlur = state ? 30 : 0;
    ctx.shadowColor = "#fde047";
    ctx.fill();
    ctx.shadowBlur = 0;

    if (bulbImg.complete) {
      ctx.drawImage(bulbImg, 625, 115, 50, 90);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="digital-lab">
      <div className="digital-controls">
 
  <button
    className="digital-back-btn"
    onClick={() => navigate("/")}
  >
    ⬅ Back to Canvas
  </button>

        <h3>Digital Gate Lab</h3>

        <select value={gate} onChange={(e) => setGate(e.target.value)}>
          {Object.keys(gates).map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>

        <button onClick={() => setA(A ? 0 : 1)}>A: {A}</button>

        {gate !== "NOT" && (
          <button onClick={() => setB(B ? 0 : 1)}>B: {B}</button>
        )}

        <div>Output: {output}</div>
      </div>

      <canvas ref={canvasRef} width={W} height={H} />
    </div>
  );
}
