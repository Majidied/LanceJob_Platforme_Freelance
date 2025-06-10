#!/usr/bin/env python3
"""
Debug collaborative score integration
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.database_manager import DatabaseManager
from src.recommenders.hybrid_recommender import HybridRecommendationSystem

def debug_collaborative_scores():
    print("=== DEBUGGING COLLABORATIVE SCORES ===")
    
    # Initialize and force train CF
    hybrid = HybridRecommendationSystem()
    if not hybrid.collaborative_recommender.is_trained():
        db_manager = DatabaseManager()
        interactions = db_manager.get_all_interactions()
        hybrid.collaborative_recommender.train(interactions)
    
    user_id = "6847a80d79820088bdbfa5d1"
    
    # Get available missions
    available_missions = hybrid.db_manager.get_available_missions()
    print(f"Available missions: {len(available_missions)}")
    
    # Test collaborative scores directly
    candidate_mission_ids = [str(mission['_id']) for mission in available_missions]
    print(f"Candidate mission IDs: {candidate_mission_ids}")
    
    collaborative_recommendations = hybrid.collaborative_recommender.recommend_items(
        user_id, candidate_mission_ids, 10
    )
    print(f"CF recommendations: {len(collaborative_recommendations)}")
    
    # Convert to dict like in hybrid recommender
    collaborative_scores = {mission_id: score for mission_id, score in collaborative_recommendations}
    print(f"Collaborative scores dict: {collaborative_scores}")
    
    # Get content recommendations
    freelancer = hybrid.db_manager.get_freelancer(user_id)
    content_recommendations = hybrid.content_recommender.recommend_missions(
        freelancer, available_missions, 10
    )
    print(f"Content recommendations: {len(content_recommendations)}")
    
    # Debug the combination process
    print(f"\n=== DEBUGGING COMBINATION ===")
    for i, content_rec in enumerate(content_recommendations[:3]):
        mission = content_rec['mission']
        mission_id = mission['_id']
        content_score = content_rec['score']
        
        print(f"{i+1}. Mission ID: {mission_id}")
        print(f"   Content score: {content_score}")
        
        # Check if mission_id is in collaborative_scores
        if mission_id in collaborative_scores:
            collaborative_score = collaborative_scores[mission_id]
            print(f"   ✓ Found CF score: {collaborative_score}")
        else:
            print(f"   ✗ No CF score found")
            print(f"   Available CF mission IDs: {list(collaborative_scores.keys())}")
            
            # Check if it's a string matching issue
            for cf_mission_id in collaborative_scores.keys():
                if str(cf_mission_id) == str(mission_id):
                    print(f"   String match found: {cf_mission_id}")

if __name__ == "__main__":
    debug_collaborative_scores()
