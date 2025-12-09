import { useState } from 'react';
import api from '../services/api';
import { X, AlertCircle } from 'lucide-react';

function CreateCourseModal({ isOpen, onClose, onCourseCreated }) {
  const [courseName, setCourseName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!courseName.trim()) {
      setError('Course name is required.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/courses', {
        name: courseName.trim()
      });

      // Notify parent component
      onCourseCreated(response.data);
      
      // Reset and close
      setCourseName('');
      onClose();
    } catch (err) {
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
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleCancel}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Create New Course</h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2">
                Course Name
              </label>
              <input
                type="text"
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., Biology 101, CS 250"
                disabled={loading}
                autoFocus
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium bg-linear-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCourseModal;
