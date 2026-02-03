import React, { useRef, useEffect, useState } from "react";

/* =====================================================
   Bell Experiment — Local Hidden Variable (EMBED SAFE)
   ===================================================== */

export default function App() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  /* ===== State ===== */
  const [lambda, setLambda] = useState(1);
  const [phi, setPhi] = useState(30);
  const [analyzerAngle, setAnalyzerAngle] = useState(60);

  const [activeControl, setActiveControl] = useState("phi");
  // "phi" | "lambda" | "theta"

  const measurement =
    Math.cos(((analyzerAngle - phi) * Math.PI) / 180) * lambda;
  const spinUp = measurement >= 0;

  /* ===== Resize ===== */
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  /* ===== Keyboard Control (Q / E + A / D) ===== */
  useEffect(() => {
    const controls = ["phi", "lambda", "theta"];

    const handleKeyDown = (e) => {
      // Q / E → select control
      if (e.key === "q" || e.key === "Q") {
        setActiveControl(c =>
          controls[(controls.indexOf(c) - 1 + controls.length) % controls.length]
        );
        return;
      }

      if (e.key === "e" || e.key === "E") {
        setActiveControl(c =>
          controls[(controls.indexOf(c) + 1) % controls.length]
        );
        return;
      }

      // A / D → adjust
      const delta =
        e.key === "a" || e.key === "A" ? -1 :
        e.key === "d" || e.key === "D" ? 1 : 0;

      if (!delta) return;

      if (activeControl === "phi") {
        setPhi(v => Math.min(180, Math.max(0, v + delta)));
      }

      if (activeControl === "theta") {
        setAnalyzerAngle(v => Math.min(180, Math.max(0, v + delta)));
      }

      if (activeControl === "lambda") {
        setLambda(v => (v === 1 ? -1 : 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeControl]);

  /* ===== DRAW ===== */
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    const { width: W, height: H } = container.getBoundingClientRect();

    ctx.fillStyle = "#0b1320";
    ctx.fillRect(0, 0, W, H);

    const leftX = W * 0.3;
    const rightX = W * 0.7;
    const centerY = H * 0.5;

    const panelW = 380;
    const panelH = 340;

    ctx.strokeStyle = "#4fd1c5";
    ctx.lineWidth = 2;
    ctx.strokeRect(leftX - panelW / 2, centerY - panelH / 2, panelW, panelH);
    ctx.strokeRect(rightX - panelW / 2, centerY - panelH / 2, panelW, panelH);

    ctx.fillStyle = "#ffffff";
    ctx.font = "16px Arial";
    ctx.fillText("SOURCE (Hidden Variables)", leftX - 115, centerY - 140);
    ctx.fillText("ANALYZER (Measurement)", rightX - 115, centerY - 140);

    /* SOURCE */
    ctx.save();
    ctx.translate(leftX, centerY);
    ctx.rotate((-phi * Math.PI) / 180);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-90, 0);
    ctx.lineTo(90, 0);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#fff";
    ctx.font = "14px Arial";
    ctx.fillText(`Hidden Axis φ = ${phi}°`, leftX - 80, centerY + 110);
    ctx.fillStyle = "#e879f9";
    ctx.fillText(`Hidden Variable λ = ${lambda}`, leftX - 80, centerY + 135);

    /* ANALYZER */
    const cx = rightX;
    const cy = centerY;
    const R = 90;

    ctx.strokeStyle = "#34d399";
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((-analyzerAngle * Math.PI) / 180);

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-50, -25);
    ctx.lineTo(50, -25);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-50, 25);
    ctx.lineTo(50, 25);
    ctx.stroke();

    const dir = spinUp ? -1 : 1;
    ctx.strokeStyle = spinUp ? "#60a5fa" : "#f87171";
    ctx.fillStyle = ctx.strokeStyle;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, dir * 55);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, dir * 55);
    ctx.lineTo(-6, dir * 45);
    ctx.lineTo(6, dir * 45);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Analyzer Angle θ = ${analyzerAngle}°`, cx - 85, cy + 110);
    ctx.fillText(
      `Spin Outcome: ${spinUp ? "+1 (↑)" : "−1 (↓)"}`,
      cx - 85,
      cy + 135
    );
  }, [phi, lambda, analyzerAngle, spinUp]);

  /* ===== UI ===== */
  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />

      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 20,
          background: "rgba(0,0,0,0.55)",
          padding: "12px 18px",
          borderRadius: 12,
          color: "white"
        }}
      >
        {/* φ */}
        <div>
          <button
            onClick={() => setActiveControl("phi")}
            style={{
              fontWeight: "bold",
              marginBottom: 4,
              background: activeControl === "phi" ? "#facc15" : "#334155",
              color: "#000",
              border: "none",
              padding: "4px 8px",
              borderRadius: 6
            }}
          >
            φ
          </button><br />
          <input type="range" min="0" max="180" value={phi}
            onChange={(e) => setPhi(+e.target.value)} />
        </div>

        {/* λ */}
        <div>
          <button
            onClick={() => setActiveControl("lambda")}
            style={{
              fontWeight: "bold",
              marginBottom: 4,
              background: activeControl === "lambda" ? "#e879f9" : "#334155",
              color: "#000",
              border: "none",
              padding: "4px 8px",
              borderRadius: 6
            }}
          >
            λ
          </button><br />
          <select value={lambda}
            onChange={(e) => setLambda(+e.target.value)}>
            <option value={1}>+1</option>
            <option value={-1}>−1</option>
          </select>
        </div>

        {/* θ */}
        <div>
          <button
            onClick={() => setActiveControl("theta")}
            style={{
              fontWeight: "bold",
              marginBottom: 4,
              background: activeControl === "theta" ? "#34d399" : "#334155",
              color: "#000",
              border: "none",
              padding: "4px 8px",
              borderRadius: 6
            }}
          >
            θ
          </button><br />
          <input type="range" min="0" max="180" value={analyzerAngle}
            onChange={(e) => setAnalyzerAngle(+e.target.value)} />
        </div>
      </div>
    </div>
  );
}
