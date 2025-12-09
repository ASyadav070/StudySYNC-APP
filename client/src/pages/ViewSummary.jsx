import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BookOpen, LogOut, ArrowLeft, Loader2, AlertCircle, FileText } from 'lucide-react';

function ViewSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummary();
  }, [id]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/materials/${id}/summary`);
      setSummary(response.data.summary);
      setError('');
    } catch (err) {
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
      <div className="min-h-screen bg-gray-50">
        <header className="bg-linear-to-r from-purple-500 to-blue-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <h1 className="text-2xl font-bold text-white">StudySync</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-white hidden sm:inline">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                >
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading summary...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-linear-to-r from-purple-500 to-blue-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <h1 className="text-2xl font-bold text-white">StudySync</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-white hidden sm:inline">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                >
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 p-4 rounded-md bg-red-50 text-red-700 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-linear-to-r from-purple-500 to-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <h1 className="text-2xl font-bold text-white">StudySync</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white hidden sm:inline">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
              >
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Summary Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">AI-Generated Summary</h2>
                <p className="text-gray-600 mt-1">Key points and insights from your study material</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="prose prose-sm max-w-none">
              {summary.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                )
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ViewSummary;
