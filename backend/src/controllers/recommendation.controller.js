/**
 * Recommendation Controller
 * 
 * Handles HTTP requests for the recommendation system endpoints.
 */

const recommendationService = require('../services/recommendation.service');
const logger = require('../utils/logger');

class RecommendationController {
  
  /**
   * Get recommendations for a freelancer
   * GET /recommendations/:freelancerId
   */
  async getRecommendations(req, res) {
    try {
      const { freelancerId } = req.params;
      const {
        limit,
        includeApplied,
        minBudget,
        maxBudget,
        experienceLevel,
        missionType,
      } = req.query;

      // Validate freelancer ID
      if (!freelancerId) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_FREELANCER_ID',
          message: 'Freelancer ID is required',
        });
      }

      // Parse query parameters
      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (includeApplied !== undefined) options.includeApplied = includeApplied === 'true';
      if (minBudget) options.minBudget = parseFloat(minBudget);
      if (maxBudget) options.maxBudget = parseFloat(maxBudget);
      if (experienceLevel) options.experienceLevel = experienceLevel;
      if (missionType) options.missionType = missionType;

      logger.info(`Getting recommendations for freelancer ${freelancerId}`, options);

      const result = await recommendationService.getRecommendations(freelancerId, options);

      if (result.success) {
        res.status(200).json(result.data);
      } else {
        const statusCode = result.statusCode || 500;
        res.status(statusCode).json({
          success: false,
          error: result.error,
          message: result.message,
        });
      }
    } catch (error) {
      logger.error('Error in getRecommendations controller:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      });
    }
  }

  /**
   * Track user interaction with a recommendation
   * POST /recommendations/interactions
   */
  async trackInteraction(req, res) {
    try {
      const { freelancerId, missionId, interactionType, metadata } = req.body;

      // Validate required fields
      if (!freelancerId || !missionId || !interactionType) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_REQUIRED_FIELDS',
          message: 'freelancerId, missionId, and interactionType are required',
        });
      }

      // Validate interaction type
      const validInteractionTypes = ['view', 'click', 'apply', 'save', 'share', 'contact'];
      if (!validInteractionTypes.includes(interactionType)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_INTERACTION_TYPE',
          message: `Invalid interaction type. Must be one of: ${validInteractionTypes.join(', ')}`,
        });
      }

      logger.info(`Tracking ${interactionType} interaction: freelancer ${freelancerId} -> mission ${missionId}`);

      const result = await recommendationService.trackInteraction(
        freelancerId,
        missionId,
        interactionType,
        metadata || {}
      );

      if (result.success) {
        res.status(200).json(result.data);
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: result.message,
        });
      }
    } catch (error) {
      logger.error('Error in trackInteraction controller:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      });
    }
  }

  /**
   * Get similar freelancers
   * GET /recommendations/similar-freelancers/:freelancerId
   */
  async getSimilarFreelancers(req, res) {
    try {
      const { freelancerId } = req.params;
      const { limit } = req.query;

      if (!freelancerId) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_FREELANCER_ID',
          message: 'Freelancer ID is required',
        });
      }

      const limitValue = limit ? parseInt(limit) : 10;

      logger.info(`Getting similar freelancers for ${freelancerId}`);

      const result = await recommendationService.getSimilarFreelancers(freelancerId, limitValue);

      if (result.success) {
        res.status(200).json(result.data);
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: result.message,
        });
      }
    } catch (error) {
      logger.error('Error in getSimilarFreelancers controller:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      });
    }
  }

  /**
   * Get analytics for a freelancer
   * GET /recommendations/analytics/:freelancerId
   */
  async getFreelancerAnalytics(req, res) {
    try {
      const { freelancerId } = req.params;

      if (!freelancerId) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_FREELANCER_ID',
          message: 'Freelancer ID is required',
        });
      }

      logger.info(`Getting analytics for freelancer ${freelancerId}`);

      const result = await recommendationService.getFreelancerAnalytics(freelancerId);

      if (result.success) {
        res.status(200).json(result.data);
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: result.message,
        });
      }
    } catch (error) {
      logger.error('Error in getFreelancerAnalytics controller:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      });
    }
  }

  /**
   * Trigger model retraining (admin only)
   * POST /recommendations/retrain
   */
  async retrainModels(req, res) {
    try {
      logger.info('Triggering model retraining');

      const result = await recommendationService.retrainModels();

      if (result.success) {
        res.status(200).json(result.data);
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: result.message,
        });
      }
    } catch (error) {
      logger.error('Error in retrainModels controller:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      });
    }
  }

  /**
   * Get system statistics (admin only)
   * GET /recommendations/stats
   */
  async getSystemStats(req, res) {
    try {
      logger.info('Getting system statistics');

      const result = await recommendationService.getSystemStats();

      if (result.success) {
        res.status(200).json(result.data);
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: result.message,
        });
      }
    } catch (error) {
      logger.error('Error in getSystemStats controller:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      });
    }
  }

  /**
   * Health check for recommendation service
   * GET /recommendations/health
   */
  async healthCheck(req, res) {
    try {
      const result = await recommendationService.healthCheck();

      if (result.success && result.healthy) {
        res.status(200).json({
          status: 'healthy',
          service: 'recommendation',
          ...result.data,
        });
      } else {
        res.status(503).json({
          status: 'unhealthy',
          service: 'recommendation',
          error: result.error,
          message: result.message,
        });
      }
    } catch (error) {
      logger.error('Error in recommendation health check:', error);
      res.status(500).json({
        status: 'error',
        service: 'recommendation',
        error: 'HEALTH_CHECK_ERROR',
        message: 'Health check failed',
      });
    }
  }

  /**
   * Batch track interactions
   * POST /recommendations/interactions/batch
   */
  async batchTrackInteractions(req, res) {
    try {
      const { interactions } = req.body;

      if (!Array.isArray(interactions) || interactions.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_INTERACTIONS',
          message: 'interactions must be a non-empty array',
        });
      }

      logger.info(`Batch tracking ${interactions.length} interactions`);

      const result = await recommendationService.batchTrackInteractions(interactions);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error in batchTrackInteractions controller:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      });
    }
  }
}

module.exports = new RecommendationController();
