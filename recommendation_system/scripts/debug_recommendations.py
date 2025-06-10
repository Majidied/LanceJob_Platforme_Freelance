#!/usr/bin/env python3
"""
Debug the recommendation system step by step
"""

import sys
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId

# Add the parent directory (recommendation_system root) to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from src.core.database_manager import DatabaseManager
from src.recommenders.hybrid_recommender import HybridRecommendationSystem

load_dotenv()

def debug_recommendations():
    print("=== DEBUGGING RECOMMENDATION SYSTEM ===")
    
    # Test database manager
    db_manager = DatabaseManager()
    freelancer_id = "507f1f77bcf86cd799439052"
    
    print(f"\n1. Testing freelancer lookup for ID: {freelancer_id}")
    freelancer = db_manager.get_freelancer(freelancer_id)
    if freelancer:
        print(f"   ✓ Found freelancer: {freelancer.get('name', 'Unknown')}")
        print(f"   ✓ Skills: {freelancer.get('skills', [])}")
    else:
        print(f"   ✗ Freelancer not found!")
        return
    
    print(f"\n2. Testing available missions query")
    missions = db_manager.get_available_missions()
    print(f"   Available missions count: {len(missions)}")
    
    if len(missions) > 0:
        print("   Sample missions:")
        for i, mission in enumerate(missions[:3]):
            print(f"     {i+1}. {mission.get('title', 'Unknown')}")
            print(f"        Status: {mission.get('status', 'Unknown')}")
            print(f"        AssignedTo: {mission.get('assignedTo', 'Unknown')}")
            print(f"        Tags: {mission.get('tags', [])}")
    else:
        print("   ✗ No available missions found!")
        
        # Let's check what missions exist with different statuses
        print("\n   Checking all missions by status...")
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/lancejob_db')
        client = MongoClient(mongodb_uri)
        db = client.get_database()
        
        pipeline = [
            {"$group": {"_id": {"status": "$status", "assignedTo": "$assignedTo"}, "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        status_breakdown = list(db.missions.aggregate(pipeline))
        for item in status_breakdown:
            print(f"     Status: {item['_id']['status']}, AssignedTo: {item['_id']['assignedTo']}, Count: {item['count']}")
        
        client.close()
        return
    
    print(f"\n3. Testing content-based recommendations")
    recommender = HybridRecommendationSystem()
    
    try:
        recommendations = recommender.get_recommendations(
            freelancer_id=freelancer_id,
            limit=10,
            include_applied=False
        )
        print(f"   Recommendations count: {len(recommendations)}")
        
        if len(recommendations) > 0:
            print("   Sample recommendations:")
            for i, rec in enumerate(recommendations[:3]):
                print(f"     {i+1}. {rec.get('title', 'Unknown')} (Score: {rec.get('recommendation_score', 0):.3f})")
        else:
            print("   ✗ No recommendations generated!")
            
    except Exception as e:
        print(f"   ✗ Error generating recommendations: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_recommendations()
