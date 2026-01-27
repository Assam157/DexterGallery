import React, { useEffect, useRef, useState } from "react";
import { startFaraday } from "./FaradayCoil";
import "./EMLab.css";

export default function FaradayExperiment() {
  const canvasRef = useRef(null);
  const faradayRef = useRef(null);

  const [control, setControl] = useState(0);

  /* ================= TUNING ================= */
  const STEP = 0.04;
  const RETURN = 0.02;
  const LIMIT = 1;

  const LOGICAL_W = 1600;
  const LOGICAL_H = 920;

  const keysRef = useRef({ a: false, d: false });

  /* ================= START FARADAY ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;

    // Internal resolution (HiDPI safe)
    canvas.width = LOGICAL_W * dpr;
    canvas.height = LOGICAL_H * dpr;

    // Logical size (CSS pixels)
    canvas.style.width = `${LOGICAL_W}px`;
    canvas.style.height = `${LOGICAL_H}px`;

    // Normalize coordinates
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Start simulation
    faradayRef.current = startFaraday(canvas);

    return () => {
      if (faradayRef.current) faradayRef.current.stop();
    };
  }, []);

  /* ================= KEYBOARD INPUT ================= */
  useEffect(() => {
    function keyDown(e) {
      if (e.key === "a" || e.key === "A") keysRef.current.a = true;
      if (e.key === "d" || e.key === "D") keysRef.current.d = true;
    }

    function keyUp(e) {
      if (e.key === "a" || e.key === "A") keysRef.current.a = false;
      if (e.key === "d" || e.key === "D") keysRef.current.d = false;
    }

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  /* ================= CONTROL LOOP ================= */
  useEffect(() => {
    let raf;

    function update() {
      setControl(prev => {
        let v = prev;

        if (keysRef.current.a) v -= STEP;
        if (keysRef.current.d) v += STEP;

        // Auto-return
        if (!keysRef.current.a && !keysRef.current.d) {
          if (v > 0) v = Math.max(0, v - RETURN);
          if (v < 0) v = Math.min(0, v + RETURN);
        }

        // Clamp
        v = Math.max(-LIMIT, Math.min(LIMIT, v));

        if (faradayRef.current) {
          faradayRef.current.setControl(v);
        }

        return v;
      });

      raf = requestAnimationFrame(update);
    }

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ================= SLIDER ================= */
  function onSlider(e) {
    const v = parseFloat(e.target.value);
    setControl(v);
    if (faradayRef.current) faradayRef.current.setControl(v);
  }

  /* ================= RENDER ================= */
  return (
    <div className="lab-canvas-wrap">
      {/* CANVAS */}
      <canvas ref={canvasRef} />

      {/* CONTROL PANEL */}
      <div className="cinema-energy">
        <div className="label">MAGNET MOTION</div>

        <div className="value">
          {control < -0.05 && "A (Left)"}
          {Math.abs(control) <= 0.05 && "Rest"}
          {control > 0.05 && "D (Right)"}
        </div>

        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={control}
          onChange={onSlider}
        />

        <div className="panel-hint">
          Use <b>A</b> / <b>D</b> keys or drag slider
        </div>
      </div>
    </div>
  );
}
