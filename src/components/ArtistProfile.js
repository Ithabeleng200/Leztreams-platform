import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Artistprofile.css'; // Add CSS for styling

const ArtistProfile = () => {
    const { id } = useParams(); // Get the artist ID from the URL
    const [artist, setArtist] = useState(null);
    const [artworks, setArtworks] = useState([]); // State to store the artist's artworks

    useEffect(() => {
        // Fetch the artist's profile data
        const fetchArtistProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/artists/${id}/dashboard/`);
                setArtist(response.data);
            } catch (err) {
                console.error('Error fetching artist profile:', err);
            }
        };

        // Fetch the artist's artworks
        const fetchArtistArtworks = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/artists/${id}/artworks/`);
                setArtworks(response.data);
            } catch (err) {
                console.error('Error fetching artist artworks:', err);
            }
        };

        fetchArtistProfile();
        fetchArtistArtworks();
    }, [id]);

    if (!artist) {
        return <div>Loading...</div>;
    }

    return (
        <div className="artist-profile">
            <h1>{artist.name}</h1>
            <div className="profile-section">
                {artist.profile_picture ? (
                    <img
                        src={`http://localhost:8000${artist.profile_picture}`}
                        alt={artist.name}
                        className="profile-picture"
                    />
                ) : (
                    <div className="placeholder-image">No Image</div>
                )}
                <p>{artist.bio}</p>
            </div>

            <div className="artworks-section">
                <h2>Artworks</h2>
                {artworks.length > 0 ? (
                    artworks.map((artwork) => (
                        <div key={artwork.id} className="artwork-item">
                            <h3>{artwork.title}</h3>
                            {artwork.artwork_file && (
                                <div>
                                    <a
                                        href={`http://localhost:8000${artwork.artwork_file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="download-link"
                                    >
                                        Download Artwork
                                    </a>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No artworks uploaded yet.</p>
                )}
            </div>
        </div>
    );
};

export default ArtistProfile;