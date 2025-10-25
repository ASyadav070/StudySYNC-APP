import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { io } from 'socket.io-client';
import './CourseDetail.css';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Socket.IO connection
  useEffect(() => {
    const socket = io(API_URL);

    socket.on('connect', () => {
      console.log('Socket.IO connected');
      if (user?.userId) {
        socket.emit('join', user.userId);
      }
    });

    socket.on('file_processed', (data) => {
      console.log('File processed:', data);
      // Refresh course details to show updated status
      fetchCourseDetails();
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.userId, API_URL]);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/courses/${id}`);
      setCourse(response.data);
      setError('');
    } catch (err) {
      console.error('Fetch course details error:', err);
      if (err.response?.status === 404) {
        setError('Course not found.');
      } else if (err.response?.status === 403) {
        setError('Access denied.');
      } else {
        setError('Failed to load course details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_URL}/api/courses/${id}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Add the new material to the course materials list
      setCourse(prev => ({
        ...prev,
        materials: [response.data, ...prev.materials]
      }));

    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.response?.data?.error || 'Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const handleViewSummary = (materialId) => {
    navigate(`/materials/${materialId}/summary`);
  };

  const handleStudyFlashcards = (materialId) => {
    navigate(`/materials/${materialId}/flashcards`);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Pending', class: 'status-pending' },
      PROCESSING: { label: 'Processing...', class: 'status-processing' },
      COMPLETED: { label: 'Completed', class: 'status-completed' },
      ERROR: { label: 'Error', class: 'status-error' }
    };

    const statusInfo = statusMap[status] || statusMap.PENDING;
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
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
          <div className="loading-state">Loading course...</div>
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
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Back to Dashboard
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
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back to Courses
        </button>

        <div className="course-detail-header">
          <div>
            <h2>{course.name}</h2>
            <p className="subtitle">Study materials for this course</p>
          </div>
        </div>

        {/* File Upload Dropzone */}
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${uploading ? 'dropzone-uploading' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="dropzone-content">
              <div className="spinner"></div>
              <p>Uploading...</p>
            </div>
          ) : isDragActive ? (
            <div className="dropzone-content">
              <p>📤 Drop the file here...</p>
            </div>
          ) : (
            <div className="dropzone-content">
              <p>📤 Drag & drop a file here, or click to select</p>
              <p className="dropzone-hint">Supported formats: PDF, TXT (Max 10MB)</p>
            </div>
          )}
        </div>

        {uploadError && <div className="error-message">{uploadError}</div>}

        {course.materials.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No materials yet</h3>
            <p>Upload your first study material to get AI-generated summaries and flashcards</p>
          </div>
        ) : (
          <div className="materials-list">
            {course.materials.map((material) => (
              <div key={material.id} className="material-card">
                <div className="material-info">
                  <div className="material-icon">📄</div>
                  <div>
                    <h3>{material.filename}</h3>
                    <p className="material-date">
                      Uploaded {new Date(material.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="material-actions">
                  {getStatusBadge(material.status)}
                  {material.status === 'COMPLETED' && (
                    <div className="action-buttons">
                      <button 
                        className="action-btn"
                        onClick={() => handleViewSummary(material.id)}
                      >
                        View Summary
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => handleStudyFlashcards(material.id)}
                      >
                        Study Flashcards
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default CourseDetail;
