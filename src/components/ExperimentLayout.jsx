// src/components/ExperimentLayout.jsx
import React, { useState } from "react";
import "./ExperimentLayout.css";

export default function ExperimentLayout({
  title,
  description,
  children
}) {
  const [learningMode, setLearningMode] = useState(false);

  return (
    <div className="experiment-root">
      {/* Header */}
      <header className="experiment-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <button
          className={`learn-btn ${learningMode ? "active" : ""}`}
          onClick={() => setLearningMode(v => !v)}
        >
          📘 Learning Mode
        </button>
      </header>

      {/* Main content */}
      <div className="experiment-body">{children}</div>

      {/* Learning Overlay */}
      {learningMode && (
        <div className="learning-overlay">
          <div className="learning-card">
            <h3>How to Use This Experiment</h3>
            <ol>
              <li>Adjust the sliders on the right</li>
              <li>Observe changes in the simulation</li>
              <li>Identify cause → effect visually</li>
            </ol>
            <button onClick={() => setLearningMode(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
