import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const usuario = useSelector((s) => s.auth.usuario);
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const linkClass = ({ isActive }) => `topnav-link${isActive ? ' active' : ''}`;

  return (
    <div className="app-shell">
      <nav className="topnav">
        <div className="topnav-inner">
          <div className="topnav-left">
            <span className="topnav-logo">VS</span>
            <div className="topnav-links">
              <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/importar" className={linkClass}>Importar</NavLink>
              <NavLink to="/historial" className={linkClass}>Historial</NavLink>
            </div>
          </div>
          <div className="topnav-right">
            <div className="topnav-theme-btns">
              <button
                className={`topnav-theme-btn${theme === 'light' ? ' active' : ''}`}
                onClick={() => setTheme('light')}
              >Claro</button>
              <button
                className={`topnav-theme-btn${theme === 'dark' ? ' active' : ''}`}
                onClick={() => setTheme('dark')}
              >Oscuro</button>
              <button
                className={`topnav-theme-btn${theme === 'system' ? ' active' : ''}`}
                onClick={() => setTheme('system')}
              >Auto</button>
            </div>
            {usuario && <span className="topnav-user">{usuario.nombre}</span>}
            <button className="topnav-logout" onClick={handleLogout}>Salir</button>
          </div>
        </div>
      </nav>
      <main className="app-main">{children}</main>
    </div>
  );
}
