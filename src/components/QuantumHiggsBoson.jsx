 import React, { useRef, useEffect, useState } from "react";

export default function QuantumHiggsBoson({ energy, trigger }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Idle");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animationFrame;

    let proton1 = { x: 80, y: 200 };
    let proton2 = { x: 820, y: 200 };

    let higgs = null;
    let photons = [];
    let trails = [];
    let colliding = false;
    let shockRadius = 0;
    let collisionFlash = 0;

    const centerX = 450;
    const centerY = 200;

    /* =============================
       PROTON WITH TRAIL
       ============================= */
    function drawProton(p, color) {
      trails.push({ x: p.x, y: p.y, life: 20 });

      trails.forEach((t) => {
        ctx.globalAlpha = t.life / 20;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        t.life--;
      });

      trails = trails.filter((t) => t.life > 0);
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    /* =============================
       HIGGS FIELD PULSE
       ============================= */
    function drawHiggs() {
      if (!higgs) return;

      const gradient = ctx.createRadialGradient(
        higgs.x,
        higgs.y,
        0,
        higgs.x,
        higgs.y,
        50
      );

      gradient.addColorStop(0, "white");
      gradient.addColorStop(0.3, "#a855f7");
      gradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(higgs.x, higgs.y, 40, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(higgs.x, higgs.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#a855f7";
      ctx.fill();
    }

    /* =============================
       PHOTON BURST
       ============================= */
    function drawPhotons() {
      photons.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#facc15";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#facc15";
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    /* =============================
       COLLISION EFFECT
       ============================= */
    function drawCollisionEffects() {
      if (collisionFlash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${collisionFlash})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        collisionFlash -= 0.05;
      }

      if (shockRadius > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, shockRadius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,255,255,0.8)";
        ctx.lineWidth = 4;
        ctx.stroke();
        shockRadius += 6;

        if (shockRadius > 200) shockRadius = 0;
      }
    }

    /* =============================
       ANIMATION LOOP
       ============================= */
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (colliding) {
        proton1.x += 7;
        proton2.x -= 7;

        if (proton1.x >= centerX) {
          colliding = false;

          collisionFlash = 0.6;
          shockRadius = 20;

          if (energy >= 125) {
            const probability = Math.min((energy - 120) / 100, 1);

            if (Math.random() < probability) {
              setStatus("Higgs Boson Created (~125 GeV)");
              higgs = { x: centerX, y: centerY };

              setTimeout(() => {
                higgs = null;
                photons = [];

                for (let i = 0; i < 20; i++) {
                  let angle = (Math.PI * 2 * i) / 20;
                  photons.push({
                    x: centerX,
                    y: centerY,
                    vx: 5 * Math.cos(angle),
                    vy: 5 * Math.sin(angle),
                  });
                }

                setStatus("Higgs Decay → γ γ / boson jets");
              }, 800);
            } else {
              setStatus("High Energy Collision — No Higgs Event");
            }
          } else {
            setStatus("Energy Below Higgs Threshold");
          }
        }
      }

      photons.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
      });

      drawProton(proton1, "#38bdf8");
      drawProton(proton2, "#f472b6");
      drawHiggs();
      drawPhotons();
      drawCollisionEffects();

      animationFrame = requestAnimationFrame(animate);
    }

    function start() {
      proton1 = { x: 80, y: 200 };
      proton2 = { x: 820, y: 200 };
      photons = [];
      trails = [];
      higgs = null;
      colliding = true;
      shockRadius = 0;
      collisionFlash = 0;
      setStatus("Protons Accelerating...");
    }

    start();
    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [trigger, energy]);

  return (
    <div className="higgs-wrapper">
      <canvas
        ref={canvasRef}
        width={900}
        height={400}
        style={{
          background:
            "radial-gradient(circle at center, #0f172a, #020617)",
          borderRadius: "16px"
        }}
      />
      <div className="higgs-status">{status}</div>
    </div>
  );
}
