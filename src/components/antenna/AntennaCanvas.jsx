import React, { lazy, Suspense, useEffect, useRef, useState } from "react";

export const W = 760;
export const H = 500;

// Lazy-load Three.js so experiments that don't use 3D never pay for it.
const DonutView3D = lazy(() => import("./DonutView3D.jsx"));

export default function AntennaCanvas({
  draw,
  paused = false,
  className = "",
  threeD = null, // { type: "dipole-donut", frequencyMHz, lengthM }
}) {
  const canvasRef = useRef(null);
  const drawRef = useRef(draw);
  const [mode, setMode] = useState("2d"); // "2d" | "3d"

  // Keep the latest draw fn without restarting the effect.
  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  // If the parent removes the 3D option, snap back to 2D.
  useEffect(() => {
    if (!threeD) setMode("2d");
  }, [threeD]);

  // 2D render loop — re-runs when paused or mode changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx || typeof ctx.fillRect !== "function") {
      console.error("AntennaCanvas: could not obtain a 2D context.");
      return;
    }

    let raf = null;
    let cancelled = false;

    const render = (time) => {
      if (cancelled) return;

      try {
        ctx.clearRect(0, 0, W, H);
        if (typeof drawRef.current === "function") {
          drawRef.current(ctx, time / 1000);
        }
      } catch (err) {
        console.error("AntennaCanvas drawing failed:", err);
        return;
      }

      // Stop the loop when paused or when the 3D view is showing.
      if (!paused && mode === "2d" && !cancelled) {
        raf = requestAnimationFrame(render);
      }
    };

    if (mode === "2d") render(0);

    return () => {
      cancelled = true;
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [paused, mode]);

  const showToggle = Boolean(threeD);

  return (
    <div className="antenna-canvas-wrap">
      {showToggle && (
        <div className="antenna-mode-toggle" role="tablist" aria-label="View mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "2d"}
            className={mode === "2d" ? "active" : ""}
            onClick={() => setMode("2d")}
          >
            2D
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "3d"}
            className={mode === "3d" ? "active" : ""}
            onClick={() => setMode("3d")}
          >
            3D
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`antenna-canvas ${className}`.trim()}
        width={W}
        height={H}
        role="img"
        aria-label="Interactive antenna and electromagnetic wave simulation"
        style={{ display: mode === "2d" ? "block" : "none" }}
      />

      {threeD && mode === "3d" && (
        <Suspense fallback={<div className="antenna-3d-loading">Loading 3D…</div>}>
          <DonutView3D
            type={threeD.type ?? "dipole-donut"}
            frequencyMHz={threeD.frequencyMHz ?? 100}
            lengthM={threeD.lengthM ?? 1.5}
            paused={paused}
          />
        </Suspense>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Drawing helpers                               */
/* -------------------------------------------------------------------------- */

export function setup(target, title = "", subtitle = "") {
  const ctx =
    target && typeof target.getContext === "function"
      ? target.getContext("2d")
      : target;

  if (!ctx || typeof ctx.fillRect !== "function") {
    throw new TypeError(
      "setup() needs a canvas element or a valid 2D canvas context."
    );
  }

  ctx.fillStyle = "#08111f";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(52, 120, 150, 0.13)";
  ctx.lineWidth = 1;

  for (let x = 20; x < W; x += 25) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 20; y < H; y += 25) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  if (title) {
    ctx.fillStyle = "#d9f5ff";
    ctx.font = "bold 17px monospace";
    ctx.fillText(title, 24, 32);
  }
  if (subtitle) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px monospace";
    ctx.fillText(subtitle, 24, 52);
  }

  return ctx;
}

export function line(ctx, x1, y1, x2, y2, color = "#56e7ff", width = 3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

export function circle(ctx, x, y, r, color, fill = false) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  if (fill) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

export function label(ctx, text, x, y, color = "#bdefff", font = "12px monospace") {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.fillText(text, x, y);
}

export function drawRadiationPattern(
  ctx,
  cx,
  cy,
  scale,
  angleDeg = 0,
  mode = "dipole",
  gain = 8
) {
  const rotation = (angleDeg * Math.PI) / 180;
  const maxR = scale * (0.75 + gain / 40);

  ctx.beginPath();

  for (let i = 0; i <= 720; i++) {
    const theta = (i * Math.PI * 2) / 720;
    let r;

    if (mode === "dish") {
      r = 0.12 + 0.88 * Math.exp(-Math.pow(wrap(theta - rotation) / 0.42, 2));
    } else if (mode === "yagi") {
      r = 0.12 + 0.88 * Math.pow(Math.max(0, Math.cos((theta - rotation) / 2)), 5);
    } else if (mode === "array") {
      r =
        0.08 +
        0.92 *
          Math.pow(
            Math.abs(
              Math.cos((theta - rotation) / 2) * Math.cos(4 * (theta - rotation))
            ),
            1.2
          );
    } else {
      r = Math.sqrt(Math.max(0, 1 - Math.pow(Math.cos(theta - rotation), 2)));
    }

    const x = cx + Math.cos(theta) * r * maxR;
    const y = cy + Math.sin(theta) * r * maxR;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.fillStyle = "rgba(0, 224, 255, 0.13)";
  ctx.fill();
  ctx.strokeStyle = "#21e6ff";
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let r = scale / 4; r <= maxR; r += scale / 4) {
    circle(ctx, cx, cy, r, "rgba(105, 180, 200, 0.22)");
  }
}

function wrap(angle) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}