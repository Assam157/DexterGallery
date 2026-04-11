 import React, { useState, useEffect, useRef, useCallback } from "react";
import "./TrigonometryLab.css";

const TrigonometryLab = () => {
  // State
  const [activeModule, setActiveModule] = useState("unitCircle"); // unitCircle, graphs, identities
  const [angle, setAngle] = useState(45);
  const [activeControlIndex, setActiveControlIndex] = useState(0);
  
  // Graph State
  const [graphType, setGraphType] = useState("sine"); // sine, cosine, tangent
  const [xMin, setXMin] = useState(-360);
  const [xMax, setXMax] = useState(360);
  
  // Identity Calculator
  const [inputAngle, setInputAngle] = useState(30);
  
  const canvasRef = useRef(null);
  const graphCanvasRef = useRef(null);
  const ctxRef = useRef(null);
  const graphCtxRef = useRef(null);
  const width = 500;
  const height = 500;
  const graphWidth = 600;
  const graphHeight = 400;
  
  // Controls refs for keyboard navigation
  const controlsRef = useRef([]);
  
  // Trigonometric functions
  const toRadians = (deg) => deg * Math.PI / 180;
  const toDegrees = (rad) => rad * 180 / Math.PI;
  
  const sinValue = Math.sin(toRadians(angle));
  const cosValue = Math.cos(toRadians(angle));
  const tanValue = Math.tan(toRadians(angle));
  const isUndefined = Math.abs(Math.cos(toRadians(angle))) < 0.001;
  
  // Identity calculations
  const sinIdentity = Math.sin(toRadians(inputAngle));
  const cosIdentity = Math.cos(toRadians(inputAngle));
  const tanIdentity = Math.tan(toRadians(inputAngle));
  const sinSqPlusCosSq = Math.pow(sinIdentity, 2) + Math.pow(cosIdentity, 2);
  
  // Draw Unit Circle
  const drawUnitCircle = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    ctx.clearRect(0, 0, width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 180;
    
    // Draw grid
    ctx.strokeStyle = "#2f6080";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = "#88aadd";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
    
    // Draw unit circle
    ctx.strokeStyle = "#ffd966";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw angle line
    const rad = toRadians(angle);
    const x = centerX + radius * Math.cos(rad);
    const y = centerY - radius * Math.sin(rad);
    
    ctx.strokeStyle = "#ff6666";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Draw point
    ctx.fillStyle = "#ff6666";
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw angle arc
    const arcRadius = 40;
    const startAngle = 0;
    const endAngle = rad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, arcRadius, startAngle, endAngle, false);
    ctx.strokeStyle = "#ffaa44";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw coordinates
    ctx.fillStyle = "#ffd966";
    ctx.font = "14px monospace";
    ctx.fillText(`(${cosValue.toFixed(2)}, ${sinValue.toFixed(2)})`, x + 10, y - 10);
    
    // Draw angle value
    ctx.fillStyle = "#88aadd";
    ctx.fillText(`${angle}°`, centerX + 50, centerY - 30);
    
    // Draw sin, cos lines
    const sinX = centerX;
    const sinY = centerY - radius * sinValue;
    const cosX = centerX + radius * cosValue;
    const cosY = centerY;
    
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#4dff4d";
    ctx.beginPath();
    ctx.moveTo(sinX, sinY);
    ctx.lineTo(x, sinY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cosX, cosY);
    ctx.lineTo(cosX, y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = "#4dff4d";
    ctx.fillText("sin", sinX - 25, sinY);
    ctx.fillStyle = "#4d9eff";
    ctx.fillText("cos", cosX, cosY - 10);
    
  }, [angle, width, height, sinValue, cosValue]);
  
  // Draw Trigonometric Graphs
  const drawGraphs = useCallback(() => {
    const ctx = graphCtxRef.current;
    if (!ctx) return;
    
    ctx.clearRect(0, 0, graphWidth, graphHeight);
    const centerX = graphWidth / 2;
    const centerY = graphHeight / 2;
    
    // Draw grid
    ctx.strokeStyle = "#2f6080";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < graphWidth; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, graphHeight);
      ctx.stroke();
    }
    for (let y = 0; y < graphHeight; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(graphWidth, y);
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = "#88aadd";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(graphWidth, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, graphHeight);
    ctx.stroke();
    
    // Calculate scale
    const xRange = xMax - xMin;
    const scaleX = graphWidth / xRange;
    const scaleY = 80; // pixels per unit
    
    // Draw the function
    ctx.beginPath();
    ctx.strokeStyle = graphType === "sine" ? "#ff4d4d" : graphType === "cosine" ? "#4dff4d" : "#4d9eff";
    ctx.lineWidth = 3;
    ctx.shadowColor = graphType === "sine" ? "#ff4d4d" : graphType === "cosine" ? "#4dff4d" : "#4d9eff";
    ctx.shadowBlur = 5;
    
    let firstPoint = true;
    for (let px = 0; px <= graphWidth; px++) {
      const x = xMin + (px / graphWidth) * xRange;
      let y;
      if (graphType === "sine") y = Math.sin(toRadians(x));
      else if (graphType === "cosine") y = Math.cos(toRadians(x));
      else y = Math.tan(toRadians(x));
      
      if (Math.abs(y) > 10) {
        firstPoint = true;
        continue;
      }
      
      const canvasX = px;
      const canvasY = centerY - y * scaleY;
      
      if (canvasY >= 0 && canvasY <= graphHeight) {
        if (firstPoint) {
          ctx.moveTo(canvasX, canvasY);
          firstPoint = false;
        } else {
          ctx.lineTo(canvasX, canvasY);
        }
      } else {
        firstPoint = true;
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Draw current angle marker
    const currentX = centerX + ((angle - xMin) / xRange) * graphWidth;
    if (currentX >= 0 && currentX <= graphWidth) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "#ffaa44";
      ctx.beginPath();
      ctx.moveTo(currentX, 0);
      ctx.lineTo(currentX, graphHeight);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Labels
    ctx.fillStyle = "#ffd966";
    ctx.font = "12px monospace";
    ctx.fillText(`${graphType.toUpperCase()} Graph`, graphWidth - 100, 30);
    
  }, [graphType, xMin, xMax, angle, graphWidth, graphHeight]);
  
  // Initialize canvases
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      ctxRef.current = canvas.getContext('2d');
      drawUnitCircle();
    }
  }, [drawUnitCircle, width, height]);
  
  useEffect(() => {
    const graphCanvas = graphCanvasRef.current;
    if (graphCanvas) {
      graphCanvas.width = graphWidth;
      graphCanvas.height = graphHeight;
      graphCtxRef.current = graphCanvas.getContext('2d');
      drawGraphs();
    }
  }, [drawGraphs, graphWidth, graphHeight]);
  
  // Redraw when parameters change
  useEffect(() => {
    if (activeModule === "unitCircle") drawUnitCircle();
    if (activeModule === "graphs") drawGraphs();
  }, [angle, drawUnitCircle, drawGraphs, activeModule, xMin, xMax, graphType]);
  
  // Build controls for keyboard navigation
  useEffect(() => {
    const controls = [];
    
    const angleSlider = document.getElementById('angleSlider');
    const xMinSlider = document.getElementById('xMinSlider');
    const xMaxSlider = document.getElementById('xMaxSlider');
    const sineBtn = document.getElementById('sineBtn');
    const cosineBtn = document.getElementById('cosineBtn');
    const tangentBtn = document.getElementById('tangentBtn');
    const inputAngleSlider = document.getElementById('inputAngleSlider');
    
    // Only add controls that exist in the current module
    if (angleSlider && activeModule === "unitCircle") controls.push({ id: 'angleSlider', element: angleSlider, type: 'slider' });
    if (xMinSlider && activeModule === "graphs") controls.push({ id: 'xMinSlider', element: xMinSlider, type: 'slider' });
    if (xMaxSlider && activeModule === "graphs") controls.push({ id: 'xMaxSlider', element: xMaxSlider, type: 'slider' });
    if (sineBtn && activeModule === "graphs") controls.push({ id: 'sineBtn', element: sineBtn, type: 'button' });
    if (cosineBtn && activeModule === "graphs") controls.push({ id: 'cosineBtn', element: cosineBtn, type: 'button' });
    if (tangentBtn && activeModule === "graphs") controls.push({ id: 'tangentBtn', element: tangentBtn, type: 'button' });
    if (inputAngleSlider && activeModule === "identities") controls.push({ id: 'inputAngleSlider', element: inputAngleSlider, type: 'slider' });
    
    controlsRef.current = controls;
    
    // Reset active index if out of bounds
    if (activeControlIndex >= controls.length) {
      setActiveControlIndex(0);
    }
    
    // Update active highlights
    controls.forEach((c, i) => {
      if (c.element) {
        if (i === activeControlIndex) {
          c.element.classList.add('active-button');
        } else {
          c.element.classList.remove('active-button');
        }
      }
    });
  }, [activeModule, activeControlIndex]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      
      if (['q', 'e', 'a', 'd', 'h', '1', '2', '3'].includes(key)) {
        e.preventDefault();
      }
      
      // Module selection with number keys
      if (key === '1') setActiveModule('unitCircle');
      if (key === '2') setActiveModule('graphs');
      if (key === '3') setActiveModule('identities');
      
      // Cycle controls with Q/E
      if (key === 'q') {
        setActiveControlIndex(prev => (prev - 1 + controlsRef.current.length) % Math.max(controlsRef.current.length, 1));
      }
      if (key === 'e') {
        setActiveControlIndex(prev => (prev + 1) % Math.max(controlsRef.current.length, 1));
      }
      
      // H to click active control
      if (key === 'h') {
        const activeControl = controlsRef.current[activeControlIndex];
        if (activeControl && activeControl.element && activeControl.element.click) {
          activeControl.element.click();
          activeControl.element.focus();
        }
      }
      
      // A/D to adjust values based on active control
      if (key === 'a' || key === 'd') {
        const dir = key === 'd' ? 1 : -1;
        const activeId = controlsRef.current[activeControlIndex]?.id;
        
        // Unit Circle angle adjustment
        if (activeId === 'angleSlider' && activeModule === "unitCircle") {
          setAngle(prev => Math.max(-360, Math.min(360, prev + dir * 5)));
        }
        // Graphs range adjustments
        else if (activeId === 'xMinSlider' && activeModule === "graphs") {
          setXMin(prev => Math.min(xMax - 30, prev + dir * 15));
        }
        else if (activeId === 'xMaxSlider' && activeModule === "graphs") {
          setXMax(prev => Math.max(xMin + 30, prev + dir * 15));
        }
        // Identities angle adjustment
        else if (activeId === 'inputAngleSlider' && activeModule === "identities") {
          setInputAngle(prev => Math.max(-360, Math.min(360, prev + dir * 5)));
        }
        // Graph type selection with A/D
        else if (activeId === 'sineBtn' && activeModule === "graphs") {
          if (key === 'd') setGraphType('sine');
        }
        else if (activeId === 'cosineBtn' && activeModule === "graphs") {
          if (key === 'd') setGraphType('cosine');
        }
        else if (activeId === 'tangentBtn' && activeModule === "graphs") {
          if (key === 'd') setGraphType('tangent');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeControlIndex, activeModule, xMin, xMax]);
  
  return (
    <div className="trig-lab-container">
      <div className="trig-card">
        <div className="trig-header">
          <h1>🔺 TRIGONOMETRY LAB</h1>
          <div className="trig-tabs">
            <button
              id="module-unitCircle"
              className={`trig-tab ${activeModule === 'unitCircle' ? 'active' : ''}`}
              onClick={() => setActiveModule('unitCircle')}
            >
              ⭕ Unit Circle
            </button>
            <button
              id="module-graphs"
              className={`trig-tab ${activeModule === 'graphs' ? 'active' : ''}`}
              onClick={() => setActiveModule('graphs')}
            >
              📈 Graphs
            </button>
            <button
              id="module-identities"
              className={`trig-tab ${activeModule === 'identities' ? 'active' : ''}`}
              onClick={() => setActiveModule('identities')}
            >
              📐 Identities
            </button>
          </div>
        </div>
        
        <div className="trig-content">
          {/* UNIT CIRCLE MODULE */}
          {activeModule === 'unitCircle' && (
            <div className="module-container">
              <div className="unit-circle-section">
                <div className="canvas-container">
                  <canvas ref={canvasRef} className="trig-canvas" />
                </div>
                
                <div className="trig-controls">
                  <div className="angle-control">
                    <div className="slider-group">
                      <label>Angle: <span className="value" id="angleValue">{angle}°</span></label>
                      <input
                        id="angleSlider"
                        type="range"
                        min="-360"
                        max="360"
                        step="1"
                        value={angle}
                        onChange={(e) => setAngle(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="values-panel">
                    <div className="value-row">
                      <span className="value-label">sin θ =</span>
                      <span className="value-number">{sinValue.toFixed(4)}</span>
                    </div>
                    <div className="value-row">
                      <span className="value-label">cos θ =</span>
                      <span className="value-number">{cosValue.toFixed(4)}</span>
                    </div>
                    <div className="value-row">
                      <span className="value-label">tan θ =</span>
                      <span className="value-number">{isUndefined ? "undefined" : tanValue.toFixed(4)}</span>
                    </div>
                  </div>
                  
                  <div className="quadrant-info">
                    <h4>Quadrant: {(() => {
                      const ang = ((angle % 360) + 360) % 360;
                      if (ang < 90) return "I (0°-90°) - All positive";
                      if (ang < 180) return "II (90°-180°) - sin positive";
                      if (ang < 270) return "III (180°-270°) - tan positive";
                      return "IV (270°-360°) - cos positive";
                    })()}</h4>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* GRAPHS MODULE */}
          {activeModule === 'graphs' && (
            <div className="module-container">
              <div className="graphs-section">
                <div className="graph-container">
                  <canvas ref={graphCanvasRef} className="graph-canvas" />
                </div>
                
                <div className="graph-controls">
                  <div className="function-selector">
                    <button
                      id="sineBtn"
                      className={`func-btn ${graphType === 'sine' ? 'active' : ''}`}
                      onClick={() => setGraphType('sine')}
                    >
                      sin(x)
                    </button>
                    <button
                      id="cosineBtn"
                      className={`func-btn ${graphType === 'cosine' ? 'active' : ''}`}
                      onClick={() => setGraphType('cosine')}
                    >
                      cos(x)
                    </button>
                    <button
                      id="tangentBtn"
                      className={`func-btn ${graphType === 'tangent' ? 'active' : ''}`}
                      onClick={() => setGraphType('tangent')}
                    >
                      tan(x)
                    </button>
                  </div>
                  
                  <div className="range-controls">
                    <div className="slider-group">
                      <label>X Min: <span className="value" id="xMinValue">{xMin}°</span></label>
                      <input
                        id="xMinSlider"
                        type="range"
                        min="-720"
                        max="720"
                        step="15"
                        value={xMin}
                        onChange={(e) => setXMin(parseInt(e.target.value))}
                      />
                    </div>
                    <div className="slider-group">
                      <label>X Max: <span className="value" id="xMaxValue">{xMax}°</span></label>
                      <input
                        id="xMaxSlider"
                        type="range"
                        min="-720"
                        max="720"
                        step="15"
                        value={xMax}
                        onChange={(e) => setXMax(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="graph-info">
                    <div className="info-row">
                      <span className="info-label">Period:</span>
                      <span className="info-value">
                        {graphType === 'sine' || graphType === 'cosine' ? '360° (2π)' : '180° (π)'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Range:</span>
                      <span className="info-value">
                        {graphType === 'sine' || graphType === 'cosine' ? '[-1, 1]' : '(-∞, ∞)'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">At x = {angle}°:</span>
                      <span className="info-value">
                        {graphType === 'sine' ? sinValue.toFixed(4) : 
                         graphType === 'cosine' ? cosValue.toFixed(4) : 
                         tanValue.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="keyboard-hint">
                    <kbd>Q/E</kbd> cycle · <kbd>A/D</kbd> adjust range · <kbd>H</kbd> click
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* IDENTITIES MODULE */}
          {activeModule === 'identities' && (
            <div className="module-container">
              <div className="identities-section">
                <div className="identity-calculator">
                  <h3>Trigonometric Identity Calculator</h3>
                  
                  <div className="identity-input">
                    <div className="slider-group">
                      <label>Angle θ: <span className="value" id="inputAngleValue">{inputAngle}°</span></label>
                      <input
                        id="inputAngleSlider"
                        type="range"
                        min="-360"
                        max="360"
                        step="5"
                        value={inputAngle}
                        onChange={(e) => setInputAngle(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="identity-values">
                    <div className="identity-card">
                      <h4>📐 Basic Values</h4>
                      <div className="identity-row">
                        <span>sin θ =</span>
                        <span className="identity-result">{sinIdentity.toFixed(4)}</span>
                      </div>
                      <div className="identity-row">
                        <span>cos θ =</span>
                        <span className="identity-result">{cosIdentity.toFixed(4)}</span>
                      </div>
                      <div className="identity-row">
                        <span>tan θ =</span>
                        <span className="identity-result">{tanIdentity.toFixed(4)}</span>
                      </div>
                    </div>
                    
                    <div className="identity-card">
                      <h4>🔢 Pythagorean Identity</h4>
                      <div className="identity-row">
                        <span>sin²θ + cos²θ =</span>
                        <span className="identity-result">{sinSqPlusCosSq.toFixed(4)}</span>
                      </div>
                      <div className="identity-note">
                        {Math.abs(sinSqPlusCosSq - 1) < 0.001 ? "✓ Verified: equals 1" : "≈ 1 (rounding error)"}
                      </div>
                    </div>
                    
                    <div className="identity-card">
                      <h4>🔄 Reciprocal Identities</h4>
                      <div className="identity-row">
                        <span>csc θ = 1/sin θ =</span>
                        <span className="identity-result">
                          {Math.abs(sinIdentity) < 0.001 ? "undefined" : (1 / sinIdentity).toFixed(4)}
                        </span>
                      </div>
                      <div className="identity-row">
                        <span>sec θ = 1/cos θ =</span>
                        <span className="identity-result">
                          {Math.abs(cosIdentity) < 0.001 ? "undefined" : (1 / cosIdentity).toFixed(4)}
                        </span>
                      </div>
                      <div className="identity-row">
                        <span>cot θ = 1/tan θ =</span>
                        <span className="identity-result">
                          {Math.abs(tanIdentity) < 0.001 ? "undefined" : (1 / tanIdentity).toFixed(4)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="identity-card">
                      <h4>📊 Double Angle Formulas</h4>
                      <div className="identity-row">
                        <span>sin(2θ) =</span>
                        <span className="identity-result">
                          {Math.sin(toRadians(2 * inputAngle)).toFixed(4)}
                        </span>
                      </div>
                      <div className="identity-row">
                        <span>cos(2θ) =</span>
                        <span className="identity-result">
                          {Math.cos(toRadians(2 * inputAngle)).toFixed(4)}
                        </span>
                      </div>
                      <div className="identity-row">
                        <span>tan(2θ) =</span>
                        <span className="identity-result">
                          {Math.tan(toRadians(2 * inputAngle)).toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="keyboard-hint">
                    <kbd>Q/E</kbd> cycle · <kbd>A/D</kbd> adjust angle · <kbd>H</kbd> click
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="trig-footer">
          <div className="key-hint">
            <kbd>1/2/3</kbd> Switch modules · <kbd>Q/E</kbd> cycle controls · <kbd>A/D</kbd> adjust · <kbd>H</kbd> click
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrigonometryLab;