# Backend-Recommendation System Integration Guide

## Overview

The LanceJob platform integrates a Node.js backend with a Python-based recommendation system to provide intelligent job matching. This document explains how these systems work together.

## Architecture

```
Frontend (React) → Backend (Node.js) → Recommendation System (Python/Flask)
                        ↓
                  Database (MongoDB)
                        ↓
                   Cache (Redis)
```

## Integration Points

### 1. Backend Service Layer

**File**: `/home/majidi/Documents/lancejob/backend/src/services/recommendation.service.js`

The backend contains a dedicated service that communicates with the recommendation system:

```javascript
const axios = require('axios');

class RecommendationService {
  constructor() {
    this.apiUrl = process.env.RECOMMENDATION_API_URL || 'http://localhost:2511';
  }

  async getRecommendations(userId, options = {}) {
    // Calls the Python recommendation API
    const response = await axios.post(`${this.apiUrl}/api/recommendations`, {
      user_id: userId,
      ...options
    });
    return response.data;
  }
}
```

### 2. Backend Routes

**File**: `/home/majidi/Documents/lancejob/backend/src/routes/recommendation.routes.js`

Routes that expose recommendation functionality to the frontend:

- `POST /api/recommendations` - Get personalized job recommendations
- `POST /api/recommendations/batch` - Trigger batch processing
- `GET /api/recommendations/health` - Check recommendation system health

### 3. Recommendation System API

**File**: `/home/majidi/Documents/lancejob/recommendation_system/src/api/api_server.py`

Flask-based API that provides:

- Machine learning-powered recommendations
- Hybrid content-based and collaborative filtering
- Real-time and batch processing capabilities
- Caching for performance optimization

## API Endpoints

### Recommendation System (Port 2511)

#### Get Recommendations
```
POST /api/recommendations
Content-Type: application/json

{
  "user_id": "user123",
  "skills": ["JavaScript", "React", "Node.js"],
  "experience_level": "Intermediate",
  "preferences": {
    "job_types": ["Full-time", "Remote"],
    "salary_range": [50000, 80000]
  },
  "limit": 10
}
```

#### Health Check
```
GET /health
```

#### Trigger Batch Processing
```
POST /api/batch/trigger
```

### Backend API (Port 5000)

#### Get Recommendations (Proxied)
```
POST /api/recommendations
Content-Type: application/json

{
  "user_id": "user123",
  "skills": ["JavaScript", "React"],
  "limit": 5
}
```

## Configuration

### Environment Variables

#### Recommendation System (.env)
```bash
MONGODB_URI=mongodb://localhost:27017/lancejob_db
REDIS_URL=redis://localhost:6379
FLASK_ENV=development
FLASK_PORT=2511
```

#### Backend (.env)
```bash
RECOMMENDATION_API_URL=http://localhost:2511
```

## Data Flow

1. **User Action**: User views jobs or updates profile on frontend
2. **Backend Processing**: Backend receives request and calls recommendation service
3. **API Call**: Backend makes HTTP request to recommendation system
4. **ML Processing**: Recommendation system processes using hybrid algorithm
5. **Cache Check**: System checks Redis cache for recent results
6. **Database Query**: If not cached, queries MongoDB for user/job data
7. **Algorithm Execution**: Runs content-based and collaborative filtering
8. **Response**: Returns ranked job recommendations
9. **Caching**: Stores results in Redis for future requests
10. **Frontend Display**: Backend returns results to frontend for display

## Starting the System

### Option 1: Using Startup Scripts

```bash
# Start recommendation system
cd /home/majidi/Documents/lancejob/recommendation_system
./start_api.sh

# Start backend (in another terminal)
cd /home/majidi/Documents/lancejob/backend
npm start
```

### Option 2: Using Integration Demo

```bash
# Run full integration demo
cd /home/majidi/Documents/lancejob/recommendation_system
./integration_demo.sh

# Check system status
./integration_demo.sh status

# Stop services
./integration_demo.sh stop
```

### Option 3: Using Docker (if available)

```bash
# Start entire platform
cd /home/majidi/Documents/lancejob
./start_platform.sh
```

## Testing Integration

### 1. Health Checks

```bash
# Test recommendation system
curl http://localhost:2511/health

# Test backend
curl http://localhost:5000/api/health
```

### 2. End-to-End Test

```bash
# Test recommendation flow
curl -X POST http://localhost:5000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "skills": ["JavaScript", "React"],
    "limit": 5
  }'
```

### 3. Using Integration Demo

```bash
# Run comprehensive tests
./integration_demo.sh test

# Test backend integration specifically
./integration_demo.sh backend
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -tlnp | grep :2511
   
   # Kill process if needed
   pkill -f "python3 main.py"
   ```

2. **MongoDB Connection Failed**
   ```bash
   # Start MongoDB
   sudo systemctl start mongod
   
   # Check status
   sudo systemctl status mongod
   ```

3. **Redis Connection Failed**
   ```bash
   # Start Redis
   sudo systemctl start redis
   
   # Check status
   redis-cli ping
   ```

4. **Import Errors**
   ```bash
   # Check Python environment
   cd /home/majidi/Documents/lancejob/recommendation_system
   python3 -c "from src.core.config import Config; print('✅ Imports working')"
   ```

### Logs

- **Recommendation System**: `logs/api_server.log`
- **Backend**: Check console output or PM2 logs
- **Demo Logs**: `logs/demo_startup.log`

## Performance Optimization

1. **Caching**: Redis caches recommendations for 24 hours
2. **Batch Processing**: Updates models daily for better accuracy
3. **Connection Pooling**: MongoDB and Redis use connection pools
4. **Async Processing**: Non-blocking operations where possible

## Security Considerations

1. **API Authentication**: Consider adding JWT tokens for production
2. **Rate Limiting**: Implement rate limiting on endpoints
3. **Input Validation**: Validate all user inputs
4. **CORS**: Properly configure CORS for frontend integration

## Monitoring

1. **Health Endpoints**: Regular health checks
2. **Logs**: Centralized logging for debugging
3. **Metrics**: Track API response times and accuracy
4. **Alerts**: Set up alerts for service failures

## Development Workflow

1. **Local Development**: Use development environment with hot reload
2. **Testing**: Run integration tests before deployment
3. **Staging**: Test full integration in staging environment
4. **Production**: Use production configuration with proper monitoring

## Next Steps

1. Add authentication/authorization
2. Implement real-time recommendations via WebSockets
3. Add A/B testing framework
4. Implement recommendation explanation features
5. Add user feedback collection for model improvement
