import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ArtworkGallery from '../components/ArtworkGallery';
import Cart from '../components/Cart';
import './Marketplace.css';

const Marketplace = () => {
  const [artworks, setArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const fetchArtworksForSale = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8000/api/artworks/marketplace/'
        );
        
        if (!Array.isArray(response.data)) {
          throw new Error('Invalid data format received');
        }
        
        setArtworks(response.data);
        setIsLoading(false);
        
      } catch (err) {
        console.error('Marketplace fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load artworks. Please try again later.');
        setIsLoading(false);
        setArtworks([]);
      }
    };
    
    fetchArtworksForSale();
  }, []);

  const handleAddToCart = (artwork) => {
    const existingItem = cart.find(item => item.id === artwork.id);
    
    if (existingItem) {
      alert('This artwork is already in your cart');
      return;
    }
    
    setCart([...cart, {
      ...artwork,
      quantity: 1,
      addedAt: new Date().toISOString()
    }]);
    
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (artworkId) => {
    setCart(cart.filter(item => item.id !== artworkId));
  };

  const handleUpdateQuantity = (artworkId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(artworkId);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === artworkId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  return (
    <div className="marketplace-page">
      <Navbar
        cartItemCount={cart.length}
        onCartClick={() => setIsCartOpen(!isCartOpen)}
      />
      
      <div className="marketplace-container">
        <h1>Marketplace</h1>
        <p className="marketplace-description">
          Discover and purchase unique artworks from talented Lesotho artists
        </p>
        
        {isLoading ? (
          <div className="loading-message">
            <div className="spinner"></div>
            Loading artworks...
          </div>
        ) : error ? (
          <div className="error-message">
            <i className="error-icon">⚠️</i>
            {error}
            <button
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              Try Again
            </button>
          </div>
        ) : artworks.length > 0 ? (
          <ArtworkGallery
            artworks={artworks}
            onAddToCart={handleAddToCart}
          />
        ) : (
          <div className="no-artworks-message">
            <i className="empty-icon">🖼️</i>
            No artworks are currently available for sale.
          </div>
        )}
      </div>
      
      <Cart
        isOpen={isCartOpen}
        cartItems={cart}
        onRemoveFromCart={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={() => {}}
        onClose={() => setIsCartOpen(false)}
        total={calculateTotal()}
      />
      
      <Footer />
    </div>
  );
};

export default Marketplace;