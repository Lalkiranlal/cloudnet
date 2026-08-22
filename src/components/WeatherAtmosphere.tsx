import React, { useEffect, useRef } from 'react';
import { WeatherMood } from '../types/weather';

interface WeatherAtmosphereProps {
  mood: WeatherMood;
}

export const WeatherAtmosphere: React.FC<WeatherAtmosphereProps> = ({ mood }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle Classes based on mood
    // 1. Rain Drops
    interface Drop {
      x: number;
      y: number;
      len: number;
      speed: number;
      opacity: number;
    }
    const drops: Drop[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: Math.random() * 20 + 15,
      speed: Math.random() * 8 + 12,
      opacity: Math.random() * 0.4 + 0.2
    }));

    // 2. Storm Lightning State
    let lightningTimer = 0;
    let lightningIntensity = 0;

    // 3. Heatwave Sun Rays & Dust
    interface HeatParticle {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      opacity: number;
      hue: number;
    }
    const heatParticles: HeatParticle[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 4 + 1,
      speedY: -(Math.random() * 1.5 + 0.5),
      speedX: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.5 + 0.2,
      hue: Math.random() * 30 + 20
    }));

    // 4. Fog Clouds
    interface FogCloud {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      opacity: number;
    }
    const fogClouds: FogCloud[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.8),
      radius: Math.random() * 140 + 100,
      speedX: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.12 + 0.05
    }));

    // 5. Dust Storm Particles
    interface DustGrain {
      x: number;
      y: number;
      len: number;
      speedX: number;
      speedY: number;
      opacity: number;
      size: number;
    }
    const dustGrains: DustGrain[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: Math.random() * 25 + 10,
      speedX: Math.random() * 14 + 10,
      speedY: (Math.random() - 0.3) * 3,
      opacity: Math.random() * 0.4 + 0.15,
      size: Math.random() * 3 + 1
    }));

    // 6. Strong Wind Trails
    interface WindTrail {
      x: number;
      y: number;
      length: number;
      speed: number;
      width: number;
      opacity: number;
    }
    const windTrails: WindTrail[] = Array.from({ length: 25 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 160 + 80,
      speed: Math.random() * 16 + 12,
      width: Math.random() * 2 + 1,
      opacity: Math.random() * 0.35 + 0.1
    }));

    // 7. Flooding Wave Offsets
    let waveStep = 0;

    // Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // ==========================================
      // RAINFALL ATMOSPHERE
      // ==========================================
      if (mood === 'rainfall') {
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        drops.forEach(drop => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2, drop.y + drop.len);
          ctx.stroke();

          drop.y += drop.speed;
          drop.x -= 0.5;

          if (drop.y > height) {
            drop.y = -drop.len;
            drop.x = Math.random() * width;
          }
        });
      }

      // ==========================================
      // THUNDERSTORM ATMOSPHERE
      // ==========================================
      else if (mood === 'thunderstorm') {
        // Heavy diagonal rain
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.45)';
        ctx.lineWidth = 2;

        drops.forEach(drop => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 5, drop.y + drop.len * 1.3);
          ctx.stroke();

          drop.y += drop.speed * 1.4;
          drop.x -= 2;

          if (drop.y > height) {
            drop.y = -drop.len;
            drop.x = Math.random() * width;
          }
        });

        // Occasional lightning flash
        lightningTimer++;
        if (lightningTimer > 180 && Math.random() < 0.03) {
          lightningIntensity = Math.random() * 0.35 + 0.2;
          lightningTimer = 0;
        }

        if (lightningIntensity > 0) {
          ctx.fillStyle = `rgba(216, 180, 254, ${lightningIntensity})`;
          ctx.fillRect(0, 0, width, height);
          lightningIntensity *= 0.88; // fade out quickly
        }
      }

      // ==========================================
      // HEATWAVE ATMOSPHERE
      // ==========================================
      else if (mood === 'heatwave') {
        // Glowing Sun in top-right
        const sunGradient = ctx.createRadialGradient(width - 150, 120, 20, width - 150, 120, 280);
        sunGradient.addColorStop(0, 'rgba(251, 146, 60, 0.35)');
        sunGradient.addColorStop(0.5, 'rgba(253, 186, 116, 0.15)');
        sunGradient.addColorStop(1, 'rgba(255, 237, 213, 0)');
        ctx.fillStyle = sunGradient;
        ctx.fillRect(0, 0, width, height);

        // Rising heat shimmer particles
        heatParticles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(234, 88, 12, ${p.opacity * 0.4})`;
          ctx.fill();

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y < 0) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        });
      }

      // ==========================================
      // DENSE FOG ATMOSPHERE
      // ==========================================
      else if (mood === 'fog') {
        fogClouds.forEach(c => {
          const fogGrad = ctx.createRadialGradient(c.x, c.y, 10, c.x, c.y, c.radius);
          fogGrad.addColorStop(0, `rgba(148, 163, 184, ${c.opacity})`);
          fogGrad.addColorStop(1, 'rgba(241, 245, 249, 0)');

          ctx.fillStyle = fogGrad;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
          ctx.fill();

          c.x += c.speedX;
          if (c.x - c.radius > width) {
            c.x = -c.radius;
            c.y = Math.random() * (height * 0.8);
          }
        });
      }

      // ==========================================
      // DUST STORM (ANDHI) ATMOSPHERE
      // ==========================================
      else if (mood === 'dust storm') {
        ctx.lineWidth = 2;
        dustGrains.forEach(g => {
          ctx.strokeStyle = `rgba(202, 138, 4, ${g.opacity})`;
          ctx.beginPath();
          ctx.moveTo(g.x, g.y);
          ctx.lineTo(g.x + g.len, g.y + g.speedY * 2);
          ctx.stroke();

          g.x += g.speedX;
          g.y += g.speedY;

          if (g.x > width) {
            g.x = -g.len;
            g.y = Math.random() * height;
          }
        });
      }

      // ==========================================
      // STRONG WIND ATMOSPHERE
      // ==========================================
      else if (mood === 'strong wind') {
        ctx.lineCap = 'round';
        windTrails.forEach(w => {
          ctx.lineWidth = w.width;
          ctx.strokeStyle = `rgba(13, 148, 136, ${w.opacity})`;
          ctx.beginPath();
          ctx.moveTo(w.x, w.y);
          ctx.bezierCurveTo(
            w.x + w.length * 0.3, w.y - 10,
            w.x + w.length * 0.7, w.y + 10,
            w.x + w.length, w.y
          );
          ctx.stroke();

          w.x += w.speed;
          if (w.x > width + w.length) {
            w.x = -w.length;
            w.y = Math.random() * height;
          }
        });
      }

      // ==========================================
      // URBAN FLOODING ATMOSPHERE
      // ==========================================
      else if (mood === 'flooding') {
        waveStep += 0.02;
        // Draw undulating water waves at bottom
        ctx.fillStyle = 'rgba(3, 105, 161, 0.08)';
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 20) {
          const y = height - 120 + Math.sin(x * 0.01 + waveStep) * 20 + Math.cos(x * 0.02 + waveStep) * 10;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(2, 132, 199, 0.06)';
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 20) {
          const y = height - 80 + Math.sin(x * 0.015 - waveStep) * 15;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }

      // ==========================================
      // DEFAULT / CLEAR DAY ATMOSPHERE
      // ==========================================
      else {
        // Gentle sky radiance in corner
        const skyGlow = ctx.createRadialGradient(width * 0.8, 100, 30, width * 0.8, 100, 350);
        skyGlow.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
        skyGlow.addColorStop(0.6, 'rgba(186, 230, 253, 0.08)');
        skyGlow.addColorStop(1, 'rgba(240, 249, 255, 0)');
        ctx.fillStyle = skyGlow;
        ctx.fillRect(0, 0, width, height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mood]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};
