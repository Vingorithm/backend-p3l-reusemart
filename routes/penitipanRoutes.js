const express = require('express');
const router = express.Router();
const penitipanController = require('../controllers/penitipanController');
const multer = require('multer');
const upload = multer();
const PenitipanNotificationService = require('../services/penitipanNotificationService');

// Manual trigger untuk pengecekan penitipan
router.post('/check-penitipan-notifications', async (req, res) => {
  try {
    const results = await PenitipanNotificationService.runAllChecks();
    res.json({
      message: 'Penitipan notifications check completed',
      results
    });
  } catch (error) {
    console.error('Error checking penitipan notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check hanya penitipan yang akan habis (H-3)
router.post('/check-soon-expired', async (req, res) => {
  try {
    const result = await PenitipanNotificationService.checkSoonExpiredPenitipan();
    res.json({
      message: 'Soon expired penitipan check completed',
      result
    });
  } catch (error) {
    console.error('Error checking soon expired penitipan:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check penitipan yang sudah habis
router.post('/check-expired', async (req, res) => {
  try {
    const result = await PenitipanNotificationService.checkExpiredPenitipan();
    res.json({
      message: 'Expired penitipan check completed',
      result
    });
  } catch (error) {
    console.error('Error checking expired penitipan:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check penitipan yang melewati batas pengambilan
router.post('/check-overdue-pickup', async (req, res) => {
  try {
    const result = await PenitipanNotificationService.checkOverduePickup();
    res.json({
      message: 'Overdue pickup check completed',
      result
    });
  } catch (error) {
    console.error('Error checking overdue pickup:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', upload.none(), penitipanController.createPenitipan);
router.get('/', penitipanController.getAllPenitipan);
router.get('/:id', penitipanController.getPenitipanById);
router.get('/byIdBarang/:id_barang', penitipanController.getPenitipanByIdBarang);
router.put('/:id', penitipanController.updatePenitipan);
router.delete('/:id', penitipanController.deletePenitipan);
router.get('/byIdPenitip/:id', penitipanController.getPenitipanByIdPenitip);
router.get('/item-for-scheduling/:id', penitipanController.getItemForScheduling);
router.put('/schedule-pickup/:id', penitipanController.schedulePickup);
router.patch('/confirm-receipt/:id_pengiriman', penitipanController.confirmReceipt);
router.post('/check-overdue', penitipanController.manualCheckOverduePenitipan);
router.get('/byStatus/:status', penitipanController.getPenitipanByStatus);

module.exports = router;