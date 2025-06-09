const User = require('../src/models/user.model');
const Client = require('../src/models/client.model');
const Freelancer = require('../src/models/freelancer.model');
const Mission = require('../src/models/mission.model');
const Interaction = require('../src/models/interaction.model');
const testData = require('../tests/testData');

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Clear existing data
        await User.deleteMany({});
        await Client.deleteMany({});
        await Freelancer.deleteMany({});
        await Mission.deleteMany({});
        await Interaction.deleteMany({});
        console.log('🧹 Existing data cleared');
        
        // Insert test data
        const insertedUsers = await User.insertMany(testData.users);
        console.log(`✅ Users seeded successfully: ${insertedUsers.length} records`);
        
        // Only insert clients if data exists and is valid
        let insertedClients = [];
        if (testData.clients && testData.clients.length > 0) {
            insertedClients = await Client.insertMany(testData.clients);
            console.log(`✅ Clients seeded successfully: ${insertedClients.length} records`);
        } else {
            console.log(`⚠️ No valid client data found, skipping clients`);
        }
        
        const insertedFreelancers = await Freelancer.insertMany(testData.freelancers);
        console.log(`✅ Freelancers seeded successfully: ${insertedFreelancers.length} records`);
        
        const insertedMissions = await Mission.insertMany(testData.missions);
        console.log(`✅ Missions seeded successfully: ${insertedMissions.length} records`);
        
        const insertedInteractions = await Interaction.insertMany(testData.interactions);
        console.log(`✅ Interactions seeded successfully: ${insertedInteractions.length} records`);
        
        console.log('🎉 Database seeding completed successfully!');
        
        // Print summary
        const userCount = await User.countDocuments();
        const clientCount = await Client.countDocuments();
        const freelancerCount = await Freelancer.countDocuments();
        const missionCount = await Mission.countDocuments();
        const interactionCount = await Interaction.countDocuments();
        
        console.log('\n📊 Seeding Summary:');
        console.log(`Users: ${userCount}`);
        console.log(`Clients: ${clientCount}`);
        console.log(`Freelancers: ${freelancerCount}`);
        console.log(`Missions: ${missionCount}`);
        console.log(`Interactions: ${interactionCount}`);
        
        return { success: true, counts: { userCount, clientCount, freelancerCount, missionCount, interactionCount } };
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        return { success: false, error: error.message };
    }
}

module.exports = seedDatabase;