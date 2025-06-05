import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ArtworkPaymentSuccess = () => {
  const { artworkId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying payment...');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (!token) {
          throw new Error('Missing payment token');
        }

        const response = await axios.post(
          `http://localhost:8000/api/artworks/${artworkId}/capture-paypal-order/`,
          { order_id: token },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.status === 'success') {
          setMessage('Payment completed successfully! Redirecting...');
          setIsSuccess(true);
          setTimeout(() => navigate(`/artwork/${artworkId}`), 3000);
        } else {
          setMessage('Payment verification in progress...');
        }
      } catch (error) {
        setMessage(error.response?.data?.error || 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [location, navigate, artworkId]);

  return (
    <div className="payment-success-container">
      <h2>{isSuccess ? '🎉 Success!' : 'Processing...'}</h2>
      <p>{message}</p>
      {!isSuccess && (
        <button onClick={() => navigate('/')}>Return to Home</button>
      )}
    </div>
  );
};

export default ArtworkPaymentSuccess;