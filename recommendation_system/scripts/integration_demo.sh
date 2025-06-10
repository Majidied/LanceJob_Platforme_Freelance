#!/bin/bash

# LanceJob Platform Integration Demo
# This script demonstrates the integration between the backend and recommendation system

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 LanceJob Platform Integration Demo${NC}"
echo "=================================================="

# Function to check if a service is running
check_service() {
    local port=$1
    local service_name=$2
    
    if curl -s http://localhost:$port/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name is running on port $port${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name is not running on port $port${NC}"
        return 1
    fi
}

# Function to start recommendation system
start_recommendation_system() {
    echo -e "${YELLOW}📡 Starting Recommendation System...${NC}"
    cd /home/majidi/Documents/lancejob/recommendation_system
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  Creating .env file from example...${NC}"
        cp .env.example .env
    fi
    
    # Start in background
    FLASK_ENV=development python3 main.py > logs/demo_startup.log 2>&1 &
    local pid=$!
    echo $pid > .demo_pid
    
    # Wait for startup
    echo -e "${YELLOW}⏳ Waiting for recommendation system to start...${NC}"
    sleep 5
    
    if check_service 2511 "Recommendation System"; then
        return 0
    else
        echo -e "${RED}❌ Failed to start recommendation system${NC}"
        echo "Check logs/demo_startup.log for details"
        return 1
    fi
}

# Function to test API endpoints
test_endpoints() {
    echo -e "${YELLOW}🧪 Testing API Endpoints...${NC}"
    echo "=================================================="
    
    # Test health endpoint
    echo -e "${YELLOW}Testing health endpoint...${NC}"
    response=$(curl -s http://localhost:2511/health)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Health check: $response${NC}"
    else
        echo -e "${RED}❌ Health check failed${NC}"
    fi
    
    # Test recommendation endpoint with sample data
    echo -e "${YELLOW}Testing recommendation endpoint...${NC}"
    cat > /tmp/test_request.json << EOF
{
    "user_id": "demo_user_123",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience_level": "Intermediate",
    "preferences": {
        "job_types": ["Full-time", "Remote"],
        "salary_range": [50000, 80000]
    }
}
EOF
    
    response=$(curl -s http://localhost:2511/recommendations/demo_user_123?limit=5)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Recommendation endpoint responded${NC}"
        echo "Response preview: $(echo $response | cut -c1-100)..."
    else
        echo -e "${RED}❌ Recommendation endpoint failed${NC}"
    fi
    
    # Test interaction tracking endpoint
    echo -e "${YELLOW}Testing interaction tracking endpoint...${NC}"
    response=$(curl -s -X POST http://localhost:2511/interactions \
        -H "Content-Type: application/json" \
        -d '{
            "freelancer_id": "demo_user_123",
            "mission_id": "demo_mission_456",
            "interaction_type": "view",
            "metadata": {"source": "integration_test"}
        }')
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Interaction tracking: $response${NC}"
    else
        echo -e "${RED}❌ Interaction tracking failed${NC}"
    fi
    
    # Test batch processing endpoint
    echo -e "${YELLOW}Testing batch processing endpoint...${NC}"
    response=$(curl -s -X POST http://localhost:2511/retrain)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Batch processing: $response${NC}"
    else
        echo -e "${RED}❌ Batch processing failed${NC}"
    fi
}

# Function to demonstrate backend integration
test_backend_integration() {
    echo -e "${YELLOW}🔗 Testing Backend Integration...${NC}"
    echo "=================================================="
    
    # Check if backend is running
    if check_service 5000 "Backend API"; then
        echo -e "${YELLOW}Testing backend recommendation route...${NC}"
        
        # Test backend recommendation endpoint that calls our service
        response=$(curl -s -X POST http://localhost:5000/api/recommendations \
            -H "Content-Type: application/json" \
            -d '{
                "user_id": "demo_user_123",
                "skills": ["JavaScript", "React"],
                "limit": 5
            }')
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Backend integration working${NC}"
            echo "Backend response preview: $(echo $response | cut -c1-100)..."
        else
            echo -e "${RED}❌ Backend integration failed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Backend not running. Start it with:${NC}"
        echo "cd /home/majidi/Documents/lancejob/backend && npm start"
    fi
}

# Function to show system status
show_system_status() {
    echo -e "${YELLOW}📊 System Status${NC}"
    echo "=================================================="
    
    echo -e "${YELLOW}Services:${NC}"
    check_service 2511 "Recommendation System" || true
    check_service 5000 "Backend API" || true
    check_service 3000 "Frontend" || true
    
    echo -e "\n${YELLOW}Configuration:${NC}"
    cd /home/majidi/Documents/lancejob/recommendation_system
    if [ -f ".env" ]; then
        echo "✅ Recommendation system .env file exists"
        echo "   - Flask Port: $(grep FLASK_PORT .env | cut -d= -f2)"
        echo "   - Environment: $(grep FLASK_ENV .env | cut -d= -f2)"
    else
        echo "❌ No .env file found"
    fi
    
    echo -e "\n${YELLOW}Recent Logs:${NC}"
    if [ -f "logs/demo_startup.log" ]; then
        echo "Last 5 lines from startup log:"
        tail -5 logs/demo_startup.log
    fi
}

# Function to cleanup
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    cd /home/majidi/Documents/lancejob/recommendation_system
    
    if [ -f ".demo_pid" ]; then
        local pid=$(cat .demo_pid)
        kill $pid 2>/dev/null || true
        rm .demo_pid
        echo -e "${GREEN}✅ Stopped recommendation system${NC}"
    fi
    
    rm -f /tmp/test_request.json
}

# Main execution
case "${1:-demo}" in
    "start")
        start_recommendation_system
        ;;
    "test")
        test_endpoints
        ;;
    "backend")
        test_backend_integration
        ;;
    "status")
        show_system_status
        ;;
    "stop")
        cleanup
        ;;
    "demo"|*)
        echo -e "${GREEN}Running full integration demo...${NC}"
        start_recommendation_system
        sleep 2
        test_endpoints
        test_backend_integration
        show_system_status
        echo -e "\n${YELLOW}Demo complete! Use './integration_demo.sh stop' to cleanup${NC}"
        echo -e "${YELLOW}Or './integration_demo.sh status' to check system status${NC}"
        ;;
esac
