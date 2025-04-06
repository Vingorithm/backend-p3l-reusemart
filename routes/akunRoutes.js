const express = require('express');
const router = express.Router();
const akunController = require('../controllers/akunController');
const upload = require('../middleware/upload');

const uploadAkun = upload('akun', 'id_akun');

router.post('/register', uploadAkun.single('profile_picture'), akunController.register);
router.post('/login', akunController.login);
router.post('/reset-password', akunController.resetPassword);
router.post('/', akunController.createAkun);
router.get('/', akunController.getAllAkun);
router.get('/:id', akunController.getAkunById);
router.put('/:id', akunController.updateAkun);
router.delete('/:id', akunController.deleteAkun);

module.exports = router;