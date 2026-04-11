import React, { useState, useEffect, useRef, useCallback } from "react";
import "./VectorAdditionLab.css";

const VectorAdditionLab = () => {
  // Canvas refs
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  
  // State
  const [currentScreen, setCurrentScreen] = useState('explore2D');
  const [vectors, setVectors] = useState([]);
  const [selectedVectorIndex, setSelectedVectorIndex] = useState(-1);
  const [showSum, setShowSum] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showValues, setShowValues] = useState(false);
  const [activeControlIndex, setActiveControlIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [draggedVector, setDraggedVector] = useState(null);
  
  // Colors for vectors
  const colors = ['#ff4d4d', '#4dff4d', '#4d9eff', '#ffaa4d', '#ff4dff', '#4dffff'];
  
  // Canvas dimensions
  const width = 700;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 20;
  
  // Refs for DOM elements
  const controlsRef = useRef([]);
  
  // Helper functions
  const updateVectorFromPolar = useCallback((index, vectorsArr) => {
    const v = vectorsArr[index];
    const rad = v.angle * Math.PI / 180;
    v.x = v.mag * Math.cos(rad);
    v.y = v.mag * Math.sin(rad);
    return vectorsArr;
  }, []);
  
  // Calculate sum vector
  const calculateSum = useCallback(() => {
    let sumX = 0, sumY = 0;
    vectors.forEach(v => {
      sumX += v.x;
      sumY += v.y;
    });
    const mag = Math.sqrt(sumX * sumX + sumY * sumY);
    let dir = Math.atan2(sumY, sumX) * 180 / Math.PI;
    if (dir < 0) dir += 360;
    return { x: sumX, y: sumY, mag, dir };
  }, [vectors]);
  
  // Add vector
  const addVector = useCallback(() => {
    const newVector = {
      x: 2, y: 0,
      mag: 5,
      angle: 0,
      color: colors[vectors.length % colors.length]
    };
    if (currentScreen === 'explore1D') {
      newVector.angle = 0;
      newVector.y = 0;
    }
    setVectors(prev => [...prev, newVector]);
    if (selectedVectorIndex === -1) setSelectedVectorIndex(0);
  }, [vectors.length, currentScreen, colors, selectedVectorIndex]);
  
  // Remove vector
  const removeVector = useCallback(() => {
    if (vectors.length === 0) return;
    const newSelected = selectedVectorIndex >= vectors.length - 1 ? vectors.length - 2 : selectedVectorIndex;
    setVectors(prev => prev.filter((_, i) => i !== selectedVectorIndex));
    if (vectors.length === 1) setSelectedVectorIndex(-1);
    else setSelectedVectorIndex(newSelected);
  }, [vectors, selectedVectorIndex]);
  
  // Reset all vectors
  const resetVectors = useCallback(() => {
    setVectors([]);
    setSelectedVectorIndex(-1);
    setTimeout(() => addVector(), 0);
  }, [addVector]);
  
  // Update selected vector
  const updateSelectedVector = useCallback((updates) => {
    setVectors(prev => {
      const newVectors = [...prev];
      if (selectedVectorIndex >= 0 && selectedVectorIndex < newVectors.length) {
        newVectors[selectedVectorIndex] = { ...newVectors[selectedVectorIndex], ...updates };
        if (updates.mag !== undefined || updates.angle !== undefined) {
          const rad = newVectors[selectedVectorIndex].angle * Math.PI / 180;
          newVectors[selectedVectorIndex].x = newVectors[selectedVectorIndex].mag * Math.cos(rad);
          newVectors[selectedVectorIndex].y = newVectors[selectedVectorIndex].mag * Math.sin(rad);
        }
        if (currentScreen === 'explore1D') {
          newVectors[selectedVectorIndex].y = 0;
          newVectors[selectedVectorIndex].angle = newVectors[selectedVectorIndex].x > 0 ? 0 : 180;
          newVectors[selectedVectorIndex].mag = Math.abs(newVectors[selectedVectorIndex].x);
        }
      }
      return newVectors;
    });
  }, [selectedVectorIndex, currentScreen]);
  
  // Drawing functions
  const draw = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#2f6080';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
      
      ctx.strokeStyle = '#88aadd';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.stroke();
    }
    
    // Draw vectors
    vectors.forEach((v, i) => {
      const startX = centerX;
      const startY = centerY;
      const endX = startX + v.x * scale;
      const endY = startY - v.y * scale;
      
      ctx.strokeStyle = v.color;
      ctx.lineWidth = 3;
      ctx.shadowColor = v.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      const angle = Math.atan2(startY - endY, endX - startX);
      const arrowSize = 15;
      ctx.fillStyle = v.color;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - arrowSize * Math.cos(angle - 0.3), endY + arrowSize * Math.sin(angle - 0.3));
      ctx.lineTo(endX - arrowSize * Math.cos(angle + 0.3), endY + arrowSize * Math.sin(angle + 0.3));
      ctx.closePath();
      ctx.fill();
      
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(String.fromCharCode(65 + i), endX + 5, endY - 5);
      
      if (showValues) {
        ctx.font = '12px monospace';
        ctx.fillStyle = '#ffd966';
        ctx.fillText(`(${v.x.toFixed(1)}, ${v.y.toFixed(1)})`, endX + 5, endY - 20);
      }
    });
    
    // Draw sum vector
    if (showSum && vectors.length > 0) {
      const sum = calculateSum();
      const endX = centerX + sum.x * scale;
      const endY = centerY - sum.y * scale;
      
      ctx.strokeStyle = '#ffd966';
      ctx.lineWidth = 4;
      ctx.setLineDash([5, 5]);
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      const angle = Math.atan2(centerY - endY, endX - centerX);
      const arrowSize = 20;
      ctx.fillStyle = '#ffd966';
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - arrowSize * Math.cos(angle - 0.3), endY + arrowSize * Math.sin(angle - 0.3));
      ctx.lineTo(endX - arrowSize * Math.cos(angle + 0.3), endY + arrowSize * Math.sin(angle + 0.3));
      ctx.closePath();
      ctx.fill();
      
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffd966';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Sum', endX + 10, endY - 10);
      
      ctx.setLineDash([]);
    }
    
    ctx.shadowBlur = 0;
  }, [vectors, showGrid, showValues, showSum, calculateSum, centerX, centerY, scale, width, height]);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      ctxRef.current = canvas.getContext('2d');
      draw();
    }
  }, [draw, width, height]);
  
  // Redraw when state changes
  useEffect(() => {
    draw();
  }, [vectors, showGrid, showValues, showSum, draw]);
  
  // Initialize with one vector
  useEffect(() => {
    if (vectors.length === 0) {
      addVector();
    }
  }, [addVector, vectors.length]);
  
  // Build controls array for keyboard navigation
  useEffect(() => {
    const controls = [];
    
    const canvasContainer = document.getElementById('canvasContainer');
    const explore1D = document.getElementById('explore1DTab');
    const explore2D = document.getElementById('explore2DTab');
    const labTab = document.getElementById('labTab');
    const magGroup = document.getElementById('magGroup');
    const angleGroup = document.getElementById('angleGroup');
    const magSlider = document.getElementById('magSlider');
    const angleSlider = document.getElementById('angleSlider');
    const showSumCheck = document.getElementById('showSumCheck');
    const showGridCheck = document.getElementById('showGridCheck');
    const showValuesCheck = document.getElementById('showValuesCheck');
    const statsPanel = document.getElementById('statsPanel');
    const addBtn = document.getElementById('addVectorBtn');
    const removeBtn = document.getElementById('removeVectorBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    if (canvasContainer) controls.push({ id: 'canvasContainer', element: canvasContainer, type: 'container' });
    if (explore1D) controls.push({ id: 'explore1DTab', element: explore1D, type: 'tab' });
    if (explore2D) controls.push({ id: 'explore2DTab', element: explore2D, type: 'tab' });
    if (labTab) controls.push({ id: 'labTab', element: labTab, type: 'tab' });
    if (magGroup) controls.push({ id: 'magGroup', element: magGroup, type: 'group' });
    if (angleGroup) controls.push({ id: 'angleGroup', element: angleGroup, type: 'group' });
    if (showSumCheck) controls.push({ id: 'showSumCheck', element: showSumCheck, type: 'checkbox' });
    if (showGridCheck) controls.push({ id: 'showGridCheck', element: showGridCheck, type: 'checkbox' });
    if (showValuesCheck) controls.push({ id: 'showValuesCheck', element: showValuesCheck, type: 'checkbox' });
    if (statsPanel) controls.push({ id: 'statsPanel', element: statsPanel, type: 'panel' });
    if (addBtn) controls.push({ id: 'addVectorBtn', element: addBtn, type: 'button' });
    if (removeBtn) controls.push({ id: 'removeVectorBtn', element: removeBtn, type: 'button' });
    if (resetBtn) controls.push({ id: 'resetBtn', element: resetBtn, type: 'button' });
    
    controlsRef.current = controls;
    
    // Remove existing highlights and add active class
    const updateActiveHighlight = () => {
      controls.forEach((c, i) => {
        if (c.element) {
          if (i === activeControlIndex) {
            c.element.classList.add('active-button');
          } else {
            c.element.classList.remove('active-button');
          }
        }
      });
    };
    
    updateActiveHighlight();
  }, [activeControlIndex]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      
      // Prevent default for control keys
      if (['q', 'e', 'a', 'd', 'h', '1', '2', '3'].includes(key)) {
        e.preventDefault();
      }
      
      // Screen selection with number keys
      if (key === '1') {
        setCurrentScreen('explore1D');
        // Reset vectors for 1D mode
        setVectors(prev => prev.map(v => ({ ...v, y: 0, angle: v.x > 0 ? 0 : 180 })));
      }
      if (key === '2') setCurrentScreen('explore2D');
      if (key === '3') setCurrentScreen('lab');
      
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
      
      // A/D to adjust values based on active control
      if (key === 'a' || key === 'd') {
        const dir = key === 'd' ? 1 : -1;
        const activeControl = controlsRef.current[activeControlIndex];
        const activeId = activeControl?.id;
        
        // Adjust magnitude
        if (activeId === 'magGroup' && selectedVectorIndex >= 0) {
          const newMag = Math.max(0, Math.min(10, vectors[selectedVectorIndex].mag + dir * 0.5));
          updateSelectedVector({ mag: newMag });
        }
        // Adjust angle
        else if (activeId === 'angleGroup' && selectedVectorIndex >= 0 && currentScreen !== 'explore1D') {
          let newAngle = vectors[selectedVectorIndex].angle + dir * 5;
          newAngle = (newAngle + 360) % 360;
          updateSelectedVector({ angle: newAngle });
        }
        // Add vector with D
        else if (activeId === 'addVectorBtn' && key === 'd') {
          addVector();
        }
        // Remove vector with A
        else if (activeId === 'removeVectorBtn' && key === 'a') {
          removeVector();
        }
        // Reset with A/D
        else if (activeId === 'resetBtn') {
          resetVectors();
        }
        // Toggle checkboxes with A/D
        else if (activeId === 'showSumCheck') {
          setShowSum(prev => !prev);
        }
        else if (activeId === 'showGridCheck') {
          setShowGrid(prev => !prev);
        }
        else if (activeId === 'showValuesCheck') {
          setShowValues(prev => !prev);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeControlIndex, selectedVectorIndex, vectors, currentScreen, addVector, removeVector, resetVectors, updateSelectedVector]);
  
  // Mouse dragging handlers
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    for (let i = 0; i < vectors.length; i++) {
      const v = vectors[i];
      const endX = centerX + v.x * scale;
      const endY = centerY - v.y * scale;
      const dist = Math.hypot(mouseX - endX, mouseY - endY);
      if (dist < 20) {
        setDragging(true);
        setDraggedVector({ index: i, vector: v });
        setSelectedVectorIndex(i);
        break;
      }
    }
  };
  
  const handleMouseMove = (e) => {
    if (!dragging || !draggedVector) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    let newX = (mouseX - centerX) / scale;
    let newY = -(mouseY - centerY) / scale;
    
    if (currentScreen === 'explore1D') {
      newY = 0;
    }
    
    const newMag = Math.sqrt(newX * newX + newY * newY);
    let newAngle = Math.atan2(newY, newX) * 180 / Math.PI;
    if (newAngle < 0) newAngle += 360;
    
    setVectors(prev => {
      const newVectors = [...prev];
      newVectors[draggedVector.index] = {
        ...newVectors[draggedVector.index],
        x: newX,
        y: newY,
        mag: newMag,
        angle: newAngle
      };
      return newVectors;
    });
  };
  
  const handleMouseUp = () => {
    setDragging(false);
    setDraggedVector(null);
  };
  
  const sum = calculateSum();
  
  return (
    <div className="vector-lab-container">
      <div className="sim-card">
        <div className="header">
          <h1>📐 VECTOR ADDITION <span className="badge">1D · 2D · lab · Q/E</span></h1>
          <div className="screen-tabs">
            <button
              id="explore1DTab"
              className={`screen-tab ${currentScreen === 'explore1D' ? 'active' : ''}`}
              onClick={() => {
                setCurrentScreen('explore1D');
                setVectors(prev => prev.map(v => ({ ...v, y: 0, angle: v.x > 0 ? 0 : 180 })));
              }}
            >
              📏 1D
            </button>
            <button
              id="explore2DTab"
              className={`screen-tab ${currentScreen === 'explore2D' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('explore2D')}
            >
              📐 2D
            </button>
            <button
              id="labTab"
              className={`screen-tab ${currentScreen === 'lab' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('lab')}
            >
              🔬 LAB
            </button>
          </div>
        </div>
        
        <div className="main-content">
          {/* Canvas area */}
          <div className="canvas-area">
            <div className="canvas-container" id="canvasContainer">
              <canvas
                ref={canvasRef}
                id="vectorCanvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: dragging ? 'grabbing' : 'grab' }}
              />
            </div>
          </div>
          
          {/* Control panel */}
          <div className="control-panel">
            <div className="section-title">⚙️ VECTOR CONTROLS</div>
            
            {/* Vector list */}
            <div className="vector-list" id="vectorList">
              <div className="atom-label">🔸 Vectors (click to select)</div>
              {vectors.map((v, i) => (
                <div
                  key={i}
                  className={`vector-item ${selectedVectorIndex === i ? 'selected' : ''}`}
                  onClick={() => setSelectedVectorIndex(i)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="vector-color" style={{ background: v.color }}></div>
                    <span>Vector {String.fromCharCode(65 + i)}</span>
                  </div>
                  <div>|{v.mag.toFixed(1)}| {v.angle}°</div>
                </div>
              ))}
              {vectors.length === 0 && (
                <div style={{ color: '#b0d0ff', textAlign: 'center', padding: '10px' }}>
                  No vectors. Click + to add.
                </div>
              )}
            </div>
            
            {/* Vector parameters */}
            <div className="param-group" id="magGroup">
              <div className="param-header">
                <span>📏 Magnitude</span>
                <span className="param-value" id="magValue">
                  {selectedVectorIndex >= 0 ? vectors[selectedVectorIndex]?.mag.toFixed(1) : '0.0'}
                </span>
              </div>
              <input
                type="range"
                id="magSlider"
                min="0"
                max="10"
                step="0.1"
                value={selectedVectorIndex >= 0 ? vectors[selectedVectorIndex]?.mag : 0}
                onChange={(e) => updateSelectedVector({ mag: parseFloat(e.target.value) })}
                disabled={selectedVectorIndex === -1}
              />
            </div>
            
            <div className="param-group" id="angleGroup">
              <div className="param-header">
                <span>📐 Angle</span>
                <span className="param-value" id="angleValue">
                  {selectedVectorIndex >= 0 ? vectors[selectedVectorIndex]?.angle : 0}°
                </span>
              </div>
              <input
                type="range"
                id="angleSlider"
                min="0"
                max="360"
                step="1"
                value={selectedVectorIndex >= 0 ? vectors[selectedVectorIndex]?.angle : 0}
                onChange={(e) => updateSelectedVector({ angle: parseFloat(e.target.value) })}
                disabled={selectedVectorIndex === -1 || currentScreen === 'explore1D'}
              />
            </div>
            
            {/* Options */}
            <div className="checkbox-row" id="showSumCheck">
              <input
                type="checkbox"
                id="showSum"
                checked={showSum}
                onChange={(e) => setShowSum(e.target.checked)}
              />
              <span>🔵 Show Sum Vector</span>
            </div>
            
            <div className="checkbox-row" id="showGridCheck">
              <input
                type="checkbox"
                id="showGrid"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
              />
              <span>📊 Show Grid</span>
            </div>
            
            <div className="checkbox-row" id="showValuesCheck">
              <input
                type="checkbox"
                id="showValues"
                checked={showValues}
                onChange={(e) => setShowValues(e.target.checked)}
              />
              <span>📝 Show Values</span>
            </div>
            
            {/* Stats panel */}
            <div className="stats-panel" id="statsPanel">
              <div className="stat-row">
                <span>🔴 Sum X</span>
                <span className="stat-value" id="sumX">{sum.x.toFixed(1)}</span>
              </div>
              <div className="stat-row">
                <span>🟢 Sum Y</span>
                <span className="stat-value" id="sumY">{sum.y.toFixed(1)}</span>
              </div>
              <div className="stat-row">
                <span>🔵 Magnitude</span>
                <span className="stat-value" id="sumMag">{sum.mag.toFixed(1)}</span>
              </div>
              <div className="stat-row">
                <span>⚡ Direction</span>
                <span className="stat-value" id="sumDir">{sum.dir.toFixed(0)}°</span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="action-buttons">
              <button className="action-btn" id="addVectorBtn" onClick={addVector}>➕ Add Vector</button>
              <button className="action-btn" id="removeVectorBtn" onClick={removeVector}>➖ Remove</button>
              <button className="action-btn" id="resetBtn" onClick={resetVectors}>🔄 Reset</button>
            </div>
            
            {/* Keyboard hints */}
            <div className="key-hint">
              <kbd>Q/E</kbd> cycle · <kbd>H</kbd> click · <kbd>A/D</kbd> adjust · <kbd>1/2/3</kbd> screens
            </div>
            <div className="keyhint-small">Drag vectors with mouse · Click to select</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VectorAdditionLab;