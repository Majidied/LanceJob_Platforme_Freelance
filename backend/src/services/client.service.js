const Client = require('../models/client.model');

exports.getAllClients = async () => {
  return await Client.find({});
};

exports.getClientById = async (id) => {
  return await Client.findById(id);
};

exports.createClient= async (clientData) => {
  const client = new Client(clientData);
  return await client.save();
};

exports.updateClient = async (id, clientData) => {
  return await Client.findByIdAndUpdate(id, clientData, { new: true });
};

exports.deleteClient = async (id) => {
  return await Client.findByIdAndDelete(id);
};
