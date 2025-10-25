import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateCourseModal from '../components/CreateCourseModal';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/courses`);
      setCourses(response.data);
      setError('');
    } catch (err) {
      console.error('Fetch courses error:', err);
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCourseCreated = (newCourse) => {
    setCourses([newCourse, ...courses]);
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>StudySync</h1>
        <div className="header-nav">
          <button onClick={() => navigate('/find-groups')} className="nav-button">
            Find Groups
          </button>
          <button onClick={() => navigate('/my-groups')} className="nav-button">
            My Groups
          </button>
        </div>
        <div className="user-info">
          <span>{user?.email}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-title-section">
          <div>
            <h2>My Courses</h2>
            <p className="subtitle">Organize your study materials by course</p>
          </div>
          <button 
            className="create-course-button"
            onClick={() => setIsModalOpen(true)}
          >
            + Create Course
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-state">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No courses yet</h3>
            <p>Create your first course to start organizing your study materials</p>
            <button 
              className="create-course-button"
              onClick={() => setIsModalOpen(true)}
            >
              + Create Your First Course
            </button>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="course-card"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="course-icon">📖</div>
                <h3>{course.name}</h3>
                <p className="course-date">
                  Created {new Date(course.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCourseCreated={handleCourseCreated}
      />
    </div>
  );
}

export default Dashboard;
