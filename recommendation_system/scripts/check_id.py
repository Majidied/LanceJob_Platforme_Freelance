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
print(f"Looking for freelancer with ID: {target_id}")

# Try different query formats
print("\n1. Try as string:")
result = db.users.find_one({"_id": target_id, "role": "freelancer"})
print(f"   Result: {result is not None}")

print("\n2. Try as ObjectId:")
try:
    oid = ObjectId(target_id)
    result = db.users.find_one({"_id": oid, "role": "freelancer"})
    print(f"   Result: {result is not None}")
    if result:
        print(f"   Name: {result.get('name', 'Unknown')}")
        print(f"   Skills: {result.get('skills', [])}")
except Exception as e:
    print(f"   Error: {e}")

print("\n3. Check what IDs actually exist:")
freelancers = list(db.users.find({"role": "freelancer"}, {"_id": 1, "name": 1}).limit(5))
print("   Available freelancer IDs:")
for f in freelancers:
    print(f"     ID: {f['_id']} (type: {type(f['_id'])}), Name: {f.get('name', 'Unknown')}")

print("\n4. Check if our target exists in any form:")
all_users = list(db.users.find({}, {"_id": 1, "name": 1, "role": 1}))
for user in all_users:
    if str(user['_id']) == target_id:
        print(f"   Found matching ID: {user['_id']}, Name: {user.get('name', 'Unknown')}, Role: {user.get('role', 'Unknown')}")

client.close()
