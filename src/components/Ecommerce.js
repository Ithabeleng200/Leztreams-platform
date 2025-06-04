import React from 'react';

const Ecommerce = () => {
  return (
    <div className="ecommerce">
      <h2>Checkout</h2>
      <form>
        <input type="text" placeholder="Full Name" required />
        <input type="email" placeholder="Email" required />
        <input type="text" placeholder="Card Number" required />
        <input type="text" placeholder="Expiry Date" required />
        <input type="text" placeholder="CVV" required />
        <button type="submit">Purchase</button>
      </form>
    </div>
  );
};

export default Ecommerce;