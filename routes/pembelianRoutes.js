const express = require('express');
const router = express.Router();
const pembelianController = require('../controllers/pembelianController');

router.post('/', pembelianController.createPembelian);
router.get('/', pembelianController.getAllPembelian);
router.get('/:id', pembelianController.getPembelianById);
router.put('/:id', pembelianController.updatePembelian);
router.delete('/:id', pembelianController.deletePembelian);

module.exports = router;