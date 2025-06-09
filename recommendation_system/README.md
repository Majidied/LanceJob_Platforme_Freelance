# LanceJob Recommendation System

A hybrid recommendation system combining content-based filtering and collaborative filtering to recommend projects to freelancers.

## Features

- **Content-Based Filtering**: Matches freelancer skills with project requirements
- **Collaborative Filtering**: Uses user behavior patterns for recommendations  
- **Hybrid Approach**: Combines both methods for optimal results
- **Real-time API**: Flask-based REST API for recommendations
- **Caching**: Redis integration for performance optimization
- **Scalable**: Designed for production deployment

## Installation

```bash
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/lancejob
REDIS_URL=redis://localhost:6379
FLASK_ENV=development
FLASK_PORT=2511
```

## Usage

```bash
python app.py
```

## API Endpoints

- `GET /recommendations/{freelancer_id}` - Get recommendations for a freelancer
- `POST /track_interaction` - Track user interactions
- `POST /retrain` - Trigger model retraining

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Content-Based │    │  Collaborative   │    │   Interaction   │
│    Filtering    │    │    Filtering     │    │    Tracking     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────────┐
                    │  Hybrid Recommender │
                    │      System         │
                    └─────────────────────┘
                                 │
                    ┌─────────────────────┐
                    │   Redis Cache +     │
                    │   MongoDB Storage   │
                    └─────────────────────┘
```
