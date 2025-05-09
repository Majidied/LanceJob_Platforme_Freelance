import React, { useState } from 'react';
import { Clock, MapPin, Briefcase, DollarSign, Users, ChevronLeft, Star, Calendar, MessageCircle, User, FilePlus, Check, X ,Plus} from 'lucide-react';
import { Link } from "react-router-dom";

const MyOffers = () => {
  const [selectedOffer, setSelectedOffer] = useState(null);
  
  // Sample data for offers
  const offers = [
    {
      id: 1,
      title: "2D Floor Plan, 3d Interior and Exterior Design",
      description: "Looking for an experienced designer to create floor plans and 3D designs for a luxury campsite project with unique buildings.",
      skills: ["Web Design", "Visual Design", "Blender"],
      price: "600 MAD",
      type: "Fixed price",
      timeline: "7 days",
      experience: "Expert",
      applications: 8,
      date: "2 days ago",
      applicants: [
        {
          id: 101,
          name: "Sarah Johnson",
          avatar: "/api/placeholder/40/40",
          rating: 4.9,
          completedJobs: 127,
          description: "Professional interior designer with 8+ years of experience in 3D modeling and architectural visualization.",
          price: "580 MAD",
          timeline: "6 days"
        },
        {
          id: 102,
          name: "David Chen",
          avatar: "/api/placeholder/40/40",
          rating: 4.7,
          completedJobs: 93,
          description: "Specialized in Blender with focus on photorealistic rendering for residential and commercial spaces.",
          price: "620 MAD",
          timeline: "5 days"
        },
        {
          id: 103,
          name: "Maria Garcia",
          avatar: "/api/placeholder/40/40",
          rating: 4.8,
          completedJobs: 104,
          description: "Architect and interior designer with extensive portfolio in luxury building visualization.",
          price: "600 MAD",
          timeline: "7 days"
        }
      ]
    },
    {
      id: 2,
      title: "Website Redesign for E-commerce Platform",
      description: "Need a complete overhaul of our existing e-commerce website with focus on mobile responsiveness and user experience.",
      skills: ["React", "UI/UX Design", "Shopify"],
      price: "1200 MAD",
      type: "Fixed price",
      timeline: "14 days",
      experience: "Intermediate",
      applications: 12,
      date: "1 day ago",
      applicants: [
        {
          id: 201,
          name: "Alex Turner",
          avatar: "/api/placeholder/40/40",
          rating: 4.6,
          completedJobs: 85,
          description: "Front-end developer specializing in React and e-commerce solutions with 5 years of experience.",
          price: "1150 MAD",
          timeline: "12 days"
        },
        {
          id: 202,
          name: "Jessica Wong",
          avatar: "/api/placeholder/40/40",
          rating: 4.9,
          completedJobs: 114,
          description: "Full-stack developer with expertise in Shopify customization and responsive design.",
          price: "1250 MAD",
          timeline: "13 days"
        }
      ]
    },
    {
      id: 3,
      title: "Logo Design and Brand Identity",
      description: "Creating a modern logo and brand identity for a new fitness studio focusing on holistic wellness approaches.",
      skills: ["Logo Design", "Branding", "Adobe Illustrator"],
      price: "450 MAD",
      type: "Fixed price",
      timeline: "5 days",
      experience: "Any level",
      applications: 15,
      date: "3 days ago",
      applicants: [
        {
          id: 301,
          name: "Emma Lewis",
          avatar: "/api/placeholder/40/40",
          rating: 4.8,
          completedJobs: 76,
          description: "Graphic designer specializing in minimalist logo design and visual identity systems.",
          price: "440 MAD",
          timeline: "4 days"
        },
        {
          id: 302,
          name: "Michael Brown",
          avatar: "/api/placeholder/40/40",
          rating: 4.5,
          completedJobs: 58,
          description: "Brand identity designer with focus on fitness and wellness industry.",
          price: "470 MAD", 
          timeline: "5 days"
        }
      ]
    }
  ];

  // Handle click on an offer
  const handleOfferClick = (offer) => {
    setSelectedOffer(offer);
  };

  // Return to list of offers
  const handleBackClick = () => {
    setSelectedOffer(null);
  };

  // If an offer is selected, show applicants
  if (selectedOffer) {
    return (
      <div className="flex flex-col h-full ">
        <div className="flex items-center p-4 mt-5 mb-4">
          <button 
            onClick={handleBackClick}
            className="flex items-center text-[#356e8c] hover:text-[#27353d] transition-colors "
          >
            <ChevronLeft size={20} />
            <span className="ml-1 font-medium">Back to My Offers</span>
          </button>
        </div>
        
        <div className="px-6 pb-6">
          <div className="p-5 mb-6 bg-white shadow-sm rounded-xl">
            <h1 className="text-2xl font-bold text-slate-800">{selectedOffer.title}</h1>
            <p className="mt-3 text-slate-600">{selectedOffer.description}</p>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedOffer.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 text-xs text-gray-800 border rounded-full dark:text-white">
                  {skill}
                </span>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-6 p-4 mt-5 border border-[#4242425a] rounded-lg bg-slate-50 sm:grid-cols-4">
              <div className="flex items-center">
                <div className="p-2 bg-[#2e424c2d] rounded-full">
                  <DollarSign size={18} className="text-[#2E424C]" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-slate-500">Budget</p>
                  <p className="font-semibold text-slate-800">{selectedOffer.price}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-[#2e424c2d] rounded-full">
                  <Clock size={18} className="text-[#2E424C]" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-slate-500">Duration</p>
                  <p className="font-semibold text-slate-800">{selectedOffer.timeline}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-[#2e424c2d] rounded-full">
                  <Briefcase size={18} className="text-[#2E424C]" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-slate-500">Type</p>
                  <p className="font-semibold text-slate-800">{selectedOffer.type}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-[#2e424c2d] rounded-full">
                  <Users size={18} className="text-[#2E424C]" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-slate-500">Applications</p>
                  <p className="font-semibold text-slate-800">{selectedOffer.applications}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-800">Applicants ({selectedOffer.applicants.length})</h2>
            <div className="flex">
              
              <button className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#2E424C] rounded-lg hover:bg-[#405c6b]">
                <User size={16} className="mr-2" />
                Invite Freelancers
              </button>
            </div>
          </div>
          
          <div className="grid gap-4">
            {selectedOffer.applicants.map(applicant => (
              <div key={applicant.id} className="overflow-hidden bg-white shadow-sm rounded-xl">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="relative">
                        <img 
                          src={applicant.avatar} 
                          alt={applicant.name} 
                          className="w-12 h-12 border-2 border-indigo-100 rounded-full"
                        />
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-slate-800">{applicant.name}</h3>
                        <div className="flex items-center mt-1">
                          <div className="flex items-center px-2 py-1 rounded-md bg-yellow-50">
                            <Star size={14} className="text-yellow-500" />
                            <span className="ml-1 text-sm font-medium text-yellow-700">{applicant.rating}</span>
                          </div>
                          <span className="mx-2 text-slate-400">•</span>
                          <span className="text-sm text-slate-600">{applicant.completedJobs} jobs completed</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 bg-slate-100 hover:bg-slate-200">
                        <MessageCircle size={18} />
                      </button>
                      <button className="px-4 py-2 text-sm font-medium text-white transition-colors bg-[#86C1A3] rounded-md hover:bg-[#5f9478]">
                        Hire Now
                      </button>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-slate-600">{applicant.description}</p>
                  
                  <div className="flex flex-wrap pt-4 mt-5 ">
                    <div className="flex items-center px-3 py-2 mr-4 rounded-lg bg-slate-50">
                      <DollarSign size={16} className="text-slate-600" />
                      <span className="ml-2 text-sm font-semibold text-slate-800">{applicant.price}</span>
                    </div>
                    <div className="flex items-center px-3 py-2 mr-4 rounded-lg bg-slate-50">
                      <Calendar size={16} className="text-slate-600" />
                      <span className="ml-2 text-sm font-semibold text-slate-800">{applicant.timeline}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end p-3 border-t bg-slate-50">
                  <button className="flex items-center justify-center w-8 h-8 mr-2 text-red-600 rounded-full bg-red-50 hover:bg-red-100">
                    <X size={16} />
                  </button>
                  <button className="flex items-center justify-center w-8 h-8 text-green-600 rounded-full bg-green-50 hover:bg-green-100">
                    <Check size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default view: list of offers
  return (
    <div className="p-6 space-y-6">
      {/* Bouton Ajouter une offre */}
      <div className="flex justify-end">
      <Link to={`/home/add-offre`}>
      <button className="flex items-center px-4 py-2 font-medium text-white transition-colors shadow-sm bg-[#2E424C] rounded-lg hover:bg-[#405c6b]">
        <Plus size={20} className="mr-2" />
        <span>Ajouter une offre</span>
      </button>
      </Link>
      </div>
      {/* Liste des offres */}
      <div className="grid h-full grid-cols-1 gap-6">
        {offers.map(offer => (
          <div 
            key={offer.id}
            className="overflow-hidden transition-shadow bg-white shadow-sm cursor-pointer rounded-xl hover:shadow-md border border-[#4242425a]"
            onClick={() => handleOfferClick(offer)}
          >
            <div className="p-5">
              <div className="flex items-center mb-3">
                <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-md">
                  Active
                </span>
                <span className="ml-auto text-sm text-slate-500">{offer.date}</span>
              </div>
              
              <h2 className="mb-2 text-lg font-bold text-slate-800">{offer.title}</h2>
              <p className="mb-4 text-sm text-slate-600 line-clamp-2">{offer.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-5">
                {offer.skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 text-xs text-gray-800 border rounded-full dark:text-white0">
                    {skill}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 sm:grid-cols-4">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-500">Budget</span>
                  <span className="text-sm font-semibold text-slate-800">{offer.price}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-500">Type</span>
                  <span className="text-sm font-semibold text-slate-800">{offer.type}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-500">Duration</span>
                  <span className="text-sm font-semibold text-slate-800">{offer.timeline}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-500">Experience</span>
                  <span className="text-sm font-semibold text-slate-800">{offer.experience}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border-t bg-[#2e424c0e] from-indigo-50 to-blue-50">
              <div className="flex items-center">
                <Users size={18} className="text-[#2E424C]" />
                <span className="ml-2 font-medium text-[#2E424C]">{offer.applications} applicants</span>
              </div>
              <button className="px-3 py-1 text-xs font-medium text-[#2E424C] bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
};

export default MyOffers;