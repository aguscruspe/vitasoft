import React from 'react';

export default function VSLogo({ size = 112, color = 'white', notchColor = '#0d1117' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 200 220"
      role="img"
      aria-label="VitaSoft"
      style={{ display: 'block', color }}
    >
      <defs>
        <linearGradient id="vs-logo-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4d9fff" />
          <stop offset="100%" stopColor="#1a6fe8" />
        </linearGradient>
      </defs>
      <polyline
        points="10,20 100,190 190,20"
        stroke="url(#vs-logo-grad)"
        strokeWidth="42"
        fill="none"
        strokeLinejoin="miter"
        strokeLinecap="butt"
      />
      <path
        d="M 176,42 C 168,20 146,10 122,16 C 94,24 80,50 84,78 C 88,102 110,116 142,128 C 176,142 198,166 190,192 C 182,212 156,220 128,216 C 100,212 82,194 82,180"
        stroke="currentColor"
        strokeWidth="42"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="188" cy="28" r="30" fill={notchColor} />
      <text
        x="100"
        y="215"
        textAnchor="middle"
        fontFamily="Inter, 'Helvetica Neue', Arial, sans-serif"
        fontSize="16"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="5"
      >
        VITASOFT
      </text>
    </svg>
  );
}
