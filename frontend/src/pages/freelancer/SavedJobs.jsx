import React, { useEffect, useState } from 'react';
import { freelancer } from '../api';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  
  // Get current user from context or localStorage
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const response = await freelancer.getSavedJobs(currentUser._id);
        setSavedJobs(response.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchSavedJobs();
  }, [currentUser._id]);
  
  // Render saved jobs
  return (
    <div>
      {/* Render saved jobs */}
    </div>
  );
};