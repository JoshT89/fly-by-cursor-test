'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Plane {
  x: number;
  y: number;
  rotation: number;
  speed: number;
}

export default function PlaneGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeRef = useRef<Plane>({
    x: 100,
    y: 100,
    rotation: 0,
    speed: 0,
  });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const [throttle, setThrottle] = useState(0);
  const [rotationSpeed, setRotationSpeed] = useState(0);
  const [displaySpeed, setDisplaySpeed] = useState(0);

  // Constants for speed and rotation control
  const baseMaxSpeed = 2.0; // Speed at level 1
  const maxSpeed = baseMaxSpeed * 10; // Maximum speed at level 10
  const baseRotationSpeed = 0.03 / 10; // Rotation speed at level 1
  const maxRotationSpeed = baseRotationSpeed * 10; // Maximum rotation speed at level 10

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update plane position based on keys
    const plane = planeRef.current;
    const keys = keysRef.current;
    let newRotation = plane.rotation;
    let newSpeed = plane.speed;

    // Calculate rotation speed
    const currentRotationSpeed = (rotationSpeed / 10) * baseRotationSpeed;

    // Speed control constants
    const throttleSpeed = (throttle / 10) * baseMaxSpeed;
    const accelerationRate = 0.02;
    const decelerationRate = 0.85;
    const brakeDecelerationRate = 0.80;
    const minSpeed = 0.01;

    // Simplified speed control - only based on dropdown selection
    if (newSpeed > throttleSpeed) {
      // If going faster than selected speed, decelerate
      newSpeed = Math.max(throttleSpeed, newSpeed * decelerationRate);
    } else if (newSpeed < throttleSpeed) {
      // If going slower than selected speed, accelerate
      newSpeed = Math.min(throttleSpeed, newSpeed + accelerationRate);
    }

    // Stop completely if speed is very low and throttle is at 0
    if (Math.abs(newSpeed) < minSpeed && throttle === 0) {
      newSpeed = 0;
    }

    // Rotation control - arrow keys only control direction
    if (keys['ArrowLeft']) {
      newRotation -= currentRotationSpeed;
    }
    if (keys['ArrowRight']) {
      newRotation += currentRotationSpeed;
    }

    const newX = plane.x + Math.cos(newRotation) * newSpeed;
    const newY = plane.y + Math.sin(newRotation) * newSpeed;

    // Update plane ref
    planeRef.current = {
      x: Math.max(0, Math.min(canvas.width, newX)),
      y: Math.max(0, Math.min(canvas.height, newY)),
      rotation: newRotation,
      speed: newSpeed,
    };

    // Update display speed for UI
    setDisplaySpeed(Math.abs(newSpeed));

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw plane
    ctx.save();
    ctx.translate(planeRef.current.x, planeRef.current.y);
    ctx.rotate(planeRef.current.rotation);

    // Draw plane body
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-10, -5);
    ctx.lineTo(-10, 5);
    ctx.closePath();
    ctx.fillStyle = '#3498db';
    ctx.fill();

    // Draw wings
    ctx.beginPath();
    ctx.moveTo(-5, -15);
    ctx.lineTo(-5, 15);
    ctx.lineTo(5, 0);
    ctx.closePath();
    ctx.fillStyle = '#2980b9';
    ctx.fill();

    ctx.restore();

    // Draw speed gauge
    const gaugeX = 100;
    const gaugeY = canvas.height - 100;
    const radius = 50;

    // Draw gauge background
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, radius, Math.PI * 0.75, Math.PI * 2.25);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw gauge ticks with labels
    for (let i = 0; i <= 10; i++) {
      const angle = Math.PI * 0.75 + (Math.PI * 1.5 * i) / 10;
      const startX = gaugeX + (radius - 10) * Math.cos(angle);
      const startY = gaugeY + (radius - 10) * Math.sin(angle);
      const endX = gaugeX + (radius + 5) * Math.cos(angle);
      const endY = gaugeY + (radius + 5) * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add speed labels - now showing 10 levels
      const labelX = gaugeX + (radius + 20) * Math.cos(angle);
      const labelY = gaugeY + (radius + 20) * Math.sin(angle);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${(i * baseMaxSpeed).toFixed(1)}`, labelX, labelY);
    }

    // Draw needle
    const speedPercentage = Math.min(Math.abs(planeRef.current.speed) / maxSpeed, 1);
    const needleAngle = Math.PI * 0.75 + (Math.PI * 1.5 * speedPercentage);
    const needleLength = radius - 15;

    ctx.beginPath();
    ctx.moveTo(gaugeX, gaugeY);
    ctx.lineTo(
      gaugeX + needleLength * Math.cos(needleAngle),
      gaugeY + needleLength * Math.sin(needleAngle)
    );
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    requestAnimationFrame(gameLoop);
  }, [throttle, rotationSpeed]);

  // Initialize game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Start game loop
    const animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameLoop]);

  return (
    <div className="relative w-full h-screen">
      <canvas
        ref={canvasRef}
        className="w-full h-screen bg-gradient-to-b from-sky-400 to-blue-600"
      />
      
      {/* Controls Panel */}
      <div className="absolute top-4 right-4 bg-black/50 text-white p-4 rounded-lg w-48 space-y-4">
        <div>
          <h2 className="text-lg font-bold mb-2">Speed Level</h2>
          <div className="flex items-center gap-2">
            <select
              value={throttle}
              onChange={(e) => setThrottle(Number(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-lg p-2 border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <option key={level} value={level * 10}>
                  Level {level} ({((level * 10) / 10 * baseMaxSpeed).toFixed(1)} units/s)
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Use arrow keys for direction only
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-2">Rotation Level</h2>
          <div className="flex items-center gap-2">
            <select
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(Number(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-lg p-2 border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <option key={level} value={level * 10}>
                  Level {level} ({((level * 10) / 10 * baseRotationSpeed).toFixed(3)} rad/s)
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Controls turn rate with arrow keys
          </p>
        </div>

        <div className="text-sm">
          <p>Current Speed: {displaySpeed.toFixed(2)} units/s</p>
          <p>Selected Speed: {((throttle / 10) * baseMaxSpeed).toFixed(2)} units/s</p>
        </div>
      </div>
    </div>
  );
} 