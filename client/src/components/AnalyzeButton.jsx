import { useState } from 'react';
import { useEditor } from 'tldraw';
import { Sparkles, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

function AnalyzeButton({ groupId }) {
  const editor = useEditor();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleAnalyze = async () => {
    if (!editor) {
      console.error('Editor not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get all shapes on the current page
      const shapeIds = editor.getCurrentPageShapeIds();
      
      if (shapeIds.size === 0) {
        setError('Nothing to analyze! Draw something on the whiteboard first.');
        setShowModal(true);
        setLoading(false);
        return;
      }

      console.log('Capturing whiteboard with', shapeIds.size, 'shapes');

      // Export the current canvas as a PNG blob
      let blob;
      try {
        // Try using getSvgString and converting to blob
        const svg = await editor.getSvgString([...shapeIds], {
          background: true,
          bounds: editor.getCurrentPageBounds(),
          padding: 20,
          scale: 2
        });

        // Convert SVG to canvas and then to blob
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = 'data:image/svg+xml;base64,' + btoa(svg.svg);
        });

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        
        console.log('Image captured successfully:', blob.size, 'bytes');
      } catch (exportError) {
        console.error('Export error:', exportError);
        setError('Failed to capture whiteboard image. Please try again.');
        setShowModal(true);
        setLoading(false);
        return;
      }

      if (!blob) {
        setError('Failed to create image from whiteboard.');
        setShowModal(true);
        setLoading(false);
        return;
      }

      // Create FormData and append the blob
      const formData = new FormData();
      formData.append('image', blob, 'whiteboard.png');

      // Send to backend for AI analysis
      const response = await api.post(`/api/groups/${groupId}/analyze-whiteboard`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Display the results
      setResult(response.data.analysis);
      setShowModal(true);

    } catch (err) {
      console.error('Analysis error:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Failed to analyze whiteboard. Please try again.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setResult(null);
    setError(null);
  };

  return (
    <>
      {/* Floating Analyze Button */}
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAnalyze}
        disabled={loading}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl transition-all ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
        } text-white font-semibold`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Analyze Board</span>
          </>
        )}
      </motion.button>

      {/* Results Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">
                    {error ? 'Analysis Error' : 'Whiteboard Analysis'}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                {error ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-red-600 text-lg">{error}</p>
                  </div>
                ) : result ? (
                  <div className="space-y-6">
                    {/* Extracted Text */}
                    {result.text && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          Extracted Text
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-gray-700 whitespace-pre-wrap">{result.text}</p>
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {result.summary && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                          Summary
                        </h3>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                          <p className="text-gray-700">{result.summary}</p>
                        </div>
                      </div>
                    )}

                    {/* Key Concepts */}
                    {result.concepts && result.concepts.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Key Concepts
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {result.concepts.map((concept, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AnalyzeButton;
