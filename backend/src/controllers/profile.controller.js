const profileService = require('../services/profile.service');

exports.uploadProfileImage = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier image fourni'
      });
    }

    const result = await profileService.handleProfileImageUpload(userId, req.file, req);
    
    res.json({
      success: true,
      message: 'Image de profil uploadée avec succès',
      data: result
    });

  } catch (error) {
    // Supprimer le fichier en cas d'erreur
    if (req.file && req.file.path) {
      await profileService.deleteFileIfExists(req.file.path);
    }
    
    console.error(' Erreur lors de l\'upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'upload de l\'image'
    });
  }
};

exports.deleteProfileImage = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await profileService.handleProfileImageDeletion(userId);
    
    res.json({
      success: true,
      message: 'Image de profil supprimée avec succès',
      data: result
    });

  } catch (error) {
    console.error(' Erreur lors de la suppression:', error);
    
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide',
        error: 'Format ObjectId requis (24 caractères hexadécimaux)',
        received: req.params.userId
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'image',
      error: error.message
    });
  }
};

exports.getProfileImage = async (req, res) => {
  try {
    const { filename } = req.params;
    await profileService.serveProfileImage(filename, res);
  } catch (error) {
    console.error(' Erreur lors de la récupération de l\'image:', error);
    res.status(404).json({
      success: false,
      message: 'Image non trouvée'
    });
  }
};