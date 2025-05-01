const express = require('express');
const router = express.Router();
const diskusiProdukController = require('../controllers/diskusiProdukController');
const multer = require('multer');
const upload = multer();

router.post('/', upload.none(), diskusiProdukController.createDiskusiProduk);
router.get('/', diskusiProdukController.getAllDiskusiProduk);
router.get('/:id', diskusiProdukController.getDiskusiProdukById);
router.put('/:id', diskusiProdukController.updateDiskusiProduk);
router.delete('/:id', diskusiProdukController.deleteDiskusiProduk);
router.get('/byIdBarang/:id', diskusiController.getDiskusiProdukByIdBarang);

module.exports = router;