/**
 * Debug Authentication Script
 * 
 * This script helps debug authentication issues in the frontend
 */

import { getToken, getUserData } from './utils/tokenStorage.js';
import api from './api/api.js';

console.log('=== Frontend Authentication Debug ===');

// Check if token exists in localStorage
const token = getToken();
console.log('Token exists:', !!token);
console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token');

// Check if user data exists
const userData = getUserData();
console.log('User data exists:', !!userData);
console.log('User data:', userData);

// Check what's actually in localStorage
console.log('\n=== localStorage contents ===');
console.log('All localStorage items:');
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value?.substring(0, 100));
}

// Test API call with current authentication
console.log('\n=== Testing API Authentication ===');
try {
    const response = await api.get('/recommendations/health');
    console.log('Health check successful:', response.data);
} catch (error) {
    console.error('Health check failed:', error.response?.status, error.response?.data);
}

// Test interaction tracking
if (userData && userData.id) {
    console.log('\n=== Testing Interaction Tracking ===');
    try {
        const testPayload = {
            freelancerId: userData.id,
            missionId: '67477d38bf71ecae66797bef', // Test mission ID
            interactionType: 'view',
            metadata: {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
            }
        };
        
        console.log('Sending interaction:', testPayload);
        const response = await api.post('/recommendations/interactions', testPayload);
        console.log('Interaction tracking successful:', response.data);
    } catch (error) {
        console.error('Interaction tracking failed:', error.response?.status, error.response?.data);
    }
}
