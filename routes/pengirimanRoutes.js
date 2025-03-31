const express = require('express');
const router = express.Router();
const pengirimanController = require('../controllers/pengirimanController');

router.post('/', pengirimanController.createPengiriman);
router.get('/', pengirimanController.getAllPengiriman);
router.get('/:id', pengirimanController.getPengirimanById);
router.put('/:id', pengirimanController.updatePengiriman);
router.delete('/:id', pengirimanController.deletePengiriman);

module.exports = router;