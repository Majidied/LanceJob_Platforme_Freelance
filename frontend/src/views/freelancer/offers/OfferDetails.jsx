import React from 'react';

const statusColors = {
  "En attente": "bg-yellow-100 text-yellow-800",
  "Accepté": "bg-green-100 text-green-800",
  "Refusé": "bg-red-100 text-red-800",
  "En cours": "bg-blue-100 text-blue-800"
};

const OfferDetails = ({ offer, onBackToList }) => {
  if (!offer) return null;
  
  return (
    <div className="p-6">
      <button 
        onClick={onBackToList}
        className="flex items-center mb-6 text-[#356e8c] hover:text-[#27353d]"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Retour à la liste
      </button>
      
      <div className="p-6 bg-white border border-[#4242425a] rounded-lg shadow dark:!bg-navy-800">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold dark:text-white">{offer.title}</h1>
            <p className="text-gray-600 ">Client: {offer.client}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[offer.status]}`}>
            {offer.status}
          </span>
        </div>
        
        <div className="pt-4 mt-4 border-t border-gray-200">
          <h2 className="mb-2 text-lg font-semibold dark:text-white">Description originale du projet</h2>
          <p className="text-gray-700">{offer.description}</p>
        </div>
        
        <div className="pt-4 mt-4 border-t border-gray-200">
          <h2 className="mb-2 text-lg font-semibold dark:text-white">Ma proposition</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Prix proposé</p>
              <p className="font-medium dark:text-white">{offer.price}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Délai proposé</p>
              <p className="font-medium dark:text-white">{offer.timeline}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="mb-1 text-sm text-gray-500">Lettre de motivation</p>
            <div className="p-4 rounded bg-gray-50 dark:bg-navy-900">
              <p className="text-gray-700">{offer.coverLetter}</p>
            </div>
          </div>
          
          <div>
            <p className="mb-1 text-sm text-gray-500">Pièces jointes</p>
            <div className="flex flex-wrap gap-2 text-gray-700" >
              {offer.attachments.map((attachment, index) => (
                <a 
                  key={index}
                  href="#" 
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200 dark:bg-navy-900"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                  </svg>
                  {attachment}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {offer.clientResponse && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <h2 className="mb-2 text-lg font-semibold">Réponse du client</h2>
            <div className="p-4 rounded bg-gray-50">
              <p className="text-gray-700">{offer.clientResponse}</p>
            </div>
          </div>
        )}
        
        {offer.status === "Accepté" && (
          <div className="flex justify-end mt-6">
            <button className="px-6 py-2 text-white bg-[#33647E] rounded hover:bg-[#224254]">
              Contacter le client
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferDetails;