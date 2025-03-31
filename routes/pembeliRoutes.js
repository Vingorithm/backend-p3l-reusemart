const express = require('express');
const router = express.Router();
const pembeliController = require('../controllers/pembeliController');

router.post('/', pembeliController.createPembeli);
router.get('/', pembeliController.getAllPembeli);
router.get('/:id', pembeliController.getPembeliById);
router.put('/:id', pembeliController.updatePembeli);
router.delete('/:id', pembeliController.deletePembeli);

module.exports = router;