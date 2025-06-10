import logging
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime
from ..core.config import Config
from ..core.database_manager import DatabaseManager
from ..core.cache_manager import CacheManager
from .content_based_recommender import ContentBasedRecommender
from .collaborative_filtering_recommender import CollaborativeFilteringRecommender

logger = logging.getLogger(__name__)

class HybridRecommendationSystem:
    """Hybrid recommendation system combining content-based and collaborative filtering"""
    
    def __init__(self):
        self.db_manager = DatabaseManager()
        self.cache_manager = CacheManager()
        self.content_recommender = ContentBasedRecommender()
        self.collaborative_recommender = CollaborativeFilteringRecommender()
        
        # Model weights
        self.content_weight = Config.CONTENT_WEIGHT
        self.collaborative_weight = Config.COLLABORATIVE_WEIGHT
        
        # Initialize collaborative filtering model
        self._initialize_collaborative_model()
    
    def _initialize_collaborative_model(self):
        """Initialize collaborative filtering model with existing interaction data"""
        try:
            logger.info("Initializing collaborative filtering model...")
            
            # Try to load from cache first
            cached_matrix = self.cache_manager.get_similarity_matrix()
            if cached_matrix:
                logger.info("Loaded collaborative model from cache")
                # TODO: Implement cache loading logic
                return
            
            logger.info("No cached model found, training from database...")
            
            # Train from database
            interactions = self.db_manager.get_all_interactions()
            logger.info(f"Retrieved {len(interactions)} interactions for training")
            
            if interactions:
                logger.info("Starting collaborative filtering training...")
                success = self.collaborative_recommender.train(interactions)
                logger.info(f"CF training result: {success}")
                
                if success:
                    # Cache the trained model
                    model_data = {
                        'timestamp': datetime.now().isoformat(),
                        'stats': self.collaborative_recommender.get_model_stats()
                    }
                    try:
                        self.cache_manager.set_similarity_matrix(model_data)
                        logger.info("Model cached successfully")
                    except Exception as cache_e:
                        logger.warning(f"Failed to cache model: {cache_e}")
                    
                    logger.info("Collaborative filtering model initialized successfully")
                else:
                    logger.warning("Failed to train collaborative filtering model")
            else:
                logger.warning("No interaction data available for collaborative filtering")
                
        except Exception as e:
            logger.error(f"Error initializing collaborative model: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")


    def get_recommendations(self, freelancer_id: str, limit: int = None, include_applied: bool = False, filters: Dict = None) -> List[Dict]:
        """
        Get hybrid recommendations for a freelancer with advanced filtering
        
        Args:
            freelancer_id (str): The freelancer's unique identifier
            limit (int, optional): Maximum number of recommendations to return. 
                                Defaults to Config.MAX_RECOMMENDATIONS
            include_applied (bool): Whether to include jobs the freelancer already applied to.
                                Defaults to False (excludes applied jobs)
            filters (Dict, optional): Additional filtering criteria:
                - min_budget (float): Minimum project budget
                - max_budget (float): Maximum project budget  
                - experience_level (str): Required experience level ('entry', 'intermediate', 'expert')
                - mission_type (str): Type of mission/project
        
        Returns:
            List[Dict]: List of recommended missions with scores and metadata
        """
        if limit is None:
            limit = Config.MAX_RECOMMENDATIONS
        
        if filters is None:
            filters = {}
        
        # Validate input parameters
        if limit <= 0:
            logger.warning(f"Invalid limit {limit} for freelancer {freelancer_id}, using default")
            limit = Config.MAX_RECOMMENDATIONS
        elif limit > 100:  # Prevent excessive requests
            logger.warning(f"Limit {limit} too high for freelancer {freelancer_id}, capping at 100")
            limit = 100
        
        # Validate filter parameters
        filters = self._validate_and_sanitize_filters(filters)
        
        try:
            # Create cache key that includes all parameters
            cache_key = self._generate_cache_key(freelancer_id, include_applied, filters)
            
            # Check cache first
            cached_recommendations = self.cache_manager.get_recommendations(cache_key)
            if cached_recommendations:
                logger.info(f"Returning cached recommendations for freelancer {freelancer_id} with filters")
                return cached_recommendations[:limit]
            
            # Get freelancer data
            freelancer = self.db_manager.get_freelancer(freelancer_id)
            if not freelancer:
                logger.error(f"Freelancer {freelancer_id} not found")
                return []
            
            # Get candidate missions based on include_applied parameter
            if include_applied:
                # Include all available missions (even those already applied to)
                available_missions = self.db_manager.get_available_missions(filters=filters)
                logger.info(f"Including all missions (including applied) for freelancer {freelancer_id}")
            else:
                # Exclude missions the freelancer has already applied to (default behavior)
                applied_missions = self.db_manager.get_freelancer_applications(freelancer_id)
                available_missions = self.db_manager.get_available_missions(
                    exclude_applied=applied_missions, 
                    filters=filters
                )
                logger.info(f"Excluding {len(applied_missions) if applied_missions else 0} applied missions for freelancer {freelancer_id}")
            
            # Apply additional filtering at the application level
            available_missions = self._apply_advanced_filters(available_missions, filters)
            
            if not available_missions:
                logger.info(f"No available missions for freelancer {freelancer_id} after applying filters: {filters}")
                return []
            
            logger.info(f"Found {len(available_missions)} candidate missions for freelancer {freelancer_id} after filtering")
            
            # Generate content-based recommendations
            content_recommendations = self.content_recommender.recommend_missions(
                freelancer, available_missions, limit * 2  # Get more for better hybrid selection
            )
            
            # Generate collaborative recommendations if model is trained
            collaborative_scores = {}
            if self.collaborative_recommender.is_trained():
                candidate_mission_ids = [str(mission['_id']) for mission in available_missions]
                collaborative_recommendations = self.collaborative_recommender.recommend_items(
                    freelancer_id, candidate_mission_ids, limit * 2
                )
                collaborative_scores = {mission_id: score for mission_id, score in collaborative_recommendations}
                logger.info(f"Generated {len(collaborative_scores)} collaborative scores")
            else:
                logger.info("Collaborative recommender not trained, using content-based only")
            
            # Combine recommendations using hybrid approach
            hybrid_recommendations = self._combine_recommendations(
                content_recommendations, collaborative_scores, limit
            )
            
            # Apply budget-aware ranking if budget filters are specified
            if filters.get('min_budget') or filters.get('max_budget'):
                hybrid_recommendations = self._apply_budget_aware_ranking(
                    hybrid_recommendations, freelancer, filters
                )
            
            # Add diversity and final ranking
            final_recommendations = self._apply_diversity_and_ranking(
                hybrid_recommendations, freelancer, limit
            )
            
            # Add comprehensive metadata
            for rec in final_recommendations:
                rec['metadata'] = {
                    'include_applied': include_applied,
                    'applied_filters': filters,
                    'generated_at': datetime.utcnow().isoformat(),
                    'freelancer_id': freelancer_id,
                    'recommendation_type': 'hybrid' if collaborative_scores else 'content_based',
                    'filter_match_score': self._calculate_filter_match_score(rec, filters)
                }
            
            # Cache the results with the new cache key
            self.cache_manager.set_recommendations(cache_key, final_recommendations)
            
            logger.info(f"Generated {len(final_recommendations)} filtered hybrid recommendations for freelancer {freelancer_id}")
            return final_recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations for freelancer {freelancer_id}: {e}")
            logger.error(f"Exception details: {type(e).__name__}: {str(e)}")
            logger.error(f"Applied filters: {filters}")
            return []

    def _validate_and_sanitize_filters(self, filters: Dict) -> Dict:
        """
        Validate and sanitize filter parameters
        
        Args:
            filters (Dict): Raw filter parameters
            
        Returns:
            Dict: Validated and sanitized filters
        """
        sanitized_filters = {}
        
        # Validate budget filters
        if 'min_budget' in filters:
            try:
                min_budget = float(filters['min_budget'])
                if min_budget >= 0:
                    sanitized_filters['min_budget'] = min_budget
                else:
                    logger.warning(f"Invalid min_budget: {filters['min_budget']}, ignoring")
            except (ValueError, TypeError):
                logger.warning(f"Invalid min_budget format: {filters['min_budget']}, ignoring")
        
        if 'max_budget' in filters:
            try:
                max_budget = float(filters['max_budget'])
                if max_budget >= 0:
                    sanitized_filters['max_budget'] = max_budget
                else:
                    logger.warning(f"Invalid max_budget: {filters['max_budget']}, ignoring")
            except (ValueError, TypeError):
                logger.warning(f"Invalid max_budget format: {filters['max_budget']}, ignoring")
        
        # Ensure min_budget <= max_budget
        if 'min_budget' in sanitized_filters and 'max_budget' in sanitized_filters:
            if sanitized_filters['min_budget'] > sanitized_filters['max_budget']:
                logger.warning(f"min_budget ({sanitized_filters['min_budget']}) > max_budget ({sanitized_filters['max_budget']}), swapping")
                sanitized_filters['min_budget'], sanitized_filters['max_budget'] = \
                    sanitized_filters['max_budget'], sanitized_filters['min_budget']
        
        # Validate experience level
        valid_experience_levels = ['entry', 'intermediate', 'expert', 'any']
        if 'experience_level' in filters:
            exp_level = str(filters['experience_level']).lower().strip()
            if exp_level in valid_experience_levels:
                sanitized_filters['experience_level'] = exp_level
            else:
                logger.warning(f"Invalid experience_level: {filters['experience_level']}, ignoring")
        
        # Validate mission type (you may need to adjust valid types based on your system)
        valid_mission_types = ['fixed', 'hourly', 'project', 'contract', 'any']
        if 'mission_type' in filters:
            mission_type = str(filters['mission_type']).lower().strip()
            if mission_type in valid_mission_types:
                sanitized_filters['mission_type'] = mission_type
            else:
                logger.warning(f"Invalid mission_type: {filters['mission_type']}, ignoring")
        
        return sanitized_filters

    def _generate_cache_key(self, freelancer_id: str, include_applied: bool, filters: Dict) -> str:
        """
        Generate a unique cache key based on all parameters
        
        Args:
            freelancer_id (str): Freelancer ID
            include_applied (bool): Include applied parameter
            filters (Dict): Filter parameters
            
        Returns:
            str: Unique cache key
        """
        import hashlib
        import json
        
        # Create a deterministic string from filters
        filter_string = json.dumps(filters, sort_keys=True)
        filter_hash = hashlib.md5(filter_string.encode()).hexdigest()[:8]
        
        return f"{freelancer_id}_{include_applied}_{filter_hash}"

    def _apply_advanced_filters(self, missions: List[Dict], filters: Dict) -> List[Dict]:
        """
        Apply advanced filtering to missions list
        
        Args:
            missions (List[Dict]): List of available missions
            filters (Dict): Filter criteria
            
        Returns:
            List[Dict]: Filtered missions
        """
        filtered_missions = missions.copy()
        
        # Apply budget filters
        if 'min_budget' in filters:
            min_budget = filters['min_budget']
            filtered_missions = [
                mission for mission in filtered_missions 
                if mission.get('budget', 0) >= min_budget
            ]
            logger.info(f"Applied min_budget filter ({min_budget}): {len(filtered_missions)} missions remaining")
        
        if 'max_budget' in filters:
            max_budget = filters['max_budget']
            filtered_missions = [
                mission for mission in filtered_missions 
                if mission.get('budget', float('inf')) <= max_budget
            ]
            logger.info(f"Applied max_budget filter ({max_budget}): {len(filtered_missions)} missions remaining")
        
        # Apply experience level filter
        if 'experience_level' in filters and filters['experience_level'] != 'any':
            exp_level = filters['experience_level']
            filtered_missions = [
                mission for mission in filtered_missions 
                if mission.get('experienceLevel', '').lower() == exp_level
            ]
            logger.info(f"Applied experience_level filter ({exp_level}): {len(filtered_missions)} missions remaining")
        
        # Apply mission type filter
        if 'mission_type' in filters and filters['mission_type'] != 'any':
            mission_type = filters['mission_type']
            filtered_missions = [
                mission for mission in filtered_missions 
                if mission.get('type', '').lower() == mission_type
            ]
            logger.info(f"Applied mission_type filter ({mission_type}): {len(filtered_missions)} missions remaining")
        
        return filtered_missions

    def _apply_budget_aware_ranking(self, recommendations: List[Dict], freelancer: Dict, filters: Dict) -> List[Dict]:
        """
        Apply budget-aware ranking to boost recommendations within freelancer's preferred range
        
        Args:
            recommendations (List[Dict]): Current recommendations
            freelancer (Dict): Freelancer data
            filters (Dict): Filter criteria including budget preferences
            
        Returns:
            List[Dict]: Re-ranked recommendations
        """
        # Get freelancer's historical budget preferences
        freelancer_avg_budget = self._get_freelancer_avg_budget(freelancer)
        
        for rec in recommendations:
            mission_budget = rec.get('budget', 0)
            
            # Calculate budget compatibility boost
            budget_boost = 0
            
            # If mission budget is within preferred range, boost it
            if 'min_budget' in filters and 'max_budget' in filters:
                if filters['min_budget'] <= mission_budget <= filters['max_budget']:
                    budget_boost += 0.2  # 20% boost for being in preferred range
            
            # If mission budget is close to freelancer's average, boost it
            if freelancer_avg_budget > 0:
                budget_ratio = min(mission_budget, freelancer_avg_budget) / max(mission_budget, freelancer_avg_budget)
                if budget_ratio > 0.8:  # Within 20% of average
                    budget_boost += 0.1  # 10% boost for budget compatibility
            
            # Apply the boost to the recommendation score
            if 'score' in rec:
                rec['score'] = rec['score'] * (1 + budget_boost)
                rec['budget_boost_applied'] = budget_boost
        
        # Re-sort by updated scores
        recommendations.sort(key=lambda x: x.get('score', 0), reverse=True)
        
        return recommendations

    def _calculate_filter_match_score(self, recommendation: Dict, filters: Dict) -> float:
        """
        Calculate how well a recommendation matches the applied filters
        
        Args:
            recommendation (Dict): A single recommendation
            filters (Dict): Applied filter criteria
            
        Returns:
            float: Match score between 0 and 1
        """
        if not filters:
            return 1.0
        
        match_score = 0
        total_filters = 0
        
        # Budget match scoring
        if 'min_budget' in filters or 'max_budget' in filters:
            mission_budget = recommendation.get('budget', 0)
            budget_match = True
            
            if 'min_budget' in filters and mission_budget < filters['min_budget']:
                budget_match = False
            if 'max_budget' in filters and mission_budget > filters['max_budget']:
                budget_match = False
                
            match_score += 1 if budget_match else 0
            total_filters += 1
        
        # Experience level match
        if 'experience_level' in filters and filters['experience_level'] != 'any':
            mission_exp = recommendation.get('experienceLevel', '').lower()
            filter_exp = filters['experience_level']
            match_score += 1 if mission_exp == filter_exp else 0
            total_filters += 1
        
        # Mission type match
        if 'mission_type' in filters and filters['mission_type'] != 'any':
            mission_type = recommendation.get('type', '').lower()
            filter_type = filters['mission_type']
            match_score += 1 if mission_type == filter_type else 0
            total_filters += 1
        
        return match_score / max(total_filters, 1)

    def _get_freelancer_avg_budget(self, freelancer: Dict) -> float:
        """
        Calculate freelancer's average budget from historical projects
        
        Args:
            freelancer (Dict): Freelancer data
            
        Returns:
            float: Average budget of freelancer's previous projects
        """
        try:
            history = freelancer.get('history', [])
            if not history:
                return 0
            
            budgets = [project.get('budget', 0) for project in history if project.get('budget', 0) > 0]
            return sum(budgets) / len(budgets) if budgets else 0
            
        except Exception as e:
            logger.warning(f"Error calculating freelancer average budget: {e}")
            return 0
    
    def _combine_recommendations(self, content_recommendations: List[Dict], 
                                collaborative_scores: Dict[str, float], 
                                limit: int) -> List[Dict]:
        """Combine content-based and collaborative filtering recommendations"""
        try:
            combined_recommendations = []
            
            for content_rec in content_recommendations:
                mission = content_rec['mission']
                mission_id = mission['_id']
                content_score = content_rec['score']
                
                # Get collaborative score if available
                collaborative_score = collaborative_scores.get(mission_id, 0.0)
                
                # Normalize scores to 0-1 range
                normalized_content = min(max(content_score, 0.0), 1.0)
                normalized_collaborative = min(max(collaborative_score / 10.0, 0.0), 1.0)
                
                # Calculate hybrid score
                if collaborative_score > 0:
                    # Both signals available
                    hybrid_score = (
                        self.content_weight * normalized_content +
                        self.collaborative_weight * normalized_collaborative
                    )
                    signal_type = 'hybrid'
                else:
                    # Only content-based signal
                    hybrid_score = normalized_content
                    signal_type = 'content_only'
                
                # Add mission metadata for ranking
                mission_metadata = self._extract_mission_metadata(mission)
                
                combined_recommendations.append({
                    'mission_id': mission_id,
                    'mission': mission,
                    'hybrid_score': hybrid_score,
                    'content_score': normalized_content,
                    'collaborative_score': normalized_collaborative,
                    'signal_type': signal_type,
                    'metadata': mission_metadata,
                    'components': content_rec.get('components', {}),
                    'timestamp': datetime.now().isoformat()
                })
            
            # Sort by hybrid score
            combined_recommendations.sort(key=lambda x: x['hybrid_score'], reverse=True)
            
            return combined_recommendations[:limit * 2]  # Keep extra for diversity selection
            
        except Exception as e:
            logger.error(f"Error combining recommendations: {e}")
            return []
    
    def _extract_mission_metadata(self, mission: Dict) -> Dict:
        """Extract metadata from mission for ranking and diversity"""
        return {
            'budget_range': self._categorize_budget(mission.get('budget', '0')),
            'experience_level': mission.get('experience', 'intermediaire'),
            'mission_type': mission.get('type', 'fixe'),
            'skill_categories': self._categorize_skills(mission.get('tags', [])),
            'recency_days': self._calculate_recency(mission.get('createdAt')),
            'application_count': len(mission.get('applications', [])),
            'client_id': mission.get('client', '')
        }
    
    def _categorize_budget(self, budget_str: str) -> str:
        """Categorize budget into ranges"""
        try:
            import re
            numbers = re.findall(r'\d+', str(budget_str))
            if numbers:
                budget = float(numbers[0])
                if budget < 500:
                    return 'low'
                elif budget < 2000:
                    return 'medium'
                elif budget < 5000:
                    return 'high'
                else:
                    return 'premium'
            return 'unknown'
        except:
            return 'unknown'
    
    def _categorize_skills(self, skills: List[str]) -> List[str]:
        """Categorize skills into broader categories"""
        skill_categories = {
            'frontend': ['JavaScript', 'React', 'Vue.js', 'Angular', 'HTML', 'CSS', 'Sass', 'Redux', 'TypeScript'],
            'backend': ['Node.js', 'Python', 'Django', 'Express', 'PHP', 'Laravel', 'Java', 'Spring Boot', 'C#', '.NET'],
            'database': ['MongoDB', 'PostgreSQL', 'MySQL'],
            'mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin'],
            'devops': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD'],
            'design': ['Figma', 'UI/UX', 'Adobe Photoshop'],
            'testing': ['Jest', 'Testing Library', 'Cypress'],
            'tools': ['Git', 'JIRA', 'Webpack', 'Babel', 'ESLint']
        }
        
        categories = []
        for skill in skills:
            for category, category_skills in skill_categories.items():
                if skill in category_skills and category not in categories:
                    categories.append(category)
        
        return categories if categories else ['general']
    
    def _calculate_recency(self, created_at) -> int:
        """Calculate days since mission was created"""
        try:
            if isinstance(created_at, str):
                created_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            elif created_at:
                created_date = created_at
            else:
                return 999  # Very old
            
            return (datetime.now() - created_date.replace(tzinfo=None)).days
        except:
            return 999
    
    def _apply_diversity_and_ranking(self, recommendations: List[Dict], 
                                   freelancer: Dict, limit: int) -> List[Dict]:
        """Apply diversity constraints and final ranking"""
        try:
            if not recommendations:
                return []
            
            # Apply diversity constraints
            diverse_recommendations = self._ensure_diversity(recommendations, limit)
            
            # Final ranking with additional factors
            final_recommendations = []
            
            for rec in diverse_recommendations:
                mission = rec['mission']
                
                # Add recency boost for newer missions
                recency_boost = max(0, 1.0 - (rec['metadata']['recency_days'] / 30.0)) * 0.1
                
                # Add popularity factor (moderate application count is good)
                app_count = rec['metadata']['application_count']
                if app_count == 0:
                    popularity_factor = 0.05  # New mission bonus
                elif 1 <= app_count <= 5:
                    popularity_factor = 0.1   # Sweet spot
                elif 6 <= app_count <= 15:
                    popularity_factor = 0.05  # Still good
                else:
                    popularity_factor = -0.05  # Too competitive
                
                # Calculate final score
                final_score = rec['hybrid_score'] + recency_boost + popularity_factor
                
                final_recommendations.append({
                    'mission_id': rec['mission_id'],
                    'mission': {
                        '_id': mission['_id'],
                        'title': mission['title'],
                        'description': mission['description'],
                        'tags': mission['tags'],
                        'budget': mission['budget'],
                        'deadline': mission['deadline'],
                        'type': mission['type'],
                        'experience': mission['experience'],
                        'client': mission['client']
                    },
                    'score': final_score,
                    'content_score': rec['content_score'],
                    'collaborative_score': rec['collaborative_score'],
                    'signal_type': rec['signal_type'],
                    'explanation': self._generate_explanation(rec, freelancer),
                    'match_reasons': self._generate_match_reasons(rec, freelancer),
                    'recommended_at': rec['timestamp']
                })
            
            # Sort by final score
            final_recommendations.sort(key=lambda x: x['score'], reverse=True)
            
            return final_recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Error applying diversity and ranking: {e}")
            return recommendations[:limit]
    
    def _ensure_diversity(self, recommendations: List[Dict], limit: int) -> List[Dict]:
        """Ensure diversity in recommendations across different dimensions"""
        if len(recommendations) <= limit:
            return recommendations
        
        try:
            diverse_recs = []
            used_categories = set()
            used_budgets = set()
            used_types = set()
            used_clients = set()
            
            # First pass: pick top recommendations with diversity constraints
            for rec in recommendations:
                if len(diverse_recs) >= limit:
                    break
                
                metadata = rec['metadata']
                
                # Check diversity constraints
                should_add = True
                
                # Skill category diversity
                skill_categories = set(metadata['skill_categories'])
                if skill_categories.intersection(used_categories) and len(diverse_recs) > limit // 2:
                    # Allow some overlap after filling half
                    continue
                
                # Budget diversity
                budget_range = metadata['budget_range']
                if budget_range in used_budgets and len(diverse_recs) > limit // 3:
                    continue
                
                # Client diversity (avoid too many from same client)
                client_id = metadata['client_id']
                if used_clients.count(client_id) >= 2:  # Max 2 per client
                    continue
                
                if should_add:
                    diverse_recs.append(rec)
                    used_categories.update(skill_categories)
                    used_budgets.add(budget_range)
                    used_types.add(metadata['mission_type'])
                    used_clients.add(client_id)
            
            # Second pass: fill remaining slots with best remaining recommendations
            remaining_slots = limit - len(diverse_recs)
            if remaining_slots > 0:
                remaining_recs = [rec for rec in recommendations if rec not in diverse_recs]
                diverse_recs.extend(remaining_recs[:remaining_slots])
            
            return diverse_recs
            
        except Exception as e:
            logger.error(f"Error ensuring diversity: {e}")
            return recommendations[:limit]
    
    def _generate_explanation(self, recommendation: Dict, freelancer: Dict) -> str:
        """Generate human-readable explanation for recommendation"""
        try:
            mission = recommendation['mission']
            signal_type = recommendation['signal_type']
            
            if signal_type == 'hybrid':
                explanation = f"Recommended based on your skills and similar freelancers' preferences"
            elif signal_type == 'content_only':
                explanation = f"Recommended based on your skills and profile"
            else:
                explanation = f"Recommended based on community preferences"
            
            # Add specific skill matches
            freelancer_skills = set(skill.lower() for skill in freelancer.get('skills', []))
            mission_skills = set(skill.lower() for skill in mission.get('tags', []))
            matching_skills = freelancer_skills.intersection(mission_skills)
            
            if matching_skills:
                skills_str = ', '.join(list(matching_skills)[:3])  # Show up to 3 skills
                explanation += f". Matches your skills: {skills_str}"
            
            return explanation
            
        except Exception as e:
            logger.error(f"Error generating explanation: {e}")
            return "Recommended based on your profile"
    
    def _generate_match_reasons(self, recommendation: Dict, freelancer: Dict) -> List[str]:
        """Generate specific reasons why this mission matches the freelancer"""
        try:
            reasons = []
            mission = recommendation['mission']
            components = recommendation.get('components', {})
            
            # Skill matching reasons
            freelancer_skills = set(skill.lower() for skill in freelancer.get('skills', []))
            mission_skills = set(skill.lower() for skill in mission.get('tags', []))
            matching_skills = freelancer_skills.intersection(mission_skills)
            
            if matching_skills:
                skill_match_pct = len(matching_skills) / len(mission_skills) * 100
                if skill_match_pct >= 80:
                    reasons.append(f"Perfect skill match ({len(matching_skills)} required skills)")
                elif skill_match_pct >= 50:
                    reasons.append(f"Good skill match ({len(matching_skills)} of {len(mission_skills)} required skills)")
                else:
                    reasons.append(f"Partial skill match ({len(matching_skills)} matching skills)")
            
            # Experience level matching
            if components.get('experience_match', 0) > 0.8:
                reasons.append("Experience level matches requirements")
            
            # Budget attractiveness
            budget = recommendation['metadata']['budget_range']
            if budget in ['high', 'premium']:
                reasons.append("High-value project")
            
            # Recency
            if recommendation['metadata']['recency_days'] <= 3:
                reasons.append("Recently posted")
            
            # Low competition
            if recommendation['metadata']['application_count'] <= 2:
                reasons.append("Low competition")
            
            # Quality client (if we have this data)
            # reasons.append("Verified client")
            
            return reasons[:4]  # Limit to 4 reasons
            
        except Exception as e:
            logger.error(f"Error generating match reasons: {e}")
            return ["Recommended based on your profile"]
    
    def track_interaction(self, interaction_data: Dict) -> bool:
        """Track user interaction for improving recommendations"""
        try:
            # Validate interaction data
            required_fields = ['freelancer_id', 'mission_id', 'type']
            if not all(field in interaction_data for field in required_fields):
                logger.error("Missing required fields in interaction data")
                return False
            
            # Add to cache for real-time updates
            success = self.cache_manager.add_interaction(
                interaction_data['freelancer_id'], 
                interaction_data
            )
            
            # Save to database
            db_success = self.db_manager.save_interaction(interaction_data)
            
            # Invalidate user's cached recommendations if it's a significant interaction
            significant_interactions = ['application', 'save', 'hire']
            if interaction_data['type'] in significant_interactions:
                self.cache_manager.invalidate_user_cache(interaction_data['freelancer_id'])
            
            logger.info(f"Tracked interaction: {interaction_data['type']} for freelancer {interaction_data['freelancer_id']}")
            
            return success and db_success
            
        except Exception as e:
            logger.error(f"Error tracking interaction: {e}")
            return False
    
    def retrain_model(self) -> bool:
        """Retrain the collaborative filtering model with latest data"""
        try:
            logger.info("Retraining recommendation model...")
            
            # Get latest interaction data
            interactions = self.db_manager.get_all_interactions()
            
            if not interactions:
                logger.warning("No interaction data available for retraining")
                return False
            
            # Retrain collaborative filtering model
            success = self.collaborative_recommender.train(interactions)
            
            if success:
                # Update cache with new model
                model_data = {
                    'timestamp': datetime.now().isoformat(),
                    'stats': self.collaborative_recommender.get_model_stats()
                }
                self.cache_manager.set_similarity_matrix(model_data)
                
                # Invalidate all cached recommendations
                self.cache_manager.invalidate_all_recommendations()
                
                logger.info("Model retrained successfully")
                return True
            else:
                logger.error("Failed to retrain model")
                return False
                
        except Exception as e:
            logger.error(f"Error retraining model: {e}")
            return False
    
    def get_system_stats(self) -> Dict:
        """Get system statistics and health metrics"""
        try:
            # Get cache stats
            cache_stats = self.cache_manager.get_cache_stats()
            
            # Get collaborative model stats
            cf_stats = self.collaborative_recommender.get_model_stats()
            
            # Get database stats
            total_freelancers = len(self.db_manager.get_all_freelancers())
            total_missions = len(self.db_manager.get_available_missions())
            total_interactions = len(self.db_manager.get_all_interactions())
            
            return {
                'system_status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'database': {
                    'total_freelancers': total_freelancers,
                    'total_missions': total_missions,
                    'total_interactions': total_interactions
                },
                'collaborative_filtering': cf_stats,
                'cache': cache_stats,
                'configuration': {
                    'content_weight': self.content_weight,
                    'collaborative_weight': self.collaborative_weight,
                    'max_recommendations': Config.MAX_RECOMMENDATIONS,
                    'min_skill_match_threshold': Config.MIN_SKILL_MATCH_THRESHOLD
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting system stats: {e}")
            return {
                'system_status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def close(self):
        """Clean up resources"""
        try:
            self.db_manager.close()
            logger.info("Recommendation system closed successfully")
        except Exception as e:
            logger.error(f"Error closing recommendation system: {e}")
