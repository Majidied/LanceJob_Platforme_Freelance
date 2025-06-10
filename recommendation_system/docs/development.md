# Development Configuration for LanceJob Recommendation System

This file contains development-specific configurations and notes.

## Environment Setup

### Local Development
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your local settings

# Start the API server
python main.py
```

### Development Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/lancejob_db
REDIS_URL=redis://localhost:6379

# Flask
FLASK_ENV=development
FLASK_PORT=2511
FLASK_DEBUG=true

# Logging
LOG_LEVEL=DEBUG

# Model weights (can be adjusted for testing)
CONTENT_WEIGHT=0.6
COLLABORATIVE_WEIGHT=0.4
```

## Development Workflow

### Making Changes
1. Create a feature branch
2. Make changes in the appropriate module
3. Run tests: `python tests/test_recommendation_system.py`
4. Update documentation if needed
5. Test the API endpoints manually or with scripts

### Testing Endpoints
```bash
# Health check
curl http://localhost:2511/api/health

# Get recommendations for a user
curl "http://localhost:2511/api/recommendations/USER_ID?limit=5"

# Get system statistics
curl http://localhost:2511/api/stats
```

### Debugging
- Use scripts in the `scripts/` directory for data validation
- Check logs in the `logs/` directory
- Enable DEBUG logging for detailed output

### Database Debugging
```bash
# Check user data
python scripts/check_users.py

# Check mission data  
python scripts/check_missions.py

# Debug recommendations
python scripts/debug_recommendations.py
```

## Code Style and Standards

### Import Organization
```python
# Standard library imports
import os
import sys

# Third-party imports
import numpy as np
from flask import Flask

# Local imports
from src.core.config import Config
from src.recommenders.hybrid_recommender import HybridRecommendationSystem
```

### Logging
```python
import logging
logger = logging.getLogger(__name__)

# Use appropriate log levels
logger.debug("Detailed debugging information")
logger.info("General information")
logger.warning("Warning messages")
logger.error("Error messages")
```

### Error Handling
```python
try:
    # risky operation
    result = some_operation()
except SpecificException as e:
    logger.error(f"Specific error occurred: {e}")
    # handle specific error
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    # handle generic error
```

## Performance Considerations

### Caching
- Recommendations are cached for 24 hours by default
- Cache keys include user ID and filters
- Use `cache_manager.clear_user_cache(user_id)` to clear specific user cache

### Database Optimization
- Indexes are created automatically on initialization
- Use projection to limit returned fields when possible
- Consider pagination for large result sets

### Memory Usage
- Monitor memory usage during model training
- Large datasets may require batch processing
- Consider using generators for data processing

## Deployment Notes

### Production Configuration
- Set `FLASK_ENV=production`
- Use stronger Redis configuration
- Set up proper logging rotation
- Configure monitoring and alerting

### Docker Development
```bash
# Build development image
docker build -t lancejob-rec-dev .

# Run with volume mounting for development
docker run -p 2511:2511 -v $(pwd):/app lancejob-rec-dev
```
