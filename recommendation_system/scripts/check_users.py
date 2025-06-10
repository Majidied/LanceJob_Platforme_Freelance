#!/usr/bin/env python3
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId

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

    print("\nSample freelancer users:")
    freelancers = list(db.users.find({"role": "freelancer"}, {"_id": 1, "name": 1, "email": 1}).limit(3))
    for freelancer in freelancers:
        print(f"  ID: {freelancer['_id']}, Name: {freelancer.get('name', 'Unknown')}")

    print("\nSample mission with skills check:")
    missions = list(db.missions.find({}, {"_id": 1, "title": 1, "tags": 1, "skills": 1, "status": 1}).limit(3))
    for mission in missions:
        print(f"  ID: {mission['_id']}")
        print(f"    Title: {mission.get('title', 'Unknown')}")
        print(f"    Status: {mission.get('status', 'Unknown')}")
        print(f"    Tags: {mission.get('tags', [])}")
        print(f"    Skills: {mission.get('skills', 'NOT FOUND')}")

    # Check the specific freelancer ID from the curl request
    print(f"\nChecking for freelancer ID: 507f1f77bcf86cd799439052")
    try:
        oid = ObjectId("507f1f77bcf86cd799439052")
        freelancer = db.users.find_one({"_id": oid, "role": "freelancer"})
        if freelancer:
            print(f"  Found as user: {freelancer.get('name', 'Unknown')}")
        else:
            print("  Not found in users collection")
    except Exception as e:
        print(f"  Error with ObjectId: {e}")

    client.close()

except Exception as e:
    print(f"Error: {e}")
