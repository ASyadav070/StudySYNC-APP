import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './MyGroups.css';

function MyGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/groups/my-groups`);
      setGroups(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to load your groups. Please try again.');
      setGroups([]); // Ensure groups is always an array even on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (name, description) => {
    try {
      setError('');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/groups`, {
        name,
        description
      });
      setGroups(prev => [response.data, ...prev]);
      setShowCreateModal(false);
      alert('Group created successfully!');
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.response?.data?.error || 'Failed to create group.');
    }
  };

  if (loading) {
    return (
      <div className="my-groups-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-groups-container">
      <div className="my-groups-header">
        <div className="header-content">
          <h1>My Study Groups</h1>
          <p className="subtitle">Collaborate with students studying similar topics</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            Create New Group
          </button>
          <button onClick={() => navigate('/find-groups')} className="btn-secondary">
            Find Groups
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {!Array.isArray(groups) || groups.length === 0 ? (
        <div className="no-groups">
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3>You Haven't Joined Any Groups Yet</h3>
            <p>Study groups help you collaborate with peers studying similar topics.</p>
            <div className="cta-buttons">
              <button onClick={() => navigate('/find-groups')} className="btn-primary">
                Find Study Groups
              </button>
              <button onClick={() => setShowCreateModal(true)} className="btn-outline">
                Create Your Own
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="groups-list">
          {Array.isArray(groups) && groups.map(group => (
            <div key={group.id} className="group-card">
              <div className="group-header">
                <div className="group-info">
                  <h3>{group.name}</h3>
                  {group.description && (
                    <p className="group-description">{group.description}</p>
                  )}
                  <div className="group-meta">
                    <span className="member-count">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                    </span>
                    <span className="joined-date">
                      Joined {new Date(group.members?.find(m => m.userId === user.userId)?.joinedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <button 
                    onClick={() => navigate(`/groups/${group.id}/chat`)} 
                    className="btn-open-chat"
                  >
                    💬 Open Chat
                  </button>
                </div>
              </div>

              <div className="group-members">
                <h4>Members</h4>
                <div className="members-list">
                  {Array.isArray(group.members) && group.members.map(member => (
                    <div key={member.userId} className="member-item">
                      <div className="member-avatar">
                        {member.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-details">
                        <span className="member-email">{member.email}</span>
                        {member.userId === user.userId && (
                          <span className="you-badge">You</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateGroupModal 
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  );
}

function CreateGroupModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a group name');
      return;
    }
    setSubmitting(true);
    try {
      await onCreate(name, description);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Study Group</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="group-name">Group Name *</label>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Biology 101 Study Group"
              maxLength={100}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="group-description">Description (Optional)</label>
            <textarea
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What topics will this group focus on?"
              rows={4}
              maxLength={500}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MyGroups;
