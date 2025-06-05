import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateAccount.css';

const CreateArtist = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        bio: '',
        category: '',
        profilePicture: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, profilePicture: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('bio', formData.bio);
            formDataToSend.append('category', formData.category);
            if (formData.profilePicture) {
                formDataToSend.append('profile_picture', formData.profilePicture);
            }

            const response = await axios.post('http://localhost:8000/api/artists/signup/', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            navigate('/artist-dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create account. Please try again.');
            console.error('Error creating artist account:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-account-container">
            <h1>Create Artist Account</h1>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="signup-form">
                <div className="form-field">
                    <label htmlFor="name">Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="email">Email *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="password">Password *</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="bio">Bio *</label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="category">Category *</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a category</option>
                        <option value="Music">Music</option>
                        <option value="Poetry">Poetry</option>
                        <option value="Visual Arts">Visual Arts</option>
                        <option value="Crafts">Crafts</option>
                    </select>
                </div>

                <div className="form-field">
                    <label>Profile Picture *</label>
                    <div className="file-input-container">
                        <div className="file-input-wrapper">
                            <label className="file-upload-label">
                                <input
                                    type="file"
                                    id="profilePicture"
                                    name="profilePicture"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    required
                                    className="file-upload-input"
                                />
                                <div className="file-upload-design">
                                    <svg className="file-upload-icon" viewBox="0 0 24 24">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                                        <path d="M14 2v6h6" />
                                    </svg>
                                    <div className="file-upload-text">
                                        <span className="file-upload-main">Click to upload</span>
                                        <span className="file-upload-sub">or drag and drop</span>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                >
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>
        </div>
    );
};

export default CreateArtist;