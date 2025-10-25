import { useState } from 'react';
import axios from 'axios';
import './Modal.css';

function CreateCourseModal({ isOpen, onClose, onCourseCreated }) {
  const [courseName, setCourseName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!courseName.trim()) {
      setError('Course name is required.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/courses`, {
        name: courseName.trim()
      });

      // Notify parent component
      onCourseCreated(response.data);
      
      // Reset and close
      setCourseName('');
      onClose();
    } catch (err) {
      console.error('Create course error:', err);
      setError(err.response?.data?.error || 'Failed to create course.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCourseName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Course</h2>
          <button className="close-button" onClick={handleCancel}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="courseName">Course Name</label>
            <input
              type="text"
              id="courseName"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g., Biology 101, CS 250"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCourseModal;
