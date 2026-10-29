import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import incidentService from '../services/incidentService';
import { FilePlus, AlertCircle, CheckCircle, ArrowLeft, Send } from 'lucide-react';

const CATEGORIES = [
  { value: 'MALWARE', label: 'Malware / Ransomware / Virus' },
  { value: 'PHISHING', label: 'Tentative de Phishing / Hameçonnage' },
  { value: 'ACCESS', label: "Problème d'accès ou compte compromis" },
  { value: 'NETWORK', label: 'Panne ou intrusion réseau' },
  { value: 'DATA_LEAK', label: 'Fuite potentielle de données confidentielles' },
  { value: 'SOFTWARE', label: 'Anomalie logicielle ou faille applicative' },
  { value: 'HARDWARE', label: 'Problème matériel ou équipement suspect' },
  { value: 'OTHER', label: 'Autre comportement suspect' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Faible - Pas d’impact immédiat sur l’activité' },
  { value: 'MEDIUM', label: 'Moyenne - Impact modéré sans blocage complet' },
  { value: 'HIGH', label: 'Élevée - Impact important sur les opérations' },
  { value: 'CRITICAL', label: 'Critique - Urgence absolue (système à l’arrêt, fuite majeure)' },
];

export default function NewIncident() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('MALWARE');
  const [priority, setPriority] = useState('MEDIUM');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!title.trim()) {
      setError('Le titre de l’incident est obligatoire.');
      return;
    }

    if (!description.trim()) {
      setError('La description détaillée est obligatoire.');
      return;
    }

    setSubmitting(true);

    try {
      const created = await incidentService.createIncident({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      });
      navigate(`/incidents/${created.id}`);
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Erreur lors de la création de l'incident.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container form-page-container">
      <div className="mb-4">
        <Link to="/incidents/my" className="back-link">
          <ArrowLeft size={16} />
          <span>Retour à mes incidents</span>
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-header-icon">
            <FilePlus size={24} />
          </div>
          <div>
            <h1 className="card-title">Déclarer un incident de sécurité</h1>
            <p className="card-subtitle">
              Signalez un événement indésirable ou une vulnérabilité aux équipes de sécurité
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="incident-form">
          <div className="form-group">
            <label htmlFor="title">
              Titre de l'incident <span className="text-danger">*</span>
            </label>
            <input
              id="title"
              type="text"
              className={`form-control ${fieldErrors.title ? 'is-invalid' : ''}`}
              placeholder="ex: Ordinateur infecté par un ransomware, écran bloqué"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            {fieldErrors.title && <div className="invalid-feedback">{fieldErrors.title}</div>}
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="category">
                Catégorie <span className="text-danger">*</span>
              </label>
              <select
                id="category"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group col-md-6">
              <label htmlFor="priority">
                Priorité estimée <span className="text-danger">*</span>
              </label>
              <select
                id="priority"
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description détaillée <span className="text-danger">*</span>
            </label>
            <textarea
              id="description"
              rows={6}
              className={`form-control ${fieldErrors.description ? 'is-invalid' : ''}`}
              placeholder="Précisez les circonstances de survenue, les messages d'erreur affichés, les postes concernés, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
            {fieldErrors.description && (
              <div className="invalid-feedback">{fieldErrors.description}</div>
            )}
          </div>

          <div className="form-actions">
            <Link to="/incidents/my" className="btn btn-outline">
              Annuler
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <Send size={18} />
              <span>{submitting ? 'Envoi en cours...' : "Soumettre l'incident"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
