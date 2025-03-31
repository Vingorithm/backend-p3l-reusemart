const express = require('express');
const router = express.Router();
const reviewProdukController = require('../controllers/reviewProdukController');

router.post('/', reviewProdukController.createReviewProduk);
router.get('/', reviewProdukController.getAllReviewProduk);
router.get('/:id', reviewProdukController.getReviewProdukById);
router.put('/:id', reviewProdukController.updateReviewProduk);
router.delete('/:id', reviewProdukController.deleteReviewProduk);

module.exports = router;