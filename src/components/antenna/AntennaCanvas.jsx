 
import React, { useEffect, useRef } from "react";

export const W = 760;
export const H = 500;

export default function AntennaCanvas({
  draw,
  paused = false,
  className = "",
}) {
  const canvasRef = useRef(null);
  const drawRef = useRef(draw);

  // Always use the latest drawing function without restarting the effect.
  drawRef.current = draw;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx || typeof ctx.fillRect !== "function") {
      console.error(
        "AntennaCanvas: Could not obtain a valid 2D canvas context."
      );
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
        } else {
          console.error("AntennaCanvas: draw must be a function.");
          return;
        }
      } catch (error) {
        console.error("AntennaCanvas drawing failed:", error);
        return;
      }

      if (!paused && !cancelled) {
        raf = requestAnimationFrame(render);
      }
    };

    render(0);

    return () => {
      cancelled = true;
      if (raf !== null) {
        cancelAnimationFrame(raf);
      }
    };
  }, [paused]);

  return (
    <canvas
      ref={canvasRef}
      className={`antenna-canvas ${className}`}
      width={W}
      height={H}
      role="img"
      aria-label="Interactive antenna and electromagnetic wave simulation"
    />
  );
}
export function setup(target, title = "", subtitle = "") {
  // Accept either a canvas element or an existing 2D context.
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
 
export function line(
  ctx,
  x1,
  y1,
  x2,
  y2,
  color = "#56e7ff",
  width = 3
) {
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

export function label(
  ctx,
  text,
  x,
  y,
  color = "#bdefff",
  font = "12px monospace"
) {
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
      r = 0.12 + 0.88 * Math.exp(
        -Math.pow(wrap(theta - rotation) / 0.42, 2)
      );
    } else if (mode === "yagi") {
      r = 0.12 + 0.88 * Math.pow(
        Math.max(0, Math.cos((theta - rotation) / 2)),
        5
      );
    } else if (mode === "array") {
      r = 0.08 + 0.92 * Math.pow(
        Math.abs(
          Math.cos((theta - rotation) / 2) *
          Math.cos(4 * (theta - rotation))
        ),
        1.2
      );
    } else {
      r = Math.sqrt(
        Math.max(0, 1 - Math.pow(Math.cos(theta - rotation), 2))
      );
    }

    const x = cx + Math.cos(theta) * r * maxR;
    const y = cy + Math.sin(theta) * r * maxR;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
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
 