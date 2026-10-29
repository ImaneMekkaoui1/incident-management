import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import {
  ShieldAlert,
  LayoutDashboard,
  FilePlus,
  ListOrdered,
  Users,
  Wrench,
  UserCheck,
  LogOut,
  FolderGit2,
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'role-badge-admin';
      case 'TECHNICIAN':
        return 'role-badge-tech';
      case 'EMPLOYEE':
      default:
        return 'role-badge-employee';
    }
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-icon">
            <ShieldAlert size={24} />
          </div>
          <span className="brand-text">IncidentSec</span>
        </Link>

        {user && (
          <nav className="navbar-nav">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <LayoutDashboard size={18} />
              <span>Tableau de bord</span>
            </NavLink>

            {/* Links for EMPLOYEE */}
            {user.role === 'EMPLOYEE' && (
              <>
                <NavLink
                  to="/incidents/my"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  <ListOrdered size={18} />
                  <span>Mes Incidents</span>
                </NavLink>
                <NavLink
                  to="/incidents/new"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  <FilePlus size={18} />
                  <span>Déclarer incident</span>
                </NavLink>
              </>
            )}

            {/* Links for TECHNICIAN */}
            {user.role === 'TECHNICIAN' && (
              <NavLink
                to="/incidents/assigned"
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link-active' : ''}`
                }
              >
                <Wrench size={18} />
                <span>Incidents affectés</span>
              </NavLink>
            )}

            {/* Links for ADMIN */}
            {user.role === 'ADMIN' && (
              <>
                <NavLink
                  to="/admin/incidents"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  <FolderGit2 size={18} />
                  <span>Gestion Incidents</span>
                </NavLink>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  <Users size={18} />
                  <span>Utilisateurs</span>
                </NavLink>
              </>
            )}

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <UserCheck size={18} />
              <span>Profil</span>
            </NavLink>
          </nav>
        )}

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <div className="user-details">
                <span className="user-fullname">{user.fullName}</span>
                <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-outline-danger btn-sm"
                title="Déconnexion"
              >
                <LogOut size={16} />
                <span>Quitter</span>
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-primary btn-sm">
                Connexion
              </Link>
              <Link to="/register" className="btn btn-outline btn-sm">
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
