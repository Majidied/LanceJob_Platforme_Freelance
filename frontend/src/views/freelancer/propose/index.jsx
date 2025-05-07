import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Clock, DollarSign, Send } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const EditOfferPage = () => {
  // Get the jobId from URL parameters
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  // State for form fields
  const [price, setPrice] = useState(500);
  const [currency, setCurrency] = useState('MAD');
  const [deliveryTime, setDeliveryTime] = useState(7);
  const [coverLetter, setCoverLetter] = useState('');
  const [jobDetails, setJobDetails] = useState({
    title: '2D Floor Plan, 3d Interior and Exterior Design.',
    skills: ['Web Design', 'Visual Design', 'Blender'],
    description: 'I hope you are doing well, I\'m looking to a luxury campsite that will be focused on providing a luxury stay in unique buildings. I will need 3 different floor plans options for it. We will select the luxury stay in unique buildings...'
  });
  
  // In a real app, you would fetch the job details based on jobId
  useEffect(() => {
    console.log(`Loading job details for job ID: ${jobId}`);
    // Here you would normally fetch job details from an API
    // For now we'll use the static data
  }, [jobId]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ jobId, price, currency, deliveryTime, coverLetter });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 ">
      <main className="max-w-5xl px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left column - Project details */}
          <div className="md:col-span-1 ">
            <div className="p-6 mb-6 bg-white rounded-lg shadow border border-[#4242425a]">
              <h2 className="mb-4 text-lg font-medium">Détails du projet</h2>
              <div className="mb-4">
                <h3 className="font-medium">{jobDetails.title}</h3>
                <div className="flex gap-2 mt-2">
                  {jobDetails.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
              <p className="mb-4 text-sm text-gray-600">
                {jobDetails.description}
              </p>
              <a href="#" className="text-sm text-teal-600">Voir plus</a>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow border border-[#4242425a]">
              <h2 className="mb-4 text-lg font-medium">Détails du client</h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <p className="font-medium">Aatiq Sawssan</p>
                  <p className="text-sm text-gray-500">Client depuis 2023</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>En ligne maintenant</span>
              </div>
            </div>
          </div>
          
          {/* Right column - Edit offer */}
          <div className="md:col-span-2">
            <div className="p-6 bg-white rounded-lg shadow border border-[#4242425a]">
              <h2 className="mb-6 text-lg font-medium">Personnaliser votre offre</h2>
              
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
                      onChange={(e) => setPrice(e.target.value)}
                      className="block w-full py-2 pl-10 pr-12 border border-gray-300 rounded-md"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <label className="sr-only">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="h-full py-0 pl-2 text-gray-500 bg-transparent border-transparent rounded-md pr-7"
                      >
                        <option value="MAD">MAD</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Delivery Time */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Délai de livraison
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Clock size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="block w-full py-2 pl-10 border border-gray-300 rounded-md"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pointer-events-none">
                    jours
                  </div>
                </div>
              </div>
              
              {/* Cover Letter */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Lettre de motivation
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  className="block w-full p-3 border border-gray-300 rounded-md"
                  placeholder="Présentez-vous et expliquez pourquoi vous êtes la personne idéale pour ce projet..."
                ></textarea>
              </div>
              
              {/* Attachment options */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-gray-700">Pièces jointes (facultatif)</h3>
                <div className="p-4 text-center border border-gray-300 border-dashed rounded-md">
                  <button className="text-sm font-medium text-teal-600">
                    + Ajouter des fichiers ou un portfolio
                  </button>
                </div>
              </div>
              
              {/* Submit button */}
              <button 
                onClick={handleSubmit}
                className="flex items-center justify-center w-full gap-2 py-3 text-white bg-[#86C1A3] rounded-md hover:bg-[#5f9478]  ">
                <Send size={16} />
                Soumettre votre offre
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditOfferPage;