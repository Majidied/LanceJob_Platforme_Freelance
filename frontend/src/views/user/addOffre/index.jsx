import React, { useState } from 'react';
import { X, Save, Plus, ChevronLeft, ChevronRight, Check, Search, Briefcase, Clock, DollarSign, Upload, Calendar } from 'lucide-react';
import { createMission } from '../../../api/mission';

const AddOffre = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const [formData, setFormData] = useState({
    // Step 1: Job Details
    title: '',
    description: '',
    tags: [],
    //category: '',
    
    // Step 2: Project Scope
    type: 'fixe',
    budget: '',
    deadline: '',
    experience: 'intermediaire',
    client: '663c0a5b5f1c2f7b2d765456',
    status: 'published',
    // Step 3: Job Requirements
    //additionalRequirements: '',
    //preferredQualifications: '',
    attachments: [],
    applications:[],
    assignedTo :null        
    // Step 4: Review and Publish
    //visibility: 'Public',
    //urgency: 'Normal',
    //location: 'Remote'
  });
  
  const [newSkill, setNewSkill] = useState('');
  
  // Categories for demo
  const categories = [
    'Web Development', 'Mobile App Development', 'UI/UX Design', 
    'Graphic Design', 'Content Writing', 'Digital Marketing',
    'Data Analysis', 'Translation', 'Video Editing'
  ];
  
  // Suggested skills
  const suggestedSkills = [
    'JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'Python', 
    'WordPress', 'Figma', 'Adobe Photoshop', 'Copywriting',
    'SEO', 'Social Media', 'Video Production'
  ];
  
  // Navigate to next step
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle expertise level change
  const handleExpertiseChange = (level) => {
    setFormData({
      ...formData,
      experience: level
    });
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Add skill
  const addSkill = (skill) => {
    if (skill && !formData.tags.includes(skill)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, skill]
      });
      setNewSkill('');
    }
  };
  
  // Remove skill
  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(item => item !== skill)
    });
  };
  
  // Handle number inputs (budget, duration)
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Submit form
  const handleSubmit = async () => {
  try {
    const result = await createMission(formData);
    console.log("Mission créée avec succès:", result);
    alert("Offre ajoutée avec succès !");
    // Tu peux réinitialiser le formulaire ou rediriger ici
  } catch (error) {
    console.error("Erreur détaillée:", error.response?.data || error.message);
    alert("Erreur lors de la création de la mission.");
  }
};

  
  // Render step based on current step
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <>
            <h2 className="mb-6 text-xl font-bold text-gray-800">Détails de l'offre d'emploi</h2>
            
            <div className="space-y-6">
              {/* Job Title */}
              <div>
                <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-700">
                  Titre de l'offre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#417b9a] focus:border-[#417b9a]"
                  placeholder="Ex: Développeur Web Front-end pour projet e-commerce"
                />
              </div>
              
              {/* Job Description */}
              <div>
                <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">
                  Description du projet <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="6"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#417b9a] focus:border-[#417b9a]"
                  placeholder="Décrivez le projet, les responsabilités et les livrables attendus..."
                ></textarea>
              </div>
              
              {/* tags Required */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Compétences requises <span className="text-red-500">*</span>
                </label>
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((skill, index) => (
                      <div key={index} className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
                        <span className="text-sm text-gray-800">{skill}</span>
                        <button 
                          className="ml-1 text-gray-500 hover:text-gray-700"
                          onClick={() => removeSkill(skill)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-[#417b9a] focus:border-[#417b9a]"
                      placeholder="Ajouter une compétence"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))}
                    />
                    <button 
                      className="px-4 py-2 text-white bg-[#417b9a] rounded-r-md hover:bg-[#417b9aa3]"
                      onClick={() => addSkill(newSkill)}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">Compétences suggérées</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSkills.map((skill, index) => (
                      <button
                        key={index}
                        className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200"
                        onClick={() => addSkill(skill)}
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Job Category */}
              {/*<div>
                <label htmlFor="category" className="block mb-1 text-sm font-medium text-gray-700">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#417b9a] focus:border-[#417b9a]"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </div>*/}
            </div>
          </>
        );
      
      case 2:
        return (
          <>
            <h2 className="mb-6 text-xl font-bold text-gray-800">Type et budget du projet</h2>
            
            <div className="space-y-6">
              {/* Project Type */}
              <div>
                <label htmlFor="type" className="block mb-1 text-sm font-medium text-gray-700">
                  Type de projet
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#417b9a] focus:border-[#417b9a]"
                >
                  <option value="fixe">Prix fixe</option>
                  <option value="Taux horaire">Taux horaire</option>
                  <option value="long terme">Long terme</option>
                </select>
              </div>
              
              {/* Budget */}
              <div>
                <label htmlFor="budget" className="block mb-1 text-sm font-medium text-gray-700">
                  Budget (MAD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleNumberChange}
                    className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#417b9a] focus:border-[#417b9a]"
                    placeholder="Ex: 5000"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <DollarSign size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
              
              {/* Duration */}
              <div>
                <label htmlFor="deadline" className="block mb-1 text-sm font-medium text-gray-700">
                  Durée estimée (jours) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#417b9a] focus:border-[#417b9a]"
                    placeholder="Ex: 14"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
              
              {/* Expertise Level */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Niveau d'expertise requis
                </label>
                <div className="flex overflow-hidden border border-gray-300 rounded-md">
                  <button
                    type="button"
                    className={`flex-1 py-2 text-center font-medium ${formData.experience === 'debutant' ? 'bg-[#417b9a] text-white' : 'bg-white text-gray-700'}`}
                    onClick={() => handleExpertiseChange('debutant')}
                  >
                    Débutant
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 text-center font-medium ${formData.experience === 'intermediaire' ? 'bg-[#417b9a] text-white' : 'bg-white text-gray-700'}`}
                    onClick={() => handleExpertiseChange('intermediaire')}
                  >
                    Intermédiaire
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 text-center font-medium ${formData.experience === 'expert' ? 'bg-[#417b9a] text-white' : 'bg-white text-gray-700'}`}
                    onClick={() => handleExpertiseChange('expert')}
                  >
                    Expert
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      
      case 3:
        return (
          <>
            <h2 className="mb-6 text-xl font-bold text-gray-800">Exigences spécifiques</h2>
            
            <div className="space-y-6">
              {/* Additional Requirements */}
              <div>
                <label htmlFor="additionalRequirements" className="block mb-1 text-sm font-medium text-gray-700">
                  Exigences supplémentaires
                </label>
                <textarea
                  id="additionalRequirements"
                  name="additionalRequirements"
                  value={formData.additionalRequirements}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#417b9a] focus:border-[#417b9a]"
                  placeholder="Précisez les exigences spécifiques pour cette offre..."
                ></textarea>
              </div>
              
              {/* Preferred Qualifications */}
              <div>
                <label htmlFor="preferredQualifications" className="block mb-1 text-sm font-medium text-gray-700">
                  Qualifications préférées
                </label>
                <textarea
                  id="preferredQualifications"
                  name="preferredQualifications"
                  value={formData.preferredQualifications}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#417b9a] focus:border-[#417b9a]"
                  placeholder="Décrivez les qualifications que vous préférez voir chez les candidats..."
                ></textarea>
              </div>
              
              {/* File Attachments */}
              <div>
                <label className="block mb-3 text-sm font-medium text-gray-700">
                  Pièces jointes (optionnel)
                </label>
                <div className="p-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Upload size={32} className="text-gray-400" />
                    <p className="text-sm text-gray-500">Glissez-déposez vos fichiers ici ou</p>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-[#417b9a] hover:text-[#293b46]"
                    >
                      Parcourir les fichiers
                    </button>
                    <input type="file" className="hidden" multiple />
                    <p className="text-xs text-gray-400">Formats acceptés: PDF, DOC, DOCX, JPG, PNG (max 5 MB)</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      
      case 4:
        return (
          <>
            <h2 className="mb-6 text-xl font-bold text-gray-800">Révision et publication</h2>
            
            <div className="p-6 mb-6 rounded-lg bg-gray-50">
              <h3 className="mb-4 text-lg font-medium text-gray-800">Résumé de l'offre</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Titre</p>
                    <p className="text-gray-800">{formData.title || "Non spécifié"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Catégorie</p>
                    <p className="text-gray-800">{formData.category || "Non spécifiée"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type de projet</p>
                    <p className="text-gray-800">{formData.type === "fixe" ? "Prix fixe" : formData.type === "Taux horaire" ? "Taux horaire" : "long terme"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Budget</p>
                    <p className="text-gray-800">{formData.budget ? `${formData.budget} MAD` : "Non spécifié"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Durée</p>
                    <p className="text-gray-800">{formData.deadline ? `${formData.deadline}` : "Non spécifiée"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Niveau d'expertise</p>
                    <p className="text-gray-800">
                      {formData.experience === "Beginner" ? "Débutant" : 
                       formData.experience === "Intermediate" ? "Intermédiaire" : "Expert"}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Compétences requises</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.tags.length > 0 ? formData.tags.map((skill, index) => (
                      <span key={index} className="px-3 py-1 text-sm text-gray-800 bg-gray-100 rounded-full">
                        {skill}
                      </span>
                    )) : <p className="text-gray-800">Aucune compétence spécifiée</p>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Visibility */}
              <div>
                <label htmlFor="visibility" className="block mb-1 text-sm font-medium text-gray-700">
                  Visibilité de l'offre
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#417b9a] focus:border-[#417b9a]"
                >
                  <option value="Public">Publique (visible par tous)</option>
                  <option value="Private">Privée (sur invitation uniquement)</option>
                </select>
              </div>
              
              {/* Urgency */}
              <div>
                <label htmlFor="urgency" className="block mb-1 text-sm font-medium text-gray-700">
                  Urgence
                </label>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#417b9a] focus:border-[#417b9a]"
                >
                  <option value="Low">Basse</option>
                  <option value="Normal">Normale</option>
                  <option value="High">Haute</option>
                  <option value="Urgent">Urgente</option>
                </select>
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl p-8 mx-auto bg-white shadow-sm rounded-xl">
        <h1 className="mb-8 text-2xl font-bold text-center text-gray-600">Ajouter une offre</h1>
        
        {renderStep()}
        
        <div className="mt-10">
          <div className="w-full h-1 overflow-hidden bg-gray-200 rounded-full">
            <div 
              className="h-full transition-all duration-300 ease-in-out bg-[#417b9a]"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prevStep}
              className={`px-6 py-2 font-medium ${currentStep === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-gray-900'}`}
              disabled={currentStep === 1}
            >
              Retour
            </button>
            
            <span className="text-sm text-gray-500">
              {currentStep}/{totalSteps}
            </span>
            
            <button
              onClick={currentStep === totalSteps ? handleSubmit : nextStep}
              className="px-6 py-2 font-medium text-white bg-[#417b9a] rounded-md hover:bg-[#698a9c]"
            >
              {currentStep === totalSteps ? 'Publier' : 'Suivant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOffre;