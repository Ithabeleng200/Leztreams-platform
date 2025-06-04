
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying payment...');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const mentorId = params.get('mentor_id');
        const subscriptionId = params.get('subscription_id');

        if (!mentorId || !subscriptionId) {
          throw new Error('Missing payment parameters');
        }

        const response = await axios.get(
          `http://localhost:8000/api/mentors/${mentorId}/verify-payment/`,
          {
            params: { subscription_id: subscriptionId },
            withCredentials: true
          }
        );

        if (response.data.status === 'active') {
          setMessage('Payment verified successfully! Redirecting to dashboard...');
          setIsSuccess(true);
          setTimeout(() => navigate('/mentor-dashboard'), 3000);
        } else {
          setMessage('Payment is still processing. We\'ll notify you when completed.');
        }
      } catch (error) {
        setMessage(error.response?.data?.error || 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [location, navigate]);

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

export default PaymentSuccess;