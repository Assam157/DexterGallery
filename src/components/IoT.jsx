import React from "react";
import { useNavigate, useParams } from "react-router-dom";

/* ========================================================
   IoT LABS CONFIGURATION REGISTRY — only pendulum remains
======================================================== */
const IOT_LABS_LIST = [
  {
    id: "pendulamwithiot",
    title: "🛰️ IoT Pendulum Simulation",
    description: "Real‑time telemetry streams and oscillation damping physics visualization.",
    icon: "🪐"
  }
];

export default function IoTLabHub() {
  const navigate = useNavigate();
  const { labId } = useParams();

  const activeLab = IOT_LABS_LIST.find((lab) => lab.id === labId);

  /* --------------------------------------------------------
     FULLSCREEN VIEW (when /iot/:labId is matched)
  -------------------------------------------------------- */
  if (labId && activeLab) {
    return (
      <div 
        style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          width: "100vw", 
          height: "100vh", 
          zIndex: 99999,
          backgroundColor: "#000",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {/* HUD bar */}
        <div 
          style={{ 
            background: "rgba(10, 16, 20, 0.95)", 
            borderBottom: "2px solid #0ff",
            boxShadow: "0 0 15px rgba(0, 255, 255, 0.25)",
            padding: "12px 20px", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            zIndex: 100000
          }}
        >
          <button 
            className="lab-button" 
            onClick={() => navigate("/iot")} 
            style={{ 
              width: "auto", 
              margin: 0, 
              padding: "8px 16px", 
              cursor: "pointer",
              border: "1px solid #0ff",
              background: "transparent",
              color: "#0ff"
            }}
          >
            ⬅ Return to IoT Hub
          </button>
          <h2 style={{ fontSize: "1.4rem", margin: 0, color: "#fff", fontFamily: "'Courier New', monospace" }}>
            {activeLab.title.toUpperCase()}
          </h2>
          <span style={{ color: "#0ff", fontFamily: "monospace", textShadow: "0 0 8px #0ff", fontSize: "0.9rem" }}>
            [ FULLSCREEN WEBGL ENGINE ]
          </span>
        </div>

        {/* Sandboxed iframe */}
        <div style={{ flex: 1, width: "100%", height: "100%", overflow: "hidden", background: "#000" }}>
          <iframe
            src={`/iot/${activeLab.id}/index.html`}
            title={activeLab.title}
            style={{ 
              width: "100%", 
              height: "100%", 
              border: "none",
              display: "block",
              margin: 0,
              padding: 0
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------
     HUB VIEW (only one lab card)
  -------------------------------------------------------- */
  return (
    <div className="console-bg" style={{ minHeight: "100vh", padding: "20px", boxSizing: "border-box" }}>
      <div className="console-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <button 
            className="lab-button" 
            onClick={() => navigate("/")} 
            style={{ width: "auto", margin: 0, padding: "8px 16px" }}
          >
            ⬅ Back to Core Console
          </button>
          <h1 className="console-title" style={{ margin: 0, textAlign: "center" }}>
            📡 INTERNET OF THINGS (IoT) 3D LABS
          </h1>
          <div style={{ width: "140px" }} />
        </div>

        <p style={{ color: "#8ab", fontFamily: "monospace", textAlign: "center", marginBottom: "2rem" }}>
          Select an operational node interface below to route systemic graphics parameters directly onto your layout canvas.
        </p>

        <div 
          className="lab-grid" 
          style={{ 
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "20px",
            justifyContent: "center"
          }}
        >
          {IOT_LABS_LIST.map((lab) => (
            <div 
              key={lab.id}
              className="console-panel"
              onClick={() => navigate(`/iot/${lab.id}`)}
              style={{
                cursor: "pointer",
                border: "1px solid #355",
                transition: "all 0.25s ease-in-out",
                padding: "25px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                background: "rgba(5, 10, 15, 0.6)",
                maxWidth: "400px",
                margin: "0 auto"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0ff";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 255, 255, 0.35)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#355";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span style={{ fontSize: "3.5rem", marginBottom: "15px" }}>{lab.icon}</span>
              <h3 style={{ color: "#fff", margin: "10px 0", fontFamily: "'Courier New', monospace", fontSize: "1.3rem", textShadow: "0 0 5px rgba(255,255,255,0.2)" }}>
                {lab.title}
              </h3>
              <p style={{ color: "#8aa", fontSize: "0.9rem", margin: "0 0 20px 0", lineHeight: "1.5", flexGrow: 1 }}>
                {lab.description}
              </p>
              <button 
                className="lab-button" 
                style={{ 
                  pointerEvents: "none", 
                  width: "100%", 
                  margin: 0,
                  border: "1px dashed #0ff",
                  boxShadow: "0 0 5px rgba(0, 255, 255, 0.1)"
                }}
              >
                SPIN UP ENGINE
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
