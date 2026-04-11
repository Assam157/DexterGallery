// components/robotics/LineFollower.jsx
import React, { useEffect, useRef, useState } from "react";
import "./RoboticsSubLab.css";

const LineFollower = ({ lineThickness, sensorOffset, motorSpeed }) => {
  const canvasRef = useRef(null);
  const [robot, setRobot] = useState({ x: 50, y: 200, angle: 0 });
  const [linePoints, setLinePoints] = useState([]);
  const W = 700;
  const H = 450;

  // Generate curved line
  useEffect(() => {
    const points = [];
    for (let t = 0; t <= 1; t += 0.02) {
      const x = 50 + t * 600;
      const y = 100 + Math.sin(t * Math.PI * 3) * 100 + Math.cos(t * Math.PI * 2) * 50;
      points.push({ x, y });
    }
    setLinePoints(points);
  }, []);

  // Line following logic
  useEffect(() => {
    const interval = setInterval(() => {
      // Find closest point on line
      let closestPoint = null;
      let minDist = Infinity;
      
      for (const point of linePoints) {
        const dx = point.x - robot.x;
        const dy = point.y - robot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          closestPoint = point;
        }
      }
      
      if (closestPoint) {
        const targetAngle = Math.atan2(closestPoint.y - robot.y, closestPoint.x - robot.x);
        let angleDiff = targetAngle - robot.angle;
        
        // Normalize angle difference
        if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        // PID-like steering
        const steering = angleDiff * 0.3;
        const newAngle = robot.angle + steering;
        
        // Update position
        const newX = robot.x + Math.cos(newAngle) * motorSpeed;
        const newY = robot.y + Math.sin(newAngle) * motorSpeed;
        
        setRobot({ x: newX, y: newY, angle: newAngle });
      }
      
      // Reset if reaches end
      if (robot.x > W - 50) {
        setRobot({ x: 50, y: 200, angle: 0 });
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [robot, linePoints, motorSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      
      // Draw line
      ctx.beginPath();
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = lineThickness;
      for (let i = 0; i < linePoints.length; i++) {
        if (i === 0) ctx.moveTo(linePoints[i].x, linePoints[i].y);
        else ctx.lineTo(linePoints[i].x, linePoints[i].y);
      }
      ctx.stroke();
      
      // Draw sensors
      const leftSensorX = robot.x + Math.cos(robot.angle - Math.PI / 4) * sensorOffset;
      const leftSensorY = robot.y + Math.sin(robot.angle - Math.PI / 4) * sensorOffset;
      const rightSensorX = robot.x + Math.cos(robot.angle + Math.PI / 4) * sensorOffset;
      const rightSensorY = robot.y + Math.sin(robot.angle + Math.PI / 4) * sensorOffset;
      
      ctx.fillStyle = "#ff6666";
      ctx.beginPath();
      ctx.arc(leftSensorX, leftSensorY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightSensorX, rightSensorY, 4, 0, Math.PI * 2);
      ctx.fill();
      
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
      
      // Draw stats
      ctx.fillStyle = "#00ffff";
      ctx.font = "bold 12px monospace";
      ctx.fillText(`Speed: ${motorSpeed}`, 20, 30);
    };
    
    draw();
  }, [robot, linePoints, lineThickness, sensorOffset, motorSpeed]);

  return (
    <div className="robotics-sub-lab">
      <canvas ref={canvasRef} className="robotics-canvas" />
      <div className="robotics-sub-title">📍 Line Follower Robot</div>
      <div className="robotics-stats">
        Position: ({Math.round(robot.x)}, {Math.round(robot.y)})<br/>
        Angle: {Math.round(robot.angle * 180 / Math.PI)}°
      </div>
    </div>
  );
};

export default LineFollower;