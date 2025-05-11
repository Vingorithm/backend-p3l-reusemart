const express = require('express');
const router = express.Router();
const pembelianController = require('../controllers/pembelianController');
const multer = require('multer');
const upload = multer();

router.post('/', upload.none(), pembelianController.createPembelian);
router.get('/', pembelianController.getAllPembelian);
router.get('/:id', pembelianController.getPembelianById);
router.put('/:id', pembelianController.updatePembelian);
router.delete('/:id', pembelianController.deletePembelian);
router.get('/pembeli/:id_pembeli', pembelianController.getPembelianByPembeliId);

module.exports = router;