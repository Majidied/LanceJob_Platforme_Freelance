#!/usr/bin/env python3
"""
Debug script for user ID: 6847a80d79820088bdbfa5d1
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.database_manager import DatabaseManager
from src.recommenders.hybrid_recommender import HybridRecommendationSystem
from src.recommenders.content_based_recommender import ContentBasedRecommender
from src.core.config import Config

def debug_user(user_id):
    print(f"=== DEBUGGING USER: {user_id} ===")
    
    # Initialize components
    db_manager = DatabaseManager()
    recommender = HybridRecommendationSystem()
    
    # 1. Check if user exists in database
    print(f"\n1. Checking if user exists in database...")
    freelancer = db_manager.get_freelancer(user_id)
    if freelancer:
        print(f"   ✓ Found freelancer: {freelancer.get('name', 'Unknown')}")
        print(f"   ✓ Skills: {freelancer.get('skills', [])}")
        print(f"   ✓ Bio: {freelancer.get('bio', 'No bio')[:100]}...")
        print(f"   ✓ Role: {freelancer.get('role', 'Unknown')}")
    else:
        print(f"   ✗ User not found in database!")
        print(f"   ℹ Checking if user exists with different role...")
        
        # Try to find user without role filter
        try:
            from bson import ObjectId
            query_id = ObjectId(user_id)
        except Exception:
            query_id = user_id
            
        any_user = db_manager.freelancers.find_one({"_id": query_id})
        if any_user:
            print(f"   ⚠ Found user but with role: {any_user.get('role', 'Unknown')}")
            print(f"   ⚠ User data: {any_user}")
        else:
            print(f"   ✗ User doesn't exist at all in the database")
        return
    
    # 2. Check available missions
    print(f"\n2. Checking available missions...")
    missions = db_manager.get_available_missions()
    print(f"   Available missions count: {len(missions)}")
    
    if len(missions) == 0:
        print(f"   ✗ No missions available!")
        return
    else:
        print(f"   ✓ Sample missions:")
        for i, mission in enumerate(missions[:3]):
            print(f"     {i+1}. {mission.get('title', 'Unknown')} (Budget: {mission.get('budget', 'N/A')})")
    
    # 3. Check applied missions
    print(f"\n3. Checking applied missions...")
    applied_missions = db_manager.get_freelancer_applications(user_id)
    print(f"   Applied missions count: {len(applied_missions) if applied_missions else 0}")
    if applied_missions:
        print(f"   Applied mission IDs: {applied_missions}")
    
    # 4. Try to get recommendations
    print(f"\n4. Trying to get recommendations...")
    print(f"   MIN_SKILL_MATCH_THRESHOLD: {Config.MIN_SKILL_MATCH_THRESHOLD}")
    
    # Test content-based recommender directly
    content_recommender = ContentBasedRecommender()
    
    print(f"\n   4a. Testing content-based recommendations directly...")
    try:
        content_recommendations = content_recommender.recommend_missions(
            freelancer, missions, limit=10
        )
        print(f"   Content-based recommendations count: {len(content_recommendations)}")
        
        if len(content_recommendations) > 0:
            print(f"   ✓ Content-based recommendations:")
            for i, rec in enumerate(content_recommendations[:3]):
                mission_title = rec.get('title', 'Unknown')
                score = rec.get('recommendation_score', 0)
                print(f"     {i+1}. {mission_title} (Score: {score:.3f})")
        else:
            print(f"   ✗ No content-based recommendations!")
            
            # Check skill matching for each mission
            print(f"\n   4b. Checking skill matching for each mission...")
            freelancer_skills = freelancer.get('skills', [])
            print(f"   Freelancer skills: {freelancer_skills}")
            
            for i, mission in enumerate(missions):
                mission_tags = mission.get('tags', [])
                skill_similarity = content_recommender.calculate_skill_similarity(freelancer_skills, mission_tags)
                print(f"     Mission {i+1}: {mission.get('title', 'Unknown')}")
                print(f"     Required skills: {mission_tags}")
                print(f"     Skill similarity: {skill_similarity:.3f} (threshold: {Config.MIN_SKILL_MATCH_THRESHOLD})")
                if skill_similarity < Config.MIN_SKILL_MATCH_THRESHOLD:
                    print(f"     ❌ Below threshold - filtered out")
                else:
                    print(f"     ✅ Above threshold - should be included")
                print()
                
    except Exception as e:
        print(f"   ✗ Error in content-based recommendations: {e}")
        import traceback
        print(f"   Traceback: {traceback.format_exc()}")
    
    print(f"\n   4c. Testing hybrid recommendations...")
    try:
        recommendations = recommender.get_recommendations(
            freelancer_id=user_id,
            limit=10,
            include_applied=False
        )
        print(f"   Recommendations count: {len(recommendations)}")
        
        if len(recommendations) > 0:
            print(f"   ✓ Sample recommendations:")
            for i, rec in enumerate(recommendations[:3]):
                mission_title = rec.get('title', 'Unknown')
                score = rec.get('recommendation_score', 0)
                print(f"     {i+1}. {mission_title} (Score: {score:.3f})")
        else:
            print(f"   ✗ No recommendations generated!")
            
            # Try with include_applied=True
            print(f"   🔄 Trying with include_applied=True...")
            recommendations_with_applied = recommender.get_recommendations(
                freelancer_id=user_id,
                limit=10,
                include_applied=True
            )
            print(f"   Recommendations with applied count: {len(recommendations_with_applied)}")
            
    except Exception as e:
        print(f"   ✗ Error generating recommendations: {e}")
        import traceback
        print(f"   Traceback: {traceback.format_exc()}")
    
    # 5. Check interactions
    print(f"\n5. Checking user interactions...")
    try:
        interactions = db_manager.get_freelancer_interactions(user_id)
        print(f"   Interaction count: {len(interactions) if interactions else 0}")
        if interactions:
            interaction_types = {}
            for interaction in interactions:
                itype = interaction.get('interaction_type', 'unknown')
                interaction_types[itype] = interaction_types.get(itype, 0) + 1
            print(f"   Interaction breakdown: {interaction_types}")
    except Exception as e:
        print(f"   ✗ Error getting interactions: {e}")

if __name__ == "__main__":
    user_id = "6847a80d79820088bdbfa5d1"
    debug_user(user_id)
