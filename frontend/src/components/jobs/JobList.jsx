// src/components/jobs/JobsList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFreelancer } from '../../context/FreelancerContext';

const JobsList = () => {
  const { jobs, savedJobs, loading, error, fetchJobs, toggleSaveJob } = useFreelancer();
  const [saving, setSaving] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    priceType: '',
    experienceLevel: ''
  });

  useEffect(() => {
    // Fetch jobs when component mounts
    fetchJobs();
  }, []);

  // Handle save/unsave job
  const handleToggleSaveJob = async (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setSaving(jobId);
      await toggleSaveJob(jobId);
      setSaving(null);
    } catch (err) {
      console.error(err);
      setSaving(null);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply filters to jobs
  const filteredJobs = jobs.filter(job => {
    // Apply search filter
    if (filters.search && !job.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !job.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Apply price type filter
    if (filters.priceType && job.priceType !== filters.priceType) {
      return false;
    }
    
    // Apply experience level filter
    if (filters.experienceLevel && job.experienceLevel !== filters.experienceLevel) {
      return false;
    }
    
    return true;
  });

  // Check if job is saved
  const isJobSaved = (jobId) => {
    return savedJobs.some(savedJob => savedJob._id === jobId);
  };

  if (loading.jobs) return <div className="loading">Loading jobs...</div>;
  if (error.jobs) return <div className="error">Error: {error.jobs}</div>;

  return (
    <div className="jobs-container">
      <div className="filters-section">
        <h2>Find Jobs</h2>
        <div className="filters-form">
          <div className="filter-group search">
            <input
              type="text"
              name="search"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <select
              name="priceType"
              value={filters.priceType}
              onChange={handleFilterChange}
            >
              <option value="">All Price Types</option>
              <option value="Fixed price">Fixed Price</option>
              <option value="Hourly rate">Hourly Rate</option>
            </select>
          </div>
          
          <div className="filter-group">
            <select
              name="experienceLevel"
              value={filters.experienceLevel}
              onChange={handleFilterChange}
            >
              <option value="">All Experience Levels</option>
              <option value="Entry">Entry</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="jobs-section">
        <h2>Available Jobs ({filteredJobs.length})</h2>
        
        {filteredJobs.length === 0 ? (
          <div className="no-jobs">
            <p>No jobs found matching your filters.</p>
            <button onClick={() => setFilters({ search: '', priceType: '', experienceLevel: '' })}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="jobs-list">
            {filteredJobs.map((job) => (
              <div key={job._id} className="job-card">
                <div className="job-card-header">
                  <h3>{job.title}</h3>
                  <button 
                    className={`save-button ${isJobSaved(job._id) ? 'saved' : ''}`}
                    onClick={(e) => handleToggleSaveJob(e, job._id)}
                    disabled={saving === job._id}
                  >
                    {saving === job._id ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : isJobSaved(job._id) ? (
                      <i className="fas fa-heart"></i>
                    ) : (
                      <i className="far fa-heart"></i>
                    )}
                  </button>
                </div>
                
                <div className="job-info">
                  <div className="job-price">
                    <h4>Price</h4>
                    <p>{job.price} {job.currency || 'MAD'}</p>
                  </div>
                  <div className="job-type">
                    <h4>Type</h4>
                    <p>{job.priceType}</p>
                  </div>
                  <div className="job-timeline">
                    <h4>Timeline</h4>
                    <p>{job.timeline}</p>
                  </div>
                  <div className="job-exp">
                    <h4>Exp</h4>
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
    </div>
  );
};

export default JobsList;