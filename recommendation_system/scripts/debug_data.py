#!/usr/bin/env python3
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
import json

load_dotenv()

try:
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/lancejob_db')
    print(f"Connecting to: {mongodb_uri}")
    client = MongoClient(mongodb_uri)
    db = client.get_database()

    print("USERS by role:")
    pipeline = [
        {"$group": {"_id": "$role", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    role_counts = list(db.users.aggregate(pipeline))
    for role in role_counts:
        print(f"  {role['_id']}: {role['count']}")

    print("\nFirst freelancer user:")
    freelancer = db.users.find_one({"role": "freelancer"})
    if freelancer:
        freelancer['_id'] = str(freelancer['_id'])  # Convert ObjectId to string for printing
        print(json.dumps(freelancer, indent=2, default=str))
    else:
        print("  No freelancers found")

    print(f"\nChecking specific freelancer: 507f1f77bcf86cd799439052")
    try:
        oid = ObjectId("507f1f77bcf86cd799439052")
        specific_freelancer = db.users.find_one({"_id": oid})
        if specific_freelancer:
            print(f"  Found: {specific_freelancer.get('name', 'Unknown')}")
            print(f"  Role: {specific_freelancer.get('role', 'Unknown')}")
            print(f"  Skills: {specific_freelancer.get('skills', 'NOT FOUND')}")
        else:
            print("  Not found")
    except Exception as e:
        print(f"  Error: {e}")

    print("\nFirst mission:")
    mission = db.missions.find_one()
    if mission:
        mission['_id'] = str(mission['_id'])
        if 'client' in mission:
            mission['client'] = str(mission['client'])
        if 'assignedTo' in mission:
            mission['assignedTo'] = str(mission['assignedTo'])
        print(json.dumps(mission, indent=2, default=str))

    client.close()

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
