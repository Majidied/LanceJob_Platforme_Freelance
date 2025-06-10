#!/usr/bin/env python3
"""
Main entry point for the LanceJob Recommendation System API Server.

This script starts the Flask API server with proper configuration.
"""

import os
import sys

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.api.api_server import app
from src.core.config import Config

# Expose app for gunicorn
application = app

if __name__ == '__main__':
    # Setup logging directory
    log_dir = os.path.join(os.path.dirname(__file__), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Run the Flask app
    app.run(
        host='0.0.0.0',
        port=Config.FLASK_PORT,
        debug=Config.DEBUG
    )
