 import React, { useState, useEffect, useRef, useCallback } from "react";
import "./CalculusLab.css";

const CalculusLab = () => {
  const [activeModule, setActiveModule] = useState("derivative");
  const [activeControlIndex, setActiveControlIndex] = useState(0);
  
  // Derivative State
  const [functionType, setFunctionType] = useState("quadratic");
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);
  const [xPoint, setXPoint] = useState(0);
  
  // Integral State
  const [integralA, setIntegralA] = useState(-2);
  const [integralB, setIntegralB] = useState(2);
  
  const canvasRef = useRef(null);
  const derivativeCanvasRef = useRef(null);
  const integralCanvasRef = useRef(null);
  const width = 600;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  
  const controlsRef = useRef([]);
  
  // Function options
  const functionOptions = [
    { value: "linear", label: "Linear: ax + b" },
    { value: "quadratic", label: "Quadratic: ax² + bx + c" },
    { value: "cubic", label: "Cubic: ax³ + bx² + cx" },
    { value: "sine", label: "Sine: sin(x)" }
  ];
  
  const evaluateFunction = (x) => {
    if (functionType === "linear") return a * x + b;
    if (functionType === "quadratic") return a * x * x + b * x + c;
    if (functionType === "cubic") return a * x * x * x + b * x * x + c * x;
    if (functionType === "sine") return Math.sin(x);
    return 0;
  };
  
  const evaluateDerivative = (x) => {
    if (functionType === "linear") return a;
    if (functionType === "quadratic") return 2 * a * x + b;
    if (functionType === "cubic") return 3 * a * x * x + 2 * b * x + c;
    if (functionType === "sine") return Math.cos(x);
    return 0;
  };
  
  const drawDerivative = useCallback(() => {
    const ctx = derivativeCanvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    
    ctx.strokeStyle = "#2f6080"; ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = 0; y < height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    
    ctx.strokeStyle = "#88aadd"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, centerY); ctx.lineTo(width, centerY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height); ctx.stroke();
    
    const scaleX = 50; const scaleY = 30;
    ctx.beginPath(); ctx.strokeStyle = "#4d9eff"; ctx.lineWidth = 3;
    let first = true;
    for (let px = 0; px <= width; px++) {
      const x = (px - centerX) / scaleX;
      const y = evaluateFunction(x);
      const canvasY = centerY - y * scaleY;
      if (canvasY >= 0 && canvasY <= height) {
        if (first) { ctx.moveTo(px, canvasY); first = false; }
        else ctx.lineTo(px, canvasY);
      } else first = true;
    }
    ctx.stroke();
    
    // Tangent line
    const slope = evaluateDerivative(xPoint);
    const y0 = evaluateFunction(xPoint);
    const x1 = xPoint - 2; const x2 = xPoint + 2;
    const y1 = y0 + slope * (x1 - xPoint);
    const y2 = y0 + slope * (x2 - xPoint);
    const px1 = centerX + x1 * scaleX; const py1 = centerY - y1 * scaleY;
    const px2 = centerX + x2 * scaleX; const py2 = centerY - y2 * scaleY;
    ctx.beginPath(); ctx.strokeStyle = "#ffaa44"; ctx.lineWidth = 3; ctx.moveTo(px1, py1); ctx.lineTo(px2, py2); ctx.stroke();
    
    const pointX = centerX + xPoint * scaleX; const pointY = centerY - y0 * scaleY;
    ctx.fillStyle = "#ff6666"; ctx.beginPath(); ctx.arc(pointX, pointY, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffd966"; ctx.font = "12px monospace";
    ctx.fillText(`Slope = ${slope.toFixed(2)}`, pointX + 10, pointY - 10);
    
  }, [functionType, a, b, c, xPoint, width, height, centerX, centerY]);
  
  const drawIntegral = useCallback(() => {
    const ctx = integralCanvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    
    ctx.strokeStyle = "#2f6080"; ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = 0; y < height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    
    ctx.strokeStyle = "#88aadd"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, centerY); ctx.lineTo(width, centerY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height); ctx.stroke();
    
    const scaleX = 50; const scaleY = 30;
    ctx.beginPath(); ctx.strokeStyle = "#4d9eff"; ctx.lineWidth = 3;
    let first = true;
    for (let px = 0; px <= width; px++) {
      const x = (px - centerX) / scaleX;
      const y = evaluateFunction(x);
      const canvasY = centerY - y * scaleY;
      if (canvasY >= 0 && canvasY <= height) {
        if (first) { ctx.moveTo(px, canvasY); first = false; }
        else ctx.lineTo(px, canvasY);
      } else first = true;
    }
    ctx.stroke();
    
    // Fill area under curve
    const startX = centerX + integralA * scaleX;
    const endX = centerX + integralB * scaleX;
    ctx.fillStyle = "rgba(100, 150, 255, 0.3)";
    ctx.beginPath(); ctx.moveTo(startX, centerY);
    for (let px = startX; px <= endX; px++) {
      const x = (px - centerX) / scaleX;
      const y = evaluateFunction(x);
      const canvasY = centerY - y * scaleY;
      ctx.lineTo(px, canvasY);
    }
    ctx.lineTo(endX, centerY); ctx.closePath(); ctx.fill();
    
    // Calculate integral using Riemann sum
    let sum = 0; const steps = 1000;
    for (let i = 0; i <= steps; i++) {
      const x = integralA + (integralB - integralA) * i / steps;
      sum += evaluateFunction(x) * (integralB - integralA) / steps;
    }
    ctx.fillStyle = "#ffd966"; ctx.font = "14px monospace";
    ctx.fillText(`Area = ${sum.toFixed(4)}`, 20, 40);
    ctx.fillText(`∫ from ${integralA.toFixed(1)} to ${integralB.toFixed(1)}`, 20, 70);
    
  }, [functionType, a, b, c, integralA, integralB, width, height, centerX, centerY]);
  
  useEffect(() => {
    if (activeModule === "derivative" && derivativeCanvasRef.current) drawDerivative();
    if (activeModule === "integral" && integralCanvasRef.current) drawIntegral();
  }, [drawDerivative, drawIntegral, activeModule, functionType, a, b, c, xPoint, integralA, integralB]);
  
  // Build controls for keyboard navigation
  useEffect(() => {
    const controls = [];
    
    const functionSelect = document.getElementById('functionSelect');
    const aSlider = document.getElementById('aSlider');
    const bSlider = document.getElementById('bSlider');
    const cSlider = document.getElementById('cSlider');
    const xPointSlider = document.getElementById('xPointSlider');
    const integralASlider = document.getElementById('integralASlider');
    const integralBSlider = document.getElementById('integralBSlider');
    
    if (functionSelect && activeModule === "derivative") controls.push({ id: 'functionSelect', element: functionSelect, type: 'select' });
    if (aSlider && activeModule === "derivative") controls.push({ id: 'aSlider', element: aSlider, type: 'slider' });
    if (bSlider && activeModule === "derivative") controls.push({ id: 'bSlider', element: bSlider, type: 'slider' });
    if (cSlider && activeModule === "derivative" && functionType !== "sine") controls.push({ id: 'cSlider', element: cSlider, type: 'slider' });
    if (xPointSlider && activeModule === "derivative") controls.push({ id: 'xPointSlider', element: xPointSlider, type: 'slider' });
    
    if (functionSelect && activeModule === "integral") controls.push({ id: 'functionSelect', element: functionSelect, type: 'select' });
    if (aSlider && activeModule === "integral") controls.push({ id: 'aSlider', element: aSlider, type: 'slider' });
    if (bSlider && activeModule === "integral") controls.push({ id: 'bSlider', element: bSlider, type: 'slider' });
    if (cSlider && activeModule === "integral" && functionType !== "sine") controls.push({ id: 'cSlider', element: cSlider, type: 'slider' });
    if (integralASlider && activeModule === "integral") controls.push({ id: 'integralASlider', element: integralASlider, type: 'slider' });
    if (integralBSlider && activeModule === "integral") controls.push({ id: 'integralBSlider', element: integralBSlider, type: 'slider' });
    
    controlsRef.current = controls;
    if (activeControlIndex >= controls.length) setActiveControlIndex(0);
    
    controls.forEach((c, i) => {
      if (c.element) {
        if (i === activeControlIndex) c.element.classList.add('active-button');
        else c.element.classList.remove('active-button');
      }
    });
  }, [activeModule, activeControlIndex, functionType]);
  
  // Keyboard controls with dropdown navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['q', 'e', 'a', 'd', 'h', '1', '2'].includes(key)) e.preventDefault();
      
      if (key === '1') setActiveModule('derivative');
      if (key === '2') setActiveModule('integral');
      
      if (key === 'q') setActiveControlIndex(prev => (prev - 1 + controlsRef.current.length) % Math.max(controlsRef.current.length, 1));
      if (key === 'e') setActiveControlIndex(prev => (prev + 1) % Math.max(controlsRef.current.length, 1));
      
      if (key === 'h') {
        const active = controlsRef.current[activeControlIndex];
        if (active?.element?.click) active.element.click();
        if (active?.type === 'select' && active.element) {
          active.element.focus();
        }
      }
      
      if (key === 'a' || key === 'd') {
        const dir = key === 'd' ? 1 : -1;
        const activeId = controlsRef.current[activeControlIndex]?.id;
        const activeElement = controlsRef.current[activeControlIndex]?.element;
        
        // Handle dropdown select navigation
        if (activeId === 'functionSelect' && activeElement) {
          const currentIndex = functionOptions.findIndex(opt => opt.value === functionType);
          let newIndex = currentIndex + dir;
          if (newIndex < 0) newIndex = functionOptions.length - 1;
          if (newIndex >= functionOptions.length) newIndex = 0;
          setFunctionType(functionOptions[newIndex].value);
          // Update the select element value to match
          activeElement.value = functionOptions[newIndex].value;
        }
        // Handle sliders
        else if (activeId === 'aSlider') setA(prev => Math.max(-3, Math.min(3, prev + dir * 0.1)));
        else if (activeId === 'bSlider') setB(prev => Math.max(-3, Math.min(3, prev + dir * 0.1)));
        else if (activeId === 'cSlider') setC(prev => Math.max(-3, Math.min(3, prev + dir * 0.1)));
        else if (activeId === 'xPointSlider') setXPoint(prev => Math.max(-5, Math.min(5, prev + dir * 0.1)));
        else if (activeId === 'integralASlider') setIntegralA(prev => Math.max(-5, Math.min(integralB - 0.1, prev + dir * 0.1)));
        else if (activeId === 'integralBSlider') setIntegralB(prev => Math.max(integralA + 0.1, Math.min(5, prev + dir * 0.1)));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeControlIndex, integralA, integralB, functionType]);
  
  return (
    <div className="calc-lab-container">
      <div className="calc-card">
        <div className="calc-header"><h1>📈 CALCULUS LAB</h1>
          <div className="calc-tabs">
            <button className={`calc-tab ${activeModule === 'derivative' ? 'active' : ''}`} onClick={() => setActiveModule('derivative')}>📈 Derivatives</button>
            <button className={`calc-tab ${activeModule === 'integral' ? 'active' : ''}`} onClick={() => setActiveModule('integral')}>📊 Integrals</button>
          </div>
        </div>
        <div className="calc-content">
          {activeModule === "derivative" && (
            <div className="calc-module">
              <canvas ref={derivativeCanvasRef} width={width} height={height} className="calc-canvas" />
              <div className="calc-controls">
                <div className="control-group">
                  <label>Function Type:</label>
                  <select 
                    id="functionSelect" 
                    value={functionType} 
                    onChange={(e) => setFunctionType(e.target.value)}
                    className="function-select"
                  >
                    {functionOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="control-group">
                  <label>A: <input id="aSlider" type="range" min="-3" max="3" step="0.1" value={a} onChange={(e) => setA(parseFloat(e.target.value))} /><span>{a.toFixed(1)}</span></label>
                </div>
                <div className="control-group">
                  <label>B: <input id="bSlider" type="range" min="-3" max="3" step="0.1" value={b} onChange={(e) => setB(parseFloat(e.target.value))} /><span>{b.toFixed(1)}</span></label>
                </div>
                {functionType !== "sine" && (
                  <div className="control-group">
                    <label>C: <input id="cSlider" type="range" min="-3" max="3" step="0.1" value={c} onChange={(e) => setC(parseFloat(e.target.value))} /><span>{c.toFixed(1)}</span></label>
                  </div>
                )}
                <div className="control-group">
                  <label>X point: <input id="xPointSlider" type="range" min="-5" max="5" step="0.1" value={xPoint} onChange={(e) => setXPoint(parseFloat(e.target.value))} /><span>{xPoint.toFixed(1)}</span></label>
                </div>
                <div className="derivative-result">f'({xPoint.toFixed(1)}) = {evaluateDerivative(xPoint).toFixed(4)}</div>
                <div className="keyboard-hint">
                  <kbd>Q/E</kbd> Cycle · <kbd>A/D</kbd> Adjust · <kbd>H</kbd> Click<br/>
                  <kbd>←/→</kbd> on dropdown changes function
                </div>
              </div>
            </div>
          )}
          {activeModule === "integral" && (
            <div className="calc-module">
              <canvas ref={integralCanvasRef} width={width} height={height} className="calc-canvas" />
              <div className="calc-controls">
                <div className="control-group">
                  <label>Function Type:</label>
                  <select 
                    id="functionSelect" 
                    value={functionType} 
                    onChange={(e) => setFunctionType(e.target.value)}
                    className="function-select"
                  >
                    {functionOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="control-group">
                  <label>A: <input id="aSlider" type="range" min="-3" max="3" step="0.1" value={a} onChange={(e) => setA(parseFloat(e.target.value))} /><span>{a.toFixed(1)}</span></label>
                </div>
                <div className="control-group">
                  <label>B: <input id="bSlider" type="range" min="-3" max="3" step="0.1" value={b} onChange={(e) => setB(parseFloat(e.target.value))} /><span>{b.toFixed(1)}</span></label>
                </div>
                {functionType !== "sine" && (
                  <div className="control-group">
                    <label>C: <input id="cSlider" type="range" min="-3" max="3" step="0.1" value={c} onChange={(e) => setC(parseFloat(e.target.value))} /><span>{c.toFixed(1)}</span></label>
                  </div>
                )}
                <div className="control-group">
                  <label>Lower bound: <input id="integralASlider" type="range" min="-5" max="5" step="0.1" value={integralA} onChange={(e) => setIntegralA(parseFloat(e.target.value))} /><span>{integralA.toFixed(1)}</span></label>
                </div>
                <div className="control-group">
                  <label>Upper bound: <input id="integralBSlider" type="range" min="-5" max="5" step="0.1" value={integralB} onChange={(e) => setIntegralB(parseFloat(e.target.value))} /><span>{integralB.toFixed(1)}</span></label>
                </div>
                <div className="keyboard-hint">
                  <kbd>Q/E</kbd> Cycle · <kbd>A/D</kbd> Adjust · <kbd>H</kbd> Click<br/>
                  <kbd>←/→</kbd> on dropdown changes function
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="calc-footer"><div className="key-hint"><kbd>1/2</kbd> Modules · <kbd>Q/E</kbd> Cycle · <kbd>A/D</kbd> Adjust · <kbd>H</kbd> Click</div></div>
      </div>
    </div>
  );
};

export default CalculusLab;