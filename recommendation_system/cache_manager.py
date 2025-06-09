import logging
import redis
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from config import Config

logger = logging.getLogger(__name__)

class CacheManager:
    """Redis cache manager for recommendation system"""
    
    def __init__(self):
        try:
            self.redis_client = redis.from_url(Config.REDIS_URL, decode_responses=True)
            # Test connection
            self.redis_client.ping()
            logger.info("Redis connection established successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis_client = None
    
    def is_available(self) -> bool:
        """Check if Redis is available"""
        return self.redis_client is not None
    
    def test_connection(self) -> bool:
        """Test Redis connection for health checks"""
        try:
            if self.redis_client:
                self.redis_client.ping()
                return True
            return False
        except Exception as e:
            logger.error(f"Redis connection test failed: {e}")
            return False
    
    def _get_key(self, prefix: str, identifier: str) -> str:
        """Generate cache key with prefix"""
        return f"lancejob:{prefix}:{identifier}"
    
    def get_recommendations(self, freelancer_id: str) -> Optional[List[Dict]]:
        """Get cached recommendations for freelancer"""
        if not self.is_available():
            return None
            
        try:
            key = self._get_key("recommendations", freelancer_id)
            cached_data = self.redis_client.get(key)
            
            if cached_data:
                data = json.loads(cached_data)
                # Check if cache is still valid
                cached_time = datetime.fromisoformat(data['timestamp'])
                if datetime.now() - cached_time < timedelta(seconds=Config.CACHE_EXPIRY_SECONDS):
                    logger.info(f"Cache hit for freelancer {freelancer_id}")
                    return data['recommendations']
                else:
                    # Cache expired, remove it
                    self.redis_client.delete(key)
                    logger.info(f"Cache expired for freelancer {freelancer_id}")
            
            return None
        except Exception as e:
            logger.error(f"Error getting cached recommendations: {e}")
            return None
    
    def set_recommendations(self, freelancer_id: str, recommendations: List[Dict]) -> bool:
        """Cache recommendations for freelancer"""
        if not self.is_available():
            return False
            
        try:
            key = self._get_key("recommendations", freelancer_id)
            data = {
                'recommendations': recommendations,
                'timestamp': datetime.now().isoformat()
            }
            
            self.redis_client.setex(
                key,
                Config.CACHE_EXPIRY_SECONDS,
                json.dumps(data)
            )
            logger.info(f"Cached recommendations for freelancer {freelancer_id}")
            return True
        except Exception as e:
            logger.error(f"Error caching recommendations: {e}")
            return False
    
    def get_user_interactions(self, freelancer_id: str) -> Optional[List[Dict]]:
        """Get cached user interactions"""
        if not self.is_available():
            return None
            
        try:
            key = self._get_key("interactions", freelancer_id)
            cached_data = self.redis_client.get(key)
            
            if cached_data:
                logger.info(f"Retrieved cached interactions for freelancer {freelancer_id}")
                return json.loads(cached_data)
            
            return None
        except Exception as e:
            logger.error(f"Error getting cached interactions: {e}")
            return None
    
    def add_interaction(self, freelancer_id: str, interaction: Dict) -> bool:
        """Add interaction to cache"""
        if not self.is_available():
            return False
            
        try:
            key = self._get_key("interactions", freelancer_id)
            
            # Get existing interactions
            existing_data = self.redis_client.get(key)
            if existing_data:
                interactions = json.loads(existing_data)
            else:
                interactions = []
            
            # Add new interaction with timestamp
            interaction['timestamp'] = datetime.now().isoformat()
            interactions.append(interaction)
            
            # Keep only recent interactions (last 1000)
            interactions = interactions[-1000:]
            
            # Cache for 7 days
            self.redis_client.setex(
                key,
                604800,  # 7 days
                json.dumps(interactions)
            )
            
            logger.info(f"Added interaction for freelancer {freelancer_id}: {interaction['type']}")
            return True
        except Exception as e:
            logger.error(f"Error adding interaction to cache: {e}")
            return False
    
    def get_similarity_matrix(self) -> Optional[Dict]:
        """Get cached similarity matrix"""
        if not self.is_available():
            return None
            
        try:
            key = self._get_key("model", "similarity_matrix")
            cached_data = self.redis_client.get(key)
            
            if cached_data:
                logger.info("Retrieved cached similarity matrix")
                return json.loads(cached_data)
            
            return None
        except Exception as e:
            logger.error(f"Error getting cached similarity matrix: {e}")
            return None
    
    def set_similarity_matrix(self, matrix_data: Dict) -> bool:
        """Cache similarity matrix"""
        if not self.is_available():
            return False
            
        try:
            key = self._get_key("model", "similarity_matrix")
            
            # Cache for 24 hours
            self.redis_client.setex(
                key,
                Config.CACHE_EXPIRY_SECONDS,
                json.dumps(matrix_data)
            )
            
            logger.info("Cached similarity matrix")
            return True
        except Exception as e:
            logger.error(f"Error caching similarity matrix: {e}")
            return False
    
    def invalidate_user_cache(self, freelancer_id: str) -> bool:
        """Invalidate all cache for a specific freelancer"""
        if not self.is_available():
            return False
            
        try:
            keys_to_delete = [
                self._get_key("recommendations", freelancer_id),
                self._get_key("interactions", freelancer_id)
            ]
            
            deleted_count = self.redis_client.delete(*keys_to_delete)
            logger.info(f"Invalidated cache for freelancer {freelancer_id}, deleted {deleted_count} keys")
            return True
        except Exception as e:
            logger.error(f"Error invalidating cache: {e}")
            return False
    
    def invalidate_all_recommendations(self) -> bool:
        """Invalidate all cached recommendations (used after model retraining)"""
        if not self.is_available():
            return False
            
        try:
            pattern = self._get_key("recommendations", "*")
            keys = self.redis_client.keys(pattern)
            
            if keys:
                deleted_count = self.redis_client.delete(*keys)
                logger.info(f"Invalidated all recommendation caches, deleted {deleted_count} keys")
            
            # Also invalidate similarity matrix
            matrix_key = self._get_key("model", "similarity_matrix")
            self.redis_client.delete(matrix_key)
            
            return True
        except Exception as e:
            logger.error(f"Error invalidating all recommendations cache: {e}")
            return False
    
    def get_cache_stats(self) -> Dict:
        """Get cache statistics"""
        if not self.is_available():
            return {"error": "Redis not available"}
            
        try:
            info = self.redis_client.info()
            
            # Count keys by type
            recommendation_keys = len(self.redis_client.keys(self._get_key("recommendations", "*")))
            interaction_keys = len(self.redis_client.keys(self._get_key("interactions", "*")))
            model_keys = len(self.redis_client.keys(self._get_key("model", "*")))
            
            return {
                "redis_version": info.get("redis_version"),
                "used_memory_human": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
                "total_keys": recommendation_keys + interaction_keys + model_keys,
                "recommendation_keys": recommendation_keys,
                "interaction_keys": interaction_keys,
                "model_keys": model_keys
            }
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {"error": str(e)}

    def clear_all(self) -> bool:
        """Clear all cache managed by this CacheManager (dangerous operation)"""
        if not self.is_available():
            return False

        try:
            pattern = self._get_key("*", "*")
            keys = self.redis_client.keys(pattern)
            if keys:
                deleted_count = self.redis_client.delete(*keys)
                logger.info(f"Cleared all cache keys managed by CacheManager, deleted {deleted_count} keys")
            else:
                logger.info("No cache keys found to clear")
            return True
        except Exception as e:
            logger.error(f"Error clearing all cache: {e}")
            return False