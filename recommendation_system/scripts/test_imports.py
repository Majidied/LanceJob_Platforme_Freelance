#!/usr/bin/env python3
"""
Test script to verify that scripts can import from src properly
"""

import os
import sys

# Add the parent directory (recommendation_system root) to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

def test_imports():
    """Test that all necessary imports work from scripts directory"""
    try:
        print("🧪 Testing imports from scripts directory...")
        
        # Test core imports
        from src.core.config import Config
        print("✅ Config import successful")
        
        from src.core.database_manager import DatabaseManager
        print("✅ DatabaseManager import successful")
        
        # Test API imports
        from src.api.batch_processor import BatchProcessor
        print("✅ BatchProcessor import successful")
        
        # Test recommender imports
        from src.recommenders.hybrid_recommender import HybridRecommendationSystem
        print("✅ HybridRecommendationSystem import successful")
        
        print("\n🎉 All imports working correctly from scripts directory!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_imports()
    sys.exit(0 if success else 1)
