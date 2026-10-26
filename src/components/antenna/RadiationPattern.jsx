import React, { useEffect, useRef, useState } from "react";
import { W, H, label, line, circle } from "./AntennaCanvas";

/* -------------------------------------------------------------------------- */
/*                              Pattern library                               */
/* -------------------------------------------------------------------------- */
/* Every fn(psi, angle) returns |E| normalized to ~1 at its peak.
 *  psi   = plot-plane angle in radians (0 = right, π/2 = up)
 *  angle = beam direction (or dipole rotation) in radians                */
const PATTERNS = {
  isotropic: {
    name: "Isotropic (reference)",
    gain: 0.0,
    fn: () => 1,
  },
  shortDipole: {
    name: "Short Dipole  (L ≪ λ)",
    gain: 1.76,
    fn: (psi, angle) => Math.abs(Math.cos(psi - angle)),
  },
  halfWaveDipole: {
    name: "Half-Wave Dipole  (L = λ/2)",
    gain: 2.15,
    fn: (psi, angle) => {
      const rel = psi - angle;
      const c = Math.cos(rel);
      if (Math.abs(c) < 1e-4) return 0;
      return Math.abs(Math.cos((Math.PI / 2) * Math.sin(rel)) / c);
    },
  },
  fullWaveDipole: {
    name: "Full-Wave Dipole  (L = λ)",
    gain: 3.82,
    fn: (psi, angle) => {
      const rel = psi - angle;
      const c = Math.cos(rel);
      if (Math.abs(c) < 1e-4) return 0;
      return Math.abs((Math.cos(Math.PI * Math.sin(rel)) + 1) / c);
    },
  },
  monopole: {
    name: "Vertical Monopole  (λ/4 over ground)",
    gain: 5.15,
    fn: (psi, angle) => {
      const rel = psi - angle;
      if (Math.sin(rel) < 0) return 0;
      return Math.abs(Math.cos(rel));
    },
  },
  patch: {
    name: "Microstrip Patch",
    gain: 7.0,
    fn: (psi, angle) => {
      const rel = psi - angle;
      const c = Math.cos(rel);
      return (
        Math.pow(Math.max(0, c), 4) + 0.12 * Math.pow(Math.max(0, -c), 2)
      );
    },
  },
  yagi: {
    name: "Yagi-Uda  (6 elem)",
    gain: 11.0,
    fn: (psi, angle) => {
      const rel = psi - angle;
      const c = Math.cos(rel);
      const main = Math.pow(Math.max(0, c), 10);
      const side1 = 0.15 * Math.exp(-Math.pow((Math.abs(rel) - 0.9) / 0.2, 2));
      const back = 0.08 * Math.pow(Math.max(0, -c), 3);
      return main + side1 + back;
    },
  },
  dish: {
    name: "Parabolic Dish  (illustrative)",
    gain: 30.0,
    fn: (psi, angle) => {
      const rel = psi - angle;
      const main = Math.exp(-Math.pow(rel / 0.05, 2));
      const s1 = 0.1 * Math.exp(-Math.pow((Math.abs(rel) - 0.2) / 0.03, 2));
      const s2 = 0.04 * Math.exp(-Math.pow((Math.abs(rel) - 0.4) / 0.04, 2));
      const s3 = 0.01 * Math.exp(-Math.pow((Math.abs(rel) - 0.6) / 0.05, 2));
      return main + s1 + s2 + s3 + 0.005;
    },
  },
  array: {
    name: "Phased Array  (8 elem, λ/2)",
    gain: 11.15,
    fn: (psi, angle) => {
      const N = 8;
      const d = 0.5; // in wavelengths
      const phi = 2 * Math.PI * d * (Math.cos(psi) - Math.cos(angle));
      const denom = Math.sin(phi / 2);
      if (Math.abs(denom) < 1e-6) return 1;
      return Math.abs(Math.sin((N * phi) / 2) / (N * denom));
    },
  },
  helical: {
    name: "Helical  (axial mode)",
    gain: 13.0,
    fn: (psi, angle) => {
      const rel = psi - angle;
      const c = Math.cos(rel);
      return Math.pow(Math.max(0, c), 2.5) + 0.15 * Math.pow(Math.max(0, -c), 1);
    },
  },
};

const LINEAR_PATTERNS = new Set([
  "isotropic",
  "shortDipole",
  "halfWaveDipole",
  "fullWaveDipole",
  "monopole",
]);

/* -------------------------------------------------------------------------- */
/*                              Pattern analysis                              */
/* -------------------------------------------------------------------------- */
function analyzePattern(fn, angleRad) {
  const N = 720;
  const samples = new Float32Array(N);
  let peak = 0;
  let peakIdx = 0;

  for (let i = 0; i < N; i++) {
    const psi = (i / N) * 2 * Math.PI;
    const val = fn(psi, angleRad);
    samples[i] = val;
    if (val > peak) {
      peak = val;
      peakIdx = i;
    }
  }

  // HPBW: walk out from peak to the −3 dB points
  const threshold = peak / Math.SQRT2;
  let left = peakIdx;
  let right = peakIdx;
  for (let i = 1; i < N / 2; i++) {
    const idx = (peakIdx - i + N) % N;
    if (samples[idx] < threshold) {
      left = (idx + 1) % N;
      break;
    }
  }
  for (let i = 1; i < N / 2; i++) {
    const idx = (peakIdx + i) % N;
    if (samples[idx] < threshold) {
      right = (idx - 1 + N) % N;
      break;
    }
  }
  let hpbw = ((right - left + N) % N) * (360 / N);
  if (hpbw === 0) hpbw = 360;

  // Sidelobe level: highest local max outside the main lobe
  let sll = -60;
  for (let i = 0; i < N; i++) {
    const prev = samples[(i - 1 + N) % N];
    const curr = samples[i];
    const next = samples[(i + 1) % N];
    if (curr > prev && curr > next) {
      const dist = Math.min(
        (i - peakIdx + N) % N,
        (peakIdx - i + N) % N
      ) * (360 / N);
      if (dist > hpbw) {
        const sllDb = 20 * Math.log10(curr / peak);
        if (sllDb > sll) sll = sllDb;
      }
    }
  }

  return { peak, hpbw, sll };
}

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */
export default function RadiationPattern({
  power = 70,
  angle = 0,
  paused = false,
}) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  const [patternKey, setPatternKey] = useState("halfWaveDipole");
  const [dbMode, setDbMode] = useState(false);
  const [dbRange, setDbRange] = useState(30);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pattern = PATTERNS[patternKey];
    const angleRad = (angle * Math.PI) / 180;
    const { hpbw, sll } = analyzePattern(pattern.fn, angleRad);

    let raf = null;
    let cancelled = false;

    const draw = () => {
      if (cancelled) return;

      // ── Background ──────────────────────────────────────────────
      ctx.fillStyle = "#08111f";
      ctx.fillRect(0, 0, W, H);

      // ── Header ──────────────────────────────────────────────────
      ctx.fillStyle = "#d9f5ff";
      ctx.font = "bold 17px monospace";
      ctx.fillText("RADIATION PATTERN", 24, 32);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px monospace";
      ctx.fillText(
        `${pattern.name}  ·  Gain ${pattern.gain.toFixed(1)} dBi  ·  HPBW ${hpbw.toFixed(1)}°`,
        24,
        52
      );

      // ── Plot geometry ───────────────────────────────────────────
      const cx = W / 2;
      const cy = H / 2 + 15;
      const maxR = Math.min(W, H) * 0.34;

      // ── Polar grid ──────────────────────────────────────────────
      for (let i = 1; i <= 4; i++) {
        const rr = (maxR * i) / 4;
        circle(ctx, cx, cy, rr, "#243247");
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

      // ── Grid labels ─────────────────────────────────────────────
      if (dbMode) {
        for (let i = 0; i <= 4; i++) {
          const rr = (maxR * i) / 4;
          const dB = -dbRange + (dbRange * i) / 4;
          ctx.fillStyle = "#475569";
          ctx.font = "9px monospace";
          ctx.fillText(`${dB.toFixed(0)}`, cx + rr + 4, cy - 4);
        }
      } else {
        for (let i = 1; i <= 4; i++) {
          const rr = (maxR * i) / 4;
          ctx.fillStyle = "#475569";
          ctx.font = "9px monospace";
          ctx.fillText(`${(i * 25).toFixed(0)}%`, cx + rr + 4, cy - 4);
        }
      }

      // Compass labels
      label(ctx, "0°", cx + maxR + 10, cy + 4, "#94a3b8", "11px monospace");
      label(ctx, "90°", cx - 10, cy + maxR + 18, "#94a3b8", "11px monospace");
      label(ctx, "180°", cx - maxR - 32, cy + 4, "#94a3b8", "11px monospace");
      label(ctx, "270°", cx - 14, cy - maxR - 10, "#94a3b8", "11px monospace");

      // ── Pattern body ────────────────────────────────────────────
      const STEPS = 480;
      const pts = [];
      for (let i = 0; i <= STEPS; i++) {
        const psi = (i / STEPS) * 2 * Math.PI;
        let val = pattern.fn(psi, angleRad);
        if (!Number.isFinite(val)) val = 0;
        val = Math.max(0, Math.min(1, val));

        let rDisp;
        if (dbMode) {
          const dB = 20 * Math.log10(Math.max(val, 1e-6));
          const clamped = Math.max(-dbRange, dB);
          rDisp = (maxR * (clamped + dbRange)) / dbRange;
        } else {
          rDisp = maxR * val;
        }
        pts.push([cx + Math.cos(psi) * rDisp, cy + Math.sin(psi) * rDisp]);
      }

      ctx.beginPath();
      pts.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(56, 189, 248, 0.16)";
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.stroke();

      // ── Main axis / steering indicator ─────────────────────────
      if (LINEAR_PATTERNS.has(patternKey)) {
        // Dipole family: antenna axis is perpendicular to the lobes
        const axisRad = angleRad + Math.PI / 2;
        line(
          ctx,
          cx - Math.cos(axisRad) * maxR,
          cy - Math.sin(axisRad) * maxR,
          cx + Math.cos(axisRad) * maxR,
          cy + Math.sin(axisRad) * maxR,
          "rgba(251, 191, 36, 0.6)",
          1
        );
      } else if (patternKey !== "isotropic") {
        line(
          ctx,
          cx,
          cy,
          cx + Math.cos(angleRad) * maxR,
          cy + Math.sin(angleRad) * maxR,
          "#fbbf24",
          2
        );
      }

      circle(ctx, cx, cy, 4, "#fbbf24", true);

      // ── Radar sweep (animated unless paused) ────────────────────
      const sweepAlpha = 0.25 + (power / 100) * 0.4;
      const sweepDeg = paused ? frameRef.current : frameRef.current;
      const sweepRad = (sweepDeg * Math.PI) / 180;
      for (let i = 0; i < 40; i++) {
        const trailRad = ((sweepDeg - i * 2.5) * Math.PI) / 180;
        const a = (1 - i / 40) * sweepAlpha * 0.6;
        line(
          ctx,
          cx,
          cy,
          cx + Math.cos(trailRad) * maxR,
          cy + Math.sin(trailRad) * maxR,
          `rgba(56, 189, 248, ${a})`,
          1
        );
      }
      line(
        ctx,
        cx,
        cy,
        cx + Math.cos(sweepRad) * maxR,
        cy + Math.sin(sweepRad) * maxR,
        "rgba(56, 189, 248, 0.9)",
        1.5
      );

      // ── Readouts ────────────────────────────────────────────────
      label(
        ctx,
        `Gain: ${pattern.gain.toFixed(1)} dBi`,
        24,
        H - 44,
        "#7dd3fc",
        "12px monospace"
      );
      label(
        ctx,
        `HPBW: ${hpbw.toFixed(1)}°`,
        24,
        H - 24,
        "#7dd3fc",
        "12px monospace"
      );
      label(
        ctx,
        `SLL: ${sll > -50 ? sll.toFixed(1) : "—"} dB`,
        W - 150,
        H - 44,
        "#7dd3fc",
        "12px monospace"
      );
      label(
        ctx,
        `${LINEAR_PATTERNS.has(patternKey) ? "Orient" : "Steer"}: ${angle}°`,
        W - 150,
        H - 24,
        "#fcd34d",
        "12px monospace"
      );

      // ── Loop only while running ────────────────────────────────
      if (!paused && !cancelled) {
        frameRef.current = (frameRef.current + 1.5) % 360;
        raf = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [patternKey, dbMode, dbRange, angle, power, paused]);

  return (
    <div className="antenna-visual">
      <div className="rad-pattern-toolbar">
        <label className="rad-toolbar-label">
          <span>Pattern</span>
          <select
            value={patternKey}
            onChange={(e) => setPatternKey(e.target.value)}
          >
            {Object.entries(PATTERNS).map(([key, p]) => (
              <option key={key} value={key}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="rad-toolbar-checkbox">
          <input
            type="checkbox"
            checked={dbMode}
            onChange={(e) => setDbMode(e.target.checked)}
          />
          <span>dB scale</span>
        </label>

        {dbMode && (
          <label className="rad-toolbar-label">
            <span>Range</span>
            <select
              value={dbRange}
              onChange={(e) => setDbRange(Number(e.target.value))}
            >
              <option value={10}>10 dB</option>
              <option value={20}>20 dB</option>
              <option value={30}>30 dB</option>
              <option value={40}>40 dB</option>
            </select>
          </label>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        role="img"
        aria-label="Antenna radiation pattern polar plot"
      />

      <p className="antenna-caption">
        Compare omnidirectional and directional patterns. In dB mode you can
        see sidelobes that disappear in linear scale. HPBW and SLL are measured
        live from the plotted pattern.
      </p>
    </div>
  );
}