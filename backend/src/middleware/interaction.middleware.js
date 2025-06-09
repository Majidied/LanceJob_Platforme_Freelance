/**
 * Interaction Tracking Middleware
 * 
 * Automatically tracks user interactions with missions for the recommendation system.
 */

const recommendationService = require('../services/recommendation.service');
const logger = require('../utils/logger');

/**
 * Middleware to track mission view interactions
 * Use this on mission detail routes
 */
const trackMissionView = async (req, res, next) => {
  try {
    const { missionId } = req.params;
    const freelancerId = req.user?.id; // Assuming user info is in req.user

    if (freelancerId && missionId) {
      // Track the view interaction asynchronously
      setImmediate(async () => {
        try {
          await recommendationService.trackInteraction(
            freelancerId,
            missionId,
            'view',
            {
              timestamp: new Date().toISOString(),
              userAgent: req.get('User-Agent'),
              ip: req.ip,
              referrer: req.get('Referrer'),
            }
          );
        } catch (error) {
          logger.error('Failed to track mission view:', error);
        }
      });
    }

    next();
  } catch (error) {
    logger.error('Error in trackMissionView middleware:', error);
    next(); // Continue even if tracking fails
  }
};

/**
 * Middleware to track mission application interactions
 * Use this on mission application routes
 */
const trackMissionApplication = async (req, res, next) => {
  try {
    const { missionId } = req.params || req.body;
    const freelancerId = req.user?.id;

    if (freelancerId && missionId) {
      // Track the application interaction asynchronously
      setImmediate(async () => {
        try {
          await recommendationService.trackInteraction(
            freelancerId,
            missionId,
            'apply',
            {
              timestamp: new Date().toISOString(),
              applicationData: req.body,
              userAgent: req.get('User-Agent'),
              ip: req.ip,
            }
          );
        } catch (error) {
          logger.error('Failed to track mission application:', error);
        }
      });
    }

    next();
  } catch (error) {
    logger.error('Error in trackMissionApplication middleware:', error);
    next(); // Continue even if tracking fails
  }
};

/**
 * Generic interaction tracking middleware factory
 * @param {string} interactionType - The type of interaction to track
 * @returns {Function} Express middleware function
 */
const createInteractionTracker = (interactionType) => {
  return async (req, res, next) => {
    try {
      const { missionId } = req.params || req.body;
      const freelancerId = req.user?.id;

      if (freelancerId && missionId) {
        // Track the interaction asynchronously
        setImmediate(async () => {
          try {
            await recommendationService.trackInteraction(
              freelancerId,
              missionId,
              interactionType,
              {
                timestamp: new Date().toISOString(),
                requestBody: req.body,
                userAgent: req.get('User-Agent'),
                ip: req.ip,
                referrer: req.get('Referrer'),
              }
            );
          } catch (error) {
            logger.error(`Failed to track ${interactionType} interaction:`, error);
          }
        });
      }

      next();
    } catch (error) {
      logger.error(`Error in ${interactionType} tracking middleware:`, error);
      next(); // Continue even if tracking fails
    }
  };
};

/**
 * Response interceptor to track successful interactions
 * This can be used to track interactions based on response status
 */
const trackSuccessfulInteraction = (interactionType) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Check if the response indicates success
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const { missionId } = req.params || req.body;
        const freelancerId = req.user?.id;

        if (freelancerId && missionId) {
          setImmediate(async () => {
            try {
              await recommendationService.trackInteraction(
                freelancerId,
                missionId,
                interactionType,
                {
                  timestamp: new Date().toISOString(),
                  statusCode: res.statusCode,
                  success: true,
                  userAgent: req.get('User-Agent'),
                  ip: req.ip,
                }
              );
            } catch (error) {
              logger.error(`Failed to track successful ${interactionType}:`, error);
            }
          });
        }
      }

      originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Batch tracking middleware for bulk operations
 * Useful when multiple missions are involved in a single request
 */
const trackBulkInteraction = (interactionType) => {
  return async (req, res, next) => {
    try {
      const freelancerId = req.user?.id;
      const { missionIds } = req.body; // Expecting an array of mission IDs

      if (freelancerId && Array.isArray(missionIds) && missionIds.length > 0) {
        setImmediate(async () => {
          try {
            const interactions = missionIds.map(missionId => ({
              freelancerId,
              missionId,
              interactionType,
              metadata: {
                timestamp: new Date().toISOString(),
                bulkOperation: true,
                userAgent: req.get('User-Agent'),
                ip: req.ip,
              }
            }));

            await recommendationService.batchTrackInteractions(interactions);
          } catch (error) {
            logger.error(`Failed to track bulk ${interactionType} interactions:`, error);
          }
        });
      }

      next();
    } catch (error) {
      logger.error(`Error in bulk ${interactionType} tracking middleware:`, error);
      next();
    }
  };
};

module.exports = {
  trackMissionView,
  trackMissionApplication,
  createInteractionTracker,
  trackSuccessfulInteraction,
  trackBulkInteraction,
};
