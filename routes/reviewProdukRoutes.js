const express = require('express');
const router = express.Router();
const reviewProdukController = require('../controllers/reviewProdukController');
const multer = require('multer');
const upload = multer();

router.post('/', upload.none(), reviewProdukController.createReviewProduk);
router.get('/', reviewProdukController.getAllReviewProduk);
router.get('/:id', reviewProdukController.getReviewProdukById);
router.put('/:id', reviewProdukController.updateReviewProduk);
router.delete('/:id', reviewProdukController.deleteReviewProduk);
router.get('/byIdTransaksi/:id', reviewController.getReviewProdukByIdTransaksi);
router.get('/byIdBarang/:id', reviewProdukController.getReviewProdukByIdBarang);

module.exports = router;