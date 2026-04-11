import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SortingAlgorithmLab from "./SortingAlgorithmLab.jsx";
import GraphAlgorithmLab from "./GraphAlgorithmLab.jsx";
import StateMachineLab from "./StateMachineLab";
import CompilerExplorerLab from "./CompilerExplorerLab";
import "./CSLab.css";

export default function CSLab() {
  const navigate = useNavigate();
  const [activeExperiment, setActiveExperiment] = useState("sorting");

  const experiments = [
    { 
      id: "sorting", 
      name: "🔄 Sorting Visualizer", 
      icon: "🔄", 
      description: "Bubble, Selection, Quick Sort algorithms with real-time animation",
      color: "#ff6b6b"
    },
    { 
      id: "graph", 
      name: "📊 Graph Algorithms", 
      icon: "🕸️", 
      description: "Dijkstra's pathfinding, weighted graphs & FSM simulation",
      color: "#4d9eff"
    },
    { 
      id: "statemachine", 
      name: "🔁 State Machine Lab", 
      icon: "⚙️", 
      description: "Design finite state machines & test regular expressions",
      color: "#88ff88"
    },
    { 
      id: "compiler", 
      name: "📝 Compiler Explorer", 
      icon: "🔍", 
      description: "AST Viewer, Lexical analyzer & token visualization",
      color: "#ffaa66"
    }
  ];

  return (
    <div className="cs-lab-global-root">
      {/* LEFT PANEL */}
      <div className="cs-lab-global-left-panel">
        <div className="cs-lab-global-header">
          <h2>💻 COMPUTER SCIENCE LAB</h2>
          <div className="cs-lab-global-badge">Algorithms & Theory</div>
        </div>

        <div className="cs-lab-experiment-list">
          {experiments.map((exp) => (
            <button
              key={exp.id}
              className={`cs-lab-exp-btn ${activeExperiment === exp.id ? "active" : ""}`}
              onClick={() => setActiveExperiment(exp.id)}
              style={{
                borderLeftColor: exp.color,
                background: activeExperiment === exp.id ? `${exp.color}20` : ""
              }}
            >
              <span className="cs-lab-exp-icon" style={{ color: exp.color }}>{exp.icon}</span>
              <div className="cs-lab-exp-info">
                <span className="cs-lab-exp-name">{exp.name}</span>
                <span className="cs-lab-exp-desc">{exp.description}</span>
              </div>
              {activeExperiment === exp.id && <span className="cs-lab-active-indicator">▶</span>}
            </button>
          ))}
        </div>

        <div className="cs-lab-global-footer">
          <div className="cs-lab-keyboard-shortcuts">
            <div className="cs-lab-shortcut-title">🎮 Keyboard Controls</div>
            <div className="cs-lab-shortcut-item"><kbd>Q/E</kbd> Cycle controls</div>
            <div className="cs-lab-shortcut-item"><kbd>A/D</kbd> Adjust values</div>
            <div className="cs-lab-shortcut-item"><kbd>H</kbd> Simulate click</div>
            <div className="cs-lab-shortcut-item"><kbd>1/2/3/4</kbd> Switch labs</div>
          </div>
          
          <button className="cs-lab-back-btn" onClick={() => navigate("/")}>
            ← BACK TO DEXTER'S LAB
          </button>
        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="cs-lab-global-content-area">
        <div className="cs-lab-global-canvas-container">
          {activeExperiment === "sorting" && <SortingAlgorithmLab />}
          {activeExperiment === "graph" && <GraphAlgorithmLab />}
          {activeExperiment === "statemachine" && <StateMachineLab />}
          {activeExperiment === "compiler" && <CompilerExplorerLab />}
        </div>
      </div>
    </div>
  );
}