import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from scipy.sparse import csr_matrix
from datetime import datetime, timedelta
from ..core.config import Config

logger = logging.getLogger(__name__)

class CollaborativeFilteringRecommender:
    """Collaborative filtering using user behavior patterns"""
    
    def __init__(self):
        self.user_item_matrix = None
        self.similarity_matrix = None
        self.svd_model = None
        self.user_mapping = {}
        self.item_mapping = {}
        self.min_interactions = Config.MIN_INTERACTIONS_FOR_CF
        
    def _assign_interaction_score(self, interaction_type: str, duration: Optional[float] = None) -> float:
        """Assign numerical scores to different interaction types"""
        base_scores = {
            'view': 1.0,
            'click': 1.5,
            'detailed_view': 2.0,
            'save': 3.0,
            'apply': 5.0,  # Changed from 'application' to 'apply'
            'contact': 3.5,  # Changed from 'message' to 'contact'
            'hire': 10.0
        }
        
        base_score = base_scores.get(interaction_type, 1.0)
        
        # Adjust score based on view duration for view/click interactions
        if interaction_type in ['view', 'click', 'detailed_view'] and duration:
            # Duration in seconds - longer views indicate more interest
            duration_factor = min(duration / 300.0, 2.0)  # Cap at 5 minutes (300s) = 2x multiplier
            base_score *= (1.0 + duration_factor)
        
        return base_score
    
    def _build_interaction_matrix(self, interactions: List[Dict]) -> Tuple[np.ndarray, Dict, Dict]:
        """Build user-item interaction matrix from interaction data"""
        try:
            logger.info(f"Building interaction matrix from {len(interactions)} interactions")
            
            # Process interactions to get user-item scores
            user_item_scores = {}
            processed_count = 0
            skipped_count = 0
            
            for interaction in interactions:
                freelancer_id = str(interaction.get('freelancer_id', ''))
                mission_id = str(interaction.get('mission_id', ''))
                interaction_type = interaction.get('interaction_type')
                metadata = interaction.get('metadata', {})
                duration = metadata.get('duration') if metadata else None
                timestamp = interaction.get('timestamp')
                
                if not all([freelancer_id, mission_id, interaction_type]):
                    skipped_count += 1
                    continue
                
                processed_count += 1
                
                # Calculate score for this interaction
                score = self._assign_interaction_score(interaction_type, duration)
                
                # Apply time decay for older interactions
                if timestamp:
                    if isinstance(timestamp, str):
                        timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    elif hasattr(timestamp, 'replace'):
                        # Ensure timezone is removed for datetime objects
                        timestamp = timestamp.replace(tzinfo=None)
                    
                    days_old = (datetime.now() - timestamp).days
                    time_decay = np.exp(-days_old / 30.0)  # Decay with 30-day half-life
                    score *= time_decay
                
                # Aggregate scores for same user-item pairs
                key = (freelancer_id, mission_id)
                if key in user_item_scores:
                    user_item_scores[key] += score
                else:
                    user_item_scores[key] = score
            
            logger.info(f"Processed {processed_count} interactions, skipped {skipped_count}")
            logger.info(f"Generated {len(user_item_scores)} unique user-item pairs")
            
            # Filter users and items with minimum interactions
            user_interaction_counts = {}
            item_interaction_counts = {}
            
            for (user_id, item_id), score in user_item_scores.items():
                user_interaction_counts[user_id] = user_interaction_counts.get(user_id, 0) + 1
                item_interaction_counts[item_id] = item_interaction_counts.get(item_id, 0) + 1
            
            logger.info(f"User interaction counts: {dict(sorted(user_interaction_counts.items()))}")
            logger.info(f"Item interaction counts: {dict(sorted(item_interaction_counts.items()))}")
            
            # Keep only users and items with sufficient interactions
            valid_users = {user_id for user_id, count in user_interaction_counts.items() 
                          if count >= self.min_interactions}
            valid_items = {item_id for item_id, count in item_interaction_counts.items() 
                          if count >= 2}  # Minimum 2 interactions for items
            
            logger.info(f"Valid users (>= {self.min_interactions} interactions): {len(valid_users)}")
            logger.info(f"Valid items (>= 2 interactions): {len(valid_items)}")
            
            # Filter interaction matrix
            filtered_scores = {
                (user_id, item_id): score
                for (user_id, item_id), score in user_item_scores.items()
                if user_id in valid_users and item_id in valid_items
            }
            
            logger.info(f"Filtered scores: {len(filtered_scores)}")
            
            if not filtered_scores:
                logger.warning("No sufficient interactions for collaborative filtering")
                return None, {}, {}
            
            # Create mappings
            unique_users = sorted(list(valid_users))
            unique_items = sorted(list(valid_items))
            
            user_mapping = {user_id: idx for idx, user_id in enumerate(unique_users)}
            item_mapping = {item_id: idx for idx, item_id in enumerate(unique_items)}
            
            # Build matrix
            n_users = len(unique_users)
            n_items = len(unique_items)
            matrix = np.zeros((n_users, n_items))
            
            for (user_id, item_id), score in filtered_scores.items():
                user_idx = user_mapping[user_id]
                item_idx = item_mapping[item_id]
                matrix[user_idx, item_idx] = score
            
            logger.info(f"Built interaction matrix: {n_users} users x {n_items} items")
            return matrix, user_mapping, item_mapping
            
        except Exception as e:
            logger.error(f"Error building interaction matrix: {e}")
            return None, {}, {}
    
    def _calculate_user_similarity(self, matrix: np.ndarray) -> np.ndarray:
        """Calculate user-user similarity matrix"""
        try:
            # Normalize user vectors
            user_norms = np.linalg.norm(matrix, axis=1, keepdims=True)
            user_norms[user_norms == 0] = 1  # Avoid division by zero
            normalized_matrix = matrix / user_norms
            
            # Calculate cosine similarity
            similarity_matrix = cosine_similarity(normalized_matrix)
            
            # Remove self-similarity (diagonal)
            np.fill_diagonal(similarity_matrix, 0)
            
            return similarity_matrix
        except Exception as e:
            logger.error(f"Error calculating user similarity: {e}")
            return np.array([])
    
    def _matrix_factorization(self, matrix: np.ndarray, n_components: int = 50) -> Optional[TruncatedSVD]:
        """Apply matrix factorization using SVD"""
        try:
            # Convert to sparse matrix for efficiency
            sparse_matrix = csr_matrix(matrix)
            
            # Apply SVD
            n_components = min(n_components, min(matrix.shape) - 1)
            svd = TruncatedSVD(n_components=n_components, random_state=42)
            svd.fit(sparse_matrix)
            
            logger.info(f"Matrix factorization completed with {n_components} components")
            return svd
        except Exception as e:
            logger.error(f"Error in matrix factorization: {e}")
            return None
    
    def train(self, interactions: List[Dict]) -> bool:
        """Train the collaborative filtering model"""
        try:
            logger.info("Training collaborative filtering model...")
            
            # Build interaction matrix
            matrix, user_mapping, item_mapping = self._build_interaction_matrix(interactions)
            
            if matrix is None:
                logger.warning("Insufficient data for collaborative filtering")
                return False
            
            self.user_item_matrix = matrix
            self.user_mapping = user_mapping
            self.item_mapping = item_mapping
            
            # Calculate user similarity matrix
            self.similarity_matrix = self._calculate_user_similarity(matrix)
            
            # Apply matrix factorization
            self.svd_model = self._matrix_factorization(matrix)
            
            logger.info("Collaborative filtering model trained successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error training collaborative filtering model: {e}")
            return False
    
    def _find_similar_users(self, user_id: str, k: int = 20) -> List[Tuple[str, float]]:
        """Find k most similar users to the given user"""
        if user_id not in self.user_mapping or self.similarity_matrix is None:
            return []
        
        try:
            user_idx = self.user_mapping[user_id]
            user_similarities = self.similarity_matrix[user_idx]
            
            # Get top k similar users
            similar_indices = np.argsort(user_similarities)[::-1][:k]
            
            # Convert back to user IDs
            reverse_user_mapping = {idx: user_id for user_id, idx in self.user_mapping.items()}
            similar_users = []
            
            for idx in similar_indices:
                if user_similarities[idx] > 0:  # Only positive similarities
                    similar_user_id = reverse_user_mapping[idx]
                    similarity_score = user_similarities[idx]
                    similar_users.append((similar_user_id, similarity_score))
            
            return similar_users
        except Exception as e:
            logger.error(f"Error finding similar users: {e}")
            return []
    
    def predict_user_item_score(self, user_id: str, item_id: str) -> float:
        """Predict score for user-item pair using collaborative filtering"""
        if (user_id not in self.user_mapping or 
            item_id not in self.item_mapping or 
            self.user_item_matrix is None):
            return 0.0
        
        try:
            # Method 1: User-based collaborative filtering
            similar_users = self._find_similar_users(user_id, k=10)
            
            if similar_users:
                weighted_scores = []
                similarity_sum = 0
                
                item_idx = self.item_mapping[item_id]
                
                for similar_user_id, similarity in similar_users:
                    if similar_user_id in self.user_mapping:
                        similar_user_idx = self.user_mapping[similar_user_id]
                        item_score = self.user_item_matrix[similar_user_idx, item_idx]
                        
                        if item_score > 0:  # User has interacted with this item
                            weighted_scores.append(similarity * item_score)
                            similarity_sum += similarity
                
                if similarity_sum > 0:
                    user_based_score = sum(weighted_scores) / similarity_sum
                else:
                    user_based_score = 0.0
            else:
                user_based_score = 0.0
            
            # Method 2: Matrix factorization prediction
            svd_score = 0.0
            if self.svd_model:
                user_idx = self.user_mapping[user_id]
                item_idx = self.item_mapping[item_id]
                
                # Reconstruct user-item score using SVD
                user_factors = self.svd_model.transform(self.user_item_matrix[user_idx:user_idx+1])
                item_factors = self.svd_model.components_[:, item_idx]
                svd_score = np.dot(user_factors[0], item_factors)
            
            # Combine both methods
            if user_based_score > 0 and svd_score > 0:
                final_score = 0.6 * user_based_score + 0.4 * svd_score
            elif user_based_score > 0:
                final_score = user_based_score
            elif svd_score > 0:
                final_score = svd_score
            else:
                final_score = 0.0
            
            return max(0.0, min(10.0, final_score))  # Clamp between 0 and 10
            
        except Exception as e:
            logger.error(f"Error predicting user-item score: {e}")
            return 0.0
    
    def recommend_items(self, user_id: str, candidate_items: List[str], limit: int = 20) -> List[Tuple[str, float]]:
        """Generate item recommendations for a user using collaborative filtering"""
        try:
            recommendations = []
            
            for item_id in candidate_items:
                score = self.predict_user_item_score(user_id, item_id)
                if score > 0:
                    recommendations.append((item_id, score))
            
            # Sort by score
            recommendations.sort(key=lambda x: x[1], reverse=True)
            
            logger.info(f"Generated {len(recommendations)} collaborative filtering recommendations for user {user_id}")
            
            return recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Error generating collaborative recommendations: {e}")
            return []
    
    def get_model_stats(self) -> Dict:
        """Get statistics about the collaborative filtering model"""
        stats = {
            "model_trained": self.user_item_matrix is not None,
            "n_users": len(self.user_mapping),
            "n_items": len(self.item_mapping),
            "matrix_density": 0.0,
            "avg_interactions_per_user": 0.0
        }
        
        if self.user_item_matrix is not None:
            total_cells = self.user_item_matrix.size
            non_zero_cells = np.count_nonzero(self.user_item_matrix)
            stats["matrix_density"] = non_zero_cells / total_cells if total_cells > 0 else 0.0
            
            total_interactions = np.sum(self.user_item_matrix > 0)
            stats["avg_interactions_per_user"] = total_interactions / len(self.user_mapping) if len(self.user_mapping) > 0 else 0.0
        
        return stats
    
    def is_trained(self) -> bool:
        """Check if the model is trained and ready"""
        return (self.user_item_matrix is not None and 
                len(self.user_mapping) > 0 and 
                len(self.item_mapping) > 0)
    
    def get_recommendations(self, freelancer_id: str, limit: int = 20) -> List[Dict]:
        """Get recommendations for a freelancer by ID - wrapper for recommend_items"""
        from ..core.database_manager import DatabaseManager
        
        try:
            # Get database manager
            db_manager = DatabaseManager()
            
            # Get available missions
            missions = db_manager.get_available_missions()
            if not missions:
                logger.warning("No available missions found")
                return []
            
            # Get candidate mission IDs
            candidate_items = [str(mission['_id']) for mission in missions]
            
            # Get recommendations using the existing method
            item_scores = self.recommend_items(freelancer_id, candidate_items, limit)
            
            # Convert to detailed recommendations
            recommendations = []
            mission_dict = {str(mission['_id']): mission for mission in missions}
            
            for item_id, score in item_scores:
                if item_id in mission_dict:
                    mission = mission_dict[item_id]
                    recommendations.append({
                        'mission_id': item_id,
                        'mission_title': mission.get('title', 'N/A'),
                        'score': score,
                        'explanation': f'Collaborative filtering score: {score:.3f}',
                        'tags': mission.get('tags', []),
                        'budget': mission.get('budget', 0),
                        'deadline': mission.get('deadline', ''),
                        'description': mission.get('description', '')
                    })
            
            logger.info(f"Generated {len(recommendations)} collaborative filtering recommendations for freelancer {freelancer_id}")
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating collaborative filtering recommendations for {freelancer_id}: {e}")
            return []
