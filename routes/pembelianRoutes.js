const express = require('express');
const router = express.Router();
const pembelianController = require('../controllers/pembelianController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads ada
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir('uploads/bukti_bayar');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'bukti_transfer') {
      cb(null, 'uploads/bukti_bayar/');
    } 
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const rawId = req.params.id || 'temp';
    const numericId = rawId.match(/\d+/)?.[0] || '0';
    cb(null, `tf${numericId}${ext}`);
  },
});

const upload = multer({ 
    storage,
    fileFilter: function (req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Hanya file gambar yang diperbolehkan'), false);
        }
        cb(null, true);
    }
});

router.post('/', upload.none(), pembelianController.createPembelian);
router.get('/', pembelianController.getAllPembelian);
router.get('/:id', pembelianController.getPembelianById);
router.put('/:id', upload.single('bukti_transfer'), pembelianController.updatePembelian);
router.delete('/:id', pembelianController.deletePembelian);
router.get('/byIdPembeli/:id', pembelianController.getPembelianByPembeliId);
router.get('/byIdPenitip/:id', pembelianController.getPembelianByIdPenitip);

module.exports = router;