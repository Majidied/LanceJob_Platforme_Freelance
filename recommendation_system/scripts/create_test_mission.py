#!/usr/bin/env python3
import os
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/lancejob_db')
client = MongoClient(mongodb_uri)
db = client.get_database()

# Create a test mission that matches our 3D artist's skills
test_mission = {
    "_id": ObjectId("507f1f77bcf86cd799439035"),
    "title": "3D Product Visualization for Furniture Catalog",
    "description": "We need high-quality 3D renders for our furniture catalog. Looking for an experienced 3D artist to create photorealistic visualizations of chairs, tables, and home decor items.",
    "budget": 2500,
    "deadline": "2024-12-28T00:00:00.000Z",
    "tags": ["3D Modeling", "Blender", "V-Ray", "Product Visualization", "Photorealistic Rendering", "3ds Max"],
    "client": ObjectId("507f1f77bcf86cd799439042"),  # Use existing client
    "status": "published",
    "type": "fixe",
    "experience": "expert",
    "applications": [],
    "assignedTo": "None",  # Use string "None" to match our data pattern
    "createdAt": "2024-12-15T00:00:00.000Z",
    "updatedAt": "2024-12-15T00:00:00.000Z",
    "attachments": [],
    "__v": 0
}

# Insert the test mission
try:
    result = db.missions.insert_one(test_mission)
    if result.inserted_id:
        print(f"✓ Created test mission: {test_mission['title']}")
        print(f"  Mission ID: {result.inserted_id}")
        print(f"  Tags: {test_mission['tags']}")
        print(f"  Status: {test_mission['status']}")
        print(f"  AssignedTo: {test_mission['assignedTo']}")
    else:
        print("✗ Failed to create test mission")
except Exception as e:
    print(f"Error creating test mission: {e}")

client.close()
