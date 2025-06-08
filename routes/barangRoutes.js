const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangController');
const multer = require('multer');
const upload = require('../middleware/upload');

router.post('/',upload.array('gambar', 2), barangController.createBarang);
router.get('/', barangController.getAllBarang);
router.get('/mobile/', barangController.getAllBarangMobile);
router.get('/mobile/:id', barangController.getBarangByIdMobile);
router.get('/garansi/', barangController.getAllBarangGaransi);
router.get('/:id', barangController.getBarangById);
router.put('/:id', upload.array('gambar', 2), barangController.updateBarang);
router.delete('/:id', barangController.deleteBarang);

module.exports = router;