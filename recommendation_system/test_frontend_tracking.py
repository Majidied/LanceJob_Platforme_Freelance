#!/usr/bin/env python3
"""
Test frontend interaction tracking through proper API flow
"""

import requests
import json
from datetime import datetime

def test_frontend_interaction_tracking():
    print("=== TESTING FRONTEND INTERACTION TRACKING ===")
    
    # Backend and recommendation system URLs
    backend_url = "http://localhost:3000"
    recommendation_url = "http://localhost:2511"
    
    # Test data
    user_id = "6847a80d79820088bdbfa5d1"
    mission_id = "684852c96c28354bc1d9975a"
    
    print(f"\n1. Testing backend health...")
    try:
        response = requests.get(f"{backend_url}/api/health", timeout=5)
        print(f"   Backend status: {response.status_code}")
        if response.status_code == 200:
            print(f"   ✓ Backend is running")
        else:
            print(f"   ✗ Backend health check failed")
            return
    except Exception as e:
        print(f"   ✗ Backend not accessible: {e}")
        return
    
    print(f"\n2. Testing recommendation system health...")
    try:
        response = requests.get(f"{recommendation_url}/health", timeout=5)
        print(f"   Recommendation system status: {response.status_code}")
        if response.status_code == 200:
            print(f"   ✓ Recommendation system is running")
            print(f"   Response: {response.json()}")
        else:
            print(f"   ✗ Recommendation system health check failed")
    except Exception as e:
        print(f"   ✗ Recommendation system not accessible: {e}")
    
    print(f"\n3. Testing interaction tracking through backend...")
    
    # Simulate frontend interaction tracking
    interaction_data = {
        "freelancerId": user_id,
        "missionId": mission_id,
        "interactionType": "view",
        "metadata": {
            "timestamp": datetime.now().isoformat(),
            "userAgent": "test-agent",
            "url": "http://localhost:3001/test",
            "duration": 120,
            "source": "test"
        }
    }
    
    try:
        response = requests.post(
            f"{backend_url}/api/recommendations/interactions",
            json=interaction_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Backend interaction tracking status: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            print(f"   ✓ Interaction tracked successfully through backend")
        else:
            print(f"   ✗ Backend interaction tracking failed")
            
    except Exception as e:
        print(f"   ✗ Backend interaction tracking error: {e}")
    
    print(f"\n4. Testing direct recommendation system interaction...")
    
    # Test direct call to recommendation system
    direct_interaction_data = {
        "freelancer_id": user_id,
        "mission_id": mission_id,
        "interaction_type": "view",
        "metadata": {
            "timestamp": datetime.now().isoformat(),
            "source": "direct_test",
            "duration": 90
        }
    }
    
    try:
        response = requests.post(
            f"{recommendation_url}/interactions",
            json=direct_interaction_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Direct recommendation system status: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            print(f"   ✓ Direct interaction tracked successfully")
        else:
            print(f"   ✗ Direct interaction tracking failed")
            
    except Exception as e:
        print(f"   ✗ Direct interaction tracking error: {e}")
    
    print(f"\n5. Testing recommendations retrieval...")
    try:
        response = requests.get(f"{recommendation_url}/recommendations/{user_id}", timeout=10)
        print(f"   Recommendations status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Got {data.get('count', 0)} recommendations")
            if data.get('recommendations'):
                rec = data['recommendations'][0]
                print(f"   Sample: {rec.get('title', 'Unknown')[:50]}...")
                print(f"   Scores: content={rec.get('content_score', 0):.3f}, collab={rec.get('collaborative_score', 0):.3f}")
        else:
            print(f"   ✗ Failed to get recommendations: {response.text}")
            
    except Exception as e:
        print(f"   ✗ Recommendations retrieval error: {e}")

if __name__ == "__main__":
    test_frontend_interaction_tracking()
