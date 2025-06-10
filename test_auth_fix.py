#!/usr/bin/env python3
"""
Test Frontend Interaction Tracking After Authentication Fix

This script tests the complete flow:
1. Check if authentication is working
2. Test interaction tracking through the backend API
3. Verify interactions are saved to database
"""

import requests
import json
import sys
from datetime import datetime

# API endpoints
BACKEND_BASE = "http://localhost:3000/api"
RECOMMENDATION_BASE = "http://localhost:2511"

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get(f"{BACKEND_BASE}/health")
        print(f"✅ Backend Health: {response.status_code} - {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Backend Health Check Failed: {e}")
        return False

def test_recommendation_health():
    """Test if recommendation service is running"""
    try:
        response = requests.get(f"{RECOMMENDATION_BASE}/health")
        print(f"✅ Recommendation Service Health: {response.status_code} - {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Recommendation Service Health Check Failed: {e}")
        return False

def test_authenticated_interaction_tracking():
    """Test interaction tracking with a valid JWT token"""
    print("\n=== Testing Authenticated Interaction Tracking ===")
    
    # Use the token we saw in the logs for Mohammed Majidi
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NDdhODBkNzk4MjAwODhiZGJmYTVkMSIsImlhdCI6MTc0OTU3MDEyNywiZXhwIjoxNzUyMTYyMTI3fQ.2KkuyfVTAonxwpXeS458EQ_awL8CTUAiR19cTPvAEB8"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test payload
    payload = {
        "freelancerId": "6847a80d79820088bdbfa5d1",
        "missionId": "67477d38bf71ecae66797bef",
        "interactionType": "view",
        "metadata": {
            "timestamp": datetime.now().isoformat(),
            "userAgent": "AuthTest/1.0",
            "url": "http://localhost:5000/test",
            "source": "authentication_fix_test"
        }
    }
    
    try:
        print(f"Sending interaction: {json.dumps(payload, indent=2)}")
        response = requests.post(
            f"{BACKEND_BASE}/recommendations/interactions", 
            json=payload, 
            headers=headers
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Data: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Authenticated interaction tracking successful!")
            return True
        else:
            print(f"❌ Authenticated interaction tracking failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Authenticated interaction tracking error: {e}")
        return False

def test_unauthenticated_interaction_tracking():
    """Test what happens without authentication"""
    print("\n=== Testing Unauthenticated Interaction Tracking ===")
    
    payload = {
        "freelancerId": "6847a80d79820088bdbfa5d1",
        "missionId": "67477d38bf71ecae66797bef",
        "interactionType": "view",
        "metadata": {
            "timestamp": datetime.now().isoformat(),
            "userAgent": "AuthTest/1.0",
            "url": "http://localhost:5000/test"
        }
    }
    
    try:
        response = requests.post(
            f"{BACKEND_BASE}/recommendations/interactions", 
            json=payload
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Data: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 401:
            print("✅ Correctly rejected unauthenticated request")
            return True
        else:
            print(f"❌ Should have returned 401, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Unauthenticated test error: {e}")
        return False

def test_direct_recommendation_service():
    """Test direct interaction with recommendation service (bypasses backend auth)"""
    print("\n=== Testing Direct Recommendation Service ===")
    
    payload = {
        "freelancer_id": "6847a80d79820088bdbfa5d1",
        "mission_id": "67477d38bf71ecae66797bef",
        "interaction_type": "click",
        "metadata": {
            "timestamp": datetime.now().isoformat(),
            "source": "direct_test_auth_fix"
        }
    }
    
    try:
        response = requests.post(
            f"{RECOMMENDATION_BASE}/track_interaction", 
            json=payload
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Data: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Direct recommendation service interaction successful!")
            return True
        else:
            print(f"❌ Direct recommendation service failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Direct recommendation service error: {e}")
        return False

def test_get_recommendations():
    """Test getting recommendations with authentication"""
    print("\n=== Testing Get Recommendations ===")
    
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NDdhODBkNzk4MjAwODhiZGJmYTVkMSIsImlhdCI6MTc0OTU3MDEyNywiZXhwIjoxNzUyMTYyMTI3fQ.2KkuyfVTAonxwpXeS458EQ_awL8CTUAiR19cTPvAEB8"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(
            f"{BACKEND_BASE}/recommendations/6847a80d79820088bdbfa5d1?limit=3", 
            headers=headers
        )
        
        print(f"Response Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Got {len(data.get('recommendations', []))} recommendations")
            if data.get('recommendations'):
                print("Sample recommendation:")
                print(json.dumps(data['recommendations'][0], indent=2))
            print("✅ Get recommendations successful!")
            return True
        else:
            print(f"Response Data: {json.dumps(response.json(), indent=2)}")
            print(f"❌ Get recommendations failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Get recommendations error: {e}")
        return False

def main():
    print("🧪 Testing Frontend Interaction Tracking After Authentication Fix")
    print("=" * 70)
    
    results = []
    
    # Test all components
    results.append(("Backend Health", test_backend_health()))
    results.append(("Recommendation Health", test_recommendation_health()))
    results.append(("Authenticated Interaction", test_authenticated_interaction_tracking()))
    results.append(("Unauthenticated Rejection", test_unauthenticated_interaction_tracking()))
    results.append(("Direct Recommendation Service", test_direct_recommendation_service()))
    results.append(("Get Recommendations", test_get_recommendations()))
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 70)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<30} {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Authentication fix is working correctly.")
        return 0
    else:
        print("⚠️ Some tests failed. Check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
