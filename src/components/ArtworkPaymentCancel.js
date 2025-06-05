import { useNavigate, useParams } from 'react-router-dom';

const ArtworkPaymentCancel = () => {
  const { artworkId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="payment-cancel-container">
      <h2>Payment Cancelled</h2>
      <p>Your artwork purchase was not completed. You can try again or contact support.</p>
      <button onClick={() => navigate(`/artwork/${artworkId}`)}>Try Again</button>
      <button onClick={() => navigate('/marketplace')}>Browse More Art</button>
    </div>
  );
};

export default ArtworkPaymentCancel;