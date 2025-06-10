#!/usr/bin/env python3
"""
Fix collaborative filtering in hybrid recommender
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.database_manager import DatabaseManager
from src.recommenders.hybrid_recommender import HybridRecommendationSystem

def fix_and_test_cf():
    print("=== FIXING COLLABORATIVE FILTERING ===")
    
    # Initialize hybrid recommender
    hybrid = HybridRecommendationSystem()
    
    print(f"1. Initial CF status: {hybrid.collaborative_recommender.is_trained()}")
    
    # Force train CF if not trained
    if not hybrid.collaborative_recommender.is_trained():
        print("2. Force training CF...")
        db_manager = DatabaseManager()
        interactions = db_manager.get_all_interactions()
        success = hybrid.collaborative_recommender.train(interactions)
        print(f"   Training result: {success}")
        print(f"   CF now trained: {hybrid.collaborative_recommender.is_trained()}")
    
    # Test hybrid recommendations
    user_id = "6847a80d79820088bdbfa5d1"
    print(f"\n3. Getting hybrid recommendations for {user_id}...")
    
    recommendations = hybrid.get_recommendations(user_id, limit=3)
    print(f"   Got {len(recommendations)} recommendations")
    
    for i, rec in enumerate(recommendations):
        title = rec.get('mission', {}).get('title', 'Unknown')
        content_score = rec.get('content_score', 0)
        collaborative_score = rec.get('collaborative_score', 0)
        final_score = rec.get('score', 0)
        
        print(f"   {i+1}. {title[:40]}...")
        print(f"      Content: {content_score:.3f}")
        print(f"      Collaborative: {collaborative_score:.3f}")
        print(f"      Final: {final_score:.3f}")

if __name__ == "__main__":
    fix_and_test_cf()
