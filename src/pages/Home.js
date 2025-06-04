import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Home.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [artworks, setArtworks] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [selectedSong, setSelectedSong] = useState(null);
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [showMusicPage, setShowMusicPage] = useState(false);
    const [showCategoryPage, setShowCategoryPage] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [feedbackData, setFeedbackData] = useState({
        comments: [],
        averageRating: 0,
        totalRatings: 0,
        views: 0
    });
    const [activeFeedbackTab, setActiveFeedbackTab] = useState('comments');
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [artistArtworks, setArtistArtworks] = useState([]);
    const [showArtistProfile, setShowArtistProfile] = useState(false);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [featuredArtists, setFeaturedArtists] = useState([]);
    const [featuredArtistsByCategory, setFeaturedArtistsByCategory] = useState({}); 
    const [trendingArtworks, setTrendingArtworks] = useState([]);
    const [showPoetryPage, setShowPoetryPage] = useState(false);
    const [showVisualArtsPage, setShowVisualArtsPage] = useState(false);
    const [showTraditionalCraftsPage, setShowTraditionalCraftsPage] = useState(false); 
    const [lastFeaturedUpdate, setLastFeaturedUpdate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [audioElement, setAudioElement] = useState(null);
    
    // Event management state
    const [events, setEvents] = useState([]);
    const [showEventForm, setShowEventForm] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [registrationEvent, setRegistrationEvent] = useState(null);
    const [participationDetails, setParticipationDetails] = useState('');
    const [isParticipating, setIsParticipating] = useState(false);
    const [paymentApprovalUrl, setPaymentApprovalUrl] = useState(null);
    const [currentRegistration, setCurrentRegistration] = useState(null);

    const navigate = useNavigate();

    const categories = ["Music", "Poetry", "Visual Arts", "Crafts"];

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/events/');
                // Filter out past events and sort by date
                const now = new Date();
                const upcomingEvents = response.data
                    .filter(event => new Date(event.end_date) > now)
                    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
                setEvents(upcomingEvents);
            } catch (err) {
                console.error('Error fetching events:', err);
            }
        };
        const fetchArtworks = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/artworks/');
                setArtworks(response.data);
            } catch (err) {
                console.error('Error fetching artworks:', err);
            }
        };
        fetchArtworks();
    }, []);

  useEffect(() => {
  const fetchFeaturedArtists = async () => {
    try {
      const response = await axios.get('/api/featured-artists/');
      
      // Group artists by category
      const artistsByCategory = {};
      response.data.forEach(artist => {
        if (!artistsByCategory[artist.category]) {
          artistsByCategory[artist.category] = [];
        }
        artistsByCategory[artist.category].push(artist);
      });
      
      setFeaturedArtists(response.data);
      setFeaturedArtistsByCategory(artistsByCategory);
    } catch (error) {
      console.error('Error fetching featured artists:', error);
    }
  };
  
  if (artworks.length > 0) {
    fetchFeaturedArtists();
  }
  
  // Refresh every 30 minutes
  const interval = setInterval(() => {
    if (artworks.length > 0) {
      fetchFeaturedArtists();
    }
  }, 30 * 60 * 1000);
  
  return () => clearInterval(interval);
}, [artworks]);

    useEffect(() => {
        const fetchTrendingArtworks = async () => {
            try {
                const response = await axios.get('/api/trending-artworks/');
                setTrendingArtworks(response.data);
            } catch (error) {
                console.error('Error fetching trending artworks:', error);
            }
        };

        if (artworks.length > 0) {
            fetchTrendingArtworks();
        }

        const interval = setInterval(() => {
            if (artworks.length > 0) {
                fetchTrendingArtworks();
            }
        }, 30 * 60 * 1000);

        return () => clearInterval(interval);
    }, [artworks]);

    useEffect(() => {
        const artworkId = selectedSong?.id || selectedArtwork?.id;
        if (artworkId) {
            fetchFeedbackData(artworkId);
        }
    }, [selectedSong, selectedArtwork]);

 useEffect(() => {
    // Initialize audio element when component mounts
    const audio = new Audio();
    setAudioElement(audio);
    
    // Cleanup function
    return () => {
        if (audio) {
            audio.pause();
            audio.src = '';
            audio.removeEventListener('play', () => {});
            audio.removeEventListener('pause', () => {});
            audio.removeEventListener('ended', () => {});
            audio.removeEventListener('timeupdate', () => {});
        }
    };
}, []);

    // Update audio source when selectedSong changes
useEffect(() => {
    if (!audioElement || !selectedSong) return;
    
    try {
        const audioUrl = `http://localhost:8000${selectedSong.artwork_file}`;
        audioElement.src = audioUrl;
        audioElement.load();
        setIsPlaying(false);
        
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);
        
        audioElement.addEventListener('play', handlePlay);
        audioElement.addEventListener('pause', handlePause);
        audioElement.addEventListener('ended', handleEnded);
        
        return () => {
            audioElement.removeEventListener('play', handlePlay);
            audioElement.removeEventListener('pause', handlePause);
            audioElement.removeEventListener('ended', handleEnded);
        };
    } catch (err) {
        console.error("Error setting up audio:", err);
    }
}, [selectedSong, audioElement]);

    useEffect(() => {
        if (!audioElement) return;
        
        const updateProgress = () => {
            if (audioElement.duration) {
                setProgress((audioElement.currentTime / audioElement.duration) * 100);
            }
        };
        
        audioElement.addEventListener('timeupdate', updateProgress);
        return () => audioElement.removeEventListener('timeupdate', updateProgress);
    }, [audioElement]);

    // Event management useEffect
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/events/');
                setEvents(response.data);
            } catch (err) {
                console.error('Error fetching events:', err);
            }
        };

        const checkAdminStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get('http://localhost:8000/api/user/', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setIsAdmin(response.data.is_staff);
                }
            } catch (err) {
                console.error('Error checking admin status:', err);
            }
        };

        fetchEvents();
        checkAdminStatus();
    }, []);

    const fetchFeedbackData = async (artworkId) => {
        setIsLoadingFeedback(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/artworks/${artworkId}/feedback/`);
            setFeedbackData({
                comments: response.data.comments || [],
                averageRating: response.data.average_rating || 0,
                totalRatings: response.data.total_ratings || 0,
                views: response.data.views || 0
            });
        } catch (err) {
            console.error('Error fetching feedback data:', err);
        } finally {
            setIsLoadingFeedback(false);
        }
    };

    const fetchArtistArtworks = async (artistId) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/artists/${artistId}/artworks/`);
            setArtistArtworks(response.data);
        } catch (err) {
            console.error('Error fetching artist artworks:', err);
        }
    };

    const groupedArtworks = artworks.reduce((acc, artwork) => {
        if (!acc[artwork.category]) {
            acc[artwork.category] = [];
        }
        acc[artwork.category].push(artwork);
        return acc;
    }, {});

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        
        setShowMusicPage(false);
        setShowPoetryPage(false);
        setShowVisualArtsPage(false);
        setShowTraditionalCraftsPage(false);
        setShowCategoryPage(false);
        
        switch(category) {
            case "Music":
                setShowMusicPage(true);
                break;
            case "Poetry":
                setShowPoetryPage(true);
                break;
            case "Visual Arts":
                setShowVisualArtsPage(true);
                break;
            case "Crafts":
                setShowTraditionalCraftsPage(true);
                break;
            default:
                setShowCategoryPage(true);
        }
        
        setSelectedArtwork(null);
        setSearchResults(null);
        setShowArtistProfile(false);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResults(null);
            return;
        }
      
        setIsSearching(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/search/?q=${encodeURIComponent(searchQuery)}`);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching:', error);
            setSearchResults({
                artists: [],
                artworks: [],
                error: 'Failed to perform search. Please try again.'
            });
        } finally {
            setIsSearching(false);
        }
    };
      
    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults(null);
    };

    const handleViewArtistProfile = async (artist) => {
        setSelectedArtist(artist);
        await fetchArtistArtworks(artist.id);
        setShowArtistProfile(true);
        setSearchResults(null);
        setShowMusicPage(false);
        setShowCategoryPage(false);
        setShowPoetryPage(false);
        setShowVisualArtsPage(false);
        setShowTraditionalCraftsPage(false);
    };

const handleSongClick = async (artwork) => {
    try {
        setSelectedSong(artwork);
        setIsPlaying(false);
        
        // Ensure we have a valid audio element and artwork file
        if (audioElement && artwork.artwork_file) {
            // Construct the correct URL for the audio file
            const audioUrl = `http://localhost:8000${artwork.artwork_file}`;
            
            // Verify the file exists before setting the source
            try {
                const response = await fetch(audioUrl, { method: 'HEAD' });
                if (response.ok) {
                    audioElement.src = audioUrl;
                    await audioElement.load();
                } else {
                    throw new Error("Audio file not found");
                }
            } catch (err) {
                console.error("Error verifying audio file:", err);
                alert("The audio file could not be loaded. Please try another song.");
                return;
            }
        }
        
        await trackView(artwork.id);
    } catch (err) {
        console.error("Error playing song:", err);
        alert("Failed to play the song. Please try again.");
    }
};

const handleArtworkClick = async (artwork) => {
    try {
        setSelectedArtwork(artwork);
        setSelectedSong(null);
        
        // Maintain the current page state
        if (showMusicPage) {
            setShowMusicPage(true);
            setShowPoetryPage(false);
            setShowVisualArtsPage(false);
            setShowTraditionalCraftsPage(false);
        } else if (showPoetryPage) {
            setShowMusicPage(false);
            setShowPoetryPage(true);
            setShowVisualArtsPage(false);
            setShowTraditionalCraftsPage(false);
        } else if (showVisualArtsPage) {
            setShowMusicPage(false);
            setShowPoetryPage(false);
            setShowVisualArtsPage(true);
            setShowTraditionalCraftsPage(false);
        } else if (showTraditionalCraftsPage) {
            setShowMusicPage(false);
            setShowPoetryPage(false);
            setShowVisualArtsPage(false);
            setShowTraditionalCraftsPage(true);
        }
        
        setShowArtistProfile(false);
        setSearchResults(null);
        
        await trackView(artwork.id);
    } catch (err) {
        console.error("Error handling artwork click:", err);
    }
};

    const trackView = async (artworkId) => {
        try {
            await axios.post(`http://localhost:8000/api/artworks/${artworkId}/track-view/`);
            setFeedbackData(prev => ({
                ...prev,
                views: prev.views + 1
            }));
        } catch (err) {
            console.error("Error tracking view:", err);
        }
    };

const handlePlayPause = async () => {
    if (!audioElement || isLoading || !selectedSong) return;
    
    setIsLoading(true);
    try {
        if (isPlaying) {
            await audioElement.pause();
        } else {
            // Ensure the audio element has a source
            if (!audioElement.src) {
                const audioUrl = `http://localhost:8000${selectedSong.artwork_file}`;
                audioElement.src = audioUrl;
                await audioElement.load();
            }
            await audioElement.play();
        }
    } catch (error) {
        console.error("Playback error:", error);
        alert("Failed to play/pause: " + (error.message || "Audio source not available"));
    } finally {
        setIsLoading(false);
    }
};

    const handleNext = () => {
        if (groupedArtworks["Music"] && selectedSong) {
            const currentIndex = groupedArtworks["Music"].findIndex(song => song.id === selectedSong.id);
            const nextIndex = (currentIndex + 1) % groupedArtworks["Music"].length;
            const nextSong = groupedArtworks["Music"][nextIndex];
            setSelectedSong(nextSong);
            trackView(nextSong.id);
        }
    };

    const handlePrevious = () => {
        if (groupedArtworks["Music"] && selectedSong) {
            const currentIndex = groupedArtworks["Music"].findIndex(song => song.id === selectedSong.id);
            const previousIndex = (currentIndex - 1 + groupedArtworks["Music"].length) % groupedArtworks["Music"].length;
            const previousSong = groupedArtworks["Music"][previousIndex];
            setSelectedSong(previousSong);
            trackView(previousSong.id);
        }
    };

    const handleFeedbackSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in to submit feedback!");
            return;
        }
    
        const artworkId = selectedSong?.id || selectedArtwork?.id;
        if (!artworkId) return;
        
        try {
            const response = await axios.post(
                `http://localhost:8000/api/artworks/${artworkId}/submit-feedback/`,
                {
                    text: comment,
                    rating: rating,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            setFeedbackData(prev => ({
                ...prev,
                comments: [...prev.comments, response.data],
                totalRatings: prev.totalRatings + 1,
                averageRating: (
                    (prev.averageRating * prev.totalRatings + rating) / 
                    (prev.totalRatings + 1)
                ).toFixed(1),
            }));
            
            setComment('');
            setRating(0);
        } catch (err) {
            console.error("Error submitting feedback:", err);
            alert("Failed to submit feedback. Please try again.");
        }
    };

    // Event management functions
    const handleCreateEvent = () => {
        setCurrentEvent(null);
        setShowEventForm(true);
    };

    const handleEditEvent = (event) => {
        setCurrentEvent(event);
        setShowEventForm(true);
    };

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:8000/api/events/${eventId}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setEvents(events.filter(event => event.id !== eventId));
            } catch (err) {
                console.error('Error deleting event:', err);
                alert('Failed to delete event');
            }
        }
    };

    const handleSubmitEvent = async (eventData) => {
        try {
            const token = localStorage.getItem('token');
            let response;
            
            const formData = new FormData();
            for (const key in eventData) {
                formData.append(key, eventData[key]);
            }

            if (currentEvent) {
                response = await axios.put(
                    `http://localhost:8000/api/events/${currentEvent.id}/`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                setEvents(events.map(event => 
                    event.id === currentEvent.id ? response.data : event
                ));
            } else {
                response = await axios.post(
                    'http://localhost:8000/api/events/',
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                setEvents([...events, response.data]);
            }
            
            setShowEventForm(false);
            setCurrentEvent(null);
        } catch (err) {
            console.error('Error saving event:', err);
            alert('Failed to save event');
        }
    };

    const handleRegisterForEvent = (event) => {
        setRegistrationEvent(event);
        setShowRegistrationForm(true);
    };

    const handleSubmitRegistration = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in to register for events');
                return;
            }

            const response = await axios.post(
                `http://localhost:8000/api/events/${registrationEvent.id}/register/`,
                {
                    is_participating: isParticipating,
                    participation_details: participationDetails
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (registrationEvent.ticket_price > 0) {
                // For paid events, redirect to PayPal
                setPaymentApprovalUrl(response.data.approval_url);
                setCurrentRegistration(response.data.registration_id);
            } else {
                // For free events, show success message
                alert('Registration successful!');
                setShowRegistrationForm(false);
                setRegistrationEvent(null);
            }
        } catch (err) {
            console.error('Error registering for event:', err);
            alert('Failed to register for event');
        }
    };

    const handlePaymentSuccess = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:8000/api/events/registrations/${currentRegistration}/verify/`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            alert('Payment and registration successful!');
            setPaymentApprovalUrl(null);
            setCurrentRegistration(null);
            setShowRegistrationForm(false);
            setRegistrationEvent(null);
        } catch (err) {
            console.error('Error verifying payment:', err);
            alert('Failed to verify payment');
        }
    };
    const renderArtworkPreview = (artwork) => {
    if (!artwork.artwork_file) {
        return (
            <div className="no-preview">
                <p>No preview available for this artwork</p>
                {artwork.description && (
                    <div className="artwork-description">
                        <p>{artwork.description}</p>
                    </div>
                )}
            </div>
        );
    }

    const fileUrl = `http://localhost:8000${artwork.artwork_file}`;
    const fileExtension = artwork.artwork_file.split('.').pop().toLowerCase();

    // Audio files
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(fileExtension)) {
        return (
            <div className="audio-preview">
                <audio controls onError={(e) => console.error('Audio load error:', e)}>
                    <source src={fileUrl} type={`audio/${fileExtension}`} />
                    Your browser does not support audio element.
                </audio>
                {artwork.description && (
                    <div className="artwork-description">
                        <p>{artwork.description}</p>
                    </div>
                )}
            </div>
        );
    }

    // Video files
    if (['mp4', 'webm', 'ogg', 'mov'].includes(fileExtension)) {
        return (
            <div className="video-preview">
                <video controls width="100%">
                    <source src={fileUrl} type={`video/${fileExtension}`} />
                    Your browser does not support video tag.
                </video>
                {artwork.description && (
                    <div className="artwork-description">
                        <p>{artwork.description}</p>
                    </div>
                )}
            </div>
        );
    }

    // PDF files (multiple viewing options with fallbacks)
    if (fileExtension === 'pdf') {
        return (
            <div className="pdf-preview">
                <div className="pdf-viewer-container">
                    {/* Try native PDF rendering first */}
                    <object 
                        data={`${fileUrl}#toolbar=0&navpanes=0`}
                        type="application/pdf"
                        width="100%"
                        height="500px"
                        aria-label="PDF document"
                        onError={(e) => {
                            console.error('PDF object failed, trying iframe');
                            e.target.style.display = 'none';
                            document.getElementById('pdf-fallback').style.display = 'block';
                        }}
                    >
                        {/* Fallback 1: Google Docs Viewer */}
                        <iframe
                            id="pdf-fallback"
                            src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                            width="100%"
                            height="500px"
                            frameBorder="0"
                            style={{ display: 'none' }}
                            title="PDF fallback viewer"
                        >
                            {/* Fallback 2: Simple download link */}
                            <p>
                                PDF preview not available. 
                                <a href={fileUrl} download className="download-link">
                                    Download PDF instead
                                </a>
                            </p>
                        </iframe>
                    </object>
                </div>
                {artwork.description && (
                    <div className="artwork-description">
                        <p>{artwork.description}</p>
                    </div>
                )}
            </div>
        );
    }

    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
        return (
            <div className="image-preview">
                <div className="image-container">
                    <img
                        src={fileUrl}
                        alt={artwork.title || 'Artwork image'}
                        className="artwork-image"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/image-error-placeholder.png';
                            console.error('Image load failed:', fileUrl);
                        }}
                    />
                </div>
                {artwork.description && (
                    <div className="artwork-description">
                        <p>{artwork.description}</p>
                    </div>
                )}
            </div>
        );
    }

    // Document files (Word, Text, etc.)
    if (['doc', 'docx', 'txt', 'rtf'].includes(fileExtension)) {
        return (
            <div className="document-preview">
                <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                    width="100%"
                    height="500px"
                    frameBorder="0"
                    title="Document preview"
                >
                    <p>
                        Document preview not available. 
                        <a href={fileUrl} download className="download-link">
                            Download document
                        </a>
                    </p>
                </iframe>
                {artwork.description && (
                    <div className="artwork-description">
                        <p>{artwork.description}</p>
                    </div>
                )}
            </div>
        );
    }

    // Default fallback for unsupported file types
    return (
        <div className="unsupported-file">
            <p>This file type is not supported for preview.</p>
            <a 
                href={fileUrl} 
                download 
                className="download-button"
            >
                Download File
            </a>
            {artwork.description && (
                <div className="artwork-description">
                    <p>{artwork.description}</p>
                </div>
            )}
        </div>
    );
};
    const renderArtistProfile = () => {
        if (!selectedArtist) return null;
    
        return (
            <div className="artist-profile">
                <button 
                    className="back-button" 
                    onClick={() => {
                        setShowArtistProfile(false);
                        setSelectedArtist(null);
                    }}
                >
                    ← Back to Search
                </button>
                
                <div className="artist-header">
                    <div className="artist-avatar-large">
                        {selectedArtist.profile_picture ? (
                            <img 
                                src={`http://localhost:8000${selectedArtist.profile_picture}`} 
                                alt={selectedArtist.name}
                            />
                        ) : (
                            <div className="avatar-placeholder-large">
                                {selectedArtist.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                        )}
                    </div>
                    <div className="artist-info">
                        <h2>{selectedArtist.name || 'Unknown Artist'}</h2>
                        <p className="artist-category">{selectedArtist.category || 'No category'}</p>
                        <p className="artist-bio">{selectedArtist.bio || 'No biography available'}</p>
                    </div>
                </div>
                
                <div className="artist-artworks">
                    <h3>Artworks by {selectedArtist.name || 'this artist'}</h3>
                    
                    {artistArtworks.length > 0 ? (
                        <div className="artwork-grid">
                            {artistArtworks.map(artwork => {
                                const ratings = artwork.comments?.filter(c => c.rating > 0) || [];
                                const avgRating = ratings.length > 0 
                                    ? (ratings.reduce((sum, c) => sum + c.rating, 0) / ratings.length).toFixed(1)
                                    : 0;
                                
                                return (
                                    <div 
                                        key={artwork.id} 
                                        className="artwork-card"
                                        onClick={(e) => {
                                            const cards = document.querySelectorAll('.artwork-card');
                                            cards.forEach(card => card.classList.remove('active'));
                                            e.currentTarget.classList.toggle('active');
                                            if (artwork.category === 'Music') {
                                                setSelectedSong(artwork);
                                                setSelectedArtwork(null);
                                            } else {
                                                setSelectedArtwork(artwork);
                                                setSelectedSong(null);
                                            }
                                        }}
                                    >
                                        {artwork.image ? (
                                            <img
                                                src={`http://localhost:8000${artwork.image}`}
                                                alt={artwork.title}
                                                className="artwork-thumbnail"
                                            />
                                        ) : (
                                            <div className="artwork-placeholder">
                                                {artwork.title?.charAt(0).toUpperCase() || 'A'}
                                            </div>
                                        )}
                                        <div className="artwork-info">
                                            <h4>{artwork.title || 'Untitled'}</h4>
                                            <p className="artwork-category">{artwork.category || 'No category'}</p>
                                            
                                            <div className="artwork-details-hidden">
                                                {avgRating > 0 && (
                                                    <div className="rating-summary">
                                                        <span className="average-rating">{avgRating}</span>
                                                        <div className="star-rating">
                                                            {Array(5).fill().map((_, i) => (
                                                                <span key={i} className={i < avgRating ? 'star-filled' : 'star-empty'}>★</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {artwork.comments?.length > 0 && (
                                                    <div className="comment-preview">
                                                        Latest comment: "{artwork.comments[0].text?.substring(0, 50) || 'No comment text'}..."
                                                    </div>
                                                )}
                                                
                                                <span className="view-more-btn">
                                                    {artwork.category === 'Music' ? 'Play Track' : 'View Details'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p>This artist hasn't uploaded any artworks yet.</p>
                    )}
                </div>
            </div>
        );
    };


const renderUpcomingEvents = () => {
    if (events.length === 0) return null;  // Don't show section if no events
    
    return (
        <div className="upcoming-events">
            <div className="events-header">
                <h2>Upcoming Events</h2>
                {isAdmin && (
                    <button className="add-event-btn" onClick={handleCreateEvent}>
                        + Add Event
                    </button>
                )}
            </div>
            
            <div className="events-grid">
                {events.slice(0, 4).map(event => {  // Show only first 4 events
                    const eventDate = new Date(event.start_date);
                    const day = eventDate.getDate();
                    const month = eventDate.toLocaleString('default', { month: 'short' });
                    const time = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                        <div key={event.id} className="event-card">
                            
                            <div className="event-date">
                                <span className="day">{day}</span>
                                <span className="month">{month}</span>
                            </div>
                            <div className="event-details">
                                <h3>{event.title}</h3>
                                <p className="event-time">{time}</p>
                                <p className="event-location">{event.location}</p>
                                <p className="event-description">
                                    {event.description.length > 100 
                                        ? `${event.description.substring(0, 100)}...` 
                                        : event.description}
                                </p>
                                <div className="event-actions">
                                    <button 
                                        className="event-button"
                                        onClick={() => handleRegisterForEvent(event)}
                                    >
                                        {event.ticket_price > 0 ? `Buy Ticket (${event.currency}${event.ticket_price})` : 'Register Free'}
                                    </button>
                                    {isAdmin && (
                                        <div className="admin-actions">
                                            <button 
                                                className="edit-btn"
                                                onClick={() => handleEditEvent(event)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="delete-btn"
                                                onClick={() => handleDeleteEvent(event.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {events.length > 4 && (
                <button 
                    className="view-all-events"
                    onClick={() => navigate('/events')}
                >
                    View All Events ({events.length})
                </button>
            )}
        </div>
    );
};
const renderFeaturedArtists = () => {
  if (!featuredArtists || featuredArtists.length === 0) {
    return (
      <div className="featured-artists-section">
        <h2>Featured Artists</h2>
        <p className="featured-subtitle">No featured artists available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="featured-artists-section">
      <h2>Featured Artists</h2>
      <p className="featured-subtitle">Discover talented artists who need your support to grow their audience</p>
      
      {Object.entries(featuredArtistsByCategory).map(([category, artists]) => (
        <div key={category} className="featured-category">
          <h3>{category}</h3>
          <div className="featured-artists-grid">
            {artists.map(artist => (
              <div 
                key={artist.id} 
                className="featured-artist-card"
                onClick={() => handleViewArtistProfile(artist)}
              >
                {artist.profile_picture ? (
                  <img
                    src={artist.profile_picture}
                    alt={artist.name}
                    className="artist-avatar"
                  />
                ) : (
                  <div className="artist-avatar-placeholder">{artist.name.charAt(0)}</div>
                )}
                
                <div className="artist-info-container">
                  <h4>{artist.name}</h4>
                  <p className="artist-views">Total Views: {artist.total_views}</p>
                  <p className="artist-artworks">Artworks: {artist.artwork_count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

    const renderSearchResults = () => {
        if (!searchResults) return null;

        return (
            <div className="search-results">
                <div className="search-results-header">
                    <h2>Search Results for "{searchQuery}"</h2>
                    <button className="clear-search" onClick={() => setSearchResults(null)}>Clear Search</button>
                </div>

                {searchResults.error ? (
                    <div className="search-error">
                        <p>{searchResults.error}</p>
                    </div>
                ) : (
                    <>
                        {searchResults.artists && searchResults.artists.length > 0 && (
                            <section className="artist-results">
                                <h3>Artists</h3>
                                <div className="artists-grid">
                                    {searchResults.artists.map(artist => (
                                        <div 
                                            key={artist.id} 
                                            className="artist-card"
                                            onClick={() => handleViewArtistProfile(artist)}
                                        >
                                            {artist.profile_picture ? (
                                                <img 
                                                    src={`http://localhost:8000${artist.profile_picture}`} 
                                                    alt={artist.name}
                                                    className="artist-avatar"
                                                />
                                            ) : (
                                                <div className="artist-avatar-placeholder">
                                                    {artist.name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="artist-info">
                                                <h3>{artist.name}</h3>
                                                <p className="artist-category">{artist.category}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        
                        {searchResults.artworks && searchResults.artworks.length > 0 && (
                            <section className="artwork-results">
                                <h3>Artworks</h3>
                                <div className="artworks-grid">
                                    {searchResults.artworks.map(artwork => (
                                        <div 
                                            key={artwork.id} 
                                            className="artwork-card"
                                            onClick={() => handleArtworkClick(artwork)}
                                        >
                                            {artwork.image ? (
                                                <img
                                                    src={`http://localhost:8000${artwork.image}`}
                                                    alt={artwork.title}
                                                    className="artwork-image"
                                                />
                                            ) : (
                                                <div className="artwork-placeholder">
                                                    {artwork.title.charAt(0)}
                                                </div>
                                            )}
                                            <div className="artwork-info">
                                                <h3>{artwork.title}</h3>
                                                <p className="artist-name">{artwork.artist?.name || 'Unknown Artist'}</p>
                                                <p className="artwork-category">{artwork.category}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {(!searchResults.artists || searchResults.artists.length === 0) && 
                         (!searchResults.artworks || searchResults.artworks.length === 0) && (
                            <div className="no-results">
                                <p>No results found for "{searchQuery}"</p>
                                <p>Try different keywords or browse our categories</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    const renderEventForm = () => (
        <div className="modal-overlay">
            <div className="event-form-modal">
                <h2>{currentEvent ? 'Edit Event' : 'Create Event'}</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = {
                        title: e.target.title.value,
                        description: e.target.description.value,
                        event_type: e.target.event_type.value,
                        start_date: e.target.start_date.value,
                        end_date: e.target.end_date.value,
                        location: e.target.location.value,
                        ticket_price: e.target.ticket_price.value,
                        currency: e.target.currency.value,
                        max_participants: e.target.max_participants.value,
                        is_active: e.target.is_active.checked,
                        image: e.target.image.files[0] || null
                    };
                    handleSubmitEvent(formData);
                }}>
                    <div className="form-group">
                        <label>Title:</label>
                        <input 
                            type="text" 
                            name="title" 
                            defaultValue={currentEvent?.title || ''} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Description:</label>
                        <textarea 
                            name="description" 
                            defaultValue={currentEvent?.description || ''} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Event Type:</label>
                        <select 
                            name="event_type" 
                            defaultValue={currentEvent?.event_type || 'performance'}
                        >
                            <option value="performance">Performance</option>
                            <option value="exhibition">Exhibition</option>
                            <option value="workshop">Workshop</option>
                            <option value="competition">Competition</option>
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Date:</label>
                            <input 
                                type="datetime-local" 
                                name="start_date" 
                                defaultValue={
                                    currentEvent?.start_date 
                                        ? new Date(currentEvent.start_date).toISOString().slice(0, 16)
                                        : ''
                                } 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date:</label>
                            <input 
                                type="datetime-local" 
                                name="end_date" 
                                defaultValue={
                                    currentEvent?.end_date 
                                        ? new Date(currentEvent.end_date).toISOString().slice(0, 16)
                                        : ''
                                } 
                                required 
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Location:</label>
                        <input 
                            type="text" 
                            name="location" 
                            defaultValue={currentEvent?.location || ''} 
                            required 
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Ticket Price:</label>
                            <input 
                                type="number" 
                                name="ticket_price" 
                                min="0" 
                                step="0.01" 
                                defaultValue={currentEvent?.ticket_price || 0} 
                            />
                        </div>
                        <div className="form-group">
                            <label>Currency:</label>
                            <select 
                                name="currency" 
                                defaultValue={currentEvent?.currency || 'M'}
                            >
                                <option value="M">M (Maloti)</option>
                                <option value="USD">USD</option>
                                <option value="ZAR">ZAR</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Max Participants (optional):</label>
                        <input 
                            type="number" 
                            name="max_participants" 
                            min="0" 
                            defaultValue={currentEvent?.max_participants || ''} 
                        />
                    </div>
                    <div className="form-group checkbox-group">
                        <label>
                            <input 
                                type="checkbox" 
                                name="is_active" 
                                defaultChecked={currentEvent ? currentEvent.is_active : true} 
                            />
                            Active Event
                        </label>
                    </div>
                    <div className="form-group">
                        <label>Event Image:</label>
                        <input 
                            type="file" 
                            name="image" 
                            accept="image/*" 
                        />
                        {currentEvent?.image && (
                            <img 
                                src={`http://localhost:8000${currentEvent.image}`} 
                                alt="Current event" 
                                className="current-event-image" 
                            />
                        )}
                    </div>
                    <div className="form-actions">
                        <button type="submit">Save</button>
                        <button 
                            type="button" 
                            onClick={() => {
                                setShowEventForm(false);
                                setCurrentEvent(null);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderRegistrationForm = () => (
        <div className="modal-overlay">
            <div className="registration-form-modal">
                <h2>Register for {registrationEvent?.title}</h2>
                <div className="event-details">
                    <p><strong>Date:</strong> {new Date(registrationEvent?.start_date).toLocaleDateString()}</p>
                    <p><strong>Location:</strong> {registrationEvent?.location}</p>
                    {registrationEvent?.ticket_price > 0 && (
                        <p><strong>Ticket Price:</strong> {registrationEvent.ticket_price} {registrationEvent.currency}</p>
                    )}
                </div>
                
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitRegistration();
                }}>
                    {registrationEvent?.event_type === 'workshop' || 
                     registrationEvent?.event_type === 'competition' ? (
                        <div className="form-group">
                            <label>
                                <input 
                                    type="checkbox" 
                                    checked={isParticipating}
                                    onChange={(e) => setIsParticipating(e.target.checked)}
                                />
                                I want to participate in this event
                            </label>
                        </div>
                    ) : null}
                    
                    {isParticipating && (
                        <div className="form-group">
                            <label>Participation Details:</label>
                            <textarea 
                                value={participationDetails}
                                onChange={(e) => setParticipationDetails(e.target.value)}
                                placeholder="Describe what you'll be presenting or performing"
                            />
                        </div>
                    )}
                    
                    <div className="form-actions">
                        <button type="submit">
                            {registrationEvent?.ticket_price > 0 ? 'Proceed to Payment' : 'Confirm Registration'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => {
                                setShowRegistrationForm(false);
                                setRegistrationEvent(null);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderPayPalRedirect = () => (
        <div className="modal-overlay">
            <div className="paypal-redirect-modal">
                <h2>Complete Your Payment</h2>
                <p>You're being redirected to PayPal to complete your payment.</p>
                <p>If you're not redirected automatically, click the button below:</p>
                <button 
                    className="paypal-button"
                    onClick={() => window.location.href = paymentApprovalUrl}
                >
                    Go to PayPal
                </button>
                <button 
                    className="cancel-button"
                    onClick={() => {
                        setPaymentApprovalUrl(null);
                        setCurrentRegistration(null);
                    }}
                >
                    Cancel Payment
                </button>
            </div>
        </div>
    );

    const MusicPage = () => {
        const musicArtworks = artworks.filter(artwork => artwork.category === "Music");
        
        return (
            <div className="category-page">
                <h2>Music</h2>
                <button className="back-button" onClick={() => setShowMusicPage(false)}>
                    ← Back to Categories
                </button>
        
                <div className="category-description">
                    <p>Listen to amazing music from talented artists across Lesotho.</p>
                </div>
                
                <ul className="music-list">
                    {musicArtworks.length > 0 ? (
                        musicArtworks.map((artwork, index) => (
                            <li
                                 key={index}
                                 className={`music-item ${selectedSong?.id === artwork.id ? 'selected' : ''}`}
                                 onClick={() => handleSongClick(artwork)}
                            >
                                <div className="music-item-details">
                                    {artwork.image && (
                                        <img 
                                            src={`http://localhost:8000${artwork.image}`} 
                                            alt={artwork.title} 
                                            className="music-thumbnail"
                                        />
                                    )}
                                    <h4>{artwork.title}</h4>
                                    <p>{artwork.artist?.name || 'Unknown Artist'}</p>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p>No music available yet.</p>
                    )}
                </ul>

                {selectedSong && (
                    <div className="track-details">
                        <h3>{selectedSong.title}</h3>
                        <p>{selectedSong.artist?.name || 'Unknown Artist'}</p>
                
                        {selectedSong.image && (
                            <img 
                                src={`http://localhost:8000${selectedSong.image}`} 
                                alt={selectedSong.title} 
                                className="track-image"
                            />
                        )}
                
                        {renderArtworkPreview(selectedSong)}
                
                        <div className="controls">
                            <button 
                                onClick={handlePlayPause} 
                                className="play-pause-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                ) : isPlaying ? (
                                    <i className="fas fa-pause"></i>
                                ) : (
                                    <i className="fas fa-play"></i>
                                )}
                            </button>
                            <button onClick={handlePrevious} className="control-btn">
                                <i className="fas fa-step-backward"></i>
                            </button>
                            <button onClick={handleNext} className="control-btn">
                                <i className="fas fa-step-forward"></i>
                            </button>
                        </div>

                        <div className="progress-bar-container">
                            <div className="progress-bar">
                                <div className="progress" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        <div className="feedback-section">
                            <div className="feedback-tabs">
                                <button 
                                    className={activeFeedbackTab === 'comments' ? 'active' : ''}
                                    onClick={() => setActiveFeedbackTab('comments')}
                                >
                                    Comments ({feedbackData.comments.length})
                                </button>
                                <button 
                                    className={activeFeedbackTab === 'ratings' ? 'active' : ''}
                                    onClick={() => setActiveFeedbackTab('ratings')}
                                >
                                    Ratings ({feedbackData.totalRatings})
                                </button>
                                <button 
                                    className={activeFeedbackTab === 'views' ? 'active' : ''}
                                    onClick={() => setActiveFeedbackTab('views')}
                                >
                                    Views ({feedbackData.views})
                                </button>
                            </div>

                            <div className="feedback-content">
                                {activeFeedbackTab === 'comments' && (
                                    <>
                                        <div className="comment-form">
                                            <textarea
                                                placeholder="Add a comment"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            />
                                            <div className="rating-input">
                                                <span>Rating: </span>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span
                                                        key={star}
                                                        className={`star ${star <= rating ? 'filled' : ''}`}
                                                        onClick={() => setRating(star)}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                            <button onClick={handleFeedbackSubmit}>Submit</button>
                                        </div>
                                        <div className="comments-list">
                                            {isLoadingFeedback ? (
                                                <p>Loading comments...</p>
                                            ) : feedbackData.comments.length > 0 ? (
                                                feedbackData.comments.map((item, index) => (
                                                    <div key={index} className="comment-item">
                                                        <p><strong>{item.user?.username || 'Anonymous'}</strong>: {item.text}</p>
                                                        {item.rating > 0 && (
                                                            <p>Rating: 
                                                                {Array(5).fill().map((_, i) => (
                                                                    <span key={i} className={i < item.rating ? 'filled' : ''}>★</span>
                                                                ))}
                                                            </p>
                                                        )}
                                                        <p className="comment-date">
                                                            {new Date(item.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No comments yet.</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {activeFeedbackTab === 'ratings' && (
                                    <div className="ratings-summary">
                                        <h4>Average Rating</h4>
                                        {feedbackData.totalRatings > 0 ? (
                                            <>
                                                <div className="average-rating">
                                                    {feedbackData.averageRating}/5
                                                </div>
                                                <div className="rating-distribution">
                                                    {[5, 4, 3, 2, 1].map((star) => {
                                                        const count = feedbackData.comments.filter(c => c.rating === star).length;
                                                        return (
                                                            <div key={star} className="rating-row">
                                                                <span>{star}★</span>
                                                                <div className="rating-bar-container">
                                                                    <div 
                                                                        className="rating-bar" 
                                                                        style={{
                                                                            width: `${(count / feedbackData.comments.length) * 100}%`
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <span>{count}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <p>No ratings yet.</p>
                                        )}
                                    </div>
                                )}

                                {activeFeedbackTab === 'views' && (
                                    <div className="views-summary">
                                        <h4>View Statistics</h4>
                                        <p>This track has been viewed {feedbackData.views} times.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const PoetryPage = () => {
        const poetryArtworks = artworks.filter(artwork => artwork.category === "Poetry");
        
        return (
            <div className="category-page">
                <h2>Poetry</h2>
                <button className="back-button" onClick={() => setShowPoetryPage(false)}>
                    ← Back to Categories
                </button>
                
                <div className="category-description">
                    <p>Explore beautiful poems from talented writers across Lesotho.</p>
                </div>
                
                <ul className="poetry-list">
                    {poetryArtworks.length > 0 ? (
                        poetryArtworks.map((artwork, index) => (
                            <li
                                key={index}
                                className={`poetry-item ${selectedArtwork?.id === artwork.id ? 'selected' : ''}`}
                                onClick={() => handleArtworkClick(artwork)}
                            >
                                <div className="poetry-item-details">
                                    {artwork.image && (
                                        <img 
                                            src={`http://localhost:8000${artwork.image}`} 
                                            alt={artwork.title} 
                                            className="poetry-thumbnail"
                                        />
                                    )}
                                    <h4>{artwork.title}</h4>
                                    <p>{artwork.artist?.name || 'Unknown Artist'}</p>
                                    <p className="poetry-excerpt">
                                        {artwork.description?.substring(0, 100)}...
                                    </p>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p>No poetry available yet.</p>
                    )}
                </ul>
    
                {selectedArtwork && (
                    <div className="poetry-details">
                        <h3>{selectedArtwork.title}</h3>
                        <p>{selectedArtwork.artist?.name || 'Unknown Artist'}</p>
                        
                        {selectedArtwork.image && (
                            <img 
                                src={`http://localhost:8000${selectedArtwork.image}`} 
                                alt={selectedArtwork.title} 
                                className="poetry-image"
                            />
                        )}
                        
                        {renderArtworkPreview(selectedArtwork)}
                        
                        <p className="poetry-description">
                            {selectedArtwork.description || "No description available"}
                        </p>

                        <div className="feedback-section">
                            <div className="feedback-tabs">
                                <button 
                                    className={activeFeedbackTab === 'comments' ? 'active' : ''}
                                    onClick={() => setActiveFeedbackTab('comments')}
                                >
                                    Comments ({feedbackData.comments.length})
                                </button>
                                <button 
                                    className={activeFeedbackTab === 'ratings' ? 'active' : ''}
                                    onClick={() => setActiveFeedbackTab('ratings')}
                                >
                                    Ratings ({feedbackData.totalRatings})
                                </button>
                                <button 
                                    className={activeFeedbackTab === 'views' ? 'active' : ''}
                                    onClick={() => setActiveFeedbackTab('views')}
                                >
                                    Views ({feedbackData.views})
                                </button>
                            </div>

                            <div className="feedback-content">
                                {activeFeedbackTab === 'comments' && (
                                    <>
                                        <div className="comment-form">
                                            <textarea
                                                placeholder="Add a comment"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            />
                                            <div className="rating-input">
                                                <span>Rating: </span>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span
                                                        key={star}
                                                        className={`star ${star <= rating ? 'filled' : ''}`}
                                                        onClick={() => setRating(star)}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                            <button onClick={handleFeedbackSubmit}>Submit</button>
                                        </div>
                                        <div className="comments-list">
                                            {isLoadingFeedback ? (
                                                <p>Loading comments...</p>
                                            ) : feedbackData.comments.length > 0 ? (
                                                feedbackData.comments.map((item, index) => (
                                                    <div key={index} className="comment-item">
                                                        <p><strong>{item.user?.username || 'Anonymous'}</strong>: {item.text}</p>
                                                        {item.rating > 0 && (
                                                            <p>Rating: 
                                                                {Array(5).fill().map((_, i) => (
                                                                    <span key={i} className={i < item.rating ? 'filled' : ''}>★</span>
                                                                ))}
                                                            </p>
                                                        )}
                                                        <p className="comment-date">
                                                            {new Date(item.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No comments yet.</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {activeFeedbackTab === 'ratings' && (
                                    <div className="ratings-summary">
                                        <h4>Average Rating</h4>
                                        {feedbackData.totalRatings > 0 ? (
                                            <>
                                                <div className="average-rating">
                                                    {feedbackData.averageRating}/5
                                                </div>
                                                <div className="rating-distribution">
                                                    {[5, 4, 3, 2, 1].map((star) => {
                                                        const count = feedbackData.comments.filter(c => c.rating === star).length;
                                                        return (
                                                            <div key={star} className="rating-row">
                                                                <span>{star}★</span>
                                                                <div className="rating-bar-container">
                                                                    <div 
                                                                        className="rating-bar" 
                                                                        style={{
                                                                            width: `${(count / feedbackData.comments.length) * 100}%`
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <span>{count}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <p>No ratings yet.</p>
                                        )}
                                    </div>
                                )}

                                {activeFeedbackTab === 'views' && (
                                    <div className="views-summary">
                                        <h4>View Statistics</h4>
                                        <p>This poem has been viewed {feedbackData.views} times.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
    const VisualArtsPage = () => {
        const visualArtsArtworks = artworks.filter(artwork => artwork.category === "Visual Arts");
        
        return (
            <div className="category-page">
                <h2>Visual Arts</h2>
                <button className="back-button" onClick={() => setShowVisualArtsPage(false)}>
                    ← Back to Categories
                </button>
                
                <div className="category-description">
                    <p>View stunning visual artworks from Lesotho's finest artists.</p>
                </div>
                
                <div className="visual-arts-grid">
                    {visualArtsArtworks.length > 0 ? (
                        visualArtsArtworks.map((artwork, index) => (
                            <div 
                                  key={index}
                                  className="visual-arts-card"
                                  onClick={() => handleArtworkClick(artwork)}
                            >
                                {artwork.image ? (
                                    <img
                                        src={`http://localhost:8000${artwork.image}`}
                                        alt={artwork.title}
                                        className="visual-arts-thumbnail"
                                    />
                                ) : (
                                    <div className="visual-arts-placeholder">
                                        {artwork.title.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="visual-arts-info">
                                    <h4>{artwork.title}</h4>
                                    <p className="artist-name">{artwork.artist?.name || 'Unknown Artist'}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No visual arts available yet.</p>
                    )}
                </div>
    
                {selectedArtwork && (
                    <div className="visual-arts-details">
                        <h3>{selectedArtwork.title}</h3>
                        <p>{selectedArtwork.artist?.name || 'Unknown Artist'}</p>
                        
                        {selectedArtwork.image && (
                            <img 
                                src={`http://localhost:8000${selectedArtwork.image}`} 
                                alt={selectedArtwork.title} 
                                className="visual-arts-image"
                            />
                        )}
                        
                        {renderArtworkPreview(selectedArtwork)}
                        
                        <p className="visual-arts-description">
                            {selectedArtwork.description || "No description available"}
                        </p>

                        <div className="feedback-section">
                            <div className="feedback-tabs">
                                <button 
                                    className={activeFeedbackTab === 'comments' ? 'active' : ''}
                                    onClick={() => setActiveFeedbackTab('comments')}
                                >
                                    Comments ({feedbackData.comments.length})
                                </button>
                                <button 
                                    className={activeFeedbackTab === 'ratings' ? 'active' : ''}
                                    onClick={() => setActiveFeedbackTab('ratings')}
                                >
                                    Ratings ({feedbackData.totalRatings})
                                </button>
                                <button 
                                    className={activeFeedbackTab === 'views' ? 'active' : ''}
                                    onClick={() => setActiveFeedbackTab('views')}
                                >
                                    Views ({feedbackData.views})
                                </button>
                            </div>

                            <div className="feedback-content">
                                {activeFeedbackTab === 'comments' && (
                                    <>
                                        <div className="comment-form">
                                            <textarea
                                                placeholder="Add a comment"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            />
                                            <div className="rating-input">
                                                <span>Rating: </span>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span
                                                        key={star}
                                                        className={`star ${star <= rating ? 'filled' : ''}`}
                                                        onClick={() => setRating(star)}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                            <button onClick={handleFeedbackSubmit}>Submit</button>
                                        </div>
                                        <div className="comments-list">
                                            {isLoadingFeedback ? (
                                                <p>Loading comments...</p>
                                            ) : feedbackData.comments.length > 0 ? (
                                                feedbackData.comments.map((item, index) => (
                                                    <div key={index} className="comment-item">
                                                        <p><strong>{item.user?.username || 'Anonymous'}</strong>: {item.text}</p>
                                                        {item.rating > 0 && (
                                                            <p>Rating: 
                                                                {Array(5).fill().map((_, i) => (
                                                                    <span key={i} className={i < item.rating ? 'filled' : ''}>★</span>
                                                                ))}
                                                            </p>
                                                        )}
                                                        <p className="comment-date">
                                                            {new Date(item.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No comments yet.</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {activeFeedbackTab === 'ratings' && (
                                    <div className="ratings-summary">
                                        <h4>Average Rating</h4>
                                        {feedbackData.totalRatings > 0 ? (
                                            <>
                                                <div className="average-rating">
                                                    {feedbackData.averageRating}/5
                                                </div>
                                                <div className="rating-distribution">
                                                    {[5, 4, 3, 2, 1].map((star) => {
                                                        const count = feedbackData.comments.filter(c => c.rating === star).length;
                                                        return (
                                                            <div key={star} className="rating-row">
                                                                <span>{star}★</span>
                                                                <div className="rating-bar-container">
                                                                    <div 
                                                                        className="rating-bar" 
                                                                        style={{
                                                                            width: `${(count / feedbackData.comments.length) * 100}%`
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <span>{count}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <p>No ratings yet.</p>
                                        )}
                                    </div>
                                )}

                                {activeFeedbackTab === 'views' && (
                                    <div className="views-summary">
                                        <h4>View Statistics</h4>
                                        <p>This artwork has been viewed {feedbackData.views} times.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
    const TraditionalCraftsPage = () => {
        const craftsArtworks = artworks.filter(artwork => artwork.category === "Crafts");
        
        return (
            <div className="category-page">
                <h2>Crafts</h2>
                <button className="back-button" onClick={() => setShowTraditionalCraftsPage(false)}>
                    ← Back to Categories
                </button>
                
                <div className="category-description">
                    <p>Discover traditional Basotho crafts and handmade artworks.</p>
                </div>
                
                <div className="crafts-gallery">
                    {craftsArtworks.length > 0 ? (
                        craftsArtworks.map((artwork, index) => (
                            <div 
                                key={index}
                                 className="craft-item"
                                 onClick={() => handleArtworkClick(artwork)}
                            >
                                {artwork.image ? (
                                    <img
                                        src={`http://localhost:8000${artwork.image}`}
                                        alt={artwork.title}
                                        className="craft-image"
                                    />
                                ) : (
                                    <div className="craft-placeholder">
                                        {artwork.title.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="craft-info">
                                    <h4>{artwork.title}</h4>
                                    <p>{artwork.artist?.name || 'Unknown Artist'}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No traditional crafts available yet.</p>
                    )}
                </div>
    
                {selectedArtwork && (
                    <div className="craft-details">
                        <h3>{selectedArtwork.title}</h3>
                        <p>{selectedArtwork.artist?.name || 'Unknown Artist'}</p>
                        
                        {selectedArtwork.image && (
                            <img 
                                src={`http://localhost:8000${selectedArtwork.image}`} 
                                alt={selectedArtwork.title} 
                                className="craft-detail-image"
                            />
                        )}
                        
                        {renderArtworkPreview(selectedArtwork)}
                        
                        <p className="craft-description">
                            {selectedArtwork.description || "No description available"}
                        </p>

                        <div className="feedback-section">
                            <div className="feedback-tabs">
                                <button 
                                    className={activeFeedbackTab === 'comments' ? 'active' : ''}
                                    onClick={() => setActiveFeedbackTab('comments')}
                                >
                                    Comments ({feedbackData.comments.length})
                                </button>
                                <button 
                                    className={activeFeedbackTab === 'ratings' ? 'active' : ''}
                                    onClick={() => setActiveFeedbackTab('ratings')}
                                >
                                    Ratings ({feedbackData.totalRatings})
                                </button>
                                <button 
                                    className={activeFeedbackTab === 'views' ? 'active' : ''}
                                    onClick={() => setActiveFeedbackTab('views')}
                                >
                                    Views ({feedbackData.views})
                                </button>
                            </div>

                            <div className="feedback-content">
                                {activeFeedbackTab === 'comments' && (
                                    <>
                                        <div className="comment-form">
                                            <textarea
                                                placeholder="Add a comment"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            />
                                            <div className="rating-input">
                                                <span>Rating: </span>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span
                                                        key={star}
                                                        className={`star ${star <= rating ? 'filled' : ''}`}
                                                        onClick={() => setRating(star)}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                            <button onClick={handleFeedbackSubmit}>Submit</button>
                                        </div>
                                        <div className="comments-list">
                                            {isLoadingFeedback ? (
                                                <p>Loading comments...</p>
                                            ) : feedbackData.comments.length > 0 ? (
                                                feedbackData.comments.map((item, index) => (
                                                    <div key={index} className="comment-item">
                                                        <p><strong>{item.user?.username || 'Anonymous'}</strong>: {item.text}</p>
                                                        {item.rating > 0 && (
                                                            <p>Rating: 
                                                                {Array(5).fill().map((_, i) => (
                                                                    <span key={i} className={i < item.rating ? 'filled' : ''}>★</span>
                                                                ))}
                                                            </p>
                                                        )}
                                                        <p className="comment-date">
                                                            {new Date(item.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No comments yet.</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {activeFeedbackTab === 'ratings' && (
                                    <div className="ratings-summary">
                                        <h4>Average Rating</h4>
                                        {feedbackData.totalRatings > 0 ? (
                                            <>
                                                <div className="average-rating">
                                                    {feedbackData.averageRating}/5
                                                </div>
                                                <div className="rating-distribution">
                                                    {[5, 4, 3, 2, 1].map((star) => {
                                                        const count = feedbackData.comments.filter(c => c.rating === star).length;
                                                        return (
                                                            <div key={star} className="rating-row">
                                                                <span>{star}★</span>
                                                                <div className="rating-bar-container">
                                                                    <div 
                                                                        className="rating-bar" 
                                                                        style={{
                                                                            width: `${(count / feedbackData.comments.length) * 100}%`
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <span>{count}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <p>No ratings yet.</p>
                                        )}
                                    </div>
                                )}

                                {activeFeedbackTab === 'views' && (
                                    <div className="views-summary">
                                        <h4>View Statistics</h4>
                                        <p>This craft has been viewed {feedbackData.views} times.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="home">
            <Navbar />
            
            <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-container">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search artists, artworks, or categories..."
                            className="search-input"
                        />
                        <div className="search-buttons">
                            <button type="submit" className="search-button" disabled={isSearching}>
                                {isSearching ? 'Searching...' : 'Search'}
                            </button>
                            {searchResults && (
                                <button type="button" onClick={clearSearch} className="clear-search">
                                    Clear Search
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {renderSearchResults()}
            </div>

            {!searchResults && !showMusicPage && !showPoetryPage && 
             !showVisualArtsPage && !showTraditionalCraftsPage && !showArtistProfile && (
                <>
                    {renderFeaturedArtists()}
                    
                    <div className="categories-section">
                        <h2>Browse by Category</h2>
                        <div className="categories-grid">
                            {categories.map(category => (
                                <div
                                    key={category}
                                    className={`category-card ${activeCategory === category ? 'active' : ''}`}
                                    onClick={() => handleCategoryClick(category)}
                                >
                                    <h3>{category}</h3>
                                    <p>{groupedArtworks[category]?.length || 0} artworks</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {renderUpcomingEvents()}
                </>
            )}

            {showMusicPage && <MusicPage />}
            {showPoetryPage && <PoetryPage />}
            {showVisualArtsPage && <VisualArtsPage />}
            {showTraditionalCraftsPage && <TraditionalCraftsPage />}
            {showArtistProfile && renderArtistProfile()}
        </div>
    );
};

export default Home;