// src/components/offers/Offers.jsx
import React, { useEffect, useState } from 'react';
import { useFreelancer } from '../../context/FreelancerContext';
import { Link } from 'react-router-dom';

const Offers = () => {
  const { offers, loading, error, fetchOffers, respondToOffer } = useFreelancer();
  const [respondingOfferId, setRespondingOfferId] = useState(null);

  useEffect(() => {
    // Refresh offers when component mounts
    fetchOffers();
  }, []);

  const handleRespondToOffer = async (offerId, status) => {
    try {
      setRespondingOfferId(offerId);
      await respondToOffer(offerId, status);
      setRespondingOfferId(null);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error responding to offer');
      setRespondingOfferId(null);
    }
  };

  if (loading.offers) return <div className="loading">Loading offers...</div>;
  if (error.offers) return <div className="error">Error: {error.offers}</div>;

  // Group offers by status
  const pendingOffers = offers.filter(offer => offer.status === 'pending');
  const acceptedOffers = offers.filter(offer => offer.status === 'accepted');
  const rejectedOffers = offers.filter(offer => offer.status === 'rejected');

  return (
    <div className="offers-container">
      <h1>Offers</h1>
      
      {offers.length === 0 ? (
        <div className="no-offers">
          <p>You don't have any offers yet.</p>
          <p>Continue applying to jobs to receive offers from clients.</p>
        </div>
      ) : (
        <div className="offers-sections">
          {/* Pending Offers Section */}
          <div className="offers-section">
            <h2>Pending Offers ({pendingOffers.length})</h2>
            {pendingOffers.length === 0 ? (
              <p className="no-offers-in-section">No pending offers</p>
            ) : (
              <div className="offers-list">
                {pendingOffers.map((offer) => (
                  <div key={offer._id} className="offer-card pending">
                    <div className="offer-header">
                      <h3>{offer.mission?.title || 'Mission'}</h3>
                      <span className="offer-status pending">Pending</span>
                    </div>
                    
                    <div className="offer-details">
                      <div className="offer-info">
                        <span className="info-label">From:</span>
                        <span className="info-value">{offer.client?.name || 'Client'}</span>
                      </div>
                      <div className="offer-info">
                        <span className="info-label">Amount:</span>
                        <span className="info-value">{offer.price} MAD</span>
                      </div>
                      <div className="offer-info">
                        <span className="info-label">Received:</span>
                        <span className="info-value">
                          {new Date(offer.offerDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {offer.message && (
                      <div className="offer-message">
                        <h4>Message from client:</h4>
                        <p>{offer.message}</p>
                      </div>
                    )}
                    
                    <div className="offer-actions">
                      <Link 
                        to={`/freelancer/jobs/${offer.mission?._id}`} 
                        className="view-job-link"
                      >
                        View Job Details
                      </Link>
                      <div className="response-actions">
                        <button 
                          className="accept-button"
                          onClick={() => handleRespondToOffer(offer._id, 'accepted')}
                          disabled={respondingOfferId === offer._id}
                        >
                          {respondingOfferId === offer._id ? 'Processing...' : 'Accept'}
                        </button>
                        <button 
                          className="reject-button"
                          onClick={() => handleRespondToOffer(offer._id, 'rejected')}
                          disabled={respondingOfferId === offer._id}
                        >
                          {respondingOfferId === offer._id ? 'Processing...' : 'Decline'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Accepted Offers Section */}
          <div className="offers-section">
            <h2>Accepted Offers ({acceptedOffers.length})</h2>
            {acceptedOffers.length === 0 ? (
              <p className="no-offers-in-section">No accepted offers</p>
            ) : (
              <div className="offers-list">
                {acceptedOffers.map((offer) => (
                  <div key={offer._id} className="offer-card accepted">
                    <div className="offer-header">
                      <h3>{offer.mission?.title || 'Mission'}</h3>
                      <span className="offer-status accepted">Accepted</span>
                    </div>
                    
                    <div className="offer-details">
                      <div className="offer-info">
                        <span className="info-label">From:</span>
                        <span className="info-value">{offer.client?.name || 'Client'}</span>
                      </div>
                      <div className="offer-info">
                        <span className="info-label">Amount:</span>
                        <span className="info-value">{offer.price} MAD</span>
                      </div>
                      <div className="offer-info">
                        <span className="info-label">Accepted on:</span>
                        <span className="info-value">
                          {new Date(offer.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="offer-actions">
                      <Link 
                        to={`/freelancer/projects/${offer.mission?._id}`} 
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
          
          {/* Rejected Offers Section */}
          <div className="offers-section">
            <h2>Declined Offers ({rejectedOffers.length})</h2>
            {rejectedOffers.length === 0 ? (
              <p className="no-offers-in-section">No declined offers</p>
            ) : (
              <div className="offers-list">
                {rejectedOffers.map((offer) => (
                  <div key={offer._id} className="offer-card rejected">
                    <div className="offer-header">
                      <h3>{offer.mission?.title || 'Mission'}</h3>
                      <span className="offer-status rejected">Declined</span>
                    </div>
                    
                    <div className="offer-details">
                      <div className="offer-info">
                        <span className="info-label">From:</span>
                        <span className="info-value">{offer.client?.name || 'Client'}</span>
                      </div>
                      <div className="offer-info">
                        <span className="info-label">Amount:</span>
                        <span className="info-value">{offer.price} MAD</span>
                      </div>
                      <div className="offer-info">
                        <span className="info-label">Declined on:</span>
                        <span className="info-value">
                          {new Date(offer.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
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

export default Offers;