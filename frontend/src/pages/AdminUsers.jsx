import React, { useState, useEffect } from 'react';
import incidentService from '../services/incidentService';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Shield,
  CheckCircle,
  AlertTriangle,
  Mail,
  Calendar,
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await incidentService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Impossible de charger la liste des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    setError('');
    setSuccess('');
    setUpdatingId(user.id);

    try {
      if (user.enabled) {
        await incidentService.disableUser(user.id);
        setSuccess(`Le compte de ${user.fullName} a été désactivé.`);
      } else {
        await incidentService.enableUser(user.id);
        setSuccess(`Le compte de ${user.fullName} a été réactivé.`);
      }
      // Refresh list
      const data = await incidentService.getAllUsers();
      setUsers(data);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Erreur lors du changement de statut de l’utilisateur.');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="role-badge role-badge-admin">ADMIN</span>;
      case 'TECHNICIAN':
        return <span className="role-badge role-badge-tech">TECHNICIAN</span>;
      case 'EMPLOYEE':
      default:
        return <span className="role-badge role-badge-employee">EMPLOYEE</span>;
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Utilisateurs</h1>
          <p className="page-subtitle">
            Administration des comptes, rôles et états d'activation (Section 10.3 du sujet)
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
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-select-wrapper">
          <select
            className="form-control"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">Tous les rôles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="TECHNICIAN">TECHNICIAN</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Chargement des utilisateurs...</p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>État du compte</th>
                  <th>Date d'inscription</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td className="font-semibold text-white">{u.fullName}</td>
                    <td>
                      <span className="flex-inline-gap">
                        <Mail size={14} className="text-muted" /> {u.email}
                      </span>
                    </td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>
                      <span className={`status-pill ${u.enabled ? 'pill-active' : 'pill-disabled'}`}>
                        {u.enabled ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td>
                      <span className="flex-inline-gap">
                        <Calendar size={14} className="text-muted" />{' '}
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={updatingId === u.id}
                        className={`btn btn-xs ${
                          u.enabled ? 'btn-outline-danger' : 'btn-outline-success'
                        }`}
                        title={
                          u.enabled
                            ? 'Désactiver le compte (Bloque la connexion)'
                            : 'Réactiver le compte'
                        }
                      >
                        {updatingId === u.id ? (
                          'Action...'
                        ) : u.enabled ? (
                          <>
                            <UserX size={14} /> Désactiver
                          </>
                        ) : (
                          <>
                            <UserCheck size={14} /> Activer
                          </>
                        )}
                      </button>
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
