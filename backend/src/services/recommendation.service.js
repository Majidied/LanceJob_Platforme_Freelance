/**
 * Recommendation Service
 * 
 * This service handles communication with the Python recommendation API
 * and provides recommendation functionality to the Node.js backend.
 */

const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class RecommendationService {
  constructor() {
    this.apiBaseUrl = process.env.RECOMMENDATION_API_URL || 'http://127.0.0.1:2511';
    this.timeout = parseInt(process.env.RECOMMENDATION_API_TIMEOUT) || 30000;
    
    // Create axios instance with default config
    this.apiClient = axios.create({
      baseURL: this.apiBaseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.apiClient.interceptors.request.use(
      (config) => {
        logger.info(`Recommendation API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Recommendation API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.apiClient.interceptors.response.use(
      (response) => {
        logger.info(`Recommendation API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('Recommendation API Response Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get mission recommendations for a freelancer
   * @param {string} freelancerId - The freelancer's ID
   * @param {Object} options - Recommendation options
   * @returns {Promise<Object>} Recommendation response
   */
  async getRecommendations(freelancerId, options = {}) {
    try {
      const {
        limit = 10,
        includeApplied = false,
        minBudget,
        maxBudget,
        experienceLevel,
        missionType,
      } = options;

      const params = {
        limit,
        include_applied: includeApplied,
      };

      // Add optional filters
      if (minBudget !== undefined) params.min_budget = minBudget;
      if (maxBudget !== undefined) params.max_budget = maxBudget;
      if (experienceLevel) params.experience_level = experienceLevel;
      if (missionType) params.mission_type = missionType;

      const response = await this.apiClient.get(`/recommendations/${freelancerId}`, { params });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error(`Failed to get recommendations for freelancer ${freelancerId}:`, error);
      
      if (error.response) {
        // API returned an error response
        return {
          success: false,
          error: error.response.data?.error || 'Recommendation API error',
          message: error.response.data?.message || 'Failed to get recommendations',
          statusCode: error.response.status,
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          error: 'API_UNAVAILABLE',
          message: 'Recommendation service is currently unavailable',
        };
      } else {
        // Something else happened
        return {
          success: false,
          error: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
        };
      }
    }
  }

  /**
   * Track user interaction with a recommendation
   * @param {string} freelancerId - The freelancer's ID
   * @param {string} missionId - The mission's ID
   * @param {string} interactionType - Type of interaction
   * @param {Object} metadata - Additional interaction metadata
   * @returns {Promise<Object>} Tracking response
   */
  async trackInteraction(freelancerId, missionId, interactionType, metadata = {}) {
    try {
      const payload = {
        freelancer_id: freelancerId,
        mission_id: missionId,
        interaction_type: interactionType,
        metadata,
      };

      const response = await this.apiClient.post('/interactions', payload);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error(`Failed to track interaction for freelancer ${freelancerId}:`, error);
      
      return {
        success: false,
        error: error.response?.data?.error || 'TRACKING_ERROR',
        message: error.response?.data?.message || 'Failed to track interaction',
      };
    }
  }

  /**
   * Get similar freelancers
   * @param {string} freelancerId - The freelancer's ID
   * @param {number} limit - Number of similar freelancers to return
   * @returns {Promise<Object>} Similar freelancers response
   */
  async getSimilarFreelancers(freelancerId, limit = 10) {
    try {
      const response = await this.apiClient.get(`/similar-freelancers/${freelancerId}`, {
        params: { limit },
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error(`Failed to get similar freelancers for ${freelancerId}:`, error);
      
      return {
        success: false,
        error: error.response?.data?.error || 'SIMILAR_FREELANCERS_ERROR',
        message: error.response?.data?.message || 'Failed to get similar freelancers',
      };
    }
  }

  /**
   * Get analytics for a freelancer
   * @param {string} freelancerId - The freelancer's ID
   * @returns {Promise<Object>} Analytics response
   */
  async getFreelancerAnalytics(freelancerId) {
    try {
      const response = await this.apiClient.get(`/analytics/freelancer/${freelancerId}`);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error(`Failed to get analytics for freelancer ${freelancerId}:`, error);
      
      return {
        success: false,
        error: error.response?.data?.error || 'ANALYTICS_ERROR',
        message: error.response?.data?.message || 'Failed to get analytics',
      };
    }
  }

  /**
   * Trigger model retraining
   * @returns {Promise<Object>} Retraining response
   */
  async retrainModels() {
    try {
      const response = await this.apiClient.post('/retrain');
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error('Failed to retrain models:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || 'RETRAIN_ERROR',
        message: error.response?.data?.message || 'Failed to retrain models',
      };
    }
  }

  /**
   * Get system statistics
   * @returns {Promise<Object>} System stats response
   */
  async getSystemStats() {
    try {
      const response = await this.apiClient.get('/stats');
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error('Failed to get system stats:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || 'STATS_ERROR',
        message: error.response?.data?.message || 'Failed to get system stats',
      };
    }
  }

  /**
   * Check if the recommendation API is healthy
   * @returns {Promise<Object>} Health check response
   */
  async healthCheck() {
    try {
      const response = await this.apiClient.get('/health');
      
      return {
        success: true,
        healthy: response.data.status === 'healthy',
        data: response.data,
      };
    } catch (error) {
      logger.error('Recommendation API health check failed:', error);
      
      return {
        success: false,
        healthy: false,
        error: error.response?.data?.error || 'HEALTH_CHECK_ERROR',
        message: error.response?.data?.message || 'Health check failed',
      };
    }
  }

  /**
   * Batch track multiple interactions
   * @param {Array} interactions - Array of interaction objects
   * @returns {Promise<Object>} Batch tracking response
   */
  async batchTrackInteractions(interactions) {
    try {
      const results = await Promise.allSettled(
        interactions.map(({ freelancerId, missionId, interactionType, metadata }) =>
          this.trackInteraction(freelancerId, missionId, interactionType, metadata)
        )
      );

      const successful = results.filter(result => result.status === 'fulfilled' && result.value.success);
      const failed = results.filter(result => result.status === 'rejected' || !result.value.success);

      return {
        success: true,
        total: interactions.length,
        successful: successful.length,
        failed: failed.length,
        results,
      };
    } catch (error) {
      logger.error('Failed to batch track interactions:', error);
      
      return {
        success: false,
        error: 'BATCH_TRACKING_ERROR',
        message: 'Failed to batch track interactions',
      };
    }
  }
}

module.exports = new RecommendationService();
