import React, { useEffect, useRef } from "react";
import { W, H, setup, line, label } from "./AntennaCanvas";

export default function FrequencyWavelength({
  frequency = 100,
  length = 1.5,
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
      if (!paused) timeRef.current += 0.045;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#08111f";
      ctx.fillRect(0, 0, W, H);

      const f = Math.max(1, Number(frequency) || 1);
      const wavelength = 300 / f;

      label(ctx, "FREQUENCY & WAVELENGTH", 24, 32, "#e2e8f0", 15);
      label(ctx, "Relationship for electromagnetic waves in free space", 24, 52, "#94a3b8", 11);

      const left = 55;
      const right = W - 45;
      const midY = H * 0.48;
      const plotW = right - left;
      const cycles = 2;
      const amplitude = 75;

      // Center line
      line(ctx, left, midY, right, midY, "#334155", 1);

      // Draw a sine wave. The plotted cycles are schematic and not to scale.
      ctx.beginPath();
      for (let i = 0; i <= plotW; i++) {
        const x = left + i;
        const phase = (i / plotW) * cycles * Math.PI * 2 + timeRef.current;
        const y = midY - Math.sin(phase) * amplitude;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Mark one schematic wavelength
      const markerStart = left + 20;
      const markerEnd = markerStart + plotW / cycles;

      line(ctx, markerStart, midY + 100, markerEnd, midY + 100, "#fbbf24", 2);
      line(ctx, markerStart, midY + 90, markerStart, midY + 110, "#fbbf24", 2);
      line(ctx, markerEnd, midY + 90, markerEnd, midY + 110, "#fbbf24", 2);

      label(ctx, "One plotted wavelength", markerStart + 30, midY + 125, "#fcd34d", 11);
      label(ctx, `Frequency: ${f} MHz`, 24, H - 48, "#7dd3fc", 12);
      label(ctx, `λ ≈ ${(wavelength).toFixed(2)} m`, 24, H - 26, "#fcd34d", 12);
      label(ctx, `Antenna length: ${length} m`, W - 190, H - 26, "#c4b5fd", 12);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [frequency, length, paused]);

  return (
    <div className="antenna-visual">
      <canvas ref={canvasRef} width={W} height={H} />
      <p className="antenna-caption">
        For free-space propagation, wavelength in metres is approximately
        300 divided by frequency in MHz. The waveform is illustrative rather
        than plotted to physical scale.
      </p>
    </div>
  );
}