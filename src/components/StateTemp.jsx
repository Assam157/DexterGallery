 import React, { useRef, useEffect, useState } from "react";

/* ================= CONSTANTS ================= */
const W = 420;
const H = 300;
const NUM_PARTICLES = 40;

/* ================= COMPONENT ================= */
export default function HeatingWithParticles() {
  const pCanvas = useRef(null);
  const particles = useRef([]);
  const tempRef = useRef(0);
  const cCanvas = useRef(null);


  const [heat, setHeat] = useState(20); // temperature in °C

  /* =========================================================
     1️⃣ INITIALIZE PARTICLES (ONCE ONLY)
     ========================================================= */
  useEffect(() => {
    particles.current = Array.from({ length: NUM_PARTICLES }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      x0: 0,
      y0: 0,
      angle: Math.random() * Math.PI * 2
    }));

    particles.current.forEach(p => {
      p.x0 = p.x;
      p.y0 = p.y;
    });
  }, []);

  /* =========================================================
     2️⃣ KEEP TEMPERATURE IN A REF (NO LOOP RESTART)
     ========================================================= */
  useEffect(() => {
    tempRef.current = heat;
  }, [heat]);

  /* =========================================================
     3️⃣ SINGLE ANIMATION LOOP (STABLE)
     ========================================================= */
  useEffect(() => {
    const ctx = pCanvas.current.getContext("2d");
    const r = 3;

    function getPhase(T) {
      if (T < 0) return "solid";
      if (T <= 100) return "liquid";
      return "gas";
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);

      const T = tempRef.current;
      const phase = getPhase(T);

      particles.current.forEach(p => {

        /* ================= SOLID ================= */
        if (phase === "solid") {
          const amp = 0.4;
          p.x = p.x0 + (Math.random() - 0.5) * amp;
          p.y = p.y0 + (Math.random() - 0.5) * amp;
        }

        /* ================= LIQUID ================= */
        else if (phase === "liquid") {
          const speed = 0.2 + (T / 100) * 0.8;
          p.angle += (Math.random() - 0.5) * 0.05;

          p.x += Math.cos(p.angle) * speed;
          p.y += Math.sin(p.angle) * speed;

          p.x = Math.max(r, Math.min(W - r, p.x));
          p.y = Math.max(r, Math.min(H - r, p.y));

          // update vibration center
          p.x0 = p.x;
          p.y0 = p.y;
        }

        /* ================= GAS ================= */
        else {
          const speed = 1.2 + Math.min((T - 100) / 40, 1) * 2.2;

          p.x += Math.cos(p.angle) * speed;
          p.y += Math.sin(p.angle) * speed;

          if (p.x < r || p.x > W - r) {
            p.angle = Math.PI - p.angle;
            p.x = Math.max(r, Math.min(W - r, p.x));
          }
          if (p.y < r || p.y > H - r) {
            p.angle = -p.angle;
            p.y = Math.max(r, Math.min(H - r, p.y));
          }
        }

        /* ================= DRAW ================= */
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = "#00eaff";
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }, []);
 function mapTemp(T) {
  const minT = -20;
  const maxT = 140;
  return (
    H - 40 -
    ((T - minT) / (maxT - minT)) * (H - 80)
  );
}

function getPhaseLabel(T) {
  if (T < 0) return "Solid";
  if (T <= 100) return "Liquid";
  return "Gas";
}

function getCurvePoints() {
  const points = [];
  let x = 50;

  const segments = [
    { t1: -20, t2: 0 },     // solid heating
    { t1: 0, t2: 0 },       // melting
    { t1: 0, t2: 100 },     // liquid heating
    { t1: 100, t2: 100 },   // boiling
    { t1: 100, t2: 140 }    // gas heating
  ];

  segments.forEach(seg => {
    for (let i = 0; i < 20; i++) {
      const temp =
        seg.t1 + (seg.t2 - seg.t1) * (i / 20);
      points.push({
        x,
        y: mapTemp(temp),
        temp
      });
      x += 3;
    }
  });

  return points;
}
useEffect(() => {
  const ctx = cCanvas.current.getContext("2d");
  ctx.clearRect(0, 0, W, H);

  /* ===== AXES ===== */
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 1;

  // Y axis
  ctx.beginPath();
  ctx.moveTo(50, 20);
  ctx.lineTo(50, H - 40);
  ctx.stroke();

  // X axis
  ctx.beginPath();
  ctx.moveTo(50, H - 40);
  ctx.lineTo(W - 20, H - 40);
  ctx.stroke();

  /* ===== AXIS LABELS ===== */
  ctx.fillStyle = "#fff";
  ctx.font = "13px monospace";
  ctx.fillText("Temperature (°C)", 5, 15);
  ctx.fillText("Heat supplied →", W - 150, H - 10);

  /* ===== Y TICKS ===== */
  const temps = [-20, 0, 50, 100, 140];
  temps.forEach(t => {
    const ty = mapTemp(t);
    ctx.fillText(t, 15, ty + 4);
    ctx.beginPath();
    ctx.moveTo(47, ty);
    ctx.lineTo(53, ty);
    ctx.stroke();
  });

  /* ===== DRAW HEATING CURVE ===== */
  const points = getCurvePoints();

  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  const idx = Math.min(
    Math.floor(((heat + 20) / 160) * points.length),
    points.length - 1
  );

  for (let i = 1; i <= idx; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();

  /* ===== MOVING DOT ===== */
  const p = points[idx];
  ctx.fillStyle = "#ff3333";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
  ctx.fill();

  /* ===== PHASE LABEL (TEXT ONLY) ===== */
  ctx.fillStyle = "#fff";
  ctx.font = "14px monospace";
  ctx.fillText(
    getPhaseLabel(heat),
    p.x - 25,
    p.y - 10
  );

}, [heat]);
useEffect(() => {
  function onKey(e) {
    // ========= SWITCH SLIDER (FUTURE SAFE) =========
   

    // ========= ADJUST VALUE =========
    if (e.key === "a" || e.key === "A") {
      adjust(-1);
    }

    if (e.key === "d" || e.key === "D") {
      adjust(+1);
    }
  }

  function adjust(dir) {
    // Temperature (−20 → 140)
    setHeat(v =>
      Math.min(140, Math.max(-20, v + dir))
    );
  }

  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, []);



  /* =========================================================
     4️⃣ UI
     ========================================================= */
  return (
    <div style={{ display: "flex", gap: 20, color: "#fff" }}>

      {/* ===== PARTICLE MOTION ===== */}
      <div>
        <h3>Particle Motion</h3>
        <canvas
          ref={pCanvas}
          width={W}
          height={H}
          style={{
            background: "#020a18",
            borderRadius: 8,
            border: "1px solid #0ff"
          }}
        />
      </div>

      {/* ===== CONTROLS ===== */}
      <div style={{ alignSelf: "center", textAlign: "center" }}>
        <div style={{ fontSize: 18, marginBottom: 10 }}>
          🌡 <b>{heat} °C</b>
        </div>
   <label style={{ color: "#000" }}>
    Set Tempareture
   </label>
        <input
          type="range"
          min="-20"
          max="140"
          value={heat}
          onChange={e => setHeat(+e.target.value)}
          style={{ width: 160, color:"#000" }}
        />
 
        <div style={{ marginTop: 12 }}>
          <button onClick={() => setHeat(-10)}>Solid</button>
          <br />
          <button onClick={() => setHeat(40)}>Liquid</button>
          <br />
          <button onClick={() => setHeat(120)}>Gas</button>
        </div>
      </div>
      <div>
  <h3>Heating Curve</h3>
  <canvas
    ref={cCanvas}
    width={420}
    height={300}
    style={{
      background: "#020a18",
      borderRadius: 8,
      border: "1px solid #ff0"
    }}
  />
</div>


    </div>
  );
}

