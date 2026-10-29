import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import incidentService from '../services/incidentService';
import {
  ShieldAlert,
  ArrowLeft,
  Clock,
  User,
  Wrench,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  History,
  Send,
  Lock,
  Tag,
  AlertCircle,
} from 'lucide-react';

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [incident, setIncident] = useState(null);
  const [comments, setComments] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  // Form states
  const [newComment, setNewComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [selectedTechId, setSelectedTechId] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [submittingAssign, setSubmittingAssign] = useState(false);

  useEffect(() => {
    loadIncidentData();
    if (currentUser?.role === 'ADMIN') {
      loadTechnicians();
    }
  }, [id]);

  const loadIncidentData = async () => {
    setLoading(true);
    setError('');
    try {
      const [incData, commentsData, historyData] = await Promise.all([
        incidentService.getIncidentById(id),
        incidentService.getComments(id),
        incidentService.getHistory(id),
      ]);
      setIncident(incData);
      setComments(commentsData);
      setHistoryList(historyData);
      setSelectedStatus(incData.status);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Accès interdit (403) : Vous n'avez pas l'autorisation d'accéder à cet incident (Section 12 du sujet).");
      } else if (err.response?.status === 404) {
        setError("Incident introuvable (404) avec l'identifiant " + id);
      } else {
        setError("Erreur lors du chargement des détails de l'incident.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async () => {
    try {
      const data = await incidentService.getTechnicians();
      setTechnicians(data);
    } catch (err) {
      console.error('Erreur chargement techniciens:', err);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setActionSuccess('');
    setActionError('');

    if (incident.status === 'CLOSED') {
      setActionError('Cet incident est clôturé (CLOSED) et son statut ne peut plus être modifié.');
      return;
    }

    setSubmittingStatus(true);
    try {
      const updated = await incidentService.updateStatus(id, selectedStatus, statusNote);
      setIncident(updated);
      setActionSuccess(`Statut mis à jour avec succès : ${selectedStatus}`);
      setStatusNote('');
      // Reload comments and history
      const [commentsData, historyData] = await Promise.all([
        incidentService.getComments(id),
        incidentService.getHistory(id),
      ]);
      setComments(commentsData);
      setHistoryList(historyData);
    } catch (err) {
      if (err.response?.data?.message) {
        setActionError(err.response.data.message);
      } else {
        setActionError('Échec de la mise à jour du statut.');
      }
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    if (!selectedTechId) return;

    setActionSuccess('');
    setActionError('');
    setSubmittingAssign(true);

    try {
      const updated = await incidentService.assignIncident(id, selectedTechId);
      setIncident(updated);
      setActionSuccess('Incident affecté avec succès au technicien.');
      // Reload history
      const historyData = await incidentService.getHistory(id);
      setHistoryList(historyData);
    } catch (err) {
      if (err.response?.data?.message) {
        setActionError(err.response.data.message);
      } else {
        setActionError("Erreur lors de l'affectation du technicien.");
      }
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setActionSuccess('');
    setActionError('');
    setSubmittingNote(true);

    try {
      await incidentService.addComment(id, newComment.trim());
      setNewComment('');
      setActionSuccess('Note de traitement enregistrée.');
      // Refresh comments and history
      const [commentsData, historyData] = await Promise.all([
        incidentService.getComments(id),
        incidentService.getHistory(id),
      ]);
      setComments(commentsData);
      setHistoryList(historyData);
    } catch (err) {
      if (err.response?.data?.message) {
        setActionError(err.response.data.message);
      } else {
        setActionError("Erreur lors de l'ajout de la note.");
      }
    } finally {
      setSubmittingNote(false);
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

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Chargement des détails de l'incident...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-danger mb-4">
          <AlertCircle size={24} />
          <div>
            <strong>Erreur de sécurité / Requête :</strong>
            <p>{error}</p>
          </div>
        </div>
        <Link to="/dashboard" className="btn btn-outline">
          <ArrowLeft size={16} /> Retour au tableau de bord
        </Link>
      </div>
    );
  }

  const isAssignedTech =
    currentUser.role === 'TECHNICIAN' &&
    incident.assignedTo &&
    incident.assignedTo.id === currentUser.id;

  const canModifyStatus =
    (currentUser.role === 'ADMIN' || isAssignedTech) &&
    incident.status !== 'CLOSED';

  const canAddNote =
    currentUser.role === 'ADMIN' ||
    isAssignedTech ||
    (currentUser.role === 'EMPLOYEE' && incident.createdBy.id === currentUser.id);

  return (
    <div className="page-container">
      <div className="mb-4">
        <Link
          to={
            currentUser.role === 'ADMIN'
              ? '/admin/incidents'
              : currentUser.role === 'TECHNICIAN'
              ? '/incidents/assigned'
              : '/incidents/my'
          }
          className="back-link"
        >
          <ArrowLeft size={16} />
          <span>Retour à la liste des incidents</span>
        </Link>
      </div>

      {actionSuccess && (
        <div className="alert alert-success mb-4">
          <CheckCircle size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="alert alert-danger mb-4">
          <AlertTriangle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      <div className="incident-grid">
        {/* Left Column: Main Incident Details & Comments */}
        <div className="incident-main-col">
          <div className="card incident-card-main">
            <div className="incident-header-top">
              <span className="incident-id-badge">Incident #{incident.id}</span>
              <div className="badge-row">
                <span className="category-tag">{incident.category}</span>
                {getPriorityBadge(incident.priority)}
                {getStatusBadge(incident.status)}
              </div>
            </div>

            <h1 className="incident-main-title">{incident.title}</h1>

            <div className="incident-meta-bar">
              <div className="meta-item">
                <User size={16} className="text-muted" />
                <span>Déclaré par : <strong>{incident.createdBy?.fullName}</strong></span>
              </div>
              <div className="meta-item">
                <Clock size={16} className="text-muted" />
                <span>Le {new Date(incident.createdAt).toLocaleString()}</span>
              </div>
              <div className="meta-item">
                <Wrench size={16} className="text-muted" />
                <span>
                  Technicien :{' '}
                  {incident.assignedTo ? (
                    <strong>{incident.assignedTo.fullName}</strong>
                  ) : (
                    <span className="text-muted italic">Non affecté</span>
                  )}
                </span>
              </div>
            </div>

            <div className="incident-description-box">
              <h3>Description de l'incident</h3>
              <p>{incident.description}</p>
            </div>
          </div>

          {/* Section 21: Notes de traitement (Comments) */}
          <div className="card mt-4">
            <div className="card-header">
              <div className="flex-header">
                <MessageSquare size={20} />
                <h2>Notes de traitement ({comments.length})</h2>
              </div>
            </div>

            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="text-muted italic p-4 text-center">
                  Aucune note de traitement n'a encore été ajoutée.
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="comment-bubble">
                    <div className="comment-header">
                      <div className="comment-author-info">
                        <strong>{c.authorName}</strong>
                        <span className="role-tag-small">{c.authorRole}</span>
                      </div>
                      <span className="comment-date">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="comment-body">{c.content}</div>
                  </div>
                ))
              )}
            </div>

            {canAddNote && (
              <form onSubmit={handleAddComment} className="comment-form mt-3">
                <div className="form-group">
                  <label htmlFor="newComment">
                    {currentUser.role === 'TECHNICIAN'
                      ? 'Ajouter une note de traitement technique (Section 21)'
                      : 'Ajouter une note ou remarque'}
                  </label>
                  <textarea
                    id="newComment"
                    rows={3}
                    className="form-control"
                    placeholder="ex: Le poste a été isolé du réseau. Analyse antivirus effectuée..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submittingNote}
                >
                  <Send size={15} />
                  <span>{submittingNote ? 'Ajout...' : 'Ajouter la note'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Actions (Status, Assign) & History Timeline */}
        <div className="incident-sidebar-col">
          {/* Action: Status Modification (Technician or Admin) */}
          {canModifyStatus && (
            <div className="card mb-4 action-card">
              <div className="card-header">
                <h3>Changer le statut de l'incident</h3>
              </div>
              <form onSubmit={handleStatusUpdate}>
                <div className="form-group">
                  <label htmlFor="statusSelect">Nouveau statut</label>
                  <select
                    id="statusSelect"
                    className="form-control"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="OPEN">OPEN (Ouvert)</option>
                    <option value="ASSIGNED">ASSIGNED (Affecté)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (En cours)</option>
                    <option value="RESOLVED">RESOLVED (Résolu)</option>
                    <option value="CLOSED">CLOSED (Clôturé)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="statusNote">Note d'explication (facultative)</label>
                  <input
                    id="statusNote"
                    type="text"
                    className="form-control"
                    placeholder="ex: OPEN -> IN_PROGRESS : prise en charge"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-sm"
                  disabled={submittingStatus}
                >
                  {submittingStatus ? 'Mise à jour...' : 'Appliquer le changement'}
                </button>
              </form>
            </div>
          )}

          {/* If incident is CLOSED: notice */}
          {incident.status === 'CLOSED' && (
            <div className="card mb-4 closed-notice-card">
              <div className="closed-icon">
                <Lock size={20} />
              </div>
              <div>
                <strong>Incident Clôturé (CLOSED)</strong>
                <p className="text-xs text-muted">
                  Conformément à la règle 8 du sujet, le statut d'un incident clôturé ne peut plus être modifié.
                </p>
              </div>
            </div>
          )}

          {/* Action: Assign to Technician (ADMIN only - Rule 6) */}
          {currentUser.role === 'ADMIN' && (
            <div className="card mb-4 action-card">
              <div className="card-header">
                <h3>Affecter à un technicien (Admin)</h3>
              </div>
              <form onSubmit={handleAssignTechnician}>
                <div className="form-group">
                  <label htmlFor="technicianSelect">Choisir un technicien</label>
                  <select
                    id="technicianSelect"
                    className="form-control"
                    value={selectedTechId}
                    onChange={(e) => setSelectedTechId(e.target.value)}
                    required
                  >
                    <option value="">-- Sélectionner un technicien --</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn btn-outline-primary btn-block btn-sm"
                  disabled={submittingAssign || !selectedTechId}
                >
                  {submittingAssign ? 'Affectation...' : 'Affecter l’incident'}
                </button>
              </form>
            </div>
          )}

          {/* Section 20: Incident History Timeline */}
          <div className="card history-timeline-card">
            <div className="card-header">
              <div className="flex-header">
                <History size={18} />
                <h3>Historique d'audit (Section 20)</h3>
              </div>
            </div>

            <div className="timeline">
              {historyList.length === 0 ? (
                <p className="text-muted italic p-3 text-center">Aucun événement enregistré.</p>
              ) : (
                historyList.map((h) => (
                  <div key={h.id} className="timeline-item">
                    <div className="timeline-point"></div>
                    <div className="timeline-content">
                      <div className="timeline-action">{h.action}</div>
                      <div className="timeline-meta">
                        Par <strong>{h.changedByName}</strong> •{' '}
                        {new Date(h.timestamp).toLocaleString()}
                      </div>
                      {h.details && <div className="timeline-details">{h.details}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
