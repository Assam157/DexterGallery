import React, { useRef, useEffect, useState } from "react";

export default function StaticElectricityLab() {
  const canvasRef = useRef(null);

  const [rubbing, setRubbing] = useState(false);
  const [active, setActive] = useState("rubbing");

  /* ================= KEYBOARD CONTROL ================= */
  useEffect(() => {
    const onKey = (e) => {
      if (active !== "rubbing") return;

      if (e.key === "d") setRubbing(true);
      if (e.key === "a") setRubbing(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, [active]);

  /* ================= CANVAS LOGIC ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const BALLOON = { x: 700, y: 260 };
    let handPhase = 0;

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: 0,
      vy: 0
    }));

    function drawHand() {
      const offset = Math.sin(handPhase) * 20;
      ctx.fillStyle = "#f5cbaa";
      ctx.fillRect(520 + offset, 230, 100, 60);
      ctx.fillRect(600 + offset, 250, 40, 15);
      ctx.fillStyle = "#fff";
      ctx.fillText("Hand", 560 + offset, 220);
    }

    function drawBalloon() {
      ctx.beginPath();
      ctx.ellipse(BALLOON.x, BALLOON.y, 60, 80, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#60a5fa";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText("Balloon", BALLOON.x - 25, BALLOON.y + 110);
    }

    function updateParticles() {
      particles.forEach(p => {
        if (rubbing) {
          const dx = BALLOON.x - p.x;
          const dy = BALLOON.y - p.y;
          p.vx += dx * 0.0005;
          p.vy += dy * 0.0005;
        } else {
          p.vx += (Math.random() - 0.5) * 0.05;
          p.vy += (Math.random() - 0.5) * 0.05;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#facc15";
        ctx.fill();
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (rubbing) handPhase += 0.1;

      drawHand();
      drawBalloon();
      updateParticles();

      ctx.fillStyle = "#fff";
      ctx.fillText(
        rubbing
          ? "Rubbing → Electrons accumulate on balloon"
          : "No rubbing → Charges spread out",
        20,
        40
      );

      requestAnimationFrame(draw);
    }

    draw();
  }, [rubbing]);

  return (
    <div style={{ color: "#fff" }}>
      <h2>⚡ Static Electricity: Rubbing Balloon</h2>

      {/* Primary control selector (future-proof) */}
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() => setActive("rubbing")}
          style={{
            background: active === "rubbing" ? "#00aaff" : "#222",
            color: "#fff"
          }}
        >
          Rubbing Control
        </button>
      </div>

      <p>
        Active control: <b>{active.toUpperCase()}</b> —  
        Press <b>D</b> to rub, <b>A</b> to release
      </p>

      {/* Mouse control still works */}
      <button
        onMouseDown={() => setRubbing(true)}
        onMouseUp={() => setRubbing(false)}
      >
        Rub Balloon (Mouse)
      </button>

      <canvas
        ref={canvasRef}
        width={1200}
        height={600}
        style={{ border: "1px solid #555", marginTop: 10 }}
      />
    </div>
  );
}
