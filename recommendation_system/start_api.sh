#!/bin/bash

# LanceJob Recommendation System - API Startup Script
# This script starts the API server for the recommendation system

# Set default environment variables
export FLASK_ENV=${FLASK_ENV:-production}
export FLASK_DEBUG=${FLASK_DEBUG:-false}
export FLASK_HOST=${FLASK_HOST:-0.0.0.0}
export FLASK_PORT=${FLASK_PORT:-2511}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting LanceJob Recommendation API Server${NC}"
echo "=================================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating one...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Activate virtual environment
source venv/bin/activate
echo -e "${GREEN}✅ Virtual environment activated${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Please create one using .env.example as template${NC}"
    echo -e "${YELLOW}    cp .env.example .env${NC}"
    echo -e "${YELLOW}    Edit .env file with your configuration${NC}"
    exit 1
fi

# Install/upgrade dependencies
echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
pip install -r requirements.txt
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Check if MongoDB is running
echo -e "${YELLOW}🔍 Checking MongoDB connection...${NC}"
python3 -c "
import os
from dotenv import load_dotenv
import pymongo

load_dotenv()
try:
    client = pymongo.MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017'))
    client.admin.command('ping')
    print('✅ MongoDB connection successful')
except Exception as e:
    print(f'❌ MongoDB connection failed: {e}')
    exit(1)
" || exit 1

# Check if Redis is running
echo -e "${YELLOW}🔍 Checking Redis connection...${NC}"
python3 -c "
import os
from dotenv import load_dotenv
import redis

load_dotenv()
try:
    r = redis.Redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379'))
    r.ping()
    print('✅ Redis connection successful')
except Exception as e:
    print(f'❌ Redis connection failed: {e}')
    exit(1)
" || exit 1

echo "=================================================="
echo -e "${GREEN}🎯 Starting Flask API Server${NC}"
echo -e "Host: ${FLASK_HOST}"
echo -e "Port: ${FLASK_PORT}"
echo -e "Environment: ${FLASK_ENV}"
echo -e "Debug: ${FLASK_DEBUG}"
echo "=================================================="

# Start the server
if [ "$FLASK_ENV" = "production" ]; then
    echo -e "${GREEN}🚀 Starting with Gunicorn (Production)${NC}"
    exec gunicorn \
        --bind ${FLASK_HOST}:${FLASK_PORT} \
        --workers 4 \
        --worker-class sync \
        --timeout 120 \
        --max-requests 1000 \
        --max-requests-jitter 100 \
        --preload \
        --access-logfile - \
        --error-logfile - \
        main:application
else
    echo -e "${GREEN}🚀 Starting with Flask Development Server${NC}"
    exec python3 main.py
fi
