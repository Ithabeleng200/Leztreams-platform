import React, { useState } from 'react';
import Footer from '../components/Footer';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'USER', // Default role
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    // Prepare data to send to the backend
    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('role', formData.role);

    try {
      console.log('Sending signup request...'); // Log the start of the request
      const response = await fetch('http://localhost:8000/signup/', {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('Received response:', response); // Log the response object

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData); // Log backend error details
        setError(errorData.message || 'Error signing up');
        return;
      }

      const data = await response.json();
      console.log('Backend Response:', data); // Log the response data

      alert('Signup successful!');
      window.location.href = '/login'; // Redirect to login page after successful signup
    } catch (error) {
      console.error('Error during fetch:', error); // Log the error
      setError('Error signing up');
    }
  };

  return (
    <div>
     
      <div className="signup-container">
        <h2>Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm Password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="ARTIST">Artist</option>
            <option value="MENTOR">Mentor</option>
            <option value="USER">User</option>
          </select>
          <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <a href="/login">Login</a></p>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;