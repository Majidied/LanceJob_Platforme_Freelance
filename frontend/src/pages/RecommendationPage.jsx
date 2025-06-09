// Example usage in RecommendationDashboard.jsx
import React, { useEffect, useState } from 'react';
import RecommendationsList from './RecommendationsList';

const RecommendationDashboard = ({ freelancerId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/recommendations/${freelancerId}`)
      .then(res => res.json())
      .then(data => {
        setRecommendations(data.recommendations || []);
        setLoading(false);
      });
  }, [freelancerId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Your Recommendations</h2>
      <RecommendationsList recommendations={recommendations} />
    </div>
  );
};

export default RecommendationDashboard;