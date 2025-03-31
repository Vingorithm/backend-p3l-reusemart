const express = require('express');
const router = express.Router();
const organisasiAmalController = require('../controllers/organisasiAmalController');

router.post('/', organisasiAmalController.createOrganisasiAmal);
router.get('/', organisasiAmalController.getAllOrganisasiAmal);
router.get('/:id', organisasiAmalController.getOrganisasiAmalById);
router.put('/:id', organisasiAmalController.updateOrganisasiAmal);
router.delete('/:id', organisasiAmalController.deleteOrganisasiAmal);

module.exports = router;