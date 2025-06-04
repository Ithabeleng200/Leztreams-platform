import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatApi from './ChatApi';
import { useAuth } from '../components/AuthContext';
import './ChatRoom.css';

const ChatRoom = ({ sessionId, onClose = () => {} }) => {
  const { currentUser } = useAuth();
  
  const safeCurrentUser = {
    id: currentUser?.id ?? null,
    type: currentUser?.type ?? null,
    name: currentUser?.name ?? 'Anonymous'
  };

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [callStatus, setCallStatus] = useState(null); // 'incoming', 'ongoing', 'ended'
  const [callType, setCallType] = useState(null); // 'audio', 'video'
  const [caller, setCaller] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  
  // Refs
  const pcRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadMessages = useCallback(async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      const response = await ChatApi.fetchMessages(sessionId);
      
      if (response.success) {
        setMessages(response.data.map(msg => ({
          ...msg,
          isCurrentUser: msg.sender_type === safeCurrentUser.type,
          sender_name: msg.sender_type === safeCurrentUser.type ? 'You' : msg.sender_name
        })));
        setError(null);
        setConnectionStatus('connected');
      } else {
        setError(response.error);
        setConnectionStatus('disconnected');
      }
    } catch (err) {
      setError('Failed to load messages');
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [sessionId, safeCurrentUser.type, scrollToBottom]);

  // WebSocket connection for real-time communication
  const setupWebSocket = useCallback(() => {
    if (!sessionId) return;

    const wsUrl = `ws://localhost:8000/ws/chat/${sessionId}/call/`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log('WebSocket message received:', data);

      switch (data.type) {
        case 'webrtc_offer':
          handleRemoteOffer(data.sdp);
          break;
        case 'webrtc_answer':
          handleRemoteAnswer(data.sdp);
          break;
        case 'webrtc_ice_candidate':
          handleRemoteIceCandidate(data.candidate);
          break;
        case 'call_status':
          handleCallStatusUpdate(data.status, data.call_id);
          break;
        case 'incoming_call':
          handleIncomingCall(data.call_type, data.caller);
          break;
        default:
          console.warn('Unknown WebSocket message type:', data.type);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setTimeout(setupWebSocket, 5000); // Reconnect after 5 seconds
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId]);

  const handleRemoteOffer = async (sdp) => {
    try {
      const pc = await initializePeerConnection();
      if (!pc) return;

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer to the other peer via WebSocket
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'webrtc_answer',
          sdp: answer
        }));
      }
    } catch (error) {
      console.error('Error handling remote offer:', error);
      setError('Failed to handle call offer');
      stopCall();
    }
  };

  const handleRemoteAnswer = async (sdp) => {
    try {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    } catch (error) {
      console.error('Error handling remote answer:', error);
      setError('Failed to handle call answer');
      stopCall();
    }
  };

  const handleRemoteIceCandidate = async (candidate) => {
    try {
      if (pcRef.current && pcRef.current.remoteDescription) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  const handleCallStatusUpdate = (status, callId) => {
    setCallStatus(status);
    if (status === 'ended') {
      stopCall();
    }
  };

  const handleIncomingCall = (type, callerName) => {
    setCallType(type);
    setCallStatus('incoming');
    setCaller(callerName);
  };

  const initializePeerConnection = useCallback(async () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          // Add more STUN/TURN servers as needed
        ]
      });
      pcRef.current = pc;

      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'webrtc_ice_candidate',
            candidate: event.candidate
          }));
        }
      };

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected' || 
            pc.iceConnectionState === 'failed') {
          console.log('ICE connection state:', pc.iceConnectionState);
          stopCall();
        }
      };

      return pc;
    } catch (error) {
      console.error('Error initializing peer connection:', error);
      setError('Failed to initialize call');
      return null;
    }
  }, []);

  const startCall = async (type) => {
    try {
      setCallType(type);
      setCallStatus('calling');
      
      // Get local media
      const constraints = {
        audio: true,
        video: type === 'video' ? true : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Initialize peer connection
      const pc = await initializePeerConnection();
      if (!pc) return;
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      
      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Send offer to server via WebSocket
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'webrtc_offer',
          sdp: offer
        }));
      }
      
      // Notify server call is initiated
      const response = await ChatApi.initiateCall(sessionId, type);
      if (response.success) {
        setCallStatus('ongoing');
      } else {
        setError(response.error);
        stopCall();
      }
    } catch (error) {
      console.error('Error starting call:', error);
      setError('Failed to start call');
      stopCall();
    }
  };

  const stopCall = async () => {
    try {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      setRemoteStream(null);
      setCallStatus(null);
      setCallType(null);
      
      // Notify server call ended
      if (callStatus === 'ongoing') {
        await ChatApi.endCall(sessionId, 'current-call-id');
      }
    } catch (error) {
      console.error('Error stopping call:', error);
    }
  };

  const acceptCall = async () => {
    try {
      setCallStatus('ongoing');
      
      // Get local media
      const constraints = {
        audio: true,
        video: callType === 'video' ? true : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Initialize peer connection
      const pc = await initializePeerConnection();
      if (!pc) return;
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      
      // Create answer (offer would be handled via WebSocket)
    } catch (error) {
      console.error('Error accepting call:', error);
      setError('Failed to accept call');
      stopCall();
    }
  };

  const rejectCall = () => {
    setCallStatus(null);
    setCallType(null);
    setCaller(null);
    // Notify server call was rejected
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'call_status',
        status: 'rejected'
      }));
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map(file => {
      // Create preview URL for images and videos
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const previewUrl = URL.createObjectURL(file);
        return {
          file,
          preview: previewUrl,
          type: file.type.startsWith('image/') ? 'image' : 
                file.type.startsWith('video/') ? 'video' : 'document'
        };
      } else {
        return {
          file,
          preview: null,
          type: 'document'
        };
      }
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return newFiles;
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = inputValue.trim();
    if ((!trimmedMessage && selectedFiles.length === 0) || !sessionId) return;

    try {
      setIsSending(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('message', trimmedMessage);
      
      // Append all selected files
      selectedFiles.forEach((fileObj, index) => {
        formData.append(`attachments`, fileObj.file);
        formData.append(`attachment_types`, fileObj.type);
      });

      if (safeCurrentUser.type === 'artist') {
        formData.append('artist_sender', safeCurrentUser.id);
      } else if (safeCurrentUser.type === 'mentor') {
        formData.append('mentor_sender', safeCurrentUser.id);
      }

      const response = await ChatApi.sendMessage(sessionId, formData);
      
      if (response.success) {
        const newMessage = {
          ...response.data,
          isCurrentUser: true,
          sender_name: 'You',
          sender_type: safeCurrentUser.type,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(response.error || response.data?.join(', ') || 'Failed to send message');
      }
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  useEffect(() => {
    if (!sessionId) return;

    loadMessages();
    setupWebSocket();

    const interval = setInterval(loadMessages, 10000);
    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [loadMessages, sessionId, setupWebSocket]);

  useEffect(() => {
    const checkConnection = async () => {
      const { success } = await ChatApi.checkServerHealth();
      setConnectionStatus(success ? 'connected' : 'disconnected');
    };

    checkConnection();
    const healthInterval = setInterval(checkConnection, 30000);

    return () => clearInterval(healthInterval);
  }, []);

  useEffect(() => {
    return () => {
      // Clean up any remaining file URLs
      selectedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      
      // Clean up any ongoing call
      if (callStatus) {
        stopCall();
      }
    };
  }, []);

  if (!sessionId) {
    return (
      <div className="chat-room">
        <div className="chat-error">
          <p>No chat session selected</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="chat-loading">
        <div className="spinner"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h3>
          Chat Session
          <span className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'connected' ? '✓ Online' : '⚠ Offline'}
          </span>
        </h3>
        
        <div className="call-buttons">
          <button 
            onClick={() => startCall('audio')} 
            disabled={connectionStatus !== 'connected' || callStatus}
            className="call-btn audio-call"
            title="Start audio call"
          >
            <i className="fas fa-phone"></i>
          </button>
          <button 
            onClick={() => startCall('video')} 
            disabled={connectionStatus !== 'connected' || callStatus}
            className="call-btn video-call"
            title="Start video call"
          >
            <i className="fas fa-video"></i>
          </button>
          <button onClick={onClose} className="close-btn" aria-label="Close chat">
            ×
          </button>
        </div>
      </div>

      {/* Call UI */}
      {callStatus && (
        <div className={`call-container ${callStatus}`}>
          {callStatus === 'incoming' && (
            <div className="incoming-call">
              <p>{caller} is calling you ({callType})</p>
              <div className="call-actions">
                <button onClick={acceptCall} className="accept-call">
                  <i className="fas fa-phone"></i> Accept
                </button>
                <button onClick={rejectCall} className="reject-call">
                  <i className="fas fa-phone-slash"></i> Reject
                </button>
              </div>
            </div>
          )}
          
          {(callStatus === 'ongoing' || callStatus === 'calling') && (
            <div className="ongoing-call">
              <div className="video-feeds">
                {callType === 'video' && (
                  <>
                    <video 
                      ref={localVideoRef} 
                      autoPlay 
                      muted 
                      className="local-video"
                    />
                    <video 
                      ref={remoteVideoRef} 
                      autoPlay 
                      className="remote-video"
                    />
                  </>
                )}
                {callType === 'audio' && (
                  <div className="audio-call-ui">
                    <i className="fas fa-phone"></i>
                    <p>Ongoing call with {caller || 'the other participant'}</p>
                  </div>
                )}
              </div>
              <button onClick={stopCall} className="end-call">
                <i className="fas fa-phone-slash"></i> End Call
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="chat-error">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="dismiss-btn">
            Dismiss
          </button>
        </div>
      )}

      <div className="messages-container">
        {messages.length === 0 ? (
          <p className="no-messages">
            {connectionStatus === 'connected'
              ? 'No messages yet. Start the conversation!'
              : 'Cannot load messages - please check your connection'}
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.isCurrentUser ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                {!msg.isCurrentUser && (
                  <span className="sender-name">{msg.sender_name}</span>
                )}
                <p>{msg.message}</p>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="message-attachments">
                    {msg.attachments.map((attachment, idx) => (
                      <div key={idx} className="message-attachment">
                        {attachment.type === 'image' ? (
                          <img
                            src={attachment.url}
                            alt="Shared content"
                            className="attachment-image"
                          />
                        ) : attachment.type === 'video' ? (
                          <video
                            src={attachment.url}
                            className="attachment-video"
                            controls
                          />
                        ) : (
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-link"
                          >
                            Download {attachment.name || 'File'}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <time className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </time>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="message-input"
            disabled={isSending || connectionStatus !== 'connected' || callStatus}
          />
          
          <div className="file-input-wrapper">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="file-input"
              accept="image/*, video/*, .pdf, .doc, .docx, .txt"
              id="file-input"
              multiple
              disabled={isSending || connectionStatus !== 'connected' || callStatus}
            />
            <label htmlFor="file-input" className="file-input-label">
              <svg className="attachment-icon" viewBox="0 0 24 24">
                <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
              </svg>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={
              (!inputValue.trim() && selectedFiles.length === 0) || 
              isSending || 
              connectionStatus !== 'connected' ||
              callStatus
            }
            className={`send-btn ${isSending ? 'sending' : ''}`}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
        
        {selectedFiles.length > 0 && (
          <div className="selected-files">
            {selectedFiles.map((fileObj, index) => (
              <div key={index} className="selected-file">
                {fileObj.type === 'image' && (
                  <img
                    src={fileObj.preview}
                    alt="Preview"
                    className="file-preview"
                  />
                )}
                {fileObj.type === 'video' && (
                  <video
                    src={fileObj.preview}
                    className="file-preview"
                    controls
                  />
                )}
                {fileObj.type === 'document' && (
                  <div className="file-info">
                    <span className="file-name">{fileObj.file.name}</span>
                    <span className="file-size">
                      {(fileObj.file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="remove-file-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatRoom;