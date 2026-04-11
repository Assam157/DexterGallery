// components/RoboticsLab.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Import all robotics sub-labs
import InverseKinematics from "./InverseKinematics";
import PathPlanning from "./PathPlanning.jsx";
import PIDController from "./PIDController.jsx";
import ObstacleAvoidance from "./ObstacleAvoidance.jsx";
import SwarmRobotics from "./SwarmRobotics.jsx";
import LineFollower from "./LineFollower.jsx";
import RoboticArm from "./RoboticArm.jsx";
import DroneSimulator from "./DroneSimulator.jsx";
import SLAMSimulator from "./SLAMSimulator.jsx";
import GraspPlanning from "./GraspPlanning.jsx";

import "./RoboticsLab.css";

export default function RoboticsLab() {
  const navigate = useNavigate();
  const [activeExperiment, setActiveExperiment] = useState("kinematics");
  
  // Track which slider is active for keyboard control
  const [activeSliderIndex, setActiveSliderIndex] = useState(0);
  
  // Get number of sliders for current experiment
  const getSliderCount = () => {
    switch(activeExperiment) {
      case "kinematics": return 4;
      case "pathplanning": return 2;
      case "pid": return 4;
      case "obstacle": return 2;
      case "swarm": return 4;
      case "linefollower": return 3;
      case "arm": return 5;
      case "drone": return 3;
      case "slam": return 3;
      case "grasp": return 2;
      default: return 0;
    }
  };

  // State for Inverse Kinematics
  const [jointAngle1, setJointAngle1] = useState(45);
  const [jointAngle2, setJointAngle2] = useState(45);
  const [targetX, setTargetX] = useState(150);
  const [targetY, setTargetY] = useState(150);

  // State for Path Planning
  const [mapSize, setMapSize] = useState(20);
  const [algorithm, setAlgorithm] = useState("astar");
  const [obstacleDensity, setObstacleDensity] = useState(0.3);

  // State for PID Controller
  const [kp, setKp] = useState(1.0);
  const [ki, setKi] = useState(0.1);
  const [kd, setKd] = useState(0.05);
  const [targetPosition, setTargetPosition] = useState(100);

  // State for Obstacle Avoidance
  const [sensorRange, setSensorRange] = useState(80);
  const [robotSpeed, setRobotSpeed] = useState(3);
  const [avoidanceMode, setAvoidanceMode] = useState("potential");

  // State for Swarm Robotics
  const [swarmSize, setSwarmSize] = useState(10);
  const [cohesionWeight, setCohesionWeight] = useState(1.0);
  const [separationWeight, setSeparationWeight] = useState(1.5);
  const [alignmentWeight, setAlignmentWeight] = useState(1.2);

  // State for Line Follower
  const [lineThickness, setLineThickness] = useState(5);
  const [sensorOffset, setSensorOffset] = useState(10);
  const [motorSpeed, setMotorSpeed] = useState(2);

  // State for Robotic Arm
  const [armJoints, setArmJoints] = useState([0, 0, 0, 0, 0]);
  const [gripperState, setGripperState] = useState("open");

  // State for Drone
  const [droneHeight, setDroneHeight] = useState(50);
  const [windSpeed, setWindSpeed] = useState(0);
  const [stability, setStability] = useState(1.0);

  // State for SLAM
  const [explorationSpeed, setExplorationSpeed] = useState(2);
  const [scanResolution, setScanResolution] = useState(10);
  const [mapUpdateRate, setMapUpdateRate] = useState(30);

  // State for Grasp Planning
  const [objectSize, setObjectSize] = useState(30);
  const [graspForce, setGraspForce] = useState(50);
  const [graspType, setGraspType] = useState("parallel");

  // Keyboard controls for right panel sliders
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const sliderCount = getSliderCount();
      
      // Q/E to cycle through sliders
      if (key === 'q') {
        e.preventDefault();
        setActiveSliderIndex(prev => (prev + 1) % sliderCount);
      }
      
      if (key === 'e') {
        e.preventDefault();
        setActiveSliderIndex(prev => (prev - 1 + sliderCount) % sliderCount);
      }
      
      // A/D to adjust current slider
      if (key === 'a') {
        e.preventDefault();
        adjustSlider(-1);
      }
      
      if (key === 'd') {
        e.preventDefault();
        adjustSlider(1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeExperiment, activeSliderIndex, 
      jointAngle1, jointAngle2, targetX, targetY,
      mapSize, obstacleDensity, kp, ki, kd, targetPosition,
      sensorRange, robotSpeed, swarmSize, cohesionWeight,
      separationWeight, alignmentWeight, lineThickness,
      sensorOffset, motorSpeed, armJoints, droneHeight,
      windSpeed, stability, explorationSpeed, scanResolution,
      mapUpdateRate, objectSize, graspForce]);

  const adjustSlider = (direction) => {
    switch(activeExperiment) {
      case "kinematics":
        if (activeSliderIndex === 0) setJointAngle1(prev => Math.max(0, Math.min(180, prev + direction * 2)));
        if (activeSliderIndex === 1) setJointAngle2(prev => Math.max(0, Math.min(180, prev + direction * 2)));
        if (activeSliderIndex === 2) setTargetX(prev => Math.max(50, Math.min(250, prev + direction * 5)));
        if (activeSliderIndex === 3) setTargetY(prev => Math.max(50, Math.min(250, prev + direction * 5)));
        break;
        
      case "pathplanning":
        if (activeSliderIndex === 0) setMapSize(prev => Math.max(10, Math.min(40, prev + direction * 1)));
        if (activeSliderIndex === 1) setObstacleDensity(prev => Math.max(0.1, Math.min(0.7, prev + direction * 0.05)));
        break;
        
      case "pid":
        if (activeSliderIndex === 0) setKp(prev => Math.max(0, Math.min(3, prev + direction * 0.05)));
        if (activeSliderIndex === 1) setKi(prev => Math.max(0, Math.min(1, prev + direction * 0.01)));
        if (activeSliderIndex === 2) setKd(prev => Math.max(0, Math.min(1, prev + direction * 0.01)));
        if (activeSliderIndex === 3) setTargetPosition(prev => Math.max(0, Math.min(200, prev + direction * 5)));
        break;
        
      case "obstacle":
        if (activeSliderIndex === 0) setSensorRange(prev => Math.max(30, Math.min(150, prev + direction * 5)));
        if (activeSliderIndex === 1) setRobotSpeed(prev => Math.max(1, Math.min(8, prev + direction * 0.5)));
        break;
        
      case "swarm":
        if (activeSliderIndex === 0) setSwarmSize(prev => Math.max(3, Math.min(30, prev + direction * 1)));
        if (activeSliderIndex === 1) setCohesionWeight(prev => Math.max(0, Math.min(2, prev + direction * 0.1)));
        if (activeSliderIndex === 2) setSeparationWeight(prev => Math.max(0, Math.min(3, prev + direction * 0.1)));
        if (activeSliderIndex === 3) setAlignmentWeight(prev => Math.max(0, Math.min(2, prev + direction * 0.1)));
        break;
        
      case "linefollower":
        if (activeSliderIndex === 0) setLineThickness(prev => Math.max(2, Math.min(15, prev + direction * 1)));
        if (activeSliderIndex === 1) setSensorOffset(prev => Math.max(5, Math.min(30, prev + direction * 2)));
        if (activeSliderIndex === 2) setMotorSpeed(prev => Math.max(1, Math.min(5, prev + direction * 0.5)));
        break;
        
      case "arm":
        if (activeSliderIndex >= 0 && activeSliderIndex < 5) {
          const newJoints = [...armJoints];
          newJoints[activeSliderIndex] = Math.max(-90, Math.min(90, newJoints[activeSliderIndex] + direction * 5));
          setArmJoints(newJoints);
        }
        break;
        
      case "drone":
        if (activeSliderIndex === 0) setDroneHeight(prev => Math.max(20, Math.min(150, prev + direction * 5)));
        if (activeSliderIndex === 1) setWindSpeed(prev => Math.max(0, Math.min(5, prev + direction * 0.5)));
        if (activeSliderIndex === 2) setStability(prev => Math.max(0.5, Math.min(2, prev + direction * 0.1)));
        break;
        
      case "slam":
        if (activeSliderIndex === 0) setExplorationSpeed(prev => Math.max(1, Math.min(8, prev + direction * 0.5)));
        if (activeSliderIndex === 1) setScanResolution(prev => Math.max(5, Math.min(20, prev + direction * 2)));
        if (activeSliderIndex === 2) setMapUpdateRate(prev => Math.max(10, Math.min(60, prev + direction * 5)));
        break;
        
      case "grasp":
        if (activeSliderIndex === 0) setObjectSize(prev => Math.max(10, Math.min(80, prev + direction * 5)));
        if (activeSliderIndex === 1) setGraspForce(prev => Math.max(0, Math.min(100, prev + direction * 5)));
        break;
    }
  };

  // Helper to check if a slider is active
  const isActiveSlider = (index) => {
    return activeSliderIndex === index;
  };

  return (
    <div className="robotics-root">
      {/* LEFT SIDEBAR */}
      <div className="robotics-sidebar">
        <button className="robotics-back-btn" onClick={() => navigate("/")}>
          ⬅ Back to Console
        </button>

        <h3 className="robotics-title">🤖 Robotics Lab</h3>

        <button
          className={`robotics-exp-btn ${activeExperiment === "kinematics" ? "active" : ""}`}
          onClick={() => { setActiveExperiment("kinematics"); setActiveSliderIndex(0); }}
        >
          🦾 Inverse Kinematics
        </button>

        <button
          className={`robotics-exp-btn ${activeExperiment === "pathplanning" ? "active" : ""}`}
          onClick={() => { setActiveExperiment("pathplanning"); setActiveSliderIndex(0); }}
        >
          🗺️ Path Planning
        </button>

        <button
          className={`robotics-exp-btn ${activeExperiment === "pid" ? "active" : ""}`}
          onClick={() => { setActiveExperiment("pid"); setActiveSliderIndex(0); }}
        >
          🎯 PID Controller
        </button>

        <button
          className={`robotics-exp-btn ${activeExperiment === "obstacle" ? "active" : ""}`}
          onClick={() => { setActiveExperiment("obstacle"); setActiveSliderIndex(0); }}
        >
          🚧 Obstacle Avoidance
        </button>

        <button
          className={`robotics-exp-btn ${activeExperiment === "swarm" ? "active" : ""}`}
          onClick={() => { setActiveExperiment("swarm"); setActiveSliderIndex(0); }}
        >
          🐝 Swarm Robotics
        </button>

        <button
          className={`robotics-exp-btn ${activeExperiment === "linefollower" ? "active" : ""}`}
          onClick={() => { setActiveExperiment("linefollower"); setActiveSliderIndex(0); }}
        >
          📍 Line Follower
        </button>

        <button
          className={`robotics-exp-btn ${activeExperiment === "arm" ? "active" : ""}`}
          onClick={() => { setActiveExperiment("arm"); setActiveSliderIndex(0); }}
        >
          🦿 Robotic Arm
        </button>

        <button
          className={`robotics-exp-btn ${activeExperiment === "drone" ? "active" : ""}`}
          onClick={() => { setActiveExperiment("drone"); setActiveSliderIndex(0); }}
        >
          🚁 Drone Simulator
        </button>

        <button
          className={`robotics-exp-btn ${activeExperiment === "slam" ? "active" : ""}`}
          onClick={() => { setActiveExperiment("slam"); setActiveSliderIndex(0); }}
        >
          🗺️ SLAM Simulator
        </button>

        <button
          className={`robotics-exp-btn ${activeExperiment === "grasp" ? "active" : ""}`}
          onClick={() => { setActiveExperiment("grasp"); setActiveSliderIndex(0); }}
        >
          ✋ Grasp Planning
        </button>
      </div>

      {/* CENTER PANEL - VISUALIZATION */}
      <div className="robotics-center">
        {activeExperiment === "kinematics" && (
          <>
            <InverseKinematics
              jointAngle1={jointAngle1}
              jointAngle2={jointAngle2}
              targetX={targetX}
              targetY={targetY}
            />
            <div className="robotics-overlay-title">
              Inverse Kinematics - 2DOF Robotic Arm
            </div>
          </>
        )}

        {activeExperiment === "pathplanning" && (
          <>
            <PathPlanning
              mapSize={mapSize}
              algorithm={algorithm}
              obstacleDensity={obstacleDensity}
            />
            <div className="robotics-overlay-title">
              Path Planning Algorithms - A* vs Dijkstra
            </div>
          </>
        )}

        {activeExperiment === "pid" && (
          <>
            <PIDController
              kp={kp}
              ki={ki}
              kd={kd}
              targetPosition={targetPosition}
            />
            <div className="robotics-overlay-title">
              PID Controller - Position Control
            </div>
          </>
        )}

        {activeExperiment === "obstacle" && (
          <>
            <ObstacleAvoidance
              sensorRange={sensorRange}
              robotSpeed={robotSpeed}
              avoidanceMode={avoidanceMode}
            />
            <div className="robotics-overlay-title">
              Obstacle Avoidance - Reactive Navigation
            </div>
          </>
        )}

        {activeExperiment === "swarm" && (
          <>
            <SwarmRobotics
              swarmSize={swarmSize}
              cohesionWeight={cohesionWeight}
              separationWeight={separationWeight}
              alignmentWeight={alignmentWeight}
            />
            <div className="robotics-overlay-title">
              Swarm Robotics - Boid Algorithm
            </div>
          </>
        )}

        {activeExperiment === "linefollower" && (
          <>
            <LineFollower
              lineThickness={lineThickness}
              sensorOffset={sensorOffset}
              motorSpeed={motorSpeed}
            />
            <div className="robotics-overlay-title">
              Line Follower Robot - PID Control
            </div>
          </>
        )}

        {activeExperiment === "arm" && (
          <>
            <RoboticArm
              armJoints={armJoints}
              gripperState={gripperState}
            />
            <div className="robotics-overlay-title">
              5-DOF Robotic Arm Simulation
            </div>
          </>
        )}

        {activeExperiment === "drone" && (
          <>
            <DroneSimulator
              droneHeight={droneHeight}
              windSpeed={windSpeed}
              stability={stability}
            />
            <div className="robotics-overlay-title">
              Quadcopter Drone - Flight Control
            </div>
          </>
        )}

        {activeExperiment === "slam" && (
          <>
            <SLAMSimulator
              explorationSpeed={explorationSpeed}
              scanResolution={scanResolution}
              mapUpdateRate={mapUpdateRate}
            />
            <div className="robotics-overlay-title">
              SLAM - Simultaneous Localization and Mapping
            </div>
          </>
        )}

        {activeExperiment === "grasp" && (
          <>
            <GraspPlanning
              objectSize={objectSize}
              graspForce={graspForce}
              graspType={graspType}
            />
            <div className="robotics-overlay-title">
              Grasp Planning - Robotic Manipulation
            </div>
          </>
        )}
      </div>

      {/* RIGHT CONTROLS PANEL - WITH KEYBOARD HIGHLIGHTING */}
      <div className="robotics-controls">
        <h3 className="robotics-title green">🎮 Controls</h3>
        
        {/* Keyboard hint at top */}
        <div className="keyboard-hint-top" style={{ 
          background: "#0a2a0a", 
          padding: "8px", 
          borderRadius: "8px", 
          marginBottom: "15px",
          textAlign: "center",
          fontSize: "12px"
        }}>
          <kbd>Q/E</kbd> Cycle sliders · <kbd>A/D</kbd> Adjust values · Active slider <span style={{ color: "#00ff88" }}>HIGHLIGHTED</span>
        </div>

        {/* Inverse Kinematics Controls */}
        {activeExperiment === "kinematics" && (
          <>
            <div className={`robotics-control-group ${isActiveSlider(0) ? "active-slider-group" : ""}`}>
              <label>Joint Angle 1 (θ₁)</label>
              <input
                type="range"
                min="0"
                max="180"
                value={jointAngle1}
                onChange={(e) => setJointAngle1(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(0) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{jointAngle1}°</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(1) ? "active-slider-group" : ""}`}>
              <label>Joint Angle 2 (θ₂)</label>
              <input
                type="range"
                min="0"
                max="180"
                value={jointAngle2}
                onChange={(e) => setJointAngle2(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(1) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{jointAngle2}°</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(2) ? "active-slider-group" : ""}`}>
              <label>Target X Position</label>
              <input
                type="range"
                min="50"
                max="250"
                value={targetX}
                onChange={(e) => setTargetX(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(2) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{targetX}px</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(3) ? "active-slider-group" : ""}`}>
              <label>Target Y Position</label>
              <input
                type="range"
                min="50"
                max="250"
                value={targetY}
                onChange={(e) => setTargetY(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(3) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{targetY}px</span>
            </div>

            <div className="robotics-info-box">
              💡 Active: {isActiveSlider(0) ? "θ₁" : isActiveSlider(1) ? "θ₂" : isActiveSlider(2) ? "Target X" : "Target Y"}
            </div>
          </>
        )}

        {/* Path Planning Controls */}
        {activeExperiment === "pathplanning" && (
          <>
            <div className={`robotics-control-group ${isActiveSlider(0) ? "active-slider-group" : ""}`}>
              <label>Map Size</label>
              <input
                type="range"
                min="10"
                max="40"
                value={mapSize}
                onChange={(e) => setMapSize(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(0) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{mapSize}x{mapSize}</span>
            </div>

            <div className="robotics-control-group">
              <label>Algorithm</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
              >
                <option value="astar">A* Algorithm</option>
                <option value="dijkstra">Dijkstra</option>
                <option value="greedy">Greedy BFS</option>
                <option value="rrt">RRT</option>
              </select>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(1) ? "active-slider-group" : ""}`}>
              <label>Obstacle Density</label>
              <input
                type="range"
                min="0.1"
                max="0.7"
                step="0.05"
                value={obstacleDensity}
                onChange={(e) => setObstacleDensity(parseFloat(e.target.value))}
                style={{ borderColor: isActiveSlider(1) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{Math.round(obstacleDensity * 100)}%</span>
            </div>
          </>
        )}

        {/* PID Controller Controls */}
        {activeExperiment === "pid" && (
          <>
            <div className={`robotics-control-group ${isActiveSlider(0) ? "active-slider-group" : ""}`}>
              <label>Kp (Proportional)</label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.05"
                value={kp}
                onChange={(e) => setKp(parseFloat(e.target.value))}
                style={{ borderColor: isActiveSlider(0) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{kp.toFixed(2)}</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(1) ? "active-slider-group" : ""}`}>
              <label>Ki (Integral)</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={ki}
                onChange={(e) => setKi(parseFloat(e.target.value))}
                style={{ borderColor: isActiveSlider(1) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{ki.toFixed(2)}</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(2) ? "active-slider-group" : ""}`}>
              <label>Kd (Derivative)</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={kd}
                onChange={(e) => setKd(parseFloat(e.target.value))}
                style={{ borderColor: isActiveSlider(2) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{kd.toFixed(2)}</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(3) ? "active-slider-group" : ""}`}>
              <label>Target Position</label>
              <input
                type="range"
                min="0"
                max="200"
                value={targetPosition}
                onChange={(e) => setTargetPosition(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(3) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{targetPosition} units</span>
            </div>

            <div className="robotics-info-box">
              📊 Active: {isActiveSlider(0) ? "Kp" : isActiveSlider(1) ? "Ki" : isActiveSlider(2) ? "Kd" : "Target"}
            </div>
          </>
        )}

        {/* Obstacle Avoidance Controls */}
        {activeExperiment === "obstacle" && (
          <>
            <div className={`robotics-control-group ${isActiveSlider(0) ? "active-slider-group" : ""}`}>
              <label>Sensor Range</label>
              <input
                type="range"
                min="30"
                max="150"
                value={sensorRange}
                onChange={(e) => setSensorRange(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(0) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{sensorRange}px</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(1) ? "active-slider-group" : ""}`}>
              <label>Robot Speed</label>
              <input
                type="range"
                min="1"
                max="8"
                value={robotSpeed}
                onChange={(e) => setRobotSpeed(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(1) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{robotSpeed}</span>
            </div>

            <div className="robotics-control-group">
              <label>Avoidance Mode</label>
              <select
                value={avoidanceMode}
                onChange={(e) => setAvoidanceMode(e.target.value)}
              >
                <option value="potential">Potential Field</option>
                <option value="bug">Bug Algorithm</option>
                <option value="vector">Vector Field</option>
              </select>
            </div>
          </>
        )}

        {/* Swarm Robotics Controls */}
        {activeExperiment === "swarm" && (
          <>
            <div className={`robotics-control-group ${isActiveSlider(0) ? "active-slider-group" : ""}`}>
              <label>Swarm Size</label>
              <input
                type="range"
                min="3"
                max="30"
                value={swarmSize}
                onChange={(e) => setSwarmSize(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(0) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{swarmSize} robots</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(1) ? "active-slider-group" : ""}`}>
              <label>Cohesion Weight</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={cohesionWeight}
                onChange={(e) => setCohesionWeight(parseFloat(e.target.value))}
                style={{ borderColor: isActiveSlider(1) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{cohesionWeight.toFixed(1)}</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(2) ? "active-slider-group" : ""}`}>
              <label>Separation Weight</label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={separationWeight}
                onChange={(e) => setSeparationWeight(parseFloat(e.target.value))}
                style={{ borderColor: isActiveSlider(2) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{separationWeight.toFixed(1)}</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(3) ? "active-slider-group" : ""}`}>
              <label>Alignment Weight</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={alignmentWeight}
                onChange={(e) => setAlignmentWeight(parseFloat(e.target.value))}
                style={{ borderColor: isActiveSlider(3) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{alignmentWeight.toFixed(1)}</span>
            </div>
          </>
        )}

        {/* Line Follower Controls */}
        {activeExperiment === "linefollower" && (
          <>
            <div className={`robotics-control-group ${isActiveSlider(0) ? "active-slider-group" : ""}`}>
              <label>Line Thickness</label>
              <input
                type="range"
                min="2"
                max="15"
                value={lineThickness}
                onChange={(e) => setLineThickness(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(0) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{lineThickness}px</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(1) ? "active-slider-group" : ""}`}>
              <label>Sensor Offset</label>
              <input
                type="range"
                min="5"
                max="30"
                value={sensorOffset}
                onChange={(e) => setSensorOffset(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(1) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{sensorOffset}px</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(2) ? "active-slider-group" : ""}`}>
              <label>Motor Speed</label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={motorSpeed}
                onChange={(e) => setMotorSpeed(parseFloat(e.target.value))}
                style={{ borderColor: isActiveSlider(2) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{motorSpeed}</span>
            </div>
          </>
        )}

        {/* Robotic Arm Controls */}
        {activeExperiment === "arm" && (
          <>
            {[0,1,2,3,4].map((idx) => (
              <div key={idx} className={`robotics-control-group ${isActiveSlider(idx) ? "active-slider-group" : ""}`}>
                <label>Joint {idx + 1} Angle</label>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={armJoints[idx]}
                  onChange={(e) => {
                    const newJoints = [...armJoints];
                    newJoints[idx] = parseInt(e.target.value);
                    setArmJoints(newJoints);
                  }}
                  style={{ borderColor: isActiveSlider(idx) ? "#00ff88" : "#1f5c7a" }}
                />
                <span>{armJoints[idx]}°</span>
              </div>
            ))}
            
            <div className="robotics-control-group">
              <label>Gripper</label>
              <button onClick={() => setGripperState(gripperState === "open" ? "closed" : "open")}>
                {gripperState === "open" ? "Open" : "Closed"}
              </button>
            </div>
          </>
        )}

        {/* Drone Controls */}
        {activeExperiment === "drone" && (
          <>
            <div className={`robotics-control-group ${isActiveSlider(0) ? "active-slider-group" : ""}`}>
              <label>Target Height</label>
              <input
                type="range"
                min="20"
                max="150"
                value={droneHeight}
                onChange={(e) => setDroneHeight(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(0) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{droneHeight}px</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(1) ? "active-slider-group" : ""}`}>
              <label>Wind Speed</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={windSpeed}
                onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                style={{ borderColor: isActiveSlider(1) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{windSpeed}</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(2) ? "active-slider-group" : ""}`}>
              <label>Stability Factor</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={stability}
                onChange={(e) => setStability(parseFloat(e.target.value))}
                style={{ borderColor: isActiveSlider(2) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{stability.toFixed(1)}</span>
            </div>
          </>
        )}

        {/* SLAM Controls */}
        {activeExperiment === "slam" && (
          <>
            <div className={`robotics-control-group ${isActiveSlider(0) ? "active-slider-group" : ""}`}>
              <label>Exploration Speed</label>
              <input
                type="range"
                min="1"
                max="8"
                value={explorationSpeed}
                onChange={(e) => setExplorationSpeed(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(0) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{explorationSpeed}</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(1) ? "active-slider-group" : ""}`}>
              <label>Scan Resolution</label>
              <input
                type="range"
                min="5"
                max="20"
                value={scanResolution}
                onChange={(e) => setScanResolution(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(1) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{scanResolution}°</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(2) ? "active-slider-group" : ""}`}>
              <label>Map Update Rate</label>
              <input
                type="range"
                min="10"
                max="60"
                value={mapUpdateRate}
                onChange={(e) => setMapUpdateRate(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(2) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{mapUpdateRate} Hz</span>
            </div>
          </>
        )}

        {/* Grasp Planning Controls */}
        {activeExperiment === "grasp" && (
          <>
            <div className={`robotics-control-group ${isActiveSlider(0) ? "active-slider-group" : ""}`}>
              <label>Object Size</label>
              <input
                type="range"
                min="10"
                max="80"
                value={objectSize}
                onChange={(e) => setObjectSize(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(0) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{objectSize}px</span>
            </div>

            <div className={`robotics-control-group ${isActiveSlider(1) ? "active-slider-group" : ""}`}>
              <label>Grasp Force</label>
              <input
                type="range"
                min="0"
                max="100"
                value={graspForce}
                onChange={(e) => setGraspForce(parseInt(e.target.value))}
                style={{ borderColor: isActiveSlider(1) ? "#00ff88" : "#1f5c7a" }}
              />
              <span>{graspForce}%</span>
            </div>

            <div className="robotics-control-group">
              <label>Grasp Type</label>
              <select
                value={graspType}
                onChange={(e) => setGraspType(e.target.value)}
              >
                <option value="parallel">Parallel Gripper</option>
                <option value="threefinger">Three-Finger</option>
                <option value="suction">Suction Cup</option>
                <option value="magnetic">Magnetic</option>
              </select>
            </div>
          </>
        )}

        <div className="robotics-keyboard-hint">
          <kbd>Q/E</kbd> Cycle sliders · <kbd>A/D</kbd> Adjust values · <kbd>1-9</kbd> Switch experiments · <kbd>Esc</kbd> Back
        </div>
      </div>
    </div>
  );
}