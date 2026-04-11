import React, { useRef, useEffect } from "react";

const GW = 820;
const GH = 160;

export default function BulgeGraph({ angle, bulge }) {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext("2d");

    ctx.clearRect(0, 0, GW, GH);

    // background
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, GW, GH);

    // axes
    ctx.strokeStyle = "#334155";
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, GH - 30);
    ctx.lineTo(GW - 20, GH - 30);
    ctx.stroke();

    ctx.fillStyle = "#cbd5f5";
    ctx.font = "12px Arial";
    ctx.fillText("Bulge Strength", 5, 30);
    ctx.fillText("Angle (0–360°)", GW / 2 - 45, GH - 8);

    // curve
    ctx.strokeStyle = "#38bdf8";
    ctx.beginPath();

    for (let a = 0; a <= 360; a++) {
      const x = 40 + (a / 360) * (GW - 80);
      const b = Math.abs(Math.cos((a * Math.PI) / 180)) * 35 + 10;
      const y =
        GH - 30 - ((b - 10) / 45) * (GH - 60);

      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // current point
    const px = 40 + (angle / 360) * (GW - 80);
    const py =
      GH - 30 - ((bulge - 10) / 45) * (GH - 60);

    ctx.fillStyle = "#22d3ee";
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [angle, bulge]);

  return (
    <canvas
      ref={ref}
      width={GW}
      height={GH}
      className="bulge-graph"
    />
  );
}
