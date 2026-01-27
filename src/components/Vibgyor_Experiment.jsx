import React, { useEffect, useRef, useState } from "react";

const W = 950;
const H = 480;

/* Strong, clear dispersion */
const colors = [
  { name: "Violet", color: "#7f00ff", offset: -55 },
  { name: "Indigo", color: "#4b0082", offset: -38 },
  { name: "Blue", color: "#0000ff", offset: -20 },
  { name: "Green", color: "#00ff00", offset: 0 },
  { name: "Yellow", color: "#ffff00", offset: 20 },
  { name: "Orange", color: "#ff7f00", offset: 38 },
  { name: "Red", color: "#ff0000", offset: 55 }
];

export default function PrismDispersionRecombination() {
  const canvasRef = useRef(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    drawScene(on);
  }, [on]);

  const drawScene = (showLight) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, W, H);

    // -----------------------------
    // BACKGROUND
    // -----------------------------
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);
    ctx.font = "15px monospace";

    // -----------------------------
    // PRISM 1 (UPRIGHT – DISPERSION)
    // -----------------------------
    ctx.beginPath();
    ctx.moveTo(360, 90);
    ctx.lineTo(430, 240);
    ctx.lineTo(360, 390);
    ctx.closePath();

    ctx.fillStyle = "rgba(120,200,255,0.18)";
    ctx.fill();
    ctx.strokeStyle = "#7fdfff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#7fdfff";
    ctx.fillText("Prism 1 (Dispersion)", 310, 70);

    // -----------------------------
    // PRISM 2 (INVERTED – RECOMBINATION)
    // -----------------------------
    ctx.beginPath();
    ctx.moveTo(610, 390);
    ctx.lineTo(540, 240);
    ctx.lineTo(610, 90);
    ctx.closePath();

    ctx.fillStyle = "rgba(120,200,255,0.18)";
    ctx.fill();
    ctx.strokeStyle = "#7fdfff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#7fdfff";
    ctx.fillText("Prism 2 (Recombination)", 560, 70);

    if (!showLight) return;

    // -----------------------------
    // INCIDENT WHITE LIGHT
    // -----------------------------
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, 240);
    ctx.lineTo(360, 240);
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.fillText("White Light", 140, 220);

    // -----------------------------
    // DISPERSION (PROMINENT)
    // -----------------------------
    colors.forEach((c) => {
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(430, 240);
      ctx.lineTo(540, 240 + c.offset);
      ctx.stroke();

      ctx.fillStyle = c.color;
      ctx.fillText(c.name, 545, 245 + c.offset);
    });

    // -----------------------------
    // RECOMBINED WHITE LIGHT
    // -----------------------------
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(610, 240);
    ctx.lineTo(860, 240);
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.fillText("Recombined White Light", 650, 220);

    // -----------------------------
    // SCREEN
    // -----------------------------
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(860, 120);
    ctx.lineTo(860, 360);
    ctx.stroke();

    ctx.fillStyle = "#aaa";
    ctx.fillText("Screen", 835, 105);
  };

  return (
    <div style={{ background: "#000", padding: "20px" }}>
      <h2 style={{ color: "#7fdfff", fontFamily: "monospace" }}>
        Dispersion and Recombination of Light Using Prisms
      </h2>

      <button
        onClick={() => setOn(!on)}
        style={{
          marginBottom: "12px",
          padding: "8px 18px",
          fontFamily: "monospace",
          background: on ? "#ff4444" : "#44ff88",
          border: "none",
          cursor: "pointer",
          fontSize: "14px"
        }}
      >
        {on ? "Turn Light OFF" : "Turn Light ON"}
      </button>

      <br />

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          border: "2px solid #111",
          background: "#000"
        }}
      />
    </div>
  );
}
