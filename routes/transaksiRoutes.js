const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');
const multer = require('multer');
const upload = multer();

router.post('/', upload.none(), transaksiController.createTransaksi);
router.get('/', transaksiController.getAllTransaksi);
router.get('/:id', transaksiController.getTransaksiById);
router.put('/:id', transaksiController.updateTransaksi);
router.delete('/:id', transaksiController.deleteTransaksi);

module.exports = router;