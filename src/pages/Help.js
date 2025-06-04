import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Help.css';

const Help = () => {
    const [problem, setProblem] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Your problem has been submitted. We will get back to you soon.');
        setProblem('');
    };

    return (
        <div className="help">
            <h1>Help</h1>
            <div className="button-container">
                <button onClick={() => navigate(-1)} className="back-button">
                    Back
                </button>
                <button onClick={() => navigate('/')} className="home-button">
                    Home
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <textarea
                    placeholder="Describe your problem..."
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    required
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default Help;