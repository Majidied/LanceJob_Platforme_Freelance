const Mission = require('../models/mission.model');
const { Client } = require('@elastic/elasticsearch');
const esClient = new Client({ node: 'http://localhost:9200' });

exports.getAllMissions = async () => {
  return await Mission.find({});
};

exports.getMissionById = async (id) => {
  return await Mission.findById(id);
};

exports.createMission = async (missionData) => {
  const mission = new Mission(missionData);
  const savedMission = await mission.save();

  // Index the mission in Elasticsearch after saving (so _id is available)
  try {
    await exports.indexMission(savedMission);
  } catch (error) {
    console.error('Elasticsearch indexing error (createMission):', error);
  }

  return savedMission;
};

exports.updateMission = async (id, missionData) => {
  const updatedMission = await Mission.findByIdAndUpdate(id, missionData, { new: true });

  // Update mission index in Elasticsearch
  if (updatedMission) {
    try {
      await exports.updateMissionIndex(updatedMission);
    } catch (error) {
      console.error('Elasticsearch update error (updateMission):', error);
    }
  }

  return updatedMission;
};

exports.deleteMission = async (id) => {
  const deletedMission = await Mission.findByIdAndDelete(id);

  // Delete mission index from Elasticsearch
  if (deletedMission) {
    try {
      await exports.deleteMissionIndex(id);
    } catch (error) {
      console.error('Elasticsearch delete error (deleteMission):', error);
    }
  }

  return deletedMission;
};

exports.searchMissions = async (searchText) => {
  // Build the should array for OR logic instead of must for AND logic
  const should = [];

  if (searchText) {
    should.push(
      { match: { title: { query: searchText, boost: 5 } } },
      { match: { description: { query: searchText, boost: 3 } } },
      { match: { tags: { query: searchText, boost: 2 } } } // Use match instead of terms for case-insensitive search
    );
  }

  const esQuery = {
    index: 'missions',
    from: 0,
    size: 10,
    query: {
      bool: {
        should: should,
        minimum_should_match: 1 // At least one condition should match
      }
    },
    sort: [{ _score: 'desc' }]
  };

  try {
    console.log('Elasticsearch Query:', JSON.stringify(esQuery, null, 2));
    const result = await esClient.search(esQuery);
    
    console.log('Elasticsearch Response:', JSON.stringify(result, null, 2)); // Add this for debugging
    
    if (!result.hits.hits.length) {
      console.warn('No missions found for search:', searchText);
      return [];
    }
    return result.hits.hits.map(hit => hit._source);
  } catch (error) {
    console.error('Elasticsearch search error:', error);
    throw new Error('Failed to search missions');
  }
};
exports.indexMission = async (mission) => {
  try {
    await esClient.index({
      index: 'missions',
      id: mission._id.toString(),
      body: {
        title: mission.title,
        description: mission.description,
        tags: mission.tags,
        budget: mission.budget,
        deadline: mission.deadline,
        client: mission.client.toString(),
        status: mission.status,
        type: mission.type,
        experience: mission.experience
      }
    });
  } catch (error) {
    console.error('Elasticsearch index error:', error);
  }
};

exports.deleteMissionIndex = async (id) => {
  try {
    await esClient.delete({
      index: 'missions',
      id: id.toString()
    });
  } catch (error) {
    console.error('Elasticsearch delete index error:', error);
  }
};

exports.updateMissionIndex = async (mission) => {
  try {
    await esClient.update({
      index: 'missions',
      id: mission._id.toString(),
      body: {
        doc: {
          title: mission.title,
          description: mission.description,
          tags: mission.tags,
          budget: mission.budget,
          deadline: mission.deadline,
          client: mission.client.toString(),
          status: mission.status,
          type: mission.type,
          experience: mission.experience
        }
      }
    });
  } catch (error) {
    console.error('Elasticsearch update index error:', error);
  }
};
