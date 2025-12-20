import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import io from "socket.io-client";
import { Send, ArrowLeft, Users, Loader2, AlertCircle, MessageSquare, Pencil } from "lucide-react";
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import AnalyzeButton from '../components/AnalyzeButton';

function GroupChat() {
  const { id: groupId } = useParams();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' or 'whiteboard'
  const [whiteboardSocket, setWhiteboardSocket] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [isWhiteboardConnected, setIsWhiteboardConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const editorRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required. Please log in again.");
      navigate("/login");
      return;
    }

    fetchGroupDetails();
    fetchMessages();

    // Connect to Socket.IO
    const newSocket = io(
      API_URL,
      {
        auth: {
          token: localStorage.getItem("token"),
        },
      }
    );

    newSocket.on("connect", () => {
      newSocket.emit("join_group_room", groupId);
    });

    newSocket.on("new_message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on("user_typing", ({ userEmail }) => {
      if (user && userEmail !== user.email) {
        setTypingUser(userEmail);
        setIsTyping(true);
      }
    });

    newSocket.on("user_stop_typing", () => {
      setIsTyping(false);
      setTypingUser(null);
    });

    setSocket(newSocket);

    // Connect to whiteboard Socket.IO
    const whiteboardRoomId = `whiteboard-group-${groupId}`;
    const wbSocket = io(API_URL, {
      query: { roomId: whiteboardRoomId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    wbSocket.on('connect', () => {
      console.log('✅ Connected to whiteboard room:', whiteboardRoomId);
      setIsWhiteboardConnected(true);
    });

    wbSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from whiteboard:', reason);
      setIsWhiteboardConnected(false);
    });

    wbSocket.on('user-count', (count) => {
      console.log('Whiteboard user count:', count);
      setConnectedUsers(count);
    });
    
    wbSocket.on('connect_error', (error) => {
      console.error('Whiteboard socket connection error:', error);
      setIsWhiteboardConnected(false);
    });

    wbSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected to whiteboard after', attemptNumber, 'attempts');
      setIsWhiteboardConnected(true);
    });

    wbSocket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    wbSocket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect to whiteboard');
      setError('Lost connection to whiteboard. Please refresh the page.');
    });

    setWhiteboardSocket(wbSocket);

    return () => {
      if (newSocket) {
        newSocket.emit("leave_group_room", groupId);
        newSocket.disconnect();
      }
      if (wbSocket) {
        wbSocket.disconnect();
      }
    };
  }, [groupId, user, authLoading, isAuthenticated]);

  const fetchGroupDetails = async () => {
    try {
      const response = await api.get('/api/groups/my-groups');
      const foundGroup = response.data.find((g) => g.id === groupId);

      if (!foundGroup) {
        setError("Group not found or you are not a member.");
        return;
      }

      setGroup(foundGroup);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        navigate("/login");
      } else {
        setError("Failed to load group details.");
      }
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in again.");
        navigate("/login");
        return;
      }

      const response = await api.get(`/api/groups/${groupId}/messages`);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        navigate("/login");
      } else if (err.response?.status === 403) {
        setError("You do not have access to this group chat.");
      } else {
        setError("Failed to load messages.");
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
      setError("");

      await api.post(`/api/groups/${groupId}/messages`, {
        content: newMessage.trim(),
      });

      setNewMessage("");

      // Stop typing indicator
      if (socket) {
        socket.emit("stop_typing", { groupId, userEmail: user.email });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        navigate("/login");
      } else {
        setError(err.response?.data?.error || "Failed to send message.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socket) return;

    // Emit typing event
    socket.emit("typing", { groupId, userEmail: user.email });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { groupId, userEmail: user.email });
    }, 1000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }
  };

  // Show loading spinner while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {error}
          </h2>
          <button
            onClick={() => navigate("/my-groups")}
            className="px-6 py-3 bg-linear-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 transition-colors shadow-md"
          >
            Back to My Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-500 to-blue-600 px-4 py-3 shrink-0 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/my-groups")}
            className="p-2 hover:bg-white/20 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-white truncate">
              {group?.name || "Loading..."}
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-white/90">
              <Users className="w-4 h-4" />
              <span>
                {group?.memberCount || 0} member
                {group?.memberCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 shrink-0">
        <div className="max-w-5xl mx-auto flex gap-1">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
              activeTab === "chat"
                ? "text-purple-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
            {activeTab === "chat" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("whiteboard")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
              activeTab === "whiteboard"
                ? "text-purple-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Pencil className="w-4 h-4" />
            <span>Whiteboard</span>
            {activeTab === "whiteboard" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
            )}
          </button>
          {activeTab === "whiteboard" && (
            <div className="ml-auto flex items-center gap-2 px-3 py-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <Users className="w-3 h-3" />
                <span>{connectedUsers} online</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      {activeTab === "chat" ? (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 bg-white">
            <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No messages yet
              </h3>
              <p className="text-gray-600">
                Be the first to send a message to this group!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isOwn = message.userId === user.userId;
                const showAvatar =
                  index === 0 || messages[index - 1].userId !== message.userId;

                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isOwn &&
                      (showAvatar ? (
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm shrink-0">
                          {message.user.email.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-8 shrink-0"></div>
                      ))}

                    <div
                      className={`flex flex-col max-w-[70%] ${
                        isOwn ? "items-end" : "items-start"
                      }`}
                    >
                      {!isOwn && showAvatar && (
                        <span className="text-xs text-gray-500 mb-1 px-1">
                          {message.user.email}
                        </span>
                      )}
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isOwn
                            ? "bg-linear-to-r from-purple-500 to-blue-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm wrap-break-word">
                          {message.content}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 px-1">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && typingUser && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <span>{typingUser} is typing</span>
              <span className="flex gap-1">
                <span
                  className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 shrink-0 shadow-lg">
        <div className="max-w-5xl mx-auto">
          {error && (
            <div className="mb-3 p-3 rounded-md bg-red-50 text-red-700 border border-red-200 flex items-center justify-between text-sm">
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className="hover:text-red-800"
              >
                ×
              </button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              disabled={sending}
              maxLength={1000}
              autoFocus
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-6 py-2 bg-linear-to-r from-purple-500 to-blue-600 text-white rounded-md hover:from-purple-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-md"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline">Send</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
        </>
      ) : (
        /* Whiteboard Area */
        <>
          {/* Whiteboard Header */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold text-gray-800">Whiteboard</h2>
            <div className="flex items-center gap-3">
              {!isWhiteboardConnected && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                  <span className="text-sm text-amber-600">Connecting...</span>
                </div>
              )}
              {isWhiteboardConnected && (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">
                    {connectedUsers} online
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Tldraw Canvas */}
          <div className="flex-1 bg-white">
            <Tldraw
              persistenceKey={`tldraw-group-${groupId}`}
            onMount={(editor) => {
              editorRef.current = editor;
              
              if (whiteboardSocket && whiteboardSocket.connected) {
                console.log('Tldraw editor mounted, setting up whiteboard sync');
                
                // Listen for remote changes
                whiteboardSocket.on('drawing-update', (data) => {
                  console.log('Received drawing update:', data);
                  try {
                    if (data.changes && Array.isArray(data.changes) && data.changes.length > 0) {
                      editor.store.mergeRemoteChanges(() => {
                        data.changes.forEach(change => {
                          if (change && typeof change === 'object') {
                            editor.store.put([change]);
                          }
                        });
                      });
                    }
                  } catch (error) {
                    console.error('Error applying remote changes:', error);
                  }
                });

                // Send local changes
                const handleChange = (event) => {
                  const { changes } = event;
                  const changedRecords = [];
                  
                  // Collect all added records
                  if (changes.added) {
                    Object.values(changes.added).forEach(record => {
                      changedRecords.push(record);
                    });
                  }
                  
                  // Collect all updated records
                  if (changes.updated) {
                    Object.values(changes.updated).forEach(([from, to]) => {
                      changedRecords.push(to);
                    });
                  }
                  
                  if (changedRecords.length > 0 && whiteboardSocket && whiteboardSocket.connected) {
                    console.log('Emitting drawing change:', changedRecords);
                    try {
                      whiteboardSocket.emit('drawing-change', {
                        roomId: `whiteboard-group-${groupId}`,
                        changes: changedRecords
                      });
                    } catch (error) {
                      console.error('Error emitting drawing changes:', error);
                    }
                  }
                };

                // Listen to all store changes
                editor.store.listen(handleChange, {
                  source: 'user',
                  scope: 'document'
                });
              }
            }}
          >
            {/* Analyze Button inside Tldraw */}
            <AnalyzeButton groupId={groupId} />
          </Tldraw>
          </div>
        </>
      )}
    </div>
  );
}

export default GroupChat;
