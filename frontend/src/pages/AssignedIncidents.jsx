import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import incidentService from '../services/incidentService';
import {
  Wrench,
  Eye,
  Filter,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';

export default function AssignedIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  useEffect(() => {
    fetchAssignedIncidents();
  }, []);

  const fetchAssignedIncidents = async () => {
    setLoading(true);
    try {
      const data = await incidentService.getAssignedIncidents();
      setIncidents(data);
    } catch (err) {
      setError('Impossible de charger les incidents affectés.');
    } finally {
      setLoading(false);
    }
  };

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

  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.createdBy?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || inc.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Incidents qui me sont affectés</h1>
          <p className="page-subtitle">
            Espace d'intervention technique : prise en charge, mise à jour des statuts et ajout des notes de résolution
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4 filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher par titre ou déclarant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-select-wrapper">
          <Filter size={18} className="filter-icon" />
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ASSIGNED">Affecté (ASSIGNED)</option>
            <option value="IN_PROGRESS">En cours (IN_PROGRESS)</option>
            <option value="RESOLVED">Résolu (RESOLVED)</option>
            <option value="CLOSED">Clôturé (CLOSED)</option>
          </select>
        </div>

        <div className="filter-select-wrapper">
          <select
            className="form-control"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">Toutes les priorités</option>
            <option value="CRITICAL">Critique</option>
            <option value="HIGH">Élevée</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="LOW">Faible</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Chargement des incidents...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <Wrench size={48} className="text-muted mb-3" />
          <h3>Aucun incident affecté</h3>
          <p className="text-muted">
            {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? 'Aucun incident ne correspond aux filtres sélectionnés.'
              : "Vous n'avez aucun incident affecté pour le moment."}
          </p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titre</th>
                  <th>Déclaré par</th>
                  <th>Priorité</th>
                  <th>Statut</th>
                  <th>Date déclaration</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inc) => (
                  <tr key={inc.id}>
                    <td>#{inc.id}</td>
                    <td>
                      <div className="font-semibold text-white">{inc.title}</div>
                      <span className="category-tag text-xs">{inc.category}</span>
                    </td>
                    <td>
                      <div>{inc.createdBy?.fullName || 'N/A'}</div>
                      <div className="text-muted text-xs">{inc.createdBy?.email}</div>
                    </td>
                    <td>{getPriorityBadge(inc.priority)}</td>
                    <td>{getStatusBadge(inc.status)}</td>
                    <td>{new Date(inc.createdAt).toLocaleString()}</td>
                    <td>
                      <span className="badge-count">
                        <MessageSquare size={13} /> {inc.commentsCount || 0}
                      </span>
                    </td>
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
        </div>
      )}
    </div>
  );
}
