const { Client } = require('@elastic/elasticsearch');
const config = require('./index');

const Freelancer = require('../models/freelancer.model');
const Mission = require('../models/mission.model');

const elasticSearchUrl = config.elasticSearchUrl || 'http://localhost:9200';

const elasticClient = new Client({
  node: elasticSearchUrl,
});

/**
 * Connect to Elasticsearch and log health status
 */
const connectElasticSearch = async () => {
  try {
    const health = await elasticClient.cluster.health();
    console.log('Elasticsearch connected', health);
  } catch (error) {
    console.error('Elasticsearch connection error:', error);
  }
};

// Mappings
const mappings = {
  freelancers: {
    mappings: {
      properties: {
        address: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
        bio: { type: 'text', fields: { keyword: { type: 'keyword' } } },
        experience: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
        name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
        phone: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
        skills: { type: 'text', fields: { keyword: { type: 'keyword' } } },
        title: { type: 'text', fields: { keyword: { type: 'keyword' } } },
      },
    },
  },
  missions: {
    mappings: {
      properties: {
        budget: { type: 'long' },
        client: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
        deadline: { type: 'date' },
        description: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
        experience: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
        status: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
        tags: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
        title: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
        type: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      },
    },
  },
};

// Create index if not exists
const createIndex = async (name, mapping) => {
  const exists = await elasticClient.indices.exists({ index: name });
  if (!exists) {
    await elasticClient.indices.create({ index: name, ...mapping });
    console.log(` Index "${name}" created`);
  } else {
    console.log(`Index "${name}" already exists`);
  }
};

// Check if document exists in Elasticsearch
const documentExists = async (indexName, id) => {
  try {
    const result = await elasticClient.exists({ index: indexName, id });
    return result;
  } catch (err) {
    console.error(`Erreur lors de la vérification de l'existence du document ${id} dans ${indexName}:`, err);
    return false;
  }
};

// Sync MongoDB to Elasticsearch (only if doc doesn't exist)
const syncCollection = async (model, indexName) => {
  const docs = await model.find({});

  const bulkOps = docs.flatMap(doc => {
    const data = doc.toObject();
    delete data._id;

    return [
      { index: { _index: indexName, _id: doc._id.toString() } },
      data
    ];
  });

  if (bulkOps.length > 0) {
    const response = await elasticClient.bulk({ refresh: true, body: bulkOps });
    const failed = response.errors ? response.items.filter(item => item.index && item.index.error) : [];
    if (failed.length) {
      console.warn(`⚠️ ${failed.length} documents failed to sync.`);
    }
    console.log(`🔄 Synced ${docs.length - failed.length} documents to "${indexName}"`);
  }
};

// Init all
const initializeElasticSearch = async () => {
  try {
    await connectElasticSearch();
    await createIndex('freelancers', mappings.freelancers);
    await createIndex('missions', mappings.missions);
    await syncCollection(Freelancer, 'freelancers');
    await syncCollection(Mission, 'missions');
  } catch (err) {
    console.error('Initialization error:', err);
  }
};

module.exports = {
  elasticClient,
  connectElasticSearch,
  initializeElasticSearch,
  elasticSearchUrl,
};
