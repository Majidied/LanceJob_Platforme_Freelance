#!/usr/bin/env python3
"""
Comprehensive debug for collaborative filtering
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.database_manager import DatabaseManager
from src.recommenders.collaborative_filtering_recommender import CollaborativeFilteringRecommender
from src.recommenders.hybrid_recommender import HybridRecommendationSystem
from src.core.config import Config

def test_collaborative_filtering():
    print("=== COMPREHENSIVE COLLABORATIVE FILTERING DEBUG ===")
    
    try:
        # Initialize components
        db_manager = DatabaseManager()
        cf_recommender = CollaborativeFilteringRecommender()
        
        # 1. Get interactions
        print(f"\n1. Loading interactions...")
        interactions = db_manager.get_all_interactions()
        print(f"   Total interactions: {len(interactions)}")
        
        if len(interactions) == 0:
            print("   ✗ No interactions found!")
            return
        
        # Sample interaction analysis
        print(f"\n2. Analyzing interaction structure...")
        sample = interactions[0]
        print(f"   Sample interaction structure: {sample}")
        print(f"   freelancer_id type: {type(sample.get('freelancer_id'))}")
        print(f"   mission_id type: {type(sample.get('mission_id'))}")
        
        # Count interactions per user
        user_counts = {}
        interaction_types = {}
        for interaction in interactions:
            user_id = interaction.get('freelancer_id')
            interaction_type = interaction.get('interaction_type')
            
            if user_id:
                user_counts[user_id] = user_counts.get(user_id, 0) + 1
            if interaction_type:
                interaction_types[interaction_type] = interaction_types.get(interaction_type, 0) + 1
        
        print(f"\n3. Interaction statistics...")
        print(f"   Min interactions for CF: {Config.MIN_INTERACTIONS_FOR_CF}")
        print(f"   Users with interactions: {len(user_counts)}")
        print(f"   Interaction types: {interaction_types}")
        
        valid_users = [user_id for user_id, count in user_counts.items() if count >= Config.MIN_INTERACTIONS_FOR_CF]
        print(f"   Users with >= {Config.MIN_INTERACTIONS_FOR_CF} interactions: {len(valid_users)}")
        print(f"   Valid user IDs: {valid_users[:5]}...")  # Show first 5
        
        # 4. Train collaborative filtering
        print(f"\n4. Training collaborative filtering...")
        success = cf_recommender.train(interactions)
        print(f"   Training successful: {success}")
        
        if success:
            stats = cf_recommender.get_model_stats()
            print(f"   Model stats: {stats}")
            
            # 5. Test with Mohammed Majidi
            user_id = "6847a80d79820088bdbfa5d1"
            print(f"\n5. Testing CF for user {user_id}...")
            
            if user_id in cf_recommender.user_mapping:
                print(f"   ✓ User found in CF model")
                
                # Get missions
                missions = db_manager.get_available_missions()
                candidate_items = [str(mission['_id']) for mission in missions]
                print(f"   Testing with {len(candidate_items)} candidate missions")
                
                # Test collaborative filtering
                cf_recommendations = cf_recommender.recommend_items(user_id, candidate_items, 10)
                print(f"   CF recommendations count: {len(cf_recommendations)}")
                
                if cf_recommendations:
                    print(f"   ✓ CF recommendations:")
                    for i, (item_id, score) in enumerate(cf_recommendations[:5]):
                        # Find mission title
                        mission_title = "Unknown"
                        for mission in missions:
                            if str(mission['_id']) == item_id:
                                mission_title = mission.get('title', 'Unknown')
                                break
                        print(f"     {i+1}. {mission_title[:50]}... Score: {score:.3f}")
                else:
                    print(f"   ✗ No CF recommendations generated")
                    
                    # Debug individual score prediction
                    print(f"   🔍 Testing individual score predictions...")
                    for mission_id in candidate_items[:3]:
                        score = cf_recommender.predict_user_item_score(user_id, mission_id)
                        print(f"     Mission {mission_id}: {score:.3f}")
                        
            else:
                print(f"   ✗ User {user_id} not found in CF model")
                print(f"   Available users in model: {list(cf_recommender.user_mapping.keys())[:10]}...")
            
            # 6. Test hybrid recommendations
            print(f"\n6. Testing hybrid recommendations...")
            hybrid_recommender = HybridRecommendationSystem()
            
            # Force reinitialize with our trained CF model
            hybrid_recommender.collaborative_recommender = cf_recommender
            
            hybrid_recs = hybrid_recommender.get_recommendations(user_id, limit=5)
            print(f"   Hybrid recommendations count: {len(hybrid_recs)}")
            
            if hybrid_recs:
                print(f"   ✓ Hybrid recommendations:")
                for i, rec in enumerate(hybrid_recs):
                    content_score = rec.get('content_score', 0)
                    collaborative_score = rec.get('collaborative_score', 0)
                    final_score = rec.get('recommendation_score', 0)
                    title = rec.get('title', 'Unknown')
                    print(f"     {i+1}. {title[:40]}...")
                    print(f"         Content: {content_score:.3f}, Collaborative: {collaborative_score:.3f}, Final: {final_score:.3f}")
        else:
            print(f"   ✗ Training failed")
            print(f"   Reason: Insufficient valid users or interactions")
    
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_collaborative_filtering()
