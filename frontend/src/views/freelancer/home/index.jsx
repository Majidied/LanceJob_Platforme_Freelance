import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Link } from "react-router-dom";
import { useFreelancer } from '../../../context/FreelancerContext'; // Nouveau context

const Home = () => {
  const [activeTab, setActiveTab] = useState('bestMatches');
  const tabs = [
    { id: 'bestMatches', name: 'Best Matches' },
    { id: 'mostRecent', name: 'Most Recent' }
  ];
  
  // Utiliser le context FreelancerContext pour accéder aux jobs et fonctions
  const { jobs, loading, error, fetchJobs, toggleSaveJob } = useFreelancer();
  
  // Charger les jobs au montage du composant
  useEffect(() => {
    fetchJobs();
  }, []);
  
  // Gérer le toggle des favoris avec l'API
  const handleToggleFavorite = async (jobId) => {
    try {
      await toggleSaveJob(jobId);
    } catch (err) {
      console.error('Error toggling job favorite:', err);
    }
  };

  // Si chargement en cours
  if (loading.jobs) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#518394]"></div>
    </div>;
  }

  // Si erreur
  if (error.jobs) {
    return <div className="text-red-500 text-center p-4">
      Error loading jobs: {error.jobs}
    </div>;
  }

  return (
    <div className="flex flex-col h-full ">
      {/* Tabs */}
      <div className="m-2 ">
        <div className="flex ">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`py-3 px-16 w-1/2  text-center ${activeTab === tab.id ? 'text-[#518394] border-b-2 border-[#518394] font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Job Listings */}
      <div className="flex-1 w-full max-w-screen-xl p-4 mx-auto ">
        <div className="flex flex-col gap-4">
          {jobs.map(job => (
            <div key={job._id} className="p-6 bg-white rounded-lg shadow dark:!bg-navy-800 border border-[#4242425a]">
              <div className="flex justify-between">
                <div className="flex-1">
                  {/* Job Header */}
                  <div className="flex justify-between mb-3">
                    <h3 className="text-xl font-bold dark:text-white">{job.title}</h3>
                    <div className="flex items-center">
                      <span className="mr-2 text-gray-500">
                        {new Date(job.createdAt).toRelativeTimeString()}
                      </span>
                      <Heart 
                        className={`w-6 h-6 cursor-pointer ${job.isSaved ? 'fill-red-500 text-red-500' : 'text-gray-300'}`}
                        onClick={() => handleToggleFavorite(job._id)}
                      />
                    </div>
                  </div>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills && job.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 text-sm text-gray-800 border rounded-full dark:text-white">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  {/* Description */}
                  <p className="mb-4 text-gray-600">{job.description}</p>
                  <Link to={`/freelancer/jobs/${job._id}`} className="mb-4 text-blue-500 cursor-pointer">Read more</Link>
                  
                  {/* Job Details Table */}
                  <div className="flex mb-4 rounded-lg bg-[#F3F9FA] dark:!bg-navy-900">
                    <div className="flex-1 p-4">
                      <div className="text-sm text-gray-500">Price</div>
                      <div className="text-black dark:text-white ">{job.price} {job.currency || 'MAD'}</div>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="text-sm text-gray-500">Type</div>
                      <div className="text-black dark:text-white ">{job.priceType}</div>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="text-sm text-gray-500">Time line</div>
                      <div className="text-black dark:text-white ">{job.timeline}</div>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="text-sm text-gray-500">Exp</div>
                      <div className="text-black dark:text-white ">{job.experienceLevel}</div>
                    </div>
                    <div className="p-4 ml-auto pt-7">
                      <Link
                        to={`/freelancer/jobs/${job._id}#application-form`}
                        className="px-6 py-2 text-white transition-colors duration-200 bg-[#86C1A3] rounded-md hover:bg-[#5f9478]"
                      >
                        Apply
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;