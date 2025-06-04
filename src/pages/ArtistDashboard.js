import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ArtistDashboard.css';
import ChatRoom from '../components/ChatRoom';
import { useAuth } from '../components/AuthContext';
import Notification from '../components/Notification';

// LoginForm component
const LoginForm = ({ formData, handleChange, handleLogin, emailRef, passwordRef }) => (
  <div className="auth-card">
    <h2>Artist Login</h2>
    <form onSubmit={handleLogin}>
      <div className="input-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          ref={emailRef}
        />
      </div>
      <div className="input-group">
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          ref={passwordRef}
        />
      </div>
      <button type="submit" className="primary-btn">Sign In</button>
    </form>
  </div>
);

// EditProfileForm component
const EditProfileForm = ({ formData, handleChange, handleUpdateProfile, setActiveTab, bioRef }) => (
  <div className="form-card">
    <h2>Edit Profile</h2>
    <form onSubmit={handleUpdateProfile}>
      <div className="input-group">
        <label>Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows="4"
          ref={bioRef}
        />
      </div>
      <div className="input-group">
        <label>Profile Picture</label>
        <input
          type="file"
          name="profilePicture"
          onChange={handleChange}
          accept="image/*"
        />
      </div>
      <div className="form-actions">
        <button 
          type="button" 
          onClick={() => setActiveTab('dashboard')}
          className="secondary-btn"
        >
          Cancel
        </button>
        <button type="submit" className="primary-btn">Save Changes</button>
      </div>
    </form>
  </div>
);

// ArtworkDetailView component
const ArtworkDetailView = ({ 
  artwork, 
  onClose, 
  marketplaceData, 
  handleMarketplaceChange, 
  handleMarketplaceSubmit,
  newComment,
  setNewComment,
  submitFeedback,
  isLoadingComments,
  commentTextRef,
  trackArtworkView,
  fetchArtworkFeedback

}) => {
  const [activeTab, setActiveTab] = useState('views');
  const [localComments, setLocalComments] = useState(artwork.comments || []);
  const [localViews, setLocalViews] = useState(artwork.views || 0);
  const [averageRating, setAverageRating] = useState(artwork.average_rating || 0);
  const [totalRatings, setTotalRatings] = useState(artwork.total_ratings || 0);

  useEffect(() => {
    if (localComments.length > 0) {
      const sum = localComments.reduce((acc, comment) => acc + comment.rating, 0);
      setAverageRating((sum / localComments.length).toFixed(1));
      setTotalRatings(localComments.length);
    } else {
      setAverageRating(0);
      setTotalRatings(0);
    }
  }, [localComments]);

  const renderArtworkPreview = () => {
    if (!artwork.artwork_file) return null;
    
    const fileExtension = artwork.artwork_file.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return (
        <img
          src={`http://localhost:8000${artwork.artwork_file}`}
          alt={artwork.title}
          className="artwork-main-file"
        />
      );
    } else if (['mp3', 'wav', 'ogg'].includes(fileExtension)) {
      return (
        <audio controls className="artwork-audio">
          <source src={`http://localhost:8000${artwork.artwork_file}`} type={`audio/${fileExtension}`} />
        </audio>
      );
    } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
      return (
        <video controls className="artwork-video">
          <source src={`http://localhost:8000${artwork.artwork_file}`} type={`video/${fileExtension}`} />
        </video>
      );
    } else {
      return (
        <a
          href={`http://localhost:8000${artwork.artwork_file}`}
          target="_blank"
          rel="noopener noreferrer"
          className="download-btn"
        >
          Download Artwork
        </a>
      );
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    await submitFeedback(artwork.id);
    // Refresh comments after submission
    const feedback = await fetchArtworkFeedback(artwork.id);
    setLocalComments(feedback.comments);
  };

  return (
    <div className="artwork-detail-overlay">
      <div className="artwork-detail-container">
        <button onClick={onClose} className="close-btn">
          &times;
        </button>
        
        <div className="artwork-detail-header">
          <h2>{artwork.title}</h2>
          <p className="artwork-category">{artwork.category}</p>
          <p className="artwork-date">
            Uploaded: {new Date(artwork.uploaded_at).toLocaleDateString()}
          </p>
        </div>
        
        <div className="artwork-detail-content">
          <div className="artwork-media">
            {artwork.image ? (
              <img
                src={`http://localhost:8000${artwork.image}`}
                alt={artwork.title}
                className="artwork-main-image"
              />
            ) : (
              <div 
                className="artwork-placeholder-large"
                onClick={() => trackArtworkView(artwork.id)}
              >
                {artwork.title.charAt(0).toUpperCase()}
              </div>
            )}
            
            {renderArtworkPreview()}
          </div>
          
          <div className="artwork-info">
            <h3>Description</h3>
            <p className="artwork-description">
              {artwork.description || "No description available"}
            </p>
            
            {/* Marketplace Section */}
            <div className="marketplace-section">
              <h3>Marketplace Settings</h3>
              <form onSubmit={handleMarketplaceSubmit} className="marketplace-form">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_for_sale"
                      checked={marketplaceData.is_for_sale}
                      onChange={handleMarketplaceChange}
                    />
                    Make this artwork available for sale
                  </label>
                </div>
                
                {marketplaceData.is_for_sale && (
                  <div className="price-inputs">
                    <div className="form-group">
                      <label>Price</label>
                      <div className="price-input-container">
                        <select
                          name="currency"
                          value={marketplaceData.currency}
                          onChange={handleMarketplaceChange}
                          className="currency-select"
                        >
                          <option value="USD">USD</option>
                          <option value="$">$</option>
                          <option value="M">M</option>
                          <option value="£">£</option>
                        </select>
                        <input
                          type="number"
                          name="price"
                          value={marketplaceData.price}
                          onChange={handleMarketplaceChange}
                          placeholder="Enter price"
                          min="0"
                          step="0.01"
                          className="price-input"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <button type="submit" className="primary-btn">
                  Update Marketplace Settings
                </button>
              </form>
            </div>
            
            {/* Tab Navigation */}
            <div className="stats-tabs">
              <div className="tabs-header">
                <button 
                  className={`tab-btn ${activeTab === 'views' ? 'active' : ''}`}
                  onClick={() => setActiveTab('views')}
                >
                  Views
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'ratings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ratings')}
                >
                  Ratings
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('comments')}
                >
                  Comments
                </button>
              </div>
              
              <div className="tab-content">
                {activeTab === 'views' && (
                  <div className="views-tab">
                    <div className="stat-item">
                      <span className="stat-number">{localViews}</span>
                      <span className="stat-label">Total Views</span>
                    </div>
                    <p>This artwork has been viewed {localViews} times.</p>
                  </div>
                )}
                
                {activeTab === 'ratings' && (
                  <div className="ratings-tab">
                    <div className="stat-item">
                      <span className="stat-number">
                        {averageRating || 'N/A'}
                      </span>
                      <span className="stat-label">Average Rating</span>
                    </div>
                    {totalRatings > 0 ? (
                      <div className="rating-breakdown">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = localComments.filter(c => c.rating === star).length;
                          const percentage = (count / totalRatings) * 100;
                          return (
                            <div key={star} className="rating-row">
                              <div className="stars">
                                {Array(star).fill().map((_, i) => (
                                  <span key={i}>★</span>
                                ))}
                              </div>
                              <div className="rating-bar-container">
                                <div 
                                  className="rating-bar" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="rating-count">{count}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p>No ratings yet.</p>
                    )}
                  </div>
                )}
                
                {activeTab === 'comments' && (
                  <div className="comments-tab">
                    <div className="stat-item">
                      <span className="stat-number">{localComments.length}</span>
                      <span className="stat-label">Comments</span>
                    </div>
                    
                    {/* Comment Form */}
                    <div className="comment-form-section">
                      <h4>Add Your Feedback</h4>
                      <form onSubmit={handleCommentSubmit}>
                        <div className="rating-input">
                          <label>Rating:</label>
                          <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`star ${star <= newComment.rating ? 'filled' : ''}`}
                                onClick={() => setNewComment({...newComment, rating: star})}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <textarea
                          value={newComment.text}
                          onChange={(e) => setNewComment({...newComment, text: e.target.value})}
                          placeholder="Share your thoughts about this artwork..."
                          rows="3"
                          required
                          ref={commentTextRef}
                        />
                        <button 
                          type="submit" 
                          className="primary-btn"
                          disabled={isLoadingComments}
                        >
                          {isLoadingComments ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                      </form>
                    </div>
                    
                    {/* Comments List */}
                    <div className="comments-section">
                      <h4>Audience Feedback ({localComments.length})</h4>
                      {localComments.length > 0 ? (
                        localComments.map((comment, index) => (
                          <div key={index} className="comment-item">
                            <div className="comment-header">
                              <span className="comment-user">{comment.user.username}</span>
                              <span className="comment-rating">
                                {Array(5).fill().map((_, i) => (
                                  <span key={i} className={i < comment.rating ? 'star-filled' : 'star-empty'}>
                                    ★
                                  </span>
                                ))}
                              </span>
                            </div>
                            <p className="comment-text">{comment.text}</p>
                            <p className="comment-date">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="no-comments">No comments yet. Be the first to engage with your audience!</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ArtworksGallery component
const ArtworksGallery = ({ 
  artworks, 
  selectedArtwork, 
  setSelectedArtwork, 
  setActiveTab, 
  handleArtworkSelect,
  trackArtworkView,
  fetchArtworkFeedback,
  marketplaceData,
  handleMarketplaceChange,
  handleMarketplaceSubmit,
  newComment,
  setNewComment,
  submitFeedback,
  isLoadingComments,
  commentTextRef
}) => {
  if (selectedArtwork) {
    return (
      <ArtworkDetailView 
        artwork={selectedArtwork} 
        onClose={() => setSelectedArtwork(null)} 
        marketplaceData={marketplaceData}
        handleMarketplaceChange={handleMarketplaceChange}
        handleMarketplaceSubmit={handleMarketplaceSubmit}
        newComment={newComment}
        setNewComment={setNewComment}
        submitFeedback={submitFeedback}
        isLoadingComments={isLoadingComments}
        commentTextRef={commentTextRef}
        trackArtworkView={trackArtworkView}
        fetchArtworkFeedback={fetchArtworkFeedback}
      />
    );
  }

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Your Artworks</h2>
        <button 
          onClick={() => setActiveTab('upload')}
          className="primary-btn"
        >
          + New Artwork
        </button>
      </div>
      
      {artworks.length > 0 ? (
        <div className="artworks-grid">
          {artworks.map(artwork => (
            <div key={artwork.id} className="artwork-card">
              {artwork.image ? (
                <img
                  src={`http://localhost:8000${artwork.image}`}
                  alt={artwork.title}
                  className="artwork-thumbnail"
                  onClick={() => handleArtworkSelect(artwork)}
                />
              ) : (
                <div 
                  className="artwork-placeholder"
                  onClick={() => handleArtworkSelect(artwork)}
                >
                  {artwork.title.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="artwork-info">
                <h4 onClick={() => handleArtworkSelect(artwork)}>
                  {artwork.title}
                </h4>
                <p className="artwork-category">{artwork.category}</p>
                <div className="artwork-stats">
                  <span className="stat-item">
                    <i className="fas fa-eye"></i> {artwork.views_count || 0}
                  </span>
                  <span className="stat-item">
                    <i className="fas fa-comment"></i> {artwork.comments?.length || 0}
                  </span>
                  <span className="stat-item">
                    <i className="fas fa-star"></i> {artwork.average_rating?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <div className="artwork-actions">
                  <button 
                    onClick={() => handleArtworkSelect(artwork)}
                    className="view-btn"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>You haven't uploaded any artworks yet.</p>
          <button 
            onClick={() => setActiveTab('upload')}
            className="primary-btn"
          >
            Upload Your First Artwork
          </button>
        </div>
      )}
      
      <button 
        onClick={() => setActiveTab('dashboard')}
        className="back-btn"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
};

// UploadArtworkForm component
const UploadArtworkForm = ({ 
  formData, 
  handleChange, 
  setActiveTab, 
  artworkTitleRef, 
  artworkDescriptionRef,
  handleUpload,
  isUploading,
  marketplaceData,
  handleMarketplaceChange
}) => {
  const [artworkFile, setArtworkFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'artworkFile') {
      setArtworkFile(files[0]);
    } else if (name === 'imageFile') {
      setImageFile(files[0]);
    }
  };

  return (
    <div className="form-card">
      <h2>Upload New Artwork</h2>
      <form onSubmit={handleUpload}>
        <div className="input-group">
          <label>Title</label>
          <input
            type="text"
            name="artworkTitle"
            value={formData.artworkTitle}
            onChange={handleChange}
            required
            autoComplete="off"
            ref={artworkTitleRef}
          />
        </div>
        <div className="input-group">
          <label>Description</label>
          <textarea
            name="artworkDescription"
            value={formData.artworkDescription}
            onChange={handleChange}
            rows="3"
            required
            autoComplete="off"
            ref={artworkDescriptionRef}
          />
        </div>
        <div className="input-group">
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select category</option>
            <option value="Music">Music</option>
            <option value="Poetry">Poetry</option>
            <option value="Visual Arts">Visual Arts</option>
            <option value="Crafts">Crafts</option>
          </select>
        </div>
        <div className="input-group">
          <label>Artwork File (Required)</label>
          <input
            type="file"
            name="artworkFile"
            onChange={handleFileChange}
            required
          />
          {artworkFile && (
            <p className="file-info">Selected: {artworkFile.name}</p>
          )}
        </div>
        <div className="input-group">
          <label>Preview Image (Optional)</label>
          <input
            type="file"
            name="imageFile"
            onChange={handleFileChange}
            accept="image/*"
          />
          {imageFile && (
            <p className="file-info">Selected: {imageFile.name}</p>
          )}
        </div>

        {/* Marketplace Section */}
        <div className="marketplace-section">
          <h3>Marketplace Options</h3>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_for_sale"
                checked={marketplaceData.is_for_sale}
                onChange={handleMarketplaceChange}
              />
              Make this artwork available for sale
            </label>
          </div>
          
          {marketplaceData.is_for_sale && (
            <div className="price-inputs">
              <div className="form-group">
                <label>Price</label>
                <div className="price-input-container">
                  <select
                    name="currency"
                    value={marketplaceData.currency}
                    onChange={handleMarketplaceChange}
                    className="currency-select"
                  >
                    <option value="USD">USD</option>
                    <option value="$">$</option>
                    <option value="M">M</option>
                    <option value="£">£</option>
                  </select>
                  <input
                    type="number"
                    name="price"
                    value={marketplaceData.price}
                    onChange={handleMarketplaceChange}
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                    className="price-input"
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => setActiveTab('artworks')}
            className="secondary-btn"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="primary-btn"
            disabled={!artworkFile || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Artwork'}
          </button>
        </div>
      </form>
    </div>
  );
};

// MentorDetailView component
const MentorDetailView = ({ 
  mentor, 
  onClose, 
  requestMessage, 
  setRequestMessage, 
  handleMentorshipRequest,
  requestMessageRef
}) => (
  <div className="mentor-detail-overlay">
    <div className="mentor-detail-container">
      <button onClick={onClose} className="close-btn">
        &times;
      </button>
      
      <div className="mentor-header">
        <div className="mentor-avatar-large">
          {mentor.profile_picture ? (
            <img
              src={`http://localhost:8000${mentor.profile_picture}`}
              alt={mentor.name}
            />
          ) : (
            <div className="avatar-placeholder-large">
              {mentor.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="mentor-info">
          <h2>{mentor.name}</h2>
          <p className="mentor-category">{mentor.category}</p>
          <div className="mentor-stats">
            <div className="stat-item">
              <span className="stat-number">{mentor.mentorship_count || 0}</span>
              <span className="stat-label">Mentorships</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {mentor.rating ? mentor.rating.toFixed(1) : 'N/A'}
              </span>
              <span className="stat-label">Rating</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mentor-content">
        <div className="mentor-section">
          <h3>About</h3>
          <p className="mentor-bio">{mentor.bio || "No bio available"}</p>
        </div>
        
        <div className="mentor-request-form">
          <h3>Request Mentorship</h3>
          <textarea
            placeholder="Tell the mentor why you'd like to work with them..."
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            ref={requestMessageRef}
          />
          <button
            onClick={() => {
              handleMentorshipRequest(mentor.id);
              onClose();
            }}
            className="primary-btn"
            disabled={!requestMessage.trim()}
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  </div>
);

// MentorsList component
const MentorsList = ({ 
  availableMentors, 
  isLoadingMentors, 
  setActiveTab, 
  selectedMentor, 
  setSelectedMentor,
  requestMessage,
  setRequestMessage,
  handleMentorshipRequest,
  requestMessageRef,
  fetchAvailableMentors
}) => {
  if (selectedMentor) {
    return (
      <MentorDetailView 
        mentor={selectedMentor} 
        onClose={() => setSelectedMentor(null)} 
        requestMessage={requestMessage}
        setRequestMessage={setRequestMessage}
        handleMentorshipRequest={handleMentorshipRequest}
        requestMessageRef={requestMessageRef}
      />
    );
  }

  return (
    <div className="mentors-container">
      <div className="mentors-header">
        <h2>Available Mentors</h2>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="back-btn"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      {isLoadingMentors ? (
        <div className="loading-state">
          <p>Loading mentors...</p>
        </div>
      ) : availableMentors.length > 0 ? (
        <div className="mentors-grid">
          {availableMentors.map(mentor => (
            <div key={mentor.id} className="mentor-card">
              <div 
                className="mentor-avatar"
                onClick={() => setSelectedMentor(mentor)}
              >
                {mentor.profile_picture ? (
                  <img
                    src={`http://localhost:8000${mentor.profile_picture}`}
                    alt={mentor.name}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {mentor.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="mentor-info">
                <h3 onClick={() => setSelectedMentor(mentor)}>
                  {mentor.name}
                </h3>
                <p className="mentor-category">{mentor.category}</p>
                <div className="mentor-rating">
                  {Array(5).fill().map((_, i) => (
                    <span key={i} className={i < Math.floor(mentor.rating || 0) ? 'star-filled' : 'star-empty'}>
                      ★
                    </span>
                  ))}
                  <span>({mentor.mentorship_count || 0})</span>
                </div>
                <button
                  onClick={() => setSelectedMentor(mentor)}
                  className="view-btn"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No available mentors in your category at this time.</p>
          <button 
            onClick={fetchAvailableMentors}
            className="primary-btn"
          >
            Refresh List
          </button>
        </div>
      )}
    </div>
  );
};

// DashboardOverview component
const DashboardOverview = ({ 
  artist, 
  artworks, 
  setActiveTab, 
  fetchAvailableMentors 
}) => (
  <div className="dashboard-grid">
    <div className="profile-card">
      <div className="avatar-container">
        {artist?.profile_picture ? (
          <img
            src={`http://localhost:8000${artist.profile_picture}`}
            alt="Profile"
            className="profile-avatar"
          />
        ) : (
          <div className="avatar-placeholder">
            {artist?.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <h3>{artist?.name}</h3>
      <p className="bio-text">{artist?.bio || "No bio yet"}</p>
      <button 
        onClick={() => setActiveTab('edit-profile')}
        className="secondary-btn"
      >
        Edit Profile
      </button>
    </div>

    <div className="stats-card">
      <h3>Your Portfolio</h3>
      <div className="stat-item">
        <span className="stat-number">{artworks.length}</span>
        <span className="stat-label">Artworks</span>
      </div>
      <div className="stat-item">
        <span className="stat-number">
         {artworks.reduce((total, artwork) => total + (artwork.views_count || 0), 0)}
        </span>
        <span className="stat-label">Total Views</span>
      </div>
      <button 
        onClick={() => setActiveTab('artworks')}
        className="secondary-btn"
      >
        View All
      </button>
      <button 
        onClick={() => setActiveTab('upload')}
        className="primary-btn"
      >
        Upload New
      </button>
    </div>

    <div className="quick-actions">
      <h3>Quick Actions</h3>
      <button 
        onClick={fetchAvailableMentors}
        className="action-btn mentor-btn"
      >
        Find Mentors
      </button>
      <button 
        onClick={() => setActiveTab('sessions')}
        className="action-btn sessions-btn"
      >
        View Sessions
      </button>
    </div>
  </div>
);

// SessionsList component
const SessionsList = ({ 
  selectedSession, 
  setSelectedSession 
}) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const artistId = localStorage.getItem('artistId');

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:8000/api/artists/${artistId}/sessions/`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setSessions(res.data);
      } catch (err) {
        setError('Failed to load sessions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [artistId]);

  if (selectedSession) {
    return (
      <div className="chat-container">
        <ChatRoom
          sessionId={selectedSession.id}
          currentUserId={artistId}
          onClose={() => setSelectedSession(null)}
        />
      </div>
    );
  }

  if (loading) return <div>Loading sessions...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="sessions-list">
      <h2>Your Mentorship Sessions</h2>
      {sessions.length === 0 ? (
        <p>No active sessions</p>
      ) : (
        sessions.map(session => (
          <div key={session.id} className="session-card">
            <h3>Session with {session.mentor_name}</h3>
            <p>Status: {session.status}</p>
            <button 
              onClick={() => setSelectedSession(session)}
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

// Main ArtistDashboard component
const ArtistDashboard = () => {
  // State management
  const { login } = useAuth();
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    bio: '',
    profilePicture: null,
    artworkTitle: '',
    artworkDescription: '',
    artworkFile: null,
    imageFile: null,
    category: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [availableMentors, setAvailableMentors] = useState([]);
  const [requestMessage, setRequestMessage] = useState('');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [newComment, setNewComment] = useState({ text: '', rating: 3 });
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [viewsData, setViewsData] = useState({});
  const [marketplaceData, setMarketplaceData] = useState({
    is_for_sale: false,
    price: '',
    currency: 'M'
  });

  // Refs for input fields
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const bioRef = useRef(null);
  const artworkTitleRef = useRef(null);
  const artworkDescriptionRef = useRef(null);
  const requestMessageRef = useRef(null);
  const commentTextRef = useRef(null);

  // Check authentication on mount
  useEffect(() => {
    const artistId = localStorage.getItem('artistId');
    if (artistId) {
      fetchArtistData(artistId);
      fetchArtworks(artistId);
      fetchSessions(artistId);
      setIsLoggedIn(true);
    }
  }, []);

  // Track artwork views
  useEffect(() => {
    if (selectedArtwork) {
      trackArtworkView(selectedArtwork.id);
    }
  }, [selectedArtwork]);

  // Fetch artist data
  const fetchArtistData = async (artistId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/artists/${artistId}/dashboard/`);
      setArtist(response.data);
      setFormData(prev => ({ ...prev, bio: response.data.bio }));
    } catch (err) {
      console.error('Error fetching artist data:', err);
      setMessage({ text: 'Failed to fetch artist data', type: 'error' });
    }
  };

  // Fetch artist's artworks
  const fetchArtworks = async (artistId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/artists/${artistId}/artworks/`);
      setArtworks(response.data);
    } catch (err) {
      console.error('Error fetching artworks:', err);
      setMessage({ text: 'Failed to fetch artworks', type: 'error' });
    }
  };

  // Fetch artwork feedback (comments and ratings)
  const fetchArtworkFeedback = async (artworkId) => {
    setIsLoadingComments(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/artworks/${artworkId}/feedback/`);
      return response.data;
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setMessage({ text: 'Failed to load feedback', type: 'error' });
      return { comments: [], average_rating: 0, total_ratings: 0 };
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Track artwork view
  const trackArtworkView = async (artworkId) => {
    try {
      await axios.post(`http://localhost:8000/api/artworks/${artworkId}/track-view/`);
      // Update local views data
      setViewsData(prev => ({
        ...prev,
        [artworkId]: (prev[artworkId] || 0) + 1
      }));
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  // Fetch artwork views
  const fetchArtworkViews = async (artworkId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/artworks/${artworkId}/views/`);
      return response.data.views;
    } catch (err) {
      console.error('Error fetching views:', err);
      return 0;
    }
  };

  // Submit feedback (comment with rating)
  const submitFeedback = async (artworkId) => {
    if (!newComment.text.trim()) {
      setMessage({ text: 'Comment text is required', type: 'error' });
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8000/api/artworks/${artworkId}/submit-feedback/`,
        {
          text: newComment.text,
          rating: newComment.rating
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
  
      // Rest of your success handling code...
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setMessage({ 
        text: err.response?.data?.error || 'Failed to submit feedback', 
        type: 'error' 
      });
    }
  };

  // Fetch available mentors
  const fetchAvailableMentors = async () => {
    const artistId = localStorage.getItem('artistId');
    if (!artistId) return;

    setIsLoadingMentors(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/artists/${artistId}/available-mentors/`);
      setAvailableMentors(response.data);
      setActiveTab('mentors');
      setMessage({ text: '', type: '' });
    } catch (err) {
      console.error('Error fetching mentors:', err);
      setMessage({ text: 'Failed to fetch mentors', type: 'error' });
    } finally {
      setIsLoadingMentors(false);
    }
  };

  // Fetch artist's sessions
  const fetchSessions = async (artistId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/artists/${artistId}/sessions/`);
      setSessions(response.data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setMessage({ text: 'Failed to load sessions', type: 'error' });
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();  
    
    try {
      const response = await axios.post('http://localhost:8000/api/artists/login/', {
        email: formData.email,
        password: formData.password,
      });
    
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('artistId', response.data.artist_id);
    
      // Save current user globally
      login({
        id: response.data.artist_id,
        type: 'artist',
        name: response.data.name || 'Artist'
      });
    
      setIsLoggedIn(true);
      fetchArtistData(response.data.artist_id);
      fetchArtworks(response.data.artist_id);
      fetchSessions(response.data.artist_id);
    
      setMessage({ text: 'Login successful!', type: 'success' });
    } catch (err) {
      console.error('Login failed:', err);
      setMessage({ text: 'Invalid credentials', type: 'error' });
      alert("Invalid credentials!");
    }
  };
    
  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const artistId = localStorage.getItem('artistId');
    if (!artistId) {
      setMessage({ text: 'Authentication required', type: 'error' });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('bio', formData.bio);
    if (formData.profilePicture) {
      formDataToSend.append('profile_picture', formData.profilePicture);
    }

    try {
      const response = await axios.put(
        `http://localhost:8000/api/artists/${artistId}/update-profile/`, 
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setArtist(response.data);
      setMessage({ text: 'Profile updated!', type: 'success' });
    } catch (err) {
      console.error('Update failed:', err);
      setMessage({ text: 'Update failed', type: 'error' });
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('artistId');
    setIsLoggedIn(false);
    setArtist(null);
    setMessage({ text: 'Logged out', type: 'success' });
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prevData => ({
        ...prevData,
        [name]: files[0]
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  // Handle file changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'artworkFile') {
      setFormData({ ...formData, [name]: files[0] });
    } else if (name === 'imageFile') {
      setFormData({ ...formData, [name]: files[0] });
    }
  };

  // Handle mentorship request
  const handleMentorshipRequest = async (mentorId) => {
    const artistId = localStorage.getItem('artistId');
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.post(
        `http://localhost:8000/api/mentorship-requests/${artistId}/${mentorId}/`,
        { message: requestMessage },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setMessage({ text: 'Request sent successfully!', type: 'success' });
      setRequestMessage('');
    } catch (err) {
      console.error('Request failed:', err.response?.data);
      setMessage({ 
        text: err.response?.data?.error || 'Failed to send request', 
        type: 'error' 
      });
    }
  };

  // Handle artwork selection
  const handleArtworkSelect = async (artwork) => {
    // Fetch feedback and views when artwork is selected
    const [feedback, views] = await Promise.all([
      fetchArtworkFeedback(artwork.id),
      fetchArtworkViews(artwork.id)
    ]);
    
    setSelectedArtwork({
      ...artwork,
      comments: feedback.comments,
      average_rating: feedback.average_rating,
      total_ratings: feedback.total_ratings,
      views
    });
  };

  // Handle artwork upload
const handleUpload = async (e) => {
  e.preventDefault();
  const artistId = localStorage.getItem('artistId');
  if (!artistId) return;

  const formDataToSend = new FormData();
  formDataToSend.append('title', formData.artworkTitle);
  formDataToSend.append('description', formData.artworkDescription);
  formDataToSend.append('category', formData.category);
  formDataToSend.append('is_for_sale', marketplaceData.is_for_sale);
  
  if (marketplaceData.is_for_sale) {
    formDataToSend.append('price', marketplaceData.price);
    formDataToSend.append('currency', marketplaceData.currency);
  }
  
  if (formData.artworkFile) {
    formDataToSend.append('artwork_file', formData.artworkFile);
  }
  if (formData.imageFile) {
    formDataToSend.append('image', formData.imageFile);
  }

  try {
    const response = await axios.post(
      `http://localhost:8000/api/artists/${artistId}/upload-artwork/`,
      formDataToSend,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    setArtworks([...artworks, response.data]);
    setFormData({
      ...formData,
      artworkTitle: '',
      artworkDescription: '',
      artworkFile: null,
      imageFile: null,
      category: ''
    });
    setMarketplaceData({
      is_for_sale: false,
      price: '',
      currency: 'USD'
    });
    setMessage({ text: 'Artwork uploaded!', type: 'success' });
    setActiveTab('artworks');
  } catch (err) {
    console.error('Upload failed:', err);
    setMessage({ 
      text: err.response?.data?.error || 'Upload failed', 
      type: 'error' 
    });
  }
};
  // Main App Render
  return (
    <div className="artist-app">
      {!isLoggedIn ? (
        <div className="auth-container">
          <div className="auth-header">
            <h1>Leztreams</h1>
            <p>Platform for artists to showcase and grow</p>
          </div>
          <LoginForm 
            formData={formData}
            handleChange={handleChange}
            handleLogin={handleLogin}
            emailRef={emailRef}
            passwordRef={passwordRef}
          />
        </div>
      ) : (
        <div className="dashboard-container">
          <header className="app-header">
            <div className="header-left">
              <h1>Artist Dashboard</h1>
              <p className="welcome-message">Welcome, {artist?.name || 'Artist'}</p>
              <nav className="main-nav">
                <button 
                  className={activeTab === 'dashboard' ? 'active' : ''}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </button>
                <button 
                  className={activeTab === 'artworks' ? 'active' : ''}
                  onClick={() => setActiveTab('artworks')}
                >
                  Artworks
                </button>
                <button 
                  className={activeTab === 'mentors' ? 'active' : ''}
                  onClick={fetchAvailableMentors}
                >
                  Find Mentors
                </button>
                <button 
                  className={activeTab === 'sessions' ? 'active' : ''}
                  onClick={() => setActiveTab('sessions')}
                >
                  My Sessions
                </button>
              </nav>
            </div>
            <div className="header-right">
              <div className="notification-wrapper">
                <Notification />
              </div>
              <button onClick={handleLogout} className="logout-btn">
                Sign Out
              </button>
            </div>
          </header>

          <main className="main-content">
            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.text}
              </div>
            )}

            {activeTab === 'dashboard' && (
              <DashboardOverview 
                artist={artist} 
                artworks={artworks} 
                setActiveTab={setActiveTab} 
                fetchAvailableMentors={fetchAvailableMentors} 
              />
            )}
            {activeTab === 'edit-profile' && (
              <EditProfileForm 
                formData={formData} 
                handleChange={handleChange} 
                handleUpdateProfile={handleUpdateProfile} 
                setActiveTab={setActiveTab} 
                bioRef={bioRef} 
              />
            )}
            {activeTab === 'artworks' && (
              <ArtworksGallery 
                artworks={artworks} 
                selectedArtwork={selectedArtwork} 
                setSelectedArtwork={setSelectedArtwork} 
                setActiveTab={setActiveTab} 
                handleArtworkSelect={handleArtworkSelect}
                trackArtworkView={trackArtworkView}
                fetchArtworkFeedback={fetchArtworkFeedback}
                marketplaceData={marketplaceData}
                handleMarketplaceChange={(e) => {
                  const { name, value, type, checked } = e.target;
                  setMarketplaceData(prev => ({
                    ...prev,
                    [name]: type === 'checkbox' ? checked : value
                  }));
                }}
                handleMarketplaceSubmit={async (e) => {
                  e.preventDefault();
                  
                  try {
                    const token = localStorage.getItem('token');
                    const artworkId = selectedArtwork.id;
                    
                    const postData = {
                      is_for_sale: marketplaceData.is_for_sale,
                      price: marketplaceData.price,
                      currency: marketplaceData.currency
                    };
                    
                    const updateResponse = await axios.patch(
                      `http://localhost:8000/api/artworks/${artworkId}/`,
                      postData,
                      {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        }
                      }
                    );
                    
                    setSelectedArtwork(updateResponse.data);
                    
                    setMessage({ 
                      text: 'Marketplace settings updated successfully!', 
                      type: 'success' 
                    });
                    
                  } catch (err) {
                    console.error('Marketplace update error:', err.response?.data || err.message);
                    
                    let errorMsg = 'Failed to update marketplace settings';
                    if (err.response?.data?.error) {
                      errorMsg = err.response.data.error;
                    } else if (err.response?.status === 403) {
                      errorMsg = 'You do not have permission to update this artwork';
                    }
                    
                    setMessage({
                      text: errorMsg,
                      type: 'error'
                    });
                  }
                }}
                newComment={newComment}
                setNewComment={setNewComment}
                submitFeedback={submitFeedback}
                isLoadingComments={isLoadingComments}
                commentTextRef={commentTextRef}
              />
            )}
            {activeTab === 'upload' && (
              <UploadArtworkForm 
                formData={formData} 
                handleChange={handleChange} 
                setActiveTab={setActiveTab} 
                artworkTitleRef={artworkTitleRef} 
                artworkDescriptionRef={artworkDescriptionRef}
                handleUpload={handleUpload}
                isUploading={isLoadingComments}
                marketplaceData={marketplaceData}
                handleMarketplaceChange={(e) => {
                  const { name, value, type, checked } = e.target;
                  setMarketplaceData(prev => ({
                    ...prev,
                    [name]: type === 'checkbox' ? checked : value
                  }));
                }}
              />
            )}
            {activeTab === 'mentors' && (
              <MentorsList 
                availableMentors={availableMentors} 
                isLoadingMentors={isLoadingMentors} 
                setActiveTab={setActiveTab} 
                selectedMentor={selectedMentor} 
                setSelectedMentor={setSelectedMentor}
                requestMessage={requestMessage}
                setRequestMessage={setRequestMessage}
                handleMentorshipRequest={handleMentorshipRequest}
                requestMessageRef={requestMessageRef}
                fetchAvailableMentors={fetchAvailableMentors}
              />
            )}
            {activeTab === 'sessions' && (
              <SessionsList 
                selectedSession={selectedSession} 
                setSelectedSession={setSelectedSession} 
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default ArtistDashboard;
