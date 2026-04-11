 import React, { useState, useEffect, useRef, useCallback } from "react";
import "./StatisticsLab.css";

const StatisticsLab = () => {
  const [activeModule, setActiveModule] = useState("data");
  const [activeControlIndex, setActiveControlIndex] = useState(0);
  
  // Data State
  const [dataSet, setDataSet] = useState([2, 4, 6, 8, 10, 12, 14, 16]);
  const [newValue, setNewValue] = useState("");
  
  // Probability State
  const [trials, setTrials] = useState(100);
  const [coinFlips, setCoinFlips] = useState([]);
  const [diceRolls, setDiceRolls] = useState([]);
  
  const canvasRef = useRef(null);
  const probCanvasRef = useRef(null);
  const width = 600;
  const height = 400;
  
  const controlsRef = useRef([]);
  
  const calculateStats = () => {
    const sorted = [...dataSet].sort((a, b) => a - b);
    const mean = dataSet.reduce((a, b) => a + b, 0) / dataSet.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const mode = dataSet.reduce((a, b, i, arr) => {
      const count = arr.filter(v => v === b).length;
      return count > a.count ? { value: b, count } : a;
    }, { value: null, count: 0 }).value;
    const variance = dataSet.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / dataSet.length;
    const stdDev = Math.sqrt(variance);
    return { mean, median, mode, variance, stdDev, min: Math.min(...dataSet), max: Math.max(...dataSet), count: dataSet.length };
  };
  
  const drawHistogram = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    
    ctx.strokeStyle = "#2f6080"; ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = 0; y < height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    
    const min = Math.min(...dataSet); const max = Math.max(...dataSet);
    const bins = 8; const binWidth = (width - 80) / bins;
    const counts = new Array(bins).fill(0);
    dataSet.forEach(v => { const bin = Math.floor((v - min) / ((max - min) / bins)); if (bin >= 0 && bin < bins) counts[bin]++; });
    const maxCount = Math.max(...counts, 1);
    
    for (let i = 0; i < bins; i++) {
      const barHeight = (counts[i] / maxCount) * (height - 100);
      ctx.fillStyle = "rgba(100, 150, 255, 0.6)";
      ctx.fillRect(50 + i * binWidth, height - 50 - barHeight, binWidth - 2, barHeight);
      ctx.strokeStyle = "#4d9eff"; ctx.strokeRect(50 + i * binWidth, height - 50 - barHeight, binWidth - 2, barHeight);
    }
    
    const stats = calculateStats();
    ctx.fillStyle = "#ffd966"; ctx.font = "12px monospace";
    ctx.fillText(`Mean: ${stats.mean.toFixed(2)}`, 20, 30);
    ctx.fillText(`Median: ${stats.median}`, 20, 50);
    ctx.fillText(`Std Dev: ${stats.stdDev.toFixed(2)}`, 20, 70);
    ctx.fillText(`n = ${stats.count}`, 20, 90);
    
  }, [dataSet]);
  
  const runCoinSimulation = useCallback(() => {
    const results = [];
    for (let i = 0; i < trials; i++) results.push(Math.random() < 0.5 ? "H" : "T");
    setCoinFlips(results);
  }, [trials]);
  
  const runDiceSimulation = useCallback(() => {
    const results = [];
    for (let i = 0; i < trials; i++) results.push(Math.floor(Math.random() * 6) + 1);
    setDiceRolls(results);
  }, [trials]);
  
  const drawProbability = useCallback(() => {
    const ctx = probCanvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    
    ctx.strokeStyle = "#2f6080"; ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = 0; y < height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    
    if (coinFlips.length > 0) {
      const heads = coinFlips.filter(f => f === "H").length;
      const tails = coinFlips.length - heads;
      const total = coinFlips.length;
      const barWidth = 150;
      ctx.fillStyle = "rgba(100, 200, 100, 0.6)";
      ctx.fillRect(100, height - 80, barWidth, - (heads / total) * 200);
      ctx.fillStyle = "rgba(255, 100, 100, 0.6)";
      ctx.fillRect(100 + barWidth + 50, height - 80, barWidth, - (tails / total) * 200);
      ctx.fillStyle = "#ffd966"; ctx.font = "14px monospace";
      ctx.fillText(`Heads: ${heads} (${((heads/total)*100).toFixed(1)}%)`, 100, height - 90);
      ctx.fillText(`Tails: ${tails} (${((tails/total)*100).toFixed(1)}%)`, 100 + barWidth + 70, height - 90);
    }
    
    if (diceRolls.length > 0) {
      const counts = new Array(6).fill(0);
      diceRolls.forEach(r => counts[r-1]++);
      const barWidth = 50;
      for (let i = 0; i < 6; i++) {
        const barHeight = (counts[i] / diceRolls.length) * 150;
        ctx.fillStyle = `rgba(100, 150, 255, ${0.4 + i * 0.1})`;
        ctx.fillRect(50 + i * (barWidth + 10), height - 60, barWidth, -barHeight);
        ctx.fillStyle = "#ffd966"; ctx.fillText(`${i+1}`, 60 + i * (barWidth + 10), height - 45);
        ctx.fillText(`${((counts[i]/diceRolls.length)*100).toFixed(0)}%`, 55 + i * (barWidth + 10), height - 65 - barHeight);
      }
    }
    
  }, [coinFlips, diceRolls]);
  
  useEffect(() => { drawHistogram(); }, [drawHistogram, dataSet]);
  useEffect(() => { drawProbability(); }, [drawProbability, coinFlips, diceRolls]);
  
  const addDataPoint = () => {
    const val = parseFloat(newValue);
    if (!isNaN(val)) { setDataSet([...dataSet, val]); setNewValue(""); }
  };
  
  const resetData = () => { setDataSet([2, 4, 6, 8, 10, 12, 14, 16]); };
  
  // Build controls for keyboard navigation
  useEffect(() => {
    const controls = [];
    
    const trialsSlider = document.getElementById('trialsSlider');
    const coinBtn = document.getElementById('coinBtn');
    const diceBtn = document.getElementById('diceBtn');
    const dataInput = document.getElementById('dataInput');
    const addBtn = document.getElementById('addBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    if (trialsSlider && activeModule === "probability") controls.push({ id: 'trialsSlider', element: trialsSlider, type: 'slider' });
    if (coinBtn && activeModule === "probability") controls.push({ id: 'coinBtn', element: coinBtn, type: 'button' });
    if (diceBtn && activeModule === "probability") controls.push({ id: 'diceBtn', element: diceBtn, type: 'button' });
    if (dataInput && activeModule === "data") controls.push({ id: 'dataInput', element: dataInput, type: 'input' });
    if (addBtn && activeModule === "data") controls.push({ id: 'addBtn', element: addBtn, type: 'button' });
    if (resetBtn && activeModule === "data") controls.push({ id: 'resetBtn', element: resetBtn, type: 'button' });
    
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
      
      if (key === '1') setActiveModule('data');
      if (key === '2') setActiveModule('probability');
      
      if (key === 'q') setActiveControlIndex(prev => (prev - 1 + controlsRef.current.length) % Math.max(controlsRef.current.length, 1));
      if (key === 'e') setActiveControlIndex(prev => (prev + 1) % Math.max(controlsRef.current.length, 1));
      
      if (key === 'h') {
        const active = controlsRef.current[activeControlIndex];
        if (active?.element?.click) active.element.click();
      }
      
      if (key === 'a' || key === 'd') {
        const dir = key === 'd' ? 1 : -1;
        const activeId = controlsRef.current[activeControlIndex]?.id;
        
        if (activeId === 'trialsSlider') {
          setTrials(prev => Math.max(10, Math.min(1000, prev + dir * 10)));
        }
        if (activeId === 'coinBtn' && key === 'd') {
          runCoinSimulation();
        }
        if (activeId === 'diceBtn' && key === 'd') {
          runDiceSimulation();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeControlIndex, runCoinSimulation, runDiceSimulation]);
  
  return (
    <div className="stats-lab-container">
      <div className="stats-card">
        <div className="stats-header"><h1>📊 STATISTICS LAB</h1>
          <div className="stats-tabs">
            <button className={`stats-tab ${activeModule === 'data' ? 'active' : ''}`} onClick={() => setActiveModule('data')}>📈 Data Analysis</button>
            <button className={`stats-tab ${activeModule === 'probability' ? 'active' : ''}`} onClick={() => setActiveModule('probability')}>🎲 Probability</button>
          </div>
        </div>
        <div className="stats-content">
          {activeModule === "data" && (
            <div className="stats-module">
              <canvas ref={canvasRef} width={width} height={height} className="stats-canvas" />
              <div className="stats-controls">
                <div className="data-input">
                  <input id="dataInput" type="number" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Add data point" />
                  <button id="addBtn" onClick={addDataPoint}>Add</button>
                  <button id="resetBtn" onClick={resetData}>Reset</button>
                </div>
                <div className="data-list"><strong>Data Set:</strong> {dataSet.join(", ")}</div>
                {(() => { const s = calculateStats(); return (
                  <div className="stats-results">
                    <div>Mean: {s.mean.toFixed(2)}</div><div>Median: {s.median}</div>
                    <div>Mode: {s.mode}</div><div>Std Dev: {s.stdDev.toFixed(2)}</div>
                    <div>Min: {s.min} | Max: {s.max}</div><div>Count: {s.count}</div>
                  </div>
                ); })()}
                <div className="keyboard-hint"><kbd>Q/E</kbd> Cycle · <kbd>H</kbd> Click active</div>
              </div>
            </div>
          )}
          {activeModule === "probability" && (
            <div className="stats-module">
              <canvas ref={probCanvasRef} width={width} height={height} className="stats-canvas" />
              <div className="stats-controls">
                <label>Trials: <input id="trialsSlider" type="range" min="10" max="1000" step="10" value={trials} onChange={(e) => setTrials(parseInt(e.target.value))} /><span>{trials}</span></label>
                <button id="coinBtn" onClick={runCoinSimulation}>🪙 Run Coin Flip</button>
                <button id="diceBtn" onClick={runDiceSimulation}>🎲 Run Dice Roll</button>
                {coinFlips.length > 0 && <div>Coin: {coinFlips.filter(f=>f==="H").length}H / {coinFlips.filter(f=>f==="T").length}T</div>}
                {diceRolls.length > 0 && <div>Dice Avg: {(diceRolls.reduce((a,b)=>a+b,0)/diceRolls.length).toFixed(2)}</div>}
                <div className="keyboard-hint"><kbd>Q/E</kbd> Cycle · <kbd>A/D</kbd> Adjust trials · <kbd>D</kbd> on button runs simulation · <kbd>H</kbd> Click</div>
              </div>
            </div>
          )}
        </div>
        <div className="stats-footer"><div className="key-hint"><kbd>1/2</kbd> Modules · <kbd>Q/E</kbd> Cycle · <kbd>A/D</kbd> Adjust · <kbd>H</kbd> Click</div></div>
      </div>
    </div>
  );
};

export default StatisticsLab;