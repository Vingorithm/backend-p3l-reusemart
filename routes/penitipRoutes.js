const express = require('express');
const router = express.Router();
const penitipController = require('../controllers/penitipController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads ada
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir('uploads/profile_picture');
ensureDir('uploads/ktp');

// Konfigurasi penyimpanan untuk Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profile_picture') {
      cb(null, 'uploads/profile_picture/');
    } else if (file.fieldname === 'foto_ktp') {
      cb(null, 'uploads/ktp/');
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

router.post(
  '/',
  upload.fields([
    { name: 'profile_picture', maxCount: 1 },
    { name: 'foto_ktp', maxCount: 1 },
  ]),
  penitipController.createPenitip
);
router.get('/', penitipController.getAllPenitip);
router.get('/custom', penitipController.getPenitipByCustomConstrains);
router.get('/:id', penitipController.getPenitipById);
router.get('/byIdAkun/:id', penitipController.getPenitipByAkunId);
router.put(
  '/:id',
  upload.fields([
    { name: 'profile_picture', maxCount: 1 },
    { name: 'foto_ktp', maxCount: 1 },
  ]),
  penitipController.updatePenitip
);
router.delete('/:id', penitipController.deletePenitip);

module.exports = router;