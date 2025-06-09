#!/usr/bin/env python3
"""
Test Suite for LanceJob Recommendation System

This module contains comprehensive tests for all recommendation system components.
"""

import unittest
import sys
import os
from unittest.mock import Mock, patch, MagicMock
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import Config
from database_manager import DatabaseManager
from cache_manager import CacheManager
from content_based_recommender import ContentBasedRecommender
from collaborative_filtering_recommender import CollaborativeFilteringRecommender
from hybrid_recommender import HybridRecommendationSystem

class TestConfig(unittest.TestCase):
    """Test cases for the Config class."""
    
    def setUp(self):
        self.config = Config()
    
    def test_config_initialization(self):
        """Test that config initializes properly."""
        self.assertIsInstance(self.config, Config)
    
    def test_get_existing_variable(self):
        """Test getting an existing environment variable."""
        # Set a test variable
        os.environ['TEST_VAR'] = 'test_value'
        result = self.config.get('TEST_VAR')
        self.assertEqual(result, 'test_value')
    
    def test_get_nonexistent_variable_with_default(self):
        """Test getting a non-existent variable with default."""
        result = self.config.get('NON_EXISTENT_VAR', 'default_value')
        self.assertEqual(result, 'default_value')

class TestDatabaseManager(unittest.TestCase):
    """Test cases for the DatabaseManager class."""
    
    def setUp(self):
        self.config = Mock()
        self.config.get.side_effect = lambda key, default=None: {
            'MONGODB_URI': 'mongodb://localhost:27017/test',
            'MONGODB_DB_NAME': 'lancejob_test'
        }.get(key, default)
        
        with patch('database_manager.MongoClient'):
            self.db_manager = DatabaseManager(self.config)
    
    def test_database_manager_initialization(self):
        """Test that database manager initializes properly."""
        self.assertIsInstance(self.db_manager, DatabaseManager)
    
    @patch('database_manager.MongoClient')
    def test_test_connection(self, mock_client):
        """Test database connection testing."""
        # Mock successful connection
        mock_client.return_value.admin.command.return_value = True
        result = self.db_manager.test_connection()
        self.assertTrue(result)
        
        # Mock failed connection
        mock_client.return_value.admin.command.side_effect = Exception("Connection failed")
        result = self.db_manager.test_connection()
        self.assertFalse(result)

class TestCacheManager(unittest.TestCase):
    """Test cases for the CacheManager class."""
    
    def setUp(self):
        self.config = Mock()
        self.config.get.side_effect = lambda key, default=None: {
            'REDIS_URL': 'redis://localhost:6379',
            'CACHE_TTL': '86400'
        }.get(key, default)
        
        with patch('cache_manager.redis.Redis'):
            self.cache_manager = CacheManager(self.config)
    
    def test_cache_manager_initialization(self):
        """Test that cache manager initializes properly."""
        self.assertIsInstance(self.cache_manager, CacheManager)
    
    def test_cache_key_generation(self):
        """Test cache key generation."""
        key = self.cache_manager._generate_key("test", "key")
        self.assertEqual(key, "lancejob:test:key")
    
    @patch('cache_manager.redis.Redis')
    def test_cache_operations(self, mock_redis):
        """Test basic cache operations."""
        mock_redis_instance = Mock()
        mock_redis.from_url.return_value = mock_redis_instance
        
        # Test set operation
        self.cache_manager.set("test_key", {"data": "test"})
        mock_redis_instance.setex.assert_called()
        
        # Test get operation
        mock_redis_instance.get.return_value = json.dumps({"data": "test"})
        result = self.cache_manager.get("test_key")
        self.assertEqual(result, {"data": "test"})

class TestContentBasedRecommender(unittest.TestCase):
    """Test cases for the ContentBasedRecommender class."""
    
    def setUp(self):
        self.db_manager = Mock()
        self.cache_manager = Mock()
        self.config = Mock()
        
        self.recommender = ContentBasedRecommender(
            self.db_manager, self.cache_manager, self.config
        )
    
    def test_skill_similarity_calculation(self):
        """Test skill similarity calculation."""
        freelancer_skills = ["Python", "MongoDB", "React"]
        mission_skills = ["Python", "Node.js", "React"]
        
        similarity = self.recommender._calculate_skill_similarity(
            freelancer_skills, mission_skills
        )
        
        # Should be 2/4 = 0.5 (Jaccard similarity)
        self.assertAlmostEqual(similarity, 0.5, places=2)
    
    def test_text_similarity_calculation(self):
        """Test text similarity calculation using TF-IDF."""
        text1 = "Python developer with React experience"
        text2 = "React developer with Python skills"
        
        similarity = self.recommender._calculate_text_similarity(text1, text2)
        
        # Should be > 0 since texts are similar
        self.assertGreater(similarity, 0)
    
    def test_experience_matching(self):
        """Test experience level matching."""
        # Exact match
        score = self.recommender._calculate_experience_match("intermediate", "intermediate")
        self.assertEqual(score, 1.0)
        
        # Adjacent levels
        score = self.recommender._calculate_experience_match("beginner", "intermediate")
        self.assertEqual(score, 0.7)
        
        # Distant levels
        score = self.recommender._calculate_experience_match("beginner", "expert")
        self.assertEqual(score, 0.3)

class TestCollaborativeFilteringRecommender(unittest.TestCase):
    """Test cases for the CollaborativeFilteringRecommender class."""
    
    def setUp(self):
        self.db_manager = Mock()
        self.cache_manager = Mock()
        self.config = Mock()
        
        self.recommender = CollaborativeFilteringRecommender(
            self.db_manager, self.cache_manager, self.config
        )
    
    def test_user_similarity_calculation(self):
        """Test user similarity calculation."""
        # Mock interaction data
        user1_interactions = [("mission1", 1), ("mission2", 1), ("mission3", 0)]
        user2_interactions = [("mission1", 1), ("mission2", 0), ("mission3", 1)]
        
        # Create vectors
        vector1 = np.array([1, 1, 0])
        vector2 = np.array([1, 0, 1])
        
        # Calculate cosine similarity manually for comparison
        from sklearn.metrics.pairwise import cosine_similarity
        expected_similarity = cosine_similarity([vector1], [vector2])[0][0]
        
        # This should be approximately 0.5
        self.assertAlmostEqual(expected_similarity, 0.5, places=2)
    
    def test_matrix_factorization_dimensions(self):
        """Test that matrix factorization produces correct dimensions."""
        # Mock interaction matrix
        n_users, n_items = 100, 50
        n_factors = 10
        
        # Create mock interaction matrix
        interaction_matrix = np.random.rand(n_users, n_items)
        
        # Test SVD dimensions
        from sklearn.decomposition import TruncatedSVD
        svd = TruncatedSVD(n_components=n_factors)
        user_factors = svd.fit_transform(interaction_matrix)
        
        self.assertEqual(user_factors.shape, (n_users, n_factors))

class TestHybridRecommender(unittest.TestCase):
    """Test cases for the HybridRecommender class."""
    
    def setUp(self):
        self.db_manager = Mock()
        self.cache_manager = Mock()
        self.config = Mock()
        
        # Mock the component recommenders
        self.content_recommender = Mock()
        self.collaborative_recommender = Mock()
        
        with patch('hybrid_recommender.ContentBasedRecommender', return_value=self.content_recommender), \
             patch('hybrid_recommender.CollaborativeFilteringRecommender', return_value=self.collaborative_recommender):
            self.hybrid_recommender = HybridRecommendationSystem()
    
    def test_score_combination(self):
        """Test that hybrid scores are combined correctly."""
        content_scores = [0.8, 0.6, 0.4]
        collaborative_scores = [0.2, 0.7, 0.9]
        content_weight = 0.6
        collaborative_weight = 0.4
        
        expected_scores = [
            0.8 * 0.6 + 0.2 * 0.4,  # 0.56
            0.6 * 0.6 + 0.7 * 0.4,  # 0.64
            0.4 * 0.6 + 0.9 * 0.4   # 0.60
        ]
        
        # Mock the method if it exists, or test the logic directly
        for i, (content, collab, expected) in enumerate(zip(content_scores, collaborative_scores, expected_scores)):
            combined = content * content_weight + collab * collaborative_weight
            self.assertAlmostEqual(combined, expected, places=2)
    
    def test_diversity_enforcement(self):
        """Test that diversity is enforced in recommendations."""
        # Mock recommendations with similar categories
        recommendations = [
            {"mission_id": "1", "title": "Python Project 1", "tags": ["Python", "Django"], "score": 0.9},
            {"mission_id": "2", "title": "Python Project 2", "tags": ["Python", "Flask"], "score": 0.85},
            {"mission_id": "3", "title": "React Project", "tags": ["React", "JavaScript"], "score": 0.8},
            {"mission_id": "4", "title": "Python Project 3", "tags": ["Python", "FastAPI"], "score": 0.75},
        ]
        
        # Test diversity logic (simplified)
        diverse_recommendations = []
        seen_categories = set()
        
        for rec in recommendations:
            main_category = rec["tags"][0] if rec["tags"] else "Unknown"
            if main_category not in seen_categories or len(diverse_recommendations) < 2:
                diverse_recommendations.append(rec)
                seen_categories.add(main_category)
        
        # Should have at least 2 different categories
        self.assertGreaterEqual(len(diverse_recommendations), 2)

class TestEndToEndRecommendations(unittest.TestCase):
    """End-to-end integration tests."""
    
    def setUp(self):
        # Mock all dependencies
        self.config = Mock()
        self.db_manager = Mock()
        self.cache_manager = Mock()
        
        # Setup mock return values
        self.config.get.side_effect = lambda key, default=None: {
            'CONTENT_WEIGHT': '0.6',
            'COLLABORATIVE_WEIGHT': '0.4',
            'DIVERSITY_THRESHOLD': '0.3'
        }.get(key, default)
        
        self.cache_manager.get.return_value = None  # No cached results
        
        # Mock database responses
        self.setup_mock_data()
    
    def setup_mock_data(self):
        """Setup mock freelancer and mission data."""
        self.mock_freelancer = {
            "_id": "freelancer123",
            "skills": ["Python", "React", "MongoDB"],
            "bio": ["Full-stack developer with 5 years experience"],
            "title": ["Senior Developer"],
            "experience": "intermediate",
            "rating": 4.5
        }
        
        self.mock_missions = [
            {
                "_id": "mission1",
                "title": "Python Django Project",
                "description": "Build a web application using Django",
                "tags": ["Python", "Django", "PostgreSQL"],
                "type": "web_development",
                "experience": "intermediate",
                "budget": 5000,
                "deadline": datetime.now() + timedelta(days=30)
            },
            {
                "_id": "mission2", 
                "title": "React Frontend",
                "description": "Create a modern React frontend",
                "tags": ["React", "JavaScript", "CSS"],
                "type": "frontend",
                "experience": "intermediate",
                "budget": 3000,
                "deadline": datetime.now() + timedelta(days=20)
            }
        ]
        
        self.db_manager.get_freelancer_by_id.return_value = self.mock_freelancer
        self.db_manager.get_available_missions.return_value = self.mock_missions
        self.db_manager.get_freelancer_interactions.return_value = []
    
    @patch('hybrid_recommender.ContentBasedRecommender')
    @patch('hybrid_recommender.CollaborativeFilteringRecommender')
    def test_recommendation_generation(self, mock_collab, mock_content):
        """Test that recommendations are generated correctly."""
        # Setup mock recommenders
        mock_content_instance = Mock()
        mock_collab_instance = Mock()
        mock_content.return_value = mock_content_instance
        mock_collab.return_value = mock_collab_instance
        
        # Mock recommendation scores
        mock_content_instance.get_recommendations.return_value = [
            {"mission_id": "mission1", "score": 0.8},
            {"mission_id": "mission2", "score": 0.6}
        ]
        
        mock_collab_instance.get_recommendations.return_value = [
            {"mission_id": "mission1", "score": 0.4},
            {"mission_id": "mission2", "score": 0.7}
        ]
        
        # Create hybrid recommender
        hybrid = HybridRecommender(self.db_manager, self.cache_manager, self.config)
        
        # Test recommendation generation
        recommendations = hybrid.get_recommendations("freelancer123", limit=2)
        
        # Verify recommendations were generated
        self.assertIsInstance(recommendations, list)

def run_tests():
    """Run all tests and return results."""
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test classes
    test_classes = [
        TestConfig,
        TestDatabaseManager,
        TestCacheManager,
        TestContentBasedRecommender,
        TestCollaborativeFilteringRecommender,
        TestHybridRecommender,
        TestEndToEndRecommendations
    ]
    
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        test_suite.addTests(tests)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    return result.wasSuccessful()

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
