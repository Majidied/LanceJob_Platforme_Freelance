# Recommendation System Demos

This directory contains demonstration scripts that showcase the recommendation system features.

## Available Demos

### 1. `demo_all_features.sh`

**Complete Feature Demonstration**

- Tests all API endpoints
- Shows health checks and system stats
- Demonstrates recommendation filtering
- Shows interaction tracking
- Tests model retraining
- Includes performance testing

**Usage:**

```bash
bash demos/demo_all_features.sh
```

### 2. `working_demo.sh`

**Working Examples with Real Data**

- Uses actual freelancer profiles from the database
- Shows recommendations for different skill sets
- Demonstrates interaction tracking with real IDs
- Tests batch processing
- Shows updated recommendations after retraining

**Usage:**

```bash
bash demos/working_demo.sh
```

## Prerequisites

Before running any demos:

1. **Start the recommendation system:**

   ```bash
   python3 -m uvicorn src.api.main:app --host 0.0.0.0 --port 2511
   ```

2. **Ensure services are running:**
   - MongoDB (localhost:27017)
   - Redis (localhost:6379)

3. **Check system health:**

   ```bash
   curl http://localhost:2511/health
   ```

## Demo Output

Both demos provide:

- ✅ Color-coded output for easy reading
- 📊 Detailed API responses
- 🎯 Real recommendation results
- 📈 Performance metrics
- 🔍 System analytics

## Integration Examples

The demos also serve as integration examples showing how to:

- Get personalized recommendations
- Track user interactions
- Monitor system performance
- Handle API responses
- Implement error handling
