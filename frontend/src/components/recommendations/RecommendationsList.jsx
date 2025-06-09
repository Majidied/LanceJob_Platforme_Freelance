import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import RecommendationCard from './RecommendationCard';
import { recommendationAPI } from '../../api/recommendation';

const RecommendationsList = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    limit: 20,
    category: '',
    min_confidence: 0.3,
    experience: '',
    type: '',
    budget_min: '',
    budget_max: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadRecommendations();
    loadAnalytics();
  }, [filters]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await recommendationAPI.getRecommendations(filters);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError('Impossible de charger les recommandations. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await recommendationAPI.getAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      limit: 20,
      category: '',
      min_confidence: 0.3,
      experience: '',
      type: '',
      budget_min: '',
      budget_max: ''
    });
  };

  const handleMissionView = (mission) => {
    // Navigate to mission details page
    console.log('Viewing mission:', mission._id);
    // This would typically use React Router
    // navigate(`/missions/${mission._id}`);
  };

  const handleMissionApply = (mission) => {
    // Navigate to application page or open modal
    console.log('Applying to mission:', mission._id);
    // This would typically open an application modal or navigate to application page
  };

  const handleMissionSave = (mission, saved) => {
    console.log(`Mission ${mission._id} ${saved ? 'saved' : 'unsaved'}`);
    // Update local state or refetch saved missions
  };

  const getConfidenceStats = () => {
    if (!recommendations.length) return null;
    
    const confidences = recommendations.map(r => r.confidence);
    const avg = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const high = confidences.filter(c => c >= 0.7).length;
    
    return { average: avg, highConfidence: high };
  };

  const stats = getConfidenceStats();

  if (loading && !recommendations.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement des recommandations...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Missions recommandées pour vous
            </h1>
            <p className="text-gray-600 mt-2">
              Découvrez des opportunités parfaitement adaptées à votre profil
            </p>
          </div>
          <button
            onClick={loadRecommendations}
            className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Actualiser
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {recommendations.length}
                </div>
                <div className="text-sm text-gray-600">Recommandations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(stats.average * 100)}%
                </div>
                <div className="text-sm text-gray-600">Correspondance moyenne</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.highConfidence}
                </div>
                <div className="text-sm text-gray-600">Correspondances élevées</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center">
              <FunnelIcon className="w-5 h-5 mr-2 text-gray-500" />
              <span className="font-medium text-gray-900">Filtres</span>
            </div>
            {showFilters ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {showFilters && (
            <div className="border-t border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau d'expérience
                  </label>
                  <select
                    value={filters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tous niveaux</option>
                    <option value="debutant">Débutant</option>
                    <option value="intermediaire">Intermédiaire</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de mission
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tous types</option>
                    <option value="fixe">Prix fixe</option>
                    <option value="Taux horaire">Taux horaire</option>
                    <option value="long terme">Long terme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget minimum (€)
                  </label>
                  <input
                    type="number"
                    value={filters.budget_min}
                    onChange={(e) => handleFilterChange('budget_min', e.target.value)}
                    placeholder="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget maximum (€)
                  </label>
                  <input
                    type="number"
                    value={filters.budget_max}
                    onChange={(e) => handleFilterChange('budget_max', e.target.value)}
                    placeholder="∞"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correspondance minimale: {Math.round(filters.min_confidence * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={filters.min_confidence}
                      onChange={(e) => handleFilterChange('min_confidence', parseFloat(e.target.value))}
                      className="w-32"
                    />
                  </div>
                </div>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Recommendations list */}
      {recommendations.length === 0 && !loading && (
        <div className="text-center py-12">
          <AdjustmentsHorizontalIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune recommandation trouvée
          </h3>
          <p className="text-gray-600 mb-4">
            Essayez d'ajuster vos filtres ou de compléter votre profil pour de meilleures recommandations.
          </p>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      <div className="grid gap-6">
        {recommendations.map((rec, index) => (
          <RecommendationCard
            key={rec.mission._id}
            mission={rec.mission}
            confidence={rec.confidence}
            rank={index + 1}
            onView={handleMissionView}
            onApply={handleMissionApply}
            onSave={handleMissionSave}
          />
        ))}
      </div>

      {/* Load more */}
      {recommendations.length >= filters.limit && (
        <div className="text-center mt-8">
          <button
            onClick={() => handleFilterChange('limit', filters.limit + 20)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Charger plus de recommandations
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {loading && recommendations.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <span className="text-sm text-gray-600 mt-2 block">Mise à jour...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsList;
