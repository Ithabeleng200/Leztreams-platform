
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-cancel-container">
      <h2>Payment Cancelled</h2>
      <p>Your payment was not completed. You can try again or contact support.</p>
      <button onClick={() => navigate('/mentor/signup')}>Retry Payment</button>
      <button onClick={() => navigate('/')}>Return to Home</button>
    </div>
  );
};

export default PaymentCancel;