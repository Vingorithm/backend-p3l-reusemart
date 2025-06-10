const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');


router.post('/', transaksiController.createTransaksi);
router.get('/', transaksiController.getAllTransaksi);
router.get('/:id', transaksiController.getTransaksiById);
router.put('/:id', transaksiController.updateTransaksi);
router.delete('/:id', transaksiController.deleteTransaksi);
router.get('/hunter/:id_hunter', transaksiController.getTransaksiByHunterId);
router.get('/hunter/:id_hunter/summary', transaksiController.getHunterKomisiSummary);

module.exports = router;