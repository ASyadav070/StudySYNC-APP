import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CreateCourseModal from '../components/CreateCourseModal';
import { motion } from 'framer-motion';
import { BookOpen, Code, Database, Cpu, Plus, LogOut, Users } from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/courses');
      setCourses(response.data || []);
    } catch (err) {
      setError('Failed to load courses. Please try again.');
      setCourses([]);
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

  const getIconComponent = (iconType) => {
    switch (iconType) {
      case 'code':
        return <Code className="w-6 h-6 text-purple-600" />;
      case 'database':
        return <Database className="w-6 h-6 text-purple-600" />;
      case 'cpu':
        return <Cpu className="w-6 h-6 text-purple-600" />;
      default:
        return <BookOpen className="w-6 h-6 text-purple-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30">
      {/* Glassmorphic Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                StudySync
              </h1>
            </div>

            {/* Navigation Pills */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate('/find-groups')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              >
                <Users className="w-4 h-4" />
                Discover Groups
              </button>
              <button
                onClick={() => navigate('/my-groups')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-full transition-all"
              >
                <BookOpen className="w-4 h-4" />
                My Groups
              </button>
            </nav>

            {/* Profile & Logout */}
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">My Learning Journey</h2>
            <p className="text-gray-600">Organize and track all your study materials in one place</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Create New Course
          </motion.button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-start gap-3">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Course Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Create your first course to start organizing your study materials
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Your First Course
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => handleCourseClick(course.id)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden group"
              >
                {/* Card Image with Overlays */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop'}
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Icon Overlay (Top-left) */}
                  <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
                    {getIconComponent(course.icon)}
                  </div>
                  
                  {/* Tag Overlay (Top-right) */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-semibold text-purple-600">{course.tag || 'NEW'}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Created {new Date(course.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-full hover:bg-purple-700 transition-colors"
                    >
                      Open Course
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Add New Course Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: courses.length * 0.1 }}
              whileHover={{ y: -5, borderColor: '#9333ea' }}
              onClick={() => setIsModalOpen(true)}
              className="bg-white/50 border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-600 hover:bg-purple-50/50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[400px] group"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="w-16 h-16 rounded-full bg-gray-200 group-hover:bg-purple-600 flex items-center justify-center mb-4 transition-colors"
              >
                <Plus className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-600 group-hover:text-purple-600 transition-colors">
                Start a New Course
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Click to add another course to your collection
              </p>
            </motion.div>
          </div>
        )}
      </main>

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCourseCreated={handleCourseCreated}
      />
    </div>
  );
}

export default Dashboard;
