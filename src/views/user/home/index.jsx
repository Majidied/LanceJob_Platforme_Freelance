import React, { useState } from 'react';
import { User } from 'lucide-react';
import { VscVerifiedFilled } from "react-icons/vsc";
const Home = () => {
  const [activeTab, setActiveTab] = useState('bestMatches');
  
  const tabs = [
    { id: 'bestMatches', name: 'Best Matches' },
    { id: 'mostRecent', name: 'Most Recent' }
  ];
  
  const talents = [
    {
      id: 1,
      name: 'Mohammed Majidi',
      title: 'Web Developper | 3D Designer',
      rate: '$30.00/hr',
      success: '98%',
      earned: '$20K+',
      description: 'Passionate about building sleek, responsive websites and bringing ideas to life through 3D design. Skilled in front-end development and 3D modeling tools to create engaging digital experiences.',
      skills: ['Web Design', 'Visual Design', 'Blender', 'Web Design', 'Visual Design', 'Blender', 'Web Design', 'Visual Design']
    },
    {
      id: 2,
      name: 'Mohammed Majidi',
      title: 'Web Developper | 3D Designer',
      rate: '$30.00/hr',
      success: '98%',
      earned: '$20K+',
      description: 'Passionate about building sleek, responsive websites and bringing ideas to life through 3D design. Skilled in front-end development and 3D modeling tools to create engaging digital experiences.',
      skills: ['Web Design', 'Visual Design', 'Blender']
    },
    {
      id: 3,
      name: 'Sofia Rodriguez',
      title: 'UI/UX Designer | Brand Identity Specialist',
      rate: '$35.00/hr',
      success: '95%',
      earned: '$32K+',
      description: 'Expert in crafting intuitive user interfaces and comprehensive brand identity systems. Combining aesthetics with functionality to create memorable digital experiences.',
      skills: ['UI Design', 'UX Research', 'Figma', 'Adobe XD', 'Brand Strategy']
    },
    {
      id: 4,
      name: 'Marcus Chen',
      title: 'Full Stack Developer | AWS Specialist',
      rate: '$45.00/hr',
      success: '97%',
      earned: '$75K+',
      description: 'Versatile developer with expertise in both frontend and backend technologies. Specialized in building scalable applications with AWS infrastructure.',
      skills: ['React', 'Node.js', 'AWS', 'MongoDB', 'TypeScript']
    },
    {
      id: 5,
      name: 'Leila Ahmadi',
      title: 'Motion Designer | Video Editor',
      rate: '$28.00/hr',
      success: '92%',
      earned: '$18K+',
      description: 'Creative professional specializing in motion graphics and video editing. Transforming concepts into compelling visual stories that engage audiences.',
      skills: ['After Effects', 'Premiere Pro', 'Cinema 4D', 'Animation', 'Storyboarding']
    },
    {
      id: 6,
      name: 'Alex Thompson',
      title: 'Backend Developer | Python Specialist',
      rate: '$40.00/hr',
      success: '96%',
      earned: '$45K+',
      description: 'Results-driven backend developer with extensive experience in Python. Expert in creating robust APIs and optimizing database performance.',
      skills: ['Python', 'Django', 'Flask', 'PostgreSQL', 'API Development']
    },
    {
      id: 7,
      name: 'Priya Patel',
      title: 'Digital Marketer | SEO Expert',
      rate: '$25.00/hr',
      success: '94%',
      earned: '$28K+',
      description: 'Strategic digital marketer focused on driving organic growth through data-driven SEO strategies and comprehensive digital marketing campaigns.',
      skills: ['SEO', 'Content Strategy', 'Google Analytics', 'Social Media', 'Email Marketing']
    },
    {
      id: 8,
      name: 'Jamal Williams',
      title: 'Game Developer | Unity Specialist',
      rate: '$38.00/hr',
      success: '91%',
      earned: '$42K+',
      description: 'Passionate game developer creating immersive gaming experiences with Unity. Skilled in game mechanics, physics, and interactive storytelling.',
      skills: ['Unity', 'C#', 'Game Design', '3D Modeling', 'Animation']
    },
    {
      id: 9,
      name: 'Nadia Kowalski',
      title: 'Data Scientist | Machine Learning Engineer',
      rate: '$50.00/hr',
      success: '99%',
      earned: '$85K+',
      description: 'Expert in transforming complex data into actionable insights. Specializing in predictive modeling and developing machine learning solutions for business challenges.',
      skills: ['Python', 'Machine Learning', 'Data Analysis', 'TensorFlow', 'SQL']
    },
    {
      id: 10,
      name: 'Carlos Mendez',
      title: 'DevOps Engineer | Cloud Architect',
      rate: '$48.00/hr',
      success: '98%',
      earned: '$62K+',
      description: 'Experienced in streamlining development processes and implementing robust CI/CD pipelines. Expert in cloud infrastructure and containerization.',
      skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform']
    }
  ];

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
                      <span>{talent.success} Job Success</span>
                    </div>
                    <div>{talent.earned} Earned</div>
                  </div>
                  
                  <p className="mt-3 text-gray-600">{talent.description}</p>
                  
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