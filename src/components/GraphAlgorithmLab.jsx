import React, { useState, useEffect, useRef, useCallback } from "react";
import "./CommonCScss.css";

const GraphAlgorithmLab = () => {
  const [activeModule, setActiveModule] = useState("pathfinding");
  const [activeControlIndex, setActiveControlIndex] = useState(0);
  
  // Graph State
  const [nodes, setNodes] = useState([
    { id: 0, x: 100, y: 200, label: "A" },
    { id: 1, x: 250, y: 100, label: "B" },
    { id: 2, x: 400, y: 200, label: "C" },
    { id: 3, x: 250, y: 300, label: "D" },
    { id: 4, x: 500, y: 300, label: "E" }
  ]);
  const [edges, setEdges] = useState([
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 3, weight: 2 },
    { from: 1, to: 2, weight: 3 },
    { from: 1, to: 3, weight: 1 },
    { from: 2, to: 4, weight: 5 },
    { from: 3, to: 4, weight: 6 }
  ]);
  const [startNode, setStartNode] = useState(0);
  const [endNode, setEndNode] = useState(4);
  const [pathResult, setPathResult] = useState([]);
  const [distanceResult, setDistanceResult] = useState(null);
  const [visitedNodes, setVisitedNodes] = useState([]);
  
  // FSM State
  const [fsmStates, setFsmStates] = useState([
    { id: 0, name: "q0", x: 100, y: 200, isInitial: true, isFinal: false },
    { id: 1, name: "q1", x: 300, y: 150, isInitial: false, isFinal: false },
    { id: 2, name: "q2", x: 500, y: 200, isInitial: false, isFinal: true }
  ]);
  const [fsmTransitions, setFsmTransitions] = useState([
    { from: 0, to: 1, symbol: "0" },
    { from: 0, to: 2, symbol: "1" },
    { from: 1, to: 1, symbol: "0" },
    { from: 1, to: 2, symbol: "1" },
    { from: 2, to: 2, symbol: "0,1" }
  ]);
  const [inputString, setInputString] = useState("");
  const [fsmResult, setFsmResult] = useState(null);
  
  const canvasRef = useRef(null);
  const fsmCanvasRef = useRef(null);
  const width = 600;
  const height = 400;
  
  const controlsRef = useRef([]);
  
  // Dijkstra's Algorithm
  const dijkstra = () => {
    const distances = new Array(nodes.length).fill(Infinity);
    const previous = new Array(nodes.length).fill(-1);
    const visited = new Array(nodes.length).fill(false);
    distances[startNode] = 0;
    
    for (let i = 0; i < nodes.length; i++) {
      let minDist = Infinity;
      let minIndex = -1;
      for (let j = 0; j < nodes.length; j++) {
        if (!visited[j] && distances[j] < minDist) {
          minDist = distances[j];
          minIndex = j;
        }
      }
      if (minIndex === -1) break;
      visited[minIndex] = true;
      
      const neighbors = edges.filter(e => e.from === minIndex || e.to === minIndex);
      for (const edge of neighbors) {
        const neighbor = edge.from === minIndex ? edge.to : edge.from;
        const weight = edge.weight;
        if (!visited[neighbor] && distances[minIndex] + weight < distances[neighbor]) {
          distances[neighbor] = distances[minIndex] + weight;
          previous[neighbor] = minIndex;
        }
      }
    }
    
    // Reconstruct path
    const path = [];
    let current = endNode;
    while (current !== -1) {
      path.unshift(current);
      current = previous[current];
    }
    
    setPathResult(path);
    setDistanceResult(distances[endNode]);
    setVisitedNodes(visited.map((v, i) => v ? i : -1).filter(v => v !== -1));
  };
  
  // Draw Graph
  const drawGraph = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    
    // Draw edges
    ctx.strokeStyle = "#4d9eff";
    ctx.lineWidth = 2;
    edges.forEach(edge => {
      const fromNode = nodes[edge.from];
      const toNode = nodes[edge.to];
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.stroke();
      
      // Draw weight
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      ctx.fillStyle = "#ffd966";
      ctx.font = "12px monospace";
      ctx.fillText(edge.weight, midX, midY - 5);
    });
    
    // Draw nodes
    nodes.forEach(node => {
      const isStart = node.id === startNode;
      const isEnd = node.id === endNode;
      const isVisited = visitedNodes.includes(node.id);
      const isPath = pathResult.includes(node.id);
      
      ctx.fillStyle = isPath ? "#88ff88" : isStart ? "#4dff4d" : isEnd ? "#ff6666" : isVisited ? "#ffaa66" : "#4d9eff";
      ctx.beginPath();
      ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px monospace";
      ctx.fillText(node.label, node.x - 8, node.y + 6);
    });
    
    if (distanceResult !== null) {
      ctx.fillStyle = "#ffd966";
      ctx.font = "14px monospace";
      ctx.fillText(`Shortest distance: ${distanceResult}`, 20, 30);
      ctx.fillText(`Path: ${pathResult.map(i => nodes[i].label).join(" → ")}`, 20, 55);
    }
  }, [nodes, edges, startNode, endNode, pathResult, visitedNodes, distanceResult, width, height]);
  
  // Draw FSM
  const drawFSM = useCallback(() => {
    const ctx = fsmCanvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    
    // Draw transitions
    ctx.strokeStyle = "#4d9eff";
    ctx.lineWidth = 2;
    fsmTransitions.forEach(trans => {
      const fromState = fsmStates[trans.from];
      const toState = fsmStates[trans.to];
      ctx.beginPath();
      ctx.moveTo(fromState.x, fromState.y);
      ctx.lineTo(toState.x, toState.y);
      ctx.stroke();
      
      const midX = (fromState.x + toState.x) / 2;
      const midY = (fromState.y + toState.y) / 2;
      ctx.fillStyle = "#ffd966";
      ctx.font = "12px monospace";
      ctx.fillText(trans.symbol, midX, midY - 5);
    });
    
    // Draw states
    fsmStates.forEach(state => {
      ctx.fillStyle = state.isFinal ? "#ffaa66" : "#4d9eff";
      ctx.beginPath();
      ctx.arc(state.x, state.y, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      if (state.isInitial) {
        ctx.beginPath();
        ctx.moveTo(state.x - 40, state.y);
        ctx.lineTo(state.x - 20, state.y);
        ctx.lineTo(state.x - 20, state.y - 8);
        ctx.fill();
      }
      
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px monospace";
      ctx.fillText(state.name, state.x - 12, state.y + 5);
    });
    
    if (fsmResult !== null) {
      ctx.fillStyle = fsmResult.accepted ? "#88ff88" : "#ff8888";
      ctx.font = "bold 14px monospace";
      ctx.fillText(fsmResult.message, 20, 30);
    }
  }, [fsmStates, fsmTransitions, fsmResult, width, height]);
  
  const runFSM = () => {
    let currentState = fsmStates.find(s => s.isInitial).id;
    let accepted = true;
    
    for (const char of inputString) {
      const transition = fsmTransitions.find(t => t.from === currentState && t.symbol.includes(char));
      if (!transition) {
        accepted = false;
        break;
      }
      currentState = transition.to;
    }
    
    const finalState = fsmStates.find(s => s.id === currentState);
    setFsmResult({
      accepted: accepted && finalState?.isFinal,
      message: accepted && finalState?.isFinal ? `✅ String "${inputString}" is accepted!` : `❌ String "${inputString}" is rejected`
    });
  };
  
  useEffect(() => {
    if (activeModule === "pathfinding") drawGraph();
    if (activeModule === "fsm") drawFSM();
  }, [drawGraph, drawFSM, activeModule, pathResult, visitedNodes, distanceResult, fsmResult]);
  
  // Build controls
  useEffect(() => {
    const controls = [];
    
    const startSelect = document.getElementById('startSelect');
    const endSelect = document.getElementById('endSelect');
    const runBtn = document.getElementById('runBtn');
    const resetBtn = document.getElementById('resetBtn');
    const fsmInput = document.getElementById('fsmInput');
    const fsmRunBtn = document.getElementById('fsmRunBtn');
    
    if (activeModule === "pathfinding") {
      if (startSelect) controls.push({ id: 'startSelect', element: startSelect, type: 'select' });
      if (endSelect) controls.push({ id: 'endSelect', element: endSelect, type: 'select' });
      if (runBtn) controls.push({ id: 'runBtn', element: runBtn, type: 'button' });
      if (resetBtn) controls.push({ id: 'resetBtn', element: resetBtn, type: 'button' });
    } else {
      if (fsmInput) controls.push({ id: 'fsmInput', element: fsmInput, type: 'input' });
      if (fsmRunBtn) controls.push({ id: 'fsmRunBtn', element: fsmRunBtn, type: 'button' });
    }
    
    controlsRef.current = controls;
    if (activeControlIndex >= controls.length) setActiveControlIndex(0);
    
    controls.forEach((c, i) => {
      if (c.element) {
        if (i === activeControlIndex) c.element.classList.add('active-button');
        else c.element.classList.remove('active-button');
      }
    });
  }, [activeModule, activeControlIndex]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['q', 'e', 'a', 'd', 'h', '1', '2'].includes(key)) e.preventDefault();
      
      if (key === '1') setActiveModule('pathfinding');
      if (key === '2') setActiveModule('fsm');
      
      if (key === 'q') setActiveControlIndex(prev => (prev - 1 + controlsRef.current.length) % Math.max(controlsRef.current.length, 1));
      if (key === 'e') setActiveControlIndex(prev => (prev + 1) % Math.max(controlsRef.current.length, 1));
      
      if (key === 'h') {
        const active = controlsRef.current[activeControlIndex];
        if (active?.element?.click) active.element.click();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeControlIndex]);
  
  const resetPathfinding = () => {
    setPathResult([]);
    setDistanceResult(null);
    setVisitedNodes([]);
  };
  
  return (
    <div className="cs-lab-container">
      <div className="cs-card">
        <div className="cs-header">
          <h1>📊 GRAPH ALGORITHM LAB</h1>
          <div className="cs-tabs">
            <button className={`cs-tab ${activeModule === 'pathfinding' ? 'active' : ''}`} onClick={() => setActiveModule('pathfinding')}>🛣️ Pathfinding</button>
            <button className={`cs-tab ${activeModule === 'fsm' ? 'active' : ''}`} onClick={() => setActiveModule('fsm')}>🔁 Finite State Machine</button>
          </div>
        </div>
        
        <div className="cs-content">
          {activeModule === "pathfinding" && (
            <div className="cs-module">
              <canvas ref={canvasRef} width={width} height={height} className="cs-canvas" />
              <div className="cs-controls">
                <select id="startSelect" value={startNode} onChange={(e) => setStartNode(parseInt(e.target.value))}>
                  {nodes.map(node => <option key={node.id} value={node.id}>Start: {node.label}</option>)}
                </select>
                <select id="endSelect" value={endNode} onChange={(e) => setEndNode(parseInt(e.target.value))}>
                  {nodes.map(node => <option key={node.id} value={node.id}>End: {node.label}</option>)}
                </select>
                <button id="runBtn" onClick={dijkstra}>🚀 Run Dijkstra</button>
                <button id="resetBtn" onClick={resetPathfinding}>🔄 Reset</button>
                <div className="keyboard-hint"><kbd>Q/E</kbd> Cycle · <kbd>H</kbd> Click</div>
              </div>
            </div>
          )}
          
          {activeModule === "fsm" && (
            <div className="cs-module">
              <canvas ref={fsmCanvasRef} width={width} height={height} className="cs-canvas" />
              <div className="cs-controls">
                <div className="fsm-info">
                  <p>States: {fsmStates.map(s => `${s.name}${s.isFinal ? ' (final)' : ''}${s.isInitial ? ' (initial)' : ''}`).join(", ")}</p>
                  <p>Transitions: {fsmTransitions.map(t => `${fsmStates[t.from].name}→${fsmStates[t.to].name}:${t.symbol}`).join(", ")}</p>
                </div>
                <div className="fsm-input">
                  <input id="fsmInput" type="text" placeholder="Enter string (e.g., 0101)" value={inputString} onChange={(e) => setInputString(e.target.value)} />
                  <button id="fsmRunBtn" onClick={runFSM}>▶ Run</button>
                </div>
                <div className="keyboard-hint"><kbd>Q/E</kbd> Cycle · <kbd>H</kbd> Click</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="cs-footer"><div className="key-hint"><kbd>1/2</kbd> Modules · <kbd>Q/E</kbd> Cycle · <kbd>H</kbd> Click</div></div>
      </div>
    </div>
  );
};

export default GraphAlgorithmLab;