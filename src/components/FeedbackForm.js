import React from 'react';

const FeedbackForm = () => {
  return (
    <div className="feedback-form">
      <h2>Leave Feedback</h2>
      <form>
        <textarea placeholder="Your feedback..." required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default FeedbackForm;