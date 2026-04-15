import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Importar from './pages/Importar';
import Historial from './pages/Historial';
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
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={protectedPage(Dashboard)} />
        <Route path="/importar" element={protectedPage(Importar)} />
        <Route path="/historial" element={protectedPage(Historial)} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
