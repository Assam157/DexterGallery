import React, { useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";

import RadiationPhysicsLab from "./components/RaadiationPhysicsLab";
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
import "./App.css";
import DiodeBiasLab from "./components/PN-JunctionDiodeShwoing";
import PNJunctionDiffusion from "./components/PNJunctionDIode"; 
import CSLab from "./components/CSLab";
import RoboticsLab from "./components/RoboticsAutomationLab"; // Add Robotics Lab

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
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

      if (isStandalone) setIsInstalled(true);
    };

    checkInstalled();

    // Capture install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      installEventRef.current = e;
    };

    // Fired when installation is completed
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
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ignore typing inside inputs
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      switch (e.key) {
        case "1":
          navigate("/radiation");
          break;
        case "2":
          navigate("/optical");
          break;
        case "3":
          navigate("/semiconductor");
          break;
        case "4":
          navigate("/em");
          break;
        case "5":
          navigate("/sid");
          break;
        case "6":
          navigate("/digital");
          break;
        case "7":
          navigate("/quantum");
          break;
        case "8":
          navigate("/astronomy");
          break;
        case "9":
          navigate("/chemistry");
          break;
        case "0":
          navigate("/mathemetics");
          break;
        case "-":
          navigate("/cs");
          break;
        case "=":  // Use = key for Robotics Lab
          navigate("/robotics");
          break;
        default:
          break;
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

  /* ==============================
     UI - ORIGINAL VERTICAL LAYOUT
  ============================== */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(#050505, #000)",
        color: "#0f0",
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20
      }}
    >
      <h1>PARTICLE PHYSICS LAB CONSOLE</h1>

      {/* 🔥 INSTALL BUTTON — ONLY IF NOT INSTALLED */}
      {!isInstalled && (
        <button
          className="lab-btn"
          style={{
            border: "2px solid #0f0",
            boxShadow: "0 0 20px #0f0"
          }}
          onClick={triggerInstall}
        >
          ⬇ INSTALL DEXTERS LAB
        </button>
      )}

      <button className="lab-btn" onClick={() => navigate("/radiation")}>
        ☢ Radiation Physics Lab
      </button>
      
      <button className="lab-btn" onClick={() => navigate("/chemistry")}>
        🧪 Chemistry Lab
      </button>

      <button className="lab-btn" onClick={() => navigate("/optical")}>
        🔍 Optical Deflection Lab
      </button>

      <button className="lab-btn" onClick={() => navigate("/semiconductor")}>
        🔌 Semiconductor Lab
      </button>
      
      <button className="lab-btn" onClick={() => navigate("/astronomy")}>
        🚀 Astronomy Lab
      </button>
      
      <button className="lab-btn" onClick={() => navigate("/em")}>
        🧲 Electromagnetism Lab
      </button>

      <button className="lab-btn" onClick={() => navigate("/sid")}>
        🚀 SID Physics Lab (Kinematics)
      </button>

      <button className="lab-btn" onClick={() => navigate("/digital")}>
        🧩 Digital Lab
      </button>
      
      <button className="lab-btn" onClick={() => navigate("/quantum")}>
        ⚛️ Quantum Lab
      </button>
      
      <button className="lab-btn" onClick={() => navigate("/mathemetics")}>
        🧮 Mathematics Lab
      </button>

      <button className="lab-btn" onClick={() => navigate("/cs")}>
        💻 Computer Science Lab
      </button>

      <button className="lab-btn" onClick={() => navigate("/robotics")}>
        🤖 Robotics & Automation Lab
      </button>
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
        <Route path="/cs" element={<CSLab />} />
        <Route path="/robotics" element={<RoboticsLab />} />
      </Routes>
    </Router>
  );
}