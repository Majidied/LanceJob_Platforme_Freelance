#!/usr/bin/env python3
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/lancejob_db')
client = MongoClient(mongodb_uri)
db = client.get_database()

print("All missions with their details:")
missions = list(db.missions.find({}, {
    "_id": 1, 
    "title": 1, 
    "tags": 1, 
    "status": 1, 
    "assignedTo": 1,
    "description": 1
}))

for mission in missions:
    print(f"\nMission: {mission.get('title', 'Unknown')}")
    print(f"  ID: {mission['_id']}")
    print(f"  Status: {mission.get('status', 'Unknown')}")
    print(f"  AssignedTo: {mission.get('assignedTo', 'Unknown')}")
    print(f"  Tags: {mission.get('tags', [])}")
    print(f"  Description: {mission.get('description', 'No description')[:100]}...")

print(f"\nFreelancer skills: ['Blender', '3ds Max', 'AutoCAD', 'SketchUp', 'Photoshop', 'V-Ray', 'Architectural Design']")

client.close()
