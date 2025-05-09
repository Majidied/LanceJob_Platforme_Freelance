const app = require('./src/app');
const config = require('./src/config');
const connectDB = require('./src/config/db');
//const { connectRedis } = require('./src/config/redis');

const PORT = config.port;

(async () => {
  await connectDB();
  //await connectRedis();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
