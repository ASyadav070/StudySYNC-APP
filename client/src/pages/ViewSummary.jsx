import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Summary.css';

function ViewSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchSummary();
  }, [id]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/materials/${id}/summary`);
      setSummary(response.data.summary);
      setError('');
    } catch (err) {
      console.error('Fetch summary error:', err);
      setError(err.response?.data?.error || 'Failed to load summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            StudySync
          </h1>
          <div className="user-info">
            <span>{user?.email}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </header>
        <main className="dashboard-main">
          <div className="loading-state">Loading summary...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            StudySync
          </h1>
          <div className="user-info">
            <span>{user?.email}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </header>
        <main className="dashboard-main">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate(-1)} className="back-button">
            ← Go Back
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          StudySync
        </h1>
        <div className="user-info">
          <span>{user?.email}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>

        <div className="summary-container">
          <div className="summary-header">
            <h2>📝 AI-Generated Summary</h2>
            <p className="subtitle">Key points and insights from your study material</p>
          </div>

          <div className="summary-content">
            {summary.split('\n').map((paragraph, index) => (
              paragraph.trim() && <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ViewSummary;
