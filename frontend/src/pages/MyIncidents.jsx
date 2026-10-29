import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import incidentService from '../services/incidentService';
import {
  ListOrdered,
  PlusCircle,
  Eye,
  Filter,
  Search,
  MessageSquare,
  History,
} from 'lucide-react';

export default function MyIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchMyIncidents();
  }, []);

  const fetchMyIncidents = async () => {
    setLoading(true);
    try {
      const data = await incidentService.getMyIncidents();
      setIncidents(data);
    } catch (err) {
      setError('Impossible de charger vos incidents.');
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

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes Incidents Déclarés</h1>
          <p className="page-subtitle">Suivez l'état d'avancement de vos signalements de sécurité</p>
        </div>
        <Link to="/incidents/new" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Déclarer un incident</span>
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4 filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher par titre, description ou catégorie..."
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
            <option value="OPEN">Ouvert (OPEN)</option>
            <option value="ASSIGNED">Affecté (ASSIGNED)</option>
            <option value="IN_PROGRESS">En cours (IN_PROGRESS)</option>
            <option value="RESOLVED">Résolu (RESOLVED)</option>
            <option value="CLOSED">Clôturé (CLOSED)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Chargement de vos incidents...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="card empty-state">
          <ListOrdered size={48} className="text-muted mb-3" />
          <h3>Aucun incident trouvé</h3>
          <p className="text-muted">
            {searchTerm || statusFilter !== 'ALL'
              ? 'Aucun incident ne correspond à vos filtres.'
              : "Vous n'avez pas encore déclaré d'incident de sécurité."}
          </p>
          <Link to="/incidents/new" className="btn btn-primary mt-3">
            Déclarer un incident
          </Link>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titre</th>
                  <th>Catégorie</th>
                  <th>Priorité</th>
                  <th>Statut</th>
                  <th>Technicien assigné</th>
                  <th>Interactions</th>
                  <th>Date déclaration</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id}>
                    <td>#{inc.id}</td>
                    <td>
                      <div className="font-semibold text-white">{inc.title}</div>
                      <div className="text-muted text-xs truncate max-w-xs">{inc.description}</div>
                    </td>
                    <td>
                      <span className="category-tag">{inc.category}</span>
                    </td>
                    <td>{getPriorityBadge(inc.priority)}</td>
                    <td>{getStatusBadge(inc.status)}</td>
                    <td>
                      {inc.assignedTo ? (
                        <span className="technician-name">{inc.assignedTo.fullName}</span>
                      ) : (
                        <span className="text-muted">En attente d'affectation</span>
                      )}
                    </td>
                    <td>
                      <div className="interaction-badges">
                        <span className="badge-count" title="Notes">
                          <MessageSquare size={13} /> {inc.commentsCount || 0}
                        </span>
                        <span className="badge-count" title="Événements d'historique">
                          <History size={13} /> {inc.historyCount || 0}
                        </span>
                      </div>
                    </td>
                    <td>{new Date(inc.createdAt).toLocaleString()}</td>
                    <td>
                      <Link to={`/incidents/${inc.id}`} className="btn btn-xs btn-outline">
                        <Eye size={14} /> Voir détail
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
