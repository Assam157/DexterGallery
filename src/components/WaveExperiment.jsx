import React, { useEffect, useRef, useState } from "react";
import "./EMLabWave.css";

export default function WaveInterferenceExperiment() {
  const staticRef = useRef(null);
  const wave1Ref = useRef(null);
  const wave2Ref = useRef(null);

  // Wave 1
  const [amp1, setAmp1] = useState(50);
  const [freq1, setFreq1] = useState(0.02);

  // Wave 2
  const [amp2, setAmp2] = useState(50);
  const [freq2, setFreq2] = useState(0.02);

  const [phase, setPhase] = useState(Math.PI);

  // UI state
  const [selectedWave, setSelectedWave] = useState(1); // 1 | 2
  const [activeSlider, setActiveSlider] = useState("amp"); // amp | freq | phase
  const [isPlaying, setIsPlaying] = useState(true);

  const timeRef = useRef(0);
  const animRef = useRef(null);

  const W = 600;
  const H = 200;

  /* ==========================
     KEYBOARD: ONLY A / D
  ========================== */
  useEffect(() => {
    function onKey(e) {
      if (e.key === "a" || e.key === "A") adjust(-1);
      if (e.key === "d" || e.key === "D") adjust(1);
    }

    function adjust(dir) {
      if (activeSlider === "amp") {
        if (selectedWave === 1)
          setAmp1(v => Math.min(80, Math.max(0, v + dir * 2)));
        else
          setAmp2(v => Math.min(80, Math.max(0, v + dir * 2)));
      }

      if (activeSlider === "freq") {
        if (selectedWave === 1)
          setFreq1(v => Math.min(0.05, Math.max(0.005, v + dir * 0.002)));
        else
          setFreq2(v => Math.min(0.05, Math.max(0.005, v + dir * 0.002)));
      }

      if (activeSlider === "phase") {
        setPhase(v =>
          Math.min(2 * Math.PI, Math.max(0, v + dir * 0.1))
        );
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeSlider, selectedWave]);

  /* ==========================
     ANIMATED WAVES
  ========================== */
  useEffect(() => {
    const ctx1 = wave1Ref.current.getContext("2d");
    const ctx2 = wave2Ref.current.getContext("2d");

    const draw = () => {
      ctx1.clearRect(0, 0, W / 2, H);
      ctx2.clearRect(0, 0, W / 2, H);

      const midY = H / 2;

      ctx1.strokeStyle = "#1e90ff";
      ctx1.lineWidth = 2;
      ctx1.beginPath();
      for (let x = 0; x < W / 2; x++) {
        ctx1.lineTo(x, midY + amp1 * Math.sin(freq1 * x + timeRef.current));
      }
      ctx1.stroke();

      ctx2.strokeStyle = "#ff8c00";
      ctx2.lineWidth = 2;
      ctx2.beginPath();
      for (let x = 0; x < W / 2; x++) {
        ctx2.lineTo(
          x,
          midY + amp2 * Math.sin(freq2 * x + timeRef.current + phase)
        );
      }
      ctx2.stroke();

      if (isPlaying) timeRef.current += 0.05;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [amp1, amp2, freq1, freq2, phase, isPlaying]);

  /* ==========================
     STATIC SUPERPOSITION
  ========================== */
  useEffect(() => {
    const ctx = staticRef.current.getContext("2d");
    ctx.clearRect(0, 0, W, H);

    const midY = H / 2;

    ctx.strokeStyle = "#1e90ff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      ctx.lineTo(x, midY + amp1 * Math.sin(freq1 * x));
    }
    ctx.stroke();

    ctx.strokeStyle = "#ff8c00";
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      ctx.lineTo(x, midY + amp2 * Math.sin(freq2 * x + phase));
    }
    ctx.stroke();

    ctx.strokeStyle = "#c4002f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      ctx.lineTo(
        x,
        midY +
          amp1 * Math.sin(freq1 * x) +
          amp2 * Math.sin(freq2 * x + phase)
      );
    }
    ctx.stroke();
  }, [amp1, amp2, freq1, freq2, phase]);

  /* ==========================
     SLIDER VALUES (SYNCED)
  ========================== */
  const currentAmp = selectedWave === 1 ? amp1 : amp2;
  const currentFreq = selectedWave === 1 ? freq1 : freq2;

  return (
    <div className="emlab-container">
      <h2>Wave Superposition & Interference</h2>

      {/* STATIC PANEL */}
      <h4>Static Superposition</h4>
      <canvas ref={staticRef} width={W} height={H} />

      {/* ANIMATED PANELS */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <canvas ref={wave1Ref} width={W / 2} height={H} />
        <canvas ref={wave2Ref} width={W / 2} height={H} />
      </div>

      {/* WAVE SELECT */}
      <div style={{ marginTop: "15px" }}>
        <button onClick={() => setSelectedWave(1)}
          className={selectedWave === 1 ? "active-btn" : ""}>
          Wave 1
        </button>
        <button onClick={() => setSelectedWave(2)}
          className={selectedWave === 2 ? "active-btn" : ""}>
          Wave 2
        </button>
      </div>

      {/* SLIDER SELECT */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={() => setActiveSlider("amp")}
          className={activeSlider === "amp" ? "active-btn" : ""}>
          Amplitude
        </button>
        <button onClick={() => setActiveSlider("freq")}
          className={activeSlider === "freq" ? "active-btn" : ""}>
          Frequency
        </button>
        <button onClick={() => setActiveSlider("phase")}
          className={activeSlider === "phase" ? "active-btn" : ""}>
          Phase
        </button>
      </div>

      {/* SLIDERS (MOUSE + KEYBOARD SYNCED) */}
      <div className="controls">
        <label>
          Amplitude (Wave {selectedWave}): {currentAmp}
        </label>
        <input
          type="range"
          min="0"
          max="80"
          value={currentAmp}
          onChange={e =>
            selectedWave === 1
              ? setAmp1(+e.target.value)
              : setAmp2(+e.target.value)
          }
        />

        <label>
          Frequency (Wave {selectedWave}): {currentFreq.toFixed(3)}
        </label>
        <input
          type="range"
          min="0.005"
          max="0.05"
          step="0.005"
          value={currentFreq}
          onChange={e =>
            selectedWave === 1
              ? setFreq1(+e.target.value)
              : setFreq2(+e.target.value)
          }
        />

        <label>
          Phase Difference (ϕ): {phase.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max={2 * Math.PI}
          step="0.1"
          value={phase}
          onChange={e => setPhase(+e.target.value)}
        />
      </div>

      <p style={{ marginTop: "10px", fontWeight: "bold" }}>
        Use <b>A</b> / <b>D</b> or mouse →
        <span style={{ color: "#1e90ff" }}>
          {" "} {activeSlider.toUpperCase()}
        </span>
        {" "} | Wave {selectedWave}
      </p>

      <button onClick={() => setIsPlaying(p => !p)}>
        {isPlaying ? "⏸ Pause" : "▶ Play"}
      </button>
    </div>
  );
}
