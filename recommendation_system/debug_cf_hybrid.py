#!/usr/bin/env python3
"""
Debug CF initialization in hybrid recommender
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.database_manager import DatabaseManager
from src.recommenders.collaborative_filtering_recommender import CollaborativeFilteringRecommender
from src.recommenders.hybrid_recommender import HybridRecommendationSystem

def debug_cf_initialization():
    print("=== CF INITIALIZATION DEBUG ===")
    
    # Test standalone CF
    print(f"\n1. Testing standalone CF...")
    cf_standalone = CollaborativeFilteringRecommender()
    db_manager = DatabaseManager()
    interactions = db_manager.get_all_interactions()
    
    print(f"   Interactions loaded: {len(interactions)}")
    success = cf_standalone.train(interactions)
    print(f"   Standalone CF training: {success}")
    
    # Test CF in hybrid recommender
    print(f"\n2. Testing CF in hybrid recommender...")
    hybrid = HybridRecommendationSystem()
    
    # Check the CF model
    cf_in_hybrid = hybrid.collaborative_recommender
    print(f"   CF in hybrid trained: {cf_in_hybrid.is_trained()}")
    
    if not cf_in_hybrid.is_trained():
        print(f"   Manually training CF in hybrid...")
        manual_success = cf_in_hybrid.train(interactions)
        print(f"   Manual training result: {manual_success}")
        print(f"   CF now trained: {cf_in_hybrid.is_trained()}")
        
        if manual_success:
            # Test recommendations
            user_id = "6847a80d79820088bdbfa5d1"
            missions = db_manager.get_available_missions()
            candidate_items = [str(mission['_id']) for mission in missions]
            
            cf_recs = cf_in_hybrid.recommend_items(user_id, candidate_items, 3)
            print(f"   CF recommendations: {len(cf_recs)}")
            for item_id, score in cf_recs:
                print(f"     {item_id}: {score:.3f}")

if __name__ == "__main__":
    debug_cf_initialization()
