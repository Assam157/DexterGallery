import React, { useEffect, useRef } from "react";
import { W, H, setup, line, circle, label } from "./AntennaCanvas";

export default function ParabolicDish({
  gain = 8,
  power = 70,
  angle = 0,
  paused = false,
}) {
  const canvasRef = useRef(null);
  const pulseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = setup(canvas);
    let raf;

    const draw = () => {
      if (!paused) pulseRef.current += 0.04;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#08111f";
      ctx.fillRect(0, 0, W, H);

      label(ctx, "PARABOLIC REFLECTOR", 24, 32, "#e2e8f0", 15);
      label(ctx, "Focused energy and directional beam", 24, 52, "#94a3b8", 11);

      const cx = W * 0.32;
      const cy = H * 0.52;
      const dishW = 170;
      const dishH = 210;

      // Dish profile
      ctx.beginPath();
      ctx.moveTo(cx - dishW / 2, cy - dishH / 2);
      ctx.quadraticCurveTo(cx + 15, cy, cx - dishW / 2, cy + dishH / 2);
      ctx.strokeStyle = "#a78bfa";
      ctx.lineWidth = 6;
      ctx.stroke();

      // Feed horn
      line(ctx, cx + 6, cy - 10, cx + 45, cy, "#fbbf24", 5);
      circle(ctx, cx + 45, cy, 5, "#fbbf24");

      // Outgoing beam
      const beamX = cx + 48;
      const pulse = Math.sin(pulseRef.current) * 12;

      ctx.beginPath();
      ctx.moveTo(beamX, cy);
      ctx.lineTo(W - 25, cy - 55 - pulse);
      ctx.lineTo(W - 25, cy + 55 + pulse);
      ctx.closePath();
      ctx.fillStyle = "rgba(56,189,248,0.14)";
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Incoming wavefronts
      for (let i = 0; i < 4; i++) {
        const x = 40 + i * 32;
        line(ctx, x, cy - 100, x, cy + 100, "rgba(125,211,252,0.35)", 1);
      }

      label(ctx, "Reflector", cx - 80, cy + 135, "#c4b5fd", 12);
      label(ctx, "Feed", cx + 20, cy + 28, "#fcd34d", 11);
      label(ctx, `Gain setting: ${gain}`, 24, H - 46, "#7dd3fc", 12);
      label(ctx, `Power: ${power}%`, 24, H - 25, "#fcd34d", 12);
      label(ctx, `Orientation: ${angle}°`, W - 155, H - 25, "#c4b5fd", 12);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [gain, power, angle, paused]);

  return (
    <div className="antenna-visual">
      <canvas ref={canvasRef} width={W} height={H} />
      <p className="antenna-caption">
        Conceptual dish illustration. Actual antenna gain depends strongly on
        dish diameter, wavelength, efficiency, and alignment.
      </p>
    </div>
  );
}