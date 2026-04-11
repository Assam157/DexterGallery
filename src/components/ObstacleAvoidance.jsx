// components/robotics/ObstacleAvoidance.jsx
import React, { useEffect, useRef, useState } from "react";
import "./RoboticsSubLab.css";

const ObstacleAvoidance = ({ sensorRange, robotSpeed, avoidanceMode }) => {
  const canvasRef = useRef(null);
  const [robot, setRobot] = useState({ x: 100, y: 100, angle: 0 });
  const [obstacles, setObstacles] = useState([]);
  const W = 700;
  const H = 450;

  // Generate random obstacles
  useEffect(() => {
    const newObstacles = [];
    for (let i = 0; i < 8; i++) {
      newObstacles.push({
        x: 150 + Math.random() * 400,
        y: 100 + Math.random() * 300,
        radius: 15 + Math.random() * 20
      });
    }
    setObstacles(newObstacles);
  }, []);

  // Robot movement with obstacle avoidance
  useEffect(() => {
    const interval = setInterval(() => {
      let targetAngle = Math.atan2(250 - robot.y, 350 - robot.x);
      
      // Check obstacles
      for (const obs of obstacles) {
        const dx = obs.x - robot.x;
        const dy = obs.y - robot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < sensorRange) {
          if (avoidanceMode === "potential") {
            const avoidAngle = Math.atan2(dy, dx) + Math.PI / 2;
            targetAngle = avoidAngle;
          } else if (avoidanceMode === "bug") {
            targetAngle = Math.atan2(dy, dx) + Math.PI;
          }
        }
      }
      
      // Update robot position
      const newX = robot.x + Math.cos(targetAngle) * robotSpeed;
      const newY = robot.y + Math.sin(targetAngle) * robotSpeed;
      
      // Boundary check
      if (newX > 30 && newX < W - 30 && newY > 30 && newY < H - 30) {
        setRobot({ x: newX, y: newY, angle: targetAngle });
      }
      
      // Reset if reaches goal
      if (Math.abs(robot.x - 350) < 20 && Math.abs(robot.y - 250) < 20) {
        setRobot({ x: 100, y: 100, angle: 0 });
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [robot, obstacles, sensorRange, robotSpeed, avoidanceMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      
      // Draw goal
      ctx.fillStyle = "#00ff88";
      ctx.beginPath();
      ctx.arc(350, 250, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "10px monospace";
      ctx.fillText("GOAL", 340, 245);
      
      // Draw obstacles
      for (const obs of obstacles) {
        ctx.fillStyle = "#ff6666";
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillText("⚠️", obs.x - 5, obs.y - 5);
      }
      
      // Draw sensor range
      ctx.beginPath();
      ctx.arc(robot.x, robot.y, sensorRange, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
      ctx.stroke();
      
      // Draw robot
      ctx.fillStyle = "#ffd966";
      ctx.beginPath();
      ctx.arc(robot.x, robot.y, 12, 0, Math.PI * 2);
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
      
      // Draw path history
      ctx.fillStyle = "#00ffff";
      ctx.beginPath();
      ctx.arc(robot.x, robot.y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw mode label
      ctx.fillStyle = "#00ffff";
      ctx.font = "bold 12px monospace";
      ctx.fillText(`Mode: ${avoidanceMode.toUpperCase()}`, 20, 30);
    };
    
    draw();
  }, [robot, obstacles, sensorRange, avoidanceMode]);

  return (
    <div className="robotics-sub-lab">
      <canvas ref={canvasRef} className="robotics-canvas" />
      <div className="robotics-sub-title">🚧 Obstacle Avoidance - {avoidanceMode.toUpperCase()}</div>
      <div className="robotics-stats">
        Position: ({Math.round(robot.x)}, {Math.round(robot.y)})<br/>
        Distance to Goal: {Math.sqrt(Math.pow(robot.x - 350, 2) + Math.pow(robot.y - 250, 2)).toFixed(0)}px
      </div>
    </div>
  );
};

export default ObstacleAvoidance;