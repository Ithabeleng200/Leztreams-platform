import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatRoom from './ChatRoom';

const SessionsList = ({ userId, userType }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const endpoint = userType === 'artist' 
          ? `http://localhost:8000/api/artists/${userId}/sessions/`
          : `http://localhost:8000/api/mentors/${userId}/sessions/`;
        
        const response = await axios.get(endpoint);
        setSessions(response.data);
      } catch (err) {
        setError("Failed to fetch sessions");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchSessions();
    }
  }, [userId, userType]);

  if (loading) return <div>Loading sessions...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="sessions-list">
      {selectedSession ? (
        <ChatRoom
          sessionId={selectedSession.id}
          currentUserId={userId}
          onClose={() => setSelectedSession(null)}
        />
      ) : (
        <>
          <h2>Your Active Sessions</h2>
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div key={session.id} className="session-card">
                <h3>
                  {userType === 'artist' 
                    ? `Mentor: ${session.mentor_name}` 
                    : `Artist: ${session.artist_name}`
                  }
                </h3>
                <p>Status: {session.completed ? "Completed" : "Ongoing"}</p>
                <p>Scheduled: {new Date(session.scheduled_time).toLocaleString()}</p>
                <button 
                  onClick={() => setSelectedSession(session)}
                  className="chat-btn"
                >
                  Open Chat
                </button>
              </div>
            ))
          ) : (
            <p>No active sessions found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default SessionsList;