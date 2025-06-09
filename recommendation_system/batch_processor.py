#!/usr/bin/env python3
"""
Batch Processing Script for LanceJob Recommendation System

This script runs periodic tasks like model retraining and cache cleanup.
It can be scheduled to run via cron or other task schedulers.
"""

import os
import sys
import time
import schedule
import logging
import traceback
from datetime import datetime, timedelta

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
        logging.FileHandler('batch_processor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class BatchProcessor:
    """Handles batch processing tasks for the recommendation system."""
    
    def __init__(self):
        self.config = Config()
        self.db_manager = DatabaseManager(self.config)
        self.cache_manager = CacheManager(self.config)
        self.recommender = HybridRecommendationSystem()
        
    def retrain_models(self):
        """Retrain recommendation models with latest data."""
        try:
            logger.info("Starting scheduled model retraining")
            start_time = time.time()
            
            # Clear cache before retraining
            self.cache_manager.clear_all()
            logger.info("Cache cleared")
            
            # Retrain models
            success = self.recommender.retrain_models()
            
            duration = time.time() - start_time
            
            if success:
                logger.info(f"Model retraining completed successfully in {duration:.2f} seconds")
            else:
                logger.error("Model retraining failed")
                
            return success
            
        except Exception as e:
            logger.error(f"Error during model retraining: {str(e)}")
            logger.error(traceback.format_exc())
            return False
    
    def cleanup_old_interactions(self, days_to_keep=730):  # 2 years default
        """Clean up old interaction data."""
        try:
            logger.info(f"Starting interaction cleanup for data older than {days_to_keep} days")
            
            cutoff_date = datetime.now() - timedelta(days=days_to_keep)
            
            # Count interactions to be deleted
            count = self.db_manager.count_interactions_before_date(cutoff_date)
            
            if count > 0:
                # Delete old interactions
                deleted = self.db_manager.delete_interactions_before_date(cutoff_date)
                logger.info(f"Deleted {deleted} old interactions")
            else:
                logger.info("No old interactions to delete")
                
            return True
            
        except Exception as e:
            logger.error(f"Error during interaction cleanup: {str(e)}")
            logger.error(traceback.format_exc())
            return False
    
    def update_user_profiles(self):
        """Update user profile vectors based on recent interactions."""
        try:
            logger.info("Starting user profile updates")
            
            # This could involve updating user embeddings, preferences, etc.
            # Implementation depends on the specific recommendation algorithm
            
            success = self.recommender.update_user_profiles()
            
            if success:
                logger.info("User profile updates completed successfully")
            else:
                logger.error("User profile updates failed")
                
            return success
            
        except Exception as e:
            logger.error(f"Error during user profile updates: {str(e)}")
            logger.error(traceback.format_exc())
            return False
    
    def generate_system_report(self):
        """Generate a system health and performance report."""
        try:
            logger.info("Generating system report")
            
            # Get basic statistics
            stats = {
                'timestamp': datetime.now().isoformat(),
                'freelancer_count': self.db_manager.get_collection_count('freelancers'),
                'mission_count': self.db_manager.get_collection_count('missions'),
                'interaction_count': self.db_manager.get_collection_count('interactions'),
                'cache_stats': self.cache_manager.get_stats(),
            }
            
            # Get recent interaction stats
            recent_interactions = self.db_manager.get_recent_interaction_stats(days=7)
            stats['recent_interactions'] = recent_interactions
            
            # Log the report
            logger.info("System Report:")
            logger.info(f"  Freelancers: {stats['freelancer_count']}")
            logger.info(f"  Missions: {stats['mission_count']}")
            logger.info(f"  Interactions: {stats['interaction_count']}")
            logger.info(f"  Cache Stats: {stats['cache_stats']}")
            
            return stats
            
        except Exception as e:
            logger.error(f"Error generating system report: {str(e)}")
            logger.error(traceback.format_exc())
            return None
    
    def health_check(self):
        """Perform a health check of all system components."""
        try:
            logger.info("Performing system health check")
            
            # Test database connection
            db_healthy = self.db_manager.test_connection()
            
            # Test cache connection
            cache_healthy = self.cache_manager.test_connection()
            
            # Test recommendation system
            rec_healthy = True
            try:
                # Try to get a small recommendation set
                test_result = self.recommender.get_recommendations("test_freelancer", limit=1)
                rec_healthy = True
            except Exception:
                rec_healthy = False
            
            health_status = {
                'database': db_healthy,
                'cache': cache_healthy,
                'recommender': rec_healthy,
                'overall': db_healthy and cache_healthy and rec_healthy,
                'timestamp': datetime.now().isoformat()
            }
            
            if health_status['overall']:
                logger.info("System health check: ALL SYSTEMS HEALTHY")
            else:
                logger.warning("System health check: SOME SYSTEMS UNHEALTHY")
                logger.warning(f"Database: {db_healthy}, Cache: {cache_healthy}, Recommender: {rec_healthy}")
            
            return health_status
            
        except Exception as e:
            logger.error(f"Error during health check: {str(e)}")
            logger.error(traceback.format_exc())
            return None
    
    def run_daily_tasks(self):
        """Run all daily maintenance tasks."""
        logger.info("Starting daily batch processing tasks")
        
        # Health check
        self.health_check()
        
        # Generate system report
        self.generate_system_report()
        
        # Update user profiles
        self.update_user_profiles()
        
        logger.info("Daily batch processing tasks completed")
    
    def run_weekly_tasks(self):
        """Run all weekly maintenance tasks."""
        logger.info("Starting weekly batch processing tasks")
        
        # Retrain models
        self.retrain_models()
        
        # Clean up old interactions
        self.cleanup_old_interactions()
        
        logger.info("Weekly batch processing tasks completed")

def main():
    """Main function to set up and run the batch processor."""
    processor = BatchProcessor()
    
    # Schedule tasks
    
    # Daily tasks at 2 AM
    schedule.every().day.at("02:00").do(processor.run_daily_tasks)
    
    # Weekly tasks on Sunday at 3 AM
    schedule.every().sunday.at("03:00").do(processor.run_weekly_tasks)
    
    # Health checks every hour
    schedule.every().hour.do(processor.health_check)
    
    logger.info("Batch processor started. Scheduled tasks:")
    logger.info("  - Daily tasks: 2:00 AM")
    logger.info("  - Weekly tasks: Sunday 3:00 AM")
    logger.info("  - Health checks: Every hour")
    
    # Run initial health check
    processor.health_check()
    
    # Keep the script running
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        logger.info("Batch processor stopped by user")
    except Exception as e:
        logger.error(f"Unexpected error in batch processor: {str(e)}")
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    main()
