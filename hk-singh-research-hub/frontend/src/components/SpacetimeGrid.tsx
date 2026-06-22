"use client";

import { useEffect, useRef } from "react";

// Signature visual: a warped grid mesh that breathes, directly inspired by
// the "Topographical Inversion of Spacetime" diagram from the PJ-Orbit
// paper — a negative-mass core (terra cotta) repelling at the center,
// normal spacetime (ice blue) curving in at the edges, with a stable
// PJ-orbit ring where the two regimes meet.

export function SpacetimeGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = (canvas.width = canvas.offsetWidth * devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * devicePixelRatio);
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const resize = () => {
      width = canvas.width = canvas.offsetWidth * devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    window.addEventListener("resize", resize);

    const cols = 28;
    const rows = 18;
    let t = 0;
    let frameId: number;

    function warpY(nx: number, ny: number, time: number) {
      // distance from center, normalized
      const cx = nx - 0.5;
      const cy = ny - 0.5;
      const r = Math.sqrt(cx * cx + cy * cy);
      const pjRadius = 0.22 + Math.sin(time * 0.4) * 0.015;
      // tanh-style transition echoing a(r) from the paper
      const delta = 0.12;
      const tanhTerm = Math.tanh((r - pjRadius) / delta);
      return tanhTerm; // -1 near core (repulsive bulge), +1 far out (flat)
    }

    function draw() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      ctx!.clearRect(0, 0, w, h);

      const time = prefersReducedMotion ? 0 : t;

      // Build warped grid points
      const points: { x: number; y: number; warp: number }[][] = [];
      for (let j = 0; j <= rows; j++) {
        const row = [];
        for (let i = 0; i <= cols; i++) {
          const nx = i / cols;
          const ny = j / rows;
          const warp = warpY(nx, ny, time);
          const lift = warp < 0 ? -warp * 60 : 0; // bulge upward near core
          const x = nx * w;
          const y = ny * h - lift * (1 - Math.abs(ny - 0.5) * 0.6);
          row.push({ x, y, warp });
        }
        points.push(row);
      }

      // Draw grid lines
      for (let j = 0; j <= rows; j++) {
        ctx!.beginPath();
        for (let i = 0; i <= cols; i++) {
          const p = points[j][i];
          if (i === 0) ctx!.moveTo(p.x, p.y);
          else ctx!.lineTo(p.x, p.y);
        }
        const avgWarp = points[j][Math.floor(cols / 2)].warp;
        const color = avgWarp < 0 ? `rgba(255,107,53,${0.12 + Math.abs(avgWarp) * 0.18})` : `rgba(0,212,255,${0.1 + avgWarp * 0.12})`;
        ctx!.strokeStyle = color;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }
      for (let i = 0; i <= cols; i++) {
        ctx!.beginPath();
        for (let j = 0; j <= rows; j++) {
          const p = points[j][i];
          if (j === 0) ctx!.moveTo(p.x, p.y);
          else ctx!.lineTo(p.x, p.y);
        }
        ctx!.strokeStyle = "rgba(0,212,255,0.08)";
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      // PJ-orbit boundary ring (dashed, violet)
      const cx = w / 2;
      const cy = h / 2;
      const ringR = Math.min(w, h) * (0.22 + Math.sin(time * 0.4) * 0.015);
      ctx!.beginPath();
      ctx!.setLineDash([6, 6]);
      ctx!.ellipse(cx, cy, ringR * 1.4, ringR * 0.6, 0, 0, Math.PI * 2);
      ctx!.strokeStyle = "rgba(139,92,246,0.55)";
      ctx!.lineWidth = 1.5;
      ctx!.stroke();
      ctx!.setLineDash([]);

      t += 0.008;
      if (!prefersReducedMotion) {
        frameId = requestAnimationFrame(draw);
      }
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full opacity-80"
    />
  );
}
