import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './CreateAccount.css';

const CreateMentor = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    category: '',
    profile_picture: null,
    bio: '',
    years_of_experience: '',
    education: '',
    notable_projects: '',
    social_media_links: '',
    verification_documents: null,
    mentorship_approach: '',
    session_types: '',
    pricing: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [profilePictureName, setProfilePictureName] = useState('No file chosen');
  const [verificationDocsName, setVerificationDocsName] = useState('No file chosen');
  const navigate = useNavigate();
  const location = useLocation();

  // Check for PayPal return
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const subscriptionId = query.get('subscription_id');
    const token = query.get('token');

    if (subscriptionId) {
      verifyPayment(subscriptionId);
    }
  }, [location]);

  const verifyPayment = async (subscriptionId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/payment-success/?subscription_id=${subscriptionId}`);
      
      if (response.data.status === 'success') {
        setSuccess(true);
        setTimeout(() => navigate('/mentor-dashboard'), 3000);
      } else {
        setPaymentStatus('pending');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const file = e.target.files[0];

    if (file && file.size > MAX_SIZE) {
      setError('File size must be less than 5MB');
      e.target.value = '';
      return;
    }

    setError('');
    setFormData({ ...formData, [e.target.name]: file });
    
    // Update file name display
    if (e.target.name === 'profile_picture') {
      setProfilePictureName(file ? file.name : 'No file chosen');
    } else if (e.target.name === 'verification_documents') {
      setVerificationDocsName(file ? file.name : 'No file chosen');
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Validate required fields first
    if (!formData.name || !formData.email || !formData.password || !formData.category) {
      throw new Error('Please fill all required fields');
    }

    // Create FormData properly
    const formDataToSend = new FormData();
    
    // Append all fields
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('bio', formData.bio || '');
    formDataToSend.append('years_of_experience', formData.years_of_experience || '');
    formDataToSend.append('mentorship_approach', formData.mentorship_approach || '');
    formDataToSend.append('session_types', formData.session_types || '');
    formDataToSend.append('pricing', formData.pricing || '');
    
    // Append files only if they exist
    if (formData.profile_picture) {
      formDataToSend.append('profile_picture', formData.profile_picture);
    }
    if (formData.verification_documents) {
      formDataToSend.append('verification_documents', formData.verification_documents);
    }

    // Debug: Log FormData contents
    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, value);
    }

    // Get CSRF token
    const csrfResponse = await axios.get('http://localhost:8000/api/csrf/', {
      withCredentials: true
    });

    // Make the request
    const response = await axios.post(
      'http://localhost:8000/api/mentors/temporary/',
      formDataToSend,
      {
        headers: {
          'X-CSRFToken': csrfResponse.data.csrfToken,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      }
    );

    // Handle response
    if (response.data.approval_url) {
      window.location.href = response.data.approval_url;
    } else {
      setSuccess(true);
    }
  } catch (err) {
    // Improved error handling
    const errorMsg = err.response?.data?.error || 
                    err.response?.data?.details || 
                    err.message || 
                    'Submission failed';
    setError(errorMsg);
    
    // Log detailed error for debugging
    console.error('Error details:', {
      error: err,
      response: err.response,
    });
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="create-account-container">
      <h1>Create Mentor Account</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Account created! Redirecting to dashboard...</div>}
      {paymentStatus === 'pending' && (
        <div className="info-message">
          Your payment is being processed. We'll notify you when it's completed.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mentor-form">
        {/* Personal Information Section */}
        <div className="form-field">
          <label htmlFor="name">Full Name *</label>
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
            minLength="8"
          />
        </div>

        {/* Professional Information Section */}
        <div className="form-field">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
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
          id="profile_picture"
          name="profile_picture"
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
    {profilePictureName && (
      <div className="file-selected-message">
        <span className="file-selected-name">{profilePictureName}</span>
        <span className="file-size-info">JPEG/PNG (max 5MB)</span>
      </div>
    )}
  </div>
</div>
        <div className="form-field">
          <label htmlFor="bio">Bio *</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            required
            minLength="50"
          />
        </div>

        {/* Experience Section */}
        <div className="form-field">
          <label htmlFor="years_of_experience">Years of Experience *</label>
          <input
            type="number"
            id="years_of_experience"
            name="years_of_experience"
            value={formData.years_of_experience}
            onChange={handleChange}
            required
            min="1"
          />
        </div>

        <div className="form-field">
          <label htmlFor="education">Education</label>
          <input
            type="text"
            id="education"
            name="education"
            value={formData.education}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="notable_projects">Notable Projects</label>
          <textarea
            id="notable_projects"
            name="notable_projects"
            value={formData.notable_projects}
            onChange={handleChange}
          />
        </div>

        {/* Verification Section */}
        <div className="form-field">
          <label htmlFor="social_media_links">Social Media Links</label>
          <input
            type="text"
            id="social_media_links"
            name="social_media_links"
            value={formData.social_media_links}
            onChange={handleChange}
            placeholder="Comma-separated URLs"
          />
        </div>

        <div className="form-field">
  <label>Verification Documents *</label>
  <div className="file-input-container">
    <div className="file-input-wrapper">
      <label className="file-upload-label">
        <input
          type="file"
          id="verification_documents"
          name="verification_documents"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          required
          className="file-upload-input"
        />
        <div className="file-upload-design">
          <svg className="file-upload-icon" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
            <path d="M14 2v6h6" />
            <path d="M8 15v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
            <path d="M12 12v.01" />
          </svg>
          <div className="file-upload-text">
            <span className="file-upload-main">Click to upload</span>
            <span className="file-upload-sub">or drag and drop</span>
          </div>
        </div>
      </label>
    </div>
    {verificationDocsName && verificationDocsName !== 'No file chosen' && (
      <div className="file-selected-message">
        <span className="file-selected-name">{verificationDocsName}</span>
        <span className="file-size-info">PDF/DOC/Images (max 5MB)</span>
      </div>
    )}
  </div>
</div>
        {/* Mentorship Details Section */}
        <div className="form-field">
          <label htmlFor="mentorship_approach">Mentorship Approach *</label>
          <textarea
            id="mentorship_approach"
            name="mentorship_approach"
            value={formData.mentorship_approach}
            onChange={handleChange}
            required
            minLength="50"
          />
        </div>

        <div className="form-field">
          <label htmlFor="session_types">Session Types *</label>
          <input
            type="text"
            id="session_types"
            name="session_types"
            value={formData.session_types}
            onChange={handleChange}
            placeholder="e.g., 1-on-1, Group"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="pricing">Pricing *</label>
          <input
            type="text"
            id="pricing"
            name="pricing"
            value={formData.pricing}
            onChange={handleChange}
            placeholder="e.g., $50/hour"
            required
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account & Pay Subscription Fee'}
        </button>
        
        <div className="payment-info">
          <p><strong>Subscription Details:</strong></p>
          <ul>
            <li>Initial setup fee: $6.00</li>
            <li>Monthly subscription: $16.00</li>
            <li>Cancel anytime</li>
          </ul>
        </div>
      </form>
    </div>
  );
};

export default CreateMentor;