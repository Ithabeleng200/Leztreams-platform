import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

const Settings = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [customization, setCustomization] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Settings saved successfully!');
    };

    return (
        <div className="settings">
            <h1>Settings</h1>
            <div className="button-container">
                <button onClick={() => navigate(-1)} className="back-button">
                    Back
                </button>
                <button onClick={() => navigate('/')} className="home-button">
                    Home
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <label>
                    <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                    />
                    Dark Mode
                </label>
                <textarea
                    placeholder="Customize the application..."
                    value={customization}
                    onChange={(e) => setCustomization(e.target.value)}
                />
                <button type="submit">Save Settings</button>
            </form>
        </div>
    );
};

export default Settings;