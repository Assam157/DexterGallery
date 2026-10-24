import React from "react";

import AntennaCanvas, {
  setup,
  line,
  circle,
  label,
} from "./AntennaCanvas";

export default function DipoleAntenna({
  frequency,
  length,
  power,
  paused,
}) {
  const draw = (ctx, time) => {
    setup(
      ctx,
      "HALF-WAVE DIPOLE",
      "Current distribution · illustrative visualization"
    );

    const cx = 380;
    const cy = 245;

    const halfLength = Math.min(
      150,
      35 + length * 36
    );

    // Upper conductor
    line(
      ctx,
      cx,
      cy - halfLength,
      cx,
      cy - 5,
      "#d8e9f0",
      7
    );

    // Lower conductor
    line(
      ctx,
      cx,
      cy + 5,
      cx,
      cy + halfLength,
      "#d8e9f0",
      7
    );

    // Feed point
    circle(ctx, cx, cy, 7, "#ffca65", true);

    line(
      ctx,
      cx - 45,
      cy,
      cx + 45,
      cy,
      "#ffca65",
      2
    );

    // Animated current visualization
    for (let i = 0; i <= 28; i++) {
      const y =
        cy - halfLength +
        i * (2 * halfLength / 28);

      const normalizedPosition =
        Math.sin(Math.PI * i / 28);

      const current =
        normalizedPosition *
        Math.sin(time * 5 - i * 0.16) *
        power / 100;

      line(
        ctx,
        cx - current * 36,
        y,
        cx + current * 36,
        y,
        "#24e7ff",
        2
      );
    }

    // Expanding field rings
    for (let i = 0; i < 5; i++) {
      const radius =
        35 + i * 28 + ((time * 22) % 28);

      circle(
        ctx,
        cx,
        cy,
        radius,
        "rgba(40, 220, 255, 0.32)"
      );
    }

    label(
      ctx,
      `Frequency: ${frequency} MHz`,
      28,
      420
    );

    label(
      ctx,
      `Wavelength: ${(300 / frequency).toFixed(2)} m`,
      28,
      443
    );

    label(
      ctx,
      `Antenna length: ${length.toFixed(2)} m`,
      28,
      466
    );

    label(
      ctx,
      "FEED",
      cx + 15,
      cy - 8,
      "#ffca65"
    );
  };

  return (
    <div className="antenna-view">

      <AntennaCanvas
        draw={draw}
        paused={paused}
      />

      <div className="antenna-stat-row">
        <span>Driven element</span>

        <strong>{length.toFixed(2)} m</strong>

        <span>Relative drive</span>

        <strong>{power}%</strong>
      </div>

    </div>
  );
} 