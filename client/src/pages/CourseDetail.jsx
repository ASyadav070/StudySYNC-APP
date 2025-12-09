import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useDropzone } from 'react-dropzone';
import { io } from 'socket.io-client';
import { 
  BookOpen, LogOut, Upload, FileText, Loader2, 
  ArrowLeft, Eye, CreditCard, Trash2, X, AlertCircle 
} from 'lucide-react';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Socket.IO connection
  useEffect(() => {
    const socket = io(API_URL);

    socket.on('connect', () => {
      if (user?.userId) {
        socket.emit('join', user.userId);
      }
    });

    socket.on('file_processed', (data) => {
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
      const response = await api.get(`/api/courses/${id}`);
      setCourse(response.data);
      setError('');
    } catch (err) {
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

      const response = await api.post(
        `/api/courses/${id}/upload`,
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
      setUploadError(err.response?.data?.error || 'Failed to upload file');
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

  const handleDeleteClick = (material) => {
    setMaterialToDelete(material);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!materialToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/api/materials/${materialToDelete.id}`);

      // Update local state by removing the deleted material
      setCourse(prev => ({
        ...prev,
        materials: prev.materials.filter(m => m.id !== materialToDelete.id)
      }));

      setDeleteModalOpen(false);
      setMaterialToDelete(null);
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Failed to delete material.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      PROCESSING: { label: 'Processing...', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' },
      ERROR: { label: 'Error', color: 'bg-red-100 text-red-800 border-red-200' }
    };

    const statusInfo = statusMap[status] || statusMap.PENDING;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading course...</p>
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 p-4 rounded-md bg-red-50 text-red-700 border border-red-200">
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </button>

        {/* Course Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">{course.name}</h2>
          <p className="text-gray-600 mt-1">Study materials for this course</p>
        </div>

        {/* File Upload Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer mb-6 ${
            isDragActive 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : isDragActive ? (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-12 h-12 text-purple-500" />
              <p className="text-sm font-medium text-gray-800">Drop the file here...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Drag & drop a file here, or click to select
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, TXT (Max 10MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Upload Error */}
        {uploadError && (
          <div className="mb-6 p-4 rounded-md bg-red-50 text-red-700 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{uploadError}</p>
          </div>
        )}

        {/* Materials List or Empty State */}
        {course.materials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No materials yet</h3>
            <p className="text-gray-600 text-center max-w-md">
              Upload your first study material to get AI-generated summaries and flashcards
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {course.materials.map((material) => (
              <div
                key={material.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Material Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">
                        {material.filename}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Uploaded {new Date(material.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {getStatusBadge(material.status)}
                    {material.status === 'COMPLETED' && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleViewSummary(material.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-linear-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all shadow-sm"
                        >
                          View Summary
                        </button>
                        <button
                          onClick={() => handleStudyFlashcards(material.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-linear-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-all shadow-sm"
                        >
                          Study Flashcards
                        </button>
                        <button
                          onClick={() => handleDeleteClick(material)}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Delete Material</h2>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-4">
                Are you sure you want to delete <span className="font-semibold">{materialToDelete?.filename}</span>? 
                This will also delete all associated summaries and flashcards. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetail;
