/**
 * Recommendation API Service
 * 
 * Frontend service for interacting with the recommendation system
 */

import api from './api';

class RecommendationService {
  /**
   * Get mission recommendations for the current freelancer
   * @param {Object} options - Recommendation options
   * @returns {Promise} Recommendation response
   */
  async getRecommendations(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', options.limit);
      if (options.includeApplied !== undefined) params.append('includeApplied', options.includeApplied);
      if (options.minBudget) params.append('minBudget', options.minBudget);
      if (options.maxBudget) params.append('maxBudget', options.maxBudget);
      if (options.experienceLevel) params.append('experienceLevel', options.experienceLevel);
      if (options.missionType) params.append('missionType', options.missionType);
      
      const queryString = params.toString();
      const url = queryString ? `/recommendations/me?${queryString}` : '/recommendations/me';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get recommendations for a specific freelancer (admin/public view)
   * @param {string} freelancerId - The freelancer's ID
   * @param {Object} options - Recommendation options
   * @returns {Promise} Recommendation response
   */
  async getFreelancerRecommendations(freelancerId, options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', options.limit);
      if (options.includeApplied !== undefined) params.append('includeApplied', options.includeApplied);
      if (options.minBudget) params.append('minBudget', options.minBudget);
      if (options.maxBudget) params.append('maxBudget', options.maxBudget);
      if (options.experienceLevel) params.append('experienceLevel', options.experienceLevel);
      if (options.missionType) params.append('missionType', options.missionType);
      
      const queryString = params.toString();
      const url = queryString ? `/recommendations/${freelancerId}?${queryString}` : `/recommendations/${freelancerId}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching freelancer recommendations:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Track user interaction with a mission
   * @param {string} missionId - The mission's ID
   * @param {string} interactionType - Type of interaction
   * @param {Object} metadata - Additional interaction metadata
   * @returns {Promise} Tracking response
   */
  async trackInteraction(missionId, interactionType, metadata = {}) {
    try {
      const payload = {
        missionId,
        interactionType,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }
      };

      const response = await api.post('/recommendations/interactions', payload);
      return response.data;
    } catch (error) {
      console.error('Error tracking interaction:', error);
      // Don't throw error for tracking failures - they shouldn't break the UI
      return { success: false, error: error.message };
    }
  }

  /**
   * Track mission view interaction
   * @param {string} missionId - The mission's ID
   * @param {Object} metadata - Additional metadata
   * @returns {Promise} Tracking response
   */
  async trackMissionView(missionId, metadata = {}) {
    return this.trackInteraction(missionId, 'view', metadata);
  }

  /**
   * Track mission click interaction
   * @param {string} missionId - The mission's ID
   * @param {Object} metadata - Additional metadata
   * @returns {Promise} Tracking response
   */
  async trackMissionClick(missionId, metadata = {}) {
    return this.trackInteraction(missionId, 'click', metadata);
  }

  /**
   * Track mission application
   * @param {string} missionId - The mission's ID
   * @param {Object} metadata - Additional metadata
   * @returns {Promise} Tracking response
   */
  async trackMissionApplication(missionId, metadata = {}) {
    return this.trackInteraction(missionId, 'apply', metadata);
  }

  /**
   * Track mission save/bookmark
   * @param {string} missionId - The mission's ID
   * @param {Object} metadata - Additional metadata
   * @returns {Promise} Tracking response
   */
  async trackMissionSave(missionId, metadata = {}) {
    return this.trackInteraction(missionId, 'save', metadata);
  }

  /**
   * Track mission share
   * @param {string} missionId - The mission's ID
   * @param {Object} metadata - Additional metadata
   * @returns {Promise} Tracking response
   */
  async trackMissionShare(missionId, metadata = {}) {
    return this.trackInteraction(missionId, 'share', metadata);
  }

  /**
   * Track client contact
   * @param {string} missionId - The mission's ID
   * @param {Object} metadata - Additional metadata
   * @returns {Promise} Tracking response
   */
  async trackClientContact(missionId, metadata = {}) {
    return this.trackInteraction(missionId, 'contact', metadata);
  }

  /**
   * Get similar freelancers
   * @param {string} freelancerId - The freelancer's ID (optional, defaults to current user)
   * @param {number} limit - Number of similar freelancers to return
   * @returns {Promise} Similar freelancers response
   */
  async getSimilarFreelancers(freelancerId = null, limit = 10) {
    try {
      const endpoint = freelancerId 
        ? `/recommendations/similar-freelancers/${freelancerId}?limit=${limit}`
        : `/recommendations/similar-freelancers/me?limit=${limit}`;
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching similar freelancers:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get analytics for the current freelancer
   * @returns {Promise} Analytics response
   */
  async getMyAnalytics() {
    try {
      const response = await api.get('/recommendations/analytics/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get analytics for a specific freelancer (admin only)
   * @param {string} freelancerId - The freelancer's ID
   * @returns {Promise} Analytics response
   */
  async getFreelancerAnalytics(freelancerId) {
    try {
      const response = await api.get(`/recommendations/analytics/${freelancerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching freelancer analytics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get system statistics (admin only)
   * @returns {Promise} System stats response
   */
  async getSystemStats() {
    try {
      const response = await api.get('/recommendations/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Trigger model retraining (admin only)
   * @returns {Promise} Retraining response
   */
  async retrainModels() {
    try {
      const response = await api.post('/recommendations/retrain');
      return response.data;
    } catch (error) {
      console.error('Error triggering model retraining:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Check recommendation service health
   * @returns {Promise} Health check response
   */
  async healthCheck() {
    try {
      const response = await api.get('/recommendations/health');
      return response.data;
    } catch (error) {
      console.error('Error checking recommendation service health:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Batch track multiple interactions
   * @param {Array} interactions - Array of interaction objects
   * @returns {Promise} Batch tracking response
   */
  async batchTrackInteractions(interactions) {
    try {
      const payload = {
        interactions: interactions.map(interaction => ({
          ...interaction,
          metadata: {
            ...interaction.metadata,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          }
        }))
      };

      const response = await api.post('/recommendations/interactions/batch', payload);
      return response.data;
    } catch (error) {
      console.error('Error batch tracking interactions:', error);
      // Don't throw error for tracking failures
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - The error object
   * @returns {Object} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // API returned an error response
      return {
        success: false,
        error: error.response.data?.error || 'API_ERROR',
        message: error.response.data?.message || 'An error occurred',
        statusCode: error.response.status,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to the recommendation service',
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
      };
    }
  }
}

export default new RecommendationService();
