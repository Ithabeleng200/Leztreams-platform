import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MentorProfile from '../components/MentorProfile';

const Mentors = () => {
  const mentors = [
    { id: 1, name: 'Mentor One', expertise: 'Music Production', bio: 'Experienced music producer with 10+ years in the industry.' },
    { id: 2, name: 'Mentor Two', expertise: 'Visual Arts', bio: 'Professional visual artist specializing in traditional crafts.' },
    { id: 3, name: 'Mentor Three', expertise: 'Poetry', bio: 'Award-winning poet and mentor.' },
  ];

  return (
    <div>
      <Navbar />
      <h1>Available Mentors</h1>
      <div className="mentors-list">
        {mentors.map((mentor) => (
          <MentorProfile key={mentor.id} mentor={mentor} />
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Mentors;