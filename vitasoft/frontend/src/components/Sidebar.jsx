import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../api/authService';

export default function Sidebar() {
  const navigate = useNavigate();
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">VitaSoft</div>

      <ul className="sidebar-nav">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            📋 Pagos
          </NavLink>
        </li>
        <li>
          <NavLink to="/importar" className={({ isActive }) => isActive ? 'active' : ''}>
            📤 Importar Excel
          </NavLink>
        </li>
        <li>
          <NavLink to="/lotes" className={({ isActive }) => isActive ? 'active' : ''}>
            📦 Historial Lotes
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-logout">
        <div style={{ marginBottom: 10, fontSize: 13, opacity: 0.7 }}>
          {user?.email}
          <br />
          <span style={{ fontSize: 11 }}>{user?.rol}</span>
        </div>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </div>
    </aside>
  );
}
