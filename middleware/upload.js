const multer = require('multer');
const path = require('path');

function createUploader(modelName, idField) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const id = req.body[idField] || req.params[idField] || 'unknown';
      const safeModel = modelName.toLowerCase().replace(/\s+/g, '_');
      const safeId = id.toLowerCase().replace(/\s+/g, '_');
      const filename = `${safeModel}_${safeId}${path.extname(file.originalname)}`;
      cb(null, filename);
    },
  });

  return multer({ storage });
}

module.exports = createUploader;
