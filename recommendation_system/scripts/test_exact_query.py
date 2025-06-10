#!/usr/bin/env python3
import os
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/lancejob_db')
client = MongoClient(mongodb_uri)
db = client.get_database()

target_id = "507f1f77bcf86cd799439052"
oid = ObjectId(target_id)

print(f"Testing the exact query used in the database manager:")
print(f"Collection: {db.users}")
print(f"Query: {{'_id': ObjectId('{target_id}'), 'role': 'freelancer'}}")

result = db.users.find_one(
    {"_id": oid, "role": "freelancer"},
    {
        "name": 1,
        "skills": 1,
        "bio": 1,
        "title": 1,
        "rating": 1,
        "earned": 1,
        "success": 1,
        "history": 1,
        "appliedMissions": 1
    }
)

if result:
    print(f"✓ Found: {result}")
else:
    print("✗ Not found with exact query")
    
    # Let's check what's different
    print("\nTesting without role filter:")
    result2 = db.users.find_one({"_id": oid})
    if result2:
        print(f"✓ Found without role filter: Role = {result2.get('role')}")
    else:
        print("✗ Not found even without role filter")

client.close()
