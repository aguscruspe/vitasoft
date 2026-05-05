import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';
import VSLogo from './VSLogo';

const NAV_ITEMS = [
  {
    key: 'dashboard',
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
        <path d="M8.333 5L8.333 0L15 0L15 5L8.333 5M0 8.333L0 0L6.667 0L6.667 8.333L0 8.333M8.333 15L8.333 6.667L15 6.667L15 15L8.333 15M0 15L0 10L6.667 10L6.667 15L0 15" fillRule="nonzero" />
      </svg>
    ),
  },
  {
    key: 'importar',
    to: '/importar',
    label: 'Importación',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
        <path d="M9 13L4 8l1.4-1.4 2.6 2.6V2h2v7.2l2.6-2.6L14 8l-5 5zm-7 2v-4H0v4c0 1.1.9 2 2 2h14a2 2 0 002-2v-4h-2v4H2z" />
      </svg>
    ),
  },
  {
    key: 'historial',
    to: '/historial',
    label: 'Historial de Lotes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
        <path d="M1 14V3h16v11H1zm0 2a2 2 0 01-2-2V3a2 2 0 012-2h16a2 2 0 012 2v11a2 2 0 01-2 2H1zm3-4h10v-2H4v2zm0-4h4V6H4v2zm6 0h4V6h-4v2z" />
      </svg>
    ),
  },
];

const linkBase = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 16px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 14,
  textDecoration: 'none',
  userSelect: 'none',
  transition: 'background 0.12s, color 0.12s',
  marginBottom: 2,
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const usuario = useSelector((s) => s.auth.usuario);
  const { theme, setTheme } = useTheme();

  const isActive = (to) => location.pathname === to;
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  };

  return (
    <aside
      style={{
        width: 256,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <VSLogo size={112} color="var(--text-primary)" notchColor="var(--bg-sidebar)" />
      </div>

      {/* CTA: Nuevo Lote */}
      <div style={{ padding: '0 24px 8px' }}>
        <button
          className="btn-blue-grad"
          onClick={() => navigate('/importar')}
          style={{
            width: '100%',
            padding: '10px 0',
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <svg width="10.5" height="10.5" viewBox="0 0 10.5 10.5" fill="#fff">
            <path d="M4.5 6L0 6L0 4.5L4.5 4.5L4.5 0L6 0L6 4.5L10.5 4.5L10.5 6L6 6L6 10.5L4.5 10.5L4.5 6Z" fillRule="nonzero" />
          </svg>
          Nuevo Lote
        </button>
      </div>

      {/* Navegación */}
      <nav style={{ padding: '8px 16px', flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.to);
          return (
            <div
              key={item.key}
              onClick={() => navigate(item.to)}
              style={{
                ...linkBase,
                background: active ? 'rgba(0,89,187,0.08)' : 'transparent',
                color: active ? 'var(--vs-blue)' : 'var(--text-muted)',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(0,89,187,0.05)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </span>
              <span style={{ letterSpacing: active ? '1.4px' : '-0.35px', fontWeight: active ? 700 : 400 }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>

      {/* Footer: theme toggle + user */}
      <div style={{ borderTop: '1px solid var(--border-soft)', padding: '12px 16px' }}>
        <div
          onClick={cycleTheme}
          style={{ ...linkBase, color: 'var(--text-muted)' }}
          title={`Tema: ${theme}`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 13a3 3 0 100-6 3 3 0 000 6zm0-10a1 1 0 011 1v1a1 1 0 01-2 0V4a1 1 0 011-1zm0 14a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zM3.22 4.64a1 1 0 011.42 0l.7.7a1 1 0 01-1.41 1.42l-.71-.71a1 1 0 010-1.41zm11.31 9.9a1 1 0 011.42 0l.7.71a1 1 0 01-1.41 1.41l-.71-.71a1 1 0 010-1.41zM1 11h1a1 1 0 010 2H1a1 1 0 010-2zm16 0h1a1 1 0 010 2h-1a1 1 0 010-2zM4.64 15.36l.7-.71a1 1 0 011.42 1.41l-.71.71a1 1 0 01-1.41-1.41zm9.9-11.31l.71-.7a1 1 0 011.41 1.41l-.7.71a1 1 0 01-1.42-1.42z" />
          </svg>
          <span style={{ letterSpacing: '-0.35px', textTransform: 'capitalize' }}>
            Tema: {theme === 'system' ? 'Auto' : theme === 'light' ? 'Claro' : 'Oscuro'}
          </span>
        </div>
        {usuario && (
          <button
            onClick={handleLogout}
            style={{
              ...linkBase,
              width: '100%',
              background: 'transparent',
              color: 'var(--vs-rojo)',
              border: 'none',
              fontFamily: 'inherit',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 17l5-5-5-5v3H9v4h7v3zM4 5h7v2H4v10h7v2H4a2 2 0 01-2-2V7a2 2 0 012-2z" />
            </svg>
            <span style={{ letterSpacing: '-0.35px' }}>Cerrar sesión</span>
          </button>
        )}
      </div>
    </aside>
  );
}
