import React, { useEffect, useState } from 'react';
import { useFreelancer } from '../../../context/FreelancerContext';
import { Eye, MessageCircle, Calendar, DollarSign, Clock, RefreshCw } from 'lucide-react';

const statusColors = {
  "pending": "bg-yellow-100 text-yellow-800",
  "En attente": "bg-yellow-100 text-yellow-800",
  "accepted": "bg-green-100 text-green-800",
  "Accepté": "bg-green-100 text-green-800",
  "rejected": "bg-red-100 text-red-800",
  "Refusé": "bg-red-100 text-red-800",
  "in_progress": "bg-blue-100 text-blue-800",
  "En cours": "bg-blue-100 text-blue-800",
  "completed": "bg-purple-100 text-purple-800",
  "Terminé": "bg-purple-100 text-purple-800"
};

const statusLabels = {
  "pending": "En attente",
  "accepted": "Accepté",
  "rejected": "Refusé",
  "in_progress": "En cours",
  "completed": "Terminé"
};

const OffersList = ({ onViewDetails }) => {
  const [activeTab, setActiveTab] = useState('applications');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Utiliser le FreelancerContext
  const { 
    appliedJobs, 
    offers, 
    loading, 
    error, 
    fetchApplications, 
    fetchOffers,
    currentFreelancerId 
  } = useFreelancer();

  // Charger les données au montage
  useEffect(() => {
    console.log('🚀 OffersList mounted, current freelancer:', currentFreelancerId);
    if (currentFreelancerId) {
      fetchApplications();
      fetchOffers();
    }
  }, [currentFreelancerId]);

  // Debug logs
  console.log('🔍 OffersList component state:', {
    activeTab,
    appliedJobs: appliedJobs?.length,
    offers: offers?.length,
    loading,
    error,
    currentFreelancerId
  });

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fonction pour calculer le temps relatif
  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Aujourd'hui";
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
    return formatDate(dateString);
  };

  // Fonction pour obtenir le statut avec fallback
  const getStatusDisplay = (status) => {
    return statusLabels[status] || status || 'Statut inconnu';
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    return statusColors[status] || statusColors[statusLabels[status]] || "bg-gray-100 text-gray-800";
  };

  // Rafraîchir les données
  const handleRefresh = () => {
    console.log('🔄 Refreshing data...');
    if (currentFreelancerId) {
      fetchApplications();
      fetchOffers();
    }
  };

  // Déterminer les données à afficher selon l'onglet actif
  const currentData = activeTab === 'applications' ? (appliedJobs || []) : (offers || []);
  const isLoading = activeTab === 'applications' ? loading.appliedJobs : loading.offers;
  const currentError = activeTab === 'applications' ? error.appliedJobs : error.offers;
  const isEmpty = !currentData || currentData.length === 0;

  // Pagination
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = currentData.slice(startIndex, endIndex);

  // Debug la pagination
  console.log('📊 Pagination:', {
    totalItems: currentData.length,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    paginatedItems: paginatedData.length
  });

  // Gestion du loading
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Chargement des {activeTab === 'applications' ? 'candidatures' : 'offres'}...
          </p>
        </div>
      </div>
    );
  }

  // Gestion des erreurs
  if (currentError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Erreur: {currentError}</p>
          <button 
            onClick={handleRefresh}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Si pas d'authentification
  if (!currentFreelancerId) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Authentification requise</h3>
        <p className="text-gray-500 mb-4">
          Vous devez être connecté pour voir vos candidatures et offres.
        </p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-[#518394] text-white rounded hover:bg-[#406c7a]"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Debug info temporaire */}
      <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
        <p><strong>Active Tab:</strong> {activeTab}</p>
        <p><strong>Applied Jobs:</strong> {appliedJobs?.length || 0}</p>
        <p><strong>Offers:</strong> {offers?.length || 0}</p>
        <p><strong>Current Data:</strong> {currentData?.length || 0}</p>
        <p><strong>Is Empty:</strong> {isEmpty.toString()}</p>
        <p><strong>Loading:</strong> {JSON.stringify(loading)}</p>
      </div>

      {/* Header avec tabs et bouton refresh */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-1">
          <button
            onClick={() => {
              setActiveTab('applications');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'applications'
                ? 'bg-[#518394] text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Mes Candidatures ({appliedJobs?.length || 0})
          </button>
          <button
            onClick={() => {
              setActiveTab('offers');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'offers'
                ? 'bg-[#518394] text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Offres Reçues ({offers?.length || 0})
          </button>
        </div>
        
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          title="Actualiser"
        >
          <RefreshCw size={16} />
          <span className="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      {/* Contenu */}
      {isEmpty ? (
        <div className="text-center p-8 bg-white rounded-lg shadow border border-[#4242425a]">
          <div className="mb-4">
            {activeTab === 'applications' ? (
              <>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune candidature</h3>
                <p className="text-gray-500">
                  Vous n'avez pas encore postulé à des missions. 
                  <br />
                  Explorez les missions disponibles et postulez !
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune offre reçue</h3>
                <p className="text-gray-500">
                  Vous n'avez pas encore reçu d'offres directes de clients.
                </p>
              </>
            )}
          </div>
          {activeTab === 'applications' && (
            <button 
              onClick={() => window.location.href = '/freelancer/home'}
              className="px-4 py-2 bg-[#518394] text-white rounded hover:bg-[#406c7a]"
            >
              Voir les missions
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedData
            .filter(item => item && typeof item === 'object') // Sécurité supplémentaire
             .map((item, index) => {
               const isApplication = activeTab === 'applications' || item.isApplication;
               const displayItem = {
                 id: item._id || item.id || index,
                 title: item.missionTitle || item.title || 'Titre non disponible',
                 client: item.clientName || item.client || 'Client anonyme',
                 status: item.status || 'pending',
                 skills: Array.isArray(item.skills) ? item.skills : [],
                 price: typeof item.offerPrice === 'number'
                   ? item.offerPrice
                   : typeof item.proposedPrice === 'number'
                     ? item.proposedPrice
                     : 'Non spécifié',
                 currency: item.currency || 'MAD',
                 timeline: item.timeline || (item.deliveryTime ? `${item.deliveryTime} jours` : 'Non spécifié'),
                 submittedDate: item.createdAt || item.appliedAt || item.applicationDate,
                 description: item.offerDescription || item.coverLetter || item.description,
                 isApplication: Boolean(item.isApplication || isApplication)
            };

            return (
              <div key={displayItem.id} className="p-6 bg-white rounded-lg shadow border border-[#4242425a]">
                {/* Debug info temporaire */}
                <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
                  <p>Type: {displayItem.isApplication ? 'Application' : 'Offer'} | Status: {displayItem.status}</p>
                  <p>Original data keys: {Object.keys(item).join(', ')}</p>
                </div>
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">
                      {displayItem.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-2">
                      Client: {displayItem.client}
                    </p>
                    {displayItem.description && (
                      <p className="text-sm text-gray-600">
                        {displayItem.description.substring(0, 150)}
                        {displayItem.description.length > 150 ? '...' : ''}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4 ${getStatusColor(displayItem.status)}`}>
                    {getStatusDisplay(displayItem.status)}
                  </span>
                </div>
                
                {/* Skills */}
                {displayItem.skills && displayItem.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {displayItem.skills.map((skill, skillIndex) => (
                      <span key={skillIndex} className="px-3 py-1 text-sm text-gray-800 border rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Prix et délai */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">
                        {displayItem.isApplication ? 'Prix proposé' : 'Prix offert'}
                      </p>
                      <p className="font-medium">{displayItem.price} {displayItem.currency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Délai</p>
                      <p className="font-medium">{displayItem.timeline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Date de candidature</p>
                      <p className="font-medium">
                        {getRelativeTime(displayItem.submittedDate)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => onViewDetails && onViewDetails(displayItem.id, item)}
                    className="flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <Eye size={16} />
                    Voir les détails
                  </button>
                  
                  {displayItem.status === "accepted" && (
                    <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#33647E] rounded hover:bg-[#224254] transition-colors">
                      <MessageCircle size={16} />
                      Contacter le client
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm bg-gray-200 rounded disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="px-3 py-2 text-sm bg-gray-100 rounded">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm bg-gray-200 rounded disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OffersList;