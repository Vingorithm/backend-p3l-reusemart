const express = require('express');
const router = express.Router();
const bonusTopSellerController = require('../controllers/bonusTopSellerController');
const multer = require('multer');
const upload = multer();

router.post('/', upload.none(), bonusTopSellerController.createBonusTopSeller);
router.get('/', bonusTopSellerController.getAllBonusTopSeller);
router.get('/:id', bonusTopSellerController.getBonusTopSellerById);
router.put('/:id', bonusTopSellerController.updateBonusTopSeller);
router.delete('/:id', bonusTopSellerController.deleteBonusTopSeller);

module.exports = router;