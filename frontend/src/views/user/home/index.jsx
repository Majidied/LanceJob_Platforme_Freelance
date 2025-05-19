import React, { useState,useEffect } from 'react';
import { User } from 'lucide-react';
import { VscVerifiedFilled } from "react-icons/vsc";
import { fetchFreelancers } from '../../../api/freelancer';

const Home = () => {
  const [activeTab, setActiveTab] = useState('bestMatches');
  const [talents, setTalents] = useState([]);
  const tabs = [
    { id: 'bestMatches', name: 'Best Matches' },
    { id: 'mostRecent', name: 'Most Recent' }
  ];
  const loadFreelancers = async () => {
  try {
    const response = await fetchFreelancers();
    
    const freelancersArray = Array.isArray(response) 
      ? response 
      : (response?.data || response?.freelancers || Object.values(response || {}));
      
    setTalents(freelancersArray.map(freelancer => ({
      ...freelancer,
      applications: freelancer.applications || []
    })));
  } catch (error) {
    console.error("Erreur lors du chargement des freelancers :", error);
    setTalents([]);
  }
};
  useEffect(() => {
    loadFreelancers();
  }, []);
  

  return (
    <div className="flex flex-col h-full">
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
      
      {/* Talent List */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-1 gap-4 ">
          {talents.map(talent => (
            <div key={talent.id} className="p-4 bg-white rounded-lg shadow dark:!bg-navy-800 border border-[#4242425a]">
              <div className="flex">
                <div className="mr-4">
                  <div className="relative">
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                      <User size={32} className="text-blue-500" />
                    </div>
                    <div className="absolute w-6 h-6 bg-green-500 border-2 border-white rounded-full -bottom-1 -right-1"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold dark:text-white">{talent.name}</h3>
                  <p className="text-lg dark:text-white">{talent.title}</p>
                  
                  <div className="flex items-center mt-2 space-x-6 dark:text-white">
                    <div>{talent.rate}</div>
                    <div className="flex items-center">
                    <VscVerifiedFilled className="w-4 h-4 mr-1 rounded-full text-[#1dc2fb]"/>
                      <span>{talent.success}% Job Success</span>
                    </div>
                    <div>${talent.earned}K+ Earned</div>
                  </div>
                  
                  <p className="mt-3 text-gray-600">{talent.bio}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {talent.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 text-sm text-gray-800 border rounded-full dark:text-white">
                        {skill}
                      </span>
                    ))}
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