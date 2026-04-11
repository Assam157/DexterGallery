// components/robotics/InverseKinematics.jsx
import React, { useEffect, useRef } from "react";
import "./RoboticsSubLab.css";

const InverseKinematics = ({ jointAngle1, jointAngle2, targetX, targetY }) => {
  const canvasRef = useRef(null);
  const W = 700;
  const H = 450;
  const originX = 150;
  const originY = H - 80;
  const armLength1 = 100;
  const armLength2 = 80;

  // Calculate end effector position from joint angles
  const rad1 = (jointAngle1 * Math.PI) / 180;
  const rad2 = (jointAngle2 * Math.PI) / 180;
  
  const elbowX = originX + Math.cos(rad1) * armLength1;
  const elbowY = originY - Math.sin(rad1) * armLength1;
  
  const endX = elbowX + Math.cos(rad1 + rad2) * armLength2;
  const endY = elbowY - Math.sin(rad1 + rad2) * armLength2;

  // Calculate required angles to reach target (inverse kinematics)
  const dx = targetX - originX;
  const dy = -(targetY - originY);
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  const targetAngle1 = Math.acos((armLength1 * armLength1 + distance * distance - armLength2 * armLength2) / (2 * armLength1 * distance)) + Math.atan2(dy, dx);
  const targetAngle2 = Math.acos((armLength1 * armLength1 + armLength2 * armLength2 - distance * distance) / (2 * armLength1 * armLength2));
  
  const targetAngle1Deg = (targetAngle1 * 180) / Math.PI;
  const targetAngle2Deg = (targetAngle2 * 180) / Math.PI;
  
  const isReachable = distance <= armLength1 + armLength2 && distance >= Math.abs(armLength1 - armLength2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      
      // Draw grid
      ctx.strokeStyle = "#1f3a4f";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      
      // Draw work area
      ctx.beginPath();
      ctx.arc(originX, originY, armLength1 + armLength2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 255, 255, 0.1)";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw target point
      ctx.fillStyle = "#ff6666";
      ctx.beginPath();
      ctx.arc(targetX, targetY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "10px monospace";
      ctx.fillText("Target", targetX - 15, targetY - 10);
      
      // Draw reachable indicator
      if (isReachable) {
        ctx.strokeStyle = "#00ff88";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = "#ff6666";
        ctx.font = "bold 14px monospace";
        ctx.fillText("TARGET UNREACHABLE", targetX - 80, targetY - 20);
      }
      
      // Draw arm
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = "#ffd966";
      ctx.lineWidth = 6;
      ctx.stroke();
      
      // Draw joints
      ctx.fillStyle = "#00ffff";
      ctx.beginPath();
      ctx.arc(originX, originY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(elbowX, elbowY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffd966";
      ctx.beginPath();
      ctx.arc(endX, endY, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw angles
      ctx.fillStyle = "#8f8";
      ctx.font = "10px monospace";
      ctx.fillText(`θ₁: ${jointAngle1}°`, originX + 10, originY - 15);
      ctx.fillText(`θ₂: ${jointAngle2}°`, elbowX + 10, elbowY - 10);
      
      // Draw IK solution
      if (isReachable) {
        ctx.fillStyle = "#00ff88";
        ctx.font = "bold 10px monospace";
        ctx.fillText(`Required θ₁: ${Math.round(targetAngle1Deg)}°`, W - 150, 30);
        ctx.fillText(`Required θ₂: ${Math.round(targetAngle2Deg)}°`, W - 150, 50);
      }
    };
    
    draw();
  }, [jointAngle1, jointAngle2, targetX, targetY, elbowX, elbowY, endX, endY, isReachable, targetAngle1Deg, targetAngle2Deg]);

  return (
    <div className="robotics-sub-lab">
      <canvas ref={canvasRef} className="robotics-canvas" />
    </div>
  );
};

export default InverseKinematics;