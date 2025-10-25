import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Flashcards.css';

function StudyFlashcards() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchFlashcards();
  }, [id]);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/materials/${id}/flashcards`);
      setFlashcards(response.data);
      setError('');
    } catch (err) {
      console.error('Fetch flashcards error:', err);
      setError(err.response?.data?.error || 'Failed to load flashcards.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
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
          <div className="loading-state">Loading flashcards...</div>
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

  const currentCard = flashcards[currentIndex];

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

        <div className="flashcards-container">
          <div className="flashcards-header">
            <h2>🎯 Quiz Mode</h2>
            <p className="subtitle">
              Card {currentIndex + 1} of {flashcards.length}
            </p>
          </div>

          <div className="flashcard-wrapper">
            <div 
              className={`flashcard ${isFlipped ? 'flipped' : ''}`}
              onClick={handleFlip}
            >
              <div className="flashcard-front">
                <div className="card-label">Question</div>
                <div className="card-content">
                  {currentCard.q}
                </div>
                <div className="card-hint">Click to reveal answer</div>
              </div>
              <div className="flashcard-back">
                <div className="card-label">Answer</div>
                <div className="card-content">
                  {currentCard.a}
                </div>
                <div className="card-hint">Click to see question</div>
              </div>
            </div>
          </div>

          <div className="flashcard-controls">
            <button 
              onClick={handlePrevious} 
              disabled={currentIndex === 0}
              className="control-btn"
            >
              ← Previous
            </button>
            <button 
              onClick={handleFlip}
              className="control-btn flip-btn"
            >
              {isFlipped ? '🔄 Show Question' : '🔄 Show Answer'}
            </button>
            <button 
              onClick={handleNext} 
              disabled={currentIndex === flashcards.length - 1}
              className="control-btn"
            >
              Next →
            </button>
          </div>

          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudyFlashcards;
