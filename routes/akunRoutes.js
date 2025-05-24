const express = require('express');
const router = express.Router();
const akunController = require('../controllers/akunController');
// const upload = require('../middleware/upload');
const multer = require('multer');
const path = require('path');
const Akun = require('../models/akun');
const { sendPushNotification } = require('../utils/notification');

// Konfigurasi multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profile_picture');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });


// Tambahkan route untuk testing
router.post('/test-notification', async (req, res) => {
  try {
    const { id_akun } = req.body;
    console.log(req.body);
    
    const akun = await Akun.findByPk(id_akun);
    if (!akun || !akun.fcm_token) {
      return res.status(404).json({ message: 'User atau FCM token tidak ditemukan' });
    }

    await sendPushNotification(
      akun.fcm_token,
      "🧪 Test Notification",
      "Push notification berhasil! Sistem notifikasi berfungsi dengan baik.",
      { type: 'test', timestamp: new Date().toISOString() }
    );

    res.json({ message: 'Test notification sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FCM Token routes
router.post('/fcm-token', akunController.updateFcmToken);
router.get('/fcm-token/:id_akun', akunController.getFcmToken);
router.delete('/fcm-token', akunController.removeFcmToken);

router.post('/register', akunController.register);
router.post('/login', akunController.login);
router.post('/send-verification-email', akunController.sendResetPasswordLink);
router.post('/', akunController.createAkun);
router.get('/', akunController.getAllAkun);
router.get('/:id', akunController.getAkunById);
router.get('/byEmail/:email', akunController.getAkunByEmail);
router.put('/change-password/:id', akunController.changePassword);
router.put('/:id', upload.single('profile_picture'), akunController.updateAkun);
router.delete('/:id', akunController.deleteAkun);

module.exports = router;