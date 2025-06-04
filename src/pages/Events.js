import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Events = () => {
  const events = [
    { id: 1, title: 'Music Festival', date: '2024-12-15', location: 'Maseru' },
    { id: 2, title: 'Art Exhibition', date: '2024-11-20', location: 'Morija' },
    { id: 3, title: 'Poetry Slam', date: '2024-10-25', location: 'Leribe' },
  ];

  return (
    <div>
      <Navbar />
      <h1>Upcoming Events</h1>
      <div className="events-list">
        {events.map((event) => (
          <div key={event.id} className="event">
            <h2>{event.title}</h2>
            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>Location:</strong> {event.location}</p>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Events;