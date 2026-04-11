import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VectorAdditionLab from "./VectorAdditionLab";
import AlgebraLab from "./Algebralab";
import TrigonometryLab from "./TrigonometryLab";
import GeometryLab from "./GeometryLab";
import CalculusLab from "./CalculasLab";
import StatisticsLab from "./StatisticsLab";
import "./MathematicsLab.css";

export default function MathematicsLab() {
  const navigate = useNavigate();
  const [activeExperiment, setActiveExperiment] = useState("vector");

  const experiments = [
    { id: "vector", name: "📐 Vector Addition", icon: "➡️", description: "Learn vector addition in 1D and 2D" },
    { id: "algebra", name: "🧮 Algebra Lab", icon: "✖️", description: "Linear equations, matrices, and graphing" },
    { id: "trigonometry", name: "🔺 Trigonometry", icon: "📐", description: "Unit circle, graphs, and identities" },
    { id: "geometry", name: "🔷 Geometry", icon: "⬜", description: "Shapes, transformations, and theorems" },
    { id: "calculus", name: "📈 Calculus", icon: "∫", description: "Derivatives and integrals" },
    { id: "statistics", name: "📊 Statistics", icon: "📈", description: "Mean, median, probability" }
  ];

  return (
    <div className="math-lab-root">
      <div className="math-left-panel">
        <div className="math-panel-header">
          <h2>📐 MATHEMATICS LAB</h2>
          <div className="math-lab-badge">Interactive Learning</div>
        </div>
        <div className="math-experiment-list">
          {experiments.map((exp) => (
            <button key={exp.id} className={`math-exp-btn ${activeExperiment === exp.id ? "active" : ""}`} onClick={() => setActiveExperiment(exp.id)}>
              <span className="exp-icon">{exp.icon}</span>
              <div className="exp-info"><span className="exp-name">{exp.name}</span><span className="exp-desc">{exp.description}</span></div>
            </button>
          ))}
        </div>
        <div className="math-panel-footer">
          <div className="keyboard-shortcuts">
            <div className="shortcut-title">🎮 Keyboard Controls</div>
            <div className="shortcut-item"><kbd>Q/E</kbd> Cycle controls</div><div className="shortcut-item"><kbd>A/D</kbd> Adjust values</div>
            <div className="shortcut-item"><kbd>H</kbd> Simulate click</div><div className="shortcut-item"><kbd>1/2/3</kbd> Switch screens</div>
          </div>
          <button className="back-btn" onClick={() => navigate("/")}>← BACK TO DEXTER'S LAB</button>
        </div>
      </div>
      <div className="math-content-area">
        <div className="math-canvas-container">
          {activeExperiment === "vector" && <VectorAdditionLab />}
          {activeExperiment === "algebra" && <AlgebraLab />}
          {activeExperiment === "trigonometry" && <TrigonometryLab />}
          {activeExperiment === "geometry" && <GeometryLab />}
          {activeExperiment === "calculus" && <CalculusLab />}
          {activeExperiment === "statistics" && <StatisticsLab />}
        </div>
      </div>
    </div>
  );
}