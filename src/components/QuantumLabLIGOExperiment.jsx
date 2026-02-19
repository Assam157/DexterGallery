import React, { useRef, useEffect, useState } from "react";

export default function LigoChirpSimulation() {
  const detectorRef = useRef(null);
  const eventRef = useRef(null);
  const signalRef = useRef(null);
  const animationRef = useRef(null);

  const [eventActive, setEventActive] = useState(false);

  useEffect(() => {
    const dCanvas = detectorRef.current;
    const eCanvas = eventRef.current;
    const sCanvas = signalRef.current;

    const dctx = dCanvas.getContext("2d");
    const ectx = eCanvas.getContext("2d");
    const sctx = sCanvas.getContext("2d");

    let time = 0;
    let chirpProgress = 0;
    let strain = 0;

    /* =========================
       STARFIELD
    ========================= */
    const stars = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * eCanvas.width,
      y: Math.random() * eCanvas.height,
      r: Math.random() * 2,
    }));

    /* =========================
       DETECTOR
    ========================= */
    function drawDetector() {
      dctx.clearRect(0, 0, dCanvas.width, dCanvas.height);

      const cx = dCanvas.width / 2;
      const cy = dCanvas.height / 2;

      // Beam splitter
      dctx.shadowBlur = 20;
      dctx.shadowColor = "#facc15";
      dctx.fillStyle = "#facc15";
      dctx.beginPath();
      dctx.arc(cx, cy, 10, 0, Math.PI * 2);
      dctx.fill();
      dctx.shadowBlur = 0;

      const arms = [
        0,
        (120 * Math.PI) / 180,
        (240 * Math.PI) / 180,
      ];

      arms.forEach((angle) => {
        const length = 250 + strain * 2;
        const x = cx + length * Math.cos(angle);
        const y = cy + length * Math.sin(angle);

        // Arm
        dctx.strokeStyle = "#38bdf8";
        dctx.lineWidth = 6;
        dctx.beginPath();
        dctx.moveTo(cx, cy);
        dctx.lineTo(x, y);
        dctx.stroke();

        // Mirror
        dctx.fillStyle = "#94a3b8";
        dctx.beginPath();
        dctx.arc(x, y, 8, 0, Math.PI * 2);
        dctx.fill();

        // Laser glow
        dctx.shadowBlur = 15;
        dctx.shadowColor = "red";
        dctx.strokeStyle = "rgba(255,0,0,0.8)";
        dctx.lineWidth = 2;
        dctx.beginPath();
        dctx.moveTo(cx, cy);
        dctx.lineTo(
          x + Math.sin(time * 10) * strain,
          y + Math.cos(time * 10) * strain
        );
        dctx.stroke();
        dctx.shadowBlur = 0;
      });
    }

    /* =========================
       MERGER EVENT
    ========================= */
    function drawEvent() {
      ectx.clearRect(0, 0, eCanvas.width, eCanvas.height);

      // Stars
      ectx.fillStyle = "white";
      stars.forEach((star) => {
        ectx.beginPath();
        ectx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ectx.fill();
      });

      const cx = eCanvas.width / 2;
      const cy = eCanvas.height / 2;

      let r = 100 - chirpProgress * 90;
      if (r < 10) r = 10;

      const x1 = cx + r * Math.cos(time * 4);
      const y1 = cy + r * Math.sin(time * 4);
      const x2 = cx - r * Math.cos(time * 4);
      const y2 = cy - r * Math.sin(time * 4);

      // Black holes
      ectx.fillStyle = "#000";
      ectx.shadowBlur = 25;
      ectx.shadowColor = "#a855f7";
      ectx.beginPath();
      ectx.arc(x1, y1, 18, 0, Math.PI * 2);
      ectx.fill();
      ectx.beginPath();
      ectx.arc(x2, y2, 18, 0, Math.PI * 2);
      ectx.fill();
      ectx.shadowBlur = 0;

      // Flash
      if (chirpProgress > 0.9) {
        ectx.fillStyle = `rgba(255,255,255,${chirpProgress})`;
        ectx.beginPath();
        ectx.arc(cx, cy, 40 * chirpProgress, 0, Math.PI * 2);
        ectx.fill();
      }

      // Ripple
      ectx.strokeStyle = `rgba(56,189,248,${0.5 + chirpProgress})`;
      ectx.lineWidth = 2;
      ectx.beginPath();
      ectx.arc(cx, cy, 120 + chirpProgress * 150, 0, Math.PI * 2);
      ectx.stroke();
    }

    /* =========================
       SIGNAL
    ========================= */
    function drawSignal() {
      sctx.clearRect(0, 0, sCanvas.width, sCanvas.height);

      sctx.shadowBlur = 15;
      sctx.shadowColor = "#22d3ee";
      sctx.strokeStyle = "#22d3ee";
      sctx.lineWidth = 2;
      sctx.beginPath();

      for (let x = 0; x < sCanvas.width; x++) {
        const freq = 2 + chirpProgress * 40;
        const amp = 2 + chirpProgress * 50;
        const y =
          sCanvas.height / 2 +
          Math.sin((x + time * 80) * 0.01 * freq) * amp;

        if (x === 0) sctx.moveTo(x, y);
        else sctx.lineTo(x, y);
      }

      sctx.stroke();
      sctx.shadowBlur = 0;
    }

    /* =========================
       ANIMATION LOOP
    ========================= */
    function animate() {
      time += 0.02;

      if (eventActive) {
        chirpProgress += 0.005;
        if (chirpProgress > 1) chirpProgress = 1;
        strain = 20 * chirpProgress;
        drawEvent();
      } else {
        strain *= 0.92;
      }

      drawDetector();
      drawSignal();

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, [eventActive]);

  return (
    <div style={{ width: "100%", textAlign: "center", color: "white" }}>
      <h2 style={{ color: "#38bdf8" }}>
        LIGO Gravitational Wave Interferometer
      </h2>

      <button
        onClick={() => {
          setEventActive(true);
          setTimeout(() => setEventActive(false), 8000);
        }}
        style={{
          padding: "10px 22px",
          borderRadius: "30px",
          border: "none",
          background: "linear-gradient(90deg,#f43f5e,#ec4899)",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
          margin: "15px",
        }}
      >
        Simulate Black Hole Merger
      </button>

      <canvas
        ref={detectorRef}
        width={900}
        height={420}
        style={{
          background: "#0f172a",
          borderRadius: "14px",
          marginBottom: "15px",
        }}
      />

      <canvas
        ref={eventRef}
        width={900}
        height={300}
        style={{
          background: "#0f172a",
          borderRadius: "14px",
          marginBottom: "15px",
        }}
      />

      <canvas
        ref={signalRef}
        width={900}
        height={150}
        style={{
          background: "#0f172a",
          borderRadius: "14px",
        }}
      />
    </div>
  );
}
