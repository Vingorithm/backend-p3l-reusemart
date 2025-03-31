const express = require('express');
const router = express.Router();
const keranjangController = require('../controllers/keranjangController');

router.post('/', keranjangController.createKeranjang);
router.get('/', keranjangController.getAllKeranjang);
router.get('/:id', keranjangController.getKeranjangById);
router.put('/:id', keranjangController.updateKeranjang);
router.delete('/:id', keranjangController.deleteKeranjang);

module.exports = router;