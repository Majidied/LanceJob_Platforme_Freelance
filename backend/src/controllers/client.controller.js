const clientService = require('../services/client.service');

exports.getAllClients = async (req, res, next) => {
  try {
    const clients = await clientService.getAllClients();
    res.status(200).json({ data: clients });
  } catch (error) {
    next(error);
  }
};

exports.getClientById = async (req, res, next) => {
  try {
    const client = await clientService.getClientById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json({ data: client });
  } catch (error) {
    next(error);
  }
};

exports.createClient= async (req, res, next) => {
  try {
    const client = await clientService.createClient(req.body);
    res.status(201).json({ data: client });
  } catch (error) {
    next(error);
  }
};

exports.updateClient = async (req, res, next) => {
  try {
    const client = await clientService.updateClient(req.params.id, req.body);
    if (!client) {
      return res.status(404).json({ message: 'client not found' });
    }
    res.status(200).json({ data: client });
  } catch (error) {
    next(error);
  }
};

exports.deleteClient = async (req, res, next) => {
  try {
    const client = await clientService.deleteClient(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'client not found' });
    }
    res.status(200).json({ message: 'client deleted successfully' });
  } catch (error) {
    next(error);
  }
};
