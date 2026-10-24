import React, { useEffect, useRef } from "react";
import { W, H, setup, line, circle, label } from "./AntennaCanvas";

export default function YagiUdaAntenna({
  elements = 8,
  gain = 8,
  angle = 0,
  paused = false,
}) {
  const canvasRef = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = setup(canvas);
    let raf;

    const draw = () => {
      if (!paused) phaseRef.current += 0.04;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#08111f";
      ctx.fillRect(0, 0, W, H);

      label(ctx, "YAGI–UDA ARRAY", 24, 32, "#e2e8f0", 15);
      label(ctx, "Driven element + reflector + directors", 24, 52, "#94a3b8", 11);

      const cx = W * 0.42;
      const cy = H * 0.52;
      const spacing = 42;
      const count = Math.max(3, Math.min(12, elements));
      const startX = cx - ((count - 1) * spacing) / 2;

      // Boom
      line(
        ctx,
        startX - 38,
        cy,
        startX + (count - 1) * spacing + 38,
        cy,
        "#64748b",
        5
      );

      for (let i = 0; i < count; i++) {
        const x = startX + i * spacing;
        const height = i === 0 ? 110 : i === 1 ? 92 : 78;
        const isDriven = i === 1;
        const isReflector = i === 0;

        line(
          ctx,
          x,
          cy - height / 2,
          x,
          cy + height / 2,
          isDriven ? "#fbbf24" : isReflector ? "#a78bfa" : "#38bdf8",
          isDriven ? 5 : 3
        );

        circle(ctx, x, cy, 4, isDriven ? "#fbbf24" : "#e2e8f0");
      }

      // Illustrative forward beam
      const beamStartX = startX + (count - 1) * spacing + 25;
      const beamY = cy - 8;
      const pulse = Math.sin(phaseRef.current) * 8;

      ctx.beginPath();
      ctx.moveTo(beamStartX, beamY);
      ctx.lineTo(W - 35, cy - 80 - pulse);
      ctx.lineTo(W - 35, cy + 80 + pulse);
      ctx.closePath();
      ctx.fillStyle = "rgba(56,189,248,0.12)";
      ctx.fill();
      ctx.strokeStyle = "rgba(56,189,248,0.5)";
      ctx.stroke();

      label(ctx, "Reflector", startX - 28, cy + 86, "#c4b5fd", 11);
      label(ctx, "Driven", startX + spacing - 24, cy + 86, "#fcd34d", 11);
      label(ctx, "Directors", startX + spacing * 2, cy + 86, "#7dd3fc", 11);

      label(ctx, `Elements: ${count}`, 24, H - 46, "#7dd3fc", 12);
      label(ctx, `Nominal gain: ${gain} dBi`, 24, H - 25, "#fcd34d", 12);
      label(ctx, `Steering: ${angle}°`, W - 140, H - 25, "#c4b5fd", 12);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [elements, gain, angle, paused]);

  return (
    <div className="antenna-visual">
      <canvas ref={canvasRef} width={W} height={H} />
      <p className="antenna-caption">
        A conceptual Yagi–Uda antenna. Real gain and beam shape depend on
        element dimensions, spacing, feed, and surroundings.
      </p>
    </div>
  );
}