import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Importar from './pages/Importar';
import Historial from './pages/Historial';
import Usuarios from './pages/Usuarios';
import Ajustes from './pages/Ajustes';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const protectedPage = (Component) => (
  <ProtectedRoute>
    <Layout>
      <Component />
    </Layout>
  </ProtectedRoute>
);

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={protectedPage(Dashboard)} />
          <Route path="/importar" element={protectedPage(Importar)} />
          <Route path="/historial" element={protectedPage(Historial)} />
          <Route path="/usuarios" element={protectedPage(Usuarios)} />
          <Route path="/ajustes" element={protectedPage(Ajustes)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
