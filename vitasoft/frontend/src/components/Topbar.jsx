import React, { useState } from 'react';
import { useSelector } from 'react-redux';

export default function Topbar() {
  const usuario = useSelector((s) => s.auth.usuario);
  const [query, setQuery] = useState('');

  const initials = (usuario?.nombre || 'VS')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header
      style={{
        height: 64,
        background: 'var(--topbar-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        gap: 24,
        flexShrink: 0,
        boxShadow: '0 1px 2px rgba(226,232,240,0.5)',
      }}
    >
      {/* Search */}
      <div style={{ flex: 1, maxWidth: 448, position: 'relative' }}>
        <svg
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--vs-t6)' }}
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="currentColor"
        >
          <path d="M16.6 18L11.3 12.7A7 7 0 111 7a7 7 0 017 7 6.93 6.93 0 01-1.7 4.6l5.3 5.3-1 1.1zm-9.6-4A5 5 0 107 2a5 5 0 000 10z" fillRule="nonzero" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar pagos, lotes o usuarios..."
          style={{
            width: '100%',
            background: 'var(--input-bg)',
            border: 'none',
            borderRadius: 4,
            padding: '9px 16px 10px 40px',
            fontSize: 14,
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Notifications bell */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="var(--vs-t2)">
            <path d="M8 20c1.1 0 2-.9 2-2H6c0 1.1.9 2 2 2zm6-6V9c0-3.07-1.64-5.64-4.5-6.32V2C9.5 1.17 8.83.5 8 .5S6.5 1.17 6.5 2v.68C3.63 3.36 2 5.92 2 9v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--vs-rojo)',
              border: '2px solid var(--card-bg)',
            }}
          />
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border-color)' }} />

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', lineHeight: '20px' }}>
              {usuario?.nombre || 'Usuario'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: '16px' }}>
              {usuario?.rol || 'VitaSoft'}
            </div>
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: 'var(--vs-grad-blue)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              border: '1px solid var(--border-soft)',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
