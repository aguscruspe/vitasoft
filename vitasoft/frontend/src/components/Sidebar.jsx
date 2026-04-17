import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';

const styles = {
  sidebar: {
    width: 220,
    background: 'var(--bg-sidebar)',
    color: 'var(--text-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    minHeight: '100vh',
  },
  brand: {
    fontSize: 22,
    fontWeight: 700,
    padding: '0 20px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    letterSpacing: 1,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 16,
    flex: 1,
  },
  link: {
    color: 'rgba(255,255,255,0.7)',
    padding: '12px 20px',
    textDecoration: 'none',
    fontSize: 14,
  },
  linkActive: {
    background: 'var(--btn-primary)',
    color: '#fff',
  },
  themeSelector: {
    display: 'flex',
    justifyContent: 'center',
    gap: 4,
    padding: '12px 20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  themeBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 4,
    padding: '5px 10px',
    fontSize: 13,
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.6)',
    transition: 'all 0.15s ease',
  },
  themeBtnActive: {
    background: 'var(--btn-primary)',
    borderColor: 'var(--btn-primary)',
    color: '#fff',
  },
  userBox: {
    padding: '12px 20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    fontSize: 12,
  },
  logoutBtn: {
    marginTop: 10,
    width: '100%',
    background: 'transparent',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '6px 10px',
  },
};

export default function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const usuario = useSelector((s) => s.auth.usuario);
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const linkStyle = ({ isActive }) =>
    isActive ? { ...styles.link, ...styles.linkActive } : styles.link;

  const themeBtnStyle = (value) =>
    theme === value
      ? { ...styles.themeBtn, ...styles.themeBtnActive }
      : styles.themeBtn;

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>VitaSoft</div>
      <nav style={styles.nav}>
        <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/importar" style={linkStyle}>Importar</NavLink>
        <NavLink to="/historial" style={linkStyle}>Historial</NavLink>
      </nav>
      <div style={styles.themeSelector}>
        <button style={themeBtnStyle('light')} onClick={() => setTheme('light')} title="Tema claro">
          Claro
        </button>
        <button style={themeBtnStyle('dark')} onClick={() => setTheme('dark')} title="Tema oscuro">
          Oscuro
        </button>
        <button style={themeBtnStyle('system')} onClick={() => setTheme('system')} title="Tema del sistema">
          Auto
        </button>
      </div>
      <div style={styles.userBox}>
        {usuario && (
          <>
            <div><strong>{usuario.nombre}</strong></div>
            <div style={{ color: 'rgba(255,255,255,0.6)' }}>{usuario.email}</div>
          </>
        )}
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
