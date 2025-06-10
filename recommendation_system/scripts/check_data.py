#!/usr/bin/env python3
"""
Database Data Checker for LanceJob Recommendation System
This script checks what data exists in the database.
"""

import sys
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_database_data():
    """Check what data exists in the database."""
    
    # Connect to MongoDB
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/lancejob_db')
    print(f"Connecting to: {mongodb_uri}")
    
    try:
        client = MongoClient(mongodb_uri)
        db = client.get_database()
        
        # Get database name
        db_name = db.name
        print(f"Database name: {db_name}")
        
        # List all collections
        collections = db.list_collection_names()
        print(f"\nAvailable collections: {collections}")
        
        # Check each relevant collection
        for collection_name in ['freelancers', 'missions', 'interactions', 'users']:
            if collection_name in collections:
                collection = db[collection_name]
                count = collection.count_documents({})
                print(f"\n{collection_name.upper()}:")
                print(f"  Total documents: {count}")
                
                if count > 0:
                    # Show sample document
                    sample = collection.find_one()
                    print(f"  Sample document keys: {list(sample.keys()) if sample else 'None'}")
                    
                    if collection_name == 'freelancers':
                        # Check specific freelancer
                        freelancer = collection.find_one({"_id": "507f1f77bcf86cd799439052"})
                        if freelancer:
                            print(f"  Found target freelancer: {freelancer.get('firstName', 'Unknown')} {freelancer.get('lastName', 'Unknown')}")
                            print(f"  Skills: {freelancer.get('skills', [])}")
                        else:
                            print(f"  Target freelancer (507f1f77bcf86cd799439052) NOT FOUND")
                            # Show a few freelancer IDs
                            sample_freelancers = list(collection.find({}, {"_id": 1, "firstName": 1, "lastName": 1}).limit(5))
                            print(f"  Available freelancer IDs: {[str(f['_id']) for f in sample_freelancers]}")
                    
                    elif collection_name == 'missions':
                        # Show mission status breakdown
                        pipeline = [
                            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
                            {"$sort": {"count": -1}}
                        ]
                        status_counts = list(collection.aggregate(pipeline))
                        print(f"  Mission status breakdown: {status_counts}")
                        
                        # Check if missions have required fields
                        sample_mission = collection.find_one()
                        if sample_mission:
                            required_fields = ['title', 'description', 'skills', 'budget', 'status']
                            missing_fields = [f for f in required_fields if f not in sample_mission]
                            if missing_fields:
                                print(f"  WARNING: Missing fields in missions: {missing_fields}")
                            else:
                                print(f"  ✓ All required fields present in missions")
                
            else:
                print(f"\n{collection_name.upper()}: Collection does not exist")
        
        # Check if database has proper indexes
        print(f"\nINDEXES:")
        for collection_name in ['freelancers', 'missions', 'interactions']:
            if collection_name in collections:
                collection = db[collection_name]
                indexes = list(collection.list_indexes())
                print(f"  {collection_name}: {len(indexes)} indexes")
        
        client.close()
        
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return False
    
    return True

def check_recommendation_prerequisites():
    """Check if all prerequisites for recommendations are met."""
    print("\n" + "="*50)
    print("RECOMMENDATION PREREQUISITES CHECK")
    print("="*50)
    
    # Connect to MongoDB
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/lancejob_db')
    
    try:
        client = MongoClient(mongodb_uri)
        db = client.get_database()
        
        # Check freelancers
        freelancers_count = db.freelancers.count_documents({})
        missions_count = db.missions.count_documents({"status": {"$in": ["open", "active"]}})
        interactions_count = db.interactions.count_documents({}) if 'interactions' in db.list_collection_names() else 0
        
        print(f"✓ Freelancers in database: {freelancers_count}")
        print(f"✓ Active missions: {missions_count}")
        print(f"✓ User interactions: {interactions_count}")
        
        # Check target freelancer
        target_freelancer = db.freelancers.find_one({"_id": "507f1f77bcf86cd799439052"})
        if target_freelancer:
            print(f"✓ Target freelancer found: {target_freelancer.get('firstName', 'Unknown')}")
            skills = target_freelancer.get('skills', [])
            print(f"  - Skills: {skills}")
            print(f"  - Skill count: {len(skills)}")
        else:
            print(f"✗ Target freelancer (507f1f77bcf86cd799439052) NOT FOUND")
            print("  Available freelancer IDs:")
            for freelancer in db.freelancers.find({}, {"_id": 1, "firstName": 1}).limit(5):
                print(f"    - {freelancer['_id']}")
        
        # Check if missions have skills
        missions_with_skills = db.missions.count_documents({"skills": {"$exists": True, "$ne": []}})
        print(f"✓ Missions with skills: {missions_with_skills}/{missions_count}")
        
        # Recommendations need at least:
        recommendations_possible = (
            freelancers_count > 0 and 
            missions_count > 0 and 
            target_freelancer is not None
        )
        
        print(f"\n{'✓' if recommendations_possible else '✗'} Recommendations possible: {recommendations_possible}")
        
        if not recommendations_possible:
            print("\nPOSSIBLE ISSUES:")
            if freelancers_count == 0:
                print("  - No freelancers in database")
            if missions_count == 0:
                print("  - No active missions in database")
            if not target_freelancer:
                print("  - Target freelancer ID not found")
        
        client.close()
        
    except Exception as e:
        print(f"Error checking prerequisites: {e}")

if __name__ == "__main__":
    print("LanceJob Database Data Checker")
    print("=" * 50)
    
    if check_database_data():
        check_recommendation_prerequisites()
    else:
        print("Failed to connect to database")
        sys.exit(1)