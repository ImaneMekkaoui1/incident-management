import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import incidentService from '../services/incidentService';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Briefcase,
  FileText,
  UserCheck,
  PlusCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';

export default function Dashboard() {
  const user = authService.getCurrentUser();
  const [stats, setStats] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      if (user.role === 'ADMIN') {
        const [statsData, incidentsData] = await Promise.all([
          incidentService.getAdminStatistics(),
          incidentService.getAllIncidents(),
        ]);
        setStats(statsData);
        setRecentIncidents(incidentsData.slice(0, 5));
      } else if (user.role === 'TECHNICIAN') {
        const [statsData, assignedData] = await Promise.all([
          incidentService.getDashboardStats(),
          incidentService.getAssignedIncidents(),
        ]);
        setStats(statsData);
        setRecentIncidents(assignedData.slice(0, 5));
      } else {
        // EMPLOYEE
        const [statsData, myIncidentsData] = await Promise.all([
          incidentService.getDashboardStats(),
          incidentService.getMyIncidents(),
        ]);
        setStats(statsData);
        setRecentIncidents(myIncidentsData.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Impossible de charger les statistiques du tableau de bord.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.role]);

  const getStatusBadge = (status) => {
    const map = {
      OPEN: { label: 'Ouvert', class: 'badge-open' },
      ASSIGNED: { label: 'Affecté', class: 'badge-assigned' },
      IN_PROGRESS: { label: 'En cours', class: 'badge-in-progress' },
      RESOLVED: { label: 'Résolu', class: 'badge-resolved' },
      CLOSED: { label: 'Clôturé', class: 'badge-closed' },
    };
    const s = map[status] || { label: status, class: 'badge-default' };
    return <span className={`badge ${s.class}`}>{s.label}</span>;
  };

  const getPriorityBadge = (priority) => {
    const map = {
      LOW: { label: 'Faible', class: 'badge-priority-low' },
      MEDIUM: { label: 'Moyenne', class: 'badge-priority-medium' },
      HIGH: { label: 'Élevée', class: 'badge-priority-high' },
      CRITICAL: { label: 'Critique', class: 'badge-priority-critical' },
    };
    const p = map[priority] || { label: priority, class: 'badge-default' };
    return <span className={`badge ${p.class}`}>{p.label}</span>;
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Chargement des indicateurs...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">
            Bienvenue, <strong>{user?.fullName}</strong> ({user?.role})
          </p>
        </div>
        <div className="header-actions">
          {user.role === 'EMPLOYEE' && (
            <Link to="/incidents/new" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Déclarer un incident</span>
            </Link>
          )}
          <button onClick={fetchDashboardData} className="btn btn-outline" title="Actualiser">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* 19.1 EMPLOYEE DASHBOARD */}
      {user.role === 'EMPLOYEE' && stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <FileText size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.totalIncidents ?? 0}</span>
                <span className="stat-label">Total de mes incidents</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-orange">
                <AlertTriangle size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.openIncidents ?? 0}</span>
                <span className="stat-label">Incidents Ouverts (OPEN)</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.inProgressIncidents ?? 0}</span>
                <span className="stat-label">En cours de traitement</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <CheckCircle2 size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.resolvedIncidents ?? 0}</span>
                <span className="stat-label">Résolus ou Clôturés</span>
              </div>
            </div>
          </div>

          <div className="card dashboard-table-card">
            <div className="card-header">
              <h2>Mes derniers incidents déclarés</h2>
              <Link to="/incidents/my" className="btn btn-sm btn-outline">
                Voir tous mes incidents
              </Link>
            </div>
            {recentIncidents.length === 0 ? (
              <div className="empty-state">
                <p>Vous n'avez pas encore déclaré d'incident.</p>
                <Link to="/incidents/new" className="btn btn-primary btn-sm mt-3">
                  Créer un incident
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Titre</th>
                      <th>Catégorie</th>
                      <th>Priorité</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentIncidents.map((inc) => (
                      <tr key={inc.id}>
                        <td>#{inc.id}</td>
                        <td className="font-semibold">{inc.title}</td>
                        <td>{inc.category}</td>
                        <td>{getPriorityBadge(inc.priority)}</td>
                        <td>{getStatusBadge(inc.status)}</td>
                        <td>{new Date(inc.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/incidents/${inc.id}`} className="btn btn-xs btn-outline">
                            <Eye size={14} /> Détail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* 19.2 TECHNICIAN DASHBOARD */}
      {user.role === 'TECHNICIAN' && stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <Briefcase size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.assignedIncidents ?? 0}</span>
                <span className="stat-label">Incidents affectés</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-red">
                <ShieldAlert size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.criticalIncidents ?? 0}</span>
                <span className="stat-label">Incidents critiques</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.inProgressIncidents ?? 0}</span>
                <span className="stat-label">En cours de traitement</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <CheckCircle2 size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.resolvedIncidents ?? 0}</span>
                <span className="stat-label">Incidents résolus</span>
              </div>
            </div>
          </div>

          <div className="card dashboard-table-card">
            <div className="card-header">
              <h2>Incidents à traiter en priorité</h2>
              <Link to="/incidents/assigned" className="btn btn-sm btn-outline">
                Gérer les incidents affectés
              </Link>
            </div>
            {recentIncidents.length === 0 ? (
              <div className="empty-state">
                <p>Aucun incident ne vous est actuellement affecté.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Titre</th>
                      <th>Déclaré par</th>
                      <th>Priorité</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentIncidents.map((inc) => (
                      <tr key={inc.id}>
                        <td>#{inc.id}</td>
                        <td className="font-semibold">{inc.title}</td>
                        <td>{inc.createdBy?.fullName || 'N/A'}</td>
                        <td>{getPriorityBadge(inc.priority)}</td>
                        <td>{getStatusBadge(inc.status)}</td>
                        <td>{new Date(inc.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/incidents/${inc.id}`} className="btn btn-xs btn-primary">
                            <Eye size={14} /> Traiter
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* 19.3 ADMIN DASHBOARD */}
      {user.role === 'ADMIN' && stats && (
        <>
          <h2 className="section-subtitle">Statistiques Utilisateurs</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.totalUsers ?? 0}</span>
                <span className="stat-label">Total Utilisateurs</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <UserCheck size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.totalEmployees ?? 0}</span>
                <span className="stat-label">Nombre d'Employés</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">
                <Briefcase size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.totalTechnicians ?? 0}</span>
                <span className="stat-label">Nombre de Techniciens</span>
              </div>
            </div>
          </div>

          <h2 className="section-subtitle mt-4">Statistiques Incidents</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <FileText size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.totalIncidents ?? 0}</span>
                <span className="stat-label">Total Incidents</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-orange">
                <AlertTriangle size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.openIncidents ?? 0}</span>
                <span className="stat-label">Incidents OPEN</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.inProgressIncidents ?? 0}</span>
                <span className="stat-label">Incidents IN_PROGRESS</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <CheckCircle2 size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.closedIncidents ?? 0}</span>
                <span className="stat-label">Incidents CLOSED</span>
              </div>
            </div>
          </div>

          <div className="card dashboard-table-card mt-4">
            <div className="card-header">
              <h2>Vue d'ensemble des incidents récents</h2>
              <div className="card-actions">
                <Link to="/admin/incidents" className="btn btn-sm btn-outline">
                  Gérer tous les incidents
                </Link>
                <Link to="/admin/users" className="btn btn-sm btn-primary">
                  Gérer les utilisateurs
                </Link>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Titre</th>
                    <th>Auteur</th>
                    <th>Assigné à</th>
                    <th>Priorité</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentIncidents.map((inc) => (
                    <tr key={inc.id}>
                      <td>#{inc.id}</td>
                      <td className="font-semibold">{inc.title}</td>
                      <td>{inc.createdBy?.fullName || 'N/A'}</td>
                      <td>{inc.assignedTo?.fullName || <span className="text-muted">Non affecté</span>}</td>
                      <td>{getPriorityBadge(inc.priority)}</td>
                      <td>{getStatusBadge(inc.status)}</td>
                      <td>{new Date(inc.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/incidents/${inc.id}`} className="btn btn-xs btn-outline">
                          <Eye size={14} /> Gérer
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
