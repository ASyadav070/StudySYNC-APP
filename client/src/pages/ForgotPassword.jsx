import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetLink('');

    if (!email) {
      setError('Email is required.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/forgot-password', {
        email
      });

      setMessage(response.data.message);
      // For development - show the reset link
      // if (response.data.resetLink) {
      //   setResetLink(response.data.resetLink);
      // }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.response?.data?.error || 'Failed to send reset email.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-400 via-purple-500 to-blue-500 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Mail className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Reset Your Password</h1>
            <p className="text-gray-600 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-6 p-3 rounded-md bg-green-50 text-green-700 border border-green-200 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm">{message}</p>
                {/* {resetLink && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">For development (click link below):</p>
                    <a 
                      href={resetLink} 
                      className="text-xs text-blue-600 hover:underline break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {resetLink}
                    </a>
                  </div>
                )} */}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 rounded-md bg-red-50 text-red-700 border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!message && (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r from-purple-500 to-blue-600 text-white px-4 py-3 rounded-md font-semibold hover:from-purple-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;