// src/components/applications/Applications.jsx
import React, { useEffect } from 'react';
import { useFreelancer } from '../../context/FreelancerContext';
import { Link } from 'react-router-dom';

const Applications = () => {
  const { appliedJobs, loading, error, fetchApplications } = useFreelancer();

  useEffect(() => {
    // Refresh applications when component mounts
    fetchApplications();
  }, []);

  if (loading.appliedJobs) return <div className="loading">Loading applications...</div>;
  if (error.appliedJobs) return <div className="error">Error: {error.appliedJobs}</div>;

  // Group applications by status
  const pendingApplications = appliedJobs.filter(app => app.status === 'pending');
  const acceptedApplications = appliedJobs.filter(app => app.status === 'accepted');
  const rejectedApplications = appliedJobs.filter(app => app.status === 'rejected');

  return (
    <div className="applications-container">
      <h1>My Applications</h1>
      
      {appliedJobs.length === 0 ? (
        <div className="no-applications">
          <p>You haven't applied to any jobs yet.</p>
          <Link to="/freelancer/jobs" className="browse-jobs-link">Browse Jobs</Link>
        </div>
      ) : (
        <div className="applications-sections">
          {/* Pending Applications Section */}
          <div className="applications-section">
            <h2>Pending Applications ({pendingApplications.length})</h2>
            {pendingApplications.length === 0 ? (
              <p className="no-applications-in-section">No pending applications</p>
            ) : (
              <div className="applications-list">
                {pendingApplications.map((application) => (
                  <div key={application._id} className="application-card pending">
                    <div className="application-header">
                      <h3>{application.mission?.title || 'Mission'}</h3>
                      <span className="application-status pending">Pending</span>
                    </div>
                    
                    <div className="application-details">
                      <div className="application-info">
                        <span className="info-label">Applied on:</span>
                        <span className="info-value">
                          {new Date(application.applicationDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="application-info">
                        <span className="info-label">Price:</span>
                        <span className="info-value">
                          {application.mission?.price} {application.mission?.currency || 'MAD'}
                        </span>
                      </div>
                      <div className="application-info">
                        <span className="info-label">Timeline:</span>
                        <span className="info-value">{application.mission?.timeline}</span>
                      </div>
                    </div>
                    
                    <div className="application-proposal">
                      <h4>Your Proposal:</h4>
                      <p>{application.proposal}</p>
                    </div>
                    
                    <div className="application-actions">
                      <Link 
                        to={`/freelancer/jobs/${application.mission?._id}`} 
                        className="view-job-link"
                      >
                        View Job Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Accepted Applications Section */}
          <div className="applications-section">
            <h2>Accepted Applications ({acceptedApplications.length})</h2>
            {acceptedApplications.length === 0 ? (
              <p className="no-applications-in-section">No accepted applications</p>
            ) : (
              <div className="applications-list">
                {acceptedApplications.map((application) => (
                  <div key={application._id} className="application-card accepted">
                    <div className="application-header">
                      <h3>{application.mission?.title || 'Mission'}</h3>
                      <span className="application-status accepted">Accepted</span>
                    </div>
                    
                    <div className="application-details">
                      <div className="application-info">
                        <span className="info-label">Applied on:</span>
                        <span className="info-value">
                          {new Date(application.applicationDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="application-info">
                        <span className="info-label">Price:</span>
                        <span className="info-value">
                          {application.mission?.price} {application.mission?.currency || 'MAD'}
                        </span>
                      </div>
                      <div className="application-info">
                        <span className="info-label">Timeline:</span>
                        <span className="info-value">{application.mission?.timeline}</span>
                      </div>
                    </div>
                    
                    <div className="application-actions">
                      <Link 
                        to={`/freelancer/projects/${application.mission?._id}`} 
                        className="view-project-link"
                      >
                        Go to Project
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Rejected Applications Section */}
          <div className="applications-section">
            <h2>Rejected Applications ({rejectedApplications.length})</h2>
            {rejectedApplications.length === 0 ? (
              <p className="no-applications-in-section">No rejected applications</p>
            ) : (
              <div className="applications-list">
                {rejectedApplications.map((application) => (
                  <div key={application._id} className="application-card rejected">
                    <div className="application-header">
                      <h3>{application.mission?.title || 'Mission'}</h3>
                      <span className="application-status rejected">Rejected</span>
                    </div>
                    
                    <div className="application-details">
                      <div className="application-info">
                        <span className="info-label">Applied on:</span>
                        <span className="info-value">
                          {new Date(application.applicationDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="application-info">
                        <span className="info-label">Price:</span>
                        <span className="info-value">
                          {application.mission?.price} {application.mission?.currency || 'MAD'}
                        </span>
                      </div>
                      <div className="application-info">
                        <span className="info-label">Timeline:</span>
                        <span className="info-value">{application.mission?.timeline}</span>
                      </div>
                    </div>
                    
                    <div className="application-proposal">
                      <h4>Your Proposal:</h4>
                      <p>{application.proposal}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;