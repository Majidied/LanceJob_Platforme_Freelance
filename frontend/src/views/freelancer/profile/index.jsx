import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext'; // Nouveau import
import avatar from "../../../assets/img/profile/banner.png";
import { userAPI } from '../../../api'; // Nouveau import

const Profile = () => {
  const { user } = useAuth(); // Récupérer l'utilisateur connecté
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // État du profil
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    title: "",
    location: "",
    email: "",
    phone: "",
    bio: "",
    description: "",
    skills: [],
    hourlyRate: "0",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: ""
    }
  });

  // État pour suivre quelle section est en cours d'édition
  const [editingSections, setEditingSections] = useState({
    profile: false,
    personal: false,
    description: false,
    skills: false,
    hourlyRate: false,
    address: false
  });

  // État temporaire pour stocker les modifications en cours
  const [tempData, setTempData] = useState({...profileData});
  
  // État pour la gestion des compétences pendant l'édition
  const [newSkill, setNewSkill] = useState("");

  // Charger les données du profil depuis l'API
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Si vous avez déjà les données dans user, pas besoin de faire un appel API supplémentaire
        if (user) {
          // Adapter les données utilisateur au format du profil
          const userData = {
            firstName: user.name ? user.name.split(' ')[0] : '',
            lastName: user.name ? user.name.split(' ')[1] || '' : '',
            title: user.title || '',
            location: user.address ? `${user.address}` : '',
            email: user.email || '',
            phone: user.phone || '',
            bio: user.bio || '',
            description: user.bio || '', // Utilisez bio comme description si nécessaire
            skills: user.skills || [],
            hourlyRate: "45", // Valeur par défaut ou depuis user si disponible
            address: {
              street: "",
              city: "",
              state: "",
              country: "",
              zipCode: ""
            }
          };
          
          // Si vous avez plus de détails d'adresse dans votre modèle, adaptez-les ici
          if (user.address) {
            // Exemple: décomposer l'adresse si c'est une chaîne
            // Ou utiliser directement les champs si votre modèle utilisateur a une structure d'adresse
          }
          
          setProfileData(userData);
          setTempData(userData);
        } else {
          // Récupérer les données du profil depuis l'API si nécessaire
          const response = await userAPI.getUserProfile();
          
          // Adapter les données de l'API au format du profil
          // Ceci dépend de la structure de votre API
          const apiData = response.data.data;
          
          // Exemple de conversion (à adapter selon votre API)
          const formattedData = {
            firstName: apiData.name ? apiData.name.split(' ')[0] : '',
            lastName: apiData.name ? apiData.name.split(' ')[1] || '' : '',
            // Continuer avec les autres champs...
          };
          
          setProfileData(formattedData);
          setTempData(formattedData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile data');
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);

  // Fonction pour commencer l'édition d'une section
  const startEditing = (section) => {
    setTempData({...profileData});
    setEditingSections({...editingSections, [section]: true});
  };

  // Fonction pour annuler l'édition
  const cancelEditing = (section) => {
    setEditingSections({...editingSections, [section]: false});
  };

  // Fonction pour sauvegarder les modifications
  const saveChanges = async (section) => {
    try {
      setSaveLoading(true);
      
      // Préparer les données à envoyer à l'API
      let dataToSave = {};
      
      // En fonction de la section, préparer les données appropriées
      if (section === 'profile') {
        dataToSave = {
          name: `${tempData.firstName} ${tempData.lastName}`,
          title: tempData.title,
          // Autres champs...
        };
      } else if (section === 'personal') {
        dataToSave = {
          name: `${tempData.firstName} ${tempData.lastName}`,
          email: tempData.email,
          phone: tempData.phone,
          bio: tempData.bio,
        };
      } else if (section === 'description') {
        dataToSave = {
          bio: tempData.description, // Adapter selon votre modèle de données
        };
      } else if (section === 'skills') {
        dataToSave = {
          skills: tempData.skills,
        };
      } else if (section === 'hourlyRate') {
        dataToSave = {
          hourlyRate: tempData.hourlyRate,
        };
      } else if (section === 'address') {
        dataToSave = {
          address: tempData.address.street + 
                  (tempData.address.city ? `, ${tempData.address.city}` : '') +
                  (tempData.address.state ? `, ${tempData.address.state}` : '') +
                  (tempData.address.zipCode ? ` ${tempData.address.zipCode}` : '') +
                  (tempData.address.country ? `, ${tempData.address.country}` : ''),
        };
      }
      
      // Envoyer les données à l'API
      await userAPI.updateUserProfile(dataToSave);
      
      // Mettre à jour l'état local
      setProfileData({...profileData, ...tempData});
      setEditingSections({...editingSections, [section]: false});
      
      // Afficher un message de succès
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000); // Effacer le message après 3 secondes
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(null), 3000); // Effacer l'erreur après 3 secondes
    } finally {
      setSaveLoading(false);
    }
  };

  // Gestion des changements dans les formulaires
  const handleChange = (e, section, nestedField = null) => {
    const { name, value } = e.target;
    
    if (nestedField) {
      setTempData({
        ...tempData,
        [nestedField]: {
          ...tempData[nestedField],
          [name]: value
        }
      });
    } else {
      setTempData({...tempData, [name]: value});
    }
  };

  // Ajouter une nouvelle compétence
  const addSkill = () => {
    if (newSkill.trim() === "") return;
    setTempData({
      ...tempData,
      skills: [...tempData.skills, newSkill.trim()]
    });
    setNewSkill("");
  };

  // Supprimer une compétence
  const removeSkill = (indexToRemove) => {
    setTempData({
      ...tempData,
      skills: tempData.skills.filter((_, index) => index !== indexToRemove)
    });
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
                    name="firstName"
                    value={tempData.firstName} 
                    onChange={(e) => handleChange(e, 'profile')}
                    className="w-full px-3 py-1 text-white bg-gray-700 rounded"
                    placeholder="First Name"
                  />
                  <input 
                    type="text" 
                    name="lastName"
                    value={tempData.lastName} 
                    onChange={(e) => handleChange(e, 'profile')}
                    className="w-full px-3 py-1 text-white bg-gray-700 rounded"
                    placeholder="Last Name"
                  />
                </div>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    name="title"
                    value={tempData.title} 
                    onChange={(e) => handleChange(e, 'profile')}
                    className="w-full px-3 py-1 text-white bg-gray-700 rounded"
                    placeholder="Title"
                  />
                  <input 
                    type="text" 
                    name="location"
                    value={tempData.location} 
                    onChange={(e) => handleChange(e, 'profile')}
                    className="w-full px-3 py-1 text-white bg-gray-700 rounded"
                    placeholder="Location"
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profileData.firstName} {profileData.lastName}</h2>
                <div className="flex flex-wrap items-center text-gray-400">
                  <span>{profileData.title}</span>
                  <span className="mx-2">|</span>
                  <span>{profileData.location}</span>
                </div>
              </>
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
            <p className="mb-1 text-sm text-gray-400">First Name</p>
            <p  className="text-gray-900 dark:text-white">{profileData.firstName}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-400">Last Name</p>
            <p className="text-gray-900 dark:text-white">{profileData.lastName}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-400">Email address</p>
            <p className="text-gray-900 dark:text-white">{profileData.email}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-400">Phone</p>
            <p className="text-gray-900 dark:text-white">{profileData.phone}</p>
          </div>
          <div className="md:col-span-2">
            <p className="mb-1 text-sm text-gray-400">Bio</p>
            <p className="text-gray-900 dark:text-white">{profileData.bio}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm text-gray-400">First Name</label>
            <input 
              type="text" 
              name="firstName"
              value={tempData.firstName} 
              onChange={(e) => handleChange(e, 'personal')}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-400">Last Name</label>
            <input 
              type="text" 
              name="lastName"
              value={tempData.lastName} 
              onChange={(e) => handleChange(e, 'personal')}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-400">Email address</label>
            <input 
              type="email" 
              name="email"
              value={tempData.email} 
              onChange={(e) => handleChange(e, 'personal')}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-400">Phone</label>
            <input 
              type="text" 
              name="phone"
              value={tempData.phone} 
              onChange={(e) => handleChange(e, 'personal')}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm text-gray-400">Bio</label>
            <textarea 
              name="bio"
              value={tempData.bio} 
              onChange={(e) => handleChange(e, 'personal')}
              className="w-full h-24 px-3 py-2 text-white bg-gray-700 rounded"
            ></textarea>
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
          <p className="leading-relaxed text-gray-600">{profileData.description}</p>
        </div>
      ) : (
        <div>
          <textarea 
            name="description"
            value={tempData.description} 
            onChange={(e) => handleChange(e, 'description')}
            className="w-full h-32 px-3 py-2 text-white bg-gray-700 rounded"
            placeholder="Décrivez votre expérience, vos compétences et votre expertise..."
          ></textarea>
        </div>
      )}
    </div>
  );

  const renderSkills = () => (
    <div className="p-6 mb-6 bg-white border border-[#4242425a] rounded-lg shadow dark:!bg-navy-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Skills</h3>
        {!editingSections.skills ? (
          <button 
            onClick={() => startEditing('skills')}
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
              onClick={() => saveChanges('skills')}
              className="px-4 py-1 text-white transition bg-green-600 rounded-full hover:bg-green-700"
            >
              Save
            </button>
            <button 
              onClick={() => cancelEditing('skills')}
              className="px-4 py-1 transition border border-gray-500 rounded-full hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {!editingSections.skills ? (
        <div className="flex flex-wrap gap-2">
          {profileData.skills.map((skill, index) => (
            <span key={index} className="px-3 py-1 text-sm bg-gray-700 rounded-full">
              {skill}
            </span>
          ))}
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
              Ajouter
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tempData.skills.map((skill, index) => (
              <div key={index} className="flex items-center px-3 py-1 text-sm bg-gray-700 rounded-full">
                {skill}
                <button 
                  onClick={() => removeSkill(index)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderHourlyRate = () => (
    <div className="p-6 mb-6 bg-white border border-[#4242425a] rounded-lg shadow dark:!bg-navy-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Hourly Rate</h3>
        {!editingSections.hourlyRate ? (
          <button 
            onClick={() => startEditing('hourlyRate')}
            className="flex items-center px-4 py-1 text-gray-800 border border-gray-500 rounded-full trantion dark:text-white hover:bg-gray-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={() => saveChanges('hourlyRate')}
              className="px-4 py-1 text-white transition bg-green-600 rounded-full hover:bg-green-700"
            >
              Save
            </button>
            <button 
              onClick={() => cancelEditing('hourlyRate')}
              className="px-4 py-1 transition border border-gray-500 rounded-full hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {!editingSections.hourlyRate ? (
        <div>
          <p className="text-2xl font-bold text-green-400">${profileData.hourlyRate} / heure</p>
        </div>
      ) : (
        <div className="flex items-center">
          <span className="mr-2 text-xl">$</span>
          <input 
            type="number" 
            name="hourlyRate"
            value={tempData.hourlyRate} 
            onChange={(e) => handleChange(e, 'hourlyRate')}
            className="w-24 px-3 py-2 text-white bg-gray-700 rounded"
            min="0"
          />
          <span className="ml-2 text-xl">/ heure</span>
        </div>
      )}
    </div>
  );

  const renderAddress = () => (
    <div className="p-6 mb-6 bg-white  border border-[#4242425a] rounded-lg shadow dark:!bg-navy-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Address</h3>
        {!editingSections.address ? (
          <button 
            onClick={() => startEditing('address')}
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
              onClick={() => saveChanges('address')}
              className="px-4 py-1 text-white transition bg-green-600 rounded-full hover:bg-green-700"
            >
              Save
            </button>
            <button 
              onClick={() => cancelEditing('address')}
              className="px-4 py-1 transition border border-gray-500 rounded-full hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {!editingSections.address ? (
        <div>
          <p className="mb-1 text-gray-900 dark:text-white">{profileData.address.street}</p>
          <p className="mb-1 text-gray-900 dark:text-white">{profileData.address.city}, {profileData.address.state} {profileData.address.zipCode}</p>
          <p className="text-gray-900 dark:text-white">{profileData.address.country}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm text-gray-400 ">Street</label>
            <input 
              type="text" 
              name="street"
              value={tempData.address.street} 
              onChange={(e) => handleChange(e, 'address', 'address')}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-400">City</label>
            <input 
              type="text" 
              name="city"
              value={tempData.address.city} 
              onChange={(e) => handleChange(e, 'address', 'address')}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-400">State</label>
            <input 
              type="text" 
              name="state"
              value={tempData.address.state} 
              onChange={(e) => handleChange(e, 'address', 'address')}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-400">Zip Code</label>
            <input 
              type="text" 
              name="zipCode"
              value={tempData.address.zipCode} 
              onChange={(e) => handleChange(e, 'address', 'address')}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-400">Country</label>
            <input 
              type="text" 
              name="country"
              value={tempData.address.country} 
              onChange={(e) => handleChange(e, 'address', 'address')}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-6 mb-6 text-white ">
      {renderMainProfile()}
      {renderPersonalInfo()}
      {renderDescription()}
      {renderSkills()}
      {renderHourlyRate()}
      {renderAddress()}
    </div>
  );
};

export default Profile;