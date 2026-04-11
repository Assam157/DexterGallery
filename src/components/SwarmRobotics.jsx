// components/robotics/SwarmRobotics.jsx
import React, { useEffect, useRef, useState } from "react";
import "./RoboticsSubLab.css";

const SwarmRobotics = ({ swarmSize, cohesionWeight, separationWeight, alignmentWeight }) => {
  const canvasRef = useRef(null);
  const [boids, setBoids] = useState([]);
  const W = 700;
  const H = 450;

  // Initialize boids
  useEffect(() => {
    const newBoids = [];
    for (let i = 0; i < swarmSize; i++) {
      newBoids.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
      });
    }
    setBoids(newBoids);
  }, [swarmSize]);

  // Update boids with flocking rules
  useEffect(() => {
    const interval = setInterval(() => {
      setBoids(prev => prev.map(boid => {
        let cohesionX = 0, cohesionY = 0;
        let separationX = 0, separationY = 0;
        let alignmentX = 0, alignmentY = 0;
        let neighborCount = 0;
        
        // Calculate flocking forces
        for (const other of prev) {
          if (other === boid) continue;
          
          const dx = other.x - boid.x;
          const dy = other.y - boid.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 50) {
            neighborCount++;
            cohesionX += other.x;
            cohesionY += other.y;
            alignmentX += other.vx;
            alignmentY += other.vy;
            
            if (dist < 30) {
              separationX -= dx / dist;
              separationY -= dy / dist;
            }
          }
        }
        
        if (neighborCount > 0) {
          cohesionX = (cohesionX / neighborCount - boid.x) * cohesionWeight;
          cohesionY = (cohesionY / neighborCount - boid.y) * cohesionWeight;
          alignmentX = (alignmentX / neighborCount - boid.vx) * alignmentWeight;
          alignmentY = (alignmentY / neighborCount - boid.vy) * alignmentWeight;
        }
        
        separationX *= separationWeight;
        separationY *= separationWeight;
        
        // Update velocity
        let newVx = boid.vx + cohesionX + separationX + alignmentX;
        let newVy = boid.vy + cohesionY + separationY + alignmentY;
        
        // Speed limit
        const speed = Math.sqrt(newVx * newVx + newVy * newVy);
        if (speed > 5) {
          newVx = (newVx / speed) * 5;
          newVy = (newVy / speed) * 5;
        }
        
        // Update position
        let newX = boid.x + newVx;
        let newY = boid.y + newVy;
        
        // Wrap around edges
        if (newX < 0) newX = W;
        if (newX > W) newX = 0;
        if (newY < 0) newY = H;
        if (newY > H) newY = 0;
        
        return { x: newX, y: newY, vx: newVx, vy: newVy };
      }));
    }, 50);
    
    return () => clearInterval(interval);
  }, [cohesionWeight, separationWeight, alignmentWeight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      
      // Draw connections between nearby boids
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i < boids.length; i++) {
        for (let j = i + 1; j < boids.length; j++) {
          const dx = boids[i].x - boids[j].x;
          const dy = boids[i].y - boids[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 50) {
            ctx.beginPath();
            ctx.moveTo(boids[i].x, boids[i].y);
            ctx.lineTo(boids[j].x, boids[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Draw boids
      for (const boid of boids) {
        ctx.fillStyle = "#ffd966";
        ctx.beginPath();
        ctx.arc(boid.x, boid.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw direction
        const angle = Math.atan2(boid.vy, boid.vx);
        const arrowX = boid.x + Math.cos(angle) * 10;
        const arrowY = boid.y + Math.sin(angle) * 10;
        ctx.beginPath();
        ctx.moveTo(boid.x, boid.y);
        ctx.lineTo(arrowX, arrowY);
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Draw stats
      ctx.fillStyle = "#00ffff";
      ctx.font = "bold 12px monospace";
      ctx.fillText(`Swarm Size: ${boids.length}`, 20, 30);
      ctx.fillText(`Cohesion: ${cohesionWeight} | Separation: ${separationWeight} | Alignment: ${alignmentWeight}`, 20, 55);
    };
    
    draw();
  }, [boids, cohesionWeight, separationWeight, alignmentWeight]);

  return (
    <div className="robotics-sub-lab">
      <canvas ref={canvasRef} className="robotics-canvas" />
      <div className="robotics-sub-title">🐝 Swarm Robotics - Boid Algorithm</div>
    </div>
  );
};

export default SwarmRobotics;