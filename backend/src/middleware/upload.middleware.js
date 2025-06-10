const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Chemin absolu vers le dossier uploads
const uploadsDir = path.resolve(__dirname, '..', 'uploads');
const profilesDir = path.join(uploadsDir, 'profiles');

// Fonction pour créer les dossiers de manière synchrone
function ensureDirectoryExists(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Dossier créé: ${dirPath}`);
    }
  } catch (err) {
    console.error(`Erreur lors de la création du dossier ${dirPath}:`, err);
    throw err; // Propager l'erreur pour la gestion ultérieure
  }
}

// Création des dossiers au démarrage
ensureDirectoryExists(uploadsDir);
ensureDirectoryExists(profilesDir);

// Configuration de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Vérification supplémentaire à chaque upload
    ensureDirectoryExists(profilesDir);
    cb(null, profilesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `profile-${req.params.userId || uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seules les images sont acceptées.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

module.exports = upload;