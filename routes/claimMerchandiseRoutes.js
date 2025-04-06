const express = require('express');
const router = express.Router();
const claimMerchandiseController = require('../controllers/claimMerchandiseController');
const multer = require('multer');
const upload = multer();

router.post('/', upload.none(), claimMerchandiseController.createClaimMerchandise);
router.get('/', claimMerchandiseController.getAllClaimMerchandise);
router.get('/:id', claimMerchandiseController.getClaimMerchandiseById);
router.put('/:id', claimMerchandiseController.updateClaimMerchandise);
router.delete('/:id', claimMerchandiseController.deleteClaimMerchandise);

module.exports = router;