// components/robotics/PIDController.jsx
import React, { useEffect, useRef, useState } from "react";
import "./RoboticsSubLab.css";

const PIDController = ({ kp, ki, kd, targetPosition }) => {
  const canvasRef = useRef(null);
  const [position, setPosition] = useState(0);
  const [integral, setIntegral] = useState(0);
  const [prevError, setPrevError] = useState(0);
  const [time, setTime] = useState(0);
  const [history, setHistory] = useState([]);
  const W = 700;
  const H = 400;

  useEffect(() => {
    const interval = setInterval(() => {
      const error = targetPosition - position;
      const newIntegral = Math.min(100, Math.max(-100, integral + error * 0.1));
      const derivative = (error - prevError) / 0.1;
      const output = kp * error + ki * newIntegral + kd * derivative;
      
      setPosition(prev => Math.min(200, Math.max(0, prev + output * 0.1)));
      setIntegral(newIntegral);
      setPrevError(error);
      setTime(prev => prev + 1);
      setHistory(prev => [...prev.slice(-100), { time: time, position, target: targetPosition }]);
    }, 100);
    
    return () => clearInterval(interval);
  }, [position, targetPosition, integral, prevError, kp, ki, kd, time]);

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
      for (let y = 0; y < H; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      
      // Draw target line
      ctx.beginPath();
      ctx.moveTo(0, H - targetPosition);
      ctx.lineTo(W, H - targetPosition);
      ctx.strokeStyle = "#ff6666";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.fillStyle = "#ff6666";
      ctx.fillText("Target", W - 50, H - targetPosition - 5);
      
      // Draw position line
      ctx.beginPath();
      ctx.moveTo(0, H - position);
      ctx.lineTo(W, H - position);
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.fillStyle = "#00ff88";
      ctx.fillText("Current", W - 50, H - position - 5);
      
      // Draw history
      ctx.beginPath();
      ctx.strokeStyle = "#ffd966";
      ctx.lineWidth = 2;
      for (let i = 0; i < history.length; i++) {
        const x = (i / 100) * W;
        const y = H - history[i].position;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Draw error
      const error = Math.abs(targetPosition - position);
      ctx.fillStyle = error < 5 ? "#00ff88" : "#ff6666";
      ctx.font = "bold 14px monospace";
      ctx.fillText(`Error: ${error.toFixed(1)}`, 20, 50);
      ctx.fillText(`P: ${kp.toFixed(2)} | I: ${ki.toFixed(2)} | D: ${kd.toFixed(2)}`, 20, 80);
    };
    
    draw();
  }, [position, targetPosition, history, kp, ki, kd]);

  return (
    <div className="robotics-sub-lab">
      <canvas ref={canvasRef} className="robotics-canvas" />
      <div className="robotics-sub-title">🎯 PID Controller - Position Control</div>
      <div className="robotics-stats">
        Current: {position.toFixed(1)}<br/>
        Target: {targetPosition}
      </div>
    </div>
  );
};

export default PIDController;