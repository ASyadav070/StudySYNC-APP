import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Share2, Copy, Check } from 'lucide-react';
import { io } from 'socket.io-client';

function Whiteboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [socket, setSocket] = useState(null);
  const [roomId] = useState(() => {
    return searchParams.get('room') || `room-${Date.now()}`;
  });
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Connect to Socket.io server
    const newSocket = io('http://localhost:5000', {
      query: { roomId }
    });

    newSocket.on('connect', () => {
      console.log('Connected to whiteboard room:', roomId);
    });

    newSocket.on('user-count', (count) => {
      setConnectedUsers(count);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  const handleShareRoom = () => {
    const roomUrl = `${window.location.origin}/whiteboard?room=${roomId}`;
    navigator.clipboard.writeText(roomUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy link', err);
      alert('Failed to copy link');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1b2a] to-[#001219]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.03] backdrop-blur-2xl border-b border-white/10"
      >
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Collaborative Whiteboard</h1>
              <p className="text-sm text-gray-400">Room: {roomId.slice(0, 16)}...</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">{connectedUsers} online</span>
            </div>
            <button
              onClick={handleShareRoom}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-all border border-cyan-500/30"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Share Room
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tldraw Canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="h-[calc(100vh-73px)]"
        style={{ 
          '--color-background': '#0a1628',
          '--color-low': 'rgba(255, 255, 255, 0.1)',
          '--color-low-border': 'rgba(255, 255, 255, 0.2)'
        }}
      >
        <Tldraw
          persistenceKey={`tldraw-${roomId}`}
          onMount={(editor) => {
            if (socket) {
              // Listen for remote changes
              socket.on('drawing-update', (data) => {
                try {
                  editor.store.mergeRemoteChanges(() => {
                    if (data.changes && Array.isArray(data.changes)) {
                      editor.store.put(data.changes);
                    }
                  });
                } catch (error) {
                  console.error('Error applying remote changes:', error);
                }
              });

              // Send local changes
              const handleChange = (entry) => {
                if (entry.changes && Object.keys(entry.changes).length > 0) {
                  socket.emit('drawing-change', {
                    roomId,
                    changes: Object.values(entry.changes.added).concat(
                      Object.values(entry.changes.updated)
                    )
                  });
                }
              };

              const unsubscribe = editor.store.listen(handleChange, { 
                scope: 'document',
                source: 'user'
              });

              return () => {
                unsubscribe();
              };
            }
          }}
        />
      </motion.div>
    </div>
  );
}

export default Whiteboard;
