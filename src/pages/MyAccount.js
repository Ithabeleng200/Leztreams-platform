import React from 'react';
import { Link } from 'react-router-dom';
import './MyAccount.css'; // Import the CSS file

const MyAccount = () => {
    return (
        <div className="my-account-container">
            <h1>My Account</h1>
            <div className="account-options">
                <Link to="/artist-dashboard" className="account-option">
                    Artist Dashboard
                </Link>
                <Link to="/mentor-dashboard" className="account-option">
                    Mentor Dashboard
                </Link>
            </div>
        </div>
    );
};

export default MyAccount;