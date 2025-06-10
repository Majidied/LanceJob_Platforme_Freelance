import os
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database Configuration
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/lancejob_db')
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
    
    # Flask Configuration
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    FLASK_PORT = int(os.getenv('FLASK_PORT', 2511))
    DEBUG = FLASK_ENV == 'development'
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    # Model Configuration
    CONTENT_WEIGHT = float(os.getenv('CONTENT_WEIGHT', 0.6))
    COLLABORATIVE_WEIGHT = float(os.getenv('COLLABORATIVE_WEIGHT', 0.4))
    MIN_INTERACTIONS_FOR_CF = int(os.getenv('MIN_INTERACTIONS_FOR_CF', 2))  # Lowered from 5 to 2
    
    # Cache Configuration
    CACHE_EXPIRY_HOURS = int(os.getenv('CACHE_EXPIRY_HOURS', 24))
    CACHE_EXPIRY_SECONDS = CACHE_EXPIRY_HOURS * 3600
    
    # Batch Processing
    BATCH_UPDATE_INTERVAL = int(os.getenv('BATCH_UPDATE_INTERVAL', 86400))  # 24 hours
    
    # Recommendation Parameters
    MAX_RECOMMENDATIONS = int(os.getenv('MAX_RECOMMENDATIONS', 20))
    MIN_SKILL_MATCH_THRESHOLD = float(os.getenv('MIN_SKILL_MATCH_THRESHOLD', 0.3))
    DIVERSITY_FACTOR = float(os.getenv('DIVERSITY_FACTOR', 0.2))
    
    # Predefined Skills List (from frontend)
    ALL_SKILLS = [
        "JavaScript", "React", "Node.js", "Python", "Django", "TypeScript", "HTML", "CSS", "Sass", "Redux",
        "Vue.js", "Angular", "Next.js", "Express", "MongoDB", "PostgreSQL", "MySQL", "GraphQL", "REST API",
        "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "CI/CD", "Jest", "Testing Library", "Cypress",
        "Java", "Spring Boot", "C#", ".NET", "PHP", "Laravel", "Go", "Rust", "C++", "Swift", "Kotlin",
        "Flutter", "React Native", "Figma", "UI/UX", "Agile", "Scrum", "JIRA", "Webpack", "Babel", "ESLint"
    ]
    
    @staticmethod
    def setup_logging():
        """Setup logging configuration"""
        log_level = getattr(logging, Config.LOG_LEVEL.upper())
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('recommendation_system.log'),
                logging.StreamHandler()
            ]
        )
        
    @staticmethod
    def validate_config():
        """Validate configuration parameters"""
        assert 0 <= Config.CONTENT_WEIGHT <= 1, "CONTENT_WEIGHT must be between 0 and 1"
        assert 0 <= Config.COLLABORATIVE_WEIGHT <= 1, "COLLABORATIVE_WEIGHT must be between 0 and 1"
        assert abs(Config.CONTENT_WEIGHT + Config.COLLABORATIVE_WEIGHT - 1.0) < 0.001, "Weights must sum to 1"
        assert Config.MIN_INTERACTIONS_FOR_CF > 0, "MIN_INTERACTIONS_FOR_CF must be positive"
        assert Config.MAX_RECOMMENDATIONS > 0, "MAX_RECOMMENDATIONS must be positive"
        
# Validate configuration on import
Config.validate_config()
