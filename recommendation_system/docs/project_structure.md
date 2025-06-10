# Recommendation System - Project Structure

This document describes the organized file structure of the LanceJob Recommendation System.

## Directory Structure

```
recommendation_system/
├── main.py                    # Main entry point for the API server
├── start_api.sh               # Startup script for the API server
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Docker configuration
├── README.md                  # Project documentation
├── .env                       # Environment variables (not in git)
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
│
├── src/                       # Source code
│   ├── __init__.py
│   ├── core/                  # Core system components
│   │   ├── __init__.py
│   │   ├── config.py          # Configuration management
│   │   ├── database_manager.py # MongoDB connection and operations
│   │   └── cache_manager.py   # Redis caching operations
│   │
│   ├── recommenders/          # Recommendation algorithms
│   │   ├── __init__.py
│   │   ├── content_based_recommender.py    # Content-based filtering
│   │   ├── collaborative_filtering_recommender.py # Collaborative filtering
│   │   └── hybrid_recommender.py           # Hybrid recommendation system
│   │
│   ├── api/                   # API and batch processing
│   │   ├── __init__.py
│   │   ├── api_server.py      # Flask REST API endpoints
│   │   └── batch_processor.py # Background tasks and model retraining
│   │
│   └── utils/                 # Utility functions and helpers
│       └── __init__.py
│
├── tests/                     # Test suite
│   ├── __init__.py
│   └── test_recommendation_system.py # Comprehensive test suite
│
├── scripts/                   # Development and debugging scripts
│   ├── check_data.py          # Database data validation
│   ├── check_id.py            # ID format checking
│   ├── check_missions.py      # Mission data validation
│   ├── check_users.py         # User data validation
│   ├── create_test_mission.py # Test data creation
│   ├── debug_data.py          # Data debugging utilities
│   ├── debug_recommendations.py # Recommendation debugging
│   └── test_exact_query.py    # Query testing
│
├── docs/                      # Documentation
│   └── project_structure.md   # This file
│
└── logs/                      # Log files
    ├── api_server.log         # API server logs
    ├── batch_processor.log    # Batch processing logs
    └── recommendation_system.log # General system logs
```

## File Descriptions

### Core Components (`src/core/`)

- **config.py**: Configuration management including environment variables, database settings, and system parameters
- **database_manager.py**: MongoDB connection management, data access layer, and database operations
- **cache_manager.py**: Redis caching functionality for performance optimization

### Recommendation Algorithms (`src/recommenders/`)

- **content_based_recommender.py**: Implements content-based filtering using skill matching, text similarity, and feature analysis
- **collaborative_filtering_recommender.py**: Implements collaborative filtering using user-item interactions and matrix factorization
- **hybrid_recommender.py**: Combines content-based and collaborative filtering with configurable weights

### API Layer (`src/api/`)

- **api_server.py**: Flask REST API providing endpoints for recommendations, health checks, and system statistics
- **batch_processor.py**: Background tasks including model retraining, cache cleanup, and system maintenance

### Testing (`tests/`)

- **test_recommendation_system.py**: Comprehensive test suite covering all components with unit tests, integration tests, and performance tests

### Development Scripts (`scripts/`)

- **check_*.py**: Data validation and verification scripts
- **debug_*.py**: Debugging utilities for development
- **create_test_mission.py**: Test data generation
- **test_exact_query.py**: Query testing and validation

## Import Structure

The new modular structure uses relative imports within packages:

```python
# Core components
from src.core.config import Config
from src.core.database_manager import DatabaseManager
from src.core.cache_manager import CacheManager

# Recommenders
from src.recommenders.hybrid_recommender import HybridRecommendationSystem
from src.recommenders.content_based_recommender import ContentBasedRecommender
from src.recommenders.collaborative_filtering_recommender import CollaborativeFilteringRecommender

# API components
from src.api.api_server import app
from src.api.batch_processor import BatchProcessor
```

## Running the System

### Development Mode
```bash
# Start the API server in development mode
python main.py

# Or use the startup script
./start_api.sh
```

### Testing
```bash
# Run the complete test suite
python -m pytest tests/

# Run tests with coverage
python -m pytest tests/ --cov=src/

# Run specific test file
python tests/test_recommendation_system.py
```

### Docker
```bash
# Build the container
docker build -t lancejob-recommendation .

# Run the container
docker run -p 2511:2511 lancejob-recommendation
```

## Benefits of This Structure

1. **Modularity**: Clear separation of concerns with dedicated modules
2. **Maintainability**: Easier to locate and modify specific functionality
3. **Testing**: Isolated components are easier to test
4. **Scalability**: New features can be added without affecting existing code
5. **Documentation**: Clear structure makes the codebase self-documenting
6. **Development**: Better organization for team development and debugging
