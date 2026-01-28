import React, { useRef, useEffect, useState } from "react";

const W = 900;
const H = 600;
const ATOMS = 30;

export default function GasLawExperiment() {
  const canvasRef = useRef(null);
  const atomsRef = useRef([]);

  const tempRef = useRef(0.3);      // gas temperature
  const loadRef = useRef(0.3);      // piston load
  const pistonY = useRef(140);
  const burnerTRef = useRef(0);     // 🔥 independent burner time

  const [temperature, setTemperature] = useState(0.3);
  const [activeSlider,setActiveSlider]=useState(0);
  const [load, setLoad] = useState(0.3);

  const BOTTOM = H - 80;
  const LEFT = W / 2 - 150;
  const RIGHT = W / 2 + 150;

  /* ================= INIT ATOMS ================= */
  useEffect(() => {
    atomsRef.current = Array.from({ length: ATOMS }, () => ({
      x: W / 2 + Math.random() * 200 - 100,
      y: 320 + Math.random() * 80,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      r: 6
    }));
  }, []);

  /* ================= LOOP ================= */
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    let raf;

    function drawBurner() {
  // burner base
  ctx.fillStyle = "#444";
  ctx.fillRect(W / 2 - 60, H - 60, 120, 20);

  // FAST + JITTERY FLAMES
  for (let i = 0; i < 6; i++) {
    // fast time
    const t = burnerTRef.current * 0.35 + i * 10;

    // chaotic motion
    const jitter =
      Math.sin(t * 1.7) * 6 +
      Math.sin(t * 3.9) * 4 +
      (Math.random() - 0.5) * 6;

    const size =
      6 +
      Math.sin(t * 2.5) * 2 +
      Math.random() * 1.5;

    ctx.beginPath();
    ctx.arc(
      W / 2 - 50 + i * 20,
      H - 78 - jitter,
      size,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = i % 2 === 0 ? "#ff9f1a" : "#ffd000";
    ctx.fill();
  }
}


    function drawPiston() {
      ctx.fillStyle = "#999";
      ctx.fillRect(W / 2 - 150, pistonY.current - 16, 300, 16);

      ctx.fillStyle = "#777";
      ctx.fillRect(W / 2 - 60, pistonY.current - 56, 120, 40);
    }

    function drawContainer() {
      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = 4;
      ctx.strokeRect(
        LEFT,
        pistonY.current,
        RIGHT - LEFT,
        BOTTOM - pistonY.current
      );
    }

    function updatePiston() {
      const gasPressure = 0.5 + tempRef.current * 1.8;
      const loadPressure = 0.5 + loadRef.current * 2;

      const targetVolume = 260 * (loadPressure / gasPressure);
      const targetY = BOTTOM - targetVolume;

      pistonY.current += (targetY - pistonY.current) * 0.05;
      pistonY.current = Math.max(80, Math.min(BOTTOM - 60, pistonY.current));
    }

    function updateAtoms() {
      const speed = 1 + tempRef.current * 4;
      const top = pistonY.current;

      atomsRef.current.forEach(a => {
        a.x += a.vx * speed;
        a.y += a.vy * speed;

        if (a.x - a.r < LEFT) {
          a.x = LEFT + a.r;
          a.vx *= -1;
        }
        if (a.x + a.r > RIGHT) {
          a.x = RIGHT - a.r;
          a.vx *= -1;
        }
        if (a.y - a.r < top) {
          a.y = top + a.r;
          a.vy *= -1;
        }
        if (a.y + a.r > BOTTOM) {
          a.y = BOTTOM - a.r;
          a.vy *= -1;
        }
      });
    }

    function drawAtoms() {
      ctx.fillStyle = "#00eaff";
      atomsRef.current.forEach(a => {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawValues() {
      const volume = BOTTOM - pistonY.current;
      const pressure = (0.5 + loadRef.current * 2);

      ctx.fillStyle = "#fff";
      ctx.font = "15px monospace";
      ctx.fillText(`Pressure: ${pressure.toFixed(2)}`, 20, 30);
      ctx.fillText(`Volume: ${volume.toFixed(0)}`, 20, 55);
      ctx.fillText(`P × V ≈ ${(pressure * volume).toFixed(1)}`, 20, 80);
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);

      updatePiston();
      drawBurner();
      drawPiston();
      drawContainer();
      updateAtoms();
      drawAtoms();
      drawValues();

      burnerTRef.current += 1; // 🔥 independent motion
      raf = requestAnimationFrame(loop);
    }

    loop();
    return () => cancelAnimationFrame(raf);
  }, [BOTTOM,LEFT,RIGHT]);
  useEffect(() => {
  function onKey(e) {
    // ========= SWITCH ACTIVE SLIDER =========
    if (e.key === "q" || e.key === "Q") {
      setActiveSlider(s => (s + 1) % 2);
    }

    if (e.key === "e" || e.key === "E") {
      setActiveSlider(s => (s + 1) % 2);
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
    if (activeSlider === 0) {
      // Temperature (0.1 → 1)
      setTemperature(v => {
        const nv = Math.min(1, Math.max(0.1, v + dir * 0.01));
        tempRef.current = nv;
        return nv;
      });
    } else {
      // Load (0.1 → 1)
      setLoad(v => {
        const nv = Math.min(1, Math.max(0.1, v + dir * 0.01));
        loadRef.current = nv;
        return nv;
      });
    }
  }

  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [activeSlider]);


  /* ================= UI ================= */
 return (
  <div style={{ textAlign: "center", color: "#fff" }}>
    <canvas ref={canvasRef} width={W} height={H} />

    {/* ================= CONTROL PANEL ================= */}
    <div
      style={{
        width: 460,
        margin: "18px auto",
        background: "#0b0b0b",
        padding: 20,
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        gap: 28
      }}
    >
      {/* ================= TEMPERATURE ================= */}
      <div className="slider-block">
        <button
          className={`slider-btn ${activeSlider === 0 ? "active" : ""}`}
          onClick={() => setActiveSlider(0)}
        >
          Piston Load
        </button>

        <div className="slider-wrap">
          {activeSlider === 0 && (
            <div
              className="slider-tooltip"
              style={{
                left: `${((temperature - 0.1) / (1 - 0.1)) * 100}%`
              }}
            >
              {temperature.toFixed(2)}
            </div>
          )}

          <input
            type="range"
            min="0.1"
            max="1"
            step="0.01"
            value={temperature}
            onChange={(e) => {
              const v = +e.target.value;
              setTemperature(v);
              tempRef.current = v;
            }}
          />
        </div>
      </div>

      {/* ================= LOAD ================= */}
      <div className="slider-block">
        <button
          className={`slider-btn ${activeSlider === 1 ? "active" : ""}`}
          onClick={() => setActiveSlider(1)}
        >
          Gas Tempareture
        </button>

        <div className="slider-wrap">
          {activeSlider === 1 && (
            <div
              className="slider-tooltip"
              style={{
                left: `${((load - 0.1) / (1 - 0.1)) * 100}%`
              }}
            >
              {load.toFixed(2)}
            </div>
          )}

          <input
            type="range"
            min="0.1"
            max="1"
            step="0.01"
            value={load}
            onChange={(e) => {
              const v = +e.target.value;
              setLoad(v);
              loadRef.current = v;
            }}
          />
        </div>
      </div>
    </div>
  </div>
);

}
