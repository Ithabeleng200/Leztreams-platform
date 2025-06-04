import React, { useState } from 'react';
import axios from 'axios';
import './Cart.css';

const Cart = ({
  isOpen,
  cartItems,
  onRemoveFromCart,
  onUpdateQuantity,
  onClose,
  total
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setIsProcessing(true);

    try {
      // For simplicity, we'll just process the first item in cart
      const artwork = cartItems[0];

      const response = await axios.post(
        `http://localhost:8000/api/artworks/${artwork.id}/create-paypal-order/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Redirect to PayPal for payment
      window.location.href = response.data.approval_url;

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initiate checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay">
      <div className="cart-sidebar">
        <div className="cart-header">
          <h3>Your Cart ({cartItems.length})</h3>
          <button onClick={onClose} className="close-cart-btn">&times;</button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <i className="empty-icon">🛒</i>
            <p>Your cart is empty</p>
            <button onClick={onClose} className="continue-shopping-btn">
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-items">
              {cartItems.map(item => (
                <li key={item.id || Math.random()} className="cart-item">
                  <div className="cart-item-image">
                    {item.image ? (
                      <img
                        src={
                          typeof item.image === 'string' && item.image.startsWith('http')
                            ? item.image
                            : `http://localhost:8000${item.image}`
                        }
                        alt={item.title}
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg'; // Optional placeholder
                        }}
                      />
                    ) : (
                      <div className="cart-item-placeholder">No Image</div>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <h4>{item.title || 'Untitled Artwork'}</h4>
                    <p className="artist">By {item.artist?.name || 'Unknown Artist'}</p>

                    <p className="price">
                      ${(parseFloat(item.price) || 0).toFixed(2)} {item.currency || 'USD'}
                    </p>

                    <div className="quantity-controls">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="quantity-btn"
                        disabled={isProcessing}
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="quantity-btn"
                        disabled={isProcessing}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="remove-item-btn"
                    disabled={isProcessing}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <div className="cart-summary">
              <div className="cart-total">
                <span>Total:</span>
                <span className="total-amount">
                  ${(parseFloat(total) || 0).toFixed(2)} USD
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="checkout-btn"
                disabled={cartItems.length === 0 || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;