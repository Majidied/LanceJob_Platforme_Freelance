// src/pages/freelancer/JobsList.jsx
import React from 'react';
import JobsListComponent from '../../components/jobs/JobsList';

const JobsList = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Find Jobs</h1>
      <JobsListComponent />
    </div>
  );
};

export default JobsList;