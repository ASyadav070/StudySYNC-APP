import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Users, Plus, MessageSquare, ArrowLeft, Loader2, 
  AlertCircle, X, Search 
} from 'lucide-react';

function MyGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/groups/my-groups`);
      setGroups(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Failed to load your groups. Please try again.');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (name, description) => {
    try {
      setError('');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/groups`, {
        name,
        description
      });
      setGroups(prev => [response.data, ...prev]);
      setShowCreateModal(false);
      alert('Group created successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-gray-600">Loading your groups...</p>
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
                My Study Groups
              </h1>
              <p className="text-white/90 mt-1">Collaborate with students studying similar topics</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-purple-600 rounded-md hover:bg-white/90 transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" />
                Create Group
              </button>
              <button
                onClick={() => navigate('/find-groups')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
              >
                <Search className="w-4 h-4" />
                Find Groups
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

        {/* Empty State or Groups List */}
        {!Array.isArray(groups) || groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">You Haven't Joined Any Groups Yet</h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              Study groups help you collaborate with peers studying similar topics.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/find-groups')}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium bg-linear-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-colors shadow-md"
              >
                <Search className="w-4 h-4" />
                Find Study Groups
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Your Own
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.isArray(groups) && groups.map(group => (
              <div key={group.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                {/* Group Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{group.name}</h3>
                  {group.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>{group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}</span>
                    </div>
                    <span>
                      Joined {new Date(group.members?.find(m => m.userId === user.userId)?.joinedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/groups/${group.id}/chat`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-linear-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-colors shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Open Chat
                  </button>
                </div>

                {/* Members List */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-3">Members</h4>
                  <div className="space-y-2">
                    {Array.isArray(group.members) && group.members.slice(0, 5).map(member => (
                      <div key={member.userId} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                          {member.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-700 truncate block">
                            {member.email}
                          </span>
                        </div>
                        {member.userId === user.userId && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-600 rounded">
                            You
                          </span>
                        )}
                      </div>
                    ))}
                    {Array.isArray(group.members) && group.members.length > 5 && (
                      <p className="text-xs text-gray-500">
                        +{group.members.length - 5} more members
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal 
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  );
}

function CreateGroupModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a group name');
      return;
    }
    setSubmitting(true);
    try {
      await onCreate(name, description);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Create New Study Group</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Biology 101 Study Group"
              maxLength={100}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label htmlFor="group-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What topics will this group focus on?"
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium bg-linear-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {submitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MyGroups;
