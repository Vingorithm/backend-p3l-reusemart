const express = require('express');
const router = express.Router();
const penitipController = require('../controllers/penitipController');
const multer = require('multer');
const upload = multer();

router.post('/', upload.none(), penitipController.createPenitip);
router.get('/', penitipController.getAllPenitip);
router.get('/:id', penitipController.getPenitipById);
router.put('/:id', penitipController.updatePenitip);
router.delete('/:id', penitipController.deletePenitip);

module.exports = router;