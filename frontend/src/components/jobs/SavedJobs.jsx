// src/components/jobs/SavedJobs.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFreelancer } from '../../context/FreelancerContext';

const SavedJobs = () => {
  const { savedJobs, loading, error, fetchSavedJobs, toggleSaveJob } = useFreelancer();

  useEffect(() => {
    // Refresh saved jobs when component mounts
    fetchSavedJobs();
  }, []);

  const handleUnsaveJob = async (jobId) => {
    try {
      await toggleSaveJob(jobId);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error removing job from saved jobs');
    }
  };

  if (loading.savedJobs) return <div className="loading">Loading saved jobs...</div>;
  if (error.savedJobs) return <div className="error">Error: {error.savedJobs}</div>;

  return (
    <div className="saved-jobs-container">
      <h1>Saved Jobs</h1>
      
      {savedJobs.length === 0 ? (
        <div className="no-saved-jobs">
          <p>You haven't saved any jobs yet.</p>
          <Link to="/freelancer/jobs" className="browse-jobs-link">Browse Jobs</Link>
        </div>
      ) : (
        <div className="saved-jobs-list">
          {savedJobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="job-card-header">
                <h2>{job.title}</h2>
                <button 
                  className="unsave-button"
                  onClick={() => handleUnsaveJob(job._id)}
                >
                  <i className="fas fa-heart"></i> Unsave
                </button>
              </div>
              
              <div className="job-info">
                <div className="job-price">
                  <h3>Price</h3>
                  <p>{job.price} {job.currency || 'MAD'}</p>
                </div>
                <div className="job-type">
                  <h3>Type</h3>
                  <p>{job.priceType}</p>
                </div>
                <div className="job-timeline">
                  <h3>Timeline</h3>
                  <p>{job.timeline}</p>
                </div>
                <div className="job-exp">
                  <h3>Exp</h3>
                  <p>{job.experienceLevel}</p>
                </div>
              </div>
              
              <div className="job-description">
                <p>{job.description.substring(0, 200)}...</p>
              </div>
              
              {job.skills && job.skills.length > 0 && (
                <div className="job-skills">
                  {job.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="more-skills">+{job.skills.length - 3} more</span>
                  )}
                </div>
              )}
              
              <div className="job-actions">
                <Link to={`/freelancer/jobs/${job._id}`} className="view-details-link">
                  View Details
                </Link>
                <Link to={`/freelancer/jobs/${job._id}#application-form`} className="apply-link">
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;