import React from 'react';

const Mentorship = () => {
  return (
    <div className="mentorship">
      <h2>Mentorship Request</h2>
      <form>
        <input type="text" placeholder="Your Name" required />
        <input type="email" placeholder="Your Email" required />
        <textarea placeholder="Your Message" required />
        <button type="submit">Send Request</button>
      </form>
    </div>
  );
};

export default Mentorship;