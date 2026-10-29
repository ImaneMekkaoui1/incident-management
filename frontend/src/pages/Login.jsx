import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import authService from '../services/authService';
import { ShieldCheck, AlertCircle, LogIn, KeyRound } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Section 17: Check if redirected due to expired token
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setSessionExpiredMsg(true);
    }

    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Échec de la connexion. Vérifiez vos identifiants.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <ShieldCheck size={36} className="text-primary" />
          </div>
          <h1>Connexion</h1>
          <p className="auth-subtitle">Système de Gestion des Incidents de Sécurité</p>
        </div>

        {sessionExpiredMsg && (
          <div className="alert alert-warning">
            <AlertCircle size={20} />
            <span>Votre session a expiré. Veuillez vous reconnecter.</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Adresse Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="ex: employee1@incident.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border">Connexion en cours...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Se connecter</span>
              </>
            )}
          </button>
        </form>

        <div className="demo-accounts-box">
          <div className="demo-title">
            <KeyRound size={16} />
            <span>Comptes de test (Mot de passe: <code>password123</code>)</span>
          </div>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn btn-xs btn-outline"
              onClick={() => handleDemoFill('employee1@incident.com', 'password123')}
            >
              Employé 1
            </button>
            <button
              type="button"
              className="btn btn-xs btn-outline"
              onClick={() => handleDemoFill('tech1@incident.com', 'password123')}
            >
              Technicien 1
            </button>
            <button
              type="button"
              className="btn btn-xs btn-outline"
              onClick={() => handleDemoFill('admin@incident.com', 'password123')}
            >
              Admin
            </button>
            <button
              type="button"
              className="btn btn-xs btn-outline-danger"
              onClick={() => handleDemoFill('disabled@incident.com', 'password123')}
              title="Test compte désactivé (Erreur 403 attendue)"
            >
              Désactivé (Test)
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Vous n'avez pas de compte ?{' '}
            <Link to="/register" className="auth-link">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
