import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PolarisationExperiment from "./PolarizationExperiment";
import RGBMixingExperiment from "./RGBMixing";
import PrismExperiment from "./PrismExperiment";
import "./RadiationDexterLab.css";

const W = 700;
const H = 420;
const F = 90; // lens focal length

const REF_INDEX = {
  water: 1.33,
  glass: 1.5
};

export default function OpticalDexterLab() {
  const canvasRef = useRef(null);
  const tRef = useRef(0);
  const navigate = useNavigate();

  const [angle, setAngle] = useState(40);
  const [medium, setMedium] = useState("water");
  const [experiment, setExperiment] = useState("refraction");
  const [lightOn, setLightOn] = useState(false);

  const [lensType, setLensType] = useState("convex");
  const [sourceY, setSourceY] = useState(-1);
  const [incidentMedium, setIncidentMedium] = useState("air");
  const [objectCase, setObjectCase] = useState("beyond2f");

  // Mount guard to stop animation loop after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ---------- REFRACTION DRAWING ---------- */
  function drawRefraction() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const cx = 320;
    const cy = H / 2;
    const INCIDENT_LEN = 260;
    const REFRACT_LEN = 260;

    const n1 = incidentMedium === "air" ? 1.0 : REF_INDEX[incidentMedium];
    const n2 = incidentMedium === "air" ? REF_INDEX[medium] : 1.0;
    const goingDown = incidentMedium === "air";

    const i = (angle * Math.PI) / 180;
    const sinR = (n1 / n2) * Math.sin(i);
    let r = null;
    let isTIR = false;
    if (Math.abs(sinR) > 1) {
      isTIR = true;
    } else {
      r = Math.asin(sinR);
    }

    // Interface line
    ctx.strokeStyle = "#0ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(W, cy);
    ctx.stroke();

    // Normal
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "#aaa";
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Medium labels
    ctx.fillStyle = "#9ef";
    ctx.font = "14px monospace";
    ctx.fillText("AIR (n ≈ 1.0)", 20, cy - 20);
    ctx.fillText(`${medium.toUpperCase()} (n = ${REF_INDEX[medium]})`, 20, cy + 30);

    if (!lightOn) return;

    const anim = Math.min(tRef.current / 45, 1);
    const dx_i = Math.sin(i);
    const dy_i = goingDown ? Math.cos(i) : -Math.cos(i);

    // Incident ray (green)
    ctx.strokeStyle = "#0f0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - dx_i * INCIDENT_LEN * anim, cy - dy_i * INCIDENT_LEN * anim);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    if (anim >= 1) {
      ctx.strokeStyle = isTIR ? "#ff4444" : "#ff0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);

      if (!isTIR) {
        const dx_r = Math.sin(r);
        const dy_r = goingDown ? Math.cos(r) : -Math.cos(r);
        ctx.lineTo(cx + dx_r * REFRACT_LEN, cy + dy_r * REFRACT_LEN);
      } else {
        ctx.lineTo(cx + dx_i * REFRACT_LEN, cy - dy_i * REFRACT_LEN);
      }
      ctx.stroke();
    }

    // Angle labels
    ctx.font = "13px monospace";
    ctx.fillStyle = "#0f0";
    ctx.fillText(`i = ${angle}°`, cx - 140, cy - 40);
    if (!isTIR) {
      ctx.fillStyle = "#ff0";
      ctx.fillText(`r = ${(r * 180 / Math.PI).toFixed(1)}°`, cx + 30, cy + 40);
    } else {
      ctx.fillStyle = "#ff4444";
      ctx.fillText("TOTAL INTERNAL REFLECTION", cx + 20, cy + 40);
    }

    ctx.fillStyle = "#aaa";
    ctx.fillText(
      `${n1.toFixed(2)} sin(${angle}°) = ${n2.toFixed(2)} sin(r)`,
      40,
      H - 30
    );
  }

  /* ---------- LENS DRAWING ---------- */
  function drawLens() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const cx = W / 2;
    const cy = H / 2;
    const lensHalfWidth = 18;

    // Axis
    ctx.strokeStyle = "#444";
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(W, cy);
    ctx.stroke();

    // F & 2F points
    [-2, -1, 1, 2].forEach(m => {
      ctx.strokeStyle = "#aaa";
      ctx.beginPath();
      ctx.moveTo(cx + m * F, cy - 6);
      ctx.lineTo(cx + m * F, cy + 6);
      ctx.stroke();
      ctx.fillText(Math.abs(m) === 2 ? "2F" : "F", cx + m * F - 8, cy + 22);
    });

    // Lens body
    ctx.strokeStyle = "#7fdfff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (lensType === "convex") {
      ctx.moveTo(cx, 60);
      ctx.bezierCurveTo(cx - 60, cy, cx - 60, cy, cx, H - 60);
      ctx.bezierCurveTo(cx + 60, cy, cx + 60, cy, cx, 60);
    } else {
      ctx.moveTo(cx - 60, 60);
      ctx.bezierCurveTo(cx - lensHalfWidth, cy, cx - lensHalfWidth, cy, cx - 60, H - 60);
      ctx.lineTo(cx + 60, H - 60);
      ctx.bezierCurveTo(cx + lensHalfWidth, cy, cx + lensHalfWidth, cy, cx + 60, 60);
    }
    ctx.closePath();
    ctx.stroke();

    // Object position
    let u;
    switch (objectCase) {
      case "beyond2f": u = 3 * F; break;
      case "at2f":     u = 2 * F; break;
      case "between":  u = 1.5 * F; break;
      case "atf":      u = F; break;
      case "near":     u = 0.6 * F; break;
      default:         u = 3 * F;
    }

    const objX = cx - u;
    const objH = 80 * sourceY;

    // Object
    ctx.strokeStyle = "#ff3366";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(objX, cy);
    ctx.lineTo(objX, cy - objH);
    ctx.stroke();
    ctx.fillText("Object", objX - 30, cy - objH - 6);

    if (!lightOn) return;

    const A = { x: objX, y: cy - objH };
    const O = { x: cx, y: cy };
    const F1 = { x: cx - F, y: cy };
    const F2 = { x: cx + F, y: cy };

    // Ray 1: parallel
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    const r1_lens = { x: cx, y: A.y };
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(r1_lens.x, r1_lens.y);
    ctx.stroke();

    let r1_far;
    if (lensType === "convex") {
      r1_far = {
        x: r1_lens.x + (F2.x - r1_lens.x) * 10,
        y: r1_lens.y + (F2.y - r1_lens.y) * 10
      };
    } else {
      r1_far = {
        x: r1_lens.x + (r1_lens.x - F1.x) * 10,
        y: r1_lens.y + (r1_lens.y - F1.y) * 10
      };
    }
    ctx.beginPath();
    ctx.moveTo(r1_lens.x, r1_lens.y);
    ctx.lineTo(r1_far.x, r1_far.y);
    ctx.stroke();

    // Ray 2: through optical centre
    const r2_far = {
      x: A.x + (O.x - A.x) * 10,
      y: A.y + (O.y - A.y) * 10
    };
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(r2_far.x, r2_far.y);
    ctx.stroke();

    // Intersection helper
    function intersect(p1, p2, p3, p4) {
      const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
      if (Math.abs(d) < 1e-6) return null;
      const x = ((p1.x * p2.y - p1.y * p2.x) * (p3.x - p4.x) - (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x)) / d;
      const y = ((p1.x * p2.y - p1.y * p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x)) / d;
      return { x, y };
    }

    let imgPoint = null;

    if (lensType === "convex" && u > F) {
      imgPoint = intersect(r1_lens, r1_far, A, r2_far);
    }

    if (lensType === "convex" && u <= F) {
      ctx.setLineDash([6, 6]);
      const r1_back = F1;
      const r2_back = { x: cx - 300, y: cy - (A.y - cy) };
      ctx.beginPath();
      ctx.moveTo(r1_lens.x, r1_lens.y);
      ctx.lineTo(r1_back.x, r1_back.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(r2_back.x, r2_back.y);
      ctx.stroke();
      ctx.setLineDash([]);
      imgPoint = intersect(r1_lens, r1_back, A, r2_back);
    }

    if (lensType === "concave") {
      ctx.setLineDash([6, 6]);
      const r1_back = F1;
      ctx.beginPath();
      ctx.moveTo(r1_lens.x, r1_lens.y);
      ctx.lineTo(r1_back.x, r1_back.y);
      ctx.stroke();
      ctx.setLineDash([]);
      imgPoint = intersect(r1_lens, r1_back, A, r2_far);
    }

    // Block image if inside the lens
    if (imgPoint && imgPoint.x > cx - lensHalfWidth && imgPoint.x < cx + lensHalfWidth) {
      imgPoint = null;
    }

    if (imgPoint) {
      ctx.strokeStyle = lensType === "concave" ? "#ff4444" : "#8a2be2";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(imgPoint.x, imgPoint.y);
      ctx.lineTo(imgPoint.x, cy);
      ctx.stroke();
      ctx.fillStyle = lensType === "concave" ? "#ff4444" : "#8a2be2";
      ctx.fillText(lensType === "concave" ? "Virtual Image" : "Image", imgPoint.x - 30, imgPoint.y - 6);
    }
  }

  /* ---------- ANIMATION LOOP ---------- */
  useEffect(() => {
    function clear() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
    }

    function loop() {
      // Stop if unmounted or canvas ref is null
      if (!mountedRef.current || !canvasRef.current) return;

      clear();
      if (experiment === "refraction") drawRefraction();
      if (experiment === "lens") drawLens();

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#fff";
          ctx.font = "13px monospace";
          ctx.fillText(`Experiment: ${experiment}`, 20, 30);
        }
      }

      tRef.current += 2;
      requestAnimationFrame(loop);
    }

    const raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [experiment, angle, medium, lightOn, lensType, sourceY, objectCase, incidentMedium]);

  function changeIncidentMedium(newIncident) {
    setLightOn(false);
    setIncidentMedium(newIncident);
  }

  function changeMedium(newMedium) {
    setLightOn(false);
    setMedium(newMedium);
  }

  /* ---------- KEYBOARD CONTROLS ---------- */
  useEffect(() => {
    function onKey(e) {
      if (experiment === "Polarization" || experiment === "RGB" || experiment === "prism") return;

      if (experiment === "refraction") {
        if (e.key === "a" || e.key === "A") setAngle(v => Math.round(Math.max(5, v - 0.1) * 10) / 10);
        if (e.key === "d" || e.key === "D") setAngle(v => Math.round(Math.min(75, v + 0.1) * 10) / 10);
        return;
      }

      if (experiment === "lens") {
        if (e.key === "a" || e.key === "A" || e.key === "d" || e.key === "D") {
          setSourceY(v => (v === 1 ? -1 : 1));
        }
        return;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [experiment]);

  /* ---------- RENDER ---------- */
  return (
    <div className="dexter-root">
      <div className="control-panel">
        <h2>🔍 OPTICAL LAB</h2>

        <button className={experiment === "refraction" ? "active" : ""} onClick={() => setExperiment("refraction")}>
          REFRACTION Experiment
        </button>

        <button className={experiment === "Polarization" ? "active" : ""} onClick={() => setExperiment("Polarization")}>
          Polarization Experiment
        </button>

        <button className={experiment === "RGB" ? "active" : ""} onClick={() => setExperiment("RGB")}>
          RGB Mixing Experiment
        </button>

        <button className={experiment === "prism" ? "active" : ""} onClick={() => setExperiment("prism")}>
          VIBGYOR (PRISM)
        </button>

        <button className={experiment === "lens" ? "active" : ""} onClick={() => setExperiment("lens")}>
          LENS
        </button>

        {/* Refraction controls */}
        {experiment === "refraction" && (
          <>
            <button onClick={() => changeIncidentMedium(incidentMedium === "air" ? medium : "air")}>
              INCIDENT: {incidentMedium.toUpperCase()}
            </button>
            <button className={medium === "water" ? "active" : ""} onClick={() => setMedium("water")}>
              WATER
            </button>
            <button className={medium === "glass" ? "active" : ""} onClick={() => setMedium("glass")}>
              GLASS
            </button>
          </>
        )}

        {/* Lens controls */}
        {experiment === "lens" && (
          <>
            <button onClick={() => setLensType(lensType === "convex" ? "concave" : "convex")}>
              {lensType.toUpperCase()} LENS
            </button>
            <button onClick={() => setSourceY(sourceY * -1)}>
              OBJECT {sourceY === -1 ? "UP" : "DOWN"}
            </button>
            <hr style={{ width: "100%", opacity: 0.3 }} />
            <button onClick={() => setObjectCase("beyond2f")}>Beyond 2F</button>
            <button onClick={() => setObjectCase("at2f")}>At 2F</button>
            <button onClick={() => setObjectCase("between")}>Between F & 2F</button>
            <button onClick={() => setObjectCase("atf")}>At F</button>
            <button onClick={() => setObjectCase("near")}>Nearer than F</button>
          </>
        )}

        <button style={{ marginTop: 20 }} onClick={() => navigate("/")}>
          ⬅ BACK TO CONSOLE
        </button>
      </div>

      <div className="canvas-column">
        {/* Main canvas – only for refraction & lens */}
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{
            display: (experiment === "refraction" || experiment === "lens") ? "block" : "none"
          }}
        />

        {/* Prism experiment */}
        {experiment === "prism" && <PrismExperiment lightOn={lightOn} setLightOn={setLightOn} />}

        {/* Polarization experiment */}
        {experiment === "Polarization" && <PolarisationExperiment lightOn={lightOn} setLightOn={setLightOn} />}

        {/* RGB mixing experiment */}
        {experiment === "RGB" && <RGBMixingExperiment lightOn={lightOn} setLightOn={setLightOn} />}

        {/* Energy panel */}
        <div className="energy-panel">
          <button
            onClick={() => setLightOn(!lightOn)}
            style={{
              marginBottom: 12,
              background: lightOn ? "#ff4444" : "#44ff88",
              border: "none",
              padding: "8px",
              fontFamily: "monospace",
              cursor: "pointer"
            }}
          >
            {lightOn ? "TURN LIGHT OFF" : "TURN LIGHT ON"}
          </button>

          {experiment === "refraction" && (
            <>
              <div className="energy-label">INCIDENT ANGLE</div>
              <div className="energy-value">{angle}°</div>
              <div className="slider-wrap">
                <div className="slider-tooltip" style={{ left: `${(angle - 5) / (75 - 5) * 100}%` }}>
                  {angle}°
                </div>
                <input
                  className="energy-slider"
                  type="range"
                  min="5"
                  max="75"
                  step="0.1"
                  value={angle}
                  onChange={e => setAngle(Math.round(Math.abs(+e.target.value) * 10) / 10)}
                />
              </div>
            </>
          )}

          {experiment === "prism" && (
            <div className="energy-label">
              Newton’s Double‑Prism: Dispersion & Perfect Recombination
            </div>
          )}

          {experiment === "lens" && (
            <div className="energy-label">
              Convex / Concave Lens Image Formation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}