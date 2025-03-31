const express = require('express');
const router = express.Router();
const requestDonasiController = require('../controllers/requestDonasiController');

router.post('/', requestDonasiController.createRequestDonasi);
router.get('/', requestDonasiController.getAllRequestDonasi);
router.get('/:id', requestDonasiController.getRequestDonasiById);
router.put('/:id', requestDonasiController.updateRequestDonasi);
router.delete('/:id', requestDonasiController.deleteRequestDonasi);

module.exports = router;