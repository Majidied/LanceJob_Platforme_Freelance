import logging
from pymongo import MongoClient
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from config import Config

logger = logging.getLogger(__name__)

class DatabaseManager:
    """MongoDB database manager for recommendation system"""
    
    def __init__(self):
        try:
            self.client = MongoClient(Config.MONGODB_URI)
            self.db = self.client.lancejob
            
            # Test connection
            self.client.admin.command('ping')
            logger.info("MongoDB connection established successfully")
            
            # Collections
            self.freelancers = self.db.users
            self.missions = self.db.missions
            self.interactions = self.db.interactions
            
            # Create indexes for better performance
            self._create_indexes()
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    def _create_indexes(self):
        """Create database indexes for optimal performance"""
        try:
            # Interactions collection indexes
            self.interactions.create_index([("freelancer_id", 1), ("timestamp", -1)])
            self.interactions.create_index([("mission_id", 1)])
            self.interactions.create_index([("type", 1)])
            
            # Missions collection indexes
            self.missions.create_index([("status", 1)])
            self.missions.create_index([("tags", 1)])
            self.missions.create_index([("experience", 1)])
            self.missions.create_index([("type", 1)])
            
            logger.info("Database indexes created successfully")
        except Exception as e:
            logger.warning(f"Error creating indexes: {e}")
    
    def get_freelancer(self, freelancer_id: str) -> Optional[Dict]:
        """Get freelancer by ID"""
        try:
            freelancer = self.freelancers.find_one(
                {"_id": freelancer_id, "role": "freelancer"},
                {
                    "skills": 1,
                    "bio": 1,
                    "title": 1,
                    "rating": 1,
                    "earned": 1,
                    "success": 1,
                    "history": 1,
                    "appliedMissions": 1
                }
            )
            
            if freelancer:
                freelancer['_id'] = str(freelancer['_id'])
                return freelancer
            return None
        except Exception as e:
            logger.error(f"Error getting freelancer {freelancer_id}: {e}")
            return None
    
    def get_all_freelancers(self) -> List[Dict]:
        """Get all freelancers with their skills and preferences"""
        try:
            freelancers = list(self.freelancers.find(
                {"role": "freelancer"},
                {
                    "_id": 1,
                    "skills": 1,
                    "bio": 1,
                    "title": 1,
                    "rating": 1,
                    "earned": 1,
                    "success": 1,
                    "history": 1,
                    "appliedMissions": 1
                }
            ))
            
            # Convert ObjectId to string
            for freelancer in freelancers:
                freelancer['_id'] = str(freelancer['_id'])
            
            return freelancers
        except Exception as e:
            logger.error(f"Error getting all freelancers: {e}")
            return []
    
    def get_available_missions(self, exclude_applied: Optional[List[str]] = None) -> List[Dict]:
        """Get all available missions (not assigned, published status)"""
        try:
            # Build query
            query = {
                "status": "published",
                "assignedTo": None
            }
            
            # Exclude missions already applied to
            if exclude_applied:
                query["_id"] = {"$nin": exclude_applied}
            
            missions = list(self.missions.find(
                query,
                {
                    "_id": 1,
                    "title": 1,
                    "description": 1,
                    "tags": 1,
                    "budget": 1,
                    "deadline": 1,
                    "type": 1,
                    "experience": 1,
                    "client": 1,
                    "createdAt": 1,
                    "applications": 1
                }
            ))
            
            # Convert ObjectId to string
            for mission in missions:
                mission['_id'] = str(mission['_id'])
                if 'client' in mission:
                    mission['client'] = str(mission['client'])
            
            return missions
        except Exception as e:
            logger.error(f"Error getting available missions: {e}")
            return []
    
    def get_mission(self, mission_id: str) -> Optional[Dict]:
        """Get mission by ID"""
        try:
            mission = self.missions.find_one(
                {"_id": mission_id},
                {
                    "_id": 1,
                    "title": 1,
                    "description": 1,
                    "tags": 1,
                    "budget": 1,
                    "deadline": 1,
                    "type": 1,
                    "experience": 1,
                    "client": 1,
                    "createdAt": 1,
                    "applications": 1
                }
            )
            
            if mission:
                mission['_id'] = str(mission['_id'])
                if 'client' in mission:
                    mission['client'] = str(mission['client'])
                return mission
            return None
        except Exception as e:
            logger.error(f"Error getting mission {mission_id}: {e}")
            return None
    
    def get_user_interactions(self, freelancer_id: str, limit: int = 1000) -> List[Dict]:
        """Get user interactions for collaborative filtering"""
        try:
            interactions = list(self.interactions.find(
                {"freelancer_id": freelancer_id},
                {
                    "mission_id": 1,
                    "type": 1,
                    "timestamp": 1,
                    "duration": 1,
                    "score": 1
                }
            ).sort("timestamp", -1).limit(limit))
            
            # Convert ObjectId to string
            for interaction in interactions:
                interaction['_id'] = str(interaction['_id'])
            
            return interactions
        except Exception as e:
            logger.error(f"Error getting interactions for freelancer {freelancer_id}: {e}")
            return []
    
    def get_all_interactions(self) -> List[Dict]:
        """Get all user interactions for building collaborative filtering matrix"""
        try:
            interactions = list(self.interactions.find(
                {},
                {
                    "freelancer_id": 1,
                    "mission_id": 1,
                    "type": 1,
                    "timestamp": 1,
                    "score": 1
                }
            ))
            
            # Convert ObjectId to string
            for interaction in interactions:
                interaction['_id'] = str(interaction['_id'])
            
            return interactions
        except Exception as e:
            logger.error(f"Error getting all interactions: {e}")
            return []
    
    def save_interaction(self, interaction_data: Dict) -> bool:
        """Save user interaction to database"""
        try:
            # Add timestamp if not present
            if 'timestamp' not in interaction_data:
                interaction_data['timestamp'] = datetime.now()
            
            result = self.interactions.insert_one(interaction_data)
            
            if result.inserted_id:
                logger.info(f"Saved interaction: {interaction_data['type']} for freelancer {interaction_data['freelancer_id']}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error saving interaction: {e}")
            return False
    
    def get_mission_applications(self, mission_id: str) -> List[Dict]:
        """Get all applications for a specific mission"""
        try:
            mission = self.missions.find_one(
                {"_id": mission_id},
                {"applications": 1}
            )
            
            if mission and 'applications' in mission:
                return mission['applications']
            return []
        except Exception as e:
            logger.error(f"Error getting applications for mission {mission_id}: {e}")
            return []
    
    def get_freelancer_applications(self, freelancer_id: str) -> List[str]:
        """Get list of mission IDs that freelancer has applied to"""
        try:
            freelancer = self.freelancers.find_one(
                {"_id": freelancer_id},
                {"appliedMissions": 1}
            )
            
            if freelancer and 'appliedMissions' in freelancer:
                return [str(mission_id) for mission_id in freelancer['appliedMissions']]
            return []
        except Exception as e:
            logger.error(f"Error getting applications for freelancer {freelancer_id}: {e}")
            return []
    
    def get_popular_missions(self, limit: int = 50) -> List[Dict]:
        """Get popular missions based on application count"""
        try:
            pipeline = [
                {"$match": {"status": "published", "assignedTo": None}},
                {"$addFields": {"applicationCount": {"$size": {"$ifNull": ["$applications", []]}}}},
                {"$sort": {"applicationCount": -1, "createdAt": -1}},
                {"$limit": limit},
                {"$project": {
                    "_id": 1,
                    "title": 1,
                    "description": 1,
                    "tags": 1,
                    "budget": 1,
                    "deadline": 1,
                    "type": 1,
                    "experience": 1,
                    "client": 1,
                    "createdAt": 1,
                    "applicationCount": 1
                }}
            ]
            
            missions = list(self.missions.aggregate(pipeline))
            
            # Convert ObjectId to string
            for mission in missions:
                mission['_id'] = str(mission['_id'])
                if 'client' in mission:
                    mission['client'] = str(mission['client'])
            
            return missions
        except Exception as e:
            logger.error(f"Error getting popular missions: {e}")
            return []
    
    def get_recent_missions(self, days: int = 30, limit: int = 100) -> List[Dict]:
        """Get recently posted missions"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            
            missions = list(self.missions.find(
                {
                    "status": "published",
                    "assignedTo": None,
                    "createdAt": {"$gte": cutoff_date}
                },
                {
                    "_id": 1,
                    "title": 1,
                    "description": 1,
                    "tags": 1,
                    "budget": 1,
                    "deadline": 1,
                    "type": 1,
                    "experience": 1,
                    "client": 1,
                    "createdAt": 1,
                    "applications": 1
                }
            ).sort("createdAt", -1).limit(limit))
            
            # Convert ObjectId to string
            for mission in missions:
                mission['_id'] = str(mission['_id'])
                if 'client' in mission:
                    mission['client'] = str(mission['client'])
            
            return missions
        except Exception as e:
            logger.error(f"Error getting recent missions: {e}")
            return []
    
    def test_connection(self) -> bool:
        """Test database connectivity for health checks"""
        try:
            # Simple ping command to test connection
            self.client.admin.command('ping')
            return True
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False

    def close(self):
        """Close database connection"""
        try:
            self.client.close()
            logger.info("MongoDB connection closed")
        except Exception as e:
            logger.error(f"Error closing MongoDB connection: {e}")

    def get_collection_count(self, key: str) -> int:
        """Get the count of documents in a collection by key name"""
        try:
            if key == 'freelancers':
                return self.freelancers.count_documents({})
            elif key == 'missions':
                return self.missions.count_documents({})
            elif key == 'interactions':
                return self.interactions.count_documents({})
            else:
                logger.warning(f"Unknown collection key: {key}")
                return 0
        except Exception as e:
            logger.error(f"Error getting collection count for {key}: {e}")
            return 0
