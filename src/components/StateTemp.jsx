import React, { useRef, useEffect, useState } from "react";

/* ================= CONSTANTS ================= */
const W = 420;
const H = 300;

const NUM_X = 14;
const NUM_Y = 10;
const SPACING = 26;

/* ================= COMPONENT ================= */
export default function HeatingWithParticles() {
  const pCanvas = useRef(null);
  const cCanvas = useRef(null);

  const particles = useRef([]);
  const tempRef = useRef(20);

  const [heat, setHeat] = useState(0);

  /* =========================================================
     1️⃣ INITIALIZE LATTICE
     ========================================================= */
  useEffect(() => {
    const arr = [];

    for (let j = 0; j < NUM_Y; j++) {
      for (let i = 0; i < NUM_X; i++) {
        const x = 40 + i * SPACING;
        const y = 40 + j * SPACING;

        arr.push({
          x,
          y,
          x0: x,
          y0: y,
          vx: 0,
          vy: 0,
          angle: Math.random() * Math.PI * 2,
          neighbors: []
        });
      }
    }

    // assign neighbors (right + bottom)
    arr.forEach((p, idx) => {
      const i = idx % NUM_X;
      const j = Math.floor(idx / NUM_X);

      if (i < NUM_X - 1) p.neighbors.push(arr[idx + 1]);
      if (j < NUM_Y - 1) p.neighbors.push(arr[idx + NUM_X]);
    });

    particles.current = arr;
  }, []);

  /* =========================================================
     2️⃣ TEMP REF
     ========================================================= */
  useEffect(() => {
    tempRef.current = heat;
  }, [heat]);

  /* =========================================================
     3️⃣ PARTICLE ANIMATION
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

      const kSolid = 0.08;
      const kLiquid = 0.015;
      const damping = 0.92;

      /* ===== DRAW BONDS ===== */
      if (phase !== "gas") {
        ctx.strokeStyle =
          phase === "solid"
            ? "rgba(0,255,255,0.35)"
            : "rgba(255,200,0,0.25)";

        particles.current.forEach(p => {
          p.neighbors.forEach(n => {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          });
        });
      }

      /* ===== PARTICLE PHYSICS ===== */
      particles.current.forEach(p => {
        let k = 0;

        if (phase === "solid") k = kSolid;
        else if (phase === "liquid") k = kLiquid;

        // SPRING FORCES
        if (k > 0) {
          p.neighbors.forEach(n => {
            const dx = n.x - p.x;
            const dy = n.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            const force = (dist - SPACING) * k;
            p.vx += (force * dx) / dist;
            p.vy += (force * dy) / dist;
          });
        }

        // THERMAL MOTION
        const noise =
          phase === "solid" ? 0.05 : phase === "liquid" ? 0.3 : 0;

        p.vx += (Math.random() - 0.5) * noise;
        p.vy += (Math.random() - 0.5) * noise;

        // GAS PHASE
        if (phase === "gas") {
          const speed = 2.2 + Math.min((T - 100) / 40, 1) * 1.5;
          p.x += Math.cos(p.angle) * speed;
          p.y += Math.sin(p.angle) * speed;

          if (p.x < r || p.x > W - r) p.angle = Math.PI - p.angle;
          if (p.y < r || p.y > H - r) p.angle = -p.angle;
        } else {
          // SOLID / LIQUID
          p.vx *= damping;
          p.vy *= damping;
          p.x += p.vx;
          p.y += p.vy;
        }

        // DRAW PARTICLE
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = "#00eaff";
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  /* =========================================================
     4️⃣ HEATING CURVE
     ========================================================= */
  function mapTemp(T) {
    const minT = -20;
    const maxT = 140;
    return H - 40 - ((T - minT) / (maxT - minT)) * (H - 80);
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
      { t1: -20, t2: 0 },
      { t1: 0, t2: 0 },
      { t1: 0, t2: 100 },
      { t1: 100, t2: 100 },
      { t1: 100, t2: 140 }
    ];

    segments.forEach(seg => {
      for (let i = 0; i < 20; i++) {
        const temp = seg.t1 + (seg.t2 - seg.t1) * (i / 20);
        points.push({ x, y: mapTemp(temp), temp });
        x += 3;
      }
    });

    return points;
  }

  useEffect(() => {
    const ctx = cCanvas.current.getContext("2d");
    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = "#aaa";
    ctx.beginPath();
    ctx.moveTo(50, 20);
    ctx.lineTo(50, H - 40);
    ctx.lineTo(W - 20, H - 40);
    ctx.stroke();

    const points = getCurvePoints();

    const idx = Math.min(
      Math.floor(((heat + 20) / 160) * points.length),
      points.length - 1
    );

    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i <= idx; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();

    const p = points[idx];
    ctx.fillStyle = "#ff3333";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.fillText(getPhaseLabel(heat), p.x - 20, p.y - 10);
  }, [heat]);

  /* =========================================================
     5️⃣ CONTROLS
     ========================================================= */
  useEffect(() => {
    function onKey(e) {
      if (e.key === "a" || e.key === "A") setHeat(v => Math.max(-20, v - 1));
      if (e.key === "d" || e.key === "D") setHeat(v => Math.min(140, v + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* =========================================================
     UI
     ========================================================= */
  return (
    <div style={{ display: "flex", gap: 20, color: "#fff" }}>
      <div>
        <h3>Particle Lattice</h3>
        <canvas
          ref={pCanvas}
          width={W}
          height={H}
          style={{
            background: "#020a18",
            border: "1px solid #0ff",
            borderRadius: 8
          }}
        />
      </div>

      <div style={{ alignSelf: "center", textAlign: "center" }}>
        <div style={{ fontSize: 18 }}>🌡 {heat} °C</div>
        <input
          type="range"
          min="-20"
          max="140"
          value={heat}
          onChange={e => setHeat(+e.target.value)}
        />
        <div style={{ marginTop: 10 }}>
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
          width={W}
          height={H}
          style={{
            background: "#020a18",
            border: "1px solid #ff0",
            borderRadius: 8
          }}
        />
      </div>
    </div>
  );
}
