// src/components/faraday/faraday.js

export function startFaraday(canvas) {
  const ctx = canvas.getContext("2d");

  /* ================= ORIGINAL STATE ================= */

  let fluxTime = 0;
  let controlValue = 0; // 🔥 slider value (-1 to +1)

  const layout = {
    coilX: 0,
    coilY: 0,
    coilRadius: 72,
    ammeterX: 0,
    ammeterY: 0,
    bulbX: 0,
    bulbY: 0,
    wireTopY: 0,
    wireBottomY: 0,
    ammeterRadius: 70,
    bulbRadius: 34
  };

  const physics = {
    fluxPrev: 0,
    rawCurrent: 0,
    displayCurrent: 0,
    needleCurrent: 0
  };

  const state = {
    width: 1200,
    height: 700,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    lastTime: 0,
    magnet: { x: 0, y: 0, v: 0 }
  };

  const params = {
    magnetMin: 0,
    magnetMax: 0,
    magnetHalfWidth: 65,
    speed: 320,
    damping: 0.85,
    fluxK: 2000000,
    fluxC: 1200,
    currentGain: 0.2,
    currentSmoothing: 0.18,
    needleSmoothing: 0.08,
    restReturn: 0.65,
    maxCurrent: 1,
    movingThreshold: 1.5
  };

  /* ================= UTIL ================= */

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    /* ================= HELPERS (FIXED) ================= */

  function formatCurrent(value) {
    const sign = value >= 0 ? "+" : "-";
    return `${sign}${Math.abs(value).toFixed(2)} A`;
  }

  function roundedRect(x, y, w, h, r) {
    const radius = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }


  /* ================= SLIDER API ================= */
  function setControl(v) {
    controlValue = clamp(v, -1, 1);
  }

  /* ================= RESIZE ================= */

  function resize() {
    const rect = canvas.getBoundingClientRect();
    state.width = rect.width;
    state.height = rect.height;

    canvas.width = Math.round(rect.width * state.dpr);
    canvas.height = Math.round(rect.height * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    layout.coilX = state.width * 0.23;
    layout.coilY = state.height * 0.52;
    layout.ammeterX = state.width * 0.6;
    layout.ammeterY = state.height * 0.26;
    layout.bulbX = state.width * 0.83;
    layout.bulbY = state.height * 0.26;
    layout.wireTopY = state.height * 0.26;
    layout.wireBottomY = state.height * 0.72;

    state.magnet.y = layout.coilY;

    const safeGap = layout.coilRadius + params.magnetHalfWidth + 16;
    params.magnetMin = layout.coilX + safeGap;
    params.magnetMax = state.width * 0.88;

    if (!state.magnet.x) state.magnet.x = params.magnetMax;
  }

  /* ================= RESET ================= */

  function reset() {
    state.magnet.x = params.magnetMax;
    state.magnet.v = 0;
    physics.fluxPrev = 0;
    physics.displayCurrent = 0;
    physics.needleCurrent = 0;
  }

  /* ================= PHYSICS ================= */

  function updatePhysics(dt) {
    const m = state.magnet;

    // 🔥 Slider-driven velocity
    m.v = controlValue * params.speed;

    m.x += m.v * dt;

    if (m.x <= params.magnetMin || m.x >= params.magnetMax) {
      m.x = clamp(m.x, params.magnetMin, params.magnetMax);
      m.v = 0;
    }

    const d = Math.abs(m.x - layout.coilX);
    const flux = params.fluxK / (d * d + params.fluxC);
    const dFlux = (flux - physics.fluxPrev) / Math.max(dt, 0.001);
    physics.fluxPrev = flux;

    physics.displayCurrent +=
      (params.currentGain * dFlux - physics.displayCurrent) *
      params.currentSmoothing;

    if (Math.abs(controlValue) < 0.05) {
      physics.displayCurrent *= params.restReturn;
    }

    physics.displayCurrent = clamp(
      physics.displayCurrent,
      -params.maxCurrent,
      params.maxCurrent
    );

    physics.needleCurrent +=
      (physics.displayCurrent - physics.needleCurrent) *
      params.needleSmoothing;
  }
  function drawBackground() {
  ctx.save();
  ctx.fillStyle = "#0b121b";
  ctx.fillRect(0, 0, state.width, state.height);
  ctx.restore();
}

function drawCircuit() {
  const wireColor = "rgba(200, 210, 225, 0.55)";
  const yTop = layout.wireTopY;
  const yBottom = layout.wireBottomY;

  const coilLeft = layout.coilX - layout.coilRadius - 14;
  const coilRight = layout.coilX + layout.coilRadius + 14;

  const amLeft = layout.ammeterX - layout.ammeterRadius - 16;
  const amRight = layout.ammeterX + layout.ammeterRadius + 16;

  const bulbLeft = layout.bulbX - layout.bulbRadius - 20;
  const bulbRight = layout.bulbX + layout.bulbRadius + 20;

  ctx.save();
  ctx.strokeStyle = wireColor;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";

  // Coil to top wire
  ctx.beginPath();
  ctx.moveTo(coilRight, layout.coilY);
  ctx.lineTo(coilRight, yTop);
  ctx.stroke();

  // Top run: coil -> ammeter -> bulb
  ctx.beginPath();
  ctx.moveTo(coilRight, yTop);
  ctx.lineTo(amLeft, yTop);
  ctx.lineTo(bulbLeft, yTop);
  ctx.lineTo(state.width - 70, yTop);
  ctx.stroke();

  // Ammeter drop and return up
  ctx.beginPath();
  ctx.moveTo(amLeft, yTop);
  ctx.lineTo(amLeft, layout.ammeterY);
  ctx.moveTo(amRight, layout.ammeterY);
  ctx.lineTo(amRight, yTop);
  ctx.stroke();

  // Bulb drop and return up
  ctx.beginPath();
  ctx.moveTo(bulbLeft, yTop);
  ctx.lineTo(bulbLeft, layout.bulbY + 10);
  ctx.moveTo(bulbRight, layout.bulbY + 10);
  ctx.lineTo(bulbRight, yTop);
  ctx.stroke();

  // Return wire back to coil
  ctx.beginPath();
  ctx.moveTo(state.width - 70, yTop);
  ctx.lineTo(state.width - 70, yBottom);
  ctx.lineTo(coilLeft, yBottom);
  ctx.lineTo(coilLeft, layout.coilY);
  ctx.stroke();

  ctx.restore();
}

function drawCoil() {
  const x = layout.coilX;
  const y = layout.coilY;
  const r = layout.coilRadius;

  ctx.save();

  // Base shadow ring
  ctx.strokeStyle = "rgba(90, 45, 15, 0.7)";
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();

  // Copper loops with gradient shading
  for (let i = 0; i < 6; i += 1) {
    const offset = (i - 2.5) * 6;
    const grad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
    grad.addColorStop(0, "#7d3c1b");
    grad.addColorStop(0.5, "#d98b4a");
    grad.addColorStop(1, "#4a2412");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 10;
    ctx.shadowColor = "rgba(255, 170, 90, 0.35)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x + offset, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Highlight edge
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255, 220, 170, 0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x - 3, y - 3, r, -0.2, Math.PI + 0.2);
  ctx.stroke();

  // Coil leads
  ctx.strokeStyle = "rgba(210, 150, 90, 0.9)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x - r - 10, y - 10);
  ctx.lineTo(x - r - 40, y - 10);
  ctx.moveTo(x - r - 10, y + 10);
  ctx.lineTo(x - r - 40, y + 10);
  ctx.stroke();

  ctx.restore();
}

function drawAmmeter() {
  const x = layout.ammeterX;
  const y = layout.ammeterY;
  const radius = layout.ammeterRadius;

  ctx.save();

  // Outer bezel
  const bezelGrad = ctx.createRadialGradient(x - 20, y - 20, 10, x, y, radius + 10);
  bezelGrad.addColorStop(0, "#f0f2f6");
  bezelGrad.addColorStop(0.55, "#aeb6c4");
  bezelGrad.addColorStop(1, "#5b6572");
  ctx.fillStyle = bezelGrad;
  ctx.beginPath();
  ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
  ctx.fill();

  // Inner face
  ctx.fillStyle = "rgba(15, 22, 30, 0.96)";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Glass highlight
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x - 8, y - 8, radius - 10, -0.2, Math.PI * 0.8);
  ctx.stroke();

  // Tick marks and numbers
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = 2;
  ctx.font = "12px 'Space Grotesk', Arial";
  ctx.textAlign = "center";

  const labels = [-1, -0.5, 0, 0.5, 1];
  labels.forEach((value, idx) => {
    const angle = (-Math.PI * 0.75) + idx * (Math.PI * 1.5 / 4);
    const inner = radius - 14;
    const outer = radius - 4;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
    ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
    ctx.stroke();

    const labelRadius = radius - 26;
    ctx.fillText(
      value.toFixed(1),
      x + Math.cos(angle) * labelRadius,
      y + Math.sin(angle) * labelRadius + 4
    );
  });

  // Needle shadow
  const clamped = clamp(physics.needleCurrent, -params.maxCurrent, params.maxCurrent);
  const needleAngle = (-Math.PI * 0.75) + (clamped + params.maxCurrent) * (Math.PI * 1.5 / (params.maxCurrent * 2));

  ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 2);
  ctx.lineTo(
    x + 2 + Math.cos(needleAngle) * (radius - 18),
    y + 2 + Math.sin(needleAngle) * (radius - 18)
  );
  ctx.stroke();

  // Needle
  ctx.strokeStyle = clamped >= 0 ? "#55e6a5" : "#ff7a7a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(
    x + Math.cos(needleAngle) * (radius - 20),
    y + Math.sin(needleAngle) * (radius - 20)
  );
  ctx.stroke();

  // Pivot cap
  ctx.fillStyle = "#d7dce6";
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();

  // Digital readout panel
  ctx.fillStyle = "rgba(10, 14, 20, 0.85)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1.5;
  roundedRect(x - 46, y + 36, 92, 26, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#cfd6de";
  ctx.font = "14px 'Space Grotesk', Arial";
  ctx.fillText(formatCurrent(physics.displayCurrent), x, y + 55);

  ctx.restore();
}

function drawBulb() {
  const x = layout.bulbX;
  const y = layout.bulbY;
  const bulbRadius = layout.bulbRadius;
  const moving = Math.abs(state.magnet.v) > params.movingThreshold;
  const glowStrength = clamp(Math.abs(physics.displayCurrent), 0, params.maxCurrent);
  const brightness = moving ? glowStrength : 0;

  ctx.save();

  if (brightness > 0) {
    const glow = ctx.createRadialGradient(x, y, 8, x, y, bulbRadius * 2.6);
    glow.addColorStop(0, `rgba(255, 220, 140, ${0.7 * brightness})`);
    glow.addColorStop(1, "rgba(255, 220, 140, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, bulbRadius * 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glass outline
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, bulbRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner glass shading
  const glassGrad = ctx.createRadialGradient(x - 6, y - 6, 4, x, y, bulbRadius);
  glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.12)");
  glassGrad.addColorStop(1, "rgba(255, 255, 255, 0.02)");
  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.arc(x, y, bulbRadius - 2, 0, Math.PI * 2);
  ctx.fill();

  // Filament
  ctx.strokeStyle = brightness > 0
    ? `rgba(255, 210, 120, ${0.6 + brightness * 0.7})`
    : "rgba(110, 110, 110, 0.8)";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 4);
  ctx.quadraticCurveTo(x, y - 6, x + 12, y + 4);
  ctx.stroke();

  // Base
  ctx.fillStyle = "rgba(140, 140, 150, 0.9)";
  ctx.fillRect(x - 14, y + bulbRadius - 2, 28, 12);

  ctx.restore();
}

 function drawMagnet() {
  const m = state.magnet;

  const width = params.magnetHalfWidth * 2;
  const height = 70;
  const half = width / 2;

  // Animate arrow phase
  fluxTime = (fluxTime + 0.015) % 1;

  ctx.save();
  ctx.translate(m.x, m.y);

  // Flip magnet visually when moving left
  if (m.v < 0) ctx.scale(-1, 1);

  /* ================= MAGNET BODY ================= */

  const grad = ctx.createLinearGradient(-half, 0, half, 0);
  grad.addColorStop(0, "#c93b3b");   // North
  grad.addColorStop(0.5, "#1c222b");
  grad.addColorStop(1, "#2b6cb0");   // South

  ctx.fillStyle = grad;
  ctx.fillRect(-half, -height / 2, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-half, -height / 2, width, height);

  // N / S labels
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("N", -half / 2, 6);
  ctx.fillText("S",  half / 2, 6);
  

  /* ================= INTERNAL FIELD (S → N) ================= */

  ctx.strokeStyle = "rgba(160,160,160,0.55)";
  ctx.fillStyle = "rgba(210,210,210,0.9)";
  ctx.lineWidth = 1.4;

  const lineCount = 6;
  const spacing = 10;

  for (let i = 0; i < lineCount; i++) {
    const y = (i - (lineCount - 1) / 2) * spacing;

    // Static internal field line
    ctx.beginPath();
    ctx.moveTo(half - 6, y);
    ctx.lineTo(-half + 6, y);
    ctx.stroke();

    // Moving arrow (S → N)
    const t = (fluxTime + i * 0.18) % 1;
    const ax = half - 12 - t * (width - 24);

    ctx.save();
    ctx.translate(ax, y);
    ctx.rotate(Math.PI); // reverse direction
    drawArrowHead(0, 0, 5);
    ctx.restore();
  }
  

  ctx.restore();
}


function drawFluxArrow(x0, y0, lift, spread, t, lower) {
  t = t % 1;

  // Parametric Bezier (consistent geometry)
  const p0 = { x: -params.magnetHalfWidth, y: y0 };
  const p1 = { x: -params.magnetHalfWidth - spread, y: lift };
  const p2 = { x: params.magnetHalfWidth + spread, y: lift };
  const p3 = { x: params.magnetHalfWidth, y: y0 };

  const x =
    Math.pow(1 - t, 3) * p0.x +
    3 * Math.pow(1 - t, 2) * t * p1.x +
    3 * (1 - t) * t * t * p2.x +
    Math.pow(t, 3) * p3.x;

  const y =
    Math.pow(1 - t, 3) * p0.y +
    3 * Math.pow(1 - t, 2) * t * p1.y +
    3 * (1 - t) * t * t * p2.y +
    Math.pow(t, 3) * p3.y;

  const dx = 3 * (p1.x - p0.x) * Math.pow(1 - t, 2)
           + 6 * (p2.x - p1.x) * (1 - t) * t
           + 3 * (p3.x - p2.x) * t * t;

  const dy = 3 * (p1.y - p0.y) * Math.pow(1 - t, 2)
           + 6 * (p2.y - p1.y) * (1 - t) * t
           + 3 * (p3.y - p2.y) * t * t;

  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  drawArrowHead(0, 0, 6);
 
  ctx.restore();
}

function drawArrowHead(x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - size, y - size * 0.6);
  ctx.lineTo(x - size, y + size * 0.6);
  ctx.closePath();
  ctx.fill();
}
function drawStraightPoleLines() {
  const cx = state.magnet.x;
  const cy = state.magnet.y;
  const half = params.magnetHalfWidth;

  const count = 10;
  const length = 50;      // outward reach
  const fan = 75;          // vertical spread
  const bend = -1;         // max curvature strength
  const decay = 3;       // 🔥 exponential falloff strength
  const originPad = 0.01;

  ctx.save();
  ctx.strokeStyle = "rgba(140,140,140,0.6)";
  ctx.fillStyle   = "rgba(140,140,140,0.9)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  for (let i = 0; i < count; i++) {
    const t = (i - (count - 1) / 2) / ((count - 1) / 2); // -1 → +1

    // ✅ negative exponential decay (−e)
    const k = Math.exp(-t  * decay);

    /* ========= RIGHT POLE ========= */

    const r0 = {
      x: cx + half + originPad,
      y: cy
    };

    // inward-first bend with −e decay
    const r1 = {
      x: cx + half - bend * k,
      y: cy + t * bend * k
    };

    const r2 = {
      x: cx + half + length,
      y: cy + t * fan
    };

    ctx.beginPath();
    ctx.moveTo(r0.x, r0.y);
    ctx.quadraticCurveTo(r1.x, r1.y, r2.x, r2.y);
    ctx.stroke();

    const aR = Math.atan2(r2.y - r1.y, r2.x - r1.x);
    ctx.save();
    ctx.translate(r2.x, r2.y);
    ctx.rotate(aR);
    drawArrowHead(0, 0, 6);
    ctx.restore();

    /* ========= LEFT POLE ========= */

    const l0 = {
      x: cx - half - originPad,
      y: cy
    };

    const l1 = {
      x: cx - half + bend * k,
      y: cy + t * bend * k
    };

    const l2 = {
      x: cx - half - length,
      y: cy + t * fan
    };

    ctx.beginPath();
    ctx.moveTo(l2.x, l2.y);
    ctx.quadraticCurveTo(l1.x, l1.y, l0.x, l0.y);
    ctx.stroke();

    const aL = Math.atan2(l0.y - l1.y, l0.x - l1.x);
    ctx.save();
    ctx.translate(l0.x, l0.y);
    ctx.rotate(aL);
    drawArrowHead(0, 0, 6);
    ctx.restore();
  }

  ctx.restore();
}






 function drawFieldLines() {
  const cx = state.magnet.x;
  const cy = state.magnet.y;
  const half = params.magnetHalfWidth;

  ctx.save();
  ctx.strokeStyle = "rgba(140,140,140,0.6)";
  ctx.fillStyle = "rgba(140,140,140,0.9)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  const loopCount = 5;
  const spacing = 22;

  // advance external arrow phase (slow & smooth)
  const arrowSpeed = 0.002;
  const phase = (performance.now() * arrowSpeed) % 1;

  // helper: draw moving arrow on bezier
  function drawMovingArrow(p0, p1, p2, p3, t) {
    const x =
      Math.pow(1 - t, 3) * p0.x +
      3 * Math.pow(1 - t, 2) * t * p1.x +
      3 * (1 - t) * t * t * p2.x +
      Math.pow(t, 3) * p3.x;

    const y =
      Math.pow(1 - t, 3) * p0.y +
      3 * Math.pow(1 - t, 2) * t * p1.y +
      3 * (1 - t) * t * t * p2.y +
      Math.pow(t, 3) * p3.y;

    const dx =
      3 * (p1.x - p0.x) * Math.pow(1 - t, 2) +
      6 * (p2.x - p1.x) * (1 - t) * t +
      3 * (p3.x - p2.x) * t * t;

    const dy =
      3 * (p1.y - p0.y) * Math.pow(1 - t, 2) +
      6 * (p2.y - p1.y) * (1 - t) * t +
      3 * (p3.y - p2.y) * t * t;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.atan2(dy, dx));
    drawArrowHead(0, 0, 6);
    ctx.restore();
  }

  for (let i = 1; i <= loopCount; i++) {
    const lift = i * spacing;
    const spread = half + 40 + i * 22;

    /* ========= TOP LOOP ========= */
    const topP0 = { x: cx - half, y: cy - 6 };
    const topP1 = { x: cx - spread, y: cy - lift };
    const topP2 = { x: cx + spread, y: cy - lift };
    const topP3 = { x: cx + half, y: cy - 6 };

    ctx.beginPath();
    ctx.moveTo(topP0.x, topP0.y);
    ctx.bezierCurveTo(
      topP1.x, topP1.y,
      topP2.x, topP2.y,
      topP3.x, topP3.y
    );
    ctx.stroke();

    drawMovingArrow(topP0, topP1, topP2, topP3, phase);

    /* ========= BOTTOM LOOP ========= */
    const botP0 = { x: cx - half, y: cy + 6 };
    const botP1 = { x: cx - spread, y: cy + lift };
    const botP2 = { x: cx + spread, y: cy + lift };
    const botP3 = { x: cx + half, y: cy + 6 };

    ctx.beginPath();
    ctx.moveTo(botP0.x, botP0.y);
    ctx.bezierCurveTo(
      botP1.x, botP1.y,
      botP2.x, botP2.y,
      botP3.x, botP3.y
    );
    ctx.stroke();

    drawMovingArrow(botP0, botP1, botP2, botP3, phase);
       drawStraightPoleLines();
  }

  ctx.restore();
}



function drawUIOverlay() {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(36, 40, 240, 52);

  ctx.fillStyle = "#cfd6de";
  ctx.font = "14px 'Space Grotesk', Arial";
  ctx.textAlign = "left";
  ctx.fillText("Induced Current", 50, 62);
  ctx.fillStyle = "#9eb0c4";
  ctx.fillText("Flux change drives the needle", 50, 82);

  ctx.restore();
}

  /* ================= DRAW (UNCHANGED) ================= */
  // ✅ ALL your drawBackground, drawCircuit, drawCoil,
  // drawAmmeter, drawBulb, drawMagnet, drawFieldLines,
  // drawFluxArrow, drawArrowHead stay EXACTLY SAME

  /* ================= LOOP ================= */

  function draw() {
    drawBackground();
    drawFieldLines();
    drawCircuit();
    drawCoil();
    drawAmmeter();
    drawBulb();
    drawMagnet();
    drawUIOverlay();
  }

  function animate(t) {
    const dt = Math.min((t - state.lastTime) / 1000, 0.033) || 0.016;
    state.lastTime = t;

    fluxTime = (fluxTime + 0.015) % 1;
    updatePhysics(dt);
    draw();

    raf = requestAnimationFrame(animate);
  }

  /* ================= START ================= */

  let raf;
  resize();
  reset();
  window.addEventListener("resize", resize);
  raf = requestAnimationFrame(animate);

  /* ================= CLEANUP ================= */

  return {
    stop() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    },
    setControl // 🔥 expose slider hook
  };
}
