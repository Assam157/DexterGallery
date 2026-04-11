import React, { useState, useEffect, useRef, useCallback } from "react";
import "./GeometryLab.css";

const GeometryLab = () => {
  // State
  const [activeModule, setActiveModule] = useState("shapes"); // shapes, transformations, theorems
  const [activeControlIndex, setActiveControlIndex] = useState(0);
  
  // Shapes State
  const [shapeType, setShapeType] = useState("circle");
  const [radius, setRadius] = useState(80);
  const [widthVal, setWidthVal] = useState(120);
  const [heightVal, setHeightVal] = useState(80);
  const [sides, setSides] = useState(6);
  
  // Transformations State
  const [transX, setTransX] = useState(0);
  const [transY, setTransY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [showOriginal, setShowOriginal] = useState(true);
  
  // Theorems State
  const [theoremType, setTheoremType] = useState("pythagorean");
  const [sideA, setSideA] = useState(3);
  const [sideB, setSideB] = useState(4);
  const [hypotenuse, setHypotenuse] = useState(5);
  
  const canvasRef = useRef(null);
  const transCanvasRef = useRef(null);
  const theoremCanvasRef = useRef(null);
  const ctxRef = useRef(null);
  const transCtxRef = useRef(null);
  const theoremCtxRef = useRef(null);
  
  const width = 500;
  const height = 400;
  const transWidth = 500;
  const transHeight = 400;
  const theoremWidth = 500;
  const theoremHeight = 400;
  
  const centerX = width / 2;
  const centerY = height / 2;
  const transCenterX = transWidth / 2;
  const transCenterY = transHeight / 2;
  
  // Controls refs
  const controlsRef = useRef([]);
  
  // Draw Shapes
  const drawShapes = useCallback(() => {
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
    
    // Draw shape
    ctx.fillStyle = "rgba(100, 150, 255, 0.3)";
    ctx.strokeStyle = "#4d9eff";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 5;
    ctx.shadowColor = "#4d9eff";
    
    ctx.beginPath();
    
    if (shapeType === "circle") {
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    } else if (shapeType === "rectangle") {
      ctx.rect(centerX - widthVal / 2, centerY - heightVal / 2, widthVal, heightVal);
    } else if (shapeType === "square") {
      const side = Math.min(widthVal, heightVal);
      ctx.rect(centerX - side / 2, centerY - side / 2, side, side);
    } else if (shapeType === "triangle") {
      ctx.moveTo(centerX, centerY - 60);
      ctx.lineTo(centerX - 50, centerY + 40);
      ctx.lineTo(centerX + 50, centerY + 40);
      ctx.closePath();
    } else if (shapeType === "polygon") {
      const angleStep = (Math.PI * 2) / sides;
      for (let i = 0; i < sides; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    }
    
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Labels
    ctx.fillStyle = "#ffd966";
    ctx.font = "14px monospace";
    ctx.fillText(`${shapeType.toUpperCase()}`, centerX - 40, centerY - 100);
    
    if (shapeType === "circle") {
      ctx.fillText(`Radius: ${radius}px`, centerX - 50, centerY + 120);
      ctx.fillText(`Area: ${(Math.PI * radius * radius / 100).toFixed(1)} cm²`, centerX - 50, centerY + 140);
      ctx.fillText(`Circumference: ${(2 * Math.PI * radius / 10).toFixed(1)} cm`, centerX - 50, centerY + 160);
    } else if (shapeType === "rectangle") {
      ctx.fillText(`Width: ${widthVal}px, Height: ${heightVal}px`, centerX - 80, centerY + 120);
      ctx.fillText(`Area: ${(widthVal * heightVal / 100).toFixed(1)} cm²`, centerX - 80, centerY + 140);
      ctx.fillText(`Perimeter: ${(2 * (widthVal + heightVal) / 10).toFixed(1)} cm`, centerX - 80, centerY + 160);
    } else if (shapeType === "polygon") {
      ctx.fillText(`${sides}-sided polygon`, centerX - 60, centerY + 120);
      const area = (sides * Math.pow(radius, 2) * Math.sin(2 * Math.PI / sides)) / 2;
      ctx.fillText(`Area: ${(area / 100).toFixed(1)} cm²`, centerX - 60, centerY + 140);
    }
    
  }, [shapeType, radius, widthVal, heightVal, sides, centerX, centerY, width, height]);
  
  // Draw Transformations
  const drawTransformations = useCallback(() => {
    const ctx = transCtxRef.current;
    if (!ctx) return;
    
    ctx.clearRect(0, 0, transWidth, transHeight);
    
    // Draw grid
    ctx.strokeStyle = "#2f6080";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < transWidth; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, transHeight);
      ctx.stroke();
    }
    for (let y = 0; y < transHeight; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(transWidth, y);
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = "#88aadd";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, transCenterY);
    ctx.lineTo(transWidth, transCenterY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(transCenterX, 0);
    ctx.lineTo(transCenterX, transHeight);
    ctx.stroke();
    
    // Original triangle
    const originalPoints = [
      { x: transCenterX - 60, y: transCenterY - 40 },
      { x: transCenterX + 40, y: transCenterY - 40 },
      { x: transCenterX - 10, y: transCenterY + 60 }
    ];
    
    if (showOriginal) {
      ctx.fillStyle = "rgba(100, 150, 255, 0.3)";
      ctx.strokeStyle = "#4d9eff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(originalPoints[0].x, originalPoints[0].y);
      ctx.lineTo(originalPoints[1].x, originalPoints[1].y);
      ctx.lineTo(originalPoints[2].x, originalPoints[2].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#88aadd";
      ctx.fillText("Original", originalPoints[0].x - 30, originalPoints[0].y - 10);
    }
    
    // Transformed triangle
    const transformedPoints = originalPoints.map(p => {
      let x = p.x - transCenterX;
      let y = p.y - transCenterY;
      
      // Apply translation
      x += transX;
      y += transY;
      
      // Apply rotation
      const rad = rotation * Math.PI / 180;
      const rx = x * Math.cos(rad) - y * Math.sin(rad);
      const ry = x * Math.sin(rad) + y * Math.cos(rad);
      
      // Apply scale
      const sx = rx * scale;
      const sy = ry * scale;
      
      return { x: sx + transCenterX, y: sy + transCenterY };
    });
    
    ctx.fillStyle = "rgba(255, 100, 100, 0.5)";
    ctx.strokeStyle = "#ff6666";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
    ctx.lineTo(transformedPoints[1].x, transformedPoints[1].y);
    ctx.lineTo(transformedPoints[2].x, transformedPoints[2].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = "#ffaa66";
    ctx.fillText("Transformed", transformedPoints[0].x - 40, transformedPoints[0].y - 10);
    
  }, [transX, transY, rotation, scale, showOriginal, transCenterX, transCenterY, transWidth, transHeight]);
  
  // Draw Theorems
  const drawTheorems = useCallback(() => {
    const ctx = theoremCtxRef.current;
    if (!ctx) return;
    
    ctx.clearRect(0, 0, theoremWidth, theoremHeight);
    
    // Draw grid
    ctx.strokeStyle = "#2f6080";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < theoremWidth; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, theoremHeight);
      ctx.stroke();
    }
    for (let y = 0; y < theoremHeight; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(theoremWidth, y);
      ctx.stroke();
    }
    
    const centerX = theoremWidth / 2;
    const centerY = theoremHeight / 2;
    
    if (theoremType === "pythagorean") {
      // Draw right triangle
      const scaleFactor = 15;
      const a = sideA * scaleFactor;
      const b = sideB * scaleFactor;
      const c = Math.sqrt(a * a + b * b);
      
      const x1 = centerX - 80;
      const y1 = centerY + 60;
      const x2 = x1 + a;
      const y2 = y1;
      const x3 = x1;
      const y3 = y1 - b;
      
      ctx.fillStyle = "rgba(100, 150, 255, 0.3)";
      ctx.strokeStyle = "#4d9eff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Draw squares on sides
      ctx.fillStyle = "rgba(255, 100, 100, 0.2)";
      ctx.fillRect(x1 - 10, y1 - a, a, a);
      ctx.fillRect(x2, y2 - b, b, b);
      ctx.fillRect(x3 - c, y3, c, c);
      
      ctx.fillStyle = "#ffd966";
      ctx.font = "14px monospace";
      ctx.fillText(`a² = ${(sideA * sideA).toFixed(1)}`, x1 + a/2 - 20, y1 - a - 10);
      ctx.fillText(`b² = ${(sideB * sideB).toFixed(1)}`, x2 + b + 10, y2 - b/2);
      ctx.fillText(`c² = ${(hypotenuse * hypotenuse).toFixed(1)}`, x3 - c - 40, y3 + c/2);
      
      ctx.fillStyle = "#88ff88";
      ctx.font = "bold 16px monospace";
      ctx.fillText(`${sideA}² + ${sideB}² = ${hypotenuse}²`, centerX - 120, 50);
      
    } else if (theoremType === "circle") {
      const r = 80;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.strokeStyle = "#4d9eff";
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + r, centerY);
      ctx.stroke();
      
      ctx.fillStyle = "#ffd966";
      ctx.font = "14px monospace";
      ctx.fillText(`Area = πr² = ${(Math.PI * r * r / 100).toFixed(1)} cm²`, centerX - 100, centerY - 60);
      ctx.fillText(`Circumference = 2πr = ${(2 * Math.PI * r / 10).toFixed(1)} cm`, centerX - 100, centerY - 30);
    }
    
  }, [theoremType, sideA, sideB, hypotenuse, theoremWidth, theoremHeight]);
  
  // Initialize canvases
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      ctxRef.current = canvas.getContext('2d');
      drawShapes();
    }
  }, [drawShapes]);
  
  useEffect(() => {
    const canvas = transCanvasRef.current;
    if (canvas) {
      canvas.width = transWidth;
      canvas.height = transHeight;
      transCtxRef.current = canvas.getContext('2d');
      drawTransformations();
    }
  }, [drawTransformations]);
  
  useEffect(() => {
    const canvas = theoremCanvasRef.current;
    if (canvas) {
      canvas.width = theoremWidth;
      canvas.height = theoremHeight;
      theoremCtxRef.current = canvas.getContext('2d');
      drawTheorems();
    }
  }, [drawTheorems]);
  
  // Redraw when parameters change
  useEffect(() => {
    if (activeModule === "shapes") drawShapes();
    if (activeModule === "transformations") drawTransformations();
    if (activeModule === "theorems") drawTheorems();
  }, [drawShapes, drawTransformations, drawTheorems, activeModule, shapeType, radius, widthVal, heightVal, sides, transX, transY, rotation, scale, showOriginal, theoremType, sideA, sideB, hypotenuse]);
  
  // Build controls for keyboard navigation
  useEffect(() => {
    const controls = [];
    
    const shapeTypeSelect = document.getElementById('shapeTypeSelect');
    const radiusSlider = document.getElementById('radiusSlider');
    const widthSlider = document.getElementById('widthSlider');
    const heightSlider = document.getElementById('heightSlider');
    const sidesSlider = document.getElementById('sidesSlider');
    const transXSlider = document.getElementById('transXSlider');
    const transYSlider = document.getElementById('transYSlider');
    const rotationSlider = document.getElementById('rotationSlider');
    const scaleSlider = document.getElementById('scaleSlider');
    const originalCheckbox = document.getElementById('originalCheckbox');
    const sideASlider = document.getElementById('sideASlider');
    const sideBSlider = document.getElementById('sideBSlider');
    const theoremTypeSelect = document.getElementById('theoremTypeSelect');
    
    if (shapeTypeSelect && activeModule === "shapes") controls.push({ id: 'shapeTypeSelect', element: shapeTypeSelect, type: 'select' });
    if (radiusSlider && activeModule === "shapes" && shapeType === "circle") controls.push({ id: 'radiusSlider', element: radiusSlider, type: 'slider' });
    if (widthSlider && activeModule === "shapes" && (shapeType === "rectangle" || shapeType === "square")) controls.push({ id: 'widthSlider', element: widthSlider, type: 'slider' });
    if (heightSlider && activeModule === "shapes" && shapeType === "rectangle") controls.push({ id: 'heightSlider', element: heightSlider, type: 'slider' });
    if (sidesSlider && activeModule === "shapes" && shapeType === "polygon") controls.push({ id: 'sidesSlider', element: sidesSlider, type: 'slider' });
    
    if (transXSlider && activeModule === "transformations") controls.push({ id: 'transXSlider', element: transXSlider, type: 'slider' });
    if (transYSlider && activeModule === "transformations") controls.push({ id: 'transYSlider', element: transYSlider, type: 'slider' });
    if (rotationSlider && activeModule === "transformations") controls.push({ id: 'rotationSlider', element: rotationSlider, type: 'slider' });
    if (scaleSlider && activeModule === "transformations") controls.push({ id: 'scaleSlider', element: scaleSlider, type: 'slider' });
    if (originalCheckbox && activeModule === "transformations") controls.push({ id: 'originalCheckbox', element: originalCheckbox, type: 'checkbox' });
    
    if (sideASlider && activeModule === "theorems" && theoremType === "pythagorean") controls.push({ id: 'sideASlider', element: sideASlider, type: 'slider' });
    if (sideBSlider && activeModule === "theorems" && theoremType === "pythagorean") controls.push({ id: 'sideBSlider', element: sideBSlider, type: 'slider' });
    if (theoremTypeSelect && activeModule === "theorems") controls.push({ id: 'theoremTypeSelect', element: theoremTypeSelect, type: 'select' });
    
    controlsRef.current = controls;
    if (activeControlIndex >= controls.length) setActiveControlIndex(0);
    
    controls.forEach((c, i) => {
      if (c.element) {
        if (i === activeControlIndex) c.element.classList.add('active-button');
        else c.element.classList.remove('active-button');
      }
    });
  }, [activeModule, activeControlIndex, shapeType, theoremType]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['q', 'e', 'a', 'd', 'h', '1', '2', '3'].includes(key)) e.preventDefault();
      
      if (key === '1') setActiveModule('shapes');
      if (key === '2') setActiveModule('transformations');
      if (key === '3') setActiveModule('theorems');
      
      if (key === 'q') setActiveControlIndex(prev => (prev - 1 + controlsRef.current.length) % Math.max(controlsRef.current.length, 1));
      if (key === 'e') setActiveControlIndex(prev => (prev + 1) % Math.max(controlsRef.current.length, 1));
      
      if (key === 'h') {
        const active = controlsRef.current[activeControlIndex];
        if (active?.element?.click) active.element.click();
      }
      
      if (key === 'a' || key === 'd') {
        const dir = key === 'd' ? 1 : -1;
        const activeId = controlsRef.current[activeControlIndex]?.id;
        
        if (activeId === 'radiusSlider') setRadius(prev => Math.max(20, Math.min(150, prev + dir * 5)));
        if (activeId === 'widthSlider') setWidthVal(prev => Math.max(40, Math.min(200, prev + dir * 5)));
        if (activeId === 'heightSlider') setHeightVal(prev => Math.max(40, Math.min(200, prev + dir * 5)));
        if (activeId === 'sidesSlider') setSides(prev => Math.max(3, Math.min(12, prev + dir)));
        if (activeId === 'transXSlider') setTransX(prev => Math.max(-150, Math.min(150, prev + dir * 5)));
        if (activeId === 'transYSlider') setTransY(prev => Math.max(-150, Math.min(150, prev + dir * 5)));
        if (activeId === 'rotationSlider') setRotation(prev => (prev + dir * 15) % 360);
        if (activeId === 'scaleSlider') setScale(prev => Math.max(0.2, Math.min(2, prev + dir * 0.05)));
        if (activeId === 'sideASlider') setSideA(prev => Math.max(1, Math.min(12, prev + dir)));
        if (activeId === 'sideBSlider') setSideB(prev => Math.max(1, Math.min(12, prev + dir)));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeControlIndex]);
  
  useEffect(() => {
    setHypotenuse(Math.sqrt(sideA * sideA + sideB * sideB));
  }, [sideA, sideB]);
  
  return (
    <div className="geometry-lab-container">
      <div className="geometry-card">
        <div className="geometry-header">
          <h1>🔷 GEOMETRY LAB</h1>
          <div className="geometry-tabs">
            <button className={`geom-tab ${activeModule === 'shapes' ? 'active' : ''}`} onClick={() => setActiveModule('shapes')}>📐 Shapes</button>
            <button className={`geom-tab ${activeModule === 'transformations' ? 'active' : ''}`} onClick={() => setActiveModule('transformations')}>🔄 Transformations</button>
            <button className={`geom-tab ${activeModule === 'theorems' ? 'active' : ''}`} onClick={() => setActiveModule('theorems')}>📖 Theorems</button>
          </div>
        </div>
        
        <div className="geometry-content">
          {activeModule === 'shapes' && (
            <div className="geom-module">
              <div className="geom-canvas-container"><canvas ref={canvasRef} className="geom-canvas" /></div>
              <div className="geom-controls">
                <select id="shapeTypeSelect" value={shapeType} onChange={(e) => setShapeType(e.target.value)}>
                  <option value="circle">Circle</option><option value="rectangle">Rectangle</option>
                  <option value="square">Square</option><option value="triangle">Triangle</option><option value="polygon">Polygon</option>
                </select>
                {shapeType === "circle" && <><label>Radius: <span id="radiusVal">{radius}px</span></label><input id="radiusSlider" type="range" min="20" max="150" value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} /></>}
                {(shapeType === "rectangle" || shapeType === "square") && <><label>Width: <span id="widthVal">{widthVal}px</span></label><input id="widthSlider" type="range" min="40" max="200" value={widthVal} onChange={(e) => setWidthVal(parseInt(e.target.value))} /></>}
                {shapeType === "rectangle" && <><label>Height: <span id="heightVal">{heightVal}px</span></label><input id="heightSlider" type="range" min="40" max="200" value={heightVal} onChange={(e) => setHeightVal(parseInt(e.target.value))} /></>}
                {shapeType === "polygon" && <><label>Sides: <span id="sidesVal">{sides}</span></label><input id="sidesSlider" type="range" min="3" max="12" value={sides} onChange={(e) => setSides(parseInt(e.target.value))} /></>}
              </div>
            </div>
          )}
          
          {activeModule === 'transformations' && (
            <div className="geom-module">
              <div className="geom-canvas-container"><canvas ref={transCanvasRef} className="geom-canvas" /></div>
              <div className="geom-controls">
                <label>Translate X: <span id="transXVal">{transX}px</span></label><input id="transXSlider" type="range" min="-150" max="150" value={transX} onChange={(e) => setTransX(parseInt(e.target.value))} />
                <label>Translate Y: <span id="transYVal">{transY}px</span></label><input id="transYSlider" type="range" min="-150" max="150" value={transY} onChange={(e) => setTransY(parseInt(e.target.value))} />
                <label>Rotation: <span id="rotationVal">{rotation}°</span></label><input id="rotationSlider" type="range" min="0" max="360" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} />
                <label>Scale: <span id="scaleVal">{scale.toFixed(2)}x</span></label><input id="scaleSlider" type="range" min="0.2" max="2" step="0.01" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} />
                <label><input id="originalCheckbox" type="checkbox" checked={showOriginal} onChange={(e) => setShowOriginal(e.target.checked)} /> Show Original</label>
              </div>
            </div>
          )}
          
          {activeModule === 'theorems' && (
            <div className="geom-module">
              <div className="geom-canvas-container"><canvas ref={theoremCanvasRef} className="geom-canvas" /></div>
              <div className="geom-controls">
                <select id="theoremTypeSelect" value={theoremType} onChange={(e) => setTheoremType(e.target.value)}>
                  <option value="pythagorean">Pythagorean Theorem</option><option value="circle">Circle Theorems</option>
                </select>
                {theoremType === "pythagorean" && (<>
                  <label>Side a: <span id="sideAVal">{sideA}</span></label><input id="sideASlider" type="range" min="1" max="12" value={sideA} onChange={(e) => setSideA(parseInt(e.target.value))} />
                  <label>Side b: <span id="sideBVal">{sideB}</span></label><input id="sideBSlider" type="range" min="1" max="12" value={sideB} onChange={(e) => setSideB(parseInt(e.target.value))} />
                  <div className="theorem-result">c = √({sideA}² + {sideB}²) = {hypotenuse.toFixed(2)}</div>
                </>)}
              </div>
            </div>
          )}
        </div>
        
        <div className="geometry-footer"><div className="key-hint"><kbd>1/2/3</kbd> Modules · <kbd>Q/E</kbd> Cycle · <kbd>A/D</kbd> Adjust · <kbd>H</kbd> Click</div></div>
      </div>
    </div>
  );
};

export default GeometryLab;