"""
Flask API Server for LanceJob Recommendation System

This module provides REST API endpoints for the hybrid recommendation system.
It serves as the interface between the Node.js backend and the Python ML models.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import traceback
from datetime import datetime
import os
import sys

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import Config
from database_manager import DatabaseManager
from cache_manager import CacheManager
from hybrid_recommender import HybridRecommendationSystem

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('api_server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Initialize components
config = Config()
db_manager = DatabaseManager()
cache_manager = CacheManager()
recommender = HybridRecommendationSystem()

class RecommendationAPI:
    """API endpoints for the recommendation system."""
    
    @staticmethod
    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint."""
        try:
            # Test database connection
            db_status = db_manager.test_connection()
            
            # Test cache connection
            cache_status = cache_manager.test_connection()
            
            return jsonify({
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'services': {
                    'database': 'connected' if db_status else 'disconnected',
                    'cache': 'connected' if cache_status else 'disconnected'
                }
            }), 200
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return jsonify({
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }), 500

    @staticmethod
    @app.route('/recommendations/<freelancer_id>', methods=['GET'])
    def get_recommendations(freelancer_id):
        try:
            # Parse basic parameters
            limit = request.args.get('limit', 10, type=int)
            include_applied = request.args.get('include_applied', 'false').lower() == 'true'
            
            # Parse filter parameters
            filters = {}
            
            # Budget filters
            if request.args.get('min_budget'):
                try:
                    filters['min_budget'] = float(request.args.get('min_budget'))
                except ValueError:
                    logger.warning(f"Invalid min_budget parameter: {request.args.get('min_budget')}")
            
            if request.args.get('max_budget'):
                try:
                    filters['max_budget'] = float(request.args.get('max_budget'))
                except ValueError:
                    logger.warning(f"Invalid max_budget parameter: {request.args.get('max_budget')}")
            
            # Experience level filter
            if request.args.get('experience_level'):
                filters['experience_level'] = request.args.get('experience_level')
            
            # Mission type filter
            if request.args.get('mission_type'):
                filters['mission_type'] = request.args.get('mission_type')
            
            logger.info(f"🔍 Getting recommendations for freelancer: {freelancer_id} with filters: {filters}")
            
            # ✅ Call with all parameters including filters
            recommendations = recommender.get_recommendations(
                freelancer_id=freelancer_id,
                limit=limit,
                include_applied=include_applied,
                filters=filters
            )
            
            return jsonify({
                'freelancer_id': freelancer_id,
                'recommendations': recommendations,
                'count': len(recommendations),
                'filters_applied': {
                    'limit': limit,
                    'include_applied': include_applied,
                    'budget_range': {
                        'min': filters.get('min_budget'),
                        'max': filters.get('max_budget')
                    },
                    'experience_level': filters.get('experience_level'),
                    'mission_type': filters.get('mission_type')
                }
            }), 200
            
        except Exception as e:
            logger.error(f"❌ Error getting recommendations: {e}")
            return jsonify({'error': str(e)}), 500

    @staticmethod
    @app.route('/interactions', methods=['POST'])
    def track_interaction():
        """Track user interaction with recommendations."""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['freelancer_id', 'mission_id', 'interaction_type']
            for field in required_fields:
                if field not in data:
                    return jsonify({
                        'error': f'Missing required field: {field}'
                    }), 400
            
            freelancer_id = data['freelancer_id']
            mission_id = data['mission_id']
            interaction_type = data['interaction_type']
            metadata = data.get('metadata', {})
            
            # Validate interaction type
            valid_types = ['view', 'click', 'apply', 'save', 'share', 'contact']
            if interaction_type not in valid_types:
                return jsonify({
                    'error': f'Invalid interaction type. Must be one of: {valid_types}'
                }), 400
            
            logger.info(f"Tracking {interaction_type} interaction: freelancer {freelancer_id} -> mission {mission_id}")
            
            # Track the interaction
            success = db_manager.track_interaction(
                freelancer_id=freelancer_id,
                mission_id=mission_id,
                interaction_type=interaction_type,
                metadata=metadata
            )
            
            if success:
                # Invalidate cache for this freelancer to ensure fresh recommendations
                cache_key = f"recommendations:{freelancer_id}"
                cache_manager.delete(cache_key)
                
                return jsonify({
                    'success': True,
                    'message': 'Interaction tracked successfully',
                    'timestamp': datetime.now().isoformat()
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': 'Failed to track interaction'
                }), 500
                
        except Exception as e:
            logger.error(f"Error tracking interaction: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({
                'error': 'Internal server error',
                'message': 'Failed to track interaction'
            }), 500

    @staticmethod
    @app.route('/similar-freelancers/<freelancer_id>', methods=['GET'])
    def get_similar_freelancers(freelancer_id):
        """Get similar freelancers for collaborative filtering insights."""
        try:
            limit = request.args.get('limit', 10, type=int)
            
            logger.info(f"Finding similar freelancers for {freelancer_id}")
            
            # Get similar freelancers
            similar_freelancers = recommender.collaborative_recommender.find_similar_users(
                freelancer_id, limit
            )
            
            return jsonify({
                'freelancer_id': freelancer_id,
                'similar_freelancers': similar_freelancers,
                'total': len(similar_freelancers),
                'timestamp': datetime.now().isoformat()
            }), 200
            
        except Exception as e:
            logger.error(f"Error finding similar freelancers for {freelancer_id}: {str(e)}")
            return jsonify({
                'error': 'Internal server error',
                'message': 'Failed to find similar freelancers'
            }), 500

    @staticmethod
    @app.route('/retrain', methods=['POST'])
    def retrain_models():
        """Retrain the recommendation models with latest data."""
        try:
            logger.info("Starting model retraining")
            
            # Clear all cached recommendations
            cache_manager.clear_all()
            
            # Retrain models
            success = recommender.retrain_model()
            
            if success:
                return jsonify({
                    'success': True,
                    'message': 'Models retrained successfully',
                    'timestamp': datetime.now().isoformat()
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': 'Model retraining failed'
                }), 500
                
        except Exception as e:
            logger.error(f"Error retraining models: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({
                'error': 'Internal server error',
                'message': 'Failed to retrain models'
            }), 500

    @staticmethod
    @app.route('/analytics/freelancer/<freelancer_id>', methods=['GET'])
    def get_freelancer_analytics(freelancer_id):
        """Get analytics and insights for a freelancer."""
        try:
            logger.info(f"Getting analytics for freelancer {freelancer_id}")
            
            # Get interaction history
            interactions = db_manager.get_user_interactions(freelancer_id)
            
            # Calculate basic analytics
            total_interactions = len(interactions)
            interaction_types = {}
            for interaction in interactions:
                interaction_type = interaction.get('interaction_type', 'unknown')
                interaction_types[interaction_type] = interaction_types.get(interaction_type, 0) + 1
            
            # Get recommendation performance
            recent_recommendations = cache_manager.get_recommendations(f"recommendations:{freelancer_id}")
            
            analytics = {
                'freelancer_id': freelancer_id,
                'total_interactions': total_interactions,
                'interaction_breakdown': interaction_types,
                'has_recent_recommendations': recent_recommendations is not None,
                'timestamp': datetime.now().isoformat()
            }
            
            return jsonify(analytics), 200
            
        except Exception as e:
            logger.error(f"Error getting analytics for freelancer {freelancer_id}: {str(e)}")
            return jsonify({
                'error': 'Internal server error',
                'message': 'Failed to get analytics'
            }), 500

    @staticmethod
    @app.route('/stats', methods=['GET'])
    def get_system_stats():
        """Get overall system statistics."""
        try:
            # Get basic counts
            freelancer_count = db_manager.get_collection_count('freelancers')
            mission_count = db_manager.get_collection_count('missions')
            interaction_count = db_manager.get_collection_count('interactions')
            
            # Get cache stats
            cache_stats = cache_manager.get_cache_stats()
            
            stats = {
                'system': {
                    'freelancers': freelancer_count,
                    'missions': mission_count,
                    'interactions': interaction_count
                },
                'cache': cache_stats,
                'timestamp': datetime.now().isoformat()
            }
            
            return jsonify(stats), 200
            
        except Exception as e:
            logger.error(f"Error getting system stats: {str(e)}")
            return jsonify({
                'error': 'Internal server error',
                'message': 'Failed to get system statistics'
            }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'error': 'Endpoint not found',
        'message': 'The requested endpoint does not exist'
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors."""
    return jsonify({
        'error': 'Method not allowed',
        'message': 'The request method is not allowed for this endpoint'
    }), 405

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500

if __name__ == '__main__':
    # Start the Flask development server
    debug = Config.DEBUG
    host = '127.0.0.1'
    port = Config.FLASK_PORT
    
    logger.info(f"Starting Flask API server on {host}:{port} (debug={debug})")
    
    app.run(
        host=host,
        port=port,
        debug=debug
    )
