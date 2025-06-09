import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Clock, DollarSign, Send, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFreelancer } from '../../../context/FreelancerContext';

const EditOfferPage = () => {
  // Get the jobId from URL parameters
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  // Context pour récupérer les données et fonctions
  const { jobs, loading, error, applyForJob } = useFreelancer();
  
  // State for form fields
  const [price, setPrice] = useState(500);
  const [currency, setCurrency] = useState('MAD');
  const [deliveryTime, setDeliveryTime] = useState('')
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // State pour les détails du job
  const [jobDetails, setJobDetails] = useState(null);
  
  // Récupérer les détails du job depuis le context
  useEffect(() => {
    if (jobs && jobs.length > 0 && jobId) {
      const job = jobs.find(j => j._id === jobId);
      if (job) {
        setJobDetails(job);
        // Pré-remplir le formulaire avec les données du job
        if (job.price) {
          setPrice(job.price);
        }
        if (job.currency) {
          setCurrency(job.currency);
        }
      } else {
        console.warn(`Job with ID ${jobId} not found`);
      }
    }
  }, [jobs, jobId]);
  
  // Fonction utilitaire pour calculer le temps relatif
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'à l\'instant';
    if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} minutes`;
    if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)} heures`;
    if (diffInSeconds < 2592000) return `il y a ${Math.floor(diffInSeconds / 86400)} jours`;
    return date.toLocaleDateString('fr-FR');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!coverLetter.trim()) {
      alert('Veuillez rédiger une lettre de motivation');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const proposal = {
        coverLetter,
        proposedPrice: price,
        currency,
        deliveryTime,
        attachments: [] // À implémenter plus tard pour les fichiers
      };
      
      await applyForJob(jobId, proposal);
      
      alert('Votre candidature a été soumise avec succès !');
      navigate('/freelancer/home');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Erreur lors de la soumission: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  // États de chargement et d'erreur
  if (loading.jobs) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#518394]"></div>
      </div>
    );
  }
  
  if (error.jobs) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-red-600">Erreur de chargement</h2>
          <p className="mb-4 text-gray-600">{error.jobs}</p>
          <button 
            onClick={() => navigate('/freelancer/home')}
            className="px-4 py-2 bg-[#518394] text-white rounded hover:bg-[#406c7a]"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }
  
  if (!jobDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-600">Mission non trouvée</h2>
          <p className="mb-4 text-gray-500">La mission demandée n'existe pas ou a été supprimée.</p>
          <button 
            onClick={() => navigate('/freelancer/home')}
            className="px-4 py-2 bg-[#518394] text-white rounded hover:bg-[#406c7a]"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec bouton retour */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl px-4 py-4 mx-auto">
          <button 
            onClick={() => navigate('/freelancer/home')}
            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            <span>Retour aux missions</span>
          </button>
        </div>
      </div>
      
      <main className="max-w-5xl px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left column - Project details */}
          <div className="md:col-span-1">
            <div className="p-6 mb-6 bg-white rounded-lg shadow border border-[#4242425a]">
              <h2 className="mb-4 text-lg font-medium">Détails du projet</h2>
              <div className="mb-4">
                <h3 className="font-medium text-gray-900">{jobDetails.title}</h3>
                {jobDetails.skills && jobDetails.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {jobDetails.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <p className="mb-4 text-sm text-gray-600">
                {jobDetails.description}
              </p>
              
              {/* Informations supplémentaires */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Budget:</span>
                  <span className="font-medium">{jobDetails.price} {jobDetails.currency || 'MAD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{jobDetails.priceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Délai:</span>
                  <span className="font-medium">{jobDetails.timeline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Niveau:</span>
                  <span className="font-medium">{jobDetails.experienceLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Publié:</span>
                  <span className="font-medium">{getRelativeTime(jobDetails.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow border border-[#4242425a]">
              <h2 className="mb-4 text-lg font-medium">Détails du client</h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                  <span className="text-sm font-semibold text-white">
                    {jobDetails.clientName ? jobDetails.clientName.charAt(0).toUpperCase() : 'C'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{jobDetails.clientName || 'Client anonyme'}</p>
                  <p className="text-sm text-gray-500">
                    {jobDetails.clientSince ? `Client depuis ${jobDetails.clientSince}` : 'Nouveau client'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Actif récemment</span>
              </div>
            </div>
          </div>
          
          {/* Right column - Edit offer */}
          <div className="md:col-span-2">
            <div className="p-6 bg-white rounded-lg shadow border border-[#4242425a]">
              <h2 className="mb-6 text-lg font-medium">Personnaliser votre offre</h2>
              
              <form onSubmit={handleSubmit}>
                {/* Price */}
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Prix proposé
                  </label>
                  <div className="flex">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <DollarSign size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="block w-full py-2 pl-10 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#518394] focus:border-transparent"
                        min="1"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <label className="sr-only">Currency</label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="h-full py-0 pl-2 text-gray-500 bg-transparent border-transparent rounded-md pr-7 focus:ring-2 focus:ring-[#518394]"
                        >
                          <option value="MAD">MAD</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Budget du client: {jobDetails.price} {jobDetails.currency || 'MAD'}
                  </p>
                </div>
                
                {/* Delivery Date */}
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Date de livraison
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#518394] focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]} // Date minimum = aujourd'hui
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Délai souhaité par le client: {jobDetails.timeline}
                  </p>
                </div>
                
                {/* Cover Letter */}
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Lettre de motivation *
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={6}
                    className="block w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#518394] focus:border-transparent"
                    placeholder="Présentez-vous et expliquez pourquoi vous êtes la personne idéale pour ce projet..."
                    required
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500">
                    {coverLetter.length}/1000 caractères
                  </p>
                </div>
                
                {/* Attachment options */}
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-medium text-gray-700">Pièces jointes (facultatif)</h3>
                  <div className="p-4 text-center transition-colors border border-gray-300 border-dashed rounded-md hover:border-gray-400">
                    <button type="button" className="text-sm font-medium text-teal-600 hover:text-teal-700">
                      + Ajouter des fichiers ou un portfolio
                    </button>
                  </div>
                </div>
                
                {/* Submit button */}
                <button 
                  type="submit"
                  disabled={submitting || !coverLetter.trim()}
                  className={`flex items-center justify-center w-full gap-2 py-3 text-white rounded-md transition-colors ${
                    submitting || !coverLetter.trim()
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#86C1A3] hover:bg-[#5f9478]'
                  }`}
                >
                  <Send size={16} />
                  {submitting ? 'Envoi en cours...' : 'Soumettre votre offre'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditOfferPage;