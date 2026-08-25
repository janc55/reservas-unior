import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { AdminRoute } from './components/routes/AdminRoute';

import { PublicAvailabilityPage } from './pages/PublicAvailabilityPage';
import { EquipmentCatalogPage } from './pages/EquipmentCatalogPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ProfilePage } from './pages/auth/ProfilePage';

import { MyReservationsPage } from './pages/MyReservationsPage';
import { NewReservationPage } from './pages/NewReservationPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminEquipmentPage } from './pages/admin/AdminEquipmentPage';
import { AdminHistoryPage } from './pages/admin/AdminHistoryPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<PublicAvailabilityPage />} />
            <Route path="/equipamiento" element={<EquipmentCatalogPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Rutas Protegidas (Solicitantes / Autenticados) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mis-reservas"
              element={
                <ProtectedRoute>
                  <MyReservationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reservas/nueva"
              element={
                <ProtectedRoute>
                  <NewReservationPage />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Administración (Solo Admin) */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/equipamiento"
              element={
                <AdminRoute>
                  <AdminEquipmentPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/historial"
              element={
                <AdminRoute>
                  <AdminHistoryPage />
                </AdminRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
