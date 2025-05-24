const cron = require('node-cron');
const PenitipanNotificationService = require('../services/penitipanNotificationService');

class PenitipanScheduler {
  static init() {
    // Jalankan setiap hari jam 9 pagi untuk cek semua kondisi
    cron.schedule('0 9 * * *', async () => {
      console.log('🕘 Running daily penitipan notification check at 9 AM...');
      try {
        await PenitipanNotificationService.runAllChecks();
      } catch (error) {
        console.error('❌ Error in daily penitipan check:', error);
      }
    }, {
      timezone: "Asia/Jakarta"
    });

    // Jalankan setiap hari jam 3 sore untuk cek H-3 (reminder tambahan)
    cron.schedule('0 15 * * *', async () => {
      console.log('🕒 Running afternoon H-3 penitipan reminder check at 3 PM...');
      try {
        await PenitipanNotificationService.checkSoonExpiredPenitipan();
      } catch (error) {
        console.error('❌ Error in afternoon H-3 check:', error);
      }
    }, {
      timezone: "Asia/Jakarta"
    });

    // Jalankan setiap hari jam 10 pagi untuk cek yang sudah melewati batas pengambilan
    cron.schedule('0 10 * * *', async () => {
      console.log('🕙 Running daily overdue pickup check at 10 AM...');
      try {
        await PenitipanNotificationService.checkOverduePickup();
      } catch (error) {
        console.error('❌ Error in overdue pickup check:', error);
      }
    }, {
      timezone: "Asia/Jakarta"
    });

    console.log('📅 Penitipan notification scheduler initialized');
    console.log('   - Daily check: 9:00 AM');
    console.log('   - H-3 reminder: 3:00 PM');
    console.log('   - Overdue check: 10:00 AM');
  }
}

module.exports = PenitipanScheduler;