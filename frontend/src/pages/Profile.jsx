import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import incidentService from '../services/incidentService';
import { User, Mail, Shield, Key, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPwd, setSubmittingPwd] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await incidentService.getProfile();
      setProfile(data);
      setFullName(data.fullName);
      setEmail(data.email);
    } catch (err) {
      setProfileError('Erreur lors du chargement du profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setSubmittingProfile(true);

    try {
      const updated = await incidentService.updateProfile({
        fullName: fullName.trim(),
        email: email.trim(),
      });
      setProfile(updated);
      // Update local storage user data
      const currentStored = authService.getCurrentUser();
      if (currentStored) {
        currentStored.fullName = updated.fullName;
        currentStored.email = updated.email;
        localStorage.setItem('user', JSON.stringify(currentStored));
      }
      setProfileSuccess('Profil mis à jour avec succès !');
    } catch (err) {
      if (err.response?.data?.message) {
        setProfileError(err.response.data.message);
      } else {
        setProfileError('Erreur lors de la mise à jour du profil.');
      }
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdSuccess('');
    setPwdError('');

    if (newPassword !== confirmPassword) {
      setPwdError('Le nouveau mot de passe et sa confirmation ne correspondent pas.');
      return;
    }

    if (newPassword.length < 6) {
      setPwdError('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setSubmittingPwd(true);

    try {
      const res = await incidentService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPwdSuccess(res.message || 'Mot de passe modifié avec succès !');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err.response?.data?.message) {
        setPwdError(err.response.data.message);
      } else {
        setPwdError('Erreur lors du changement de mot de passe.');
      }
    } finally {
      setSubmittingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mon Profil</h1>
          <p className="page-subtitle">Consultez et modifiez vos informations personnelles</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left column: Profile overview & information */}
        <div className="card">
          <div className="card-header">
            <h2>Informations personnelles</h2>
          </div>

          {profileSuccess && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{profileError}</span>
            </div>
          )}

          <div className="profile-summary-badge mb-4">
            <div className="profile-avatar">
              <User size={32} />
            </div>
            <div>
              <h3>{profile?.fullName}</h3>
              <div className="role-and-status">
                <span className="role-badge role-badge-admin">{profile?.role}</span>
                <span className={`status-pill ${profile?.enabled ? 'pill-active' : 'pill-disabled'}`}>
                  {profile?.enabled ? 'Compte actif' : 'Désactivé'}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label htmlFor="fullName">Nom complet</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  id="fullName"
                  type="text"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Adresse Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Rôle attribué (non modifiable)</label>
              <div className="input-with-icon">
                <Shield size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-control"
                  value={profile?.role || ''}
                  disabled
                  readOnly
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingProfile}
            >
              <Save size={18} />
              <span>{submittingProfile ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
            </button>
          </form>
        </div>

        {/* Right column: Password Change (Section 22) */}
        <div className="card">
          <div className="card-header">
            <h2>Changer de mot de passe</h2>
          </div>

          {pwdSuccess && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{pwdSuccess}</span>
            </div>
          )}

          {pwdError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{pwdError}</span>
            </div>
          )}

          <p className="text-muted mb-4">
            Conformément aux règles de sécurité, vous devez saisir votre mot de passe actuel
            avant de définir un nouveau mot de passe hashé en BCrypt.
          </p>

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label htmlFor="currentPassword">Ancien mot de passe</label>
              <div className="input-with-icon">
                <Key size={18} className="input-icon" />
                <input
                  id="currentPassword"
                  type="password"
                  className="form-control"
                  placeholder="Votre mot de passe actuel"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Nouveau mot de passe</label>
              <div className="input-with-icon">
                <Key size={18} className="input-icon" />
                <input
                  id="newPassword"
                  type="password"
                  className="form-control"
                  placeholder="Min. 6 caractères"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
              <div className="input-with-icon">
                <Key size={18} className="input-icon" />
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-control"
                  placeholder="Répétez le nouveau mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-outline-danger"
              disabled={submittingPwd}
            >
              <Key size={18} />
              <span>{submittingPwd ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
