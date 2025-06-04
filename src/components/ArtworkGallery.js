import React from 'react';
import { Link } from 'react-router-dom';
import './ArtworkGallery.css';

const ArtworkGallery = ({ artworks = [], onAddToCart }) => {
  if (!artworks || !Array.isArray(artworks)) {
    return (
      <div className="gallery-error">
        Unable to display artworks due to invalid data
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="empty-gallery">
        No artworks to display
      </div>
    );
  }

  return (
    <div className="artwork-gallery">
      {artworks.map((artwork) => {
        const {
          id = '',
          title = 'Untitled Artwork',
          description = 'No description available',
          image = null,
          artist = { name: 'Unknown Artist' },
          is_for_sale = false,
          price = 0,
          currency = 'USD',
          sale_status = 'unknown'
        } = artwork || {};

        // Safely parse price as number
        const numericPrice = typeof price === 'number' ? price : parseFloat(price);
        const finalPrice = isNaN(numericPrice) ? 0 : numericPrice;

        const imageUrl = image
          ? (typeof image === 'string' && image.startsWith('http')
              ? image
              : `http://localhost:8000${image}`)
          : '/placeholder-image.jpg';

        return (
          <div key={id || Math.random()} className="artwork-card">
            <div className="artwork-image-container">
              <img
                src={imageUrl}
                alt={title}
                className="artwork-image"
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </div>
            <div className="artwork-details">
              <h3 className="artwork-title">{title}</h3>
              <p className="artist-name">By {artist?.name || 'Unknown Artist'}</p>
              <p className="artwork-description">
                {description && description.length > 100
                  ? `${description.substring(0, 100)}...`
                  : description}
              </p>

              <div className="artwork-pricing">
                {is_for_sale ? (
                  <>
                    <span className="price">
                      ${finalPrice.toFixed(2)} {currency}
                    </span>
                    <span className={`status-badge ${sale_status.toLowerCase()}`}>
                      {sale_status}
                    </span>
                  </>
                ) : (
                  <span className="not-for-sale">Not for sale</span>
                )}
              </div>
              <div className="artwork-actions">
                {is_for_sale && sale_status === 'available' && (
                  <button
                    className="add-to-cart-btn"
                    onClick={() => onAddToCart(artwork)}
                  >
                    Add to Cart
                  </button>
                )}
                {id && (
                  <Link
                    to={`/artwork/${id}`}
                    className="view-details-btn"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ArtworkGallery;