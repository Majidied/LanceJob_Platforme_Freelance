const mongoose = require('mongoose');
const seedDatabase = require('./seedDatabase');

async function run() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lancejob_db');
        console.log('🔌 Connected to MongoDB');
        
        // Run the seeding
        const result = await seedDatabase();
        
        if (result.success) {
            console.log('✅ Seeding completed successfully');
        } else {
            console.error('❌ Seeding failed:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
        process.exit(0);
    }
}

run();