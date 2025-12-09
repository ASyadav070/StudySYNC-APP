import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Users, ArrowLeft, Loader2, AlertCircle, 
  RefreshCw, UserPlus, BookOpen, X 
} from 'lucide-react';

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
      const response = await api.get('/api/groups/recommendations');
      setRecommendations(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Failed to load group recommendations. Please try again.');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      setJoiningGroup(groupId);
      setError('');
      await api.post(`/api/groups/${groupId}/join`);
      
      setRecommendations(prev => prev.filter(g => g.id !== groupId));
      
      // Could replace alert with toast notification
      alert('Successfully joined the group! You can view it in "My Groups".');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join group. Please try again.');
    } finally {
      setJoiningGroup(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-gray-600">Finding study groups for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-500 to-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Users className="w-8 h-8" />
                Find Study Groups
              </h1>
              <p className="text-white/90 mt-1">Join groups with students studying similar topics</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/my-groups')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
              >
                <Users className="w-4 h-4" />
                My Groups
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 text-red-700 border border-red-200 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-700 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Empty State or Grid */}
        {!Array.isArray(recommendations) || recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Group Recommendations Yet</h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              We couldn't find any groups matching your study topics.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-md border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Try these:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>Upload more course materials to expand your topics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>Wait for your files to finish processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>Check back later as more students join groups</span>
                </li>
              </ul>
            </div>
            <button
              onClick={fetchRecommendations}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium bg-linear-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-colors shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Recommendations
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(recommendations) && recommendations.map(group => (
              <div key={group.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{group.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>
                      {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {group.description && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {group.description}
                  </p>
                )}

                {/* Matching Keywords */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Matching Topics:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(group.matchingKeywords) && group.matchingKeywords.slice(0, 10).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-600 border border-purple-200"
                      >
                        {keyword}
                      </span>
                    ))}
                    {Array.isArray(group.matchingKeywords) && group.matchingKeywords.length > 10 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                        +{group.matchingKeywords.length - 10} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Relevance Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Relevance</span>
                    <span>
                      {group.relevanceScore} topic{group.relevanceScore !== 1 ? 's' : ''} match
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-linear-to-r from-purple-500 to-blue-600 h-full transition-all"
                      style={{ width: `${Math.min(100, (group.relevanceScore / 10) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Join Button */}
                <button
                  onClick={() => handleJoinGroup(group.id)}
                  disabled={joiningGroup === group.id}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-linear-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  {joiningGroup === group.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Join Group
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default FindGroups;
