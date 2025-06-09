import React, { useState } from 'react';
import { 
  ClockIcon, 
  CurrencyDollarIcon, 
  UserIcon, 
  TagIcon,
  HeartIcon,
  EyeIcon,
  ChevronRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { recommendationAPI } from '../../api/recommendation';

const RecommendationCard = ({ 
  mission, 
  confidence, 
  rank, 
  onView, 
  onApply, 
  onSave,
  className = '' 
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isViewTracked, setIsViewTracked] = useState(false);

  // Track view interaction when card comes into viewport
  React.useEffect(() => {
    if (!isViewTracked) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            handleTrackView();
            setIsViewTracked(true);
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );

      const cardElement = document.getElementById(`mission-card-${mission._id}`);
      if (cardElement) {
        observer.observe(cardElement);
      }

      return () => observer.disconnect();
    }
  }, [mission._id, isViewTracked]);

  const handleTrackView = async () => {
    try {
      await recommendationAPI.trackInteraction({
        mission_id: mission._id,
        interaction_type: 'view',
        metadata: {
          confidence_score: confidence,
          recommendation_rank: rank,
          view_timestamp: new Date().toISOString()
        }
      });
      onView?.(mission);
    } catch (error) {
      console.error('Failed to track view interaction:', error);
    }
  };

  const handleCardClick = async () => {
    try {
      await recommendationAPI.trackInteraction({
        mission_id: mission._id,
        interaction_type: 'click',
        metadata: {
          confidence_score: confidence,
          recommendation_rank: rank,
          click_timestamp: new Date().toISOString()
        }
      });
      // Navigate to mission details or trigger callback
      onView?.(mission);
    } catch (error) {
      console.error('Failed to track click interaction:', error);
    }
  };

  const handleSaveToggle = async () => {
    try {
      const newSavedState = !isSaved;
      setIsSaved(newSavedState);
      
      await recommendationAPI.trackInteraction({
        mission_id: mission._id,
        interaction_type: newSavedState ? 'save' : 'unsave',
        metadata: {
          confidence_score: confidence,
          recommendation_rank: rank
        }
      });
      
      onSave?.(mission, newSavedState);
    } catch (error) {
      console.error('Failed to track save interaction:', error);
      setIsSaved(!isSaved); // Revert on error
    }
  };

  const handleApplyClick = async (e) => {
    e.stopPropagation();
    try {
      await recommendationAPI.trackInteraction({
        mission_id: mission._id,
        interaction_type: 'apply',
        metadata: {
          confidence_score: confidence,
          recommendation_rank: rank,
          apply_timestamp: new Date().toISOString()
        }
      });
      
      onApply?.(mission);
    } catch (error) {
      console.error('Failed to track apply interaction:', error);
    }
  };

  const formatBudget = (budget) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(budget);
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expiré';
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Demain';
    if (diffDays < 7) return `${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-blue-600 bg-blue-100';
    if (confidence >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getExperienceColor = (experience) => {
    switch (experience) {
      case 'expert': return 'text-red-600 bg-red-100';
      case 'intermediaire': return 'text-yellow-600 bg-yellow-100';
      case 'debutant': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div
      id={`mission-card-${mission._id}`}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 ${className}`}
      onClick={handleCardClick}
    >
      {/* Header with confidence score and rank */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(confidence)}`}>
              <StarIcon className="w-3 h-3 mr-1" />
              {Math.round(confidence * 100)}% match
            </span>
            <span className="text-xs text-gray-500">#{rank}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSaveToggle();
            }}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            {isSaved ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {mission.title}
          </h3>
          <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getExperienceColor(mission.experience)}`}>
            {mission.experience}
          </span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {mission.description}
        </p>

        {/* Tags */}
        {mission.tags && mission.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {mission.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {mission.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{mission.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Mission details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <CurrencyDollarIcon className="w-4 h-4 mr-2" />
            <span className="font-medium">{formatBudget(mission.budget)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="w-4 h-4 mr-2" />
            <span>{formatDeadline(mission.deadline)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <UserIcon className="w-4 h-4 mr-2" />
            <span className="capitalize">{mission.type}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <EyeIcon className="w-4 h-4 mr-2" />
            <span>{mission.applications?.length || 0} candidatures</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <button
            onClick={handleCardClick}
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Voir détails
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </button>
          <button
            onClick={handleApplyClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Postuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
