import React, { useState, useEffect, useRef } from "react";
import "./ChemLab.css";

/* ===== Indicator color logic ===== */
const indicators = {
  litmus: pH => (pH < 7 ? "#ff4444" : "#4444ff"),
  phenolphthalein: pH => (pH < 8.2 ? "#ffffff" : "#ff66cc"),
  methylOrange: pH =>
    pH < 3.1 ? "#ff4444" : pH > 4.4 ? "#ffff66" : "#ff8844"
};

function Ripple({ delay = 0 }) {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        width: 28,
        height: 8,
        border: "2px solid rgba(255,255,255,0.8)",
        borderRadius: "50%",
        transform: "translateX(-50%)",
        animation: `ripple 1.6s ease-out ${delay}ms infinite`
      }}
    />
  );
}

/* ===== pH calculation ===== */
function calculatePH(acid, base) {
  const total = acid + base;
  if (total === 0) return 7;

  const diff = acid - base;
  if (diff === 0) return 7;

  if (diff > 0) return Math.max(0, -Math.log10(diff / total));
  return Math.min(14, 14 + Math.log10(-diff / total));
}

export default function AcidBaseCylindricalPipeLab() {
  const [acid, setAcid] = useState(40);
  const [base, setBase] = useState(40);
  const [indicator, setIndicator] = useState("litmus");
  const [selectedButton, setSelectedButton] = useState("acid");
  
  const [acidDropKey, setAcidDropKey] = useState(0);
  const [baseDropKey, setBaseDropKey] = useState(0);
  
  const acidSliderRef = useRef(null);
  const baseSliderRef = useRef(null);
  const indicatorSelectRef = useRef(null);

  const pH = calculatePH(acid, base);
  const indicatorColor = indicators[indicator](pH);

  const colorOptions = [
    { name: "Litmus", value: "litmus", color: "#ff66cc" },
    { name: "Phenolphthalein", value: "phenolphthalein", color: "#ff66cc" },
    { name: "Methyl Orange", value: "methylOrange", color: "#ff8844" }
  ];

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      
      // Q/E: Cycle through buttons
      if (key === "q") {
        e.preventDefault();
        setSelectedButton(prev => {
          if (prev === "acid") return "base";
          if (prev === "base") return "indicator";
          return "acid";
        });
      } else if (key === "e") {
        e.preventDefault();
        setSelectedButton(prev => {
          if (prev === "acid") return "indicator";
          if (prev === "indicator") return "base";
          return "acid";
        });
      }
      
      // A/D: Manipulate selected control
      if (key === "a") {
        e.preventDefault();
        if (selectedButton === "acid") {
          setAcid(prev => Math.max(0, prev - 5));
          setAcidDropKey(k => k + 1);
        } else if (selectedButton === "base") {
          setBase(prev => Math.max(0, prev - 5));
          setBaseDropKey(k => k + 1);
        } else if (selectedButton === "indicator") {
          const currentIndex = colorOptions.findIndex(opt => opt.value === indicator);
          const prevIndex = currentIndex === 0 ? colorOptions.length - 1 : currentIndex - 1;
          setIndicator(colorOptions[prevIndex].value);
        }
      } else if (key === "d") {
        e.preventDefault();
        if (selectedButton === "acid") {
          setAcid(prev => Math.min(100, prev + 5));
          setAcidDropKey(k => k + 1);
        } else if (selectedButton === "base") {
          setBase(prev => Math.min(100, prev + 5));
          setBaseDropKey(k => k + 1);
        } else if (selectedButton === "indicator") {
          const currentIndex = colorOptions.findIndex(opt => opt.value === indicator);
          const nextIndex = (currentIndex + 1) % colorOptions.length;
          setIndicator(colorOptions[nextIndex].value);
        }
      }
      
      // H: Simulate mouse click
      if (key === "h") {
        e.preventDefault();
        if (selectedButton === "acid" && acidSliderRef.current) {
          acidSliderRef.current.focus();
          const rect = acidSliderRef.current.getBoundingClientRect();
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2
          });
          acidSliderRef.current.dispatchEvent(clickEvent);
        } else if (selectedButton === "base" && baseSliderRef.current) {
          baseSliderRef.current.focus();
          const rect = baseSliderRef.current.getBoundingClientRect();
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2
          });
          baseSliderRef.current.dispatchEvent(clickEvent);
        } else if (selectedButton === "indicator" && indicatorSelectRef.current) {
          indicatorSelectRef.current.focus();
          indicatorSelectRef.current.click();
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedButton, indicator, colorOptions]);

  return (
    <div style={{ padding: 30, color: "#fff", minWidth: 900 }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        🧪 Acid–Base Cylindrical Pipe Model
      </h2>
      
      {/* Keyboard Controls Info */}
      <div style={{ 
        background: "rgba(0,0,0,0.6)", 
        padding: "10px 20px", 
        borderRadius: 8, 
        marginBottom: 20,
        fontSize: 12,
        display: "flex",
        justifyContent: "center",
        gap: 30,
        flexWrap: "wrap"
      }}>
        <span>🎮 <strong>Q/E</strong> → Cycle buttons</span>
        <span>⬅️ <strong>A/D</strong> → Adjust selected</span>
        <span>🖱️ <strong>H</strong> → Simulate click</span>
        <span style={{ color: "#ffd966" }}>✨ Selected: <strong>{selectedButton.toUpperCase()}</strong></span>
      </div>

      {/* ===== APPARATUS ===== */}
      <div style={{ position: "relative", width: 760, height: 500, margin: "0 auto" }}>

        {/* BASE LINE */}
        <div style={{ position: "absolute", bottom: 20, width: "100%", height: 4, background: "#555" }} />

        {/* CONTAINERS */}
        <Container 
          x={80} 
          label="Acid" 
          color="#ff4444" 
          level={acid} 
          isSelected={selectedButton === "acid"}
        />
        <Container 
          x={560} 
          label="Base" 
          color="#4444ff" 
          level={base}
          isSelected={selectedButton === "base"}
        />

        {/* VERTICAL PIPES */}
        <Pipe x={120} />
        <Pipe x={600} />

        {/* DROPS */}
        <Drop key={acidDropKey} x={335} color="#ff4444" />
        <Drop key={baseDropKey} x={405} color="#4444ff" />

        {/* HORIZONTAL PIPES */}
        <HorizontalPipe x={120} y={50} />
        <HorizontalPipe x={492} y={50} />

        {/* FINAL TUBE */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 24,
            transform: "translateX(-50%)",
            width: 140,
            height: 280,
            border: "3px solid #aaa",
            borderRadius: "0 0 25px 25px",
            background: "rgba(255,255,255,0.03)",
            overflow: "hidden"
          }}
        >
          {/* LIQUID */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              height: `${Math.min(85, Math.max(15, ((acid + base) / 200) * 85))}%`,
              width: "100%",
              background: `linear-gradient(135deg, rgba(255,255,240,0.95), ${pH < 5 ? 'rgba(255,200,190,0.8)' : pH > 9 ? 'rgba(170,210,255,0.8)' : 'rgba(235,245,255,0.9)'})`,
              transition: "height 0.3s ease",
              boxShadow: `inset 0 0 15px ${pH < 4 ? '#ff6b6b' : (pH > 10 ? '#5a9eff' : '#fff3b0')}`
            }}
          />

          {/* LIQUID SURFACE RIPPLES */}
          <div
            style={{
              position: "absolute",
              bottom: `${Math.min(85, Math.max(15, ((acid + base) / 200) * 85))}%`,
              width: "100%",
              height: 0,
              pointerEvents: "none"
            }}
          >
            <Ripple />
            <Ripple delay={300} />
          </div>

          {/* FLOATING INDICATOR */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "55%",
              width: 14,
              height: 32,
              background: indicatorColor,
              transform: "translateX(-50%)",
              animation: "float 3s ease-in-out infinite",
              boxShadow: `0 0 12px ${indicatorColor}`,
              borderRadius: 3,
              transition: "background 0.2s"
            }}
          />

          {/* pH LABEL */}
          <div
            style={{
              position: "absolute",
              top: 8,
              width: "100%",
              textAlign: "center",
              fontSize: 14,
              fontWeight: "bold",
              background: "rgba(0,0,0,0.5)",
              padding: "2px 0"
            }}
          >
            pH = {pH.toFixed(2)}
          </div>
        </div>

        {/* pH METER */}
        <PHMeter pH={pH} color={indicatorColor} />
      </div>

      {/* CONTROLS */}
      <div style={{ maxWidth: 500, margin: "30px auto 0" }}>
        {/* Acid Slider */}
        <div 
          style={{ 
            border: selectedButton === "acid" ? "2px solid #ffd966" : "2px solid transparent",
            borderRadius: 8,
            padding: 10,
            background: selectedButton === "acid" ? "rgba(255,217,102,0.1)" : "transparent",
            transition: "all 0.2s"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <label>🧪 Acid amount:</label>
            <b style={{ color: "#ff7a7a", fontSize: 18 }}>{acid}</b>
          </div>
          <input
            ref={acidSliderRef}
            type="range"
            min="0"
            max="100"
            value={acid}
            style={{ width: "100%" }}
            onChange={e => {
              setAcid(+e.target.value);
              setAcidDropKey(k => k + 1);
            }}
            onFocus={() => setSelectedButton("acid")}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "#ff7a7a80" }}>
            <span>◀ A (decrease)</span>
            <span>D (increase) ▶</span>
          </div>
        </div>

        {/* Base Slider */}
        <div 
          style={{ 
            marginTop: 15,
            border: selectedButton === "base" ? "2px solid #ffd966" : "2px solid transparent",
            borderRadius: 8,
            padding: 10,
            background: selectedButton === "base" ? "rgba(255,217,102,0.1)" : "transparent",
            transition: "all 0.2s"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <label>🧴 Base amount:</label>
            <b style={{ color: "#7a9eff", fontSize: 18 }}>{base}</b>
          </div>
          <input
            ref={baseSliderRef}
            type="range"
            min="0"
            max="100"
            value={base}
            style={{ width: "100%" }}
            onChange={e => {
              setBase(+e.target.value);
              setBaseDropKey(k => k + 1);
            }}
            onFocus={() => setSelectedButton("base")}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "#7a9eff80" }}>
            <span>◀ A (decrease)</span>
            <span>D (increase) ▶</span>
          </div>
        </div>

        {/* Indicator Selector */}
        <div 
          style={{ 
            marginTop: 15,
            border: selectedButton === "indicator" ? "2px solid #ffd966" : "2px solid transparent",
            borderRadius: 8,
            padding: 10,
            background: selectedButton === "indicator" ? "rgba(255,217,102,0.1)" : "transparent",
            transition: "all 0.2s"
          }}
        >
          <label>🎨 Indicator:</label>
          <select
            ref={indicatorSelectRef}
            value={indicator}
            onChange={e => setIndicator(e.target.value)}
            onFocus={() => setSelectedButton("indicator")}
            style={{ marginLeft: 10, padding: "5px 10px", background: "#1a1f2e", color: "#fff", border: "1px solid #3c5bbf", borderRadius: 6 }}
          >
            <option value="litmus">🌿 Litmus</option>
            <option value="phenolphthalein">🌸 Phenolphthalein</option>
            <option value="methylOrange">🍊 Methyl Orange</option>
          </select>
        </div>
      </div>

      {/* Color Selection Buttons */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        gap: 15, 
        marginTop: 25,
        padding: 15,
        background: "rgba(0,0,0,0.3)",
        borderRadius: 12
      }}>
        {colorOptions.map(option => (
          <button
            key={option.value}
            onClick={() => {
              setIndicator(option.value);
              setSelectedButton("indicator");
            }}
            style={{
              padding: "10px 20px",
              background: indicator === option.value ? option.color : "#333",
              color: indicator === option.value ? "#fff" : "#ccc",
              border: selectedButton === "indicator" && indicator === option.value ? "3px solid #ffd966" : "1px solid #666",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.2s",
              boxShadow: indicator === option.value ? `0 0 10px ${option.color}` : "none"
            }}
          >
            {option.name}
          </button>
        ))}
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes float {
          0% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -12px); }
          100% { transform: translate(-50%, 0); }
        }

        @keyframes drop {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(260px) scale(0.4); opacity: 0; }
        }
        
        @keyframes ripple {
          0% {
            opacity: 0.8;
            transform: translateX(-50%) scaleX(0.5);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) scaleX(1.5);
          }
        }
        
        input[type="range"] {
          -webkit-appearance: none;
          height: 5px;
          border-radius: 5px;
          outline: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 8px #5f7eff;
          border: 2px solid #aac9ff;
        }
      `}</style>
    </div>
  );
}

/* ===== COMPONENTS ===== */

function Container({ x, label, color, level, isSelected }) {
  return (
    <div style={{ position: "absolute", left: x, bottom: 24, textAlign: "center" }}>
      <div
        style={{
          width: 80,
          height: 200,
          border: isSelected ? "3px solid #ffd966" : "3px solid #aaa",
          borderRadius: "0 0 20px 20px",
          background: "#111",
          position: "relative",
          overflow: "hidden",
          boxShadow: isSelected ? "0 0 15px rgba(255,217,102,0.5)" : "none",
          transition: "all 0.2s"
        }}
      >
        <div style={{ position: "absolute", inset: 3, borderRadius: "0 0 16px 16px", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: `${level}%`,
              background: color,
              transition: "height 0.3s ease"
            }}
          />
        </div>
      </div>
      <div style={{ marginTop: 6, fontWeight: isSelected ? "bold" : "normal", color: isSelected ? "#ffd966" : "#fff" }}>
        {label} {isSelected && "◀"}
      </div>
    </div>
  );
}

function Pipe({ x }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 60,
        width: 14,
        height: 140,
        background: "linear-gradient(90deg,#555,#aaa,#555)",
        borderRadius: 7
      }}
    />
  );
}

function HorizontalPipe({ x, y, length = 130 }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: length,
        height: 14,
        background: "linear-gradient(180deg,#555,#aaa,#555)",
        borderRadius: 7
      }}
    />
  );
}

function Drop({ x, color }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 80,
        width: 10,
        height: 10,
        background: color,
        borderRadius: "50%",
        animation: "drop 1.2s ease-in forwards"
      }}
    />
  );
}

function PHMeter({ pH, color }) {
  const needleAngle = -90 + (Math.min(14, Math.max(0, pH)) / 14) * 180;
  
  return (
    <div
      style={{
        position: "absolute",
        right: -120,
        top: 40,
        width: 180,
        padding: 14,
        background: "#0b1225",
        borderRadius: 14,
        border: "1px solid #2a6cff",
        boxShadow: "0 0 18px rgba(42,108,255,0.3)",
        textAlign: "center"
      }}
    >
      <div style={{ fontSize: 13, color: "#aaa" }}>pH Meter</div>

      <div
        style={{
          position: "relative",
          width: 120,
          height: 120,
          margin: "12px auto",
          borderRadius: "50%",
          background: "#111",
          border: "4px solid #555"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 14,
            borderRadius: "50%",
            background: color,
            opacity: 0.8
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 2,
            height: 50,
            background: "#fff",
            top: 10,
            left: "50%",
            transformOrigin: "bottom center",
            transform: `rotate(${needleAngle}deg) translateX(-50%)`,
            transition: "transform 0.3s ease"
          }}
        />
      </div>

      <div>pH = <b>{pH.toFixed(2)}</b></div>
    </div>
  );
}