const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const Mission = require('../src/models/mission.model');
const Interaction = require('../src/models/interaction.model');

/**
 * Database migration script for the recommendation system
 * Sets up indexes and initial data for optimal performance
 */

async function createIndexes() {
  console.log('Creating database indexes...');

  try {
    // User model indexes
    await User.collection.createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { skills: 1 } },
      { key: { profile_completion: 1 } },
      { key: { createdAt: 1 } },
      { key: { 'profile.skills': 1 } },
      { key: { 'profile.categories': 1 } }
    ]);
    console.log('✅ User indexes created');

    // Mission model indexes
    await Mission.collection.createIndexes([
      { key: { title: 'text', description: 'text' } },
      { key: { tags: 1 } },
      { key: { client: 1 } },
      { key: { status: 1 } },
      { key: { budget: 1 } },
      { key: { deadline: 1 } },
      { key: { experience: 1 } },
      { key: { type: 1 } },
      { key: { createdAt: 1 } },
      { key: { status: 1, createdAt: -1 } },
      { key: { tags: 1, status: 1 } },
      { key: { budget: 1, deadline: 1 } }
    ]);
    console.log('✅ Mission indexes created');

    // Interaction model indexes
    await Interaction.collection.createIndexes([
      { key: { user_id: 1 } },
      { key: { mission_id: 1 } },
      { key: { interaction_type: 1 } },
      { key: { timestamp: 1 } },
      { key: { user_id: 1, timestamp: -1 } },
      { key: { mission_id: 1, timestamp: -1 } },
      { key: { user_id: 1, interaction_type: 1 } },
      { key: { timestamp: 1 }, expireAfterSeconds: 7776000 }, // TTL: 90 days
      { key: { user_id: 1, mission_id: 1, interaction_type: 1 } }
    ]);
    console.log('✅ Interaction indexes created');

    console.log('✅ All indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

async function createSampleData() {
  console.log('Creating sample data...');

  try {
    // Check if sample data already exists
    const existingUsers = await User.countDocuments();
    const existingMissions = await Mission.countDocuments();

    if (existingUsers > 0 && existingMissions > 0) {
      console.log('Sample data already exists, skipping...');
      return;
    }

    // Sample skills for the recommendation system
    const skills = [
      'JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'PostgreSQL',
      'PHP', 'Laravel', 'Vue.js', 'Angular', 'Express.js', 'Django',
      'Flask', 'Docker', 'AWS', 'Azure', 'Google Cloud', 'Kubernetes',
      'GraphQL', 'REST API', 'Machine Learning', 'Data Science', 'AI',
      'Web Design', 'UI/UX', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator',
      'WordPress', 'Shopify', 'E-commerce', 'SEO', 'Digital Marketing',
      'Content Writing', 'Copywriting', 'Translation', 'Video Editing',
      'Motion Graphics', 'Animation', 'Game Development', 'Unity', 'Unreal Engine',
      'iOS Development', 'Android Development', 'Flutter', 'React Native',
      'Blockchain', 'Solidity', 'Web3', 'Smart Contracts', 'Cybersecurity'
    ];

    const categories = [
      'web-development', 'mobile-development', 'design', 'data-science',
      'marketing', 'writing', 'video-editing', 'game-development',
      'blockchain', 'cybersecurity', 'ai-ml', 'devops'
    ];

    // Create sample freelancers
    const freelancers = [];
    for (let i = 1; i <= 20; i++) {
      const userSkills = skills.slice(0, Math.floor(Math.random() * 8) + 3);
      const userCategories = categories.slice(0, Math.floor(Math.random() * 3) + 1);
      
      const freelancer = new User({
        name: `Freelancer ${i}`,
        email: `freelancer${i}@example.com`,
        password: 'hashedpassword', // In real app, this would be properly hashed
        role: 'freelancer',
        profile: {
          skills: userSkills,
          categories: userCategories,
          experience_level: ['debutant', 'intermediaire', 'expert'][Math.floor(Math.random() * 3)],
          hourly_rate: Math.floor(Math.random() * 100) + 20,
          bio: `Experienced freelancer specializing in ${userSkills.slice(0, 3).join(', ')}`
        },
        skills: userSkills, // For backward compatibility
        isEmailVerified: true
      });
      
      freelancers.push(freelancer);
    }

    // Create sample clients
    const clients = [];
    for (let i = 1; i <= 10; i++) {
      const client = new User({
        name: `Client ${i}`,
        email: `client${i}@example.com`,
        password: 'hashedpassword',
        role: 'client',
        profile: {
          company_name: `Company ${i}`,
          company_size: ['startup', 'small', 'medium', 'large'][Math.floor(Math.random() * 4)]
        },
        isEmailVerified: true
      });
      
      clients.push(client);
    }

    // Save users
    await User.insertMany([...freelancers, ...clients]);
    console.log('✅ Sample users created');

    // Create sample missions
    const missions = [];
    const missionTitles = [
      'Build a React E-commerce Website',
      'Python Data Analysis Project',
      'Mobile App UI/UX Design',
      'WordPress Website Development',
      'Machine Learning Model Development',
      'Brand Logo Design',
      'Node.js REST API Development',
      'Video Editing for Marketing Campaign',
      'SEO Optimization for Website',
      'Flutter Mobile Application',
      'Blockchain Smart Contract Development',
      'Content Writing for Blog',
      'Social Media Marketing Campaign',
      'Game Development with Unity',
      'Cybersecurity Audit',
      'AI Chatbot Development',
      'Database Design and Optimization',
      'DevOps CI/CD Pipeline Setup',
      'Web Scraping Tool Development',
      'Translation Services (EN to FR)'
    ];

    const missionDescriptions = [
      'Looking for an experienced developer to build a modern e-commerce platform with React and Node.js.',
      'Need a data scientist to analyze customer behavior patterns using Python and machine learning.',
      'Seeking a talented UI/UX designer to create mobile app designs for iOS and Android.',
      'WordPress expert needed to develop a corporate website with custom themes and plugins.',
      'Machine learning engineer required to develop predictive models for business analytics.',
      'Creative designer needed to create a modern and memorable brand logo.',
      'Backend developer required to build scalable REST APIs using Node.js and Express.',
      'Video editor needed to create engaging marketing videos for social media campaigns.',
      'SEO specialist required to optimize website ranking and improve organic traffic.',
      'Mobile developer needed to create cross-platform app using Flutter framework.',
      'Blockchain developer required to create and deploy smart contracts on Ethereum.',
      'Content writer needed to create engaging blog posts and articles for tech website.',
      'Digital marketer required to manage social media campaigns and increase engagement.',
      'Game developer needed to create 2D platformer game using Unity engine.',
      'Cybersecurity expert required to conduct comprehensive security audit.',
      'AI developer needed to build intelligent chatbot for customer service.',
      'Database architect required to design and optimize database schema.',
      'DevOps engineer needed to set up automated deployment and monitoring systems.',
      'Python developer required to build web scraping tools for data collection.',
      'Professional translator needed for technical documentation translation.'
    ];

    for (let i = 0; i < 50; i++) {
      const titleIndex = i % missionTitles.length;
      const clientIndex = Math.floor(Math.random() * clients.length);
      const missionSkills = skills.slice(0, Math.floor(Math.random() * 5) + 2);
      
      const mission = new Mission({
        title: missionTitles[titleIndex],
        description: missionDescriptions[titleIndex],
        budget: Math.floor(Math.random() * 5000) + 500,
        deadline: new Date(Date.now() + Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
        tags: missionSkills,
        client: clients[clientIndex]._id,
        status: 'published',
        type: ['fixe', 'Taux horaire', 'long terme'][Math.floor(Math.random() * 3)],
        experience: ['debutant', 'intermediaire', 'expert'][Math.floor(Math.random() * 3)],
        applications: []
      });
      
      missions.push(mission);
    }

    await Mission.insertMany(missions);
    console.log('✅ Sample missions created');

    // Create sample interactions
    const interactions = [];
    for (let i = 0; i < 200; i++) {
      const freelancer = freelancers[Math.floor(Math.random() * freelancers.length)];
      const mission = missions[Math.floor(Math.random() * missions.length)];
      const interactionTypes = ['view', 'click', 'save', 'apply'];
      const interactionType = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
      
      const interaction = new Interaction({
        user_id: freelancer._id,
        mission_id: mission._id,
        interaction_type: interactionType,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        metadata: {
          duration: Math.floor(Math.random() * 300) + 10,
          user_agent: 'Mozilla/5.0 (compatible; LanceJob/1.0)',
          source: 'recommendation'
        }
      });
      
      interactions.push(interaction);
    }

    await Interaction.insertMany(interactions);
    console.log('✅ Sample interactions created');

    console.log('✅ All sample data created successfully');
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
}

async function runMigration() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lancejob';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Run migrations
    await createIndexes();
    await createSampleData();

    console.log('🎉 Migration completed successfully!');
    
    // Display statistics
    const userCount = await User.countDocuments();
    const missionCount = await Mission.countDocuments();
    const interactionCount = await Interaction.countDocuments();
    
    console.log('\n📊 Database Statistics:');
    console.log(`Users: ${userCount}`);
    console.log(`Missions: ${missionCount}`);
    console.log(`Interactions: ${interactionCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  createIndexes,
  createSampleData,
  runMigration
};
