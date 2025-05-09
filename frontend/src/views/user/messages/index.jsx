import React, { useState } from 'react';
import { Search, MoreVertical, Paperclip, Smile, Send, ChevronLeft, Phone, Video, User, Star, Clock, Check, Image, File, ArrowUp, ArrowDown } from 'lucide-react';

const Message = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState(false);
  
  // Dummy data for conversations
  const conversations = [
    {
      id: 1,
      user: {
        name: 'Ahmed Benali',
        avatar: '/api/placeholder/40/40',
        status: 'online',
        lastSeen: 'Now'
      },
      project: 'Site web e-commerce',
      unread: 3,
      lastMessage: {
        text: "J'ai terminé la maquette du site, pouvez-vous la vérifier?",
        time: '14:32',
        isFromUser: false
      },
      messages: [
        {
          id: 101,
          text: "Bonjour, je suis intéressé par votre projet de site e-commerce.",
          time: '09:15',
          date: 'Hier',
          isFromUser: true
        },
        {
          id: 102,
          text: "Bonjour! Merci pour votre intérêt. Avez-vous de l'expérience avec WooCommerce?",
          time: '09:20',
          date: 'Hier',
          isFromUser: false
        },
        {
          id: 103,
          text: "Oui, j'ai développé plusieurs sites avec WooCommerce. Voici quelques exemples de mon travail.",
          time: '09:25',
          date: 'Hier',
          isFromUser: true,
          attachments: [
            { type: 'image', name: 'portfolio-ecommerce.jpg' }
          ]
        },
        {
          id: 104,
          text: "C'est impressionnant! J'aimerais discuter des fonctionnalités spécifiques dont j'ai besoin.",
          time: '10:05',
          date: 'Hier',
          isFromUser: false
        },
        {
          id: 105,
          text: "Bien sûr, je suis disponible pour en discuter. Quelles sont vos priorités pour ce projet?",
          time: '10:10',
          date: 'Hier',
          isFromUser: true
        },
        {
          id: 106,
          text: "Je cherche principalement un système de panier personnalisé et une intégration avec mon système de stocks existant.",
          time: '11:30',
          date: 'Hier',
          isFromUser: false
        },
        {
          id: 107,
          text: "Je comprends. Je vais travailler sur une proposition et une maquette initiale.",
          time: '12:45',
          date: 'Hier',
          isFromUser: true
        },
        {
          id: 108,
          text: "Parfait, j'attends votre proposition.",
          time: '13:00',
          date: 'Hier',
          isFromUser: false
        },
        {
          id: 109,
          text: "J'ai terminé la maquette du site, pouvez-vous la vérifier?",
          time: '14:32',
          date: "Aujourd'hui",
          isFromUser: false,
          attachments: [
            { type: 'image', name: 'maquette-homepage.jpg' },
            { type: 'file', name: 'specifications.pdf' }
          ]
        }
      ]
    },
    {
      id: 2,
      user: {
        name: 'Sofia Martinez',
        avatar: '/api/placeholder/40/40',
        status: 'offline',
        lastSeen: '3h ago'
      },
      project: 'Application mobile',
      unread: 0,
      lastMessage: {
        text: "Merci pour les wireframes! Je vais les examiner et vous donner un retour demain.",
        time: '11:45',
        isFromUser: true
      },
      messages: []
    },
    {
      id: 3,
      user: {
        name: 'Mohammed El Amrani',
        avatar: '/api/placeholder/40/40',
        status: 'online',
        lastSeen: 'Now'
      },
      project: 'Logo design',
      unread: 1,
      lastMessage: {
        text: "J'ai envoyé les modifications que vous avez demandées pour le logo. Qu'en pensez-vous?",
        time: '10:23',
        isFromUser: false
      },
      messages: []
    },
    {
      id: 4,
      user: {
        name: 'Yasmine Kadiri',
        avatar: '/api/placeholder/40/40',
        status: 'offline',
        lastSeen: '1 day ago'
      },
      project: 'Traduction de contenu',
      unread: 0,
      lastMessage: {
        text: "Le document est prêt. Je vous enverrai la facture demain.",
        time: 'Lun',
        isFromUser: false
      },
      messages: []
    }
  ];
  
  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => 
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.project.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle sending a new message
  const handleSendMessage = () => {
    if (messageInput.trim() === '') return;
    
    // In a real app, you would add this message to the conversation and send it to the server
    console.log("Message sent:", messageInput);
    setMessageInput('');
  };
  
  // Handle keypress in message input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Toggle mobile view
  const toggleMobileView = () => {
    setMobileView(!mobileView);
  };
  
  // Select a conversation
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    if (window.innerWidth < 1280) {
      setMobileView(true);
    }
  };
  
  return (
    <div className="grid h-full grid-cols-1 gap-5 mt-3 xl:grid-cols-2 2xl:grid-cols-3">
      {/* Conversation List - Hidden on mobile when viewing a conversation */}
      <div className={`${mobileView ? 'hidden' : 'block'} xl:col-span-1 bg-white border-r border-gray-200 h-full overflow-hidden rounded-lg shadow-sm`}>
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              className="w-full py-2 pl-10 pr-4 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
              placeholder="Rechercher des messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
        
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          {filteredConversations.map(conversation => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''}`}
              onClick={() => handleSelectConversation(conversation)}
            >
              <div className="flex items-start">
                <div className="relative">
                  <img
                    src={conversation.user.avatar}
                    alt={conversation.user.name}
                    className="object-cover w-12 h-12 rounded-full"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${conversation.user.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                
                <div className="flex-grow ml-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-800">{conversation.user.name}</h3>
                    <span className="text-xs text-gray-500">{conversation.lastMessage.time}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-1">{conversation.project}</p>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500 line-clamp-1">{conversation.lastMessage.text}</p>
                    {conversation.unread > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-500 rounded-full">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat Area - Shown when a conversation is selected */}
      {selectedConversation ? (
        <div className={`${mobileView ? 'block' : 'hidden'} xl:block xl:col-span-1 flex flex-col h-full rounded-lg shadow-sm`}>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <div className="flex items-center">
              {mobileView && (
                <button
                  className="mr-3 text-gray-500 hover:text-gray-700"
                  onClick={toggleMobileView}
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              
              <img
                src={selectedConversation.user.avatar}
                alt={selectedConversation.user.name}
                className="object-cover w-10 h-10 rounded-full"
              />
              
              <div className="ml-3">
                <h3 className="font-semibold text-gray-800">{selectedConversation.user.name}</h3>
                <p className="flex items-center text-xs text-gray-500">
                  {selectedConversation.user.status === 'online' 
                    ? <><span className="inline-block w-2 h-2 mr-1 bg-green-500 rounded-full"></span> En ligne</>
                    : `Dernière connexion: ${selectedConversation.user.lastSeen}`
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-100">
                <Phone size={20} />
              </button>
              <button className="p-2 text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-100">
                <Video size={20} />
              </button>
              <button className="p-2 text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-100">
                <Star size={20} />
              </button>
              <button className="p-2 text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-100">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
            {selectedConversation.messages.map((message, index) => {
              // Check if we need to show date divider
              const showDate = index === 0 || selectedConversation.messages[index - 1].date !== message.date;
              
              return (
                <React.Fragment key={message.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <div className="px-4 py-1 bg-gray-200 rounded-full">
                        <span className="text-xs text-gray-600">{message.date}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex mb-4 ${message.isFromUser ? 'justify-end' : 'justify-start'}`}>
                    {!message.isFromUser && (
                      <img
                        src={selectedConversation.user.avatar}
                        alt={selectedConversation.user.name}
                        className="object-cover w-8 h-8 mt-1 mr-2 rounded-full"
                      />
                    )}
                    
                    <div>
                      <div className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
                        message.isFromUser 
                          ? 'bg-blue-500 text-white rounded-br-none' 
                          : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                      </div>
                      
                      {message.attachments && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment, i) => (
                            <div 
                              key={i} 
                              className={`flex items-center p-2 rounded-lg ${
                                message.isFromUser ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 shadow-sm'
                              }`}
                            >
                              {attachment.type === 'image' ? (
                                <Image size={18} className="mr-2" />
                              ) : (
                                <File size={18} className="mr-2" />
                              )}
                              <span className="text-sm truncate">{attachment.name}</span>
                              <button className={`ml-2 ${message.isFromUser ? 'text-blue-200' : 'text-blue-500'}`}>
                                <ArrowDown size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className={`flex items-center mt-1 ${message.isFromUser ? 'justify-end' : 'justify-start'}`}>
                        <Clock size={12} className="mr-1 text-gray-400" />
                        <span className="text-xs text-gray-400">{message.time}</span>
                        {message.isFromUser && (
                          <div className="ml-1 text-blue-500">
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          
          {/* Message Input */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-end">
              <button className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
                <Paperclip size={20} />
              </button>
              
              <div className="flex-grow mx-2">
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Écrivez votre message..."
                  rows="2"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              
              <div className="flex">
                <button className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
                  <Smile size={20} />
                </button>
                
                <button
                  className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none"
                  onClick={handleSendMessage}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="items-center justify-center hidden rounded-lg shadow-sm xl:flex xl:col-span-1 bg-gray-50">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
              <User size={32} className="text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-medium text-gray-700">Sélectionnez une conversation</h3>
            <p className="text-gray-500">Choisissez une conversation dans la liste pour commencer à chatter</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;