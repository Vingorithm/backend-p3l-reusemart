const express = require('express');
const router = express.Router();
const claimMerchandiseController = require('../controllers/claimMerchandiseController');

router.post('/', claimMerchandiseController.createClaimMerchandise);
router.get('/', claimMerchandiseController.getAllClaimMerchandise);
router.get('/:id', claimMerchandiseController.getClaimMerchandiseById);
router.put('/:id', claimMerchandiseController.updateClaimMerchandise);
router.delete('/:id', claimMerchandiseController.deleteClaimMerchandise);

module.exports = router;