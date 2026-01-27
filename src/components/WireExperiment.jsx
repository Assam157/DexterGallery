import React, { useEffect, useRef, useState } from "react";
import "./EMLab.css";

const W = 1100;
const H = 820;

export default function WireExperiment() {
  const canvasRef = useRef(null);

  const [direction, setDirection] = useState("same");
  const [intensity, setIntensity] = useState(0.3);
  const [activeSlider,setActiveSlider]=useState(0);

  const BASE_LEFT = 280;
  const BASE_RIGHT = 420;

  /* ================= KEYBOARD ================= */
  useEffect(() => {
    function onKey(e) {
      if (e.key === "a" || e.key === "A") {
        setIntensity(v => Math.max(0, +(v - 0.02).toFixed(2)));
      }
      if (e.key === "d" || e.key === "D") {
        setIntensity(v => Math.min(1, +(v + 0.02).toFixed(2)));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ================= CANVAS ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let t = 0;
    let raf;

    function clear() {
      ctx.clearRect(0, 0, W, H);
    }

    function drawElasticWire(x0, bend) {
      const top = 80;
      const bottom = H - 80;
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#999";
      ctx.beginPath();

      for (let i = 0; i <= 60; i++) {
        const s = i / 60;
        const y = top + s * (bottom - top);
        const x = x0 + bend * Math.sin(Math.PI * s);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function drawCoil(cx, cy) {
      for (let i = 0; i < 9; i++) {
        ctx.strokeStyle = "#bbb";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 40 + i * 4, 22 + i * 2, 0, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();

        ctx.strokeStyle = "#333";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 40 + i * 4, 22 + i * 2, 0, Math.PI / 2, 1.5 * Math.PI);
        ctx.stroke();
      }
    }

    function drawArrows(cx, cy, clockwise) {
      const dir = clockwise ? -1 : 1;
      for (let k = 0; k < 3; k++) {
        const a = t * 0.03 * dir + k * Math.PI * 2;
        ctx.save();
        ctx.translate(cx + 50 * Math.cos(a), cy + 30 * Math.sin(a));
        ctx.rotate(a);
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-8, -14);
        ctx.lineTo(8, -14);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    function drawScene() {
      clear();

      const cy = H / 2;
      const F = intensity * 60;
      const inward = direction === "opposite";

      const bendL = inward ? +F : -F;
      const bendR = inward ? -F : +F;

      drawCoil(BASE_LEFT + bendL * 0.5, cy);
      drawCoil(BASE_RIGHT + bendR * 0.5, cy);

      drawArrows(BASE_LEFT + bendL * 0.5, cy, false);
      drawArrows(BASE_RIGHT + bendR * 0.5, cy, direction !== "same");

      drawElasticWire(BASE_LEFT, bendL);
      drawElasticWire(BASE_RIGHT, bendR);

      t++;
      raf = requestAnimationFrame(drawScene);
    }

    drawScene();
    return () => cancelAnimationFrame(raf);
  }, [direction, intensity]);
  useEffect(() => {
  function onKey(e) {


    // ================= ADJUST VALUE =================
    if (e.key === "a" || e.key === "A") {
      adjust(-0.1);
    }

    if (e.key === "d" || e.key === "D") {
      adjust(+0.1);
    }
  }

  function adjust(dir) {
    
  
  
 
      setIntensity(v =>
        Math.min(1, Math.max(0, v + dir * 0.2))
      );
 
  }

  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [activeSlider]);


  /* ================= UI ================= */
  return (
    <>
      {/* CANVAS */}
      <canvas ref={canvasRef} width={W} height={H} />

      {/* CONTROL PANEL */}
      <div className="cinema-energy" style={{ color: "#000" }}>
        <div className="label" style={{ color: "#000" }}>
          CURRENT INTENSITY
        </div>

        <div className="value" style={{ color: "#000", textShadow: "none" }}>
          {intensity.toFixed(2)}
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={intensity}
          onChange={e => setIntensity(+e.target.value)}
        />

        <div className="panel-hint" style={{ color: "#000" }}>
          Use A / D keys
        </div>

        <div
          className="panel-section"
          style={{ color: "#000", opacity: 1 }}
        >
          CURRENT DIRECTION
        </div>

        <button
          className={`panel-btn ${direction === "same" ? "active" : ""}`}
          style={{
            color: "#000",
            borderColor: "#000"
          }}
          onClick={() => setDirection("same")}
        >
          Same Direction
        </button>

        <button
          className={`panel-btn ${direction === "opposite" ? "active" : ""}`}
          style={{
            color: "#000",
            borderColor: "#000"
          }}
          onClick={() => setDirection("opposite")}
        >
          Opposite Direction
        </button>
      </div>
    </>
  );
}
