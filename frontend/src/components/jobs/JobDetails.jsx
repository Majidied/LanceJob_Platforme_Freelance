// src/components/jobs/JobDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFreelancer } from '../../context/FreelancerContext';
import { freelancerAPI } from '../../services/api';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleSaveJob, applyForJob, savedJobs } = useFreelancer();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proposal, setProposal] = useState('');
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isJobSaved, setIsJobSaved] = useState(false);
  
  // Check if job is saved
  useEffect(() => {
    if (savedJobs && savedJobs.length > 0 && job) {
      const jobIsSaved = savedJobs.some(savedJob => savedJob._id === id);
      setIsJobSaved(jobIsSaved);
    }
  }, [savedJobs, job, id]);
  
  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await freelancerAPI.getJobDetails(id);
        setJob(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching job details');
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [id]);
  
  // Handle save job
  const handleSaveJob = async () => {
    try {
      setSaving(true);
      await toggleSaveJob(id);
      setIsJobSaved(!isJobSaved);
      setSaving(false);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };
  
  // Handle apply for job
  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!proposal.trim()) {
      alert('Please write a proposal');
      return;
    }
    
    try {
      setApplying(true);
      await applyForJob(id, proposal);
      setApplying(false);
      alert('Application submitted successfully');
      navigate('/freelancer/applications');
    } catch (err) {
      console.error(err);
      setApplying(false);
      alert(err.message || 'Error applying for job');
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!job) return <div>Job not found</div>;
  
  return (
    <div className="job-detail-container">
      <div className="job-detail-header">
        <h1>{job.title}</h1>
        <div className="job-actions">
          <button 
            className={`save-button ${isJobSaved ? 'saved' : ''}`} 
            onClick={handleSaveJob}
            disabled={saving}
          >
            {saving ? 'Saving...' : isJobSaved ? 'Saved' : 'Save Job'}
          </button>
          <button 
            className="apply-button"
            onClick={() => document.getElementById('application-form').scrollIntoView()}
          >
            Apply Now
          </button>
        </div>
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
          <h3>Experience Level</h3>
          <p>{job.experienceLevel}</p>
        </div>
      </div>
      
      <div className="job-description">
        <h2>Job Description</h2>
        <p>{job.description}</p>
      </div>
      
      {job.skills && job.skills.length > 0 && (
        <div className="job-skills">
          <h2>Skills Required</h2>
          <div className="skills-list">
            {job.skills.map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}
      
      <div id="application-form" className="application-form">
        <h2>Submit Your Proposal</h2>
        <form onSubmit={handleApply}>
          <div className="form-group">
            <label htmlFor="proposal">Proposal</label>
            <textarea
              id="proposal"
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              placeholder="Describe why you're the best fit for this job..."
              rows={6}
              required
            />
          </div>
          <button 
            type="submit" 
            className="submit-application"
            disabled={applying}
          >
            {applying ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobDetail;