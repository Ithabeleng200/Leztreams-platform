import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CreateAccount.css'; // Import the CSS file
import axios from 'axios';

const CreateAccount = () => {
    const [accountType, setAccountType] = useState('artist'); // Default to artist

    return (
        <div className="create-account-container">
            <h1>Create Account</h1>
            <div className="account-type-selector">
                <button
                    className={accountType === 'artist' ? 'active' : ''}
                    onClick={() => setAccountType('artist')}
                >
                    Artist
                </button>
                <button
                    className={accountType === 'mentor' ? 'active' : ''}
                    onClick={() => setAccountType('mentor')}
                >
                    Mentor
                </button>
            </div>

            {accountType === 'artist' ? (
                <ArtistSignUpForm />
            ) : (
                <MentorSignUpForm />
            )}
        </div>
    );
};

const ArtistSignUpForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        bio: '',
        category: '', // Changed from skills to category
        profilePicture: null,
    });

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
            formDataToSend.append('password', formData.password);
            formDataToSend.append('bio', formData.bio);
            formDataToSend.append('category', formData.category); // Changed from skills to category
            formDataToSend.append('profilePicture', formData.profilePicture);

            const response = await axios.post('/api/artists/signup', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Artist account created successfully!');
            console.log(response.data);
        } catch (err) {
            console.error('Error creating artist account:', err);
            alert('Failed to create account. Please try again.');
        }
    };

    return (
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
    );
};

const MentorSignUpForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        category: '', // Changed from expertise to category
        profilePicture: null,
    });

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
            formDataToSend.append('password', formData.password);
            formDataToSend.append('category', formData.category); // Changed from expertise to category
            formDataToSend.append('profilePicture', formData.profilePicture);

            const response = await axios.post('/api/mentors/signup', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Mentor account created successfully!');
            console.log(response.data);
        } catch (err) {
            console.error('Error creating mentor account:', err);
            alert('Failed to create account. Please try again.');
        }
    };

    return (
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
    );
};

export default CreateAccount;