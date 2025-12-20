import { useState, useEffect, useRef, useCallback } from "react";
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
  const [activeTab, setActiveTab] = useState("chat");
  const [whiteboardSocket, setWhiteboardSocket] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [isWhiteboardConnected, setIsWhiteboardConnected] = useState(false);
  // Default to false; set to true only when both socket connects AND editor mounts with valid store
  const [whiteboardReady, setWhiteboardReady] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const editorRef = useRef(null);
  const storeUnsubscribeRef = useRef(null);
  const drawingTimeoutRef = useRef(null);
  const groupIdRef = useRef(groupId); // Store current groupId to avoid stale closure

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Update groupIdRef whenever groupId changes to prevent stale closure
  useEffect(() => {
    groupIdRef.current = groupId;
  }, [groupId]);

  // --- STANDARD CHAT LOGIC (Unchanged) ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required.");
      navigate("/login");
      return;
    }

    fetchGroupDetails();
    fetchMessages();

    const newSocket = io(API_URL, {
      auth: { token: localStorage.getItem("token") },
    });

    newSocket.on("connect", () => newSocket.emit("join_group_room", groupId));
    newSocket.on("new_message", (msg) => setMessages((prev) => [...prev, msg]));
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

    return () => {
      if (newSocket) {
        newSocket.emit("leave_group_room", groupId);
        newSocket.disconnect();
      }
    };
  }, [groupId, user, authLoading, isAuthenticated]);

  // --- WHITEBOARD SOCKET LOGIC ---
  useEffect(() => {
    if (activeTab !== 'whiteboard' || !isAuthenticated || !user) return;

    const whiteboardRoomId = `whiteboard-group-${groupId}`;
    console.log('🎨 Initializing whiteboard socket');

    const wbSocket = io(API_URL, {
      query: { roomId: whiteboardRoomId },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    wbSocket.on('connect', () => {
      console.log('✅ Whiteboard socket connected');
      setIsWhiteboardConnected(true);
    });

    wbSocket.on('disconnect', () => setIsWhiteboardConnected(false));
    wbSocket.on('user-count', (count) => setConnectedUsers(count));
    
    setWhiteboardSocket(wbSocket);

    return () => {
      wbSocket.disconnect();
      setWhiteboardSocket(null);
      setIsWhiteboardConnected(false);
      setWhiteboardReady(false);
    };
  }, [activeTab, groupId, API_URL, isAuthenticated, user]);

  // --- WHITEBOARD SYNC LOGIC ---
  // Memoize handleMount to prevent re-creation
  const handleMount = useCallback((editor) => {
    console.log('📝 Tldraw mounted');
    editorRef.current = editor;
    
    // Only set whiteboardReady when BOTH socket is connected AND editor has a valid store
    if (whiteboardSocket && whiteboardSocket.connected && editor.store) {
      console.log('✅ Both socket and editor ready - enabling sync');
      setWhiteboardReady(true);
    }
  }, [whiteboardSocket]);

  useEffect(() => {
    // Strict check: We need Editor, Socket, Connection AND the Ready flag
    if (!editorRef.current || !whiteboardSocket || !isWhiteboardConnected || !whiteboardReady) {
      return;
    }

    const editor = editorRef.current;

    const handleDrawingUpdate = (data) => {
      if (!data.changes || !Array.isArray(data.changes)) return;
      
      try {
        // CRITICAL FIX: Wrap in a check to ensure editor isn't disposed
        if(editor.store) {
          // Batch all changes into a single put call to avoid multiple notifications/re-renders
          editor.store.mergeRemoteChanges(() => {
            editor.store.put(data.changes);
          });
        }
      } catch (error) {
        console.warn('Sync warning (harmless if unmounting):', error);
      }
    };

    const emitDrawingChange = (changedRecords) => {
      if (drawingTimeoutRef.current) clearTimeout(drawingTimeoutRef.current);

      drawingTimeoutRef.current = setTimeout(() => {
        if (whiteboardSocket?.connected) {
          whiteboardSocket.emit('drawing-change', {
            roomId: `whiteboard-group-${groupIdRef.current}`, // Use ref to avoid stale closure
            changes: changedRecords
          });
        }
      }, 50);
    };

    const handleChange = (event) => {
        // Filter out changes that are not from the 'user' (avoid loops)
        if (event.source !== 'user') return; 

        const { changes } = event;
        const changedRecords = [];

        // Combine added/updated into a single array
        if (changes.added) Object.values(changes.added).forEach(r => changedRecords.push(r));
        if (changes.updated) Object.values(changes.updated).forEach(([_, to]) => changedRecords.push(to));
        
        // Handle removals if your backend supports it
        // if (changes.removed) ... 

        if (changedRecords.length > 0) {
            emitDrawingChange(changedRecords);
        }
    };

    whiteboardSocket.on('drawing-update', handleDrawingUpdate);
    
    const cleanupStore = editor.store.listen(handleChange, { source: 'user', scope: 'document' });

    return () => {
      whiteboardSocket.off('drawing-update', handleDrawingUpdate);
      cleanupStore();
      if (drawingTimeoutRef.current) clearTimeout(drawingTimeoutRef.current);
    };
  }, [whiteboardSocket, isWhiteboardConnected, whiteboardReady]); // groupId tracked via ref to avoid stale closure

  // --- API CALLS (Unchanged) ---
  const fetchGroupDetails = async () => {
    try {
      const response = await api.get('/api/groups/my-groups');
      const foundGroup = response.data.find((g) => g.id === groupId);
      if (foundGroup) setGroup(foundGroup);
      else setError("Group not found.");
    } catch (err) {
      setError("Failed to load group details.");
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/groups/${groupId}/messages`);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    try {
      setSending(true);
      await api.post(`/api/groups/${groupId}/messages`, { content: newMessage.trim() });
      setNewMessage("");
      socket?.emit("stop_typing", { groupId, userEmail: user.email });
    } catch (err) {
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket) return;
    socket.emit("typing", { groupId, userEmail: user.email });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { groupId, userEmail: user.email });
    }, 1000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (error && !group) return <div className="p-4 text-center text-red-600">{error}</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-linear-to-r from-purple-500 to-blue-600 px-4 py-3 shrink-0 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center gap-4 text-white">
          <button onClick={() => navigate("/my-groups")}><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{group?.name || "Loading..."}</h1>
            <div className="flex items-center gap-1 text-sm opacity-90">
                <Users className="w-4 h-4" /> <span>{group?.memberCount} members</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white border-b px-4">
        <div className="max-w-5xl mx-auto flex gap-4">
          <button onClick={() => setActiveTab("chat")} className={`py-3 flex gap-2 ${activeTab === "chat" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-600"}`}>
            <MessageSquare className="w-4 h-4" /> Chat
          </button>
          <button onClick={() => setActiveTab("whiteboard")} className={`py-3 flex gap-2 ${activeTab === "whiteboard" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-600"}`}>
            <Pencil className="w-4 h-4" /> Whiteboard
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      {activeTab === "chat" ? (
        <div className="flex-1 overflow-y-auto px-4 py-6 bg-white flex flex-col">
           {/* CHAT MESSAGES */}
           <div className="flex-1 max-w-5xl mx-auto w-full space-y-4">
             {messages.map((msg, i) => {
               const isOwnMessage = msg.userId === user.userId;
               const showSender = i === 0 || messages[i - 1].userId !== msg.userId;
               
               return (
                 <div key={msg.id || i} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                   <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                     {/* Sender name - show if first message from this user in sequence */}
                     {!isOwnMessage && showSender && (
                       <span className="text-xs text-gray-500 mb-1 px-2">
                         {msg.user?.name || msg.user?.email || 'Unknown User'}
                       </span>
                     )}
                     
                     {/* Message bubble */}
                     <div className={`px-4 py-2 rounded-lg ${isOwnMessage ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                       <p className="text-sm wrap-break-word">{msg.content}</p>
                     </div>
                     
                     {/* Timestamp */}
                     <span className="text-xs text-gray-400 mt-1 px-2">
                       {formatTime(msg.createdAt)}
                     </span>
                   </div>
                 </div>
               );
             })}
             <div ref={messagesEndRef} />
           </div>
           
           {/* Typing Indicator */}
           {isTyping && typingUser && (
             <div className="max-w-5xl mx-auto w-full px-2 py-2">
               <div className="flex items-center gap-2 text-sm text-gray-500">
                 <span className="font-medium">{typingUser}</span>
                 <span>is typing</span>
                 <span className="flex gap-1">
                   <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                   <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                   <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                 </span>
               </div>
             </div>
           )}
           
           {/* INPUT AREA */}
           <div className="max-w-5xl mx-auto w-full mt-4 pt-4 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  value={newMessage} 
                  onChange={handleTyping} 
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="Type a message..." 
                  disabled={sending}
                />
                <button 
                  type="submit" 
                  disabled={sending || !newMessage.trim()} 
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
            </form>
           </div>
        </div>
      ) : (
        /* WHITEBOARD AREA */
        <div className="flex-1 relative bg-white overflow-hidden">
            {/* Loading Overlay - shown while whiteboard is initializing */}
            {!whiteboardReady && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                        <p className="mt-2 text-gray-600">Syncing Whiteboard...</p>
                    </div>
                </div>
            )}
            
            {/* TLDRAW CONTAINER - Conditionally rendered to avoid resource consumption when not ready */}
            {whiteboardReady && (
                <div className="w-full h-full">
                    <Tldraw
                        persistenceKey={`tldraw-${groupId}`} // Use persistence key to handle local caching safely
                        onMount={handleMount}
                        inferDarkMode={false} // Prevents flashing
                    >
                        <AnalyzeButton groupId={groupId} />
                    </Tldraw>
                </div>
            )}
        </div>
      )}
    </div>
  );
}

export default GroupChat;