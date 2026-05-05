import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '1.1px',
  color: 'var(--vs-t2)',
  marginBottom: 8,
};

const selectWrap = ({ children }) => (
  <div style={{ position: 'relative' }}>
    {children}
    <svg
      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      width="10"
      height="6.167"
      viewBox="0 0 10 6.167"
      fill="var(--vs-t2)"
    >
      <path d="M5 6.167L0 1.167L1.167 0L5 3.833L8.833 0L10 1.167L5 6.167Z" />
    </svg>
  </div>
);

const selectStyle = {
  width: '100%',
  padding: '12px 40px 12px 16px',
  background: 'var(--input-bg)',
  border: 'none',
  fontSize: 14,
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
  appearance: 'none',
  cursor: 'pointer',
  outline: 'none',
};

export default function Ajustes() {
  const usuario = useSelector((s) => s.auth.usuario);
  const { theme, setTheme } = useTheme();
  const [zona, setZona] = useState('GMT-03');
  const [moneda, setMoneda] = useState('ARS');
  const [dirty, setDirty] = useState(false);

  const onChangeWithDirty = (setter) => (e) => {
    setter(e.target.value);
    setDirty(true);
  };

  const initials = (usuario?.nombre || 'VS')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="anim-up" style={{ padding: '48px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 44, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-1.1px', lineHeight: '44px' }}>
            Ajustes
          </h1>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--vs-t2)', marginTop: 8 }}>
            Configuración de cuenta y preferencias del sistema.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setDirty(false)}
            disabled={!dirty}
            style={{
              padding: '10px 20px',
              border: '1px solid var(--vs-border-2)',
              background: 'var(--card-bg)',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--vs-blue)',
              cursor: dirty ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              opacity: dirty ? 1 : 0.5,
            }}
          >
            Cancelar
          </button>
          <button
            className="btn-blue-grad"
            onClick={() => setDirty(false)}
            disabled={!dirty}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 500,
              boxShadow: '0 4px 14px rgba(0,89,187,0.25)',
            }}
          >
            Guardar Cambios
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '309px 1fr', gap: 24 }}>
        {/* Profile card */}
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-soft)',
            borderRadius: 4,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 12,
              background: 'var(--vs-grad-blue)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 700,
              boxShadow: '0 0 0 4px var(--input-bg)',
              marginBottom: 20,
            }}
          >
            {initials}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {usuario?.nombre || 'Usuario'}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--vs-t2)', marginBottom: 24 }}>
            {usuario?.email || '—'}
          </p>
          <div style={{ background: 'var(--input-bg)', padding: 16, width: '100%' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.1px', color: 'var(--vs-t2)', marginBottom: 8 }}>
                ROL DE SISTEMA
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--vs-blue-bg)',
                  padding: '4px 10px',
                  borderRadius: 2,
                }}
              >
                <svg width="10.5" height="11.667" viewBox="0 0 12 14" fill="var(--vs-blue)">
                  <path d="M6 0L0 3v4c0 3.7 2.6 7.2 6 8 3.4-.8 6-4.3 6-8V3L6 0zm-1 9.4l-2-2 1.1-1.1L5 7.2l2.9-2.9 1.1 1.1L5 9.4z" />
                </svg>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--vs-blue)' }}>
                  {usuario?.rol || 'Operador'}
                </span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.1px', color: 'var(--vs-t2)', marginBottom: 4 }}>
                ÚLTIMO ACCESO
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                Sesión actual
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Regional preferences */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-soft)', borderRadius: 4, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'rgb(196,212,254)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="rgb(75,91,127)">
                  <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L7 13v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H6V8h2c.55 0 1-.45 1-1V5h2c1.1 0 2-.9 2-2v-.41C15.93 3.77 18 6.69 18 10c0 2.08-.81 3.98-2.1 5.39z" />
                </svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                Preferencias Regionales
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={labelStyle}>ZONA HORARIA</label>
                {selectWrap({
                  children: (
                    <select value={zona} onChange={onChangeWithDirty(setZona)} style={selectStyle}>
                      <option value="GMT-03">(GMT-03:00) Buenos Aires</option>
                      <option value="GMT-05">(GMT-05:00) Lima / Bogotá</option>
                      <option value="GMT+00">(GMT+00:00) UTC</option>
                    </select>
                  ),
                })}
              </div>
              <div>
                <label style={labelStyle}>MONEDA PRINCIPAL</label>
                {selectWrap({
                  children: (
                    <select value={moneda} onChange={onChangeWithDirty(setMoneda)} style={selectStyle}>
                      <option value="ARS">ARS - Peso Argentino ($)</option>
                      <option value="USD">USD - Dólar ($)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                    </select>
                  ),
                })}
              </div>
            </div>
          </div>

          {/* Apariencia */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-soft)', borderRadius: 4, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'rgba(0,89,187,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="var(--vs-blue)">
                  <path d="M10 13a3 3 0 100-6 3 3 0 000 6zm0-10a1 1 0 011 1v1a1 1 0 01-2 0V4a1 1 0 011-1zm0 14a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zM3.22 4.64a1 1 0 011.42 0l.7.7a1 1 0 01-1.41 1.42l-.71-.71a1 1 0 010-1.41zm11.31 9.9a1 1 0 011.42 0l.7.71a1 1 0 01-1.41 1.41l-.71-.71a1 1 0 010-1.41zM1 11h1a1 1 0 010 2H1a1 1 0 010-2zm16 0h1a1 1 0 010 2h-1a1 1 0 010-2zM4.64 15.36l.7-.71a1 1 0 011.42 1.41l-.71.71a1 1 0 01-1.41-1.41zm9.9-11.31l.71-.7a1 1 0 011.41 1.41l-.7.71a1 1 0 01-1.42-1.42z" />
                </svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Apariencia</h3>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                ['light', 'Claro'],
                ['dark', 'Oscuro'],
                ['system', 'Auto'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    border: `1px solid ${theme === value ? 'var(--vs-blue)' : 'var(--border-color)'}`,
                    background: theme === value ? 'var(--vs-blue-bg)' : 'var(--card-bg)',
                    color: theme === value ? 'var(--vs-blue)' : 'var(--text-primary)',
                    fontWeight: theme === value ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    borderRadius: 4,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Security */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-soft)', borderRadius: 4, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'rgb(255,218,214)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="16" height="21" viewBox="0 0 16 21" fill="rgb(147,0,10)">
                  <path d="M8 0L0 3v6c0 5.25 3.4 10.16 8 11.5C12.6 19.16 16 14.25 16 9V3L8 0zm-1 15l-3-3 1.4-1.4L7 12.2l5.6-5.6L14 8l-7 7z" />
                </svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Seguridad y Acceso</h3>
            </div>
            {[
              ['Tiempo de Expiración de Sesión', 'Cierre automático tras inactividad.', '30 Minutos'],
              ['Actualizar Contraseña', 'Cambiá tu contraseña periódicamente.', 'Modificar'],
            ].map(([t, s, v]) => (
              <div
                key={t}
                style={{
                  background: 'var(--input-bg)',
                  padding: 16,
                  marginBottom: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{t}</div>
                  <div style={{ fontSize: 14, color: 'var(--vs-t2)' }}>{s}</div>
                </div>
                <button
                  style={{
                    padding: '7px 12px',
                    borderRadius: 2,
                    border: '1px solid var(--vs-border-2)',
                    background: 'var(--card-bg)',
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--vs-blue)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontFamily: 'inherit',
                  }}
                >
                  {v}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
