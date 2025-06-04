import React from 'react';

const MentorProfile = ({ mentor }) => {
  return (
    <div className="mentor-profile">
      <h2>{mentor.name}</h2>
      <p><strong>Expertise:</strong> {mentor.expertise}</p>
      <p>{mentor.bio}</p>
      <button>Request Mentorship</button>
    </div>
  );
};

export default MentorProfile;