// frontend/src/views/freelancer/offers/OffersList.jsx - CORRECTION SIMPLE
import React, { useEffect, useState, useRef } from 'react';
import { useFreelancer } from '../../../context/FreelancerContext';
import { Eye, MessageCircle, Calendar, DollarSign, Clock, RefreshCw } from 'lucide-react';

const DebugApplications = ({ appliedJobs }) => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold text-yellow-800 mb-2">🐛 Debug - Données brutes des candidatures</h3>
      
      {appliedJobs && appliedJobs.length > 0 ? (
        <div className="space-y-3">
          {appliedJobs.slice(0, 2).map((app, index) => (
            <div key={index} className="p-3 bg-white rounded border">
              <h4 className="font-semibold text-sm mb-2">Candidature {index + 1}:</h4>
              <div className="text-xs space-y-1">
                <div><strong>_id:</strong> {app._id}</div>
                <div><strong>missionTitle:</strong> {app.missionTitle}</div>
                <div><strong>proposedPrice:</strong> {app.proposedPrice} (type: {typeof app.proposedPrice})</div>
                <div><strong>offerPrice:</strong> {app.offerPrice} (type: {typeof app.offerPrice})</div>
                <div><strong>appliedAt:</strong> {app.appliedAt}</div>
                <div><strong>submittedDate:</strong> {app.submittedDate}</div>
                <div><strong>currency:</strong> {app.currency}</div>
                <div><strong>status:</strong> {app.status}</div>
                <div><strong>timeline:</strong> {app.timeline}</div>
                <div><strong>deliveryTime:</strong> {app.deliveryTime}</div>
              </div>
              
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-semibold">Voir objet complet</summary>
                <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
                  {JSON.stringify(app, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-yellow-700">Aucune candidature trouvée</p>
      )}
    </div>
  );
};

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

  // ✅ Fonction de refresh manuelle uniquement
  const handleRefresh = () => {
    const now = Date.now();
    if ((now - lastFetchTime.current) < 2000) {
      console.log('⏳ Refresh too recent, please wait...');
      return;
    }
    
    console.log('🔄 Manual refresh requested');
    lastFetchTime.current = now;
    
    if (currentFreelancerId) {
      fetchApplications();
      fetchOffers();
    }
  };

  // ✅ FONCTION SANITIZE CORRIGÉE POUR LES CANDIDATURES
  const sanitizeItem = (item, index) => {
    if (!item || typeof item !== 'object') {
      console.warn(`Item à l'index ${index} est invalide:`, item);
      return null;
    }

    console.log(`🔍 Sanitizing ${activeTab} item ${index}:`, item);

    const sanitized = {
      _id: item._id || item.id || `temp-${index}-${Date.now()}`,
      missionTitle: item.missionTitle || item.title || 'Titre non disponible',
      clientName: item.clientName || item.client || 'Client anonyme',
      status: item.status || 'pending',
      skills: Array.isArray(item.skills) ? item.skills : [],
      currency: item.currency || 'MAD',
      timeline: item.timeline || (item.deliveryTime ? `${item.deliveryTime} jours` : 'Non spécifié'),
      // ✅ CORRECTION DATE : appliedAt en premier pour les candidatures
      submittedDate: item.appliedAt || item.applicationDate || item.createdAt || new Date().toISOString(),
      description: item.offerDescription || item.coverLetter || item.description || '',
      isApplication: Boolean(item.isApplication || activeTab === 'applications')
    };

    // ✅ CORRECTION PRIX : proposedPrice en priorité pour les candidatures
    if (activeTab === 'applications') {
      // Pour les candidatures
      if (typeof item.proposedPrice === 'number' && item.proposedPrice > 0) {
        sanitized.price = item.proposedPrice;
        console.log(`💰 Candidature ${index} - Using proposedPrice: ${item.proposedPrice}`);
      } else if (typeof item.offerPrice === 'number' && item.offerPrice > 0) {
        sanitized.price = item.offerPrice;
        console.log(`💰 Candidature ${index} - Using offerPrice: ${item.offerPrice}`);
      } else {
        sanitized.price = 0;
        console.warn(`❌ Candidature ${index} - No valid price found:`, item);
      }
    } else {
      // Pour les offres (logique existante)
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
    }

    console.log(`✅ Sanitized ${activeTab} item ${index} - Price: ${sanitized.price}, Date: ${sanitized.submittedDate}`);
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
      
      console.log(`📅 Date calculation for ${activeTab}: ${dateString} -> ${diffInDays} jours`);
      
      if (diffInDays === 0) return "Aujourd'hui";
      if (diffInDays === 1) return "Hier";
      if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
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
  const rawData = activeTab === 'applications' ? (appliedJobs || []) : (offers || []);
  const cleanedData = rawData
    .map((item, index) => sanitizeItem(item, index))
    .filter(item => item !== null);

  const isLoading = activeTab === 'applications' ? loading.appliedJobs : loading.offers;
  const currentError = activeTab === 'applications' ? error.appliedJobs : error.offers;
  const isEmpty = cleanedData.length === 0;

  // Pagination
  const totalPages = Math.ceil(cleanedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = cleanedData.slice(startIndex, endIndex);

  console.log('📊 OffersList Render:', {
    activeTab,
    rawDataLength: rawData.length,
    cleanedDataLength: cleanedData.length,
    paginatedDataLength: paginatedData.length,
    isLoading,
    currentError,
    initialFetchDone: initialFetchDone.current
  });

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
            Offres Reçues ({offers?.length || 0})
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
            Mes Candidatures ({appliedJobs?.length || 0})
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

      {/* ✅ DEBUG BOX UNIQUEMENT POUR LES CANDIDATURES */}
      {activeTab === 'applications' && (
        <DebugApplications appliedJobs={appliedJobs} />
      )}

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
          {paginatedData.map((displayItem, index) => (
            <div key={displayItem._id} className="p-6 bg-white rounded-lg shadow border border-[#4242425a]">
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">
                    {displayItem.missionTitle}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    Client: {displayItem.clientName}
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
                  onClick={() => onViewDetails && onViewDetails(displayItem._id, displayItem)}
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