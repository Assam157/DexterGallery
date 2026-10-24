import React, { useEffect, useRef } from "react";
import { W, H, setup, line, circle, label } from "./AntennaCanvas";

export default function PhasedArray({
  elements = 8,
  phase = 25,
  gain = 8,
  paused = false,
}) {
  const canvasRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = setup(canvas);
    let raf;

    const draw = () => {
      if (!paused) timeRef.current += 0.035;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#08111f";
      ctx.fillRect(0, 0, W, H);

      label(ctx, "PHASED ARRAY", 24, 32, "#e2e8f0", 15);
      label(ctx, "Electronic beam steering concept", 24, 52, "#94a3b8", 11);

      const count = Math.max(2, Math.min(16, elements));
      const spacing = Math.min(42, 340 / count);
      const startX = W * 0.22;
      const centerY = H * 0.52;
      const phaseRad = (phase * Math.PI) / 180;

      // Antenna elements
      for (let i = 0; i < count; i++) {
        const x = startX + i * spacing;
        const y = centerY + Math.sin(timeRef.current + i * phaseRad) * 8;

        line(ctx, x, centerY - 38, x, centerY + 38, "#38bdf8", 3);
        circle(ctx, x, y, 5, "#fbbf24");

        // Feed line
        line(ctx, x, centerY + 42, x, centerY + 68, "#475569", 1);
      }

      // Schematic steered beam
      const lastX = startX + (count - 1) * spacing;
      const sourceX = (startX + lastX) / 2;
      const steer = Math.max(-55, Math.min(55, phase)) * (Math.PI / 180);
      const beamLength = 250;
      const beamX = sourceX + Math.cos(steer) * beamLength;
      const beamY = centerY - Math.sin(steer) * beamLength;

      line(ctx, sourceX, centerY, beamX, beamY, "#fbbf24", 3);

      // Beam width lines
      line(
        ctx,
        sourceX,
        centerY,
        beamX + Math.sin(steer) * 35,
        beamY + Math.cos(steer) * 35,
        "rgba(251,191,36,0.55)",
        1
      );
      line(
        ctx,
        sourceX,
        centerY,
        beamX - Math.sin(steer) * 35,
        beamY - Math.cos(steer) * 35,
        "rgba(251,191,36,0.55)",
        1
      );

      label(ctx, `Elements: ${count}`, 24, H - 46, "#7dd3fc", 12);
      label(ctx, `Phase shift: ${phase}°`, 24, H - 25, "#fcd34d", 12);
      label(ctx, `Gain setting: ${gain}`, W - 145, H - 25, "#c4b5fd", 12);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [elements, phase, gain, paused]);

  return (
    <div className="antenna-visual">
      <canvas ref={canvasRef} width={W} height={H} />
      <p className="antenna-caption">
        This is a schematic visualization of phase-controlled steering, not an
        electromagnetic array-factor calculation.
      </p>
    </div>
  );
}