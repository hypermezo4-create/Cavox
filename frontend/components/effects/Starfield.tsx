"use client";

import { useEffect, useRef } from "react";

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId = 0;
    let stars: { x: number; y: number; size: number; velocity: number }[] = [];

    const initStars = () => {
      stars = [];
      const count = Math.floor((window.innerWidth * window.innerHeight) / 9000);
      for (let i = 0; i < count; i += 1) {
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 1.4 + 0.2,
          velocity: Math.random() * 0.2 + 0.08,
        });
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        star.y -= star.velocity;
        if (star.y < -5) {
          star.y = canvas.height + 5;
          star.x = Math.random() * canvas.width;
        }
      }
      frameId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-10 opacity-40" />;
}
