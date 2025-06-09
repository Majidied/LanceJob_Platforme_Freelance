import React, { useState, useEffect } from 'react';
import avatar from "../../../assets/img/profile/banner.png";
import { Star } from 'lucide-react';
import { getClient, updateClient } from '../../../api/client';

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    rating: 0
  });

  // État pour suivre quelle section est en cours d'édition
  const [editingSections, setEditingSections] = useState({
    profile: false,
    personal: false,
    description: false
  });

  // État temporaire pour stocker les modifications en cours
  const [tempData, setTempData] = useState({...profileData});

  // Charger les données du client depuis l'API
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer l'ID du client depuis l'URL (si disponible)
        let clientId='682bb6d5799bb3e67ea05392';
        
        const data = await getClient(clientId);

        const profileDataFromApi = {
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone,
          description: data.data.description,
          rating: data.data.rating,
          status: data.data.status,
          role: data.data.role,
          clientId: clientId
        };

        setProfileData(profileDataFromApi);
        setTempData(profileDataFromApi); // Initialiser tempData également
        
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des données du client:", err);
        setError("Impossible de charger les données du profil. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, []);

  // Fonction pour commencer l'édition d'une section
  const startEditing = (section) => {
    // Copier les données actuelles dans tempData à chaque fois qu'on commence l'édition
    setTempData({...profileData});
    setEditingSections({...editingSections, [section]: true});
  };

  // Fonction pour annuler l'édition
  const cancelEditing = (section) => {
    // Réinitialiser tempData aux valeurs de profileData
    setTempData({...profileData});
    setEditingSections({...editingSections, [section]: false});
  };

  // Fonction pour sauvegarder les modifications
  const saveChanges = async (section) => {
    try {
      setIsLoading(true);
      // Récupérer l'ID du client du state
      const clientId = profileData.clientId;
      // Créer un objet avec seulement les données modifiées
      const updatedData = {};
      
      // Selon la section, mettre à jour les champs appropriés
      if (section === 'profile') {
        updatedData.name = tempData.name;
      } else if (section === 'personal') {
        updatedData.name = tempData.name;
        updatedData.email = tempData.email;
        updatedData.phone = tempData.phone; // Supprimer le tableau si l'API n'en a pas besoin
      } else if (section === 'description') {
        updatedData.description = tempData.description; // Supprimer le tableau si l'API n'en a pas besoin
      }
      
      console.log("Données à mettre à jour:", updatedData);
      
      // Envoyer les modifications à l'API
      await updateClient(clientId, updatedData);
      
      // Mettre à jour l'état local avec les nouvelles données
      setProfileData(prevData => ({
        ...prevData,
        ...updatedData
      }));
      
      setEditingSections({...editingSections, [section]: false});
      
      // Afficher un message de succès
      alert("Modifications enregistrées avec succès!");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde des modifications:", err);
      alert("Erreur lors de la sauvegarde des modifications. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer les changements dans les champs de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempData(prev => ({
      ...prev,
      [name]: value
    }));
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

  // Afficher un indicateur de chargement pendant le chargement des données
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

  // Afficher un message d'erreur si le chargement a échoué
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
      'SUSPENDED': 'bg-red-500',
      'PENDING': 'bg-yellow-500'
    };
    
    const statusColor = statusColors[profileData.status] || 'bg-gray-500';
    
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
            {profileData.status === 'PENDING' && 'Compte en attente de validation'}
            {!['ACTIVE', 'SUSPENDED', 'PENDING'].includes(profileData.status) && profileData.status}
          </p>
        </div>
      </div>
    );
  };

  // Sections du profil
  const renderMainProfile = () => (
    <div className="p-6 mb-6 bg-white border border-[#4242425a] rounded-lg shadow dark:!bg-navy-800">
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-20 h-20 mr-4">
            <img 
              src={avatar} 
              alt="Profile" 
              className="object-cover w-full h-full border-2 border-blue-500 rounded-full"
            />
          </div>
          <div>
            {editingSections.profile ? (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    name="name"
                    value={tempData.name} 
                    onChange={handleChange}
                    className="w-full px-3 py-1 text-white bg-gray-700 rounded"
                    placeholder="First Name"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {profileData.name}
                </h2>
                
                <div className="flex items-center ml-2 mr-2">
                  {renderFixedStars()}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex mt-4 space-x-2 md:ml-auto md:mt-0">
          {!editingSections.profile ? (
            <>
              <button 
                onClick={() => startEditing('profile')}
                className="flex items-center px-4 py-1 ml-2 text-gray-800 transition border border-gray-500 rounded-full dark:text-white hover:bg-gray-700"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit
              </button>
            </>
          ) : (
            <div className="flex space-x-2">
              <button 
                onClick={() => saveChanges('profile')}
                className="px-4 py-1 text-white transition bg-green-600 rounded-full hover:bg-green-700"
              >
                Save
              </button>
              <button 
                onClick={() => cancelEditing('profile')}
                className="px-4 py-1 transition border border-gray-500 rounded-full hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="p-6 mb-6 bg-white border border-[#4242425a] rounded-lg shadow dark:!bg-navy-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h3>
        {!editingSections.personal ? (
          <button 
            onClick={() => startEditing('personal')}
            className="flex items-center px-4 py-1 text-gray-800 transition border border-gray-500 rounded-full dark:text-white hover:bg-gray-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={() => saveChanges('personal')}
              className="px-4 py-1 text-white transition bg-green-600 rounded-full hover:bg-green-700"
            >
              Save
            </button>
            <button 
              onClick={() => cancelEditing('personal')}
              className="px-4 py-1 transition border border-gray-500 rounded-full hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {!editingSections.personal ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="mb-1 text-sm text-gray-400">Name</p>
            <p className="text-gray-900 dark:text-white">{profileData.name}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-400">Email address</p>
            <p className="text-gray-900 dark:text-white">{profileData.email}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-400">Phone</p>
            <p className="text-gray-900 dark:text-white">{profileData.phone}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm text-gray-400">Name</label>
            <input 
              type="text" 
              name="name"
              value={tempData.name} 
              onChange={handleChange}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-400">Email address</label>
            <input 
              type="email" 
              name="email"
              value={tempData.email} 
              onChange={handleChange}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-400">Phone</label>
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
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={() => saveChanges('description')}
              className="px-4 py-1 text-white transition bg-green-600 rounded-full hover:bg-green-700"
            >
              Save
            </button>
            <button 
              onClick={() => cancelEditing('description')}
              className="px-4 py-1 transition border border-gray-500 rounded-full hover:bg-gray-700"
            >
              Cancel
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
          ></textarea>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-6 mb-6 text-white">
      {renderMainProfile()}
      {renderAccountStatus()}
      {renderPersonalInfo()}
      {renderDescription()}
    </div>
  );
};

export default Profile;