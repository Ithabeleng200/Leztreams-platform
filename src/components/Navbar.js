import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar">
            {/* Menu Bar Icon (on the left) */}
            <div className="menu-icon" onClick={toggleMenu}>
                &#9776; {/* Hamburger icon */}
            </div>

            {/* Main Navigation (remains in its current position) */}
            <div className="main-nav">
                <Link to="/">Home</Link>
                <Link to="/artists">Artists</Link>
                <Link to="/events">Events</Link>
                <Link to="/marketplace">Marketplace</Link>
                <Link to="/mentors">Mentors</Link>
            </div>

            {/* Dropdown Menu (appears when menu icon is clicked) */}
            <div className={`dropdown-menu ${menuOpen ? 'open' : ''}`}>
                <div className="dropdown-content">
                    <div className="dropdown-item">
                        <button className="dropbtn">Create Account</button>
                        <div className="nested-dropdown">
                            <Link to="/create-artist">Artist</Link>
                            <Link to="/create-mentor">Mentor</Link>
                        </div>
                    </div>
                    <div className="dropdown-item">
                        <button className="dropbtn">My Account</button>
                        <div className="nested-dropdown">
                            <Link to="/artist-dashboard">Artist Dashboard</Link>
                            <Link to="/mentor-dashboard">Mentor Dashboard</Link>
                        </div>
                    </div>
                    <Link to="/help" className="dropdown-item">Help</Link>
                    <Link to="/settings" className="dropdown-item">Settings</Link>
                    <Link to="/login" className="dropdown-item" onClick={() => alert('You have been logged out.')}>Log Out</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;