const express = require('express');
const router = express.Router();
const bonusTopSellerController = require('../controllers/bonusTopSellerController');

router.post('/', bonusTopSellerController.createBonusTopSeller);
router.get('/', bonusTopSellerController.getAllBonusTopSeller);
router.get('/:id', bonusTopSellerController.getBonusTopSellerById);
router.put('/:id', bonusTopSellerController.updateBonusTopSeller);
router.delete('/:id', bonusTopSellerController.deleteBonusTopSeller);

module.exports = router;