# LanceJob Configuration Summary

## Updated Port Configuration

All configuration files have been updated to use the correct ports as requested:

### Service Ports

- **Database**: `lancejob_db` (MongoDB on port 27017)
- **Backend API**: Port `3000`
- **Frontend**: Port `5000`
- **Recommendation System**: Port `2511`

## Files Updated

### 1. Frontend Configuration

- ✅ `/frontend/.env` - Updated VITE_API_URL to point to port 3000
- ✅ `/frontend/vite.config.js` - Already configured correctly (port 5000, proxy to 3000)

### 2. Backend Configuration

- ✅ `/backend/.env` - Updated with correct ports and database name
- ✅ `/backend/.env.example` - Updated recommendation API URL and CORS origin
- ✅ `/backend/src/config/index.js` - Already using correct database name
- ✅ `/backend/healthcheck.js` - Updated to use port 3000
- ✅ `/backend/src/services/recommendation.service.js` - Updated default recommendation API URL
- ✅ `/backend/src/app.js` - Updated CORS origin to port 5000

### 3. Recommendation System Configuration

- ✅ `/recommendation_system/.env` - Already configured correctly
- ✅ `/recommendation_system/.env.example` - Updated database name and port
- ✅ `/recommendation_system/config.py` - Updated database URI and Flask port
- ✅ `/recommendation_system/Dockerfile` - Updated port exposure and health check

### 4. Docker Configuration

- ✅ `/docker-compose.yml` - Updated all service configurations:
  - MongoDB database name: `lancejob_db`
  - Backend port: `3000`
  - Frontend port: `5000` (maps to internal port 80)
  - Recommendation API port: `2511`

### 5. Production Environment

- ✅ `/.env.production` - Updated all references to use correct ports and database name

### 6. Platform Management

- ✅ `/start_platform.sh` - Updated service ports and status checking
- ✅ `/README.md` - Updated documentation with correct ports and database references

## Configuration Summary

### Database Configuration

```bash
# Database name
MONGO_URI=mongodb://localhost:27017/lancejob_db

# Production URI
MONGODB_URI=mongodb://admin:password123@mongodb:27017/lancejob_db?authSource=admin
```

### Service URLs (Development)

- Frontend: <http://localhost:5000>
- Backend API: <http://localhost:3000>
- Recommendation API: <http://localhost:2511>
- MongoDB: localhost:27017
- Redis: localhost:6379

### Service URLs (Docker/Production)

- Frontend: <http://localhost:5000>
- Backend API: <http://localhost:3000>
- Recommendation API: <http://localhost:2511>
- MongoDB: mongodb:27017 (internal)
- Redis: redis:6379 (internal)

## Environment Variables

### Backend (.env)

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/lancejob_db
RECOMMENDATION_API_URL=http://127.0.0.1:2511
CORS_ORIGIN=http://localhost:5000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
```

### Recommendation System (.env)

```env
MONGODB_URL=mongodb://localhost:27017/lancejob_db
FLASK_PORT=2511
```

## Docker Services

### Port Mappings

- `frontend`: `5000:80`
- `backend`: `3000:3000`
- `recommendation-api`: `2511:2511`
- `mongodb`: `27017:27017`
- `redis`: `6379:6379`

All configuration files are now consistent and use the correct:

- Database name: `lancejob_db`
- Backend API port: `3000`
- Frontend port: `5000`
- Recommendation system port: `2511`

The platform is ready to run with these configurations using either:

1. `./start_platform.sh start` (development)
2. `docker-compose up -d` (production)
