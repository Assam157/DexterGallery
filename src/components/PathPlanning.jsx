// components/robotics/PathPlanning.jsx
import React, { useEffect, useRef, useState } from "react";
import "./RoboticsSubLab.css";

const PathPlanning = ({ mapSize, algorithm, obstacleDensity }) => {
  const canvasRef = useRef(null);
  const [grid, setGrid] = useState([]);
  const [path, setPath] = useState([]);
  const W = 700;
  const H = 450;
  const cellSize = Math.min(W / mapSize, H / mapSize);
  const offsetX = (W - cellSize * mapSize) / 2;
  const offsetY = (H - cellSize * mapSize) / 2;

  // Generate random obstacles
  useEffect(() => {
    const newGrid = Array(mapSize).fill().map(() => Array(mapSize).fill(0));
    const obstacleCount = Math.floor(mapSize * mapSize * obstacleDensity);
    
    for (let i = 0; i < obstacleCount; i++) {
      const x = Math.floor(Math.random() * mapSize);
      const y = Math.floor(Math.random() * mapSize);
      if ((x !== 0 || y !== 0) && (x !== mapSize - 1 || y !== mapSize - 1)) {
        newGrid[x][y] = 1;
      }
    }
    setGrid(newGrid);
  }, [mapSize, obstacleDensity]);

  // A* Algorithm
  const findPath = () => {
    const start = { x: 0, y: 0 };
    const goal = { x: mapSize - 1, y: mapSize - 1 };
    
    const openSet = [start];
    const cameFrom = {};
    const gScore = {};
    const fScore = {};
    
    for (let i = 0; i < mapSize; i++) {
      for (let j = 0; j < mapSize; j++) {
        gScore[`${i},${j}`] = Infinity;
        fScore[`${i},${j}`] = Infinity;
      }
    }
    gScore[`${start.x},${start.y}`] = 0;
    fScore[`${start.x},${start.y}`] = heuristic(start, goal);
    
    while (openSet.length > 0) {
      let current = openSet.reduce((a, b) => fScore[`${a.x},${a.y}`] < fScore[`${b.x},${b.y}`] ? a : b);
      
      if (current.x === goal.x && current.y === goal.y) {
        const path = [];
        let curr = current;
        while (cameFrom[`${curr.x},${curr.y}`]) {
          path.unshift(curr);
          curr = cameFrom[`${curr.x},${curr.y}`];
        }
        path.unshift(start);
        return path;
      }
      
      const index = openSet.findIndex(p => p.x === current.x && p.y === current.y);
      openSet.splice(index, 1);
      
      const neighbors = getNeighbors(current);
      for (const neighbor of neighbors) {
        const tentativeG = gScore[`${current.x},${current.y}`] + 1;
        if (tentativeG < gScore[`${neighbor.x},${neighbor.y}`]) {
          cameFrom[`${neighbor.x},${neighbor.y}`] = current;
          gScore[`${neighbor.x},${neighbor.y}`] = tentativeG;
          fScore[`${neighbor.x},${neighbor.y}`] = tentativeG + heuristic(neighbor, goal);
          if (!openSet.some(p => p.x === neighbor.x && p.y === neighbor.y)) {
            openSet.push(neighbor);
          }
        }
      }
    }
    return [];
  };

  const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  
  const getNeighbors = (node) => {
    const neighbors = [];
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dx, dy] of dirs) {
      const x = node.x + dx;
      const y = node.y + dy;
      if (x >= 0 && x < mapSize && y >= 0 && y < mapSize && grid[x][y] !== 1) {
        neighbors.push({ x, y });
      }
    }
    return neighbors;
  };

  useEffect(() => {
    const newPath = findPath();
    setPath(newPath);
  }, [grid, algorithm]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      
      // Draw grid
      for (let i = 0; i < mapSize; i++) {
        for (let j = 0; j < mapSize; j++) {
          const x = offsetX + j * cellSize;
          const y = offsetY + i * cellSize;
          
          if (grid[i][j] === 1) {
            ctx.fillStyle = "#4a4a6a";
            ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
          } else if (i === 0 && j === 0) {
            ctx.fillStyle = "#00ff88";
            ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
          } else if (i === mapSize - 1 && j === mapSize - 1) {
            ctx.fillStyle = "#ff6666";
            ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
          } else {
            ctx.fillStyle = "#1a1a3a";
            ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
          }
          
          ctx.strokeStyle = "#2a2a4a";
          ctx.strokeRect(x, y, cellSize - 1, cellSize - 1);
        }
      }
      
      // Draw path
      if (path.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = "#ffd966";
        ctx.lineWidth = 3;
        for (let i = 0; i < path.length; i++) {
          const x = offsetX + path[i].y * cellSize + cellSize / 2;
          const y = offsetY + path[i].x * cellSize + cellSize / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Draw path nodes
        for (const node of path) {
          const x = offsetX + node.y * cellSize + cellSize / 2;
          const y = offsetY + node.x * cellSize + cellSize / 2;
          ctx.fillStyle = "#ffd966";
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Draw algorithm label
      ctx.fillStyle = "#00ffff";
      ctx.font = "bold 12px monospace";
      ctx.fillText(`${algorithm.toUpperCase()} Path Planning`, 20, 30);
      ctx.fillText(`Path Length: ${path.length} steps`, 20, 50);
    };
    
    draw();
  }, [grid, path, mapSize, cellSize, offsetX, offsetY, algorithm]);

  return (
    <div className="robotics-sub-lab">
      <canvas ref={canvasRef} className="robotics-canvas" />
      <div className="robotics-sub-title">🗺️ Path Planning - {algorithm.toUpperCase()}</div>
    </div>
  );
};

export default PathPlanning;