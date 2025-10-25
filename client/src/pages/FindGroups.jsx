import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './FindGroups.css';

function FindGroups() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joiningGroup, setJoiningGroup] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/groups/recommendations`);
      setRecommendations(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load group recommendations. Please try again.');
      setRecommendations([]); // Ensure recommendations is always an array even on error
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      setJoiningGroup(groupId);
      setError('');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/join`);
      
      // Remove the group from recommendations after joining
      setRecommendations(prev => prev.filter(g => g.id !== groupId));
      
      // Show success message
      alert('Successfully joined the group! You can view it in "My Groups".');
    } catch (err) {
      console.error('Error joining group:', err);
      setError(err.response?.data?.error || 'Failed to join group. Please try again.');
    } finally {
      setJoiningGroup(null);
    }
  };

  if (loading) {
    return (
      <div className="find-groups-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Finding study groups for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="find-groups-container">
      <div className="find-groups-header">
        <h1>Find Study Groups</h1>
        <p className="subtitle">Join groups with students studying similar topics</p>
        <div className="header-actions">
          <button onClick={() => navigate('/my-groups')} className="btn-secondary">
            My Groups
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {!Array.isArray(recommendations) || recommendations.length === 0 ? (
        <div className="no-recommendations">
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3>No Group Recommendations Yet</h3>
            <p>We couldn't find any groups matching your study topics.</p>
            <div className="suggestions">
              <h4>Try these:</h4>
              <ul>
                <li>Upload more course materials to expand your topics</li>
                <li>Wait for your files to finish processing</li>
                <li>Check back later as more students join groups</li>
              </ul>
            </div>
            <button onClick={fetchRecommendations} className="btn-primary">
              Refresh Recommendations
            </button>
          </div>
        </div>
      ) : (
        <div className="recommendations-grid">
          {Array.isArray(recommendations) && recommendations.map(group => (
            <div key={group.id} className="group-card">
              <div className="group-card-header">
                <h3>{group.name}</h3>
                <span className="member-count">
                  {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                </span>
              </div>

              {group.description && (
                <p className="group-description">{group.description}</p>
              )}

              <div className="matching-keywords">
                <h4>Matching Topics:</h4>
                <div className="keyword-tags">
                  {Array.isArray(group.matchingKeywords) && group.matchingKeywords.slice(0, 10).map((keyword, idx) => (
                    <span key={idx} className="keyword-tag">{keyword}</span>
                  ))}
                  {Array.isArray(group.matchingKeywords) && group.matchingKeywords.length > 10 && (
                    <span className="keyword-tag more">
                      +{group.matchingKeywords.length - 10} more
                    </span>
                  )}
                </div>
              </div>

              <div className="relevance-score">
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ width: `${Math.min(100, (group.relevanceScore / 10) * 100)}%` }}
                  ></div>
                </div>
                <span className="score-label">
                  {group.relevanceScore} topic{group.relevanceScore !== 1 ? 's' : ''} match
                </span>
              </div>

              <button 
                className="btn-join"
                onClick={() => handleJoinGroup(group.id)}
                disabled={joiningGroup === group.id}
              >
                {joiningGroup === group.id ? (
                  <>
                    <span className="btn-spinner"></span>
                    Joining...
                  </>
                ) : (
                  'Join Group'
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FindGroups;
