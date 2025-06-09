# LanceJob

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## 🚀 Overview

LanceJob is an AI-powered freelance marketplace that connects talented professionals with clients seeking specialized skills. The platform leverages advanced algorithms to provide personalized project recommendations based on user behavior and content matching.

## ✨ Key Features

- **Smart Authentication System**: Secure email/password and OAuth integration
- **Dynamic Profile Management**: Customizable profiles with skill tagging
- **Hybrid AI Recommendation Engine**:
  - Content-based filtering using skill matching and TF-IDF analysis
  - Collaborative filtering based on user behavior patterns
  - Real-time interaction tracking and learning
  - Personalized project recommendations with confidence scoring
- **Advanced Project Management**: Create, search, and filter projects with ease
- **Real-time Messaging**: Seamless communication between freelancers and clients
- **Secure Payment Processing**: Integrated with Stripe and PayPal
- **Comprehensive Dashboard**: Track projects, performance metrics, and financial data
- **Analytics & Insights**: User behavior analytics and recommendation performance tracking

## 🛠️ Tech Stack

### Backend

- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Socket.IO for real-time messaging
- **Python Recommendation Engine**: Flask API with scikit-learn
- **Redis**: Caching layer for recommendations and session management

### Frontend

- React.js with Vite
- Redux Toolkit for state management
- Tailwind CSS for styling
- Socket.IO client for real-time features

### Machine Learning & Analytics

- **Content-Based Filtering**: TF-IDF vectorization for skill matching
- **Collaborative Filtering**: User-item matrix factorization
- **Hybrid Approach**: Weighted combination of both techniques
- **Real-time Learning**: Automatic model retraining based on user interactions

## 📋 Prerequisites

- Node.js (v16.x or higher)
- Python (v3.8 or higher) for the recommendation engine
- MongoDB (v5.x or higher)
- Redis (v6.x or higher) for caching
- npm (v8.x or higher) or yarn (v1.22.x or higher)

## 🚀 Getting Started

### Quick Start with Platform Management Script

We provide a convenient script to manage the entire platform:

```bash
# Make the script executable
chmod +x start_platform.sh

# Install all dependencies (Node.js, Python, and platform dependencies)
./start_platform.sh install

# Start all services (MongoDB, Redis, Python API, Node.js backend, React frontend)
./start_platform.sh start

# Check the status of all services
./start_platform.sh status

# View logs from all services
./start_platform.sh logs

# Stop all services
./start_platform.sh stop
```

### Manual Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/lancejob.git
   cd lancejob
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:

   ```bash
   cd ../frontend
   npm install
   ```

4. Install Python recommendation engine dependencies:

   ```bash
   cd ../recommendation_system
   pip install -r requirements.txt
   ```

5. Set up environment variables:

   ```bash
   cd ../backend
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration details.

### Running the Application Manually

1. Start MongoDB and Redis services

2. Start the Python recommendation API:

   ```bash
   cd recommendation_system
   ./start_api.sh
   ```

3. Start the backend server:

   ```bash
   cd backend
   npm run dev
   ```

4. Start the frontend development server:

   ```bash
   cd frontend
   npm run dev
   ```

5. Access the application at `http://localhost:5000`

## 📁 Project Structure

```text
lancejob/
├── backend/                # Node.js & Express server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware (including interaction tracking)
│   │   ├── models/         # Mongoose models (User, Mission, Interaction)
│   │   ├── routes/         # API routes (including recommendation routes)
│   │   ├── services/       # Business logic (including RecommendationService)
│   │   └── utils/          # Utility functions
│   └── ...
├── frontend/               # React application
│   ├── src/
│   │   ├── api/            # API client (including recommendation.js)
│   │   ├── assets/         # Static assets
│   │   ├── components/     # Reusable components
│   │   └── ...
│   └── ...
├── recommendation_system/  # Python ML recommendation engine
│   ├── api_server.py       # Flask REST API
│   ├── batch_processor.py  # Scheduled model retraining
│   ├── start_api.sh        # API startup script
│   ├── requirements.txt    # Python dependencies
│   └── test_recommendation_system.py  # Comprehensive test suite
├── start_platform.sh       # Platform management script
└── ...
```

## 🤖 Hybrid Recommendation System

LanceJob features a sophisticated hybrid recommendation engine that combines content-based and collaborative filtering techniques to provide personalized project recommendations.

### Architecture Overview

```text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   React App     │◄──►│   Node.js API    │◄──►│   Python ML Engine │
│                 │    │                  │    │                     │
│ ▪ User Interface│    │ ▪ Authentication │    │ ▪ Content Filtering │
│ ▪ Interaction   │    │ ▪ Data Validation│    │ ▪ Collaborative     │
│   Tracking      │    │ ▪ Rate Limiting  │    │   Filtering         │
│ ▪ Recommendations│    │ ▪ Logging       │    │ ▪ Model Training    │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
         │                        │                        │
         │                        ▼                        │
         │              ┌──────────────────┐               │
         │              │    MongoDB       │               │
         │              │                  │               │
         │              │ ▪ User Profiles  │               │
         │              │ ▪ Mission Data   │               │
         │              │ ▪ Interactions   │               │
         │              └──────────────────┘               │
         │                                                 │
         └─────────────────────┐         ┌─────────────────┘
                               ▼         ▼
                      ┌──────────────────┐
                      │      Redis       │
                      │                  │
                      │ ▪ Cached Models  │
                      │ ▪ Recommendations│
                      │ ▪ Session Data   │
                      └──────────────────┘
```

### Features

#### Content-Based Filtering

- **Skill Matching**: Uses TF-IDF vectorization to match freelancer skills with project requirements
- **Semantic Analysis**: Analyzes project descriptions and user profiles for better matching
- **Category Filtering**: Considers project categories and user preferences

#### Collaborative Filtering

- **User-Item Matrix**: Builds interaction matrices from user behavior (views, applications, completions)
- **Similarity Scoring**: Calculates user-user and item-item similarities
- **Preference Learning**: Learns from implicit feedback (time spent, click patterns)

#### Hybrid Approach

- **Weighted Combination**: Intelligently combines content and collaborative scores
- **Cold Start Handling**: Falls back to content-based recommendations for new users/projects
- **Dynamic Weighting**: Adjusts algorithm weights based on data availability

#### Real-time Learning

- **Interaction Tracking**: Automatically captures all user interactions
- **Incremental Updates**: Updates recommendations based on real-time behavior
- **A/B Testing Ready**: Framework for testing different algorithm configurations

### API Endpoints

#### Recommendation Engine (Python Flask - Port 2511)

```bash
# Get personalized recommendations
GET /api/recommend/{user_id}?limit=10&min_confidence=0.3

# Track user interactions
POST /api/interactions
{
  "user_id": "user123",
  "mission_id": "mission456",
  "interaction_type": "view",
  "metadata": {"duration": 45}
}

# Get recommendation analytics
GET /api/analytics/{user_id}

# Health check
GET /api/health

# System statistics (admin only)
GET /api/admin/stats
```

#### Node.js Integration (Port 3000)

```bash
# Get recommendations (with authentication)
GET /api/recommendations?limit=10&category=web-development

# Track interactions (automatic via middleware)
# Automatically triggered on mission routes

# Get user analytics
GET /api/recommendations/analytics
```

### Configuration

#### Environment Variables

```bash
# Recommendation System Settings
RECOMMENDATION_API_URL=http://localhost:2511
RECOMMENDATION_API_TIMEOUT=30000
RECOMMENDATION_CACHE_TTL=300
ENABLE_INTERACTION_TRACKING=true

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Machine Learning Settings
MODEL_RETRAIN_INTERVAL=3600
CONTENT_WEIGHT=0.6
COLLABORATIVE_WEIGHT=0.4
MIN_CONFIDENCE_SCORE=0.3
```

### Batch Processing

The system includes automated batch processing for:

- **Model Retraining**: Scheduled retraining every hour based on new interactions
- **Cache Cleanup**: Removes expired recommendations and stale data
- **Performance Monitoring**: Tracks system metrics and model performance
- **Data Validation**: Ensures data quality and consistency

```bash
# Run batch processor manually
cd recommendation_system
python batch_processor.py

# Configure scheduled runs via cron
0 * * * * /path/to/lancejob/recommendation_system/batch_processor.py
```

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test                    # Run all tests
npm run test:unit           # Run unit tests only
npm run test:integration    # Run integration tests only
```

### Frontend Testing

```bash
cd frontend
npm test                    # Run all tests
npm run test:coverage       # Run tests with coverage report
```

### Recommendation System Testing

```bash
cd recommendation_system
python test_recommendation_system.py    # Run comprehensive ML tests

# Run specific test suites
python -m pytest test_recommendation_system.py::TestContentBasedFiltering
python -m pytest test_recommendation_system.py::TestCollaborativeFiltering
python -m pytest test_recommendation_system.py::TestAPIEndpoints
```

### End-to-End Testing

```bash
# Start all services
./start_platform.sh start

# Run full integration tests
npm run test:e2e

# Test recommendation flow
curl -X GET "http://localhost:5000/api/recommendations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Monitoring & Analytics

### Health Checks

- **System Health**: `GET /api/health` - Overall system status
- **Database Health**: MongoDB and Redis connectivity checks
- **ML Model Status**: Model training status and performance metrics
- **API Performance**: Response times and error rates

### Analytics Dashboard

The system provides comprehensive analytics:

- **Recommendation Performance**: Click-through rates, conversion metrics
- **User Behavior**: Interaction patterns, engagement metrics
- **Model Accuracy**: Precision, recall, and F1 scores
- **System Metrics**: API response times, cache hit rates

### Logging

Comprehensive logging system with:

- **Structured Logging**: JSON format for easy parsing
- **Log Levels**: DEBUG, INFO, WARN, ERROR with configurable levels
- **File Rotation**: Automatic log file rotation and cleanup
- **Centralized Logs**: All services log to `/var/log/lancejob/`

## 🚀 Deployment

### Docker Deployment (Recommended)

The easiest way to deploy LanceJob is using Docker Compose:

#### Prerequisites

- Docker (v20.x or higher)
- Docker Compose (v2.x or higher)
- 4GB+ RAM available
- 10GB+ disk space

#### Quick Deploy

```bash
# Clone the repository
git clone https://github.com/yourusername/lancejob.git
cd lancejob

# Copy production environment file
cp .env.production .env

# Update environment variables in .env file
nano .env

# Build and start all services
docker-compose up -d --build

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Production Environment Setup

1. **Update Environment Variables**:

   ```bash
   # Edit .env file with your production values
   nano .env
   
   # Key variables to update:
   # - JWT_SECRET (use a strong 64-character string)
   # - MONGODB_URI (if using external MongoDB)
   # - Email service credentials
   # - Payment gateway credentials
   # - Domain/CORS settings
   ```

2. **SSL/TLS Configuration**:

   ```bash
   # For production, add SSL reverse proxy (nginx/traefik)
   # Example nginx configuration:
   server {
       listen 443 ssl;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       
       location / {
           proxy_pass http://localhost:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /api {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **Database Migration**:

   ```bash
   # Run database migration after first startup
   docker-compose exec backend node scripts/migrate-recommendation-system.js
   ```

#### Service URLs

Once deployed, services will be available at:

- **Frontend**: <http://localhost> (port 80)
- **Backend API**: <http://localhost:3000>
- **Recommendation API**: <http://localhost:2511>
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

#### Scaling Services

```bash
# Scale recommendation API for high load
docker-compose up -d --scale recommendation-api=3

# Scale backend API
docker-compose up -d --scale backend=2

# Monitor resource usage
docker stats
```

### Manual Production Deployment

For manual deployment without Docker:

#### Server Requirements

- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- Node.js 18+
- Python 3.9+
- MongoDB 6.0+
- Redis 7+
- Nginx (recommended)
- 4GB+ RAM
- 20GB+ storage

#### Step-by-Step Deployment

1. **Prepare the Server**:

   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Python 3.9+
   sudo apt install python3 python3-pip python3-venv -y
   
   # Install MongoDB 6.0
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt update
   sudo apt install -y mongodb-org
   
   # Install Redis 7
   sudo apt install redis-server -y
   
   # Install Nginx
   sudo apt install nginx -y
   ```

2. **Deploy the Application**:

   ```bash
   # Clone repository
   git clone https://github.com/yourusername/lancejob.git
   cd lancejob
   
   # Install backend dependencies
   cd backend
   npm install --production
   
   # Install frontend dependencies and build
   cd ../frontend
   npm install
   npm run build
   
   # Install Python dependencies
   cd ../recommendation_system
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Configure Services**:

   ```bash
   # Configure environment
   cp .env.production .env
   # Edit .env with your production values
   
   # Setup systemd services
   sudo cp deployment/systemd/*.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable lancejob-*
   ```

4. **Configure Nginx**:

   ```bash
   # Copy nginx configuration
   sudo cp deployment/nginx/lancejob.conf /etc/nginx/sites-available/
   sudo ln -s /etc/nginx/sites-available/lancejob.conf /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Start Services**:

   ```bash
   # Start all services
   sudo systemctl start mongodb redis-server
   sudo systemctl start lancejob-recommendation-api
   sudo systemctl start lancejob-backend
   sudo systemctl start lancejob-batch-processor
   
   # Check status
   sudo systemctl status lancejob-*
   ```

### Environment Variables Reference

#### Core Settings

```bash
# Application
NODE_ENV=production
PORT=3000
API_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb://username:password@host:27017/lancejob_db
REDIS_URL=redis://password@host:6379/0

# Security
JWT_SECRET=your-64-character-secret-key
BCRYPT_ROUNDS=12
```

#### Recommendation System

```bash
RECOMMENDATION_API_URL=http://localhost:2511
RECOMMENDATION_CACHE_TTL=600
MODEL_RETRAIN_INTERVAL=7200
CONTENT_WEIGHT=0.6
COLLABORATIVE_WEIGHT=0.4
```

#### Email & Notifications

```bash
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your-email-password
```

### Backup & Recovery

#### Database Backup

```bash
# MongoDB backup
mongodump --uri="mongodb://username:password@host:27017/lancejob_db" --out=/backup/mongodb/$(date +%Y%m%d)

# Redis backup
redis-cli --rdb /backup/redis/dump-$(date +%Y%m%d).rdb

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backup/lancejob/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/mongodb"
cp /var/lib/redis/dump.rdb "$BACKUP_DIR/redis/"
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
```

#### Recovery

```bash
# Restore MongoDB
mongorestore --uri="mongodb://username:password@host:27017/lancejob_db" /backup/mongodb/lancejob_db

# Restore Redis
redis-cli FLUSHALL
redis-cli --rdb /backup/redis/dump.rdb
```

### Monitoring & Maintenance

#### Health Checks

```bash
# Check all services
curl http://localhost:3000/api/health
curl http://localhost:2511/api/health

# Monitor logs
tail -f /var/log/lancejob/*.log
docker-compose logs -f  # For Docker deployment
```

#### Performance Monitoring

```bash
# System resources
htop
iotop
nethogs

# Database performance
mongostat
redis-cli info stats

# Application metrics
curl http://localhost:5000/api/admin/stats
```

#### Maintenance Tasks

```bash
# Update application
git pull origin main
npm install --production  # Backend
npm run build  # Frontend
systemctl restart lancejob-*

# Database maintenance
mongo --eval "db.runCommand({compact: 'interactions'})"
redis-cli MEMORY PURGE

# Log rotation
logrotate /etc/logrotate.d/lancejob
```

### Troubleshooting

#### Common Issues

1. **Recommendation API Not Responding**:

   ```bash
   # Check Python dependencies
   cd recommendation_system
   pip install -r requirements.txt
   
   # Restart service
   systemctl restart lancejob-recommendation-api
   ```

2. **Database Connection Issues**:

   ```bash
   # Check MongoDB status
   systemctl status mongodb
   mongo --eval "db.adminCommand('ping')"
   
   # Check Redis status
   systemctl status redis-server
   redis-cli ping
   ```

3. **High Memory Usage**:

   ```bash
   # Check recommendation cache
   redis-cli info memory
   redis-cli FLUSHDB  # Clear cache if needed
   
   # Restart services to free memory
   systemctl restart lancejob-*
   ```

4. **Frontend Build Issues**:

   ```bash
   # Clear cache and rebuild
   cd frontend
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

#### Performance Optimization

1. **Database Indexing**:

   ```bash
   # Run indexing script
   node backend/scripts/migrate-recommendation-system.js
   ```

2. **Redis Configuration**:

   ```bash
   # Optimize Redis memory
   redis-cli CONFIG SET maxmemory 1gb
   redis-cli CONFIG SET maxmemory-policy allkeys-lru
   ```

3. **Application Tuning**:

   ```bash
   # Increase Node.js memory limit
   export NODE_OPTIONS="--max-old-space-size=2048"
   
   # Optimize Python workers
   export RECOMMENDATION_WORKERS=4
   ```

## 📚 API Documentation

API documentation is available at `/api/docs` when the server is running.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

Project Link: [https://github.com/majidied/lancejob](https://github.com/majidied/lancejob)

---

Made with ❤️ by The Best Team.
