// components/robotics/RoboticArm.jsx
import React, { useEffect, useRef } from "react";
import "./RoboticsSubLab.css";

const RoboticArm = ({ armJoints, gripperState }) => {
  const canvasRef = useRef(null);
  const W = 700;
  const H = 450;
  const baseX = W / 2;
  const baseY = H - 50;
  
  const lengths = [60, 50, 40, 30, 25];
  let currentX = baseX;
  let currentY = baseY;
  const jointPositions = [{ x: currentX, y: currentY }];

  for (let i = 0; i < armJoints.length; i++) {
    const angle = (armJoints[i] * Math.PI) / 180;
    currentX += Math.cos(angle) * lengths[i];
    currentY -= Math.sin(angle) * lengths[i];
    jointPositions.push({ x: currentX, y: currentY });
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      
      // Draw work envelope
      ctx.beginPath();
      ctx.arc(baseX, baseY, lengths.reduce((a, b) => a + b, 0), 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 255, 255, 0.1)";
      ctx.stroke();
      
      // Draw arm segments
      for (let i = 0; i < jointPositions.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(jointPositions[i].x, jointPositions[i].y);
        ctx.lineTo(jointPositions[i + 1].x, jointPositions[i + 1].y);
        ctx.strokeStyle = `hsl(${i * 60}, 70%, 60%)`;
        ctx.lineWidth = 12 - i;
        ctx.stroke();
      }
      
      // Draw joints
      for (let i = 0; i < jointPositions.length; i++) {
        ctx.fillStyle = i === 0 ? "#00ffff" : "#ffd966";
        ctx.beginPath();
        ctx.arc(jointPositions[i].x, jointPositions[i].y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw joint labels
        ctx.fillStyle = "#fff";
        ctx.font = "10px monospace";
        ctx.fillText(`J${i}`, jointPositions[i].x - 10, jointPositions[i].y - 5);
      }
      
      // Draw gripper
      const endX = jointPositions[jointPositions.length - 1].x;
      const endY = jointPositions[jointPositions.length - 1].y;
      
      if (gripperState === "open") {
        ctx.beginPath();
        ctx.moveTo(endX - 10, endY);
        ctx.lineTo(endX - 5, endY + 15);
        ctx.lineTo(endX, endY + 10);
        ctx.fillStyle = "#888";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(endX + 10, endY);
        ctx.lineTo(endX + 5, endY + 15);
        ctx.lineTo(endX, endY + 10);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.rect(endX - 8, endY, 16, 20);
        ctx.fillStyle = "#ffd966";
        ctx.fill();
      }
      
      // Draw angles
      ctx.fillStyle = "#00ffff";
      ctx.font = "10px monospace";
      for (let i = 0; i < armJoints.length; i++) {
        ctx.fillText(`θ${i + 1}: ${armJoints[i]}°`, 20, 30 + i * 20);
      }
    };
    
    draw();
  }, [armJoints, gripperState, jointPositions]);

  return (
    <div className="robotics-sub-lab">
      <canvas ref={canvasRef} className="robotics-canvas" />
      <div className="robotics-sub-title">🦿 5-DOF Robotic Arm</div>
      <div className="robotics-stats">
        End Effector: ({Math.round(jointPositions[jointPositions.length - 1].x)}, {Math.round(jointPositions[jointPositions.length - 1].y)})<br/>
        Gripper: {gripperState.toUpperCase()}
      </div>
    </div>
  );
};

export default RoboticArm;