const express = require('express');
const router = express.Router();
const merchandiseController = require('../controllers/merchandiseController');
const multer = require('multer');
const upload = require('../middleware/upload');

router.post('/', upload.single('gambar'), merchandiseController.createMerchandise);
router.get('/', merchandiseController.getAllMerchandise);
router.get('/mobile', merchandiseController.getAllMobileMerchandise);
router.get('/mobile/:id', merchandiseController.getMobileMerchandiseById);
router.get('/:id', merchandiseController.getMerchandiseById);
router.put('/:id', merchandiseController.updateMerchandise);
router.delete('/:id', merchandiseController.deleteMerchandise);
router.put('/:id/stok', merchandiseController.updateStokMerchandise);



module.exports = router;