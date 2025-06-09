import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  EyeIcon,
  HandRaisedIcon,
  HeartIcon,
  CursorArrowRaysIcon,
  ClockIcon,
  TrendingUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { recommendationAPI } from '../../api/recommendation';

const RecommendationDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await recommendationAPI.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Impossible de charger les statistiques.');
    } finally {
      setLoading(false);
    }
  };

  const getInteractionIcon = (type) => {
    switch (type) {
      case 'view': return EyeIcon;
      case 'click': return CursorArrowRaysIcon;
      case 'apply': return HandRaisedIcon;
      case 'save': return HeartIcon;
      default: return ChartBarIcon;
    }
  };

  const getInteractionColor = (type) => {
    switch (type) {
      case 'view': return 'text-blue-600 bg-blue-100';
      case 'click': return 'text-green-600 bg-green-100';
      case 'apply': return 'text-purple-600 bg-purple-100';
      case 'save': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getInteractionLabel = (type) => {
    switch (type) {
      case 'view': return 'Vues';
      case 'click': return 'Clics';
      case 'apply': return 'Candidatures';
      case 'save': return 'Sauvegardes';
      default: return type;
    }
  };

  const formatPercentage = (value) => {
    return `${Math.round(value * 100)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement des statistiques...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <ChartBarIcon className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune donnée disponible
        </h3>
        <p className="text-gray-600">
          Commencez à interagir avec des missions pour voir vos statistiques.
        </p>
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
              Tableau de bord des recommandations
            </h1>
            <p className="text-gray-600 mt-2">
              Analysez vos interactions et optimisez votre profil
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="24h">Dernières 24h</option>
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
            </select>
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total des interactions
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.total_interactions || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">
              +12% par rapport à la semaine dernière
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Taux de conversion
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.conversion_rate ? formatPercentage(analytics.conversion_rate) : '0%'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUpIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              Candidatures / Vues de recommandations
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Temps moyen sur page
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.avg_time_on_page ? `${Math.round(analytics.avg_time_on_page)}s` : '0s'}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              Engagement moyen par mission
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Recommandations reçues
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.total_recommendations || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <UserGroupIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              Basées sur votre profil et vos interactions
            </span>
          </div>
        </div>
      </div>

      {/* Interaction Types Breakdown */}
      {analytics.interaction_breakdown && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Répartition des interactions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.interaction_breakdown).map(([type, count]) => {
              const IconComponent = getInteractionIcon(type);
              return (
                <div key={type} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getInteractionColor(type)} mb-3`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{getInteractionLabel(type)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Categories */}
      {analytics.top_categories && analytics.top_categories.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Catégories les plus populaires
          </h3>
          <div className="space-y-4">
            {analytics.top_categories.slice(0, 5).map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(category.count / analytics.top_categories[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {category.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {analytics.recent_interactions && analytics.recent_interactions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Activité récente
          </h3>
          <div className="space-y-4">
            {analytics.recent_interactions.slice(0, 10).map((interaction, index) => {
              const IconComponent = getInteractionIcon(interaction.interaction_type);
              return (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                  <div className={`p-2 rounded-full ${getInteractionColor(interaction.interaction_type)}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {getInteractionLabel(interaction.interaction_type)} sur une mission
                    </p>
                    <p className="text-xs text-gray-600">
                      {interaction.mission_title || 'Mission sans titre'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(interaction.timestamp).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations for improvement */}
      <div className="bg-blue-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          💡 Conseils pour améliorer vos recommandations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Complétez votre profil</h4>
            <p className="text-sm text-gray-600">
              Ajoutez plus de compétences et d'expériences pour recevoir des recommandations plus précises.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Interagissez plus</h4>
            <p className="text-sm text-gray-600">
              Plus vous consultez et postulez à des missions, plus nos recommandations s'améliorent.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Mettez à jour vos préférences</h4>
            <p className="text-sm text-gray-600">
              Ajustez vos filtres et préférences pour recevoir des missions plus pertinentes.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Restez actif</h4>
            <p className="text-sm text-gray-600">
              Connectez-vous régulièrement pour découvrir de nouvelles opportunités.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationDashboard;
