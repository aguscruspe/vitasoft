import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

const styles = {
  sidebar: {
    width: 220,
    background: 'var(--vs-azul-oscuro)',
    color: '#fff',
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
    color: '#cfd8e8',
    padding: '12px 20px',
    textDecoration: 'none',
    fontSize: 14,
  },
  linkActive: {
    background: 'var(--vs-azul)',
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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const linkStyle = ({ isActive }) =>
    isActive ? { ...styles.link, ...styles.linkActive } : styles.link;

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>VitaSoft</div>
      <nav style={styles.nav}>
        <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/importar" style={linkStyle}>Importar</NavLink>
        <NavLink to="/historial" style={linkStyle}>Historial</NavLink>
      </nav>
      <div style={styles.userBox}>
        {usuario && (
          <>
            <div><strong>{usuario.nombre}</strong></div>
            <div style={{ color: '#cfd8e8' }}>{usuario.email}</div>
          </>
        )}
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
