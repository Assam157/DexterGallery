import React, { useRef, useEffect, useState } from "react";
import "./BandGapExperiment.css";

const W = 480;
const H = 560;

const levels = {
  E3: 90,
  E2: 160,
  E1: 260,
  E0: 380,
};

export default function BandGapExperiment() {
  const canvasRef = useRef(null);
  const [stage, setStage] = useState(0);

  const electron = useRef({
    y: levels.E0,
    targetY: levels.E0,
    vy: 0,
  });

  useEffect(() => {
    let raf;
    const ctx = canvasRef.current.getContext("2d");

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      drawLevels(ctx);
      updateElectron();
      drawElectron(ctx);
      drawStageEffects(ctx);
      raf = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(raf);
  }, [stage]);

  const drawLevels = (ctx) => {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.font = "15px monospace";

    Object.entries(levels).forEach(([k, y]) => {
      ctx.beginPath();
      ctx.moveTo(100, y);
      ctx.lineTo(360, y);
      ctx.stroke();
      ctx.fillText(k, 380, y + 5);
    });
  };

  const updateElectron = () => {
    const e = electron.current;
    const dy = e.targetY - e.y;
    e.vy = dy * 0.08;
    e.y += e.vy;
  };

  const drawElectron = (ctx) => {
    ctx.save();
    ctx.shadowColor = "#1e90ff";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#1e90ff";
    ctx.beginPath();
    ctx.arc(230, electron.current.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawPhotonWave = (ctx, x, y, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 90; i++) {
      ctx.lineTo(x + i * 3, y + Math.sin(i / 2) * 6);
    }
    ctx.stroke();
  };

  const drawStageEffects = (ctx) => {
    ctx.lineWidth = 2;

    if (stage === 1) {
      ctx.strokeStyle = "#1e90ff";
      ctx.beginPath();
      ctx.moveTo(230, levels.E0);
      ctx.lineTo(230, electron.current.y);
      ctx.stroke();
      drawPhotonWave(ctx, 30, 270, "#1e90ff");
    }

    if (stage === 2) {
      ctx.strokeStyle = "#666";
      ctx.beginPath();
      ctx.moveTo(230, levels.E3);
      ctx.lineTo(230, electron.current.y);
      ctx.stroke();
    }

    if (stage === 3) {
      ctx.strokeStyle = "#cc0000";
      ctx.beginPath();
      ctx.moveTo(230, levels.E2);
      ctx.lineTo(230, electron.current.y);
      ctx.stroke();
      drawPhotonWave(ctx, 260, 280, "#cc0000");
    }
  };

  const advanceStage = () => {
    const e = electron.current;

    if (stage === 0) {
      e.targetY = levels.E3;
      setStage(1);
    } else if (stage === 1) {
      e.targetY = levels.E2;
      setStage(2);
    } else if (stage === 2) {
      e.targetY = levels.E0;
      setStage(3);
    } else {
      e.y = levels.E0;
      e.targetY = levels.E0;
      setStage(0);
    }
  };

  const labels = [
    "Apply Excitation",
    "Non-Radiative Relaxation",
    "Radiative Emission",
    "Reset Experiment",
  ];

  return (
    <div className="bandgap-root">
      <h2>Band Gap Energy Transitions</h2>
      <canvas ref={canvasRef} width={W} height={H} />
      <button onClick={advanceStage}>{labels[stage]}</button>
    </div>
  );
}
