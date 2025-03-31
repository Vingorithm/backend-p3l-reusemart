const express = require('express');
const router = express.Router();
const akunController = require('../controllers/akunController');

router.post('/', akunController.createAkun);
router.get('/', akunController.getAllAkun);
router.get('/:id', akunController.getAkunById);
router.put('/:id', akunController.updateAkun);
router.delete('/:id', akunController.deleteAkun);

module.exports = router;