import { useMemo } from "react";
import AntennaCanvas, {
  W,
  H,
  setup,
  line,
  circle,
  label,
} from "./AntennaCanvas";

/**
 * Dipole antenna experiment.
 *
 * Shows the radiating dipole rod, the sinusoidal current distribution
 * I(z) = I0·sin(k·(L/2 − |z|)), and radiating wavefronts whose
 * angular intensity follows the true dipole far-field pattern
 *
 *   E(θ) = |cos(kL/2·cos θ) − cos(kL/2)| / sin θ
 *
 * A live resonance readout shows L/λ and estimated R_rad so the user
 * sees *why* L = λ/2 is the target length.
 *
 * A 2D/3D toggle is provided via the `threeD` prop of AntennaCanvas
 * (see the DonutView3D.jsx component).
 */
export default function DipoleLab({
  frequency = 100,
  length = 1.5,
  power = 70,
  paused = false,
}) {
  const draw = useMemo(() => {
    return (ctx, t) => {
      // ── Physics ────────────────────────────────────────────────────
      const lambda = 300 / frequency;    // metres
      const Lratio = length / lambda;
      const kL = 2 * Math.PI * Lratio;

      // ── Background + title ────────────────────────────────────────
      setup(ctx, "DIPOLE ANTENNA", "Half-wave resonance at L = λ/2");

      const cx = W / 2;
      const cy = H / 2 + 20;
      const pxPerMeter = 200 / 3;        // 3 m maps to 200 px
      const rodHalfPx = Math.min(100, (length * pxPerMeter) / 2);

      // ── Ground axis ───────────────────────────────────────────────
      line(ctx, 60, cy, W - 60, cy, "#1e293b", 1);

      // ── Radiating wavefronts (draw before rod) ────────────────────
      drawWavefronts(ctx, cx, cy, t, power, kL);

      // ── Antenna rod ───────────────────────────────────────────────
      const rodTop = cy - rodHalfPx;
      const rodBot = cy + rodHalfPx;
      line(ctx, cx, rodTop, cx, rodBot, "#56e7ff", 4);

      // Feed point
      circle(ctx, cx, cy, 5, "#fbbf24", true);

      // ── Current distribution ──────────────────────────────────────
      drawCurrent(ctx, cx, cy, rodHalfPx, kL, t, power);

      // ── Left-side measurement labels ──────────────────────────────
      label(ctx, `L = ${length.toFixed(2)} m`, 60, rodTop - 24, "#94a3b8", "11px monospace");
      label(ctx, `λ = ${lambda.toFixed(2)} m`, 60, rodTop - 10, "#94a3b8", "11px monospace");
      label(ctx, `L/λ = ${Lratio.toFixed(3)}`, 60, rodBot + 20, "#94a3b8", "11px monospace");

      // ── Resonance readout panel ───────────────────────────────────
      drawReadout(ctx, Lratio);
    };
  }, [frequency, length, power]);

  return (
    <AntennaCanvas
      draw={draw}
      paused={paused}
      threeD={{
        type: "dipole-donut",
        frequencyMHz: frequency,
        lengthM: length,
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                              Drawing helpers                               */
/* -------------------------------------------------------------------------- */

function drawWavefronts(ctx, cx, cy, t, power, kL) {
  const maxR = 220;
  const waveCount = 5;
  const speed = 0.25;                       // wavefronts per second
  const intensity = Math.max(0.1, power / 100);

  // True dipole far-field pattern (peak-normalised later).
  const E = (cosTheta, sinTheta) => {
    if (kL < 0.05) return sinTheta;         // short-dipole limit
    const half = kL / 2;
    const num = Math.cos(half * cosTheta) - Math.cos(half);
    return Math.abs(num) / Math.max(sinTheta, 0.03);
  };

  // Peak search for normalisation
  let peak = 0;
  for (let i = 1; i < 90; i++) {
    const th = (i / 90) * (Math.PI / 2);
    const m = E(Math.cos(th), Math.sin(th));
    if (m > peak) peak = m;
  }
  if (peak < 1e-3) peak = 1;

  for (let w = 0; w < waveCount; w++) {
    const phase = (t * speed + w / waveCount) % 1;
    const r = phase * maxR;
    const fade = (1 - phase) * intensity * 0.7;

    // Draw arc in small segments; brightness modulated by pattern.
    const segs = 120;
    for (let i = 0; i < segs; i++) {
      const a1 = (i / segs) * Math.PI * 2;
      const a2 = ((i + 1) / segs) * Math.PI * 2;

      // For screen angle α, |cos θ| = |sin α| and |sin θ| = |cos α|.
      const cosTheta = Math.abs(Math.sin(a1));
      const sinTheta = Math.abs(Math.cos(a1));
      const mag = E(cosTheta, sinTheta) / peak;
      if (mag < 0.02) continue;

      const x1 = cx + Math.cos(a1) * r;
      const y1 = cy + Math.sin(a1) * r;
      const x2 = cx + Math.cos(a2) * r;
      const y2 = cy + Math.sin(a2) * r;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(86, 231, 255, ${fade * mag})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

function drawCurrent(ctx, cx, cy, rodHalfPx, kL, t, power) {
  const amp = 30 * (power / 100);
  const N = 80;

  // Static current envelope I(z) ∝ sin(k·(L/2 − |z|))
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const zn = (i / N) * 2 - 1;                     // −1 … +1
    const envelope =
      kL < 0.05 ? 0 : Math.sin((kL / 2) * (1 - Math.abs(zn)));
    const x = cx + envelope * amp;
    const y = cy + zn * rodHalfPx;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "rgba(251, 191, 36, 0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Animated pulse travelling up/down the antenna
  const pulsePhase = (t * 0.5) % 1;
  const zn = pulsePhase * 2 - 1;
  const envelope =
    kL < 0.05 ? 0 : Math.sin((kL / 2) * (1 - Math.abs(zn)));
  const pulseX = cx + envelope * amp;
  const pulseY = cy + zn * rodHalfPx;
  circle(ctx, pulseX, pulseY, 5, "#fbbf24", true);

  label(ctx, "I(z)", cx + amp + 12, cy - 10, "rgba(251, 191, 36, 0.65)", "10px monospace");
}

function drawReadout(ctx, Lratio) {
  const x = W - 200;
  const y = 80;
  const w = 180;
  const h = 110;

  // Panel
  ctx.fillStyle = "rgba(8, 17, 31, 0.85)";
  ctx.strokeStyle = "rgba(86, 231, 255, 0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();

  // Values
  label(ctx, "RESONANCE", x + 12, y + 20, "#82aebf", "bold 10px monospace");
  label(ctx, `L/λ = ${Lratio.toFixed(3)}`, x + 12, y + 42, "#d9f5ff", "13px monospace");

  const Rr = estimateRrad(Lratio);
  label(ctx, `R_rad ≈ ${Rr.toFixed(1)} Ω`, x + 12, y + 62, "#94a3b8", "11px monospace");

  const delta = Math.abs(Lratio - 0.5);
  let color, text;
  if (delta < 0.02) {
    color = "#22c55e";
    text = "● RESONANT";
  } else if (delta < 0.1) {
    color = "#eab308";
    text = "○ near resonant";
  } else {
    color = "#64748b";
    text = "○ off-resonance";
  }
  label(ctx, text, x + 12, y + 84, color, "11px monospace");
  label(ctx, "Target: L = λ/2", x + 12, y + 100, "#64748b", "10px monospace");
}

/**
 * Rough estimate of dipole radiation resistance.
 * Short-dipole formula below L/λ = 0.1, then a smooth curve
 * that hits 73 Ω at L/λ = 0.5 (half-wave) and ~200 Ω at L/λ = 1.
 */
function estimateRrad(Lratio) {
  if (Lratio <= 0) return 0;
  if (Lratio < 0.1) return 20 * Math.PI * Math.PI * Lratio * Lratio;
  if (Lratio < 0.5) {
    const tt = (Lratio - 0.1) / 0.4;
    return 2 + 71 * tt * tt;
  }
  return 73 + (Lratio - 0.5) * 254;
}