const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangController');
const multer = require('multer');
const upload = require('../middleware/upload');

router.post('/',upload.single('gambar'), barangController.createBarang);
router.get('/', barangController.getAllBarang);
router.get('/:id', barangController.getBarangById);
router.put('/:id', barangController.updateBarang);
router.delete('/:id', barangController.deleteBarang);

module.exports = router;