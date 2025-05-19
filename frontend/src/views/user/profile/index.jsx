import React, { useState } from 'react';
import avatar from "../../../assets/img/profile/banner.png";
import { Star } from 'lucide-react';
const Profile = () => {
  const [profileData, setProfileData] = useState({
    firstName: "Musharof",
    lastName: "Chowdhury",
    email: "randomuser@pimjo.com",
    phone: "+09 363 398 46",
    description: "Designer et développeur web avec plus de 5 ans d'expérience dans la création d'interfaces utilisateur modernes et réactives. Spécialisé dans les technologies front-end et passionné par l'expérience utilisateur.",
    rating: 5
  });

  // État pour suivre quelle section est en cours d'édition
  const [editingSections, setEditingSections] = useState({
    profile: false,
    personal: false,
    description: false
  });

  // État temporaire pour stocker les modifications en cours
  const [tempData, setTempData] = useState({...profileData});
  
  // État pour la gestion des compétences pendant l'édition
  const [newSkill, setNewSkill] = useState("");

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
  const saveChanges = (section) => {
    setProfileData({...profileData, ...tempData});
    setEditingSections({...editingSections, [section]: false});
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
              </div>
            ) : (
              <div className="flex items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {profileData.firstName} {profileData.lastName}
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


  

  return (
    <div className="min-h-screen p-6 mb-6 text-white ">
      {renderMainProfile()}
      {renderPersonalInfo()}
      {renderDescription()}
    </div>
  );
};

export default Profile;