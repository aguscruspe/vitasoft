import React, { useEffect, useRef } from 'react';

export default function BarChart({
  data = [0.3, 0.5, 0.7, 0.9, 0.6, 0.4, 0.8, 1.0, 0.85, 0.65],
  prev = [0.2, 0.4, 0.5, 0.7, 0.5, 0.3, 0.5, 0.7, 0.6, 0.4],
  height = 260,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width;
    const H = c.height;
    const padding = { l: 8, r: 8, t: 8, b: 0 };
    const bw = (W - padding.l - padding.r) / (data.length * 2 + data.length - 1);
    ctx.clearRect(0, 0, W, H);
    data.forEach((v, i) => {
      const x = padding.l + i * (bw * 3);
      ctx.fillStyle = 'rgb(225,227,228)';
      const ph = prev[i] * (H - padding.t - padding.b);
      ctx.fillRect(x, H - ph, bw, ph);
      ctx.fillStyle = 'rgb(0,89,187)';
      const vh = v * (H - padding.t - padding.b);
      ctx.fillRect(x + bw, H - vh, bw, vh);
    });
  }, [data, prev]);

  return <canvas ref={canvasRef} width={582} height={height} style={{ width: '100%', height }} />;
}
