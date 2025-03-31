const express = require('express');
const router = express.Router();
const diskusiProdukController = require('../controllers/diskusiProdukController');

router.post('/', diskusiProdukController.createDiskusiProduk);
router.get('/', diskusiProdukController.getAllDiskusiProduk);
router.get('/:id', diskusiProdukController.getDiskusiProdukById);
router.put('/:id', diskusiProdukController.updateDiskusiProduk);
router.delete('/:id', diskusiProdukController.deleteDiskusiProduk);

module.exports = router;