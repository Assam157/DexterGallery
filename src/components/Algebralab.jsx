import React, { useState, useEffect, useRef, useCallback } from "react";
import "./AlgebraLab.css";

const AlgebraLab = () => {
  // State for active module
  const [activeModule, setActiveModule] = useState("equation"); // equation, matrix, graphing
  const [activeControlIndex, setActiveControlIndex] = useState(0);
  
  // Linear Equation State
  const [equation, setEquation] = useState({ m: 2, b: 3 });
  const [xValue, setXValue] = useState(0);
  const [showSolution, setShowSolution] = useState(true);
  
  // Matrix State
  const [matrixA, setMatrixA] = useState([
    [2, 1],
    [1, 2]
  ]);
  const [matrixB, setMatrixB] = useState([
    [5],
    [4]
  ]);
  const [matrixResult, setMatrixResult] = useState(null);
  const [matrixOperation, setMatrixOperation] = useState("solve"); // solve, add, multiply
  
  // Graphing State
  const [functions, setFunctions] = useState([
    { id: 1, expr: "2*x + 3", color: "#ff4d4d", visible: true },
    { id: 2, expr: "x^2", color: "#4dff4d", visible: false },
    { id: 3, expr: "sin(x)", color: "#4d9eff", visible: false }
  ]);
  const [customExpr, setCustomExpr] = useState("2*x + 3");
  const [xMin, setXMin] = useState(-5);
  const [xMax, setXMax] = useState(5);
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const width = 600;
  const height = 400;
  
  // Controls refs for keyboard navigation
  const controlsRef = useRef([]);
  
  // Calculate y value for given x
  const evaluateExpression = (expr, x) => {
    try {
      // Replace ^ with ** for exponentiation
      const processedExpr = expr.replace(/\^/g, '**');
      // Create a safe evaluation function
      const fn = new Function('x', `return ${processedExpr}`);
      return fn(x);
    } catch (e) {
      return NaN;
    }
  };
  
  // Solve linear equation: mx + b = 0
  const solveLinearEquation = () => {
    const { m, b } = equation;
    if (m === 0) return b === 0 ? "Infinite solutions" : "No solution";
    const solution = -b / m;
    return `x = ${solution.toFixed(2)}`;
  };
  
  // Solve matrix equation Ax = B
  const solveMatrixEquation = () => {
    try {
      const size = matrixA.length;
      // Simple 2x2 matrix solver using Cramer's rule
      if (size === 2) {
        const a11 = matrixA[0][0], a12 = matrixA[0][1];
        const a21 = matrixA[1][0], a22 = matrixA[1][1];
        const b1 = matrixB[0][0], b2 = matrixB[1][0];
        
        const det = a11 * a22 - a12 * a21;
        if (Math.abs(det) < 1e-6) {
          setMatrixResult({ error: "Matrix is singular (det = 0)" });
          return;
        }
        
        const x1 = (b1 * a22 - a12 * b2) / det;
        const x2 = (a11 * b2 - b1 * a21) / det;
        
        setMatrixResult({
          solution: [[x1], [x2]],
          determinant: det
        });
      } else {
        setMatrixResult({ error: "Only 2x2 matrices supported in this demo" });
      }
    } catch (e) {
      setMatrixResult({ error: e.message });
    }
  };
  
  // Add matrices
  const addMatrices = () => {
    try {
      const result = matrixA.map((row, i) =>
        row.map((val, j) => val + (matrixB[i]?.[j] || 0))
      );
      setMatrixResult({ result, operation: "addition" });
    } catch (e) {
      setMatrixResult({ error: "Matrices must have same dimensions" });
    }
  };
  
  // Multiply matrices
  const multiplyMatrices = () => {
    try {
      const colsA = matrixA[0].length;
      const rowsB = matrixB.length;
      if (colsA !== rowsB) {
        setMatrixResult({ error: "Matrix dimensions incompatible" });
        return;
      }
      
      const result = matrixA.map(row =>
        matrixB[0].map((_, j) =>
          row.reduce((sum, val, k) => sum + val * (matrixB[k]?.[j] || 0), 0)
        )
      );
      setMatrixResult({ result, operation: "multiplication" });
    } catch (e) {
      setMatrixResult({ error: e.message });
    }
  };
  
  // Draw graph
  const drawGraph = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    ctx.clearRect(0, 0, width, height);
    
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
    const centerX = width / 2;
    const centerY = height / 2;
    const scaleX = width / (xMax - xMin);
    const scaleY = height / 10; // Y range from -5 to 5
    
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
    
    // Draw functions
    functions.forEach(func => {
      if (!func.visible) return;
      
      ctx.beginPath();
      ctx.strokeStyle = func.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = func.color;
      ctx.shadowBlur = 5;
      
      let firstPoint = true;
      for (let px = 0; px <= width; px++) {
        const x = xMin + (px / width) * (xMax - xMin);
        const y = evaluateExpression(func.expr, x);
        
        if (isNaN(y) || !isFinite(y)) {
          firstPoint = true;
          continue;
        }
        
        const canvasX = px;
        const canvasY = centerY - y * scaleY;
        
        if (canvasY >= 0 && canvasY <= height) {
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
    });
    
    ctx.shadowBlur = 0;
    
    // Draw axes labels
    ctx.fillStyle = "#88aadd";
    ctx.font = "12px monospace";
    ctx.fillText("x", width - 15, centerY - 5);
    ctx.fillText("y", centerX + 5, 15);
    
  }, [functions, xMin, xMax, width, height]);
  
  // Initialize graph canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      ctxRef.current = canvas.getContext('2d');
      drawGraph();
    }
  }, [drawGraph, width, height]);
  
  // Redraw when graph parameters change
  useEffect(() => {
    drawGraph();
  }, [functions, xMin, xMax, drawGraph]);
  
  // Build controls for keyboard navigation
  useEffect(() => {
    const controls = [];
    
    const modules = ['equation', 'matrix', 'graphing'].map((mod, i) => ({
      id: `module-${mod}`,
      element: document.getElementById(`module-${mod}`),
      type: 'module'
    }));
    
    // Equation controls
    const mSlider = document.getElementById('mSlider');
    const bSlider = document.getElementById('bSlider');
    const xSlider = document.getElementById('xSlider');
    
    // Matrix controls
    const solveBtn = document.getElementById('solveMatrixBtn');
    const addBtn = document.getElementById('addMatrixBtn');
    const multiplyBtn = document.getElementById('multiplyMatrixBtn');
    const resetMatrixBtn = document.getElementById('resetMatrixBtn');
    
    // Graphing controls
    const addFuncBtn = document.getElementById('addFunctionBtn');
    const xMinSlider = document.getElementById('xMinSlider');
    const xMaxSlider = document.getElementById('xMaxSlider');
    
    if (mSlider) controls.push({ id: 'mSlider', element: mSlider, type: 'slider' });
    if (bSlider) controls.push({ id: 'bSlider', element: bSlider, type: 'slider' });
    if (xSlider) controls.push({ id: 'xSlider', element: xSlider, type: 'slider' });
    if (solveBtn) controls.push({ id: 'solveMatrixBtn', element: solveBtn, type: 'button' });
    if (addBtn) controls.push({ id: 'addMatrixBtn', element: addBtn, type: 'button' });
    if (multiplyBtn) controls.push({ id: 'multiplyMatrixBtn', element: multiplyBtn, type: 'button' });
    if (resetMatrixBtn) controls.push({ id: 'resetMatrixBtn', element: resetMatrixBtn, type: 'button' });
    if (addFuncBtn) controls.push({ id: 'addFunctionBtn', element: addFuncBtn, type: 'button' });
    if (xMinSlider) controls.push({ id: 'xMinSlider', element: xMinSlider, type: 'slider' });
    if (xMaxSlider) controls.push({ id: 'xMaxSlider', element: xMaxSlider, type: 'slider' });
    
    controlsRef.current = controls;
    
    // Update active highlight
    controls.forEach((c, i) => {
      if (c.element) {
        if (i === activeControlIndex) {
          c.element.classList.add('active-button');
        } else {
          c.element.classList.remove('active-button');
        }
      }
    });
  }, [activeControlIndex]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      
      if (['q', 'e', 'a', 'd', 'h'].includes(key)) {
        e.preventDefault();
      }
      
      // Cycle controls with Q/E
      if (key === 'q') {
        setActiveControlIndex(prev => (prev - 1 + controlsRef.current.length) % controlsRef.current.length);
      }
      if (key === 'e') {
        setActiveControlIndex(prev => (prev + 1) % controlsRef.current.length);
      }
      
      // H to click active control
      if (key === 'h') {
        const activeControl = controlsRef.current[activeControlIndex];
        if (activeControl && activeControl.element && activeControl.element.click) {
          activeControl.element.click();
          activeControl.element.focus();
        }
      }
      
      // A/D to adjust values
      if (key === 'a' || key === 'd') {
        const dir = key === 'd' ? 1 : -1;
        const activeId = controlsRef.current[activeControlIndex]?.id;
        
        if (activeId === 'mSlider' && activeModule === 'equation') {
          setEquation(prev => ({ ...prev, m: Math.max(-10, Math.min(10, prev.m + dir * 0.5)) }));
        }
        else if (activeId === 'bSlider' && activeModule === 'equation') {
          setEquation(prev => ({ ...prev, b: Math.max(-10, Math.min(10, prev.b + dir * 0.5)) }));
        }
        else if (activeId === 'xSlider' && activeModule === 'equation') {
          setXValue(prev => Math.max(-10, Math.min(10, prev + dir * 0.5)));
        }
        else if (activeId === 'xMinSlider' && activeModule === 'graphing') {
          setXMin(prev => Math.min(xMax - 1, prev + dir * 0.5));
        }
        else if (activeId === 'xMaxSlider' && activeModule === 'graphing') {
          setXMax(prev => Math.max(xMin + 1, prev + dir * 0.5));
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeControlIndex, activeModule, xMin, xMax]);
  
  // Add new function
  const addFunction = () => {
    const newId = Math.max(...functions.map(f => f.id), 0) + 1;
    const colors = ['#ffaa4d', '#ff4dff', '#4dffff', '#ff6b6b', '#4ecdc4'];
    setFunctions(prev => [...prev, {
      id: newId,
      expr: customExpr,
      color: colors[prev.length % colors.length],
      visible: true
    }]);
  };
  
  const toggleFunction = (id) => {
    setFunctions(prev => prev.map(f => 
      f.id === id ? { ...f, visible: !f.visible } : f
    ));
  };
  
  const removeFunction = (id) => {
    setFunctions(prev => prev.filter(f => f.id !== id));
  };
  
  // Matrix value update
  const updateMatrixA = (row, col, value) => {
    const newMatrix = [...matrixA];
    newMatrix[row][col] = parseFloat(value) || 0;
    setMatrixA(newMatrix);
  };
  
  const updateMatrixB = (row, value) => {
    const newMatrix = [...matrixB];
    newMatrix[row][0] = parseFloat(value) || 0;
    setMatrixB(newMatrix);
  };
  
  const resetMatrices = () => {
    setMatrixA([[2, 1], [1, 2]]);
    setMatrixB([[5], [4]]);
    setMatrixResult(null);
  };
  
  const yValue = evaluateExpression(`${equation.m}*x + ${equation.b}`, xValue);
  
  return (
    <div className="algebra-lab-container">
      <div className="algebra-card">
        <div className="algebra-header">
          <h1>🧮 ALGEBRA LAB</h1>
          <div className="algebra-tabs">
            <button
              id="module-equation"
              className={`algebra-tab ${activeModule === 'equation' ? 'active' : ''}`}
              onClick={() => setActiveModule('equation')}
            >
              📐 Linear Equations
            </button>
            <button
              id="module-matrix"
              className={`algebra-tab ${activeModule === 'matrix' ? 'active' : ''}`}
              onClick={() => setActiveModule('matrix')}
            >
              🔢 Matrix Algebra
            </button>
            <button
              id="module-graphing"
              className={`algebra-tab ${activeModule === 'graphing' ? 'active' : ''}`}
              onClick={() => setActiveModule('graphing')}
            >
              📈 Function Graphing
            </button>
          </div>
        </div>
        
        <div className="algebra-content">
          {/* LINEAR EQUATIONS MODULE */}
          {activeModule === 'equation' && (
            <div className="module-container">
              <div className="equation-display">
                <h3>Equation: y = {equation.m}x + {equation.b}</h3>
                <div className="equation-visual">
                  <div className="slider-group">
                    <label>Slope (m): <span className="value">{equation.m.toFixed(1)}</span></label>
                    <input
                      id="mSlider"
                      type="range"
                      min="-10"
                      max="10"
                      step="0.1"
                      value={equation.m}
                      onChange={(e) => setEquation({ ...equation, m: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="slider-group">
                    <label>Y-intercept (b): <span className="value">{equation.b.toFixed(1)}</span></label>
                    <input
                      id="bSlider"
                      type="range"
                      min="-10"
                      max="10"
                      step="0.1"
                      value={equation.b}
                      onChange={(e) => setEquation({ ...equation, b: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="slider-group">
                    <label>X value: <span className="value">{xValue.toFixed(1)}</span></label>
                    <input
                      id="xSlider"
                      type="range"
                      min="-10"
                      max="10"
                      step="0.1"
                      value={xValue}
                      onChange={(e) => setXValue(parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div className="solution-box">
                    <div className="solution-title">📊 Evaluation</div>
                    <div className="solution-value">
                      When x = {xValue.toFixed(1)}, y = {yValue.toFixed(2)}
                    </div>
                    {showSolution && (
                      <div className="solution-value">
                        Zero of function: {solveLinearEquation()}
                      </div>
                    )}
                    <button 
                      className="toggle-solution"
                      onClick={() => setShowSolution(!showSolution)}
                    >
                      {showSolution ? "Hide" : "Show"} Solution
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* MATRIX ALGEBRA MODULE */}
          {activeModule === 'matrix' && (
            <div className="module-container">
              <div className="matrix-section">
                <h3>Matrix Equation: A·x = B</h3>
                <div className="matrix-grid">
                  <div className="matrix-a">
                    <div className="matrix-title">Matrix A</div>
                    {matrixA.map((row, i) => (
                      <div key={i} className="matrix-row">
                        {row.map((val, j) => (
                          <input
                            key={j}
                            type="number"
                            value={val}
                            onChange={(e) => updateMatrixA(i, j, e.target.value)}
                            className="matrix-input"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="matrix-x">
                    <div className="matrix-title">× x =</div>
                    <div className="matrix-vector">
                      <div>x₁</div>
                      <div>x₂</div>
                    </div>
                  </div>
                  <div className="matrix-b">
                    <div className="matrix-title">Matrix B</div>
                    {matrixB.map((row, i) => (
                      <input
                        key={i}
                        type="number"
                        value={row[0]}
                        onChange={(e) => updateMatrixB(i, e.target.value)}
                        className="matrix-input vector-input"
                      />
                    ))}
                  </div>
                </div>
                
                <div className="matrix-buttons">
                  <button id="solveMatrixBtn" onClick={solveMatrixEquation}>Solve System</button>
                  <button id="addMatrixBtn" onClick={addMatrices}>Add Matrices</button>
                  <button id="multiplyMatrixBtn" onClick={multiplyMatrices}>Multiply Matrices</button>
                  <button id="resetMatrixBtn" onClick={resetMatrices}>Reset</button>
                </div>
                
                {matrixResult && (
                  <div className="matrix-result">
                    <h4>Result:</h4>
                    {matrixResult.error ? (
                      <div className="error">{matrixResult.error}</div>
                    ) : matrixResult.solution ? (
                      <div>
                        <div>Solution:</div>
                        <div>x₁ = {matrixResult.solution[0][0].toFixed(2)}</div>
                        <div>x₂ = {matrixResult.solution[1][0].toFixed(2)}</div>
                        <div>Determinant: {matrixResult.determinant.toFixed(2)}</div>
                      </div>
                    ) : matrixResult.result && (
                      <div className="result-matrix">
                        {matrixResult.result.map((row, i) => (
                          <div key={i} className="result-row">
                            {row.map((val, j) => (
                              <span key={j}>{val.toFixed(2)} </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* FUNCTION GRAPHING MODULE */}
          {activeModule === 'graphing' && (
            <div className="module-container">
              <div className="graphing-section">
                <div className="graph-container">
                  <canvas ref={canvasRef} className="function-canvas" />
                </div>
                
                <div className="function-controls">
                  <div className="add-function">
                    <input
                      type="text"
                      value={customExpr}
                      onChange={(e) => setCustomExpr(e.target.value)}
                      placeholder="e.g., 2*x + 3, x^2, sin(x)"
                      className="expr-input"
                    />
                    <button id="addFunctionBtn" onClick={addFunction}>➕ Add Function</button>
                  </div>
                  
                  <div className="range-controls">
                    <div className="slider-group">
                      <label>X Min: <span className="value">{xMin.toFixed(1)}</span></label>
                      <input
                        id="xMinSlider"
                        type="range"
                        min="-10"
                        max="10"
                        step="0.5"
                        value={xMin}
                        onChange={(e) => setXMin(parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="slider-group">
                      <label>X Max: <span className="value">{xMax.toFixed(1)}</span></label>
                      <input
                        id="xMaxSlider"
                        type="range"
                        min="-10"
                        max="10"
                        step="0.5"
                        value={xMax}
                        onChange={(e) => setXMax(parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="functions-list">
                    <h4>Functions</h4>
                    {functions.map(func => (
                      <div key={func.id} className="function-item">
                        <div 
                          className="function-color" 
                          style={{ background: func.color }}
                        />
                        <span className="function-expr">{func.expr}</span>
                        <div className="function-actions">
                          <button onClick={() => toggleFunction(func.id)}>
                            {func.visible ? '👁️' : '👁️‍🗨️'}
                          </button>
                          <button onClick={() => removeFunction(func.id)}>🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="examples">
                    <h4>Examples:</h4>
                    <button onClick={() => setCustomExpr("2*x + 3")}>y = 2x + 3</button>
                    <button onClick={() => setCustomExpr("x^2")}>y = x²</button>
                    <button onClick={() => setCustomExpr("sin(x)")}>y = sin(x)</button>
                    <button onClick={() => setCustomExpr("abs(x)")}>y = |x|</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="algebra-footer">
          <div className="key-hint">
            <kbd>Q/E</kbd> cycle controls · <kbd>A/D</kbd> adjust · <kbd>H</kbd> click
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgebraLab;