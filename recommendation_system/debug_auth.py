#!/usr/bin/env python3
"""
Debug user authentication and localStorage
"""

import requests

def debug_user_auth():
    print("=== DEBUGGING USER AUTHENTICATION ===")
    
    backend_url = "http://localhost:3000"
    
    print("1. Let's check if there are any users in the system...")
    
    # Try different endpoints to see what's available
    endpoints_to_try = [
        "/api/users",
        "/api/auth/users", 
        "/api/freelancers",
        "/api/health"
    ]
    
    for endpoint in endpoints_to_try:
        try:
            response = requests.get(f"{backend_url}{endpoint}")
            print(f"   {endpoint}: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    print(f"     Found {len(data)} items")
                elif isinstance(data, dict):
                    print(f"     Response keys: {list(data.keys())}")
        except Exception as e:
            print(f"   {endpoint}: Error - {e}")
    
    print("\n2. The real issue: User ID 6847a80d79820088bdbfa5d1 should be Mohammed Majidi")
    print("   But the frontend might not be properly logged in as this user")
    print("   Or the token system isn't working properly")
    
    print("\n3. Potential solutions:")
    print("   A. Check if the user is actually logged in the frontend")
    print("   B. Check localStorage for token/user data")
    print("   C. Make interaction tracking work without strict auth (for anonymous tracking)")
    print("   D. Ensure the user exists and can login")
    
    print("\n4. Let's check the backend logs for more details...")
    print("   The interaction tracking should work even if the user auth is loose")
    print("   Since we're tracking anonymous behaviors too")

if __name__ == "__main__":
    debug_user_auth()
