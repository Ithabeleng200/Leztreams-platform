import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MentorDashboard.css';
import ChatRoom from '../components/ChatRoom';
import { useAuth } from '../components/AuthContext';
import Notification from '../components/Notification';

const MentorDashboard = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const { currentUser, login } = useAuth();
  const [mentorData, setMentorData] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [sessionSchedule, setSessionSchedule] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    bio: '',
    years_of_experience: '',
    education: '',
    notable_projects: '',
    social_media_links: '',
    mentorship_approach: '',
    session_types: '',
    pricing: ''
  });
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: '',
    description: '',
    media: null,
    mediaType: 'image'
  });
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('mentorId');
    setMentorData(null);
    setLoginData({ email: '', password: '' });
    navigate('/');
  }, [navigate]);

  const fetchPortfolioItems = useCallback(async (mentorId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/mentors/${mentorId}/portfolio/`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          validateStatus: function (status) {
            return status < 500;
          }
        }
      );
      if (res.status === 401) {
        setMessage({ text: 'Please login again', type: 'error' });
        handleLogout();
      } else if (res.status === 404) {
        setPortfolioItems([]);
      } else {
        setPortfolioItems(res.data);
      }
    } catch (err) {
      console.error('Error fetching portfolio items:', err);
      setPortfolioItems([]);
    }
  }, [handleLogout]);

  useEffect(() => {
    const mentorId = localStorage.getItem('mentorId');
    if (mentorId) {
      fetchMentorData(mentorId);
      fetchMentorshipRequests(mentorId);
      fetchPortfolioItems(mentorId);
    }
  }, [fetchPortfolioItems]);

  const fetchSessions = async (mentorId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/mentors/${mentorId}/sessions/`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setSessions(response.data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setMessage({
        text: 'Failed to load sessions. Please login again.',
        type: 'error'
      });
      handleLogout();
    }
  };

  const fetchMentorData = async (mentorId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/mentors/${mentorId}/`);
      setMentorData(response.data);
      setIsAvailable(response.data.is_available || false);
      setEditData({
        bio: response.data.bio || '',
        years_of_experience: response.data.years_of_experience || '',
        education: response.data.education || '',
        notable_projects: response.data.notable_projects || '',
        social_media_links: response.data.social_media_links || '',
        mentorship_approach: response.data.mentorship_approach || '',
        session_types: response.data.session_types || '',
        pricing: response.data.pricing || ''
      });
    } catch (err) {
      console.error('Error fetching mentor data:', err);
      setMessage({ text: 'Failed to load mentor data. Please try again.', type: 'error' });
    }
  };

  const fetchMentorshipRequests = async (mentorId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/mentors/${mentorId}/mentorship-requests/`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setMentorshipRequests(res.data);
    } catch (err) {
      console.error('Error fetching mentorship requests:', err);
      setMessage({
        text: 'Failed to load mentorship requests. Please try again.',
        type: 'error'
      });
    }
  };

  const respondToRequest = async (requestId, action) => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/mentors/respond-to-request/${requestId}/`,
        { action: action },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (!response.data || response.data.success === undefined) {
        throw new Error('Invalid server response');
      }
      if (response.data.success) {
        const mentorId = localStorage.getItem('mentorId');
        await fetchMentorshipRequests(mentorId);
        if (action === 'accept') {
          await fetchSessions(mentorId);
          if (response.data.session) {
            setSelectedSession(response.data.session);
            setActiveTab('sessions');
          }
        }
        setMessage({
          text: response.data.message || `Request ${action}ed successfully`,
          type: 'success'
        });
      } else {
        throw new Error(response.data.error || 'Request failed');
      }
    } catch (err) {
      console.error('Error responding to request:', err);
      setMessage({
        text: err.response?.data?.error ||
          err.message ||
          `Failed to ${action} request. Please try again.`,
        type: 'error'
      });
    }
  };

  const handleAvailabilityChange = async () => {
    const mentorId = localStorage.getItem('mentorId');
    if (!mentorId) return;
    const updatedAvailability = !isAvailable;
    try {
      const res = await axios.patch(
        `http://localhost:8000/api/mentors/${mentorId}/update-availability/`,
        { is_available: updatedAvailability }
      );
      setIsAvailable(updatedAvailability);
      setMessage({
        text: res.data.message || `Availability updated to ${updatedAvailability ? 'Available' : 'Not available'}`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error updating availability:', err);
      setMessage({
        text: err.response?.data?.error || 'Failed to update availability',
        type: 'error'
      });
    }
  };

  const handleScheduleSession = async () => {
    if (!sessionSchedule || !mentorData?.id) return;
    try {
      await axios.post('http://localhost:8000/api/mentors/schedule-session/', {
        mentor_id: mentorData.id,
        session_schedule: sessionSchedule,
      });
      setSessionSchedule('');
      setMessage({ text: 'Session scheduled successfully!', type: 'success' });
    } catch (err) {
      console.error('Error scheduling session:', err);
      setMessage({ text: 'Failed to schedule session. Please try again.', type: 'error' });
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/mentors/mentor-login/', loginData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('mentorId', response.data.mentor_id);
        login({
          id: response.data.mentor_id,
          type: 'mentor',
          name: response.data.name || 'Mentor'
        });
        fetchMentorData(response.data.mentor_id);
      }
    } catch (err) {
      console.error('Error during login:', err);
      setMessage({ text: 'Invalid credentials. Please try again.', type: 'error' });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handlePortfolioItemChange = (e) => {
    const { name, value } = e.target;
    setNewPortfolioItem({ ...newPortfolioItem, [name]: value });
  };

  const handlePortfolioFileChange = (e) => {
    setNewPortfolioItem({ ...newPortfolioItem, media: e.target.files[0] });
  };

  const submitProfileUpdate = async () => {
    const mentorId = localStorage.getItem('mentorId');
    if (!mentorId) return;
    try {
      await axios.patch(
        `http://localhost:8000/api/mentors/${mentorId}/update-profile/`,
        editData
      );
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      fetchMentorData(mentorId);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
    }
  };

  const addPortfolioItem = async () => {
    const mentorId = localStorage.getItem('mentorId');
    if (!mentorId) return;
    const formData = new FormData();
    formData.append('title', newPortfolioItem.title);
    formData.append('description', newPortfolioItem.description);
    formData.append('media_type', newPortfolioItem.mediaType);
    if (newPortfolioItem.media) {
      formData.append('media', newPortfolioItem.media);
    }
    try {
      await axios.post(
        `http://localhost:8000/api/mentors/${mentorId}/portfolio/`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      setMessage({ text: 'Portfolio item added!', type: 'success' });
      setNewPortfolioItem({
        title: '',
        description: '',
        media: null,
        mediaType: 'image'
      });
      fetchPortfolioItems(mentorId);
    } catch (err) {
      console.error('Error adding portfolio item:', err);
      setMessage({ text: 'Failed to add portfolio item. Please try again.', type: 'error' });
    }
  };

  const deletePortfolioItem = async (itemId) => {
    const mentorId = localStorage.getItem('mentorId');
    if (!mentorId) return;
    try {
      await axios.delete(
        `http://localhost:8000/api/mentors/${mentorId}/portfolio/${itemId}/`
      );
      setMessage({ text: 'Portfolio item deleted.', type: 'success' });
      fetchPortfolioItems(mentorId);
    } catch (err) {
      console.error('Error deleting portfolio item:', err);
      setMessage({ text: 'Failed to delete portfolio item.', type: 'error' });
    }
  };

  const SessionsList = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mentorId = localStorage.getItem('mentorId');

    useEffect(() => {
      const loadSessions = async () => {
        try {
          const res = await axios.get(
            `http://localhost:8000/api/mentors/${mentorId}/sessions/`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              validateStatus: function (status) {
                return status < 500;
              }
            }
          );
          if (res.status === 401) {
            setError('Session expired. Please login again.');
            handleLogout();
          } else if (res.status === 404) {
            setSessions([]);
            setError('Sessions feature not available yet');
          } else {
            setSessions(res.data);
          }
        } catch (err) {
          setError('Failed to load sessions');
          console.error('Error fetching sessions:', err);
        } finally {
          setLoading(false);
        }
      };
      if (mentorId) {
        loadSessions();
      }
    }, [mentorId, handleLogout]);

    if (selectedSession) {
      return (
        <div className="chat-container">
          <ChatRoom
            sessionId={selectedSession.id}
            currentUserId={mentorData.id}
            onClose={() => setSelectedSession(null)}
          />
        </div>
      );
    }

    if (loading) {
      return <div className="loading">Loading sessions...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    return (
      <div className="sessions-list">
        <h2>Your Mentorship Sessions</h2>
        {sessions.length === 0 ? (
          <p>No active mentorship sessions</p>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="session-card">
              <h3>Session with {session.artist_name}</h3>
              <p>Scheduled: {new Date(session.scheduled_time).toLocaleString()}</p>
              <p>Status: {session.completed ? 'Completed' : 'Ongoing'}</p>
              <button
                onClick={() => {
                  setSelectedSession(session);
                  setActiveTab('sessions');
                }}
                className="chat-btn"
              >
                Open Chat
              </button>
            </div>
          ))
        )}
      </div>
    );
  };

  if (!mentorData) {
    return (
      <div className="mentor-dashboard-container">
        <h1>Mentor Login</h1>
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleLoginSubmit} className="login-form">
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />
          </label>
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  const renderDashboardTab = () => (
    <div className="dashboard-tab">
      <div className="profile-overview">
        <h2>Welcome, {mentorData.name || 'Mentor'}</h2>
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-number">{mentorData.mentorship_count || 0}</span>
            <span className="stat-label">Mentorships</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{mentorData.rating ? mentorData.rating.toFixed(1) : 'N/A'}</span>
            <span className="stat-label">Average Rating</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{mentorData.years_of_experience || 'N/A'}</span>
            <span className="stat-label">Years Experience</span>
          </div>
        </div>
      </div>
      <div className="availability-section">
        <h3>Availability Status</h3>
        <label className="availability-toggle">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={handleAvailabilityChange}
          />
          <span className="toggle-slider"></span>
          {isAvailable ? 'Available for mentorship' : 'Not available'}
        </label>
        <p className="availability-note">
          When available, your profile will be visible to artists seeking mentorship.
        </p>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="profile-tab">
      <h2>Profile Management</h2>
      {editMode ? (
        <div className="edit-profile-form">
          <label>
            Bio:
            <textarea
              name="bio"
              value={editData.bio}
              onChange={handleEditChange}
              placeholder="Tell us about your professional background"
            />
          </label>
          <label>
            Years of Experience:
            <input
              type="number"
              name="years_of_experience"
              value={editData.years_of_experience}
              onChange={handleEditChange}
              placeholder="Number of years"
            />
          </label>
          <label>
            Education/Certifications:
            <textarea
              name="education"
              value={editData.education}
              onChange={handleEditChange}
              placeholder="List your education and certifications"
            />
          </label>
          <label>
            Notable Projects:
            <textarea
              name="notable_projects"
              value={editData.notable_projects}
              onChange={handleEditChange}
              placeholder="Describe your notable projects"
            />
          </label>
          <label>
            Social Media Links:
            <input
              type="text"
              name="social_media_links"
              value={editData.social_media_links}
              onChange={handleEditChange}
              placeholder="Comma-separated links (e.g., https://twitter.com/you, https://linkedin.com/in/you)"
            />
          </label>
          <label>
            Mentorship Approach:
            <textarea
              name="mentorship_approach"
              value={editData.mentorship_approach}
              onChange={handleEditChange}
              placeholder="Describe your mentorship style and approach"
            />
          </label>
          <label>
            Session Types:
            <input
              type="text"
              name="session_types"
              value={editData.session_types}
              onChange={handleEditChange}
              placeholder="e.g., One-on-one, Group, Workshop"
            />
          </label>
          <label>
            Pricing Information:
            <input
              type="text"
              name="pricing"
              value={editData.pricing}
              onChange={handleEditChange}
              placeholder="e.g., $50/hour, $200/month"
            />
          </label>
          <div className="form-actions">
            <button onClick={submitProfileUpdate} className="save-btn">Save Changes</button>
            <button onClick={() => setEditMode(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="profile-view">
          <div className="profile-section">
            <h3>Professional Bio</h3>
            <p>{mentorData.bio || 'No bio provided'}</p>
          </div>
          <div className="profile-section">
            <h3>Experience</h3>
            <p><strong>Years of Experience:</strong> {mentorData.years_of_experience || 'N/A'}</p>
            <p><strong>Education/Certifications:</strong> {mentorData.education || 'None provided'}</p>
          </div>
          <div className="profile-section">
            <h3>Notable Projects</h3>
            <p>{mentorData.notable_projects || 'None provided'}</p>
          </div>
          <div className="profile-section">
            <h3>Mentorship Details</h3>
            <p><strong>Approach:</strong> {mentorData.mentorship_approach || 'Not specified'}</p>
            <p><strong>Session Types:</strong> {mentorData.session_types || 'Not specified'}</p>
            <p><strong>Pricing:</strong> {mentorData.pricing || 'Not specified'}</p>
          </div>
          <div className="profile-section">
            <h3>Social Media & Links</h3>
            {mentorData.social_media_links ? (
              <div className="social-links">
                {mentorData.social_media_links.split(',').map((link, index) => (
                  <a key={index} href={link.trim()} target="_blank" rel="noopener noreferrer">
                    {link.trim()}
                  </a>
                ))}
              </div>
            ) : (
              <p>No links provided</p>
            )}
          </div>
          <button onClick={() => setEditMode(true)} className="edit-btn">Edit Profile</button>
        </div>
      )}
    </div>
  );

  const renderPortfolioTab = () => (
    <div className="portfolio-tab">
      <h2>Portfolio Management</h2>
      <div className="portfolio-items">
        {portfolioItems.length > 0 ? (
          portfolioItems.map(item => (
            <div key={item.id} className="portfolio-item">
              {item.media_type === 'image' ? (
                <img
                  src={`http://localhost:8000${item.media_url}`}
                  alt={item.title}
                  className="portfolio-media"
                />
              ) : (
                <video controls className="portfolio-media">
                  <source src={`http://localhost:8000${item.media_url}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              <div className="portfolio-details">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <button
                  onClick={() => deletePortfolioItem(item.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No portfolio items yet. Add some to showcase your work!</p>
        )}
      </div>
      <div className="add-portfolio-item">
        <h3>Add New Portfolio Item</h3>
        <div className="portfolio-form">
          <label>
            Title:
            <input
              type="text"
              name="title"
              value={newPortfolioItem.title}
              onChange={handlePortfolioItemChange}
              placeholder="Project title"
            />
          </label>
          <label>
            Description:
            <textarea
              name="description"
              value={newPortfolioItem.description}
              onChange={handlePortfolioItemChange}
              placeholder="Describe your project"
            />
          </label>
          <label>
            Media Type:
            <select
              name="mediaType"
              value={newPortfolioItem.mediaType}
              onChange={handlePortfolioItemChange}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </label>
          <label>
            Upload Media:
            <input
              type="file"
              onChange={handlePortfolioFileChange}
              accept={newPortfolioItem.mediaType === 'image' ? 'image/*' : 'video/*'}
            />
          </label>
          <button onClick={addPortfolioItem} className="add-btn">Add Item</button>
        </div>
      </div>
    </div>
  );

  const renderSessionsTab = () => {
    const pendingRequests = mentorshipRequests.filter(r => r.status === 'PENDING');
    const acceptedRequests = mentorshipRequests.filter(r => r.status === 'ACCEPTED');
    const rejectedRequests = mentorshipRequests.filter(r => r.status === 'REJECTED');

    return (
      <div className="sessions-tab">
        <h2>Mentorship Sessions</h2>
        <SessionsList />
        <div className="mentorship-requests">
          <h3>Mentorship Requests</h3>
          {mentorshipRequests.length > 0 ? (
            <div className="requests-list">
              {pendingRequests.length > 0 && (
                <>
                  <h4>Pending Requests ({pendingRequests.length})</h4>
                  {pendingRequests.map(request => (
                    <div key={request.id} className="request-card pending">
                      <div className="request-header">
                        {request.artist_profile_picture && (
                          <img
                            src={`http://localhost:8000${request.artist_profile_picture}`}
                            alt={request.artist_name}
                            className="artist-avatar"
                          />
                        )}
                        <div>
                          <h4>Request from: {request.artist_name}</h4>
                          <p>{new Date(request.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="request-message">
                        <p><strong>Message:</strong> {request.message}</p>
                      </div>
                      <div className="request-actions">
                        <button
                          onClick={() => respondToRequest(request.id, 'accept')}
                          className="accept-btn"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => respondToRequest(request.id, 'reject')}
                          className="reject-btn"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {acceptedRequests.length > 0 && (
                <>
                  <h4>Accepted Requests ({acceptedRequests.length})</h4>
                  {acceptedRequests.map(request => (
                    <div key={request.id} className="request-card accepted">
                      <div className="request-header">
                        {request.artist_profile_picture && (
                          <img
                            src={`http://localhost:8000${request.artist_profile_picture}`}
                            alt={request.artist_name}
                            className="artist-avatar"
                          />
                        )}
                        <div>
                          <h4>Request from: {request.artist_name}</h4>
                          <p>{new Date(request.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="request-status">
                        <p>Status: <span className="status-accepted">Accepted</span></p>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {rejectedRequests.length > 0 && (
                <>
                  <h4>Rejected Requests ({rejectedRequests.length})</h4>
                  {rejectedRequests.map(request => (
                    <div key={request.id} className="request-card rejected">
                      <div className="request-header">
                        {request.artist_profile_picture && (
                          <img
                            src={`http://localhost:8000${request.artist_profile_picture}`}
                            alt={request.artist_name}
                            className="artist-avatar"
                          />
                        )}
                        <div>
                          <h4>Request from: {request.artist_name}</h4>
                          <p>{new Date(request.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="request-status">
                        <p>Status: <span className="status-rejected">Rejected</span></p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <p>No mentorship requests at this time.</p>
          )}
        </div>
        <div className="schedule-session">
          <h3>Schedule New Session</h3>
          <div className="session-form">
            <input
              type="datetime-local"
              value={sessionSchedule}
              onChange={(e) => setSessionSchedule(e.target.value)}
              required
            />
            <button onClick={handleScheduleSession}>Schedule Session</button>
          </div>
        </div>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'portfolio':
        return renderPortfolioTab();
      case 'sessions':
        return renderSessionsTab();
      default:
        return renderDashboardTab();
    }
  };

  return (
    <div className="mentor-dashboard-container">
    <div className="dashboard-header">
  <div className="header-left">
    <h1>Mentor Dashboard</h1>
    <div className="mentor-category">
      {mentorData.category}
    </div>
  </div>
  <div className="header-right">
    <div className="notification-wrapper">
      <Notification />
    </div>
    <button onClick={handleLogout} className="logout-button">Logout</button>
  </div>
</div>
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      <div className="dashboard-nav">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={activeTab === 'dashboard' ? 'active' : ''}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={activeTab === 'profile' ? 'active' : ''}
        >
          Edit Profile
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={activeTab === 'portfolio' ? 'active' : ''}
        >
          Manage Portfolio
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={activeTab === 'sessions' ? 'active' : ''}
        >
          View Sessions
        </button>
      </div>
      <div className="dashboard-content">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default MentorDashboard;