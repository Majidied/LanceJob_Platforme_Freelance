const { Client } = require('@elastic/elasticsearch');
const config = require('./index');

const elasticSearchUrl = config.elasticSearchUrl || 'http://localhost:9200';

const elasticClient = new Client({
  node: 'http://localhost:9200',
});

/**
 * Asynchronously checks if the Elasticsearch client is connected.
 * Logs a message to the console upon successful connection.
 * If the connection fails, logs the error.
 *
 * @async
 * @function connectElasticSearch
 * @returns {Promise<void>} Resolves when the connection is established or already open.
 */
const connectElasticSearch = async () => {
  try {
    const health = await elasticClient.cluster.health();
    console.log('Elasticsearch connected', health);
  } catch (error) {
    console.error('Elasticsearch connection error:', error);
  }
};

module.exports = { elasticClient, connectElasticSearch, elasticSearchUrl };
