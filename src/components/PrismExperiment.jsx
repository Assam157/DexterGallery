import React, { useEffect, useRef } from "react";

const W = 1000;
const H = 500;

const COLORS = [
  { name: "V", c: "#7f00ff", offset: -32, wavelength: "380nm" },
  { name: "I", c: "#4b0082", offset: -21, wavelength: "430nm" },
  { name: "B", c: "#0000ff", offset: -11, wavelength: "475nm" },
  { name: "G", c: "#00aa00", offset: 0, wavelength: "510nm" },
  { name: "Y", c: "#eab308", offset: 11, wavelength: "570nm" },
  { name: "O", c: "#ff7f00", offset: 21, wavelength: "590nm" },
  { name: "R", c: "#ff0000", offset: 32, wavelength: "650nm" }
];

const prism1 = { x: 360, y: H / 2, w: 72, h: 220 };
const prism2 = { x: 700, y: H / 2, w: 72, h: 220 };

export default function PrismExperiment({ lightOn, setLightOn }) {
  const canvasRef = useRef(null);
  const tRef = useRef(0);

  // Mount guard
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // ---------- Drawing helpers ----------
    function drawPrismShape(prism, inverted, tintColor = "#b388ff") {
      ctx.save();
      ctx.strokeStyle = tintColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = tintColor;
      ctx.shadowBlur = 10;

      let apexX, apexY, baseLeftX, baseLeftY, baseRightX, baseRightY;

      if (!inverted) {
        apexX = prism.x + prism.w / 2;
        apexY = prism.y;
        baseLeftX = prism.x - prism.w / 2;
        baseLeftY = prism.y - prism.h / 2;
        baseRightX = prism.x - prism.w / 2;
        baseRightY = prism.y + prism.h / 2;
      } else {
        apexX = prism.x - prism.w / 2;
        apexY = prism.y;
        baseLeftX = prism.x + prism.w / 2;
        baseLeftY = prism.y - prism.h / 2;
        baseRightX = prism.x + prism.w / 2;
        baseRightY = prism.y + prism.h / 2;
      }

      ctx.beginPath();
      ctx.moveTo(apexX, apexY);
      ctx.lineTo(baseLeftX, baseLeftY);
      ctx.lineTo(baseRightX, baseRightY);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "rgba(180, 140, 255, 0.08)";
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = `${tintColor}60`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (!inverted) {
        ctx.moveTo(apexX - 15, apexY);
        ctx.lineTo(baseLeftX + 15, baseLeftY + 15);
      } else {
        ctx.moveTo(apexX + 15, apexY);
        ctx.lineTo(baseLeftX - 15, baseLeftY + 15);
      }
      ctx.stroke();

      ctx.fillStyle = tintColor;
      ctx.font = "bold 12px 'Segoe UI'";
      ctx.shadowBlur = 5;
      if (!inverted)
        ctx.fillText("DISPERSING PRISM", prism.x - 55, prism.y - prism.h / 2 - 15);
      else
        ctx.fillText("RECOMBINING PRISM", prism2.x - 75, prism2.y - prism2.h / 2 - 15);

      ctx.restore();
    }

    function drawIncidentRay() {
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 20;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(30, prism1.y);
      ctx.lineTo(prism1.x - prism1.w / 2 + 12, prism1.y);
      ctx.stroke();

      ctx.shadowBlur = 30;
      ctx.strokeStyle = "#ffffaa";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, prism1.y);
      ctx.lineTo(prism1.x - prism1.w / 2 + 12, prism1.y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#ffd966";
      ctx.font = "bold 14px monospace";
      ctx.fillText("WHITE LIGHT", 50, prism1.y - 20);
    }

    function drawPhotons() {
      if (!lightOn) return;
      const period = 100;
      const progress = (tRef.current % period) / period;
      const startX = 30;
      const endX = prism1.x - prism1.w / 2 + 12;
      const x = startX + progress * (endX - startX);
      const y = prism1.y;

      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffaa";
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function drawDispersionBetweenPrisms() {
      const startX = prism1.x + prism1.w / 2 - 6;
      const endX = prism2.x - prism2.w / 2 + 8;

      COLORS.forEach(col => {
        const startY = prism1.y + col.offset * 0.7;
        const endY = prism2.y + col.offset * 0.9;

        ctx.shadowColor = col.c;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = col.c;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      });
      ctx.shadowBlur = 0;
    }

    function drawSpectrumLabels() {
      const midX = (prism1.x + prism2.x) / 2;
      COLORS.forEach(col => {
        const yPos = prism1.y + col.offset * 0.8;
        if (yPos > 40 && yPos < H - 40) {
          ctx.fillStyle = col.c;
          ctx.font = "bold 12px monospace";
          ctx.shadowBlur = 6;
          ctx.fillText(col.name, midX - 55, yPos);
          ctx.fillStyle = "#88aaddcc";
          ctx.font = "9px monospace";
          ctx.fillText(col.wavelength, midX - 55, yPos + 12);
        }
      });
      ctx.shadowBlur = 0;
    }

    function drawRecombinedWhiteLight() {
      const exitStartX = prism2.x + prism2.w / 2 - 8;
      const finalBeamEndX = W - 45;
      const centerY = prism2.y;

      // Converging colored rays
      for (let i = 0; i < COLORS.length; i++) {
        const col = COLORS[i];
        const startY = prism2.y + col.offset * 0.55;
        const convergeX = exitStartX + 35;
        const endY = centerY + col.offset * 0.25;

        ctx.shadowColor = col.c;
        ctx.shadowBlur = 6;
        ctx.strokeStyle = col.c;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(exitStartX, startY);
        ctx.lineTo(convergeX, endY);
        ctx.stroke();
      }

      const whiteStartX = exitStartX + 38;
      const whiteEndX = finalBeamEndX;

      // White beam
      ctx.shadowBlur = 28;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(whiteStartX, centerY);
      ctx.lineTo(whiteEndX, centerY);
      ctx.stroke();

      ctx.shadowBlur = 20;
      ctx.strokeStyle = "#ffffdd";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(whiteStartX, centerY);
      ctx.lineTo(whiteEndX, centerY);
      ctx.stroke();

      ctx.shadowBlur = 35;
      ctx.strokeStyle = "#ffffffcc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(whiteStartX, centerY);
      ctx.lineTo(whiteEndX, centerY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#ffffaa";
      ctx.font = "bold 15px 'Segoe UI', monospace";
      ctx.shadowBlur = 12;
      ctx.fillText("✨ RECOMBINED WHITE LIGHT ✨", whiteEndX - 270, centerY - 20);

      // Glowing orb
      ctx.fillStyle = "#ffffffcc";
      ctx.beginPath();
      ctx.arc(whiteEndX - 8, centerY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffffee";
      ctx.beginPath();
      ctx.arc(whiteEndX - 8, centerY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Sparkles
      for (let s = 0; s < 12; s++) {
        const sparkX = whiteStartX + ((tRef.current * 0.5 + s * 25) % (whiteEndX - whiteStartX));
        const sparkY = centerY + Math.sin(tRef.current * 0.1 + s) * 2;
        ctx.fillStyle = `rgba(255, 255, 200, ${0.4 + Math.sin(tRef.current * 0.2 + s) * 0.3})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawRecombinationGlow() {
      const convergenceCenterX = prism2.x + prism2.w / 2 + 25;
      const grad = ctx.createRadialGradient(convergenceCenterX, prism2.y, 5, convergenceCenterX, prism2.y, 55);
      grad.addColorStop(0, "#ffffffaa");
      grad.addColorStop(0.6, "#ffffff30");
      grad.addColorStop(1, "#ffffff00");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(convergenceCenterX, prism2.y, 60, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawPrismHighlights() {
      ctx.beginPath();
      ctx.moveTo(prism1.x + prism1.w / 2 - 10, prism1.y);
      ctx.lineTo(prism1.x - prism1.w / 2 + 20, prism1.y - prism1.h / 2 + 30);
      ctx.lineTo(prism1.x - prism1.w / 2 + 20, prism1.y + prism1.h / 2 - 30);
      ctx.fillStyle = "#ffffaa10";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(prism2.x - prism2.w / 2 + 10, prism2.y);
      ctx.lineTo(prism2.x + prism2.w / 2 - 20, prism2.y - prism2.h / 2 + 30);
      ctx.lineTo(prism2.x + prism2.w / 2 - 20, prism2.y + prism2.h / 2 - 30);
      ctx.fillStyle = "#ffffff08";
      ctx.fill();
    }

    function drawLightOffState() {
      ctx.fillStyle = "#88aaddcc";
      ctx.font = "22px 'Segoe UI', sans-serif";
      ctx.fillText("💡 LIGHT SOURCE OFF", 370, 180);
      ctx.font = "16px monospace";
      ctx.fillText("Press SPACE or click button to start experiment", 340, 240);
      ctx.fillStyle = "#b388ff";
      ctx.font = "14px monospace";
      ctx.fillText("Newton's double-prism: dispersion → recombination → white light", 335, 310);
    }

    // Main draw loop
    function draw() {
      if (!mountedRef.current || !canvasRef.current) return;

      ctx.clearRect(0, 0, W, H);

      // Grid background
      ctx.strokeStyle = "#1e3f6030";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < W; i += 35) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, H);
        ctx.stroke();
      }
      for (let i = 0; i < H; i += 35) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(W, i);
        ctx.stroke();
      }

      drawPrismShape(prism1, false, "#b388ff");
      drawPrismShape(prism2, true, "#c09aff");
      drawPrismHighlights();

      if (lightOn) {
        drawIncidentRay();
        drawPhotons();
        drawDispersionBetweenPrisms();
        drawSpectrumLabels();
        drawRecombinedWhiteLight();
        drawRecombinationGlow();

        // Extra animated particles
        ctx.shadowBlur = 5;
        COLORS.forEach((col, i) => {
          const midX = prism1.x + (prism2.x - prism1.x) * 0.48;
          const midY = prism1.y + col.offset * 0.78;
          ctx.fillStyle = col.c;
          ctx.beginPath();
          ctx.arc(midX + Math.sin(tRef.current * 0.02 + i) * 2, midY, 3, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      } else {
        drawLightOffState();
      }

      ctx.fillStyle = "#b388ffaa";
      ctx.font = "bold 10px monospace";
      ctx.fillText("🔹 DISPERSION → SPECTRUM", prism1.x - 65, prism1.y + prism1.h / 2 + 28);
      ctx.fillText("🔸 RECOMBINATION → WHITE LIGHT", prism2.x - 85, prism2.y + prism2.h / 2 + 28);

      tRef.current++;
      requestAnimationFrame(draw);
    }

    const raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [lightOn]);

  // Spacebar toggle
  useEffect(() => {
    function onKey(e) {
      if (e.key === " " || e.key === "Space") {
        e.preventDefault();
        setLightOn(prev => !prev);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setLightOn]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{
        display: "block",
        background: "#080c20",
        borderRadius: "28px",
        border: "2px solid #7b4fbb",
        boxShadow: "0 0 0 2px #1a1240",
        width: "100%",
        maxWidth: "1000px",
        height: "auto"
      }}
    />
  );
}