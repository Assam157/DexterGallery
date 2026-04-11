// components/robotics/GraspPlanning.jsx
import React, { useEffect, useRef, useState } from "react";
import "./RoboticsSubLab.css";

const GraspPlanning = ({ objectSize, graspForce, graspType }) => {
  const canvasRef = useRef(null);
  const [grasping, setGrasping] = useState(false);
  const [graspSuccess, setGraspSuccess] = useState(false);
  const W = 700;
  const H = 450;
  const objectX = W / 2;
  const objectY = H / 2;

  useEffect(() => {
    const interval = setInterval(() => {
      if (grasping) {
        const success = graspForce > 50 && (graspType !== "parallel" || objectSize < 50);
        setGraspSuccess(success);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [grasping, graspForce, graspType, objectSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      
      // Draw object
      ctx.fillStyle = "#ff6666";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ff6666";
      
      if (graspType === "parallel") {
        ctx.fillRect(objectX - objectSize/2, objectY - objectSize/2, objectSize, objectSize);
      } else if (graspType === "threefinger") {
        ctx.beginPath();
        ctx.arc(objectX, objectY, objectSize/2, 0, Math.PI * 2);
        ctx.fill();
      } else if (graspType === "suction") {
        ctx.fillRect(objectX - objectSize/2, objectY - objectSize/2, objectSize, objectSize);
        ctx.fillStyle = "#ff8888";
        ctx.beginPath();
        ctx.arc(objectX, objectY, objectSize/4, 0, Math.PI * 2);
        ctx.fill();
      } else if (graspType === "magnetic") {
        ctx.fillStyle = "#8888ff";
        ctx.fillRect(objectX - objectSize/2, objectY - objectSize/2, objectSize, objectSize);
        ctx.fillStyle = "#fff";
        ctx.font = "20px monospace";
        ctx.fillText("N", objectX - 10, objectY + 8);
        ctx.fillText("S", objectX + 10, objectY + 8);
      }
      
      ctx.shadowBlur = 0;
      
      // Draw gripper
      const gripperWidth = 30;
      const gripperHeight = 40;
      const gripperX = objectX - gripperWidth/2;
      const gripperY = objectY - gripperHeight - 20;
      
      if (grasping) {
        // Gripper closed
        ctx.fillStyle = graspSuccess ? "#00ff88" : "#ffaa44";
        ctx.fillRect(gripperX, gripperY, gripperWidth, gripperHeight);
        ctx.fillStyle = "#fff";
        ctx.fillRect(gripperX + 5, gripperY + gripperHeight/2, gripperWidth - 10, 5);
      } else {
        // Gripper open
        ctx.fillStyle = "#888";
        ctx.fillRect(gripperX, gripperY, gripperWidth/2, gripperHeight);
        ctx.fillRect(gripperX + gripperWidth/2, gripperY, gripperWidth/2, gripperHeight);
      }
      
      // Draw arm
      ctx.beginPath();
      ctx.moveTo(W/2, 20);
      ctx.lineTo(gripperX + gripperWidth/2, gripperY);
      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = 8;
      ctx.stroke();
      
      // Draw force meter
      ctx.fillStyle = "#00ffff";
      ctx.fillRect(20, H - 80, graspForce, 20);
      ctx.fillStyle = "#fff";
      ctx.fillText(`Grasp Force: ${graspForce}%`, 20, H - 90);
      
      // Draw success indicator
      if (graspSuccess && grasping) {
        ctx.fillStyle = "#00ff88";
        ctx.font = "bold 20px monospace";
        ctx.fillText("✓ GRASP SUCCESSFUL!", W/2 - 100, 50);
      } else if (grasping && !graspSuccess) {
        ctx.fillStyle = "#ff6666";
        ctx.font = "bold 20px monospace";
        ctx.fillText("✗ GRASP FAILED!", W/2 - 80, 50);
      }
      
      // Draw info
      ctx.fillStyle = "#00ffff";
      ctx.font = "12px monospace";
      ctx.fillText(`Grasp Type: ${graspType.toUpperCase()}`, 20, 30);
      ctx.fillText(`Object Size: ${objectSize}px`, 20, 50);
    };
    
    draw();
  }, [objectSize, graspForce, graspType, grasping, graspSuccess]);

  return (
    <div className="robotics-sub-lab">
      <canvas ref={canvasRef} className="robotics-canvas" />
      <div className="robotics-sub-title">✋ Grasp Planning - Robotic Manipulation</div>
      <div className="robotics-stats">
        <button 
          onClick={() => setGrasping(true)} 
          style={{ background: "#00ff88", border: "none", padding: "5px 10px", margin: "5px", cursor: "pointer" }}
        >
          🤖 Execute Grasp
        </button>
        <button 
          onClick={() => { setGrasping(false); setGraspSuccess(false); }} 
          style={{ background: "#ff6666", border: "none", padding: "5px 10px", margin: "5px", cursor: "pointer" }}
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default GraspPlanning;