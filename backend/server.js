const app = require('./src/app');
const config = require('./src/config');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
const { connectElasticSearch } = require('./src/config/elasticsearch');
const { initializeElasticSearch } = require('./src/config/elasticsearch');
//const freelancerService = require('./src/services/freelancer.service');

const PORT = config.port;

(async () => {
  await connectDB();
  await connectRedis();
  await connectElasticSearch();
  await initializeElasticSearch(); 
  //await freelancerService.checkAndFixIndexMapping(); // Call the function from the module
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();