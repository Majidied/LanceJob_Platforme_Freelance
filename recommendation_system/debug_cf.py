#!/usr/bin/env python3
"""
Debug collaborative filtering issues
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.database_manager import DatabaseManager
from src.recommenders.collaborative_filtering_recommender import CollaborativeFilteringRecommender
from src.core.config import Config

def debug_collaborative_filtering():
    print("=== DEBUGGING COLLABORATIVE FILTERING ===")
    
    # Initialize components
    db_manager = DatabaseManager()
    cf_recommender = CollaborativeFilteringRecommender()
    
    # 1. Check interactions in database
    print(f"\n1. Checking interactions in database...")
    interactions = db_manager.get_all_interactions()
    print(f"   Total interactions: {len(interactions)}")
    
    if len(interactions) == 0:
        print("   ✗ No interactions found!")
        return
    
    # Print sample interactions
    print(f"   Sample interactions:")
    for i, interaction in enumerate(interactions[:5]):
        print(f"     {i+1}. Freelancer: {interaction.get('freelancer_id')}, Mission: {interaction.get('mission_id')}, Type: {interaction.get('interaction_type')}")
    
    # Check interaction types
    interaction_types = {}
    for interaction in interactions:
        itype = interaction.get('interaction_type', 'unknown')
        interaction_types[itype] = interaction_types.get(itype, 0) + 1
    print(f"   Interaction types: {interaction_types}")
    
    # 2. Check collaborative filtering configuration
    print(f"\n2. Checking CF configuration...")
    print(f"   MIN_INTERACTIONS_FOR_CF: {Config.MIN_INTERACTIONS_FOR_CF}")
    print(f"   COLLABORATIVE_WEIGHT: {Config.COLLABORATIVE_WEIGHT}")
    
    # 3. Try training collaborative filtering
    print(f"\n3. Training collaborative filtering model...")
    success = cf_recommender.train(interactions)
    print(f"   Training successful: {success}")
    
    if success:
        stats = cf_recommender.get_model_stats()
        print(f"   Model stats: {stats}")
        
        # 4. Test collaborative filtering for our user
        user_id = "6847a80d79820088bdbfa5d1"
        print(f"\n4. Testing CF for user {user_id}...")
        
        # Check if user is in the mapping
        if user_id in cf_recommender.user_mapping:
            print(f"   ✓ User found in collaborative model")
            user_idx = cf_recommender.user_mapping[user_id]
            print(f"   User index: {user_idx}")
            
            # Get available missions
            missions = db_manager.get_available_missions()
            candidate_items = [str(mission['_id']) for mission in missions]
            print(f"   Testing with {len(candidate_items)} missions")
            
            # Get collaborative recommendations
            cf_recommendations = cf_recommender.recommend_items(user_id, candidate_items, 10)
            print(f"   CF recommendations: {len(cf_recommendations)}")
            
            if cf_recommendations:
                print(f"   Sample CF scores:")
                for item_id, score in cf_recommendations[:3]:
                    print(f"     Mission {item_id}: {score:.3f}")
            else:
                print(f"   ✗ No CF recommendations generated")
                
                # Try predicting scores manually
                print(f"   Testing manual score prediction...")
                for mission_id in candidate_items[:3]:
                    score = cf_recommender.predict_user_item_score(user_id, mission_id)
                    print(f"     Mission {mission_id}: {score:.3f}")
        else:
            print(f"   ✗ User not found in collaborative model")
            print(f"   Available users: {list(cf_recommender.user_mapping.keys())}")
    else:
        print(f"   ✗ Training failed")
        
        # Check why training failed
        print(f"\n   Analyzing why training failed...")
        
        # Count interactions per user
        user_interaction_counts = {}
        for interaction in interactions:
            user_id = str(interaction.get('freelancer_id', ''))
            if user_id:
                user_interaction_counts[user_id] = user_interaction_counts.get(user_id, 0) + 1
        
        print(f"   User interaction counts: {user_interaction_counts}")
        
        # Find users with enough interactions
        min_interactions = Config.MIN_INTERACTIONS_FOR_CF
        valid_users = [user_id for user_id, count in user_interaction_counts.items() if count >= min_interactions]
        print(f"   Users with >= {min_interactions} interactions: {valid_users}")

if __name__ == "__main__":
    debug_collaborative_filtering()
