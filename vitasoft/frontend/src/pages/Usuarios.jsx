import React from 'react';

export default function Usuarios() {
  return (
    <div className="anim-up" style={{ padding: 32 }}>
      <h1 style={{ fontSize: 44, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-1.1px', lineHeight: '44px' }}>
        Usuarios
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8, marginBottom: 32 }}>
        Gestión de usuarios del sistema.
      </p>

      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-soft)',
          borderRadius: 4,
          padding: 48,
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 18 18" fill="var(--vs-t6)" style={{ marginBottom: 12 }}>
          <path d="M9 9a4 4 0 100-8 4 4 0 000 8zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
        </svg>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
          Próximamente
        </div>
        <div style={{ fontSize: 14 }}>
          La gestión de usuarios estará disponible en una próxima versión.
        </div>
      </div>
    </div>
  );
}
