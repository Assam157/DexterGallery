// components/robotics/DroneSimulator.jsx
import React, { useEffect, useRef, useState } from "react";
import "./RoboticsSubLab.css";

const DroneSimulator = ({ droneHeight, windSpeed, stability }) => {
  const canvasRef = useRef(null);
  const [drone, setDrone] = useState({ x: 350, y: 200, angle: 0, rotors: [0, 0, 0, 0] });
  const W = 700;
  const H = 450;

  useEffect(() => {
    const interval = setInterval(() => {
      setDrone(prev => {
        // PID controller for height
        const heightError = droneHeight - prev.y;
        const thrust = heightError * 0.05 * stability;
        
        // Wind effect
        const windEffect = (Math.random() - 0.5) * windSpeed * 0.5;
        
        // Rotor speeds
        const rotors = [
          Math.max(0, 0.5 + thrust + windEffect),
          Math.max(0, 0.5 + thrust - windEffect),
          Math.max(0, 0.5 + thrust + windEffect * 0.5),
          Math.max(0, 0.5 + thrust - windEffect * 0.5)
        ];
        
        // Update position
        let newY = prev.y + (thrust - 0.5) * 2;
        newY = Math.min(H - 50, Math.max(50, newY));
        
        // Drift from wind
        let newX = prev.x + windEffect * 2;
        newX = Math.min(W - 50, Math.max(50, newX));
        
        // Calculate angle based on rotor imbalance
        const angle = (rotors[0] - rotors[1] + rotors[2] - rotors[3]) * 10;
        
        return { x: newX, y: newY, angle, rotors };
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [droneHeight, windSpeed, stability]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      
      // Draw ground
      ctx.fillStyle = "#1a3a1a";
      ctx.fillRect(0, H - 30, W, 30);
      ctx.fillStyle = "#2a5a2a";
      ctx.fillRect(0, H - 35, W, 5);
      
      // Draw altitude lines
      ctx.strokeStyle = "rgba(0, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      for (let y = H - 50; y > 50; y -= 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
        ctx.fillStyle = "#8f8";
        ctx.fillText(`${H - y}px`, 10, y);
      }
      
      // Draw drone body
      ctx.save();
      ctx.translate(drone.x, drone.y);
      ctx.rotate(drone.angle * Math.PI / 180);
      
      // Drone frame
      ctx.fillStyle = "#00ffff";
      ctx.fillRect(-20, -5, 40, 10);
      ctx.fillRect(-5, -20, 10, 40);
      
      // Rotors
      const rotorSpeeds = drone.rotors;
      const positions = [[-15, -15], [15, -15], [-15, 15], [15, 15]];
      
      for (let i = 0; i < positions.length; i++) {
        const [px, py] = positions[i];
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + rotorSpeeds[i] * 0.5})`;
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Rotor blades
        ctx.fillStyle = "#aaa";
        for (let r = 0; r < 2; r++) {
          ctx.save();
          ctx.rotate(Date.now() * 0.02 * rotorSpeeds[i] + r * Math.PI);
          ctx.fillRect(px - 2, py - 8, 4, 16);
          ctx.restore();
        }
      }
      
      // Center light
      ctx.fillStyle = "#ff4444";
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
      // Draw stats
      ctx.fillStyle = "#00ffff";
      ctx.font = "bold 12px monospace";
      ctx.fillText(`Altitude: ${(H - drone.y).toFixed(0)}px`, 20, 30);
      ctx.fillText(`Target: ${droneHeight}px`, 20, 50);
      ctx.fillText(`Stability: ${stability.toFixed(1)}`, 20, 70);
      ctx.fillText(`Wind: ${windSpeed}`, 20, 90);
      
      // Draw rotor speeds
      for (let i = 0; i < drone.rotors.length; i++) {
        ctx.fillStyle = `hsl(${120 * drone.rotors[i]}, 70%, 50%)`;
        ctx.fillRect(20, 110 + i * 15, drone.rotors[i] * 100, 8);
        ctx.fillStyle = "#fff";
        ctx.fillText(`R${i + 1}`, 20, 118 + i * 15);
      }
    };
    
    draw();
  }, [drone, droneHeight, stability, windSpeed]);

  return (
    <div className="robotics-sub-lab">
      <canvas ref={canvasRef} className="robotics-canvas" />
      <div className="robotics-sub-title">🚁 Quadcopter Drone - Flight Control</div>
      <div className="robotics-stats">
        Position: ({Math.round(drone.x)}, {Math.round(drone.y)})<br/>
        Angle: {Math.round(drone.angle)}°
      </div>
    </div>
  );
};

export default DroneSimulator;