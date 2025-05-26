const Freelancer = require('../models/freelancer.model');
const { Client } = require('@elastic/elasticsearch');
const esClient = new Client({ node: 'http://localhost:9200' });

// Test Elasticsearch connection
const testESConnection = async () => {
  try {
    const health = await esClient.cluster.health();
    console.log('Elasticsearch connection successful:', health);
    return true;
  } catch (error) {
    console.error('Elasticsearch connection failed:', error.message);
    return false;
  }
};

exports.getAllFreelancers = async () => {
  return await Freelancer.find({});
}       

exports.getFreelancerById = async (id) => {
  return await Freelancer.findById(id);
}

exports.createFreelancer = async (freelancerData) => {
  console.log('Creating freelancer with data:', freelancerData);
  
  const freelancer = new Freelancer(freelancerData);
  const savedFreelancer = await freelancer.save();
  
  console.log('Freelancer saved to MongoDB:', savedFreelancer._id);

  // Test ES connection before indexing
  const isESConnected = await testESConnection();
  if (!isESConnected) {
    console.error('Skipping Elasticsearch indexing - connection failed');
    return savedFreelancer;
  }

  // Index the freelancer in Elasticsearch after saving
  try {
    console.log('Attempting to index freelancer in Elasticsearch...');
    const indexResult = await exports.indexFreelancer(savedFreelancer);
    console.log('Elasticsearch indexing successful:', indexResult);
  } catch (error) {
    console.error('Elasticsearch indexing error (createFreelancer):', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
  }

  return savedFreelancer;
};

exports.updateFreelancer = async (id, freelancerData) => {
  const updatedFreelancer = await Freelancer.findByIdAndUpdate(id, freelancerData, { new: true });

  if (updatedFreelancer) {
    try {
      console.log('Updating freelancer index in Elasticsearch...');
      await exports.updateFreelancerIndex(updatedFreelancer);
      console.log('Elasticsearch update successful');
    } catch (error) {
      console.error('Elasticsearch update error (updateFreelancer):', error);
    }
  }

  return updatedFreelancer;
};

exports.deleteFreelancer = async (id) => {
  const deletedFreelancer = await Freelancer.findByIdAndDelete(id);

  if (deletedFreelancer) {
    try {
      console.log('Deleting freelancer from Elasticsearch index...');
      await exports.deleteFreelancerIndex(id);
      console.log('Elasticsearch delete successful');
    } catch (error) {
      console.error('Elasticsearch delete error (deleteFreelancer):', error);
    }
  }

  return deletedFreelancer;
};

exports.searchFreelancers = async (searchText) => {
  console.log('Searching for:', searchText);
  
  // First, check if index exists and has documents
  try {
    const indexExists = await esClient.indices.exists({ index: 'freelancers' });
    console.log('Index exists:', indexExists);
    
    if (indexExists) {
      const count = await esClient.count({ index: 'freelancers' });
      console.log('Total documents in index:', count.count);
      
      // Get a sample document to verify structure
      const sampleDocs = await esClient.search({
        index: 'freelancers',
        size: 1
      });
      console.log('Sample document:', JSON.stringify(sampleDocs.hits.hits[0], null, 2));
    }
  } catch (error) {
    console.error('Error checking index status:', error);
  }

  const should = [];

  if (searchText) {
    should.push(
      { match: { bio: { query: searchText.toLowerCase(), boost: 5 } } },
      { match: { skills: { query: searchText.toLowerCase(), boost: 3 } } }
    );
  }

  const esQuery = {
    index: 'freelancers',
    from: 0,
    size: 10,
    query: {
      bool: {
        should: should,
        minimum_should_match: 1
      }
    },
    sort: [{ _score: 'desc' }]
  };

  try {
    console.log('Elasticsearch Query:', JSON.stringify(esQuery, null, 2));
    const result = await esClient.search(esQuery);
    
    console.log('Elasticsearch Response hits count:', result.hits.total.value);
    console.log('First few results:', JSON.stringify(result.hits.hits.slice(0, 2), null, 2));
    
    if (!result.hits.hits.length) {
      console.warn('No freelancers found for search:', searchText);
      return [];
    }
    return result.hits.hits.map(hit => hit._source);
  } catch (error) {
    console.error('Elasticsearch search error:', error);
    throw new Error('Failed to search freelancers');
  }
};

exports.checkAndFixIndexMapping = async () => {
  try {
    const indexExists = await esClient.indices.exists({ index: 'freelancers' });
    
    if (!indexExists) {
      console.log('Creating freelancers index with proper mapping...');
      const response = await esClient.indices.create({
        index: 'freelancers',
        body: {
          mappings: {
            properties: {
              _id: { type: 'keyword' },
              phone: { 
                type: 'text',
                fields: { keyword: { type: 'keyword' } }
              },
              bio: {
                type: 'text',
                analyzer: 'standard',
                fields: { keyword: { type: 'keyword' } }
              },
              skills: {
                type: 'text',
                analyzer: 'standard',
                fields: { keyword: { type: 'keyword' } }
              },
              address: {
                type: 'text',
                fields: { keyword: { type: 'keyword' } }
              },
              history: { type: 'text' },
              experience: { type: 'text' }
            }
          }
        }
      });
      console.log('Index creation response:', response);
    } else {
      const mapping = await esClient.indices.getMapping({ index: 'freelancers' });
      console.log('Current mapping:', JSON.stringify(mapping, null, 2));
    }
  } catch (error) {
    console.error('Error checking/creating index:', error);
  }
};

exports.indexFreelancer = async (freelancer) => {
  console.log('Indexing freelancer:', freelancer._id);
  console.log('Freelancer data to index:', {
    phone: freelancer.phone,
    bio: freelancer.bio,
    skills: freelancer.skills,
    address: freelancer.address,
    history: freelancer.history,
    experience: freelancer.experience
  });

  try {
    const result = await esClient.index({
      index: 'freelancers',
      id: freelancer._id.toString(), // ID goes here as parameter
      body: {
        // Remove _id from body - it's automatically handled by Elasticsearch
        phone: freelancer.phone,
        bio: freelancer.bio,
        skills: freelancer.skills,
        address: freelancer.address,
        history: freelancer.history,
        experience: freelancer.experience
      }
    });
    
    console.log('Index operation result:', result);
    
    // Force refresh to make document immediately searchable
    await esClient.indices.refresh({ index: 'freelancers' });
    console.log('Index refreshed');
    
    return result;
  } catch (error) {
    console.error('Error during indexing:', error);
    throw error;
  }
};

exports.updateFreelancerIndex = async (freelancer) => {
  try {
    const result = await esClient.update({
      index: 'freelancers',
      id: freelancer._id.toString(),
      body: {
        doc: {
          phone: freelancer.phone,
          bio: freelancer.bio,
          skills: freelancer.skills,
          address: freelancer.address,
          history: freelancer.history,
          experience: freelancer.experience
        }
      }
    });
    
    await esClient.indices.refresh({ index: 'freelancers' });
    return result;
  } catch (error) {
    console.error('Error during update:', error);
    throw error;
  }
};

exports.deleteFreelancerIndex = async (id) => {
  try {
    const result = await esClient.delete({
      index: 'freelancers',
      id: id.toString()
    });
    
    await esClient.indices.refresh({ index: 'freelancers' });
    return result;
  } catch (error) {
    console.error('Error during delete:', error);
    throw error;
  }
};

// Add utility function to manually reindex all freelancers
exports.reindexAllFreelancers = async () => {
  console.log('Starting reindex of all freelancers...');
  
  try {
    // Get all freelancers from MongoDB
    const freelancers = await Freelancer.find({});
    console.log(`Found ${freelancers.length} freelancers in MongoDB`);
    
    // Clear existing index
    try {
      await esClient.indices.delete({ index: 'freelancers' });
      console.log('Deleted existing index');
    } catch (error) {
      console.log('Index did not exist or could not be deleted');
    }
    
    // Recreate index with proper mapping
    await exports.checkAndFixIndexMapping();
    
    // Index each freelancer
    for (const freelancer of freelancers) {
      await exports.indexFreelancer(freelancer);
      console.log(`Indexed freelancer: ${freelancer._id}`);
    }
    
    console.log('Reindexing completed successfully');
    return { success: true, count: freelancers.length };
  } catch (error) {
    console.error('Error during reindexing:', error);
    return { success: false, error: error.message };
  }
};