const fs = require('fs');
const path = require('path');
const User = require('../models/user.model');

exports.handleProfileImageUpload = async (userId, file, req) => {
  // Vérifier que le fichier a bien été sauvegardé
  const savedFilePath = file.path;
  const fileExists = await this.checkFileExists(savedFilePath);

  // Trouver l'utilisateur
  const user = await User.findById(userId);
  if (!user) {
    // Supprimer le fichier uploadé si l'utilisateur n'existe pas
    if (fileExists) {
      await this.deleteFileIfExists(file.path);
    }
    throw new Error('Utilisateur non trouvé');
  }

  // Supprimer l'ancienne image si elle existe
  //if (user.profileImage) {
  //  const oldImagePath = this.getProfileImagePath(user.profileImage);
  //  console.log(`Suppression de l'ancienne image: ${oldImagePath}`);
  //  await this.deleteFileIfExists(oldImagePath);
  //}

  // Mettre à jour l'utilisateur avec le nouveau nom de fichier
  user.profileImage = file.filename;

  await user.save();

  return {
    profileImage: file.filename,
    imageUrl: `${req.protocol}://${req.get('host')}/uploads/profiles/${file.filename}`,
    timestamp: Date.now()
  };

};

exports.handleProfileImageDeletion = async (userId) => {
  // Validation de l'ID utilisateur
  if (!userId || userId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(userId)) {
    throw new Error('ID utilisateur invalide');
  }
  
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  // Supprimer le fichier image s'il existe
  if (user.profileImage) {
    const imagePath = this.getProfileImagePath(user.profileImage);
    await this.deleteFileIfExists(imagePath);
  }

  // Sauvegarder l'ancien nom d'image pour la réponse
  const previousImage = user.profileImage;

  // Mettre à jour l'utilisateur en base
  user.profileImage = null;
  await user.save();

  return {
    userId: userId,
    userName: user.name,
    previousImage: previousImage || 'Aucune image'
  };
};

// Helper functions
exports.getProfileImagePath = (filename) => {
  const projectRoot = path.resolve(__dirname, '..', '..');
  return path.join(projectRoot,'src', 'uploads', 'profiles', filename);
};

exports.checkFileExists = (filePath) => {
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      resolve(!err);
    });
  });
};

exports.deleteFileIfExists = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        resolve(false); // Le fichier n'existe pas
      } else {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) reject(unlinkErr);
          else resolve(true);
        });
      }
    });
  });
};
exports.serveProfileImage = (filename, res) => {
  return new Promise((resolve, reject) => {
    const imagePath = this.getProfileImagePath(filename);
    console.log(`Chemin de l'image: ${imagePath}`);
    fs.access(imagePath, fs.constants.F_OK, (err) => {
      if (err) {
        return reject(new Error('Image non trouvée'));
      }

      // Définir le type de contenu approprié
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'image/jpeg'; // par défaut
      
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.jpg') contentType = 'image/jpg';

      res.setHeader('Content-Type', contentType);

      // Créer un stream de lecture et le pipe vers la réponse
      const stream = fs.createReadStream(imagePath);
      stream.on('open', () => {
        stream.pipe(res);
        resolve();
      });
      stream.on('error', (err) => {
        reject(err);
      });
    });
  });
};