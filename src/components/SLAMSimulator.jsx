// components/robotics/SLAMSimulator.jsx
import React, { useEffect, useRef, useState } from "react";
import "./RoboticsSubLab.css";

const SLAMSimulator = ({ explorationSpeed, scanResolution, mapUpdateRate }) => {
  const canvasRef = useRef(null);
  const [robot, setRobot] = useState({ x: 350, y: 350, angle: 0 });
  const [map, setMap] = useState([]);
  const [landmarks, setLandmarks] = useState([]);
  const W = 700;
  const H = 450;

  // Generate random landmarks
  useEffect(() => {
    const newLandmarks = [];
    for (let i = 0; i < 15; i++) {
      newLandmarks.push({
        x: 50 + Math.random() * 600,
        y: 50 + Math.random() * 350,
        id: i
      });
    }
    setLandmarks(newLandmarks);
  }, []);

  // Robot exploration
  useEffect(() => {
    const interval = setInterval(() => {
      setRobot(prev => {
        // Spiral exploration pattern
        const t = Date.now() * 0.001 * explorationSpeed;
        const radius = t * 20;
        const newX = 350 + Math.cos(t) * radius;
        const newY = 350 + Math.sin(t * 0.7) * radius;
        
        return {
          x: Math.min(W - 30, Math.max(30, newX)),
          y: Math.min(H - 30, Math.max(30, newY)),
          angle: Math.atan2(newY - prev.y, newX - prev.x)
        };
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [explorationSpeed]);

  // Update map with sensor readings
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate LIDAR scan
      const newMapPoints = [];
      for (let angle = 0; angle < 360; angle += scanResolution) {
        const rad = (angle + robot.angle * 180 / Math.PI) * Math.PI / 180;
        let maxDist = 200;
        
        for (const landmark of landmarks) {
          const dx = landmark.x - robot.x;
          const dy = landmark.y - robot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const landmarkAngle = Math.atan2(dy, dx);
          
          if (Math.abs(landmarkAngle - rad) < 0.1 && dist < maxDist) {
            maxDist = dist;
          }
        }
        
        const scanX = robot.x + Math.cos(rad) * maxDist;
        const scanY = robot.y + Math.sin(rad) * maxDist;
        newMapPoints.push({ x: scanX, y: scanY });
      }
      
      setMap(prev => [...prev.slice(-500), ...newMapPoints]);
    }, mapUpdateRate);
    
    return () => clearInterval(interval);
  }, [robot, landmarks, scanResolution, mapUpdateRate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      
      // Draw map (built from sensor data)
      for (const point of map) {
        ctx.fillStyle = `rgba(0, 255, 255, ${0.1 + Math.random() * 0.1})`;
        ctx.fillRect(point.x, point.y, 2, 2);
      }
      
      // Draw true landmarks
      for (const landmark of landmarks) {
        ctx.fillStyle = "#ff6666";
        ctx.beginPath();
        ctx.arc(landmark.x, landmark.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillText(`L${landmark.id}`, landmark.x - 8, landmark.y - 5);
      }
      
      // Draw robot
      ctx.fillStyle = "#ffd966";
      ctx.beginPath();
      ctx.arc(robot.x, robot.y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw robot direction
      const arrowX = robot.x + Math.cos(robot.angle) * 15;
      const arrowY = robot.y + Math.sin(robot.angle) * 15;
      ctx.beginPath();
      ctx.moveTo(robot.x, robot.y);
      ctx.lineTo(arrowX, arrowY);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw LIDAR rays
      for (let angle = 0; angle < 360; angle += 30) {
        const rad = (angle + robot.angle * 180 / Math.PI) * Math.PI / 180;
        const endX = robot.x + Math.cos(rad) * 100;
        const endY = robot.y + Math.sin(rad) * 100;
        ctx.beginPath();
        ctx.moveTo(robot.x, robot.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = "rgba(0, 255, 255, 0.1)";
        ctx.stroke();
      }
      
      // Draw stats
      ctx.fillStyle = "#00ffff";
      ctx.font = "bold 12px monospace";
      ctx.fillText(`Map Points: ${map.length}`, 20, 30);
      ctx.fillText(`Landmarks: ${landmarks.length}`, 20, 50);
      ctx.fillText(`Exploration Speed: ${explorationSpeed}`, 20, 70);
    };
    
    draw();
  }, [robot, map, landmarks, explorationSpeed]);

  return (
    <div className="robotics-sub-lab">
      <canvas ref={canvasRef} className="robotics-canvas" />
      <div className="robotics-sub-title">🗺️ SLAM - Simultaneous Localization and Mapping</div>
      <div className="robotics-stats">
        Robot: ({Math.round(robot.x)}, {Math.round(robot.y)})<br/>
        Map Coverage: {Math.min(100, Math.round(map.length / 10))}%
      </div>
    </div>
  );
};

export default SLAMSimulator;