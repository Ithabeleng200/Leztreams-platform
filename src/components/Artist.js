import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Reintroduce Link for navigation
import './Artist.css';

const ArtistsPage = () => {
    const [artists, setArtists] = useState([]);

    useEffect(() => {
        // Fetch all artists from the backend
        const fetchArtists = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/artists/');
                setArtists(response.data);
            } catch (err) {
                console.error('Error fetching artists:', err);
            }
        };

        fetchArtists();
    }, []);

    return (
        <div className="artists-page">
            <h1>Artists</h1>
            <ul className="artists-list">
                {artists.map((artist) => (
                    <li key={artist.id} className="artist-item">
                        {/* Link to Artist Profile (clickable picture and name) */}
                        <Link to={`/artist/${artist.id}`} className="artist-link">
                            <div className="artist-image">
                                {artist.profile_picture ? (
                                    <img
                                        src={`http://localhost:8000${artist.profile_picture}`}
                                        alt={artist.name}
                                    />
                                ) : (
                                    <div className="placeholder-image">No Image</div>
                                )}
                            </div>
                            <div className="artist-info">
                                <h2>{artist.name}</h2>
                                <p>{artist.bio}</p>
                            </div>
                        </Link>

                        {/* Follow and Contact Buttons */}
                        <div className="artist-buttons">
                            <button className="follow-button">Follow</button>
                            <button className="contact-button">Contact</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ArtistsPage;