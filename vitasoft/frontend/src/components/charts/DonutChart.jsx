import React from 'react';

export default function DonutChart({ pct = 85 }) {
  const r = 54;
  const cx = 64;
  const cy = 64;
  const stroke = 10.667;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgb(225,227,228)" strokeWidth={stroke} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgb(0,89,187)"
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
      />
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        fill="var(--text-primary)"
        fontSize="24"
        fontWeight="700"
        fontFamily="Inter"
      >
        {pct}%
      </text>
    </svg>
  );
}
