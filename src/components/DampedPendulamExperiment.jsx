 import React, { useRef, useEffect, useState } from "react";

const g = 9.81;

export default function DampedPendulumEnergyLab() {
  const pendulumRef = useRef(null);
  const graphRef = useRef(null);
  const animationRef = useRef(null);

  const [length, setLength] = useState(180);
  const [mass, setMass] = useState(1);
  const [angle0, setAngle0] = useState(30);
  const [damp, setDamp] = useState(0);
  const [running, setRunning] = useState(true);

  const [activeSlider, setActiveSlider] = useState("length");

  const startTime = useRef(null);
  const energyData = useRef([]);

  /* ================= KEYBOARD CONTROL ================= */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== "a" && e.key !== "d") return;

      const dir = e.key === "d" ? 1 : -1;

      if (activeSlider === "length") {
        setLength(v => Math.min(250, Math.max(100, v + dir * 5)));
      }
      if (activeSlider === "mass") {
        setMass(v => Math.min(5, Math.max(1, v + dir * 0.2)));
      }
      if (activeSlider === "angle") {
        setAngle0(v => Math.min(60, Math.max(10, v + dir * 2)));
      }
      if (activeSlider === "damp") {
        setDamp(v => Math.min(1, Math.max(0, +(v + dir * 0.02).toFixed(2))));
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeSlider]);

  /* ================= ANIMATION ================= */
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
      const theta = theta0 * Math.cos(omega * t) * Math.exp(-damp * t);

      const h = (length / 100) * (1 - Math.cos(theta));
      const PE = mass * g * h;
      const TE = mass * g * (length / 100) *
        (1 - Math.cos(theta0)) *
        Math.exp(-2 * damp * t);
      const KE = Math.max(0, TE - PE);

      const alpha = 0.15;
      const last = energyData.current.at(-1);
      const smoothKE = last ? last.KE + alpha * (KE - last.KE) : KE;
      const smoothPE = last ? last.PE + alpha * (PE - last.PE) : PE;

      energyData.current.push({ KE: smoothKE, PE: smoothPE });
      if (energyData.current.length > 260) energyData.current.shift();

      /* Pendulum */
      pctx.clearRect(0, 0, PW, PH);
      const ox = PW / 2, oy = 30;
      const x = ox + length * Math.sin(theta);
      const y = oy + length * Math.cos(theta);

      pctx.strokeStyle = "#00aaff";
      pctx.beginPath();
      pctx.moveTo(ox, oy);
      pctx.lineTo(x, y);
      pctx.stroke();

      pctx.fillStyle = "#ff5555";
      pctx.beginPath();
      pctx.arc(x, y, 12, 0, Math.PI * 2);
      pctx.fill();

      /* Graph */
      gctx.clearRect(0, 0, 320, 200);
      gctx.strokeStyle = "#aaa";
      gctx.beginPath();
      gctx.moveTo(40, 10);
      gctx.lineTo(40, 190);
      gctx.lineTo(300, 190);
      gctx.stroke();

      const plot = (color, key) => {
        gctx.strokeStyle = color;
        gctx.beginPath();
        energyData.current.forEach((p, i) => {
          const gx = 40 + i;
          const gy = 190 - p[key] * 12;
          i === 0 ? gctx.moveTo(gx, gy) : gctx.lineTo(gx, gy);
        });
        gctx.stroke();
      };

      plot("#00ff00", "KE");
      plot("#00aaff", "PE");

      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [length, mass, angle0, damp, running]);

  /* ================= UI ================= */
  const btn = (key, label) => (
    <button
      onClick={() => setActiveSlider(key)}
      style={{
        background: activeSlider === key ? "#00aaff" : "#222",
        color: "#fff",
        marginRight: 6
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: "flex", gap: 20 }}>
      <canvas ref={pendulumRef} width={300} height={300} />

      <div>
        <canvas ref={graphRef} width={320} height={200} />

        <div style={{ margin: "10px 0" }}>
          {btn("length", "Length")}
          {btn("mass", "Mass")}
          {btn("angle", "Angle")}
          {btn("damp", "Damping")}
        </div>

        <p>Active: <b>{activeSlider.toUpperCase()}</b> (A / D)</p>

        <input type="range" min="100" max="250" value={length}
          onChange={e => setLength(+e.target.value)} />
        <input type="range" min="1" max="5" step="0.1" value={mass}
          onChange={e => setMass(+e.target.value)} />
        <input type="range" min="10" max="60" value={angle0}
          onChange={e => setAngle0(+e.target.value)} />
        <input type="range" min="0" max="1" step="0.01" value={damp}
          onChange={e => setDamp(+e.target.value)} />

        <button onClick={() => {
          startTime.current = null;
          setRunning(r => !r);
        }}>
          {running ? "Pause" : "Resume"}
        </button>
      </div>
    </div>
  );
}
