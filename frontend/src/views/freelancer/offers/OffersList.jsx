import React from 'react';

const statusColors = {
  "En attente": "bg-yellow-100 text-yellow-800",
  "Accepté": "bg-green-100 text-green-800",
  "Refusé": "bg-red-100 text-red-800",
  "En cours": "bg-blue-100 text-blue-800"
};

const OffersList = ({ offers, onViewDetails }) => {
  return (
    <div className="p-6">
      {offers.map((offer) => (
        <div key={offer.id} className="p-6 mb-4 bg-white rounded-lg shadow dark:!bg-navy-800  border border-[#4242425a]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold dark:text-white">{offer.title}</h2>
              <p className="mt-1 text-sm text-gray-600">Client: {offer.client}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[offer.status]}`}>
              {offer.status}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {offer.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 text-sm text-gray-800 border rounded-full dark:text-white">
                {skill}
                </span>
            ))}
            </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500 ">Prix proposé</p>
              <p className="font-medium dark:text-white">{offer.price}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Délai proposé</p>
              <p className="font-medium dark:text-white">{offer.timeline}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de soumission</p>
              <p className="font-medium dark:text-white">{offer.submittedDate}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <button 
              onClick={() => onViewDetails(offer.id)}
              className="text-sm font-medium text-blue-500 hover:text-blue-700"
            >
              Voir les détails
            </button>
            
            {offer.status === "Accepté" && (
              <button className="px-4 py-2 text-sm text-white bg-[#33647E] rounded hover:bg-[#224254]">
                Contacter le client
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OffersList;