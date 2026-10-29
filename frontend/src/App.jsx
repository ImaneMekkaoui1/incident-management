import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyIncidents from './pages/MyIncidents';
import NewIncident from './pages/NewIncident';
import IncidentDetails from './pages/IncidentDetails';
import AssignedIncidents from './pages/AssignedIncidents';
import AdminUsers from './pages/AdminUsers';
import AdminIncidents from './pages/AdminIncidents';
import authService from './services/authService';

export default function App() {
  const isAuth = authService.isAuthenticated();

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Default root redirect */}
            <Route
              path="/"
              element={
                isAuth ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
              }
            />

            {/* Authenticated common routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/incidents/:id"
              element={
                <ProtectedRoute>
                  <IncidentDetails />
                </ProtectedRoute>
              }
            />

            {/* EMPLOYEE specific routes */}
            <Route
              path="/incidents/my"
              element={
                <RoleRoute allowedRoles={['EMPLOYEE']}>
                  <MyIncidents />
                </RoleRoute>
              }
            />
            <Route
              path="/incidents/new"
              element={
                <RoleRoute allowedRoles={['EMPLOYEE']}>
                  <NewIncident />
                </RoleRoute>
              }
            />

            {/* TECHNICIAN specific routes */}
            <Route
              path="/incidents/assigned"
              element={
                <RoleRoute allowedRoles={['TECHNICIAN']}>
                  <AssignedIncidents />
                </RoleRoute>
              }
            />

            {/* ADMIN specific routes */}
            <Route
              path="/admin/users"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminUsers />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/incidents"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminIncidents />
                </RoleRoute>
              }
            />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="page-container text-center py-12">
                  <h2>Page introuvable (404)</h2>
                  <p className="text-muted mb-4">L'URL demandée n'existe pas.</p>
                  <a href="/dashboard" className="btn btn-primary">
                    Retour au tableau de bord
                  </a>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
