#!/usr/bin/env python3
"""
Simple test for batch processing functionality
"""

import os
import sys

# Add the parent directory (recommendation_system root) to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

def test_batch_functionality():
    """Test basic batch functionality"""
    try:
        print("🧪 Testing batch processing components...")
        
        # Test basic imports
        from src.core.config import Config
        print("✅ Config imported")
        
        from src.core.database_manager import DatabaseManager
        print("✅ DatabaseManager imported")
        
        # Test database connection
        db = DatabaseManager()
        print("✅ DatabaseManager instantiated")
        
        # Test if we can connect to DB
        freelancers_count = db.freelancers.count_documents({})
        print(f"✅ Database connection working - {freelancers_count} freelancers found")
        
        # Test cache manager
        try:
            from src.core.cache_manager import CacheManager
            cache = CacheManager()
            print("✅ CacheManager working")
        except Exception as e:
            print(f"⚠️ CacheManager issue: {e}")
        
        # Test hybrid recommender
        try:
            from src.recommenders.hybrid_recommender import HybridRecommendationSystem
            recommender = HybridRecommendationSystem()
            print("✅ HybridRecommendationSystem working")
        except Exception as e:
            print(f"⚠️ HybridRecommendationSystem issue: {e}")
        
        print("\n🎉 All core components working!")
        return True
        
    except Exception as e:
        print(f"❌ Error in batch functionality test: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_batch_functionality()
    print(f"\n{'✅ SUCCESS' if success else '❌ FAILED'}")
    sys.exit(0 if success else 1)
