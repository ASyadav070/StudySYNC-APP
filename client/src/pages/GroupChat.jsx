import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import './GroupChat.css';

function GroupChat() {
  const { id: groupId } = useParams();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.IO and fetch data - only after auth is ready
  useEffect(() => {
    // Don't run if auth is still loading or user is not authenticated
    if (authLoading || !isAuthenticated || !user) {
      return;
    }

    // Additional check: ensure token exists in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      setError('Authentication required. Please log in again.');
      navigate('/login');
      return;
    }

    fetchGroupDetails();
    fetchMessages();

    // Connect to Socket.IO
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      newSocket.emit('join_group_room', groupId);
    });

    newSocket.on('new_message', (message) => {
      console.log('New message received:', message);
      setMessages(prevMessages => [...prevMessages, message]);
    });

    newSocket.on('user_typing', ({ userEmail }) => {
      if (user && userEmail !== user.email) {
        setTypingUser(userEmail);
        setIsTyping(true);
      }
    });

    newSocket.on('user_stop_typing', () => {
      setIsTyping(false);
      setTypingUser(null);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('leave_group_room', groupId);
        newSocket.disconnect();
      }
    };
  }, [groupId, user, authLoading, isAuthenticated]);

  const fetchGroupDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/groups/my-groups`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const foundGroup = response.data.find(g => g.id === groupId);
      
      if (!foundGroup) {
        setError('Group not found or you are not a member.');
        return;
      }
      
      setGroup(foundGroup);
    } catch (err) {
      console.error('Error fetching group:', err);
      console.error('Error response:', err.response);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setError('Failed to load group details.');
      }
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      console.error('Error response:', err.response);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError('You do not have access to this group chat.');
      } else {
        setError('Failed to load messages.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        navigate('/login');
        return;
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/messages`, {
        content: newMessage.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setNewMessage('');
      
      // Stop typing indicator
      if (socket) {
        socket.emit('stop_typing', { groupId, userEmail: user.email });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to send message.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket) return;

    // Emit typing event
    socket.emit('typing', { groupId, userEmail: user.email });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { groupId, userEmail: user.email });
    }, 1000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  // Show loading spinner while auth is initializing
  if (authLoading) {
    return (
      <div className="group-chat-container">
        <div className="loading-messages">
          <div className="spinner"></div>
          <p>Initializing...</p>
        </div>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="group-chat-container">
        <div className="error-state">
          <h2>❌ {error}</h2>
          <button onClick={() => navigate('/my-groups')} className="btn-primary">
            Back to My Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group-chat-container">
      {/* Header */}
      <div className="chat-header">
        <button onClick={() => navigate('/my-groups')} className="back-button">
          ← Back
        </button>
        <div className="chat-header-info">
          <h1>{group?.name || 'Loading...'}</h1>
          <p className="member-count">
            {group?.memberCount || 0} member{group?.memberCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {loading ? (
          <div className="loading-messages">
            <div className="spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-icon">💬</div>
            <h3>No messages yet</h3>
            <p>Be the first to send a message to this group!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message, index) => {
              const isOwn = message.userId === user.userId;
              const showAvatar = index === 0 || messages[index - 1].userId !== message.userId;
              
              return (
                <div 
                  key={message.id} 
                  className={`message ${isOwn ? 'message-own' : 'message-other'}`}
                >
                  {!isOwn && showAvatar && (
                    <div className="message-avatar">
                      {message.user.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {!isOwn && !showAvatar && <div className="message-avatar-spacer"></div>}
                  
                  <div className="message-content">
                    {!isOwn && showAvatar && (
                      <div className="message-sender">{message.user.email}</div>
                    )}
                    <div className="message-bubble">
                      <p>{message.content}</p>
                    </div>
                    <div className="message-time">{formatTime(message.createdAt)}</div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && typingUser && (
          <div className="typing-indicator">
            <span>{typingUser} is typing</span>
            <span className="typing-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        {error && (
          <div className="input-error">
            {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="message-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            disabled={sending}
            maxLength={1000}
            autoFocus
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || sending}
            className="send-button"
          >
            {sending ? (
              <span className="sending-spinner">⏳</span>
            ) : (
              <span>Send ➤</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default GroupChat;
