import React, { useState, useEffect, useRef } from 'react';
import { Star, Upload, X } from 'lucide-react';
import { getClient, updateClient } from '../../../api/client';
import useUser from '../../../hooks/useUser';
import { uploadProfileImage, deleteProfileImage, getImageUrl } from '../../../api/image';

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    rating: 0,
    status: "",
    role: "",
    clientId: "",
    profileImage: null // Nom du fichier image
  });

  // États pour l'édition des sections
  const [editingSections, setEditingSections] = useState({
    profile: false,
    personal: false,
    description: false
  });

  const { user } = useUser();

  // État temporaire pour stocker les modifications en cours
  const [tempData, setTempData] = useState({...profileData});
  
  // Référence pour l'upload d'image
  const fileInputRef = useRef(null);

  // Charger les données du client depuis l'API
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer l'ID du client depuis l'URL (si disponible)
        let clientId= user?.id;
        
        const data = await getClient(clientId);

        const profileDataFromApi = {
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone,
          description: data.data.description,
          rating: data.data.rating,
          status: data.data.status,
          role: data.data.role,
          clientId: clientId,
          profileImage: data.data.profileImage || null
        };

        setProfileData(profileDataFromApi);
        setTempData(profileDataFromApi);
        
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des données du client:", err);
        setError("Impossible de charger les données du profil. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [user?.id]);

  // Gestion de l'upload d'image
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide.');
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximum: 5MB.');
      return;
    }

    try {
      setIsLoading(true);
      
      // Upload de l'image vers le backend
      const response = await uploadProfileImage(profileData.clientId, file);
      
      if (response.success) {
        // Mettre à jour l'état local
        const newProfileData = {
          ...profileData,
          profileImage: response.data.profileImage
        };
        
        setProfileData(newProfileData);
        setTempData(newProfileData);
        
        alert('Image de profil mise à jour avec succès!');
      }
    } catch (err) {
      console.error("Erreur lors de l'upload de l'image:", err);
      alert('Erreur lors de l\'upload de l\'image: ' + err.message);
    } finally {
      setIsLoading(false);
    }
    
    // Réinitialiser l'input file
    event.target.value = '';
  };

  // Supprimer l'avatar
  const removeAvatar = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil?')) {
      try {
        setIsLoading(true);
        
        const response = await deleteProfileImage(profileData.clientId);
        
        if (response.success) {
          // Mettre à jour l'état local
          setProfileData(prev => ({...prev, profileImage: null}));
          setTempData(prev => ({...prev, profileImage: null}));
          
          alert('Photo de profil supprimée avec succès!');
        }
      } catch (err) {
        console.error("Erreur lors de la suppression de l'image:", err);
        alert('Erreur lors de la suppression de l\'image: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Fonctions d'édition des autres sections (inchangées)
  const startEditing = (section) => {
    setTempData({...profileData});
    setEditingSections({...editingSections, [section]: true});
  };

  const cancelEditing = (section) => {
    setTempData({...profileData});
    setEditingSections({...editingSections, [section]: false});
  };

  const saveChanges = async (section) => {
    try {
      setIsLoading(true);
      
      const clientId = profileData.clientId;
      const updatedData = {};
      
      if (section === 'profile') {
        updatedData.name = tempData.name;
      } else if (section === 'personal') {
        updatedData.name = tempData.name;
        updatedData.email = tempData.email;
        updatedData.phone = tempData.phone;
      } else if (section === 'description') {
        updatedData.description = tempData.description;
      }
      
      await updateClient(clientId, updatedData);
      
      setProfileData(prevData => ({
        ...prevData,
        ...updatedData
      }));
      
      setEditingSections({...editingSections, [section]: false});
      
      alert("Modifications enregistrées avec succès!");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde des modifications:", err);
      alert("Erreur lors de la sauvegarde des modifications. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempData(prev => ({...prev, [name]: value}));
  };

  const renderFixedStars = () => {
    const stars = [];
    const maxStars = 5;
    
    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={`${
            i <= profileData.rating 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-300'
          }`}
        />
      );
    }
    
    return stars;
  };

  // Obtenir l'URL de l'avatar
  const getAvatarUrl = () => {
    if (profileData.profileImage) {
      console.log("Image de profil trouvée:", profileData.profileImage);
      return getImageUrl(profileData.profileImage);
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=3b82f6&color=fff&size=200`;
  };

  // Afficher un indicateur de chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 text-center">
          <div className="w-12 h-12 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-white">Chargement des données du profil...</p>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 text-center bg-red-500 rounded-lg shadow">
          <h3 className="mb-4 text-xl font-bold text-white">Erreur</h3>
          <p className="text-white">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 mt-4 font-bold text-white bg-red-700 rounded hover:bg-red-800"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Afficher le statut du compte client
  const renderAccountStatus = () => {
    const statusColors = {
      'ACTIVE': 'bg-green-500',
      'INACTIVE': 'bg-red-500',
      'SUSPENDED': 'bg-yellow-500'
    };
    
    const statusColor = statusColors[profileData.status] || 'bg-gray-500';
    'activate', 'not_verified', 'suspended'
    return (
      <div className="p-6 mb-6 bg-white border border-[#4242425a] rounded-lg shadow dark:!bg-navy-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Statut du compte</h3>
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 mr-2 rounded-full ${statusColor}`}></div>
          <p className="text-gray-900 dark:text-white">
            {profileData.status === 'ACTIVE' && 'Compte actif'}
            {profileData.status === 'SUSPENDED' && 'Compte suspendu'}
            {profileData.status === 'INACTIVE' && 'Compte en attente de validation'}
            {!['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(profileData.status) && profileData.status}
          </p>
        </div>
      </div>
    );
  };

  // Section profil avec gestion d'image simplifiée
  const renderMainProfile = () => (
    <div className="p-6 mb-6 bg-white border border-[#4242425a] rounded-lg shadow dark:!bg-navy-800">
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="relative w-20 h-20 mr-4 group">
            <img 
              src={getAvatarUrl()}
              alt="Profile" 
              className="object-cover w-full h-full border-2 border-blue-500 rounded-full"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=3b82f6&color=fff&size=200`;
              }}
            />
            
            {/* Overlay pour l'édition d'image */}
            <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-white hover:text-blue-300"
                disabled={isLoading}
                title="Changer la photo"
              >
                <Upload size={20} />
              </button>
            </div>
            
            {/* Bouton pour supprimer l'avatar */}
            {profileData.profileImage && (
              <button
                onClick={removeAvatar}
                className="absolute p-1 text-white bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                disabled={isLoading}
                title="Supprimer la photo"
              >
                <X size={12} />
              </button>
            )}
          </div>
          
          <div>
            {editingSections.profile ? (
              <div className="space-y-2">
                <input 
                  type="text" 
                  name="name"
                  value={tempData.name} 
                  onChange={handleChange}
                  className="w-full px-3 py-1 text-white bg-gray-700 rounded"
                  placeholder="Nom complet"
                />
              </div>
            ) : (
              <div className="flex items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {profileData.name}
                </h2>
                <div className="flex items-center ml-2">
                  {renderFixedStars()}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex mt-4 space-x-2 md:ml-auto md:mt-0">
          {!editingSections.profile ? (
            <button 
              onClick={() => startEditing('profile')}
              className="flex items-center px-4 py-1 ml-2 text-gray-800 transition border border-gray-500 rounded-full dark:text-white hover:bg-gray-700"
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Éditer
            </button>
          ) : (
            <div className="flex space-x-2">
              <button 
                onClick={() => saveChanges('profile')}
                className="px-4 py-1 text-white transition bg-green-600 rounded-full hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button 
                onClick={() => cancelEditing('profile')}
                className="px-4 py-1 transition border border-gray-500 rounded-full hover:bg-gray-700"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Input caché pour l'upload d'image */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="p-6 mb-6 bg-white border border-[#4242425a] rounded-lg shadow dark:!bg-navy-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Informations personnelles</h3>
        {!editingSections.personal ? (
          <button 
            onClick={() => startEditing('personal')}
            className="flex items-center px-4 py-1 text-gray-800 transition border border-gray-500 rounded-full dark:text-white hover:bg-gray-700"
            disabled={isLoading}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Éditer
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={() => saveChanges('personal')}
              className="px-4 py-1 text-white transition bg-green-600 rounded-full hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button 
              onClick={() => cancelEditing('personal')}
              className="px-4 py-1 transition border border-gray-500 rounded-full hover:bg-gray-700"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
      
      {!editingSections.personal ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="mb-1 text-sm text-gray-400">Nom</p>
            <p className="text-gray-900 dark:text-white">{profileData.name}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-400">Email</p>
            <p className="text-gray-900 dark:text-white">{profileData.email}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-400">Téléphone</p>
            <p className="text-gray-900 dark:text-white">{profileData.phone}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm text-gray-400">Nom</label>
            <input 
              type="text" 
              name="name"
              value={tempData.name} 
              onChange={handleChange}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-400">Email</label>
            <input 
              type="email" 
              name="email"
              value={tempData.email} 
              onChange={handleChange}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-400">Téléphone</label>
            <input 
              type="text" 
              name="phone"
              value={tempData.phone} 
              onChange={handleChange}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderDescription = () => (
    <div className="p-6 mb-6 bg-white border border-[#4242425a] rounded-lg shadow dark:!bg-navy-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Description</h3>
        {!editingSections.description ? (
          <button 
            onClick={() => startEditing('description')}
            className="flex items-center px-4 py-1 text-gray-800 transition border border-gray-500 rounded-full dark:text-white hover:bg-gray-700"
            disabled={isLoading}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Éditer
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={() => saveChanges('description')}
              className="px-4 py-1 text-white transition bg-green-600 rounded-full hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button 
              onClick={() => cancelEditing('description')}
              className="px-4 py-1 transition border border-gray-500 rounded-full hover:bg-gray-700"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
      
      {!editingSections.description ? (
        <div>
          <p className="leading-relaxed text-gray-600 dark:text-gray-300">{profileData.description}</p>
        </div>
      ) : (
        <div>
          <textarea 
            name="description"
            value={tempData.description} 
            onChange={handleChange}
            className="w-full h-32 px-3 py-2 text-white bg-gray-700 rounded"
            placeholder="Décrivez votre expérience, vos compétences et votre expertise..."
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-6 mb-6 text-white ">
      {renderMainProfile()}
      {renderAccountStatus()}
      {renderPersonalInfo()}
      {renderDescription()}
    </div>
  );
};

export default Profile;