// frontend/src/views/freelancer/offers/OffersList.jsx - VERSION SANS DEBUG
import React, { useEffect, useState, useRef } from 'react';
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
  const [activeTab, setActiveTab] = useState('candidatures');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ Refs pour éviter les refetch multiples
  const initialFetchDone = useRef(false);
  const lastFetchTime = useRef(0);

  const { 
    appliedJobs, 
    offers, 
    loading, 
    error, 
    fetchApplications, 
    fetchOffers,
    currentFreelancerId 
  } = useFreelancer();

  // ✅ Fonction de refresh manuelle - SEULEMENT POUR LES OFFERS
  const handleRefresh = () => {
    const now = Date.now();
    if ((now - lastFetchTime.current) < 2000) {
      console.log('⏳ Refresh too recent, please wait...');
      return;
    }
    
    console.log('🔄 Manual refresh requested');
    lastFetchTime.current = now;
    
    if (currentFreelancerId) {
      fetchOffers(); // Seulement les offers puisque les deux onglets utilisent les mêmes données
    }
  };

  // ✅ FONCTION SANITIZE - MAINTENANT TRAITE TOUJOURS LES MÊMES DONNÉES (offers)
  const sanitizeItem = (item, index) => {
    if (!item || typeof item !== 'object') {
      console.warn(`Item à l'index ${index} est invalide:`, item);
      return null;
    }

    const sanitized = {
      _id: item._id || item.id || `temp-${index}-${Date.now()}`,
      missionTitle: item.missionTitle || item.title || 'Titre non disponible',
      clientName: item.clientName || item.client || 'Client anonyme',
      status: item.status || 'pending',
      skills: Array.isArray(item.skills) ? item.skills : [],
      currency: item.currency || 'MAD',
      timeline: item.timeline || (item.deliveryTime ? `${item.deliveryTime}` : 'Non spécifié'),
      // ✅ Toujours utiliser les mêmes champs puisque c'est les mêmes données
      submittedDate: item.createdAt || item.offerDate || item.appliedAt || item.applicationDate || new Date().toISOString(),
      description: item.offerDescription || item.description || item.coverLetter || item.message || '',
      isApplication: activeTab === 'candidatures' // Juste pour l'affichage visuel
    };

    // ✅ GESTION DU PRIX - TOUJOURS LA MÊME LOGIQUE
    if (typeof item.offerPrice === 'number' && !isNaN(item.offerPrice)) {
      sanitized.price = item.offerPrice;
    } else if (typeof item.proposedPrice === 'number' && !isNaN(item.proposedPrice)) {
      sanitized.price = item.proposedPrice;
    } else {
      const priceStr = item.offerPrice || item.proposedPrice;
      if (typeof priceStr === 'string') {
        const parsed = parseFloat(priceStr);
        sanitized.price = !isNaN(parsed) ? parsed : 0;
      } else {
        sanitized.price = 0;
      }
    }

    return sanitized;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Date inconnue';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Date invalide:', dateString);
        return 'Date invalide';
      }
      
      const now = new Date();
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return "Aujourd'hui";
      if (diffInDays === 1) return "Hier";
      if (diffInDays < 7) return `Il y a ${diffInDays}`;
      if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
      return formatDate(dateString);
    } catch (e) {
      console.error('Erreur parsing date:', dateString, e);
      return 'Date invalide';
    }
  };

  const getStatusDisplay = (status) => {
    return statusLabels[status] || status || 'Statut inconnu';
  };

  const getStatusColor = (status) => {
    return statusColors[status] || statusColors[statusLabels[status]] || "bg-gray-100 text-gray-800";
  };

  // Nettoyage et validation des données
  // ✅ LES DEUX ONGLETS UTILISENT MAINTENANT LES MÊMES DONNÉES (offers)
  const rawData = offers || []; // Toujours utiliser offers pour les deux onglets
  const cleanedData = rawData
    .map((item, index) => sanitizeItem(item, index))
    .filter(item => item !== null);

  const isLoading = loading.offers; // Toujours utiliser le loading des offers
  const currentError = error.offers; // Toujours utiliser l'erreur des offers
  const isEmpty = cleanedData.length === 0;

  // Pagination
  const totalPages = Math.ceil(cleanedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = cleanedData.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">
            Chargement des offres...
          </p>
        </div>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className="p-6">
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-600">Erreur: {currentError}</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 mt-2 text-white bg-red-600 rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!currentFreelancerId) {
    return (
      <div className="p-8 text-center">
        <h3 className="mb-2 text-lg font-semibold text-gray-600">Authentification requise</h3>
        <p className="mb-4 text-gray-500">
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
      {/* Header avec tabs et bouton refresh */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-1">
          <button
            onClick={() => {
              setActiveTab('candidatures');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'candidatures'
                ? 'bg-[#518394] text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Mes Candidatures ({offers?.length || 0})
          </button>
          <button
            onClick={() => {
              setActiveTab('offres');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'offres'
                ? 'bg-[#518394] text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Offres Reçues ({offers?.length || 0})
          </button>
        </div>
        
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 transition-colors rounded-md hover:text-gray-800 hover:bg-gray-100"
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
            {activeTab === 'candidatures' ? (
              <>
                <h3 className="mb-2 text-lg font-semibold text-gray-600">Aucune candidature</h3>
                <p className="text-gray-500">
                  Vous n'avez pas encore de candidatures à afficher. 
                  <br />
                  Les données de candidatures sont basées sur vos offres reçues.
                </p>
              </>
            ) : (
              <>
                <h3 className="mb-2 text-lg font-semibold text-gray-600">Aucune offre reçue</h3>
                <p className="text-gray-500">
                  Vous n'avez pas encore reçu d'offres de clients.
                </p>
              </>
            )}
          </div>
          {activeTab === 'candidatures' && (
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
          {paginatedData.map((displayItem, index) => (
            <div key={displayItem._id} className="p-6 bg-white rounded-lg shadow border border-[#4242425a]">
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h2 className="text-xl font-semibold">
                      {displayItem.missionTitle}
                    </h2>
                    
                    
                  </div>
                  <p className="mb-2 text-sm text-gray-600">
                    Client: {displayItem.clientName}
                  </p>
                  {displayItem.description && (
                    <p className="text-sm text-gray-600">
                      {activeTab === 'candidatures' ? 'Ma proposition: ' : 'Description de l\'offre: '}
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
              <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">
                      {activeTab === 'candidatures' ? 'Prix proposé' : 'Prix offert'}
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
                    <p className="text-sm text-gray-500">
                      {activeTab === 'candidatures' ? 'Date de candidature' : 'Date de réception'}
                    </p>
                    <p className="font-medium">
                      {getRelativeTime(displayItem.submittedDate)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200">
                <button 
                  onClick={() => onViewDetails && onViewDetails(displayItem._id, displayItem)}
                  className="flex items-center gap-2 text-sm font-medium text-blue-500 transition-colors hover:text-blue-700"
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
          ))}

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