import React, { useState, useEffect, useRef, useCallback } from "react";
import "./CommonCScss.css";

const StateMachineLab = () => {
  const [activeModule, setActiveModule] = useState("designer");
  const [activeControlIndex, setActiveControlIndex] = useState(0);
  
  // State Designer
  const [states, setStates] = useState([
    { id: 0, name: "q0", x: 150, y: 200, isInitial: true, isFinal: false },
    { id: 1, name: "q1", x: 350, y: 150, isInitial: false, isFinal: false },
    { id: 2, name: "q2", x: 550, y: 200, isInitial: false, isFinal: true }
  ]);
  const [transitions, setTransitions] = useState([
    { from: 0, to: 1, symbol: "0" },
    { from: 0, to: 2, symbol: "1" },
    { from: 1, to: 1, symbol: "0" },
    { from: 1, to: 2, symbol: "1" }
  ]);
  const [selectedState, setSelectedState] = useState(null);
  const [newStateName, setNewStateName] = useState("");
  
  // Regular Expression
  const [regex, setRegex] = useState("a*b+");
  const [testString, setTestString] = useState("");
  const [regexResult, setRegexResult] = useState(null);
  
  const canvasRef = useRef(null);
  const regexCanvasRef = useRef(null);
  const width = 600;
  const height = 400;
  
  const controlsRef = useRef([]);
  
  // Draw State Machine
  const drawStateMachine = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    
    // Draw transitions
    ctx.strokeStyle = "#4d9eff";
    ctx.lineWidth = 2;
    transitions.forEach(trans => {
      const fromState = states[trans.from];
      const toState = states[trans.to];
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
    states.forEach(state => {
      ctx.fillStyle = state.isFinal ? "#ffaa66" : "#4d9eff";
      ctx.beginPath();
      ctx.arc(state.x, state.y, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = selectedState === state.id ? "#ffd966" : "#fff";
      ctx.lineWidth = selectedState === state.id ? 4 : 2;
      ctx.stroke();
      
      if (state.isInitial) {
        ctx.beginPath();
        ctx.moveTo(state.x - 45, state.y);
        ctx.lineTo(state.x - 30, state.y);
        ctx.lineTo(state.x - 30, state.y - 8);
        ctx.fill();
      }
      
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px monospace";
      ctx.fillText(state.name, state.x - 12, state.y + 5);
    });
  }, [states, transitions, selectedState, width, height]);
  
  // Draw Regex NFA
  const drawRegex = useCallback(() => {
    const ctx = regexCanvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    
    ctx.fillStyle = "#ffd966";
    ctx.font = "14px monospace";
    ctx.fillText(`Regular Expression: ${regex}`, 20, 50);
    
    if (regexResult !== null) {
      ctx.fillStyle = regexResult.matches ? "#88ff88" : "#ff8888";
      ctx.font = "bold 14px monospace";
      ctx.fillText(regexResult.message, 20, 100);
    }
    
    // Draw NFA diagram
    const startX = 100;
    const startY = 250;
    const endX = 500;
    const endY = 250;
    
    ctx.fillStyle = "#4d9eff";
    ctx.beginPath();
    ctx.arc(startX, startY, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText("Start", startX - 15, startY + 5);
    
    ctx.beginPath();
    ctx.moveTo(startX + 25, startY);
    ctx.lineTo(endX - 25, endY);
    ctx.stroke();
    
    // Draw nodes for each character in regex
    const chars = regex.split('');
    const step = (endX - startX) / (chars.length + 1);
    chars.forEach((char, i) => {
      const x = startX + step * (i + 1);
      ctx.fillStyle = "#4d9eff";
      ctx.beginPath();
      ctx.arc(x, startY, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText(char, x - 8, startY + 5);
      
      if (i < chars.length - 1) {
        ctx.beginPath();
        ctx.moveTo(x + 25, startY);
        ctx.lineTo(x + step, startY);
        ctx.stroke();
      }
    });
    
    ctx.fillStyle = "#ffaa66";
    ctx.beginPath();
    ctx.arc(endX, endY, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText("Accept", endX - 15, endY + 5);
  }, [regex, regexResult, width, height]);
  
  const addState = () => {
    const newId = states.length;
    setStates([...states, {
      id: newId,
      name: newStateName || `q${newId}`,
      x: 100 + (newId * 80),
      y: 200 + (newId % 3) * 50,
      isInitial: false,
      isFinal: false
    }]);
    setNewStateName("");
  };
  
  const toggleFinal = () => {
    if (selectedState !== null) {
      setStates(states.map(s => s.id === selectedState ? { ...s, isFinal: !s.isFinal } : s));
    }
  };
  
  const testRegex = () => {
    try {
      const regexObj = new RegExp(`^${regex}$`);
      const matches = regexObj.test(testString);
      setRegexResult({
        matches,
        message: matches ? `✅ "${testString}" matches the pattern!` : `❌ "${testString}" does not match`
      });
    } catch (e) {
      setRegexResult({ matches: false, message: `Invalid regular expression: ${e.message}` });
    }
  };
  
  useEffect(() => {
    if (activeModule === "designer") drawStateMachine();
    if (activeModule === "regex") drawRegex();
  }, [drawStateMachine, drawRegex, activeModule]);
  
  // Build controls
  useEffect(() => {
    const controls = [];
    
    const stateNameInput = document.getElementById('stateNameInput');
    const addStateBtn = document.getElementById('addStateBtn');
    const toggleFinalBtn = document.getElementById('toggleFinalBtn');
    const regexInput = document.getElementById('regexInput');
    const testStringInput = document.getElementById('testStringInput');
    const testRegexBtn = document.getElementById('testRegexBtn');
    
    if (activeModule === "designer") {
      if (stateNameInput) controls.push({ id: 'stateNameInput', element: stateNameInput, type: 'input' });
      if (addStateBtn) controls.push({ id: 'addStateBtn', element: addStateBtn, type: 'button' });
      if (toggleFinalBtn) controls.push({ id: 'toggleFinalBtn', element: toggleFinalBtn, type: 'button' });
    } else {
      if (regexInput) controls.push({ id: 'regexInput', element: regexInput, type: 'input' });
      if (testStringInput) controls.push({ id: 'testStringInput', element: testStringInput, type: 'input' });
      if (testRegexBtn) controls.push({ id: 'testRegexBtn', element: testRegexBtn, type: 'button' });
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
      
      if (key === '1') setActiveModule('designer');
      if (key === '2') setActiveModule('regex');
      
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
  
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    for (const state of states) {
      const dx = mouseX - state.x;
      const dy = mouseY - state.y;
      if (Math.hypot(dx, dy) < 30) {
        setSelectedState(state.id);
        break;
      }
    }
  };
  
  return (
    <div className="cs-lab-container">
      <div className="cs-card">
        <div className="cs-header">
          <h1>🔁 STATE MACHINE LAB</h1>
          <div className="cs-tabs">
            <button className={`cs-tab ${activeModule === 'designer' ? 'active' : ''}`} onClick={() => setActiveModule('designer')}>🎨 State Designer</button>
            <button className={`cs-tab ${activeModule === 'regex' ? 'active' : ''}`} onClick={() => setActiveModule('regex')}>📝 Regular Expressions</button>
          </div>
        </div>
        
        <div className="cs-content">
          {activeModule === "designer" && (
            <div className="cs-module">
              <canvas ref={canvasRef} width={width} height={height} className="cs-canvas" onClick={handleCanvasClick} />
              <div className="cs-controls">
                <input id="stateNameInput" type="text" placeholder="State name" value={newStateName} onChange={(e) => setNewStateName(e.target.value)} />
                <button id="addStateBtn" onClick={addState}>➕ Add State</button>
                <button id="toggleFinalBtn" onClick={toggleFinal} disabled={selectedState === null}>
                  {selectedState !== null && states[selectedState]?.isFinal ? "⭐ Make Non-Final" : "🎯 Make Final"}
                </button>
                {selectedState !== null && <div className="info">Selected: {states[selectedState]?.name}</div>}
                <div className="keyboard-hint"><kbd>Q/E</kbd> Cycle · <kbd>H</kbd> Click · Click on states to select</div>
              </div>
            </div>
          )}
          
          {activeModule === "regex" && (
            <div className="cs-module">
              <canvas ref={regexCanvasRef} width={width} height={height} className="cs-canvas" />
              <div className="cs-controls">
                <input id="regexInput" type="text" placeholder="Regular Expression (e.g., a*b+)" value={regex} onChange={(e) => setRegex(e.target.value)} />
                <input id="testStringInput" type="text" placeholder="Test string" value={testString} onChange={(e) => setTestString(e.target.value)} />
                <button id="testRegexBtn" onClick={testRegex}>🧪 Test</button>
                <div className="regex-examples">
                  <strong>Examples:</strong>
                  <button onClick={() => setRegex("a*b+")}>a*b+</button>
                  <button onClick={() => setRegex("[0-9]+")}>[0-9]+</button>
                  <button onClick={() => setRegex("[a-z]+@[a-z]+\.[a-z]+")}>Email</button>
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

export default StateMachineLab;