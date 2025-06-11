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
    bash -c "$command" &
    local pid=$!
    
    # Store the PID for later cleanup
    echo $pid >> /tmp/lancejob_pids.txt
    
    echo -e "${GREEN}✅ $service_name started (PID: $pid)${NC}"
    return 0
}

# Function to start recommendation system with proper virtual environment
start_recommendation_system() {
    echo -e "${BLUE}🔄 Starting Recommendation System...${NC}"
    
    if ! check_port 2511; then
        echo -e "${RED}❌ Cannot start Recommendation System - port 2511 is in use${NC}"
        return 1
    fi
    
    cd "$RECOMMENDATION_DIR" || { echo -e "${RED}❌ Directory $RECOMMENDATION_DIR not found${NC}"; return 1; }
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}⚠️  Virtual environment not found. Creating one...${NC}"
        python3 -m venv venv || { echo -e "${RED}❌ Failed to create virtual environment${NC}"; return 1; }
        echo -e "${GREEN}✅ Virtual environment created${NC}"
    fi
    
    # Check if main.py exists
    if [ ! -f "main.py" ]; then
        echo -e "${RED}❌ main.py not found in recommendation system${NC}"
        return 1
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  .env file not found. Copying from .env.example...${NC}"
        if [ -f ".env.example" ]; then
            cp ".env.example" ".env"
            echo -e "${YELLOW}Please edit $RECOMMENDATION_DIR/.env with your configuration${NC}"
        else
            echo -e "${RED}❌ No .env.example file found${NC}"
            return 1
        fi
    fi
    
    # Test virtual environment first
    echo -e "${YELLOW}📦 Testing virtual environment...${NC}"
    if ! source venv/bin/activate; then
        echo -e "${RED}❌ Failed to activate virtual environment${NC}"
        return 1
    fi
    
    # Test pip and install requirements
    if ! pip install -r requirements.txt > /tmp/rec_install.log 2>&1; then
        echo -e "${RED}❌ Failed to install requirements. Check /tmp/rec_install.log${NC}"
        deactivate
        return 1
    fi
    deactivate
    
    echo -e "${GREEN}✅ Virtual environment and requirements verified${NC}"
    
    # Create a wrapper script to properly activate venv and start the server
    cat > start_recommendation_wrapper.sh << 'EOF'
#!/bin/bash
set -e  # Exit on any error

cd "$(dirname "$0")"

echo "🔧 Activating virtual environment..."
# Activate virtual environment
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found"
    exit 1
fi

source venv/bin/activate

echo "📦 Virtual environment activated"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    exit 1
fi

# Set environment variables for Flask
export FLASK_ENV=${FLASK_ENV:-development}
export FLASK_HOST=${FLASK_HOST:-0.0.0.0}
export FLASK_PORT=${FLASK_PORT:-2511}

echo "🚀 Starting Recommendation System API Server..."
echo "Host: $FLASK_HOST"
echo "Port: $FLASK_PORT"
echo "Environment: $FLASK_ENV"

# Start the server
exec python3 main.py
EOF
    
    chmod +x start_recommendation_wrapper.sh
    
    # Start the recommendation system and capture output
    echo -e "${YELLOW}📦 Launching recommendation system...${NC}"
    ./start_recommendation_wrapper.sh > /tmp/rec_startup.log 2>&1 &
    local pid=$!
    
    # Wait and check if it started successfully
    sleep 3
    
    if ! kill -0 $pid 2>/dev/null; then
        echo -e "${RED}❌ Recommendation System process died. Check /tmp/rec_startup.log${NC}"
        echo "Last few lines of startup log:"
        tail -5 /tmp/rec_startup.log 2>/dev/null || echo "No log available"
        return 1
    fi
    
    # Check if the port is actually listening
    if check_port 2511; then
        echo -e "${RED}❌ Recommendation System not listening on port 2511${NC}"
        kill $pid 2>/dev/null
        echo "Startup log:"
        cat /tmp/rec_startup.log 2>/dev/null || echo "No log available"
        return 1
    fi
    
    # Store the PID for later cleanup
    echo $pid >> /tmp/lancejob_pids.txt
    
    echo -e "${GREEN}✅ Recommendation System started successfully (PID: $pid)${NC}"
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
    
    # Check Python3 availability
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python3 is not installed or not in PATH${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Python3 is available${NC}"
    fi
    
    # Check Node.js and npm availability
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed or not in PATH${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Node.js is available${NC}"
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed or not in PATH${NC}"
        return 1
    else
        echo -e "${GREEN}✅ npm is available${NC}"
    fi
    
    return 0
}

# Function to install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    # Backend dependencies
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd "$BACKEND_DIR" || exit 1
    if [ -f package.json ]; then
        npm install || { echo -e "${RED}❌ Failed to install backend dependencies${NC}"; exit 1; }
    else
        echo -e "${RED}❌ Backend package.json not found${NC}"; exit 1
    fi
    
    # Frontend dependencies
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd "$FRONTEND_DIR" || exit 1
    if [ -f package.json ]; then
        npm install || { echo -e "${RED}❌ Failed to install frontend dependencies${NC}"; exit 1; }
    else
        echo -e "${RED}❌ Frontend package.json not found${NC}"; exit 1
    fi
    
    # Python dependencies
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    cd "$RECOMMENDATION_DIR" || exit 1
    
    # Check if requirements.txt exists
    if [ ! -f requirements.txt ]; then
        echo -e "${RED}❌ requirements.txt not found in recommendation system${NC}"
        exit 1
    fi
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}Creating Python virtual environment...${NC}"
        python3 -m venv venv || { echo -e "${RED}❌ Failed to create virtual environment${NC}"; exit 1; }
    fi
    
    # Activate virtual environment and install packages
    source venv/bin/activate || { echo -e "${RED}❌ Failed to activate virtual environment${NC}"; exit 1; }
    
    # Upgrade pip first
    pip install --upgrade pip
    
    # Install requirements
    pip install -r requirements.txt || { echo -e "${RED}❌ Failed to install Python dependencies${NC}"; exit 1; }
    
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
    
    # Clean up the recommendation system wrapper script and logs
    if [ -f "$RECOMMENDATION_DIR/start_recommendation_wrapper.sh" ]; then
        rm "$RECOMMENDATION_DIR/start_recommendation_wrapper.sh"
    fi
    
    # Clean up temporary log files
    rm -f /tmp/rec_install.log /tmp/rec_startup.log
    
    echo -e "${GREEN}✅ All services stopped${NC}"
}

# Function to verify system setup
verify_setup() {
    echo -e "${BLUE}🔍 Verifying LanceJob Platform Setup${NC}"
    echo "=========================================="
    
    local issues=0
    
    # Check directories
    echo -e "${YELLOW}Checking directories...${NC}"
    if [ ! -d "$BACKEND_DIR" ]; then
        echo -e "${RED}❌ Backend directory not found: $BACKEND_DIR${NC}"
        ((issues++))
    else
        echo -e "${GREEN}✅ Backend directory found${NC}"
    fi
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        echo -e "${RED}❌ Frontend directory not found: $FRONTEND_DIR${NC}"
        ((issues++))
    else
        echo -e "${GREEN}✅ Frontend directory found${NC}"
    fi
    
    if [ ! -d "$RECOMMENDATION_DIR" ]; then
        echo -e "${RED}❌ Recommendation system directory not found: $RECOMMENDATION_DIR${NC}"
        ((issues++))
    else
        echo -e "${GREEN}✅ Recommendation system directory found${NC}"
    fi
    
    # Check package files
    echo -e "${YELLOW}Checking package files...${NC}"
    if [ ! -f "$BACKEND_DIR/package.json" ]; then
        echo -e "${RED}❌ Backend package.json not found${NC}"
        ((issues++))
    else
        echo -e "${GREEN}✅ Backend package.json found${NC}"
    fi
    
    if [ ! -f "$FRONTEND_DIR/package.json" ]; then
        echo -e "${RED}❌ Frontend package.json not found${NC}"
        ((issues++))
    else
        echo -e "${GREEN}✅ Frontend package.json found${NC}"
    fi
    
    if [ ! -f "$RECOMMENDATION_DIR/requirements.txt" ]; then
        echo -e "${RED}❌ Recommendation system requirements.txt not found${NC}"
        ((issues++))
    else
        echo -e "${GREEN}✅ Recommendation system requirements.txt found${NC}"
    fi
    
    if [ ! -f "$RECOMMENDATION_DIR/main.py" ]; then
        echo -e "${RED}❌ Recommendation system main.py not found${NC}"
        ((issues++))
    else
        echo -e "${GREEN}✅ Recommendation system main.py found${NC}"
    fi
    
    # Check virtual environment
    echo -e "${YELLOW}Checking Python virtual environment...${NC}"
    if [ ! -d "$RECOMMENDATION_DIR/venv" ]; then
        echo -e "${YELLOW}⚠️  Virtual environment not found (will be created on install)${NC}"
    else
        echo -e "${GREEN}✅ Virtual environment exists${NC}"
    fi
    
    # Check environment files
    echo -e "${YELLOW}Checking environment files...${NC}"
    if [ ! -f "$BACKEND_DIR/.env" ] && [ ! -f "$BACKEND_DIR/.env.example" ]; then
        echo -e "${RED}❌ No backend .env or .env.example file found${NC}"
        ((issues++))
    else
        echo -e "${GREEN}✅ Backend environment file available${NC}"
    fi
    
    if [ ! -f "$RECOMMENDATION_DIR/.env" ] && [ ! -f "$RECOMMENDATION_DIR/.env.example" ]; then
        echo -e "${RED}❌ No recommendation system .env or .env.example file found${NC}"
        ((issues++))
    else
        echo -e "${GREEN}✅ Recommendation system environment file available${NC}"
    fi
    
    echo "=========================================="
    if [ $issues -eq 0 ]; then
        echo -e "${GREEN}✅ Setup verification passed! Ready to install/start.${NC}"
        return 0
    else
        echo -e "${RED}❌ Found $issues issue(s). Please fix them before proceeding.${NC}"
        return 1
    fi
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
    
    if check_port 5000; then
        echo -e "Frontend (Port 5000): ${RED}Stopped${NC}"
    else
        echo -e "Frontend (Port 5000): ${GREEN}Running${NC}"
    fi
    
    if check_port 2511; then
        echo -e "Recommendation API (Port 2511): ${RED}Stopped${NC}"
    else
        echo -e "Recommendation API (Port 2511): ${GREEN}Running${NC}"
    fi
    
    echo "=================================="
}

# Main script logic
case "$1" in
    "install")
        echo -e "${GREEN}📦 Installing LanceJob Platform${NC}"
        
        # Verify setup first
        if ! verify_setup; then
            echo -e "${RED}❌ Setup verification failed. Please fix the issues above.${NC}"
            exit 1
        fi
        
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
        
        # Start Recommendation System with proper virtual environment
        if ! start_recommendation_system; then
            echo -e "${RED}❌ Failed to start Recommendation System${NC}"
            stop_services
            exit 1
        fi
        sleep 5
        
        # Start Backend API
        if ! start_service "Backend API" "npm run dev" "$BACKEND_DIR" 3000; then
            echo -e "${RED}❌ Failed to start Backend API${NC}"
            stop_services
            exit 1
        fi
        sleep 3
        
        # Start Frontend
        if ! start_service "Frontend" "npm run dev" "$FRONTEND_DIR" 5000; then
            echo -e "${RED}❌ Failed to start Frontend${NC}"
            stop_services
            exit 1
        fi
        sleep 3
        
        echo "=========================================="
        echo -e "${GREEN}🎉 LanceJob Platform Started Successfully!${NC}"
        echo "=========================================="
        echo -e "Frontend: ${BLUE}http://localhost:5000${NC}"
        echo -e "Backend API: ${BLUE}http://localhost:3000${NC}"
        echo -e "Recommendation API: ${BLUE}http://localhost:2511${NC}"
        echo "=========================================="
        echo -e "${YELLOW}Verifying services are responding...${NC}"
        
        # Wait a bit more for services to fully start
        sleep 5
        
        # Quick health check
        local services_healthy=true
        
        # Check if ports are actually being used (services are running)
        if check_port 3000; then
            echo -e "${RED}⚠️  Backend API may not be running properly${NC}"
            services_healthy=false
        else
            echo -e "${GREEN}✅ Backend API is listening on port 3000${NC}"
        fi
        
        if check_port 5000; then
            echo -e "${RED}⚠️  Frontend may not be running properly${NC}"
            services_healthy=false
        else
            echo -e "${GREEN}✅ Frontend is listening on port 5000${NC}"
        fi
        
        if check_port 2511; then
            echo -e "${RED}⚠️  Recommendation API may not be running properly${NC}"
            services_healthy=false
        else
            echo -e "${GREEN}✅ Recommendation API is listening on port 2511${NC}"
        fi
        
        if [ "$services_healthy" = true ]; then
            echo -e "${GREEN}🎉 All services are healthy and running!${NC}"
        else
            echo -e "${YELLOW}⚠️  Some services may have issues. Check the logs with './start_platform.sh logs'${NC}"
        fi
        
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
        echo "=========================================="
        
        echo -e "${YELLOW}Backend logs:${NC}"
        if [ -f "$BACKEND_DIR/logs/app.log" ]; then
            tail -n 20 "$BACKEND_DIR/logs/app.log"
        else
            echo "No backend logs found at $BACKEND_DIR/logs/app.log"
        fi
        
        echo ""
        echo -e "${YELLOW}Recommendation API logs:${NC}"
        if [ -f "$RECOMMENDATION_DIR/logs/api_server.log" ]; then
            tail -n 20 "$RECOMMENDATION_DIR/logs/api_server.log"
        elif [ -f "$RECOMMENDATION_DIR/api_server.log" ]; then
            tail -n 20 "$RECOMMENDATION_DIR/api_server.log"
        else
            echo "No recommendation API logs found"
        fi
        
        echo ""
        echo -e "${YELLOW}Process status:${NC}"
        if [ -f /tmp/lancejob_pids.txt ]; then
            echo "Active PIDs:"
            while read pid; do
                if kill -0 $pid 2>/dev/null; then
                    echo "  PID $pid: Running"
                    ps -p $pid -o pid,ppid,cmd --no-headers | head -1
                else
                    echo "  PID $pid: Not running"
                fi
            done < /tmp/lancejob_pids.txt
        else
            echo "No PID file found"
        fi
        ;;
    "verify")
        verify_setup
        ;;
    *)
        echo -e "${YELLOW}LanceJob Platform Management Script${NC}"
        echo "Usage: $0 {verify|install|start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  verify   - Verify system setup and requirements"
        echo "  install  - Install all dependencies and setup environment"
        echo "  start    - Start all services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  status   - Show service status"
        echo "  logs     - Show recent logs"
        exit 1
        ;;
esac
