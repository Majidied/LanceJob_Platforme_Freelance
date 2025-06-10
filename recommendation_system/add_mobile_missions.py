#!/usr/bin/env python3
"""
Add mobile development missions for Mohammed Majidi (user ID: 6847a80d79820088bdbfa5d1)
"""

import sys
import os
from datetime import datetime, timedelta
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.database_manager import DatabaseManager

def add_mobile_missions():
    print("=== ADDING MOBILE DEVELOPMENT MISSIONS ===")
    
    db_manager = DatabaseManager()
    
    # Get a client ID for the missions
    try:
        sample_client = db_manager.freelancers.find_one({"role": "client"})
        if not sample_client:
            print("No client found, using default client ID")
            from bson import ObjectId
            client_id = ObjectId("6845d22ffeb2f7765790613c")  # Default client from the system
        else:
            client_id = sample_client['_id']
            print(f"Using client: {sample_client.get('name', 'Unknown')} ({client_id})")
    except Exception as e:
        print(f"Error getting client: {e}")
        from bson import ObjectId
        client_id = ObjectId("6845d22ffeb2f7765790613c")
    
    # Mobile development missions that match Mohammed Majidi's skills
    mobile_missions = [
        {
            "title": "iOS Mobile App for E-commerce Platform",
            "description": "We need an experienced iOS developer to build a modern e-commerce mobile app. The app should include user authentication, product catalog, shopping cart, payment integration, and order tracking. Experience with Swift and iOS SDK is required.",
            "budget": 3500,
            "deadline": datetime.now() + timedelta(days=45),
            "tags": ["Swift", "iOS Development", "Mobile Development", "Xcode", "Core Data"],
            "type": "fixe",
            "experience": "intermediaire",
            "client": client_id,
            "status": "published",
            "applications": []
        },
        {
            "title": "Cross-Platform Mobile App with React Native",
            "description": "Looking for a React Native developer to create a cross-platform social media app. Features include user profiles, real-time chat, photo sharing, and push notifications. Must have experience with React Native, Redux, and Firebase integration.",
            "budget": 4200,
            "deadline": datetime.now() + timedelta(days=60),
            "tags": ["React Native", "Mobile Development", "Firebase", "Redux", "JavaScript"],
            "type": "fixe", 
            "experience": "intermediaire",
            "client": client_id,
            "status": "published",
            "applications": []
        },
        {
            "title": "Flutter App for Food Delivery Service",
            "description": "We're seeking a Flutter developer to build a comprehensive food delivery app. The app needs user registration, restaurant listings, menu browsing, order placement, real-time tracking, and payment processing. Experience with Flutter, Dart, and REST APIs is essential.",
            "budget": 3800,
            "deadline": datetime.now() + timedelta(days=50),
            "tags": ["Flutter", "Dart", "Mobile Development", "REST API", "Firebase"],
            "type": "fixe",
            "experience": "intermediaire", 
            "client": client_id,
            "status": "published",
            "applications": []
        },
        {
            "title": "Android Fitness Tracking App Development",
            "description": "Need an Android developer to create a fitness tracking mobile application. Features include workout logging, progress tracking, social sharing, and integration with health APIs. Strong knowledge of Kotlin, Android SDK, and Material Design required.",
            "budget": 3200,
            "deadline": datetime.now() + timedelta(days=40),
            "tags": ["Kotlin", "Android Development", "Mobile Development", "Material Design", "Health APIs"],
            "type": "fixe",
            "experience": "intermediaire",
            "client": client_id,
            "status": "published", 
            "applications": []
        },
        {
            "title": "Mobile UI/UX Design for Travel App",
            "description": "We need a mobile UI/UX designer with Flutter development skills to design and implement a beautiful travel booking app. The project involves creating wireframes, mockups, and converting them to a working Flutter app with smooth animations.",
            "budget": 2800,
            "deadline": datetime.now() + timedelta(days=35),
            "tags": ["Flutter", "Mobile Development", "UI/UX", "Figma", "Design"],
            "type": "fixe",
            "experience": "intermediaire",
            "client": client_id,
            "status": "published",
            "applications": []
        }
    ]
    
    # Insert missions into database
    try:
        missions_collection = db_manager.missions
        result = missions_collection.insert_many(mobile_missions)
        print(f"✅ Successfully added {len(result.inserted_ids)} mobile development missions")
        
        # Print mission details
        for i, mission in enumerate(mobile_missions):
            print(f"\n{i+1}. {mission['title']}")
            print(f"   Budget: ${mission['budget']}")
            print(f"   Skills: {', '.join(mission['tags'])}")
            print(f"   Experience: {mission['experience']}")
            
    except Exception as e:
        print(f"❌ Error adding missions: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    add_mobile_missions()
