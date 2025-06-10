#!/bin/bash

# Enhanced Recommendations Testing Script
# Tests the complete recommendation system implementation

echo "🚀 TESTING ENHANCED RECOMMENDATIONS SYSTEM"
echo "=============================================="

# Test 1: Check if all services are running
echo ""
echo "📊 1. SERVICE STATUS CHECK"
echo "-------------------------"

echo "🔍 Checking Recommendation API (Python)..."
RECO_API=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:2511/health)
if [ "$RECO_API" = "200" ]; then
    echo "✅ Recommendation API: Running (Port 2511)"
else
    echo "❌ Recommendation API: Not accessible"
fi

echo "🔍 Checking Backend API (Node.js)..."
BACKEND_API=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/recommendations/health)
if [ "$BACKEND_API" = "401" ]; then
    echo "✅ Backend API: Running (Port 3000) - Auth required ✓"
else
    echo "❌ Backend API: Not accessible or wrong response"
fi

echo "🔍 Checking Frontend Dev Server..."
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001)
if [ "$FRONTEND" = "200" ]; then
    echo "✅ Frontend: Running (Port 5001)"
else
    echo "❌ Frontend: Not accessible"
fi

# Test 2: Check recommendation API functionality
echo ""
echo "🤖 2. RECOMMENDATION API TESTING"
echo "--------------------------------"

echo "Testing recommendation health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:2511/health)
echo "Health Response: $HEALTH_RESPONSE"

if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo "✅ Recommendation system is healthy"
else
    echo "❌ Recommendation system health check failed"
fi

# Test 3: Check file integrity
echo ""
echo "📁 3. IMPLEMENTATION FILES CHECK"
echo "-------------------------------"

# Check React Query Hook
if [ -f "/home/majidi/Documents/lancejob/frontend/src/hooks/useRecommendations.js" ]; then
    echo "✅ useRecommendations hook: Found"
    # Check for key functions
    if grep -q "trackMissionClick" "/home/majidi/Documents/lancejob/frontend/src/hooks/useRecommendations.js"; then
        echo "   ✓ Enhanced tracking methods present"
    fi
    if grep -q "getRecommendationInsights" "/home/majidi/Documents/lancejob/frontend/src/hooks/useRecommendations.js"; then
        echo "   ✓ Analytics insights implemented"
    fi
else
    echo "❌ useRecommendations hook: Missing"
fi

# Check Enhanced Home Page
if [ -f "/home/majidi/Documents/lancejob/frontend/src/views/freelancer/home/index.jsx" ]; then
    echo "✅ Enhanced home page: Found"
    # Check for key features
    if grep -q "InsightsPanel" "/home/majidi/Documents/lancejob/frontend/src/views/freelancer/home/index.jsx"; then
        echo "   ✓ Insights panel implemented"
    fi
    if grep -q "TrendingUp" "/home/majidi/Documents/lancejob/frontend/src/views/freelancer/home/index.jsx"; then
        echo "   ✓ Enhanced icons imported"
    fi
    if grep -q "Top Pick" "/home/majidi/Documents/lancejob/frontend/src/views/freelancer/home/index.jsx"; then
        echo "   ✓ Enhanced badges implemented"
    fi
else
    echo "❌ Enhanced home page: Missing"
fi

# Test 4: Component Architecture
echo ""
echo "🏗️  4. COMPONENT ARCHITECTURE"
echo "-----------------------------"

echo "Checking React Query integration..."
if grep -q "@tanstack/react-query" "/home/majidi/Documents/lancejob/frontend/src/hooks/useRecommendations.js"; then
    echo "✅ React Query: Properly integrated"
fi

echo "Checking Lucide React icons..."
if grep -q "lucide-react" "/home/majidi/Documents/lancejob/frontend/src/views/freelancer/home/index.jsx"; then
    echo "✅ Enhanced Icons: Properly imported"
fi

echo "Checking recommendations API service..."
if [ -f "/home/majidi/Documents/lancejob/frontend/src/api/recommendation.js" ]; then
    echo "✅ Recommendation API Service: Available"
fi

# Test 5: Feature Completeness
echo ""
echo "🎯 5. FEATURE COMPLETENESS CHECK"
echo "--------------------------------"

declare -a features=(
    "Smart Retry Logic:useQuery.*retry.*failureCount"
    "Exponential Backoff:retryDelay.*attemptIndex"
    "Enhanced Tracking:trackMissionClick.*useCallback"
    "Insights Analytics:getRecommendationInsights"
    "Visual Enhancements:Top Pick.*recommendationScore"
    "Smart Loading States:Analyzing your preferences"
    "Enhanced Empty States:Building Your Perfect Matches"
    "Refresh Functionality:RefreshCw.*animate-spin"
)

for feature in "${features[@]}"; do
    feature_name=$(echo "$feature" | cut -d: -f1)
    pattern=$(echo "$feature" | cut -d: -f2)
    
    if grep -q "$pattern" "/home/majidi/Documents/lancejob/frontend/src/hooks/useRecommendations.js" "/home/majidi/Documents/lancejob/frontend/src/views/freelancer/home/index.jsx" 2>/dev/null; then
        echo "✅ $feature_name: Implemented"
    else
        echo "⚠️  $feature_name: May need verification"
    fi
done

# Test 6: Documentation
echo ""
echo "📚 6. DOCUMENTATION CHECK"
echo "-------------------------"

if [ -f "/home/majidi/Documents/lancejob/frontend/RECOMMENDATIONS_IMPLEMENTATION.md" ]; then
    echo "✅ Implementation Documentation: Available"
fi

if [ -f "/home/majidi/Documents/lancejob/frontend/ENHANCED_RECOMMENDATIONS.md" ]; then
    echo "✅ Enhancement Documentation: Available"
fi

# Summary
echo ""
echo "🎉 TESTING COMPLETE!"
echo "===================="
echo ""
echo "🌐 Access the enhanced recommendations at:"
echo "   👉 http://localhost:5001"
echo ""
echo "🔍 To test manually:"
echo "   1. Navigate to the freelancer home page"
echo "   2. Click 'Best Matches 🤖' tab"
echo "   3. Observe the enhanced UI with insights panel"
echo "   4. Test the refresh functionality"
echo "   5. Check the enhanced loading and empty states"
echo ""
echo "📊 Features to verify:"
echo "   ✓ ML-powered recommendations in Best Matches tab"
echo "   ✓ Insights panel with analytics"
echo "   ✓ Enhanced visual indicators and badges"
echo "   ✓ Smart refresh with loading feedback"
echo "   ✓ Interaction tracking for ML learning"
echo "   ✓ Graceful fallbacks and error handling"
