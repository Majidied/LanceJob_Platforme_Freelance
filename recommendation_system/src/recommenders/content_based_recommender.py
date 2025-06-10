import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
from ..core.config import Config

logger = logging.getLogger(__name__)

class ContentBasedRecommender:
    """Content-based filtering using skills and project requirements matching"""
    
    def __init__(self):
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.scaler = StandardScaler()
        
    def _extract_features(self, freelancer: Dict) -> Dict:
        """Extract features from freelancer profile"""
        features = {}
        
        # Skills (most important feature)
        skills = freelancer.get('skills', [])
        features['skills'] = ' '.join(skills) if skills else ''
        
        # Bio and title information
        bio = freelancer.get('bio', [])
        title = freelancer.get('title', [])
        
        # Combine bio and title into text features
        text_content = []
        if isinstance(bio, list):
            text_content.extend(bio)
        elif isinstance(bio, str):
            text_content.append(bio)
            
        if isinstance(title, list):
            text_content.extend(title)
        elif isinstance(title, str):
            text_content.append(title)
            
        features['text_content'] = ' '.join(text_content)
        
        # Numerical features
        features['rating'] = float(freelancer.get('rating', 0))
        features['success_rate'] = float(freelancer.get('success', 0))
        features['experience_count'] = len(freelancer.get('history', []))
        
        return features
    
    def _extract_mission_features(self, mission: Dict) -> Dict:
        """Extract features from mission/project"""
        features = {}
        
        # Required skills
        tags = mission.get('tags', [])
        features['skills'] = ' '.join(tags) if tags else ''
        
        # Text content from title and description
        title = mission.get('title', '')
        description = mission.get('description', '')
        features['text_content'] = f"{title} {description}"
        
        # Mission attributes
        features['budget'] = self._normalize_budget(mission.get('budget', '0'))
        features['experience_level'] = self._encode_experience_level(mission.get('experience', 'intermediaire'))
        features['type'] = mission.get('type', 'fixe')
        
        return features
    
    def _normalize_budget(self, budget_str: str) -> float:
        """Normalize budget to a standard scale"""
        try:
            # Extract numeric value from budget string
            import re
            numbers = re.findall(r'\d+', str(budget_str))
            if numbers:
                budget = float(numbers[0])
                # Normalize to 0-1 scale (assuming max budget of 50000)
                return min(budget / 50000.0, 1.0)
            return 0.0
        except:
            return 0.0
    
    def _encode_experience_level(self, experience: str) -> float:
        """Encode experience level to numeric value"""
        experience_map = {
            'debutant': 0.33,
            'intermediaire': 0.66,
            'expert': 1.0
        }
        return experience_map.get(experience.lower(), 0.66)
    
    def calculate_skill_similarity(self, freelancer_skills: List[str], mission_tags: List[str]) -> float:
        """Calculate skill-based similarity between freelancer and mission"""
        if not freelancer_skills or not mission_tags:
            return 0.0
        
        # Convert to sets for intersection calculation
        freelancer_set = set(skill.lower() for skill in freelancer_skills)
        mission_set = set(tag.lower() for tag in mission_tags)
        
        # Calculate Jaccard similarity
        intersection = len(freelancer_set.intersection(mission_set))
        union = len(freelancer_set.union(mission_set))
        
        if union == 0:
            return 0.0
        
        jaccard_similarity = intersection / union
        
        # Bonus for exact skill matches
        exact_matches = intersection
        total_required = len(mission_set)
        skill_coverage = exact_matches / total_required if total_required > 0 else 0
        
        # Weighted combination
        return 0.6 * jaccard_similarity + 0.4 * skill_coverage
    
    def calculate_text_similarity(self, freelancer_text: str, mission_text: str) -> float:
        """Calculate text similarity using TF-IDF"""
        if not freelancer_text.strip() or not mission_text.strip():
            return 0.0
        
        try:
            # Combine texts for vectorization
            texts = [freelancer_text, mission_text]
            
            # Use a simple TF-IDF approach
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(texts)
            
            # Calculate cosine similarity
            similarity_matrix = cosine_similarity(tfidf_matrix)
            
            # Return similarity between freelancer and mission
            return similarity_matrix[0, 1]
        except Exception as e:
            logger.warning(f"Error calculating text similarity: {e}")
            return 0.0
    
    def calculate_experience_match(self, freelancer: Dict, mission: Dict) -> float:
        """Calculate experience level compatibility"""
        freelancer_experience = len(freelancer.get('history', []))
        mission_experience = mission.get('experience', 'intermediaire')
        
        # Map experience levels to numeric ranges
        experience_ranges = {
            'debutant': (0, 5),
            'intermediaire': (3, 15),
            'expert': (10, float('inf'))
        }
        
        min_exp, max_exp = experience_ranges.get(mission_experience, (0, float('inf')))
        
        # Calculate match score
        if min_exp <= freelancer_experience <= max_exp:
            return 1.0
        elif freelancer_experience < min_exp:
            # Freelancer might be underqualified
            gap = min_exp - freelancer_experience
            return max(0.3, 1.0 - (gap * 0.1))
        else:
            # Freelancer might be overqualified (still good but potentially expensive)
            return 0.8
    
    def calculate_quality_score(self, freelancer: Dict) -> float:
        """Calculate freelancer quality score"""
        rating = float(freelancer.get('rating', 0))
        success_rate = float(freelancer.get('success', 0))
        experience_count = len(freelancer.get('history', []))
        
        # Normalize components
        rating_score = rating / 5.0 if rating > 0 else 0.5
        success_score = success_rate / 100.0 if success_rate > 0 else 0.5
        experience_score = min(experience_count / 20.0, 1.0)  # Cap at 20 projects
        
        # Weighted combination
        return 0.4 * rating_score + 0.4 * success_score + 0.2 * experience_score
    
    def recommend_missions(self, freelancer: Dict, missions: List[Dict], limit: int = 20) -> List[Dict]:
        """Generate content-based recommendations for a freelancer"""
        try:
            recommendations = []
            freelancer_features = self._extract_features(freelancer)
            freelancer_skills = freelancer.get('skills', [])
            
            for mission in missions:
                mission_features = self._extract_mission_features(mission)
                mission_tags = mission.get('tags', [])
                
                # Calculate different similarity components
                skill_similarity = self.calculate_skill_similarity(freelancer_skills, mission_tags)
                
                # Skip missions with very low skill match
                if skill_similarity < Config.MIN_SKILL_MATCH_THRESHOLD:
                    continue
                
                text_similarity = self.calculate_text_similarity(
                    freelancer_features['text_content'],
                    mission_features['text_content']
                )
                
                experience_match = self.calculate_experience_match(freelancer, mission)
                quality_score = self.calculate_quality_score(freelancer)
                
                # Calculate overall content-based score
                content_score = (
                    0.5 * skill_similarity +
                    0.2 * text_similarity +
                    0.2 * experience_match +
                    0.1 * quality_score
                )
                
                # Add mission popularity factor (number of applications)
                application_count = len(mission.get('applications', []))
                popularity_factor = min(application_count / 10.0, 1.0)  # Normalize to 0-1
                
                # Final score with small popularity boost
                final_score = content_score + 0.05 * popularity_factor
                
                recommendations.append({
                    'mission': mission,
                    'score': final_score,
                    'components': {
                        'skill_similarity': skill_similarity,
                        'text_similarity': text_similarity,
                        'experience_match': experience_match,
                        'quality_score': quality_score,
                        'popularity_factor': popularity_factor
                    }
                })
            
            # Sort by score and return top recommendations
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            
            logger.info(f"Generated {len(recommendations)} content-based recommendations for freelancer {freelancer.get('_id')}")
            
            return recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Error generating content-based recommendations: {e}")
            return []
    
    def get_feature_importance(self, recommendation: Dict) -> Dict:
        """Get feature importance explanation for a recommendation"""
        components = recommendation.get('components', {})
        total_score = recommendation.get('score', 0)
        
        if total_score == 0:
            return {}
        
        importance = {}
        for component, value in components.items():
            # Calculate relative importance
            importance[component] = {
                'value': value,
                'percentage': (value / total_score) * 100 if total_score > 0 else 0
            }
        
        return importance
    
    def get_recommendations(self, freelancer_id: str, limit: int = 20, filters: Dict = None) -> List[Dict]:
        """Get recommendations for a freelancer (wrapper for recommend_missions)"""
        try:
            from ..core.database_manager import DatabaseManager
            
            db_manager = DatabaseManager()
            
            # Get freelancer data
            freelancer = db_manager.get_freelancer(freelancer_id)
            if not freelancer:
                logger.warning(f"Freelancer {freelancer_id} not found")
                return []
            
            # Get available missions
            missions = db_manager.get_available_missions(filters)
            if not missions:
                logger.info("No available missions found")
                return []
            
            # Get recommendations using existing method
            recommendations = self.recommend_missions(freelancer, missions, limit)
            
            logger.info(f"Generated {len(recommendations)} content-based recommendations for freelancer {freelancer_id}")
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting content-based recommendations: {str(e)}")
            return []
