const express = require('express');
const router = express.Router();
const penitipanController = require('../controllers/penitipanController');

router.post('/', penitipanController.createPenitipan);
router.get('/', penitipanController.getAllPenitipan);
router.get('/:id', penitipanController.getPenitipanById);
router.put('/:id', penitipanController.updatePenitipan);
router.delete('/:id', penitipanController.deletePenitipan);

module.exports = router;