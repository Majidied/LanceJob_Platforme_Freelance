#!/usr/bin/env python3
"""
Test frontend interaction tracking with authentication
"""

import requests
import json
from datetime import datetime

def test_with_auth():
    print("=== TESTING WITH AUTHENTICATION ===")
    
    backend_url = "http://localhost:3000"
    
    print("1. First, let's see what happens without auth (as before)...")
    
    # Test without auth
    interaction_data = {
        "freelancerId": "6847a80d79820088bdbfa5d1",
        "missionId": "684852c96c28354bc1d9975a",
        "interactionType": "view",
        "metadata": {
            "timestamp": datetime.now().isoformat(),
            "source": "test"
        }
    }
    
    try:
        response = requests.post(
            f"{backend_url}/api/recommendations/interactions",
            json=interaction_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Without auth: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n2. Testing login to get a token...")
    
    # Try to login to get a token
    login_data = {
        "email": "freelancer1@example.com",  # From sample data
        "password": "hashedpassword"
    }
    
    try:
        login_response = requests.post(
            f"{backend_url}/api/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            token = login_data.get('token')
            print(f"   ✓ Got token: {token[:20]}..." if token else "   ✗ No token in response")
            
            if token:
                print("\n3. Testing interaction tracking with auth token...")
                
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {token}"
                }
                
                response = requests.post(
                    f"{backend_url}/api/recommendations/interactions",
                    json=interaction_data,
                    headers=headers
                )
                print(f"   With auth: {response.status_code} - {response.text}")
                
                if response.status_code == 200:
                    print("   ✓ Interaction tracked successfully with auth!")
                else:
                    print("   ✗ Still failed even with auth")
        else:
            print(f"   Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"   Login error: {e}")
    
    print("\n4. Let's check what users exist in the database...")
    try:
        # Try to get users (if there's a public endpoint)
        response = requests.get(f"{backend_url}/api/health")
        print(f"   Health check: {response.status_code}")
        
    except Exception as e:
        print(f"   Error: {e}")

if __name__ == "__main__":
    test_with_auth()
