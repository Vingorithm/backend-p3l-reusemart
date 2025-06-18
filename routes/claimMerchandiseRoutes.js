const express = require('express');
const router = express.Router();
const claimMerchandiseController = require('../controllers/claimMerchandiseController');
const multer = require('multer');
const upload = multer();

router.post('/', upload.none(), claimMerchandiseController.createClaimMerchandise);
router.get('/', claimMerchandiseController.getAllClaimMerchandise);
router.get('/custom', claimMerchandiseController.getAllClaimMerchandiseCustom);
router.get('/:id', claimMerchandiseController.getClaimMerchandiseById);
router.get('/byIdPembeli/:id', claimMerchandiseController.getClaimMerchandiseByIdPembeli);
router.put('/:id', claimMerchandiseController.updateClaimMerchandise);
router.delete('/:id', claimMerchandiseController.deleteClaimMerchandise);

module.exports = router;