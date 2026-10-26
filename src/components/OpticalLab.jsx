
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import PolarisationExperiment from "./PolarizationExperiment";
import RGBMixingExperiment from "./RGBMixing";
import PrismExperiment from "./PrismExperiment";

import "./RadiationDexterLab.css";

const W = 500;
const H = 220;
const F = 90;

const REF_INDEX = {
  water: 1.33,
  glass: 1.5,
};

export default function OpticalDexterLab() {
  const canvasRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const tRef = useRef(0);
  const mountedRef = useRef(true);

  const navigate = useNavigate();

  const [angle, setAngle] = useState(40);
  const [medium, setMedium] = useState("water");
  const [experiment, setExperiment] = useState("refraction");
  const [lightOn, setLightOn] = useState(false);

  const [lensType, setLensType] = useState("convex");
  const [sourceY, setSourceY] = useState(-1);
  const [incidentMedium, setIncidentMedium] = useState("air");
  const [objectCase, setObjectCase] = useState("beyond2f");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [canvasSize, setCanvasSize] = useState({
    width: W,
    height: H,
  });

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Resize the canvas when its container changes size.
  useEffect(() => {
    const container = canvasWrapRef.current;

    if (!container) return;

    const resizeCanvas = () => {
      const availableWidth = container.clientWidth;

      if (!availableWidth) return;

      const aspectRatio = W / H;
      const width = Math.max(1, Math.floor(availableWidth));
      const height = Math.max(1, Math.floor(width / aspectRatio));

      setCanvasSize((previous) => {
        if (
          previous.width === width &&
          previous.height === height
        ) {
          return previous;
        }

        return { width, height };
      });
    };

    resizeCanvas();

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Reset the ray animation when the light is switched on
  // or the experiment changes.
  useEffect(() => {
    if (lightOn) {
      tRef.current = 0;
    }
  }, [lightOn, experiment]);

  /* =========================================================
     REFRACTION EXPERIMENT
  ========================================================= */

  function drawRefraction(ctx) {
    const cx = W / 2;
    const cy = H / 2;

    const INCIDENT_LEN = 240;
    const REFRACT_LEN = 240;

    const goingDown = incidentMedium === "air";

    const n1 = goingDown ? 1.0 : REF_INDEX[medium];
    const n2 = goingDown ? REF_INDEX[medium] : 1.0;

    const i = (angle * Math.PI) / 180;

    const sinR = (n1 / n2) * Math.sin(i);
    const isTIR = sinR > 1;

    const r = isTIR ? null : Math.asin(sinR);

    const criticalAngle =
      n1 > n2
        ? (Math.asin(n2 / n1) * 180) / Math.PI
        : null;

    // Interface.
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(W, cy);
    ctx.stroke();

    // Normal.
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "#475569";

    ctx.beginPath();
    ctx.moveTo(cx, 30);
    ctx.lineTo(cx, H - 30);
    ctx.stroke();

    ctx.setLineDash([]);

    // Medium labels.
    ctx.font = "13px monospace";
    ctx.fillStyle = "#7dd3fc";

    ctx.fillText("AIR (n = 1.00)", 20, cy - 20);

    ctx.fillText(
      `${medium.toUpperCase()} (n = ${REF_INDEX[medium].toFixed(2)})`,
      20,
      cy + 30
    );

    // Critical angle.
    if (criticalAngle !== null) {
      ctx.font = "11px monospace";
      ctx.fillStyle = isTIR ? "#ef4444" : "#94a3b8";

      ctx.fillText(
        `θc = ${criticalAngle.toFixed(1)}°`,
        20,
        cy - 42
      );
    }

    if (!lightOn) return;

    const anim = Math.min(tRef.current / 45, 1);

    const dxI = Math.sin(i);
    const dyI = goingDown ? Math.cos(i) : -Math.cos(i);

    // Incident ray.
    const srcX = cx - dxI * INCIDENT_LEN;
    const srcY = cy - dyI * INCIDENT_LEN;

    const headX = srcX + dxI * INCIDENT_LEN * anim;
    const headY = srcY + dyI * INCIDENT_LEN * anim;

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#22c55e";

    ctx.beginPath();
    ctx.moveTo(srcX, srcY);
    ctx.lineTo(headX, headY);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Refracted ray or total internal reflection.
    if (anim >= 1) {
      const rayColor = isTIR ? "#ef4444" : "#facc15";

      ctx.strokeStyle = rayColor;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 8;
      ctx.shadowColor = rayColor;

      ctx.beginPath();
      ctx.moveTo(cx, cy);

      if (!isTIR) {
        const dxR = Math.sin(r);
        const dyR = goingDown ? Math.cos(r) : -Math.cos(r);

        ctx.lineTo(
          cx + dxR * REFRACT_LEN,
          cy + dyR * REFRACT_LEN
        );
      } else {
        ctx.lineTo(
          cx + dxI * REFRACT_LEN,
          cy - dyI * REFRACT_LEN
        );
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Incident angle label.
    ctx.font = "13px monospace";
    ctx.fillStyle = "#22c55e";

    const labelIY = goingDown ? cy - 50 : cy + 65;

    ctx.fillText(
      `i = ${angle.toFixed(1)}°`,
      cx - 150,
      labelIY
    );

    // Refracted angle or TIR label.
    if (!isTIR) {
      ctx.fillStyle = "#facc15";

      const labelRY = goingDown ? cy + 65 : cy - 50;

      ctx.fillText(
        `r = ${((r * 180) / Math.PI).toFixed(1)}°`,
        cx + 40,
        labelRY
      );
    } else {
      ctx.fillStyle = "#ef4444";

      const tirY = goingDown ? cy + 65 : cy - 50;

      ctx.fillText(
        "TOTAL INTERNAL REFLECTION",
        cx + 30,
        tirY
      );
    }

    // Snell's law footer.
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px monospace";

    if (!isTIR) {
      ctx.fillText(
        `${n1.toFixed(2)} · sin(${angle.toFixed(1)}°) = ` +
          `${n2.toFixed(2)} · sin(${(
            (r * 180) /
            Math.PI
          ).toFixed(1)}°)`,
        20,
        H - 20
      );
    } else {
      ctx.fillStyle = "#ef4444";

      ctx.fillText(
        `i = ${angle.toFixed(1)}° > θc = ${criticalAngle.toFixed(1)}° → TIR`,
        20,
        H - 20
      );
    }
  }

  /* =========================================================
     LENS EXPERIMENT
  ========================================================= */

  function drawLens(ctx) {
    const cx = W / 2;
    const cy = H / 2;

    const lensHalfWidth = 18;

    // Principal axis.
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(W, cy);
    ctx.stroke();

    // Focal point markers.
    ctx.font = "12px monospace";

    [-2, -1, 1, 2].forEach((m) => {
      ctx.strokeStyle = "#94a3b8";

      ctx.beginPath();
      ctx.moveTo(cx + m * F, cy - 6);
      ctx.lineTo(cx + m * F, cy + 6);
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";

      ctx.fillText(
        Math.abs(m) === 2 ? "2F" : "F",
        cx + m * F - 8,
        cy + 22
      );
    });

    // Lens body.
    ctx.strokeStyle = "#7fdfff";
    ctx.lineWidth = 2;

    ctx.beginPath();

    if (lensType === "convex") {
      ctx.moveTo(cx, 60);

      ctx.bezierCurveTo(
        cx - 60,
        cy,
        cx - 60,
        cy,
        cx,
        H - 60
      );

      ctx.bezierCurveTo(
        cx + 60,
        cy,
        cx + 60,
        cy,
        cx,
        60
      );
    } else {
      ctx.moveTo(cx - 60, 60);

      ctx.bezierCurveTo(
        cx - lensHalfWidth,
        cy,
        cx - lensHalfWidth,
        cy,
        cx - 60,
        H - 60
      );

      ctx.lineTo(cx + 60, H - 60);

      ctx.bezierCurveTo(
        cx + lensHalfWidth,
        cy,
        cx + lensHalfWidth,
        cy,
        cx + 60,
        60
      );
    }

    ctx.closePath();
    ctx.stroke();

    // Object position.
    const uMap = {
      beyond2f: 3,
      at2f: 2,
      between: 1.5,
      atf: 1,
      near: 0.6,
    };

    const u = uMap[objectCase] * F;

    const objX = cx - u;
    const objH = 80 * sourceY;

    ctx.strokeStyle = "#ff3366";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(objX, cy);
    ctx.lineTo(objX, cy - objH);
    ctx.stroke();

    ctx.fillStyle = "#ff3366";
    ctx.font = "12px monospace";

    ctx.fillText(
      "Object",
      objX - 25,
      cy - objH - 8
    );

    if (!lightOn) return;

    const A = {
      x: objX,
      y: cy - objH,
    };

    const O = {
      x: cx,
      y: cy,
    };

    const F1 = {
      x: cx - F,
      y: cy,
    };

    const F2 = {
      x: cx + F,
      y: cy,
    };

    // Ray 1: parallel to the principal axis.
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;

    const r1Lens = {
      x: cx,
      y: A.y,
    };

    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(r1Lens.x, r1Lens.y);
    ctx.stroke();

    // Ray after the lens.
    let r1Far;

    if (lensType === "convex") {
      const slope =
        (F2.y - r1Lens.y) /
        (F2.x - r1Lens.x || 1);

      r1Far = {
        x: W,
        y: r1Lens.y + slope * (W - r1Lens.x),
      };
    } else {
      const slope =
        (r1Lens.y - F1.y) /
        (r1Lens.x - F1.x || 1);

      r1Far = {
        x: W,
        y: r1Lens.y + slope * (W - r1Lens.x),
      };
    }

    ctx.beginPath();
    ctx.moveTo(r1Lens.x, r1Lens.y);
    ctx.lineTo(r1Far.x, r1Far.y);
    ctx.stroke();

    // Ray 2: through the optical centre.
    const slope2 =
      (O.y - A.y) /
      (O.x - A.x || 1);

    const r2Far = {
      x: W,
      y: A.y + slope2 * (W - A.x),
    };

    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(r2Far.x, r2Far.y);
    ctx.stroke();

    // Line intersection helper.
    function intersect(p1, p2, p3, p4) {
      const d =
        (p1.x - p2.x) * (p3.y - p4.y) -
        (p1.y - p2.y) * (p3.x - p4.x);

      if (Math.abs(d) < 1e-6) return null;

      const x =
        (
          (p1.x * p2.y - p1.y * p2.x) *
            (p3.x - p4.x) -
          (p1.x - p2.x) *
            (p3.x * p4.y - p3.y * p4.x)
        ) / d;

      const y =
        (
          (p1.x * p2.y - p1.y * p2.x) *
            (p3.y - p4.y) -
          (p1.y - p2.y) *
            (p3.x * p4.y - p3.y * p4.x)
        ) / d;

      return { x, y };
    }

    let imgPoint = null;

    if (lensType === "convex" && u > F) {
      imgPoint = intersect(
        r1Lens,
        r1Far,
        A,
        r2Far
      );
    }

    if (lensType === "convex" && u <= F) {
      ctx.setLineDash([6, 6]);

      const r1Back = F1;

      const r2Back = {
        x: cx - 300,
        y: cy - (A.y - cy),
      };

      ctx.beginPath();
      ctx.moveTo(r1Lens.x, r1Lens.y);
      ctx.lineTo(r1Back.x, r1Back.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(r2Back.x, r2Back.y);
      ctx.stroke();

      ctx.setLineDash([]);

      imgPoint = intersect(
        r1Lens,
        r1Back,
        A,
        r2Back
      );
    }

    if (lensType === "concave") {
      ctx.setLineDash([6, 6]);

      const r1Back = F1;

      ctx.beginPath();
      ctx.moveTo(r1Lens.x, r1Lens.y);
      ctx.lineTo(r1Back.x, r1Back.y);
      ctx.stroke();

      ctx.setLineDash([]);

      imgPoint = intersect(
        r1Lens,
        r1Back,
        A,
        r2Far
      );
    }

    // Skip an image inside the lens body.
    if (
      imgPoint &&
      imgPoint.x > cx - lensHalfWidth &&
      imgPoint.x < cx + lensHalfWidth
    ) {
      imgPoint = null;
    }

    // Skip images outside the canvas.
    if (
      imgPoint &&
      (
        imgPoint.x < 0 ||
        imgPoint.x > W ||
        imgPoint.y < 0 ||
        imgPoint.y > H
      )
    ) {
      imgPoint = null;
    }

    // Draw the image.
    if (imgPoint) {
      const isVirtual =
        lensType === "concave" ||
        (lensType === "convex" && u <= F);

      const color = isVirtual
        ? "#ef4444"
        : "#8b5cf6";

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(imgPoint.x, imgPoint.y);
      ctx.lineTo(imgPoint.x, cy);
      ctx.stroke();

      ctx.fillStyle = color;

      ctx.fillText(
        isVirtual ? "Virtual Image" : "Image",
        imgPoint.x - 32,
        imgPoint.y - 8
      );
    }
  }

  /* =========================================================
     CANVAS ANIMATION
  ========================================================= */

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let raf = null;

    function loop() {
      if (
        !mountedRef.current ||
        !canvasRef.current
      ) {
        return;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);

      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);

      if (experiment === "refraction") {
        drawRefraction(ctx);
      }

      if (experiment === "lens") {
        drawLens(ctx);
      }

      ctx.fillStyle = "#475569";
      ctx.font = "11px monospace";

      ctx.fillText(
        `Experiment: ${experiment}`,
        20,
        18
      );

      if (lightOn) {
        tRef.current += 2;
      }

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    return () => {
      if (raf !== null) {
        cancelAnimationFrame(raf);
      }
    };
  }, [
    experiment,
    angle,
    medium,
    lightOn,
    lensType,
    sourceY,
    objectCase,
    incidentMedium,
  ]);

  /* =========================================================
     CONTROL HELPERS
  ========================================================= */

  const changeIncidentMedium = (next) => {
    setLightOn(false);
    setIncidentMedium(next);
  };

  const changeMedium = (next) => {
    setLightOn(false);
    setMedium(next);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((previous) => !previous);
  };

  /* =========================================================
     KEYBOARD CONTROLS
  ========================================================= */

  useEffect(() => {
    function onKey(e) {
      const target = e.target;

      if (
        target instanceof HTMLElement &&
        (
          target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(
            target.tagName
          )
        )
      ) {
        return;
      }

      if (
        experiment !== "refraction" &&
        experiment !== "lens"
      ) {
        return;
      }

      if (experiment === "refraction") {
        if (e.key === "a" || e.key === "A") {
          setAngle((v) =>
            Math.max(5, Math.round((v - 1) * 10) / 10)
          );
        }

        if (e.key === "d" || e.key === "D") {
          setAngle((v) =>
            Math.min(75, Math.round((v + 1) * 10) / 10)
          );
        }

        return;
      }

      if (
        experiment === "lens" &&
        ["a", "d", "A", "D"].includes(e.key)
      ) {
        setSourceY((v) => -v);
      }
    }

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [experiment]);

  /* =========================================================
     RENDER
  ========================================================= */

  const isCanvasExperiment =
    experiment === "refraction" ||
    experiment === "lens";

  return (
    <div
      className={`dexter-root ${
        sidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      {/* Sidebar toggle arrow */}
      <button
        type="button"
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label={
          sidebarCollapsed
            ? "Expand sidebar"
            : "Collapse sidebar"
        }
        aria-expanded={!sidebarCollapsed}
        title={
          sidebarCollapsed
            ? "Expand sidebar"
            : "Collapse sidebar"
        }
      >
        {sidebarCollapsed ? "▶" : "◀"}
      </button>

      {/* LEFT: CONTROL PANEL */}
      <aside
        className="control-panel"
        aria-hidden={sidebarCollapsed}
        inert={sidebarCollapsed ? true : undefined}
      >
        <h2>🔍 OPTICAL LAB</h2>

        {/* Experiment selection */}
        <div className="panel-section">
          <div className="panel-label">
            Experiments
          </div>

          {[
            ["refraction", "Refraction"],
            ["Polarization", "Polarization"],
            ["RGB", "RGB Mixing"],
            ["prism", "VIBGYOR (Prism)"],
            ["lens", "Lens"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={
                experiment === key ? "active" : ""
              }
              onClick={() => setExperiment(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Refraction controls */}
        {experiment === "refraction" && (
          <div className="panel-section">
            <div className="panel-label">
              Material
            </div>

            <button
              type="button"
              className={
                medium === "water" ? "active" : ""
              }
              onClick={() => changeMedium("water")}
            >
              Water (n = 1.33)
            </button>

            <button
              type="button"
              className={
                medium === "glass" ? "active" : ""
              }
              onClick={() => changeMedium("glass")}
            >
              Glass (n = 1.50)
            </button>

            <button
              type="button"
              onClick={() =>
                changeIncidentMedium(
                  incidentMedium === "air"
                    ? medium
                    : "air"
                )
              }
            >
              Light from:{" "}
              {incidentMedium === "air"
                ? "AIR ↓"
                : `${medium.toUpperCase()} ↑`}
            </button>
          </div>
        )}

        {/* Lens controls */}
        {experiment === "lens" && (
          <>
            <div className="panel-section">
              <div className="panel-label">
                Lens
              </div>

              <button
                type="button"
                className={
                  lensType === "convex" ? "active" : ""
                }
                onClick={() => setLensType("convex")}
              >
                Convex
              </button>

              <button
                type="button"
                className={
                  lensType === "concave" ? "active" : ""
                }
                onClick={() => setLensType("concave")}
              >
                Concave
              </button>

              <button
                type="button"
                onClick={() =>
                  setSourceY((v) => -v)
                }
              >
                Object:{" "}
                {sourceY === -1 ? "Up" : "Down"}
              </button>
            </div>

            <div className="panel-section">
              <div className="panel-label">
                Object position
              </div>

              {[
                ["beyond2f", "Beyond 2F"],
                ["at2f", "At 2F"],
                ["between", "Between F & 2F"],
                ["atf", "At F"],
                ["near", "Nearer than F"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={
                    objectCase === key ? "active" : ""
                  }
                  onClick={() => setObjectCase(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Back navigation */}
        <div className="panel-section panel-back">
          <button
            type="button"
            onClick={() => navigate("/")}
          >
            ⬅ Back to Console
          </button>
        </div>
      </aside>

      {/* RIGHT: EXPERIMENT CANVAS */}
      <main className="canvas-column">
        <div
          className="canvas-wrap"
          ref={canvasWrapRef}
        >
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            style={{
              display: isCanvasExperiment
                ? "block"
                : "none",
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`,
              maxWidth: "100%",
            }}
          />

          {experiment === "prism" && (
            <PrismExperiment
              lightOn={lightOn}
              setLightOn={setLightOn}
            />
          )}

          {experiment === "Polarization" && (
            <PolarisationExperiment
              lightOn={lightOn}
              setLightOn={setLightOn}
            />
          )}

          {experiment === "RGB" && (
            <RGBMixingExperiment
              lightOn={lightOn}
              setLightOn={setLightOn}
            />
          )}
        </div>

        {/* ENERGY PANEL */}
        <div className="energy-panel">
          <button
            type="button"
            className={`light-btn ${
              lightOn ? "on" : "off"
            }`}
            onClick={() =>
              setLightOn((v) => !v)
            }
          >
            {lightOn
              ? "⏻ Turn Light Off"
              : "⏻ Turn Light On"}
          </button>

          {experiment === "refraction" && (
            <div className="slider-block">
              <div className="energy-label">
                INCIDENT ANGLE
              </div>

              <div className="energy-value">
                {angle.toFixed(1)}°
              </div>

              <div className="slider-wrap">
                <div
                  className="slider-tooltip"
                  style={{
                    left: `${((angle - 5) / 70) * 100}%`,
                  }}
                >
                  {angle.toFixed(1)}°
                </div>

                <input
                  className="energy-slider"
                  type="range"
                  min="5"
                  max="75"
                  step="0.1"
                  value={angle}
                  aria-label="Incident angle"
                  onChange={(e) =>
                    setAngle(
                      Math.round(
                        Math.abs(+e.target.value) * 10
                      ) / 10
                    )
                  }
                />
              </div>
            </div>
          )}

          {experiment === "prism" && (
            <div className="energy-label">
              Newton's Double-Prism: Dispersion &amp;
              Perfect Recombination
            </div>
          )}

          {experiment === "lens" && (
            <div className="energy-label">
              Convex / Concave Lens Image Formation
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 