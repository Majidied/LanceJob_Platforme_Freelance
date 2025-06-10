import React, { useState, useEffect } from 'react';
import { User, X, Star, MapPin, Phone, Mail, ArrowRight, Send } from 'lucide-react';
import { VscVerifiedFilled } from "react-icons/vsc";
import { fetchFreelancers } from '../../../api/freelancer';
import { fetchMissions } from '../../../api/mission';
import InviteFreelancerModal from '../../../components/InviteFreelancerModal';

const Home = () => {
  const [activeTab, setActiveTab] = useState('bestMatches');
  const [talents, setTalents] = useState([]);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // ✅ États pour le modal d'invitation
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);

  // ✅ ID du client - à ajuster selon votre logique d'authentification
  const CLIENT_ID = '682bb996ee9d07f9a96d0aef';

  const tabs = [
    { id: 'bestMatches', name: 'Best Matches' },
    { id: 'mostRecent', name: 'Most Recent' }
  ];

  const loadFreelancers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFreelancers();
      
      const freelancersArray = Array.isArray(response) 
        ? response 
        : (response?.data || response?.freelancers || Object.values(response || {}));
        
      const transformedTalents = freelancersArray.map(freelancer => {
        const getFirstValue = (arr, defaultValue = '') => {
          if (Array.isArray(arr) && arr.length > 0) {
            return arr[0];
          }
          return arr || defaultValue;
        };

        return {
          _id: freelancer._id || freelancer.id,
          name: freelancer.name || getFirstValue(freelancer.name, 'Nom non disponible'),
          email: freelancer.email,
          phone: getFirstValue(freelancer.phone, 'Non renseigné'),
          title: getFirstValue(freelancer.title, 'Titre non disponible'),
          bio: getFirstValue(freelancer.bio, 'Bio non disponible'),
          skills: Array.isArray(freelancer.skills) ? freelancer.skills : (freelancer.skills ? [freelancer.skills] : []),
          rating: getFirstValue(freelancer.rating, 0),
          earned: getFirstValue(freelancer.earned, 0),
          success: getFirstValue(freelancer.success, 0),
          address: getFirstValue(freelancer.address, 'Adresse non disponible'),
          rate: `$${getFirstValue(freelancer.earned, 0)}/hr`,
          applications: freelancer.appliedMissions || [],
          history: freelancer.history || []
        };
      });

      setTalents(transformedTalents);
    } catch (error) {
      console.error("Erreur lors du chargement des freelancers :", error);
      setError("Impossible de charger les freelancers");
      setTalents([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Charger les missions du client
  const loadClientMissions = async () => {
    try {
      const response = await fetchMissions();
      const missionsArray = Array.isArray(response) 
        ? response 
        : (response?.data || response?.missions || Object.values(response || {}));
      
      // Filtrer les missions du client connecté
      const clientMissions = missionsArray.filter(
        mission => mission.client === CLIENT_ID && mission.status === 'published'
      );
      
      setMissions(clientMissions);
    } catch (error) {
      console.error("Erreur lors du chargement des missions :", error);
    }
  };

  useEffect(() => {
    loadFreelancers();
    loadClientMissions();
  }, []);

  const handleFreelancerClick = (freelancer) => {
    setSelectedFreelancer(freelancer);
    setIsPanelOpen(true);
  };

  const closeSidePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => {
      setSelectedFreelancer(null);
    }, 300);
  };

  // ✅ Ouvrir le modal d'invitation
  const handleInviteFreelancer = (mission) => {
    if (!mission) {
      alert('Veuillez sélectionner une mission pour inviter ce freelancer.');
      return;
    }
    setSelectedMission(mission);
    setIsInviteModalOpen(true);
  };

  // ✅ Fermer le modal d'invitation
  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false);
    setSelectedMission(null);
  };

  // ✅ Callback après envoi d'invitation
  const handleInvitationSent = (result) => {
    console.log('Invitation sent:', result);
    // Optionnel: rafraîchir les données ou afficher une notification
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#518394] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des freelancers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={loadFreelancers}
            className="mt-4 px-4 py-2 bg-[#518394] text-white rounded hover:bg-[#4a7688] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* Liste principale */}
      <div className="flex flex-col h-full">
        {/* Tabs */}
        <div className="m-2">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`py-3 px-16 w-1/2 text-center ${
                  activeTab === tab.id 
                    ? 'text-[#518394] border-b-2 border-[#518394] font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Talent List */}
        <div className="flex-1 p-4 overflow-auto">
          {talents.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Aucun freelancer trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {talents.map(talent => (
                <div 
                  key={talent._id} 
                  className={`p-4 bg-white rounded-lg shadow dark:!bg-navy-800 border cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                    selectedFreelancer?._id === talent._id 
                      ? 'border-[#518394] bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-[#4242425a] hover:border-[#518394]'
                  }`}
                  onClick={() => handleFreelancerClick(talent)}
                >
                  <div className="flex">
                    {/* Avatar */}
                    <div className="mr-4">
                      <div className="relative">
                        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                          <User size={32} className="text-blue-500" />
                        </div>
                        <div className="absolute w-6 h-6 bg-green-500 border-2 border-white rounded-full -bottom-1 -right-1"></div>
                      </div>
                    </div>
                    
                    {/* Informations principales */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold dark:text-white">{talent.name}</h3>
                          <p className="text-lg dark:text-white">{talent.title}</p>
                        </div>
                        <ArrowRight className="text-[#518394] w-5 h-5" />
                      </div>
                      
                      {/* Statistiques */}
                      <div className="flex items-center mt-2 space-x-6 dark:text-white">
                        <div className="font-medium">{talent.rate}</div>
                        <div className="flex items-center">
                          <VscVerifiedFilled className="w-4 h-4 mr-1 rounded-full text-[#1dc2fb]"/>
                          <span>{talent.success}% Job Success</span>
                        </div>
                        <div>${talent.earned}K+ Earned</div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                          <span>{talent.rating}/5</span>
                        </div>
                      </div>
                      
                      {/* Bio (tronquée) */}
                      <p className="mt-3 text-gray-600 dark:text-gray-300 line-clamp-2">
                        {talent.bio.length > 150 ? `${talent.bio.substring(0, 150)}...` : talent.bio}
                      </p>
                      
                      {/* Compétences (limitées) */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {talent.skills.slice(0, 4).map((skill, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1 text-sm text-gray-800 border rounded-full dark:text-white dark:border-gray-600"
                          >
                            {skill}
                          </span>
                        ))}
                        {talent.skills.length > 4 && (
                          <span className="px-3 py-1 text-sm text-gray-500 border rounded-full dark:text-gray-400">
                            +{talent.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panneau latéral de détails */}
      <div className={`fixed top-0 right-0 h-full lg:w-1/2 sm:w-full md:w-full bg-white dark:bg-navy-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
        isPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {selectedFreelancer && (
          <div className="flex flex-col h-full">
            {/* Header du panneau */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-[#518394] text-white">
              <h2 className="text-lg font-semibold">Détails du Freelancer</h2>
              <button 
                onClick={closeSidePanel}
                className="p-2 transition-colors rounded-full hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenu du panneau */}
            <div className="flex-1 p-4 space-y-4 overflow-auto">
              {/* Profil principal */}
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="flex items-center justify-center w-full h-full bg-blue-100 rounded-full">
                    <User size={40} className="text-blue-500" />
                  </div>
                  <div className="absolute w-6 h-6 bg-green-500 border-2 border-white rounded-full -bottom-1 -right-1"></div>
                </div>
                <h3 className="mb-1 text-xl font-bold dark:text-white">{selectedFreelancer.name}</h3>
                <p className="mb-3 text-gray-600 dark:text-gray-300">{selectedFreelancer.title}</p>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 text-center rounded-lg bg-gray-50 dark:bg-gray-700">
                  <Star className="w-5 h-5 mx-auto mb-1 text-yellow-500 fill-current" />
                  <div className="font-bold dark:text-white">{selectedFreelancer.rating}/5</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Rating</div>
                </div>
                
                <div className="p-3 text-center rounded-lg bg-gray-50 dark:bg-gray-700">
                  <VscVerifiedFilled className="w-5 h-5 text-[#1dc2fb] mx-auto mb-1" />
                  <div className="font-bold dark:text-white">{selectedFreelancer.success}%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Success</div>
                </div>
                
                <div className="p-3 text-center rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="font-bold text-green-600 dark:text-green-400">${selectedFreelancer.earned}K+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Earned</div>
                </div>
                
                <div className="p-3 text-center rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="font-bold text-blue-600 dark:text-blue-400">{selectedFreelancer.history.length}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Jobs</div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-3">
                <h4 className="font-semibold dark:text-white">Contact</h4>
                
                <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <Mail className="w-4 h-4 text-[#518394] mr-3" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Email</div>
                    <div className="text-sm font-medium truncate dark:text-white">{selectedFreelancer.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <Phone className="w-4 h-4 text-[#518394] mr-3" />
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Téléphone</div>
                    <div className="text-sm font-medium dark:text-white">{selectedFreelancer.phone}</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <MapPin className="w-4 h-4 text-[#518394] mr-3" />
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Localisation</div>
                    <div className="text-sm font-medium dark:text-white">{selectedFreelancer.address}</div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h4 className="mb-2 font-semibold dark:text-white">À propos</h4>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {selectedFreelancer.bio}
                  </p>
                </div>
              </div>

              {/* Compétences */}
              <div>
                <h4 className="mb-2 font-semibold dark:text-white">
                  Compétences ({selectedFreelancer.skills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFreelancer.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-[#518394] text-white rounded text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* ✅ Section Missions Disponibles */}
              {missions.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold dark:text-white">
                    Inviter à une mission ({missions.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {missions.map((mission) => (
                      <div 
                        key={mission._id}
                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleInviteFreelancer(mission)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm dark:text-white line-clamp-1">
                              {mission.title}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Budget: {mission.budget} MAD
                            </p>
                          </div>
                          <Send size={16} className="text-[#518394]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activité */}
              <div>
                <h4 className="mb-2 font-semibold dark:text-white">Activité</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-sm dark:text-white">Candidatures actives</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {selectedFreelancer.applications.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-green-50 dark:bg-green-900/20">
                    <span className="text-sm dark:text-white">Missions terminées</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {selectedFreelancer.history.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-2">
                <button className="w-full py-2 bg-[#518394] text-white rounded font-medium hover:bg-[#4a7688] transition-colors">
                  Contacter
                </button>
                {missions.length > 0 && (
                  <button 
                    onClick={() => missions.length === 1 ? handleInviteFreelancer(missions[0]) : null}
                    className="w-full py-2 border border-[#518394] text-[#518394] rounded font-medium hover:bg-[#518394] hover:text-white transition-colors"
                  >
                    {missions.length === 1 ? 'Inviter à ma mission' : 'Choisir une mission'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Modal d'Invitation */}
      <InviteFreelancerModal
        isOpen={isInviteModalOpen}
        onClose={handleCloseInviteModal}
        freelancer={selectedFreelancer}
        mission={selectedMission}
        clientId={CLIENT_ID}
        onInvitationSent={handleInvitationSent}
      />
    </div>
  );
};

export default Home;