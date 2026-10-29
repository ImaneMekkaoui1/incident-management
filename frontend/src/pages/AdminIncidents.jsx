import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import incidentService from '../services/incidentService';
import {
  FolderGit2,
  Search,
  Filter,
  Eye,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  History,
  Wrench,
} from 'lucide-react';

export default function AdminIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Assign modal state
  const [assigningIncident, setAssigningIncident] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [incidentsData, techData] = await Promise.all([
        incidentService.getAllIncidents(),
        incidentService.getTechnicians(),
      ]);
      setIncidents(incidentsData);
      setTechnicians(techData);
    } catch (err) {
      setError('Impossible de charger les données administratives.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = (incident) => {
    setAssigningIncident(incident);
    setSelectedTechId(incident.assignedTo?.id || '');
    setError('');
    setSuccess('');
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTechId || !assigningIncident) return;

    setAssignLoading(true);
    try {
      await incidentService.assignIncident(assigningIncident.id, selectedTechId);
      setSuccess(`Incident #${assigningIncident.id} affecté avec succès.`);
      setAssigningIncident(null);
      // Reload incidents
      const data = await incidentService.getAllIncidents();
      setIncidents(data);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Erreur lors de l'affectation du technicien.");
      }
    } finally {
      setAssignLoading(false);
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
      (inc.createdBy?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.assignedTo?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    const matchesCat = categoryFilter === 'ALL' || inc.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCat;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Administration des Incidents</h1>
          <p className="page-subtitle">
            Supervision globale, affectation des techniciens et suivi de l'avancement (Section 8.3 & 10.2)
          </p>
        </div>
      </div>

      {success && (
        <div className="alert alert-success mb-4">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger mb-4">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="card mb-4 filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher par titre, description, auteur, technicien..."
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

        <div className="filter-select-wrapper">
          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">Toutes les catégories</option>
            <option value="MALWARE">MALWARE</option>
            <option value="PHISHING">PHISHING</option>
            <option value="ACCESS">ACCESS</option>
            <option value="NETWORK">NETWORK</option>
            <option value="DATA_LEAK">DATA_LEAK</option>
            <option value="SOFTWARE">SOFTWARE</option>
            <option value="HARDWARE">HARDWARE</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Chargement des incidents...</p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titre</th>
                  <th>Déclarant</th>
                  <th>Catégorie</th>
                  <th>Priorité</th>
                  <th>Statut</th>
                  <th>Technicien assigné</th>
                  <th>Date</th>
                  <th>Actions</th>
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
                      <div>{inc.createdBy?.fullName || 'N/A'}</div>
                      <div className="text-muted text-xs">{inc.createdBy?.email}</div>
                    </td>
                    <td>
                      <span className="category-tag">{inc.category}</span>
                    </td>
                    <td>{getPriorityBadge(inc.priority)}</td>
                    <td>{getStatusBadge(inc.status)}</td>
                    <td>
                      {inc.assignedTo ? (
                        <div className="tech-assigned-badge">
                          <Wrench size={13} /> {inc.assignedTo.fullName}
                        </div>
                      ) : (
                        <span className="text-muted italic">Non affecté</span>
                      )}
                    </td>
                    <td>{new Date(inc.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons-cell">
                        <Link to={`/incidents/${inc.id}`} className="btn btn-xs btn-outline">
                          <Eye size={13} /> Détail
                        </Link>
                        <button
                          onClick={() => handleOpenAssignModal(inc)}
                          className="btn btn-xs btn-primary"
                          title="Affecter à un technicien"
                        >
                          <UserCheck size={13} /> Affecter
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {assigningIncident && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Affecter l'incident #{assigningIncident.id}</h3>
              <button
                className="btn-close"
                onClick={() => setAssigningIncident(null)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="modal-body">
                <p className="mb-3">
                  <strong>Titre :</strong> {assigningIncident.title}
                </p>
                <div className="form-group">
                  <label htmlFor="techSelectModal">Choisir un technicien disponible</label>
                  <select
                    id="techSelectModal"
                    className="form-control"
                    value={selectedTechId}
                    onChange={(e) => setSelectedTechId(e.target.value)}
                    required
                  >
                    <option value="">-- Choisir un technicien --</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setAssigningIncident(null)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={assignLoading || !selectedTechId}
                >
                  {assignLoading ? 'Affectation...' : 'Valider l’affectation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
