// frontend/src/views/freelancer/offers/OfferDetails.jsx - VERSION CORRIGÉE
import React from 'react';
import { ArrowLeft, Calendar, DollarSign, Clock, User, MapPin, Tag, FileText, CheckCircle, XCircle } from 'lucide-react';

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

const OfferDetails = ({ offer, onBackToList }) => {
  // ✅ VALIDATION ET SANITISATION COMPLÈTE
  if (!offer || typeof offer !== 'object') {
    return (
      <div className="p-6">
        <button 
          onClick={onBackToList}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          Retour à la liste
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Erreur: Données de l'offre invalides</p>
        </div>
      </div>
    );
  }

  // ✅ SANITISATION SÉCURISÉE DE TOUTES LES PROPRIÉTÉS
  const sanitizedOffer = {
    _id: offer._id || 'unknown',
    missionTitle: offer.missionTitle || offer.title || 'Titre non disponible',
    clientName: offer.clientName || offer.client || 'Client anonyme',
    status: offer.status || 'pending',
    currency: offer.currency || 'MAD',
    timeline: offer.timeline || 'Non spécifié',
    submittedDate: offer.submittedDate || offer.createdAt || offer.appliedAt || offer.applicationDate,
    description: offer.description || offer.offerDescription || offer.coverLetter || '',
    isApplication: Boolean(offer.isApplication),
    
    // ✅ GESTION SÉCURISÉE DU PRIX
    price: (() => {
      if (typeof offer.offerPrice === 'number' && !isNaN(offer.offerPrice)) {
        return offer.offerPrice;
      }
      if (typeof offer.proposedPrice === 'number' && !isNaN(offer.proposedPrice)) {
        return offer.proposedPrice;
      }
      if (typeof offer.price === 'number' && !isNaN(offer.price)) {
        return offer.price;
      }
      const priceStr = offer.offerPrice || offer.proposedPrice || offer.price;
      if (typeof priceStr === 'string') {
        const parsed = parseFloat(priceStr);
        return !isNaN(parsed) ? parsed : 0;
      }
      return 0;
    })(),

    // ✅ GESTION SÉCURISÉE DES SKILLS
    skills: (() => {
      if (Array.isArray(offer.skills)) {
        return offer.skills.filter(skill => skill && typeof skill === 'string');
      }
      if (Array.isArray(offer.tags)) {
        return offer.tags.filter(tag => tag && typeof tag === 'string');
      }
      return [];
    })(),

    // ✅ GESTION SÉCURISÉE DU DÉLAI DE LIVRAISON
    deliveryTime: (() => {
      if (typeof offer.deliveryTime === 'number' && !isNaN(offer.deliveryTime)) {
        return offer.deliveryTime;
      }
      if (typeof offer.deliveryTime === 'string') {
        const parsed = parseInt(offer.deliveryTime);
        return !isNaN(parsed) ? parsed : 0;
      }
      return 0;
    })(),

    // ✅ BUDGET DE LA MISSION
    budget: (() => {
      if (typeof offer.budget === 'number' && !isNaN(offer.budget)) {
        return offer.budget;
      }
      if (typeof offer.budget === 'string') {
        const parsed = parseFloat(offer.budget);
        return !isNaN(parsed) ? parsed : 0;
      }
      return 0;
    })(),

    // ✅ PROPRIÉTÉS ADDITIONNELLES SÉCURISÉES
    location: offer.location || offer.missionLocation || 'Non spécifié',
    experience: offer.experience || offer.experienceLevel || 'Intermédiaire',
    attachments: Array.isArray(offer.attachments) ? offer.attachments : []
  };

  const getStatusDisplay = (status) => {
    return statusLabels[status] || status || 'Statut inconnu';
  };

  const getStatusColor = (status) => {
    return statusColors[status] || statusColors[statusLabels[status]] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return "Aujourd'hui";
      if (diffInDays === 1) return "Hier";
      if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
      if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
      return `Il y a ${Math.floor(diffInDays / 30)} mois`;
    } catch (e) {
      return 'Date invalide';
    }
  };

  console.log('📄 OfferDetails render:', {
    originalOffer: offer,
    sanitizedOffer,
    skillsLength: sanitizedOffer.skills.length
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBackToList}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour à la liste
        </button>
        
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(sanitizedOffer.status)}`}>
          {getStatusDisplay(sanitizedOffer.status)}
        </span>
      </div>

      {/* Titre et informations principales */}
      <div className="bg-white rounded-lg shadow border border-[#4242425a] p-6 mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {sanitizedOffer.missionTitle}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User size={16} />
              <span>Client: {sanitizedOffer.clientName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>
                {sanitizedOffer.isApplication ? 'Candidature envoyée' : 'Offre reçue'} le {getRelativeTime(sanitizedOffer.submittedDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Type de projet */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            sanitizedOffer.isApplication 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {sanitizedOffer.isApplication ? 'Ma Candidature' : 'Offre Directe'}
          </span>
        </div>

        {/* Description */}
        {sanitizedOffer.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FileText size={18} />
              {sanitizedOffer.isApplication ? 'Ma proposition' : 'Description de l\'offre'}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {sanitizedOffer.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Détails financiers et temporels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Prix et budget */}
        <div className="bg-white rounded-lg shadow border border-[#4242425a] p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={18} />
            Détails financiers
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                {sanitizedOffer.isApplication ? 'Prix proposé' : 'Prix offert'}:
              </span>
              <span className="font-semibold text-lg">
                {sanitizedOffer.price} {sanitizedOffer.currency}
              </span>
            </div>
            {sanitizedOffer.budget > 0 && sanitizedOffer.budget !== sanitizedOffer.price && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Budget mission:</span>
                <span className="font-medium">
                  {sanitizedOffer.budget} {sanitizedOffer.currency}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">Projet fixe</span>
            </div>
          </div>
        </div>

        {/* Délais et timing */}
        <div className="bg-white rounded-lg shadow border border-[#4242425a] p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={18} />
            Délais
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Délai de livraison:</span>
              <span className="font-medium">
                {sanitizedOffer.deliveryTime > 0 
                  ? `${sanitizedOffer.deliveryTime} jours`
                  : sanitizedOffer.timeline
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Date de candidature:</span>
              <span className="font-medium">
                {formatDate(sanitizedOffer.submittedDate)}
              </span>
            </div>
            {sanitizedOffer.location && sanitizedOffer.location !== 'Non spécifié' && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1">
                  <MapPin size={14} />
                  Localisation:
                </span>
                <span className="font-medium">{sanitizedOffer.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compétences requises */}
      {sanitizedOffer.skills.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-[#4242425a] p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Tag size={18} />
            Compétences
          </h3>
          <div className="flex flex-wrap gap-2">
            {sanitizedOffer.skills.map((skill, index) => (
              <span 
                key={index} 
                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pièces jointes */}
      {sanitizedOffer.attachments.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-[#4242425a] p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText size={18} />
            Pièces jointes
          </h3>
          <div className="space-y-2">
            {sanitizedOffer.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <FileText size={16} className="text-gray-500" />
                <span className="text-gray-700">{attachment.name || `Fichier ${index + 1}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions selon le statut */}
      <div className="bg-white rounded-lg shadow border border-[#4242425a] p-6">
        <h3 className="text-lg font-semibold mb-4">Actions</h3>
        
        {sanitizedOffer.status === 'pending' && !sanitizedOffer.isApplication && (
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <CheckCircle size={16} />
              Accepter l'offre
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <XCircle size={16} />
              Refuser l'offre
            </button>
          </div>
        )}
        
        {sanitizedOffer.status === 'accepted' && (
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-[#518394] text-white rounded-lg hover:bg-[#406c7a] transition-colors">
              Contacter le client
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Voir le contrat
            </button>
          </div>
        )}

        {sanitizedOffer.status === 'pending' && sanitizedOffer.isApplication && (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-2">Candidature en attente de réponse</p>
            <p className="text-sm text-gray-500">
              Le client examinera votre proposition et vous répondra sous peu.
            </p>
          </div>
        )}

        {sanitizedOffer.status === 'rejected' && (
          <div className="text-center py-4">
            <p className="text-red-600 mb-2">
              {sanitizedOffer.isApplication ? 'Candidature non retenue' : 'Offre refusée'}
            </p>
            <p className="text-sm text-gray-500">
              Continuez à postuler à d'autres missions qui correspondent à vos compétences.
            </p>
          </div>
        )}
      </div>

      {/* Debug info en développement */}
      
    </div>
  );
};

export default OfferDetails;