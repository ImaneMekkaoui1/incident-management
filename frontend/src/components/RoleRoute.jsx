import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

export default function RoleRoute({ allowedRoles, children }) {
  const location = useLocation();
  const isAuth = authService.isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const currentUser = authService.getCurrentUser();
  const hasPermission = currentUser && allowedRoles.includes(currentUser.role);

  if (!hasPermission) {
    return (
      <div className="forbidden-container">
        <div className="forbidden-card">
          <div className="forbidden-icon">🚫</div>
          <h2>Accès non autorisé (403 Forbidden)</h2>
          <p>
            Votre rôle <strong>{currentUser?.role}</strong> ne vous permet pas d'accéder à cette ressource.
          </p>
          <a href="/dashboard" className="btn btn-primary">
            Retourner au tableau de bord
          </a>
        </div>
      </div>
    );
  }

  return children;
}
