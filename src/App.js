  import React, { useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";

import RadiationPhysicsLab from "./components/RaadiationPhysicsLab";
import DiscoveryHub from "./components/DiscoveryHub";
import OpticalDexterLab from "./components/OpticalLab";
import AstronomyLab from "./components/AStronomyLab";
import SemiconductorDexterLab from "./components/SemiconducterLab";
import MathemeticsLab from "./components/MathemeticsLab";
import RGBMixingExperiment from "./components/RGBMixing";
import TidesMoonLab from "./components/MoonGravityEffect";
import EMLab from "./components/EMLab";
import DigitalGateLab from "./components/DigitalGateLogic";
import SidebarPhysicsLab from "./components/PhysicsLabSideBar";
import QuantumSideLab from "./components/QuantumLab";
import ChemLab from "./components/ChemistrySideLab";
import DiodeBiasLab from "./components/PN-JunctionDiodeShwoing";
import PNJunctionDiffusion from "./components/PNJunctionDIode";
import CSLab from "./components/CSLab";
import RoboticsLab from "./components/RoboticsAutomationLab";
import IoTLab from "./components/IoT";
import AntennaLab from "./components/AntennaLab";
import "./App.css";

/* ==============================
   MAIN MENU
================================ */
function DexterHome() {
  const navigate = useNavigate();
  const installEventRef = useRef(null);
  const [isInstalled, setIsInstalled] = React.useState(false);

  /* ==============================
     INSTALL STATE DETECTION
  ============================== */
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
      if (isStandalone) setIsInstalled(true);
    };
    checkInstalled();

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      installEventRef.current = e;
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      installEventRef.current = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  /* ==============================
     KEYBOARD NAVIGATION
  ============================== */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      switch (e.key) {
        case "1": navigate("/radiation"); break;
        case "]": navigate("/discover"); break;
        case "2": navigate("/optical"); break;
        case "3": navigate("/semiconductor"); break;
        case "4": navigate("/em"); break;
        case "5": navigate("/sid"); break;
        case "6": navigate("/digital"); break;
        case "7": navigate("/quantum"); break;
        case "8": navigate("/astronomy"); break;
        case "9": navigate("/chemistry"); break;
        case "0": navigate("/mathemetics"); break;
        case "-": navigate("/cs"); break;
        case "=": navigate("/robotics"); break;
        case "p": navigate("/iot"); break; // Key binding for IoT Lab
        case "a":
        case "A": navigate("/antenna"); break; // Key binding for Antenna Lab
        default: break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  /* ==============================
     INSTALL TRIGGER
  ============================== */
  const triggerInstall = async () => {
    if (!installEventRef.current) {
      alert(
        "Install not available yet.\n\n" +
        "Requirements:\n" +
        "• Service Worker registered\n" +
        "• Valid manifest.json\n" +
        "• HTTPS\n\n" +
        "Check DevTools → Application → Manifest"
      );
      return;
    }
    installEventRef.current.prompt();
    await installEventRef.current.userChoice;
    installEventRef.current = null;
  };

  return (
    <div className="console-bg">
      <div className="console-panel">
        <h1 className="console-title">⚛️ Dexters Lab</h1>

        {/* Global Keyframe CSS Styles injected directly for custom premium components */}
        <style>{`
          .discover-3d-heading {
            text-align: center;
            font-size: 3rem;
            color: #fff;
            text-shadow: 0 0 20px #0ff, 0 0 40px #0ff, 0 0 60px #0ff;
            animation: glowPulse 2s ease-in-out infinite alternate;
            margin: 1rem 0 1.5rem;
            letter-spacing: 3px;
            font-family: 'Courier New', monospace;
            cursor: pointer;
            transition: transform 0.2s;
          }
          .discover-3d-heading:hover {
            transform: scale(1.03);
          }
          
          /* HIGHLY STYLIZED FEATURED IOT CALLOUT BUTTON */
          .iot-premium-showcase-btn {
            width: 100%;
            background: linear-gradient(90deg, rgba(0,230,255,0.15) 0%, rgba(0,0,0,0.6) 50%, rgba(0,230,255,0.15) 100%);
            border: 2px solid #0ff;
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 15px rgba(0, 255, 255, 0.1);
            border-radius: 8px;
            padding: 22px;
            margin: 1.5rem 0;
            cursor: pointer;
            display: flex;
            justifyContent: space-between;
            align-items: center;
            transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
            position: relative;
            overflow: hidden;
          }
          .iot-premium-showcase-btn::before {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 50%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.25), transparent);
            transform: skewX(-25deg);
            animation: laserSweep 3.5s infinite;
          }
          .iot-premium-showcase-btn:hover {
            transform: translateY(-2px);
            border-color: #fff;
            box-shadow: 0 0 25px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.2);
          }
          .iot-btn-title {
            font-family: 'Courier New', monospace;
            font-size: 1.6rem;
            color: #fff;
            font-weight: bold;
            letter-spacing: 2px;
            text-shadow: 0 0 8px #0ff;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .iot-btn-tag {
            background: #0ff;
            color: #000;
            font-family: monospace;
            font-weight: bold;
            font-size: 0.75rem;
            padding: 2px 8px;
            border-radius: 3px;
            letter-spacing: 1px;
            box-shadow: 0 0 8px #0ff;
          }

          @keyframes glowPulse {
            from { text-shadow: 0 0 20px #0ff, 0 0 40px #0ff, 0 0 60px #0ff; }
            to   { text-shadow: 0 0 30px #0ff, 0 0 70px #0ff, 0 0 100px #0ff; }
          }
          @keyframes laserSweep {
            0% { left: -100%; }
            30% { left: 150%; }
            100% { left: 150%; }
          }
        `}</style>

        <h2
          className="discover-3d-heading"
          onClick={() => navigate("/discover")}
          title="Click to enter the 3D Simulations Hub"
        >
          🌐 DISCOVER 3D SIMULATIONS
        </h2>

        {!isInstalled && (
          <button className="install-btn" onClick={triggerInstall}>
            ⬇ INSTALL DEXTERS LAB
          </button>
        )}

        {/* FEATURED BREAKOUT HERO BUTTON: FORCES IOT TO STAND OUT AS A REMARKABLE CORE ASSET */}
        <div className="iot-premium-showcase-btn" onClick={() => navigate("/iot")}>
          <div className="iot-btn-title">
            <span>📡</span> 
            <span>REAL-TIME 3D IoT Labs</span>
          </div>
          <div style={{ color: "#0ff", fontFamily: "monospace", fontSize: "0.9rem", textShadow: "0 0 5px #0ff" }}>
            INITIALIZE NODE SYSTEMS MODULE [P] ➔
          </div>
        </div>

        {/* Standard Matrix Application Grid */}
        <div className="lab-grid">
          <button className="lab-button" onClick={() => navigate("/discover")}>
            🌌 Discovery Hub
          </button>
          <button className="lab-button" onClick={() => navigate("/radiation")}>
            ☢ Radiation Physics Lab
          </button>
          <button className="lab-button" onClick={() => navigate("/chemistry")}>
            🧪 Chemistry Lab
          </button>
          <button className="lab-button" onClick={() => navigate("/optical")}>
            🔍 Optical Deflection Lab
          </button>
          <button className="lab-button" onClick={() => navigate("/semiconductor")}>
            🔌 Semiconductor Lab
          </button>
          <button className="lab-button" onClick={() => navigate("/astronomy")}>
            🚀 Astronomy Lab
          </button>
          <button className="lab-button" onClick={() => navigate("/em")}>
            🧲 Electromagnetism Lab
          </button>
          <button className="lab-button" onClick={() => navigate("/sid")}>
            🚀 SID Physics Lab (Kinematics)
          </button>
          <button className="lab-button" onClick={() => navigate("/digital")}>
            🧩 Digital Lab
          </button>
          <button className="lab-button" onClick={() => navigate("/quantum")}>
            ⚛️ Quantum Lab
          </button>
          <button className="lab-button" onClick={() => navigate("/mathemetics")}>
            🧮 Mathematics Lab
          </button>
          <button className="lab-button" onClick={() => navigate("/cs")}>
            💻 Computer Science Lab
          </button>
          <button className="lab-button" onClick={() => navigate("/robotics")}>
            🤖 Robotics & Automation Lab
          </button>
          <button className="lab-button" onClick={() => navigate("/antenna")}>
            📡 Antenna & RF Lab
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==============================
   APP ROOT
================================ */
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DexterHome />} />
        <Route path="/discover" element={<DiscoveryHub />} />
        <Route path="/radiation" element={<RadiationPhysicsLab />} />
        <Route path="/optical" element={<OpticalDexterLab />} />
        <Route path="/semiconductor" element={<SemiconductorDexterLab />} />
        <Route path="/em" element={<EMLab />} />
        <Route path="/sid" element={<SidebarPhysicsLab />} />
        <Route path="/digital" element={<DigitalGateLab />} />
        <Route path="/quantum" element={<QuantumSideLab />} />
        <Route path="/chemistry" element={<ChemLab />} />
        <Route path="/PNJN" element={<DiodeBiasLab />} />
        <Route path="/astronomy" element={<AstronomyLab />} />
        <Route path="/mathemetics" element={<MathemeticsLab />} />
        <Route path="/PN" element={<PNJunctionDiffusion />} />
        <Route path="/rgb" element={<RGBMixingExperiment />} />
        <Route path="/tides" element={<TidesMoonLab />} />
        <Route path="/cs" element={<CSLab />} />
        <Route path="/robotics" element={<RoboticsLab />} />
        <Route path="/antenna" element={<AntennaLab />} />
        
        {/* Parametric Route Handlers for the nested configurations */}
        <Route path="/iot" element={<IoTLab />} />
        <Route path="/iot/:labId" element={<IoTLab />} />
      </Routes>
    </Router>
  );
}