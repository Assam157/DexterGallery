 import { useEffect, useRef } from "react";
import { W, H, setup, line, circle, label } from "./AntennaCanvas";

export default function Polarization({
  polarization = "vertical",
  paused = false,
}) {
  const canvasRef = useRef(null);
  const timeRef = useRef(0);
  const lastTsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Polarization: unable to obtain a 2D canvas context.");
      return;
    }

    let raf = null;
    let cancelled = false;

    // Reset delta-tracking so the first frame after a re-run never
    // computes a huge dt from a stale timestamp.
    lastTsRef.current = null;

    const mode = String(polarization).toLowerCase();

    const draw = (ts) => {
      if (cancelled) return;

      // Advance phase using wall-clock time → frame-rate independent.
      if (!paused && lastTsRef.current !== null) {
        const dt = (ts - lastTsRef.current) / 1000;
        // Clamp to 50 ms so a backgrounded tab doesn't cause a phase jump.
        timeRef.current += Math.min(dt, 0.05) * 2.7; // ≈ 0.43 Hz
      }
      lastTsRef.current = ts;

      setup(ctx, "POLARIZATION", "Electric-field orientation");

      const cx = W / 2;
      const cy = H / 2;

      // Coordinate axes.
      line(ctx, cx - 180, cy, cx + 180, cy, "#334155", 1);
      line(ctx, cx, cy - 155, cx, cy + 155, "#334155", 1);

      // ✅ fixed: pass a colour AND a font string (not a bare number).
      label(ctx, "Horizontal", cx + 115, cy + 20, "#94a3b8", "11px monospace");
      label(ctx, "Vertical", cx + 12, cy - 130, "#94a3b8", "11px monospace");

      const t = timeRef.current;
      const amplitude = 105;

      let ex = 0;
      let ey = 0;

      if (mode.includes("horizontal")) {
        ex = Math.sin(t) * amplitude;
      } else if (mode.includes("circular")) {
        ex = Math.cos(t) * amplitude;
        ey = Math.sin(t) * amplitude;
      } else if (mode.includes("elliptical")) {
        ex = Math.cos(t) * amplitude;
        ey = Math.sin(t) * amplitude * 0.55;
      } else {
        // Default: vertical polarization.
        ey = Math.sin(t) * amplitude;
      }

      // Electric-field vector.
      line(ctx, cx, cy, cx + ex, cy - ey, "#38bdf8", 4);
      circle(ctx, cx + ex, cy - ey, 6, "#fbbf24", true);
      circle(ctx, cx, cy, 4, "#e2e8f0", true);

      // Trace the endpoint's path.
      ctx.beginPath();
      for (let i = 0; i <= 160; i++) {
        const a = (i / 160) * Math.PI * 2;
        let x;
        let y;

        if (mode.includes("horizontal")) {
          x = cx + Math.sin(a) * amplitude;
          y = cy;
        } else if (mode.includes("circular")) {
          x = cx + Math.cos(a) * amplitude;
          y = cy - Math.sin(a) * amplitude;
        } else if (mode.includes("elliptical")) {
          x = cx + Math.cos(a) * amplitude;
          y = cy - Math.sin(a) * amplitude * 0.55;
        } else {
          x = cx;
          y = cy - Math.sin(a) * amplitude;
        }

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(167,139,250,0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // ✅ fixed: colour AND font string, not a bare 12.
      label(ctx, `Mode: ${polarization}`, 24, H - 25, "#c4b5fd", "12px monospace");

      if (!paused && !cancelled) {
        raf = requestAnimationFrame(draw);
      }
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelled = true;
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [polarization, paused]);

  return (
    <div className="antenna-visual">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        role="img"
        aria-label="Interactive polarization simulation"
      />
      <p className="antenna-caption">
        Polarization describes the orientation and time-varying path of the
        electric-field vector. The animation is a simplified teaching aid.
      </p>
    </div>
  );
}