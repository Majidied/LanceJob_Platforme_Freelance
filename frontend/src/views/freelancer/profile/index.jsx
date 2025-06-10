import React, { useState, useEffect, useRef } from 'react';
import { Star, Upload, X, Plus, Edit, Trash2 } from 'lucide-react';
import { getFreelancer, updateFreelancer } from '../../../api/freelancer';
import { uploadProfileImage, deleteProfileImage, getImageUrl } from '../../../api/image';

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(''); // Pour debug
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    title: "",
    skills: [],
    rating: 0,
    earned: 0,
    success: 0,
    address: "",
    status: "",
    role: "",
    freelancerId: "",
    profileImage: null
  });

  // États pour l'édition des sections
  const [editingSections, setEditingSections] = useState({
    profile: false,
    personal: false,
    bio: false,
    skills: false,
    address: false
  });

  const [tempData, setTempData] = useState({...profileData});
  const [newSkill, setNewSkill] = useState('');
  
  // Référence pour l'upload d'image
  const fileInputRef = useRef(null);

  // ✅ ID du freelancer - utiliser celui de votre context ou un ID valide
  const FREELANCER_ID = '6830ee0e4fc7edee46cf57ea';

  // ✅ Fonction de test API
  const testAPI = async () => {
    try {
      console.log('🔍 Testing API connection...');
      setDebugInfo('Testing API connection...');
      
      // Test de l'endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/freelancer/${FREELANCER_ID}`);
      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        setDebugInfo(`API Error: ${response.status} - ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ API Success Response:', data);
      setDebugInfo(`API Success: ${JSON.stringify(data, null, 2)}`);
      
      return data;
    } catch (error) {
      console.error('🚨 API Test Failed:', error);
      setDebugInfo(`API Test Failed: ${error.message}`);
      throw error;
    }
  };

  // Charger les données du freelancer depuis l'API
  useEffect(() => {
    const fetchFreelancerData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setDebugInfo('Loading freelancer data...');
        
        console.log('🚀 Starting freelancer data fetch...');
        console.log('🔑 Freelancer ID:', FREELANCER_ID);
        console.log('🌐 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:3000/api');
        
        // ✅ Test direct de l'API d'abord
        const testResult = await testAPI();
        
        // ✅ Puis utiliser la fonction getFreelancer
        console.log('📞 Calling getFreelancer function...');
        const data = await getFreelancer(FREELANCER_ID);
        console.log('📦 getFreelancer response:', data);

        // ✅ Vérification de la structure des données
        if (!data || !data.data) {
          console.error('❌ Invalid data structure:', data);
          throw new Error('Structure de données invalide reçue de l\'API');
        }

        const freelancerData = data.data;
        console.log('👤 Freelancer raw data:', freelancerData);

        const profileDataFromApi = {
          name: freelancerData.name || "Nom non disponible",
          email: freelancerData.email || "Email non disponible",
          phone: freelancerData.phone || "Téléphone non disponible",
          bio: freelancerData.bio || "Bio non disponible",
          title: freelancerData.title || "Titre non disponible",
          skills: Array.isArray(freelancerData.skills) ? freelancerData.skills : [],
          rating: freelancerData.rating || 0,
          earned: freelancerData.earned || 0,
          success: freelancerData.success || 0,
          address: freelancerData.address || "Adresse non disponible",
          status: freelancerData.status || "Statut non disponible",
          role: freelancerData.role || "Role non disponible",
          freelancerId: FREELANCER_ID,
          profileImage: freelancerData.profileImage || null
        };

        console.log('✅ Processed profile data:', profileDataFromApi);
        setProfileData(profileDataFromApi);
        setTempData(profileDataFromApi);
        setDebugInfo('Data loaded successfully!');
        
        setError(null);
      } catch (err) {
        console.error("🚨 Erreur lors du chargement des données du freelancer:", err);
        console.error("🚨 Error stack:", err.stack);
        
        let errorMessage = "Impossible de charger les données du profil.";
        
        if (err.message.includes('fetch')) {
          errorMessage = "Erreur de connexion au serveur. Vérifiez que le backend est en marche.";
        } else if (err.message.includes('404')) {
          errorMessage = "Freelancer non trouvé. Vérifiez l'ID du freelancer.";
        } else if (err.message.includes('500')) {
          errorMessage = "Erreur serveur. Vérifiez les logs du backend.";
        }
        
        setError(errorMessage + " Détails: " + err.message);
        setDebugInfo(`Error: ${err.message}\nStack: ${err.stack}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFreelancerData();
  }, []);

  // ✅ Fonction de debug pour vérifier la connectivité
  const handleDebugTest = async () => {
    setIsLoading(true);
    try {
      await testAPI();
      // Retry fetching data
      window.location.reload();
    } catch (error) {
      console.error('Debug test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de l'upload d'image
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximum: 5MB.');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await uploadProfileImage(profileData.freelancerId, file);
      
      if (response.success) {
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
    
    event.target.value = '';
  };

  // Supprimer l'avatar
  const removeAvatar = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil?')) {
      try {
        setIsLoading(true);
        
        const response = await deleteProfileImage(profileData.freelancerId);
        
        if (response.success) {
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

  // Fonctions d'édition
  const startEditing = (section) => {
    setTempData({...profileData});
    setEditingSections({...editingSections, [section]: true});
  };

  const cancelEditing = (section) => {
    setTempData({...profileData});
    setEditingSections({...editingSections, [section]: false});
    setNewSkill('');
  };

  const saveChanges = async (section) => {
    try {
      setIsLoading(true);
      
      const freelancerId = profileData.freelancerId;
      const updatedData = {};
      
      if (section === 'profile') {
        updatedData.name = tempData.name;
        updatedData.title = tempData.title;
      } else if (section === 'personal') {
        updatedData.name = tempData.name;
        updatedData.email = tempData.email;
        updatedData.phone = tempData.phone;
        updatedData.address = tempData.address;
      } else if (section === 'bio') {
        updatedData.bio = tempData.bio;
      } else if (section === 'skills') {
        updatedData.skills = tempData.skills;
      }
      
      await updateFreelancer(freelancerId, updatedData);
      
      setProfileData(prevData => ({
        ...prevData,
        ...updatedData
      }));
      
      setEditingSections({...editingSections, [section]: false});
      setNewSkill('');
      
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

  // Gestion des compétences
  const addSkill = () => {
    if (newSkill.trim() === "") return;
    setTempData({
      ...tempData,
      skills: [...tempData.skills, newSkill.trim()]
    });
    setNewSkill("");
  };

  const removeSkill = (indexToRemove) => {
    setTempData({
      ...tempData,
      skills: tempData.skills.filter((_, index) => index !== indexToRemove)
    });
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

  const getAvatarUrl = () => {
    if (profileData.profileImage) {
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
          {debugInfo && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg text-left">
              <h4 className="text-yellow-400 font-bold mb-2">Debug Info:</h4>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ✅ Afficher un message d'erreur avec plus de détails
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 text-center bg-red-500 rounded-lg shadow max-w-2xl">
          <h3 className="mb-4 text-xl font-bold text-white">Erreur</h3>
          <p className="text-white mb-4">{error}</p>
          
          {/* Debug information */}
          {debugInfo && (
            <div className="mt-4 p-4 bg-red-700 rounded-lg text-left">
              <h4 className="text-yellow-200 font-bold mb-2">Informations de debug:</h4>
              <pre className="text-xs text-red-100 whitespace-pre-wrap max-h-40 overflow-auto">
                {debugInfo}
              </pre>
            </div>
          )}
          
          <div className="flex gap-4 justify-center mt-6">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 font-bold text-white bg-red-700 rounded hover:bg-red-800"
            >
              Recharger la page
            </button>
            <button 
              onClick={handleDebugTest}
              className="px-4 py-2 font-bold text-red-500 bg-white rounded hover:bg-gray-100"
            >
              Test de connectivité
            </button>
          </div>
          
          {/* Checklist de dépannage */}
          <div className="mt-6 p-4 bg-red-700 rounded-lg text-left">
            <h4 className="text-yellow-200 font-bold mb-2">Checklist de dépannage:</h4>
            <ul className="text-red-100 text-sm space-y-1">
              <li>✓ Le serveur backend est-il démarré ?</li>
              <li>✓ L'URL de l'API est-elle correcte ?</li>
              <li>✓ L'ID du freelancer existe-t-il en base ?</li>
              <li>✓ Y a-t-il des erreurs dans la console du navigateur ?</li>
              <li>✓ Y a-t-il des erreurs dans les logs du serveur ?</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Section profil principal
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
                <input 
                  type="text" 
                  name="title"
                  value={tempData.title} 
                  onChange={handleChange}
                  className="w-full px-3 py-1 text-white bg-gray-700 rounded"
                  placeholder="Titre professionnel"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {profileData.name}
                  </h2>
                  <div className="flex items-center ml-2">
                    {renderFixedStars()}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{profileData.title}</p>
              </>
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
              <Edit className="w-4 h-4 mr-1" />
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
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );

  // Section statistiques
  const renderStats = () => (
    <div className="p-6 mb-6 bg-white border border-[#4242425a] rounded-lg shadow dark:!bg-navy-800">
      <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Statistiques</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="p-4 text-center bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${profileData.earned}K+
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Gains totaux</div>
        </div>
        <div className="p-4 text-center bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {profileData.success}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Taux de réussite</div>
        </div>
        <div className="p-4 text-center bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            {renderFixedStars()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Évaluation moyenne</div>
        </div>
      </div>
    </div>
  );

  // Section informations personnelles
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
            <Edit className="w-4 h-4 mr-1" />
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
          <div>
            <p className="mb-1 text-sm text-gray-400">Adresse</p>
            <p className="text-gray-900 dark:text-white">{profileData.address}</p>
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
          <div>
            <label className="block mb-1 text-sm text-gray-400">Adresse</label>
            <input 
              type="text" 
              name="address"
              value={tempData.address} 
              onChange={handleChange}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded"
            />
          </div>
        </div>
      )}
    </div>
  );

  // Section bio
  const renderBio = () => (
    <div className="p-6 mb-6 bg-white border border-[#4242425a] rounded-lg shadow dark:!bg-navy-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">À propos</h3>
        {!editingSections.bio ? (
          <button 
            onClick={() => startEditing('bio')}
            className="flex items-center px-4 py-1 text-gray-800 transition border border-gray-500 rounded-full dark:text-white hover:bg-gray-700"
            disabled={isLoading}
          >
            <Edit className="w-4 h-4 mr-1" />
            Éditer
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={() => saveChanges('bio')}
              className="px-4 py-1 text-white transition bg-green-600 rounded-full hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button 
              onClick={() => cancelEditing('bio')}
              className="px-4 py-1 transition border border-gray-500 rounded-full hover:bg-gray-700"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
      
      {!editingSections.bio ? (
        <div>
          <p className="leading-relaxed text-gray-600 dark:text-gray-300">
            {profileData.bio || "Aucune description disponible."}
          </p>
        </div>
      ) : (
        <div>
          <textarea 
            name="bio"
            value={tempData.bio} 
            onChange={handleChange}
            className="w-full h-32 px-3 py-2 text-white bg-gray-700 rounded"
            placeholder="Décrivez votre expérience, vos compétences et votre expertise..."
          />
        </div>
      )}
    </div>
  );

  // Section compétences
  const renderSkills = () => (
    <div className="p-6 mb-6 bg-white border border-[#4242425a] rounded-lg shadow dark:!bg-navy-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Compétences</h3>
        {!editingSections.skills ? (
          <button 
            onClick={() => startEditing('skills')}
            className="flex items-center px-4 py-1 text-gray-800 transition border border-gray-500 rounded-full dark:text-white hover:bg-gray-700"
            disabled={isLoading}
          >
            <Edit className="w-4 h-4 mr-1" />
            Éditer
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={() => saveChanges('skills')}
              className="px-4 py-1 text-white transition bg-green-600 rounded-full hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button 
              onClick={() => cancelEditing('skills')}
              className="px-4 py-1 transition border border-gray-500 rounded-full hover:bg-gray-700"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
      
      {!editingSections.skills ? (
        <div className="flex flex-wrap gap-2">
          {profileData.skills.length > 0 ? (
            profileData.skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 text-sm bg-gray-700 text-white rounded-full">
                {skill}
              </span>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Aucune compétence renseignée.</p>
          )}
        </div>
      ) : (
        <div>
          <div className="flex mb-4">
            <input 
              type="text" 
              value={newSkill} 
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-grow px-3 py-2 text-white bg-gray-700 rounded-l"
              placeholder="Ajouter une compétence"
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            />
            <button 
              onClick={addSkill}
              className="px-4 py-2 text-white bg-blue-600 rounded-r hover:bg-blue-700"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tempData.skills.map((skill, index) => (
              <div key={index} className="flex items-center px-3 py-1 text-sm bg-gray-700 text-white rounded-full">
                {skill}
                <button 
                  onClick={() => removeSkill(index)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-6 mb-6 text-white">
      {renderMainProfile()}
      {renderStats()}
      {renderPersonalInfo()}
      {renderBio()}
      {renderSkills()}
    </div>
  );
};

export default Profile;