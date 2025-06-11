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
