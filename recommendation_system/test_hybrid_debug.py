#!/usr/bin/env python3
"""
Test hybrid recommender with debugging
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.database_manager import DatabaseManager
from src.recommenders.hybrid_recommender import HybridRecommendationSystem

def test_hybrid_with_debug():
    print("=== HYBRID RECOMMENDER DEBUG TEST ===")
    
    # Initialize hybrid recommender
    hybrid = HybridRecommendationSystem()
    
    print(f"\n1. Checking CF model status...")
    is_trained = hybrid.collaborative_recommender.is_trained()
    print(f"   CF model trained: {is_trained}")
    
    if is_trained:
        stats = hybrid.collaborative_recommender.get_model_stats()
        print(f"   CF stats: {stats}")
    
    # Test recommendations for our user
    user_id = "6847a80d79820088bdbfa5d1"
    print(f"\n2. Getting hybrid recommendations for {user_id}...")
    
    # Get recommendations with debugging
    try:
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
            
            # Also check what's in the mission object
            mission = rec.get('mission', {})
            print(f"      Mission ID: {mission.get('_id', 'N/A')}")
            
    except Exception as e:
        print(f"   Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_hybrid_with_debug()
