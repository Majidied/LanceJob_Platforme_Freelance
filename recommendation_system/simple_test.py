#!/usr/bin/env python3
"""
Simple test to check database connections and data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.database_manager import DatabaseManager

def simple_test():
    print("=== SIMPLE DATABASE TEST ===")
    
    try:
        # Initialize database manager
        db_manager = DatabaseManager()
        print("✓ Database manager initialized")
        
        # Test database connection
        if db_manager.test_connection():
            print("✓ Database connection successful")
        else:
            print("✗ Database connection failed")
            return
        
        # Check collections
        print(f"\n=== CHECKING COLLECTIONS ===")
        
        # Count freelancers
        freelancer_count = db_manager.freelancers.count_documents({"role": "freelancer"})
        print(f"Freelancers: {freelancer_count}")
        
        # Count missions
        mission_count = db_manager.missions.count_documents({})
        print(f"Missions: {mission_count}")
        
        # Count interactions
        interaction_count = db_manager.interactions.count_documents({})
        print(f"Interactions: {interaction_count}")
        
        if interaction_count > 0:
            print(f"\n=== SAMPLE INTERACTIONS ===")
            sample_interactions = list(db_manager.interactions.find().limit(5))
            for i, interaction in enumerate(sample_interactions):
                print(f"{i+1}. {interaction}")
        
        print(f"\n=== CALLING get_all_interactions() ===")
        interactions = db_manager.get_all_interactions()
        print(f"Returned {len(interactions)} interactions")
        
        if interactions:
            print(f"Sample returned interaction: {interactions[0]}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    simple_test()
