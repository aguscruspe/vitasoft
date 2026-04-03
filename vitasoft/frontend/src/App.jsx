import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Importar from './pages/Importar';
import Lotes from './pages/Lotes';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/global.css';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/importar"
          element={
            <ProtectedRoute>
              <AppLayout><Importar /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/lotes"
          element={
            <ProtectedRoute>
              <AppLayout><Lotes /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
