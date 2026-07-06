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
        <h1 className="console-title">⚛️ PARTICLE PHYSICS LAB CONSOLE</h1>

        {!isInstalled && (
          <button className="install-btn" onClick={triggerInstall}>
            ⬇ INSTALL DEXTERS LAB
          </button>
        )}

        <div className="lab-grid">
          <button className="lab-button" onClick={() => navigate("/discover")}>🌌 Discovery Hub</button>
          <button className="lab-button" onClick={() => navigate("/radiation")}>☢ Radiation Physics Lab</button>
          <button className="lab-button" onClick={() => navigate("/chemistry")}>🧪 Chemistry Lab</button>
          <button className="lab-button" onClick={() => navigate("/optical")}>🔍 Optical Deflection Lab</button>
          <button className="lab-button" onClick={() => navigate("/semiconductor")}>🔌 Semiconductor Lab</button>
          <button className="lab-button" onClick={() => navigate("/astronomy")}>🚀 Astronomy Lab</button>
          <button className="lab-button" onClick={() => navigate("/em")}>🧲 Electromagnetism Lab</button>
          <button className="lab-button" onClick={() => navigate("/sid")}>🚀 SID Physics Lab (Kinematics)</button>
          <button className="lab-button" onClick={() => navigate("/digital")}>🧩 Digital Lab</button>
          <button className="lab-button" onClick={() => navigate("/quantum")}>⚛️ Quantum Lab</button>
          <button className="lab-button" onClick={() => navigate("/mathemetics")}>🧮 Mathematics Lab</button>
          <button className="lab-button" onClick={() => navigate("/cs")}>💻 Computer Science Lab</button>
          <button className="lab-button" onClick={() => navigate("/robotics")}>🤖 Robotics & Automation Lab</button>
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
        <Route path="/cs" element={<CSLab />} />
        <Route path="/robotics" element={<RoboticsLab />} />
      </Routes>
    </Router>
  );
}