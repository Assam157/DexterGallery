import React, { useRef, useEffect, useState } from "react";
 
const g = 9.81;

export default function PendulumEnergyLab() {
  const pendulumRef = useRef(null);
  const graphRef = useRef(null);
  const animationRef = useRef(null);

  const [length, setLength] = useState(180);   // controls string length
  const [mass, setMass] = useState(1);         // controls energy magnitude
  const [angle0, setAngle0] = useState(30);    // controls initial swing
  const [running, setRunning] = useState(true);
  const [activeSlider,setActiveSlider]=useState(0);
  const startTime = useRef(null);
  const energyData = useRef([]);

  useEffect(() => {
    const pctx = pendulumRef.current.getContext("2d");
    const gctx = graphRef.current.getContext("2d");

    const PW = pendulumRef.current.width;
    const PH = pendulumRef.current.height;

    function animate(time) {
      if (!running) return;

      if (!startTime.current) startTime.current = time;
      const t = (time - startTime.current) / 1000;

      const omega = Math.sqrt(g / (length / 100));
      const theta0 = (angle0 * Math.PI) / 180;
      const theta = theta0 * Math.cos(omega * t);

      /* ===== ENERGIES ===== */
      const h = (length / 100) * (1 - Math.cos(theta));
      const PE = mass * g * h;
      const TE = mass * g * (length / 100) * (1 - Math.cos(theta0));
      const KE = Math.max(0, TE - PE);

      energyData.current.push({ KE, PE });
      if (energyData.current.length > 260) energyData.current.shift();

      /* ===== PENDULUM ===== */
      pctx.clearRect(0, 0, PW, PH);

      const ox = PW / 2;
      const oy = 30;
      const x = ox + length * Math.sin(theta);
      const y = oy + length * Math.cos(theta);

      // 🔵 Pendulum string (blue, attached to bob)
      pctx.strokeStyle = "#00aaff";
      pctx.lineWidth = 2;
      pctx.beginPath();
      pctx.moveTo(ox, oy);
      pctx.lineTo(x, y);
      pctx.stroke();

      // Bob
      pctx.fillStyle = "#ff5555";
      pctx.beginPath();
      pctx.arc(x, y, 12, 0, Math.PI * 2);
      pctx.fill();

      // Pivot
      pctx.fillStyle = "#ffffff";
      pctx.beginPath();
      pctx.arc(ox, oy, 4, 0, Math.PI * 2);
      pctx.fill();

      /* ===== ENERGY GRAPH ===== */
      gctx.clearRect(0, 0, 320, 200);

      gctx.strokeStyle = "#aaa";
      gctx.beginPath();
      gctx.moveTo(40, 10);
      gctx.lineTo(40, 190);
      gctx.lineTo(300, 190);
      gctx.stroke();

      function plot(color, key) {
        gctx.strokeStyle = color;
        gctx.beginPath();
        energyData.current.forEach((p, i) => {
          const gx = 40 + i;
          const gy = 190 - p[key] * 12;
          i === 0 ? gctx.moveTo(gx, gy) : gctx.lineTo(gx, gy);
        });
        gctx.stroke();
      }

      plot("#00ff00", "KE");
      plot("#00aaff", "PE");

      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [length, mass, angle0, running]);
  useEffect(() => {
  function onKey(e) {
    // ========= SWITCH SLIDER =========
    if (e.key === "q" || e.key === "Q") {
      setActiveSlider(s => (s + 2) % 3);
    }

    if (e.key === "e" || e.key === "E") {
      setActiveSlider(s => (s + 1) % 3);
    }

    // ========= ADJUST VALUE =========
    if (e.key === "a" || e.key === "A") {
      adjust(-1);
    }

    if (e.key === "d" || e.key === "D") {
      adjust(+1);
    }
  }

  function adjust(dir) {
    switch (activeSlider) {
      case 0: // Length (100 → 250)
        setLength(v =>
          Math.min(250, Math.max(100, v + dir * 5))
        );
        break;

      case 1: // Mass (1 → 5)
        setMass(v =>
          Math.min(5, Math.max(1, v + dir))
        );
        break;

      case 2: // Initial Angle (10 → 60)
        setAngle0(v =>
          Math.min(60, Math.max(10, v + dir))
        );
        break;

      default:
        break;
    }
  }

  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [activeSlider]);


 return (
  <div style={{ display: "flex", gap: 24, color: "#fff" }}>
    {/* ================= PENDULUM VIEW ================= */}
    <canvas ref={pendulumRef} width={300} height={300} />

    {/* ================= RIGHT PANEL ================= */}
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <canvas ref={graphRef} width={320} height={200} />

      <p style={{ color: "#00ff00" }}>Kinetic Energy (KE)</p>
      <p style={{ color: "#00aaff" }}>Potential Energy (PE)</p>

      {/* ================= LENGTH ================= */}
      <div className="slider-block">
        <button
          className={`slider-btn ${activeSlider === 0 ? "active" : ""}`}
          onClick={() => setActiveSlider(0)}
        >
          Pendulum Length
        </button>

        <div className="slider-wrap">
          {activeSlider === 0 && (
            <div
              className="slider-tooltip"
              style={{
                left: `${((length - 100) / (250 - 100)) * 100}%`
              }}
            >
              {length}px
            </div>
          )}

          <input
            type="range"
            min="100"
            max="250"
            value={length}
            onChange={(e) => setLength(+e.target.value)}
          />
        </div>
      </div>

      {/* ================= MASS ================= */}
      <div className="slider-block">
        <button
          className={`slider-btn ${activeSlider === 1 ? "active" : ""}`}
          onClick={() => setActiveSlider(1)}
        >
          Mass of Bob
        </button>

        <div className="slider-wrap">
          {activeSlider === 1 && (
            <div
              className="slider-tooltip"
              style={{
                left: `${((mass - 1) / (5 - 1)) * 100}%`
              }}
            >
              {mass} kg
            </div>
          )}

          <input
            type="range"
            min="1"
            max="5"
            value={mass}
            onChange={(e) => setMass(+e.target.value)}
          />
        </div>
      </div>

      {/* ================= ANGLE ================= */}
      <div className="slider-block">
        <button
          className={`slider-btn ${activeSlider === 2 ? "active" : ""}`}
          onClick={() => setActiveSlider(2)}
        >
          Initial Angle
        </button>

        <div className="slider-wrap">
          {activeSlider === 2 && (
            <div
              className="slider-tooltip"
              style={{
                left: `${((angle0 - 10) / (60 - 10)) * 100}%`
              }}
            >
              {angle0}°
            </div>
          )}

          <input
            type="range"
            min="10"
            max="60"
            value={angle0}
            onChange={(e) => setAngle0(+e.target.value)}
          />
        </div>
      </div>

      {/* ================= PLAY / PAUSE ================= */}
      <button
        onClick={() => {
          startTime.current = null;
          setRunning((r) => !r);
        }}
        style={{
          marginTop: 8,
          padding: "8px",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        {running ? "Pause" : "Resume"}
      </button>
    </div>
  </div>
);

}
