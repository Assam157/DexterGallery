import React, { useEffect, useRef } from "react";
import "./PulsarView.css";

const WIDTH = 700;
const HEIGHT = 220;

/* ---------------------------
   CURVE PARAMETERS
--------------------------- */
const BEAM_PHASE = 0.5;
const PULSE_WIDTH = 0.035;
const SPIKE_HEIGHT = 90;

export default function PulsarView({ spin }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  /* ================= VIDEO ================= */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = spin;
    video.loop = true;
    video.play();
  }, [spin]);

  /* ================= DRAW LOOP ================= */
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const video = videoRef.current;

    function draw() {
      if (!video || !video.duration) {
        requestAnimationFrame(draw);
        return;
      }

      let phase = (video.currentTime / video.duration) % 1;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      drawBaseline(ctx);
      drawBlueCurve(ctx);
      drawKnob(ctx, phase);

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }, []);

  return (
    <div className="pulsar-container">
      <div className="video-crop">
        <video
          ref={videoRef}
          src="/pulsar.mp4"
          className="pulsar-video"
          muted
          playsInline
        />
      </div>

      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="pulsar-canvas"
      />
    </div>
  );
}

/* ================= CURVE ================= */
function curveY(phase) {
  const d = phase - BEAM_PHASE;
  const intensity = Math.exp(-(d * d) / (2 * PULSE_WIDTH * PULSE_WIDTH));
  return HEIGHT / 2 - intensity * SPIKE_HEIGHT;
}

/* ================= DRAW ================= */
function drawBaseline(ctx) {
  ctx.strokeStyle = "#333";
  ctx.beginPath();
  ctx.moveTo(0, HEIGHT / 2);
  ctx.lineTo(WIDTH, HEIGHT / 2);
  ctx.stroke();
}

function drawBlueCurve(ctx) {
  ctx.strokeStyle = "#00eaff";
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let x = 0; x < WIDTH; x++) {
    const phase = x / WIDTH;
    const y = curveY(phase);
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }

  ctx.stroke();
}

function drawKnob(ctx, phase) {
  const x = phase * WIDTH;
  const y = curveY(phase);

  ctx.fillStyle = "#ffcc00";
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,204,0,0.25)";
  ctx.beginPath();
  ctx.moveTo(x, HEIGHT / 2);
  ctx.lineTo(x, y);
  ctx.stroke();
}
