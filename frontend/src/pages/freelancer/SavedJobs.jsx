// src/pages/freelancer/SavedJobs.jsx
import React from 'react';
import SavedJobsComponent from '../../components/jobs/SavedJobs';

const SavedJobs = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Saved Jobs</h1>
      <SavedJobsComponent />
    </div>
  );
};

export default SavedJobs;