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
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('password', formData.password); // Password will be hashed on the backend
            formDataToSend.append('bio', formData.bio);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('profile_picture', formData.profilePicture);

            const response = await axios.post('http://localhost:8000/api/artists/signup/', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Artist account created successfully!');
            navigate('/artist-dashboard');
        } catch (err) {
            console.error('Error creating artist account:', err.response?.data || err.message);
            if (err.response?.data) {
                console.error('Validation errors:', err.response.data);
            }
            alert(`Failed to create account: ${err.response?.data?.error || err.message}`);
        }
    };

    return (
        <div className="create-account-container">
            <h1>Create Artist Account</h1>
            <form onSubmit={handleSubmit} className="signup-form">
                <label>
                    Name:
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Password:
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Bio:
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Category:
                    <select
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
                </label>
                <label>
                    Profile Picture:
                    <input
                        type="file"
                        name="profilePicture"
                        onChange={handleFileChange}
                        required
                    />
                </label>
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default CreateArtist;