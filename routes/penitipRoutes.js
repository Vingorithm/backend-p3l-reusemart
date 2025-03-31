const express = require('express');
const router = express.Router();
const penitipController = require('../controllers/penitipController');

router.post('/', penitipController.createPenitip);
router.get('/', penitipController.getAllPenitip);
router.get('/:id', penitipController.getPenitipById);
router.put('/:id', penitipController.updatePenitip);
router.delete('/:id', penitipController.deletePenitip);

module.exports = router;