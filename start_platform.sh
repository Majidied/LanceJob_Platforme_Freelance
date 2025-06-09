#!/bin/bash

# LanceJob Platform - Complete System Startup Script
# This script starts all components of the LanceJob platform

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="/home/majidi/Documents/lancejob/backend"
FRONTEND_DIR="/home/majidi/Documents/lancejob/frontend"
RECOMMENDATION_DIR="/home/majidi/Documents/lancejob/recommendation_system"

echo -e "${GREEN}🚀 Starting LanceJob Platform${NC}"
echo "=========================================="

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    else
        return 0
    fi
}

# Function to start a service in the background
start_service() {
    local service_name=$1
    local command=$2
    local directory=$3
    local port=$4
    
    echo -e "${BLUE}🔄 Starting $service_name...${NC}"
    
    if [ -n "$port" ] && ! check_port $port; then
        echo -e "${RED}❌ Cannot start $service_name - port $port is in use${NC}"
        return 1
    fi
    
    cd "$directory" || { echo -e "${RED}❌ Directory $directory not found${NC}"; return 1; }
    
    # Start the service in the background
    eval "$command" &
    local pid=$!
    
    # Store the PID for later cleanup
    echo $pid >> /tmp/lancejob_pids.txt
    
    echo -e "${GREEN}✅ $service_name started (PID: $pid)${NC}"
    return 0
}

# Function to check if required services are running
check_dependencies() {
    echo -e "${BLUE}🔍 Checking dependencies...${NC}"
    
    # Check MongoDB
    if ! pgrep mongod > /dev/null; then
        echo -e "${YELLOW}⚠️  MongoDB is not running. Please start MongoDB first.${NC}"
        echo -e "${YELLOW}    sudo systemctl start mongod${NC}"
        return 1
    else
        echo -e "${GREEN}✅ MongoDB is running${NC}"
    fi
    
    # Check Redis
    if ! pgrep redis-server > /dev/null; then
        echo -e "${YELLOW}⚠️  Redis is not running. Please start Redis first.${NC}"
        echo -e "${YELLOW}    sudo systemctl start redis${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Redis is running${NC}"
    fi
    
    return 0
}

# Function to install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    # Backend dependencies
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd "$BACKEND_DIR" || exit 1
    npm install
    
    # Frontend dependencies
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd "$FRONTEND_DIR" || exit 1
    npm install
    
    # Python dependencies
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    cd "$RECOMMENDATION_DIR" || exit 1
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    pip install -r requirements.txt
    
    echo -e "${GREEN}✅ All dependencies installed${NC}"
}

# Function to setup environment files
setup_environment() {
    echo -e "${BLUE}⚙️  Setting up environment files...${NC}"
    
    # Backend .env
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        echo -e "${YELLOW}Creating backend .env file...${NC}"
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
        echo -e "${YELLOW}Please edit $BACKEND_DIR/.env with your configuration${NC}"
    fi
    
    # Recommendation system .env
    if [ ! -f "$RECOMMENDATION_DIR/.env" ]; then
        echo -e "${YELLOW}Creating recommendation system .env file...${NC}"
        cp "$RECOMMENDATION_DIR/.env.example" "$RECOMMENDATION_DIR/.env"
        echo -e "${YELLOW}Please edit $RECOMMENDATION_DIR/.env with your configuration${NC}"
    fi
    
    echo -e "${GREEN}✅ Environment files ready${NC}"
}

# Function to stop all services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping LanceJob services...${NC}"
    
    if [ -f /tmp/lancejob_pids.txt ]; then
        while read pid; do
            if kill -0 $pid 2>/dev/null; then
                echo -e "${YELLOW}Stopping process $pid...${NC}"
                kill $pid
            fi
        done < /tmp/lancejob_pids.txt
        rm /tmp/lancejob_pids.txt
    fi
    
    echo -e "${GREEN}✅ All services stopped${NC}"
}

# Function to show service status
show_status() {
    echo -e "${BLUE}📊 Service Status:${NC}"
    echo "=================================="
    
    # Check each service
    if check_port 3000; then
        echo -e "Backend (Port 3000): ${RED}Stopped${NC}"
    else
        echo -e "Backend (Port 3000): ${GREEN}Running${NC}"
    fi
    
    if check_port 5173; then
        echo -e "Frontend (Port 5173): ${RED}Stopped${NC}"
    else
        echo -e "Frontend (Port 5173): ${GREEN}Running${NC}"
    fi
    
    if check_port 5000; then
        echo -e "Recommendation API (Port 5000): ${RED}Stopped${NC}"
    else
        echo -e "Recommendation API (Port 5000): ${GREEN}Running${NC}"
    fi
    
    echo "=================================="
}

# Main script logic
case "$1" in
    "install")
        echo -e "${GREEN}📦 Installing LanceJob Platform${NC}"
        install_dependencies
        setup_environment
        echo -e "${GREEN}✅ Installation complete${NC}"
        echo -e "${YELLOW}Please edit the .env files and then run './start_platform.sh start'${NC}"
        ;;
    "start")
        echo -e "${GREEN}🚀 Starting LanceJob Platform${NC}"
        
        # Clear any existing PIDs file
        rm -f /tmp/lancejob_pids.txt
        
        # Check dependencies
        if ! check_dependencies; then
            echo -e "${RED}❌ Dependencies not met. Please start MongoDB and Redis first.${NC}"
            exit 1
        fi
        
        # Start Recommendation API
        start_service "Recommendation API" "source venv/bin/activate && python api_server.py" "$RECOMMENDATION_DIR" 5000
        sleep 3
        
        # Start Backend API
        start_service "Backend API" "npm run dev" "$BACKEND_DIR" 3000
        sleep 3
        
        # Start Frontend
        start_service "Frontend" "npm run dev" "$FRONTEND_DIR" 5173
        sleep 3
        
        echo "=========================================="
        echo -e "${GREEN}🎉 LanceJob Platform Started Successfully!${NC}"
        echo "=========================================="
        echo -e "Frontend: ${BLUE}http://localhost:5000${NC}"
        echo -e "Backend API: ${BLUE}http://localhost:3000${NC}"
        echo -e "Recommendation API: ${BLUE}http://localhost:2511${NC}"
        echo "=========================================="
        echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
        
        # Wait for interrupt
        trap stop_services INT
        wait
        ;;
    "stop")
        stop_services
        ;;
    "status")
        show_status
        ;;
    "restart")
        echo -e "${YELLOW}🔄 Restarting LanceJob Platform${NC}"
        stop_services
        sleep 2
        exec "$0" start
        ;;
    "logs")
        echo -e "${BLUE}📋 Showing recent logs${NC}"
        echo "Backend logs:"
        tail -n 20 "$BACKEND_DIR/logs/app.log" 2>/dev/null || echo "No backend logs found"
        echo ""
        echo "Recommendation API logs:"
        tail -n 20 "$RECOMMENDATION_DIR/api_server.log" 2>/dev/null || echo "No API logs found"
        ;;
    *)
        echo -e "${YELLOW}LanceJob Platform Management Script${NC}"
        echo "Usage: $0 {install|start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  install  - Install all dependencies and setup environment"
        echo "  start    - Start all services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  status   - Show service status"
        echo "  logs     - Show recent logs"
        exit 1
        ;;
esac
