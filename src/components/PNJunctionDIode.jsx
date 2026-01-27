import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const WIDTH = 1200;
const HEIGHT = 500;

export default function PNJunctionDiffusion() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  /* Controls */
  const [current, setCurrent] = useState(1.0);
  const [bias, setBias] = useState("forward"); // forward | reverse

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const MID = WIDTH / 2;

    /* =========================
       Particle Class
    ========================= */
    class Particle {
      constructor(x, y, vx, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.color = color;
      }
      move() {
        this.x += this.vx;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    /* =========================
       Create carriers
    ========================= */
    const electrons = [];
    const holes = [];

    const carrierSpeed =
      bias === "forward" ? 1.2 * current : 0.4 * current;

    for (let i = 0; i < 40; i++) {
      electrons.push(
        new Particle(
          Math.random() * (MID - 80),
          Math.random() * HEIGHT,
          carrierSpeed,
          "#3b82f6"
        )
      );
    }

    for (let i = 0; i < 40; i++) {
      holes.push(
        new Particle(
          MID + 80 + Math.random() * (MID - 80),
          Math.random() * HEIGHT,
          -carrierSpeed,
          "#ef4444"
        )
      );
    }

    /* =========================
       Fixed ions
    ========================= */
    const ions = [];

    for (let i = 0; i < 50; i++) {
      ions.push({
        x: Math.random() * (MID - 60),
        y: Math.random() * HEIGHT,
        charge: "+"
      });
    }

    for (let i = 0; i < 50; i++) {
      ions.push({
        x: MID + 60 + Math.random() * (MID - 60),
        y: Math.random() * HEIGHT,
        charge: "-"
      });
    }

    /* =========================
       Depletion Region
    ========================= */
    let depletionWidth =
      bias === "forward" ? 120 : 40;

    const MAX_DEPLETION = 220;
    const MIN_DEPLETION = 40;

    function drawRegions() {
      ctx.fillStyle = "rgba(59,130,246,0.08)";
      ctx.fillRect(0, 0, MID - depletionWidth, HEIGHT);

      ctx.fillStyle = "rgba(239,68,68,0.08)";
      ctx.fillRect(MID + depletionWidth, 0, MID - depletionWidth, HEIGHT);

      ctx.fillStyle = "rgba(250,204,21,0.18)";
      ctx.fillRect(
        MID - depletionWidth,
        0,
        depletionWidth * 2,
        HEIGHT
      );
    }

    function drawIons() {
      ctx.font = "14px Arial";
      ctx.textAlign = "center";

      ions.forEach(ion => {
        ctx.fillStyle = ion.charge === "+" ? "#22c55e" : "#facc15";
        ctx.fillText(ion.charge, ion.x, ion.y);
      });
    }

  function updateParticles() {
  electrons.forEach(e => {
    e.move();

    // If electron crosses to P side, re-inject on N side
    if (e.x > MID + depletionWidth + 10) {
      e.x = Math.random() * (MID - depletionWidth - 20);
      e.y = Math.random() * HEIGHT;
    }
  });

  holes.forEach(h => {
    h.move();

    // If hole crosses to N side, re-inject on P side
    if (h.x < MID - depletionWidth - 10) {
      h.x = MID + depletionWidth + Math.random() * (MID - depletionWidth - 20);
      h.y = Math.random() * HEIGHT;
    }
  });

  /* Depletion behavior */
  if (bias === "forward" && depletionWidth > MIN_DEPLETION) {
    depletionWidth -= 0.08 * current;
  }

  if (bias === "reverse" && depletionWidth < MAX_DEPLETION) {
    depletionWidth += 0.08 * current;
  }
}


    function drawParticles() {
      electrons.forEach(e => e.draw());
      holes.forEach(h => h.draw());
    }

    function drawLabels() {
      ctx.fillStyle = "white";
      ctx.font = "18px Arial";
      ctx.fillText("N-Type", 80, 30);
      ctx.fillText("P-Type", WIDTH - 140, 30);

      ctx.fillStyle = "#facc15";
      ctx.fillText("Depletion Region", MID - 90, 60);

      ctx.font = "14px Arial";
      ctx.fillStyle = "#aaa";
      ctx.fillText(
        `Bias: ${bias.toUpperCase()} | Current: ${current.toFixed(2)}×`,
        20,
        HEIGHT - 20
      );
    }

    function animate() {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      drawRegions();
      drawIons();
      updateParticles();
      drawParticles();
      drawLabels();

      requestAnimationFrame(animate);
    }

    animate();
  }, [current, bias]);
  useEffect(()=>{
    const handleKeyDown = (e) => {
    setCurrent((prev) => {
      let next = prev;

      if (e.key === "a" || e.key === "A") {
        next = prev - 0.01;
      }
      if (e.key === "d" || e.key === "D") {
        next = prev + 0.01;
      }

      // Clamp voltage
      if (next > 1) next = 1;
      if (next < -1) next = -1;

      return parseFloat(next.toFixed(2));
    });
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);

 

  return (
    <div style={{ background: "#020617", padding: "16px" }}>
      {/* 🔙 Return */}
      <button
        style={{ marginBottom: 10 }}
        onClick={() => navigate("/semiconductor")}
      >
        ⬅ Return to Semiconductor Lab
      </button>

      {/* 🔁 Bias Toggle */}
      <button
        style={{
          marginLeft: 10,
          marginBottom: 10,
          background: bias === "forward" ? "#22c55e" : "#ef4444",
          color: "#000",
          fontWeight: "bold"
        }}
        onClick={() =>
          setBias(bias === "forward" ? "reverse" : "forward")
        }
      >
        {bias === "forward" ? "FORWARD BIAS" : "REVERSE BIAS"}
      </button>

      {/* 🎚 Current Slider */}
      <div style={{ margin: "12px 0" }}>
        <label style={{ color: "#fff", fontSize: 14 }}>
          Current Excitation: {current.toFixed(2)}×
        </label>
        <input
          type="range"
          min="0.2"
          max="1"
          step="0.01"
          value={current}
          onChange={e => setCurrent(+e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{
          border: "2px solid #38bdf8",
          display: "block",
          margin: "auto"
        }}
      />
    </div>
  );
}
