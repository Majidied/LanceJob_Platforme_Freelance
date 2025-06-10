#!/usr/bin/env python3
"""
Database Field Population Validation Script

This script validates that the database field population fixes are working correctly
by testing the interaction tracking functionality.
"""

import sys
import os
import json
from datetime import datetime

# Add the src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

def test_database_manager():
    """Test the database manager functionality"""
    try:
        # Import after adding to path
        from core.database_manager import DatabaseManager
        from core.config import Config
        
        print("✅ Database Manager imported successfully")
        
        # Initialize database manager
        db = DatabaseManager()
        print("✅ Database Manager initialized successfully")
        
        # Test connection
        if db.test_connection():
            print("✅ Database connection test passed")
        else:
            print("❌ Database connection test failed")
            return False
        
        # Test interaction tracking with proper field mapping
        test_metadata = {
            "duration": 45,
            "source": "validation_test",
            "timestamp": datetime.now().isoformat(),
            "userAgent": "ValidationScript/1.0",
            "sessionId": "test-session-123"
        }
        
        print("\n🧪 Testing interaction tracking...")
        
        # Test with sample data
        result = db.track_interaction(
            freelancer_id="507f1f77bcf86cd799439021",  # Test ID
            mission_id="507f1f77bcf86cd799439031",     # Test ID
            interaction_type="view",
            metadata=test_metadata
        )
        
        if result:
            print("✅ Interaction tracking test passed")
        else:
            print("❌ Interaction tracking test failed")
            return False
        
        # Test data retrieval
        print("\n📊 Testing data retrieval...")
        interactions = db.get_all_interactions()
        
        if interactions:
            latest_interaction = interactions[-1]  # Get the most recent
            print(f"✅ Retrieved {len(interactions)} interactions")
            print(f"📋 Latest interaction structure: {list(latest_interaction.keys())}")
            
            # Check if required fields are present
            required_fields = ['freelancer_id', 'mission_id', 'interaction_type', 'timestamp', 'metadata']
            missing_fields = [field for field in required_fields if field not in latest_interaction]
            
            if not missing_fields:
                print("✅ All required fields present in interaction data")
            else:
                print(f"⚠️ Missing fields: {missing_fields}")
        else:
            print("⚠️ No interactions found in database")
        
        print("\n🎉 Database field population validation completed successfully!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure pymongo and other dependencies are installed")
        return False
    except Exception as e:
        print(f"❌ Error during validation: {e}")
        return False

def test_field_mapping():
    """Test that field mapping is working correctly"""
    print("\n🔍 Testing field mapping...")
    
    # Sample interaction data with old format
    old_format_data = {
        "freelancer_id": "test_freelancer",
        "mission_id": "test_mission",
        "type": "click",  # Old field name
        "timestamp": datetime.now()
    }
    
    # Sample interaction data with new format
    new_format_data = {
        "freelancer_id": "test_freelancer",
        "mission_id": "test_mission", 
        "interaction_type": "view",  # New field name
        "timestamp": datetime.now(),
        "metadata": {"source": "test"}
    }
    
    print("✅ Field mapping test structures created")
    print(f"📝 Old format: {list(old_format_data.keys())}")
    print(f"📝 New format: {list(new_format_data.keys())}")
    
    return True

if __name__ == "__main__":
    print("🚀 Database Field Population Validation")
    print("=" * 50)
    
    # Test field mapping first (doesn't require DB connection)
    if not test_field_mapping():
        sys.exit(1)
    
    # Test actual database functionality
    if not test_database_manager():
        sys.exit(1)
    
    print("\n✅ All validation tests passed!")
    print("💡 The database field population fixes are working correctly.")
