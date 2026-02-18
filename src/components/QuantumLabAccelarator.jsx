import React, { useRef, useEffect } from "react";

export default function QuantumParticleAccelerator({
  speed,
  energy,
  trigger
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animationFrame;
    let angle1 = 0;
    let angle2 = Math.PI;
    let particles = [];
    let collisionActive = false;
    let shockRadius = 0;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 200;

    /* =============================
       GLOWING ACCELERATOR RING
       ============================= */
    function drawRing() {
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        150,
        centerX,
        centerY,
        260
      );
      gradient.addColorStop(0, "#001f3f");
      gradient.addColorStop(1, "#00e5ff");

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 16;
      ctx.shadowBlur = 25;
      ctx.shadowColor = "#00e5ff";
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    /* =============================
       PARTICLE WITH TRAIL
       ============================= */
    function drawParticle(angle, color) {
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      particles.push({ x, y, color, life: 40 });

      particles.forEach((p) => {
        ctx.globalAlpha = p.life / 40;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.life--;
      });

      particles = particles.filter((p) => p.life > 0);
      ctx.globalAlpha = 1;
    }

    /* =============================
       CINEMATIC COLLISION EFFECT
       ============================= */
    function drawExplosion() {
      const flash = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        120
      );
      flash.addColorStop(0, "white");
      flash.addColorStop(0.3, "yellow");
      flash.addColorStop(1, "orange");

      ctx.beginPath();
      ctx.arc(centerX, centerY, 40 + shockRadius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = flash;
      ctx.fill();

      // Expanding shockwave
      ctx.strokeStyle = "rgba(0,255,255,0.8)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, shockRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Particle jets
      for (let i = 0; i < 30; i++) {
        let a = Math.random() * Math.PI * 2;
        let dist = shockRadius * Math.random();
        let x = centerX + dist * Math.cos(a);
        let y = centerY + dist * Math.sin(a);
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      shockRadius += 6;

      if (shockRadius > 220) {
        collisionActive = false;
      }
    }

    /* =============================
       COLLISION DETECTION
       ============================= */
    function detectCollision() {
      if (
        Math.abs((angle1 % (2 * Math.PI))) < 0.05 &&
        Math.abs((angle2 % (2 * Math.PI))) < 0.05 &&
        energy > 150 &&
        !collisionActive
      ) {
        collisionActive = true;
        shockRadius = 0;
      }
    }

    /* =============================
       MAIN LOOP
       ============================= */
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawRing();

      angle1 += speed * 0.01;
      angle2 -= speed * 0.01;

      drawParticle(angle1, "#00ffff");
      drawParticle(angle2, "#ff00ff");

      detectCollision();

      if (collisionActive) {
        drawExplosion();
      }

      animationFrame = requestAnimationFrame(animate);
    }

    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [speed, energy, trigger]);

  return (
    <div className="accelerator-wrapper">
      <canvas
        ref={canvasRef}
        width={900}
        height={600}
        style={{
          background:
            "radial-gradient(circle at center, #000814, #000000)",
          borderRadius: "20px"
        }}
      />
    </div>
  );
}
