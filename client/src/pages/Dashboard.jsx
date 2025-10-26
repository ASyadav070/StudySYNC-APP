import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateCourseModal from '../components/CreateCourseModal';
import { LogOut, Plus, BookOpen, Users, MessageSquare, Loader2, Menu, X } from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out opacity-100"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl p-6 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-800">Menu</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2 mb-8">
          <button
            onClick={() => {
              navigate('/find-groups');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 py-3 px-4 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
          >
            <Users className="w-5 h-5" />
            Find Groups
          </button>
          <button
            onClick={() => {
              navigate('/my-groups');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 py-3 px-4 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            My Groups
          </button>
        </nav>

        {/* User Info & Logout */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="mb-4 px-4">
            <p className="text-xs text-gray-500 mb-1">Signed in as</p>
            <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 w-full py-3 px-4 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="bg-linear-to-r from-purple-500 to-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">StudySync</h1>
            </div>

            {/* Navigation - Hidden on mobile, visible on md+ */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate('/find-groups')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
              >
                Find Groups
              </button>
              <button
                onClick={() => navigate('/my-groups')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
              >
                My Groups
              </button>
            </nav>

            {/* Mobile Menu Button - Visible only on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center p-2 text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* User Menu - Always visible */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              <span className="text-xs lg:text-sm text-white truncate max-w-[120px] lg:max-w-none">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 lg:px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">My Courses</h2>
            <p className="text-gray-600 mt-1">Organize your study materials by course</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-purple-500 to-blue-600 text-white px-5 py-2.5 rounded-md font-semibold hover:from-purple-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            Create Course
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 text-red-700 border border-red-200">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Create your first course to start organizing your study materials
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-linear-to-r from-purple-500 to-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:from-purple-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all shadow-md"
            >
              <Plus className="w-5 h-5" />
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course.id)}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <BookOpen className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                  {course.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Created {new Date(course.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
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
