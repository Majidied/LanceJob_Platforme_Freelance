#!/usr/bin/env python3
"""
Batch Processor for LanceJob Recommendation System

This module handles periodic tasks like model retraining, data preprocessing,
and recommendation updates.
"""

import logging
import time
import schedule
import sys
import os
from datetime import datetime, timedelta

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.config import Config
from src.core.database_manager import DatabaseManager
from src.recommenders.hybrid_recommender import HybridRecommendationSystem
from src.core.cache_manager import CacheManager

# Configure logging
log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
os.makedirs(log_dir, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(log_dir, 'batch_processor.log')),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class BatchProcessor:
    """Handles periodic batch processing tasks"""
    
    def __init__(self):
        self.db_manager = DatabaseManager()
        self.cache_manager = CacheManager()
        self.recommender = HybridRecommendationSystem()
        
    def retrain_models(self):
        """Retrain recommendation models with latest data"""
        try:
            logger.info("Starting model retraining...")
            
            # Clear cache before retraining
            self.cache_manager.clear_all()
            
            # Retrain the hybrid recommender
            success = self.recommender.retrain_model()
            
            if success:
                logger.info("Model retraining completed successfully")
            else:
                logger.error("Model retraining failed")
                
        except Exception as e:
            logger.error(f"Error during model retraining: {e}")
    
    def cleanup_old_data(self):
        """Clean up old interactions and cached data"""
        try:
            logger.info("Starting data cleanup...")
            
            # Clean up old cache entries
            self.cache_manager.cleanup_expired()
            
            # Clean up old interactions (older than 1 year)
            cutoff_date = datetime.now() - timedelta(days=365)
            
            # Note: Implement actual cleanup logic based on your requirements
            logger.info(f"Data cleanup completed - cutoff date: {cutoff_date}")
            
        except Exception as e:
            logger.error(f"Error during data cleanup: {e}")
    
    def update_recommendations_cache(self):
        """Pre-compute and cache popular recommendations"""
        try:
            logger.info("Updating recommendations cache...")
            
            # Get active freelancers
            freelancers = self.db_manager.get_collection('freelancers').find(
                {"status": "active"}, 
                {"_id": 1}
            ).limit(100)  # Process top 100 active freelancers
            
            count = 0
            for freelancer in freelancers:
                freelancer_id = str(freelancer['_id'])
                
                # Generate and cache recommendations
                try:
                    recommendations = self.recommender.get_recommendations(
                        freelancer_id=freelancer_id,
                        limit=20
                    )
                    
                    if recommendations:
                        cache_key = f"recommendations:{freelancer_id}"
                        self.cache_manager.set_recommendations(cache_key, recommendations, ttl=3600)  # 1 hour TTL
                        count += 1
                        
                except Exception as e:
                    logger.warning(f"Failed to generate recommendations for freelancer {freelancer_id}: {e}")
            
            logger.info(f"Updated recommendations cache for {count} freelancers")
            
        except Exception as e:
            logger.error(f"Error updating recommendations cache: {e}")
    
    def generate_analytics(self):
        """Generate analytics and insights"""
        try:
            logger.info("Generating analytics...")
            
            # Get system statistics
            freelancer_count = self.db_manager.get_collection_count('freelancers')
            mission_count = self.db_manager.get_collection_count('missions')
            interaction_count = self.db_manager.get_collection_count('interactions')
            
            # Get recommendation system stats
            rec_stats = self.recommender.get_system_stats()
            
            analytics = {
                'timestamp': datetime.now().isoformat(),
                'system': {
                    'freelancers': freelancer_count,
                    'missions': mission_count,
                    'interactions': interaction_count
                },
                'recommendation_system': rec_stats
            }
            
            logger.info(f"Analytics generated: {analytics}")
            
            # Store analytics (you can implement storage logic here)
            
        except Exception as e:
            logger.error(f"Error generating analytics: {e}")
    
    def health_check(self):
        """Perform system health checks"""
        try:
            logger.info("Performing health check...")
            
            # Check database connection
            db_status = self.db_manager.test_connection()
            
            # Check cache connection
            cache_status = self.cache_manager.test_connection()
            
            # Check recommendation system
            rec_status = self.recommender.is_trained()
            
            health_status = {
                'timestamp': datetime.now().isoformat(),
                'database': 'healthy' if db_status else 'unhealthy',
                'cache': 'healthy' if cache_status else 'unhealthy',
                'recommendation_system': 'healthy' if rec_status else 'unhealthy',
                'overall': 'healthy' if all([db_status, cache_status, rec_status]) else 'unhealthy'
            }
            
            logger.info(f"Health check completed: {health_status}")
            
            if health_status['overall'] == 'unhealthy':
                logger.warning("System health check failed!")
            
        except Exception as e:
            logger.error(f"Error during health check: {e}")
    
    def run_scheduler(self):
        """Run the batch processor with scheduled tasks"""
        logger.info("Starting batch processor scheduler...")
        
        # Schedule tasks
        schedule.every(6).hours.do(self.retrain_models)  # Retrain models every 6 hours
        schedule.every().day.at("02:00").do(self.cleanup_old_data)  # Daily cleanup at 2 AM
        schedule.every(30).minutes.do(self.update_recommendations_cache)  # Update cache every 30 min
        schedule.every().hour.do(self.generate_analytics)  # Generate analytics every hour
        schedule.every(15).minutes.do(self.health_check)  # Health check every 15 minutes
        
        # Run initial tasks
        logger.info("Running initial tasks...")
        self.health_check()
        self.retrain_models()
        self.update_recommendations_cache()
        
        # Main scheduler loop
        logger.info("Batch processor scheduler started. Running scheduled tasks...")
        
        while True:
            try:
                schedule.run_pending()
                time.sleep(60)  # Check for pending tasks every minute
                
            except KeyboardInterrupt:
                logger.info("Batch processor stopped by user")
                break
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}")
                time.sleep(60)  # Continue after error

def main():
    """Main entry point for the batch processor"""
    try:
        processor = BatchProcessor()
        processor.run_scheduler()
        
    except Exception as e:
        logger.error(f"Fatal error in batch processor: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
