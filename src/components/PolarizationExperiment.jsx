import React, { useEffect, useRef, useState } from "react";

const W = 1100;
const H = 420;

export default function PolarisationExperiment({ lightOn, setLightOn }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const [theta1, setTheta1] = useState(20);
  const [theta2, setTheta2] = useState(60);

  // 0 = Crystal 1, 1 = Crystal 2
  const [activeSlider, setActiveSlider] = useState(0);

  /* ================= CANVAS ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function clear() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
    }

    function drawDoubleArrow(x1, y1, x2, y2, I) {
      ctx.strokeStyle = `rgba(255,80,80,${I})`;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      drawArrowHead(x2, y2, Math.atan2(y2 - y1, x2 - x1), I);
      drawArrowHead(x1, y1, Math.atan2(y1 - y2, x1 - x2), I);
    }

    function drawArrowHead(x, y, angle, I) {
      const s = 6;
      ctx.fillStyle = `rgba(255,80,80,${I})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x - s * Math.cos(angle - 0.4),
        y - s * Math.sin(angle - 0.4)
      );
      ctx.lineTo(
        x - s * Math.cos(angle + 0.4),
        y - s * Math.sin(angle + 0.4)
      );
      ctx.closePath();
      ctx.fill();
    }

    function drawPointSource(x, y, I) {
      ctx.fillStyle = `rgba(255,80,80,${I})`;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      for (let a = -0.4; a <= 0.4; a += 0.15) {
        drawDoubleArrow(x + 10, y, x + 120, y + a * 80, I);
      }
    }

    function drawField(x1, x2, theta, I) {
      for (let x = x1; x < x2; x += 22) {
        ctx.save();
        ctx.translate(x, H / 2);
        ctx.rotate(theta);
        drawDoubleArrow(-10, 0, 10, 0, I);
        ctx.restore();
      }
    }

    function drawHexCrystal(x, angle, label) {
      const r = 38;
      ctx.save();
      ctx.translate(x, H / 2);
      ctx.rotate(angle);

      const grad = ctx.createLinearGradient(-r, -r, r, r);
      grad.addColorStop(0, "rgba(200,240,255,0.85)");
      grad.addColorStop(0.5, "rgba(80,160,220,0.55)");
      grad.addColorStop(1, "rgba(30,80,140,0.85)");

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const px = r * Math.cos(a);
        const py = r * Math.sin(a);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.strokeStyle = "#bfe9ff";
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();

      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(0, r);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();

      ctx.fillStyle = "#cfefff";
      ctx.font = "14px monospace";
      ctx.fillText(label, x - 32, H - 18);
    }

    function drawEye(x, y) {
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x, y, 32, 18, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#88f";
      ctx.beginPath();
      ctx.arc(x + 6, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    function loop() {
      clear();

      if (lightOn) {
        const t1 = (theta1 * Math.PI) / 180;
        const t2 = (theta2 * Math.PI) / 180;

        drawPointSource(60, H / 2, 1);

        drawHexCrystal(260, t1, "Crystal 1");
        const I1 = Math.cos(t1) ** 2;
        drawField(300, 420, t1, I1);

        drawHexCrystal(480, t2, "Crystal 2");
        const I2 = I1 * Math.cos(t2 - t1) ** 2;
        drawField(520, 740, t2, I2);

        drawEye(900, H / 2);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    loop();
    return () => cancelAnimationFrame(rafRef.current);
  }, [lightOn, theta1, theta2]);

  /* ================= KEYBOARD CONTROLS ================= */
  useEffect(() => {
    function onKey(e) {
      if (!lightOn) return;

      // Switch active slider
      if (e.key === "q" || e.key === "Q" || e.key === "e" || e.key === "E") {
        setActiveSlider((s) => (s + 1) % 2);
      }

      // Adjust value
      if (e.key === "a" || e.key === "A") adjust(-1);
      if (e.key === "d" || e.key === "D") adjust(+1);
    }

    function adjust(dir) {
      if (activeSlider === 0) {
        setTheta1((v) => Math.min(90, Math.max(0, v + dir)));
      } else {
        setTheta2((v) => Math.min(90, Math.max(0, v + dir)));
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeSlider, lightOn]);

  /* ================= UI ================= */
  return (
    <div style={{ padding: 18 }}>
      <button
        onClick={() => setLightOn(!lightOn)}
        style={{
          marginBottom: 10,
          background: lightOn ? "#ff4444" : "#44ff88",
          border: "none",
          padding: "8px 12px",
          fontFamily: "monospace",
          cursor: "pointer"
        }}
      >
        {lightOn ? "TURN LIGHT OFF" : "TURN LIGHT ON"}
      </button>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          display: "block",
          background: "#000",
          border: "2px solid #555"
        }}
      />

      {lightOn && (
        <div style={{ marginTop: 14, color: "#9ef" }}>
          {/* ===== PRIMARY SELECTOR ===== */}
          <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
            <button
              onClick={() => setActiveSlider(0)}
              style={{
                padding: "6px 12px",
                background: activeSlider === 0 ? "#38bdf8" : "#1e293b",
                color: "#fff",
                border: "none",
                cursor: "pointer"
              }}
            >
              CRYSTAL 1
            </button>

            <button
              onClick={() => setActiveSlider(1)}
              style={{
                padding: "6px 12px",
                background: activeSlider === 1 ? "#38bdf8" : "#1e293b",
                color: "#fff",
                border: "none",
                cursor: "pointer"
              }}
            >
              CRYSTAL 2
            </button>
          </div>

          {/* ===== SLIDERS ===== */}
          <div style={{ display: "flex", gap: 24 }}>
            <div>
              <div>Crystal 1 Angle: {theta1}°</div>
              <input
                type="range"
                min="0"
                max="90"
                value={theta1}
                onChange={(e) => setTheta1(+e.target.value)}
                style={{
                  width: 220,
                  outline:
                    activeSlider === 0 ? "2px solid #38bdf8" : "none"
                }}
              />
            </div>

            <div>
              <div>Crystal 2 Angle: {theta2}°</div>
              <input
                type="range"
                min="0"
                max="90"
                value={theta2}
                onChange={(e) => setTheta2(+e.target.value)}
                style={{
                  width: 220,
                  outline:
                    activeSlider === 1 ? "2px solid #38bdf8" : "none"
                }}
              />
            </div>
          </div>

          <div style={{ fontSize: 12, marginTop: 6, opacity: 0.8 }}>
            Select crystal → use <b>A / D</b> | Switch: <b>Q / E</b>
          </div>
        </div>
      )}
    </div>
  );
}
