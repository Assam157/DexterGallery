import React, { useState } from "react";
import "./OrbitalExcitationExperiment.css";

// Aufbau display order (as in your image)
const subshells = [
  { n: 1, label: "1s", boxes: 1 },
  { n: 2, label: "2s", boxes: 1 },
  { n: 2, label: "2p", boxes: 3 },
  { n: 3, label: "3s", boxes: 1 },
  { n: 3, label: "3p", boxes: 3 },
  { n: 3, label: "3d", boxes: 5 },
  { n: 4, label: "4s", boxes: 1 },
  { n: 4, label: "4p", boxes: 3 },
  { n: 4, label: "4d", boxes: 5 },
  { n: 4, label: "4f", boxes: 7 },
  { n: 5, label: "5s", boxes: 1 },
  { n: 5, label: "5p", boxes: 3 },
  { n: 5, label: "5d", boxes: 5 },
  { n: 6, label: "6s", boxes: 1 },
  { n: 6, label: "6p", boxes: 3 }
];

// initialize empty boxes
const initialState = subshells.map(s =>
  Array.from({ length: s.boxes }, () => [])
);

export default function OrbitalBoxesExperiment() {
  const [state, setState] = useState(initialState);

  const applyExcitation = () => {
    setState(prev => {
      const next = prev.map(row => row.map(box => [...box]));

      for (let i = 0; i < next.length; i++) {
        for (let j = 0; j < next[i].length; j++) {
          if (next[i][j].length === 0) {
            next[i][j].push("up");
            return next;
          }
          if (next[i][j].length === 1) {
            next[i][j].push("down");
            return next;
          }
        }
      }
      return next;
    });
  };

  const reset = () => setState(initialState);

  return (
    <div className="experiment">
      <h2>Orbital Boxes (Aufbau Filling – Exact Rule)</h2>

      <div className="orbital-table">
        {subshells.map((s, i) => (
          <div key={i} className="orbital-row">
            <div className="n-label">n = {s.n}</div>
            <div className="orbital-label">{s.label}</div>

            <div className="box-row">
              {state[i].map((box, j) => (
                <div key={j} className="orbital-box">
                  {box.map((e, k) => (
                    <span key={k} className={`electron ${e}`}>
                      {e === "up" ? "↑" : "↓"}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="controls">
        <button onClick={applyExcitation}>Apply Excitation</button>
        <button onClick={reset} className="reset">Reset</button>
      </div>
    </div>
  );
}
