import React, { useEffect, useRef } from "react";
import {
  W,
  H,
  setup,
  label,
  line,
  circle,
} from "./AntennaCanvas";

export default function RadiationPattern({
  power = 70,
  angle = 0,
  paused = false,
}) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = setup(canvas);
    let raf;

    const draw = () => {
      if (!paused) frameRef.current += 0.015;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#08111f";
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2 + 15;
      const maxR = Math.min(W, H) * 0.34;

      label(ctx, "RADIATION PATTERN", 24, 32, "#e2e8f0", 15);
      label(ctx, "Illustrative polar intensity plot", 24, 52, "#94a3b8", 11);

      // Polar grid
      for (let r = 1; r <= 4; r++) {
        circle(ctx, cx, cy, (maxR * r) / 4, "#243247", 1);
      }

      for (let deg = 0; deg < 360; deg += 30) {
        const rad = (deg * Math.PI) / 180;
        line(
          ctx,
          cx,
          cy,
          cx + Math.cos(rad) * maxR,
          cy + Math.sin(rad) * maxR,
          "#243247",
          1
        );
      }

      const rotation = (angle * Math.PI) / 180;
      const points = [];

      for (let deg = 0; deg <= 360; deg += 2) {
        const t = (deg * Math.PI) / 180;
        const relative = t - rotation;

        // A broad, illustrative directional lobe.
        const raw = Math.abs(Math.cos(relative));
        const r = maxR * (0.12 + 0.88 * Math.pow(raw, 2));
        points.push([
          cx + Math.cos(t) * r,
          cy + Math.sin(t) * r,
        ]);
      }

      ctx.beginPath();
      points.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(56, 189, 248, 0.16)";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Main lobe direction
      const mainRad = rotation;
      line(
        ctx,
        cx,
        cy,
        cx + Math.cos(mainRad) * maxR,
        cy + Math.sin(mainRad) * maxR,
        "#fbbf24",
        2
      );

      circle(ctx, cx, cy, 4, "#fbbf24");

      label(ctx, "0°", cx + maxR + 10, cy + 4, "#94a3b8", 11);
      label(ctx, "90°", cx - 10, cy + maxR + 18, "#94a3b8", 11);
      label(ctx, "180°", cx - maxR - 38, cy + 4, "#94a3b8", 11);
      label(ctx, "270°", cx - 15, cy - maxR - 10, "#94a3b8", 11);

      label(ctx, `Power: ${power}%`, 24, H - 24, "#7dd3fc", 12);
      label(ctx, `Direction: ${angle}°`, W - 150, H - 24, "#fcd34d", 12);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [power, angle, paused]);

  return (
    <div className="antenna-visual">
      <canvas ref={canvasRef} width={W} height={H} />
      <p className="antenna-caption">
        The pattern illustrates relative radiation direction; it is not a
        measured antenna simulation.
      </p>
    </div>
  );
}