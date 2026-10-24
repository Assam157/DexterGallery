import React, { useEffect, useRef } from "react";
import { W, H, setup, line, circle, label } from "./AntennaCanvas";

export default function SignalTransmission({
  frequency = 100,
  power = 70,
  angle = 0,
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
      if (!paused) timeRef.current += 0.06;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#08111f";
      ctx.fillRect(0, 0, W, H);

      label(ctx, "SIGNAL TRANSMISSION", 24, 32, "#e2e8f0", 15);
      label(ctx, "Transmitter → propagation → receiver", 24, 52, "#94a3b8", 11);

      const tx = 100;
      const rx = W - 100;
      const cy = H * 0.52;

      // Ground reference
      line(ctx, 45, cy + 105, W - 45, cy + 105, "#334155", 1);

      // Transmitter mast
      line(ctx, tx, cy - 30, tx, cy + 80, "#a78bfa", 4);
      line(ctx, tx - 28, cy - 30, tx + 28, cy - 30, "#a78bfa", 4);
      circle(ctx, tx, cy - 30, 6, "#fbbf24");

      // Receiver mast
      line(ctx, rx, cy - 30, rx, cy + 80, "#38bdf8", 4);
      line(ctx, rx - 28, cy - 30, rx + 28, cy - 30, "#38bdf8", 4);
      circle(ctx, rx, cy - 30, 6, "#7dd3fc");

      // Propagating wavefronts
      const span = rx - tx - 55;
      for (let i = 0; i < 5; i++) {
        const progress = (timeRef.current * 55 + i * 58) % span;
        const x = tx + 35 + progress;
        const alpha = 0.9 - (progress / span) * 0.5;

        ctx.beginPath();
        ctx.ellipse(x, cy - 25, 12, 38, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56,189,248,${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Connection / direction
      line(ctx, tx + 35, cy - 30, rx - 35, cy - 30, "rgba(125,211,252,0.35)", 1);

      label(ctx, "TRANSMITTER", tx - 40, cy + 100, "#c4b5fd", 11);
      label(ctx, "RECEIVER", rx - 35, cy + 100, "#7dd3fc", 11);
      label(ctx, `${frequency} MHz`, W / 2 - 30, cy - 48, "#e2e8f0", 13);
      label(ctx, `Power: ${power}%`, 24, H - 46, "#fcd34d", 12);
      label(ctx, `Direction: ${angle}°`, 24, H - 25, "#7dd3fc", 12);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [frequency, power, angle, paused]);

  return (
    <div className="antenna-visual">
      <canvas ref={canvasRef} width={W} height={H} />
      <p className="antenna-caption">
        Wavefronts are animated for teaching purposes. Real propagation depends
        on frequency, distance, obstacles, antenna characteristics, and the
        environment.
      </p>
    </div>
  );
}