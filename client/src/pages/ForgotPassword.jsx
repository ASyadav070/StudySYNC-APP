import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0d1b2a] to-[#001219] px-4 py-12 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glass Card Container */}
        <div className="relative group">
          {/* Glowing border effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 rounded-2xl blur-sm opacity-30 group-hover:opacity-40 transition duration-1000"></div>
          
          {/* Main glass card */}
          <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-2xl p-8 border border-white/10 shadow-2xl">
            {/* Light reflection on top edge */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-8"
            >
              <Mail className="w-16 h-16 text-cyan-400/70 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">
                Reset Your Password
              </h1>
              <p className="text-gray-300/60 text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </motion.div>

            {/* Success Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-3 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm flex items-start gap-2"
              >
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
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-3 rounded-lg bg-red-500/10 text-red-300 border border-red-500/30 backdrop-blur-sm flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {!message && (
              <>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                      Email Address
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={loading}
                      required
                      className="w-full px-4 py-3 bg-white/[0.15] backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:bg-white/20 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/30 focus:shadow-lg focus:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative w-full bg-gradient-to-r from-cyan-600/80 via-teal-600/80 to-emerald-600/80 text-white px-4 py-3 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-cyan-500/20 overflow-hidden group"
                    >
                      {/* Glint animation effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        initial={{ x: '-100%', rotate: 25 }}
                        whileHover={{
                          x: '100%',
                          transition: {
                            duration: 0.6,
                            ease: "easeInOut"
                          }
                        }}
                      />
                      <span className="relative z-10">
                        {loading ? 'Sending...' : 'Send Reset Link'}
                      </span>
                    </motion.button>
                  </motion.div>
                </form>
              </>
            )}

            {/* Back to Login */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-6 text-center"
            >
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white hover:underline transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;